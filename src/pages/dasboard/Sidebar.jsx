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
     VIEW DETECTION
  ===================================================== */

  const isAdminStudentView =
    location.pathname.startsWith("/admin/students/");

  const isParentStudentView =
    location.pathname.startsWith("/parent/students/");

  /*
   * URL detection is given priority.
   * This prevents parent student view from showing
   * "Back to Admin Dashboard".
   */

  const currentAdminView =
    isAdminStudentView || adminView;

  const currentParentView =
    isParentStudentView || parentView;


  /* =====================================================
     DISPLAY USER
  ===================================================== */

  const displayName =
    currentAdminView || currentParentView
      ? studentName || "Student"
      : user?.name || "User";


  const displayEmail =
    currentAdminView || currentParentView
      ? studentEmail || ""
      : user?.email || "";


  const displayPicture =
    currentAdminView || currentParentView
      ? ""
      : user?.picture || "";


  /* =====================================================
     DASHBOARD
  ===================================================== */

  const handleDashboard = () => {

    setOpen(false);


    /* ================= PARENT STUDENT ================= */

    if (isParentStudentView && studentId) {

      navigate(
        `/parent/students/${studentId}/dashboard`,
        {
          state: {
            studentEmail,
            studentName,
            studentId,
            fromParent: true,
          },
        }
      );

      return;
    }


    /* ================= ADMIN STUDENT ================= */

    if (isAdminStudentView && studentId) {

      navigate(
        `/admin/students/${studentId}/dashboard`,
        {
          state: {
            studentEmail,
            studentName,
            studentId,
          },
        }
      );

      return;
    }


    /* ================= PARENT VIEW ================= */

    if (currentParentView) {

      navigate("/parent/dashboard", {
        replace: true,
      });

      return;
    }


    /* ================= ADMIN VIEW ================= */

    if (currentAdminView) {

      navigate("/AdminDashboard", {
        replace: true,
      });

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


    /* ================= PARENT STUDENT ================= */

    if (isParentStudentView && studentId) {

      navigate(
        `/parent/students/${studentId}/tasks`,
        {
          state: {
            studentEmail,
            studentName,
            studentId,
            fromParent: true,
          },
        }
      );

      return;
    }


    /* ================= ADMIN STUDENT ================= */

    if (isAdminStudentView && studentId) {

      navigate(
        `/admin/students/${studentId}/tasks`,
        {
          state: {
            studentEmail,
            studentName,
            studentId,
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


    /* =================================================
       PARENT → STUDENT VIEW
    ================================================= */

    if (isParentStudentView) {

      navigate("/parent/dashboard", {
        replace: true,
      });

      return;
    }


    /* =================================================
       ADMIN → STUDENT VIEW
    ================================================= */

    if (isAdminStudentView) {

      navigate("/AdminDashboard", {
        replace: true,
      });

      return;
    }


    /* =================================================
       PARENT VIEW
    ================================================= */

    if (currentParentView) {

      navigate("/parent/dashboard", {
        replace: true,
      });

      return;
    }


    /* =================================================
       ADMIN VIEW
    ================================================= */

    if (currentAdminView) {

      navigate("/AdminDashboard", {
        replace: true,
      });

      return;
    }


    /* =================================================
       NORMAL STUDENT LOGOUT
    ================================================= */

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
    isParentStudentView
      ? location.pathname.includes(
          `/parent/students/${studentId}/dashboard`
        )
      : isAdminStudentView
      ? location.pathname.includes(
          `/admin/students/${studentId}/dashboard`
        )
      : location.pathname === "/dashboard";


  const isTasksActive =
    isParentStudentView
      ? location.pathname.includes(
          `/parent/students/${studentId}/tasks`
        )
      : isAdminStudentView
      ? location.pathname.includes(
          `/admin/students/${studentId}/tasks`
        )
      : location.pathname === "/task" ||
        location.pathname === "/tasks";


  /* =====================================================
     BUTTON TEXT
  ===================================================== */

  const bottomButtonText =
    isParentStudentView
      ? "Back to Parent Dashboard"
      : isAdminStudentView
      ? "Back to Admin Dashboard"
      : currentParentView
      ? "Back to Parent Dashboard"
      : currentAdminView
      ? "Back to Admin Dashboard"
      : "Logout";


  /* =====================================================
     BUTTON ICON
  ===================================================== */

  const showBackIcon =
    isParentStudentView ||
    isAdminStudentView ||
    currentParentView ||
    currentAdminView;


  /* =====================================================
     RETURN
  ===================================================== */

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

        {/* =================================================
            LOGO
        ================================================= */}

        <div className="sidebar-logo">
          SKILL LAB
        </div>


        {/* =================================================
            MENU
        ================================================= */}

        <nav className="sidebar-menu">


          {/* =================================================
              DASHBOARD
          ================================================= */}

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


          {/* =================================================
              TASKS
          ================================================= */}

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


          {/* =================================================
              PROFILE IMAGE
          ================================================= */}

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


          {/* =================================================
              NAME
          ================================================= */}

          <div className="sidebar-user-name">
            {displayName}
          </div>


          {/* =================================================
              EMAIL
          ================================================= */}

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

            {showBackIcon ? (
              <FaArrowLeft />
            ) : (
              <FaSignOutAlt />
            )}


            <span>
              {bottomButtonText}
            </span>

          </button>

        </div>

      </aside>
    </>
  );
}


export default Sidebar;