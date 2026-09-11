import { Link, NavLink } from "react-router-dom";
import { Gamepad2, Menu, X } from "lucide-react";
import { useState } from "react";

function Navbar() {
  const [open, setOpen] = useState(false);

  const closeMenu = () => setOpen(false);

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