import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaShieldAlt, FaEnvelope, FaLock, FaArrowRight } from "react-icons/fa";
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

        localStorage.setItem("adminLoggedIn", "true");

        navigate("/admin/dashboard");
      } else {
        setError(
          data.message || "Invalid email or password."
        );
      }
    } catch (error) {
      console.error("Admin Login Error:", error);
      setError("Unable to connect to server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-page">

      {/* Background decorations */}
      <div className="admin-glow admin-glow-one"></div>
      <div className="admin-glow admin-glow-two"></div>
      <div className="admin-grid"></div>

      {/* Login Card */}
      <div className="admin-login-card">

        {/* Top Logo */}
        <div className="admin-brand">

          <div className="admin-brand-icon">
            <FaShieldAlt />
          </div>

          <div className="admin-brand-text">
            <span>SKILL</span>
            <strong>LAB</strong>
          </div>

        </div>

        {/* Admin Badge */}
        <div className="admin-badge">
          <span className="admin-status-dot"></span>
          ADMIN PORTAL
        </div>

        {/* Heading */}
        <div className="admin-heading">

          <h1>
            Welcome Back
          </h1>

          <p>
            Sign in to manage your SkillLab system
          </p>

        </div>

        {/* Login Form */}
        <form
          className="admin-login-form"
          onSubmit={handleLogin}
        >

          {/* Email */}
          <div className="admin-field">

            <label>
              Email Address
            </label>

            <div className="admin-input-wrapper">

              <FaEnvelope className="admin-input-icon" />

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

          {/* Password */}
          <div className="admin-field">

            <div className="admin-label-row">

              <label>
                Password
              </label>

            </div>

            <div className="admin-input-wrapper">

              <FaLock className="admin-input-icon" />

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
              >
                {showPassword ? "Hide" : "Show"}
              </button>

            </div>

          </div>

          {/* Error */}
          {error && (
            <div className="admin-error">
              <span>!</span>
              {error}
            </div>
          )}

          {/* Login Button */}
          <button
            type="submit"
            className="admin-login-button"
            disabled={loading}
          >

            <span>
              {loading
                ? "Signing in..."
                : "Sign In to Admin Panel"}
            </span>

            {!loading && (
              <FaArrowRight />
            )}

          </button>

        </form>

        {/* Footer */}
        <div className="admin-login-footer">

          <span className="admin-footer-line"></span>

          <span>
            Secure Administrator Access
          </span>

          <span className="admin-footer-line"></span>

        </div>

        <div className="admin-copyright">
          © {new Date().getFullYear()} SkillLab
        </div>

      </div>

    </div>
  );
}

export default AdminLogin;