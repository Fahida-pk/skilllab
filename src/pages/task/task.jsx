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
  // =========================
  // DATE
  // =========================

  const [date, setDate] = useState(new Date());

  // =========================
  // MODAL
  // =========================

  const [showModal, setShowModal] = useState(false);

  const [title, setTitle] = useState("");
  const [fromTime, setFromTime] = useState("");
  const [toTime, setToTime] = useState("");
  const [image, setImage] = useState(null);

  const [editTask, setEditTask] = useState(null);

  // =========================
  // USER
  // =========================

  const user = JSON.parse(
    localStorage.getItem("user") || "null"
  );

  // =========================
  // DATE KEY
  // =========================

  const getDateKey = (d) => {
    const year = d.getFullYear();

    const month = String(
      d.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
      d.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const currentKey = getDateKey(date);

  // =========================
  // DATABASE TASKS
  // =========================

  const [tasks, setTasks] = useState([]);

  // =========================
  // ICON
  // =========================

  const getIcon = (icon) => {
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

  // =========================
  // DEFAULT TASKS
  // =========================

  const [defaultTasks, setDefaultTasks] =
    useState(() => {
      try {
        const saved =
          localStorage.getItem(
            "defaultTasks"
          );

        if (saved) {
          return JSON.parse(saved);
        }
      } catch (error) {
        console.error(
          "Default task parse error:",
          error
        );
      }

      return [
        {
          id: "d1",
          title: "Wake Up",
          time: "5:00 AM",
          icon: "sun",
          color:
            "linear-gradient(135deg, #f6d365, #fda085)",
          completed: false,
        },

        {
          id: "d2",
          title: "Study MERN",
          from: "5:00 AM",
          to: "10:00 AM",
          icon: "book",
          color:
            "linear-gradient(135deg, #a18cd1, #fbc2eb)",
          completed: false,
        },

        {
          id: "d3",
          title: "Practice English",
          from: "1:00 PM",
          to: "4:00 PM",
          icon: "language",
          color:
            "linear-gradient(135deg, #84fab0, #8fd3f4)",
          completed: false,
        },

        {
          id: "d4",
          title: "Workout",
          from: "6:00 PM",
          to: "7:00 PM",
          icon: "dumbbell",
          color:
            "linear-gradient(135deg, #fccb90, #d57eeb)",
          completed: false,
        },

        {
          id: "d5",
          title: "Sleep",
          from: "10:00 PM",
          to: "8:00 AM",
          icon: "moon",
          color:
            "linear-gradient(135deg, #141e30, #243b55)",
          completed: false,
          nextDay: true,
        },
      ];
    });

  // =========================
  // SAVE DEFAULT TASKS
  // =========================

  useEffect(() => {
    localStorage.setItem(
      "defaultTasks",
      JSON.stringify(defaultTasks)
    );
  }, [defaultTasks]);

  // =========================
  // LOAD DB TASKS
  // =========================

  useEffect(() => {
    fetchTasks();
  }, [currentKey]);

  // =========================
  // FETCH TASKS
  // =========================

  const fetchTasks = async () => {
    if (!user?.email) {
      console.log(
        "No logged in user"
      );

      setTasks([]);

      return;
    }

    try {
      const response = await fetch(
        "https://zyntaweb.com/skilllab/api/task.php",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            action: "get",
            email: user.email,
            task_date: currentKey,
          }),
        }
      );

      const data =
        await response.json();

      console.log(
        "TASK GET RESPONSE:",
        data
      );

      if (!data.success) {
        setTasks([]);

        return;
      }

      const colors = [
        "linear-gradient(135deg, #43e97b, #38f9d7)",
        "linear-gradient(135deg, #fa709a, #fee140)",
        "linear-gradient(135deg, #30cfd0, #330867)",
        "linear-gradient(135deg, #f093fb, #f5576c)",
      ];

      const formatted =
        (data.tasks || []).map(
          (t, index) => ({
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
              colors[
                index %
                  colors.length
              ],

            icon: <FaBook />,

            nextDay:
              t.nextDay === true ||
              t.nextDay === 1 ||
              t.nextDay === "1",
          })
        );

      setTasks(formatted);

    } catch (error) {
      console.error(
        "Fetch tasks error:",
        error
      );

      setTasks([]);
    }
  };

  // =========================
  // NEXT DAY
  // =========================

  const isNextDay = (
    from,
    to
  ) => {
    if (!from || !to) {
      return false;
    }

    const f = new Date(
      `2024-01-01 ${from}`
    );

    const t = new Date(
      `2024-01-01 ${to}`
    );

    return t <= f;
  };

  // =========================
  // FORMAT TIME
  // =========================

  const formatTime = (t) => {
    if (!t) {
      return "";
    }

    const [hour, minute] =
      t.split(":");

    let h = parseInt(
      hour,
      10
    );

    const ampm =
      h >= 12
        ? "PM"
        : "AM";

    h = h % 12;

    if (h === 0) {
      h = 12;
    }

    return `${h}:${minute} ${ampm}`;
  };

  // =========================
  // CONVERT TIME
  // =========================

  const convertToInputTime = (
    timeStr
  ) => {
    if (!timeStr) {
      return "";
    }

    try {
      const [
        time,
        modifier,
      ] = timeStr.split(" ");

      let [
        hours,
        minutes,
      ] = time.split(":");

      hours = parseInt(
        hours,
        10
      );

      if (
        modifier === "PM" &&
        hours !== 12
      ) {
        hours += 12;
      }

      if (
        modifier === "AM" &&
        hours === 12
      ) {
        hours = 0;
      }

      return `${hours
        .toString()
        .padStart(2, "0")}:${minutes}`;

    } catch {
      return "";
    }
  };

  // =========================
  // CHANGE DATE
  // =========================

  const changeDate = (
    type
  ) => {
    const newDate =
      new Date(date);

    if (type === "prev") {
      newDate.setDate(
        date.getDate() - 1
      );
    } else {
      newDate.setDate(
        date.getDate() + 1
      );
    }

    setDate(newDate);
  };

  // =========================
  // DELETE TASK
  // =========================

  const deleteTask = async (
    task
  ) => {
    // DEFAULT TASK
    if (
      String(task.id).startsWith("d")
    ) {
      const updated =
        defaultTasks.filter(
          (t) =>
            t.id !== task.id
        );

      setDefaultTasks(updated);

      localStorage.setItem(
        "defaultTasks",
        JSON.stringify(updated)
      );

      window.dispatchEvent(
        new Event("taskUpdated")
      );

      return;
    }

    // DATABASE TASK
    try {
      const response =
        await fetch(
          "https://zyntaweb.com/skilllab/api/dashboard.php",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              action: "delete",
              email: user?.email,
              id: task.id,
            }),
          }
        );

      const data =
        await response.json();

      console.log(
        "DELETE RESPONSE:",
        data
      );

      if (!data.success) {
        alert(
          data.message ||
          data.error ||
          "Delete failed"
        );

        return;
      }

      await fetchTasks();

      window.dispatchEvent(
        new Event("taskUpdated")
      );

    } catch (error) {
      console.error(
        "Delete error:",
        error
      );

      alert(
        "Unable to delete task"
      );
    }
  };

  // ==================================================
  // TOGGLE TASK
  // ==================================================

  const toggleTask = async (
    task
  ) => {
    console.log(
      "CLICKED TASK:",
      task
    );

    // ==================================================
    // DEFAULT TASK
    // ==================================================

    if (
      String(task.id).startsWith("d")
    ) {
      const updated =
        defaultTasks.map(
          (t) =>
            t.id === task.id
              ? {
                  ...t,
                  completed:
                    !Boolean(
                      t.completed
                    ),
                }
              : t
        );

      setDefaultTasks(updated);

      localStorage.setItem(
        "defaultTasks",
        JSON.stringify(updated)
      );

      console.log(
        "DEFAULT TASK UPDATED:",
        updated
      );

      // Tell dashboard
      window.dispatchEvent(
        new Event("taskUpdated")
      );

      return;
    }

    // ==================================================
    // DATABASE TASK
    // ==================================================

    const newStatus =
      task.completed ? 0 : 1;

    console.log(
      "SENDING TO DATABASE:",
      {
        id: task.id,
        email: user?.email,
        status: newStatus,
      }
    );

    try {
      // ------------------------------------------
      // FIRST UPDATE UI
      // ------------------------------------------

      setTasks((prev) =>
        prev.map((t) =>
          String(t.id) ===
          String(task.id)
            ? {
                ...t,
                completed:
                  newStatus === 1,
              }
            : t
        )
      );

      // ------------------------------------------
      // UPDATE DATABASE
      // ------------------------------------------

      const response =
        await fetch(
          "https://zyntaweb.com/skilllab/api/dashboard.php",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              action: "toggle",

              email:
                user?.email,

              id:
                task.id,

              status:
                newStatus,
            }),
          }
        );

      const data =
        await response.json();

      console.log(
        "TOGGLE API RESPONSE:",
        data
      );

      // ------------------------------------------
      // API FAILED
      // ------------------------------------------

      if (!data.success) {
        console.error(
          "Toggle failed:",
          data
        );

        // Revert UI
        setTasks((prev) =>
          prev.map((t) =>
            String(t.id) ===
            String(task.id)
              ? {
                  ...t,
                  completed:
                    Boolean(
                      task.completed
                    ),
                }
              : t
          )
        );

        alert(
          data.message ||
          data.error ||
          "Task status update failed"
        );

        return;
      }

      // ------------------------------------------
      // GET LATEST DATA
      // ------------------------------------------

      await fetchTasks();

      // ------------------------------------------
      // DASHBOARD REFRESH
      // ------------------------------------------

      window.dispatchEvent(
        new Event("taskUpdated")
      );

      console.log(
        "TASK STATUS UPDATED SUCCESSFULLY"
      );

    } catch (error) {
      console.error(
        "Toggle error:",
        error
      );

      // Revert UI
      setTasks((prev) =>
        prev.map((t) =>
          String(t.id) ===
          String(task.id)
            ? {
                ...t,
                completed:
                  Boolean(
                    task.completed
                  ),
              }
            : t
        )
      );

      alert(
        "Unable to update task status"
      );
    }
  };

  // =========================
  // EDIT
  // =========================

  const handleEdit = (
    task
  ) => {
    setShowModal(true);

    setEditTask(task);

    setTitle(
      task.title
    );

    setFromTime(
      convertToInputTime(
        task.from ||
        task.time
      )
    );

    setToTime(
      convertToInputTime(
        task.to
      )
    );
  };

  // =========================
  // ADD / UPDATE
  // =========================

  const handleAddTask =
    async () => {
      if (
        !title ||
        !fromTime
      ) {
        alert(
          "Please enter task title and from time"
        );

        return;
      }

      const colors = [
        "linear-gradient(135deg, #43e97b, #38f9d7)",
        "linear-gradient(135deg, #fa709a, #fee140)",
        "linear-gradient(135deg, #30cfd0, #330867)",
        "linear-gradient(135deg, #f093fb, #f5576c)",
      ];

      const formattedFrom =
        formatTime(
          fromTime
        );

      const formattedTo =
        toTime
          ? formatTime(
              toTime
            )
          : "";

      const nextDay =
        isNextDay(
          fromTime,
          toTime
        );

      // =========================
      // DEFAULT EDIT
      // =========================

      if (
        editTask &&
        String(editTask.id).startsWith("d")
      ) {
        const updated =
          defaultTasks.map(
            (t) =>
              t.id ===
              editTask.id
                ? {
                    ...t,

                    title,

                    from:
                      formattedFrom,

                    to:
                      formattedTo,

                    time:
                      t.time &&
                      !t.from
                        ? formattedFrom
                        : t.time,

                    color:
                      t.color,
                  }
                : t
          );

        setDefaultTasks(
          updated
        );

        localStorage.setItem(
          "defaultTasks",
          JSON.stringify(updated)
        );

        setShowModal(false);

        setEditTask(null);

        setTitle("");

        setFromTime("");

        setToTime("");

        window.dispatchEvent(
          new Event("taskUpdated")
        );

        return;
      }

      // =========================
      // TIME TO MINUTES
      // =========================

      const toMin = (
        time
      ) => {
        if (!time) {
          return 0;
        }

        const [
          t1,
          mod,
        ] = time.split(" ");

        let [
          h,
          m,
        ] = t1
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

        return (
          h * 60 + m
        );
      };

      // =========================
      // OVERLAP CHECK
      // =========================

      const isOverlap =
        [
          ...defaultTasks,
          ...tasks,
        ].some(
          (t) => {
            if (
              !t.from ||
              !t.to
            ) {
              return false;
            }

            if (
              editTask &&
              t.id ===
                editTask.id
            ) {
              return false;
            }

            const newFrom =
              toMin(
                formattedFrom
              );

            let newTo =
              formattedTo
                ? toMin(
                    formattedTo
                  )
                : newFrom;

            const oldFrom =
              toMin(t.from);

            let oldTo =
              toMin(t.to);

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
          }
        );

      if (isOverlap) {
        alert(
          "⚠️ Time already exists! Change time"
        );

        return;
      }

      // =========================
      // SLEEP → WAKE UP
      // =========================

      if (
        title
          ?.toLowerCase()
          .includes("sleep") &&
        formattedTo &&
        nextDay
      ) {
        setDefaultTasks(
          (prev) => {
            const updated =
              prev.map(
                (t) =>
                  t.title
                    ?.toLowerCase() ===
                  "wake up"
                    ? {
                        ...t,
                        time:
                          formattedTo,
                      }
                    : t
              );

            localStorage.setItem(
              "defaultTasks",
              JSON.stringify(
                updated
              )
            );

            return updated;
          }
        );
      }

      // =========================
      // RANDOM COLOR
      // =========================

      const randomColor =
        colors[
          Math.floor(
            Math.random() *
              colors.length
          )
        ];

      // =========================
      // API SAVE
      // =========================

      try {
        const response =
          await fetch(
            "https://zyntaweb.com/skilllab/api/dashboard.php",
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body: JSON.stringify({
                action:
                  editTask
                    ? "update"
                    : "add",

                id:
                  editTask?.id,

                email:
                  user?.email,

                title,

                from:
                  formattedFrom,

                to:
                  formattedTo,

                task_date:
                  currentKey,

                nextDay,

                color:
                  editTask
                    ? editTask.color
                    : randomColor,
              }),
            }
          );

        const data =
          await response.json();

        console.log(
          "SAVE TASK RESPONSE:",
          data
        );

        if (!data.success) {
          alert(
            data.message ||
            data.error ||
            "Task save failed"
          );

          return;
        }

        await fetchTasks();

        window.dispatchEvent(
          new Event("taskUpdated")
        );

      } catch (error) {
        console.error(
          "Save task error:",
          error
        );

        alert(
          "Something went wrong"
        );

        return;
      }

      // =========================
      // RESET
      // =========================

      setEditTask(null);

      setShowModal(false);

      setTitle("");

      setFromTime("");

      setToTime("");

      setImage(null);
    };

  // =========================
  // SORT TIME
  // =========================

  const getTimeMinutes = (
    task
  ) => {
    const value =
      task.from ||
      task.time;

    if (!value) {
      return 0;
    }

    try {
      const [
        time,
        modifier,
      ] = value.split(" ");

      let [
        h,
        m,
      ] = time
        .split(":")
        .map(Number);

      if (
        modifier === "PM" &&
        h !== 12
      ) {
        h += 12;
      }

      if (
        modifier === "AM" &&
        h === 12
      ) {
        h = 0;
      }

      return (
        h * 60 + m
      );

    } catch {
      return 0;
    }
  };

  // =========================
  // ALL TASKS
  // =========================

  const allTasks = [
    ...defaultTasks,
    ...tasks,
  ].sort(
    (a, b) => {
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
        getTimeMinutes(a) -
        getTimeMinutes(b)
      );
    }
  );

  // =========================
  // RENDER
  // =========================

  return (
    <div className="dashboard">

      {/* SIDEBAR */}

      <Sidebar />

      {/* MAIN */}

      <div className="main">

        {/* DATE BAR */}

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

        {/* TASK WRAPPER */}

        <div className="task-wrapper">

          <div className="cards">

            {allTasks.map(
              (task) => (

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

                  {/* ICON */}

                  <div className="icon-box">

                    {typeof task.icon ===
                    "string"
                      ? getIcon(
                          task.icon
                        )
                      : task.icon}

                  </div>

                  {/* CONTENT */}

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
                            task.to ||
                            ""
                          } ${
                            task.nextDay
                              ? "(Next Day)"
                              : ""
                          }`}

                    </p>

                  </div>

                  {/* ACTIONS */}

                  <div className="actions">

                    {/* EDIT */}

                    <button
                      type="button"
                      onClick={() =>
                        handleEdit(
                          task
                        )
                      }
                    >
                      ✏️
                    </button>

                    {/* DELETE */}

                    <button
                      type="button"
                      onClick={() =>
                        deleteTask(
                          task
                        )
                      }
                    >
                      ✕
                    </button>

                    {/* CHECKBOX */}

                    <label
                      className="task-checkbox"
                      onClick={(e) =>
                        e.stopPropagation()
                      }
                    >

                      <input
                        type="checkbox"
                        checked={Boolean(
                          task.completed
                        )}
                        onChange={(e) => {
                          e.stopPropagation();

                          toggleTask(
                            task
                          );
                        }}
                      />

                      <span className="checkmark"></span>

                    </label>

                  </div>

                </div>

              )
            )}

          </div>

          {/* ADD BUTTON */}

          <button
            className="fab-inside"
            onClick={() => {

              setEditTask(null);

              setTitle("");

              setFromTime("");

              setToTime("");

              setImage(null);

              setShowModal(
                true
              );

            }}
          >
            +
          </button>

        </div>

      </div>

      {/* =========================
          MODAL
      ========================= */}

      {showModal && (

        <div className="modal">

          <div className="modal-box">

            <h2>
              {editTask
                ? "Edit Task"
                : "Add New Task"}
            </h2>

            {/* TITLE */}

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

            {/* TIME */}

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

            {/* IMAGE */}

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

            {/* MODAL ACTIONS */}

            <div className="modal-actions">

              <button
                type="button"
                onClick={() => {

                  setShowModal(
                    false
                  );

                  setEditTask(
                    null
                  );

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