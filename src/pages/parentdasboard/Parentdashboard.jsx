
import { useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
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
  FaMagnifyingGlass,
  FaArrowRight,
  FaUser,
  FaArrowTrendUp,
  FaChartPie,
  FaRotate,
  FaBullseye,
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
    todayTaskProgress: 0,
    weeklyTaskProgress: 0,
    monthlyTaskProgress: 0,
    todayAccuracy: 0,
    weeklyAccuracy: 0,
    monthlyAccuracy: 0,
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
    if (!parent?.id) return;

    // First load immediately. After that, keep the parent portal synced
    // with student task changes without requiring a browser refresh.
    loadDashboard({ silent: false });

    const refreshSilently = () => loadDashboard({ silent: true });

    // If the student task page dispatches this event, the update is picked
    // up immediately. The polling below also covers changes from another
    // tab/device.
    window.addEventListener("skilllab-task-updated", refreshSilently);

    const handleStorage = (event) => {
      if (event.key === "skilllab-task-updated") refreshSilently();
    };
    window.addEventListener("storage", handleStorage);

    const intervalId = window.setInterval(() => {
      if (!document.hidden) refreshSilently();
    }, 3000);

    const handleVisibility = () => {
      if (!document.hidden) refreshSilently();
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("skilllab-task-updated", refreshSilently);
      window.removeEventListener("storage", handleStorage);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [parent]);

  const loadDashboard = async ({ silent = false } = {}) => {
    try {
      if (!silent) setLoading(true);
      const response = await fetch(`${API_URL}?t=${Date.now()}`, {
        method: "POST",
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache",
        },
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
        todayTaskProgress: Number(overview.todayTaskProgress) || 0,
        weeklyTaskProgress: Number(overview.weeklyTaskProgress) || 0,
        monthlyTaskProgress: Number(overview.monthlyTaskProgress) || 0,
        todayAccuracy: Number(overview.todayAccuracy) || 0,
        weeklyAccuracy: Number(overview.weeklyAccuracy) || 0,
        monthlyAccuracy: Number(overview.monthlyAccuracy) || 0,
        todayCompleted: Number(overview.todayCompleted) || 0,
        todayTotal: Number(overview.todayTotal) || 0,
        weekCompleted: Number(overview.weekCompleted) || 0,
        weekTotal: Number(overview.weekTotal) || 0,
        monthCompleted: Number(overview.monthCompleted) || 0,
        monthTotal: Number(overview.monthTotal) || 0,
        periods: {
          today: overview.periods?.today || "Today",
          week: overview.periods?.week || "This week",
          month: overview.periods?.month || "This month",
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
      if (!silent) setLoading(false);
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
    clamp(student?.weekPerformance ?? student?.weeklyPerformance ?? student?.performance ?? 0);

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

    return { excellent, onTrack, attention, completionPercent, completed, pending, total };
  }, [students, dashboard.completedTasks, dashboard.pendingTasks]);

  const chartData = [
    { label: "Today", value: clamp(dashboard.todayPerformance), completed: dashboard.todayCompleted, total: dashboard.todayTotal },
    { label: "This Week", value: clamp(dashboard.weeklyPerformance), completed: dashboard.weekCompleted, total: dashboard.weekTotal },
    { label: "This Month", value: clamp(dashboard.monthlyPerformance), completed: dashboard.monthCompleted, total: dashboard.monthTotal },
  ];

  const renderSidebar = () => (
    <>
      {mobileOpen && <div className="parent-sidebar-overlay" onClick={() => setMobileOpen(false)} />}
      <aside className={`parent-sidebar ${mobileOpen ? "mobile-open" : ""}`}>
        <div className="parent-sidebar-brand">
          <div><strong>SKILL LAB</strong></div>
          <button className="parent-sidebar-close" onClick={() => setMobileOpen(false)}><FaXmark /></button>
        </div>

        <div className="parent-sidebar-content">
          <button className={`parent-nav-item ${activePage === "dashboard" ? "active" : ""}`} onClick={() => { setActivePage("dashboard"); setSearch(""); setMobileOpen(false); }}>
            <FaGaugeHigh /><span>Dashboard</span>
          </button>
          <button className={`parent-nav-item ${activePage === "students" ? "active" : ""}`} onClick={() => { setActivePage("students"); setSearch(""); setMobileOpen(false); }}>
            <FaUserGraduate /><span>Students</span>
          </button>
          <button className={`parent-nav-item ${activePage === "profile" ? "active" : ""}`} onClick={() => { setActivePage("profile"); setSearch(""); setMobileOpen(false); }}>
            <FaUser /><span>My Profile</span>
          </button>
        </div>

        <div className="parent-sidebar-bottom">
          <button className="parent-logout" onClick={handleLogout}>
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
        <button className="parent-mobile-menu" onClick={() => setMobileOpen(true)} aria-label="Open menu"><FaBars /></button>
        <div>
          <h1>{activePage === "students" ? "Students" : activePage === "profile" ? "My Profile" : "Parent Dashboard "}</h1>
          <p>{activePage === "students" ? "Review student activity and performance." : activePage === "profile" ? "Manage your parent account information." : "A clear view of your students' learning progress."}</p>
        </div>
      </div>
      <div className="parent-profile">
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

  const PeriodCard = ({ label, value, completed, total, date, icon, tone }) => {
    const safeTotal = Number(total) || 0;
    const safeCompleted = Number(completed) || 0;
    const pending = Math.max(0, safeTotal - safeCompleted);
    const percentage = clamp(value);

    return (
      <article className={`period-pie-card ${tone}`}>
        <div className="period-pie-head">
          <div>
            <span className="section-kicker">{label}</span>
            <h3>{label === "TODAY" ? "Today's Task Progress" : label === "THIS WEEK" ? "Weekly Task Progress" : "Monthly Task Progress"}</h3>
            <p>{date || "Current learning period"}</p>
          </div>
          <div className="period-icon">{icon}</div>
        </div>

        <div className="period-pie-body">
          <div
            className="period-donut"
            style={{
              background: `conic-gradient(var(--period-color) 0 ${percentage}%, #edf0f6 ${percentage}% 100%)`,
            }}
          >
            <div className="period-donut-inner">
              <strong>{percentage}%</strong>
              <span>Completed</span>
            </div>
          </div>

          <div className="period-pie-stats">
            <div className="period-stat">
              <span><i className="period-dot completed" />Completed</span>
              <strong>{safeCompleted}</strong>
            </div>
            <div className="period-stat">
              <span><i className="period-dot pending" />Pending</span>
              <strong>{pending}</strong>
            </div>
            <div className="period-stat total">
              <span>Total tasks</span>
              <strong>{safeTotal}</strong>
            </div>
          </div>
        </div>

        <div className="period-performance-line">
          <span>{label === "TODAY" ? "Today's Performance Progress" : label === "THIS WEEK" ? "Weekly Performance Progress" : "Monthly Performance Progress"}</span>
          <strong>{percentage}%</strong>
        </div>
        <div className="period-performance-track">
          <span style={{ width: `${percentage}%` }} />
        </div>
      </article>
    );
  };

  const renderPerformanceChart = () => {
    const width = 820;
    const height = 300;
    const padX = 70;
    const padTop = 28;
    const padBottom = 54;
    const innerW = width - padX * 2;
    const innerH = height - padTop - padBottom;

    const points = chartData.map((item, index) => ({
      ...item,
      x: padX + (index * innerW) / (chartData.length - 1),
      y: padTop + innerH - (item.value / 100) * innerH,
    }));

    const path = points
      .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
      .join(" ");

    const area = `${path} L ${points[points.length - 1].x} ${padTop + innerH} L ${points[0].x} ${padTop + innerH} Z`;

    return (
      <div className="performance-chart-wrap">
        <div className="chart-y-labels" aria-hidden="true">
          <span>100%</span><span>75%</span><span>50%</span><span>25%</span><span>0%</span>
        </div>
        <svg
          className="performance-svg"
          viewBox={`0 0 ${width} ${height}`}
          role="img"
          aria-label="Task completion performance for today, this week and this month"
        >
          <defs>
            <linearGradient id="performanceArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" className="chart-area-stop-start" />
              <stop offset="100%" className="chart-area-stop-end" />
            </linearGradient>
          </defs>

          {[0, 25, 50, 75, 100].map((tick) => {
            const y = padTop + innerH - (tick / 100) * innerH;
            return (
              <line
                key={tick}
                x1={padX}
                x2={width - padX}
                y1={y}
                y2={y}
                className="chart-grid-line"
              />
            );
          })}

          <path d={area} className="chart-area" />
          <path d={path} className="chart-line" />

          {points.map((point, index) => (
            <g key={point.label}>
              <circle cx={point.x} cy={point.y} r="8" className={`chart-point-ring point-${index}`} />
              <circle cx={point.x} cy={point.y} r="4" className={`chart-point point-${index}`} />
              <text x={point.x} y={point.y - 18} textAnchor="middle" className="chart-value">
                {point.value}%
              </text>
              <text x={point.x} y={height - 25} textAnchor="middle" className="chart-label">
                {point.label}
              </text>
            </g>
          ))}
        </svg>
      </div>
    );
  };

  const renderPerformanceChartCard = () => (
    <div className="analytics-card chart-card">
      <div className="analytics-header">
        <div>
          <span className="section-kicker">PERFORMANCE TREND</span>
          <h2>Completion rate by period</h2>
          <p>Compare task completion across today, this week and this month.</p>
        </div>
        <div className="analytics-icon chart-icon"><FaChartLine /></div>
      </div>

      {renderPerformanceChart()}

      <div className="chart-period-legend">
        {chartData.map((item, index) => (
          <div key={item.label} className={`chart-period-item period-${index}`}>
            <span className="legend-dot" />
            <strong>{item.label}</strong>
            <b>{item.value}%</b>
          </div>
        ))}
      </div>
    </div>
  );

  const renderDonut = () => (
    <div className="analytics-card donut-card">
      <div className="analytics-header">
        <div>
          <span className="section-kicker">THIS WEEK</span>
          <h2>Task completion</h2>
          <p>Current week progress for all assigned students.</p>
        </div>
        <div className="analytics-icon donut-icon"><FaChartPie /></div>
      </div>

      <div className="donut-layout">
        <div
          className="donut"
          style={{
            background: `conic-gradient(#7653e8 0 ${analytics.completionPercent}%, #e8edf6 ${analytics.completionPercent}% 100%)`,
          }}
        >
          <div className="donut-inner">
            <strong>{analytics.completionPercent}%</strong>
            <span>Completed</span>
          </div>
        </div>

        <div className="donut-legend">
          <div><i className="dot purple" /><span>Completed</span><strong>{analytics.completed}</strong></div>
          <div><i className="dot gray" /><span>Pending</span><strong>{analytics.pending}</strong></div>
          <div className="donut-total"><span>Tasks this week</span><strong>{analytics.total}</strong></div>
        </div>
      </div>
    </div>
  );


  /* =========================================================
     THREE DISTINCT PERIOD VISUALS
     These are intentionally different graph styles:
       1) Today  -> progress bar / completion signal
       2) Week   -> radial accuracy gauge
       3) Month  -> donut task distribution
     All values are aggregated for every student assigned
     to this parent account.
     ========================================================= */

  const renderThreePeriodVisuals = () => {
    const periods = [
      {
        key: "today",
        label: "TODAY",
        title: "Today's Learning Summary",
        icon: <FaCalendarDays />,
        tone: "today",
        taskProgress: clamp(dashboard.todayTaskProgress),
        performance: clamp(dashboard.todayPerformance),
        accuracy: clamp(dashboard.todayAccuracy),
        completed: Number(dashboard.todayCompleted) || 0,
        total: Number(dashboard.todayTotal) || 0,
        students: students.length,
        date: dashboard.periods.today,
      },
      {
        key: "week",
        label: "THIS WEEK",
        title: "Weekly Learning Summary",
        icon: <FaChartLine />,
        tone: "week",
        taskProgress: clamp(dashboard.weeklyTaskProgress),
        performance: clamp(dashboard.weeklyPerformance),
        accuracy: clamp(dashboard.weeklyAccuracy),
        completed: Number(dashboard.weekCompleted) || 0,
        total: Number(dashboard.weekTotal) || 0,
        students: students.length,
        date: dashboard.periods.week,
      },
      {
        key: "month",
        label: "THIS MONTH",
        title: "Monthly Learning Summary",
        icon: <FaTrophy />,
        tone: "month",
        taskProgress: clamp(dashboard.monthlyTaskProgress),
        performance: clamp(dashboard.monthlyPerformance),
        accuracy: clamp(dashboard.monthlyAccuracy),
        completed: Number(dashboard.monthCompleted) || 0,
        total: Number(dashboard.monthTotal) || 0,
        students: students.length,
        date: dashboard.periods.month,
      },
    ];

    const Metric = ({ icon, label, value, description }) => (
      <div className="period-metric-row">
        <div className="period-metric-icon">{icon}</div>
        <div className="period-metric-copy">
          <div className="period-metric-heading">
            <span>{label}</span>
            <strong>{value}%</strong>
          </div>
          <div className="period-metric-track">
            <span style={{ width: `${value}%` }} />
          </div>
          <small>{description}</small>
        </div>
      </div>
    );

    return (
      <section className="three-period-visual-section">
        <div className="overview-section-head compact">
          <div>
            <span className="section-kicker">LEARNING ANALYTICS</span>
            <h2>Today, This Week & This Month</h2>
            <p>Task progress, performance and completion-time accuracy for all assigned students.</p>
          </div>
          <div className="period-student-summary">
            <FaUserGraduate />
            <strong>{students.length}</strong>
            <span>{students.length === 1 ? "assigned student" : "assigned students"}</span>
          </div>
        </div>

        <div className="three-period-visual-grid">
          {periods.map((period) => {
            const pending = Math.max(0, period.total - period.completed);

            return (
              <article className={`period-visual-card ${period.tone}-visual`} key={period.key}>
                <div className="visual-card-top">
                  <div>
                    <span className="visual-kicker">{period.label}</span>
                    <h3>{period.title}</h3>
                    <p>{period.date || "Current learning period"}</p>
                  </div>
                  <div className={`visual-icon ${period.tone}-icon`}>{period.icon}</div>
                </div>

                <div className="period-student-line">
                  <span><FaUserGraduate /> {period.students} {period.students === 1 ? "student" : "students"}</span>
                  <span>{period.completed}/{period.total} tasks</span>
                </div>

                <div className="period-main-pie-row">
                  <div
                    className="period-main-pie"
                    style={{
                      background: `conic-gradient(var(--period-accent) 0 ${period.taskProgress}%, #eceef5 ${period.taskProgress}% 100%)`,
                    }}
                  >
                    <div>
                      <strong>{period.taskProgress}%</strong>
                      <span>Task Progress</span>
                    </div>
                  </div>

                  <div className="period-task-counts">
                    <div><span>Completed</span><strong>{period.completed}</strong></div>
                    <div><span>Pending</span><strong>{pending}</strong></div>
                    <div><span>Total Tasks</span><strong>{period.total}</strong></div>
                  </div>
                </div>

                <div className="period-metrics-stack">
                  <Metric
                    icon={<FaChartLine />}
                    label={period.key === "today" ? "Today's Performance Progress" : period.key === "week" ? "Weekly Performance Progress" : "Monthly Performance Progress"}
                    value={period.performance}
                    description="Based on saved task performance"
                  />
                  <Metric
                    icon={<FaBullseye />}
                    label={period.key === "today" ? "Today's Task Accuracy Percentage" : period.key === "week" ? "Weekly Task Accuracy Percentage" : "Monthly Task Accuracy Percentage"}
                    value={period.accuracy}
                    description="Based on completion time"
                  />
                </div>

                <div className="period-calculation-note">
                  <span>Calculation</span>
                  <strong>{period.students} {period.students === 1 ? "student" : "students"} · {period.completed} completed / {period.total} total</strong>
                </div>
              </article>
            );
          })}
        </div>

        <div className="period-comparison-card">
          <div className="period-comparison-head">
            <div>
              <span className="section-kicker">PERIOD COMPARISON</span>
              <h3>Progress, Performance & Accuracy</h3>
              <p>Same three measurements compared across all assigned students.</p>
            </div>
            <div className="analytics-icon"><FaChartPie /></div>
          </div>

          <div className="period-comparison-grid">
            {periods.map((period) => (
              <div className="comparison-column" key={period.key}>
                <strong>{period.label}</strong>
                <div className="comparison-bar-row">
                  <span>Task Progress</span>
                  <div><i style={{ width: `${period.taskProgress}%` }} /></div>
                  <b>{period.taskProgress}%</b>
                </div>
                <div className="comparison-bar-row">
                  <span>Performance</span>
                  <div><i style={{ width: `${period.performance}%` }} /></div>
                  <b>{period.performance}%</b>
                </div>
                <div className="comparison-bar-row">
                  <span>Accuracy</span>
                  <div><i style={{ width: `${period.accuracy}%` }} /></div>
                  <b>{period.accuracy}%</b>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  };

  const renderStudentDistribution = () => (
    <div className="analytics-card distribution-card">
      <div className="analytics-header">
        <div><span className="section-kicker">STUDENT HEALTH</span><h2>Weekly performance distribution</h2><p>Students are grouped using their current weekly performance.</p></div>
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
        <div><span className="section-kicker">STUDENT INSIGHTS</span><h2>Student performance</h2><p>Compare Today, This Week and This Month for every student.</p></div>
        <button className="outline-button" onClick={() => { setActivePage("students"); setSearch(""); }}>View students <FaArrowRight /></button>
      </div>
      {students.length === 0 ? (
        <div className="empty-state"><div><FaUserGraduate /></div><h3>No students yet</h3><p>Students assigned to this parent account will appear here.</p></div>
      ) : (
        <div className="table-wrap">
          <table className="performance-table">
            <thead><tr><th>Student</th><th>Today</th><th>This Week</th><th>This Month</th><th>Weekly Status</th><th /></tr></thead>
            <tbody>
              {students.map((student) => {
                const week = clamp(student.weekPerformance ?? student.weeklyPerformance);
                const today = clamp(student.todayPerformance);
                const month = clamp(student.monthlyPerformance);
                return (
                  <tr key={student.id}>
                    <td><div className="table-student"><div className="table-avatar">{getInitials(student.name)}</div><div><strong>{student.name || "Unnamed Student"}</strong><span>#{student.id}{student.email ? ` · ${student.email}` : ""}</span></div></div></td>
                    <td><strong className="table-percent purple-text">{today}%</strong><small>{Number(student.todayCompleted) || 0}/{Number(student.todayTotal) || 0}</small></td>
                    <td><strong className="table-percent blue-text">{week}%</strong><small>{Number(student.weekCompleted) || 0}/{Number(student.weekTotal) || 0}</small></td>
                    <td><strong className="table-percent indigo-text">{month}%</strong><small>{Number(student.monthCompleted) || 0}/{Number(student.monthTotal) || 0}</small></td>
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
    <div className="dashboard-home overview-home">
      {/* Compact welcome overview — no large circular score */}
      <section className="overview-welcome">
        <div className="overview-welcome-copy">
          <span className="overview-eyebrow">PARENT LEARNING CENTER</span>
          <h2>Good to see you, {parent?.name || "Parent"}.</h2>
          <p>Monitor the learning progress of the students assigned to your parent account.</p>
          <div className="overview-meta">
            <span><FaCalendarDays /> {new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</span>
            <span><FaCircleCheck /> Assigned students performance</span>
          </div>
        </div>
        <div className="overview-welcome-art" aria-hidden="true">
          <span className="overview-orbit orbit-one" />
          <span className="overview-orbit orbit-two" />
          <span className="overview-orbit orbit-three" />
          <div className="overview-art-icon"><FaUserGraduate /></div>
        </div>
      </section>

      <section className="overview-section-head">
        <div>
          <span className="section-kicker">ASSIGNED STUDENTS</span>
          <h2>Student performance overview</h2>
          <p>Quickly understand task activity and learning progress.</p>
        </div>
        <button className="overview-student-count" onClick={() => { setActivePage("students"); setSearch(""); }}>
          <FaUserGraduate />
          <span><strong>{students.length}</strong> assigned students</span>
          <FaArrowRight />
        </button>
      </section>

      {/* Small light cards using the same colors as the sidebar */}
      <section className="overview-metrics">
        <MetricCard icon={<FaUserGraduate />} label="Assigned Students" value={students.length} helper="Students linked to this parent" tone="purple" />
        <MetricCard icon={<FaListCheck />} label="Today's Tasks" value={`${dashboard.todayCompleted}/${dashboard.todayTotal}`} helper={`${clamp(dashboard.todayTaskProgress)}% task progress`} tone="blue" progress={dashboard.todayTaskProgress} />
        <MetricCard icon={<FaChartLine />} label="Today's Performance" value={`${clamp(dashboard.todayPerformance)}%`} helper="Saved task performance" tone="green" progress={dashboard.todayPerformance} />
        <MetricCard icon={<FaBullseye />} label="Today's Accuracy" value={`${clamp(dashboard.todayAccuracy)}%`} helper="Based on completion time" tone="orange" progress={dashboard.todayAccuracy} />
        <MetricCard icon={<FaArrowTrendUp />} label="Weekly Performance" value={`${clamp(dashboard.weeklyPerformance)}%`} helper="All assigned students" tone="indigo" progress={dashboard.weeklyPerformance} />
      </section>

      {/* Performance trend — full width */}
      <section className="overview-analytics">
        <div className="overview-chart-card">
          <div className="overview-card-head">
            <div>
              <span className="section-kicker">PERFORMANCE TREND</span>
              <h2>Task performance trend</h2>
              <p>Completion rate across today, this week and this month.</p>
            </div>
            <div className="overview-head-icon purple"><FaChartLine /></div>
          </div>
          {renderPerformanceChart()}
          <div className="overview-chart-legend">
            {chartData.map((item, index) => (
              <div key={item.label} className={`overview-legend-item legend-${index}`}>
                <span />
                <div><strong>{item.label}</strong><small>{item.completed}/{item.total} tasks</small></div>
                <b>{item.value}%</b>
              </div>
            ))}
          </div>
        </div>
      </section>

      {renderThreePeriodVisuals()}

      <div className="student-health-section">
        {renderStudentDistribution()}
      </div>

      {renderStudentTable()}
    </div>
  );

  const renderMyStudents = () => (
    <section className="students-page">
      <div className="page-heading-card"><div><span className="section-kicker">STUDENT DIRECTORY</span><h2>Students</h2><p>View each student's learning activity and open their detailed dashboard.</p></div><button className="refresh-button" onClick={loadDashboard} disabled={loading}><FaRotate /> {loading ? "Refreshing" : "Refresh"}</button></div>
      <div className="student-toolbar"><div className="search-box"><FaMagnifyingGlass /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name, email or ID..." /></div><div className="result-count">{filteredStudents.length} {filteredStudents.length === 1 ? "student" : "students"}</div></div>
      {loading ? <div className="loading-state"><span /><p>Loading students...</p></div> : filteredStudents.length === 0 ? <div className="empty-state large"><div><FaUserGraduate /></div><h3>No students found</h3><p>No students are currently available for this parent account.</p></div> : <div className="student-cards-grid">{filteredStudents.map((student) => { const p = getPerformance(student); const total = Number(student.weekTotal) || 0; const completed = Number(student.weekCompleted) || 0; const pending = Math.max(0, total - completed); return <article className="student-card" key={student.id} onClick={() => openStudentDashboard(student)}><div className="student-card-head"><div className="student-avatar">{getInitials(student.name)}</div><div className="student-card-name"><h3>{student.name || "Unnamed Student"}</h3><span>Student ID #{student.id}</span></div><FaArrowRight className="student-card-arrow" /></div><div className="student-email"><FaUser /> {student.email || "No email available"}</div><div className="student-mini-stats"><div><span>Weekly Total</span><strong>{total}</strong></div><div><span>Completed</span><strong className="green-text">{completed}</strong></div><div><span>Pending</span><strong className="orange-text">{pending}</strong></div></div><div className="student-card-performance"><div><span>This week's performance</span><strong>{p}%</strong></div><em className={getPerformanceClass(p)}>{getPerformanceLabel(p)}</em></div><div className="student-progress"><span className={getPerformanceClass(p)} style={{ width: `${p}%` }} /></div><div className="student-period-row"><div><span>Today</span><strong>{clamp(student.todayPerformance)}%</strong></div><div><span>This Week</span><strong>{p}%</strong></div><div><span>This Month</span><strong>{clamp(student.monthlyPerformance)}%</strong></div></div><button className="student-open-button" onClick={(e) => { e.stopPropagation(); openStudentDashboard(student); }}>Open student dashboard <FaArrowRight /></button></article>; })}</div>}
    </section>
  );

  const renderParentProfile = () => {
    const profileName = parent?.name || parent?.full_name || parent?.fullName || parent?.username || "Parent";
    const profileUsername = parent?.username || "—";
    const profileEmail = parent?.email || parent?.mail || "—";
    const profilePhone = parent?.phone || parent?.mobile || parent?.contact || "—";
    const profileAddress = parent?.address || "—";
    const profileId = parent?.id || parent?.parent_id || "—";

    return (
      <section className="profile-page premium-profile-page">
        <div className="profile-heading-row">
          <div>
            <span className="section-kicker">ACCOUNT CENTER</span>
            <h2>My Profile</h2>
            <p>Manage and view your parent account details.</p>
          </div>
          <div className="profile-live-badge"><span /> Account active</div>
        </div>

        <div className="profile-premium-hero">
          <div className="profile-hero-orb orb-one" />
          <div className="profile-hero-orb orb-two" />
          <div className="profile-avatar-shell">
            <div className="profile-avatar-large">{getInitials(profileName)}</div>
            <span className="profile-verified-dot"><FaCircleCheck /></span>
          </div>
          <div className="profile-hero-copy">
            <span className="profile-role">PARENT ACCOUNT</span>
            <h2>{profileName}</h2>
            <p><FaUser /> {profileUsername} <b>·</b> Account ID #{profileId}</p>
          </div>
          <div className="profile-hero-stat">
            <span>Weekly performance</span>
            <strong>{clamp(dashboard.weeklyPerformance)}%</strong>
            <i><b style={{ width: `${clamp(dashboard.weeklyPerformance)}%` }} /></i>
          </div>
        </div>

        <div className="profile-section-title">
          <div>
            <span className="section-kicker">PERSONAL INFORMATION</span>
            <h3>Account details</h3>
          </div>
          <span className="profile-secure"><FaCircleCheck /> Secure profile</span>
        </div>

        <div className="profile-grid premium-profile-grid">
          <div className="profile-detail premium-detail"><div className="profile-detail-icon purple"><FaUser /></div><div><span>Full Name</span><strong>{profileName}</strong></div></div>
          <div className="profile-detail premium-detail"><div className="profile-detail-icon blue"><FaListCheck /></div><div><span>Username</span><strong>{profileUsername}</strong></div></div>
          <div className="profile-detail premium-detail"><div className="profile-detail-icon green"><FaChartLine /></div><div><span>Email Address</span><strong>{profileEmail}</strong></div></div>
          <div className="profile-detail premium-detail"><div className="profile-detail-icon orange"><FaClock /></div><div><span>Phone Number</span><strong>{profilePhone}</strong></div></div>
          <div className="profile-detail premium-detail wide"><div className="profile-detail-icon pink"><FaCalendarDays /></div><div><span>Address</span><strong>{profileAddress}</strong></div></div>
        </div>

        <div className="profile-section-title profile-summary-title">
          <div>
            <span className="section-kicker">ACCOUNT OVERVIEW</span>
            <h3>Learning snapshot</h3>
          </div>
        </div>

        <div className="profile-summary premium-profile-summary">
          <div className="profile-summary-card purple"><div className="profile-summary-icon"><FaUserGraduate /></div><span>Assigned Students</span><strong>{students.length}</strong><small>Students linked to you</small></div>
          <div className="profile-summary-card blue"><div className="profile-summary-icon"><FaListCheck /></div><span>Weekly Tasks</span><strong>{dashboard.weekTotal}</strong><small>Total tasks this week</small></div>
          <div className="profile-summary-card green"><div className="profile-summary-icon"><FaCircleCheck /></div><span>Completed</span><strong>{dashboard.weekCompleted}</strong><small>Tasks completed this week</small></div>
          <div className="profile-summary-card orange"><div className="profile-summary-icon"><FaArrowTrendUp /></div><span>Performance</span><strong>{clamp(dashboard.weeklyPerformance)}%</strong><small>Current weekly progress</small></div>
        </div>
      </section>
    );
  };

  return <div className="parent-dashboard">{renderSidebar()}<main className="parent-main">{renderTopbar()}<div className="parent-content">{activePage === "dashboard" && renderDashboardHome()}{activePage === "students" && renderMyStudents()}{activePage === "profile" && renderParentProfile()}</div></main></div>;
}

export default ParentDashboard;
