import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Lock, Mail, Phone, User } from "lucide-react";

import AuthField from "../../components/AuthField";
import { useAuth } from "../../context/AuthContext";
import {
  normalizeEmail,
  normalizePhone,
} from "../../services/authApi";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_REGEX = /^\+?[0-9]{8,15}$/;

function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirm: "",
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
    setServerError("");
  };

  const validate = () => {
    const next = {};

    if (form.name.trim().length < 2) {
      next.name = "Enter your full name.";
    }

    if (!EMAIL_REGEX.test(form.email.trim())) {
      next.email = "Enter a valid email address.";
    }

    if (!PHONE_REGEX.test(normalizePhone(form.phone))) {
      next.phone = "Enter a valid phone number (8 to 15 digits).";
    }

    if (form.password.length < 8) {
      next.password = "Password must be at least 8 characters.";
    }

    if (form.confirm !== form.password) {
      next.confirm = "Passwords do not match.";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);
    setServerError("");

    try {
      await register({
        name: form.name.trim(),
        email: normalizeEmail(form.email),
        phone: normalizePhone(form.phone),
        password: form.password,
      });

      navigate("/account", { replace: true });
    } catch (err) {
      setServerError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="auth-page">
      <div className="auth-box">
        <div className="auth-title">
          <span>JOIN THE ARENA</span>

          <h1>
            CREATE YOUR
            <br />
            <strong>ACCOUNT.</strong>
          </h1>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <AuthField
            icon={User}
            name="name"
            placeholder="FULL NAME"
            autoComplete="name"
            value={form.name}
            onChange={handleChange}
            error={errors.name}
          />

          <AuthField
            icon={Mail}
            type="email"
            name="email"
            placeholder="EMAIL"
            autoComplete="email"
            value={form.email}
            onChange={handleChange}
            error={errors.email}
          />

          <AuthField
            icon={Phone}
            type="tel"
            name="phone"
            placeholder="PHONE NUMBER"
            autoComplete="tel"
            value={form.phone}
            onChange={handleChange}
            error={errors.phone}
          />

          <AuthField
            icon={Lock}
            type="password"
            name="password"
            placeholder="PASSWORD (MIN. 8)"
            autoComplete="new-password"
            value={form.password}
            onChange={handleChange}
            error={errors.password}
          />

          <AuthField
            icon={Lock}
            type="password"
            name="confirm"
            placeholder="CONFIRM PASSWORD"
            autoComplete="new-password"
            value={form.confirm}
            onChange={handleChange}
            error={errors.confirm}
          />

          {serverError && (
            <p className="auth-error">{serverError}</p>
          )}

          <button
            type="submit"
            className="primary-button full"
            disabled={loading}
          >
            {loading ? "CREATING..." : "CREATE ACCOUNT"}
            {!loading && <ArrowRight size={20} />}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account?{" "}
          <Link to="/login">LOGIN</Link>
        </p>
      </div>
    </section>
  );
}

export default Register;
