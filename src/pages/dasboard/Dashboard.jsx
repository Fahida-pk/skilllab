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

const API_URL =
  "https://zyntaweb.com/skilllab/api/dashboard.php";

function Dashboard() {
  const navigate = useNavigate();

  const user = JSON.parse(
    localStorage.getItem("user") || "null"
  );

  /* =========================
     SELECTED DATE
  ========================= */

  const getLocalDate = () => {
    const date = new Date();

    const year = date.getFullYear();

    const month = String(
      date.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
      date.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const [selectedDate, setSelectedDate] =
    useState(getLocalDate());

  /* =========================
     DEFAULT TASKS (same source as Task page)
     ========================= */

  const getDefaultTasks = () => {
    try {
      const saved = localStorage.getItem("defaultTasks");
      const deletedSaved = localStorage.getItem("deletedDefaultTaskIds");
      const deletedIds = deletedSaved ? JSON.parse(deletedSaved) : [];

      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.filter(
          (task) => !deletedIds.includes(String(task.id))
        );
      }
    } catch (error) {
      console.error("Default task read error:", error);
    }

    return [];
  };

  const getDefaultCompletion = (dateKey) => {
    try {
      const saved = localStorage.getItem(
        `defaultTaskCompleted_${dateKey}`
      );
      return saved ? JSON.parse(saved) : {};
    } catch (error) {
      return {};
    }
  };

  const getTimeMinutes = (value) => {
    if (!value) return null;

    try {
      const [time, modifier] = value.split(" ");
      let [h, m] = time.split(":").map(Number);
      if (modifier === "PM" && h !== 12) h += 12;
      if (modifier === "AM" && h === 12) h = 0;
      return h * 60 + m;
    } catch {
      return null;
    }
  };

  const getDefaultStatus = (task, dateKey, completed) => {
    if (completed) return "completed";

    const todayKey = getLocalDate();
    if (dateKey > todayKey) return "not_started";
    if (dateKey < todayKey) return "pending";

    const from = getTimeMinutes(task.from || task.time);
    const to = getTimeMinutes(task.to);
    if (from === null) return "not_started";

    const now = new Date();
    const nowMinutes = now.getHours() * 60 + now.getMinutes();

    if (to === null) {
      return nowMinutes >= from ? "in_progress" : "not_started";
    }

    if (task.nextDay || to < from) {
      return nowMinutes >= from || nowMinutes <= to
        ? "in_progress"
        : "pending";
    }

    if (nowMinutes >= from && nowMinutes <= to) return "in_progress";
    if (nowMinutes > to) return "pending";
    return "not_started";
  };

  /* =========================
     DASHBOARD DATA
  ========================= */

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

  const [loading, setLoading] =
    useState(true);

  /* =========================
     DATE FORMAT
  ========================= */

  const formatDate = (dateString) => {
    const date = new Date(
      dateString + "T00:00:00"
    );

    return date.toLocaleDateString(
      "en-US",
      {
        weekday: "short",
        month: "short",
        day: "2-digit",
        year: "numeric",
      }
    );
  };

  /* =========================
     LOAD DASHBOARD
  ========================= */

  const loadDashboard = async (
    date = selectedDate
  ) => {
    if (!user?.email) {
      navigate("/login");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        API_URL,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            action: "dashboard",
            email: user.email,
            date: date,
          }),
        }
      );

      const data =
        await response.json();

      console.log(
        "DASHBOARD API:",
        data
      );

      if (data.success) {
        const defaultTasks = getDefaultTasks();
        const defaultCompletion = getDefaultCompletion(date);

        const defaultDashboardTasks = defaultTasks.map((task) => ({
          id: task.id,
          title: task.title,
          from: task.from || task.time || "",
          to: task.to || "",
          completed: defaultCompletion[task.id] === true,
          taskStatus: getDefaultStatus(
            task,
            date,
            defaultCompletion[task.id] === true
          ),
        }));

        const dbTasks = data.tasks || [];
        const mergedTasks = [...defaultDashboardTasks, ...dbTasks];

        const defaultCompleted = defaultDashboardTasks.filter(
          (task) => task.completed
        ).length;
        const defaultTotal = defaultDashboardTasks.length;

        const mergedTodayTotal =
          (data.today?.total || 0) + defaultTotal;
        const mergedTodayCompleted =
          (data.today?.completed || 0) + defaultCompleted;

        const mergedTodayInProgress =
          (data.today?.inProgress || 0) +
          defaultDashboardTasks.filter(
            (task) => task.taskStatus === "in_progress"
          ).length;

        const mergedTodayPending =
          (data.today?.pending || 0) +
          defaultDashboardTasks.filter(
            (task) => task.taskStatus === "pending"
          ).length;

        const mergedTodayNotStarted =
          (data.today?.notStarted || 0) +
          defaultDashboardTasks.filter(
            (task) => task.taskStatus === "not_started"
          ).length;

        const mergedTodayPercentage = mergedTodayTotal
          ? Math.round(
              (mergedTodayCompleted / mergedTodayTotal) * 100
            )
          : 0;

        setDashboard({
          today: {
            total:
              mergedTodayTotal,

            completed:
              mergedTodayCompleted,

            inProgress:
              mergedTodayInProgress,

            pending:
              mergedTodayPending,

            notStarted:
              mergedTodayNotStarted,

            percentage:
              mergedTodayPercentage,
          },

          week: {
            total:
              data.week?.total || 0,

            completed:
              data.week?.completed || 0,

            percentage:
              data.week?.percentage || 0,
          },

          month: {
            total:
              data.month?.total || 0,

            completed:
              data.month?.completed || 0,

            percentage:
              data.month?.percentage || 0,
          },

          studyHours: {
            hours:
              data.studyHours?.hours || 0,

            minutes:
              data.studyHours?.minutes || 0,
          },

          tasks:
            mergedTasks,
        });
      } else {
        console.log(
          "Dashboard error:",
          data.message
        );
      }
    } catch (error) {
      console.error(
        "Dashboard API error:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     INITIAL LOAD
  ========================= */

  useEffect(() => {
    loadDashboard(selectedDate);
  }, [selectedDate]);

  /* =========================
     AUTO REFRESH
     AFTER TASK COMPLETION
  ========================= */

  useEffect(() => {
    const refresh = () => {
      loadDashboard(selectedDate);
    };

    window.addEventListener(
      "taskUpdated",
      refresh
    );
    window.addEventListener("storage", refresh);
    window.addEventListener("focus", refresh);

    return () => {
      window.removeEventListener(
        "taskUpdated",
        refresh
      );
      window.removeEventListener("storage", refresh);
      window.removeEventListener("focus", refresh);
    };
  }, [selectedDate]);

  /* =========================
     PREVIOUS DAY
  ========================= */

  const previousDay = () => {
    const date = new Date(
      selectedDate + "T00:00:00"
    );

    date.setDate(
      date.getDate() - 1
    );

    const year =
      date.getFullYear();

    const month = String(
      date.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
      date.getDate()
    ).padStart(2, "0");

    setSelectedDate(
      `${year}-${month}-${day}`
    );
  };

  /* =========================
     NEXT DAY
  ========================= */

  const nextDay = () => {
    const date = new Date(
      selectedDate + "T00:00:00"
    );

    date.setDate(
      date.getDate() + 1
    );

    const year =
      date.getFullYear();

    const month = String(
      date.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
      date.getDate()
    ).padStart(2, "0");

    setSelectedDate(
      `${year}-${month}-${day}`
    );
  };

  /* =========================
     PIE DATA
  ========================= */

  const completed =
    dashboard.today.completed;

  const inProgress =
    dashboard.today.inProgress;

  const pending =
    dashboard.today.pending;

  const notStarted =
    dashboard.today.notStarted;

  const total =
    completed +
    inProgress +
    pending +
    notStarted;

  const completedDeg =
    total > 0
      ? (completed / total) * 360
      : 0;

  const inProgressDeg =
    total > 0
      ? (inProgress / total) * 360
      : 0;

  const pendingDeg =
    total > 0
      ? (pending / total) * 360
      : 0;

  const pieStyle =
    total > 0
      ? {
          background: `conic-gradient(
            #22c55e 0deg ${completedDeg}deg,
            #2f80ed ${completedDeg}deg ${
              completedDeg +
              inProgressDeg
            }deg,
            #f5a623 ${
              completedDeg +
              inProgressDeg
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

  const getPercentage = (
    value
  ) => {
    if (!total) return 0;

    return Math.round(
      (value / total) * 100
    );
  };

  return (
    <div className="dashboard-page">

      {/* =========================
          SIDEBAR
      ========================= */}

      <Sidebar />

      {/* =========================
          MAIN
      ========================= */}

      <main className="dashboard-main">

        {/* =========================
            DATE
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
              {formatDate(
                selectedDate
              )}
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
                <p>
                  Overall Progress
                </p>
              </div>

            </div>

            <div className="percentage blue-text">
              {dashboard.today.percentage}%
            </div>

            <div className="progress-bar">

              <div
                className="progress-fill blue-fill"
                style={{
                  width:
                    `${dashboard.today.percentage}%`,
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
                <h3>
                  This Week
                </h3>

                <p>
                  Overall Progress
                </p>
              </div>

            </div>

            <div className="percentage green-text">
              {dashboard.week.percentage}%
            </div>

            <div className="progress-bar">

              <div
                className="progress-fill green-fill"
                style={{
                  width:
                    `${dashboard.week.percentage}%`,
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
                <h3>
                  This Month
                </h3>

                <p>
                  Overall Progress
                </p>
              </div>

            </div>

            <div className="percentage purple-text">
              {dashboard.month.percentage}%
            </div>

            <div className="progress-bar">

              <div
                className="progress-fill purple-fill"
                style={{
                  width:
                    `${dashboard.month.percentage}%`,
                }}
              />

            </div>

          </div>

        </div>

        {/* =========================
            PROGRESS STATUS
        ========================= */}

        <section className="progress-section">

          <h2>
            Progress Status
          </h2>

          <div className="progress-content">

            {/* PIE */}

            <div className="pie-wrapper">

              <div
                className="pie-chart"
                style={pieStyle}
              >

                <div className="pie-center">

                  <span>
                    Overall
                  </span>

                  <strong>
                    {dashboard.today.percentage}%
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
                  {getPercentage(
                    completed
                  )}%
                </strong>

              </div>

              <div className="legend-row">

                <div className="legend-name">
                  <span className="dot progress-dot" />
                  In Progress
                </div>

                <strong>
                  {getPercentage(
                    inProgress
                  )}%
                </strong>

              </div>

              <div className="legend-row">

                <div className="legend-name">
                  <span className="dot pending-dot" />
                  Pending
                </div>

                <strong>
                  {getPercentage(
                    pending
                  )}%
                </strong>

              </div>

              <div className="legend-row">

                <div className="legend-name">
                  <span className="dot notstarted-dot" />
                  Not Started
                </div>

                <strong>
                  {getPercentage(
                    notStarted
                  )}%
                </strong>

              </div>

            </div>

          </div>

        </section>

        {/* =========================
            QUICK OVERVIEW
        ========================= */}

        <section className="quick-section">

          <h2>
            Quick Overview
          </h2>

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
                {dashboard.week.completed} /{" "}
                {dashboard.week.total}
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
                {dashboard.month.percentage}%
              </strong>

              <FaChevronRight />

            </div>

            <div className="quick-item">

              <div className="quick-icon orange-icon">
                <FaClock />
              </div>

              <span>
                Total Study Hours
                {" "} (This Week)
              </span>

              <strong className="orange-text">
                {dashboard.studyHours.hours}h{" "}
                {dashboard.studyHours.minutes}m
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
              {completed} / {total}
              {" "}Completed
            </span>

          </div>

          {loading ? (

            <div className="loading">
              Loading tasks...
            </div>

          ) : dashboard.tasks.length === 0 ? (

            <div className="empty-tasks">

              <p>
                No tasks for this day
              </p>

              <button
                onClick={() =>
                  navigate("/task")
                }
              >
                <FaPlus />
                Add New Task
              </button>

            </div>

          ) : (

            <div className="today-task-list">

              {dashboard.tasks.map(
                (task) => (

                  <div
                    className={`dashboard-task ${
                      task.taskStatus ||
                      "not_started"
                    }`}
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
                          {task.from ||
                            "--"}

                          {task.to
                            ? ` - ${task.to}`
                            : ""}
                        </p>

                      </div>

                    </div>

                    <span
                      className={`status-badge ${
                        task.taskStatus ||
                        "not_started"
                      }`}
                    >
                      {task.taskStatus ===
                      "in_progress"
                        ? "In Progress"
                        : task.taskStatus ===
                          "not_started"
                        ? "Not Started"
                        : (
                            task.taskStatus ||
                            "Pending"
                          )
                            .charAt(0)
                            .toUpperCase() +
                          (
                            task.taskStatus ||
                            "pending"
                          ).slice(1)}
                    </span>

                  </div>

                )
              )}

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