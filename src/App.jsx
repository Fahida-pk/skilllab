import { Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/login/login.jsx";
import Dashboard from "./pages/dasboard/Dashboard.jsx";
import Task from "./pages/task/task.jsx";
import ProtectedRoute from "./ProtectedRoute.jsx";

import AdminLogin from "./pages/admin/AdminLogin.jsx";
import AdminDashboard from "./pages/admin/AdminDashboard.jsx";

import Parent from "./pages/parent/parent.jsx";


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