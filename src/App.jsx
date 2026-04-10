import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/login/login.jsx";
import Dashboard  from "./pages/dasboard/Dashboard.jsx";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<Login />} />

      {/* ✅ MUST */}
      <Route path="/dashboard" element={<Dashboard />} />
    </Routes>
  );
}

export default App;