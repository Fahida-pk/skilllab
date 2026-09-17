import { GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import { getToken } from "firebase/messaging";
import { getMessagingInstance } from "../../firebase";
import "./login.css";

import {
  FaUser,
  FaBookOpen,
  FaGraduationCap,
  FaStar,
} from "react-icons/fa";


function Login() {

  const navigate = useNavigate();


  /* =========================================================
     GOOGLE LOGIN
  ========================================================= */

  const handleSuccess = async (res) => {

    try {

      const googleToken = res.credential;

      console.log("Google Login Success");


      /* =====================================================
         1. REGISTER FIREBASE SERVICE WORKER
      ===================================================== */

      const registration =
        await navigator.serviceWorker.register(
          "/firebase-messaging-sw.js"
        );

      console.log("Service Worker registered");


      /* =====================================================
         2. NOTIFICATION PERMISSION
      ===================================================== */

      let fcmToken = "";


      if ("Notification" in window) {

        const permission =
          await Notification.requestPermission();

        console.log(
          "Notification permission:",
          permission
        );


        /* ===================================================
           3. FIREBASE MESSAGING
        =================================================== */

        if (permission === "granted") {

          const messaging =
            await getMessagingInstance();


          if (messaging) {

            /* ===============================================
               4. GET FCM TOKEN
            =============================================== */

            fcmToken =
              await getToken(
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


      /* =====================================================
         5. SEND LOGIN TO PHP
      ===================================================== */

      const response =
        await fetch(
          "https://zyntaweb.com/skilllab/login.php",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
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


      /* =====================================================
         6. LOGIN SUCCESS
      ===================================================== */

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
          data.message
        );

      }


    } catch (error) {

      console.error(
        "Login Error:",
        error
      );

      alert(
        "Login failed"
      );

    }

  };


  /* =========================================================
     UI
  ========================================================= */

  return (

    <div className="login-page">


      {/* =====================================================
          BACKGROUND GLOW
      ===================================================== */}

      <div className="login-bg-orb orb-blue"></div>

      <div className="login-bg-orb orb-purple"></div>

      <div className="login-bg-orb orb-pink"></div>


      {/* =====================================================
          SOFT LIGHT
      ===================================================== */}

      <div className="background-light light-one"></div>

      <div className="background-light light-two"></div>


      {/* =====================================================
          FLOATING STUDENT ELEMENTS
      ===================================================== */}

      <div className="student-decoration student-one">

        <div className="student-icon-circle">
          <FaGraduationCap />
        </div>

      </div>


      <div className="student-decoration student-two">

        <div className="student-icon-circle">
          <FaBookOpen />
        </div>

      </div>


      {/* =====================================================
          FLOATING STAR
      ===================================================== */}

      <div className="floating-star star-one">
        <FaStar />
      </div>


      <div className="floating-star star-two">
        <FaStar />
      </div>


      {/* =====================================================
          FLOATING DOTS
      ===================================================== */}

      <span className="floating-dot dot-one"></span>

      <span className="floating-dot dot-two"></span>

      <span className="floating-dot dot-three"></span>


      {/* =====================================================
          LOGIN CARD
      ===================================================== */}

      <div className="login-card">


        {/* ===================================================
            GLASS SHINE
        =================================================== */}

        <div className="card-shine"></div>


        {/* ===================================================
            PROFILE ICON
        =================================================== */}

        <div className="profile-icon">

          <FaUser />

        </div>


        {/* ===================================================
            BRAND
        =================================================== */}

        <h1 className="title skill-lab-title">

          SKILL LAB

        </h1>


        {/* ===================================================
            SIGN IN
        =================================================== */}

        <h1 className="title login-title">

          Sign In

        </h1>


        {/* ===================================================
            SUBTITLE
        =================================================== */}

        <p className="subtitle">

          Continue your learning journey

        </p>


        {/* ===================================================
            GOOGLE LOGIN
        =================================================== */}

        <div className="google-btn">

          <GoogleLogin

            onSuccess={
              handleSuccess
            }

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


        {/* ===================================================
            BOTTOM TEXT
        =================================================== */}

        <div className="login-bottom-text">

          <span className="bottom-line"></span>

          <span>
            Learn • Practice • Grow
          </span>

          <span className="bottom-line"></span>

        </div>


      </div>

    </div>

  );

}


export default Login;