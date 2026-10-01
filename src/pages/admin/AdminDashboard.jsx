import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  FaGaugeHigh,
  FaChartLine,
  FaUsers,
  FaLayerGroup,
  FaMedal,
  FaTrophy,
  FaUserGraduate,
  FaUserTie,
  FaCreditCard,
  FaGear,
  FaArrowRightFromBracket,
  FaChevronDown,
  FaChevronRight,
  FaBars,
  FaXmark,
  FaCircleCheck,
  FaTriangleExclamation,
  FaCalendarDays,
  FaClock,
  FaArrowUp,
  FaArrowDown,
  FaArrowRight,
  FaMagnifyingGlass,
  FaUser,
  FaSun,
  FaBook,
  FaLanguage,
  FaDumbbell,
  FaMoon,
  FaPen,
  FaTrashCan,
  
} from "react-icons/fa6";
import { FaTasks } from "react-icons/fa";
import "./admin-dashboard.css";

const API_URL =
  "https://zyntaweb.com/skilllab/admin-dashboard.php";

function AdminDashboard() {
  const navigate = useNavigate();
  const location = useLocation();

  const [admin, setAdmin] = useState(null);

  const [students, setStudents] = useState([]);

  const [dashboardData, setDashboardData] =
    useState({
      totalStudents: 0,

      todayPerformance: 0,
      weekPerformance: 0,
      monthPerformance: 0,

      todayCompleted: 0,
      todayTotal: 0,

      weekCompleted: 0,
      weekTotal: 0,

      monthCompleted: 0,
      monthTotal: 0,

      strongStudents: 0,
      weakStudents: 0,
      startedStudents: 0,
      notStartedStudents: 0,
      totalTasks: 0,

      weeklyStrongStudents: [],
      weeklyGoodStudents: [],
      weeklyWeakStudents: [],

      monthlyStrongStudents: [],
      monthlyGoodStudents: [],
      monthlyWeakStudents: [],

      todayStrongStudents: [],
      todayGoodStudents: [],
      todayWeakStudents: [],
    });

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState("");

  // Per-student recurring default-task editor
  const [defaultModalOpen, setDefaultModalOpen] = useState(false);
  const [selectedDefaultStudent, setSelectedDefaultStudent] = useState(null);
  const [studentDefaults, setStudentDefaults] = useState([]);
  // Keep an explicit list of defaults deleted in the current Admin modal.
  // This is sent to the server so deletion cannot be lost when the payload
  // is rebuilt/merged from recurring and date-specific defaults.
  const [deletedDefaultIds, setDeletedDefaultIds] = useState([]);
  const [defaultLoading, setDefaultLoading] = useState(false);
  const [defaultSaving, setDefaultSaving] = useState(false);
  const [editingDefaultId, setEditingDefaultId] = useState(null);

  // The admin default editor is date-aware. Student task edits are stored
  // against a specific task_date, so Admin must load/save the same date.
  const getTodayKey = () => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  const [defaultTaskDate, setDefaultTaskDate] = useState(getTodayKey);

  const [mobileOpen, setMobileOpen] =
    useState(false);

  const [studentsOpen, setStudentsOpen] =
    useState(
      location.pathname.startsWith(
        "/admin/students"
      )
    );

  const [parentsMenuOpen, setParentsMenuOpen] = useState(
    location.pathname.startsWith("/admin/parents")
  );

  const isParentsPage =
    location.pathname === "/admin/parents" ||
    location.pathname.startsWith("/admin/parents/");

  // Keep Parents open whenever the Parents route is active.
  // This prevents All Parents from closing after navigation.
  const parentsOpen =
    parentsMenuOpen || isParentsPage;

  // Keep the correct submenu open after route navigation/remount.
  useEffect(() => {
    if (location.pathname.startsWith("/admin/parents")) {
      setParentsMenuOpen(true);
      setStudentsOpen(false);
      return;
    }

    if (location.pathname.startsWith("/admin/students")) {
      setStudentsOpen(true);
      setParentsMenuOpen(false);
      return;
    }

    if (
      location.pathname === "/AdminDashboard" ||
      location.pathname === "/admin/dashboard"
    ) {
      setStudentsOpen(false);
      setParentsMenuOpen(false);
    }
  }, [location.pathname]);  /* =========================================
     ADMIN
  ========================================= */

  useEffect(() => {
    try {
      const savedAdmin =
        localStorage.getItem("admin");

      if (!savedAdmin) {
        navigate("/admin/login", {
          replace: true,
        });
        return;
      }

      setAdmin(JSON.parse(savedAdmin));
    } catch (error) {
      console.error(
        "Admin data error:",
        error
      );

      localStorage.removeItem("admin");
      localStorage.removeItem(
        "adminLoggedIn"
      );

      navigate("/admin/login", {
        replace: true,
      });
    }
  }, [navigate]);

  /* =========================================
     FETCH ADMIN DATA
  ========================================= */

  const fetchAdminData = async (silent = false) => {
    try {
      // Manual Refresh shows the loading state.
      // Automatic refresh runs silently so the dashboard does not flicker.
      if (!silent) {
        setRefreshing(true);
      }

      const savedAdmin =
        localStorage.getItem("admin");

      if (!savedAdmin) {
        navigate("/admin/login", {
          replace: true,
        });
        return;
      }

      const adminData =
        JSON.parse(savedAdmin);

      const response = await fetch(
        API_URL,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            action: "admin_overview",
            admin_email:
              adminData.email,
          }),
        }
      );

      const data =
        await response.json();

      console.log(
        "ADMIN DASHBOARD:",
        data
      );

      if (!data.success) {
        throw new Error(
          data.message ||
            "Unable to load admin data"
        );
      }

      setDashboardData(
        data.overview || {}
      );

      setStudents(
        Array.isArray(data.students)
          ? data.students
          : []
      );
    } catch (error) {
      console.error(
        "Admin dashboard error:",
        error
      );
    } finally {
      setLoading(false);

      if (!silent) {
        setRefreshing(false);
      }
    }
  };

  useEffect(() => {
    if (!admin?.email) return;

    // First load
    fetchAdminData();

    // Automatically update admin dashboard when student/task data changes.
    // No browser refresh is required.
    const refreshInterval = setInterval(() => {
      fetchAdminData(true);
    }, 5000);

    // Refresh immediately when admin comes back to this browser tab.
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchAdminData(true);
      }
    };

    const handleWindowFocus = () => {
      fetchAdminData(true);
    };

    document.addEventListener(
      "visibilitychange",
      handleVisibilityChange
    );

    window.addEventListener("focus", handleWindowFocus);

    return () => {
      clearInterval(refreshInterval);
      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange
      );
      window.removeEventListener("focus", handleWindowFocus);
    };
  }, [admin]);

  // =====================================================
  // REAL-TIME STUDENT TASK SYNC
  // Student task changes are broadcast from Task.jsx.
  // Admin dashboard updates immediately; browser refresh is
  // not required. The existing 5-second polling remains as
  // a fallback for cases where browser messaging is unavailable.
  // =====================================================
  useEffect(() => {
    if (!admin?.email) return;

    let channel = null;

    const refreshFromStudentChange = async (event) => {
      const payload = event?.detail || event?.data || {};
      if (payload?.type && payload.type !== "TASK_DATA_CHANGED") {
        return;
      }

      // Refresh dashboard immediately.
      await fetchAdminData(true);

      // If the Admin default-task modal is open for the changed student,
      // refresh the currently selected date in that modal as well.
      if (
        selectedDefaultStudent?.id &&
        payload?.email &&
        String(selectedDefaultStudent.email || "").toLowerCase() ===
          String(payload.email).toLowerCase()
      ) {
        await reloadStudentDefaultsForDate(
          payload.date || defaultTaskDate
        );
      }
    };

    const handleTaskUpdated = () => {
      refreshFromStudentChange();
    };

    const handleStorage = (event) => {
      if (event.key !== "skilllab_task_data_changed" || !event.newValue) {
        return;
      }

      try {
        const payload = JSON.parse(event.newValue);
        if (payload?.type === "TASK_DATA_CHANGED") {
          refreshFromStudentChange({ data: payload });
        }
      } catch (error) {
        console.warn("Admin task sync payload error:", error);
      }
    };

    window.addEventListener("taskUpdated", handleTaskUpdated);
    window.addEventListener("storage", handleStorage);

    try {
      channel = new BroadcastChannel("skilllab_task_sync");
      channel.onmessage = (event) => {
        refreshFromStudentChange(event);
      };
    } catch (error) {
      console.warn("Admin BroadcastChannel unavailable:", error);
    }

    return () => {
      window.removeEventListener("taskUpdated", handleTaskUpdated);
      window.removeEventListener("storage", handleStorage);
      if (channel) {
        channel.close();
      }
    };
  }, [
    admin,
    selectedDefaultStudent,
    defaultTaskDate,
    defaultLoading,
  ]);

  /* =========================================
     ROUTE
  ========================================= */

  const isStudentsPage =
    location.pathname ===
      "/admin/students" ||
    location.pathname.startsWith(
      "/admin/students/"
    );



  /* =========================================
     SEARCH
  ========================================= */

  const filteredStudents = useMemo(() => {
    const value =
      search.trim().toLowerCase();

    if (!value) {
      return students;
    }

    return students.filter((student) => {
      return (
        String(student.name || "")
          .toLowerCase()
          .includes(value) ||

        String(student.email || "")
          .toLowerCase()
          .includes(value) ||

        String(student.phone || "")
          .toLowerCase()
          .includes(value)
      );
    });
  }, [students, search]);

  /* =========================================
     STUDENT RECURRING DEFAULT TASKS
  ========================================= */

  const openDefaultTasks = async (student, taskDate = defaultTaskDate) => {
    setSelectedDefaultStudent(student);
    setDefaultTaskDate(taskDate || getTodayKey());
    setDefaultModalOpen(true);
    setEditingDefaultId(null);
    setDeletedDefaultIds([]);
    setDefaultLoading(true);

    try {
      const adminData = JSON.parse(localStorage.getItem("admin") || "null");
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "get_student_defaults",
          admin_email: adminData?.email || "",
          student_id: student.id,
          task_date: taskDate || getTodayKey(),
        }),
      });

      const data = await response.json();
      if (!data.success) throw new Error(data.message || "Unable to load defaults");

      setStudentDefaults(Array.isArray(data.defaults) ? data.defaults : []);
    } catch (error) {
      console.error("Student defaults load error:", error);
      alert(error.message || "Unable to load student default tasks");
      setDefaultModalOpen(false);
    } finally {
      setDefaultLoading(false);
    }
  };

  const reloadStudentDefaultsForDate = async (taskDate) => {
    if (!selectedDefaultStudent || defaultLoading) return;

    setDefaultTaskDate(taskDate);
    setDeletedDefaultIds([]);
    setDefaultLoading(true);

    try {
      const adminData = JSON.parse(localStorage.getItem("admin") || "null");
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "get_student_defaults",
          admin_email: adminData?.email || "",
          student_id: selectedDefaultStudent.id,
          task_date: taskDate,
        }),
      });

      const data = await response.json();
      if (!data.success) throw new Error(data.message || "Unable to load defaults");
      setStudentDefaults(Array.isArray(data.defaults) ? data.defaults : []);
      setEditingDefaultId(null);
    } catch (error) {
      console.error("Date defaults load error:", error);
      alert(error.message || "Unable to load date-specific defaults");
    } finally {
      setDefaultLoading(false);
    }
  };

  /* =========================================
     DEFAULT TASK TIME / ICON HELPERS
     Keep Admin's recurring-default editor in
     the same time model as the Student task UI.
  ========================================= */

  const toInputTime = (value) => {
    const raw = String(value ?? "").trim();
    if (!raw) return "";

    // MySQL TIME: 05:00:00 / 17:30:00
    let match = raw.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
    if (match) {
      const hour = Number(match[1]);
      const minute = Number(match[2]);

      if (
        hour >= 0 &&
        hour <= 23 &&
        minute >= 0 &&
        minute <= 59
      ) {
        return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
      }
    }

    // UI value: 5:00 AM / 5:30 PM
    match = raw.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (match) {
      let hour = Number(match[1]);
      const minute = Number(match[2]);
      const modifier = match[3].toUpperCase();

      if (modifier === "PM" && hour !== 12) hour += 12;
      if (modifier === "AM" && hour === 12) hour = 0;

      if (
        hour >= 0 &&
        hour <= 23 &&
        minute >= 0 &&
        minute <= 59
      ) {
        return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
      }
    }

    return "";
  };

  const toDisplayTime = (value) => {
    const inputValue = toInputTime(value);
    if (!inputValue) return "";

    const [hourString, minute] = inputValue.split(":");
    let hour = Number(hourString);
    const ampm = hour >= 12 ? "PM" : "AM";

    hour = hour % 12;
    if (hour === 0) hour = 12;

    return `${hour}:${minute} ${ampm}`;
  };

  // =========================================================
  // ADMIN DEFAULT TIME MODEL
  // Allow every minute:
  // 04:00, 04:01, 04:02 ... 23:59
  // =========================================================
  const normalizeAdminHourInput = (value) => {
    if (!value) return "";

    const match = String(value).trim().match(/^(\d{1,2}):(\d{2})$/);
    if (!match) return "";

    const hour = Number(match[1]);
    const minute = Number(match[2]);

    if (
      !Number.isFinite(hour) ||
      !Number.isFinite(minute) ||
      hour < 0 ||
      hour > 23 ||
      minute < 0 ||
      minute > 59
    ) {
      return "";
    }

    return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
  };

  const inputToDisplayTime = (value) => {
    if (!value) return "";

    const normalized = normalizeAdminHourInput(value);
    if (!normalized) return "";

    const [hourString, minuteString] = normalized.split(":");
    let hour = Number(hourString);

    const ampm = hour >= 12 ? "PM" : "AM";
    hour = hour % 12;
    if (hour === 0) hour = 12;

    return `${hour}:${minuteString} ${ampm}`;
  };

  const isOvernightDefault = (from, to) => {
    const fromInput = toInputTime(from);
    const toInput = toInputTime(to);

    if (!fromInput || !toInput) return false;

    const [fh, fm] = fromInput.split(":").map(Number);
    const [th, tm] = toInput.split(":").map(Number);

    return th * 60 + tm <= fh * 60 + fm;
  };

  const getDefaultIcon = (task) => {
    const key = String(task?.icon || task?.default_id || task?.title || "")
      .toLowerCase()
      .trim();

    if (key.includes("d1") || key.includes("wake") || key.includes("sun")) {
      return <FaSun />;
    }

    if (
      key.includes("d2") ||
      key.includes("study") ||
      key.includes("book")
    ) {
      return <FaBook />;
    }

    if (
      key.includes("d3") ||
      key.includes("english") ||
      key.includes("language")
    ) {
      return <FaLanguage />;
    }

    if (
      key.includes("d4") ||
      key.includes("workout") ||
      key.includes("dumbbell")
    ) {
      return <FaDumbbell />;
    }

    if (
      key.includes("d5") ||
      key.includes("sleep") ||
      key.includes("moon")
    ) {
      return <FaMoon />;
    }

    return <FaClock />;
  };

  const getDefaultGradient = (task, index) => {
    if (task?.color) return task.color;

    const gradients = [
      "linear-gradient(135deg, #56ccf2, #2f80ed)",
      "linear-gradient(135deg, #667eea, #764ba2)",
      "linear-gradient(135deg, #f093fb, #f5576c)",
      "linear-gradient(135deg, #f6d365, #fda085)",
      "linear-gradient(135deg, #43e97b, #38f9d7)",
    ];

    return gradients[index % gradients.length];
  };

  const updateStudentDefault = (defaultId, field, value) => {
    setStudentDefaults((prev) => {
      const updated = prev.map((task) =>
        String(task.default_id) === String(defaultId)
          ? {
              ...task,
              [field]: value,
              ...(field === "from" || field === "to"
                ? {
                    next_day:
                      String(defaultId) === "d5"
                        ? isOvernightDefault(
                            field === "from" ? value : task.from,
                            field === "to" ? value : task.to
                          )
                          ? 1
                          : 0
                        : task.next_day,
                  }
                : {}),
            }
          : task
      );

      // IMPORTANT:
      // Sleep and Wake Up are NOT linked inside the same date.
      //
      // Example:
      // 29-Sep Sleep = 10:03 PM -> 5:20 AM
      // 29-Sep Wake Up stays whatever is configured for 29-Sep.
      // 30-Sep Wake Up becomes 5:20 AM on the server when the 29-Sep
      // Sleep schedule is saved.
      //
      // Do not change d1 when editing d5 here, and do not change d5 when
      // editing d1. The server handles the next-day inheritance.
      return updated;
    });
  };

  const addStudentDefault = () => {
    const customId = `c_${Date.now().toString(36)}_${Math.random()
      .toString(36)
      .slice(2, 5)}`;

    setStudentDefaults((prev) => [
      ...prev,
      {
        default_id: customId,
        title: "New Task",
        from: "08:00 AM",
        to: "09:00 AM",
        icon: "clock",
        color: "linear-gradient(135deg, #667eea, #764ba2)",
        next_day: 0,
        is_custom: true,
        is_new: true,
      },
    ]);

    setEditingDefaultId(customId);
  };

  const deleteStudentDefault = (defaultId) => {
    const task = studentDefaults.find(
      (item) => String(item.default_id) === String(defaultId)
    );

    if (!task) return;

    // Wake Up and Sleep are permanent recurring defaults.
    if (["d1", "d5"].includes(String(defaultId))) {
      alert(
        "Wake Up and Sleep are permanent default tasks and cannot be deleted."
      );
      return;
    }

    const confirmed = window.confirm(
      `Delete "${task.title || "this task"}" from this student's recurring defaults?\n\nIt will stop appearing from future days. Existing completed history will remain.`
    );

    if (!confirmed) return;

    // Remember the exact default_id explicitly deleted by Admin.
    // Do not rely only on the missing item in the defaults array.
    setDeletedDefaultIds((prev) =>
      prev.includes(String(defaultId)) ? prev : [...prev, String(defaultId)]
    );

    setStudentDefaults((prev) =>
      prev.filter(
        (item) => String(item.default_id) !== String(defaultId)
      )
    );

    if (String(editingDefaultId) === String(defaultId)) {
      setEditingDefaultId(null);
    }
  };

  const saveStudentDefaults = async () => {
    if (!selectedDefaultStudent || defaultSaving) return;

    /* =========================================================
       CLIENT-SIDE DATE SCHEDULE VALIDATION
       ---------------------------------------------------------
       Server validation is still authoritative, but checking here
       gives Admin an immediate AM/PM conflict message before Save.
       ========================================================= */
    const toMinutes = (value) => {
      const input = toInputTime(value);
      if (!input) return null;
      const [h, m] = input.split(":").map(Number);
      return h * 60 + m;
    };

    const formatMinutes = (minutes) => {
      const h24 = Math.floor(minutes / 60) % 24;
      const m = minutes % 60;
      const ampm = h24 >= 12 ? "PM" : "AM";
      let h = h24 % 12;
      if (h === 0) h = 12;
      return `${h}:${String(m).padStart(2, "0")} ${ampm}`;
    };

    const makeRanges = (from, to) => {
      if (to == null) return [[from, from]];
      if (to > from) return [[from, to]];
      return [
        [from, 1440],
        [0, to],
      ];
    };

    const rangesOverlap = (a, b) => {
      const aPoint = a[0] === a[1];
      const bPoint = b[0] === b[1];

      if (aPoint && bPoint) return a[0] === b[0];
      if (aPoint) return b[0] <= a[0] && a[0] < b[1];
      if (bPoint) return a[0] <= b[0] && b[0] < a[1];

      return a[0] < b[1] && b[0] < a[1];
    };

    const candidates = [];

    for (const task of studentDefaults) {
      const id = String(task.default_id || "");
      const title = String(task.title || "").trim();
      const from = toMinutes(task.from);
      const to = String(task.to || "").trim()
        ? toMinutes(task.to)
        : null;

      if (!id || !title || from == null) continue;

      if (to != null && to === from) {
        alert(
          `Time conflict\n\n${title} cannot have the same From Time and To Time.`
        );
        return;
      }

      if (to != null && to < from && id !== "d5") {
        alert(
          `Time conflict\n\n${title} cannot end before its start time.\n\nOnly Sleep can cross midnight.`
        );
        return;
      }

      candidates.push({ id, title, from, to });
    }

    for (let i = 0; i < candidates.length; i += 1) {
      for (let j = i + 1; j < candidates.length; j += 1) {
        const a = candidates[i];
        const b = candidates[j];

        for (const ar of makeRanges(a.from, a.to)) {
          for (const br of makeRanges(b.from, b.to)) {
            const aPoint = ar[0] === ar[1];
            const bPoint = br[0] === br[1];

            /* Wake Up is allowed exactly at a task's start/end boundary. */
            if (
              a.id === "d1" &&
              aPoint &&
              !bPoint &&
              ar[0] === br[0]
            ) {
              continue;
            }

            if (
              b.id === "d1" &&
              bPoint &&
              !aPoint &&
              br[0] === ar[0]
            ) {
              continue;
            }

            if (rangesOverlap(ar, br)) {
              const aTime = a.to == null
                ? formatMinutes(a.from)
                : `${formatMinutes(a.from)} - ${formatMinutes(a.to)}`;

              const bTime = b.to == null
                ? formatMinutes(b.from)
                : `${formatMinutes(b.from)} - ${formatMinutes(b.to)}`;

              alert(
                `Time conflict\n\n${a.title} (${aTime}) overlaps with ${b.title} (${bTime}).\n\nPlease choose another time.`
              );
              return;
            }
          }
        }
      }
    }

    setDefaultSaving(true);
    try {
      const adminData = JSON.parse(localStorage.getItem("admin") || "null");
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "save_student_defaults",
          admin_email: adminData?.email || "",
          student_id: selectedDefaultStudent.id,
          task_date: defaultTaskDate,
          defaults: studentDefaults,
          // Explicit Admin deletions must reach the backend even when the
          // deleted item is no longer present in `defaults`.
          deleted_default_ids: deletedDefaultIds,
        }),
      });

      const data = await response.json();
      if (!data.success) throw new Error(data.message || "Unable to save defaults");

      // Notify any open Student/Admin task pages immediately.
      try {
        const payload = {
          type: "TASK_DATA_CHANGED",
          email: selectedDefaultStudent.email || "",
          date: defaultTaskDate,
          at: Date.now(),
        };
        localStorage.setItem(
          "skilllab_task_data_changed",
          JSON.stringify(payload)
        );
        const channel = new BroadcastChannel("skilllab_task_sync");
        channel.postMessage(payload);
        channel.close();
      } catch (syncError) {
        console.warn("Admin task sync notification failed:", syncError);
      }

      alert(`Default tasks saved for ${selectedDefaultStudent.name || "this student"} on ${defaultTaskDate}.\nThis schedule applies to this date.`);
      setDefaultModalOpen(false);
      setSelectedDefaultStudent(null);
      setStudentDefaults([]);
      setDeletedDefaultIds([]);
      setEditingDefaultId(null);
    } catch (error) {
      console.error("Student defaults save error:", error);
      alert(error.message || "Unable to save student default tasks");
    } finally {
      setDefaultSaving(false);
    }
  };

  const closeDefaultModal = () => {
    if (defaultSaving) return;
    setDefaultModalOpen(false);
    setSelectedDefaultStudent(null);
    setStudentDefaults([]);
    setDeletedDefaultIds([]);
    setEditingDefaultId(null);
  };

  /* =========================================
     LOGOUT
  ========================================= */

  const handleLogout = () => {
    localStorage.removeItem("admin");
    localStorage.removeItem(
      "adminLoggedIn"
    );

    navigate("/admin/login", {
      replace: true,
    });
  };

  /* =========================================
     NAVIGATION
  ========================================= */
