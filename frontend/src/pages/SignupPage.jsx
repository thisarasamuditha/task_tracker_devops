import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../layouts/AuthLayout";
import { signup } from "../services/authService";
import { useToast } from "../hooks/useToast";

export default function SignupPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  const handleSignup = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error({ title: "Check password", message: "Passwords do not match" });
      return;
    }

    if (password.length < 6) {
      toast.error({ title: "Weak password", message: "Minimum 6 characters" });
      return;
    }

    setSubmitting(true);
    try {
      const data = await signup({ username, password });

      if (data.user && data.user.userId) {
        localStorage.setItem("userId", data.user.userId);
        localStorage.setItem("username", data.user.username);
        localStorage.setItem("token", "authenticated");
      }

      toast.success({ title: "Account created", message: data.message || "Welcome" });
      navigate("/dashboard", { replace: true });
    } catch (err) {
      toast.error({
        title: "Signup failed",
        message: err?.response?.data?.message || err?.message || "Please try again",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout>
      <div className="text-center mb-10">
        <h2 className="text-4xl font-display font-bold text-text dark:text-textDark mb-3">Create your account</h2>
        <p className="text-muted dark:text-mutedDark text-lg">Start building momentum today</p>
      </div>

      <form onSubmit={handleSignup} className="space-y-5">
        <div>
          <label className="block mb-2 text-sm font-semibold text-text dark:text-textDark">Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="w-full px-4 py-3.5 border-2 border-border dark:border-borderDark rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 font-medium placeholder-muted/60 bg-white dark:bg-surfaceDark text-text dark:text-textDark"
            placeholder="Choose a username"
          />
        </div>

        <div>
          <label className="block mb-2 text-sm font-semibold text-text dark:text-textDark">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-3.5 border-2 border-border dark:border-borderDark rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 font-medium placeholder-muted/60 bg-white dark:bg-surfaceDark text-text dark:text-textDark"
            placeholder="Create a password"
          />
        </div>

        <div>
          <label className="block mb-2 text-sm font-semibold text-text dark:text-textDark">Confirm password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="w-full px-4 py-3.5 border-2 border-border dark:border-borderDark rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 font-medium placeholder-muted/60 bg-white dark:bg-surfaceDark text-text dark:text-textDark"
            placeholder="Repeat your password"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-gradient-to-r from-primary to-secondary text-white py-4 rounded-xl font-bold text-base shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-60 disabled:hover:scale-100"
        >
          {submitting ? "Creating..." : "Create account"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-muted dark:text-mutedDark">
        Already have an account?{" "}
        <Link to="/login" className="text-primary font-semibold hover:underline">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
