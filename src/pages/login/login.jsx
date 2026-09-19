import { GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import { getToken } from "firebase/messaging";
import { getMessagingInstance } from "../../firebase";
import "./login.css";

import { FaUser } from "react-icons/fa";

function Login() {
  const navigate = useNavigate();

  // =====================================================
  // FCM REGISTRATION
  // Runs AFTER login/dashboard navigation
  // =====================================================
  const registerFCM = async (googleToken) => {
    try {
      // =================================================
      // 1. Register Firebase Service Worker
      // =================================================
      const registration =
        await navigator.serviceWorker.register(
          "/firebase-messaging-sw.js"
        );

      console.log(
        "Service Worker registered"
      );

      // =================================================
      // 2. Check Notification Support
      // =================================================
      if (!("Notification" in window)) {
        console.log(
          "Notifications are not supported"
        );
        return;
      }

      // =================================================
      // 3. Notification Permission
      // =================================================
      const permission =
        await Notification.requestPermission();

      console.log(
        "Notification permission:",
        permission
      );

      if (permission !== "granted") {
        console.log(
          "Notification permission not granted"
        );
        return;
      }

      // =================================================
      // 4. Firebase Messaging
      // =================================================
      const messaging =
        await getMessagingInstance();

      if (!messaging) {
        console.log(
          "Firebase Messaging unavailable"
        );
        return;
      }

      // =================================================
      // 5. Get FCM Token
      // =================================================
      const fcmToken = await getToken(
        messaging,
        {
          vapidKey:
            "BANg8hVOS1rmbemDYS0cPbuhLOFSnClKfqVZL5itSLXlBhNEJsb0Rsu0nl2091wKP_ojb6dUIwOZfSx_KDNHzdU",

          serviceWorkerRegistration:
            registration,
        }
      );

      console.log(
        "FCM Token:",
        fcmToken
      );

      // =================================================
      // 6. Save FCM Token
      // =================================================
      if (fcmToken) {
        try {
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
                fcmToken: fcmToken,
              }),
            }
          );

          const data =
            await response.json();

          console.log(
            "FCM Token Save Response:",
            data
          );
        } catch (error) {
          console.error(
            "FCM token save failed:",
            error
          );
        }
      }
    } catch (error) {
      // =================================================
      // IMPORTANT:
      // FCM ERROR SHOULD NOT AFFECT LOGIN
      // =================================================
      console.error(
        "FCM registration error:",
        error
      );
    }
  };

  // =====================================================
  // GOOGLE LOGIN SUCCESS
  // =====================================================
  const handleSuccess = async (res) => {
    try {
      const googleToken =
        res.credential;

      console.log(
        "Google Login Success"
      );

      // =================================================
      // 1. LOGIN PHP FIRST
      // Don't wait for FCM
      // =================================================
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

      // =================================================
      // Check HTTP response
      // =================================================
      if (!response.ok) {
        throw new Error(
          `Server error: ${response.status}`
        );
      }

      const data =
        await response.json();

      console.log(
        "Backend Response:",
        data
      );

      // =================================================
      // 2. LOGIN FAILED
      // =================================================
      if (!data.success) {
        alert(
          data.message ||
          "Login failed"
        );

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

      // =================================================
      // 4. GO TO DASHBOARD IMMEDIATELY
      // =================================================
      navigate("/dashboard", {
        replace: true,
      });

      // =================================================
      // 5. FCM AFTER LOGIN
      // =================================================
      // Do NOT await this.
      // Dashboard opens immediately.
      registerFCM(googleToken);

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