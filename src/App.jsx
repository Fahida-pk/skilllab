import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/login/Login";
import Dashboard from "./pages/dashboard/Dashboard";
import Task from "./pages/task/task";
import Sidebar from "./pages/dashboard/Sidebar";

function App() {
  return (
    <BrowserRouter>

      <Routes>

        {/* LOGIN */}
        <Route
          path="/login"
          element={<Login />}
        />

        {/* SIDEBAR */}
        <Route
          path="/sidebar"
          element={<Sidebar />}
        />

        {/* DASHBOARD */}
        <Route
          path="/dashboard"
          element={<Dashboard />}
        />

        {/* TASKS */}
        <Route
          path="/task"
          element={<Task />}
        />

      </Routes>

    </BrowserRouter>
  );
}

export default App;