import {
  MapPin,
  Phone,
  Clock
} from "lucide-react";

function Contact() {
  return (
    <section className="contact-page">
      <div className="page-header">
        <span>GET IN TOUCH</span>

        <h1>
          FIND
          <br />
          <strong>NEXUS.</strong>
        </h1>

        <p>
          Ready to play? Come find us and enter the arena.
        </p>
      </div>

      <div className="contact-grid">
        <div className="contact-card">
          <MapPin />

          <span>LOCATION</span>

          <h3>NEXUS GAMES</h3>

          <p>
            Your address here
            <br />
            Algeria
          </p>
        </div>

        <div className="contact-card">
          <Phone />

          <span>PHONE</span>

          <h3>CALL US</h3>

          <p>+213 XX XX XX XX</p>
        </div>

        <div className="contact-card">
          <Clock />

          <span>OPENING HOURS</span>

          <h3>EVERY DAY</h3>

          <p>10:00 — 00:00</p>
        </div>

        <div className="contact-card">
         

          <span>SOCIAL</span>

          <h3>FOLLOW US</h3>

          <p>@nexusgames</p>
        </div>
      </div>

      <div className="contact-map">
        <div>
          <MapPin size={45} />

          <h2>NEXUS GAMES</h2>

          <p>YOUR LOCATION HERE</p>
        </div>
      </div>
    </section>
  );
}

export default Contact;