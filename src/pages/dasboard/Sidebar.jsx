import { FaUserCircle, FaSignOutAlt } from "react-icons/fa";
import "./sidebar.css";

function Sidebar() {
  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <div className="sidebar">

  {/* TOP */}
  <div className="top">
    <h2 className="logo">SkillLab</h2>
  </div>

  {/* BOTTOM */}
  <div className="bottom">
    <div className="profile">
      <FaUserCircle className="icon" />
      <p>{user?.name}</p>
      <span>{user?.email}</span>
    </div>

    <button className="logout" onClick={handleLogout}>
      Logout
    </button>
  </div>

</div>
  );
}

export default Sidebar;