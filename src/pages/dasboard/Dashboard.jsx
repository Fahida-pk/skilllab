import { useState } from "react";
import Sidebar from "./Sidebar";
import "./dashboard.css";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

function Dashboard() {
  const [date, setDate] = useState(new Date());

  const [tasks, setTasks] = useState([
    { id: 1, title: "Get up early", color: "yellow", completed: true },
    { id: 2, title: "Make bed", color: "pink", completed: true },
    { id: 3, title: "Stay hydrated", color: "green", completed: false },
    { id: 4, title: "Go on a walk", color: "blue", completed: false },
    { id: 5, title: "Clean my room", color: "purple", completed: false },
    { id: 6, title: "Start to study", color: "pink2", completed: false },
  ]);

  const changeDate = (type) => {
    const newDate = new Date(date);
    type === "prev"
      ? newDate.setDate(date.getDate() - 1)
      : newDate.setDate(date.getDate() + 1);
    setDate(newDate);
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

        {/* SCROLL BOX */}
        <div className="task-wrapper">
          <div className="cards">

            {tasks.map((task) => (
              <div className={`task ${task.color}`} key={task.id}>

                <span className="task-text">{task.title}</span>

                <div
                  className={`toggle ${task.completed ? "active" : ""}`}
                  onClick={() => toggleTask(task.id)}
                ></div>

              </div>
            ))}

          </div>
        </div>

      </div>
    </div>
  );
}

export default Dashboard;