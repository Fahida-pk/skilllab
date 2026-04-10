import { useState } from "react";
import Sidebar from "./Sidebar";
import "./dashboard.css";
import { FaChevronLeft, FaChevronRight, FaSun, FaBook, FaLanguage } from "react-icons/fa";

function Dashboard() {
  const [date, setDate] = useState(new Date());

  const [tasks, setTasks] = useState([
    { id: 1, title: "Wake Up", time: "5 AM", icon: <FaSun />, completed: false },
    { id: 2, title: "Study MERN", time: "10 AM", icon: <FaBook />, completed: false },
    { id: 3, title: "Practice English", time: "3 PM", icon: <FaLanguage />, completed: false },
  ]);

  const changeDate = (type) => {
    const newDate = new Date(date);
    type === "prev"
      ? newDate.setDate(date.getDate() - 1)
      : newDate.setDate(date.getDate() + 1);
    setDate(newDate);
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter((t) => t.id !== id));
  };

  const toggleTask = (id) => {
    setTasks(
      tasks.map((t) =>
        t.id === id ? { ...t, completed: !t.completed } : t
      )
    );
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
              <div className={`card ${task.completed ? "done" : ""}`} key={task.id}>

                {/* LEFT ICON */}
                <div className="icon-box">
                  {task.icon}
                </div>

                {/* TEXT */}
                <div className="card-content">
                  <h3>{task.title}</h3>
                  <p>{task.time}</p>
                </div>

                {/* RIGHT SIDE */}
                <div className="actions">

                  {/* CLOSE */}
                  <button onClick={() => deleteTask(task.id)}>✕</button>

                  {/* CHECK */}
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => toggleTask(task.id)}
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