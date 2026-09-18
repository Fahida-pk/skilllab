import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  FaGaugeHigh,
  FaChartLine,
  FaUsers,
  FaLayerGroup,
  FaMedal,
  FaTrophy,
  FaUserGraduate,
  FaUserTie,
  FaCreditCard,
  FaGear,
  FaArrowRightFromBracket,
  FaChevronDown,
  FaChevronRight,
  FaBars,
  FaXmark,
  FaCircleCheck,
  FaTriangleExclamation,
  FaCalendar,
  FaClock,
  FaArrowUp,
  FaArrowDown,
  FaArrowRight,
  FaMagnifyingGlass,
  FaUser,
} from "react-icons/fa6";

import "./admin-dashboard.css";

const API_URL =
  "https://zyntaweb.com/skilllab/admin-dashboard.php";

function AdminDashboard() {
  const navigate = useNavigate();
  const location = useLocation();

  const [admin, setAdmin] = useState(null);

  const [students, setStudents] = useState([]);

  const [dashboardData, setDashboardData] =
    useState({
      totalStudents: 0,

      todayPerformance: 0,
      weekPerformance: 0,
      monthPerformance: 0,

      todayCompleted: 0,
      todayTotal: 0,

      weekCompleted: 0,
      weekTotal: 0,

      monthCompleted: 0,
      monthTotal: 0,

      strongStudents: 0,
      weakStudents: 0,
      startedStudents: 0,
      notStartedStudents: 0,
      totalTasks: 0,

      weeklyStrongStudents: [],
      weeklyGoodStudents: [],
      weeklyWeakStudents: [],

      monthlyStrongStudents: [],
      monthlyGoodStudents: [],
      monthlyWeakStudents: [],

      todayStrongStudents: [],
      todayGoodStudents: [],
      todayWeakStudents: [],
    });

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState("");

  const [mobileOpen, setMobileOpen] =
    useState(false);

  const [studentsOpen, setStudentsOpen] =
    useState(
      location.pathname.startsWith(
        "/admin/students"
      )
    );

  /* =========================================
     ADMIN
  ========================================= */

  useEffect(() => {
    try {
      const savedAdmin =
        localStorage.getItem("admin");

      if (!savedAdmin) {
        navigate("/admin/login", {
          replace: true,
        });
        return;
      }

      setAdmin(JSON.parse(savedAdmin));
    } catch (error) {
      console.error(
        "Admin data error:",
        error
      );

      localStorage.removeItem("admin");
      localStorage.removeItem(
        "adminLoggedIn"
      );

      navigate("/admin/login", {
        replace: true,
      });
    }
  }, [navigate]);

  /* =========================================
     FETCH ADMIN DATA
  ========================================= */

  const fetchAdminData = async (silent = false) => {
    try {
      // Manual Refresh shows the loading state.
      // Automatic refresh runs silently so the dashboard does not flicker.
      if (!silent) {
        setRefreshing(true);
      }

      const savedAdmin =
        localStorage.getItem("admin");

      if (!savedAdmin) {
        navigate("/admin/login", {
          replace: true,
        });
        return;
      }

      const adminData =
        JSON.parse(savedAdmin);

      const response = await fetch(
        API_URL,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            action: "admin_overview",
            admin_email:
              adminData.email,
          }),
        }
      );

      const data =
        await response.json();

      console.log(
        "ADMIN DASHBOARD:",
        data
      );

      if (!data.success) {
        throw new Error(
          data.message ||
            "Unable to load admin data"
        );
      }

      setDashboardData(
        data.overview || {}
      );

      setStudents(
        Array.isArray(data.students)
          ? data.students
          : []
      );
    } catch (error) {
      console.error(
        "Admin dashboard error:",
        error
      );
    } finally {
      setLoading(false);

      if (!silent) {
        setRefreshing(false);
      }
    }
  };

  useEffect(() => {
    if (!admin?.email) return;

    // First load
    fetchAdminData();

    // Automatically update admin dashboard when student/task data changes.
    // No browser refresh is required.
    const refreshInterval = setInterval(() => {
      fetchAdminData(true);
    }, 5000);

    // Refresh immediately when admin comes back to this browser tab.
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchAdminData(true);
      }
    };

    const handleWindowFocus = () => {
      fetchAdminData(true);
    };

    document.addEventListener(
      "visibilitychange",
      handleVisibilityChange
    );

    window.addEventListener("focus", handleWindowFocus);

    return () => {
      clearInterval(refreshInterval);
      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange
      );
      window.removeEventListener("focus", handleWindowFocus);
    };
  }, [admin]);

  /* =========================================
     ROUTE
  ========================================= */

  const isStudentsPage =
    location.pathname ===
      "/admin/students" ||
    location.pathname.startsWith(
      "/admin/students/"
    );

  /* =========================================
     SEARCH
  ========================================= */

  const filteredStudents = useMemo(() => {
    const value =
      search.trim().toLowerCase();

    if (!value) {
      return students;
    }

    return students.filter((student) => {
      return (
        String(student.name || "")
          .toLowerCase()
          .includes(value) ||

        String(student.email || "")
          .toLowerCase()
          .includes(value) ||

        String(student.phone || "")
          .toLowerCase()
          .includes(value)
      );
    });
  }, [students, search]);

  /* =========================================
     LOGOUT
  ========================================= */

  const handleLogout = () => {
    localStorage.removeItem("admin");
    localStorage.removeItem(
      "adminLoggedIn"
    );

    navigate("/admin/login", {
      replace: true,
    });
  };

  /* =========================================
     NAVIGATION
  ========================================= */
