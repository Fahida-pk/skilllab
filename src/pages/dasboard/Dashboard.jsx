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

  // 🔥 ICON RENDER FUNCTION
  const getIcon = (icon) => {
    switch (icon) {
      case "sun":
        return <FaSun />;
      case "book":
        return <FaBook />;
      case "language":
        return <FaLanguage />;
      case "gym":
        return <FaDumbbell />;
      case "sleep":
        return "🌙";
      default:
        return <FaBook />;
    }
  };

  // 🔥 CHECK NEXT DAY
  const isNextDay = (from, to) => {
    if (!from || !to) return false;
    const f = new Date(`2024-01-01 ${from}`);
    const t = new Date(`2024-01-01 ${to}`);
    return t <= f;
  };

  // 🔥 TASK STATE
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem("tasks");
    return saved
      ? JSON.parse(saved)
      : [
          {
            id: 1,
            title: "Wake Up",
            time: "5:00 AM",
            icon: "sun",
            color: "linear-gradient(135deg, #f6d365, #fda085)",
            completed: false,
          },
          {
            id: 2,
            title: "Study MERN",
            from: "5:00 AM",
            to: "10:00 AM",
            icon: "book",
            color: "linear-gradient(135deg, #a18cd1, #fbc2eb)",
            completed: false,
          },
          {
            id: 3,
            title: "Practice English",
            from: "1:00 PM",
            to: "4:00 PM",
            icon: "language",
            color: "linear-gradient(135deg, #84fab0, #8fd3f4)",
            completed: false,
          },
          {
            id: 4,
            title: "Workout",
            from: "6:00 PM",
            to: "7:00 PM",
            icon: "gym",
            color: "linear-gradient(135deg, #fccb90, #d57eeb)",
            completed: false,
          },
          {
            id: 5,
            title: "Sleep",
            from: "10:00 PM",
            to: "5:00 AM",
            icon: "sleep",
            color: "linear-gradient(135deg, #141e30, #243b55)",
            completed: false,
          },
        ];
  });

  // SAVE LOCALSTORAGE
  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  // WAKE UP UPDATE
  useEffect(() => {
    const nextWake = localStorage.getItem("nextWakeUp");

    if (nextWake) {
      setTasks((prev) =>
        prev.map((t) =>
          t.title === "Wake Up" ? { ...t, time: nextWake } : t
        )
      );
      localStorage.removeItem("nextWakeUp");
    }
  }, []);

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

  // CONVERT INPUT
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
  const deleteTask = (id) => {
    setTasks(tasks.filter((t) => t.id !== id));
  };

  // TOGGLE
  const toggleTask = (id) => {
    setTasks(
      tasks.map((t) =>
        t.id === id ? { ...t, completed: !t.completed } : t
      )
    );
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
  const handleAddTask = () => {
    if (!title || !fromTime) return;

    const formattedFrom = formatTime(fromTime);
    const formattedTo = toTime ? formatTime(toTime) : "";

    const nextDay = isNextDay(fromTime, toTime);

    // 🔥 Sleep → update next day wake up
    if (title.toLowerCase().includes("sleep") && formattedTo && nextDay) {
      localStorage.setItem("nextWakeUp", formattedTo);
    }

    const newTask = {
      id: editTask ? editTask.id : Date.now(),
      title,
      from: formattedFrom,
      to: formattedTo,
      nextDay,
      icon: image ? URL.createObjectURL(image) : "book",
      color: editTask
        ? editTask.color
        : "linear-gradient(135deg, #43e97b, #38f9d7)",
      completed: false,
    };

    let updatedTasks = editTask
      ? tasks.map((t) => (t.id === editTask.id ? newTask : t))
      : [...tasks, newTask];

    setTasks(updatedTasks);

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
            {tasks.map((task) => (
              <div
                className={`card ${task.completed ? "done" : ""}`}
                key={task.id}
                style={{ background: task.color }}
              >
                <div className="icon-box">
                  {task.icon?.startsWith("blob:")
                    ? <img src={task.icon} width="25" />
                    : getIcon(task.icon)}
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
            <h2>{editTask ? "Edit Task" : "Add Task"}</h2>

            <input
              type="text"
              placeholder="Title"
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

            <input
              type="file"
              onChange={(e) => setImage(e.target.files[0])}
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