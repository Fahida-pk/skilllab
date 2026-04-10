import { FaUserCircle, FaSignOutAlt, FaBars } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import "./sidebar.css";

function Sidebar() {
  const user = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();

  const [open, setOpen] = useState(false); // 🔥 NEW

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <>
      {/* 🔥 MOBILE NAVBAR */}
      <div className="mobile-navbar">
        <FaBars onClick={() => setOpen(!open)} />
        <h3>SKILL LAB</h3>
      </div>

      {/* SIDEBAR */}
      <div className={`sidebar ${open ? "show" : ""}`}>

        {/* TOP */}
        <div className="top">
          <h2 className="logo">SKILL LAB</h2>
        </div>

        {/* BOTTOM */}
        <div className="bottom">
          <div className="profile">
            {user?.picture ? (
              <img src={user.picture} alt="profile" className="profile-img" />
            ) : (
              <FaUserCircle className="profile-icon" />
            )}

            <p className="name">{user?.name || "User Name"}</p>
            <p className="email">{user?.email || "user@email.com"}</p>

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