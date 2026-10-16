import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Mail, Lock } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/useToast";
import { Field, PasswordStrengthMeter } from "../components/Auth/AuthFormElements";

export default function Signup() {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const validate = () => {
    if (!formData.name.trim()) return "Please enter your name.";
    if (!formData.email.includes("@")) return "Please enter a valid email.";
    if (formData.password.length < 6)
      return "Password must be at least 6 characters.";
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setError("");
    setLoading(true);
    try {
      await signup(formData.name, formData.email, formData.password);
      showToast("Account created! Welcome to TalkIQ.", "success");
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="mb-8">
        <h1 className="font-display text-2xl font-semibold text-[#334155]">
          Create your account
        </h1>
        <p className="mt-1 text-sm text-[#64748B]">
          Start practicing smarter with AI-powered feedback.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Field
          icon={User}
          type="text"
          name="name"
          label="Full Name"
          placeholder="Your full name"
          autoComplete="name"
          value={formData.name}
          onChange={handleChange}
        />
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
          placeholder="At least 6 characters"
          autoComplete="new-password"
          value={formData.password}
          onChange={handleChange}
        />
        <PasswordStrengthMeter password={formData.password} />

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
          {loading ? "Creating account..." : "Create Account"}
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-[#64748B]">
        Already have an account?{" "}
        <Link to="/login" className="font-medium text-[#334155] hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}