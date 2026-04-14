import { GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import "./login.css";
import { FaUser } from "react-icons/fa";

function Login() {
  const navigate = useNavigate();

  const handleSuccess = async (res) => {
    try {
      const token = res.credential;

      console.log("Token:", token);

      // ✅ send token to backend
      const response = await fetch("https://zyntaweb.com/skilllab/login.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ token })
      });

      const data = await response.json();

      console.log("Backend Response:", data);

      if (data.success) {
        // ✅ save user
        localStorage.setItem("user", JSON.stringify(data.user));
localStorage.setItem("token", token);
        // ✅ redirect to dashboard
        navigate("/dashboard");
      } else {
        alert(data.message);
      }

    } catch (error) {
      console.log("Error:", error);
      alert("Login failed");
    }
  };

  return (
    <div className="login-page">

      {/* 🔥 BACKGROUND */}
      <div className="bg-blob"></div>

      {/* 🔥 LOGIN CARD */}
      <div className="login-card">

        <div className="profile-icon">
          <FaUser />
        </div>

        <h1 className="title">Sign In</h1>
        <p className="subtitle">Continue with Google</p>

        <div className="google-btn">
          <GoogleLogin
            onSuccess={handleSuccess}
            onError={() => {
              console.log("Login Failed");
              alert("Google Login Failed");
            }}
          />
        </div>

      </div>
    </div>
  );
}

export default Login;