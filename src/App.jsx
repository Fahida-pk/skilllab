import {
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Login from "./pages/login/login.jsx";
import Dashboard from "./pages/dasboard/Dashboard.jsx";
import Task from "./pages/task/task.jsx";
import ProtectedRoute from "./ProtectedRoute.jsx";

import AdminLogin from "./pages/admin/AdminLogin.jsx";
import AdminDashboard from "./pages/admin/AdminDashboard.jsx";

import Parent from "./pages/parent/parent.jsx";

import ParentLogin
  from "./pages/parentdasboard/ParentLogin.jsx";
import AdminPaymentHistory
  from "./pages/admin/AdminPaymentHistory.jsx";
import ParentDashboard
  from "./pages/parentdasboard/Parentdashboard.jsx";
import Plan from "./pages/admin/Plan.jsx";
/* =====================================================
   STUDENT PAYMENT
===================================================== */

import Subscription
  from "./pages/payment/subscription.jsx";

import Payment
  from "./pages/payment/payment.jsx";

import PaymentHistory
  from "./pages/PaymentHistory/PaymentHistory.jsx";

/* =====================================================
   PARENT PAYMENT

   Create this file:
   pages/parentpayment/ParentSubscription.jsx
===================================================== */

import ParentSubscription
  from "./pages/parentpayment/ParentSubscription.jsx";


/* =====================================================
   ADMIN PROTECTED ROUTE
===================================================== */

function AdminProtectedRoute({ children }) {

  const adminLoggedIn =
    localStorage.getItem("adminLoggedIn");

  const admin =
    localStorage.getItem("admin");

  if (
    adminLoggedIn !== "true" ||
    !admin
  ) {
    return (
      <Navigate
        to="/admin/login"
        replace
      />
    );
  }

  return children;
}


/* =====================================================
   PARENT PROTECTED ROUTE
===================================================== */

function ParentProtectedRoute({ children }) {

  const parentLoggedIn =
    localStorage.getItem("parentLoggedIn");

  const parent =
    localStorage.getItem("parent");

  if (
    parentLoggedIn !== "true" ||
    !parent
  ) {
    return (
      <Navigate
        to="/parent/login"
        replace
      />
    );
  }

  return children;
}


/* =====================================================
   APP
===================================================== */

function App() {

  return (
    <Routes>

      {/* =================================================
          DEFAULT
      ================================================= */}

      <Route
        path="/"
        element={
          <Navigate
            to="/login"
            replace
          />
        }
      />


      {/* =================================================
          STUDENT LOGIN
      ================================================= */}

      <Route
        path="/login"
        element={<Login />}
      />


      {/* =================================================
          STUDENT SUBSCRIPTION

          Student subscription only.

          user_id is used here.
      ================================================= */}

      <Route
        path="/subscription"
        element={<Subscription />}
      />


      {/* =================================================
          STUDENT PAYMENT HISTORY
      ================================================= */}

      <Route
        path="/payment-history"
        element={<PaymentHistory />}
      />
{/* =================================================
    ADMIN → PLANS
================================================= */}

<Route
  path="/admin/plans"
  element={
    <AdminProtectedRoute>
      <Plan />
    </AdminProtectedRoute>
  }
/>

      {/* =================================================
          STUDENT ACTIVE SUBSCRIPTION REQUIRED

          Dashboard + Task
      ================================================= */}

      <Route element={<ProtectedRoute />}>

        <Route
          path="/dashboard"
          element={<Dashboard />}
        />

        <Route
          path="/task"
          element={<Task />}
        />

      </Route>


      {/* =================================================
          ADMIN LOGIN
      ================================================= */}

      <Route
        path="/admin/login"
        element={<AdminLogin />}
      />


      {/* =================================================
          ADMIN DASHBOARD
      ================================================= */}

      <Route
        path="/AdminDashboard"
        element={
          <AdminProtectedRoute>
            <AdminDashboard />
          </AdminProtectedRoute>
        }
      />


      {/* =================================================
          ADMIN STUDENTS
      ================================================= */}

      <Route
        path="/admin/students"
        element={
          <AdminProtectedRoute>
            <AdminDashboard />
          </AdminProtectedRoute>
        }
      />


      {/* =================================================
          ADMIN → STUDENT DASHBOARD
      ================================================= */}

      <Route
        path="/admin/students/:id/dashboard"
        element={
          <AdminProtectedRoute>
            <Dashboard adminView={true} />
          </AdminProtectedRoute>
        }
      />


      {/* =================================================
          ADMIN → STUDENT TASKS
      ================================================= */}

      <Route
        path="/admin/students/:id/tasks"
        element={
          <AdminProtectedRoute>
            <Task adminView={true} />
          </AdminProtectedRoute>
        }
      />


      {/* =================================================
          ADMIN → PARENTS
      ================================================= */}

      <Route
        path="/admin/parents"
        element={
          <AdminProtectedRoute>
            <Parent />
          </AdminProtectedRoute>
        }
      />


      {/* =================================================
          ADMIN → PAYMENT GATEWAY
      ================================================= */}

      <Route
        path="/admin/payment"
        element={
          <AdminProtectedRoute>
            <Payment />
          </AdminProtectedRoute>
        }
      />


      {/* =================================================
          PARENT LOGIN
      ================================================= */}

      <Route
        path="/parent/login"
        element={<ParentLogin />}
      />


      {/* =================================================
          PARENT SUBSCRIPTION

          IMPORTANT:

          Parent pays ONE subscription.

          parent_id is used here.

          Example:
          parent_id = 4

          This subscription covers all students
          assigned to parent 4.
      ================================================= */}

      <Route
        path="/parent/subscription"
        element={
          <ParentProtectedRoute>
            <ParentSubscription />
          </ParentProtectedRoute>
        }
      />

{/* =================================================
    ADMIN → PAYMENT HISTORY
================================================= */}

<Route
  path="/AdminPaymentHistory"
  element={
    <AdminProtectedRoute>
      <AdminPaymentHistory />
    </AdminProtectedRoute>
  }
/>

{/* =================================================
    PARENT DASHBOARD
================================================= */}

<Route
  path="/parent/dashboard"
  element={
    <ParentProtectedRoute>
      <ParentDashboard />
    </ParentProtectedRoute>
        }
      />


      {/* =================================================
          PARENT → VIEW STUDENT DASHBOARD
      ================================================= */}

      <Route
        path="/parent/students/:id/dashboard"
        element={
          <ParentProtectedRoute>
            <Dashboard parentView={true} />
          </ParentProtectedRoute>
        }
      />


      {/* =================================================
          PARENT → VIEW STUDENT TASKS
      ================================================= */}

      <Route
        path="/parent/students/:id/tasks"
        element={
          <ParentProtectedRoute>
            <Task parentView={true} />
          </ParentProtectedRoute>
        }
      />


      {/* =================================================
          INVALID URL
      ================================================= */}

      <Route
        path="*"
        element={
          <Navigate
            to="/login"
            replace
          />
        }
      />

    </Routes>
  );
}


export default App;