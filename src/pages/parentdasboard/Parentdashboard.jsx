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
     STUDENT PERFORMANCE ANALYTICS
     Uses only students assigned to this parent.
  ========================================= */

  const getStudentPerformance = (student) => {
    const value =
      student?.weekPerformance ??
      student?.week_performance ??
      student?.weeklyPerformance ??
      student?.weekly_performance ??
      student?.performance ??
      student?.performance_percentage ??
      student?.performancePercentage ??
      0;

    return Math.max(0, Math.min(100, Number(value) || 0));
  };

  const performanceData = useMemo(() => {
    return students.map((student) => ({
      ...student,
      performance: getStudentPerformance(student),
    }));
  }, [students]);

  const performanceGroups = useMemo(() => {
    const strong = performanceData.filter(
      (student) => student.performance >= 60
    );

    const average = performanceData.filter(
      (student) =>
        student.performance >= 40 &&
        student.performance < 60
    );

    const weak = performanceData.filter(
      (student) => student.performance < 40
    );

    return { strong, average, weak };
  }, [performanceData]);

  const totalPerformanceStudents =
    performanceGroups.strong.length +
    performanceGroups.average.length +
    performanceGroups.weak.length;

  const strongPercent =
    totalPerformanceStudents > 0
      ? (performanceGroups.strong.length /
          totalPerformanceStudents) *
        100
      : 0;

  const averagePercent =
    totalPerformanceStudents > 0
      ? (performanceGroups.average.length /
          totalPerformanceStudents) *
        100
      : 0;

  const weakPercent =
    totalPerformanceStudents > 0
      ? (performanceGroups.weak.length /
          totalPerformanceStudents) *
        100
      : 0;

  const performanceChart = [
    {
      label: "Today",
      value: Number(dashboard.todayPerformance) || 0,
      type: "green",
    },
    {
      label: "Weekly",
      value: Number(dashboard.weeklyPerformance) || 0,
      type: "blue",
    },
    {
      label: "Monthly",
      value: Number(dashboard.monthlyPerformance) || 0,
      type: "purple",
    },
  ];


  /* =========================================
     OPEN STUDENT DASHBOARD
  ========================================= */

  const openStudentDashboard = (student) => {

    if (!student?.id) {
      console.error("Invalid student:", student);
      return;
    }

    /*
     * Save the selected student so the common
     * student dashboard can read the student
     * even after route navigation/remount.
     *
     * Keep both keys so Admin and Parent
     * student-dashboard logic can use the
     * same selected-student data.
     */
    const studentData = {
      id: student.id,
      name: student.name || "",
      email: student.email || "",
    };

    sessionStorage.setItem(
      `parentViewingStudent_${student.id}`,
      JSON.stringify(studentData)
    );

    sessionStorage.setItem(
      `adminViewingStudent_${student.id}`,
      JSON.stringify(studentData)
    );

    /*
     * Open the SAME student dashboard used
     * from Admin -> All Students -> View Dashboard.
     */
    navigate(
      `/parent/students/${student.id}/dashboard`,
      {
        state: {
          studentId: student.id,
          studentEmail: student.email || "",
          studentName: student.name || "",
          fromParent: true,
        },
      }
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


          {/* PARENT PROFILE */}

          <button
            className={`parent-nav-item ${
              activePage === "profile"
                ? "active"
                : ""
            }`}
            onClick={() => {

              setActivePage("profile");

              setSearch("");

              setMobileOpen(false);

            }}
          >

            <FaUser />

            <span>
              My Profile
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
              : activePage === "profile"
              ? "My Profile"
              : "Parent Dashboard"}

          </h1>


          <p>

            {activePage === "students"
              ? "View your assigned students."
              : activePage === "profile"
              ? "View your parent account details."
              : "Monitor your assigned students' learning performance and progress."}

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


      {/* ANALYTICS */}

      <section className="parent-analytics-grid">

        {/* PERFORMANCE GRAPH */}

        <div className="parent-analysis-card">

          <div className="parent-analysis-header">

            <div>
              <h2>Performance Overview</h2>
              <p>Today, weekly and monthly performance</p>
            </div>

            <FaChartLine />

          </div>

          <div className="parent-bar-chart">

            {performanceChart.map((item) => (
              <div
                className="parent-chart-column"
                key={item.label}
              >

                <div className="parent-chart-value">
                  {item.value}%
                </div>

                <div className="parent-chart-track">

                  <div
                    className={`parent-chart-bar ${item.type}`}
                    style={{
                      height: `${Math.min(
                        100,
                        Math.max(0, item.value)
                      )}%`,
                    }}
                  />

                </div>

                <span>{item.label}</span>

              </div>
            ))}

          </div>

          <div className="parent-analysis-note">
            <FaClock />
            <span>
              Performance values are calculated from the
              parent dashboard data returned by the server.
            </span>
          </div>

        </div>


        {/* PERFORMANCE DISTRIBUTION */}

        <div className="parent-analysis-card">

          <div className="parent-analysis-header">

            <div>
              <h2>Student Performance</h2>
              <p>Performance distribution of your students</p>
            </div>

            <FaTrophy />

          </div>

          <div className="parent-pie-layout">

            <div
              className="parent-performance-pie"
              style={{
                background:
                  totalPerformanceStudents > 0
                    ? `conic-gradient(
                        #18a86b 0% ${strongPercent}%,
                        #3185ed ${strongPercent}% ${
                          strongPercent + averagePercent
                        }%,
                        #f19a2b ${
                          strongPercent + averagePercent
                        }% 100%
                      )`
                    : "#e9e5f2",
              }}
            >
              <div className="parent-pie-inner">
                <strong>{students.length}</strong>
                <span>Students</span>
              </div>
            </div>

            <div className="parent-analysis-legend">

              <div>
                <span className="parent-legend-dot strong" />
                <div>
                  <strong>Strong</strong>
                  <small>
                    {performanceGroups.strong.length} students
                  </small>
                </div>
              </div>

              <div>
                <span className="parent-legend-dot average" />
                <div>
                  <strong>Average</strong>
                  <small>
                    {performanceGroups.average.length} students
                  </small>
                </div>
              </div>

              <div>
                <span className="parent-legend-dot weak" />
                <div>
                  <strong>Needs Attention</strong>
                  <small>
                    {performanceGroups.weak.length} students
                  </small>
                </div>
              </div>

            </div>

          </div>

        </div>

      </section>


      {/* PERFORMANCE SUMMARY */}

      <section className="parent-performance-summary">

        <div className="parent-summary-box strong">

          <div className="parent-summary-box-icon">
            <FaCircleCheck />
          </div>

          <div>
            <span>Strong Performance</span>
            <strong>{performanceGroups.strong.length}</strong>
            <small>60% and above</small>
          </div>

        </div>


        <div className="parent-summary-box average">

          <div className="parent-summary-box-icon">
            <FaChartLine />
          </div>

          <div>
            <span>Average Performance</span>
            <strong>{performanceGroups.average.length}</strong>
            <small>40% - 59%</small>
          </div>

        </div>


        <div className="parent-summary-box weak">

          <div className="parent-summary-box-icon">
            <FaTriangleExclamation />
          </div>

          <div>
            <span>Needs Attention</span>
            <strong>{performanceGroups.weak.length}</strong>
            <small>Below 40%</small>
          </div>

        </div>

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
     PARENT PROFILE
  ========================================= */

  const renderParentProfile = () => {

    const profileName =
      parent?.name ||
      parent?.full_name ||
      parent?.fullName ||
      parent?.username ||
      "Parent";

    const profileUsername =
      parent?.username ||
      "—";

    const profileEmail =
      parent?.email ||
      parent?.mail ||
      "—";

    const profilePhone =
      parent?.phone ||
      parent?.mobile ||
      parent?.contact ||
      "—";

    const profileAddress =
      parent?.address ||
      "—";

    const profileId =
      parent?.id ||
      parent?.parent_id ||
      "—";

    return (
      <section className="parent-profile-page">

        <div className="parent-profile-heading">
          <div>
            <h2>My Profile</h2>
            <p>
              View the profile details of the parent account
              currently logged in.
            </p>
          </div>
        </div>


        <div className="parent-profile-card">

          <div className="parent-profile-cover" />

          <div className="parent-profile-main">

            <div className="parent-profile-large-avatar">
              {getInitials(profileName)}
            </div>

            <div className="parent-profile-main-info">

              <h2>{profileName}</h2>

              <span>
                <FaUser />
                {profileUsername}
              </span>

              <small>
                Parent ID: #{profileId}
              </small>

            </div>

          </div>


          <div className="parent-profile-details-grid">

            <div className="parent-profile-detail">

              <div className="parent-profile-detail-icon purple">
                <FaUser />
              </div>

              <div>
                <span>Full Name</span>
                <strong>{profileName}</strong>
              </div>

            </div>


            <div className="parent-profile-detail">

              <div className="parent-profile-detail-icon blue">
                <FaListCheck />
              </div>

              <div>
                <span>Username</span>
                <strong>{profileUsername}</strong>
              </div>

            </div>


            <div className="parent-profile-detail">

              <div className="parent-profile-detail-icon green">
                <FaChartLine />
              </div>

              <div>
                <span>Email</span>
                <strong>{profileEmail}</strong>
              </div>

            </div>


            <div className="parent-profile-detail">

              <div className="parent-profile-detail-icon orange">
                <FaClock />
              </div>

              <div>
                <span>Phone</span>
                <strong>{profilePhone}</strong>
              </div>

            </div>


            <div className="parent-profile-detail parent-profile-detail-wide">

              <div className="parent-profile-detail-icon pink">
                <FaCalendarDays />
              </div>

              <div>
                <span>Address</span>
                <strong>{profileAddress}</strong>
              </div>

            </div>

          </div>

        </div>


        <div className="parent-profile-stats">

          <div>
            <FaUserGraduate />
            <span>Assigned Students</span>
            <strong>{students.length}</strong>
          </div>

          <div>
            <FaListCheck />
            <span>Total Tasks</span>
            <strong>{dashboard.totalTasks ?? 0}</strong>
          </div>

          <div>
            <FaCircleCheck />
            <span>Completed Tasks</span>
            <strong>{dashboard.completedTasks ?? 0}</strong>
          </div>

        </div>

      </section>
    );
  };

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


          {activePage === "profile" && (

            renderParentProfile()

          )}


        </div>


      </main>


    </div>

  );

}


export default ParentDashboard;