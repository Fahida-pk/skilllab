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

  // =====================================================
  // GET PWA INSTALL PROMPT
  // =====================================================

  useEffect(() => {
    console.log("PWA: Login component loaded");

    // =================================================
    // CHECK IF APP IS ALREADY INSTALLED
    // =================================================

    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true;

    if (isStandalone) {
      console.log("📱 Skill Lab is already installed");
      return;
    }

    // =================================================
    // BEFORE INSTALL PROMPT
    // =================================================

    const handleBeforeInstallPrompt = (event) => {
      console.log("🔥 BEFORE INSTALL PROMPT RECEIVED");

      // Prevent Chrome automatic prompt
      event.preventDefault();

      // Save globally
      window.__skillLabInstallPrompt = event;

      // Save in React state
      setInstallPrompt(event);

      console.log("📱 Skill Lab install prompt saved");
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
  // APP INSTALLED
  // =====================================================

  useEffect(() => {
    const handleAppInstalled = () => {
      console.log("✅ Skill Lab installed successfully");

      // Mark as completed
      localStorage.setItem(
        "skillLabInstallAsked",
        "true"
      );

      // Clear prompt
      setInstallPrompt(null);
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
  // WAIT FOR PWA PROMPT
  // =====================================================

  const waitForInstallPrompt = () => {
    return new Promise((resolve) => {
      // Already available
      if (
        installPrompt ||
        window.__skillLabInstallPrompt
      ) {
        resolve(
          installPrompt ||
            window.__skillLabInstallPrompt
        );
        return;
      }

      let attempts = 0;

      const checkPrompt = setInterval(() => {
        attempts++;

        const prompt =
          window.__skillLabInstallPrompt;

        if (prompt) {
          clearInterval(checkPrompt);

          console.log(
            "✅ PWA prompt found after waiting"
          );

          resolve(prompt);
          return;
        }

        // Wait maximum 5 seconds
        if (attempts >= 25) {
          clearInterval(checkPrompt);

          console.log(
            "ℹ️ PWA install prompt not available"
          );

          resolve(null);
        }
      }, 200);
    });
  };

  // =====================================================
  // SHOW PWA INSTALL
  // =====================================================

  const handleInstallApp = async () => {
    console.log(
      "📱 Checking Skill Lab installation..."
    );

    // =================================================
    // CHECK IF ALREADY INSTALLED
    // =================================================

    const isStandalone =
      window.matchMedia("(display-mode: standalone)")
        .matches ||
      window.navigator.standalone === true;

    if (isStandalone) {
      console.log(
        "📱 Skill Lab already installed"
      );
      return;
    }

    // =================================================
    // CHECK IF ALREADY ASKED
    // =================================================

    const alreadyAsked =
      localStorage.getItem(
        "skillLabInstallAsked"
      );

    if (alreadyAsked === "true") {
      console.log(
        "📱 Install question already shown"
      );
      return;
    }

    // =================================================
    // WAIT FOR BROWSER INSTALL PROMPT
    // =================================================

    const prompt =
      await waitForInstallPrompt();

    if (!prompt) {
      console.log(
        "ℹ️ No PWA install prompt available"
      );
      return;
    }

    // =================================================
    // MARK AS ASKED
    // =================================================

    localStorage.setItem(
      "skillLabInstallAsked",
      "true"
    );

    try {
      console.log(
        "🚀 Opening Skill Lab install dialog..."
      );

      // =================================================
      // OPEN NATIVE INSTALL DIALOG
      // =================================================

      await prompt.prompt();

      // =================================================
      // WAIT FOR USER CHOICE
      // =================================================

      const result =
        await prompt.userChoice;

      console.log(
        "PWA install result:",
        result.outcome
      );

      if (
        result.outcome === "accepted"
      ) {
        console.log(
          "✅ Skill Lab installation accepted"
        );
      } else {
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

      const data = await response.json();

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
      // PWA INSTALL
      //
      // LOGIN SUCCESS AFTER THAT
      // ONE TIME ONLY
      // =================================================

      await handleInstallApp();

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