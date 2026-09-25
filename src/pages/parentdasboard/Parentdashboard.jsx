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
  FaMagnifyingGlass,
  FaArrowRight,
  FaUser,
  FaCircleExclamation,
  FaArrowTrendUp,
  FaClipboardCheck,
  FaChartPie,
  FaLayerGroup,
  FaCircleNodes,
  FaRotate,
} from "react-icons/fa6";

import "./parent-dashboard.css";

const API_URL = "https://zyntaweb.com/skilllab/parent-dashboard.php";

const clamp = (value) => Math.max(0, Math.min(100, Number(value) || 0));

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
    overallPerformance: 0,
    todayPerformance: 0,
    weeklyPerformance: 0,
    monthlyPerformance: 0,
    todayCompleted: 0,
    todayTotal: 0,
    weekCompleted: 0,
    weekTotal: 0,
    monthCompleted: 0,
    monthTotal: 0,
    periods: { today: "", week: "", month: "" },
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
    if (parent?.id) loadDashboard();
  }, [parent]);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "parent_overview", parent_id: parent.id }),
      });

      const data = await response.json();
      if (!data.success) throw new Error(data.message || "Unable to load dashboard");

      const overview = data.overview || {};
      setDashboard({
        students: Array.isArray(overview.students) ? overview.students : [],
        totalStudents: Number(overview.totalStudents) || 0,
        totalTasks: Number(overview.totalTasks) || 0,
        completedTasks: Number(overview.completedTasks) || 0,
        pendingTasks: Number(overview.pendingTasks) || 0,
        overallPerformance: Number(overview.overallPerformance) || 0,
        todayPerformance: Number(overview.todayPerformance) || 0,
        weeklyPerformance: Number(overview.weeklyPerformance) || 0,
        monthlyPerformance: Number(overview.monthlyPerformance) || 0,
        todayCompleted: Number(overview.todayCompleted) || 0,
        todayTotal: Number(overview.todayTotal) || 0,
        weekCompleted: Number(overview.weekCompleted) || 0,
        weekTotal: Number(overview.weekTotal) || 0,
        monthCompleted: Number(overview.monthCompleted) || 0,
        monthTotal: Number(overview.monthTotal) || 0,
        periods: {
          today: overview.periods?.today || "Current date",
          week: overview.periods?.week || "Current week",
          month: overview.periods?.month || "Current month",
        },
      });
    } catch (error) {
      console.error("Parent dashboard error:", error);
      try {
        const savedStudents = JSON.parse(localStorage.getItem("parentStudents") || "[]");
        if (Array.isArray(savedStudents)) {
          setDashboard((prev) => ({ ...prev, students: savedStudents, totalStudents: savedStudents.length }));
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

  const students = Array.isArray(dashboard.students) ? dashboard.students : [];

  const filteredStudents = useMemo(() => {
    const value = search.trim().toLowerCase();
    if (!value) return students;
    return students.filter((student) =>
      [student.name, student.email, student.id].some((item) =>
        String(item || "").toLowerCase().includes(value)
      )
    );
  }, [students, search]);

  const getInitials = (name) => {
    if (!name) return "S";
    const parts = String(name).trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  };

  const getPerformance = (student) =>
    clamp(
      student?.weekPerformance ??
        student?.weeklyPerformance ??
        student?.week_performance ??
        student?.performance ??
        student?.performance_percentage ??
        0
    );

  const getPerformanceClass = (value) => {
    const percentage = clamp(value);
    if (percentage >= 70) return "excellent";
    if (percentage >= 40) return "good";
    return "attention";
  };

  const getPerformanceLabel = (value) => {
    const percentage = clamp(value);
    if (percentage >= 70) return "Excellent";
    if (percentage >= 40) return "On Track";
    return "Needs Attention";
  };

  const openStudentDashboard = (student) => {
    if (!student?.id) return;
    const studentData = {
      id: student.id,
      name: student.name || "",
      email: student.email || "",
    };
    sessionStorage.setItem(`parentViewingStudent_${student.id}`, JSON.stringify(studentData));
    navigate(`/parent/students/${student.id}/dashboard`, {
      state: {
        studentId: student.id,
        studentEmail: student.email || "",
        studentName: student.name || "",
        fromParent: true,
      },
    });
  };

  const analytics = useMemo(() => {
    const excellent = students.filter((s) => getPerformance(s) >= 70).length;
    const onTrack = students.filter((s) => {
      const p = getPerformance(s);
      return p >= 40 && p < 70;
    }).length;
    const attention = Math.max(0, students.length - excellent - onTrack);
    const completed = Number(dashboard.completedTasks) || 0;
    const pending = Number(dashboard.pendingTasks) || 0;
    const total = completed + pending;
    const completionPercent = total ? Math.round((completed / total) * 100) : 0;

    return {
      excellent,
      onTrack,
      attention,
      completionPercent,
      completed,
      pending,
      total,
    };
  }, [students, dashboard.completedTasks, dashboard.pendingTasks]);

  const chartData = [
    { label: "Today", value: clamp(dashboard.todayPerformance), color: "green" },
    { label: "Week", value: clamp(dashboard.weeklyPerformance), color: "blue" },
    { label: "Month", value: clamp(dashboard.monthlyPerformance), color: "purple" },
  ];

  const renderSidebar = () => (
    <>
      {mobileOpen && <div className="parent-sidebar-overlay" onClick={() => setMobileOpen(false)} />}
      <aside className={`parent-sidebar ${mobileOpen ? "mobile-open" : ""}`}>
        <div className="parent-sidebar-brand">
          <div className="brand-mark"><FaCircleNodes /></div>
          <div><strong>SKILL LAB</strong><span>Parent Portal</span></div>
          <button className="parent-sidebar-close" onClick={() => setMobileOpen(false)}><FaXmark /></button>
        </div>

        <div className="parent-sidebar-content">
          <p className="sidebar-label">OVERVIEW</p>
          <button className={`parent-nav-item ${activePage === "dashboard" ? "active" : ""}`} onClick={() => { setActivePage("dashboard"); setSearch(""); setMobileOpen(false); }}>
            <FaGaugeHigh /><span>Dashboard</span>
          </button>
          <button className={`parent-nav-item ${activePage === "students" ? "active" : ""}`} onClick={() => { setActivePage("students"); setSearch(""); setMobileOpen(false); }}>
            <FaUserGraduate /><span>Students</span>
          </button>
          <p className="sidebar-label sidebar-label-space">ACCOUNT</p>
          <button className={`parent-nav-item ${activePage === "profile" ? "active" : ""}`} onClick={() => { setActivePage("profile"); setSearch(""); setMobileOpen(false); }}>
            <FaUser /><span>My Profile</span>
          </button>
        </div>

        <div className="parent-sidebar-bottom">
          <div className="sidebar-help-card">
            <FaChartLine />
            <div><strong>Learning overview</strong><span>Track progress at a glance</span></div>
          </div>
          <button className="parent-logout" onClick={handleLogout}><FaArrowRightFromBracket /><span>Logout</span></button>
        </div>
      </aside>
    </>
  );

  const renderTopbar = () => (
    <header className="parent-topbar">
      <div className="parent-topbar-left">
        <button className="parent-mobile-menu" onClick={() => setMobileOpen(true)} aria-label="Open menu"><FaBars /></button>
        <div>
          <div className="topbar-breadcrumb"><span>Parent Portal</span><b>/</b><span>{activePage === "students" ? "Students" : activePage === "profile" ? "Profile" : "Dashboard"}</span></div>
          <h1>{activePage === "students" ? "Students" : activePage === "profile" ? "My Profile" : "Dashboard Overview"}</h1>
          <p>{activePage === "students" ? "Review student activity and performance." : activePage === "profile" ? "Manage your parent account information." : "A clear view of your students’ learning progress."}</p>
        </div>
      </div>
      <div className="parent-profile">
        <div className="parent-profile-avatar">{getInitials(parent?.name || parent?.username)}</div>
        <div><strong>{parent?.name || "Parent"}</strong><span>{parent?.username || "Parent account"}</span></div>
      </div>
    </header>
  );

  const MetricCard = ({ icon, label, value, helper, tone, progress }) => (
    <article className="metric-card">
      <div className={`metric-icon ${tone}`}>{icon}</div>
      <div className="metric-body">
        <div className="metric-label">{label}</div>
        <div className="metric-value">{value}</div>
        <div className="metric-helper">{helper}</div>
        {progress !== undefined && <div className="metric-progress"><span style={{ width: `${clamp(progress)}%` }} /></div>}
      </div>
    </article>
  );

  const PeriodCard = ({ label, value, completed, total, date, icon, tone }) => (
    <article className={`period-card ${tone}`}>
      <div className="period-card-head"><div className="period-icon">{icon}</div><span>{label}</span></div>
      <div className="period-value">{clamp(value)}<small>%</small></div>
      <div className="period-date">{date}</div>
      <div className="period-progress"><span style={{ width: `${clamp(value)}%` }} /></div>
      <div className="period-footer"><strong>{completed}</strong><span>of {total} tasks completed</span></div>
    </article>
  );

  const renderPerformanceBars = () => (
    <div className="analytics-card">
      <div className="analytics-header">
        <div><span className="section-kicker">PERFORMANCE TREND</span><h2>Period comparison</h2><p>Completion performance across your students.</p></div>
        <div className="analytics-icon"><FaChartLine /></div>
      </div>
      <div className="bar-chart">
        {chartData.map((item) => (
          <div className="bar-column" key={item.label}>
            <div className="bar-value">{item.value}%</div>
            <div className="bar-track"><div className={`bar-fill ${item.color}`} style={{ height: `${item.value}%` }} /></div>
            <strong>{item.label}</strong>
          </div>
        ))}
      </div>
      <div className="chart-axis-note"><FaArrowTrendUp /> Period metrics use completed tasks divided by tasks in that period.</div>
    </div>
  );

  const renderDonut = () => (
    <div className="analytics-card">
      <div className="analytics-header">
        <div><span className="section-kicker">TASK COMPLETION</span><h2>Overall task status</h2><p>All-time tasks for your students.</p></div>
        <div className="analytics-icon"><FaChartPie /></div>
      </div>
      <div className="donut-layout">
        <div className="donut" style={{ background: `conic-gradient(#7355e8 0 ${analytics.completionPercent}%, #edf0f7 ${analytics.completionPercent}% 100%)` }}>
          <div className="donut-inner"><strong>{analytics.completionPercent}%</strong><span>Completed</span></div>
        </div>
        <div className="donut-legend">
          <div><i className="dot purple" /><span>Completed</span><strong>{analytics.completed}</strong></div>
          <div><i className="dot gray" /><span>Pending</span><strong>{analytics.pending}</strong></div>
          <div className="donut-total"><span>Total tasks</span><strong>{analytics.total}</strong></div>
        </div>
      </div>
    </div>
  );

  const renderStudentDistribution = () => (
    <div className="analytics-card distribution-card">
      <div className="analytics-header">
        <div><span className="section-kicker">STUDENT HEALTH</span><h2>Performance distribution</h2><p>Weekly performance of the students shown below.</p></div>
        <div className="analytics-icon"><FaTrophy /></div>
      </div>
      <div className="distribution-visual">
        <div className="distribution-bar">
          <span className="excellent" style={{ width: `${students.length ? (analytics.excellent / students.length) * 100 : 0}%` }} />
          <span className="ontrack" style={{ width: `${students.length ? (analytics.onTrack / students.length) * 100 : 0}%` }} />
          <span className="attention" style={{ width: `${students.length ? (analytics.attention / students.length) * 100 : 0}%` }} />
        </div>
        <div className="distribution-legend">
          <div><i className="dot green" /><span>Excellent</span><strong>{analytics.excellent}</strong></div>
          <div><i className="dot blue" /><span>On Track</span><strong>{analytics.onTrack}</strong></div>
          <div><i className="dot orange" /><span>Needs Attention</span><strong>{analytics.attention}</strong></div>
        </div>
      </div>
    </div>
  );

  const renderStudentTable = () => (
    <section className="student-table-card">
      <div className="section-header">
        <div><span className="section-kicker">STUDENT INSIGHTS</span><h2>Student performance</h2><p>Compare today, weekly and monthly progress without leaving the dashboard.</p></div>
        <button className="outline-button" onClick={() => { setActivePage("students"); setSearch(""); }}>View students <FaArrowRight /></button>
      </div>
      {students.length === 0 ? (
        <div className="empty-state"><div><FaUserGraduate /></div><h3>No students yet</h3><p>Students assigned to this parent account will appear here.</p></div>
      ) : (
        <div className="table-wrap">
          <table className="performance-table">
            <thead><tr><th>Student</th><th>Today</th><th>This Week</th><th>This Month</th><th>Weekly Progress</th><th /></tr></thead>
            <tbody>
              {students.map((student) => {
                const week = clamp(student.weekPerformance ?? student.weeklyPerformance);
                const today = clamp(student.todayPerformance);
                const month = clamp(student.monthlyPerformance);
                return (
                  <tr key={student.id}>
                    <td><div className="table-student"><div className="table-avatar">{getInitials(student.name)}</div><div><strong>{student.name || "Unnamed Student"}</strong><span>#{student.id}{student.email ? ` · ${student.email}` : ""}</span></div></div></td>
                    <td><strong className="table-percent green-text">{today}%</strong><small>{Number(student.todayCompleted) || 0}/{Number(student.todayTotal) || 0}</small></td>
                    <td><strong className="table-percent blue-text">{week}%</strong><small>{Number(student.weekCompleted) || 0}/{Number(student.weekTotal) || 0}</small></td>
                    <td><strong className="table-percent purple-text">{month}%</strong><small>{Number(student.monthCompleted) || 0}/{Number(student.monthTotal) || 0}</small></td>
                    <td><div className="table-progress"><div className="table-progress-top"><span>{getPerformanceLabel(week)}</span><strong>{week}%</strong></div><div className="table-progress-track"><span className={getPerformanceClass(week)} style={{ width: `${week}%` }} /></div></div></td>
                    <td><button className="icon-view-button" onClick={() => openStudentDashboard(student)} aria-label={`View ${student.name || "student"}`}><FaArrowRight /></button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );

  const renderDashboardHome = () => (
    <div className="dashboard-home">

      <section className="welcome-panel parent-assigned-welcome">
        <div className="welcome-copy">
          <span className="welcome-kicker">PARENT LEARNING CENTER</span>
          <h2>Good to see you, {parent?.name?.split(" ")[0] || "Parent"}.</h2>
          <p>Monitor the learning progress of the students assigned to your parent account.</p>
          <div className="welcome-meta">
            <span><FaCalendarDays /> {dashboard.periods.today || "Today"}</span>
            <span><FaCircleCheck /> Assigned students performance</span>
          </div>
        </div>
        <div className="welcome-visual">
          <div className="welcome-ring"><FaUserGraduate /></div>
          <div className="welcome-orbit orbit-one" />
          <div className="welcome-orbit orbit-two" />
        </div>
      </section>

      <section className="section-heading-row assigned-heading">
        <div>
          <span className="section-kicker">ASSIGNED STUDENTS</span>
          <h2>Student performance overview</h2>
          <p>Today, weekly and monthly performance for students assigned to this parent.</p>
        </div>
        <div className="scope-chip"><FaCircleCheck /> Parent assigned students</div>
      </section>

      <section className="assigned-student-grid">
        {students.length === 0 ? (
          <div className="empty-state assigned-empty">
            <div><FaUserGraduate /></div>
            <h3>No students assigned</h3>
            <p>Students assigned to this parent account will appear here.</p>
          </div>
        ) : (
          students.map((student) => {
            const today = clamp(student.todayPerformance);
            const week = clamp(
              student.weekPerformance ??
              student.weeklyPerformance ??
              student.performance
            );
            const month = clamp(student.monthlyPerformance);
            const overall = clamp(student.overallPerformance ?? student.performance);

            return (
              <article
                className="assigned-student-card"
                key={student.id}
                onClick={() => openStudentDashboard(student)}
              >
                <div className="assigned-student-top">
                  <div className="assigned-student-avatar">
                    {getInitials(student.name)}
                  </div>

                  <div className="assigned-student-info">
                    <h3>{student.name || "Unnamed Student"}</h3>
                    <span>Student ID #{student.id}</span>
                  </div>

                  <button
                    className="assigned-student-arrow"
                    onClick={(e) => {
                      e.stopPropagation();
                      openStudentDashboard(student);
                    }}
                    aria-label={`Open ${student.name || "student"} dashboard`}
                  >
                    <FaArrowRight />
                  </button>
                </div>

                <div className="assigned-performance-main">
                  <div>
                    <span>Overall performance</span>
                    <strong>{overall}%</strong>
                  </div>
                  <em className={getPerformanceClass(overall)}>
                    {getPerformanceLabel(overall)}
                  </em>
                </div>

                <div className="assigned-performance-track">
                  <span
                    className={getPerformanceClass(overall)}
                    style={{ width: `${overall}%` }}
                  />
                </div>

                <div className="assigned-periods">
                  <div className="assigned-period today">
                    <div className="assigned-period-icon"><FaCalendarDays /></div>
                    <span>Today</span>
                    <strong>{today}%</strong>
                    <small>
                      {Number(student.todayCompleted) || 0}/
                      {Number(student.todayTotal) || 0} completed
                    </small>
                  </div>

                  <div className="assigned-period week">
                    <div className="assigned-period-icon"><FaChartLine /></div>
                    <span>This Week</span>
                    <strong>{week}%</strong>
                    <small>
                      {Number(student.weekCompleted) || 0}/
                      {Number(student.weekTotal) || 0} completed
                    </small>
                  </div>

                  <div className="assigned-period month">
                    <div className="assigned-period-icon"><FaTrophy /></div>
                    <span>This Month</span>
                    <strong>{month}%</strong>
                    <small>
                      {Number(student.monthCompleted) || 0}/
                      {Number(student.monthTotal) || 0} completed
                    </small>
                  </div>
                </div>

                <button
                  className="assigned-open-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    openStudentDashboard(student);
                  }}
                >
                  View student dashboard <FaArrowRight />
                </button>
              </article>
            );
          })
        )}
      </section>

      <section className="period-summary-section">
        <div className="section-heading-row">
          <div>
            <span className="section-kicker">PARENT SUMMARY</span>
            <h2>Performance at a glance</h2>
            <p>Combined accuracy based only on the students assigned to this parent.</p>
          </div>
        </div>

        <section className="period-grid">
          <PeriodCard
            label="TODAY"
            value={dashboard.todayPerformance}
            completed={dashboard.todayCompleted}
            total={dashboard.todayTotal}
            date={dashboard.periods.today}
            icon={<FaCalendarDays />}
            tone="today"
          />

          <PeriodCard
            label="THIS WEEK"
            value={dashboard.weeklyPerformance}
            completed={dashboard.weekCompleted}
            total={dashboard.weekTotal}
            date={dashboard.periods.week}
            icon={<FaChartLine />}
            tone="week"
          />

          <PeriodCard
            label="THIS MONTH"
            value={dashboard.monthlyPerformance}
            completed={dashboard.monthCompleted}
            total={dashboard.monthTotal}
            date={dashboard.periods.month}
            icon={<FaTrophy />}
            tone="month"
          />
        </section>
      </section>

      <section className="analytics-grid parent-performance-analytics">
        {renderPerformanceBars()}
        {renderStudentDistribution()}
      </section>

    </div>
  );

  const renderMyStudents = () => (
    <section className="students-page">
      <div className="page-heading-card"><div><span className="section-kicker">STUDENT DIRECTORY</span><h2>Students</h2><p>View each student’s learning activity and open their detailed dashboard.</p></div><button className="refresh-button" onClick={loadDashboard} disabled={loading}><FaRotate /> {loading ? "Refreshing" : "Refresh"}</button></div>
      <div className="student-toolbar"><div className="search-box"><FaMagnifyingGlass /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name, email or ID..." /></div><div className="result-count">{filteredStudents.length} {filteredStudents.length === 1 ? "student" : "students"}</div></div>
      {loading ? <div className="loading-state"><span /><p>Loading students...</p></div> : filteredStudents.length === 0 ? <div className="empty-state large"><div><FaUserGraduate /></div><h3>No students found</h3><p>No students are currently available for this parent account.</p></div> : <div className="student-cards-grid">{filteredStudents.map((student) => { const p = getPerformance(student); return <article className="student-card" key={student.id} onClick={() => openStudentDashboard(student)}><div className="student-card-head"><div className="student-avatar">{getInitials(student.name)}</div><div className="student-card-name"><h3>{student.name || "Unnamed Student"}</h3><span>Student ID #{student.id}</span></div><FaArrowRight className="student-card-arrow" /></div><div className="student-email"><FaUser /> {student.email || "No email available"}</div><div className="student-card-performance"><div><span>Weekly performance</span><strong>{p}%</strong></div><em className={getPerformanceClass(p)}>{getPerformanceLabel(p)}</em></div><div className="student-progress"><span className={getPerformanceClass(p)} style={{ width: `${p}%` }} /></div><div className="student-period-row"><div><span>Today</span><strong>{clamp(student.todayPerformance)}%</strong></div><div><span>Week</span><strong>{p}%</strong></div><div><span>Month</span><strong>{clamp(student.monthlyPerformance)}%</strong></div></div><button className="student-open-button" onClick={(e) => { e.stopPropagation(); openStudentDashboard(student); }}>Open student dashboard <FaArrowRight /></button></article>; })}</div>}
    </section>
  );

  const renderParentProfile = () => {
    const profileName = parent?.name || parent?.full_name || parent?.fullName || parent?.username || "Parent";
    const profileUsername = parent?.username || "—";
    const profileEmail = parent?.email || parent?.mail || "—";
    const profilePhone = parent?.phone || parent?.mobile || parent?.contact || "—";
    const profileAddress = parent?.address || "—";
    const profileId = parent?.id || parent?.parent_id || "—";

    return <section className="profile-page"><div className="page-heading-card"><div><span className="section-kicker">ACCOUNT</span><h2>My Profile</h2><p>View the information connected to your parent account.</p></div></div><div className="profile-hero"><div className="profile-avatar-large">{getInitials(profileName)}</div><div><span>Parent account</span><h2>{profileName}</h2><p><FaUser /> {profileUsername} · ID #{profileId}</p></div></div><div className="profile-grid"><div className="profile-detail"><FaUser /><span>Full Name</span><strong>{profileName}</strong></div><div className="profile-detail"><FaListCheck /><span>Username</span><strong>{profileUsername}</strong></div><div className="profile-detail"><FaChartLine /><span>Email</span><strong>{profileEmail}</strong></div><div className="profile-detail"><FaClock /><span>Phone</span><strong>{profilePhone}</strong></div><div className="profile-detail wide"><FaCalendarDays /><span>Address</span><strong>{profileAddress}</strong></div></div><div className="profile-summary"><div><FaUserGraduate /><span>Students</span><strong>{students.length}</strong></div><div><FaListCheck /><span>Weekly Tasks</span><strong>{dashboard.weekTotal}</strong></div><div><FaCircleCheck /><span>Weekly Completed</span><strong>{dashboard.weekCompleted}</strong></div><div><FaArrowTrendUp /><span>Weekly Performance</span><strong>{clamp(dashboard.weeklyPerformance)}%</strong></div></div></section>;
  };

  return <div className="parent-dashboard"><>{renderSidebar()}</><main className="parent-main">{renderTopbar()}<div className="parent-content">{activePage === "dashboard" && renderDashboardHome()}{activePage === "students" && renderMyStudents()}{activePage === "profile" && renderParentProfile()}</div></main></div>;
}

export default ParentDashboard;
