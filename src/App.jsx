import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/login/login.jsx";


function App() {
  return (
    <Routes>

      {/* Default redirect */}
      <Route path="/" element={<Navigate to="/login" />} />

      {/* Login */}
      <Route path="/login" element={<Login />} />


    </Routes>
  );
}

export default App;