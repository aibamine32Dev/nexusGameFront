import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { ArrowRight, Lock, Mail } from "lucide-react";

import AuthField from "../../components/AuthField";
import { useAuth } from "../../context/AuthContext";
import { normalizeEmail } from "../../services/authApi";

function Login() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // where to go after login (e.g. the page the client tried to open)
  const redirectTo = location.state?.from || "/account";

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.email.trim() || !form.password) {
      setError("Enter your email and password.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await login({
        email: normalizeEmail(form.email),
        password: form.password,
      });

      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="auth-page">
      <div className="auth-box">
        <div className="auth-title">
          <span>WELCOME BACK</span>

          <h1>
            PLAYER
            <br />
            <strong>LOGIN.</strong>
          </h1>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <AuthField
            icon={Mail}
            type="email"
            name="email"
            placeholder="EMAIL"
            autoComplete="email"
            value={form.email}
            onChange={handleChange}
          />

          <AuthField
            icon={Lock}
            type="password"
            name="password"
            placeholder="PASSWORD"
            autoComplete="current-password"
            value={form.password}
            onChange={handleChange}
          />

          {error && <p className="auth-error">{error}</p>}

          <button
            type="submit"
            className="primary-button full"
            disabled={loading}
          >
            {loading ? "LOGGING IN..." : "LOGIN"}
            {!loading && <ArrowRight size={20} />}
          </button>
        </form>

        <p className="auth-switch">
          No account yet?{" "}
          <Link to="/register">CREATE ONE</Link>
        </p>
      </div>
    </section>
  );
}

export default Login;
