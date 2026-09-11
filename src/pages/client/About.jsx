import { Trophy, Zap, Users } from "lucide-react";

function About() {
  return (
    <section className="about-page">
      <div className="page-header">
        <span>ABOUT US</span>

        <h1>
          MORE THAN
          <br />
          <strong>A GAMING CAFE.</strong>
        </h1>
      </div>

      <div className="about-content">
        <div>
          <h2>
            WELCOME TO
            <br />
            <strong>NEXUS GAMES.</strong>
          </h2>
        </div>

        <div>
          <p>
            Nexus Games is built for people who don't just
            play games — they live them.
          </p>

          <p>
            Our goal is simple: create a gaming environment
            where players can compete, connect and enjoy
            their favorite games using powerful equipment
            in an aggressive gaming atmosphere.
          </p>

          <p>
            Whether you're here for a quick match, a
            competitive session or an entire night with
            friends, Nexus Games is your arena.
          </p>
        </div>
      </div>

      <div className="about-stats">
        <div>
          <Zap />
          <strong>HIGH PERFORMANCE</strong>
          <span>Gaming hardware</span>
        </div>

        <div>
          <Trophy />
          <strong>COMPETITIVE</strong>
          <span>Built for competition</span>
        </div>

        <div>
          <Users />
          <strong>COMMUNITY</strong>
          <span>Gamers together</span>
        </div>
      </div>
    </section>
  );
}

export default About;