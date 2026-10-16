import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/useToast";
import { Field } from "../components/Auth/AuthFormElements";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { showToast } = useToast();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.email || !formData.password) {
      setError("Please fill in both fields.");
      return;
    }

    setLoading(true);
    try {
      await login(formData.email, formData.password);
      showToast("Welcome back!", "success");
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err.message || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="mb-8">
        <h1 className="font-display text-2xl font-semibold text-[#334155]">
          Welcome back
        </h1>
        <p className="mt-1 text-sm text-[#64748B]">
          Log in to continue practicing with TalkIQ.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Field
          icon={Mail}
          type="email"
          name="email"
          label="Email"
          placeholder="you@example.com"
          autoComplete="email"
          value={formData.email}
          onChange={handleChange}
        />

        <Field
          icon={Lock}
          type="password"
          name="password"
          label="Password"
          placeholder="Enter your password"
          autoComplete="current-password"
          value={formData.password}
          onChange={handleChange}
        />

        {error && (
          <p className="text-sm text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-[#334155] py-3 text-sm font-semibold text-white transition hover:bg-[#1E293B] disabled:opacity-50"
        >
          {loading ? "Logging in..." : "Log In"}
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-[#64748B]">
        Don't have an account?{" "}
        <Link to="/signup" className="font-medium text-[#334155] hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}
