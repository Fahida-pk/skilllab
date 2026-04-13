import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import "./dashboard.css";

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

  const [tasks, setTasks] = useState([
    {
      id: 1,
      title: "Wake Up",
      time: "5 AM",
      icon: <FaSun />,
      color: "linear-gradient(135deg, #f6d365, #fda085)",
      completed: false,
    },
    {
      id: 2,
      title: "Study MERN",
      from: "5 AM",
      to: "10 AM",
      icon: <FaBook />,
      color: "linear-gradient(135deg, #a18cd1, #fbc2eb)",
      completed: false,
    },
    {
      id: 3,
      title: "Practice English",
      from: "1 PM",
      to: "4 PM",
      icon: <FaLanguage />,
      color: "linear-gradient(135deg, #84fab0, #8fd3f4)",
      completed: false,
    },
    {
      id: 4,
      title: "Workout",
      from: "6 PM",
      to: "7 PM",
      icon: <FaDumbbell />,
      color: "linear-gradient(135deg, #fccb90, #d57eeb)",
      completed: false,
    },
    {
      id: 5,
      title: "Sleep",
      from: "10 PM",
      to: "5 AM",
      icon: "🌙",
      color: "linear-gradient(135deg, #141e30, #243b55)",
      completed: false,
    },
  ]);

  // 🔥 FORMAT TIME
  const formatTime = (t) => {
    if (!t) return "";
    const [hour, minute] = t.split(":");
    let h = parseInt(hour);
    const ampm = h >= 12 ? "PM" : "AM";
    h = h % 12;
    if (h === 0) h = 12;
    return `${h}:${minute} ${ampm}`;
  };

  // 🔥 CONVERT FOR INPUT (EDIT)
  const convertToInputTime = (timeStr) => {
    if (!timeStr) return "";
    const [time, modifier] = timeStr.split(" ");
    let [hours, minutes] = time.split(":");

    if (modifier === "PM" && hours !== "12") {
      hours = parseInt(hours) + 12;
    }
    if (modifier === "AM" && hours === "12") {
      hours = "00";
    }

    return `${hours.toString().padStart(2, "0")}:${minutes}`;
  };

  const wakeUpTime = tasks.find((t) => t.title === "Wake Up")?.time;

  // 🔥 AUTO UPDATE SLEEP
  useEffect(() => {
    if (!wakeUpTime) return;

    setTasks((prev) =>
      prev.map((t) =>
        t.title.toLowerCase().includes("sleep")
          ? { ...t, to: wakeUpTime }
          : t
      )
    );
  }, [wakeUpTime]);

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

  // ADD + UPDATE
  const handleAddTask = () => {
    if (!title || !fromTime) return;

    const colors = [
      "linear-gradient(135deg, #43e97b, #38f9d7)",
      "linear-gradient(135deg, #fa709a, #fee140)",
      "linear-gradient(135deg, #30cfd0, #330867)",
      "linear-gradient(135deg, #f093fb, #f5576c)",
    ];

    let finalTo = "";

    if (title.toLowerCase().includes("sleep")) {
      finalTo = wakeUpTime;
    } else {
      finalTo = toTime ? formatTime(toTime) : "";
    }

    const newTask = {
      id: editTask ? editTask.id : Date.now(),
      title,
      from: formatTime(fromTime),
      to: finalTo,
      icon: image ? (
        <img src={URL.createObjectURL(image)} width="25" />
      ) : (
        <FaBook />
      ),
      color: editTask
        ? editTask.color
        : colors[Math.floor(Math.random() * colors.length)],
      completed: false,
    };

    if (editTask) {
      setTasks(tasks.map((t) => (t.id === editTask.id ? newTask : t)));
    } else {
      setTasks([...tasks, newTask]);
    }

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
        {/* DATE */}
        <div className="date-bar">
          <button onClick={() => changeDate("prev")}>
            <FaChevronLeft />
          </button>

          <span>{date.toDateString()}</span>

          <button onClick={() => changeDate("next")}>
            <FaChevronRight />
          </button>
        </div>

        {/* TASKS */}
        <div className="task-wrapper">
          <div className="cards">
            {tasks.map((task) => (
              <div
                className={`card ${task.completed ? "done" : ""}`}
                key={task.id}
                style={{ background: task.color }}
              >
                <div className="icon-box">{task.icon}</div>

                <div className="card-content">
                  <h3>{task.title}</h3>
                  <p>
                    {task.title === "Wake Up"
                      ? task.time
                      : task.title.toLowerCase().includes("sleep")
                      ? `${task.from} - ${wakeUpTime}`
                      : `${task.from} - ${task.to}`}
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

      {/* MODAL */}
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
                disabled={title.toLowerCase().includes("sleep")}
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