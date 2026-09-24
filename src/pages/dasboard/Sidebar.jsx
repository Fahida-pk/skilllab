import {
  FaThLarge,
  FaTasks,
  FaUserCircle,
  FaSignOutAlt,
  FaBars,
  FaArrowLeft,
} from "react-icons/fa";

import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import "./sidebar.css";

function Sidebar({
  adminView = false,
  parentView = false,
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

  const displayName =
    adminView || parentView
      ? studentName || "Student"
      : user?.name || "User";


  const displayEmail =
    adminView || parentView
      ? studentEmail || ""
      : user?.email || "";


  const displayPicture =
    adminView || parentView
      ? ""
      : user?.picture || "";


  /* =====================================================
     DASHBOARD
  ===================================================== */

  const handleDashboard = () => {

    setOpen(false);


    /* ================= ADMIN STUDENT ================= */

    if (adminView && studentId) {

      navigate(
        `/admin/students/${studentId}/dashboard`,
        {
          state: {
            studentEmail,
            studentName,
          },
        }
      );

      return;
    }


    /* ================= PARENT STUDENT ================= */

    if (parentView && studentId) {

      navigate(
        `/parent/students/${studentId}/dashboard`,
        {
          state: {
            studentEmail,
            studentName,
          },
        }
      );

      return;
    }


    /* ================= NORMAL STUDENT ================= */

    navigate("/dashboard");

  };


  /* =====================================================
     TASKS
  ===================================================== */

  const handleTasks = () => {

    setOpen(false);


    /* ================= ADMIN STUDENT ================= */

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

      return;
    }


    /* ================= PARENT STUDENT ================= */

    if (parentView && studentId) {

      navigate(
        `/parent/students/${studentId}/tasks`,
        {
          state: {
            studentEmail,
            studentName,
          },
        }
      );

      return;
    }


    /* ================= NORMAL STUDENT ================= */

    navigate("/task");

  };


  /* =====================================================
     BACK / LOGOUT
  ===================================================== */

 const handleLogout = () => {
  setOpen(false);

  // ADMIN viewing student
  if (adminView) {
    navigate("/AdminDashboard", {
      replace: true,
    });
    return;
  }

  // PARENT viewing student
  if (parentView) {
    navigate("/parent/dashboard", {
      replace: true,
    });
    return;
  }

  // NORMAL STUDENT
  localStorage.removeItem("user");
  localStorage.removeItem("token");

  navigate("/login", {
    replace: true,
  });
};
 


  /* =====================================================
     ACTIVE STATES
  ===================================================== */

  const isDashboardActive =
    adminView
      ? location.pathname.includes(
          `/admin/students/${studentId}/dashboard`
        )
      : parentView
      ? location.pathname.includes(
          `/parent/students/${studentId}/dashboard`
        )
      : location.pathname === "/dashboard";


  const isTasksActive =
    adminView
      ? location.pathname.includes(
          `/admin/students/${studentId}/tasks`
        )
      : parentView
      ? location.pathname.includes(
          `/parent/students/${studentId}/tasks`
        )
      : location.pathname === "/task" ||
        location.pathname === "/tasks";


  return (
    <>
      {/* =================================================
          MOBILE HEADER
      ================================================= */}

      <div className="mobile-navbar">

        <FaBars
          className="mobile-menu-icon"
          onClick={() =>
            setOpen(!open)
          }
        />

        <h2>
          SKILL LAB
        </h2>

      </div>


      {/* =================================================
          OVERLAY
      ================================================= */}

      {open && (
        <div
          className="sidebar-overlay"
          onClick={() =>
            setOpen(false)
          }
        />
      )}


      {/* =================================================
          SIDEBAR
      ================================================= */}

      <aside
        className={`sidebar ${
          open ? "show" : ""
        }`}
      >


        {/* LOGO */}

        <div className="sidebar-logo">
          SKILL LAB
        </div>


        {/* =================================================
            MENU
        ================================================= */}

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

            <FaThLarge
              className="sidebar-menu-icon"
            />

            <span>
              Dashboard
            </span>

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

            <FaTasks
              className="sidebar-menu-icon"
            />

            <span>
              Tasks
            </span>

          </button>

        </nav>


        {/* =================================================
            PROFILE
        ================================================= */}

        <div className="sidebar-profile">


          {/* PROFILE IMAGE */}

          {displayPicture ? (

            <img
              src={displayPicture}
              alt="Profile"
              className="sidebar-profile-image"
            />

          ) : (

            <FaUserCircle
              className="sidebar-profile-icon"
            />

          )}


          {/* NAME */}

          <div className="sidebar-user-name">
            {displayName}
          </div>


          {/* EMAIL */}

          <div className="sidebar-user-email">
            {displayEmail}
          </div>


          {/* =================================================
              BACK / LOGOUT BUTTON
          ================================================= */}

          <button
            type="button"
            className="sidebar-logout"
            onClick={handleLogout}
          >

            {adminView || parentView ? (
              <FaArrowLeft />
            ) : (
              <FaSignOutAlt />
            )}


         <span>
  {adminView
    ? "Back to Admin Dashboard"
    : parentView
    ? "Back to Parent Dashboard"
    : "Logout"}
</span>
          </button>

        </div>

      </aside>
    </>
  );
}


export default Sidebar;