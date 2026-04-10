import { useState } from "react";
import Sidebar from "./Sidebar";
import "./dashboard.css";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { FaSun, FaBook, FaLanguage } from "react-icons/fa";

function Dashboard() {
  const [date, setDate] = useState(new Date());

  const changeDate = (type) => {
    const newDate = new Date(date);

    if (type === "prev") newDate.setDate(date.getDate() - 1);
    else newDate.setDate(date.getDate() + 1);

    setDate(newDate);
  };

  const formatDate = (d) => {
    return d.toDateString();
  };

  const tasks = [
    { id: 1, title: "Wake Up", time: "5 AM", icon: <FaSun /> },
    { id: 2, title: "Study MERN", time: "10 AM", icon: <FaBook /> },
    { id: 3, title: "Practice English", time: "3 PM", icon: <FaLanguage /> },
  ];

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

        {/* TASK CARDS */}
        <div className="cards">
          {tasks.map((task) => (
            <div className="card" key={task.id}>

              {/* LEFT ICON */}
              <div className="icon-box">
                {task.icon}
              </div>

              {/* TEXT */}
              <div className="card-content">
                <h3>{task.title}</h3>
                <p>{task.time}</p>
              </div>

              {/* RIGHT CHECKBOX */}
              <input type="checkbox" className="check" />

            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

export default Dashboard;