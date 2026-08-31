import { useEffect, useState } from "react";
import {
  FaBars,
  FaBell,
  FaCalendarAlt,
  FaChevronLeft,
  FaChevronRight,
  FaCheckCircle,
  FaClock,
  FaChartLine,
  FaBullseye,
  FaThLarge,
  FaTasks,
  FaUserCircle,
  FaChartBar,
} from "react-icons/fa";

import "./dashboard.css";


function Dashboard() {

  const user = JSON.parse(
    localStorage.getItem("user")
  );

  const [date, setDate] = useState(
    new Date()
  );

  const [dashboard, setDashboard] =
    useState(null);

  const [loading, setLoading] =
    useState(true);


  /* =====================================
     DATE KEY
  ===================================== */

  const getDateKey = (date) => {

    const year =
      date.getFullYear();

    const month =
      String(
        date.getMonth() + 1
      ).padStart(2, "0");

    const day =
      String(
        date.getDate()
      ).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };


  /* =====================================
     FETCH DASHBOARD
  ===================================== */

  const fetchDashboard = async () => {

    try {

      setLoading(true);

      const response = await fetch(
        "https://zyntaweb.com/skilllab/api/dashboard.php",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({

            action: "dashboard",

            email: user?.email,

            date:
              getDateKey(date),

          }),
        }
      );


      const data =
        await response.json();


      console.log(
        "Dashboard:",
        data
      );


      if (data.success) {

        setDashboard(data);

      }

    } catch (error) {

      console.error(
        "Dashboard error:",
        error
      );

    } finally {

      setLoading(false);

    }
  };


  useEffect(() => {

    fetchDashboard();

  }, [date]);


  /* =====================================
     DATE CHANGE
  ===================================== */

  const changeDate = (type) => {

    const newDate =
      new Date(date);

    if (type === "prev") {

      newDate.setDate(
        newDate.getDate() - 1
      );

    } else {

      newDate.setDate(
        newDate.getDate() + 1
      );

    }

    setDate(newDate);
  };


  /* =====================================
     FORMAT DATE
  ===================================== */

  const formatDate = () => {

    return date.toLocaleDateString(
      "en-US",
      {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      }
    );
  };


  /* =====================================
     STATUS
  ===================================== */

  const getStatusText = (status) => {

    switch (status) {

      case "completed":
        return "Completed";

      case "in_progress":
        return "In Progress";

      case "pending":
        return "Pending";

      default:
        return "Not Started";
    }
  };


  /* =====================================
     LOADING
  ===================================== */

  if (loading && !dashboard) {

    return (
      <div className="dashboard-loading">
        Loading Dashboard...
      </div>
    );
  }


  if (!dashboard) {

    return (
      <div className="dashboard-loading">
        No dashboard data
      </div>
    );
  }


  const today =
    dashboard.today;

  const week =
    dashboard.week;

  const month =
    dashboard.month;

  const studyHours =
    dashboard.studyHours;

  const tasks =
    dashboard.tasks || [];


  /* =====================================
     PIE CALCULATION
  ===================================== */

  const total =
    today.total || 0;

  const completed =
    today.completed || 0;

  const inProgress =
    today.inProgress || 0;

  const pending =
    today.pending || 0;

  const notStarted =
    today.notStarted || 0;


  const completedDeg =
    total
      ? (completed / total) * 360
      : 0;

  const inProgressDeg =
    total
      ? ((completed + inProgress) / total) * 360
      : 0;

  const pendingDeg =
    total
      ? (
          (completed +
            inProgress +
            pending) /
          total
        ) * 360
      : 0;


  const donutBackground = `
    conic-gradient(
      #20b957 0deg ${completedDeg}deg,
      #2581e8 ${completedDeg}deg ${inProgressDeg}deg,
      #ffb321 ${inProgressDeg}deg ${pendingDeg}deg,
      #ef3039 ${pendingDeg}deg 360deg
    )
  `;


  return (

    <div className="dashboard-page">


      {/* =================================
          HEADER
      ================================= */}

      <header className="dashboard-header">

        <button className="header-menu">
          <FaBars />
        </button>

        <div className="brand">
          SKILL LAB
        </div>

        <button className="header-notification">

          <FaBell />

          <span></span>

        </button>

      </header>


      {/* =================================
          CONTENT
      ================================= */}

      <main className="dashboard-content">


        {/* DATE */}

        <div className="date-navigation">

          <button
            onClick={() =>
              changeDate("prev")
            }
          >
            <FaChevronLeft />
          </button>


          <div className="dashboard-date">

            <FaCalendarAlt />

            <span>
              {formatDate()}
            </span>

          </div>


          <button
            onClick={() =>
              changeDate("next")
            }
          >
            <FaChevronRight />
          </button>

        </div>


        {/* =================================
            PROGRESS CARDS
        ================================= */}

        <section className="progress-cards">


          {/* TODAY */}

          <div className="progress-card blue-card">

            <div className="card-heading">

              <div className="card-icon blue">
                <FaCalendarAlt />
              </div>

              <div>
                <h3>Today</h3>
                <p>Overall Progress</p>
              </div>

            </div>


            <strong>
              {today.percentage}%
            </strong>


            <div className="progress-track">

              <div
                className="progress-bar blue-bar"
                style={{
                  width:
                    `${today.percentage}%`
                }}
              />

            </div>

          </div>


          {/* WEEK */}

          <div className="progress-card green-card">

            <div className="card-heading">

              <div className="card-icon green">
                <FaCalendarAlt />
              </div>

              <div>
                <h3>This Week</h3>
                <p>Overall Progress</p>
              </div>

            </div>


            <strong>
              {week.percentage}%
            </strong>


            <div className="progress-track">

              <div
                className="progress-bar green-bar"
                style={{
                  width:
                    `${week.percentage}%`
                }}
              />

            </div>

          </div>


          {/* MONTH */}

          <div className="progress-card purple-card">

            <div className="card-heading">

              <div className="card-icon purple">
                <FaCalendarAlt />
              </div>

              <div>
                <h3>This Month</h3>
                <p>Overall Progress</p>
              </div>

            </div>


            <strong>
              {month.percentage}%
            </strong>


            <div className="progress-track">

              <div
                className="progress-bar purple-bar"
                style={{
                  width:
                    `${month.percentage}%`
                }}
              />

            </div>

          </div>

        </section>


        {/* =================================
            PROGRESS STATUS
        ================================= */}

        <section className="dashboard-section">

          <h2>
            Progress Status
          </h2>


          <div className="progress-status">


            {/* DONUT */}

            <div className="donut">

              <div
                className="donut-chart"
                style={{
                  background:
                    donutBackground
                }}
              >

                <div className="donut-center">

                  <span>
                    Overall
                  </span>

                  <strong>
                    {today.percentage}%
                  </strong>

                  <small>
                    Completed
                  </small>

                </div>

              </div>

            </div>


            {/* LEGEND */}

            <div className="legend">

              <div>
                <span className="dot completed"></span>
                <span>Completed</span>
                <strong>
                  {total
                    ? Math.round(
                        completed /
                        total *
                        100
                      )
                    : 0}%
                </strong>
              </div>


              <div>
                <span className="dot progress"></span>
                <span>In Progress</span>
                <strong>
                  {total
                    ? Math.round(
                        inProgress /
                        total *
                        100
                      )
                    : 0}%
                </strong>
              </div>


              <div>
                <span className="dot pending"></span>
                <span>Pending</span>
                <strong>
                  {total
                    ? Math.round(
                        pending /
                        total *
                        100
                      )
                    : 0}%
                </strong>
              </div>


              <div>
                <span className="dot not-started"></span>
                <span>Not Started</span>
                <strong>
                  {total
                    ? Math.round(
                        notStarted /
                        total *
                        100
                      )
                    : 0}%
                </strong>
              </div>

            </div>

          </div>

        </section>


        {/* =================================
            QUICK OVERVIEW
        ================================= */}

        <section className="dashboard-section">

          <h2>
            Quick Overview
          </h2>


          <div className="overview-list">


            <div className="overview-row">

              <FaCalendarAlt className="overview-blue" />

              <span>
                Tasks Completed Today
              </span>

              <strong>
                {today.completed} / {today.total}
              </strong>

              <FaChevronRight />

            </div>


            <div className="overview-row">

              <FaChartLine className="overview-green" />

              <span>
                Tasks Completed This Week
              </span>

              <strong className="green-text">
                {week.completed} / {week.total}
              </strong>

              <FaChevronRight />

            </div>


            <div className="overview-row">

              <FaBullseye className="overview-purple" />

              <span>
                Monthly Goal Progress
              </span>

              <strong className="purple-text">
                {month.percentage}%
              </strong>

              <FaChevronRight />

            </div>


            <div className="overview-row">

              <FaClock className="overview-orange" />

              <span>
                Total Study Hours (This Week)
              </span>

              <strong className="orange-text">
                {studyHours.hours}h{" "}
                {studyHours.minutes}m
              </strong>

              <FaChevronRight />

            </div>

          </div>

        </section>


        {/* =================================
            TODAY TASKS
        ================================= */}

        <section className="dashboard-section">

          <div className="tasks-title">

            <h2>
              Today's Tasks
            </h2>

            <span>
              {today.completed} /{" "}
              {today.total} Completed
            </span>

          </div>


          <div className="dashboard-tasks">

            {tasks.length === 0 ? (

              <div className="empty-task">
                No tasks for this date.
              </div>

            ) : (

              tasks.map((task) => (

                <div
                  className={`dashboard-task-row ${task.taskStatus}`}
                  key={task.id}
                >

                  <div className="task-status-icon">

                    {task.taskStatus ===
                    "completed" ? (

                      <FaCheckCircle />

                    ) : (

                      <span></span>

                    )}

                  </div>


                  <div className="task-name">

                    <strong>
                      {task.title}
                    </strong>

                    <span>
                      {task.taskStatus ===
                      "completed"
                        ? "Completed"
                        : task.taskStatus ===
                          "in_progress"
                        ? "In Progress"
                        : task.taskStatus ===
                          "pending"
                        ? "Pending"
                        : "Not Started"}
                    </span>

                  </div>


                  <div className="task-time">

                    <FaClock />

                    {task.from}

                    {task.to &&
                      ` - ${task.to}`}

                  </div>


                  <div
                    className={`status-badge ${task.taskStatus}`}
                  >
                    {getStatusText(
                      task.taskStatus
                    )}
                  </div>

                </div>

              ))

            )}

          </div>


          {/* ADD TASK */}

          <button className="add-task-dashboard">

            <span>+</span>

            Add New Task

          </button>

        </section>


      </main>


      {/* =================================
          BOTTOM NAV
      ================================= */}

      <nav className="bottom-nav">

        <button className="active">

          <FaThLarge />

          <span>
            Dashboard
          </span>

        </button>


        <button>

          <FaCalendarAlt />

          <span>
            My Schedule
          </span>

        </button>


        <button>

          <FaTasks />

          <span>
            Tasks
          </span>

        </button>


        <button>

          <FaChartBar />

          <span>
            Progress
          </span>

        </button>


        <button>

          <FaUserCircle />

          <span>
            Profile
          </span>

        </button>

      </nav>

    </div>
  );
}

export default Dashboard;