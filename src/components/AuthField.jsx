import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

// One input row (icon + input). Pass type="password" to get a show/hide eye.
function AuthField({ icon: Icon, type = "text", error, ...props }) {
  const [visible, setVisible] = useState(false);
  const isPassword = type === "password";

  return (
    <div className="auth-field">
      <div className={`auth-input ${error ? "invalid" : ""}`}>
        <Icon size={19} />

        <input
          {...props}
          type={isPassword && visible ? "text" : type}
        />

        {isPassword && (
          <button
            type="button"
            className="auth-eye"
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? "Hide password" : "Show password"}
          >
            {visible ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>

      {error && <small className="auth-field-error">{error}</small>}
    </div>
  );
}

export default AuthField;
