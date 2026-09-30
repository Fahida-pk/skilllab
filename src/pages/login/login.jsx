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
  // STORE IT FOR LOGIN
  // =====================================================

  useEffect(() => {
    console.log("PWA: Login component loaded");

    // =================================================
    // CHECK IF APP IS ALREADY INSTALLED
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

      return;
    }

    // =================================================
    // CHECK IF INSTALL QUESTION WAS ALREADY SHOWN
    // =================================================

    const alreadyAsked =
      localStorage.getItem(
        "skillLabInstallAsked"
      );

    if (alreadyAsked === "true") {
      console.log(
        "📱 Skill Lab install question already shown"
      );

      return;
    }

    // =================================================
    // BEFORE INSTALL PROMPT
    // =================================================

    const handleBeforeInstallPrompt = (event) => {
      console.log(
        "🔥 BEFORE INSTALL PROMPT RECEIVED"
      );

      // -----------------------------------------------
      // Prevent browser automatic prompt
      // -----------------------------------------------

      event.preventDefault();

      // -----------------------------------------------
      // Save prompt
      // -----------------------------------------------

      window.__skillLabInstallPrompt = event;

      setInstallPrompt(event);

      console.log(
        "📱 Skill Lab install prompt saved"
      );
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
      console.log(
        "✅ Skill Lab installed successfully"
      );

      // -----------------------------------------------
      // Mark install question as already handled
      // -----------------------------------------------

      localStorage.setItem(
        "skillLabInstallAsked",
        "true"
      );

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
  // SHOW PWA INSTALL
  // ONLY ONE TIME
  // =====================================================

  const handleInstallApp = async () => {
    console.log(
      "📱 Checking Skill Lab installation..."
    );

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
    // GET SAVED INSTALL PROMPT
    // =================================================

    const prompt =
      installPrompt ||
      window.__skillLabInstallPrompt;

    if (!prompt) {
      console.log(
        "ℹ️ No PWA install prompt available"
      );

      return;
    }

    // =================================================
    // IMPORTANT
    // MARK AS ASKED BEFORE SHOWING PROMPT
    //
    // This prevents the prompt from appearing again
    // on the next login.
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
      // OPEN BROWSER NATIVE INSTALL DIALOG
      //
      // This is the ONLY Yes button the user will see.
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
      const googleToken =
        res.credential;

      // =================================================
      // LOGIN API
      // =================================================

      const response =
        await fetch(
          "https://zyntaweb.com/skilllab/login.php",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
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
      // PWA INSTALL
      //
      // Login success ആയതിന് ശേഷം മാത്രം
      // ONE TIME install dialog കാണിക്കും.
      // =================================================

      await handleInstallApp();

      // =================================================
      // DASHBOARD
      // =================================================

      navigate(
        "/task",
        {
          replace: true,
        }
      );
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