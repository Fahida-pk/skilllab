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
  // PWA INSTALL
  // =====================================================

  const [installPrompt, setInstallPrompt] =
    useState(null);

  const [pwaReady, setPwaReady] =
    useState(false);


  // =====================================================
  // GET INSTALL PROMPT
  // =====================================================

  useEffect(() => {

    console.log(
      "PWA: Login component loaded"
    );


    const handleBeforeInstallPrompt = (event) => {

      console.log(
        "🔥🔥 BEFORE INSTALL PROMPT RECEIVED 🔥🔥"
      );

      event.preventDefault();

      window.__skillLabInstallPrompt =
        event;

      setInstallPrompt(event);

      setPwaReady(true);

    };


    window.addEventListener(
      "beforeinstallprompt",
      handleBeforeInstallPrompt
    );


    // Check if already installed
    const isStandalone =
      window.matchMedia(
        "(display-mode: standalone)"
      ).matches ||
      window.navigator.standalone === true;


    if (isStandalone) {

      console.log(
        "📱 Skill Lab is already installed"
      );

    }


    return () => {

      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );

    };

  }, []);


  // =====================================================
  // INSTALL SKILL LAB
  // =====================================================

  const handleInstallApp = async () => {

    console.log(
      "📱 Install button clicked"
    );


    // Try saved global prompt
    const prompt =
      installPrompt ||
      window.__skillLabInstallPrompt;


    if (!prompt) {

      console.log(
        "❌ NO INSTALL PROMPT AVAILABLE"
      );


      alert(
        "Skill Lab install is not available yet. Please open this site in Chrome and refresh the page."
      );


      return;

    }


    try {

      console.log(
        "🚀 Opening native install dialog..."
      );


      await prompt.prompt();


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


      setInstallPrompt(null);

      setPwaReady(false);

      window.__skillLabInstallPrompt =
        null;

    } catch (error) {

      console.error(
        "❌ Install error:",
        error
      );

    }

  };


  // =====================================================
  // APP INSTALLED
  // =====================================================

  useEffect(() => {

    const handleAppInstalled = () => {

      console.log(
        "✅ Skill Lab installed successfully"
      );


      setInstallPrompt(null);

      setPwaReady(false);

      window.__skillLabInstallPrompt =
        null;

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

      const googleToken =
        res.credential;


      const response = await fetch(
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


      if (!response.ok) {

        throw new Error(
          `Server error: ${response.status}`
        );

      }


      const data =
        await response.json();


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

      navigate(
        "/dashboard",
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

      <div
        className="login-glow login-glow-blue"
      />

      <div
        className="login-glow login-glow-purple"
      />

      <div
        className="login-glow login-glow-pink"
      />


      <div className="login-card">

        <div className="card-shine" />


        {/* PROFILE */}

        <div className="profile-icon">

          <FaUser />

        </div>


        {/* BRAND */}

        <h1
          className="title skill-lab-title"
        >
          SKILL LAB
        </h1>


        {/* SIGN IN */}

        <h1 className="title">
          Sign In
        </h1>


        <p className="subtitle">
          Continue your learning journey
        </p>


        {/* GOOGLE */}

        <div className="google-btn">

          <GoogleLogin
            onSuccess={handleSuccess}
            onError={handleError}
            auto_select={false}
            useOneTap={false}
          />

        </div>


        {/* =================================================
            INSTALL BUTTON

            TEMPORARILY ALWAYS VISIBLE
            FOR TESTING
        ================================================= */}

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


        {/* STATUS */}

        <div
          style={{
            marginTop: "10px",
            fontSize: "11px",
            textAlign: "center",
            opacity: 0.6,
          }}
        >

          {pwaReady
            ? "Install available"
            : "Checking installation availability..."}

        </div>


        {/* FOOTER */}

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