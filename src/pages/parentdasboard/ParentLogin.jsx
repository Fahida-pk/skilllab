import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  FaUser,
  FaLock,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";

import { FaArrowRightToBracket } from "react-icons/fa6";

import "./parent-login.css";


function ParentLogin() {

  const navigate = useNavigate();


  /* =========================================
     STATES
  ========================================= */

  const [username, setUsername] = useState("");

  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");


  /* =========================================
     CLEAR FIELDS
  ========================================= */

  useEffect(() => {

    const clearLoginFields = () => {

      setUsername("");

      setPassword("");

      setError("");

      setShowPassword(false);

    };


    clearLoginFields();


    window.addEventListener(
      "pageshow",
      clearLoginFields
    );


    return () => {

      window.removeEventListener(
        "pageshow",
        clearLoginFields
      );

    };

  }, []);


  /* =========================================
     LOGIN
  ========================================= */

  const handleLogin = async (e) => {

    e.preventDefault();

    setError("");


    /* =========================================
       VALIDATION
    ========================================= */

    if (
      !username.trim() ||
      !password
    ) {

      setError(
        "Please enter your username and password."
      );

      return;
    }


    try {

      setLoading(true);


      /* =========================================
         API
      ========================================= */

      const response = await fetch(
        "https://zyntaweb.com/skilllab/parent-login.php",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({

            username:
              username.trim(),

            password:
              password,

          }),
        }
      );


      const data =
        await response.json();


      console.log(
        "Parent Login Response:",
        data
      );


      /* =========================================
         SUCCESS
      ========================================= */

      if (data.success) {


        /* SAVE PARENT */

        localStorage.setItem(
          "parent",
          JSON.stringify(
            data.parent
          )
        );


        /* LOGIN STATUS */

        localStorage.setItem(
          "parentLoggedIn",
          "true"
        );


        /* SAVE ASSIGNED STUDENTS */

        localStorage.setItem(
          "parentStudents",
          JSON.stringify(
            data.students || []
          )
        );


        /* CLEAR */

        setUsername("");

        setPassword("");

        setError("");


        /* DASHBOARD */

        navigate(
          "/ParentDashboard",
          {
            replace: true,
          }
        );

      }


      /* =========================================
         LOGIN FAILED
      ========================================= */

      else {

        setError(
          data.message ||
          "Invalid username or password."
        );

      }


    } catch (error) {

      console.error(
        "Parent Login Error:",
        error
      );


      setError(
        "Unable to connect to server. Please try again."
      );

    } finally {

      setLoading(false);

    }

  };


  /* =========================================
     UI
  ========================================= */

  return (

    <div className="parent-login-page">


      {/* =====================================
          BACKGROUND
      ====================================== */}

      <div className="parent-glow parent-glow-one"></div>

      <div className="parent-glow parent-glow-two"></div>

      <div className="parent-glow parent-glow-three"></div>


      <div className="parent-orb parent-orb-one"></div>

      <div className="parent-orb parent-orb-two"></div>

      <div className="parent-orb parent-orb-three"></div>


      <div className="parent-grid"></div>


      {/* =====================================
          LOGIN CARD
      ====================================== */}

      <div className="parent-login-card">


        <div className="parent-glass-highlight"></div>


        {/* =====================================
            BRAND
        ====================================== */}

        <div className="parent-brand">

          <h1>
            SKILL LAB
          </h1>

        </div>


        {/* =====================================
            HEADING
        ====================================== */}

        <div className="parent-heading">

          <h1>
            Welcome
          </h1>

          <p>
            Sign in to monitor your child's performance
          </p>

        </div>


        {/* =====================================
            FORM
        ====================================== */}

        <form
          className="parent-login-form"
          onSubmit={handleLogin}
          autoComplete="off"
        >


          {/* ===================================
              USERNAME
          ==================================== */}

          <div className="parent-field">

            <label>
              Username
            </label>


            <div className="parent-input-wrapper">


              <FaUser
                className="parent-input-icon"
              />


              <input
                type="text"
                name="parent-username"
                placeholder="Enter your username"
                value={username}
                onChange={(e) =>
                  setUsername(
                    e.target.value
                  )
                }
                autoComplete="off"
                spellCheck="false"
              />


            </div>

          </div>


          {/* ===================================
              PASSWORD
          ==================================== */}

          <div className="parent-field">

            <label>
              Password
            </label>


            <div className="parent-input-wrapper">


              <FaLock
                className="parent-input-icon"
              />


              <input
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                name="parent-password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) =>
                  setPassword(
                    e.target.value
                  )
                }
                autoComplete="new-password"
              />


              {/* SHOW PASSWORD */}

              <button
                type="button"
                className="parent-show-password"
                onClick={() =>
                  setShowPassword(
                    !showPassword
                  )
                }
                aria-label={
                  showPassword
                    ? "Hide password"
                    : "Show password"
                }
              >

                {showPassword ? (

                  <FaEyeSlash />

                ) : (

                  <FaEye />

                )}

              </button>


            </div>

          </div>


          {/* ===================================
              ERROR
          ==================================== */}

          {error && (

            <div className="parent-error">

              <span className="parent-error-icon">
                !
              </span>

              <span>
                {error}
              </span>

            </div>

          )}


          {/* ===================================
              LOGIN BUTTON
          ==================================== */}

          <button
            type="submit"
            className="parent-login-button"
            disabled={loading}
          >

            {loading ? (

              <>

                <span className="parent-spinner"></span>

                <span>
                  Signing in...
                </span>

              </>

            ) : (

              <>

                <FaArrowRightToBracket />

                <span>
                  Login
                </span>

              </>

            )}

          </button>


        </form>


      </div>

    </div>

  );

}


export default ParentLogin;