/* =========================================
   NAVIGATION
========================================= */

const goDashboard = () => {
  navigate("/AdminDashboard");

  // Close all submenus
  setStudentsOpen(false);
  setParentsMenuOpen(false);

  setMobileOpen(false);
};

const goStudents = () => {
  navigate("/admin/students");

  // Open Students only
  setStudentsOpen(true);
  setParentsMenuOpen(false);

  setMobileOpen(false);
};

const goParents = () => {
  navigate("/admin/parents");

  // Parents open
  setParentsMenuOpen(true);

  // Students close
  setStudentsOpen(false);

  setMobileOpen(false);
};
/* =========================================
   VIEW STUDENT DASHBOARD
   Pass selected student details to Dashboard.
========================================= */
const openStudentDashboard = (student) => {
  // Selected student details persist ചെയ്യുക
  sessionStorage.setItem(
    `adminViewingStudent_${student.id}`,
    JSON.stringify({
      id: student.id,
      name: student.name,
      email: student.email,
    })
  );

  navigate(
    `/admin/students/${student.id}/dashboard`,
    {
      state: {
        studentId: student.id,
        studentEmail: student.email,
        studentName: student.name,
      },
    }
  );
};
 

  /* =========================================
     HELPERS
  ========================================= */

  const getInitials = (name) => {
    if (!name) return "S";

    const parts =
      name.trim().split(/\s+/);

    if (parts.length === 1) {
      return parts[0]
        .substring(0, 2)
        .toUpperCase();
    }

    return (
      parts[0][0] +
      parts[parts.length - 1][0]
    ).toUpperCase();
  };

  const getPerformanceClass = (
    percentage
  ) => {
    const value =
      Number(percentage) || 0;

    if (value >= 60) {
      return "strong";
    }

    if (value >= 40) {
      return "good";
    }

    return "weak";
  };

  const getPerformanceLabel = (
    percentage
  ) => {
    const value =
      Number(percentage) || 0;

    if (value >= 60) {
      return "Strong";
    }

    if (value >= 40) {
      return "Average";
    }

    return "Needs Attention";
  };

  const formatDate = (date) => {
    if (!date) return "—";

    const parsed =
      new Date(date);

    if (Number.isNaN(
      parsed.getTime()
    )) {
      return date;
    }

    return parsed.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  /* =========================================
     EXTRA PERFORMANCE ANALYSIS HELPERS
  ========================================= */

  const getPerformanceGroups = (period) => {
    if (period === "today") {
      return {
        strong: dashboardData.todayStrongStudents || [],
        good: dashboardData.todayGoodStudents || [],
        weak: dashboardData.todayWeakStudents || [],
      };
    }

    if (period === "weekly") {
      return {
        strong: dashboardData.weeklyStrongStudents || [],
        good: dashboardData.weeklyGoodStudents || [],
        weak: dashboardData.weeklyWeakStudents || [],
      };
    }

    return {
      strong: dashboardData.monthlyStrongStudents || [],
      good: dashboardData.monthlyGoodStudents || [],
      weak: dashboardData.monthlyWeakStudents || [],
    };
  };

  const getPieBackground = (groups) => {
    const strong = groups.strong.length;
    const good = groups.good.length;
    const weak = groups.weak.length;
    const total = strong + good + weak;

    if (total === 0) {
      return "#eeeaf4";
    }

    const strongEnd = (strong / total) * 100;
    const goodEnd = ((strong + good) / total) * 100;

    return `conic-gradient(
      #22c55e 0% ${strongEnd}%,
      #f59e0b ${strongEnd}% ${goodEnd}%,
      #ef4444 ${goodEnd}% 100%
    )`;
  };

  /* =========================================
     SIDEBAR
  ========================================= */

  const renderSidebar = () => (
    <>
      {mobileOpen && (
        <div
          className="admin-sidebar-overlay"
          onClick={() =>
            setMobileOpen(false)
          }
        />
      )}

      <aside
        className={`admin-sidebar ${
          mobileOpen
            ? "mobile-open"
            : ""
        }`}
      >

        {/* BRAND */}

        <div className="admin-brand">

      

          <div className="admin-brand-text">

            <strong>
              SKILL LAB
            </strong>

           

          </div>

          <button
            className="mobile-sidebar-close"
            onClick={() =>
              setMobileOpen(false)
            }
          >
            <FaXmark />
          </button>

        </div>

        {/* NAVIGATION */}

        <div className="admin-sidebar-content">

          {/* DASHBOARD */}

          <div className="admin-nav-group">

            <button
              className={`admin-nav-item ${
                !isStudentsPage &&
                (location.pathname === "/admin/dashboard" ||
                  location.pathname === "/AdminDashboard")
                  ? "active"
                  : ""
              }`}
              onClick={goDashboard}
            >
              <FaGaugeHigh />

              <span>
                Dashboard
              </span>
            </button>

          </div>

          {/* STUDENTS */}

          <div className="admin-nav-group">

           <button
  className={`admin-nav-item ${
    isStudentsPage ? "active" : ""
  }`}
  onClick={() => {
    setStudentsOpen((prev) => !prev);
    setParentsMenuOpen(false);
  }}
>
  <FaUsers />

  <span>
    Students
  </span>

  <FaChevronDown
    className={`admin-nav-arrow ${
      studentsOpen ? "rotate" : ""
    }`}
  />
</button>

{studentsOpen && (
  <div className="admin-submenu">
    <button
      className={
        isStudentsPage
          ? "submenu-active"
          : ""
      }
      onClick={goStudents}
    >
      <FaUserGraduate />

      <span>
        All Students
      </span>
    </button>
  </div>
)}

          </div>

   {/* =================================================
    PARENTS
================================================= */}

<div className="admin-nav-group">

  <button
    type="button"
    className={`admin-nav-item ${
      isParentsPage ? "active" : ""
    }`}
    onClick={() => {
      // Keep Parents submenu open
      setParentsMenuOpen(true);

      // Close Students submenu
      setStudentsOpen(false);
    }}
  >

    <FaUserTie />

    <span>
      Parents
    </span>

    <FaChevronDown
      className={`admin-nav-arrow ${
        parentsOpen ? "rotate" : ""
      }`}
    />

  </button>


  {parentsOpen && (
    <div className="admin-submenu">

      <button
        type="button"
        className={
          isParentsPage
            ? "submenu-active"
            : ""
        }
        onClick={goParents}
      >

        <FaUserTie />

        <span>
          All Parents
        </span>

      </button>

    </div>
  )}

</div>



          {/* PAYMENT */}

          <div className="admin-nav-group">

            <button
              className="admin-nav-item"
            >
              <FaCreditCard />

              <span>
                Payment Gateway
              </span>
            </button>

          </div>

          

        </div>

        {/* LOGOUT */}

        <div className="admin-sidebar-bottom">

          <button
            className="admin-logout"
            onClick={handleLogout}
          >
            <FaArrowRightFromBracket />

            <span>
              Logout
            </span>
          </button>

        </div>

      </aside>
    </>
  );

  /* =========================================
     TOPBAR
  ========================================= */

  const renderTopbar = () => (
    <header className="admin-topbar">

      <div className="admin-topbar-left">

        <button
          className="mobile-menu-button"
          onClick={() =>
            setMobileOpen(true)
          }
        >
          <FaBars />
        </button>

        <div>

          <h1>
            {isStudentsPage
              ? "All Students"
              : "Admin Dashboard"}
          </h1>

          <p>
            {isStudentsPage
              ? "View and manage all  Students."
              : "Monitor today, weekly, monthly and overall student performance."}
          </p>

        </div>

      </div>

     <div className="admin-profile">
  <div className="admin-profile-info">
    <strong>
      Welcome Admin
    </strong>
  </div>

 
</div>
    </header>
  );

  /* =========================================
     STAT CARD
  ========================================= */

  const StatCard = ({
    icon,
    title,
    value,
    subtitle,
    type,
  }) => (
    <div className="admin-stat-card">

      <div
        className={`admin-stat-icon ${type}`}
      >
        {icon}
      </div>

      <div className="admin-stat-details">

        <span>
          {title}
        </span>

        <strong>
          {value}
        </strong>

        <small>
          {subtitle}
        </small>

      </div>

    </div>
  );

  /* =========================================
     DASHBOARD HOME
  ========================================= */

  const renderDashboardHome = () => (
    <>

      {/* STAT CARDS */}

      <section className="admin-stat-grid">

        <StatCard
          icon={<FaUsers />}
          title="Total Students"
          value={dashboardData.totalStudents ?? 0}
          subtitle="All registered students"
          type="purple"
        />

        <StatCard
          icon={<FaLayerGroup />}
          title="Total Tasks"
          value={dashboardData.totalTasks ?? 0}
          subtitle="Tasks this week"
          type="blue"
        />

        <StatCard
          icon={<FaMedal />}
          title="Started Students"
          value={dashboardData.startedStudents ?? 0}
          subtitle="Students who started tasks"
          type="green"
        />

        <StatCard
          icon={<FaClock />}
          title="Not Started"
          value={dashboardData.notStartedStudents ?? 0}
          subtitle="Students with no started task"
          type="red"
        />

        <StatCard
          icon={<FaTrophy />}
          title="Strong Performance"
          value={dashboardData.strongStudents ?? 0}
          subtitle="Students at 60% or above"
          type="green"
        />

       

        <StatCard
          icon={<FaChartLine />}
          title="Average Performance"
          value={Math.max(
            0,
            (dashboardData.totalStudents ?? 0) -
              (dashboardData.strongStudents ?? 0) -
              (dashboardData.weakStudents ?? 0)
          )}
          subtitle="Students between 40% and 59%"
          type="orange"
        />
 <StatCard
          icon={<FaTriangleExclamation />}
          title="Weak Performance"
          value={dashboardData.weakStudents ?? 0}
          subtitle="Students below 40% or not started"
          type="red"
        />
      </section>


      {/* TODAY / WEEK / MONTH */}

      <section className="admin-performance-grid">

        {/* TODAY */}
        <div className="admin-performance-card today-card">
          <div className="performance-card-header">
            <div className="performance-title">
              <div className="performance-icon green">
                <FaCalendarDays />
              </div>
              <div>
                <h2>Today Performance</h2>
                <p>Overall student performance</p>
              </div>
            </div>
            <strong>{dashboardData.todayPerformance ?? 0}%</strong>
          </div>

          <div className="large-progress">
            <div
              className="large-progress-fill green"
              style={{
                width: `${Math.min(
                  100,
                  Number(dashboardData.todayPerformance || 0)
                )}%`,
              }}
            />
          </div>

          <div className="performance-card-footer">
            <span>
              <FaCircleCheck />
              {dashboardData.todayCompleted ?? 0} completed
            </span>
            <span>
              {dashboardData.todayTotal ?? 0} total tasks
            </span>
          </div>
        </div>

        {/* WEEK */}
        <div className="admin-performance-card">
          <div className="performance-card-header">
            <div className="performance-title">
              <div className="performance-icon blue">
                <FaCalendarDays />
              </div>
              <div>
                <h2>Weekly Performance</h2>
                <p>Overall student performance</p>
              </div>
            </div>
            <strong>{dashboardData.weekPerformance ?? 0}%</strong>
          </div>

          <div className="large-progress">
            <div
              className="large-progress-fill blue"
              style={{
                width: `${Math.min(
                  100,
                  Number(dashboardData.weekPerformance || 0)
                )}%`,
              }}
            />
          </div>

          <div className="performance-card-footer">
            <span>
              <FaCircleCheck />
              {dashboardData.weekCompleted ?? 0} completed
            </span>
            <span>
              {dashboardData.weekTotal ?? 0} total tasks
            </span>
          </div>
        </div>

        {/* MONTH */}
        <div className="admin-performance-card">
          <div className="performance-card-header">
            <div className="performance-title">
              <div className="performance-icon purple">
                <FaCalendarDays />
              </div>
              <div>
                <h2>Monthly Performance</h2>
                <p>Overall student performance</p>
              </div>
            </div>
            <strong>{dashboardData.monthPerformance ?? 0}%</strong>
          </div>

          <div className="large-progress">
            <div
              className="large-progress-fill purple"
              style={{
                width: `${Math.min(
                  100,
                  Number(dashboardData.monthPerformance || 0)
                )}%`,
              }}
            />
          </div>

          <div className="performance-card-footer">
            <span>
              <FaCircleCheck />
              {dashboardData.monthCompleted ?? 0} completed
            </span>
            <span>
              {dashboardData.monthTotal ?? 0} total tasks
            </span>
          </div>
        </div>

      </section>


      {/* =========================================
          EXTRA STUDENT PERFORMANCE ANALYSIS
      ========================================= */}

      <section className="admin-performance-analysis">

        {/* TODAY */}
        <PerformanceAnalysisCard
          title="Today Student Performance"
          subtitle="Strong, average and weak performing students"
          period="Today"
          groups={getPerformanceGroups("today")}
          getPieBackground={getPieBackground}
          getInitials={getInitials}
          purple={false}
        />

        {/* WEEKLY */}
        <PerformanceAnalysisCard
          title="Weekly Student Performance"
          subtitle="Strong, average and weak performing students"
          period="This Week"
          groups={getPerformanceGroups("weekly")}
          getPieBackground={getPieBackground}
          getInitials={getInitials}
          purple={false}
        />

        {/* MONTHLY */}
        <PerformanceAnalysisCard
          title="Monthly Student Performance"
          subtitle="Strong, average and weak performing students"
          period="This Month"
          groups={getPerformanceGroups("monthly")}
          getPieBackground={getPieBackground}
          getInitials={getInitials}
          purple={true}
        />

      </section>


      {/* PERFORMANCE LIST */}

      <section className="admin-student-performance">

        <div className="performance-section-header">

          <div>
            <h2>
              Students Performance
            </h2>

            <p>
              Weekly performance overview - all students
            </p>
          </div>

          <button
            onClick={goStudents}
          >
            View All Students
            <FaChevronRight />
          </button>

        </div>


        {loading ? (

          <div className="admin-loading">
            <span />
            <p>
              Loading performance...
            </p>
          </div>

        ) : students.length === 0 ? (

          <div className="admin-empty">
            <FaUsers />
            <p>
              No students found.
            </p>
          </div>

        ) : (

          <div className="performance-list">

            {students
              .slice()
              .sort(
                (a, b) =>
                  Number(
                    b.weekPerformance || 0
                  ) -
                  Number(
                    a.weekPerformance || 0
                  )
              )
              .map((student) => {

                const percentage =
                  Number(
                    student.weekPerformance ||
                      0
                  );

                return (
                  <div
                    className="performance-student-row"
                    key={student.id}
                  >

                    <div className="performance-student-info">

                      <div className="small-avatar">
                        {getInitials(
                          student.name
                        )}
                      </div>

                      <div>

                        <strong>
                          {student.name}
                        </strong>

                        <span>
                          {getPerformanceLabel(
                            percentage
                          )}
                        </span>

                      </div>

                    </div>

                    <div className="performance-student-bar">

                      <div className="student-bar-track">

                        <div
                          className={`student-bar-fill ${getPerformanceClass(
                            percentage
                          )}`}
                          style={{
                            width: `${Math.min(
                              100,
                              percentage
                            )}%`,
                          }}
                        />

                      </div>

                      <strong>
                        {percentage}%
                      </strong>

                    </div>

                  </div>
                );
              })}

          </div>
        )}

      </section>

    </>
  );

  /* =========================================
     ALL STUDENTS
  ========================================= */

  const renderAllStudents = () => (
    <section className="all-students-page">

      <div className="all-students-header">

        <div>

          <h2>
            All Students
          </h2>

          

        </div>

        <button
          className="refresh-button"
          onClick={fetchAdminData}
          disabled={refreshing}
        >
          {refreshing
            ? "Refreshing..."
            : "Refresh"}
        </button>

      </div>


      {/* SEARCH */}

      <div className="students-search-box">

        <FaMagnifyingGlass />

        <input
          type="text"
          placeholder="Search student by name, email or phone..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
        />

      </div>


      {/* CARDS */}

      {loading ? (

        <div className="admin-loading students-page-loading">

          <span />

          <p>
            Loading students...
          </p>

        </div>

      ) : filteredStudents.length === 0 ? (

        <div className="admin-empty students-empty">

          <div>
            <FaUser />
          </div>

          <h3>
            No students found
          </h3>

          <p>
            Try another search.
          </p>

        </div>

      ) : (

        <div className="student-cards-grid">

          {filteredStudents.map(
            (student) => {

              const performance =
                Number(
                  student.weekPerformance ||
                    0
                );

              const status =
                student.status ||
                "active";

              return (

                <div
                  className="student-card"
                  key={student.id}
                  onClick={() =>
                    openStudentDashboard(student)
                  }
                >

                  {/* TOP */}

                  <div className="student-card-top">

                    {student.photo ? (

                      <img
                        src={student.photo}
                        alt={student.name}
                        className="student-card-photo"
                      />

                    ) : (

                      <div className="student-card-avatar">
                        {getInitials(
                          student.name
                        )}
                      </div>

                    )}

                    <div className="student-card-name">

                      <h3>
                        {student.name ||
                          "Unnamed Student"}
                      </h3>

                      <span>
                        Student ID: #
                        {student.id}
                      </span>

                    </div>

                    <FaChevronRight className="student-card-arrow" />

                  </div>


                  {/* EMAIL */}

                  <div className="student-card-contact">

                    <FaEnvelopeIcon />

                    <span>
                      {student.email ||
                        "—"}
                    </span>

                  </div>


                  {/* DETAILS */}

                  <div className="student-card-details">

                    <div>

                      <small>
                        Join Date
                      </small>

                      <strong>
                        <FaCalendarDays />
                        {formatDate(
                          student.join_date
                        )}
                      </strong>

                    </div>

                    <div>

                      <small>
                        Expiry Date
                      </small>

                      <strong>
                        <FaCalendarDays />
                        {formatDate(
                          student.expiry_date
                        )}
                      </strong>

                    </div>

                  </div>


                  {/* STATUS */}

                  <div className="student-card-status-row">

                    <span
                      className={`student-status ${status}`}
                    >
                      <span className="status-dot" />
                      {status === "expired"
                        ? "Expired"
                        : status ===
                          "expiring"
                        ? "Expiring Soon"
                        : "Active"}
                    </span>

                    <span className="student-card-performance-text">
                      {performance}%
                    </span>

                  </div>


                  {/* PERFORMANCE */}

                  <div className="student-card-progress">

                    <div className="student-card-progress-track">

                      <div
                        className={`student-card-progress-fill ${getPerformanceClass(
                          performance
                        )}`}
                        style={{
                          width: `${Math.min(
                            100,
                            performance
                          )}%`,
                        }}
                      />

                    </div>

                  </div>


                  {/* RECURRING DEFAULT TASKS */}

                <button
  type="button"
  className="student-dashboard-button"
  style={{ marginBottom: "10px" }}
  onClick={(e) => {
    e.stopPropagation();
    openDefaultTasks(student);
  }}
>
<FaTasks />
  Default Tasks
</button>

                  {/* BUTTON */}

        <button
  className="student-dashboard-button"
  onClick={(e) => {
    e.stopPropagation();

    openStudentDashboard(student);
  }}
>
  View Dashboard
  <FaArrowRight />
</button>

                </div>

              );
            }
          )}

        </div>

      )}

    </section>
  );

  return (
    <div className="admin-dashboard">

      {renderSidebar()}

      <main className="admin-main">

        {renderTopbar()}

        <div className="admin-content">

          {isStudentsPage
            ? renderAllStudents()
            : renderDashboardHome()}

        </div>

        {defaultModalOpen && (
          <div
            className="admin-default-modal-overlay"
            onClick={closeDefaultModal}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 9999,
              background: "rgba(15, 23, 42, 0.68)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "20px",
              backdropFilter: "blur(7px)",
            }}
          >
            <div
              className="admin-default-modal"
              onClick={(e) => e.stopPropagation()}
              style={{
                width: "min(680px, 100%)",
                maxHeight: "90vh",
                overflowY: "auto",
                background: "#f8fafc",
                borderRadius: "26px",
                padding: "22px",
                boxShadow: "0 24px 80px rgba(15,23,42,.30)",
              }}
            >
              {/* HEADER */}
              <div
                className="admin-default-modal-header"
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: "16px",
                  alignItems: "flex-start",
                  marginBottom: "12px",
                }}
              >
                <div>
                  <h2
                    style={{
                      margin: 0,
                      fontSize: "23px",
                      fontWeight: 800,
                      color: "#172554",
                    }}
                  >
                    Student Default Tasks
                  </h2>
                  <p
                    style={{
                      margin: "5px 0 8px",
                      color: "#64748b",
                      fontSize: "13px",
                    }}
                  >
                    {selectedDefaultStudent?.name || "Student"} — date-wise default tasks
                  </p>

