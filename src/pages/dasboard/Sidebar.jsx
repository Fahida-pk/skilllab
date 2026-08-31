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

function Sidebar() {
  const [open, setOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const user = JSON.parse(localStorage.getItem("user") || "null");

  const goTo = (path) => {
    setOpen(false);
    navigate(path);
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");

    setOpen(false);

    navigate("/login");
  };

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
      <aside className={`sidebar ${open ? "show" : ""}`}>

        {/* LOGO */}
        <div className="sidebar-logo">
          SKILL LAB
        </div>

        {/* MENU */}
        <nav className="sidebar-menu">

          {/* DASHBOARD */}
          <button
            type="button"
            className={
              location.pathname === "/dashboard"
                ? "sidebar-menu-item active"
                : "sidebar-menu-item"
            }
            onClick={() => goTo("/dashboard")}
          >
            <FaThLarge className="sidebar-menu-icon" />

            <span>Dashboard</span>
          </button>

          {/* TASKS */}
          <button
            type="button"
            className={
              location.pathname === "/task" ||
              location.pathname === "/tasks"
                ? "sidebar-menu-item active"
                : "sidebar-menu-item"
            }
            onClick={() => goTo("/task")}
          >
            <FaTasks className="sidebar-menu-icon" />

            <span>Tasks</span>
          </button>

        </nav>

        {/* PROFILE */}
        <div className="sidebar-profile">

          {user?.picture ? (
            <img
              src={user.picture}
              alt="Profile"
              className="sidebar-profile-image"
            />
          ) : (
            <FaUserCircle className="sidebar-profile-icon" />
          )}

          <div className="sidebar-user-name">
            {user?.name || "User"}
          </div>

          <div className="sidebar-user-email">
            {user?.email || ""}
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