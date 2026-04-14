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

  // ✅ DEFAULT TASKS (UI ONLY)
  const defaultTasks = [
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
  ];

  // ✅ FETCH FROM DB
  useEffect(() => {
    const token = localStorage.getItem("token");

    fetch("https://zyntaweb.com/skilllab/api/dashboard.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        token,
        action: "get",
        task_date: currentKey,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setTasksByDate((prev) => ({
            ...prev,
            [currentKey]: data.tasks,
          }));
        }
      })
      .catch((err) => console.log(err));
  }, [date]);

  // ✅ MERGE DEFAULT + DB TASKS
  const tasks = [
    ...defaultTasks,
    ...(tasksByDate[currentKey] || []),
  ];

  // ✅ DELETE
  const deleteTask = (id) => {
    if (id.toString().startsWith("d")) return;

    const updated = tasksByDate[currentKey].filter((t) => t.id !== id);

    setTasksByDate((prev) => ({
      ...prev,
      [currentKey]: updated,
    }));

    const token = localStorage.getItem("token");

    fetch("https://zyntaweb.com/skilllab/api/dashboard.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        token,
        action: "delete",
        id,
      }),
    });
  };

  // ✅ FORMAT TIME
  const formatTime = (t) => {
    const [h, m] = t.split(":");
    let hour = parseInt(h);
    const ampm = hour >= 12 ? "PM" : "AM";
    hour = hour % 12 || 12;
    return `${hour}:${m} ${ampm}`;
  };

  // ✅ ADD / UPDATE
  const handleAddTask = () => {
    if (!title || !fromTime) return;

    const formattedFrom = formatTime(fromTime);
    const formattedTo = toTime ? formatTime(toTime) : "";

    const token = localStorage.getItem("token");

    fetch("https://zyntaweb.com/skilllab/api/dashboard.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        token,
        action: editTask ? "update" : "add",
        id: editTask?.id || null,
        title,
        from: formattedFrom,
        to: formattedTo,
        task_date: currentKey,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          const newTask = {
            id: data.id || editTask?.id,
            title,
            from: formattedFrom,
            to: formattedTo,
            color: "linear-gradient(135deg, #43e97b, #38f9d7)",
            completed: false,
          };

          let updated = tasksByDate[currentKey] || [];

          if (editTask) {
            updated = updated.map((t) =>
              t.id === editTask.id ? newTask : t
            );
          } else {
            updated.push(newTask);
          }

          setTasksByDate((prev) => ({
            ...prev,
            [currentKey]: updated,
          }));
        }
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
          <button onClick={() => setDate(new Date(date.setDate(date.getDate() - 1)))}>
            <FaChevronLeft />
          </button>

          <span>{date.toDateString()}</span>

          <button onClick={() => setDate(new Date(date.setDate(date.getDate() + 1)))}>
            <FaChevronRight />
          </button>
        </div>

        <div className="cards">
          {tasks.map((task) => (
            <div key={task.id} className="card" style={{ background: task.color }}>
              <h3>{task.title}</h3>
              <p>
                {task.time
                  ? task.time
                  : `${task.from} - ${task.to}`}
              </p>

              <button onClick={() => deleteTask(task.id)}>Delete</button>
            </div>
          ))}
        </div>

        <button onClick={() => setShowModal(true)}>+</button>
      </div>
    </div>
  );
}

export default Dashboard;