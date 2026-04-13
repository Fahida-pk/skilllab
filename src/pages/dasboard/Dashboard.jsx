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

  // ✅ TOKEN FIX
  const token = localStorage.getItem("token");

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

  // ✅ DEFAULT TASKS
  useEffect(() => {
    if (!tasksByDate[currentKey]) {
      setTasksByDate((prev) => ({
        ...prev,
        [currentKey]: [
          {
            id: 1,
            title: "Wake Up",
            time: "5:00 AM",
            icon: <FaSun />,
            color: "linear-gradient(135deg, #f6d365, #fda085)",
            completed: false,
          },
        ],
      }));
    }
  }, [date]);

  // ✅ GET FROM DB
  useEffect(() => {
    if (!token) return;

    fetch("https://zyntaweb.com/skilllab/dashboard.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action: "get",
        token: token,
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
      });
  }, [currentKey]);

  const isNextDay = (from, to) => {
    if (!from || !to) return false;
    const f = new Date(`2024-01-01 ${from}`);
    const t = new Date(`2024-01-01 ${to}`);
    return t <= f;
  };

  const formatTime = (t) => {
    if (!t) return "";
    const [hour, minute] = t.split(":");
    let h = parseInt(hour);
    const ampm = h >= 12 ? "PM" : "AM";
    h = h % 12;
    if (h === 0) h = 12;
    return `${h}:${minute} ${ampm}`;
  };

  const convertToInputTime = (timeStr) => {
    if (!timeStr) return "";
    try {
      const [time, modifier] = timeStr.split(" ");
      let [hours, minutes] = time.split(":");

      hours = parseInt(hours);

      if (modifier === "PM" && hours !== 12) hours += 12;
      if (modifier === "AM" && hours === 12) hours = 0;

      return `${hours.toString().padStart(2, "0")}:${minutes}`;
    } catch {
      return "";
    }
  };

  const changeDate = (type) => {
    const newDate = new Date(date);
    type === "prev"
      ? newDate.setDate(date.getDate() - 1)
      : newDate.setDate(date.getDate() + 1);
    setDate(newDate);
  };

  // ✅ DELETE
  const deleteTask = (id) => {
    fetch("https://zyntaweb.com/skilllab/dashboard.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action: "delete",
        token: token,
        id: id,
      }),
    }).then(() => {
      setTasksByDate((prev) => ({
        ...prev,
        [currentKey]: tasks.filter((t) => t.id !== id),
      }));
    });
  };

  // ✅ TOGGLE
  const toggleTask = (id) => {
    const updated = tasks.map((t) =>
      t.id === id ? { ...t, completed: !t.completed } : t
    );

    setTasksByDate((prev) => ({
      ...prev,
      [currentKey]: updated,
    }));
  };

  const handleEdit = (task) => {
    setShowModal(true);
    setEditTask(task);

    setTitle(task.title);
    setFromTime(convertToInputTime(task.from));
    setToTime(convertToInputTime(task.to));
  };

  // ✅ ADD / UPDATE
  const handleAddTask = () => {
    if (!title || !fromTime) return;

    const colors = [
      "linear-gradient(135deg, #43e97b, #38f9d7)",
      "linear-gradient(135deg, #fa709a, #fee140)",
      "linear-gradient(135deg, #30cfd0, #330867)",
      "linear-gradient(135deg, #f093fb, #f5576c)",
    ];

    const formattedFrom = formatTime(fromTime);
    const formattedTo = toTime ? formatTime(toTime) : "";

    let updatedTasks = [...tasks];

    const nextDay = isNextDay(fromTime, toTime);

    const randomColor =
      editTask?.color ||
      colors[Math.floor(Math.random() * colors.length)];

    const newTask = {
      id: editTask ? editTask.id : Date.now(),
      title,
      from: formattedFrom,
      to: formattedTo,
      nextDay,
      icon: image ? URL.createObjectURL(image) : "book",
      color: randomColor,
      completed: false,
    };

    if (editTask) {
      updatedTasks = updatedTasks.map((t) =>
        t.id === editTask.id ? newTask : t
      );
    } else {
      updatedTasks.push(newTask);
    }

    setTasksByDate((prev) => ({
      ...prev,
      [currentKey]: updatedTasks,
    }));

    // ✅ SAVE TO DB
    fetch("https://zyntaweb.com/skilllab/dashboard.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action: editTask ? "update" : "add",
        token: token,
        id: editTask ? editTask.id : null,
        title: title,
        from: formattedFrom,
        to: formattedTo,
        task_date: currentKey,
      }),
    });

    setEditTask(null);
    setShowModal(false);
    setTitle("");
    setFromTime("");
    setToTime("");
    setImage(null);
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
                <div className="icon-box">
                  {task.icon === "book" ? (
                    <FaBook />
                  ) : typeof task.icon === "string" ? (
                    <img src={task.icon} width="25" />
                  ) : null}
                </div>

                <div className="card-content">
                  <h3>{task.title}</h3>
                  <p>
                    {task.title === "Wake Up"
                      ? task.time
                      : `${task.from} - ${task.to}`}
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
            <h2>{editTask ? "Edit Task" : "Add New Task"}</h2>

            <div className="input-group">
              <label>Task Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="input-group">
              <label>From Time</label>
              <input
                type="time"
                value={fromTime}
                onChange={(e) => setFromTime(e.target.value)}
              />

              <label>To Time</label>
              <input
                type="time"
                value={toTime}
                onChange={(e) => setToTime(e.target.value)}
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
              <button onClick={() => setShowModal(false)}>Cancel</button>
              <button onClick={handleAddTask}>
                {editTask ? "Update" : "Add"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;