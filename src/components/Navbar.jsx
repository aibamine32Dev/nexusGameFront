import { Link, NavLink } from "react-router-dom";
import { Gamepad2, LogOut, Menu, User, X } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const [open, setOpen] = useState(false);

  const closeMenu = () => setOpen(false);

  const { user, isAuthenticated, logout } = useAuth();

  const handleLogout = () => {
    closeMenu();
    logout();

    // Full redirect to the home page (see Account.jsx).
    window.location.assign("/");
  };

  return (
    <header className="navbar">
      <div className="navbar-container">
        <Link to="/" className="logo" onClick={closeMenu}>
          <Gamepad2 size={28} />
          <span>NEXUS</span>
          <strong>GAMES</strong>
        </Link>

        <nav className={`nav-links ${open ? "active" : ""}`}>
          <NavLink to="/" onClick={closeMenu}>
            HOME
          </NavLink>

          <NavLink to="/games" onClick={closeMenu}>
            GAMES
          </NavLink>

          <NavLink to="/about" onClick={closeMenu}>
            ABOUT
          </NavLink>

          <NavLink to="/contact" onClick={closeMenu}>
            CONTACT
          </NavLink>

          {isAuthenticated ? (
            <>
              <NavLink
                to="/account"
                className="nav-account"
                onClick={closeMenu}
              >
                <User size={16} />
                {user.name.split(" ")[0].toUpperCase()}
              </NavLink>

              <button
                type="button"
                className="nav-logout"
                onClick={handleLogout}
                aria-label="Logout"
              >
                <LogOut size={16} />
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" onClick={closeMenu}>
                LOGIN
              </NavLink>

              <NavLink to="/register" onClick={closeMenu}>
                SIGN UP
              </NavLink>
            </>
          )}

          <Link
            to="/reservation"
            className="nav-book"
            onClick={closeMenu}
          >
            BOOK NOW
          </Link>
        </nav>

        <button className="mobile-menu" onClick={() => setOpen(!open)}>
          {open ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>
    </header>
  );
}

export default Navbar;