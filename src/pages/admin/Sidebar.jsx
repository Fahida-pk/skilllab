import { useEffect, useState } from "react";
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

  /* =====================================================
     PAGE CHECK
  ===================================================== */

  const isStudentsPage =
    location.pathname === "/admin/students" ||
    location.pathname.startsWith("/admin/students/");

  const isParentsPage =
    location.pathname === "/admin/parents" ||
    location.pathname.startsWith("/admin/parents/");

  const isDashboardPage =
    location.pathname === "/AdminDashboard" ||
    location.pathname === "/admin/dashboard";


  /* =====================================================
     MENU STATES
  ===================================================== */

  const [studentsOpen, setStudentsOpen] = useState(
    isStudentsPage
  );

  const [parentsOpen, setParentsOpen] = useState(
    isParentsPage
  );


  /* =====================================================
     ROUTE CHANGE
     
     IMPORTANT:
     Parents page -> Parents submenu stays OPEN
     Students page -> Students submenu stays OPEN
     Dashboard -> both CLOSED
  ===================================================== */

  useEffect(() => {

    if (isParentsPage) {
      setParentsOpen(true);
      setStudentsOpen(false);
      return;
    }

    if (isStudentsPage) {
      setStudentsOpen(true);
      setParentsOpen(false);
      return;
    }

    if (isDashboardPage) {
      setStudentsOpen(false);
      setParentsOpen(false);
    }

  }, [
    isParentsPage,
    isStudentsPage,
    isDashboardPage,
  ]);


  /* =====================================================
     DASHBOARD
  ===================================================== */

  const goDashboard = () => {

    navigate("/AdminDashboard");

    // Both menus close
    setStudentsOpen(false);
    setParentsOpen(false);

    setMobileOpen(false);
  };


  /* =====================================================
     STUDENTS
  ===================================================== */

  const goStudents = () => {

    navigate("/admin/students");

    // Students OPEN
    setStudentsOpen(true);

    // Parents CLOSE
    setParentsOpen(false);

    setMobileOpen(false);
  };


  /* =====================================================
     PARENTS
  ===================================================== */

  const goParents = () => {

    navigate("/admin/parents");

    // Parents MUST stay OPEN
    setParentsOpen(true);

    // Students CLOSE
    setStudentsOpen(false);

    setMobileOpen(false);
  };


  /* =====================================================
     LOGOUT
  ===================================================== */

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

                // Toggle Students
                setStudentsOpen((prev) => !prev);

                // Parents always close
                setParentsOpen(false);
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


            {/* ALL STUDENTS */}

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

                /*
                  IMPORTANT:

                  Parents click ചെയ്താൽ toggle ചെയ്യരുത്.

                  Always OPEN.
                */

                setParentsOpen(true);

                // Students close
                setStudentsOpen(false);
              }}
            >

              <FaUserTie />

              <span>
                Parents
              </span>

              <FaChevronDown
                className={`admin-nav-arrow ${
                  parentsOpen || isParentsPage
                    ? "rotate"
                    : ""
                }`}
              />

            </button>


            {/* =================================================
                ALL PARENTS

                isParentsPage true ആയാലും
                parentsOpen true ആയാലും കാണിക്കും.
            ================================================= */}

            {(parentsOpen || isParentsPage) && (
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