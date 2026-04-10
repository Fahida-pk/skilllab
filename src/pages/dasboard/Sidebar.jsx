import { FaUserCircle, FaSignOutAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "./sidebar.css";

function Sidebar() {
  const user = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("user"); // remove user data
    navigate("/login"); // redirect to login page
  };

  return (
    <div className="sidebar">

      {/* TOP SECTION */}
      <div className="top">
        <h2 className="logo">SKILL LAB</h2>
      </div>

      {/* BOTTOM PROFILE */}
      <div className="profile">
        {user?.picture ? (
          <img src={user.picture} alt="profile" className="profile-img" />
        ) : (
          <FaUserCircle className="profile-icon" />
        )}

        <p className="name">{user?.name || "User Name"}</p>
        <p className="email">{user?.email || "user@email.com"}</p>

        {/* ✅ LOGOUT BUTTON */}
        <button className="logout-btn" onClick={handleLogout}>
          <FaSignOutAlt /> Logout
        </button>
      </div>

    </div>
  );
}

export default Sidebar;