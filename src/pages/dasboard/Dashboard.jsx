import { useState } from "react";
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

  // ✅ DATE KEY
  const getDateKey = (d) => d.toISOString().split("T")[0];

  const dateKey = getDateKey(date);

  // ✅ STORE TASKS DATE-WISE
  const [tasksByDate, setTasksByDate] = useState({
    [dateKey]: [
      {
        id: 1,
        title: "Wake Up",
        time: "5:00 AM",
        icon: <FaSun />,
        color: "linear-gradient(135deg, #f6d365, #fda085)",
        completed: false,
      },
    ],
  });

  const tasks = tasksByDate[dateKey] || [];

  // 🔥 CHECK NEXT DAY
  const isNextDay = (from, to) => {
    if (!from || !to) return false;
    const f = new Date(`2024-01-01 ${from}`);
    const t = new Date(`2024-01-01 ${to}`);
    return t <= f;
  };

  // FORMAT
  const formatTime = (t) => {
    if (!t) return "";
    const [hour, minute] = t.split(":");
    let h = parseInt(hour);
    const ampm = h >= 12 ? "PM" : "AM";
    h = h % 12;
    if (h === 0) h = 12;
    return `${h}:${minute} ${ampm}`;
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
    const updated = tasks.filter((t) => t.id !== id);

    setTasksByDate((prev) => ({
      ...prev,
      [dateKey]: updated,
    }));
  };

  // TOGGLE
  const toggleTask = (id) => {
    const updated = tasks.map((t) =>
      t.id === id ? { ...t, completed: !t.completed } : t
    );

    setTasksByDate((prev) => ({
      ...prev,
      [dateKey]: updated,
    }));
  };

  // EDIT
  const handleEdit = (task) => {
    setShowModal(true);
    setEditTask(task);

    setTitle(task.title);
    setFromTime("");
    setToTime("");
  };

  // ADD / UPDATE
  const handleAddTask = () => {
    if (!title || !fromTime) return;

    const formattedFrom = formatTime(fromTime);
    const formattedTo = toTime ? formatTime(toTime) : "";

    const nextDay = isNextDay(fromTime, toTime);

    let updatedToday = [...tasks];

    const newTask = {
      id: editTask ? editTask.id : Date.now(),
      title,
      from: formattedFrom,
      to: formattedTo,
      nextDay,
      icon: <FaBook />,
      color: "linear-gradient(135deg, #30cfd0, #330867)",
      completed: false,
    };

    if (editTask) {
      updatedToday = updatedToday.map((t) =>
        t.id === editTask.id ? newTask : t
      );
    } else {
      updatedToday.push(newTask);
    }

    // 🔥 NEXT DAY WAKE UP FIX
    let updatedNextDayTasks = [];

    if (title.toLowerCase().includes("sleep") && formattedTo) {
      const nextDate = new Date(date);
      nextDate.setDate(date.getDate() + 1);
      const nextKey = getDateKey(nextDate);

      const nextDayTasks = tasksByDate[nextKey] || [];

      updatedNextDayTasks = nextDayTasks.map((t) =>
        t.title === "Wake Up"
          ? { ...t, time: formattedTo }
          : t
      );
    }

    setTasksByDate((prev) => {
      const nextDate = new Date(date);
      nextDate.setDate(date.getDate() + 1);
      const nextKey = getDateKey(nextDate);

      return {
        ...prev,
        [dateKey]: updatedToday,
        ...(updatedNextDayTasks.length > 0 && {
          [nextKey]: updatedNextDayTasks,
        }),
      };
    });

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
                <div className="icon-box">{task.icon}</div>

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