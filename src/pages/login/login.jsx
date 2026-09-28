import { useEffect, useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import { requestNotificationPermission } from "../../firebase";
import "./login.css";

import {
  FaUser,
  FaMobileScreenButton,
} from "react-icons/fa6";

function Login() {
  const navigate = useNavigate();

  // =====================================================
  // PWA INSTALL PROMPT
  // =====================================================

  const [installPrompt, setInstallPrompt] = useState(null);
  const [showInstallButton, setShowInstallButton] =
    useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (event) => {
      // Prevent browser's default install mini prompt
      event.preventDefault();

      // Save the install event
      setInstallPrompt(event);

      // Show our custom install button
      setShowInstallButton(true);
    };

    window.addEventListener(
      "beforeinstallprompt",
      handleBeforeInstallPrompt
    );

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
    };
  }, []);

  // =====================================================
  // INSTALL APP
  // =====================================================

  const handleInstallApp = async () => {
    if (!installPrompt) return;

    try {
      // Open browser's native PWA install dialog
      await installPrompt.prompt();

      // Get user's choice
      const { outcome } =
        await installPrompt.userChoice;

      console.log(
        "PWA install result:",
        outcome
      );

      // Install prompt can be used only once
      setInstallPrompt(null);
      setShowInstallButton(false);
    } catch (error) {
      console.error(
        "PWA install failed:",
        error
      );
    }
  };

  // =====================================================
  // APP INSTALLED EVENT
  // =====================================================

  useEffect(() => {
    const handleAppInstalled = () => {
      console.log(
        "Skill Lab installed successfully"
      );

      setInstallPrompt(null);
      setShowInstallButton(false);
    };

    window.addEventListener(
      "appinstalled",
      handleAppInstalled
    );

    return () => {
      window.removeEventListener(
        "appinstalled",
        handleAppInstalled
      );
    };
  }, []);

  // =====================================================
  // GOOGLE LOGIN
  // =====================================================

  const handleSuccess = async (res) => {
    try {
      const googleToken = res.credential;

      // =================================================
      // LOGIN API
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
      // SERVER ERROR
      // =================================================

      if (!response.ok) {
        throw new Error(
          `Server error: ${response.status}`
        );
      }

      const data = await response.json();

      // =================================================
      // LOGIN FAILED
      // =================================================

      if (!data.success) {
        alert(
          data.message || "Login failed"
        );

        return;
      }

      // =================================================
      // SAVE LOGIN DATA
      // =================================================

      localStorage.setItem(
        "user",
        JSON.stringify(data.user)
      );

      localStorage.setItem(
        "token",
        googleToken
      );

      // =================================================
      // FCM NOTIFICATION REGISTRATION
      // =================================================

      if (data.user?.email) {
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
      }

      // =================================================
      // GO TO DASHBOARD
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

      {/* =================================================
          BACKGROUND GLOW
      ================================================= */}

      <div
        className="login-glow login-glow-blue"
      />

      <div
        className="login-glow login-glow-purple"
      />

      <div
        className="login-glow login-glow-pink"
      />


      {/* =================================================
          LOGIN CARD
      ================================================= */}

      <div className="login-card">

        <div className="card-shine" />


        {/* =================================================
            PROFILE ICON
        ================================================= */}

        <div className="profile-icon">
          <FaUser />
        </div>


        {/* =================================================
            BRAND
        ================================================= */}

        <h1 className="title skill-lab-title">
          SKILL LAB
        </h1>


        {/* =================================================
            SIGN IN
        ================================================= */}

        <h1 className="title">
          Sign In
        </h1>


        <p className="subtitle">
          Continue your learning journey
        </p>


        {/* =================================================
            GOOGLE LOGIN
        ================================================= */}

        <div className="google-btn">

          <GoogleLogin
            onSuccess={handleSuccess}
            onError={handleError}
            auto_select={false}
            useOneTap={false}
          />

        </div>


        {/* =================================================
            PWA INSTALL BUTTON
        ================================================= */}

        {showInstallButton &&
          installPrompt && (

            <button
              type="button"
              className="install-app-btn"
              onClick={handleInstallApp}
            >

              <FaMobileScreenButton />

              <span>
                Add Skill Lab to Home Screen
              </span>

            </button>

          )}


        {/* =================================================
            FOOTER
        ================================================= */}

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