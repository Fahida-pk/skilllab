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
      // 2. Ask notification permission
      // ==========================================
      let fcmToken = "";

      if ("Notification" in window) {
        const permission =
          await Notification.requestPermission();

        console.log("Notification permission:", permission);

        if (permission === "granted") {
          // ==========================================
          // 3. Get Firebase Messaging
          // ==========================================
          const messaging = await getMessagingInstance();

          if (messaging) {
            // ==========================================
            // 4. Get FCM Token
            // ==========================================
            fcmToken = await getToken(messaging, {
              vapidKey:
                "BANg8hVOS1rmbemDYS0cPbuhLOFSnClKfqVZL5itSLXlBhNEJsb0Rsu0nl2091wKP_ojb6dUIwOZfSx_KDNHzdU",
              serviceWorkerRegistration: registration,
            });

            console.log("FCM Token:", fcmToken);
          }
        }
      }

      // ==========================================
      // 5. Send Google token + FCM token to PHP
      // ==========================================
      const response = await fetch(
        "https://zyntaweb.com/skilllab/login.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token: googleToken,
            fcmToken: fcmToken,
          }),
        }
      );

      const data = await response.json();

      console.log("Backend Response:", data);

      // ==========================================
      // 6. Login success
      // ==========================================
      if (data.success) {
        localStorage.setItem(
          "user",
          JSON.stringify(data.user)
        );

        localStorage.setItem("token", googleToken);

        navigate("/dashboard");
      } else {
        alert(data.message);
      }

    } catch (error) {
      console.error("Login Error:", error);
      alert("Login failed");
    }
  };

  return (
    <div className="login-page">

      {/* BACKGROUND */}
      <div className="bg-blob"></div>

      {/* LOGIN CARD */}
      <div className="login-card">

        {/* PROFILE ICON */}
        <div className="profile-icon">
          <FaUser />
        </div>

        {/* TITLE */}
        <h1 className="title skill-lab-title">
          SKILL LAB
        </h1>

        <h1 className="title">
          Sign In
        </h1>

        <p className="subtitle">
          Continue with Google
        </p>

        {/* GOOGLE LOGIN */}
        <div className="google-btn">
          <GoogleLogin
            onSuccess={handleSuccess}
            onError={() => {
              console.log("Login Failed");
              alert("Google Login Failed");
            }}
            auto_select={false}
            useOneTap={false}
          />
        </div>

      </div>
    </div>
  );
}

export default Login;