<?php



header("Content-Type: application/json");

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(200);
    exit;
}

require_once __DIR__ . "/db.php";

/* Convert UI values like "6:00 PM" to MySQL TIME "18:00:00". */
function normalizeDbTime($value) {
    $value = trim((string)($value ?? ""));
    if ($value === "") return null;

    if (preg_match('/^(\\d{1,2}):(\\d{2})(?::(\\d{2}))?$/', $value, $m)) {
        $hour = (int)$m[1];
        $minute = (int)$m[2];
        $second = isset($m[3]) ? (int)$m[3] : 0;
        if ($hour <= 23 && $minute <= 59 && $second <= 59) {
            return sprintf("%02d:%02d:%02d", $hour, $minute, $second);
        }
    }

    $timestamp = strtotime($value);
    if ($timestamp === false) {
        throw new Exception("Invalid time value: " . $value);
    }
    return date("H:i:s", $timestamp);
}


try {

    /* =========================================
       READ JSON
    ========================================= */

    $input = json_decode(
        file_get_contents("php://input"),
        true
    );

    $action = trim($input["action"] ?? "");

    $adminEmail = trim(
        $input["admin_email"] ?? ""
    );


    /* =========================================
       ADMIN CHECK
    ========================================= */

    if ($adminEmail === "") {

        echo json_encode([
            "success" => false,
            "message" => "Admin authentication required"
        ]);

        exit;
    }


    $adminStmt = $conn->prepare("
        SELECT id, name, email
        FROM admin
        WHERE email = ?
        LIMIT 1
    ");

    $adminStmt->bind_param(
        "s",
        $adminEmail
    );

    $adminStmt->execute();

    $adminResult =
        $adminStmt->get_result();


    if ($adminResult->num_rows === 0) {

        echo json_encode([
            "success" => false,
            "message" => "Unauthorized admin"
        ]);

        exit;
    }


    $adminStmt->close();

    /* =========================================
       STUDENT DEFAULT TASK PROFILE
       One saved profile per student/default-id.
       This is recurring across every date.
    ========================================= */

    $conn->query("
        CREATE TABLE IF NOT EXISTS student_default_tasks (
            id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
            user_id BIGINT NOT NULL,
            default_id VARCHAR(20) NOT NULL,
            task_title VARCHAR(255) NOT NULL,
            from_time TIME NOT NULL,
            to_time TIME NULL,
            icon VARCHAR(100) DEFAULT NULL,
            color VARCHAR(255) DEFAULT NULL,
            next_day TINYINT(1) DEFAULT 0,
            is_active TINYINT(1) DEFAULT 1,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            UNIQUE KEY uq_student_default (user_id, default_id),
            KEY idx_student_default_user (user_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    ");

    // The admin page can be opened before the student's task page has ever
    // created the default-task mapping table. Create it here as well because
    // saving a student default updates today's/future generated task rows
    // through this mapping. Without this table, MySQL can return HTTP 500.
    // Keep date-wise default deletion markers available for Admin re-enable.
    $conn->query("
        CREATE TABLE IF NOT EXISTS skilllab_deleted_default_tasks (
            user_id BIGINT NOT NULL,
            task_date DATE NOT NULL,
            default_id VARCHAR(20) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (user_id, task_date, default_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    ");

    $conn->query("
        CREATE TABLE IF NOT EXISTS skilllab_task_default_map (
            id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
            task_id BIGINT NOT NULL,
            user_id BIGINT NOT NULL,
            task_date DATE NOT NULL,
            default_id VARCHAR(20) NOT NULL,
            PRIMARY KEY (id),
            UNIQUE KEY uq_task_default_map_task (task_id),
            UNIQUE KEY uq_task_default_map_date_default (user_id, task_date, default_id),
            KEY idx_task_default_map_user_date (user_id, task_date)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    ");

    // Date-specific Admin defaults. The recurring profile remains in
    // student_default_tasks; this table stores only the selected date's
    // override so a change made for 29-Sep does not change 30-Sep.
    $conn->query("
        CREATE TABLE IF NOT EXISTS student_default_task_dates (
            id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
            user_id BIGINT NOT NULL,
            task_date DATE NOT NULL,
            default_id VARCHAR(20) NOT NULL,
            task_title VARCHAR(255) NOT NULL,
            from_time TIME NULL,
            to_time TIME NULL,
            icon VARCHAR(100) DEFAULT NULL,
            color VARCHAR(255) DEFAULT NULL,
            next_day TINYINT(1) DEFAULT 0,
            is_active TINYINT(1) DEFAULT 1,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            UNIQUE KEY uq_student_date_default (user_id, task_date, default_id),
            KEY idx_student_date (user_id, task_date)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    ");

    /* Date-specific ownership: admin-generated vs explicit student edit/delete. */
    $sourceColumn = $conn->query("SHOW COLUMNS FROM student_default_task_dates LIKE 'source'");
    if (!$sourceColumn || $sourceColumn->num_rows === 0) {
        $conn->query("ALTER TABLE student_default_task_dates
                      ADD COLUMN source VARCHAR(20) NOT NULL DEFAULT 'admin' AFTER is_active");
    }


    $systemDefaults = [
        ["id"=>"d1", "title"=>"Wake Up", "from"=>"5:00 AM", "to"=>"", "icon"=>"sun", "color"=>"linear-gradient(135deg, #f6d365, #fda085)", "next_day"=>0],
        ["id"=>"d2", "title"=>"Study MERN", "from"=>"5:00 AM", "to"=>"10:00 AM", "icon"=>"book", "color"=>"linear-gradient(135deg, #a18cd1, #fbc2eb)", "next_day"=>0],
        ["id"=>"d3", "title"=>"Practice English", "from"=>"1:00 PM", "to"=>"4:00 PM", "icon"=>"language", "color"=>"linear-gradient(135deg, #84fab0, #8fd3f4)", "next_day"=>0],
        ["id"=>"d4", "title"=>"Workout", "from"=>"6:00 PM", "to"=>"7:00 PM", "icon"=>"dumbbell", "color"=>"linear-gradient(135deg, #fccb90, #d57eeb)", "next_day"=>0],
        ["id"=>"d5", "title"=>"Sleep", "from"=>"10:00 PM", "to"=>"5:00 AM", "icon"=>"moon", "color"=>"linear-gradient(135deg, #141e30, #243b55)", "next_day"=>1]
    ];

    if ($action === "get_student_defaults" || $action === "save_student_defaults") {

        $studentId = (int)($input["student_id"] ?? 0);

        if ($studentId <= 0) {
            echo json_encode(["success"=>false,"message"=>"Student ID is required"]);
            exit;
        }

        $selectedDate = trim((string)($input["task_date"] ?? date("Y-m-d")));
        if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $selectedDate)) {
            $selectedDate = date("Y-m-d");
        }

        $studentCheck = $conn->prepare("SELECT id, name, email FROM users WHERE id=? LIMIT 1");
        $studentCheck->bind_param("i", $studentId);
        $studentCheck->execute();
        $studentResult = $studentCheck->get_result();
        $studentRow = $studentResult->fetch_assoc();
        $studentCheck->close();

        if (!$studentRow) {
            echo json_encode(["success"=>false,"message"=>"Student not found"]);
            exit;
        }

        if ($action === "save_student_defaults") {
            $defaults = is_array($input["defaults"] ?? null) ? $input["defaults"] : [];

            /* =====================================================
               DATE-SPECIFIC ADMIN SAVE
               The Admin UI sends task_date. Save this schedule only for
               that date and propagate it to that date's mapped task rows.
               The old recurring-profile save below is kept for backward
               compatibility when task_date is not supplied.
            ===================================================== */
            if (isset($input["task_date"]) && $selectedDate !== "") {
                $coreIds = array_column($systemDefaults, "id");

                // Validate and save every task received for this date.
                foreach ($defaults as $d) {
                    $defaultId = trim((string)($d["default_id"] ?? $d["id"] ?? ""));
                    $title = trim((string)($d["title"] ?? ""));
                    $from = trim((string)($d["from"] ?? $d["time"] ?? ""));
                    $to = trim((string)($d["to"] ?? ""));
                    if ($defaultId === "" || $title === "" || $from === "") continue;

                    if ($defaultId === "d1") $to = "";

                    try {
                        $fromDb = normalizeDbTime($from);
                        $toDb = normalizeDbTime($to);
                    } catch (Throwable $e) {
                        echo json_encode(["success"=>false,"message"=>"Invalid time for $title."]);
                        exit;
                    }

                    $fromMin = ((int)substr($fromDb, 0, 2) * 60) + (int)substr($fromDb, 3, 2);
                    $toMin = $toDb !== null ? ((int)substr($toDb, 0, 2) * 60) + (int)substr($toDb, 3, 2) : null;
                    if ($toMin !== null && $toMin === $fromMin) {
                        echo json_encode(["success"=>false,"message"=>"$title cannot have the same start and end time."]);
                        exit;
                    }
                    if ($toMin !== null && $toMin < $fromMin && $defaultId !== "d5") {
                        echo json_encode(["success"=>false,"message"=>"$title cannot end before its start time. Only Sleep can cross midnight."]);
                        exit;
                    }

                    $icon = trim((string)($d["icon"] ?? "clock"));
                    $color = trim((string)($d["color"] ?? "linear-gradient(135deg, #667eea, #764ba2)"));
                    $nextDay = (int)($d["next_day"] ?? $d["nextDay"] ?? 0);
                    if ($defaultId === "d5" && $to !== "") {
                        $fromTs = strtotime($from);
                        $toTs = strtotime($to);
                        if ($fromTs !== false && $toTs !== false) $nextDay = ($toTs <= $fromTs) ? 1 : 0;
                    }

                    $up = $conn->prepare("
                        INSERT INTO student_default_task_dates
                            (user_id, task_date, default_id, task_title, from_time, to_time, icon, color, next_day, is_active, source)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 'admin')
                        ON DUPLICATE KEY UPDATE
                            task_title=VALUES(task_title),
                            from_time=VALUES(from_time),
                            to_time=VALUES(to_time),
                            icon=VALUES(icon),
                            color=VALUES(color),
                            next_day=VALUES(next_day),
                            is_active=1,
                            source='admin'
                    ");
                    $up->bind_param("isssssssi", $studentId, $selectedDate, $defaultId, $title, $fromDb, $toDb, $icon, $color, $nextDay);
                    $up->execute();
                    $up->close();

                    /* Admin explicitly enabled/changed this default for this date.
                       Remove any older student delete marker for the same date. */
                    $clearDeleted = $conn->prepare("
                        DELETE FROM skilllab_deleted_default_tasks
                        WHERE user_id=? AND task_date=? AND default_id=?
                    ");
                    $clearDeleted->bind_param("iss", $studentId, $selectedDate, $defaultId);
                    $clearDeleted->execute();
                    $clearDeleted->close();

                    // Update the actual task row for this exact date if it exists.
                    $mapped = $conn->prepare("
                        SELECT task_id FROM skilllab_task_default_map
                        WHERE user_id=? AND task_date=? AND default_id=? LIMIT 1
                    ");
                    $mapped->bind_param("iss", $studentId, $selectedDate, $defaultId);
                    $mapped->execute();
                    $mappedRow = $mapped->get_result()->fetch_assoc();
                    $mapped->close();

                    if ($mappedRow) {
                        $taskId = (int)$mappedRow["task_id"];
                        $upd = $conn->prepare("UPDATE tasks SET task_name=?, from_time=?, to_time=? WHERE id=? AND user_id=? LIMIT 1");
                        $upd->bind_param("sssii", $title, $fromDb, $toDb, $taskId, $studentId);
                        $upd->execute();
                        $upd->close();
                    } else {
                        $ins = $conn->prepare("
                            INSERT INTO tasks (user_id, task_name, task_date, from_time, to_time, status, task_percentage)
                            VALUES (?, ?, ?, ?, ?, 0, 0)
                        ");
                        $ins->bind_param("issss", $studentId, $title, $selectedDate, $fromDb, $toDb);
                        if ($ins->execute()) {
                            $taskId = (int)$ins->insert_id;
                            $map = $conn->prepare("
                                INSERT INTO skilllab_task_default_map (task_id, user_id, task_date, default_id)
                                VALUES (?, ?, ?, ?)
                                ON DUPLICATE KEY UPDATE task_id=VALUES(task_id)
                            ");
                            $map->bind_param("iiss", $taskId, $studentId, $selectedDate, $defaultId);
                            $map->execute();
                            $map->close();
                        }
                        $ins->close();
                    }
                }

                /* =========================================================
                   SLEEP -> NEXT DAY WAKE UP
                   =========================================================
                   Sleep belongs to the selected date. If Sleep crosses
                   midnight, its end time becomes the NEXT DATE's Wake Up.

                   Example:
                     29-Sep Sleep = 10:03 PM -> 5:20 AM
                     30-Sep Wake Up = 5:20 AM

                   The Wake Up on 29-Sep is never changed here.
                   If the next date already has an explicit date-specific
                   Wake Up row, preserve it because the student's/date's
                   explicit state has priority.
                ========================================================= */
                $savedSleep = null;
                foreach ($defaults as $d) {
                    $id = (string)($d["default_id"] ?? $d["id"] ?? "");
                    if ($id === "d5") {
                        $savedSleep = $d;
                        break;
                    }
                }

                if ($savedSleep) {
                    $sleepFromRaw = trim((string)($savedSleep["from"] ?? ""));
                    $sleepToRaw = trim((string)($savedSleep["to"] ?? ""));

                    if ($sleepFromRaw !== "" && $sleepToRaw !== "") {
                        $sleepFromDb = normalizeDbTime($sleepFromRaw);
                        $sleepToDb = normalizeDbTime($sleepToRaw);

                        $sleepFromMin = ((int)substr($sleepFromDb, 0, 2) * 60) + (int)substr($sleepFromDb, 3, 2);
                        $sleepToMin = ((int)substr($sleepToDb, 0, 2) * 60) + (int)substr($sleepToDb, 3, 2);

                        if ($sleepToMin <= $sleepFromMin) {
                            $nextDate = date("Y-m-d", strtotime($selectedDate . " +1 day"));

                            // Do not overwrite an explicit next-day Wake Up
                            // date row or a delete marker.
                            $wakeDateStmt = $conn->prepare("
                                SELECT is_active, source
                                FROM student_default_task_dates
                                WHERE user_id=? AND task_date=? AND default_id='d1'
                                LIMIT 1
                            ");
                            $wakeDateStmt->bind_param("is", $studentId, $nextDate);
                            $wakeDateStmt->execute();
                            $wakeDateRow = $wakeDateStmt->get_result()->fetch_assoc();
                            $wakeDateStmt->close();

                            $wakeIsStudentEdited = $wakeDateRow
                                && (int)($wakeDateRow['is_active'] ?? 0) === 1
                                && (($wakeDateRow['source'] ?? 'admin') === 'student');

                            $wakeDeletedStmt = $conn->prepare("
                                SELECT 1
                                FROM skilllab_deleted_default_tasks
                                WHERE user_id=? AND task_date=? AND default_id='d1'
                                LIMIT 1
                            ");
                            $wakeDeletedStmt->bind_param("is", $studentId, $nextDate);
                            $wakeDeletedStmt->execute();
                            $wakeDeleted = $wakeDeletedStmt->get_result()->num_rows > 0;
                            $wakeDeletedStmt->close();

                            if (!$wakeDeleted && !$wakeIsStudentEdited) {
                                $wakeTitle = "Wake Up";
                                $wakeIcon = "sun";
                                $wakeColor = "linear-gradient(135deg, #f6d365, #fda085)";

                                $wakeUpsert = $conn->prepare("
                                    INSERT INTO student_default_task_dates
                                        (user_id, task_date, default_id, task_title, from_time, to_time, icon, color, next_day, is_active, source)
                                    VALUES (?, ?, 'd1', ?, ?, NULL, ?, ?, 0, 1, 'admin')
                                    ON DUPLICATE KEY UPDATE
                                        task_title=VALUES(task_title),
                                        from_time=VALUES(from_time),
                                        to_time=NULL,
                                        icon=VALUES(icon),
                                        color=VALUES(color),
                                        next_day=0,
                                        is_active=1,
                                        source='admin'
                                ");
                                $wakeUpsert->bind_param(
                                    "isssss",
                                    $studentId,
                                    $nextDate,
                                    $wakeTitle,
                                    $sleepToDb,
                                    $wakeIcon,
                                    $wakeColor
                                );
                                $wakeUpsert->execute();
                                $wakeUpsert->close();

                                // Also update/create the real task row for the
                                // next date so Student and Admin show the same time.
                                $wakeMap = $conn->prepare("
                                    SELECT task_id
                                    FROM skilllab_task_default_map
                                    WHERE user_id=? AND task_date=? AND default_id='d1'
                                    LIMIT 1
                                ");
                                $wakeMap->bind_param("is", $studentId, $nextDate);
                                $wakeMap->execute();
                                $wakeMapRow = $wakeMap->get_result()->fetch_assoc();
                                $wakeMap->close();

                                if ($wakeMapRow) {
                                    $wakeTaskId = (int)$wakeMapRow["task_id"];
                                    $wakeTaskUpdate = $conn->prepare("
                                        UPDATE tasks
                                        SET task_name=?, from_time=?, to_time=NULL
                                        WHERE id=? AND user_id=? AND status=0
                                        LIMIT 1
                                    ");
                                    $wakeTaskUpdate->bind_param(
                                        "ssii",
                                        $wakeTitle,
                                        $sleepToDb,
                                        $wakeTaskId,
                                        $studentId
                                    );
                                    $wakeTaskUpdate->execute();
                                    $wakeTaskUpdate->close();
                                } else {
                                    $wakeTaskInsert = $conn->prepare("
                                        INSERT INTO tasks
                                            (user_id, task_name, task_date, from_time, to_time, status, task_percentage)
                                        VALUES (?, ?, ?, ?, NULL, 0, 0)
                                    ");
                                    $wakeTaskInsert->bind_param(
                                        "isss",
                                        $studentId,
                                        $wakeTitle,
                                        $nextDate,
                                        $sleepToDb
                                    );

                                    if ($wakeTaskInsert->execute()) {
                                        $wakeTaskId = (int)$wakeTaskInsert->insert_id;

                                        $wakeMapInsert = $conn->prepare("
                                            INSERT INTO skilllab_task_default_map
                                                (task_id, user_id, task_date, default_id)
                                            VALUES (?, ?, ?, 'd1')
                                            ON DUPLICATE KEY UPDATE task_id=VALUES(task_id)
                                        ");
                                        $wakeMapInsert->bind_param(
                                            "iis",
                                            $wakeTaskId,
                                            $studentId,
                                            $nextDate
                                        );
                                        $wakeMapInsert->execute();
                                        $wakeMapInsert->close();
                                    }
                                    $wakeTaskInsert->close();
                                }
                            }
                        }
                    }
                }

                // Mark omitted recurring/core defaults inactive for this date only.
                foreach ($systemDefaults as $base) {
                    if (in_array($base["id"], ["d1", "d5"], true)) continue;
                    $present = false;
                    foreach ($defaults as $d) {
                        if ((string)($d["default_id"] ?? $d["id"] ?? "") === $base["id"]) { $present = true; break; }
                    }
                    if (!$present) {
                        $off = $conn->prepare("
                            INSERT INTO student_default_task_dates
                                (user_id, task_date, default_id, task_title, from_time, to_time, icon, color, next_day, is_active)
                            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
                            ON DUPLICATE KEY UPDATE is_active=0
                        ");
                        $baseFrom = normalizeDbTime($base["from"]);
                        $baseTo = normalizeDbTime($base["to"]);
                        $off->bind_param("isssssssi", $studentId, $selectedDate, $base["id"], $base["title"], $baseFrom, $baseTo, $base["icon"], $base["color"], $base["next_day"]);
                        $off->execute();
                        $off->close();

                        $del = $conn->prepare("
                            DELETE t FROM tasks t
                            INNER JOIN skilllab_task_default_map m ON m.task_id=t.id
                            WHERE m.user_id=? AND m.task_date=? AND m.default_id=? AND t.status=0
                        ");
                        $del->bind_param("iss", $studentId, $selectedDate, $base["id"]);
                        $del->execute();
                        $del->close();
                    }
                }

                echo json_encode([
                    "success"=>true,
                    "message"=>"Date-specific defaults saved",
                    "task_date"=>$selectedDate
                ]);
                exit;
            }

            /* =====================================================
               AUTHORITATIVE ADMIN TIME CONFLICT CHECK

               Admin recurring defaults and Student-created tasks use
               the same student's tasks table. Therefore Admin must not
               be allowed to save a recurring time that overlaps another
               active recurring default or an existing uncompleted
               manual task.

               This validation runs BEFORE any INSERT/UPDATE so a failed
               save never leaves the profile half-updated.
            ===================================================== */
            $resolvedDefaults = [];
            $incomingDefaultIds = [];

            foreach ($systemDefaults as $base) {
                $candidate = null;

                foreach ($defaults as $item) {
                    if ((string)($item["default_id"] ?? $item["id"] ?? "") === $base["id"]) {
                        $candidate = $item;
                        break;
                    }
                }

                // Wake Up and Sleep are permanent. Other core defaults
                // are active only when they are present in the modal.
                if (!$candidate && !in_array($base["id"], ["d1", "d5"], true)) {
                    continue;
                }

                $candidate = $candidate ?: $base;
                $defaultId = (string)($candidate["default_id"] ?? $candidate["id"] ?? $base["id"]);
                $candidateTitle = trim((string)($candidate["title"] ?? $base["title"]));
                $candidateFrom = trim((string)($candidate["from"] ?? $candidate["time"] ?? $base["from"]));
                $candidateTo = trim((string)($candidate["to"] ?? $base["to"]));

                // Wake Up is a point-time task: it MUST never have a To Time.
                // Only Sleep is allowed to cross midnight.
                if ($defaultId === "d1") {
                    $candidateTo = "";
                }

                try {
                    $fromDb = normalizeDbTime($candidateFrom);
                    $toDb = normalizeDbTime($candidateTo);
                } catch (Throwable $e) {
                    echo json_encode([
                        "success" => false,
                        "message" => "Invalid time for " . ($candidate["title"] ?? $base["title"]) . "."
                    ]);
                    exit;
                }

                if ($fromDb === null) {
                    echo json_encode([
                        "success" => false,
                        "message" => "Start time is required for " . ($candidate["title"] ?? $base["title"]) . "."
                    ]);
                    exit;
                }

                $fromMin = ((int)substr($fromDb, 0, 2) * 60) + (int)substr($fromDb, 3, 2);
                $toMin = $toDb !== null
                    ? ((int)substr($toDb, 0, 2) * 60) + (int)substr($toDb, 3, 2)
                    : null;

                if ($toMin !== null && $toMin === $fromMin) {
                    echo json_encode([
                        "success" => false,
                        "message" => $candidateTitle . " cannot have the same start and end time."
                    ]);
                    exit;
                }

                // For normal recurring tasks, end time must be after start time.
                // Only Sleep (d5) may cross midnight.
                if ($toMin !== null && $toMin < $fromMin && $defaultId !== "d5") {
                    echo json_encode([
                        "success" => false,
                        "message" => $candidateTitle .
                            " cannot end before its start time.\n\n" .
                            "Please choose a To Time after the From Time.\n\n" .
                            "Only Sleep can cross midnight."
                    ]);
                    exit;
                }

                $incomingDefaultIds[$defaultId] = true;

                $resolvedDefaults[] = [
                    "id" => $defaultId,
                    "title" => trim((string)($candidate["title"] ?? $base["title"])),
                    "from" => $fromMin,
                    "to" => $toMin,
                ];
            }

            // Add valid custom recurring defaults to the same validation set.
            foreach ($defaults as $item) {
                $customId = trim((string)($item["default_id"] ?? $item["id"] ?? ""));
                if ($customId === "" || in_array($customId, array_column($systemDefaults, "id"), true)) {
                    continue;
                }
                if (!preg_match('/^c_[A-Za-z0-9_]+$/', $customId)) {
                    continue;
                }

                $customTitle = trim((string)($item["title"] ?? ""));
                $customFrom = trim((string)($item["from"] ?? $item["time"] ?? ""));
                $customTo = trim((string)($item["to"] ?? ""));
                if ($customTitle === "" || $customFrom === "") {
                    continue;
                }

                try {
                    $fromDb = normalizeDbTime($customFrom);
                    $toDb = normalizeDbTime($customTo);
                } catch (Throwable $e) {
                    echo json_encode(["success" => false, "message" => "Invalid time for $customTitle."]);
                    exit;
                }

                $fromMin = ((int)substr($fromDb, 0, 2) * 60) + (int)substr($fromDb, 3, 2);
                $toMin = $toDb !== null
                    ? ((int)substr($toDb, 0, 2) * 60) + (int)substr($toDb, 3, 2)
                    : null;

                if ($toMin !== null && $toMin === $fromMin) {
                    echo json_encode(["success" => false, "message" => "$customTitle cannot have the same start and end time."]);
                    exit;
                }

                if ($toMin !== null && $toMin < $fromMin) {
                    echo json_encode([
                        "success" => false,
                        "message" => "$customTitle cannot end before its start time.\\n\\n" .
                            "Please choose a To Time after the From Time.\\n\\n" .
                            "Only Sleep can cross midnight."
                    ]);
                    exit;
                }

                $incomingDefaultIds[$customId] = true;
                $resolvedDefaults[] = [
                    "id" => $customId,
                    "title" => $customTitle,
                    "from" => $fromMin,
                    "to" => $toMin,
                ];
            }

            // Convert a recurring time into circular day ranges. Overnight
            // tasks are split into [from,1440) and [0,to).
            $makeRanges = function ($from, $to) {
                if ($to === null) return [["start" => $from, "end" => $from]];
                if ($to > $from) return [["start" => $from, "end" => $to]];
                return [
                    ["start" => $from, "end" => 1440],
                    ["start" => 0, "end" => $to]
                ];
            };

            $overlap = function ($a, $b) {
                if ($a["start"] === $a["end"]) {
                    return $b["start"] <= $a["start"] && $a["start"] < $b["end"];
                }
                if ($b["start"] === $b["end"]) {
                    return $a["start"] <= $b["start"] && $b["start"] < $a["end"];
                }
                return $a["start"] < $b["end"] && $b["start"] < $a["end"];
            };

            // 1) Check defaults against each other before saving.
            for ($i = 0; $i < count($resolvedDefaults); $i++) {
                for ($j = $i + 1; $j < count($resolvedDefaults); $j++) {
                    $a = $resolvedDefaults[$i];
                    $b = $resolvedDefaults[$j];

                    // Wake Up is intentionally the end of Sleep's overnight
                    // period. They are linked, so this is NOT a conflict.
                    $isWakeSleepPair =
                        ($a["id"] === "d1" && $b["id"] === "d5") ||
                        ($a["id"] === "d5" && $b["id"] === "d1");

                    if ($isWakeSleepPair) {
                        continue;
                    }

                    foreach ($makeRanges($a["from"], $a["to"]) as $ar) {
                        foreach ($makeRanges($b["from"], $b["to"]) as $br) {
                            if ($overlap($ar, $br)) {
                                $formatMinutes = function ($minutes) {
                                    $minutes = (int)$minutes;
                                    $h = intdiv($minutes, 60);
                                    $m = $minutes % 60;
                                    return sprintf("%02d:%02d", $h, $m);
                                };

                                $aTime = $a["to"] === null
                                    ? $formatMinutes($a["from"])
                                    : $formatMinutes($a["from"]) . " - " . $formatMinutes($a["to"]);
                                $bTime = $b["to"] === null
                                    ? $formatMinutes($b["from"])
                                    : $formatMinutes($b["from"]) . " - " . $formatMinutes($b["to"]);

                                echo json_encode([
                                    "success" => false,
                                    "message" => "This time cannot be scheduled.\n\n" .
                                        $a["title"] . " ($aTime) overlaps with " . $b["title"] . " ($bTime).\n\n" .
                                        "Please choose another time."
                                ]);
                                exit;
                            }
                        }
                    }
                }
            }

            // 2) The incoming defaults array is the complete current profile.
            // Any old recurring default that is NOT present here is being deleted.
            // Do not compare deleted rows against the new schedule.
            // The delete/inactivate logic below handles those rows.

            // 3) Check one-off/manual future tasks. Mapped recurring rows are
            // excluded because this save will update/remove those rows itself.
            $manualTasks = $conn->prepare("
                SELECT t.task_name, t.from_time, t.to_time
                FROM tasks t
                LEFT JOIN skilllab_task_default_map m
                  ON m.task_id=t.id AND m.user_id=t.user_id AND m.task_date=t.task_date
                WHERE t.user_id=?
                  AND t.task_date >= CURDATE()
                  AND t.status=0
                  AND m.id IS NULL
                ORDER BY t.task_date ASC, t.from_time ASC
            ");
            $manualTasks->bind_param("i", $studentId);
            $manualTasks->execute();
            $manualResult = $manualTasks->get_result();

            while ($manual = $manualResult->fetch_assoc()) {
                $manualFromDb = normalizeDbTime($manual["from_time"] ?? "");
                $manualToDb = normalizeDbTime($manual["to_time"] ?? "", true);
                if ($manualFromDb === null) continue;

                $manualFrom = ((int)substr($manualFromDb, 0, 2) * 60) + (int)substr($manualFromDb, 3, 2);
                $manualTo = $manualToDb !== null
                    ? ((int)substr($manualToDb, 0, 2) * 60) + (int)substr($manualToDb, 3, 2)
                    : null;

                foreach ($resolvedDefaults as $candidate) {
                    foreach ($makeRanges($candidate["from"], $candidate["to"]) as $cr) {
                        foreach ($makeRanges($manualFrom, $manualTo) as $mr) {
                            if ($overlap($cr, $mr)) {
                                echo json_encode([
                                    "success" => false,
                                    "message" => "This time cannot be scheduled.\n\n" .
                                        $manual["task_name"] . " is already scheduled for " . ($manual["from_time"] ?? "") .
                                        (($manual["to_time"] ?? "") !== "" ? " - " . $manual["to_time"] : "") . ".\n\n" .
                                        "Please choose another time."
                                ]);
                                exit;
                            }
                        }
                    }
                }
            }
            $manualTasks->close();

            $upsert = $conn->prepare("
                INSERT INTO student_default_tasks
                    (user_id, default_id, task_title, from_time, to_time, icon, color, next_day, is_active)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)
                ON DUPLICATE KEY UPDATE
                    task_title=VALUES(task_title),
                    from_time=VALUES(from_time),
                    to_time=VALUES(to_time),
                    icon=VALUES(icon),
                    color=VALUES(color),
                    next_day=VALUES(next_day),
                    is_active=1
            ");

            foreach ($systemDefaults as $base) {
                $d = null;
                foreach ($defaults as $candidate) {
                    if ((string)($candidate["default_id"] ?? $candidate["id"] ?? "") === $base["id"]) {
                        $d = $candidate;
                        break;
                    }
                }
                $defaultId = (string)$base["id"];

                // d1 (Wake Up) and d5 (Sleep) stay permanent.
                // If another core task was removed from the modal, keep it inactive.
                if (!$d && !in_array($defaultId, ["d1", "d5"], true)) {
                    $inactive = $conn->prepare("
                        INSERT INTO student_default_tasks
                            (user_id, default_id, task_title, from_time, to_time, icon, color, next_day, is_active)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)
                        ON DUPLICATE KEY UPDATE is_active=0
                    ");
                    $inactiveFromDb = normalizeDbTime($base["from"]);
                    $inactiveToDb = normalizeDbTime($base["to"]);

                    $inactive->bind_param(
                        "issssssi",
                        $studentId,
                        $defaultId,
                        $base["title"],
                        $inactiveFromDb,
                        $inactiveToDb,
                        $base["icon"],
                        $base["color"],
                        $base["next_day"]
                    );
                    $inactive->execute();
                    $inactive->close();

                    $delId = $conn->real_escape_string($defaultId);
                    $conn->query("
                        DELETE t FROM tasks t
                        INNER JOIN skilllab_task_default_map m ON m.task_id=t.id
                        WHERE m.user_id=".(int)$studentId." AND m.default_id='$delId'
                          AND t.task_date >= CURDATE()
                    ");
                    continue;
                }

                $d = $d ?: $base;
                $title = trim((string)($d["title"] ?? $base["title"]));
                $from = trim((string)($d["from"] ?? $d["time"] ?? $base["from"]));
                $to = trim((string)($d["to"] ?? $base["to"]));

                // UI sends AM/PM text; DB columns are TIME.
                $fromDb = normalizeDbTime($from);
                $toDb = normalizeDbTime($to);

                $icon = trim((string)($d["icon"] ?? $base["icon"]));
                $color = trim((string)($d["color"] ?? $base["color"]));
                $nextDay = (int)($d["next_day"] ?? $d["nextDay"] ?? $base["next_day"]);

                // Wake Up (d1) is a point-time task. It has NO to_time.
                // Save SQL NULL explicitly so an empty string can never reach
                // the MySQL TIME column.
                if ($defaultId === "d1") {

                    $wakeUpStmt = $conn->prepare("
                        INSERT INTO student_default_tasks
                            (user_id, default_id, task_title, from_time, to_time, icon, color, next_day, is_active)
                        VALUES (?, ?, ?, ?, NULL, ?, ?, 0, 1)
                        ON DUPLICATE KEY UPDATE
                            task_title=VALUES(task_title),
                            from_time=VALUES(from_time),
                            to_time=NULL,
                            icon=VALUES(icon),
                            color=VALUES(color),
                            next_day=0,
                            is_active=1
                    ");

                    $wakeUpStmt->bind_param(
                        "isssss",
                        $studentId,
                        $defaultId,
                        $title,
                        $fromDb,
                        $icon,
                        $color
                    );

                    $wakeUpStmt->execute();
                    $wakeUpStmt->close();

                } else {

                    // Sleep (d5) may cross midnight.
                    if ($defaultId === "d5" && $to !== "") {
                        $fromTs = strtotime($from);
                        $toTs = strtotime($to);
                        $nextDay = ($fromTs !== false && $toTs !== false && $toTs <= $fromTs) ? 1 : 0;
                    }

                    $upsert->bind_param(
                        "issssssi",
                        $studentId,
                        $defaultId,
                        $title,
                        $fromDb,
                        $toDb,
                        $icon,
                        $color,
                        $nextDay
                    );
                    $upsert->execute();
                }

                // IMPORTANT: do NOT clear student date-wise delete markers here.
                // A student delete on 29-Sep must remain deleted on 29-Sep even
                // when the recurring Admin default is saved again.

                // Keep already-created today/future default rows in sync, but
                // NEVER overwrite a date-specific student override or delete.
                // Completed historical rows are intentionally untouched.
                $prop = $conn->prepare("
                    UPDATE tasks t
                    INNER JOIN skilllab_task_default_map m ON m.task_id=t.id
                    SET t.task_name=?, t.from_time=?, t.to_time=?
                    WHERE m.user_id=?
                      AND m.default_id=?
                      AND t.task_date >= CURDATE()
                      AND t.status=0
                      AND NOT EXISTS (
                          SELECT 1
                          FROM student_default_task_dates d
                          WHERE d.user_id=m.user_id
                            AND d.task_date=m.task_date
                            AND d.default_id=m.default_id
                            AND d.is_active=1
                      )
                      AND NOT EXISTS (
                          SELECT 1
                          FROM skilllab_deleted_default_tasks x
                          WHERE x.user_id=m.user_id
                            AND x.task_date=m.task_date
                            AND x.default_id=m.default_id
                      )
                ");
                $prop->bind_param("sssis", $title, $fromDb, $toDb, $studentId, $defaultId);
                $prop->execute();
                $prop->close();
            }
            $upsert->close();

            // Save any additional recurring tasks created by the admin.
            $coreIds = array_column($systemDefaults, "id");
            $incomingCustomIds = [];
            $customUpsert = $conn->prepare("
                INSERT INTO student_default_tasks
                    (user_id, default_id, task_title, from_time, to_time, icon, color, next_day, is_active)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)
                ON DUPLICATE KEY UPDATE
                    task_title=VALUES(task_title),
                    from_time=VALUES(from_time),
                    to_time=VALUES(to_time),
                    icon=VALUES(icon),
                    color=VALUES(color),
                    next_day=VALUES(next_day),
                    is_active=1
            ");

            foreach ($defaults as $d) {
                $customId = trim((string)($d["default_id"] ?? $d["id"] ?? ""));
                if ($customId === "" || in_array($customId, $coreIds, true)) {
                    continue;
                }
                if (!preg_match('/^c_[A-Za-z0-9_]+$/', $customId)) {
                    continue;
                }

                $customTitle = trim((string)($d["title"] ?? ""));
                $customFrom = trim((string)($d["from"] ?? $d["time"] ?? ""));
                $customTo = trim((string)($d["to"] ?? ""));
                if ($customTitle === "" || $customFrom === "") {
                    continue;
                }

                $customFromDb = normalizeDbTime($customFrom);
                $customToDb = normalizeDbTime($customTo);

                $customIcon = trim((string)($d["icon"] ?? "clock"));
                $customColor = trim((string)($d["color"] ?? "linear-gradient(135deg, #667eea, #764ba2)"));
                $customNextDay = (int)($d["next_day"] ?? $d["nextDay"] ?? 0);
                if ($customTo !== "") {
                    $fromTs = strtotime($customFrom);
                    $toTs = strtotime($customTo);
                    if ($fromTs !== false && $toTs !== false) {
                        $customNextDay = ($toTs <= $fromTs) ? 1 : 0;
                    }
                }

                $incomingCustomIds[] = $customId;
                $customUpsert->bind_param("issssssi", $studentId, $customId, $customTitle, $customFromDb, $customToDb, $customIcon, $customColor, $customNextDay);
                $customUpsert->execute();

                // Do NOT clear date-wise student delete markers for custom defaults.
                // A student-added task such as "travel" can be deleted only for
                // the selected date and must stay hidden on that date.

                $prop = $conn->prepare("
                    UPDATE tasks t
                    INNER JOIN skilllab_task_default_map m ON m.task_id=t.id
                    SET t.task_name=?, t.from_time=?, t.to_time=?
                    WHERE m.user_id=? AND m.default_id=?
                      AND t.task_date >= CURDATE() AND t.status=0
                      AND NOT EXISTS (
                          SELECT 1
                          FROM student_default_task_dates d
                          WHERE d.user_id=m.user_id
                            AND d.task_date=m.task_date
                            AND d.default_id=m.default_id
                            AND d.is_active=1
                      )
                      AND NOT EXISTS (
                          SELECT 1
                          FROM skilllab_deleted_default_tasks x
                          WHERE x.user_id=m.user_id
                            AND x.task_date=m.task_date
                            AND x.default_id=m.default_id
                      )
                ");
                $prop->bind_param("sssis", $customTitle, $customFromDb, $customToDb, $studentId, $customId);
                $prop->execute();
                $prop->close();
            }
            $customUpsert->close();

            // Custom tasks removed from the modal are made inactive and their
            // future/today uncompleted rows are removed from the recurring set.
            $existingCustom = $conn->prepare("
                SELECT default_id FROM student_default_tasks
                WHERE user_id=? AND default_id LIKE 'c\_%' AND is_active=1
            ");
            $existingCustom->bind_param("i", $studentId);
            $existingCustom->execute();
            $customRes = $existingCustom->get_result();
            $existingIds = [];
            while ($r = $customRes->fetch_assoc()) {
                $existingIds[] = (string)$r["default_id"];
            }
            $existingCustom->close();

            foreach ($existingIds as $existingId) {
                if (in_array($existingId, $incomingCustomIds, true)) {
                    continue;
                }
                $delId = $conn->real_escape_string($existingId);
                $conn->query("
                    UPDATE student_default_tasks
                    SET is_active=0
                    WHERE user_id=".(int)$studentId." AND default_id='$delId'
                ");
                $conn->query("
                    DELETE t FROM tasks t
                    INNER JOIN skilllab_task_default_map m ON m.task_id=t.id
                    WHERE m.user_id=".(int)$studentId." AND m.default_id='$delId'
                      AND t.task_date >= CURDATE()
                ");
            }

            // If Sleep crosses midnight, keep Wake Up aligned to its end time.
            $sleep = $conn->prepare("SELECT from_time, to_time, next_day FROM student_default_tasks WHERE user_id=? AND default_id='d5' LIMIT 1");
            $sleep->bind_param("i", $studentId);
            $sleep->execute();
            $sleepRow = $sleep->get_result()->fetch_assoc();
            $sleep->close();
            if ($sleepRow && (int)$sleepRow["next_day"] === 1 && trim((string)$sleepRow["to_time"]) !== "") {
                $wake = $conn->prepare("
                    INSERT INTO student_default_tasks
                        (user_id, default_id, task_title, from_time, to_time, icon, color, next_day, is_active)
                    VALUES (?, 'd1', 'Wake Up', ?, NULL, 'sun', 'linear-gradient(135deg, #f6d365, #fda085)', 0, 1)
                    ON DUPLICATE KEY UPDATE task_title='Wake Up', from_time=VALUES(from_time), to_time=NULL, next_day=0, is_active=1
                ");
                $wakeTime = $sleepRow["to_time"];
                $wake->bind_param("is", $studentId, $wakeTime);
                $wake->execute();
                $wake->close();

                $wakeProp = $conn->prepare("
                    UPDATE tasks t
                    INNER JOIN skilllab_task_default_map m ON m.task_id=t.id
                    SET t.task_name='Wake Up', t.from_time=?, t.to_time=NULL
                    WHERE m.user_id=?
                      AND m.default_id='d1'
                      AND t.task_date >= CURDATE()
                      AND t.status=0
                ");
                $wakeProp->bind_param("si", $wakeTime, $studentId);
                $wakeProp->execute();
                $wakeProp->close();
            }
        }

        $savedRows = [];
        $stmt = $conn->prepare("
            SELECT default_id, task_title, from_time, to_time, icon, color, next_day, is_active
            FROM student_default_tasks
            WHERE user_id=?
            ORDER BY id ASC
        ");
        $stmt->bind_param("i", $studentId);
        $stmt->execute();
        $res = $stmt->get_result();
        while ($row = $res->fetch_assoc()) {
            $savedRows[(string)$row["default_id"]] = $row;
        }
        $stmt->close();

        // Date-specific Admin defaults for the selected date.
        $dateRows = [];
        $dateStmt = $conn->prepare("
            SELECT default_id, task_title, from_time, to_time, icon, color, next_day, is_active
            FROM student_default_task_dates
            WHERE user_id=? AND task_date=?
        ");
        $dateStmt->bind_param("is", $studentId, $selectedDate);
        $dateStmt->execute();
        $dateRes = $dateStmt->get_result();
        while ($row = $dateRes->fetch_assoc()) {
            $dateRows[(string)$row["default_id"]] = $row;
        }
        $dateStmt->close();

        // Actual student-edited task rows are the strongest source for this date.
        // This makes an edit such as Wake Up 8:08 AM appear in Admin only on that date.
        $dateTaskRows = [];
        $taskStmt = $conn->prepare("
            SELECT m.default_id, t.task_name, t.from_time, t.to_time
            FROM skilllab_task_default_map m
            INNER JOIN tasks t ON t.id=m.task_id AND t.user_id=m.user_id
            WHERE m.user_id=? AND m.task_date=?
        ");
        $taskStmt->bind_param("is", $studentId, $selectedDate);
        $taskStmt->execute();
        $taskRes = $taskStmt->get_result();
        while ($row = $taskRes->fetch_assoc()) {
            $dateTaskRows[(string)$row["default_id"]] = $row;
        }
        $taskStmt->close();

        /* ---------------------------------------------------------
           INHERITED WAKE UP FROM PREVIOUS DAY'S SLEEP
           ---------------------------------------------------------
           This is calculated server-side too, so an already-saved
           29-Sep Sleep of 10:03 PM -> 5:20 AM makes 30-Sep Wake Up
           5:20 AM even if 30-Sep has not been opened/saved before.
        --------------------------------------------------------- */
        $inheritedWakeFromPreviousDate = null;
        $previousDate = date("Y-m-d", strtotime($selectedDate . " -1 day"));

        $prevSleepDateStmt = $conn->prepare("
            SELECT task_title, from_time, to_time, next_day, is_active
            FROM student_default_task_dates
            WHERE user_id=? AND task_date=? AND default_id='d5'
            LIMIT 1
        ");
        $prevSleepDateStmt->bind_param("is", $studentId, $previousDate);
        $prevSleepDateStmt->execute();
        $prevSleepDate = $prevSleepDateStmt->get_result()->fetch_assoc();
        $prevSleepDateStmt->close();

        $prevSleepDeletedStmt = $conn->prepare("
            SELECT 1
            FROM skilllab_deleted_default_tasks
            WHERE user_id=? AND task_date=? AND default_id='d5'
            LIMIT 1
        ");
        $prevSleepDeletedStmt->bind_param("is", $studentId, $previousDate);
        $prevSleepDeletedStmt->execute();
        $prevSleepDeleted = $prevSleepDeletedStmt->get_result()->num_rows > 0;
        $prevSleepDeletedStmt->close();

        if (!$prevSleepDeleted) {
            $previousSleep = null;

            if ($prevSleepDate) {
                if ((int)$prevSleepDate["is_active"] === 1) {
                    $previousSleep = $prevSleepDate;
                }
            } else {
                $previousSleep = $savedRows["d5"] ?? null;

                // If a date-specific task was edited by the student, use
                // that actual mapped task as the previous day's Sleep.
                $prevSleepTaskStmt = $conn->prepare("
                    SELECT t.task_name, t.from_time, t.to_time
                    FROM skilllab_task_default_map m
                    INNER JOIN tasks t ON t.id=m.task_id AND t.user_id=m.user_id
                    WHERE m.user_id=? AND m.task_date=? AND m.default_id='d5'
                    LIMIT 1
                ");
                $prevSleepTaskStmt->bind_param("is", $studentId, $previousDate);
                $prevSleepTaskStmt->execute();
                $prevSleepTask = $prevSleepTaskStmt->get_result()->fetch_assoc();
                $prevSleepTaskStmt->close();

                if ($prevSleepTask) {
                    $previousSleep = array_merge($previousSleep ?: [], [
                        "from_time" => $prevSleepTask["from_time"],
                        "to_time" => $prevSleepTask["to_time"]
                    ]);
                }
            }

            if ($previousSleep && !empty($previousSleep["from_time"]) && !empty($previousSleep["to_time"])) {
                $prevFrom = ((int)substr($previousSleep["from_time"], 0, 2) * 60) + (int)substr($previousSleep["from_time"], 3, 2);
                $prevTo = ((int)substr($previousSleep["to_time"], 0, 2) * 60) + (int)substr($previousSleep["to_time"], 3, 2);

                if ($prevTo <= $prevFrom) {
                    $inheritedWakeFromPreviousDate = $previousSleep["to_time"];
                }
            }
        }

        $resultDefaults = [];
        foreach ($systemDefaults as $base) {
            $baseId = (string)$base["id"];

            /* ---------------------------------------------------------
               DATE-WISE DELETE ALWAYS WINS
               --------------------------------------------------------- */
            $deletedStmt = $conn->prepare("
                SELECT 1
                FROM skilllab_deleted_default_tasks
                WHERE user_id=? AND task_date=? AND default_id=?
                LIMIT 1
            ");
            $deletedStmt->bind_param("iss", $studentId, $selectedDate, $baseId);
            $deletedStmt->execute();
            $isDeletedForDate = $deletedStmt->get_result()->num_rows > 0;
            $deletedStmt->close();

            if ($isDeletedForDate) {
                continue;
            }

            /* ---------------------------------------------------------
               DATE-SPECIFIC ADMIN/STUDENT OVERRIDE
               ---------------------------------------------------------
               If a row exists for this date, it is authoritative.
               is_active=0 means hidden for this date.
            */
            $row = $dateRows[$baseId] ?? null;

            if ($row) {
                if ((int)$row["is_active"] !== 1) {
                    continue;
                }
            }

            /* ---------------------------------------------------------
               ACTUAL MAPPED TASK FOR THIS DATE
               ---------------------------------------------------------
               A real task mapped to this default is stronger than the
               recurring profile. This is what makes student edits appear
               in Admin only on the selected date.
            */
            $actual = $dateTaskRows[$baseId] ?? null;

            /* ---------------------------------------------------------
               RECURRING PROFILE
               --------------------------------------------------------- */
            $saved = $savedRows[$baseId] ?? null;

            /*
             * IMPORTANT FIX:
             * Never fall back to the hard-coded system default merely
             * because this default has no saved profile/date row.
             *
             * Otherwise a student who has only 3 active defaults on
             * 29-Sep could incorrectly get Study MERN / Practice English /
             * Workout shown in Admin.
             *
             * A default must exist either as:
             *   1. a date-specific row,
             *   2. a recurring saved profile, or
             *   3. an actual mapped task for this date.
             */
            if (
                !$row &&
                !$saved &&
                !$actual &&
                !($baseId === "d1" && $inheritedWakeFromPreviousDate !== null)
            ) {
                continue;
            }

            $source = $row ?: $saved ?: [];

            /* Previous day's overnight Sleep supplies today's Wake Up,
               but only when today's Wake Up has no explicit date row and
               no actual mapped task. */
            if (
                $baseId === "d1" &&
                !$row &&
                !$actual &&
                $inheritedWakeFromPreviousDate !== null
            ) {
                $source = array_merge($source, [
                    "task_title" => "Wake Up",
                    "from_time" => $inheritedWakeFromPreviousDate,
                    "to_time" => null,
                    "icon" => "sun",
                    "color" => "linear-gradient(135deg, #f6d365, #fda085)",
                    "next_day" => 0
                ]);
            }

            if ($actual) {
                $source = array_merge($source, [
                    "task_title" => $actual["task_name"],
                    "from_time" => $actual["from_time"],
                    "to_time" => $actual["to_time"]
                ]);
            }

            $resultDefaults[] = [
                "default_id" => $baseId,
                "title" => $source["task_title"] ?? $base["title"],
                "from" => $source["from_time"] ?? $base["from"],
                "to" => $source["to_time"] ?? $base["to"],
                "icon" => $source["icon"] ?? $base["icon"],
                "color" => $source["color"] ?? $base["color"],
                "next_day" => (int)($source["next_day"] ?? $base["next_day"]),
                "is_custom" => false,
                "task_date" => $selectedDate
            ];
        }

        // Return active custom recurring tasks as well.
        foreach ($savedRows as $id => $row) {
            $isCore = false;
            foreach ($systemDefaults as $base) {
                if ((string)$base["id"] === (string)$id) {
                    $isCore = true;
                    break;
                }
            }
            if ($isCore || (int)$row["is_active"] !== 1) {
                continue;
            }
            // A student delete is date-specific and must also hide custom
            // recurring defaults (for example a task named "travel").
            $deletedCustomStmt = $conn->prepare("
                SELECT 1
                FROM skilllab_deleted_default_tasks
                WHERE user_id=? AND task_date=? AND default_id=?
                LIMIT 1
            ");
            $deletedCustomStmt->bind_param("iss", $studentId, $selectedDate, $id);
            $deletedCustomStmt->execute();
            $isCustomDeletedForDate = $deletedCustomStmt->get_result()->num_rows > 0;
            $deletedCustomStmt->close();

            if ($isCustomDeletedForDate) {
                continue;
            }

            // A date-specific custom override replaces the recurring value for this date.
            // An inactive override is a date-specific student deletion.
            if (isset($dateRows[$id])) {
                if ((int)$dateRows[$id]["is_active"] !== 1) {
                    continue;
                }
                continue;
            }
            $resultDefaults[] = [
                "default_id" => $id,
                "title" => $row["task_title"],
                "from" => $row["from_time"],
                "to" => $row["to_time"] ?? "",
                "icon" => $row["icon"] ?: "clock",
                "color" => $row["color"] ?: "linear-gradient(135deg, #667eea, #764ba2)",
                "next_day" => (int)$row["next_day"],
                "is_custom" => true
            ];
        }

        // Add active date-specific custom defaults.
        foreach ($dateRows as $id => $row) {
            $isCore = in_array((string)$id, array_column($systemDefaults, "id"), true);
            if ($isCore || (int)$row["is_active"] !== 1) continue;

            // A delete marker always wins, even if an older recurring custom
            // profile still exists.
            $deletedCustomStmt = $conn->prepare("
                SELECT 1
                FROM skilllab_deleted_default_tasks
                WHERE user_id=? AND task_date=? AND default_id=?
                LIMIT 1
            ");
            $deletedCustomStmt->bind_param("iss", $studentId, $selectedDate, $id);
            $deletedCustomStmt->execute();
            $isCustomDeletedForDate = $deletedCustomStmt->get_result()->num_rows > 0;
            $deletedCustomStmt->close();

            if ($isCustomDeletedForDate) continue;

            // If the student has a mapped row for this custom id, show that row.
            $actual = $dateTaskRows[$id] ?? null;
            $resultDefaults[] = [
                "default_id" => $id,
                "title" => $actual["task_name"] ?? $row["task_title"],
                "from" => $actual["from_time"] ?? $row["from_time"],
                "to" => $actual["to_time"] ?? ($row["to_time"] ?? ""),
                "icon" => $row["icon"] ?: "clock",
                "color" => $row["color"] ?: "linear-gradient(135deg, #667eea, #764ba2)",
                "next_day" => (int)$row["next_day"],
                "is_custom" => true,
                "task_date" => $selectedDate
            ];
        }

        echo json_encode([
            "success"=>true,
            "student"=>$studentRow,
            "task_date"=>$selectedDate,
            "defaults"=>$resultDefaults
        ]);
        exit;
    }


    /* =========================================
       ADMIN OVERVIEW
    ========================================= */

    if ($action === "admin_overview") {


        /* =====================================
           TOTAL STUDENTS
        ===================================== */

        $countStmt = $conn->prepare("
            SELECT COUNT(*) AS total
            FROM users
        ");

        $countStmt->execute();

        $countResult =
            $countStmt->get_result();

        $countRow =
            $countResult->fetch_assoc();

        $totalStudents =
            (int)($countRow["total"] ?? 0);

        $countStmt->close();


        /* =====================================
           TOTAL WEEK TASKS / STARTED STUDENTS
        ===================================== */

        $totalTasks = 0;
        $totalTodayTasks = 0;
        $totalTodayCompleted = 0;
        $totalMonthTasks = 0;
        $totalMonthCompleted = 0;
        $startedStudents = 0;
        $notStartedStudents = 0;

        /* =====================================
           TODAY TASKS
        ===================================== */

        $todayStmt = $conn->prepare("
            SELECT
                COUNT(*) AS total,
                SUM(
                    CASE
                        WHEN status = 1 THEN 1
                        ELSE 0
                    END
                ) AS completed
            FROM tasks
            WHERE task_date = CURDATE()
        ");

        $todayStmt->execute();

        $todayResult =
            $todayStmt->get_result();

        $todayRow =
            $todayResult->fetch_assoc();

        $todayTotal =
            (int)($todayRow["total"] ?? 0);

        $todayCompleted =
            (int)($todayRow["completed"] ?? 0);

        $todayStmt->close();


        /* =====================================
           TODAY PERFORMANCE
        ===================================== */

        $todayPerformance = 0;

        if ($todayTotal > 0) {

            $todayPerformance =
                round(
                    ($todayCompleted / $todayTotal) * 100
                );
        }


        /* =====================================
           WEEK TASKS

           Monday → Sunday
        ===================================== */

        $weekStmt = $conn->prepare("
            SELECT
                COUNT(*) AS total,
                SUM(
                    CASE
                        WHEN status = 1 THEN 1
                        ELSE 0
                    END
                ) AS completed
            FROM tasks
            WHERE
                YEARWEEK(
                    task_date,
                    1
                ) = YEARWEEK(
                    CURDATE(),
                    1
                )
        ");

        $weekStmt->execute();

        $weekResult =
            $weekStmt->get_result();

        $weekRow =
            $weekResult->fetch_assoc();

        $weekTotal =
            (int)($weekRow["total"] ?? 0);

        $weekCompleted =
            (int)($weekRow["completed"] ?? 0);

        $weekStmt->close();


        /* =====================================
           WEEK PERFORMANCE
        ===================================== */

        $weekPerformance = 0;

        if ($weekTotal > 0) {

            $weekPerformance =
                round(
                    ($weekCompleted / $weekTotal) * 100
                );
        }


        /* =====================================
           MONTH TASKS
        ===================================== */

        $monthStmt = $conn->prepare("
            SELECT
                COUNT(*) AS total,
                SUM(
                    CASE
                        WHEN status = 1 THEN 1
                        ELSE 0
                    END
                ) AS completed
            FROM tasks
            WHERE
                YEAR(task_date) = YEAR(CURDATE())
                AND
                MONTH(task_date) = MONTH(CURDATE())
        ");

        $monthStmt->execute();

        $monthResult =
            $monthStmt->get_result();

        $monthRow =
            $monthResult->fetch_assoc();

        $monthTotal =
            (int)($monthRow["total"] ?? 0);

        $monthCompleted =
            (int)($monthRow["completed"] ?? 0);

        $monthStmt->close();


        /* =====================================
           MONTH PERFORMANCE
        ===================================== */

        $monthPerformance = 0;

        if ($monthTotal > 0) {

            $monthPerformance =
                round(
                    ($monthCompleted / $monthTotal) * 100
                );
        }


        /* =====================================
           GET STUDENTS
        ===================================== */

        $studentStmt = $conn->prepare("
            SELECT
                id,
                name,
                email
            FROM users
            ORDER BY id DESC
        ");

        $studentStmt->execute();

        $studentResult =
            $studentStmt->get_result();

        $students = [];


        /* =====================================
           STRONG / WEAK COUNTERS
        ===================================== */

        $strongStudents = 0;
        $weakStudents = 0;

        /* =====================================
           WEEKLY / MONTHLY STUDENT CATEGORIES
        ===================================== */

        $todayStrongStudents = [];
        $todayGoodStudents = [];
        $todayWeakStudents = [];

        $weeklyStrongStudents = [];
        $weeklyGoodStudents = [];
        $weeklyWeakStudents = [];

        $monthlyStrongStudents = [];
        $monthlyGoodStudents = [];
        $monthlyWeakStudents = [];


        /* =====================================
           LOOP STUDENTS
        ===================================== */

        while (
            $student =
            $studentResult->fetch_assoc()
        ) {


            $studentId =
                (int)$student["id"];


            /* =================================
               STUDENT WEEK TASKS
            ================================= */

            $studentWeekStmt =
                $conn->prepare("
                    SELECT
                        COUNT(*) AS total,
                        SUM(
                            CASE
                                WHEN status = 1
                                THEN 1
                                ELSE 0
                            END
                        ) AS completed,
                        SUM(
                            CASE
                                WHEN status <> 0
                                THEN 1
                                ELSE 0
                            END
                        ) AS started
                    FROM tasks
                    WHERE
                        user_id = ?
                        AND
                        YEARWEEK(
                            task_date,
                            1
                        ) = YEARWEEK(
                            CURDATE(),
                            1
                        )
                ");


            $studentWeekStmt->bind_param(
                "i",
                $studentId
            );

            $studentWeekStmt->execute();


            $studentWeekResult =
                $studentWeekStmt->get_result();

            $studentWeekRow =
                $studentWeekResult->fetch_assoc();


            $studentWeekTotal =
                (int)(
                    $studentWeekRow["total"]
                    ?? 0
                );


            $studentWeekCompleted =
                (int)(
                    $studentWeekRow["completed"]
                    ?? 0
                );

            $studentWeekStarted =
                (int)(
                    $studentWeekRow["started"]
                    ?? 0
                );


            $studentWeekStmt->close();


            /* =================================
               STUDENT WEEK PERFORMANCE
            ================================= */

            $studentWeekPerformance = 0;


            if ($studentWeekTotal > 0) {

                $studentWeekPerformance =
                    round(
                        (
                            $studentWeekCompleted
                            /
                            $studentWeekTotal
                        ) * 100
                    );
            }


            /* =================================
               WEEKLY STUDENT CATEGORY
            ================================= */

            $weeklyStudentData = [
                "id" => $studentId,
                "name" => $student["name"] ?? "",
                "performance" => $studentWeekPerformance,
                "started" => $studentWeekStarted
            ];

            /*
             * A student is considered STARTED when at least one
             * task has moved from Not Started (status 0).
             * Students with no started task are shown as Weak.
             */
            if ($studentWeekPerformance >= 60 && $studentWeekStarted > 0) {

                $strongStudents++;
                $weeklyStrongStudents[] = $weeklyStudentData;

            } elseif (
                $studentWeekPerformance >= 40 &&
                $studentWeekStarted > 0
            ) {

                $weeklyGoodStudents[] = $weeklyStudentData;

            } else {

                $weakStudents++;
                $weeklyWeakStudents[] = $weeklyStudentData;
            }

            if ($studentWeekStarted > 0) {
                $startedStudents++;
            } else {
                $notStartedStudents++;
            }

            $totalTasks += $studentWeekTotal;


            /* =================================
               STUDENT TODAY
            ================================= */

            $studentTodayStmt =
                $conn->prepare("
                    SELECT
                        COUNT(*) AS total,
                        SUM(
                            CASE
                                WHEN status = 1
                                THEN 1
                                ELSE 0
                            END
                        ) AS completed
                    FROM tasks
                    WHERE
                        user_id = ?
                        AND
                        task_date = CURDATE()
                ");


            $studentTodayStmt->bind_param(
                "i",
                $studentId
            );

            $studentTodayStmt->execute();


            $studentTodayResult =
                $studentTodayStmt->get_result();

            $studentTodayRow =
                $studentTodayResult->fetch_assoc();


            $studentTodayTotal =
                (int)(
                    $studentTodayRow["total"]
                    ?? 0
                );


            $studentTodayCompleted =
                (int)(
                    $studentTodayRow["completed"]
                    ?? 0
                );


            $studentTodayStmt->close();

            // Aggregate TODAY using each student's actual task count.
            $totalTodayTasks += $studentTodayTotal;
            $totalTodayCompleted += $studentTodayCompleted;


            $studentTodayPerformance = 0;


            if ($studentTodayTotal > 0) {

                $studentTodayPerformance =
                    round(
                        (
                            $studentTodayCompleted
                            /
                            $studentTodayTotal
                        ) * 100
                    );
            }


            /* =================================
               TODAY STUDENT CATEGORY
            ================================= */

            $todayStudentData = [
                "id" => $studentId,
                "name" => $student["name"] ?? "",
                "performance" => $studentTodayPerformance,
                "started" => $studentTodayTotal > 0
            ];

            if ($studentTodayPerformance >= 60 && $studentTodayTotal > 0) {

                $todayStrongStudents[] = $todayStudentData;

            } elseif (
                $studentTodayPerformance >= 40 &&
                $studentTodayTotal > 0
            ) {

                $todayGoodStudents[] = $todayStudentData;

            } else {

                $todayWeakStudents[] = $todayStudentData;
            }


            /* =================================
               STUDENT MONTH
            ================================= */

            $studentMonthStmt =
                $conn->prepare("
                    SELECT
                        COUNT(*) AS total,
                        SUM(
                            CASE
                                WHEN status = 1
                                THEN 1
                                ELSE 0
                            END
                        ) AS completed,
                        SUM(
                            CASE
                                WHEN status <> 0
                                THEN 1
                                ELSE 0
                            END
                        ) AS started
                    FROM tasks
                    WHERE
                        user_id = ?
                        AND
                        YEAR(task_date)
                            = YEAR(CURDATE())
                        AND
                        MONTH(task_date)
                            = MONTH(CURDATE())
                ");


            $studentMonthStmt->bind_param(
                "i",
                $studentId
            );

            $studentMonthStmt->execute();


            $studentMonthResult =
                $studentMonthStmt->get_result();

            $studentMonthRow =
                $studentMonthResult->fetch_assoc();


            $studentMonthTotal =
                (int)(
                    $studentMonthRow["total"]
                    ?? 0
                );


            $studentMonthCompleted =
                (int)(
                    $studentMonthRow["completed"]
                    ?? 0
                );

            $studentMonthStarted =
                (int)(
                    $studentMonthRow["started"]
                    ?? 0
                );


            $studentMonthStmt->close();

            // Aggregate MONTH using each student's actual task count.
            $totalMonthTasks += $studentMonthTotal;
            $totalMonthCompleted += $studentMonthCompleted;


            $studentMonthPerformance = 0;


            if ($studentMonthTotal > 0) {

                $studentMonthPerformance =
                    round(
                        (
                            $studentMonthCompleted
                            /
                            $studentMonthTotal
                        ) * 100
                    );
            }


            /* =================================
               MONTHLY STUDENT CATEGORY
            ================================= */

            $monthlyStudentData = [
                "id" => $studentId,
                "name" => $student["name"] ?? "",
                "performance" => $studentMonthPerformance,
                "started" => $studentMonthStarted
            ];

            if (
                $studentMonthPerformance >= 60 &&
                $studentMonthStarted > 0
            ) {

                $monthlyStrongStudents[] = $monthlyStudentData;

            } elseif (
                $studentMonthPerformance >= 40 &&
                $studentMonthStarted > 0
            ) {

                $monthlyGoodStudents[] = $monthlyStudentData;

            } else {

                $monthlyWeakStudents[] = $monthlyStudentData;
            }


            /* =================================
               STUDENT STATUS
            ================================= */

            $status = "active";


            /* =================================
               STUDENT DATA
            ================================= */

            $students[] = [

                "id" =>
                    $studentId,

                "name" =>
                    $student["name"] ?? "",

                "email" =>
                    $student["email"] ?? "",

                "phone" =>
                    null,

                "photo" =>
                    null,

                "join_date" =>
                    null,

                "expiry_date" =>
                    null,

                "status" =>
                    $status,

                /* WEEK */

                "weekPerformance" =>
                    $studentWeekPerformance,

                "weekCompleted" =>
                    $studentWeekCompleted,

                "weekTotal" =>
                    $studentWeekTotal,

                "weekStarted" =>
                    $studentWeekStarted,

                "started" =>
                    $studentWeekStarted > 0,

                /* TODAY */

                "todayPerformance" =>
                    $studentTodayPerformance,

                "todayCompleted" =>
                    $studentTodayCompleted,

                "todayTotal" =>
                    $studentTodayTotal,

                /* MONTH */

                "monthPerformance" =>
                    $studentMonthPerformance,

                "monthCompleted" =>
                    $studentMonthCompleted,

                "monthTotal" =>
                    $studentMonthTotal,

                "monthStarted" =>
                    $studentMonthStarted
            ];
        }


        $studentStmt->close();


        /* =====================================
           STUDENTS WITH TASKS
        ===================================== */

        $studentsWithTasks = 0;


        foreach ($students as $student) {

            if (
                ($student["weekTotal"] ?? 0) > 0
            ) {

                $studentsWithTasks++;
            }
        }


        /* =====================================
           OVERALL PERFORMANCE FROM ACTUAL
           STUDENT TASK COUNTS
        ===================================== */

        $todayTotal = $totalTodayTasks;
        $todayCompleted = $totalTodayCompleted;
        $todayPerformance = $todayTotal > 0
            ? round(($todayCompleted / $todayTotal) * 100)
            : 0;

        $monthTotal = $totalMonthTasks;
        $monthCompleted = $totalMonthCompleted;
        $monthPerformance = $monthTotal > 0
            ? round(($monthCompleted / $monthTotal) * 100)
            : 0;


        /* =====================================
           OVERVIEW
        ===================================== */

        $overview = [

            "totalStudents" =>
                $totalStudents,

            /* TODAY */

            "todayPerformance" =>
                $todayPerformance,

            "todayCompleted" =>
                $todayCompleted,

            "todayTotal" =>
                $todayTotal,

            /* WEEK */

            "weekPerformance" =>
                $weekPerformance,

            "weekCompleted" =>
                $weekCompleted,

            "weekTotal" =>
                $weekTotal,

            /* MONTH */

            "monthPerformance" =>
                $monthPerformance,

            "monthCompleted" =>
                $monthCompleted,

            "monthTotal" =>
                $monthTotal,

            /* STUDENT ACTIVITY */

            "totalTasks" =>
                $totalTasks,

            "startedStudents" =>
                $startedStudents,

            "notStartedStudents" =>
                $notStartedStudents,

            /* STUDENT STATUS */

            "strongStudents" =>
                $strongStudents,

            "weakStudents" =>
                $weakStudents,

            "studentsWithTasks" =>
                $studentsWithTasks,

            /* TODAY STUDENT PERFORMANCE */

            "todayStrongStudents" =>
                $todayStrongStudents,

            "todayGoodStudents" =>
                $todayGoodStudents,

            "todayWeakStudents" =>
                $todayWeakStudents,

            /* WEEKLY STUDENT PERFORMANCE */

            "weeklyStrongStudents" =>
                $weeklyStrongStudents,

            "weeklyGoodStudents" =>
                $weeklyGoodStudents,

            "weeklyWeakStudents" =>
                $weeklyWeakStudents,

            /* MONTHLY STUDENT PERFORMANCE */

            "monthlyStrongStudents" =>
                $monthlyStrongStudents,

            "monthlyGoodStudents" =>
                $monthlyGoodStudents,

            "monthlyWeakStudents" =>
                $monthlyWeakStudents
        ];


        /* =====================================
           FINAL RESPONSE
        ===================================== */

        echo json_encode([

            "success" => true,

            "message" =>
                "Admin dashboard loaded successfully",

            "overview" =>
                $overview,

            "students" =>
                $students

        ]);

        exit;
    }


    /* =========================================
       GET SINGLE STUDENT

       Used by Admin → View Dashboard.
       The admin authentication check above already
       confirms that admin_email belongs to an admin.
    ========================================= */

    if ($action === "get_student") {

        $studentId =
            (int)($input["student_id"] ?? 0);


        /* =====================================
           VALIDATE STUDENT ID
        ===================================== */

        if ($studentId <= 0) {

            echo json_encode([
                "success" => false,
                "message" => "Invalid student ID"
            ]);

            exit;
        }


        /* =====================================
           GET SELECTED STUDENT
        ===================================== */

        $studentStmt = $conn->prepare("
            SELECT
                id,
                name,
                email
            FROM users
            WHERE id = ?
            LIMIT 1
        ");

        $studentStmt->bind_param(
            "i",
            $studentId
        );

        $studentStmt->execute();

        $studentResult =
            $studentStmt->get_result();


        /* =====================================
           STUDENT NOT FOUND
        ===================================== */

        if ($studentResult->num_rows === 0) {

            $studentStmt->close();

            echo json_encode([
                "success" => false,
                "message" => "Student not found"
            ]);

            exit;
        }


        /* =====================================
           STUDENT
        ===================================== */

        $student =
            $studentResult->fetch_assoc();

        $studentStmt->close();


        /* =====================================
           RESPONSE
        ===================================== */

        echo json_encode([

            "success" => true,

            "message" =>
                "Student loaded successfully",

            "student" => [

                "id" =>
                    (int)$student["id"],

                "name" =>
                    $student["name"] ?? "",

                "email" =>
                    $student["email"] ?? ""

            ]

        ]);

        exit;
    }


    /* =========================================
       GET STUDENTS
    ========================================= */

    if ($action === "get_students") {


        $stmt = $conn->prepare("
            SELECT
                id,
                name,
                email
            FROM users
            ORDER BY id DESC
        ");


        $stmt->execute();

        $result =
            $stmt->get_result();

        $students = [];


        while (
            $row =
            $result->fetch_assoc()
        ) {

            $students[] = [

                "id" =>
                    (int)$row["id"],

                "name" =>
                    $row["name"] ?? "",

                "email" =>
                    $row["email"] ?? "",

                "phone" =>
                    null,

                "photo" =>
                    null,

                "join_date" =>
                    null,

                "expiry_date" =>
                    null,

                "status" =>
                    "active",

                "weekPerformance" =>
                    0
            ];
        }


        $stmt->close();


        echo json_encode([

            "success" => true,

            "message" =>
                "Students loaded successfully",

            "total" =>
                count($students),

            "students" =>
                $students

        ]);

        exit;
    }


    /* =========================================
       INVALID ACTION
    ========================================= */

    echo json_encode([

        "success" => false,

        "message" =>
            "Invalid action: " . $action

    ]);

} catch (Throwable $e) {

    http_response_code(500);

    echo json_encode([

        "success" => false,

        "message" =>
            "Server error",

        "error" =>
            $e->getMessage()

    ]);
}

?>