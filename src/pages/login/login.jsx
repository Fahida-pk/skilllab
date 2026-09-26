import { GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import { requestNotificationPermission } from "../../firebase";
import "./login.css";

import { FaUser } from "react-icons/fa";

function Login() {
  const navigate = useNavigate();

  // =====================================================
  // GOOGLE LOGIN SUCCESS
  // =====================================================
  const handleSuccess = async (res) => {
    try {
      const googleToken = res.credential;

      console.log("Google Login Success");

      // =================================================
      // 1. LOGIN PHP FIRST
      // =================================================
      const response = await fetch(
        "https://zyntaweb.com/skilllab/login.php",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            token: googleToken,
            fcmToken: "",
          }),
        }
      );

      // =================================================
      // CHECK HTTP RESPONSE
      // =================================================
      if (!response.ok) {
        throw new Error(
          `Server error: ${response.status}`
        );
      }

      const data = await response.json();

      console.log("Backend Response:", data);

      // =================================================
      // 2. LOGIN FAILED
      // =================================================
      if (!data.success) {
        alert(data.message || "Login failed");
        return;
      }

      // =================================================
      // 3. SAVE USER
      // =================================================
      localStorage.setItem(
        "user",
        JSON.stringify(data.user)
      );

      localStorage.setItem(
        "token",
        googleToken
      );

      console.log(
        "User saved:",
        data.user
      );

      // =================================================
      // 4. REGISTER FCM
      // =================================================
      // IMPORTANT:
      // Register notification BEFORE going to dashboard.
      // This makes sure the phone's FCM token is saved.

      if (data.user?.email) {

        console.log(
          "Starting FCM registration..."
        );

        try {

          const fcmToken =
            await requestNotificationPermission(
              data.user.email
            );

          if (fcmToken) {

            console.log(
              "FCM registration completed successfully:",
              fcmToken
            );

          } else {

            console.warn(
              "FCM token was not generated."
            );

          }

        } catch (error) {

          console.error(
            "FCM registration failed:",
            error
          );

        }

      } else {

        console.warn(
          "User email not available for FCM registration"
        );

      }

      // =================================================
      // 5. GO TO DASHBOARD
      // =================================================

      navigate("/dashboard", {
        replace: true,
      });

    } catch (error) {

      console.error(
        "Login Error:",
        error
      );

      alert(
        "Login failed. Please try again."
      );
    }
  };


  // =====================================================
  // GOOGLE LOGIN ERROR
  // =====================================================
  const handleError = () => {

    console.log(
      "Google Login Failed"
    );

    alert(
      "Google Login Failed"
    );
  };


  // =====================================================
  // UI
  // =====================================================
  return (
    <div className="login-page">

      {/* =========================================
          BACKGROUND GLOWS
      ========================================= */}

      <div className="login-glow login-glow-blue"></div>

      <div className="login-glow login-glow-purple"></div>

      <div className="login-glow login-glow-pink"></div>


      {/* =========================================
          LOGIN CARD
      ========================================= */}

      <div className="login-card">

        {/* Glass Shine */}

        <div className="card-shine"></div>


        {/* =========================================
            PROFILE ICON
        ========================================= */}

        <div className="profile-icon">
          <FaUser />
        </div>


        {/* =========================================
            SKILL LAB
        ========================================= */}

        <h1 className="title skill-lab-title">
          SKILL LAB
        </h1>


        {/* =========================================
            SIGN IN
        ========================================= */}

        <h1 className="title">
          Sign In
        </h1>


        {/* =========================================
            SUBTITLE
        ========================================= */}

        <p className="subtitle">
          Continue your learning journey
        </p>


        {/* =========================================
            GOOGLE LOGIN
        ========================================= */}

        <div className="google-btn">

          <GoogleLogin
            onSuccess={handleSuccess}
            onError={handleError}
            auto_select={false}
            useOneTap={false}
          />

        </div>


        {/* =========================================
            FOOTER
        ========================================= */}

        <div className="login-footer">

          <p>
            Learn • Practice • Grow
          </p>

        </div>

      </div>

    </div>
  );
}

export default Login;