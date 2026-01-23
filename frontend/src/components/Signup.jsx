import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import axios from "axios";

// Centralized API base URL (falls back to localhost backend if env not set)
// Define VITE_API_BASE_URL in a .env file for flexibility (e.g., http://localhost:8088/api)
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8088/api";

const Signup = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Client-side validation
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    try {
      // Use consistent base URL (previous relative path caused 404 from frontend dev server)
      const res = await axios.post(`${API_BASE_URL}/auth/signup`, {
        username,
        password,
      });
      console.log(res.data);

      // Store user data in localStorage
      if (res.data.user && res.data.user.userId) {
        localStorage.setItem("userId", res.data.user.userId);
        localStorage.setItem("username", res.data.user.username);
        localStorage.setItem("token", "authenticated");
      }

      // Use success message from backend response
      setSuccess(
        res.data.message || res.data.success || "Account created successfully!"
      );

      // Clear form on success
      setUsername("");
      setPassword("");
      setConfirmPassword("");

      // Navigate to dashboard after successful signup
      setTimeout(() => {
        navigate("/dashboard");
      }, 500);

      // TODO: Handle successful signup (redirect to login or auto-login)
    } catch (err) {
      console.error("Signup error details:", err);
      console.error("Error response:", err.response);
      console.error("Error message:", err.message);

      if (err.response?.status === 409) {
        setError("Username already exists");
      } else if (err.response?.status === 400) {
        setError(err.response.data?.message || "Invalid input data");
      } else if (err.response?.status === 0 || err.code === "NETWORK_ERROR") {
        setError(
          "Cannot connect to server. Please check if the backend is running."
        );
      } else {
        setError(
          `Signup failed: ${err.response?.data?.message || err.message}`
        );
      }
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background p-4 font-sans">
      <div className="bg-white p-8 md:p-10 rounded-lg shadow-lg w-full max-w-md mx-auto">
        <h1 className="text-3xl font-display font-bold mb-6 text-center text-text tracking-tight">
          Create Account
        </h1>
        <p className="text-center text-muted mb-8 font-medium">
          Join Task Manager today
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

        <form onSubmit={handleSignup} className="space-y-5">
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
              placeholder="Choose a username"
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
              placeholder="Create a password"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-text">
              Confirm Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors font-medium placeholder-muted"
              placeholder="Confirm your password"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors font-medium text-base shadow-md"
          >
            Create Account
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-primary font-medium cursor-pointer hover:text-primary/80 transition-colors"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