/* =========================================
   NAVIGATION
========================================= */

const goDashboard = () => {

  navigate("/AdminDashboard");

  setMobileOpen(false);
};


const goStudents = () => {

  navigate("/admin/students");

  setMobileOpen(false);
};

/* =========================================
   VIEW STUDENT DASHBOARD
   Pass selected student details to Dashboard.
========================================= */
const openStudentDashboard = (student) => {
  // Selected student details persist ചെയ്യുക
  sessionStorage.setItem(
    `adminViewingStudent_${student.id}`,
    JSON.stringify({
      id: student.id,
      name: student.name,
      email: student.email,
    })
  );

  navigate(
    `/admin/students/${student.id}/dashboard`,
    {
      state: {
        studentId: student.id,
        studentEmail: student.email,
        studentName: student.name,
      },
    }
  );
};
 

  /* =========================================
     HELPERS
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

  const getPerformanceLabel = (
    percentage
  ) => {
    const value =
      Number(percentage) || 0;

    if (value >= 60) {
      return "Strong";
    }

    if (value >= 40) {
      return "Good Progress";
    }

    return "Needs Attention";
  };

  const formatDate = (date) => {
    if (!date) return "—";

    const parsed =
      new Date(date);

    if (Number.isNaN(
      parsed.getTime()
    )) {
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
     EXTRA PERFORMANCE ANALYSIS HELPERS
  ========================================= */

  const getPerformanceGroups = (period) => {
    if (period === "today") {
      return {
        strong: dashboardData.todayStrongStudents || [],
        good: dashboardData.todayGoodStudents || [],
        weak: dashboardData.todayWeakStudents || [],
      };
    }

    if (period === "weekly") {
      return {
        strong: dashboardData.weeklyStrongStudents || [],
        good: dashboardData.weeklyGoodStudents || [],
        weak: dashboardData.weeklyWeakStudents || [],
      };
    }

    return {
      strong: dashboardData.monthlyStrongStudents || [],
      good: dashboardData.monthlyGoodStudents || [],
      weak: dashboardData.monthlyWeakStudents || [],
    };
  };

  const getPieBackground = (groups) => {
    const strong = groups.strong.length;
    const good = groups.good.length;
    const weak = groups.weak.length;
    const total = strong + good + weak;

    if (total === 0) {
      return "#eeeaf4";
    }

    const strongEnd = (strong / total) * 100;
    const goodEnd = ((strong + good) / total) * 100;

    return `conic-gradient(
      #22c55e 0% ${strongEnd}%,
      #f59e0b ${strongEnd}% ${goodEnd}%,
      #ef4444 ${goodEnd}% 100%
    )`;
  };

  /* =========================================
     SIDEBAR
  ========================================= */

  const renderSidebar = () => (
    <>
      {mobileOpen && (
        <div
          className="admin-sidebar-overlay"
          onClick={() =>
            setMobileOpen(false)
          }
        />
      )}

      <aside
        className={`admin-sidebar ${
          mobileOpen
            ? "mobile-open"
            : ""
        }`}
      >

        {/* BRAND */}

        <div className="admin-brand">

      

          <div className="admin-brand-text">

            <strong>
              SKILL LAB
            </strong>

           

          </div>

          <button
            className="mobile-sidebar-close"
            onClick={() =>
              setMobileOpen(false)
            }
          >
            <FaXmark />
          </button>

        </div>

        {/* NAVIGATION */}

        <div className="admin-sidebar-content">

          {/* DASHBOARD */}

          <div className="admin-nav-group">

            <button
              className={`admin-nav-item ${
                !isStudentsPage &&
                location.pathname ===
                  "/admin/dashboard"
                  ? "active"
                  : ""
              }`}
              onClick={goDashboard}
            >
              <FaGaugeHigh />

              <span>
                Dashboard
              </span>
            </button>

          </div>

          {/* STUDENTS */}

          <div className="admin-nav-group">

            <button
              className={`admin-nav-item ${
                isStudentsPage
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                setStudentsOpen(
                  !studentsOpen
                )
              }
            >
              <FaUsers />

              <span>
                Students
              </span>

              <FaChevronDown
                className={`admin-nav-arrow ${
                  studentsOpen
                    ? "rotate"
                    : ""
                }`}
              />
            </button>

            {studentsOpen && (
              <div className="admin-submenu">

                <button
                  className={
                    isStudentsPage
                      ? "submenu-active"
                      : ""
                  }
                  onClick={
                    goStudents
                  }
                >
                  <FaUserGraduate />

                  <span>
                    All Students
                  </span>
                </button>

              </div>
            )}

          </div>

          {/* PARENTS */}

          <div className="admin-nav-group">

            <button
              className="admin-nav-item"
            >
              <FaUserTie />

              <span>
                Parents
              </span>

              <FaChevronDown
                className="admin-nav-arrow"
              />
            </button>

          </div>

          {/* PAYMENT */}

          <div className="admin-nav-group">

            <button
              className="admin-nav-item"
            >
              <FaCreditCard />

              <span>
                Payment Gateway
              </span>
            </button>

          </div>

          

        </div>

        {/* LOGOUT */}

        <div className="admin-sidebar-bottom">

          <button
            className="admin-logout"
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
    <header className="admin-topbar">

      <div className="admin-topbar-left">

        <button
          className="mobile-menu-button"
          onClick={() =>
            setMobileOpen(true)
          }
        >
          <FaBars />
        </button>

        <div>

          <h1>
            {isStudentsPage
              ? "All Students"
              : "Admin Dashboard"}
          </h1>

          <p>
            {isStudentsPage
              ? "View and manage all registered students."
              : "Monitor today, weekly, monthly and overall student performance."}
          </p>

        </div>

      </div>

     <div className="admin-profile">
  <div className="admin-profile-info">
    <strong>
      Welcome Admin
    </strong>
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
    <div className="admin-stat-card">

      <div
        className={`admin-stat-icon ${type}`}
      >
        {icon}
      </div>

      <div className="admin-stat-details">

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
     DASHBOARD HOME
  ========================================= */

  const renderDashboardHome = () => (
    <>

      {/* STAT CARDS */}

      <section className="admin-stat-grid">

        <StatCard
          icon={<FaUsers />}
          title="Total Students"
          value={dashboardData.totalStudents ?? 0}
          subtitle="All registered students"
          type="purple"
        />

        <StatCard
          icon={<FaLayerGroup />}
          title="Total Tasks"
          value={dashboardData.totalTasks ?? 0}
          subtitle="Tasks this week"
          type="blue"
        />

        <StatCard
          icon={<FaMedal />}
          title="Started Students"
          value={dashboardData.startedStudents ?? 0}
          subtitle="Students who started tasks"
          type="green"
        />

        <StatCard
          icon={<FaClock />}
          title="Not Started"
          value={dashboardData.notStartedStudents ?? 0}
          subtitle="Students with no started task"
          type="purple"
        />

      </section>

      {/* STRONG / AVERAGE / WEAK PERFORMANCE */}
      <section className="admin-performance-summary-grid">

        <StatCard
          icon={<FaTrophy />}
          title="Strong Performance"
          value={dashboardData.strongStudents ?? 0}
          subtitle="Students at 60% or above"
          type="green"
        />

        <StatCard
          icon={<FaChartLine />}
          title="Average Performance"
          value={
            dashboardData.averageStudents ??
            Math.max(
              0,
              Number(dashboardData.totalStudents || 0) -
                Number(dashboardData.strongStudents || 0) -
                Number(dashboardData.weakStudents || 0)
            )
          }
          subtitle="Students between 40% and 59%"
          type="blue"
        />

        <StatCard
          icon={<FaTriangleExclamation />}
          title="Weak Performance"
          value={dashboardData.weakStudents ?? 0}
          subtitle="Students below 40% or not started"
          type="red"
        />

      </section>


      {/* TODAY / WEEK / MONTH */}

      <section className="admin-performance-grid">

        {/* TODAY */}
        <div className="admin-performance-card today-card">
          <div className="performance-card-header">
            <div className="performance-title">
              <div className="performance-icon green">
                <FaCircleCheck />
              </div>
              <div>
                <h2>Today Performance</h2>
                <p>Overall student performance</p>
              </div>
            </div>
            <strong>{dashboardData.todayPerformance ?? 0}%</strong>
          </div>

          <div className="large-progress">
            <div
              className="large-progress-fill green"
              style={{
                width: `${Math.min(
                  100,
                  Number(dashboardData.todayPerformance || 0)
                )}%`,
              }}
            />
          </div>

          <div className="performance-card-footer">
            <span>
              <FaCircleCheck />
              {dashboardData.todayCompleted ?? 0} completed
            </span>
            <span>
              {dashboardData.todayTotal ?? 0} total tasks
            </span>
          </div>
        </div>

        {/* WEEK */}
        <div className="admin-performance-card">
          <div className="performance-card-header">
            <div className="performance-title">
              <div className="performance-icon blue">
                <FaChartLine />
              </div>
              <div>
                <h2>Weekly Performance</h2>
                <p>Overall student performance</p>
              </div>
            </div>
            <strong>{dashboardData.weekPerformance ?? 0}%</strong>
          </div>

          <div className="large-progress">
            <div
              className="large-progress-fill blue"
              style={{
                width: `${Math.min(
                  100,
                  Number(dashboardData.weekPerformance || 0)
                )}%`,
              }}
            />
          </div>

          <div className="performance-card-footer">
            <span>
              <FaCircleCheck />
              {dashboardData.weekCompleted ?? 0} completed
            </span>
            <span>
              {dashboardData.weekTotal ?? 0} total tasks
            </span>
          </div>
        </div>

        {/* MONTH */}
        <div className="admin-performance-card">
          <div className="performance-card-header">
            <div className="performance-title">
              <div className="performance-icon purple">
                <FaCalendar />
              </div>
              <div>
                <h2>Monthly Performance</h2>
                <p>Overall student performance</p>
              </div>
            </div>
            <strong>{dashboardData.monthPerformance ?? 0}%</strong>
          </div>

          <div className="large-progress">
            <div
              className="large-progress-fill purple"
              style={{
                width: `${Math.min(
                  100,
                  Number(dashboardData.monthPerformance || 0)
                )}%`,
              }}
            />
          </div>

          <div className="performance-card-footer">
            <span>
              <FaCircleCheck />
              {dashboardData.monthCompleted ?? 0} completed
            </span>
            <span>
              {dashboardData.monthTotal ?? 0} total tasks
            </span>
          </div>
        </div>

      </section>


      {/* =========================================
          EXTRA STUDENT PERFORMANCE ANALYSIS
      ========================================= */}

      <section className="admin-performance-analysis">

        {/* TODAY */}
        <PerformanceAnalysisCard
          title="Today Student Performance"
          subtitle="Strong, good and weak performing students"
          period="Today"
          groups={getPerformanceGroups("today")}
          getPieBackground={getPieBackground}
          getInitials={getInitials}
          purple={false}
        />

        {/* WEEKLY */}
        <PerformanceAnalysisCard
          title="Weekly Student Performance"
          subtitle="Strong, good and weak performing students"
          period="This Week"
          groups={getPerformanceGroups("weekly")}
          getPieBackground={getPieBackground}
          getInitials={getInitials}
          purple={false}
        />

        {/* MONTHLY */}
        <PerformanceAnalysisCard
          title="Monthly Student Performance"
          subtitle="Strong, good and weak performing students"
          period="This Month"
          groups={getPerformanceGroups("monthly")}
          getPieBackground={getPieBackground}
          getInitials={getInitials}
          purple={true}
        />

      </section>


      {/* PERFORMANCE LIST */}

      <section className="admin-student-performance">

        <div className="performance-section-header">

          <div>
            <h2>
              Students Performance
            </h2>

            <p>
              Weekly performance overview - all students
            </p>
          </div>

          <button
            onClick={goStudents}
          >
            View All Students
            <FaChevronRight />
          </button>

        </div>


        {loading ? (

          <div className="admin-loading">
            <span />
            <p>
              Loading performance...
            </p>
          </div>

        ) : students.length === 0 ? (

          <div className="admin-empty">
            <FaUsers />
            <p>
              No students found.
            </p>
          </div>

        ) : (

          <div className="performance-list">

            {students
              .slice()
              .sort(
                (a, b) =>
                  Number(
                    b.weekPerformance || 0
                  ) -
                  Number(
                    a.weekPerformance || 0
                  )
              )
              .map((student) => {

                const percentage =
                  Number(
                    student.weekPerformance ||
                      0
                  );

                return (
                  <div
                    className="performance-student-row"
                    key={student.id}
                  >

                    <div className="performance-student-info">

                      <div className="small-avatar">
                        {getInitials(
                          student.name
                        )}
                      </div>

                      <div>

                        <strong>
                          {student.name}
                        </strong>

                        <span>
                          {getPerformanceLabel(
                            percentage
                          )}
                        </span>

                      </div>

                    </div>

                    <div className="performance-student-bar">

                      <div className="student-bar-track">

                        <div
                          className={`student-bar-fill ${getPerformanceClass(
                            percentage
                          )}`}
                          style={{
                            width: `${Math.min(
                              100,
                              percentage
                            )}%`,
                          }}
                        />

                      </div>

                      <strong>
                        {percentage}%
                      </strong>

                    </div>

                  </div>
                );
              })}

          </div>
        )}

      </section>

    </>
  );

  /* =========================================
     ALL STUDENTS
  ========================================= */

  const renderAllStudents = () => (
    <section className="all-students-page">

      <div className="all-students-header">

        <div>

          <h2>
            All Students
          </h2>

          <p>
            All registered students in SkillLab
          </p>

        </div>

        <button
          className="refresh-button"
          onClick={fetchAdminData}
          disabled={refreshing}
        >
          {refreshing
            ? "Refreshing..."
            : "Refresh"}
        </button>

      </div>


      {/* SEARCH */}

      <div className="students-search-box">

        <FaMagnifyingGlass />

        <input
          type="text"
          placeholder="Search student by name, email or phone..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
        />

      </div>


      {/* CARDS */}

      {loading ? (

        <div className="admin-loading students-page-loading">

          <span />

          <p>
            Loading students...
          </p>

        </div>

      ) : filteredStudents.length === 0 ? (

        <div className="admin-empty students-empty">

          <div>
            <FaUser />
          </div>

          <h3>
            No students found
          </h3>

          <p>
            Try another search.
          </p>

        </div>

      ) : (

        <div className="student-cards-grid">

          {filteredStudents.map(
            (student) => {

              const performance =
                Number(
                  student.weekPerformance ||
                    0
                );

              const status =
                student.status ||
                "active";

              return (

                <div
                  className="student-card"
                  key={student.id}
                  onClick={() =>
                    openStudentDashboard(student)
                  }
                >

                  {/* TOP */}

                  <div className="student-card-top">

                    {student.photo ? (

                      <img
                        src={student.photo}
                        alt={student.name}
                        className="student-card-photo"
                      />

                    ) : (

                      <div className="student-card-avatar">
                        {getInitials(
                          student.name
                        )}
                      </div>

                    )}

                    <div className="student-card-name">

                      <h3>
                        {student.name ||
                          "Unnamed Student"}
                      </h3>

                      <span>
                        Student ID: #
                        {student.id}
                      </span>

                    </div>

                    <FaChevronRight className="student-card-arrow" />

                  </div>


                  {/* EMAIL */}

                  <div className="student-card-contact">

                    <FaEnvelopeIcon />

                    <span>
                      {student.email ||
                        "—"}
                    </span>

                  </div>


                  {/* DETAILS */}

                  <div className="student-card-details">

                    <div>

                      <small>
                        Join Date
                      </small>

                      <strong>
                        <FaCalendarDays />
                        {formatDate(
                          student.join_date
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
                          student.expiry_date
                        )}
                      </strong>

                    </div>

                  </div>


                  {/* STATUS */}

                  <div className="student-card-status-row">

                    <span
                      className={`student-status ${status}`}
                    >
                      <span className="status-dot" />
                      {status === "expired"
                        ? "Expired"
                        : status ===
                          "expiring"
                        ? "Expiring Soon"
                        : "Active"}
                    </span>

                    <span className="student-card-performance-text">
                      {performance}%
                    </span>

                  </div>


                  {/* PERFORMANCE */}

                  <div className="student-card-progress">

                    <div className="student-card-progress-track">

                      <div
                        className={`student-card-progress-fill ${getPerformanceClass(
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
  className="student-dashboard-button"
  onClick={(e) => {
    e.stopPropagation();

    openStudentDashboard(student);
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

  return (
    <div className="admin-dashboard">

      {renderSidebar()}

      <main className="admin-main">

        {renderTopbar()}

        <div className="admin-content">

          {isStudentsPage
            ? renderAllStudents()
            : renderDashboardHome()}

        </div>

      </main>

    </div>
  );
}


/* =========================================
   SMALL ICON HELPER
========================================= */

function FaEnvelopeIcon() {
  return (
    <span className="email-icon">
      @
    </span>
  );
}

/* =========================================
   EXTRA PERFORMANCE ANALYSIS CARD
========================================= */

function PerformanceAnalysisCard({
  title,
  subtitle,
  period,
  groups,
  getPieBackground,
  getInitials,
  purple,
}) {

  const allStudents = [
    ...groups.strong.map((student) => ({
      ...student,
      category: "Strong",
    })),
    ...groups.good.map((student) => ({
      ...student,
      category: "Good",
    })),
    ...groups.weak.map((student) => ({
      ...student,
      category: "Weak",
    })),
  ].sort(
    (a, b) =>
      Number(b.performance || 0) -
      Number(a.performance || 0)
  );

  const total = allStudents.length;

  return (
    <div className="analysis-card">

      <div className="analysis-card-header">

        <div>
          <h2>{title}</h2>
          <p>{subtitle}</p>
        </div>

        <span
          className={`analysis-period ${
            purple ? "purple" : ""
          }`}
        >
          {period}
        </span>

      </div>

      <div className="analysis-content">

        <div className="analysis-chart-area">

          <div
            className="student-performance-pie"
            style={{
              background: getPieBackground(groups),
            }}
          >
            <div className="pie-inner">
              <strong>{total}</strong>
              <span>Students</span>
            </div>
          </div>

          <div className="analysis-legend">

            <div>
              <span className="legend-dot strong" />
              <span>Strong</span>
              <strong>{groups.strong.length}</strong>
            </div>

            <div>
              <span className="legend-dot good" />
              <span>Good</span>
              <strong>{groups.good.length}</strong>
            </div>

            <div>
              <span className="legend-dot weak" />
              <span>Weak</span>
              <strong>{groups.weak.length}</strong>
            </div>

          </div>

        </div>

        <div className="analysis-students">

          <div className="analysis-list-title">
            {period === "Today"
              ? "Today Students"
              : period === "This Week"
              ? "Weekly Students"
              : "Monthly Students"}
          </div>

          {allStudents.map((student) => (

            <div
              className="analysis-student-row"
              key={`${period}-${student.id}`}
            >
<div className="analysis-student-left">

  <div>
    <strong>{student.name}</strong>

    <span
      className={`analysis-category ${
        student.category.toLowerCase()
      }`}
    >
      {student.category}
    </span>
  </div>


              </div>

              <strong className="analysis-student-percentage">
                {student.performance}%
              </strong>

            </div>

          ))}

          {total === 0 && (
            <div className="analysis-no-data">
              No {period === "Today"
                ? "today"
                : period === "This Week"
                ? "weekly"
                : "monthly"} task data available
            </div>
          )}

        </div>

      </div>

    </div>
  );
}

export default AdminDashboard;