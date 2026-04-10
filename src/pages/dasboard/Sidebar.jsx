import { FaUserCircle } from "react-icons/fa";
import "./sidebar.css";

function Sidebar() {
  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <div className="sidebar">

      {/* TOP SECTION */}
      <div className="top">
        <h2 className="logo">SkillLab</h2>
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
      </div>

    </div>
  );
}

export default Sidebar;