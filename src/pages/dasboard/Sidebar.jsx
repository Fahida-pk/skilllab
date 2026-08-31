import {
  FaBars,
  FaUserCircle,
  FaSignOutAlt,
  FaThLarge,
  FaTasks,
} from "react-icons/fa";

import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import "./sidebar.css";

function Sidebar() {

  const [open, setOpen] = useState(false);

  const user =
    JSON.parse(localStorage.getItem("user"));

  const navigate = useNavigate();
  const location = useLocation();


  // =========================
  // NAVIGATION
  // =========================

  const goTo = (path) => {

    setOpen(false);

    navigate(path);
  };


  // =========================
  // LOGOUT
  // =========================

  const handleLogout = () => {

    localStorage.removeItem("user");
    localStorage.removeItem("token");

    setOpen(false);

    navigate("/login");
  };


  return (
    <>

      {/* =========================
          MOBILE TOP NAVBAR
      ========================= */}

      <div className="mobile-navbar">

        <FaBars
          onClick={() => setOpen(!open)}
          className="menu-icon"
        />

        <h2 className="logo">
          SKILL LAB
        </h2>

      </div>


      {/* =========================
          OVERLAY
      ========================= */}

      {open && (
        <div
          className="overlay"
          onClick={() => setOpen(false)}
        />
      )}


      {/* =========================
          SIDEBAR
      ========================= */}

      <div
        className={`sidebar ${
          open ? "show" : ""
        }`}
      >

        {/* LOGO */}

        <div className="top">

          <h2 className="logo">
            SKILL LAB
          </h2>

        </div>


        {/* =========================
            MENU
        ========================= */}

        <div className="sidebar-menu">

          {/* DASHBOARD */}

          <button
            className={
              location.pathname === "/dashboard"
                ? "menu-item active"
                : "menu-item"
            }
            onClick={() =>
              goTo("/dashboard")
            }
          >

            <FaThLarge />

            <span>
              Dashboard
            </span>

          </button>


          {/* TASKS */}

          <button
            className={
              location.pathname === "/task" ||
              location.pathname === "/tasks"
                ? "menu-item active"
                : "menu-item"
            }
            onClick={() =>
              goTo("/task")
            }
          >

            <FaTasks />

            <span>
              Tasks
            </span>

          </button>

        </div>


        {/* =========================
            PROFILE + LOGOUT
        ========================= */}

        <div className="bottom">

          <div className="profile1">

            {user?.picture ? (

              <img
                src={user.picture}
                className="profile1-img"
                alt="Profile"
              />

            ) : (

              <FaUserCircle
                className="profile1-icon"
              />

            )}


            <p className="name">
              {user?.name || "User"}
            </p>

            <p className="email">
              {user?.email || ""}
            </p>


            {/* LOGOUT */}

            <button
              className="logout-btn"
              onClick={handleLogout}
            >

              <FaSignOutAlt />

              <span>
                Logout
              </span>

            </button>

          </div>

        </div>

      </div>

    </>
  );
}

export default Sidebar;