import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const res = await axios.post("/api/auth/login", {
        username,
        password,
      });
      console.log(res.data);

      // Store user data in localStorage
      if (res.data.user && res.data.user.userId) {
        console.log("Storing user data:", res.data.user);
        localStorage.setItem("userId", res.data.user.userId);
        localStorage.setItem("username", res.data.user.username);
        localStorage.setItem("token", "authenticated");
        console.log("Stored userId:", localStorage.getItem("userId"));
        console.log("Stored username:", localStorage.getItem("username"));
      } else {
        console.error("User data not found in response:", res.data);
      }

      // Use success message from backend response
      setSuccess(res.data.message || res.data.success || "Login successful!");

      // Navigate to dashboard after successful login
      console.log("Navigating to dashboard in 500ms");
      setTimeout(() => {
        console.log("Executing navigation to /dashboard");
        navigate("/dashboard");
      }, 500);
    } catch (err) {
      console.error("Login error details:", err);
      console.error("Error response:", err.response);
      console.error("Error message:", err.message);

      if (err.response?.status === 401) {
        setError("Invalid username or password");
      } else if (err.response?.status === 0 || err.code === "NETWORK_ERROR") {
        setError(
          "Cannot connect to server. Please check if the backend is running."
        );
      } else {
        setError(`Login failed: ${err.response?.data || err.message}`);
      }
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background p-4 font-sans">
      <div className="bg-white p-8 md:p-10 rounded-lg shadow-lg w-full max-w-md mx-auto">
        <h1 className="text-3xl font-display font-bold mb-6 text-center text-text tracking-tight">
          Task Manager
        </h1>
        <p className="text-center text-muted mb-8 font-medium">
          Login to your account
        </p>

        {/* Error Message */}
        {error && (
          <div className="bg-danger/10 border border-danger/30 text-danger px-4 py-3 rounded-lg mb-4 text-center text-sm font-medium">
            {error}
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="bg-success/10 border border-success/30 text-success px-4 py-3 rounded-lg mb-4 text-center text-sm font-medium">
            {success}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block mb-2 text-sm font-medium text-text">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors font-medium placeholder-muted"
              placeholder="Enter your username"
            />
          </div>
          <div>
            <label className="block mb-2 text-sm font-medium text-text">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors font-medium placeholder-muted"
              placeholder="Enter your password"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-pink-500 text-white py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors font-medium text-base shadow-md"
          >
            Login
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-muted">
          Don't have an account?{" "}
          <Link
            to="/signup"
            className="text-primary font-medium cursor-pointer hover:text-primary/80 transition-colors"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
