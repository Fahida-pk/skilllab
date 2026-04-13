import Sidebar from "./Sidebar";
import "./dashboard.css";
import { useState } from "react";
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

  const [tasksByDate, setTasksByDate] = useState({});

  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState("");
  const [fromTime, setFromTime] = useState("");
  const [toTime, setToTime] = useState("");
  const [image, setImage] = useState(null);
  const [editTask, setEditTask] = useState(null);

  const getDefaultTasks = () => [
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
  ];

  const dateKey = date.toDateString();
  const tasks = tasksByDate[dateKey] || getDefaultTasks();

  const isNextDay = (from, to) => {
    if (!from || !to) return false;
    return new Date(`2024-01-01 ${to}`) <= new Date(`2024-01-01 ${from}`);
  };

  const formatTime = (t) => {
    if (!t) return "";
    const [h, m] = t.split(":");
    let hour = parseInt(h);
    const ampm = hour >= 12 ? "PM" : "AM";
    hour = hour % 12 || 12;
    return `${hour}:${m} ${ampm}`;
  };

  const changeDate = (type) => {
    const newDate = new Date(date);
    type === "prev"
      ? newDate.setDate(date.getDate() - 1)
      : newDate.setDate(date.getDate() + 1);
    setDate(newDate);
  };

  const handleAddTask = () => {
    if (!title || !fromTime) return;

    const formattedFrom = formatTime(fromTime);
    const formattedTo = toTime ? formatTime(toTime) : "";

    let updatedTasks = [...tasks];
    const nextDay = isNextDay(fromTime, toTime);

    // 🔥 Sleep → next day wake update
    if (title.toLowerCase().includes("sleep") && formattedTo && nextDay) {
      const nextDate = new Date(date);
      nextDate.setDate(date.getDate() + 1);
      const nextKey = nextDate.toDateString();

      setTasksByDate((prev) => {
        const nextTasks = prev[nextKey] || getDefaultTasks();

        const updatedNext = nextTasks.map((t) =>
          t.title === "Wake Up"
            ? { ...t, time: formattedTo }
            : t
        );

        return { ...prev, [nextKey]: updatedNext };
      });
    }

    const newTask = {
      id: Date.now(),
      title,
      from: formattedFrom,
      to: formattedTo,
      nextDay,
      icon: <FaBook />,
      color: "linear-gradient(135deg, #30cfd0, #330867)",
      completed: false,
    };

    updatedTasks.push(newTask);

    setTasksByDate((prev) => ({
      ...prev,
      [dateKey]: updatedTasks,
    }));

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

        <div className="cards">
          {tasks.map((task) => (
            <div key={task.id} style={{ background: task.color }}>
              <h3>{task.title}</h3>
              <p>
                {task.title === "Wake Up"
                  ? task.time
                  : `${task.from} - ${task.to} ${
                      task.nextDay ? "(Next Day)" : ""
                    }`}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;