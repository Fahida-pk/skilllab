import Sidebar from "../dasboard/Sidebar.jsx";
import { useState, useEffect, useMemo, useRef } from "react";
import {
  FaMoon,
  FaChevronLeft,
  FaChevronRight,
  FaSun,
  FaBook,
  FaLanguage,
  FaDumbbell,
  FaCheck,
  FaCoffee,
  FaUtensils,
  FaLaptop,
  FaBriefcase,
  FaHome,
  FaRunning,
  FaMusic,
  FaPen,
  FaHeart,
  FaShoppingCart,
  FaCar,
  FaPlane,
  FaCalendarAlt,
  FaCode,
  FaGamepad,
  FaFilm,
  FaBicycle,
  FaWater,
  FaAppleAlt
} from "react-icons/fa";
import "./task.css";

const API_URL = "https://zyntaweb.com/skilllab/api/task.php";

function Task() {
  const [date, setDate] = useState(new Date());
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState("");
  const [fromTime, setFromTime] = useState("");
  const [toTime, setToTime] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [removeImage, setRemoveImage] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [tasks, setTasks] = useState([]);
  // Prevent multiple Save/Add clicks from creating duplicate database rows.
  const saveInProgressRef = useRef(false);
const [deleteConfirm, setDeleteConfirm] = useState(null);
  const getDateKey = (d) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const currentKey = getDateKey(date);

  // =========================================================
  // DATE PERMISSIONS
  // Previous day  -> Add/Edit/Delete/Tick disabled
  // Today         -> Add/Edit/Delete/Tick enabled
  // Future day    -> Add/Edit/Delete enabled, Tick disabled
  // =========================================================
  const todayKey = getDateKey(new Date());
  const isPreviousDay = currentKey < todayKey;
  const isToday = currentKey === todayKey;
  const isFutureDay = currentKey > todayKey;

  const getIcon = (icon, title = "") => {

  const key = String(
    icon || title || ""
  ).toLowerCase().trim();

  /* Explicit icon */
  switch (key) {

    case "sun":
      return <FaSun />;

    case "book":
    case "study":
      return <FaBook />;

    case "language":
    case "english":
      return <FaLanguage />;

    case "dumbbell":
    case "workout":
    case "gym":
      return <FaDumbbell />;

    case "moon":
    case "sleep":
      return <FaMoon />;

    case "coffee":
    case "breakfast":
      return <FaCoffee />;

    case "food":
    case "lunch":
    case "dinner":
      return <FaUtensils />;

    case "laptop":
    case "computer":
    case "coding":
    case "code":
    case "mern":
      return <FaLaptop />;

    case "work":
    case "office":
      return <FaBriefcase />;

    case "home":
      return <FaHome />;

    case "running":
    case "run":
      return <FaRunning />;

    case "music":
      return <FaMusic />;

    case "write":
    case "writing":
      return <FaPen />;

    case "health":
    case "love":
      return <FaHeart />;

    case "shopping":
      return <FaShoppingCart />;

    case "travel":
    case "trip":
      return <FaPlane />;

    case "car":
    case "drive":
      return <FaCar />;

    case "calendar":
    case "meeting":
      return <FaCalendarAlt />;

    case "game":
    case "gaming":
      return <FaGamepad />;

    case "movie":
    case "film":
      return <FaFilm />;

    case "cycling":
    case "bicycle":
      return <FaBicycle />;

    case "water":
      return <FaWater />;

    case "fruit":
    case "apple":
      return <FaAppleAlt />;

    default:
      break;
  }

  /* Automatic icon based on task title */
  const text = String(title).toLowerCase();

  if (
    text.includes("wake") ||
    text.includes("morning")
  ) {
    return <FaSun />;
  }

  if (
    text.includes("study") ||
    text.includes("learn") ||
    text.includes("read")
  ) {
    return <FaBook />;
  }

  if (
    text.includes("english") ||
    text.includes("language")
  ) {
    return <FaLanguage />;
  }

  if (
    text.includes("workout") ||
    text.includes("gym") ||
    text.includes("exercise") ||
    text.includes("fitness")
  ) {
    return <FaDumbbell />;
  }

  if (
    text.includes("sleep") ||
    text.includes("rest")
  ) {
    return <FaMoon />;
  }

  if (
    text.includes("coffee") ||
    text.includes("breakfast")
  ) {
    return <FaCoffee />;
  }

  if (
    text.includes("lunch") ||
    text.includes("dinner") ||
    text.includes("food") ||
    text.includes("eat")
  ) {
    return <FaUtensils />;
  }

  if (
    text.includes("code") ||
    text.includes("coding") ||
    text.includes("mern") ||
    text.includes("program")
  ) {
    return <FaLaptop />;
  }

  if (
    text.includes("work") ||
    text.includes("office") ||
    text.includes("job")
  ) {
    return <FaBriefcase />;
  }

  if (
    text.includes("home") ||
    text.includes("house")
  ) {
    return <FaHome />;
  }

  if (
    text.includes("run") ||
    text.includes("running")
  ) {
    return <FaRunning />;
  }

  if (
    text.includes("music") ||
    text.includes("song")
  ) {
    return <FaMusic />;
  }

  if (
    text.includes("write") ||
    text.includes("writing")
  ) {
    return <FaPen />;
  }

  if (
    text.includes("shopping") ||
    text.includes("buy")
  ) {
    return <FaShoppingCart />;
  }

  if (
    text.includes("travel") ||
    text.includes("trip")
  ) {
    return <FaPlane />;
  }

  if (
    text.includes("movie") ||
    text.includes("film")
  ) {
    return <FaFilm />;
  }

  if (
    text.includes("game") ||
    text.includes("gaming")
  ) {
    return <FaGamepad />;
  }

  if (
    text.includes("cycle") ||
    text.includes("bicycle")
  ) {
    return <FaBicycle />;
  }

  if (
    text.includes("water") ||
    text.includes("drink")
  ) {
    return <FaWater />;
  }

  if (
    text.includes("health") ||
    text.includes("love")
  ) {
    return <FaHeart />;
  }

  /* Final fallback - variety icon for unmatched task names */
  const varietyIcons = [
    <FaCalendarAlt />,
    <FaCode />,
    <FaGamepad />,
    <FaFilm />,
    <FaBicycle />,
    <FaWater />,
    <FaAppleAlt />,
    <FaCoffee />,
    <FaPen />,
    <FaHeart />,
    <FaCar />,
    <FaPlane />,
  ];

  const hash = Array.from(text).reduce(
    (sum, char) => sum + char.charCodeAt(0),
    0
  );

  return varietyIcons[hash % varietyIcons.length];
};

  // =========================================================
  // DEFAULT TASKS
  // Default tasks are definitions, so they must be available
  // on every date. Deleting a default task is DATE-WISE only.
  // =========================================================

  const DEFAULT_TASKS = [
    {
      id: "d1",
      title: "Wake Up",
      time: "5:00 AM",
      icon: "sun",
      color: "linear-gradient(135deg, #f6d365, #fda085)",
      completed: false,
    },
    {
      id: "d2",
      title: "Study MERN",
      from: "5:00 AM",
      to: "10:00 AM",
      icon: "book",
      color: "linear-gradient(135deg, #a18cd1, #fbc2eb)",
      completed: false,
    },
    {
      id: "d3",
      title: "Practice English",
      from: "1:00 PM",
      to: "4:00 PM",
      icon: "language",
      color: "linear-gradient(135deg, #84fab0, #8fd3f4)",
      completed: false,
    },
    {
      id: "d4",
      title: "Workout",
      from: "6:00 PM",
      to: "7:00 PM",
      icon: "dumbbell",
      color: "linear-gradient(135deg, #fccb90, #d57eeb)",
      completed: false,
    },
    {
      id: "d5",
      title: "Sleep",
      from: "10:00 PM",
      to: "5:00 AM",
      icon: "moon",
      color: "linear-gradient(135deg, #141e30, #243b55)",
      completed: false,
      nextDay: true,
    },
  ];

  const [defaultTasks, setDefaultTasks] = useState(() => {
    try {
      const saved = localStorage.getItem("defaultTasks");
      const parsed = saved ? JSON.parse(saved) : [];

      // Restore missing built-in defaults (for example, defaults
      // deleted by the previous global-delete version).
      const savedById = new Map(
        Array.isArray(parsed) ? parsed.map((task) => [String(task.id), task]) : []
      );

      return DEFAULT_TASKS.map((baseTask) => ({
        ...baseTask,
        ...(savedById.get(String(baseTask.id)) || {}),
        completed: false,
      }));
    } catch (error) {
      console.error("Default task parse error:", error);
      return DEFAULT_TASKS;
    }
  });

  // Date-wise deleted default tasks. Deleting on one date does NOT
  // remove the default definition from other dates.
  const getDeletedDefaultKey = (dateKey) =>
    `deletedDefaultTasks_${dateKey}`;

  const [deletedDefaultIds, setDeletedDefaultIds] = useState(() => {
    try {
      const saved = localStorage.getItem(
        `deletedDefaultTasks_${getDateKey(new Date())}`
      );
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      const saved = localStorage.getItem(getDeletedDefaultKey(currentKey));
      setDeletedDefaultIds(saved ? JSON.parse(saved) : []);
    } catch (error) {
      console.error("Deleted default task data error:", error);
      setDeletedDefaultIds([]);
    }
  }, [currentKey]);

  const getDefaultCompletionKey = (dateKey) =>
    `defaultTaskCompleted_${dateKey}`;

  // =========================================================
  // DATE-WISE DEFAULT TASK SCHEDULES
  // =========================================================
  // Default task definitions are shared across all dates, but
  // their edited times are stored per date.
  //
  // Sleep on Sep 1: 9:00 PM -> 2:00 AM (Next Day)
  // automatically makes Sep 2 Wake Up: 2:00 AM.
  // Editing Sep 2 Sleep will NOT change Sep 1 Wake Up.
  // =========================================================

  const getDefaultScheduleKey = (dateKey) =>
    `defaultTaskSchedule_${dateKey}`;

  const getDateDefaultSchedules = (dateKey) => {
    try {
      const saved = localStorage.getItem(getDefaultScheduleKey(dateKey));
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  };

  const getDateDefaultTasks = (dateKey) => {
    const schedules = getDateDefaultSchedules(dateKey);

    // Wake Up is the first task of the selected day.
    // When the previous day's Sleep crosses midnight, the Sleep TO time
    // becomes the selected day's Wake Up time. This takes priority over
    // any old/manual Wake Up value saved for the selected date.
    const selectedDate = new Date(`${dateKey}T00:00:00`);
    const previousDate = new Date(selectedDate);
    previousDate.setDate(previousDate.getDate() - 1);

    const previousDateKey = getDateKey(previousDate);
    const previousSchedules = getDateDefaultSchedules(previousDateKey);
    const previousSleep = previousSchedules["d5"];

    let inheritedWakeUp = "";

    if (
      previousSleep &&
      previousSleep.from &&
      previousSleep.to &&
      isNextDay(previousSleep.from, previousSleep.to)
    ) {
      inheritedWakeUp = previousSleep.to;
    }

    return defaultTasks.map((task) => {
      const savedSchedule = schedules[String(task.id)] || {};

      if (String(task.id) === "d1" && inheritedWakeUp) {
        return {
          ...task,
          ...savedSchedule,
          title: "Wake Up",
          time: inheritedWakeUp,
          from: undefined,
          to: undefined,
          nextDay: false,
          completed: false,
        };
      }

      return {
        ...task,
        ...savedSchedule,
        completed: false,
      };
    });
  };

  const saveDateDefaultSchedule = (dateKey, taskId, values) => {
    const key = getDefaultScheduleKey(dateKey);
    const current = getDateDefaultSchedules(dateKey);

    const updated = {
      ...current,
      [String(taskId)]: {
        ...(current[String(taskId)] || {}),
        ...values,
      },
    };

    localStorage.setItem(key, JSON.stringify(updated));
    return updated;
  };

  const [defaultCompleted, setDefaultCompleted] = useState({});

  // DATE-WISE percentage for built-in/default tasks.
  // Custom/database tasks store percentage in the tasks table.
  const getDefaultPercentageKey = (dateKey) =>
    `defaultTaskPercentage_${dateKey}`;

  const [defaultPercentages, setDefaultPercentages] = useState({});

  useEffect(() => {
    const storageKey = getDefaultPercentageKey(currentKey);
    const saved = localStorage.getItem(storageKey);

    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setDefaultPercentages(
          parsed && typeof parsed === "object" ? parsed : {}
        );
      } catch (error) {
        console.error("Percentage data error:", error);
        setDefaultPercentages({});
      }
    } else {
      setDefaultPercentages({});
    }
  }, [currentKey]);

  useEffect(() => {
    const storageKey = getDefaultCompletionKey(currentKey);
    const saved = localStorage.getItem(storageKey);

    if (saved) {
      try {
        setDefaultCompleted(JSON.parse(saved));
      } catch (error) {
        console.error("Completion data error:", error);
        setDefaultCompleted({});
      }
    } else {
      setDefaultCompleted({});
    }
  }, [currentKey]);

  useEffect(() => {
    const cleanTasks = defaultTasks.map((task) => ({
      ...task,
      completed: false,
    }));
    localStorage.setItem("defaultTasks", JSON.stringify(cleanTasks));
  }, [defaultTasks]);

  // Make sure the built-in tasks (Wake Up, Study MERN, etc.) are also
  // stored in the database for the selected calendar date.
  const ensureDefaultTasksInDatabase = async () => {
    if (!user?.email) return;

    try {
      const deletedRaw = localStorage.getItem(getDeletedDefaultKey(currentKey));
      const deletedIds = deletedRaw ? JSON.parse(deletedRaw) : [];

      const dateDefaults = getDateDefaultTasks(currentKey)
        .filter((task) => !deletedIds.includes(String(task.id)))
        .map((task) => ({
          default_id: String(task.id),
          title: task.title,
          from: task.from || task.time || "",
          to: task.to || "",
        }));

      if (!dateDefaults.length) return;

      await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "ensure_defaults",
          email: user.email,
          task_date: currentKey,
          tasks: dateDefaults,
        }),
      });
    } catch (error) {
      console.error("Default task database sync error:", error);
    }
  };

  const fetchTasks = async () => {
    try {
      await ensureDefaultTasksInDatabase();

      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "get",
          email: user?.email,
          task_date: currentKey,
        }),
      });

      const data = await res.json();

      const colors = [
        "linear-gradient(135deg, #43e97b, #38f9d7)",
        "linear-gradient(135deg, #fa709a, #fee140)",
        "linear-gradient(135deg, #30cfd0, #330867)",
        "linear-gradient(135deg, #f093fb, #f5576c)",
      ];

      if (data.success) {
        const deletedRaw = localStorage.getItem(getDeletedDefaultKey(currentKey));
        const deletedIds = deletedRaw ? JSON.parse(deletedRaw) : [];
        const deletedDefaultTitles = getDateDefaultTasks(currentKey)
          .filter((task) => deletedIds.includes(String(task.id)))
          .map((task) => String(task.title).trim().toLowerCase());

        const formatted = data.tasks
          .filter((t) => !deletedDefaultTitles.includes(String(t.title).trim().toLowerCase()))
          .map((t, index) => ({
          id: t.id,
          title: t.title,
          from: t.from,
          to: t.to,
          completed:
            t.completed === true ||
            t.completed === 1 ||
            t.completed === "1",
          // A task that is not completed must always start/display at 0%
          // after refresh or when another date is opened.
          // Its saved percentage is used only after the task is ticked.
          percentage:
            t.completed === true ||
            t.completed === 1 ||
            t.completed === "1"
              ? Math.max(0, Math.min(100, Number(t.percentage ?? 0)))
              : 0,
          color: t.color || colors[index % colors.length],
          icon: t.icon || null,
          iconImage: t.icon_image || t.iconImage || null,
          default_id: t.default_id || t.defaultId || null,
          nextDay: isNextDay(t.from, t.to),
        }));

        // Apply date-wise schedule to built-in rows and prevent duplicate
        // built-in rows from ever being shown after an edit.
        const dateSchedules = getDateDefaultSchedules(currentKey);
        const seenBuiltIns = new Set();
        const normalized = formatted
          .map((task) => {
            const builtInId = getBuiltInDefaultId(task);
            if (!builtInId) return task;

            const schedule = dateSchedules[String(builtInId)];
            if (!schedule) return task;

            return {
              ...task,
              title: schedule.title || task.title,
              from: schedule.from || (builtInId === "d1" ? undefined : task.from),
              time: schedule.time || (builtInId === "d1" ? task.from : undefined),
              to: schedule.to || (builtInId === "d1" ? undefined : task.to),
              nextDay: Boolean(schedule.nextDay),
            };
          })
          .filter((task) => {
            const builtInId = getBuiltInDefaultId(task);
            if (!builtInId) return true;
            if (seenBuiltIns.has(builtInId)) return false;
            seenBuiltIns.add(builtInId);
            return true;
          });

        setTasks(normalized);
      } else {
        setTasks([]);
      }
    } catch (error) {
      console.error("Fetch tasks error:", error);
      setTasks([]);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [currentKey]);

  const isNextDay = (from, to) => {
    if (!from || !to) return false;

    try {
      const f = new Date(`2024-01-01 ${from}`);
      const t = new Date(`2024-01-01 ${to}`);
      return t <= f;
    } catch {
      return false;
    }
  };

  const formatTime = (t) => {
    if (!t) return "";

    try {
      const [hour, minute] = t.split(":");
      let h = parseInt(hour, 10);
      const ampm = h >= 12 ? "PM" : "AM";

      h = h % 12;
      if (h === 0) h = 12;

      return `${h}:${minute} ${ampm}`;
    } catch {
      return "";
    }
  };

  const convertToInputTime = (timeStr) => {
    if (!timeStr) return "";

    try {
      const [time, modifier] = timeStr.split(" ");
      let [hours, minutes] = time.split(":");

      hours = parseInt(hours, 10);

      if (modifier === "PM" && hours !== 12) hours += 12;
      if (modifier === "AM" && hours === 12) hours = 0;

      return `${hours.toString().padStart(2, "0")}:${minutes}`;
    } catch {
      return "";
    }
  };

  const changeDate = (type) => {
    const newDate = new Date(date);
    newDate.setDate(date.getDate() + (type === "prev" ? -1 : 1));
    setDate(newDate);
  };

  const resetModal = () => {
    setShowModal(false);
    setEditTask(null);
    setTitle("");
    setFromTime("");
    setToTime("");
    setImage(null);
    setImagePreview("");
    setRemoveImage(false);
  };

  const notifyTaskUpdated = () => {
    window.dispatchEvent(new Event("taskUpdated"));
  };

  const getBuiltInDefaultId = (task) => {
    // 1) The database default_id is the strongest identity.
    //    It must remain valid even after the user renames a default task
    //    (for example: "Study MERN" -> "Study maths").
    const explicitId = task?.default_id || task?.defaultId;
    if (explicitId) return String(explicitId);

    // 2) Original built-in titles for older database rows.
    const titleKey = String(task?.title || "").trim().toLowerCase();
    const defaultIdMap = {
      "wake up": "d1",
      "study mern": "d2",
      "practice english": "d3",
      "workout": "d4",
      "sleep": "d5",
    };

    if (defaultIdMap[titleKey]) {
      return defaultIdMap[titleKey];
    }

    // 3) IMPORTANT:
    //    After editing a default task's title, the title is no longer
    //    "Study MERN"/"Practice English"/"Workout". In that case identify
    //    the row from this date's saved default schedule.
    //
    //    This makes renamed default tasks still behave as DEFAULT tasks:
    //      - Edit updates the same row
    //      - Delete creates a date-wise deleted marker
    //      - ensure_defaults will not recreate it on that date
    const schedules = getDateDefaultSchedules(currentKey);

    for (const defaultId of ["d1", "d2", "d3", "d4", "d5"]) {
      const schedule = schedules[String(defaultId)];
      if (!schedule) continue;

      const scheduleTitle = String(schedule.title || "").trim().toLowerCase();
      if (scheduleTitle && scheduleTitle === titleKey) {
        return defaultId;
      }
    }

    return null;
  };

  const isBuiltInTask = (task) => Boolean(getBuiltInDefaultId(task));

  const deleteTask = async (task) => {

    if (isPreviousDay) {
      alert("Previous day tasks cannot be deleted.");
      return;
    }

    const defaultId = getBuiltInDefaultId(task);

    // Built-in/default tasks are deleted only for the selected date.
    // Keep their default definition intact for other dates.
    if (defaultId) {
      try {
        const deletedKey = getDeletedDefaultKey(currentKey);
        const saved = localStorage.getItem(deletedKey);
        const deletedIds = saved ? JSON.parse(saved) : [];
        const nextDeletedIds = Array.from(
          new Set([...deletedIds.map(String), String(defaultId)])
        );

        localStorage.setItem(deletedKey, JSON.stringify(nextDeletedIds));
        setDeletedDefaultIds(nextDeletedIds);

        // Remove the visible row immediately. The date-wise deleted marker
        // prevents ensure_defaults from putting it back on this date.
        setTasks((prev) => prev.filter((t) => String(t.id) !== String(task.id)));

        // Delete the matching database row as well, if it exists.
        if (task.id != null) {
          try {
            await fetch(API_URL, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                action: "delete",
                email: user?.email,
                id: task.id,
              }),
            });
          } catch (dbError) {
            console.error("Built-in task database delete error:", dbError);
          }
        }

        await fetchTasks();
        notifyTaskUpdated();
        return;
      } catch (error) {
        console.error("Default task delete error:", error);
        alert("Unable to delete task");
        return;
      }
    }

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "delete",
          email: user?.email,
          id: task.id,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        alert(data.message || "Task delete failed");
        return;
      }

      await fetchTasks();
      notifyTaskUpdated();
    } catch (error) {
      console.error("Delete error:", error);
      alert("Unable to delete task");
    }
  };

  const toggleTask = async (task) => {

    if (!isToday) {
      alert(
        isPreviousDay
          ? "Previous day tasks cannot be changed."
          : "Future day tasks cannot be completed yet."
      );
      return;
    }

    // A task cannot be marked complete while its performance percentage
    // is still 0%. The user must set the slider first.
    const currentPercentage = Math.max(
      0,
      Math.min(100, Number(task.percentage ?? 0))
    );

    if (!task.completed && currentPercentage <= 0) {
      alert("Please set the task performance percentage before marking it as completed.");
      return;
    }

    const newStatus = task.completed ? 0 : 1;

    // When a completed task is unticked, its percentage is reset to 0.
    // This keeps performance based only on currently completed tasks.
    const nextPercentage = newStatus === 0 ? 0 : currentPercentage;

    // Update UI immediately.
    setTasks((prev) =>
      prev.map((t) =>
        t.id === task.id
          ? {
              ...t,
              completed: newStatus === 1,
              percentage: nextPercentage,
            }
          : t
      )
    );

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "toggle",
          email: user?.email,
          id: task.id,
          status: newStatus,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        // Revert if API fails
        setTasks((prev) =>
          prev.map((t) =>
            t.id === task.id
              ? { ...t, completed: task.completed, percentage: task.percentage ?? 0 }
              : t
          )
        );
        alert(data.message || "Could not update task");
        return;
      }

      // If the task was unticked, also persist percentage = 0 so that
      // refresh/date navigation cannot bring the old percentage back.
      if (newStatus === 0) {
        try {
          const percentageRes = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "percentage",
              email: user?.email,
              id: task.id,
              percentage: 0,
            }),
          });

          const percentageData = await percentageRes.json();
          if (!percentageData.success) {
            console.warn("Could not reset task percentage to 0");
          }
        } catch (percentageError) {
          console.error("Percentage reset error:", percentageError);
        }
      }

      notifyTaskUpdated();
    } catch (error) {
      console.error("Toggle error:", error);

      setTasks((prev) =>
        prev.map((t) =>
          t.id === task.id
            ? { ...t, completed: task.completed, percentage: task.percentage ?? 0 }
            : t
        )
      );

      alert("Unable to mark task complete");
    }
  };

  const handlePercentageChange = (task, value) => {
    const percentage = Math.max(0, Math.min(100, Number(value)));

    setTasks((prev) =>
      prev.map((t) =>
        String(t.id) === String(task.id) ? { ...t, percentage } : t
      )
    );
  };

  const saveTaskPercentage = async (task, value) => {
    const percentage = Math.max(0, Math.min(100, Number(value)));

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "percentage",
          email: user?.email,
          id: task.id,
          percentage,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        alert(data.message || "Could not save percentage");
        await fetchTasks();
        return;
      }

      notifyTaskUpdated();
    } catch (error) {
      console.error("Percentage save error:", error);
      alert("Unable to save percentage");
      await fetchTasks();
    }
  };

  const handleEdit = (task) => {

    if (isPreviousDay) {
      alert("Previous day tasks cannot be edited.");
      return;
    }

    setShowModal(true);
    setEditTask(task);
    setTitle(task.title);
    setFromTime(convertToInputTime(task.from || task.time));
    setToTime(convertToInputTime(task.to));
    setImage(null);
    setRemoveImage(false);
    setImagePreview(task.iconImage || "");
  };

  const toMin = (time) => {
    if (!time) return 0;

    try {
      const parts = time.split(" ");
      const timePart = parts[0];
      const modifier = parts[1];

      let [h, m] = timePart.split(":").map(Number);

      if (modifier === "PM" && h !== 12) h += 12;
      if (modifier === "AM" && h === 12) h = 0;

      return h * 60 + m;
    } catch {
      return 0;
    }
  };

  const saveTaskImage = async (taskId) => {
    if (!image || !taskId) return { success: true };

    const formData = new FormData();
    formData.append("action", "save_image");
    formData.append("email", user?.email || "");
    formData.append("id", String(taskId));
    formData.append("image", image);

    const res = await fetch(API_URL, {
      method: "POST",
      body: formData,
    });

    return await res.json();
  };

  const removeTaskImage = async (taskId) => {
    if (!taskId) return { success: false, message: "Task ID missing" };

    const formData = new FormData();
    formData.append("action", "remove_image");
    formData.append("email", user?.email || "");
    formData.append("id", String(taskId));

    const res = await fetch(API_URL, {
      method: "POST",
      body: formData,
    });

    return await res.json();
  };

  const handleAddTask = async () => {

    // Ignore repeated clicks while the current save is still running.
    if (saveInProgressRef.current) return;
    saveInProgressRef.current = true;

    if (isPreviousDay) {
      alert("Previous day tasks cannot be added or edited.");
      saveInProgressRef.current = false;
      return;
    }

    if (!title.trim() || !fromTime) {
      alert("Please enter task title and from time");
      saveInProgressRef.current = false;
      return;
    }

    const colors = [
      "linear-gradient(135deg, #43e97b, #38f9d7)",
      "linear-gradient(135deg, #fa709a, #fee140)",
      "linear-gradient(135deg, #30cfd0, #330867)",
      "linear-gradient(135deg, #f093fb, #f5576c)",
    ];

    const formattedFrom = formatTime(fromTime);
    const formattedTo = toTime ? formatTime(toTime) : "";
    const nextDay = isNextDay(formattedFrom, formattedTo);

    // =========================================================
    // TASK TIME OVERLAP CHECK
    // =========================================================
    // Do not allow two different tasks to occupy the same time.
    // Example:
    //   Maths 8:21 PM - 9:22 PM
    //   New task 9:21 PM - 10:23 PM  -> BLOCKED
    //
    // While editing, the current task itself is ignored so the user
    // can save its existing time unchanged.
    const candidateStart = toMin(formattedFrom);
    const candidateEnd = formattedTo
      ? toMin(formattedTo)
      : candidateStart;

    // A task must have a real duration. Same start/end is not treated as
    // an overnight task; only an end time earlier than the start is overnight.
    if (formattedTo && candidateEnd === candidateStart) {
      alert("Start time and end time cannot be the same. Please choose another time.");
      saveInProgressRef.current = false;
      return;
    }

    // Convert an interval into one or two same-day ranges.
    // Overnight tasks such as 11:00 PM - 8:00 AM become:
    //   23:00 -> 24:00 and 00:00 -> 08:00
    const getTaskRanges = (from, to, taskNextDay = false) => {
      if (!from) return [];

      const start = toMin(from);
      if (!to) return [[start, start]];

      const end = toMin(to);
      const overnight = taskNextDay || end < start;

      if (!overnight) {
        return [[start, end]];
      }

      return [
        [start, 24 * 60],
        [0, end],
      ];
    };

    const candidateRanges =
      formattedTo && nextDay
        ? [
            [candidateStart, 24 * 60],
            [0, candidateEnd],
          ]
        : [[candidateStart, candidateEnd]];

    const rangesOverlap = (a, b) => {
      // A zero-length task only conflicts with another task that contains
      // that exact start time.
      if (a[0] === a[1]) {
        return b[0] <= a[0] && a[0] < b[1];
      }

      if (b[0] === b[1]) {
        return a[0] <= b[0] && b[0] < a[1];
      }

      return a[0] < b[1] && b[0] < a[1];
    };

    const overlappingTask = tasks.find((existingTask) => {
      if (editTask && String(existingTask.id) === String(editTask.id)) {
        return false;
      }

      const existingFrom = existingTask.from || existingTask.time || "";
      const existingTo = existingTask.to || "";

      const existingRanges = getTaskRanges(
        existingFrom,
        existingTo,
        Boolean(existingTask.nextDay)
      );

      return candidateRanges.some((candidateRange) =>
        existingRanges.some((existingRange) =>
          rangesOverlap(candidateRange, existingRange)
        )
      );
    });

    if (overlappingTask) {
      const existingFrom =
        overlappingTask.from || overlappingTask.time || "";
      const existingTo = overlappingTask.to || "";

      const existingTime = existingTo
        ? `${existingFrom} - ${existingTo}`
        : existingFrom;

      alert(
        `Time conflict: ${overlappingTask.title} is already scheduled for ${existingTime}.\n\nPlease choose a time outside this period.`
      );
      saveInProgressRef.current = false;
      return;
    }

    // Built-in/default tasks are edited through their date-wise schedule.
    // Do NOT call the generic DB "add/update" path for them; that path can
    // create a second row instead of updating the existing default row.
    const defaultId = editTask ? getBuiltInDefaultId(editTask) : null;

    if (editTask && defaultId) {
      const taskTitle = String(editTask.title).trim().toLowerCase();

      saveDateDefaultSchedule(currentKey, defaultId, {
        title: title.trim(),
        from: taskTitle === "wake up" ? undefined : formattedFrom,
        time: taskTitle === "wake up" ? formattedFrom : undefined,
        to: formattedTo,
        nextDay,
      });

      // Keep the existing database row; only its date-wise schedule changes.
      // This is what prevents an extra Study MERN/Practice English/Workout row.
      setTasks((prev) =>
        prev.map((task) => {
          if (String(task.id) !== String(editTask.id)) return task;

          return {
            ...task,
            title: title.trim(),
            ...(taskTitle === "wake up"
              ? { from: undefined, time: formattedFrom, to: undefined, nextDay: false }
              : { from: formattedFrom, to: formattedTo, nextDay }),
          };
        })
      );

      // Remove the existing image when the user selected "Remove Photo".
      if (removeImage && editTask?.id) {
        try {
          const removeData = await removeTaskImage(editTask.id);
          if (!removeData.success) {
            alert(removeData.message || "Could not remove task image");
            saveInProgressRef.current = false;
            return;
          }
          setTasks((prev) =>
            prev.map((task) =>
              String(task.id) === String(editTask.id)
                ? { ...task, iconImage: null }
                : task
            )
          );
        } catch (removeError) {
          console.error("Default task image remove error:", removeError);
          alert("Unable to remove task image");
          saveInProgressRef.current = false;
          return;
        }
      }

      // Save a newly selected image against the existing default-task row.
      if (image && editTask?.id) {
        try {
          const imageData = await saveTaskImage(editTask.id);

          if (!imageData.success) {
            alert(imageData.message || "Could not save task image");
            saveInProgressRef.current = false;
            return;
          }

          setTasks((prev) =>
            prev.map((task) =>
              String(task.id) === String(editTask.id)
                ? { ...task, iconImage: imageData.icon_image || task.iconImage }
                : task
            )
          );
        } catch (imageError) {
          console.error("Default task image save error:", imageError);
          alert("Unable to save task image");
          saveInProgressRef.current = false;
          return;
        }
      }

      // If Sleep crosses midnight, its TO time becomes the next day's Wake Up.
      if (taskTitle === "sleep" && formattedTo && nextDay) {
        const nextDate = new Date(date);
        nextDate.setDate(nextDate.getDate() + 1);
        const nextDateKey = getDateKey(nextDate);

        saveDateDefaultSchedule(nextDateKey, "d1", {
          title: "Wake Up",
          time: formattedTo,
          from: undefined,
          to: undefined,
          nextDay: false,
        });
      }

      notifyTaskUpdated();
      resetModal();
      saveInProgressRef.current = false;
      return;
    }

    // =========================
    // DATABASE ADD / UPDATE
    // =========================
    try {
      const formData = new FormData();
      formData.append("action", editTask ? "update" : "add");

      if (editTask?.id) {
        formData.append("id", String(editTask.id));
      }

      formData.append("email", user?.email || "");
      formData.append("title", title.trim());
      formData.append("from", formattedFrom);
      formData.append("to", formattedTo);
      formData.append("task_date", currentKey);
      formData.append("nextDay", nextDay ? "1" : "0");
      formData.append(
        "color",
        editTask?.color || colors[tasks.length % colors.length]
      );

      if (image) {
        formData.append("image", image);
      }

      if (editTask && removeImage && !image) {
        formData.append("remove_image", "1");
      }

      const res = await fetch(API_URL, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!data.success) {
        alert(data.message || "Task save failed");
        saveInProgressRef.current = false;
        return;
      }

      await fetchTasks();
      notifyTaskUpdated();
      resetModal();
      saveInProgressRef.current = false;
    } catch (error) {
      console.error("Add/update task error:", error);
      alert("Unable to save task");
      saveInProgressRef.current = false;
    }
  };
  // Every visible task now comes from the database, including the built-in
  // tasks. This keeps status and percentage in one source of truth.
  const displayTasks = useMemo(() => tasks, [tasks]);

  const getSortMinutes = (time) => {
    if (!time) return 0;

    try {
      const [timePart, modifier] = time.split(" ");
      let [h, m] = timePart.split(":").map(Number);

      if (modifier === "PM" && h !== 12) h += 12;
      if (modifier === "AM" && h === 12) h = 0;

      return h * 60 + m;
    } catch {
      return 0;
    }
  };

  const sortedTasks = [...displayTasks].sort((a, b) => {
    const aTitle = String(a.title || "").trim().toLowerCase();
    const bTitle = String(b.title || "").trim().toLowerCase();

    // Wake Up must always be the first task of the selected day.
    if (aTitle === "wake up" && bTitle !== "wake up") return -1;
    if (bTitle === "wake up" && aTitle !== "wake up") return 1;

    // Sleep is an overnight task, so it stays at the end of the day.
    if (a.nextDay && !b.nextDay) return 1;
    if (!a.nextDay && b.nextDay) return -1;

    return (
      getSortMinutes(a.from || a.time) -
      getSortMinutes(b.from || b.time)
    );
  });

  // =========================
  // TASK TIME NOTIFICATIONS
  // =========================
  // Ask for browser notification permission once.
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission().catch(() => {});
    }
  }, []);

  // Check every second so the notification appears when the task starts.
  // A localStorage key prevents the same task from notifying repeatedly
  // during the same minute.
  useEffect(() => {
    if (!("Notification" in window)) return;

    const getTaskMinutes = (time) => {
      if (!time) return null;

      const parts = String(time).trim().split(" ");
      const timePart = parts[0];
      const modifier = parts[1];

      if (!timePart || !modifier) return null;

      let [h, m] = timePart.split(":").map(Number);

      if (!Number.isFinite(h) || !Number.isFinite(m)) return null;

      if (modifier === "PM" && h !== 12) h += 12;
      if (modifier === "AM" && h === 12) h = 0;

      return h * 60 + m;
    };

    const checkTaskTimes = () => {
      const now = new Date();
      const todayKey = getDateKey(now);

      // Only notify for the currently selected day.
      if (todayKey !== currentKey) return;

      const currentMinutes = now.getHours() * 60 + now.getMinutes();

      displayTasks.forEach((task) => {
        const taskTime = task.from || task.time;
        const taskMinutes = getTaskMinutes(taskTime);

        if (taskMinutes === null || taskMinutes !== currentMinutes) return;

        const notificationKey =
          `taskNotification_${todayKey}_${task.id}_${taskMinutes}`;

        if (localStorage.getItem(notificationKey)) return;

        localStorage.setItem(notificationKey, "1");

        if (Notification.permission === "granted") {
          new Notification(`⏰ ${task.title}`, {
            body: `${task.title} time is now — ${taskTime}`,
            tag: notificationKey,
          });
        }
      });
    };

    checkTaskTimes();
    const intervalId = window.setInterval(checkTaskTimes, 1000);

    return () => window.clearInterval(intervalId);
  }, [displayTasks, currentKey]);

  // =========================
  // COMPLETION GRAPH
  // =========================
  const totalTasks = displayTasks.length;
  const completedTasks = displayTasks.filter(
    (task) => task.completed
  ).length;

  const completionPercentage =
    totalTasks === 0
      ? 0
      : Math.round((completedTasks / totalTasks) * 100);

  // =========================================================
  // =========================================================
  // TODAY'S PERFORMANCE
  // Only ticked/completed tasks are included.
  // Changing a task slider alone does NOT affect this graph.
  // =========================================================
  // =========================================================
