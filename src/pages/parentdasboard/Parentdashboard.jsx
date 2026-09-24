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
  FaUserGroup,
  FaClipboardList,
  FaCircleExclamation,
  FaArrowTrendUp,
} from "react-icons/fa6";

import "./parent-dashboard.css";

const API_URL = "https://zyntaweb.com/skilllab/parent-dashboard.php";

function ParentDashboard() {
  const navigate = useNavigate();

  const [parent, setParent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activePage, setActivePage] = useState("dashboard");
  const [search, setSearch] = useState("");

  const [dashboard, setDashboard] = useState({
    students: [],
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

    recentTasks: [],
  });

  useEffect(() => {
    const savedParent = localStorage.getItem("parent");
    const loggedIn = localStorage.getItem("parentLoggedIn");

    if (loggedIn !== "true" || !savedParent) {
      navigate("/parent/login", { replace: true });
      return;
    }

    try {
      setParent(JSON.parse(savedParent));
    } catch (error) {
      console.error("Parent data error:", error);

      localStorage.removeItem("parent");
      localStorage.removeItem("parentLoggedIn");
      localStorage.removeItem("parentStudents");

      navigate("/parent/login", { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    if (!parent?.id) return;
    loadDashboard();
  }, [parent]);

  const loadDashboard = async () => {
    try {
      setLoading(true);

      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "parent_overview",
          parent_id: parent.id,
        }),
      });

      const data = await response.json();

      console.log("Parent Dashboard:", data);

      if (!data.success) {
        throw new Error(data.message || "Unable to load dashboard");
      }

      const overview = data.overview || {};

      setDashboard({
        students: Array.isArray(overview.students) ? overview.students : [],
        totalStudents: Number(overview.totalStudents) || 0,

        totalTasks: Number(overview.totalTasks) || 0,
        completedTasks: Number(overview.completedTasks) || 0,
        pendingTasks: Number(overview.pendingTasks) || 0,

        todayPerformance: Number(overview.todayPerformance) || 0,
        weeklyPerformance: Number(overview.weeklyPerformance) || 0,
        monthlyPerformance: Number(overview.monthlyPerformance) || 0,

        todayCompleted: Number(overview.todayCompleted) || 0,
        todayTotal: Number(overview.todayTotal) || 0,
        weekCompleted: Number(overview.weekCompleted) || 0,
        weekTotal: Number(overview.weekTotal) || 0,
        monthCompleted: Number(overview.monthCompleted) || 0,
        monthTotal: Number(overview.monthTotal) || 0,

        recentTasks: Array.isArray(overview.recentTasks)
          ? overview.recentTasks
          : [],
      });
    } catch (error) {
      console.error("Parent dashboard error:", error);

      // Login-time students are kept only as a fallback.
      try {
        const savedStudents = JSON.parse(
          localStorage.getItem("parentStudents") || "[]"
        );

        if (Array.isArray(savedStudents)) {
          setDashboard((prev) => ({
            ...prev,
            students: savedStudents,
            totalStudents: savedStudents.length,
          }));
        }
      } catch (storageError) {
        console.error("Student storage error:", storageError);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("parent");
    localStorage.removeItem("parentLoggedIn");
    localStorage.removeItem("parentStudents");

    navigate("/parent/login", { replace: true });
  };

  const students = Array.isArray(dashboard.students)
    ? dashboard.students
    : [];

  const filteredStudents = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) return students;

    return students.filter((student) =>
      [
        student.name,
        student.email,
        student.id,
      ].some((item) =>
        String(item || "").toLowerCase().includes(value)
      )
    );
  }, [students, search]);

  const getInitials = (name) => {
    if (!name) return "S";

    const parts = String(name).trim().split(/\s+/);

    if (parts.length === 1) {
      return parts[0].substring(0, 2).toUpperCase();
    }

    return `${parts[0][0]}${
      parts[parts.length - 1][0]
    }`.toUpperCase();
  };

  const getPerformance = (student) => {
    const value =
      student?.weekPerformance ??
      student?.week_performance ??
      student?.weeklyPerformance ??
      student?.weekly_performance ??
      student?.performance ??
      student?.performance_percentage ??
      0;

    return Math.max(0, Math.min(100, Number(value) || 0));
  };

  const getPerformanceClass = (percentage) => {
    const value = Number(percentage) || 0;

    if (value >= 60) return "strong";
    if (value >= 40) return "good";
    return "weak";
  };

  const getPerformanceLabel = (percentage) => {
    const value = Number(percentage) || 0;

    if (value >= 60) return "Strong";
    if (value >= 40) return "Average";
    return "Needs Attention";
  };

  const formatDate = (date) => {
    if (!date) return "—";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) return date;

    return parsed.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatTaskDate = (date) => {
    if (!date) return "No date";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return String(date).substring(0, 10);
    }

    return parsed.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
    });
  };

  const performanceData = useMemo(
    () =>
      students.map((student) => ({
        ...student,
        performance: getPerformance(student),
      })),
    [students]
  );

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
    performanceData.length;

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

  const openStudentDashboard = (student) => {
    if (!student?.id) {
      console.error("Invalid student:", student);
      return;
    }

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

  const renderSidebar = () => (
    <>
      {mobileOpen && (
        <div
          className="parent-sidebar-overlay"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`parent-sidebar ${
          mobileOpen ? "mobile-open" : ""
        }`}
      >
        <div className="parent-sidebar-brand">
          <strong>SKILL LAB</strong>

          <button
            className="parent-sidebar-close"
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
          >
            <FaXmark />
          </button>
        </div>

        <div className="parent-sidebar-content">
          <button
            className={`parent-nav-item ${
              activePage === "dashboard" ? "active" : ""
            }`}
            onClick={() => {
              setActivePage("dashboard");
              setSearch("");
              setMobileOpen(false);
            }}
          >
            <FaGaugeHigh />
            <span>Dashboard</span>
          </button>

          <button
            className={`parent-nav-item ${
              activePage === "students" ? "active" : ""
            }`}
            onClick={() => {
              setActivePage("students");
              setSearch("");
              setMobileOpen(false);
            }}
          >
            <FaUserGraduate />
            <span>My Students</span>
          </button>

          <button
            className={`parent-nav-item ${
              activePage === "profile" ? "active" : ""
            }`}
            onClick={() => {
              setActivePage("profile");
              setSearch("");
              setMobileOpen(false);
            }}
          >
            <FaUser />
            <span>My Profile</span>
          </button>
        </div>

        <div className="parent-sidebar-bottom">
          <button
            className="parent-logout"
            onClick={handleLogout}
          >
            <FaArrowRightFromBracket />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );

  const renderTopbar = () => (
    <header className="parent-topbar">
      <div className="parent-topbar-left">
        <button
          className="parent-mobile-menu"
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
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
              ? "Monitor every assigned student and their learning progress."
              : activePage === "profile"
              ? "View your parent account details."
              : "Track assigned students, tasks and learning performance in one place."}
          </p>
        </div>
      </div>

      <div className="parent-profile">
        <div className="parent-profile-avatar">
          {getInitials(
            parent?.name || parent?.username
          )}
        </div>

        <div>
          <strong>Welcome Parent</strong>
          <span>{parent?.username || ""}</span>
        </div>
      </div>
    </header>
  );

  const StatCard = ({
    icon,
    title,
    value,
    subtitle,
    type,
  }) => (
    <div className="parent-stat-card">
      <div className={`parent-stat-icon ${type}`}>
        {icon}
      </div>

      <div className="parent-stat-details">
        <span>{title}</span>
        <strong>{value}</strong>
        <small>{subtitle}</small>
      </div>
    </div>
  );

  const PerformanceCard = ({
    title,
    percentage,
    completed,
    total,
    type,
  }) => {
    const safePercentage = Math.max(
      0,
      Math.min(100, Number(percentage) || 0)
    );

    return (
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
              <h2>{title}</h2>
              <p>All assigned students</p>
            </div>
          </div>

          <strong>{safePercentage}%</strong>
        </div>

        <div className="parent-large-progress">
          <div
            className={`parent-large-progress-fill ${type}`}
            style={{
              width: `${safePercentage}%`,
            }}
          />
        </div>

        <div className="parent-performance-footer">
          <span>
            <FaCircleCheck />
            {completed} completed
          </span>

          <span>{total} total tasks</span>
        </div>
      </div>
    );
  };

  const renderDashboardHome = () => (
    <>
      <section className="parent-child-banner">
        <div className="parent-child-avatar">
          <FaUserGroup />
        </div>

        <div>
          <span>Assigned Students</span>

          <h2>
            {students.length}{" "}
            {students.length === 1
              ? "Student"
              : "Students"}
          </h2>

          <p>
            Every task and performance figure below is
            calculated from the students assigned to this
            parent account.
          </p>
        </div>
      </section>

      <section className="parent-stat-grid">
        <StatCard
          icon={<FaUserGraduate />}
          title="My Students"
          value={students.length}
          subtitle="Assigned students"
          type="purple"
        />

        <StatCard
          icon={<FaListCheck />}
          title="Total Tasks"
          value={dashboard.totalTasks}
          subtitle="All assigned tasks"
          type="blue"
        />

        <StatCard
          icon={<FaCircleCheck />}
          title="Completed"
          value={dashboard.completedTasks}
          subtitle="Completed tasks"
          type="green"
        />

        <StatCard
          icon={<FaClock />}
          title="Pending"
          value={dashboard.pendingTasks}
          subtitle="Tasks remaining"
          type="orange"
        />
      </section>

      <section className="parent-performance-grid">
        <PerformanceCard
          title="Today Performance"
          percentage={dashboard.todayPerformance}
          completed={dashboard.todayCompleted}
          total={dashboard.todayTotal}
          type="green"
        />

        <PerformanceCard
          title="Weekly Performance"
          percentage={dashboard.weeklyPerformance}
          completed={dashboard.weekCompleted}
          total={dashboard.weekTotal}
          type="blue"
        />

        <PerformanceCard
          title="Monthly Performance"
          percentage={dashboard.monthlyPerformance}
          completed={dashboard.monthCompleted}
          total={dashboard.monthTotal}
          type="purple"
        />
      </section>

      <section className="parent-analytics-grid">
        <div className="parent-analysis-card">
          <div className="parent-analysis-header">
            <div>
              <h2>Performance Overview</h2>
              <p>
                Combined performance of all assigned
                students
              </p>
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
            <FaArrowTrendUp />
            <span>
              Performance = completed tasks ÷ assigned
              tasks for the selected period.
            </span>
          </div>
        </div>

        <div className="parent-analysis-card">
          <div className="parent-analysis-header">
            <div>
              <h2>Student Performance</h2>
              <p>
                Weekly performance distribution
              </p>
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
                    {performanceGroups.strong.length}{" "}
                    students
                  </small>
                </div>
              </div>

              <div>
                <span className="parent-legend-dot average" />
                <div>
                  <strong>Average</strong>
                  <small>
                    {performanceGroups.average.length}{" "}
                    students
                  </small>
                </div>
              </div>

              <div>
                <span className="parent-legend-dot weak" />
                <div>
                  <strong>Needs Attention</strong>
                  <small>
                    {performanceGroups.weak.length}{" "}
                    students
                  </small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="parent-performance-summary">
        <div className="parent-summary-box strong">
          <div className="parent-summary-box-icon">
            <FaCircleCheck />
          </div>
          <div>
            <span>Strong Performance</span>
            <strong>
              {performanceGroups.strong.length}
            </strong>
            <small>60% and above</small>
          </div>
        </div>

        <div className="parent-summary-box average">
          <div className="parent-summary-box-icon">
            <FaChartLine />
          </div>
          <div>
            <span>Average Performance</span>
            <strong>
              {performanceGroups.average.length}
            </strong>
            <small>40% - 59%</small>
          </div>
        </div>

        <div className="parent-summary-box weak">
          <div className="parent-summary-box-icon">
            <FaTriangleExclamation />
          </div>
          <div>
            <span>Needs Attention</span>
            <strong>
              {performanceGroups.weak.length}
            </strong>
            <small>Below 40%</small>
          </div>
        </div>
      </section>

      <section className="parent-analysis-card parent-student-performance-table-card">
        <div className="parent-section-header">
          <div>
            <h2>Student Performance Details</h2>
            <p>
              Task completion and performance for every
              assigned student
            </p>
          </div>

          <button
            className="parent-view-all-button"
            onClick={() => {
              setActivePage("students");
              setSearch("");
            }}
          >
            My Students
            <FaArrowRight />
          </button>
        </div>

        {students.length === 0 ? (
          <div className="parent-empty">
            <FaUserGraduate />
            <h3>No Students Assigned</h3>
            <p>
              Students assigned by the admin will appear
              here.
            </p>
          </div>
        ) : (
          <div className="parent-performance-table-wrap">
            <table className="parent-performance-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Total Tasks</th>
                  <th>Completed</th>
                  <th>Pending</th>
                  <th>Weekly Performance</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {students.map((student) => {
                  const performance =
                    getPerformance(student);

                  const total =
                    Number(student.totalTasks) || 0;

                  const completed =
                    Number(student.completedTasks) || 0;

                  const pending =
                    Number(student.pendingTasks) ||
                    Math.max(0, total - completed);

                  return (
                    <tr key={student.id}>
                      <td>
                        <div className="parent-table-student">
                          <div className="parent-table-avatar">
                            {getInitials(student.name)}
                          </div>

                          <div>
                            <strong>
                              {student.name ||
                                "Unnamed Student"}
                            </strong>
                            <span>
                              #{student.id}{" "}
                              {student.email
                                ? `• ${student.email}`
                                : ""}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td>
                        <strong>{total}</strong>
                      </td>

                      <td>
                        <span className="parent-table-completed">
                          <FaCircleCheck />
                          {completed}
                        </span>
                      </td>

                      <td>{pending}</td>

                      <td>
                        <div className="parent-table-performance">
                          <div>
                            <strong>
                              {performance}%
                            </strong>
                            <span>
                              {getPerformanceLabel(
                                performance
                              )}
                            </span>
                          </div>

                          <div className="parent-table-progress">
                            <span
                              className={
                                getPerformanceClass(
                                  performance
                                )
                              }
                              style={{
                                width: `${performance}%`,
                              }}
                            />
                          </div>
                        </div>
                      </td>

                      <td>
                        <button
                          className="parent-table-view-button"
                          onClick={() =>
                            openStudentDashboard(student)
                          }
                        >
                          View
                          <FaArrowRight />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="parent-analysis-card parent-tasks-card">
        <div className="parent-section-header">
          <div>
            <h2>Assigned Tasks</h2>
            <p>
              Recently assigned tasks from your students
            </p>
          </div>

          <div className="parent-task-total-badge">
            <FaClipboardList />
            {dashboard.totalTasks} total
          </div>
        </div>

        {dashboard.recentTasks.length === 0 ? (
          <div className="parent-empty">
            <FaClipboardList />
            <h3>No Tasks Found</h3>
            <p>
              Assigned tasks will appear here once
              students have tasks.
            </p>
          </div>
        ) : (
          <div className="parent-task-list">
            {dashboard.recentTasks.map(
              (task, index) => {
                const completed =
                  Boolean(task.completed) ||
                  Number(task.status) === 1;

                return (
                  <div
                    className="parent-task-row"
                    key={
                      task.id ||
                      `${task.user_id}-${task.task_date}-${index}`
                    }
                  >
                    <div className="parent-task-icon">
                      {completed ? (
                        <FaCircleCheck />
                      ) : (
                        <FaClock />
                      )}
                    </div>

                    <div className="parent-task-main">
                      <strong>
                        {task.title ||
                          task.task_title ||
                          "Assigned Task"}
                      </strong>

                      <span>
                        {task.student_name ||
                          `Student #${task.user_id}`}
                        {" • "}
                        {formatTaskDate(task.task_date)}
                      </span>
                    </div>

                    <span
                      className={`parent-task-status ${
                        completed
                          ? "completed"
                          : "pending"
                      }`}
                    >
                      {completed
                        ? "Completed"
                        : "Pending"}
                    </span>
                  </div>
                );
              }
            )}
          </div>
        )}
      </section>
    </>
  );

  const renderMyStudents = () => (
    <section className="parent-all-students-page">
      <div className="parent-all-students-header">
        <div>
          <h2>My Students</h2>
          <p>
            View every assigned student with task
            completion and performance.
          </p>
        </div>

        <button
          className="parent-refresh-button"
          onClick={loadDashboard}
          disabled={loading}
        >
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      <div className="parent-students-search-box">
        <FaMagnifyingGlass />
        <input
          type="text"
          placeholder="Search student by name, email or ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="parent-loading students-page-loading">
          <span />
          <p>Loading students...</p>
        </div>
      ) : filteredStudents.length === 0 ? (
        <div className="parent-empty students-empty">
          <div>
            <FaUser />
          </div>
          <h3>No students found</h3>
          <p>
            No students are currently assigned to your
            account.
          </p>
        </div>
      ) : (
        <div className="parent-student-cards-grid">
          {filteredStudents.map((student) => {
            const performance =
              getPerformance(student);

            const total =
              Number(student.totalTasks) || 0;

            const completed =
              Number(student.completedTasks) || 0;

            const pending =
              Number(student.pendingTasks) ||
              Math.max(0, total - completed);

            const todayPerformance =
              Number(student.todayPerformance) || 0;

            const monthPerformance =
              Number(student.monthlyPerformance) || 0;

            return (
              <div
                className="parent-student-card"
                key={student.id}
                onClick={() =>
                  openStudentDashboard(student)
                }
              >
                <div className="parent-student-card-top">
                  {student.photo ? (
                    <img
                      src={student.photo}
                      alt={student.name}
                      className="parent-student-card-photo"
                    />
                  ) : (
                    <div className="parent-student-card-avatar">
                      {getInitials(student.name)}
                    </div>
                  )}

                  <div className="parent-student-card-name">
                    <h3>
                      {student.name ||
                        "Unnamed Student"}
                    </h3>

                    <span>
                      Student ID: #{student.id}
                    </span>
                  </div>

                  <FaChevronRight className="parent-student-card-arrow" />
                </div>

                <div className="parent-student-card-contact">
                  <span className="parent-email-icon">
                    @
                  </span>
                  <span>
                    {student.email || "No email"}
                  </span>
                </div>

                <div className="parent-student-task-stats">
                  <div>
                    <small>Total Tasks</small>
                    <strong>{total}</strong>
                  </div>

                  <div>
                    <small>Completed</small>
                    <strong className="completed">
                      {completed}
                    </strong>
                  </div>

                  <div>
                    <small>Pending</small>
                    <strong className="pending">
                      {pending}
                    </strong>
                  </div>
                </div>

                <div className="parent-student-performance-head">
                  <div>
                    <small>Weekly Performance</small>
                    <strong>{performance}%</strong>
                  </div>

                  <span
                    className={`parent-performance-pill ${getPerformanceClass(
                      performance
                    )}`}
                  >
                    {getPerformanceLabel(performance)}
                  </span>
                </div>

                <div className="parent-student-card-progress">
                  <div className="parent-student-card-progress-track">
                    <div
                      className={`parent-student-card-progress-fill ${getPerformanceClass(
                        performance
                      )}`}
                      style={{
                        width: `${performance}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="parent-student-periods">
                  <div>
                    <span>Today</span>
                    <strong>
                      {todayPerformance}%
                    </strong>
                  </div>

                  <div>
                    <span>Weekly</span>
                    <strong>{performance}%</strong>
                  </div>

                  <div>
                    <span>Monthly</span>
                    <strong>
                      {monthPerformance}%
                    </strong>
                  </div>
                </div>

                <button
                  className="parent-student-dashboard-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    openStudentDashboard(student);
                  }}
                >
                  View Student Dashboard
                  <FaArrowRight />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );

  const renderParentProfile = () => {
    const profileName =
      parent?.name ||
      parent?.full_name ||
      parent?.fullName ||
      parent?.username ||
      "Parent";

    const profileUsername =
      parent?.username || "—";

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
      parent?.address || "—";

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
              View the profile details of the parent
              account currently logged in.
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
            <strong>{dashboard.totalTasks}</strong>
          </div>

          <div>
            <FaCircleCheck />
            <span>Completed Tasks</span>
            <strong>{dashboard.completedTasks}</strong>
          </div>
        </div>
      </section>
    );
  };

  return (
    <div className="parent-dashboard">
      {renderSidebar()}

      <main className="parent-main">
        {renderTopbar()}

        <div className="parent-content">
          {activePage === "dashboard" &&
            renderDashboardHome()}

          {activePage === "students" &&
            renderMyStudents()}

          {activePage === "profile" &&
            renderParentProfile()}
        </div>
      </main>
    </div>
  );
}

export default ParentDashboard;