import { GoogleLogin } from "@react-oauth/google";
import "./login.css";

function Login() {
  return (
    <div className="login-page">
      <div className="login-box">
        <h1>📚 Student To-Do</h1>
        <p>Organize your tasks. Stay productive.</p>

        <div className="google-login">
          <GoogleLogin
            onSuccess={(res) => console.log(res)}
            onError={() => console.log("Login Failed")}
          />
        </div>
      </div>
    </div>
  );
}

export default Login;