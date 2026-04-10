import { FaUserCircle, FaSignOutAlt } from "react-icons/fa";
import "./sidebar.css";
function Sidebar() {
  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <div className="sidebar">

      {/* 🔝 TOP */}
      <div className="top">
        <h2 className="logo">SKILL LAB</h2>
      </div>

      {/* 🔽 BOTTOM (🔥 ADD THIS WRAPPER) */}
      <div className="bottom">
        <div className="profile">
          {user?.picture ? (
            <img src={user.picture} alt="profile" className="profile-img" />
          ) : (
            <FaUserCircle className="profile-icon" />
          )}

          <p className="name">{user?.name}</p>
          <p className="email">{user?.email}</p>

          <button className="logout-btn">
            <FaSignOutAlt /> Logout
          </button>
        </div>
      </div>

    </div>
  );
}

export default Sidebar;