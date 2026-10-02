import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";

const SUBSCRIPTION_API =
  "https://zyntaweb.com/skilllab/student-subscription.php";

function ProtectedRoute() {
  const [checking, setChecking] = useState(true);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const checkAccess = async () => {
      try {
        // ---------------------------------------------
        // LOGIN CHECK
        // ---------------------------------------------
        const token = localStorage.getItem("token");
        const userString = localStorage.getItem("user");

        if (!token || !userString) {
          setAllowed(false);
          setChecking(false);
          return;
        }

        // ---------------------------------------------
        // GET USER
        // ---------------------------------------------
        let user;

        try {
          user = JSON.parse(userString);
        } catch (error) {
          console.error("Invalid user data:", error);
          setAllowed(false);
          setChecking(false);
          return;
        }

        const userId = Number(
          user?.id ??
          user?.user_id ??
          user?.userId ??
          0
        );

        if (userId <= 0) {
          console.error("Invalid user ID");
          setAllowed(false);
          setChecking(false);
          return;
        }

        // ---------------------------------------------
        // CHECK SUBSCRIPTION
        // ---------------------------------------------
        const response = await fetch(
          `${SUBSCRIPTION_API}?user_id=${encodeURIComponent(userId)}`,
          {
            method: "GET",
            headers: {
              Accept: "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error(
            `Subscription API error: ${response.status}`
          );
        }

        const data = await response.json();

        console.log("PROTECTED ROUTE SUBSCRIPTION:", data);

        // ---------------------------------------------
        // NO SUBSCRIPTION
        // ---------------------------------------------
        if (
          !data.success ||
          !data.has_subscription ||
          !data.subscription
        ) {
          setAllowed(false);
          setChecking(false);
          return;
        }

        // ---------------------------------------------
        // SUBSCRIPTION STATUS
        // ---------------------------------------------
        const status = String(
          data.subscription.status || ""
        ).toLowerCase();

        // ---------------------------------------------
        // ONLY ACTIVE SUBSCRIPTION ALLOWED
        // ---------------------------------------------
        if (status === "active") {
          setAllowed(true);
        } else {
          setAllowed(false);
        }

        setChecking(false);

      } catch (error) {
        console.error(
          "Subscription access check failed:",
          error
        );

        // Fail closed:
        // If subscription cannot be verified,
        // don't allow dashboard/task access.
        setAllowed(false);
        setChecking(false);
      }
    };

    checkAccess();
  }, []);

  // ---------------------------------------------
  // CHECKING
  // ---------------------------------------------
  if (checking) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: "10px",
          fontFamily: "Arial, sans-serif",
          background: "#f7f8fc",
        }}
      >
        <div
          style={{
            width: "38px",
            height: "38px",
            border: "4px solid #e9d5ff",
            borderTop: "4px solid #7c3aed",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
          }}
        />

        <p
          style={{
            margin: 0,
            color: "#6d28d9",
            fontWeight: 600,
          }}
        >
          Checking subscription...
        </p>

        <style>
          {`
            @keyframes spin {
              to {
                transform: rotate(360deg);
              }
            }
          `}
        </style>
      </div>
    );
  }

  // ---------------------------------------------
  // NOT LOGGED IN
  // ---------------------------------------------
  const token = localStorage.getItem("token");

  if (!token) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  // ---------------------------------------------
  // SUBSCRIPTION EXPIRED / INVALID
  // ---------------------------------------------
  if (!allowed) {
    return (
      <Navigate
        to="/subscription"
        replace
      />
    );
  }

  // ---------------------------------------------
  // ACTIVE SUBSCRIPTION
  // ---------------------------------------------
  return <Outlet />;
}

export default ProtectedRoute;