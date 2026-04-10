import { useState } from "react";
import Sidebar from "./Sidebar";
import "./dashboard.css";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { FaSun, FaBook, FaLanguage } from "react-icons/fa";

function Dashboard() {
  const [date, setDate] = useState(new Date());

  const [tasks, setTasks] = useState([
    { id: 1, title: "Wake Up", time: "5 AM", icon: <FaSun />, completed: false },
    { id: 2, title: "Study MERN", time: "10 AM", icon: <FaBook />, completed: false },
    { id: 3, title: "Practice English", time: "3 PM", icon: <FaLanguage />, completed: false },
  ]);

  const changeDate = (type) => {
    const newDate = new Date(date);

    if (type === "prev") newDate.setDate(date.getDate() - 1);
    else newDate.setDate(date.getDate() + 1);

    setDate(newDate);
  };

  const formatDate = (d) => {
    return d.toDateString();
  };

  // ✅ DELETE TASK
  const deleteTask = (id) => {
    setTasks(tasks.filter((task) => task.id !== id));
  };

  // ✅ TOGGLE COMPLETE
  const toggleComplete = (id) => {
    setTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  return (
    <div className="dashboard">

      {/* SIDEBAR */}
      <Sidebar />

      {/* MAIN */}
      <div className="main">

        {/* DATE NAV */}
        <div className="date-bar">
          <button onClick={() => changeDate("prev")}>
            <FaChevronLeft />
          </button>

          <span>{formatDate(date)}</span>

          <button onClick={() => changeDate("next")}>
            <FaChevronRight />
          </button>
        </div>

        {/* TASK BOX */}
        <div className="task-wrapper">
          <div className="cards">

            {tasks.map((task) => (
              <div
                className={`card ${task.completed ? "completed" : ""}`}
                key={task.id}
              >

                {/* ICON */}
                <div className="icon-box">
                  {task.icon}
                </div>

                {/* TEXT */}
                <div className="card-content">
                  <h3>{task.title}</h3>
                  <p>{task.time}</p>
                </div>

                {/* RIGHT SIDE */}
                <div className="card-actions">

                  {/* CLOSE */}
                  <button
                    className="close-btn"
                    onClick={() => deleteTask(task.id)}
                  >
                    ✕
                  </button>

                  {/* CHECK */}
                  <input
                    type="checkbox"
                    className="check"
                    checked={task.completed}
                    onChange={() => toggleComplete(task.id)}
                  />

                </div>

              </div>
            ))}

          </div>
        </div>

      </div>
    </div>
  );
}

export default Dashboard;