import { useEffect, useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import { requestNotificationPermission } from "../../firebase";
import "./login.css";

import { FaUser } from "react-icons/fa6";

function Login() {
  const navigate = useNavigate();

  // =====================================================
  // PWA INSTALL
  // =====================================================

  const [installPrompt, setInstallPrompt] = useState(null);
  const [pwaReady, setPwaReady] = useState(false);

  // =====================================================
  // GET PWA INSTALL PROMPT
  // =====================================================

  useEffect(() => {
    console.log("PWA: Login component loaded");

    // =================================================
    // CHECK IF ALREADY INSTALLED
    // =================================================

    const isStandalone =
      window.matchMedia(
        "(display-mode: standalone)"
      ).matches ||
      window.navigator.standalone === true;

    if (isStandalone) {
      console.log(
        "📱 Skill Lab is already installed"
      );

      setPwaReady(false);

      return;
    }

    // =================================================
    // CHECK IF USER WAS ALREADY ASKED
    // =================================================

    const alreadyAsked =
      localStorage.getItem(
        "skillLabInstallAsked"
      ) === "true";

    if (alreadyAsked) {
      console.log(
        "⛔ Skill Lab install popup already shown before"
      );

      setPwaReady(false);

      return;
    }

    // =================================================
    // BEFORE INSTALL PROMPT
    // =================================================

    const handleBeforeInstallPrompt = (event) => {
      console.log(
        "🔥🔥 BEFORE INSTALL PROMPT RECEIVED 🔥🔥"
      );

      // Prevent Chrome's automatic install prompt
      event.preventDefault();

      // =================================================
      // SAVE PROMPT
      // =================================================

      window.__skillLabInstallPrompt = event;

      setInstallPrompt(event);

      // =================================================
      // IMPORTANT
      // Mark that user has already been asked
      // =================================================

      localStorage.setItem(
        "skillLabInstallAsked",
        "true"
      );

      // Show our custom popup
      setPwaReady(true);
    };

    window.addEventListener(
      "beforeinstallprompt",
      handleBeforeInstallPrompt
    );

    // =================================================
    // CLEANUP
    // =================================================

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
    };
  }, []);

  // =====================================================
  // YES - INSTALL SKILL LAB
  // =====================================================

  const handleInstallApp = async () => {
    console.log(
      "📱 User selected YES for Skill Lab installation"
    );

    const prompt =
      installPrompt ||
      window.__skillLabInstallPrompt;

    // =================================================
    // CLOSE OUR CUSTOM POPUP
    // =================================================

    setPwaReady(false);

    // =================================================
    // NO PROMPT AVAILABLE
    // =================================================

    if (!prompt) {
      console.log(
        "❌ NO INSTALL PROMPT AVAILABLE"
      );

      setInstallPrompt(null);

      window.__skillLabInstallPrompt = null;

      return;
    }

    try {
      console.log(
        "🚀 Opening native Skill Lab install dialog..."
      );

      // =================================================
      // OPEN NATIVE INSTALL DIALOG
      // =================================================

      await prompt.prompt();

      // =================================================
      // WAIT FOR USER'S CHOICE
      // =================================================

      const result =
        await prompt.userChoice;

      console.log(
        "PWA install result:",
        result.outcome
      );

      // =================================================
      // ACCEPTED
      // =================================================

      if (result.outcome === "accepted") {
        console.log(
          "✅ Skill Lab installation accepted"
        );
      }

      // =================================================
      // DISMISSED
      // =================================================

      else {
        console.log(
          "❌ Skill Lab installation dismissed"
        );
      }

      // =================================================
      // PROMPT CAN ONLY BE USED ONCE
      // =================================================

      setInstallPrompt(null);

      window.__skillLabInstallPrompt = null;

    } catch (error) {
      console.error(
        "❌ Install error:",
        error
      );

      setInstallPrompt(null);

      window.__skillLabInstallPrompt = null;
    }
  };

  // =====================================================
  // NO - CLOSE MESSAGE
  // =====================================================

  const handleInstallNo = () => {
    console.log(
      "❌ User selected NO for Skill Lab installation"
    );

    // =================================================
    // IMPORTANT
    // The user has already been asked.
    // Do NOT ask again.
    // =================================================

    localStorage.setItem(
      "skillLabInstallAsked",
      "true"
    );

    setPwaReady(false);

    setInstallPrompt(null);

    window.__skillLabInstallPrompt = null;
  };

  // =====================================================
  // APP INSTALLED
  // =====================================================

  useEffect(() => {
    const handleAppInstalled = () => {
      console.log(
        "✅ Skill Lab installed successfully"
      );

      // Keep the asked flag
      // so popup doesn't appear again

      localStorage.setItem(
        "skillLabInstallAsked",
        "true"
      );

      setInstallPrompt(null);

      setPwaReady(false);

      window.__skillLabInstallPrompt = null;
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

      // =================================================
      // RESPONSE
      // =================================================

      const data =
        await response.json();

      // =================================================
      // LOGIN FAILED
      // =================================================

      if (!data.success) {
        alert(
          data.message ||
            "Login failed"
        );

        return;
      }

      // =================================================
      // SAVE LOGIN
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
      // FCM
      // =================================================

      if (data.user?.email) {
        try {
          const fcmToken =
            await requestNotificationPermission(
              data.user.email
            );

          if (fcmToken) {
            console.log(
              "FCM registration completed:",
              fcmToken
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
      // DASHBOARD
      // =================================================

      navigate("/task", {
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
            PROFILE
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
            PWA INSTALL MESSAGE BOX
        ================================================= */}

        {pwaReady && (
          <div className="pwa-install-overlay">

            <div className="pwa-install-box">

              {/* APP ICON */}

              <div className="pwa-install-icon">
                S
              </div>

              {/* TITLE */}

              <h3>
                Add Skill Lab to Home Screen?
              </h3>

              {/* DESCRIPTION */}

              <p>
                Would you like to add Skill Lab
                to your home screen?
              </p>

              {/* BUTTONS */}

              <div className="pwa-install-actions">

                {/* NO */}

                <button
                  type="button"
                  className="pwa-no-btn"
                  onClick={handleInstallNo}
                >
                  No
                </button>

                {/* YES */}

                <button
                  type="button"
                  className="pwa-yes-btn"
                  onClick={handleInstallApp}
                >
                  Yes
                </button>

              </div>

            </div>

          </div>
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