import { GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import "./login.css";

function Login() {
  const navigate = useNavigate();

  return (
    <div className="login-page">
  <div className="login-card">
    <div className="logo">📘</div>

    <h1>SkillLab</h1>
    <p className="subtitle">Student To-Do Manager</p>

    <button className="google-btn">
      <img
        src="https://developers.google.com/identity/images/g-logo.png"
        alt="google"
      />
      Continue with Google
    </button>
  </div>
</div>
    
  );
}

export default Login;