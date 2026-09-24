import { useEffect, useMemo, useState } from "react";
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
  FaChevronRight,
  FaMagnifyingGlass,
  FaArrowRight,
  FaUser,
} from "react-icons/fa6";

import "./parent-dashboard.css";


function ParentDashboard() {

  const navigate = useNavigate();


  /* =========================================
     STATES
  ========================================= */

  const [parent, setParent] = useState(null);

  const [loading, setLoading] = useState(true);

  const [mobileOpen, setMobileOpen] = useState(false);

  const [activePage, setActivePage] =
    useState("dashboard");

  const [search, setSearch] = useState("");


  /* =========================================
     DASHBOARD DATA
  ========================================= */

  const [dashboard, setDashboard] = useState({

    students: [],

    student: null,

    totalStudents: 0,

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
     CHECK LOGIN
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

      localStorage.removeItem(
        "parentLoggedIn"
      );

      localStorage.removeItem(
        "parentStudents"
      );


      navigate("/parent/login", {
        replace: true,
      });

    }

  }, [navigate]);


  /* =========================================
     LOAD PARENT DASHBOARD
  ========================================= */

  useEffect(() => {

    if (!parent?.id) return;

    loadDashboard();

  }, [parent]);


  /* =========================================
     LOAD DATA
  ========================================= */

  const loadDashboard = async () => {

    try {

      setLoading(true);


      const response = await fetch(
        "https://zyntaweb.com/skilllab/parent-dashboard.php",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({

            action:
              "parent_overview",

            parent_id:
              parent.id,

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

        const overview =
          data.overview || {};


        setDashboard({

          ...overview,

          students:
            Array.isArray(
              overview.students
            )
              ? overview.students
              : [],

        });

      }

    } catch (error) {

      console.error(
        "Parent dashboard error:",
        error
      );


      /*
       * FALLBACK
       * If API fails, use students
       * saved during login.
       */

      try {

        const savedStudents =
          JSON.parse(
            localStorage.getItem(
              "parentStudents"
            ) || "[]"
          );


        setDashboard((prev) => ({

          ...prev,

          students:
            Array.isArray(
              savedStudents
            )
              ? savedStudents
              : [],

          totalStudents:
            Array.isArray(
              savedStudents
            )
              ? savedStudents.length
              : 0,

        }));

      } catch (storageError) {

        console.error(
          "Student storage error:",
          storageError
        );

      }

    } finally {

      setLoading(false);

    }

  };


  /* =========================================
     LOGOUT
  ========================================= */

  const handleLogout = () => {

    localStorage.removeItem(
      "parent"
    );

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
     GET STUDENTS
  ========================================= */

  const students = Array.isArray(
    dashboard.students
  )
    ? dashboard.students
    : [];


  /* =========================================
     SEARCH STUDENTS
  ========================================= */

  const filteredStudents = useMemo(() => {

    const value =
      search
        .trim()
        .toLowerCase();


    if (!value) {

      return students;

    }


    return students.filter(
      (student) => {

        return (

          String(
            student.name || ""
          )
            .toLowerCase()
            .includes(value)

          ||

          String(
            student.email || ""
          )
            .toLowerCase()
            .includes(value)

          ||

          String(
            student.id || ""
          )
            .toLowerCase()
            .includes(value)

        );

      }
    );

  }, [students, search]);


  /* =========================================
     INITIALS
  ========================================= */

  const getInitials = (name) => {

    if (!name) return "S";


    const parts =
      name
        .trim()
        .split(/\s+/);


    if (parts.length === 1) {

      return parts[0]
        .substring(0, 2)
        .toUpperCase();

    }


    return (

      parts[0][0] +

      parts[
        parts.length - 1
      ][0]

    ).toUpperCase();

  };


  /* =========================================
     PERFORMANCE CLASS
  ========================================= */

  const getPerformanceClass = (
    percentage
  ) => {

    const value =
      Number(percentage) || 0;


    if (value >= 60) {

      return "strong";

    }


    if (value >= 40) {

      return "good";

    }


    return "weak";

  };


  /* =========================================
     PERFORMANCE LABEL
  ========================================= */

  const getPerformanceLabel = (
    percentage
  ) => {

    const value =
      Number(percentage) || 0;


    if (value >= 60) {

      return "Strong";

    }


    if (value >= 40) {

      return "Average";

    }


    return "Needs Attention";

  };


  /* =========================================
     FORMAT DATE
  ========================================= */

  const formatDate = (date) => {

    if (!date) return "—";


    const parsed =
      new Date(date);


    if (
      Number.isNaN(
        parsed.getTime()
      )
    ) {

      return date;

    }


    return parsed.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );

  };


  /* =========================================
     OPEN STUDENT DASHBOARD
  ========================================= */

  const openStudentDashboard = (
    student
  ) => {

    sessionStorage.setItem(
      `parentViewingStudent_${student.id}`,
      JSON.stringify({
        id: student.id,
        name: student.name,
        email: student.email,
      })
    );


    /*
     * If you already have a parent
     * student dashboard route, use it here.
     *
     * For now the card click only stores
     * selected student.
     */

    console.log(
      "Selected student:",
      student
    );

  };


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

        {/* BRAND */}

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


        {/* NAVIGATION */}

        <div className="parent-sidebar-content">


          {/* DASHBOARD */}

          <button
            className={`parent-nav-item ${
              activePage === "dashboard"
                ? "active"
                : ""
            }`}
            onClick={() => {

              setActivePage(
                "dashboard"
              );

              setSearch("");

              setMobileOpen(false);

            }}
          >

            <FaGaugeHigh />

            <span>
              Dashboard
            </span>

          </button>


          {/* MY STUDENTS */}

          <button
            className={`parent-nav-item ${
              activePage === "students"
                ? "active"
                : ""
            }`}
            onClick={() => {

              setActivePage(
                "students"
              );

              setSearch("");

              setMobileOpen(false);

            }}
          >

            <FaUserGraduate />

            <span>
              My Students
            </span>

          </button>


          {/* TASK PERFORMANCE */}

          <button
            className={`parent-nav-item ${
              activePage === "performance"
                ? "active"
                : ""
            }`}
            onClick={() => {

              setActivePage(
                "performance"
              );

              setMobileOpen(false);

            }}
          >

            <FaListCheck />

            <span>
              Task Performance
            </span>

          </button>


        </div>


        {/* LOGOUT */}

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

            {activePage === "students"
              ? "My Students"
              : activePage === "performance"
              ? "Task Performance"
              : "Parent Dashboard"}

          </h1>


          <p>

            {activePage === "students"
              ? "View your assigned students."
              : activePage === "performance"
              ? "Monitor your child's task performance."
              : "Monitor your child's learning performance and progress."}

          </p>

        </div>

      </div>


      {/* PROFILE */}

      <div className="parent-profile">

        <div className="parent-profile-avatar">

          {getInitials(
            parent?.name ||
            parent?.username
          )}

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
              Number(
                percentage
              ) || 0
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
     DASHBOARD HOME
  ========================================= */

  const renderDashboardHome = () => (

    <>

      {/* CHILD SUMMARY */}

      <section className="parent-child-banner">

        <div className="parent-child-avatar">

          <FaUserGraduate />

        </div>


        <div>

          <span>
            Assigned Students
          </span>

          <h2>
            {students.length} Students
          </h2>

          <p>
            Track your assigned children's
            daily learning activity.
          </p>

        </div>

      </section>


      {/* STAT CARDS */}

      <section className="parent-stat-grid">


        <StatCard
          icon={<FaUserGraduate />}
          title="My Students"
          value={
            students.length
          }
          subtitle="Assigned students"
          type="purple"
        />


        <StatCard
          icon={<FaListCheck />}
          title="Total Tasks"
          value={
            dashboard.totalTasks ?? 0
          }
          subtitle="Assigned tasks"
          type="blue"
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


      {/* RECENT ACTIVITY */}

      <section className="parent-activity-card">

        <div className="parent-section-header">

          <div>

            <h2>
              My Students
            </h2>

            <p>
              Students assigned to your account
            </p>

          </div>


          <button
            className="parent-view-all-button"
            onClick={() =>
              setActivePage(
                "students"
              )
            }
          >

            View Students

            <FaArrowRight />

          </button>

        </div>


        {students.length === 0 ? (

          <div className="parent-empty">

            <FaUserGraduate />

            <h3>
              No Students Assigned
            </h3>

            <p>
              No students are currently
              assigned to your account.
            </p>

          </div>

        ) : (

          <div className="parent-mini-student-list">

            {students
              .slice(0, 3)
              .map((student) => (

                <div
                  className="parent-mini-student"
                  key={student.id}
                >

                  <div className="parent-mini-avatar">

                    {getInitials(
                      student.name
                    )}

                  </div>


                  <div>

                    <strong>
                      {student.name}
                    </strong>

                    <span>
                      Student ID: #{student.id}
                    </span>

                  </div>

                </div>

              ))}

          </div>

        )}

      </section>

    </>

  );


  /* =========================================
     MY STUDENTS PAGE
  ========================================= */

  const renderMyStudents = () => (

    <section className="parent-all-students-page">


      {/* HEADER */}

      <div className="parent-all-students-header">

        <div>

          <h2>
            My Students
          </h2>

          <p>
            View and monitor your assigned students.
          </p>

        </div>


        <button
          className="parent-refresh-button"
          onClick={loadDashboard}
          disabled={loading}
        >

          {loading
            ? "Refreshing..."
            : "Refresh"}

        </button>

      </div>


      {/* SEARCH */}

      <div className="parent-students-search-box">

        <FaMagnifyingGlass />

        <input
          type="text"
          placeholder="Search student by name, email or ID..."
          value={search}
          onChange={(e) =>
            setSearch(
              e.target.value
            )
          }
        />

      </div>


      {/* STUDENTS */}

      {loading ? (

        <div className="parent-loading students-page-loading">

          <span />

          <p>
            Loading students...
          </p>

        </div>

      ) : filteredStudents.length === 0 ? (

        <div className="parent-empty students-empty">

          <div>
            <FaUser />
          </div>

          <h3>
            No students found
          </h3>

          <p>
            No students are assigned
            to your account.
          </p>

        </div>

      ) : (

        <div className="parent-student-cards-grid">


          {filteredStudents.map(
            (student) => {

              const performance =
                Number(
                  student.weekPerformance ||
                  student.week_performance ||
                  student.performance ||
                  0
                );


              const status =
                student.status ||
                "active";


              return (

                <div
                  className="parent-student-card"
                  key={student.id}
                  onClick={() =>
                    openStudentDashboard(
                      student
                    )
                  }
                >


                  {/* TOP */}

                  <div className="parent-student-card-top">


                    {student.photo ? (

                      <img
                        src={
                          student.photo
                        }
                        alt={
                          student.name
                        }
                        className="parent-student-card-photo"
                      />

                    ) : (

                      <div className="parent-student-card-avatar">

                        {getInitials(
                          student.name
                        )}

                      </div>

                    )}


                    <div className="parent-student-card-name">

                      <h3>

                        {student.name ||
                          "Unnamed Student"}

                      </h3>


                      <span>

                        Student ID: #
                        {student.id}

                      </span>

                    </div>


                    <FaChevronRight
                      className="parent-student-card-arrow"
                    />

                  </div>


                  {/* EMAIL */}

                  <div className="parent-student-card-contact">

                    <span className="parent-email-icon">
                      @
                    </span>


                    <span>

                      {student.email ||
                        "—"}

                    </span>

                  </div>


                  {/* DETAILS */}

                  <div className="parent-student-card-details">


                    <div>

                      <small>
                        Join Date
                      </small>

                      <strong>

                        <FaCalendarDays />

                        {formatDate(
                          student.join_date ||
                          student.joinDate
                        )}

                      </strong>

                    </div>


                    <div>

                      <small>
                        Expiry Date
                      </small>

                      <strong>

                        <FaCalendarDays />

                        {formatDate(
                          student.expiry_date ||
                          student.expiryDate
                        )}

                      </strong>

                    </div>


                  </div>


                  {/* STATUS */}

                  <div className="parent-student-card-status-row">


                    <span
                      className={`parent-student-status ${status}`}
                    >

                      <span className="parent-status-dot" />

                      {status === "expired"
                        ? "Expired"
                        : status === "expiring"
                        ? "Expiring Soon"
                        : "Active"}

                    </span>


                    <span className="parent-student-performance-text">

                      {performance}%

                    </span>


                  </div>


                  {/* PROGRESS */}

                  <div className="parent-student-card-progress">

                    <div className="parent-student-card-progress-track">

                      <div
                        className={`parent-student-card-progress-fill ${getPerformanceClass(
                          performance
                        )}`}
                        style={{
                          width: `${Math.min(
                            100,
                            performance
                          )}%`,
                        }}
                      />

                    </div>

                  </div>


                  {/* BUTTON */}

                  <button
                    className="parent-student-dashboard-button"
                    onClick={(e) => {

                      e.stopPropagation();

                      openStudentDashboard(
                        student
                      );

                    }}
                  >

                    View Dashboard

                    <FaArrowRight />

                  </button>


                </div>

              );

            }
          )}


        </div>

      )}


    </section>

  );


  /* =========================================
     TASK PERFORMANCE
  ========================================= */

  const renderTaskPerformance = () => (

    <section className="parent-performance-page">

      <div className="parent-page-heading">

        <h2>
          Task Performance
        </h2>

        <p>
          Monitor your assigned students'
          task performance.
        </p>

      </div>


      <div className="parent-performance-info-card">

        <FaListCheck />

        <div>

          <h3>
            Task Performance
          </h3>

          <p>
            Detailed task performance
            will be displayed here.
          </p>

        </div>

      </div>

    </section>

  );


  /* =========================================
     MAIN
  ========================================= */

  return (

    <div className="parent-dashboard">


      {/* SIDEBAR */}

      {renderSidebar()}


      {/* MAIN */}

      <main className="parent-main">


        {/* TOPBAR */}

        {renderTopbar()}


        {/* CONTENT */}

        <div className="parent-content">


          {activePage === "dashboard" && (

            renderDashboardHome()

          )}


          {activePage === "students" && (

            renderMyStudents()

          )}


          {activePage === "performance" && (

            renderTaskPerformance()

          )}


        </div>


      </main>


    </div>

  );

}


export default ParentDashboard;