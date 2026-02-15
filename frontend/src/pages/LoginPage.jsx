import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import AuthLayout from "../layouts/AuthLayout";
import { login } from "../services/authService";
import { useToast } from "../hooks/useToast";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();

  const nextPath = location.state?.from || "/dashboard";

  const handleLogin = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const data = await login({ username, password });

      if (data.user && data.user.userId) {
        localStorage.setItem("userId", data.user.userId);
        localStorage.setItem("username", data.user.username);
        localStorage.setItem("token", "authenticated");
      }

      toast.success({ title: "Welcome back", message: data.message || "Signed in" });
      navigate(nextPath, { replace: true });
    } catch (err) {
      toast.error({
        title: "Login failed",
        message:
          err?.response?.status === 401
            ? "Invalid username or password"
            : err?.message || "Please try again",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout>
      <div className="text-center mb-10">
        <h2 className="text-4xl font-display font-bold text-text dark:text-textDark mb-3">Welcome Back</h2>
        <p className="text-muted dark:text-mutedDark text-lg">Sign in to continue managing your tasks</p>
      </div>

      <form onSubmit={handleLogin} className="space-y-6">
        <div>
          <label className="block mb-2 text-sm font-semibold text-text dark:text-textDark">Username</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg className="w-5 h-5 text-muted dark:text-mutedDark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full pl-12 pr-4 py-3.5 border-2 border-border dark:border-borderDark rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 font-medium placeholder-muted/60 bg-white dark:bg-surfaceDark text-text dark:text-textDark"
              placeholder="Enter your username"
            />
          </div>
        </div>

        <div>
          <label className="block mb-2 text-sm font-semibold text-text dark:text-textDark">Password</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg className="w-5 h-5 text-muted dark:text-mutedDark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full pl-12 pr-4 py-3.5 border-2 border-border dark:border-borderDark rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 font-medium placeholder-muted/60 bg-white dark:bg-surfaceDark text-text dark:text-textDark"
              placeholder="Enter your password"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-gradient-to-r from-primary to-secondary text-white py-4 rounded-xl font-bold text-base shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center justify-center disabled:opacity-60 disabled:hover:scale-100"
        >
          {submitting ? "Signing in..." : "Sign In"}
          <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </button>
      </form>

      <div className="relative my-8">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border dark:border-borderDark" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-white dark:bg-surfaceDark text-muted dark:text-mutedDark font-medium">New here?</span>
        </div>
      </div>

      <div className="text-center">
        <Link
          to="/signup"
          className="inline-flex items-center justify-center w-full py-3.5 border-2 border-primary text-primary font-bold rounded-xl hover:bg-primary hover:text-white transition-all duration-200"
        >
          Create Account
        </Link>
      </div>
    </AuthLayout>
  );
}
