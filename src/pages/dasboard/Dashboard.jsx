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

        const data = await res.json();

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

    await fetch("https://zyntaweb.com/skilllab/dashboard.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        token: localStorage.getItem("token"),
        action: editTask ? "update" : "add",
        id: editTask?.id,
        title,
        from: formattedFrom,
        to: formattedTo,
        task_date: currentKey,
      }),
    });

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

        <div className="cards">
          {tasks.map((task) => (
            <div
              key={task.id}
              className={`card ${task.completed ? "done" : ""}`}
              style={{ background: task.color }}
            >
              <h3>{task.title}</h3>
              <p>
                {task.title === "Wake Up"
                  ? task.time
                  : `${task.from} - ${task.to}`}
              </p>

              <button onClick={() => handleEdit(task)}>✏️</button>
              <button onClick={() => deleteTask(task.id)}>✕</button>

              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => toggleTask(task.id)}
              />
            </div>
          ))}
        </div>

        <button onClick={() => setShowModal(true)}>+</button>
      </div>

      {showModal && (
        <div className="modal">
          <input value={title} onChange={(e) => setTitle(e.target.value)} />
          <input type="time" value={fromTime} onChange={(e) => setFromTime(e.target.value)} />
          <input type="time" value={toTime} onChange={(e) => setToTime(e.target.value)} />

          <button onClick={handleAddTask}>
            {editTask ? "Update" : "Add"}
          </button>
        </div>
      )}
    </div>
  );
}

export default Dashboard;