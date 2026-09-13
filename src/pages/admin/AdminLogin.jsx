
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Gamepad2, Lock, ArrowRight } from "lucide-react";

function AdminLogin() {
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    // TEMPORARY FRONTEND LOGIN
    // Replace this with backend authentication later.
    if (password === "admin123") {
      localStorage.setItem("nexusAdminAuth", "true");
      navigate("/admin/dashboard");
    } else {
      setError("Invalid password.");
    }
  };

  return (
    <section className="admin-login-page">
      <div className="admin-login-box">

        <div className="admin-login-logo">
          <Gamepad2 size={38} />
          <div>
            <span>NEXUS</span>
            <strong>GAMES</strong>
          </div>
        </div>

        <div className="admin-login-title">
          <span>ADMIN AREA</span>
          <h1>
            CONTROL
            <br />
            <strong>PANEL.</strong>
          </h1>
        </div>

        <form onSubmit={handleSubmit}>

          <div className="admin-input">
            <Lock size={19} />

            <input
              type="password"
              placeholder="ADMIN PASSWORD"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
              }}
            />
          </div>

          {error && (
            <p className="admin-error">
              {error}
            </p>
          )}

          <button type="submit" className="primary-button full">
            LOGIN
            <ArrowRight size={20} />
          </button>

        </form>

        <button
          className="admin-back"
          onClick={() => navigate("/")}
        >
          BACK TO WEBSITE
        </button>

      </div>
    </section>
  );
}

export default AdminLogin;
