import { useEffect, useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import { requestNotificationPermission } from "../../firebase";
import "./login.css";

import { FaUser } from "react-icons/fa6";

function Login() {
  const navigate = useNavigate();

  // =====================================================
  // PWA INSTALL STATE
  // =====================================================

  const [installPrompt, setInstallPrompt] =
    useState(null);

  const [pwaReady, setPwaReady] =
    useState(false);

  const [isIOS, setIsIOS] =
    useState(false);

  const [isStandalone, setIsStandalone] =
    useState(false);

  // =====================================================
  // PWA / IOS DETECTION
  // =====================================================

  useEffect(() => {
    console.log(
      "PWA: Login component loaded"
    );

    // -------------------------------------------------
    // iPhone / iPad detection
    // -------------------------------------------------

    const ios =
      /iPhone|iPad|iPod/i.test(
        navigator.userAgent
      ) ||
      (
        navigator.platform === "MacIntel" &&
        navigator.maxTouchPoints > 1
      );

    setIsIOS(ios);

    console.log(
      "PWA: iOS device:",
      ios
    );

    // -------------------------------------------------
    // CHECK STANDALONE
    // -------------------------------------------------

    const standalone =
      window.matchMedia(
        "(display-mode: standalone)"
      ).matches ||
      window.navigator.standalone === true;

    setIsStandalone(standalone);

    console.log(
      "PWA: Standalone:",
      standalone
    );

    // -------------------------------------------------
    // IF ALREADY INSTALLED
    // -------------------------------------------------

    if (standalone) {
      console.log(
        "📱 Skill Lab is already installed"
      );

      setPwaReady(false);

      return;
    }

    // =================================================
    // ANDROID / CHROME INSTALL PROMPT
    // =================================================

    const handleBeforeInstallPrompt =
      (event) => {

        console.log(
          "🔥 BEFORE INSTALL PROMPT RECEIVED"
        );

        // Prevent automatic browser popup
        event.preventDefault();

        // Save globally
        window.__skillLabInstallPrompt =
          event;

        // Save React state
        setInstallPrompt(event);

        // Show install dialog
        setPwaReady(true);
      };

    window.addEventListener(
      "beforeinstallprompt",
      handleBeforeInstallPrompt
    );

    // =================================================
    // IOS
    // =================================================

    if (ios) {
      console.log(
        "🍎 iPhone detected"
      );

      /*
        iOS Safari does NOT provide
        beforeinstallprompt.

        Therefore we show our own
        instruction popup.
      */

      setPwaReady(true);
    }

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
  // ANDROID / CHROME INSTALL
  // =====================================================

  const handleInstallApp = async () => {

    console.log(
      "📱 User selected YES for Skill Lab installation"
    );

    // =================================================
    // IOS
    // =================================================

    if (isIOS) {

      console.log(
        "🍎 Showing iPhone Add to Home Screen instructions"
      );

      /*
        There is no programmatic install
        prompt on iPhone Safari.

        User must use:

        Share
          ↓
        Add to Home Screen
          ↓
        Open as Web App
          ↓
        Add
      */

      return;
    }

    // =================================================
    // ANDROID / CHROME
    // =================================================

    const prompt =
      installPrompt ||
      window.__skillLabInstallPrompt;

    if (!prompt) {

      console.log(
        "❌ NO INSTALL PROMPT AVAILABLE"
      );

      setPwaReady(false);

      return;
    }

    try {

      console.log(
        "🚀 Opening native Skill Lab install dialog..."
      );

      // Open Chrome install dialog
      await prompt.prompt();

      // Wait for user's choice
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

      // Prompt can only be used once
      setInstallPrompt(null);

      setPwaReady(false);

      window.__skillLabInstallPrompt =
        null;

    } catch (error) {

      console.error(
        "❌ Install error:",
        error
      );

      setPwaReady(false);
    }
  };

  // =====================================================
  // NO INSTALL
  // =====================================================

  const handleInstallNo = () => {

    console.log(
      "❌ User selected NO for Skill Lab installation"
    );

    setPwaReady(false);
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

      setIsStandalone(true);
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
      // SAVE SUBSCRIPTION IF AVAILABLE
      // =================================================

      if (data.subscription) {

        localStorage.setItem(
          "subscription",
          JSON.stringify(
            data.subscription
          )
        );

      }

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
      // TASK
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
            PWA INSTALL MESSAGE
        ================================================= */}

        {pwaReady &&
          !isStandalone && (

          <div className="pwa-install-overlay">

            <div className="pwa-install-box">

              {/* =================================================
                  IOS INSTRUCTIONS
              ================================================= */}

              {isIOS ? (

                <>

                  <div
                    className="pwa-ios-icon"
                  >
                    📱
                  </div>

                  <h3>
                    Add Skill Lab to Home Screen
                  </h3>

                  <p>
                    Install Skill Lab on your
                    iPhone for quick access like
                    an app.
                  </p>

                  <div
                    className="ios-install-steps"
                  >

                    <div>
                      <span>1</span>

                      <p>
                        Tap the{" "}
                        <strong>
                          Share
                        </strong>{" "}
                        button in Safari.
                      </p>
                    </div>

                    <div>
                      <span>2</span>

                      <p>
                        Select{" "}
                        <strong>
                          Add to Home Screen
                        </strong>.
                      </p>
                    </div>

                    <div>
                      <span>3</span>

                      <p>
                        Turn on{" "}
                        <strong>
                          Open as Web App
                        </strong>{" "}
                        and tap{" "}
                        <strong>
                          Add
                        </strong>.
                      </p>
                    </div>

                  </div>

                  <div
                    className="pwa-install-actions"
                  >

                    <button
                      type="button"
                      className="pwa-no-btn"
                      onClick={
                        handleInstallNo
                      }
                    >
                      Later
                    </button>

                    <button
                      type="button"
                      className="pwa-yes-btn"
                      onClick={() => {

                        alert(
                          "In Safari: tap Share → Add to Home Screen → turn on Open as Web App → Add."
                        );

                      }}
                    >
                      How to Install
                    </button>

                  </div>

                </>

              ) : (

                /* =================================================
                   ANDROID / CHROME
                ================================================= */

                <>

                  <div
                    className="pwa-ios-icon"
                  >
                    📱
                  </div>

                  <h3>
                    Add Skill Lab to Home Screen?
                  </h3>

                  <p>
                    Would you like to add
                    Skill Lab to your home screen?
                  </p>

                  <div
                    className="pwa-install-actions"
                  >

                    <button
                      type="button"
                      className="pwa-no-btn"
                      onClick={
                        handleInstallNo
                      }
                    >
                      No
                    </button>

                    <button
                      type="button"
                      className="pwa-yes-btn"
                      onClick={
                        handleInstallApp
                      }
                    >
                      Yes
                    </button>

                  </div>

                </>

              )}

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