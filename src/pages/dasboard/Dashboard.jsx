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
  const [time, setTime] = useState("");
  const [image, setImage] = useState(null);

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
      time: "10 AM",
      icon: <FaBook />,
      color: "linear-gradient(135deg, #a18cd1, #fbc2eb)",
      completed: false,
    },
    {
      id: 3,
      title: "Practice English",
      time: "3 PM",
      icon: <FaLanguage />,
      color: "linear-gradient(135deg, #84fab0, #8fd3f4)",
      completed: false,
    },
    {
      id: 4,
      title: "Workout",
      time: "6 PM",
      icon: <FaDumbbell />,
      color: "linear-gradient(135deg, #fccb90, #d57eeb)",
      completed: false,
    },
  ]);

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

  // ADD TASK FROM MODAL
  const handleAddTask = () => {
    if (!title) return;

    const colors = [
      "linear-gradient(135deg, #43e97b, #38f9d7)",
      "linear-gradient(135deg, #fa709a, #fee140)",
      "linear-gradient(135deg, #30cfd0, #330867)",
      "linear-gradient(135deg, #f093fb, #f5576c)",
    ];

    const newTask = {
      id: Date.now(),
      title,
      time: time || "Now",
      icon: image
        ? <img src={URL.createObjectURL(image)} width="25" />
        : <FaBook />,
      color: colors[Math.floor(Math.random() * colors.length)],
      completed: false,
    };

    setTasks([...tasks, newTask]);

    // reset
    setShowModal(false);
    setTitle("");
    setTime("");
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

        {/* TASK BOX */}
        <div className="task-wrapper">
          <div className="cards">
            {tasks.map((task) => (
              <div
                className={`card ${task.completed ? "done" : ""}`}
                key={task.id}
                style={{ background: task.color }}
              >
                {/* ICON */}
                <div className="icon-box">{task.icon}</div>

                {/* TEXT */}
                <div className="card-content">
                  <h3>{task.title}</h3>
                  <p>{task.time}</p>
                </div>

                {/* ACTIONS */}
                <div className="actions">
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

          {/* FLOAT BUTTON */}
          <button className="fab" onClick={() => setShowModal(true)}>
            +
          </button>
        </div>
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="modal">
          <div className="modal-box">
            <h2>Add Task</h2>

            <input
              type="text"
              placeholder="Task title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />

            <input
              type="file"
              onChange={(e) => setImage(e.target.files[0])}
            />

            <div className="modal-actions">
              <button onClick={() => setShowModal(false)}>Cancel</button>
              <button onClick={handleAddTask}>OK</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;