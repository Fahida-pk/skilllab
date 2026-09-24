import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  FaGaugeHigh,
  FaUserGraduate,
  FaListCheck,
  FaCircleCheck,
  FaClock,
  FaTrophy,
  FaChartLine,
  FaCalendarDays,
  FaArrowRightFromBracket,
  FaBars,
  FaXmark,
  FaTriangleExclamation,
} from "react-icons/fa6";

import "./parent-dashboard.css";


function ParentDashboard() {

  const navigate = useNavigate();

  const [parent, setParent] = useState(null);

  const [loading, setLoading] = useState(true);

  const [mobileOpen, setMobileOpen] = useState(false);

  const [dashboard, setDashboard] = useState({
    student: null,

    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,

    todayPerformance: 0,
    weeklyPerformance: 0,
    monthlyPerformance: 0,

    todayCompleted: 0,
    todayTotal: 0,

    weekCompleted: 0,
    weekTotal: 0,

    monthCompleted: 0,
    monthTotal: 0,
  });


  /* =========================================
     CHECK PARENT LOGIN
  ========================================= */

  useEffect(() => {

    const savedParent =
      localStorage.getItem("parent");

    const loggedIn =
      localStorage.getItem("parentLoggedIn");

    if (
      loggedIn !== "true" ||
      !savedParent
    ) {

      navigate("/parent/login", {
        replace: true,
      });

      return;
    }

    try {

      const parentData =
        JSON.parse(savedParent);

      setParent(parentData);

    } catch (error) {

      console.error(
        "Parent data error:",
        error
      );

      localStorage.removeItem("parent");
      localStorage.removeItem("parentLoggedIn");

      navigate("/parent/login", {
        replace: true,
      });

    }

  }, [navigate]);


  /* =========================================
     LOAD DASHBOARD
  ========================================= */

  useEffect(() => {

    if (!parent?.id) return;

    loadDashboard();

  }, [parent]);


  const loadDashboard = async () => {

    try {

      setLoading(true);

      const response = await fetch(
        "https://zyntaweb.com/skilllab/parent-dashboard.php",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            action: "parent_overview",
            parent_id: parent.id,
          }),
        }
      );

      const data =
        await response.json();

      console.log(
        "Parent Dashboard:",
        data
      );

      if (data.success) {

        setDashboard(
          data.overview || {}
        );

      }

    } catch (error) {

      console.error(
        "Parent dashboard error:",
        error
      );

    } finally {

      setLoading(false);

    }

  };


  /* =========================================
     LOGOUT
  ========================================= */

  const handleLogout = () => {

    localStorage.removeItem("parent");

    localStorage.removeItem(
      "parentLoggedIn"
    );

    localStorage.removeItem(
      "parentStudents"
    );

    navigate("/parent/login", {
      replace: true,
    });

  };


  /* =========================================
     STUDENT NAME
  ========================================= */

  const studentName =
    dashboard?.student?.name ||
    "My Child";


  /* =========================================
     INITIALS
  ========================================= */

  const getInitials = (name) => {

    if (!name) return "S";

    const parts =
      name.trim().split(/\s+/);

    if (parts.length === 1) {

      return parts[0]
        .substring(0, 2)
        .toUpperCase();

    }

    return (
      parts[0][0] +
      parts[parts.length - 1][0]
    ).toUpperCase();

  };


  /* =========================================
     PERFORMANCE TEXT
  ========================================= */

  const getPerformanceText = (value) => {

    const percentage =
      Number(value) || 0;

    if (percentage >= 60) {
      return "Strong Performance";
    }

    if (percentage >= 40) {
      return "Average Performance";
    }

    return "Needs Attention";
  };


  /* =========================================
     STAT CARD
  ========================================= */

  const StatCard = ({
    icon,
    title,
    value,
    subtitle,
    type,
  }) => (

    <div className="parent-stat-card">

      <div
        className={`parent-stat-icon ${type}`}
      >
        {icon}
      </div>

      <div className="parent-stat-details">

        <span>
          {title}
        </span>

        <strong>
          {value}
        </strong>

        <small>
          {subtitle}
        </small>

      </div>

    </div>

  );


  /* =========================================
     PERFORMANCE CARD
  ========================================= */

  const PerformanceCard = ({
    title,
    percentage,
    completed,
    total,
    type,
  }) => (

    <div
      className={`parent-performance-card ${type}`}
    >

      <div className="parent-performance-header">

        <div className="parent-performance-title">

          <div
            className={`parent-performance-icon ${type}`}
          >
            <FaCalendarDays />
          </div>

          <div>

            <h2>
              {title}
            </h2>

            <p>
              Overall student performance
            </p>

          </div>

        </div>

        <strong>
          {percentage}%
        </strong>

      </div>


      <div className="parent-large-progress">

        <div
          className={`parent-large-progress-fill ${type}`}
          style={{
            width: `${Math.min(
              100,
              Number(percentage) || 0
            )}%`,
          }}
        />

      </div>


      <div className="parent-performance-footer">

        <span>

          <FaCircleCheck />

          {completed} completed

        </span>

        <span>

          {total} total tasks

        </span>

      </div>

    </div>

  );


  /* =========================================
     SIDEBAR
  ========================================= */

  const renderSidebar = () => (

    <>

      {mobileOpen && (

        <div
          className="parent-sidebar-overlay"
          onClick={() =>
            setMobileOpen(false)
          }
        />

      )}


      <aside
        className={`parent-sidebar ${
          mobileOpen
            ? "mobile-open"
            : ""
        }`}
      >

        <div className="parent-sidebar-brand">

          <strong>
            SKILL LAB
          </strong>

          <button
            className="parent-sidebar-close"
            onClick={() =>
              setMobileOpen(false)
            }
          >

            <FaXmark />

          </button>

        </div>


        <div className="parent-sidebar-content">

          <button
            className="parent-nav-item active"
          >

            <FaGaugeHigh />

            <span>
              Dashboard
            </span>

          </button>


          <button
            className="parent-nav-item"
          >

            <FaUserGraduate />

            <span>
              My Child
            </span>

          </button>


          <button
            className="parent-nav-item"
          >

            <FaListCheck />

            <span>
              Task Performance
            </span>

          </button>

        </div>


        <div className="parent-sidebar-bottom">

          <button
            className="parent-logout"
            onClick={handleLogout}
          >

            <FaArrowRightFromBracket />

            <span>
              Logout
            </span>

          </button>

        </div>

      </aside>

    </>

  );


  /* =========================================
     TOPBAR
  ========================================= */

  const renderTopbar = () => (

    <header className="parent-topbar">

      <div className="parent-topbar-left">

        <button
          className="parent-mobile-menu"
          onClick={() =>
            setMobileOpen(true)
          }
        >

          <FaBars />

        </button>


        <div>

          <h1>
            Parent Dashboard
          </h1>

          <p>
            Monitor your child's learning
            performance and progress.
          </p>

        </div>

      </div>


      <div className="parent-profile">

        <div className="parent-profile-avatar">

          {getInitials(studentName)}

        </div>

        <div>

          <strong>
            Welcome Parent
          </strong>

          <span>
            {parent?.username || ""}
          </span>

        </div>

      </div>

    </header>

  );


  /* =========================================
     DASHBOARD
  ========================================= */

  return (

    <div className="parent-dashboard">

      {renderSidebar()}


      <main className="parent-main">

        {renderTopbar()}


        <div className="parent-content">


          {/* CHILD */}

          <section className="parent-child-banner">

            <div className="parent-child-avatar">

              {dashboard?.student?.photo ? (

                <img
                  src={
                    dashboard.student.photo
                  }
                  alt={studentName}
                />

              ) : (

                getInitials(studentName)

              )}

            </div>


            <div>

              <span>
                Student
              </span>

              <h2>
                {studentName}
              </h2>

              <p>
                Track your child's daily
                learning activity.
              </p>

            </div>

          </section>


          {/* STAT CARDS */}

          <section className="parent-stat-grid">

            <StatCard
              icon={<FaListCheck />}
              title="Total Tasks"
              value={
                dashboard.totalTasks ?? 0
              }
              subtitle="Assigned tasks"
              type="purple"
            />


            <StatCard
              icon={<FaCircleCheck />}
              title="Completed"
              value={
                dashboard.completedTasks ?? 0
              }
              subtitle="Completed tasks"
              type="green"
            />


            <StatCard
              icon={<FaClock />}
              title="Pending"
              value={
                dashboard.pendingTasks ?? 0
              }
              subtitle="Tasks remaining"
              type="orange"
            />


            <StatCard
              icon={<FaTrophy />}
              title="Performance"
              value={
                `${dashboard.weeklyPerformance ?? 0}%`
              }
              subtitle="Weekly performance"
              type="blue"
            />

          </section>


          {/* PERFORMANCE */}

          <section className="parent-performance-grid">

            <PerformanceCard
              title="Today Performance"
              percentage={
                dashboard.todayPerformance ?? 0
              }
              completed={
                dashboard.todayCompleted ?? 0
              }
              total={
                dashboard.todayTotal ?? 0
              }
              type="green"
            />


            <PerformanceCard
              title="Weekly Performance"
              percentage={
                dashboard.weeklyPerformance ?? 0
              }
              completed={
                dashboard.weekCompleted ?? 0
              }
              total={
                dashboard.weekTotal ?? 0
              }
              type="blue"
            />


            <PerformanceCard
              title="Monthly Performance"
              percentage={
                dashboard.monthlyPerformance ?? 0
              }
              completed={
                dashboard.monthCompleted ?? 0
              }
              total={
                dashboard.monthTotal ?? 0
              }
              type="purple"
            />

          </section>


          {/* SUMMARY */}

          <section className="parent-summary-grid">

            <div className="parent-summary-card">

              <div className="parent-summary-icon">

                <FaChartLine />

              </div>

              <div>

                <h3>
                  Overall Performance
                </h3>

                <strong>
                  {dashboard.weeklyPerformance ?? 0}%
                </strong>

                <p>
                  {getPerformanceText(
                    dashboard.weeklyPerformance
                  )}
                </p>

              </div>

            </div>


            <div className="parent-summary-card">

              <div className="parent-summary-icon warning">

                <FaTriangleExclamation />

              </div>

              <div>

                <h3>
                  Learning Status
                </h3>

                <strong>
                  {getPerformanceText(
                    dashboard.weeklyPerformance
                  )}
                </strong>

                <p>
                  Keep checking your child's
                  task progress regularly.
                </p>

              </div>

            </div>

          </section>


          {/* RECENT ACTIVITY */}

          <section className="parent-activity-card">

            <div className="parent-section-header">

              <div>

                <h2>
                  Recent Learning Activity
                </h2>

                <p>
                  Latest task performance
                </p>

              </div>

            </div>


            {loading ? (

              <div className="parent-loading">

                <span />

                <p>
                  Loading performance...
                </p>

              </div>

            ) : (

              <div className="parent-empty">

                <FaListCheck />

                <h3>
                  Task performance will appear here
                </h3>

                <p>
                  Your child's latest completed
                  tasks will be displayed here.
                </p>

              </div>

            )}

          </section>


        </div>

      </main>

    </div>

  );

}


export default ParentDashboard;