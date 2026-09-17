import { Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/login/login.jsx";
import Dashboard from "./pages/dasboard/Dashboard.jsx";
import Task from "./pages/task/task.jsx";
import ProtectedRoute from "./ProtectedRoute.jsx";

// Admin
import AdminLogin from "./pages/admin/AdminLogin.jsx";


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
          PROTECTED STUDENT ROUTES
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
          UNKNOWN URL
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