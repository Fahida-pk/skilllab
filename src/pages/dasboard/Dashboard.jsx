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

  const getDateKey = (d) => d.toISOString().split("T")[0];
  const currentKey = getDateKey(date);

  const [tasksByDate, setTasksByDate] = useState({});
  const tasks = tasksByDate[currentKey] || [];

  // =========================
  // ✅ FETCH + DEFAULT MERGE
  // =========================
  useEffect(() => {
    const fetchTasks = async () => {
      const token = localStorage.getItem("token");

      try {
        const res = await fetch("https://zyntaweb.com/skilllab/dashboard.php", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            token,
            action: "get",
            task_date: currentKey,
          }),
        });

const text = await res.text();
console.log("SERVER RESPONSE:", text);

let data;
try {
  data = JSON.parse(text);
} catch (e) {
  alert("Server error");
  return;
}
        const defaultTasks = [
          {
            id: "d1",
            title: "Wake Up",
            time: "5:45 AM",
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
            to: "5:20 AM",
            icon: "🌙",
            color: "linear-gradient(135deg, #141e30, #243b55)",
            completed: false,
            nextDay: true,
          },
        ];

        const merged = [...defaultTasks, ...(data.tasks || [])];

        setTasksByDate((prev) => ({
          ...prev,
          [currentKey]: merged,
        }));
      } catch (err) {
        console.log(err);
      }
    };

    fetchTasks();
  }, [date]);

  // =========================
  // FORMAT
  // =========================
  const formatTime = (t) => {
    const [h, m] = t.split(":");
    let hour = parseInt(h);
    const ampm = hour >= 12 ? "PM" : "AM";
    hour = hour % 12 || 12;
    return `${hour}:${m} ${ampm}`;
  };

  const convertToInputTime = (timeStr) => {
    if (!timeStr) return "";
    const [time, mod] = timeStr.split(" ");
    let [h, m] = time.split(":");
    h = parseInt(h);
    if (mod === "PM" && h !== 12) h += 12;
    if (mod === "AM" && h === 12) h = 0;
    return `${h.toString().padStart(2, "0")}:${m}`;
  };

  const changeDate = (type) => {
    const newDate = new Date(date);
    type === "prev"
      ? newDate.setDate(date.getDate() - 1)
      : newDate.setDate(date.getDate() + 1);
    setDate(newDate);
  };

  // =========================
  // DELETE (DB + UI)
  // =========================
  const deleteTask = async (id) => {
    await fetch("https://zyntaweb.com/skilllab/dashboard.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        token: localStorage.getItem("token"),
        action: "delete",
        id,
      }),
    });

    setTasksByDate((prev) => ({
      ...prev,
      [currentKey]: tasks.filter((t) => t.id !== id),
    }));
  };

  // =========================
  // TOGGLE
  // =========================
  const toggleTask = (id) => {
    const updated = tasks.map((t) =>
      t.id === id ? { ...t, completed: !t.completed } : t
    );

    setTasksByDate((prev) => ({
      ...prev,
      [currentKey]: updated,
    }));
  };

  // =========================
  // EDIT
  // =========================
  const handleEdit = (task) => {
    setShowModal(true);
    setEditTask(task);
    setTitle(task.title);
    setFromTime(convertToInputTime(task.from));
    setToTime(convertToInputTime(task.to));
  };

  // =========================
  // ADD / UPDATE (DB + UI)
  // =========================
  const handleAddTask = async () => {
  if (!title || !fromTime) return;

  const formattedFrom = formatTime(fromTime);
  const formattedTo = toTime ? formatTime(toTime) : "";

  const token = localStorage.getItem("token");

  console.log("TOKEN:", token); // 🔥 DEBUG

  const res = await fetch("https://zyntaweb.com/skilllab/dashboard.php", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      token,
      action: editTask ? "update" : "add",
      id: editTask ? editTask.id : null,
      title,
      from: formattedFrom,
      to: formattedTo,
      task_date: currentKey,
    }),
  });

  const data = await res.json();
  console.log("ADD RESPONSE:", data);

  // ❗ IMPORTANT CHECK
  if (!data.success) {
    alert(data.message);
    return;
  }

  const newTask = {
    id: editTask ? editTask.id : Date.now(),
    title,
    from: formattedFrom,
    to: formattedTo,
    color: "linear-gradient(135deg,#43e97b,#38f9d7)",
    completed: false,
  };

  let updated = editTask
    ? tasks.map((t) => (t.id === editTask.id ? newTask : t))
    : [...tasks, newTask];

  setTasksByDate((prev) => ({
    ...prev,
    [currentKey]: updated,
  }));

  setEditTask(null);
  setShowModal(false);
  setTitle("");
  setFromTime("");
  setToTime("");
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
            {tasks.map((task) => (
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
  ) : null}
</div>
                <div className="card-content">
                  <h3>{task.title}</h3>
                  <p>
                    {task.title === "Wake Up"
                      ? task.time
                      : `${task.from} - ${task.to} ${
                          task.nextDay ? "(Next Day)" : ""
                        }`}
                  </p>
                </div>

                <div className="actions">
                  <button onClick={() => handleEdit(task)}>✏️</button>
                  <button onClick={() => deleteTask(task.id)}>✕</button>
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => toggleTask(task.id)}
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