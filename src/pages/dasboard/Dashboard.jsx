import { useEffect, useState } from "react";

import {
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
import Sidebar from "./Sidebar";

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


  // =====================================
  // DATE KEY
  // =====================================

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


  // =====================================
  // FETCH DASHBOARD
  // =====================================

  const fetchDashboard = async () => {

    try {

      setLoading(true);

      const response = await fetch(
        "https://zyntaweb.com/skilllab/api/dashboard.php",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
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


  // =====================================
  // FETCH WHEN DATE CHANGES
  // =====================================

  useEffect(() => {

    fetchDashboard();

  }, [date]);


  // =====================================
  // CHANGE DATE
  // =====================================

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


  // =====================================
  // FORMAT DATE
  // =====================================

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


  // =====================================
  // STATUS TEXT
  // =====================================

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


  // =====================================
  // LOADING
  // =====================================

  if (loading && !dashboard) {

    return (
      <div className="dashboard-page">

        <Sidebar />

        <div className="dashboard-loading">
          Loading Dashboard...
        </div>

      </div>
    );

  }


  // =====================================
  // NO DATA
  // =====================================

  if (!dashboard) {

    return (
      <div className="dashboard-page">

        <Sidebar />

        <div className="dashboard-loading">
          No dashboard data
        </div>

      </div>
    );

  }


  // =====================================
  // DASHBOARD DATA
  // =====================================

  const today =
    dashboard.today || {};

  const week =
    dashboard.week || {};

  const month =
    dashboard.month || {};

  const studyHours =
    dashboard.studyHours || {
      hours: 0,
      minutes: 0,
    };

  const tasks =
    dashboard.tasks || [];


  // =====================================
  // PIE DATA
  // =====================================

  const total =
    Number(today.total) || 0;

  const completed =
    Number(today.completed) || 0;

  const inProgress =
    Number(today.inProgress) || 0;

  const pending =
    Number(today.pending) || 0;

  const notStarted =
    Number(today.notStarted) || 0;


  // =====================================
  // PIE DEGREES
  // =====================================

  const completedDeg =
    total
      ? (completed / total) * 360
      : 0;

  const inProgressDeg =
    total
      ? (
          (completed + inProgress) /
          total
        ) * 360
      : 0;

  const pendingDeg =
    total
      ? (
          (
            completed +
            inProgress +
            pending
          ) /
          total
        ) * 360
      : 0;


  // =====================================
  // DONUT BACKGROUND
  // =====================================

  const donutBackground = `
    conic-gradient(
      #20b957 0deg ${completedDeg}deg,
      #2581e8 ${completedDeg}deg ${inProgressDeg}deg,
      #ffb321 ${inProgressDeg}deg ${pendingDeg}deg,
      #ef3039 ${pendingDeg}deg 360deg
    )
  `;


  // =====================================
  // PERCENTAGE HELPER
  // =====================================

  const getPercentage = (value) => {

    return total
      ? Math.round(
          (Number(value) / total) * 100
        )
      : 0;

  };


  // =====================================
  // MAIN
  // =====================================

  return (

    <div className="dashboard-page">


      {/* =================================
          SIDEBAR
      ================================= */}

      <Sidebar />


      {/* =================================
          DASHBOARD CONTENT
      ================================= */}

      <main className="dashboard-content">


        {/* =================================
            DATE NAVIGATION
        ================================= */}

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

                <h3>
                  Today
                </h3>

                <p>
                  Overall Progress
                </p>

              </div>

            </div>


            <strong>
              {today.percentage || 0}%
            </strong>


            <div className="progress-track">

              <div
                className="progress-bar blue-bar"
                style={{
                  width:
                    `${today.percentage || 0}%`,
                }}
              />

            </div>

          </div>


          {/* THIS WEEK */}

          <div className="progress-card green-card">

            <div className="card-heading">

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


            <strong>
              {week.percentage || 0}%
            </strong>


            <div className="progress-track">

              <div
                className="progress-bar green-bar"
                style={{
                  width:
                    `${week.percentage || 0}%`,
                }}
              />

            </div>

          </div>


          {/* THIS MONTH */}

          <div className="progress-card purple-card">

            <div className="card-heading">

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


            <strong>
              {month.percentage || 0}%
            </strong>


            <div className="progress-track">

              <div
                className="progress-bar purple-bar"
                style={{
                  width:
                    `${month.percentage || 0}%`,
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
                    donutBackground,
                }}
              >

                <div className="donut-center">

                  <span>
                    Overall
                  </span>

                  <strong>
                    {today.percentage || 0}%
                  </strong>

                  <small>
                    Completed
                  </small>

                </div>

              </div>

            </div>


            {/* LEGEND */}

            <div className="legend">


              {/* COMPLETED */}

              <div>

                <span className="dot completed"></span>

                <span>
                  Completed
                </span>

                <strong>
                  {getPercentage(completed)}%
                </strong>

              </div>


              {/* IN PROGRESS */}

              <div>

                <span className="dot progress"></span>

                <span>
                  In Progress
                </span>

                <strong>
                  {getPercentage(inProgress)}%
                </strong>

              </div>


              {/* PENDING */}

              <div>

                <span className="dot pending"></span>

                <span>
                  Pending
                </span>

                <strong>
                  {getPercentage(pending)}%
                </strong>

              </div>


              {/* NOT STARTED */}

              <div>

                <span className="dot not-started"></span>

                <span>
                  Not Started
                </span>

                <strong>
                  {getPercentage(notStarted)}%
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


            {/* TODAY */}

            <div className="overview-row">

              <FaCalendarAlt
                className="overview-blue"
              />

              <span>
                Tasks Completed Today
              </span>

              <strong>
                {today.completed || 0}
                {" / "}
                {today.total || 0}
              </strong>

              <FaChevronRight />

            </div>


            {/* WEEK */}

            <div className="overview-row">

              <FaChartLine
                className="overview-green"
              />

              <span>
                Tasks Completed This Week
              </span>

              <strong className="green-text">

                {week.completed || 0}
                {" / "}
                {week.total || 0}

              </strong>

              <FaChevronRight />

            </div>


            {/* MONTH */}

            <div className="overview-row">

              <FaBullseye
                className="overview-purple"
              />

              <span>
                Monthly Goal Progress
              </span>

              <strong className="purple-text">

                {month.percentage || 0}%

              </strong>

              <FaChevronRight />

            </div>


            {/* STUDY HOURS */}

            <div className="overview-row">

              <FaClock
                className="overview-orange"
              />

              <span>
                Total Study Hours (This Week)
              </span>

              <strong className="orange-text">

                {studyHours.hours || 0}h{" "}

                {studyHours.minutes || 0}m

              </strong>

              <FaChevronRight />

            </div>


          </div>

        </section>


        {/* =================================
            TODAY'S TASKS
        ================================= */}

        <section className="dashboard-section">


          <div className="tasks-title">

            <h2>
              Today's Tasks
            </h2>

            <span>

              {today.completed || 0}
              {" / "}
              {today.total || 0}
              {" Completed"}

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
                  className={
                    `dashboard-task-row ${task.taskStatus || ""}`
                  }
                  key={task.id}
                >


                  {/* STATUS ICON */}

                  <div className="task-status-icon">

                    {task.taskStatus ===
                    "completed" ? (

                      <FaCheckCircle />

                    ) : (

                      <span></span>

                    )}

                  </div>


                  {/* TASK NAME */}

                  <div className="task-name">

                    <strong>
                      {task.title}
                    </strong>

                    <span>

                      {getStatusText(
                        task.taskStatus
                      )}

                    </span>

                  </div>


                  {/* TIME */}

                  <div className="task-time">

                    <FaClock />

                    {task.from}

                    {task.to &&
                      ` - ${task.to}`}

                  </div>


                  {/* STATUS BADGE */}

                  <div
                    className={
                      `status-badge ${task.taskStatus || ""}`
                    }
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

          <button
            className="add-task-dashboard"
            onClick={() =>
              window.location.href = "/task"
            }
          >

            <span>
              +
            </span>

            Add New Task

          </button>


        </section>


      </main>


      {/* =================================
          MOBILE BOTTOM NAV
      ================================= */}

      <nav className="bottom-nav">


        {/* DASHBOARD */}

        <button
          className="active"
          onClick={() =>
            window.location.href =
              "/dashboard"
          }
        >

          <FaThLarge />

          <span>
            Dashboard
          </span>

        </button>


        {/* MY SCHEDULE */}

        <button>

          <FaCalendarAlt />

          <span>
            My Schedule
          </span>

        </button>


        {/* TASKS */}

        <button
          onClick={() =>
            window.location.href =
              "/task"
          }
        >

          <FaTasks />

          <span>
            Tasks
          </span>

        </button>


        {/* PROGRESS */}

        <button>

          <FaChartBar />

          <span>
            Progress
          </span>

        </button>


        {/* PROFILE */}

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