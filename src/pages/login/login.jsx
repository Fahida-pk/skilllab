import { GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import { getToken } from "firebase/messaging";
import { getMessagingInstance } from "../../firebase";
import "./login.css";

import { FaUser } from "react-icons/fa";

function Login() {
  const navigate = useNavigate();

  const handleSuccess = async (res) => {
    try {
      const googleToken = res.credential;

      console.log("Google Login Success");

      // ==========================================
      // 1. Register Firebase Service Worker
      // ==========================================
      const registration =
        await navigator.serviceWorker.register(
          "/firebase-messaging-sw.js"
        );

      console.log("Service Worker registered");

      // ==========================================
      // 2. Notification Permission
      // ==========================================
      let fcmToken = "";

      if ("Notification" in window) {
        const permission =
          await Notification.requestPermission();

        console.log(
          "Notification permission:",
          permission
        );

        if (permission === "granted") {
          // ==========================================
          // 3. Firebase Messaging
          // ==========================================
          const messaging =
            await getMessagingInstance();

          if (messaging) {
            // ==========================================
            // 4. Get FCM Token
            // ==========================================
            fcmToken = await getToken(
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
          }
        }
      }

      // ==========================================
      // 5. Send Google + FCM Token to PHP
      // ==========================================
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
        "Backend Response:",
        data
      );

      // ==========================================
      // 6. Login Success
      // ==========================================
      if (data.success) {
        localStorage.setItem(
          "user",
          JSON.stringify(data.user)
        );

        localStorage.setItem(
          "token",
          googleToken
        );

        navigate("/dashboard");
      } else {
        alert(
          data.message ||
          "Login failed"
        );
      }

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

            onError={() => {
              console.log(
                "Login Failed"
              );

              alert(
                "Google Login Failed"
              );
            }}

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