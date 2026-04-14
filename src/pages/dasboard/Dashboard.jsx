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

  const user = JSON.parse(localStorage.getItem("user"));
  const email = user?.email;

  // ✅ LOAD FROM DB
  const loadTasks = async () => {
    const res = await fetch("https://zyntaweb.com/skilllab/api/dashboard.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action: "get",
        task_date: currentKey,
        email,
      }),
    });

    const data = await res.json();

    if (data.success) {
      setTasksByDate((prev) => ({
        ...prev,
        [currentKey]: data.tasks,
      }));
    }
  };

  useEffect(() => {
    if (email) {
      loadTasks();
    }
  }, [currentKey, email]);

  // ✅ DEFAULT TASKS (only first time)
  useEffect(() => {
    if (!tasksByDate[currentKey]) {
      setTasksByDate((prev) => ({
        ...prev,
        [currentKey]: [
          {
            id: "d1",
            title: "Wake Up",
            time: "5:00 AM",
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
        ],
      }));
    }
  }, [currentKey]);

  // DELETE
  const deleteTask = (id) => {
    if (id.toString().startsWith("d")) {
      setTasksByDate((prev) => ({
        ...prev,
        [currentKey]: tasks.filter((t) => t.id !== id),
      }));
      return;
    }

    fetch("https://zyntaweb.com/skilllab/api/dashboard.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action: "delete",
        id,
        email,
      }),
    }).then(() => loadTasks());
  };

  // TOGGLE
  const toggleTask = (task) => {
    if (task.id.toString().startsWith("d")) return;

    fetch("https://zyntaweb.com/skilllab/api/dashboard.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action: "toggle",
        id: task.id,
        status: task.completed ? 0 : 1,
        email,
      }),
    }).then(() => loadTasks());
  };

  // DATE CHANGE
  const changeDate = (type) => {
    const newDate = new Date(date);
    type === "prev"
      ? newDate.setDate(date.getDate() - 1)
      : newDate.setDate(date.getDate() + 1);
    setDate(newDate);
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
              <div className="icon-box">
                {task.icon === "book" ? (
                  <FaBook />
                ) : typeof task.icon === "string" ? (
                  <img src={task.icon} width="25" />
                ) : (
                  task.icon
                )}
              </div>

              <h3>{task.title}</h3>

              <p>
                {task.time
                  ? task.time
                  : `${task.from} - ${task.to}`}
              </p>

              <button onClick={() => deleteTask(task.id)}>Delete</button>

              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => toggleTask(task)}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;