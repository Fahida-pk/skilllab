import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import {
  FaGaugeHigh,
  FaUsers,
  FaUserGraduate,
  FaUserTie,
  FaCreditCard,
  FaArrowRightFromBracket,
  FaChevronDown,
  FaXmark,
  FaBars,
} from "react-icons/fa6";

import "./admin-dashboard.css";

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileOpen, setMobileOpen] = useState(false);

  const [studentsOpen, setStudentsOpen] = useState(
    location.pathname.startsWith("/admin/students")
  );

  const [parentsOpen, setParentsOpen] = useState(
    location.pathname.startsWith("/admin/parents")
  );

  const isStudentsPage =
    location.pathname === "/admin/students" ||
    location.pathname.startsWith("/admin/students/");

  const isDashboardPage =
    location.pathname === "/AdminDashboard" ||
    location.pathname === "/admin/dashboard";

  const isParentsPage =
    location.pathname === "/admin/parents" ||
    location.pathname.startsWith("/admin/parents/");


  /* =========================
     NAVIGATION
  ========================= */

  const goDashboard = () => {
    navigate("/AdminDashboard");
    setMobileOpen(false);
  };


  const goStudents = () => {
    navigate("/admin/students");
    setMobileOpen(false);
  };


  const goParents = () => {
    navigate("/admin/parents");
    setMobileOpen(false);
  };


  /* =========================
     LOGOUT
  ========================= */

  const handleLogout = () => {
    localStorage.removeItem("admin");
    localStorage.removeItem("adminLoggedIn");

    navigate("/admin/login", {
      replace: true,
    });
  };


  return (
    <>
      {/* =====================================================
          MOBILE MENU BUTTON
      ===================================================== */}

      {!mobileOpen && (
        <button
          type="button"
          className="mobile-sidebar-menu"
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
        >
          <FaBars />
        </button>
      )}


      {/* =====================================================
          MOBILE OVERLAY
      ===================================================== */}

      {mobileOpen && (
        <div
          className="admin-sidebar-overlay"
          onClick={() => setMobileOpen(false)}
        />
      )}


      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <aside
        className={`admin-sidebar ${
          mobileOpen ? "mobile-open" : ""
        }`}
      >

        {/* =================================================
            BRAND
        ================================================= */}

        <div className="admin-brand">

          <div className="admin-brand-text">
            <strong>SKILL LAB</strong>
          </div>


          {/* MOBILE CLOSE */}

          <button
            type="button"
            className="mobile-sidebar-close"
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
          >
            <FaXmark />
          </button>

        </div>


        {/* =================================================
            NAVIGATION
        ================================================= */}

        <div className="admin-sidebar-content">


          {/* =================================================
              DASHBOARD
          ================================================= */}

          <div className="admin-nav-group">

            <button
              type="button"
              className={`admin-nav-item ${
                isDashboardPage ? "active" : ""
              }`}
              onClick={goDashboard}
            >

              <FaGaugeHigh />

              <span>
                Dashboard
              </span>

            </button>

          </div>


          {/* =================================================
              STUDENTS
          ================================================= */}

          <div className="admin-nav-group">

            <button
              type="button"
              className={`admin-nav-item ${
                isStudentsPage ? "active" : ""
              }`}
              onClick={() => {
                setStudentsOpen((prev) => !prev);
              }}
            >

              <FaUsers />

              <span>
                Students
              </span>


              <FaChevronDown
                className={`admin-nav-arrow ${
                  studentsOpen ? "rotate" : ""
                }`}
              />

            </button>


            {studentsOpen && (
              <div className="admin-submenu">

                <button
                  type="button"
                  className={
                    isStudentsPage
                      ? "submenu-active"
                      : ""
                  }
                  onClick={goStudents}
                >

                  <FaUserGraduate />

                  <span>
                    All Students
                  </span>

                </button>

              </div>
            )}

          </div>


          {/* =================================================
              PARENTS
          ================================================= */}

          <div className="admin-nav-group">

            <button
              type="button"
              className={`admin-nav-item ${
                isParentsPage ? "active" : ""
              }`}
              onClick={() => {

                setParentsOpen((prev) => !prev);

                if (!isParentsPage) {
                  navigate("/admin/parents");
                  setMobileOpen(false);
                }

              }}
            >

              <FaUserTie />

              <span>
                Parents
              </span>


              <FaChevronDown
                className={`admin-nav-arrow ${
                  parentsOpen ? "rotate" : ""
                }`}
              />

            </button>


            {parentsOpen && (
              <div className="admin-submenu">

                <button
                  type="button"
                  className={
                    isParentsPage
                      ? "submenu-active"
                      : ""
                  }
                  onClick={goParents}
                >

                  <FaUserTie />

                  <span>
                    All Parents
                  </span>

                </button>

              </div>
            )}

          </div>


          {/* =================================================
              PAYMENT GATEWAY
          ================================================= */}

          <div className="admin-nav-group">

            <button
              type="button"
              className="admin-nav-item"
            >

              <FaCreditCard />

              <span>
                Payment Gateway
              </span>

            </button>

          </div>

        </div>


        {/* =================================================
            LOGOUT
        ================================================= */}

        <div className="admin-sidebar-bottom">

          <button
            type="button"
            className="admin-logout"
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
}