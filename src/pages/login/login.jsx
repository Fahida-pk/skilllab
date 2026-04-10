import { GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import "./login.css";
import { FaUser } from "react-icons/fa";

function Login() {
  const navigate = useNavigate();

  return (
    <div className="login-page">

      {/* 🔥 BACK CURVE */}
      <div className="bg-blob"></div>

      {/* 🔥 FRONT CARD */}
      <div className="login-card">

        <div className="profile-icon">
          <FaUser />
        </div>

        <h1 className="title">Sign In</h1>
        <p className="subtitle">Continue with Google</p>

        <div className="google-btn">
          <GoogleLogin
            onSuccess={(res) => {
              console.log(res);
              navigate("/dashboard");
            }}
            onError={() => console.log("Login Failed")}
          />
        </div>

      </div>
    </div>
  );
}

export default Login;