import React, { useState } from "react";
import axios from "axios";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const res = await axios.post("http://localhost:8080/api/auth/login", {
        username,
        password,
      });
      console.log(res.data);

      // Use success message from backend response
      setSuccess(res.data.message || res.data.success || "Login successful!");

      // TODO: Handle successful login (store token, redirect, etc.)
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
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-100 p-4 font-sans">
      <div className="bg-white p-8 md:p-10 rounded-lg shadow-lg w-full max-w-md mx-auto">
        <h1 className="text-3xl font-display font-bold mb-6 text-center text-gray-800 tracking-tight">
          Task Manager
        </h1>
        <p className="text-center text-gray-500 mb-8 font-medium">
          Login to your account
        </p>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-center text-sm font-medium">
            {error}
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4 text-center text-sm font-medium">
            {success}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors font-medium placeholder-gray-400"
              placeholder="Enter your username"
            />
          </div>
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors font-medium placeholder-gray-400"
              placeholder="Enter your password"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-teal-500 text-white py-3 rounded-lg font-semibold hover:bg-teal-600 transition-colors font-medium text-base"
          >
            Login
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-gray-500">
          Don't have an account?{" "}
          <span className="text-teal-500 font-medium cursor-pointer hover:text-teal-600 transition-colors">
            Sign up
          </span>
        </p>
      </div>
    </div>
  );
};

export default Login;
