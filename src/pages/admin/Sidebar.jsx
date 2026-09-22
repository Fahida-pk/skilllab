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
} from "react-icons/fa6";

import "./admin-dashboard.css";

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileOpen, setMobileOpen] = useState(false);

  const [studentsOpen, setStudentsOpen] = useState(
    location.pathname.startsWith("/admin/students")
  );

  const isStudentsPage =
    location.pathname === "/admin/students" ||
    location.pathname.startsWith("/admin/students/");

  const isDashboardPage =
    location.pathname === "/AdminDashboard" ||
    location.pathname === "/admin/dashboard";

  const isParentsPage =
    location.pathname.startsWith("/admin/parents");

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

  const handleLogout = () => {
    localStorage.removeItem("admin");
    localStorage.removeItem("adminLoggedIn");

    navigate("/admin/login", {
      replace: true,
    });
  };

  return (
    <>
      {/* MOBILE OVERLAY */}
      {mobileOpen && (
        <div
          className="admin-sidebar-overlay"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`admin-sidebar ${
          mobileOpen ? "mobile-open" : ""
        }`}
      >
        {/* BRAND */}
        <div className="admin-brand">
          <div className="admin-brand-text">
            <strong>SKILL LAB</strong>
          </div>

          <button
            type="button"
            className="mobile-sidebar-close"
            onClick={() => setMobileOpen(false)}
          >
            <FaXmark />
          </button>
        </div>

        {/* NAVIGATION */}
        <div className="admin-sidebar-content">

          {/* DASHBOARD */}
          <div className="admin-nav-group">
            <button
              type="button"
              className={`admin-nav-item ${
                isDashboardPage ? "active" : ""
              }`}
              onClick={goDashboard}
            >
              <FaGaugeHigh />

              <span>Dashboard</span>
            </button>
          </div>

          {/* STUDENTS */}
          <div className="admin-nav-group">
            <button
              type="button"
              className={`admin-nav-item ${
                isStudentsPage ? "active" : ""
              }`}
              onClick={() =>
                setStudentsOpen((prev) => !prev)
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
                  type="button"
                  className={
                    isStudentsPage
                      ? "submenu-active"
                      : ""
                  }
                  onClick={goStudents}
                >
                  <FaUserGraduate />

                  <span>All Students</span>
                </button>
              </div>
            )}
          </div>

          {/* PARENTS */}
          <div className="admin-nav-group">
            <button
              type="button"
              className={`admin-nav-item ${
                isParentsPage ? "active" : ""
              }`}
              onClick={goParents}
            >
              <FaUserTie />

              <span>Parents</span>

              <FaChevronDown className="admin-nav-arrow" />
            </button>
          </div>

          {/* PAYMENT GATEWAY */}
          <div className="admin-nav-group">
            <button
              type="button"
              className="admin-nav-item"
            >
              <FaCreditCard />

              <span>Payment Gateway</span>
            </button>
          </div>
        </div>

        {/* LOGOUT */}
        <div className="admin-sidebar-bottom">
          <button
            type="button"
            className="admin-logout"
            onClick={handleLogout}
          >
            <FaArrowRightFromBracket />

            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}