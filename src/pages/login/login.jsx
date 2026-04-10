import { GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();

  const handleSuccess = async (res) => {
    try {
      const response = await fetch(
        "http://zyntaweb.com/skilllab/login.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token: res.credential,
          }),
        }
      );

      const data = await response.json();
      console.log(data);

      if (data.success) {
        // ✅ Save user
        localStorage.setItem("user", JSON.stringify(data.user));

        // ✅ Redirect
        navigate("/");
      } else {
        alert("Login failed");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h1>Skill Lab Login</h1>

      <GoogleLogin
        onSuccess={handleSuccess}
        onError={() => console.log("Login Failed")}
      />
    </div>
  );
}

export default Login;