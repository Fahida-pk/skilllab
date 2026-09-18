import {
  FaThLarge,
  FaTasks,
  FaUserCircle,
  FaSignOutAlt,
  FaBars,
} from "react-icons/fa";

import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import "./sidebar.css";

function Sidebar({
  adminView = false,
  studentName = "",
  studentEmail = "",
  studentId = null,
}) {
  const [open, setOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const user = JSON.parse(
    localStorage.getItem("user") || "null"
  );

  /* =====================================================
     DISPLAY USER
  ===================================================== */

  const displayName = adminView
    ? studentName || "Student"
    : user?.name || "User";

  const displayEmail = adminView
    ? studentEmail || ""
    : user?.email || "";

  const displayPicture = adminView
    ? ""
    : user?.picture || "";

  /* =====================================================
     NAVIGATION
  ===================================================== */

  const goTo = (path) => {
    setOpen(false);
    navigate(path);
  };

  /* =====================================================
     DASHBOARD
  ===================================================== */

  const handleDashboard = () => {
    setOpen(false);

    if (adminView && studentId) {
      navigate(
        `/admin/students/${studentId}/dashboard`
      );
    } else {
      navigate("/dashboard");
    }
  };

  /* =====================================================
     TASKS
  ===================================================== */

  const handleTasks = () => {
    setOpen(false);

    if (adminView && studentId) {
      navigate(
        `/admin/students/${studentId}/tasks`,
        {
          state: {
            studentEmail,
            studentName,
          },
        }
      );
    } else {
      navigate("/task");
    }
  };

  /* =====================================================
     LOGOUT
  ===================================================== */

  const handleLogout = () => {
    setOpen(false);

    /*
     * ADMIN VIEW:
     * Do NOT remove admin login.
     * Just return to Admin Students page.
     */
    if (adminView) {
      navigate("/admin/students");
      return;
    }

    /*
     * NORMAL STUDENT:
     * Existing logout behavior.
     */
    localStorage.removeItem("user");
    localStorage.removeItem("token");

    navigate("/login");
  };

  /* =====================================================
     ACTIVE STATES
  ===================================================== */

  const isDashboardActive = adminView
    ? location.pathname.includes(
        `/admin/students/${studentId}/dashboard`
      )
    : location.pathname === "/dashboard";

  const isTasksActive = adminView
    ? location.pathname.includes(
        `/admin/students/${studentId}/tasks`
      )
    : location.pathname === "/task" ||
      location.pathname === "/tasks";

  return (
    <>
      {/* ================= MOBILE HEADER ================= */}

      <div className="mobile-navbar">

        <FaBars
          className="mobile-menu-icon"
          onClick={() => setOpen(!open)}
        />

        <h2>SKILL LAB</h2>

      </div>

      {/* ================= OVERLAY ================= */}

      {open && (
        <div
          className="sidebar-overlay"
          onClick={() => setOpen(false)}
        />
      )}

      {/* ================= SIDEBAR ================= */}

      <aside
        className={`sidebar ${
          open ? "show" : ""
        }`}
      >

        {/* LOGO */}

        <div className="sidebar-logo">
          SKILL LAB
        </div>

        {/* MENU */}

        <nav className="sidebar-menu">

          {/* ================= DASHBOARD ================= */}

          <button
            type="button"
            className={
              isDashboardActive
                ? "sidebar-menu-item active"
                : "sidebar-menu-item"
            }
            onClick={handleDashboard}
          >
            <FaThLarge className="sidebar-menu-icon" />

            <span>Dashboard</span>
          </button>

          {/* ================= TASKS ================= */}

          <button
            type="button"
            className={
              isTasksActive
                ? "sidebar-menu-item active"
                : "sidebar-menu-item"
            }
            onClick={handleTasks}
          >
            <FaTasks className="sidebar-menu-icon" />

            <span>Tasks</span>
          </button>

        </nav>

        {/* PROFILE */}

        <div className="sidebar-profile">

          {/* PROFILE IMAGE */}

          {displayPicture ? (
            <img
              src={displayPicture}
              alt="Profile"
              className="sidebar-profile-image"
            />
          ) : (
            <FaUserCircle className="sidebar-profile-icon" />
          )}

          {/* STUDENT NAME */}

          <div className="sidebar-user-name">
            {displayName}
          </div>

          {/* STUDENT EMAIL */}

          <div className="sidebar-user-email">
            {displayEmail}
          </div>

          {/* LOGOUT */}

          <button
            type="button"
            className="sidebar-logout"
            onClick={handleLogout}
          >
            <FaSignOutAlt />

            <span>Logout</span>
          </button>

        </div>

      </aside>
    </>
  );
}

export default Sidebar;