import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaShieldAlt,
  FaEnvelope,
  FaLock,
  FaArrowRight,
  FaEye,
  FaEyeSlash,
  FaCheckCircle,
} from "react-icons/fa";

import "./admin-login.css";

function AdminLogin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");

    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        "https://zyntaweb.com/skilllab/admin-login.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim(),
            password: password,
          }),
        }
      );

      const data = await response.json();

      console.log("Admin Login Response:", data);

      if (data.success) {
        localStorage.setItem(
          "admin",
          JSON.stringify(data.admin)
        );

        localStorage.setItem(
          "adminLoggedIn",
          "true"
        );

        navigate("/admin/dashboard");
      } else {
        setError(
          data.message || "Invalid email or password."
        );
      }
    } catch (error) {
      console.error("Admin Login Error:", error);
      setError(
        "Unable to connect to server. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-page">

      {/* =====================================
          BACKGROUND
      ====================================== */}

      <div className="admin-glow admin-glow-one"></div>
      <div className="admin-glow admin-glow-two"></div>
      <div className="admin-glow admin-glow-three"></div>

      <div className="admin-orb orb-one"></div>
      <div className="admin-orb orb-two"></div>
      <div className="admin-orb orb-three"></div>

      <div className="admin-grid"></div>


      {/* =====================================
          MAIN GLASS CARD
      ====================================== */}

      <div className="admin-login-card">

        {/* TOP GLASS HIGHLIGHT */}
        <div className="glass-highlight"></div>


        {/* =====================================
            LOGO
        ====================================== */}

        <div className="admin-brand">

          

          <div className="admin-brand-text">
            <span>SKILL</span>
            <strong>LAB</strong>
          </div>

        </div>


     

        {/* =====================================
            HEADING
        ====================================== */}

        <div className="admin-heading">

          <h1>
            Welcome 
          </h1>

          <p>
            Sign in to manage your SkillLab system
          </p>

        </div>


        {/* =====================================
            LOGIN FORM
        ====================================== */}

        <form
          className="admin-login-form"
          onSubmit={handleLogin}
        >

          {/* EMAIL */}

          <div className="admin-field">

            <label>
              Email Address
            </label>

            <div className="admin-input-wrapper">

              <FaEnvelope
                className="admin-input-icon"
              />

              <input
                type="email"
                placeholder="Enter admin email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                autoComplete="username"
              />

            </div>

          </div>


          {/* PASSWORD */}

          <div className="admin-field">

            <label>
              Password
            </label>

            <div className="admin-input-wrapper">

              <FaLock
                className="admin-input-icon"
              />

              <input
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                placeholder="Enter your password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                autoComplete="current-password"
              />

              <button
                type="button"
                className="show-password-btn"
                onClick={() =>
                  setShowPassword(!showPassword)
                }
                aria-label={
                  showPassword
                    ? "Hide password"
                    : "Show password"
                }
              >

                {showPassword ? (
                  <FaEyeSlash />
                ) : (
                  <FaEye />
                )}

              </button>

            </div>

          </div>


          {/* ERROR */}

          {error && (
            <div className="admin-error">

              <span className="error-icon">
                !
              </span>

              <span>
                {error}
              </span>

            </div>
          )}


          {/* LOGIN BUTTON */}

          <button
            type="submit"
            className="admin-login-button"
            disabled={loading}
          >

            {loading ? (
              <>
                <span className="admin-spinner"></span>
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <span>
                  Sign In to Admin Panel
                </span>

                <FaArrowRight />
              </>
            )}

          </button>

        </form>


        
      </div>

    </div>
  );
}

export default AdminLogin;