import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  FaGaugeHigh,
  FaUsers,
  FaUserGraduate,
  FaUserGroup,
  FaCreditCard,
  FaChartLine,
  FaGear,
  FaRightFromBracket,
  FaBars,
  FaXmark,
  FaMagnifyingGlass,
  FaChevronDown,
  FaChevronRight,
  FaCalendarDays,
  FaEnvelope,
  FaPhone,
  FaArrowTrendUp,
  FaArrowTrendDown,
  FaCircleCheck,
  FaClock,
  FaCircleXmark,
} from "react-icons/fa6";

import "./admin-dashboard.css";

const API_URL =
  "https://zyntaweb.com/skilllab/admin-dashboard.php";

function AdminDashboard() {
  const navigate = useNavigate();

  const [admin, setAdmin] = useState(null);
  const [students, setStudents] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [studentsOpen, setStudentsOpen] = useState(true);
  const [performanceOpen, setPerformanceOpen] = useState(false);
  const [parentsOpen, setParentsOpen] = useState(false);

  // --------------------------------------------------
  // ADMIN LOGIN CHECK
  // --------------------------------------------------

  useEffect(() => {
    const savedAdmin = localStorage.getItem("admin");
    const loggedIn = localStorage.getItem("adminLoggedIn");

    if (!savedAdmin || loggedIn !== "true") {
      navigate("/admin/login");
      return;
    }

    try {
      setAdmin(JSON.parse(savedAdmin));
    } catch {
      localStorage.removeItem("admin");
      localStorage.removeItem("adminLoggedIn");
      navigate("/admin/login");
    }
  }, [navigate]);

  // --------------------------------------------------
  // LOAD STUDENTS
  // --------------------------------------------------

  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError("");

      const savedAdmin = localStorage.getItem("admin");

      let adminEmail = "";

      if (savedAdmin) {
        try {
          adminEmail = JSON.parse(savedAdmin)?.email || "";
        } catch {
          adminEmail = "";
        }
      }

      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "get_students",
          admin_email: adminEmail,
        }),
      });

      const data = await response.json();

      console.log("Admin Students Response:", data);

      if (data.success) {
        setStudents(data.students || []);
      } else {
        setError(data.message || "Unable to load students.");
      }
    } catch (err) {
      console.error("Fetch Students Error:", err);
      setError("Unable to connect to server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (admin) {
      fetchStudents();
    }
  }, [admin]);

  // --------------------------------------------------
  // LOGOUT
  // --------------------------------------------------

  const handleLogout = () => {
    localStorage.removeItem("admin");
    localStorage.removeItem("adminLoggedIn");

    navigate("/admin/login", {
      replace: true,
    });
  };

  // --------------------------------------------------
  // FILTER STUDENTS
  // --------------------------------------------------

  const filteredStudents = useMemo(() => {
    const searchText = search.trim().toLowerCase();

    return students.filter((student) => {
      const matchesSearch =
        !searchText ||
        String(student.name || "")
          .toLowerCase()
          .includes(searchText) ||
        String(student.email || "")
          .toLowerCase()
          .includes(searchText) ||
        String(student.phone || "")
          .toLowerCase()
          .includes(searchText);

      const matchesStatus =
        statusFilter === "all" ||
        String(student.status || "").toLowerCase() ===
          statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [students, search, statusFilter]);

  // --------------------------------------------------
  // DASHBOARD COUNTS
  // --------------------------------------------------

  const totalStudents = students.length;

  const activeStudents = students.filter(
    (student) => student.status === "active"
  ).length;

  const expiringStudents = students.filter(
    (student) => student.status === "expiring"
  ).length;

  const expiredStudents = students.filter(
    (student) => student.status === "expired"
  ).length;

  const performanceValues = students
    .map((student) => Number(student.performance || 0))
    .filter((value) => !Number.isNaN(value));

  const averagePerformance =
    performanceValues.length > 0
      ? Math.round(
          performanceValues.reduce(
            (sum, value) => sum + value,
            0
          ) / performanceValues.length
        )
      : 0;

  const goodPerformanceCount = students.filter(
    (student) => Number(student.performance || 0) >= 70
  ).length;

  const weakPerformanceCount = students.filter(
    (student) => Number(student.performance || 0) < 50
  ).length;

  // --------------------------------------------------
  // OPEN STUDENT DASHBOARD
  // --------------------------------------------------

  const openStudentDashboard = (student) => {
    if (!student?.id) return;

    setSidebarOpen(false);

    navigate(
      `/admin/students/${student.id}/dashboard`
    );
  };

  // --------------------------------------------------
  // INITIALS
  // --------------------------------------------------

  const getInitials = (name) => {
    if (!name) return "S";

    return name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((word) => word.charAt(0).toUpperCase())
      .join("");
  };

  // --------------------------------------------------
  // STATUS
  // --------------------------------------------------

  const getStatusIcon = (status) => {
    if (status === "active") {
      return <FaCircleCheck />;
    }

    if (status === "expiring") {
      return <FaClock />;
    }

    if (status === "expired") {
      return <FaCircleXmark />;
    }

    return <FaClock />;
  };

  // --------------------------------------------------
  // NAVIGATION
  // --------------------------------------------------

  const goTo = (path) => {
    setSidebarOpen(false);
    navigate(path);
  };

  return (
    <div className="admin-dashboard">

      {/* =========================================
          MOBILE OVERLAY
      ========================================= */}

      {sidebarOpen && (
        <div
          className="admin-sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* =========================================
          SIDEBAR
      ========================================= */}

      <aside
        className={`admin-sidebar ${
          sidebarOpen ? "mobile-open" : ""
        }`}
      >

        <div className="admin-brand">

          <div className="admin-brand-logo">
            <span>S</span>
          </div>

          <div className="admin-brand-text">
            <strong>SKILL LAB</strong>
            <small>Admin Panel</small>
          </div>

          <button
            className="mobile-sidebar-close"
            onClick={() => setSidebarOpen(false)}
          >
            <FaXmark />
          </button>

        </div>

        <div className="admin-sidebar-content">

          {/* Dashboard */}

          <button
            className="admin-nav-item active"
            onClick={() => goTo("/admin/dashboard")}
          >
            <FaGaugeHigh />
            <span>Dashboard</span>
          </button>

          {/* Overall Performance */}

          <div className="admin-nav-group">

            <button
              className="admin-nav-item"
              onClick={() =>
                setPerformanceOpen(!performanceOpen)
              }
            >
              <FaChartLine />
              <span>Overall Performance</span>

              <FaChevronDown
                className={`admin-nav-arrow ${
                  performanceOpen ? "rotate" : ""
                }`}
              />
            </button>

            {performanceOpen && (
              <div className="admin-submenu">

                <button
                  onClick={() =>
                    goTo("/admin/performance/weak")
                  }
                >
                  <FaArrowTrendDown />
                  Weak Performance
                </button>

                <button
                  onClick={() =>
                    goTo("/admin/performance/good")
                  }
                >
                  <FaArrowTrendUp />
                  Good Performance
                </button>

              </div>
            )}

          </div>

          {/* Students */}

          <div className="admin-nav-group">

            <button
              className="admin-nav-item"
              onClick={() =>
                setStudentsOpen(!studentsOpen)
              }
            >
              <FaUsers />
              <span>Students</span>

              <FaChevronDown
                className={`admin-nav-arrow ${
                  studentsOpen ? "rotate" : ""
                }`}
              />
            </button>

            {studentsOpen && (
              <div className="admin-submenu">

                <button
                  className="submenu-active"
                  onClick={() =>
                    goTo("/admin/students")
                  }
                >
                  <FaUserGraduate />
                  All Students
                </button>

              </div>
            )}

          </div>

          {/* Parents */}

          <div className="admin-nav-group">

            <button
              className="admin-nav-item"
              onClick={() =>
                setParentsOpen(!parentsOpen)
              }
            >
              <FaUserGroup />
              <span>Parents</span>

              <FaChevronDown
                className={`admin-nav-arrow ${
                  parentsOpen ? "rotate" : ""
                }`}
              />
            </button>

            {parentsOpen && (
              <div className="admin-submenu">

                <button
                  onClick={() =>
                    goTo("/admin/parents/add")
                  }
                >
                  Add Parent
                </button>

                <button
                  onClick={() =>
                    goTo("/admin/parents/assign")
                  }
                >
                  Search / Assign Students
                </button>

              </div>
            )}

          </div>

          {/* Other menus */}

          <button
            className="admin-nav-item"
            onClick={() =>
              goTo("/admin/payment-gateway")
            }
          >
            <FaCreditCard />
            <span>Payment Gateway</span>
          </button>

          <button
            className="admin-nav-item"
            onClick={() =>
              goTo("/admin/students-performance")
            }
          >
            <FaChartLine />
            <span>Students Performance</span>
          </button>

          <button
            className="admin-nav-item"
            onClick={() =>
              goTo("/admin/settings")
            }
          >
            <FaGear />
            <span>Settings</span>
          </button>

        </div>

        {/* Logout */}

        <div className="admin-sidebar-bottom">

          <button
            className="admin-logout"
            onClick={handleLogout}
          >
            <FaRightFromBracket />
            <span>Logout</span>
          </button>

        </div>

      </aside>

      {/* =========================================
          MAIN
      ========================================= */}

      <main className="admin-main">

        {/* TOPBAR */}

        <header className="admin-topbar">

          <div className="admin-topbar-left">

            <button
              className="mobile-menu-button"
              onClick={() =>
                setSidebarOpen(true)
              }
            >
              <FaBars />
            </button>

            <div>
              <h1>Admin Dashboard</h1>
              <p>
                Manage students and monitor overall
                performance.
              </p>
            </div>

          </div>

          <div className="admin-profile">

            <div className="admin-profile-avatar">
              {getInitials(admin?.name)}
            </div>

            <div className="admin-profile-info">
              <strong>
                {admin?.name || "Admin"}
              </strong>
              <span>Administrator</span>
            </div>

          </div>

        </header>

        <div className="admin-content">

          {/* =====================================
              STAT CARDS
          ===================================== */}

          <section className="admin-stat-grid">

            <div className="admin-stat-card">

              <div className="admin-stat-icon purple">
                <FaUsers />
              </div>

              <div className="admin-stat-details">
                <span>Total Students</span>
                <strong>{totalStudents}</strong>
                <small>Registered students</small>
              </div>

            </div>

            <div className="admin-stat-card">

              <div className="admin-stat-icon green">
                <FaCircleCheck />
              </div>

              <div className="admin-stat-details">
                <span>Active Students</span>
                <strong>{activeStudents}</strong>
                <small>Currently active</small>
              </div>

            </div>

            <div className="admin-stat-card">

              <div className="admin-stat-icon orange">
                <FaClock />
              </div>

              <div className="admin-stat-details">
                <span>Expiring Soon</span>
                <strong>{expiringStudents}</strong>
                <small>Subscription attention</small>
              </div>

            </div>

            <div className="admin-stat-card">

              <div className="admin-stat-icon red">
                <FaCircleXmark />
              </div>

              <div className="admin-stat-details">
                <span>Expired</span>
                <strong>{expiredStudents}</strong>
                <small>Subscription expired</small>
              </div>

            </div>

          </section>

          {/* =====================================
              PERFORMANCE OVERVIEW
          ===================================== */}

          <section className="admin-overview-grid">

            <div className="admin-overview-card">

              <div className="overview-icon">
                <FaChartLine />
              </div>

              <div>
                <span>Average Performance</span>
                <strong>
                  {averagePerformance}%
                </strong>
              </div>

            </div>

            <div className="admin-overview-card">

              <div className="overview-icon good">
                <FaArrowTrendUp />
              </div>

              <div>
                <span>Good Performance</span>
                <strong>
                  {goodPerformanceCount}
                </strong>
              </div>

            </div>

            <div className="admin-overview-card">

              <div className="overview-icon weak">
                <FaArrowTrendDown />
              </div>

              <div>
                <span>Weak Performance</span>
                <strong>
                  {weakPerformanceCount}
                </strong>
              </div>

            </div>

          </section>

          {/* =====================================
              ALL STUDENTS
          ===================================== */}

          <section className="students-section">

            <div className="students-section-header">

              <div>
                <h2>All Students</h2>
                <p>
                  View and manage all registered
                  students.
                </p>
              </div>

              <button
                className="refresh-button"
                onClick={fetchStudents}
                disabled={loading}
              >
                {loading ? "Loading..." : "Refresh"}
              </button>

            </div>

            {/* SEARCH + FILTER */}

            <div className="students-toolbar">

              <div className="student-search">

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

              <div className="student-filter">

                <select
                  value={statusFilter}
                  onChange={(e) =>
                    setStatusFilter(e.target.value)
                  }
                >
                  <option value="all">
                    All Status
                  </option>
                  <option value="active">
                    Active
                  </option>
                  <option value="expiring">
                    Expiring
                  </option>
                  <option value="expired">
                    Expired
                  </option>
                </select>

              </div>

            </div>

            {/* ERROR */}

            {error && (
              <div className="admin-error">
                {error}
              </div>
            )}

            {/* LOADING */}

            {loading ? (
              <div className="students-loading">

                <div className="loading-spinner" />

                <p>
                  Loading students...
                </p>

              </div>
            ) : filteredStudents.length === 0 ? (

              <div className="no-students">

                <div className="no-students-icon">
                  <FaUserGraduate />
                </div>

                <h3>No students found</h3>

                <p>
                  No student matches your search
                  or filter.
                </p>

              </div>

            ) : (

              <div className="students-table-wrapper">

                <table className="students-table">

                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>Contact</th>
                      <th>Join Date</th>
                      <th>Expiry Date</th>
                      <th>Status</th>
                      <th>Performance</th>
                      <th></th>
                    </tr>
                  </thead>

                  <tbody>

                    {filteredStudents.map(
                      (student) => {

                        const performance = Math.max(
                          0,
                          Math.min(
                            100,
                            Number(
                              student.performance || 0
                            )
                          )
                        );

                        return (
                          <tr
                            key={student.id}
                            className="student-row"
                            onClick={() =>
                              openStudentDashboard(
                                student
                              )
                            }
                          >

                            {/* STUDENT */}

                            <td>

                              <div className="student-cell">

                                {student.photo ? (
                                  <img
                                    src={student.photo}
                                    alt={
                                      student.name ||
                                      "Student"
                                    }
                                    className="student-photo"
                                  />
                                ) : (
                                  <div className="student-avatar">
                                    {getInitials(
                                      student.name
                                    )}
                                  </div>
                                )}

                                <div className="student-main-info">

                                  <strong>
                                    {student.name ||
                                      "Unnamed Student"}
                                  </strong>

                                  <span>
                                    ID: #
                                    {student.id}
                                  </span>

                                </div>

                              </div>

                            </td>

                            {/* CONTACT */}

                            <td>

                              <div className="student-contact">

                                <span>
                                  <FaEnvelope />
                                  {student.email ||
                                    "—"}
                                </span>

                                <span>
                                  <FaPhone />
                                  {student.phone ||
                                    "—"}
                                </span>

                              </div>

                            </td>

                            {/* JOIN DATE */}

                            <td>

                              <div className="date-cell">

                                <FaCalendarDays />

                                <span>
                                  {student.join_date ||
                                    "—"}
                                </span>

                              </div>

                            </td>

                            {/* EXPIRY */}

                            <td>

                              <div className="date-cell">

                                <FaCalendarDays />

                                <span>
                                  {student.expiry_date ||
                                    "—"}
                                </span>

                              </div>

                            </td>

                            {/* STATUS */}

                            <td>

                              <span
                                className={`student-status ${student.status}`}
                              >
                                {getStatusIcon(
                                  student.status
                                )}

                                {student.status
                                  ? student.status
                                      .charAt(0)
                                      .toUpperCase() +
                                    student.status.slice(
                                      1
                                    )
                                  : "Unknown"}
                              </span>

                            </td>

                            {/* PERFORMANCE */}

                            <td>

                              <div className="performance-cell">

                                <div className="performance-top">

                                  <strong>
                                    {performance}%
                                  </strong>

                                </div>

                                <div className="performance-bar">

                                  <div
                                    className="performance-fill"
                                    style={{
                                      width: `${performance}%`,
                                    }}
                                  />

                                </div>

                              </div>

                            </td>

                            {/* ACTION */}

                            <td>

                              <button
                                className="view-student-button"
                                onClick={(e) => {
                                  e.stopPropagation();

                                  openStudentDashboard(
                                    student
                                  );
                                }}
                              >
                                View
                                <FaChevronRight />
                              </button>

                            </td>

                          </tr>
                        );
                      }
                    )}

                  </tbody>

                </table>

              </div>

            )}

          </section>

        </div>

      </main>

    </div>
  );
}

export default AdminDashboard;