<div
  className="default-date-row"
  style={{
    display: "flex",
    alignItems: "center",
    gap: "8px",
    width: "100%",
  }}
>
  <span
    style={{
      fontSize: "12px",
      fontWeight: 800,
      color: "#475569",
      flexShrink: 0,
    }}
  >
    Date
  </span>

  <input
    type="date"
    value={defaultTaskDate}
    onChange={(e) =>
      reloadStudentDefaultsForDate(e.target.value)
    }
    disabled={defaultSaving || defaultLoading}
    style={{
      border: "1px solid #cbd5e1",
      borderRadius: "10px",
      padding: "7px 9px",
      color: "#172554",
      background: "#fff",
      fontWeight: 700,
      minWidth: 0,
    }}
  />

  {/* + ADD TASK */}
<button
  type="button"
  className="default-add-task-btn"
  onClick={addStudentDefault}
  disabled={defaultLoading || defaultSaving}
  title="Add New Task"
  style={{
    marginLeft: "auto",
    flexShrink: 0,
  }}
>
  +
</button>
</div>
</div>

                <button
                  type="button"
                  onClick={closeDefaultModal}
                  disabled={defaultSaving}
                  style={{
                    width: "38px",
                    height: "38px",
                    border: 0,
                    borderRadius: "12px",
                    background: "#eef2f7",
                    color: "#0f172a",
                    cursor: "pointer",
                    fontSize: "20px",
                    flexShrink: 0,
                  }}
                >
                  ×
                </button>
              </div>

              <div
                className="admin-default-info"
                style={{
                  background: "#f4f0ff",
                  border: "1px solid #ddd6fe",
                  padding: "12px 14px",
                  borderRadius: "15px",
                  margin: "0 0 18px",
                  color: "#5b21b6",
                  fontSize: "13px",
                  lineHeight: 1.5,
                }}
              >
               
              </div>

              {defaultLoading ? (
                <div
                  style={{
                    padding: "50px 20px",
                    textAlign: "center",
                    color: "#64748b",
                  }}
                >
                  Loading default tasks...
                </div>
              ) : (
                <div style={{ display: "grid", gap: "14px" }}>
                  {studentDefaults.map((task, index) => {
                    const isWakeUp =
                      String(task.default_id) === "d1" ||
                      String(task.title || "").trim().toLowerCase() ===
                        "wake up";

                    const isSleep =
                      String(task.default_id) === "d5" ||
                      String(task.title || "").trim().toLowerCase() ===
                        "sleep";

                    const isEditing =
                      String(editingDefaultId) ===
                      String(task.default_id);

                    const fromInput = toInputTime(task.from);
                    const toInput = toInputTime(task.to);

                    const displayFrom = toDisplayTime(task.from);
                    const displayTo = toDisplayTime(task.to);

                    const overnight =
                      isSleep &&
                      (Number(task.next_day) === 1 ||
                        isOvernightDefault(task.from, task.to));

                    const cardGradient = getDefaultGradient(task, index);

                    return (
                      <div
                        key={task.default_id}
                        className="admin-default-task-card"
                        style={{
                          position: "relative",
                          overflow: "hidden",
                          borderRadius: "21px",
                          padding: "15px",
                          background: cardGradient,
                          color: "#fff",
                          boxShadow:
                            "0 12px 28px rgba(15,23,42,.12)",
                        }}
                      >
                        {/* MAIN TASK ROW */}
                        <div
                          className="admin-default-task-main"
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                          }}
                        >
                          <div
                            className="admin-default-task-icon"
                            style={{
                              width: "52px",
                              height: "52px",
                              borderRadius: "16px",
                              background: "rgba(255,255,255,.24)",
                              border: "1px solid rgba(255,255,255,.25)",
                              display: "grid",
                              placeItems: "center",
                              fontSize: "23px",
                              flexShrink: 0,
                              backdropFilter: "blur(8px)",
                            }}
                          >
                            {getDefaultIcon(task)}
                          </div>

                          <div className="admin-default-task-content" style={{ minWidth: 0, flex: 1 }}>
                            {isEditing && !isWakeUp && !isSleep ? (
                              <input
                                data-default-edit={task.default_id}
                                value={task.title || ""}
                                onChange={(e) =>
                                  updateStudentDefault(
                                    task.default_id,
                                    "title",
                                    e.target.value
                                  )
                                }
                                style={{
                                  width: "100%",
                                  boxSizing: "border-box",
                                  border: "1px solid rgba(255,255,255,.55)",
                                  borderRadius: "10px",
                                  padding: "8px 10px",
                                  background: "rgba(255,255,255,.16)",
                                  color: "#fff",
                                  fontSize: "18px",
                                  fontWeight: 800,
                                  outline: "none",
                                }}
                              />
                            ) : (
                              <div
                                style={{
                                  fontSize: "18px",
                                  fontWeight: 800,
                                  whiteSpace: "nowrap",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                }}
                              >
                                {task.title || "Task"}
                              </div>
                            )}

                            {!isEditing && (
                              <div
                                style={{
                                  marginTop: "5px",
                                  fontSize: "13px",
                                  fontWeight: 600,
                                  opacity: 0.92,
                                }}
                              >
                                {isWakeUp
                                  ? displayFrom || "Set wake-up time"
                                  : `${displayFrom || "--:--"}${
                                      displayTo
                                        ? ` - ${displayTo}`
                                        : ""
                                    }`}
                              </div>
                            )}

                            {isSleep && overnight && !isEditing && (
                              <div
                                style={{
                                  marginTop: "4px",
                                  fontSize: "11px",
                                  fontWeight: 700,
                                  opacity: 0.88,
                                }}
                              >
                                Next day • Wake Up{" "}
                                {displayTo || "—"}
                              </div>
                            )}
                          </div>

                          <div
                            className="admin-default-task-actions"
                            style={{
                              display: "flex",
                              gap: "7px",
                              flexShrink: 0,
                            }}
                          >
                            <button
                              type="button"
                              title={isEditing ? "Done editing" : "Edit task"}
                              onClick={() =>
                                setEditingDefaultId(
                                  isEditing ? null : task.default_id
                                )
                              }
                              style={{
                                width: "40px",
                                height: "40px",
                                borderRadius: "12px",
                                border:
                                  "1px solid rgba(255,255,255,.48)",
                                background: "rgba(255,255,255,.16)",
                                color: "#fff",
                                cursor: "pointer",
                                display: "grid",
                                placeItems: "center",
                                fontSize: "17px",
                              }}
                            >
                              <FaPen />
                            </button>

                            <button
                              type="button"
                              title={
                                isWakeUp || isSleep
                                  ? "Permanent task"
                                  : "Delete task"
                              }
                              onClick={() =>
                                deleteStudentDefault(task.default_id)
                              }
                              style={{
                                width: "40px",
                                height: "40px",
                                borderRadius: "12px",
                                border:
                                  "1px solid rgba(255,255,255,.48)",
                                background:
                                  isWakeUp || isSleep
                                    ? "rgba(255,255,255,.10)"
                                    : "rgba(255,255,255,.16)",
                                color: "#fff",
                                cursor:
                                  isWakeUp || isSleep
                                    ? "not-allowed"
                                    : "pointer",
                                display: "grid",
                                placeItems: "center",
                                fontSize: "17px",
                                opacity:
                                  isWakeUp || isSleep ? 0.55 : 1,
                              }}
                            >
                              <FaTrashCan />
                            </button>
                          </div>
                        </div>

                        {/* TIME EDITOR — SAME SIMPLE TIME MODEL AS STUDENT TASKS */}
                        {isEditing && (
                          <div
                            className="admin-default-task-editor"
                            style={{
                              marginTop: "13px",
                              paddingTop: "13px",
                              borderTop:
                                "1px solid rgba(255,255,255,.24)",
                              display: "grid",
                              gridTemplateColumns: isWakeUp
                                ? "1fr"
                                : "1fr 1fr",
                              gap: "10px",
                            }}
                          >
                            <label
                              style={{
                                display: "grid",
                                gap: "6px",
                              }}
                            >
                              <span
                                style={{
                                  fontSize: "11px",
                                  fontWeight: 800,
                                  opacity: 0.88,
                                }}
                              >
                                {isWakeUp ? "Wake Up Time" : "From Time"}
                              </span>

                              <input
                                type="time"
                                step="60"
                                min="00:00"
                                max="23:59"
                                value={fromInput}
                                onChange={(e) => {
                                  updateStudentDefault(
                                    task.default_id,
                                    "from",
                                    inputToDisplayTime(e.target.value)
                                  );
                                }}
                                style={{
                                  width: "100%",
                                  boxSizing: "border-box",
                                  minHeight: "42px",
                                  padding: "8px 10px",
                                  border:
                                    "1px solid rgba(255,255,255,.55)",
                                  borderRadius: "11px",
                                  background: "rgba(255,255,255,.95)",
                                  color: "#172554",
                                  fontSize: "14px",
                                  fontWeight: 700,
                                  outline: "none",
                                }}
                              />
                            </label>

                            {!isWakeUp && (
                              <label
                                style={{
                                  display: "grid",
                                  gap: "6px",
                                }}
                              >
                                <span
                                  style={{
                                    fontSize: "11px",
                                    fontWeight: 800,
                                    opacity: 0.88,
                                  }}
                                >
                                  To Time
                                  {isSleep && overnight
                                    ? " • Next Day"
                                    : ""}
                                </span>

                                <input
                                  type="time"
                                  step="60"
                                  min="00:00"
                                  max="23:59"
                                  value={toInput}
                                  onChange={(e) =>
                                    updateStudentDefault(
                                      task.default_id,
                                      "to",
                                      e.target.value
                                        ? inputToDisplayTime(
                                            e.target.value
                                          )
                                        : ""
                                    )
                                  }
                                  style={{
                                    width: "100%",
                                    boxSizing: "border-box",
                                    minHeight: "42px",
                                    padding: "8px 10px",
                                    border:
                                      "1px solid rgba(255,255,255,.55)",
                                    borderRadius: "11px",
                                    background: "rgba(255,255,255,.95)",
                                    color: "#172554",
                                    fontSize: "14px",
                                    fontWeight: 700,
                                    outline: "none",
                                  }}
                                />
                              </label>
                            )}

                            {isSleep && (
                              <div
                                style={{
                                  gridColumn: "1 / -1",
                                  fontSize: "11px",
                                  fontWeight: 700,
                                  opacity: 0.9,
                                }}
                              >
                                Sleep end time is used as the next day's
                                Wake Up time.
                              </div>
                            )}

                            {isWakeUp && (
                              <div
                                style={{
                                  gridColumn: "1 / -1",
                                  fontSize: "11px",
                                  fontWeight: 700,
                                  opacity: 0.9,
                                }}
                              >
                                Wake Up uses one time only — there is no
                                To Time.
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* FOOTER */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "10px",
                  marginTop: "18px",
                  flexWrap: "wrap",
                }}
              >
           
                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: "9px",
                  }}
                >
                  <button
                    type="button"
                    onClick={closeDefaultModal}
                    disabled={defaultSaving}
                    style={{
                      padding: "11px 17px",
                      borderRadius: "12px",
                      border: "1px solid #cbd5e1",
                      background: "#fff",
                      color: "#334155",
                      cursor: "pointer",
                      fontWeight: 700,
                    }}
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={saveStudentDefaults}
                    disabled={defaultLoading || defaultSaving}
                    style={{
                      padding: "11px 19px",
                      borderRadius: "12px",
                      border: 0,
                      background:
                        "linear-gradient(135deg, #6d5dfc, #8f7cff)",
                      color: "#fff",
                      fontWeight: 800,
                      cursor: "pointer",
                      boxShadow: "0 8px 18px rgba(109,93,252,.25)",
                    }}
                  >
                    {defaultSaving
                      ? "Saving..."
                      : "Save Default Tasks"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}


      </main>

    </div>
  );
}


/* =========================================
   SMALL ICON HELPER
========================================= */

function FaEnvelopeIcon() {
  return (
    <span className="email-icon">
      @
    </span>
  );
}

/* =========================================
   EXTRA PERFORMANCE ANALYSIS CARD
========================================= */

function PerformanceAnalysisCard({
  title,
  subtitle,
  period,
  groups,
  getPieBackground,
  getInitials,
  purple,
}) {

  const allStudents = [
    ...groups.strong.map((student) => ({
      ...student,
      category: "Strong",
    })),
    ...groups.good.map((student) => ({
      ...student,
      category: "Average",
    })),
    ...groups.weak.map((student) => ({
      ...student,
      category: "Weak",
    })),
  ].sort(
    (a, b) =>
      Number(b.performance || 0) -
      Number(a.performance || 0)
  );

  const total = allStudents.length;

  return (
    <div className="analysis-card">

      <div className="analysis-card-header">

        <div>
          <h2>{title}</h2>
          <p>{subtitle}</p>
        </div>

        <span
          className={`analysis-period ${
            purple ? "purple" : ""
          }`}
        >
          {period}
        </span>

      </div>

      <div className="analysis-content">

        <div className="analysis-chart-area">

          <div
            className="student-performance-pie"
            style={{
              background: getPieBackground(groups),
            }}
          >
            <div className="pie-inner">
              <strong>{total}</strong>
              <span>Students</span>
            </div>
          </div>

          <div className="analysis-legend">

            <div>
              <span className="legend-dot strong" />
              <span>Strong</span>
              <strong>{groups.strong.length}</strong>
            </div>

            <div>
              <span className="legend-dot good" />
              <span>Average</span>
              <strong>{groups.good.length}</strong>
            </div>

            <div>
              <span className="legend-dot weak" />
              <span>Weak</span>
              <strong>{groups.weak.length}</strong>
            </div>

          </div>

        </div>

        <div className="analysis-students">

          <div className="analysis-list-title">
            {period === "Today"
              ? "Today Students"
              : period === "This Week"
              ? "Weekly Students"
              : "Monthly Students"}
          </div>

          {allStudents.map((student) => (

            <div
              className="analysis-student-row"
              key={`${period}-${student.id}`}
            >
<div className="analysis-student-left">

  <div>
    <strong>{student.name}</strong>

    <span
      className={`analysis-category ${
        student.category.toLowerCase()
      }`}
    >
      {student.category}
    </span>
  </div>


              </div>

              <strong className="analysis-student-percentage">
                {student.performance}%
              </strong>

            </div>

          ))}

          {total === 0 && (
            <div className="analysis-no-data">
              No {period === "Today"
                ? "today"
                : period === "This Week"
                ? "weekly"
                : "monthly"} task data available
            </div>
          )}

        </div>

      </div>

    </div>
  );
}

export default AdminDashboard;