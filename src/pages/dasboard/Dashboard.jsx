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
    {
  id: 5,
  title: "Sleep",
  icon: "🌙",
  color: "linear-gradient(135deg, #141e30, #243b55)",
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
  const getPreviousTaskTime = (id) => {
  const index = tasks.findIndex(t => t.id === id);

  // First task (Wake Up)
  if (index === 0) return tasks[0]?.time;

  return tasks[index - 1]?.time;
};
  // TOGGLE
  const toggleTask = (id) => {
    setTasks(
      tasks.map((t) =>
        t.id === id ? { ...t, completed: !t.completed } : t
      )
    );
  };

  // ADD TASK
  const handleAddTask = () => {
    if (!title) return;

    const colors = [
      "linear-gradient(135deg, #43e97b, #38f9d7)",
      "linear-gradient(135deg, #fa709a, #fee140)",
      "linear-gradient(135deg, #30cfd0, #330867)",
      "linear-gradient(135deg, #f093fb, #f5576c)",
    ];

    const formattedTime = time
      ? new Date(`1970-01-01T${time}`).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
      : "Now";

    const newTask = {
      id: Date.now(),
      title,
      time: formattedTime,
      icon: image ? (
        <img src={URL.createObjectURL(image)} width="25" />
      ) : (
        <FaBook />
      ),
      color: colors[Math.floor(Math.random() * colors.length)],
      completed: false,
    };

    setTasks([...tasks, newTask]);

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
                <div className="icon-box">{task.icon}</div>

                <div className="card-content">
                  <h3>{task.title}</h3>
                <p>
  {task.title === "Wake Up"
    ? task.time
    : task.title === "Sleep"
    ? `10 PM - ${tasks.find(t => t.title === "Wake Up")?.time}`
    : `${getPreviousTaskTime(task.id)} - ${task.time}`}
</p>
                </div>

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

          {/* ROUND + BUTTON */}
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
            <h2>Add New Task</h2>

            <div className="input-group">
              <label>Task Title</label>
              <input
                type="text"
                placeholder="Enter task..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="input-group">
              <label>Time</label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
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
              <button
                className="cancel"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>

              <button className="ok" onClick={handleAddTask}>
                Add Task
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;