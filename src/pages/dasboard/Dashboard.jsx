import Sidebar from "./Sidebar";
import "./dashboard.css";
import { useState, useEffect } from "react";
import {
  FaChevronLeft,
  FaChevronRight,
  FaSun,
  FaBook,
} from "react-icons/fa";

function Dashboard() {
  const [date, setDate] = useState(new Date());

  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState("");
  const [fromTime, setFromTime] = useState("");
  const [toTime, setToTime] = useState("");
  const [editTask, setEditTask] = useState(null);

  const API_URL = "https://zyntaweb.com/skilllab/dashboard.php";
  const token = localStorage.getItem("token");

  const getDateKey = (d) => d.toISOString().split("T")[0];
  const currentKey = getDateKey(date);

  const [tasks, setTasks] = useState([]);

  // ✅ DEFAULT TASKS (UI ONLY)
  const defaultTasks = [
    {
      id: 1,
      title: "Wake Up",
      time: "5:45 AM",
      icon: "sun",
      color: "linear-gradient(135deg, #f6d365, #fda085)",
      completed: false,
      isDefault: true,
    },
    {
      id: 2,
      title: "Study MERN",
      from: "5:00 AM",
      to: "10:00 AM",
      icon: "book",
      color: "linear-gradient(135deg, #a18cd1, #fbc2eb)",
      completed: false,
      isDefault: true,
    },
    {
      id: 3,
      title: "Practice English",
      from: "1:00 PM",
      to: "4:00 PM",
      icon: "book",
      color: "linear-gradient(135deg, #84fab0, #8fd3f4)",
      completed: false,
      isDefault: true,
    },
    {
      id: 4,
      title: "Workout",
      from: "6:00 PM",
      to: "7:00 PM",
      icon: "book",
      color: "linear-gradient(135deg, #fccb90, #d57eeb)",
      completed: false,
      isDefault: true,
    },
    {
      id: 5,
      title: "Sleep",
      from: "10:00 PM",
      to: "5:20 AM",
      icon: "moon",
      color: "linear-gradient(135deg, #141e30, #243b55)",
      completed: false,
      nextDay: true,
      isDefault: true,
    },
  ];

  // 🔥 FETCH TASKS
  useEffect(() => {
    fetchTasks();
  }, [date]);

  const fetchTasks = async () => {
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          action: "get",
          task_date: currentKey,
        }),
      });

      const data = await res.json();

      if (data.success) {
        if (data.tasks.length === 0) {
          setTasks(defaultTasks);
        } else {
          setTasks(data.tasks);
        }
      }
    } catch (err) {
      console.log("Fetch error:", err);
      setTasks(defaultTasks);
    }
  };

  // TIME FORMAT
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

  const changeDate = (type) => {
    const newDate = new Date(date);
    type === "prev"
      ? newDate.setDate(date.getDate() - 1)
      : newDate.setDate(date.getDate() + 1);
    setDate(newDate);
  };

  // DELETE
  const deleteTask = async (id) => {
    await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token,
        action: "delete",
        id,
      }),
    });

    fetchTasks();
  };

  // TOGGLE
  const toggleTask = (id) => {
    const updated = tasks.map((t) =>
      t.id === id ? { ...t, completed: !t.completed } : t
    );
    setTasks(updated);
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

    const formattedFrom = formatTime(fromTime);
    const formattedTo = toTime ? formatTime(toTime) : "";

    if (editTask && !editTask.isDefault) {
      await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          action: "update",
          id: editTask.id,
          title,
          from: formattedFrom,
          to: formattedTo,
        }),
      });
    } else {
      await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          action: "add",
          title,
          from: formattedFrom,
          to: formattedTo,
          task_date: currentKey,
        }),
      });
    }

    fetchTasks();

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
                  {task.icon === "sun" ? (
                    <FaSun />
                  ) : task.icon === "book" ? (
                    <FaBook />
                  ) : task.icon === "moon" ? (
                    "🌙"
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

          <button className="fab-inside" onClick={() => setShowModal(true)}>
            +
          </button>
        </div>
      </div>

      {showModal && (
        <div className="modal">
          <div className="modal-box">
            <h2>{editTask ? "Edit Task" : "Add New Task"}</h2>

            <input
              type="text"
              placeholder="Task Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <input
              type="time"
              value={fromTime}
              onChange={(e) => setFromTime(e.target.value)}
            />

            <input
              type="time"
              value={toTime}
              onChange={(e) => setToTime(e.target.value)}
            />

            <button onClick={handleAddTask}>
              {editTask ? "Update" : "Add"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;