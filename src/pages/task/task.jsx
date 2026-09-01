import Sidebar from "../dasboard/Sidebar.jsx";
import { useState, useEffect, useMemo } from "react";
import { FaMoon, FaChevronLeft, FaChevronRight, FaSun, FaBook, FaLanguage, FaDumbbell, FaCheck } from "react-icons/fa";
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
  const [editTask, setEditTask] = useState(null);
  const [tasks, setTasks] = useState([]);

  const getDateKey = (d) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const currentKey = getDateKey(date);

  const getIcon = (icon) => {
    switch (icon) {
      case "sun": return <FaSun />;
      case "book": return <FaBook />;
      case "language": return <FaLanguage />;
      case "dumbbell": return <FaDumbbell />;
      case "moon": return <FaMoon />;
      default: return <FaBook />;
    }
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
      to: "8:00 AM",
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

  const fetchTasks = async () => {
    try {
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
        const formatted = data.tasks.map((t, index) => ({
          id: t.id,
          title: t.title,
          from: t.from,
          to: t.to,
          completed:
            t.completed === true ||
            t.completed === 1 ||
            t.completed === "1",
          color: t.color || colors[index % colors.length],
          icon: t.icon || "book",
          nextDay: isNextDay(t.from, t.to),
        }));

        setTasks(formatted);
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
  };

  const notifyTaskUpdated = () => {
    window.dispatchEvent(new Event("taskUpdated"));
  };

  const deleteTask = async (task) => {
    if (String(task.id).startsWith("d")) {
      const deletedId = String(task.id);

      // Delete ONLY for the selected date. The default task definition
      // remains available when the user changes to another date.
      setDeletedDefaultIds((prev) => {
        const updated = prev.includes(deletedId)
          ? prev
          : [...prev, deletedId];

        localStorage.setItem(
          getDeletedDefaultKey(currentKey),
          JSON.stringify(updated)
        );

        return updated;
      });

      setDefaultCompleted((prev) => {
        const updated = { ...prev };
        delete updated[deletedId];

        localStorage.setItem(
          getDefaultCompletionKey(currentKey),
          JSON.stringify(updated)
        );

        return updated;
      });

      notifyTaskUpdated();
      return;
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
    if (String(task.id).startsWith("d")) {
      setDefaultCompleted((prev) => {
        const updated = {
          ...prev,
          [task.id]: !prev[task.id],
        };

        localStorage.setItem(
          getDefaultCompletionKey(currentKey),
          JSON.stringify(updated)
        );

        return updated;
      });

      notifyTaskUpdated();
      return;
    }

    const newStatus = task.completed ? 0 : 1;

    // Update UI immediately
    setTasks((prev) =>
      prev.map((t) =>
        t.id === task.id ? { ...t, completed: newStatus === 1 } : t
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
            t.id === task.id ? { ...t, completed: task.completed } : t
          )
        );
        alert(data.message || "Could not update task");
      }

      if (data.success) {
        notifyTaskUpdated();
      }
    } catch (error) {
      console.error("Toggle error:", error);

      setTasks((prev) =>
        prev.map((t) =>
          t.id === task.id ? { ...t, completed: task.completed } : t
        )
      );

      alert("Unable to mark task complete");
    }
  };

  const handleEdit = (task) => {
    setShowModal(true);
    setEditTask(task);
    setTitle(task.title);
    setFromTime(convertToInputTime(task.from || task.time));
    setToTime(convertToInputTime(task.to));
    setImage(null);
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

  const handleAddTask = async () => {
    if (!title.trim() || !fromTime) {
      alert("Please enter task title and from time");
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

    // =========================
    // DEFAULT TASK EDIT
    // =========================
    if (editTask && String(editTask.id).startsWith("d")) {
      const taskId = String(editTask.id);
      const taskTitle = title.trim().toLowerCase();

      // Save this default task's schedule ONLY for the selected date.
      saveDateDefaultSchedule(currentKey, taskId, {
        title: title.trim(),
        from: taskTitle === "wake up" ? undefined : formattedFrom,
        time: taskTitle === "wake up" ? formattedFrom : undefined,
        to: formattedTo,
        nextDay,
      });

      // If Sleep crosses midnight, its TO time becomes the
      // Wake Up time for the NEXT calendar day.
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

      // If Wake Up is edited directly, only that date changes.
      if (taskTitle === "wake up") {
        saveDateDefaultSchedule(currentKey, taskId, {
          title: "Wake Up",
          time: formattedFrom,
          from: undefined,
          to: undefined,
          nextDay: false,
        });
      }

      // Editing Sleep must not change today's Wake Up.
      // The next day's Wake Up is updated above.
      setDefaultCompleted((prev) => {
        const updatedCompletion = {
          ...prev,
          [taskId]: false,
        };

        localStorage.setItem(
          getDefaultCompletionKey(currentKey),
          JSON.stringify(updatedCompletion)
        );

        return updatedCompletion;
      });

      resetModal();
      notifyTaskUpdated();
      return;
    }

    // =========================
    // OVERLAP CHECK
    // =========================
    const newFrom = toMin(formattedFrom);
    let newTo = formattedTo ? toMin(formattedTo) : newFrom;

    if (nextDay) newTo += 1440;

    const isOverlap = tasks.some((t) => {
      if (!t.from || !t.to) return false;
      if (editTask && t.id === editTask.id) return false;

      const oldFrom = toMin(t.from);
      let oldTo = toMin(t.to);

      if (t.nextDay) oldTo += 1440;

      return newFrom < oldTo && newTo > oldFrom;
    });

    if (isOverlap) {
      alert("⚠️ Time already exists! Change time.");
      return;
    }

    // =========================
    // DATABASE ADD / UPDATE
    // =========================
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: editTask ? "update" : "add",
          id: editTask?.id,
          email: user?.email,
          title: title.trim(),
          from: formattedFrom,
          to: formattedTo,
          task_date: currentKey,
          nextDay,
          color: editTask?.color || colors[tasks.length % colors.length],
        }),
      });

      const data = await res.json();

      if (!data.success) {
        alert(data.message || "Task save failed");
        return;
      }

      await fetchTasks();
      notifyTaskUpdated();
      resetModal();
    } catch (error) {
      console.error("Add/update task error:", error);
      alert("Unable to save task");
    }
  };

  const displayTasks = useMemo(
    () => [
      // Default tasks exist on every date. Their edited times are
      // applied from date-wise schedules.
      ...getDateDefaultTasks(currentKey)
        .filter((task) => !deletedDefaultIds.includes(String(task.id)))
        .map((task) => ({
          ...task,
          completed: defaultCompleted[task.id] === true,
        })),
      ...tasks,
    ],
    [defaultTasks, currentKey, deletedDefaultIds, defaultCompleted, tasks]
  );

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

  const radius = 48;
  const circumference = 2 * Math.PI * radius;
  const dashOffset =
    circumference - (completionPercentage / 100) * circumference;

  return (
    <>

<style>{`
  .task-page-scroll {
    height: auto !important;
    max-height: none !important;
    overflow: visible !important;
    min-height: 0 !important;
  }

  .task-page-scroll .cards {
    height: auto !important;
    max-height: none !important;
    overflow: visible !important;
    min-height: 0 !important;
    padding-bottom: 90px;
  }

  /* Mobile: let the browser page scroll normally */
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

    .task-page-scroll {
      height: auto !important;
      max-height: none !important;
      overflow: visible !important;
      padding-bottom: 20px;
    }

    .task-page-scroll .cards {
      height: auto !important;
      max-height: none !important;
      overflow: visible !important;
      padding-bottom: 110px;
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

    <div className="progress-info">

      <h2>Today's Progress</h2>

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

  </div>

  {/* ADD TASK BUTTON - OUTSIDE PROGRESS BOX */}
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
                  className={`card ${task.completed ? "done" : ""}`}
                  key={task.id}
                  style={{ background: task.color }}
                >
                  <div className="icon-box">{getIcon(task.icon)}</div>

                  <div className="card-content">
                    <h3>{task.title}</h3>

                    <p>
                      {task.title === "Wake Up"
                        ? task.time || task.from
                        : `${task.from || ""} - ${task.to || ""} ${
                            task.nextDay ? "(Next Day)" : ""
                          }`}
                    </p>
                  </div>

                  <div className="actions">
                    {/* EDIT */}
                    <button
                      onClick={() => handleEdit(task)}
                      type="button"
                      title="Edit task"
                      className="edit-btn"
                    >
                      ✏️
                    </button>

                    {/* DELETE */}
                    <button
                      onClick={() => deleteTask(task)}
                      type="button"
                      title="Delete task"
                      className="delete-btn"
                    >
                      ✕
                    </button>

                    {/* COMPLETE */}
                    <label
                      className="complete-check"
                      title={
                        task.completed
                          ? "Mark as incomplete"
                          : "Mark as complete"
                      }
                    >
                      <input
                        type="checkbox"
                        checked={task.completed === true}
                        onChange={() => toggleTask(task)}
                      />
                      <span className="custom-check">
                        {task.completed && <FaCheck />}
                      </span>
                    </label>
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
              />
            </div>

            <div className="input-group">
              <label>From Time</label>
              <input
                type="time"
                value={fromTime}
                onChange={(e) => setFromTime(e.target.value)}
              />

              <label>To Time</label>
              <input
                type="time"
                value={toTime}
                onChange={(e) => setToTime(e.target.value)}
              />
            </div>

            <div className="input-group">
              <label>Upload Icon</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImage(e.target.files?.[0] || null)}
              />
            </div>

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
    </div>
    </>
  );
}

export default Task;
