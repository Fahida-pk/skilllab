import { Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/login/login.jsx";
import Dashboard from "./pages/dasboard/Dashboard.jsx";
import Task from "./pages/task/task.jsx";

// Admin
import AdminLogin from "./pages/admin/AdminLogin.jsx";

function App() {
  return (
    <Routes>

      {/* ==============================
          DEFAULT
      ============================== */}
      <Route
        path="/"
        element={<Navigate to="/login" />}
      />


      {/* ==============================
          STUDENT
      ============================== */}
      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        path="/dashboard"
        element={<Dashboard />}
      />

      <Route
        path="/task"
        element={<Task />}
      />


      {/* ==============================
          ADMIN
      ============================== */}
      <Route
        path="/admin/login"
        element={<AdminLogin />}
      />

    </Routes>
  );
}

export default App;