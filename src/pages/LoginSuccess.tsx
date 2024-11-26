import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const LoginSuccessPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const token = queryParams.get("token");

    if (token) {
      login(token);
      // Redirect to main page or dashboard
      navigate("/dashboard", { replace: true });
    } else {
      // If no token, redirect to login page
      console.error("No access token found");
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  return <div>Redirecting...</div>;
};

export default LoginSuccessPage;