// =========================================================
// =========================================================
// TODAY'S PERFORMANCE PROGRESS
// ONLY TICKED / COMPLETED TASKS CONTRIBUTE.
// Each completed task contributes its own percentage,
// but the TOTAL number of visible tasks is always the denominator.
//
// Example with 5 tasks:
// Wake Up 100% + 4 unticked = 100 / 5 = 20%
// Wake Up 50%  + 4 unticked = 50  / 5 = 10%
// Wake Up 100% + Study 59%  + 3 unticked = 159 / 5 = 32%
// =========================================================

const isTaskCompleted = (task) =>
  task.completed === true ||
  task.completed === 1 ||
  task.completed === "1" ||
  task.completed === "true";

const completedTaskList = displayTasks.filter(isTaskCompleted);

const performancePercentage =
  displayTasks.length > 0
    ? Math.round(
        completedTaskList.reduce((total, task) => {
          const taskPercentage = Math.max(
            0,
            Math.min(100, Number(task.percentage ?? 0))
          );

          return total + taskPercentage;
        }, 0) / displayTasks.length
      )
    : 0;


  const radius = 48;
  const circumference = 2 * Math.PI * radius;
  const dashOffset =
    circumference - (completionPercentage / 100) * circumference;

  return (
    <>

<style>{`
  .complete-check input:disabled + .custom-check {
    opacity: 0.45;
    cursor: not-allowed;
  }

  /* =========================================================
     EXACT COMPACT TASK CARD
     Row 1 : Icon + Title/Time + Tick
     Row 2 : Edit + Delete + Slider + Percentage
     ========================================================= */
  .card.task-modern-card {
    position: relative !important;
    display: flex !important;
    flex-direction: column !important;
    align-items: stretch !important;
    gap: 5px !important;
    min-height: 108px !important;
    height: auto !important;
    padding: 8px 10px !important;
    box-sizing: border-box !important;
  }

  .card.task-modern-card .task-card-main {
    width: 100% !important;
    min-height: 48px !important;
    height: 48px !important;
    display: flex !important;
    flex-direction: row !important;
    align-items: center !important;
    justify-content: space-between !important;
    gap: 7px !important;
    margin: 0 !important;
    position: relative !important;
  }

  .card.task-modern-card .task-card-left {
    min-width: 0 !important;
    flex: 1 1 auto !important;
    display: flex !important;
    flex-direction: row !important;
    align-items: center !important;
    gap: 9px !important;
  }

  .card.task-modern-card .task-icon-top {
    position: static !important;
    width: 44px !important;
    height: 44px !important;
    min-width: 44px !important;
    flex: 0 0 44px !important;
    margin: 0 !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
  }

  .card.task-modern-card .task-card-content {
    min-width: 0 !important;
    flex: 1 1 auto !important;
    width: auto !important;
    padding: 0 !important;
    display: flex !important;
    flex-direction: column !important;
    align-items: flex-start !important;
    justify-content: center !important;
  }

  .card.task-modern-card .task-card-content h3 {
    margin: 0 0 3px 0 !important;
    font-size: 16px !important;
    line-height: 18px !important;
    font-weight: 700 !important;
    white-space: nowrap !important;
    overflow: hidden !important;
    text-overflow: ellipsis !important;
  }

  .card.task-modern-card .task-card-content p {
    margin: 0 !important;
    font-size: 12px !important;
    line-height: 14px !important;
    white-space: nowrap !important;
    overflow: hidden !important;
    text-overflow: ellipsis !important;
  }

  .card.task-modern-card .task-check-right {
    position: static !important;
    width: 42px !important;
    height: 42px !important;
    min-width: 42px !important;
    flex: 0 0 42px !important;
    margin: 0 !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
  }

  .card.task-modern-card .task-check-right .custom-check {
    width: 38px !important;
    height: 38px !important;
    box-sizing: border-box !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
  }

  .card.task-modern-card .task-bottom-row {
    width: 100% !important;
    height: 36px !important;
    min-height: 36px !important;
    display: flex !important;
    flex-direction: row !important;
    align-items: center !important;
    gap: 7px !important;
    margin: 0 !important;
  }

  .card.task-modern-card .task-bottom-row .task-actions {
    width: auto !important;
    height: 36px !important;
    min-width: 0 !important;
    flex: 0 0 auto !important;
    display: flex !important;
    flex-direction: row !important;
    align-items: center !important;
    gap: 5px !important;
    margin: 0 !important;
  }

  .card.task-modern-card .task-bottom-row .task-actions button {
    width: 36px !important;
    height: 36px !important;
    min-width: 36px !important;
    flex: 0 0 36px !important;
    margin: 0 !important;
    padding: 0 !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    border: 1px solid rgba(255,255,255,0.85) !important;
    border-radius: 9px !important;
    background: rgba(255,255,255,0.12) !important;
    color: #fff !important;
    box-sizing: border-box !important;
  }

  .card.task-modern-card .task-bottom-row .task-actions .edit-btn {
    font-size: 18px !important;
  }

  .card.task-modern-card .task-bottom-row .task-actions .delete-btn {
    font-size: 21px !important;
  }

  .card.task-modern-card .task-progress-inline {
    min-width: 0 !important;
    flex: 1 1 auto !important;
    display: flex !important;
    flex-direction: row !important;
    align-items: center !important;
    gap: 6px !important;
    margin: 0 !important;
    padding: 0 !important;
  }

  .card.task-modern-card .task-progress-inline .task-percentage-range {
    display: block !important;
    width: auto !important;
    flex: 1 1 auto !important;
    min-width: 30px !important;
    height: 6px !important;
    margin: 0 !important;
    padding: 0 !important;
    cursor: pointer !important;
    accent-color: #ffffff !important;
  }

  .card.task-modern-card .task-progress-percent {
    display: block !important;
    flex: 0 0 32px !important;
    width: 32px !important;
    min-width: 32px !important;
    margin: 0 !important;
    padding: 0 !important;
    text-align: right !important;
    font-size: 12px !important;
    line-height: 1 !important;
    font-weight: 700 !important;
    white-space: nowrap !important;
  }

  .card.task-modern-card .task-progress-inline .task-percentage-range:disabled {
    cursor: not-allowed !important;
    opacity: 0.5 !important;
  }

  .card.task-modern-card .check-disabled {
    opacity: 0.45 !important;
    cursor: not-allowed !important;
  }

  /* =========================================================
     TODAY'S PERFORMANCE
  ========================================================= */
  .today-performance-card {
    width: 100%;
    margin-top: 14px;
    padding: 18px 20px;
    background: #ffffff;
    border-radius: 18px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
    box-sizing: border-box;
  }

  .performance-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 15px;
  }

  .performance-header h2 {
    margin: 0;
    font-size: 18px;
    font-weight: 700;
    color: #171717;
  }

  .performance-header p {
    margin: 5px 0 0;
    font-size: 13px;
    color: #777;
  }

  .performance-header strong {
    font-size: 25px;
    font-weight: 800;
    color: #7255ff;
  }

  .performance-bar {
    width: 100%;
    height: 9px;
    margin-top: 15px;
    background: #eeeef5;
    border-radius: 20px;
    overflow: hidden;
  }

  .performance-bar-fill {
    height: 100%;
    border-radius: 20px;
    background: linear-gradient(90deg, #6854ff, #b34cff);
    transition: width 0.35s ease;
  }

  .performance-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 9px;
    font-size: 12px;
  }

  .performance-footer span { color: #777; }
  .performance-footer b { color: #171717; font-weight: 700; }

  /* Page scrolling */
  .task-page-scroll {
    height: auto !important;
    max-height: none !important;
    min-height: 0 !important;
    overflow: visible !important;
  }

  .task-page-scroll .cards {
    height: auto !important;
    max-height: none !important;
    min-height: 0 !important;
    overflow: visible !important;
    padding-bottom: 90px !important;
  }

  @media (max-width: 768px) {
    html, body, #root {
      height: auto !important;
      min-height: 100% !important;
      overflow-x: hidden !important;
      overflow-y: auto !important;
    }

    .dashboard,
    .main {
      height: auto !important;
      min-height: 100vh !important;
      overflow: visible !important;
    }

    .task-modern-card {
      min-height: 116px !important;
      padding: 12px 13px !important;
    }

    .task-page-scroll {
      height: auto !important;
      max-height: none !important;
      overflow: visible !important;
      padding-bottom: 20px !important;
    }

    .task-page-scroll .cards {
      height: auto !important;
      max-height: none !important;
      overflow: visible !important;
      padding-bottom: 110px !important;
    }
  }
`}</style>

    <div className="dashboard">
      <Sidebar />

      <div className="main">
        {/* DATE BAR */}
        <div className="date-bar">
          <button onClick={() => changeDate("prev")} type="button">
            <FaChevronLeft />
          </button>

          <span>{date.toDateString()}</span>

          <button onClick={() => changeDate("next")} type="button">
            <FaChevronRight />
          </button>
        </div>

        <div className="task-wrapper task-page-scroll">
          {/* =========================
              COMPLETION GRAPH
          ========================= */}
       <div className="progress-area">

  <div className="task-progress">

  {/* PROGRESS CIRCLE */}
  <div className="progress-circle">
    <svg viewBox="0 0 120 120">
      <circle
        className="progress-bg"
        cx="60"
        cy="60"
        r={radius}
      />

      <circle
        className="progress-value"
        cx="60"
        cy="60"
        r={radius}
        strokeDasharray={circumference}
        strokeDashoffset={dashOffset}
      />
    </svg>

    <div className="progress-number">
      <strong>{completionPercentage}%</strong>
      <span>Done</span>
    </div>
  </div>

  {/* PROGRESS INFO */}
  <div className="progress-info">

    <h2>Today's Task Progress</h2>

    <p>
      {completedTasks} of {totalTasks} tasks completed
    </p>

    <div className="progress-bar">
      <div
        className="progress-bar-fill"
        style={{
          width: `${completionPercentage}%`,
        }}
      />
    </div>

    <div className="progress-count">
      <span>
        <FaCheck /> Completed
      </span>

      <b>
        {completedTasks}/{totalTasks}
      </b>
    </div>

  </div>

  {/* ADD BUTTON INSIDE PROGRESS CARD
      Previous day: hidden
      Today/Future: available
  */}
  {!isPreviousDay && (
    <button
      className="progress-add-btn"
      onClick={() => {
        setEditTask(null);
        setTitle("");
        setFromTime("");
        setToTime("");
        setImage(null);
        setShowModal(true);
      }}
      type="button"
      title="Add task"
    >
      +
    </button>
  )}
 </div>
</div>
          {/* =========================
              TODAY'S PERFORMANCE
              Card is always visible.
              Percentage + graph fill appear only
              after at least one task is ticked.
          ========================= */}
          <div className="today-performance-card">
            <div className="performance-header">
              <div>
                <h2>Today's Performance Progress</h2>
              </div>

              {completedTaskList.length > 0 && (
                <strong>{performancePercentage}%</strong>
              )}
            </div>

            <div className="performance-bar">
              {completedTaskList.length > 0 && (
                <div
                  className="performance-bar-fill"
                  style={{ width: `${performancePercentage}%` }}
                />
              )}
            </div>
          </div>


          {/* TASK CARDS */}
          <div className="cards">
            {sortedTasks.length === 0 ? (
              <div className="empty-task">
                <h3>No tasks for this day</h3>
                <p>Tap + to add a new task.</p>
              </div>
            ) : (
              sortedTasks.map((task) => (
                <div
                  className={`card task-modern-card ${
                    task.completed ? "done" : ""
                  }`}
                  key={task.id}
                  style={{ background: task.color }}
                >
                  <div className="task-card-main">
                    <div className="task-card-left">
                      <div className="icon-box task-icon-top">
                        {task.iconImage ? (
                          <img
                            src={task.iconImage}
                            alt={task.title}
                            className="task-uploaded-icon"
                          />
                        ) : (
                          getIcon(task.icon, task.title)
                        )}
                      </div>

                      <div className="card-content task-card-content">
                        <h3>{task.title}</h3>

                        <p>
                          {task.title === "Wake Up"
                            ? task.time || task.from
                            : `${task.from || ""} - ${task.to || ""} ${
                                task.nextDay ? "(Next Day)" : ""
                              }`}
                        </p>
                      </div>
                    </div>

                    {/* TICK - RIGHT SIDE OF FIRST ROW */}
                    <label
                      className="complete-check task-check-right"
                      title={
                        isPreviousDay
                          ? "Previous day tasks cannot be changed"
                          : isFutureDay
                          ? "Future day tasks cannot be completed yet"
                          : task.completed
                          ? "Mark as incomplete"
                          : "Mark as complete"
                      }
                    >
                      <input
                        type="checkbox"
                        checked={task.completed === true}
                        disabled={!isToday}
                        onChange={() => {
                          if (!isToday) return;
                          toggleTask(task);
                        }}
                      />

                      <span
                        className={`custom-check ${
                          !isToday ? "check-disabled" : ""
                        }`}
                      >
                        {task.completed && <FaCheck />}
                      </span>
                    </label>
                  </div>

                  {/* SECOND ROW:
                      EDIT + DELETE + PROGRESS BAR + PERCENTAGE */}
                  <div className="task-bottom-row">
                    {!isPreviousDay && (
                      <div className="actions action-box task-actions">
                        <button
                          onClick={() => handleEdit(task)}
                          type="button"
                          title="Edit task time"
                          className="edit-btn"
                        >
                          ✏️
                        </button>

                        {getBuiltInDefaultId(task) !== "d1" &&
                          getBuiltInDefaultId(task) !== "d5" && (
                            <button
                              onClick={() => setDeleteConfirm(task)}
                              type="button"
                              title="Delete task"
                              className="delete-btn"
                            >
                              ✕
                            </button>
                          )}
                      </div>
                    )}

                    <div className="task-progress-inline">
                      <input
                        className="task-percentage-range"
                        type="range"
                        min="0"
                        max="100"
                        step="1"
                        value={Math.max(
                          0,
                          Math.min(100, Number(task.percentage ?? 0))
                        )}
                        disabled={isPreviousDay}
                        onChange={(e) => {
                          if (isPreviousDay) return;
                          handlePercentageChange(task, e.target.value);
                        }}
                        onMouseUp={(e) =>
                          saveTaskPercentage(task, e.currentTarget.value)
                        }
                        onTouchEnd={(e) =>
                          saveTaskPercentage(task, e.currentTarget.value)
                        }
                        onBlur={(e) =>
                          saveTaskPercentage(task, e.currentTarget.value)
                        }
                        aria-label={`Progress percentage for ${task.title}`}
                      />

                      <strong className="task-progress-percent">
                        {Math.max(
                          0,
                          Math.min(100, Number(task.percentage ?? 0))
                        )}
                        %
                      </strong>
                    </div>
                  </div>
                </div>
              ))
            )}
            
          </div>

       
        </div>
      </div>

      {/* ADD / EDIT MODAL */}
      {showModal && (
        <div className="modal" onClick={resetModal}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h2>{editTask ? "Edit Task" : "Add New Task"}</h2>

            <div className="input-group">
              <label>Task Title</label>
              <input
                type="text"
                value={title}
                placeholder="Enter task name"
                onChange={(e) => setTitle(e.target.value)}
                readOnly={
                  editTask?.title === "Sleep" || editTask?.title === "Wake Up"
                }
                className={
                  editTask?.title === "Sleep" || editTask?.title === "Wake Up"
                    ? "sleep-locked-input"
                    : ""
                }
              />
            </div>

            <div className="input-group">
              <label>From Time</label>
              <input
                type="time"
                value={fromTime}
                onChange={(e) => setFromTime(e.target.value)}
              />

              {editTask?.title !== "Wake Up" && (
                <>
                  <label>To Time</label>
                  <input
                    type="time"
                    value={toTime}
                    onChange={(e) => setToTime(e.target.value)}
                  />
                </>
              )}
            </div>

            {editTask?.title !== "Sleep" && editTask?.title !== "Wake Up" && (
              <div className="input-group">
                <label>Upload Icon</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    setImage(file);
                    setRemoveImage(false);

                    if (file) {
                      setImagePreview(URL.createObjectURL(file));
                    }
                  }}
                />

                {imagePreview && (
                  <div style={{ position: "relative", marginTop: "10px" }}>
                    <img
                      src={imagePreview}
                      alt="Task icon preview"
                      className="task-image-preview"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImage(null);
                        setImagePreview("");
                        setRemoveImage(Boolean(editTask?.iconImage));
                      }}
                      style={{
                        marginTop: "8px",
                        padding: "8px 14px",
                        border: "none",
                        borderRadius: "8px",
                        background: "#ef4444",
                        color: "#fff",
                        cursor: "pointer",
                        fontWeight: 600
                      }}
                    >
                      Remove Photo
                    </button>
                  </div>
                )}
              </div>
            )}

            <div className="modal-actions">
              <button type="button" onClick={resetModal}>
                Cancel
              </button>

              <button type="button" onClick={handleAddTask}>
                {editTask ? "Update" : "Add"}
              </button>
            </div>
          </div>
        </div>
      )}
      {deleteConfirm && (
  <div
    className="delete-confirm-overlay"
    onClick={() => setDeleteConfirm(null)}
  >
    <div
      className="delete-confirm-box"
      onClick={(e) => e.stopPropagation()}
    >
      <h3>Do you want to delete?</h3>

      <p>
        Are you sure you want to delete "{deleteConfirm.title}"?
      </p>

      <div className="delete-confirm-actions">
        <button
          type="button"
          className="delete-no-btn"
          onClick={() => setDeleteConfirm(null)}
        >
          No
        </button>

        <button
          type="button"
          className="delete-yes-btn"
          onClick={async () => {
            const task = deleteConfirm;
            setDeleteConfirm(null);

            if (isPreviousDay) {
              alert("Previous day tasks cannot be deleted.");
              return;
            }

            await deleteTask(task);
          }}
        >
          Yes
        </button>
      </div>
    </div>
  </div>
)}
    </div>
    </>
  );
}

export default Task;
