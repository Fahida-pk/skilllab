import Sidebar from "../dasboard/Sidebar.jsx";
import { useState, useEffect } from "react";

import { FaMoon } from "react-icons/fa";

import {
  FaChevronLeft,
  FaChevronRight,
  FaSun,
  FaBook,
  FaLanguage,
  FaDumbbell,
} from "react-icons/fa";

import "./task.css";

function Task() {
  // =========================================
  // DATE
  // =========================================

  const [date, setDate] = useState(new Date());

  // =========================================
  // USER
  // =========================================

  const user = JSON.parse(localStorage.getItem("user"));

  // =========================================
  // DATE KEY
  // =========================================

  const getDateKey = (d) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const currentKey = getDateKey(date);

  // =========================================
  // MODAL STATES
  // =========================================

  const [showModal, setShowModal] = useState(false);

  const [title, setTitle] = useState("");
  const [fromTime, setFromTime] = useState("");
  const [toTime, setToTime] = useState("");

  const [image, setImage] = useState(null);

  const [editTask, setEditTask] = useState(null);

  // =========================================
  // DATABASE TASKS
  // =========================================

  const [tasks, setTasks] = useState([]);

  // =========================================
  // ICON
  // =========================================

  const getIcon = (icon) => {
    if (typeof icon !== "string") {
      return <FaBook />;
    }

    switch (icon) {
      case "sun":
        return <FaSun />;

      case "book":
        return <FaBook />;

      case "language":
        return <FaLanguage />;

      case "dumbbell":
        return <FaDumbbell />;

      case "moon":
        return <FaMoon />;

      default:
        return <FaBook />;
    }
  };

  // =========================================
  // DEFAULT TASKS
  // =========================================
  //
  // IMPORTANT:
  // completed is ALWAYS reset to false here.
  // Completion is stored separately date-wise.
  //
  // =========================================

  const [defaultTasks, setDefaultTasks] = useState(() => {
    const saved = localStorage.getItem("defaultTasks");

    if (saved) {
      try {
        const parsed = JSON.parse(saved);

        return parsed.map((task) => ({
          ...task,

          // IMPORTANT
          // Never take old completed value from old storage.
          completed: false,
        }));
      } catch (error) {
        console.error("Default task parse error:", error);
      }
    }

    return [
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
  });

  // =========================================
  // DATE-WISE DEFAULT TASK COMPLETION
  // =========================================

  const getDefaultCompletionKey = (dateKey) => {
    return `defaultTaskCompleted_${dateKey}`;
  };

  const [defaultCompleted, setDefaultCompleted] = useState({});

  // =========================================
  // LOAD DATE-WISE COMPLETION
  // =========================================

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

  // =========================================
  // SAVE DEFAULT TASK DEFINITIONS
  // =========================================

  useEffect(() => {
    const cleanTasks = defaultTasks.map((task) => ({
      ...task,
      completed: false,
    }));

    localStorage.setItem(
      "defaultTasks",
      JSON.stringify(cleanTasks)
    );
  }, [defaultTasks]);

  // =========================================
  // FETCH DATABASE TASKS
  // =========================================

  useEffect(() => {
    fetchTasks();
  }, [currentKey]);

  const fetchTasks = async () => {
    try {
      const res = await fetch(
        "https://zyntaweb.com/skilllab/api/task.php",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            action: "get",
            email: user?.email,
            task_date: currentKey,
          }),
        }
      );

      const data = await res.json();

      const colors = [
        "linear-gradient(135deg, #43e97b, #38f9d7)",
        "linear-gradient(135deg, #fa709a, #fee140)",
        "linear-gradient(135deg, #30cfd0, #330867)",
        "linear-gradient(135deg, #f093fb, #f5576c)",
      ];

      if (data.success) {
        const formatted = data.tasks.map((t) => ({
          id: t.id,

          title: t.title,

          from: t.from,

          to: t.to,

          completed:
            t.completed === true ||
            t.completed === 1 ||
            t.completed === "1",

          color:
            t.color ||
            colors[Math.floor(Math.random() * colors.length)],

          icon: t.icon || "book",

          // Detect overnight task
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

  // =========================================
  // CHECK NEXT DAY
  // =========================================

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

  // =========================================
  // FORMAT TIME
  // =========================================

  const formatTime = (t) => {
    if (!t) return "";

    try {
      const [hour, minute] = t.split(":");

      let h = parseInt(hour, 10);

      const ampm = h >= 12 ? "PM" : "AM";

      h = h % 12;

      if (h === 0) {
        h = 12;
      }

      return `${h}:${minute} ${ampm}`;
    } catch {
      return "";
    }
  };

  // =========================================
  // CONVERT DISPLAY TIME TO INPUT TIME
  // =========================================

  const convertToInputTime = (timeStr) => {
    if (!timeStr) return "";

    try {
      const [time, modifier] = timeStr.split(" ");

      let [hours, minutes] = time.split(":");

      hours = parseInt(hours, 10);

      if (modifier === "PM" && hours !== 12) {
        hours += 12;
      }

      if (modifier === "AM" && hours === 12) {
        hours = 0;
      }

      return `${hours
        .toString()
        .padStart(2, "0")}:${minutes}`;
    } catch {
      return "";
    }
  };

  // =========================================
  // CHANGE DATE
  // =========================================

  const changeDate = (type) => {
    const newDate = new Date(date);

    if (type === "prev") {
      newDate.setDate(date.getDate() - 1);
    } else {
      newDate.setDate(date.getDate() + 1);
    }

    setDate(newDate);
  };

  // =========================================
  // DELETE TASK
  // =========================================

  const deleteTask = async (task) => {
    // =========================================
    // DEFAULT TASK
    // =========================================

    if (task.id.toString().startsWith("d")) {
      setDefaultTasks((prev) =>
        prev.filter((t) => t.id !== task.id)
      );

      // Also remove completion for current date
      setDefaultCompleted((prev) => {
        const updated = {
          ...prev,
        };

        delete updated[task.id];

        localStorage.setItem(
          getDefaultCompletionKey(currentKey),
          JSON.stringify(updated)
        );

        return updated;
      });

      return;
    }

    // =========================================
    // DATABASE TASK
    // =========================================

    try {
      await fetch(
        "https://zyntaweb.com/skilllab/api/dashboard.php",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            action: "delete",
            email: user?.email,
            id: task.id,
          }),
        }
      );

      fetchTasks();
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  // =========================================
  // TOGGLE TASK
  // =========================================

  const toggleTask = async (task) => {
    // =========================================
    // DEFAULT TASK
    // =========================================

    if (task.id.toString().startsWith("d")) {
      setDefaultCompleted((prev) => {
        const updated = {
          ...prev,

          [task.id]: !prev[task.id],
        };

        // SAVE DATE-WISE
        localStorage.setItem(
          getDefaultCompletionKey(currentKey),
          JSON.stringify(updated)
        );

        return updated;
      });

      return;
    }

    // =========================================
    // DATABASE TASK
    // =========================================

    try {
      await fetch(
        "https://zyntaweb.com/skilllab/api/dashboard.php",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            action: "toggle",
            email: user?.email,
            id: task.id,

            status: task.completed ? 0 : 1,
          }),
        }
      );

      fetchTasks();
    } catch (error) {
      console.error("Toggle error:", error);
    }
  };

  // =========================================
  // EDIT TASK
  // =========================================

  const handleEdit = (task) => {
    setShowModal(true);

    setEditTask(task);

    setTitle(task.title);

    setFromTime(
      convertToInputTime(task.from || task.time)
    );

    setToTime(
      convertToInputTime(task.to)
    );

    setImage(null);
  };

  // =========================================
  // ADD / UPDATE TASK
  // =========================================

  const handleAddTask = async () => {
    if (!title || !fromTime) {
      return;
    }

    const colors = [
      "linear-gradient(135deg, #43e97b, #38f9d7)",
      "linear-gradient(135deg, #fa709a, #fee140)",
      "linear-gradient(135deg, #30cfd0, #330867)",
      "linear-gradient(135deg, #f093fb, #f5576c)",
    ];

    const formattedFrom = formatTime(fromTime);

    const formattedTo = toTime
      ? formatTime(toTime)
      : "";

    const nextDay = isNextDay(
      formattedFrom,
      formattedTo
    );

    // =========================================
    // DEFAULT EDIT
    // =========================================

    if (
      editTask &&
      editTask.id.toString().startsWith("d")
    ) {
      const updated = defaultTasks.map((t) =>
        t.id === editTask.id
          ? {
              ...t,

              title,

              from:
                title === "Wake Up"
                  ? undefined
                  : formattedFrom,

              time:
                title === "Wake Up"
                  ? formattedFrom
                  : undefined,

              to: formattedTo,

              nextDay,

              color: t.color,

              // IMPORTANT
              // Don't automatically complete after edit
              completed: false,
            }
          : t
      );

      setDefaultTasks(updated);

      // =========================================
      // IF DEFAULT TASK EDITED,
      // RESET ONLY THAT TASK'S COMPLETION
      // =========================================

      setDefaultCompleted((prev) => {
        const updatedCompletion = {
          ...prev,
          [editTask.id]: false,
        };

        localStorage.setItem(
          getDefaultCompletionKey(currentKey),
          JSON.stringify(updatedCompletion)
        );

        return updatedCompletion;
      });

      // =========================================
      // SLEEP -> WAKE UP
      // =========================================

      if (
        title.toLowerCase().includes("sleep") &&
        formattedTo &&
        nextDay
      ) {
        setDefaultTasks((prev) => {
          const updatedWake = prev.map((t) =>
            t.title?.toLowerCase() === "wake up"
              ? {
                  ...t,
                  time: formattedTo,
                  completed: false,
                }
              : t
          );

          return updatedWake;
        });

        // Wake Up completion reset
        setDefaultCompleted((prev) => {
          const wakeTask = defaultTasks.find(
            (t) =>
              t.title?.toLowerCase() === "wake up"
          );

          if (!wakeTask) {
            return prev;
          }

          const updatedCompletion = {
            ...prev,
            [wakeTask.id]: false,
          };

          localStorage.setItem(
            getDefaultCompletionKey(currentKey),
            JSON.stringify(updatedCompletion)
          );

          return updatedCompletion;
        });
      }

      // =========================================
      // RESET MODAL
      // =========================================

      setShowModal(false);

      setEditTask(null);

      setTitle("");

      setFromTime("");

      setToTime("");

      setImage(null);

      return;
    }

    // =========================================
    // TIME TO MINUTES
    // =========================================

    const toMin = (time) => {
      if (!time) return 0;

      try {
        const parts = time.split(" ");

        const timePart = parts[0];

        const modifier = parts[1];

        let [h, m] = timePart
          .split(":")
          .map(Number);

        if (modifier === "PM" && h !== 12) {
          h += 12;
        }

        if (modifier === "AM" && h === 12) {
          h = 0;
        }

        return h * 60 + m;
      } catch {
        return 0;
      }
    };

    // =========================================
    // OVERLAP CHECK
    // =========================================

    const isOverlap = [...tasks].some((t) => {
      if (!t.from || !t.to) {
        return false;
      }

      // Ignore currently edited task
      if (
        editTask &&
        t.id === editTask.id
      ) {
        return false;
      }

      let newFrom = toMin(formattedFrom);

      let newTo = formattedTo
        ? toMin(formattedTo)
        : newFrom;

      let oldFrom = toMin(t.from);

      let oldTo = toMin(t.to);

      // =========================================
      // NEXT DAY
      // =========================================

      if (t.nextDay) {
        oldTo += 1440;
      }

      if (nextDay) {
        newTo += 1440;
      }

      return (
        newFrom < oldTo &&
        newTo > oldFrom
      );
    });

    if (isOverlap) {
      alert(
        "⚠️ Time already exists! Change time"
      );

      return;
    }

    // =========================================
    // SLEEP -> NEXT DAY WAKE
    // =========================================

    if (
      title?.toLowerCase().includes("sleep") &&
      formattedTo &&
      nextDay
    ) {
      setDefaultTasks((prev) => {
        const updated = prev.map((t) =>
          t.title?.toLowerCase() === "wake up"
            ? {
                ...t,

                time: formattedTo,

                completed: false,
              }
            : t
        );

        return updated;
      });

      // Reset Wake Up completion
      setDefaultCompleted((prev) => {
        const wakeTask = defaultTasks.find(
          (t) =>
            t.title?.toLowerCase() === "wake up"
        );

        if (!wakeTask) {
          return prev;
        }

        const updated = {
          ...prev,

          [wakeTask.id]: false,
        };

        localStorage.setItem(
          getDefaultCompletionKey(currentKey),
          JSON.stringify(updated)
        );

        return updated;
      });
    }

    // =========================================
    // RANDOM COLOR
    // =========================================

    const randomColor =
      colors[
        Math.floor(
          Math.random() * colors.length
        )
      ];

    // =========================================
    // DATABASE API
    // =========================================

    try {
      await fetch(
        "https://zyntaweb.com/skilllab/api/dashboard.php",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            action: editTask
              ? "update"
              : "add",

            id: editTask?.id,

            email: user?.email,

            title,

            from: formattedFrom,

            to: formattedTo,

            task_date: currentKey,

            nextDay,

            color: editTask
              ? editTask.color
              : randomColor,
          }),
        }
      );

      // =========================================
      // REFRESH
      // =========================================

      await fetchTasks();
    } catch (error) {
      console.error(
        "Add/update task error:",
        error
      );
    }

    // =========================================
    // RESET
    // =========================================

    setEditTask(null);

    setShowModal(false);

    setTitle("");

    setFromTime("");

    setToTime("");

    setImage(null);
  };

  // =========================================
  // DISPLAY TASKS
  // =========================================

  const displayTasks = [
    ...defaultTasks.map((task) => ({
      ...task,

      // =========================================
      // IMPORTANT:
      // completion comes ONLY from current date
      // =========================================

      completed:
        defaultCompleted[task.id] === true,
    })),

    ...tasks,
  ];

  // =========================================
  // SORT TASKS
  // =========================================

  const sortedTasks = displayTasks.sort(
    (a, b) => {
      const getTime = (t) => {
        if (!t) return 0;

        try {
          const parts = t.split(" ");

          const time = parts[0];

          const mod = parts[1];

          let [h, m] = time
            .split(":")
            .map(Number);

          if (
            mod === "PM" &&
            h !== 12
          ) {
            h += 12;
          }

          if (
            mod === "AM" &&
            h === 12
          ) {
            h = 0;
          }

          return h * 60 + m;
        } catch {
          return 0;
        }
      };

      // Sleep always last
      if (
        a.nextDay &&
        !b.nextDay
      ) {
        return 1;
      }

      if (
        !a.nextDay &&
        b.nextDay
      ) {
        return -1;
      }

      return (
        getTime(
          a.from || a.time
        ) -
        getTime(
          b.from || b.time
        )
      );
    }
  );

  // =========================================
  // RENDER
  // =========================================

  return (
    <div className="dashboard">

      {/* SIDEBAR */}
      <Sidebar />

      <div className="main">

        {/* =========================================
            DATE BAR
        ========================================= */}

        <div className="date-bar">

          <button
            onClick={() =>
              changeDate("prev")
            }
          >
            <FaChevronLeft />
          </button>

          <span>
            {date.toDateString()}
          </span>

          <button
            onClick={() =>
              changeDate("next")
            }
          >
            <FaChevronRight />
          </button>

        </div>

        {/* =========================================
            TASK WRAPPER
        ========================================= */}

        <div className="task-wrapper">

          <div className="cards">

            {sortedTasks.map((task) => (

              <div
                className={`card ${
                  task.completed
                    ? "done"
                    : ""
                }`}
                key={task.id}
                style={{
                  background:
                    task.color,
                }}
              >

                {/* =========================================
                    ICON
                ========================================= */}

                <div className="icon-box">

                  {getIcon(task.icon)}

                </div>

                {/* =========================================
                    CONTENT
                ========================================= */}

                <div className="card-content">

                  <h3>
                    {task.title}
                  </h3>

                  <p>

                    {task.title ===
                    "Wake Up"
                      ? task.time ||
                        task.from
                      : `${task.from || ""} - ${
                          task.to || ""
                        } ${
                          task.nextDay
                            ? "(Next Day)"
                            : ""
                        }`}

                  </p>

                </div>

                {/* =========================================
                    ACTIONS
                ========================================= */}

                <div className="actions">

                  {/* EDIT */}

                  <button
                    onClick={() =>
                      handleEdit(task)
                    }
                    type="button"
                  >
                    ✏️
                  </button>

                  {/* DELETE */}

                  <button
                    onClick={() =>
                      deleteTask(task)
                    }
                    type="button"
                  >
                    ✕
                  </button>

                  {/* =========================================
                      COMPLETE CHECKBOX
                  ========================================= */}

                  <input
                    type="checkbox"
                    checked={
                      task.completed ===
                      true
                    }
                    onChange={() =>
                      toggleTask(task)
                    }
                  />

                </div>

              </div>

            ))}

          </div>

          {/* =========================================
              ADD BUTTON
          ========================================= */}

          <button
            className="fab-inside"
            onClick={() => {

              setEditTask(null);

              setTitle("");

              setFromTime("");

              setToTime("");

              setImage(null);

              setShowModal(true);

            }}
            type="button"
          >
            +
          </button>

        </div>

      </div>

      {/* =========================================
          ADD / EDIT MODAL
      ========================================= */}

      {showModal && (

        <div className="modal">

          <div className="modal-box">

            <h2>
              {editTask
                ? "Edit Task"
                : "Add New Task"}
            </h2>

            {/* =========================================
                TITLE
            ========================================= */}

            <div className="input-group">

              <label>
                Task Title
              </label>

              <input
                type="text"
                value={title}
                onChange={(e) =>
                  setTitle(
                    e.target.value
                  )
                }
              />

            </div>

            {/* =========================================
                TIME
            ========================================= */}

            <div className="input-group">

              <label>
                From Time
              </label>

              <input
                type="time"
                value={fromTime}
                onChange={(e) =>
                  setFromTime(
                    e.target.value
                  )
                }
              />

              <label>
                To Time
              </label>

              <input
                type="time"
                value={toTime}
                onChange={(e) =>
                  setToTime(
                    e.target.value
                  )
                }
              />

            </div>

            {/* =========================================
                ICON
            ========================================= */}

            <div className="input-group">

              <label>
                Upload Icon
              </label>

              <input
                type="file"
                onChange={(e) =>
                  setImage(
                    e.target.files[0]
                  )
                }
              />

            </div>

            {/* =========================================
                MODAL BUTTONS
            ========================================= */}

            <div className="modal-actions">

              <button
                type="button"
                onClick={() => {

                  setShowModal(false);

                  setEditTask(null);

                  setTitle("");

                  setFromTime("");

                  setToTime("");

                  setImage(null);

                }}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={
                  handleAddTask
                }
              >
                {editTask
                  ? "Update"
                  : "Add"}
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}

export default Task;