import { FaBars, FaUserCircle, FaSignOutAlt } from "react-icons/fa";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./sidebar.css";

function Sidebar() {
  const [open, setOpen] = useState(false);
  const user = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <>
      {/* 🔥 TOP NAVBAR */}
      <div className="mobile-navbar">
        <FaBars onClick={() => setOpen(true)} />
        <h2 className="logo">SKILL LAB</h2>
      </div>

      {/* 🔥 OVERLAY */}
      {open && <div className="overlay" onClick={() => setOpen(false)}></div>}

      {/* 🔥 SIDEBAR */}
      <div className={`sidebar ${open ? "show" : ""}`}>

        <div className="top">
          <h2 className="logo">SKILL LAB</h2>
        </div>

        <div className="bottom">
          <div className="profile">
            {user?.picture ? (
              <img src={user.picture} className="profile-img" />
            ) : (
              <FaUserCircle className="profile-icon" />
            )}

            <p className="name">{user?.name}</p>
            <p className="email">{user?.email}</p>

            <button className="logout-btn" onClick={handleLogout}>
              <FaSignOutAlt /> Logout
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default Sidebar;