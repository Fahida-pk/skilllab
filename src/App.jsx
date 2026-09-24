import { Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/login/login.jsx";
import Dashboard from "./pages/dasboard/Dashboard.jsx";
import Task from "./pages/task/task.jsx";
import ProtectedRoute from "./ProtectedRoute.jsx";

import AdminLogin from "./pages/admin/AdminLogin.jsx";
import AdminDashboard from "./pages/admin/AdminDashboard.jsx";

import Parent from "./pages/parent/parent.jsx";

import ParentLogin from "./pages/parentdashboard/ParentLogin.jsx";
import ParentDashboard from "./pages/parentdashboard/Parentdashboard.jsx";


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
          NORMAL STUDENT ROUTES
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
          ADMIN MAIN DASHBOARD
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
          ADMIN → VIEW STUDENT DASHBOARD
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
          ADMIN → VIEW STUDENT TASKS
          READ ONLY
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
          PARENT LOGIN
      ================================================= */}

      <Route
        path="/parent/login"
        element={<ParentLogin />}
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