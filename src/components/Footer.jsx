import { Link } from "react-router-dom";
import {
  MapPin,
  Phone,
  Clock,
} from "lucide-react";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-grid">
        <div>
          <div className="footer-logo">
            NEXUS <span>GAMES</span>
          </div>

          <p>Where gamers connect, compete and dominate.</p>

          <div className="socials">
            <a href="#" aria-label="Instagram">
              
            </a>
          </div>
        </div>

        <div>
          <h3>QUICK LINKS</h3>

          <Link to="/">Home</Link>
          <Link to="/games">Games</Link>
          <Link to="/about">About</Link>
          <Link to="/contact">Contact</Link>
        </div>

        <div>
          <h3>CONTACT</h3>

          <p>
            <MapPin size={17} />
            Nexus Games
          </p>

          <p>
            <Phone size={17} />
            +213 XX XX XX XX
          </p>

          <p>
            <Clock size={17} />
            10:00 — 00:00
          </p>
        </div>
      </div>

      <div className="footer-bottom">
        © 2026 Nexus Games. All rights reserved.
      </div>
    </footer>
  );
}

export default Footer;

