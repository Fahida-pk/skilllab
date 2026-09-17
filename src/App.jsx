import { Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/login/login.jsx";
import Dashboard from "./pages/dasboard/Dashboard.jsx";
import Task from "./pages/task/task.jsx";
import ProtectedRoute from "./ProtectedRoute.jsx";

import AdminLogin from "./pages/admin/AdminLogin.jsx";
import AdminDashboard from "./pages/admin/AdminDashboard.jsx";


/* =========================================
   ADMIN PROTECTED ROUTE
========================================= */

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


/* =========================================
   APP
========================================= */

function App() {

  return (

    <Routes>

      {/* =========================================
          DEFAULT
      ========================================= */}

      <Route
        path="/"
        element={
          <Navigate
            to="/login"
            replace
          />
        }
      />


      {/* =========================================
          STUDENT LOGIN
      ========================================= */}

      <Route
        path="/login"
        element={<Login />}
      />


      {/* =========================================
          STUDENT PROTECTED PAGES
      ========================================= */}

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


      {/* =========================================
          ADMIN LOGIN
      ========================================= */}

      <Route
        path="/admin/login"
        element={<AdminLogin />}
      />


      {/* =========================================
          ADMIN DASHBOARD
      ========================================= */}

      <Route
        path="/AdminDashboard"
        element={
          <AdminProtectedRoute>
            <AdminDashboard />
          </AdminProtectedRoute>
        }
      />


      {/* =========================================
          ADMIN DASHBOARD ALTERNATIVE ROUTE
          /admin/dashboard
      ========================================= */}

      <Route
        path="/admin/dashboard"
        element={
          <Navigate
            to="/AdminDashboard"
            replace
          />
        }
      />


      {/* =========================================
          ADMIN STUDENTS
      ========================================= */}

      <Route
        path="/admin/students"
        element={
          <AdminProtectedRoute>
            <AdminDashboard />
          </AdminProtectedRoute>
        }
      />


      {/* =========================================
          INVALID URL
      ========================================= */}

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