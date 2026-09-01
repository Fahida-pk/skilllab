import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Sidebar from "./Sidebar";
import "./dashboard.css";

import {
  FaChevronLeft,
  FaChevronRight,
  FaCalendarAlt,
  FaCheckCircle,
  FaClock,
  FaHourglassHalf,
  FaTimesCircle,
  FaPlus,
} from "react-icons/fa";

const API_URL = "https://zyntaweb.com/skilllab/api/dashboard.php";

function Dashboard() {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user") || "null");

  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const [dashboard, setDashboard] = useState({
    today: {
      total: 0,
      completed: 0,
      inProgress: 0,
      pending: 0,
      notStarted: 0,
      percentage: 0,
    },
    week: {
      total: 0,
      completed: 0,
      percentage: 0,
    },
    month: {
      total: 0,
      completed: 0,
      percentage: 0,
    },
    studyHours: {
      hours: 0,
      minutes: 0,
    },
    tasks: [],
  });

  const [loading, setLoading] = useState(true);

  /* =========================
     DATE FORMAT
  ========================= */

  const formatDate = (dateString) => {
    const date = new Date(dateString + "T00:00:00");

    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "2-digit",
      year: "numeric",
    });
  };


  /* =========================
     TASK PAGE LOCAL CHANGES
     ========================= */

  const getDeletedDefaultKey = (dateKey) =>
    `deletedDefaultTasks_${dateKey}`;

  const getDefaultScheduleKey = (dateKey) =>
    `defaultTaskSchedule_${dateKey}`;

  const getLocalDefaultChanges = (dateKey) => {
    try {
      const deleted = JSON.parse(
        localStorage.getItem(getDeletedDefaultKey(dateKey)) || "[]"
      );

      const schedules = JSON.parse(
        localStorage.getItem(getDefaultScheduleKey(dateKey)) || "{}"
      );

      return {
        deleted: Array.isArray(deleted) ? deleted.map(String) : [],
        schedules:
          schedules && typeof schedules === "object"
            ? schedules
            : {},
      };
    } catch (error) {
      console.error("Dashboard local default data error:", error);
      return {
        deleted: [],
        schedules: {},
      };
    }
  };

  const applyTaskPageChanges = (apiTasks, dateKey) => {
    const { deleted, schedules } =
      getLocalDefaultChanges(dateKey);

    return (Array.isArray(apiTasks) ? apiTasks : [])
      .filter((task) => {
        const id = String(task.id ?? "");

        // Task.jsx uses d1, d2, ... for built-in default tasks.
        return !deleted.includes(id);
      })
      .map((task) => {
        const id = String(task.id ?? "");
        const saved = schedules[id];

        if (!saved) {
          return task;
        }

        return {
          ...task,
          ...saved,
          from:
            saved.from !== undefined
              ? saved.from
              : task.from,
          to:
            saved.to !== undefined
              ? saved.to
              : task.to,
          time:
            saved.time !== undefined
              ? saved.time
              : task.time,
          nextDay:
            saved.nextDay !== undefined
              ? saved.nextDay
              : task.nextDay,
        };
      });
  };

  const getTaskStatus = (task) => {
    if (
      task.taskStatus === "completed" ||
      task.completed === true ||
      task.completed === 1 ||
      task.completed === "1"
    ) {
      return "completed";
    }

    if (
      task.taskStatus === "in_progress" ||
      task.status === "in_progress"
    ) {
      return "in_progress";
    }

    if (
      task.taskStatus === "pending" ||
      task.status === "pending"
    ) {
      return "pending";
    }

    return "not_started";
  };

  const getLocalTodayStats = (taskList) => {
    const stats = {
      total: taskList.length,
      completed: 0,
      inProgress: 0,
      pending: 0,
      notStarted: 0,
      percentage: 0,
    };

    taskList.forEach((task) => {
      const status = getTaskStatus(task);

      if (status === "completed") {
        stats.completed += 1;
      } else if (status === "in_progress") {
        stats.inProgress += 1;
      } else if (status === "pending") {
        stats.pending += 1;
      } else {
        stats.notStarted += 1;
      }
    });

    stats.percentage =
      stats.total > 0
        ? Math.round((stats.completed / stats.total) * 100)
        : 0;

    return stats;
  };

  /* =========================
     LOAD DASHBOARD
  ========================= */

  const loadDashboard = async (date = selectedDate) => {
    if (!user?.email) {
      navigate("/login");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "dashboard",
          email: user.email,
          date: date,
        }),
      });

      const data = await response.json();

      console.log("DASHBOARD API:", data);

      if (data.success) {
        // Apply the same date-wise default-task changes used by Task.jsx.
        // This makes Dashboard reflect deletes and time edits immediately.
        const fixedTasks = applyTaskPageChanges(
          data.tasks,
          date
        );

        const fixedToday = getLocalTodayStats(
          fixedTasks
        );

        setDashboard({
          ...data,
          tasks: fixedTasks,
          today: {
            ...data.today,
            ...fixedToday,
          },
        });
      } else {
        console.log("Dashboard error:", data.message);
      }
    } catch (error) {
      console.error("Dashboard API error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard(selectedDate);
  }, [selectedDate]);

  /* Refresh Dashboard after Task page add/edit/delete/complete. */
  useEffect(() => {
    const refreshDashboard = () => {
      loadDashboard(selectedDate);
    };

    window.addEventListener("taskUpdated", refreshDashboard);
    window.addEventListener("focus", refreshDashboard);

    return () => {
      window.removeEventListener("taskUpdated", refreshDashboard);
      window.removeEventListener("focus", refreshDashboard);
    };
  }, [selectedDate]);

  /* =========================
     PREVIOUS DAY
  ========================= */

  const previousDay = () => {
    const date = new Date(selectedDate + "T00:00:00");

    date.setDate(date.getDate() - 1);

    setSelectedDate(
      date.toISOString().split("T")[0]
    );
  };

  /* =========================
     NEXT DAY
  ========================= */

  const nextDay = () => {
    const date = new Date(selectedDate + "T00:00:00");

    date.setDate(date.getDate() + 1);

    setSelectedDate(
      date.toISOString().split("T")[0]
    );
  };

  /* =========================
     PIE VALUES
  ========================= */

  const completed =
    dashboard.today?.completed || 0;

  const inProgress =
    dashboard.today?.inProgress || 0;

  const pending =
    dashboard.today?.pending || 0;

  const notStarted =
    dashboard.today?.notStarted || 0;

  const total =
    completed +
    inProgress +
    pending +
    notStarted;

  const completedDeg =
    total > 0 ? (completed / total) * 360 : 0;

  const inProgressDeg =
    total > 0 ? (inProgress / total) * 360 : 0;

  const pendingDeg =
    total > 0 ? (pending / total) * 360 : 0;

  const pieStyle =
    total > 0
      ? {
          background: `conic-gradient(
            #22c55e 0deg ${completedDeg}deg,
            #2f80ed ${completedDeg}deg ${
            completedDeg + inProgressDeg
          }deg,
            #f5a623 ${
              completedDeg + inProgressDeg
            }deg ${
              completedDeg +
              inProgressDeg +
              pendingDeg
            }deg,
            #ef3340 ${
              completedDeg +
              inProgressDeg +
              pendingDeg
            }deg 360deg
          )`,
        }
      : {
          background: "#e5e7eb",
        };

  /* =========================
     STATUS %
  ========================= */

  const getPercentage = (value) => {
    if (!total) return 0;

    return Math.round((value / total) * 100);
  };

  return (
    <div className="dashboard-page">

      {/* SIDEBAR */}

      <Sidebar />

      {/* MAIN CONTENT */}

      <main className="dashboard-main">

        {/* =========================
            DATE HEADER
        ========================= */}

        <div className="date-navigation">

          <button
            className="date-arrow"
            onClick={previousDay}
          >
            <FaChevronLeft />
          </button>

          <div className="selected-date">
            <FaCalendarAlt />

            <span>
              {formatDate(selectedDate)}
            </span>
          </div>

          <button
            className="date-arrow"
            onClick={nextDay}
          >
            <FaChevronRight />
          </button>

        </div>


        {/* =========================
            PROGRESS CARDS
        ========================= */}

        <div className="progress-cards">

          {/* TODAY */}

          <div className="progress-card today-card">

            <div className="card-top">

              <div className="card-icon blue">
                <FaCalendarAlt />
              </div>

              <div>
                <h3>Today</h3>
                <p>Overall Progress</p>
              </div>

            </div>

            <div className="percentage blue-text">
              {dashboard.today?.percentage || 0}%
            </div>

            <div className="progress-bar">
              <div
                className="progress-fill blue-fill"
                style={{
                  width: `${
                    dashboard.today?.percentage || 0
                  }%`,
                }}
              />
            </div>

          </div>


          {/* WEEK */}

          <div className="progress-card week-card">

            <div className="card-top">

              <div className="card-icon green">
                <FaCalendarAlt />
              </div>

              <div>
                <h3>This Week</h3>
                <p>Overall Progress</p>
              </div>

            </div>

            <div className="percentage green-text">
              {dashboard.week?.percentage || 0}%
            </div>

            <div className="progress-bar">
              <div
                className="progress-fill green-fill"
                style={{
                  width: `${
                    dashboard.week?.percentage || 0
                  }%`,
                }}
              />
            </div>

          </div>


          {/* MONTH */}

          <div className="progress-card month-card">

            <div className="card-top">

              <div className="card-icon purple">
                <FaCalendarAlt />
              </div>

              <div>
                <h3>This Month</h3>
                <p>Overall Progress</p>
              </div>

            </div>

            <div className="percentage purple-text">
              {dashboard.month?.percentage || 0}%
            </div>

            <div className="progress-bar">
              <div
                className="progress-fill purple-fill"
                style={{
                  width: `${
                    dashboard.month?.percentage || 0
                  }%`,
                }}
              />
            </div>

          </div>

        </div>


        {/* =========================
            PROGRESS STATUS
        ========================= */}

        <section className="progress-section">

          <h2>Progress Status</h2>

          <div className="progress-content">

            {/* PIE */}

            <div className="pie-wrapper">

              <div
                className="pie-chart"
                style={pieStyle}
              >

                <div className="pie-center">

                  <span>Overall</span>

                  <strong>
                    {dashboard.today?.percentage || 0}%
                  </strong>

                  <small>
                    Completed
                  </small>

                </div>

              </div>

            </div>


            {/* LEGEND */}

            <div className="legend">

              <div className="legend-row">

                <div className="legend-name">
                  <span className="dot completed-dot" />
                  Completed
                </div>

                <strong>
                  {getPercentage(completed)}%
                </strong>

              </div>


              <div className="legend-row">

                <div className="legend-name">
                  <span className="dot progress-dot" />
                  In Progress
                </div>

                <strong>
                  {getPercentage(inProgress)}%
                </strong>

              </div>


              <div className="legend-row">

                <div className="legend-name">
                  <span className="dot pending-dot" />
                  Pending
                </div>

                <strong>
                  {getPercentage(pending)}%
                </strong>

              </div>


              <div className="legend-row">

                <div className="legend-name">
                  <span className="dot notstarted-dot" />
                  Not Started
                </div>

                <strong>
                  {getPercentage(notStarted)}%
                </strong>

              </div>

            </div>

          </div>

        </section>


        {/* =========================
            QUICK OVERVIEW
        ========================= */}

        <section className="quick-section">

          <h2>Quick Overview</h2>


          <div className="quick-list">

            <div className="quick-item">

              <div className="quick-icon blue-icon">
                <FaCheckCircle />
              </div>

              <span>
                Tasks Completed Today
              </span>

              <strong className="blue-text">
                {completed} / {total}
              </strong>

              <FaChevronRight />

            </div>


            <div className="quick-item">

              <div className="quick-icon green-icon">
                <FaCheckCircle />
              </div>

              <span>
                Tasks Completed This Week
              </span>

              <strong className="green-text">
                {dashboard.week?.completed || 0} /{" "}
                {dashboard.week?.total || 0}
              </strong>

              <FaChevronRight />

            </div>


            <div className="quick-item">

              <div className="quick-icon purple-icon">
                <FaCalendarAlt />
              </div>

              <span>
                Monthly Goal Progress
              </span>

              <strong className="purple-text">
                {dashboard.month?.percentage || 0}%
              </strong>

              <FaChevronRight />

            </div>


            <div className="quick-item">

              <div className="quick-icon orange-icon">
                <FaClock />
              </div>

              <span>
                Total Study Hours (This Week)
              </span>

              <strong className="orange-text">
                {dashboard.studyHours?.hours || 0}h{" "}
                {dashboard.studyHours?.minutes || 0}m
              </strong>

              <FaChevronRight />

            </div>

          </div>

        </section>


        {/* =========================
            TODAY TASKS
        ========================= */}

        <section className="tasks-section">

          <div className="section-heading">

            <h2>
              Today's Tasks
            </h2>

            <span className="task-count">
              {completed} / {total} Completed
            </span>

          </div>


          {loading ? (

            <div className="loading">
              Loading tasks...
            </div>

          ) : dashboard.tasks?.length === 0 ? (

            <div className="empty-tasks">
              <p>
                No tasks for this day
              </p>

              <button
                onClick={() => navigate("/task")}
              >
                <FaPlus />
                Add New Task
              </button>
            </div>

          ) : (

            <div className="today-task-list">

              {dashboard.tasks.map((task) => (

                <div
                  className={`dashboard-task ${task.taskStatus}`}
                  key={task.id}
                >

                  <div className="task-left">

                    <div className="task-status-icon">

                      {task.taskStatus ===
                      "completed" ? (
                        <FaCheckCircle />
                      ) : task.taskStatus ===
                        "in_progress" ? (
                        <FaClock />
                      ) : task.taskStatus ===
                        "pending" ? (
                        <FaHourglassHalf />
                      ) : (
                        <FaTimesCircle />
                      )}

                    </div>

                    <div>

                      <h3>
                        {task.title}
                      </h3>

                      <p>
                        {task.from || "--"}{" "}
                        {task.to
                          ? `- ${task.to}`
                          : ""}
                      </p>

                    </div>

                  </div>


                  <span
                    className={`status-badge ${task.taskStatus}`}
                  >
                    {task.taskStatus ===
                      "in_progress"
                      ? "In Progress"
                      : task.taskStatus ===
                        "not_started"
                      ? "Not Started"
                      : task.taskStatus
                          .charAt(0)
                          .toUpperCase() +
                        task.taskStatus.slice(1)}
                  </span>

                </div>

              ))}

            </div>

          )}

        </section>

      </main>


      {/* =========================
          MOBILE BOTTOM NAV
      ========================= */}

      <div className="mobile-bottom-nav">

        <button
          className="active"
          onClick={() =>
            navigate("/dashboard")
          }
        >
          <span>▦</span>
          Dashboard
        </button>

        <button
          onClick={() =>
            navigate("/task")
          }
        >
          <span>☷</span>
          Tasks
        </button>

        <button>
          <span>▥</span>
          Progress
        </button>

        <button>
          <span>◉</span>
          Profile
        </button>

      </div>

    </div>
  );
}

export default Dashboard;