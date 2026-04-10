import { GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();

  const handleSuccess = async (res) => {
    try {
      const token = res.credential;

      if (!token) {
        alert("No token received");
        return;
      }

      const response = await fetch(
        "https://zyntaweb.com/skilllab/login.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token }),
        }
      );

      const data = await response.json();
      console.log("API Response:", data);

      if (data.success) {
        localStorage.setItem("user", JSON.stringify(data.user));
        alert("Login success ✅");
        navigate("/");
      } else {
        alert(data.message || "Login failed ❌");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Something went wrong");
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h1>Skill Lab Login</h1>

      <GoogleLogin
        onSuccess={handleSuccess}
        onError={() => alert("Google Login Failed")}
      />
    </div>
  );
}

export default Login;