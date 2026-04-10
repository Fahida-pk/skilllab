import { FaUserCircle } from "react-icons/fa";
import "./sidebar.css";

function Sidebar() {
  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <div className="sidebar">

      <h2 className="logo">SkillLab</h2>

      <div className="profile">
        {user?.picture ? (
          <img src={user.picture} alt="profile" className="profile-img" />
        ) : (
          <FaUserCircle className="profile-icon" />
        )}

        <p className="name">{user?.name}</p>
        <p className="email">{user?.email}</p>
      </div>

    </div>
  );
}

export default Sidebar;