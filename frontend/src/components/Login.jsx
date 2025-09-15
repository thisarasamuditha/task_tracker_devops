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
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 md:p-10 rounded-lg shadow-lg w-full max-w-md mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
          Task Manager
        </h1>
        <p className="text-center text-gray-500 mb-8">Login to your account</p>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-center">
            {error}
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4 text-center">
            {success}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block mb-1 text-gray-600">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <div>
            <label className="block mb-1 text-gray-600">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-teal-500 text-white py-2 rounded-lg font-semibold hover:bg-teal-600 transition"
          >
            Login
          </button>
        </form>
        <p className="mt-6 text-center text-gray-500">
          Don't have an account?{" "}
          <span className="text-teal-500 font-medium cursor-pointer">
            Sign up
          </span>
        </p>
      </div>
    </div>
  );
};

export default Login;
