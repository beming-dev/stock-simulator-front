import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Login: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Username:", username, "Password:", password);
    navigate("/dashboard");
  };

  const handleGoogleLogin = () => {
    console.log("Google Login Clicked!");
    // Add Google login logic here
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-700 text-center mb-6">
          Welcome Back!
        </h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-600"
            >
              Username
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="Enter your username"
              required
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-600"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="Enter your password"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition duration-200"
          >
            Login
          </button>
        </form>
        <div className="mt-6">
          <button
            onClick={handleGoogleLogin}
            className="flex items-center justify-center w-full border border-gray-300 rounded-lg py-2 hover:bg-gray-100 transition duration-200"
          >
            <svg
              className="w-5 h-5 mr-2"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 48 48"
            >
              <path
                fill="#EA4335"
                d="M24 9.5c3.1 0 5.9 1.1 8.1 3.3l6-6C34.6 3.5 29.6 1.5 24 1.5 14.8 1.5 6.7 7.5 3.3 16l7.2 5.6c1.6-6.7 7.6-12.1 13.5-12.1z"
              />
              <path
                fill="#4285F4"
                d="M47.3 24.5c0-1.6-.2-3.1-.5-4.5H24v9h13.2c-.6 3.1-2.7 5.7-5.6 7.3l7.2 5.6c4.2-3.9 6.5-9.7 6.5-16z"
              />
              <path
                fill="#FBBC05"
                d="M10.5 29.1c-.5-1.6-.8-3.3-.8-5.1s.3-3.5.8-5.1l-7.2-5.6c-1.6 3.1-2.5 6.5-2.5 10.7s.9 7.6 2.5 10.7l7.2-5.6z"
              />
              <path
                fill="#34A853"
                d="M24 47.5c5.6 0 10.6-1.8 14.2-4.9l-7.2-5.6c-2 1.3-4.6 2.1-7 2.1-5.9 0-11-5.4-12.5-12.1l-7.2 5.6c3.4 8.4 11.5 14.4 20.2 14.4z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>
        </div>
        <div className="mt-4 text-center">
          <a href="#" className="text-sm text-blue-500 hover:underline">
            Forgot password?
          </a>
          <p className="text-sm mt-2">
            Don't have an account?{" "}
            <a href="#" className="text-blue-500 hover:underline">
              Sign up
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
