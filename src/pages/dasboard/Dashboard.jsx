import Sidebar from "./Sidebar";
import "./dashboard.css";
import { useState, useEffect } from "react";
import {
  FaChevronLeft,
  FaChevronRight,
  FaSun,
  FaBook,
  FaLanguage,
  FaDumbbell,
} from "react-icons/fa";

function Dashboard() {
  const [date, setDate] = useState(new Date());

  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState("");
  const [fromTime, setFromTime] = useState("");
  const [toTime, setToTime] = useState("");
  const [image, setImage] = useState(null);
  const [editTask, setEditTask] = useState(null);
const user = JSON.parse(localStorage.getItem("user"));
  // ✅ DATE KEY
  const getDateKey = (d) => d.toISOString().split("T")[0];
  const currentKey = getDateKey(date);

  // ✅ DATE-WISE TASKS
const [tasks, setTasks] = useState([]);
const [defaultTasks, setDefaultTasks] = useState([
  {
    id: "d1",
    title: "Wake Up",
    time: "5:00 AM",
    icon: <FaSun />,
    color: "linear-gradient(135deg, #f6d365, #fda085)",
    completed: false,
  },
  {
    id: "d2",
    title: "Study MERN",
    from: "5:00 AM",
    to: "10:00 AM",
    icon: <FaBook />,
    color: "linear-gradient(135deg, #a18cd1, #fbc2eb)",
    completed: false,
  },
  {
    id: "d3",
    title: "Practice English",
    from: "1:00 PM",
    to: "4:00 PM",
    icon: <FaLanguage />,
    color: "linear-gradient(135deg, #84fab0, #8fd3f4)",
    completed: false,
  },
  {
    id: "d4",
    title: "Workout",
    from: "6:00 PM",
    to: "7:00 PM",
    icon: <FaDumbbell />,
    color: "linear-gradient(135deg, #fccb90, #d57eeb)",
    completed: false,
  },
  {
    id: "d5",
    title: "Sleep",
    from: "10:00 PM",
    to: "8:00 AM",
    icon: "🌙",
    color: "linear-gradient(135deg, #141e30, #243b55)",
    completed: false,
    nextDay: true,
  },
]);
useEffect(() => {
  const saved = localStorage.getItem("defaultTasks");
  if (saved) {
    setDefaultTasks(JSON.parse(saved));
  }
}, []);

useEffect(() => {
  localStorage.setItem("defaultTasks", JSON.stringify(defaultTasks));
}, [defaultTasks]);
  // ✅ DEFAULT TASKS LOAD
 useEffect(() => {
  fetchTasks();
}, [currentKey]);

const fetchTasks = async () => {
  const res = await fetch("https://zyntaweb.com/skilllab/api/dashboard.php", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
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
const formatted = data.tasks.map((t) => ({
  id: t.id,
  title: t.title,
  from: t.from,
  to: t.to,
  completed: t.completed,
  color: t.color || colors[Math.floor(Math.random() * colors.length)],
  icon: "book",
}));

setTasks(formatted);
} else {
    setTasks([]);
  }
}; // 🔥 IMPORTANT change (date → currentKey)

  // 🔥 CHECK NEXT DAY
  const isNextDay = (from, to) => {
    if (!from || !to) return false;
    const f = new Date(`2024-01-01 ${from}`);
    const t = new Date(`2024-01-01 ${to}`);
    return t <= f;
  };

  // FORMAT TIME
  const formatTime = (t) => {
    if (!t) return "";
    const [hour, minute] = t.split(":");
    let h = parseInt(hour);
    const ampm = h >= 12 ? "PM" : "AM";
    h = h % 12;
    if (h === 0) h = 12;
    return `${h}:${minute} ${ampm}`;
  };

  const convertToInputTime = (timeStr) => {
    if (!timeStr) return "";
    try {
      const [time, modifier] = timeStr.split(" ");
      let [hours, minutes] = time.split(":");

      hours = parseInt(hours);

      if (modifier === "PM" && hours !== 12) hours += 12;
      if (modifier === "AM" && hours === 12) hours = 0;

      return `${hours.toString().padStart(2, "0")}:${minutes}`;
    } catch {
      return "";
    }
  };

  // DATE CHANGE
  const changeDate = (type) => {
    const newDate = new Date(date);
    type === "prev"
      ? newDate.setDate(date.getDate() - 1)
      : newDate.setDate(date.getDate() + 1);
    setDate(newDate);
  };

  // DELETE
  const deleteTask = async (task) => {
  // ✅ default task
  if (task.id.toString().startsWith("d")) {
    setDefaultTasks((prev) => prev.filter((t) => t.id !== task.id));
    return;
  }

  // ✅ DB task
  await fetch("https://zyntaweb.com/skilllab/api/dashboard.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "delete",
      email: user?.email,
      id: task.id,
    }),
  });

  fetchTasks();
};

  // TOGGLE
  const toggleTask = async (task) => {
  // ✅ default task
  if (task.id.toString().startsWith("d")) {
    const updated = defaultTasks.map((t) =>
      t.id === task.id ? { ...t, completed: !t.completed } : t
    );
    setDefaultTasks(updated);
    return;
  }

  // ✅ DB task
  await fetch("https://zyntaweb.com/skilllab/api/dashboard.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "toggle",
      email: user?.email,
      id: task.id,
      status: task.completed ? 0 : 1,
    }),
  });

  fetchTasks();
};

  // EDIT
  const handleEdit = (task) => {
    setShowModal(true);
    setEditTask(task);

    setTitle(task.title);
    setFromTime(convertToInputTime(task.from));
    setToTime(convertToInputTime(task.to));
  };

  // ADD / UPDATE
 const handleAddTask = async () => {
  if (!title || !fromTime) return;

  const colors = [
    "linear-gradient(135deg, #43e97b, #38f9d7)",
    "linear-gradient(135deg, #fa709a, #fee140)",
    "linear-gradient(135deg, #30cfd0, #330867)",
    "linear-gradient(135deg, #f093fb, #f5576c)",
  ];

  const formattedFrom = formatTime(fromTime);
  const formattedTo = toTime ? formatTime(toTime) : "";

  const nextDay = isNextDay(fromTime, toTime);

  // =========================
  // ✅ DEFAULT EDIT (NO DB)
  // =========================
  if (editTask && editTask.id.toString().startsWith("d")) {
    const updated = defaultTasks.map((t) =>
      t.id === editTask.id
        ? {
            ...t,
            title,
            from: formattedFrom,
            to: formattedTo,
            color: t.color,
          }
        : t
    );

    setDefaultTasks(updated);

    setShowModal(false);
    setEditTask(null);
    setTitle("");
    setFromTime("");
    setToTime("");

    return;
  }

  // =========================
  // 🚨 OVERLAP CHECK
  // =========================
// =========================
// 🚨 OVERLAP CHECK (FIXED)
// =========================
const toMin = (time) => {
  const [t1, mod] = time.split(" ");
  let [h, m] = t1.split(":").map(Number);
  if (mod === "PM" && h !== 12) h += 12;
  if (mod === "AM" && h === 12) h = 0;
  return h * 60 + m;
};

const isOverlap = [...defaultTasks, ...tasks].some((t) => {
  if (!t.from || !t.to) return false;

  if (editTask && t.id === editTask.id) return false;

  let newFrom = toMin(formattedFrom);
  let newTo = formattedTo ? toMin(formattedTo) : newFrom;

  let oldFrom = toMin(t.from);
  let oldTo = toMin(t.to);

  // 🌙 next day fix
  if (t.nextDay) oldTo += 1440;
  if (nextDay) newTo += 1440;

  return newFrom < oldTo && newTo > oldFrom;
});

if (isOverlap) {
  alert("⚠️ Time already exists! Change time");
  return;
}

  // =========================
  // 🌙 SLEEP → NEXT DAY WAKE
  // =========================
  if (
    title?.toLowerCase().includes("sleep") &&
    formattedTo &&
    nextDay
  ) {
    setDefaultTasks((prev) =>
      prev.map((t) =>
        t.title?.toLowerCase() === "wake up"
          ? { ...t, time: formattedTo }
          : t
      )
    );
  }

  // =========================
  // 🎨 COLOR
  // =========================
  const randomColor =
    colors[Math.floor(Math.random() * colors.length)];

  // =========================
  // ✅ API CALL (DB)
  // =========================
  await fetch("https://zyntaweb.com/skilllab/api/dashboard.php", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      action: editTask ? "update" : "add",
      id: editTask?.id,
      email: user?.email,
      title,
      from: formattedFrom,
      to: formattedTo,
      task_date: currentKey,
      nextDay,
      color: editTask ? editTask.color : randomColor,
    }),
  });

  // =========================
  // 🔄 REFRESH
  // =========================
  fetchTasks();

  // =========================
  // 🧹 RESET
  // =========================
  setEditTask(null);
  setShowModal(false);
  setTitle("");
  setFromTime("");
  setToTime("");
  setImage(null);
};
  return (
    <div className="dashboard">
      <Sidebar />

      <div className="main">
        <div className="date-bar">
          <button onClick={() => changeDate("prev")}>
            <FaChevronLeft />
          </button>

          <span>{date.toDateString()}</span>

          <button onClick={() => changeDate("next")}>
            <FaChevronRight />
          </button>
        </div>

  <div className="task-wrapper">
  <div className="cards">
    {[...defaultTasks, ...tasks]
      .sort((a, b) => {
        const getTime = (t) => {
          if (!t) return 0;
          const [time, mod] = t.split(" ");
          let [h, m] = time.split(":").map(Number);

          if (mod === "PM" && h !== 12) h += 12;
          if (mod === "AM" && h === 12) h = 0;

          return h * 60 + m;
        };

        // 🌙 Sleep last
        if (a.nextDay && !b.nextDay) return 1;
        if (!a.nextDay && b.nextDay) return -1;

        return getTime(a.from || a.time) - getTime(b.from || b.time);
      })
      .map((task) => (
        <div
          className={`card ${task.completed ? "done" : ""}`}
          key={task.id}
          style={{ background: task.color }}
        >
          <div className="icon-box">
            {task.icon === "book" ? (
              <FaBook />
            ) : typeof task.icon === "string" ? (
              <img src={task.icon} width="25" />
            ) : (
              task.icon
            )}
          </div>

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
            <button onClick={() => handleEdit(task)}>✏️</button>
            <button onClick={() => deleteTask(task)}>✕</button>
            <input
              type="checkbox"
              checked={task.completed}
              onChange={() => toggleTask(task)}
            />
          </div>
        </div>
      ))}
  </div>

  <button
    className="fab-inside"
    onClick={() => setShowModal(true)}
  >
    +
  </button>
</div>

       </div>

      {showModal && (
        <div className="modal">
          <div className="modal-box">
            <h2>{editTask ? "Edit Task" : "Add New Task"}</h2>

            <div className="input-group">
              <label>Task Title</label>
              <input
                type="text"
                value={title}
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
                onChange={(e) => setImage(e.target.files[0])}
              />
            </div>

            <div className="modal-actions">
              <button onClick={() => setShowModal(false)}>Cancel</button>
              <button onClick={handleAddTask}>
                {editTask ? "Update" : "Add"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;