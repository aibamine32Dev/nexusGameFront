import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Trophy,
  Zap,
  Users,
  Gamepad2,
  Shield,
  Cpu,
  Star,
  Swords,
  Timer,
  Headphones,
  ChevronRight,
} from "lucide-react";
import GameCard from "../../components/GameCard";

function Home() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadGames = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await fetch("https://nexusgameback.onrender.com/api/games/");
      if (!response.ok) throw new Error("Failed to load games");
      const data = await response.json();
      setGames(data);
    } catch (err) {
      console.error("Games API error:", err);
      setError("Unable to load games.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGames();
  }, []);

  return (
    <>
      {/* ====================================================
          HERO
      ==================================================== */}
      <section className="hero">
        <div className="hero-overlay"></div>

        <div className="hero-content">
          <div className="hero-tag">
            <span></span>
            WELCOME TO THE ARENA
          </div>

          <h1>
            PLAY.
            <br />
            <span>COMPETE.</span>
            <br />
            DOMINATE.
          </h1>

          <p>
            Welcome to Nexus Games — your ultimate gaming
            destination. High-performance machines, epic
            battles and an unforgettable gaming experience.
          </p>

          <div className="hero-buttons">
            <Link to="/reservation" className="primary-button">
              BOOK YOUR SESSION
              <ArrowRight size={20} />
            </Link>

            <Link to="/matchmaking" className="primary-button">
              FIND A MATCH
              <ArrowRight size={20} />
            </Link>

            <Link to="/games" className="secondary-button">
              EXPLORE GAMES
            </Link>
          </div>
        </div>

        <div className="hero-bottom">
          <span>01</span>
          <div></div>
          <span>NEXUS GAMES</span>
        </div>
      </section>

      {/* ====================================================
          STATS TICKER
      ==================================================== */}
      <div className="stats-ticker">
        <div className="stats-ticker-inner">
          {[
            { label: "ACTIVE PLAYERS", value: "500+" },
            { label: "GAMING STATIONS", value: "30" },
            { label: "GAMES AVAILABLE", value: "80+" },
            { label: "DAILY MATCHES", value: "50+" },
            { label: "TOURNAMENTS WON", value: "200+" },
            { label: "HOURS OF GAMEPLAY", value: "10K+" },
          ].map((stat, i) => (
            <div key={i} className="stats-ticker-item">
              <strong>{stat.value}</strong>
              <span>{stat.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ====================================================
          FEATURES
      ==================================================== */}
      <section className="features section">
        <div className="section-heading">
          <span>WHY NEXUS</span>
          <h2>
            BUILT FOR
            <br />
            <strong>GAMERS.</strong>
          </h2>
        </div>

        <div className="feature-grid">
          <div className="feature-card">
            <Cpu size={35} />
            <h3>HIGH PERFORMANCE</h3>
            <p>
              RTX 4090 GPUs, 360Hz monitors and ultra-low
              latency peripherals for the ultimate edge.
            </p>
          </div>

          <div className="feature-card">
            <Trophy size={35} />
            <h3>COMPETE</h3>
            <p>
              Challenge your friends and prove who is the
              ultimate gamer in weekly tournaments.
            </p>
          </div>

          <div className="feature-card">
            <Users size={35} />
            <h3>COMMUNITY</h3>
            <p>
              Meet gamers, build your squad and become part
              of the Nexus community.
            </p>
          </div>

          <div className="feature-card">
            <Headphones size={35} />
            <h3>PRO SETUP</h3>
            <p>
              Premium headsets, mechanical keyboards and
              gaming chairs for peak comfort.
            </p>
          </div>
        </div>
      </section>

      {/* ====================================================
          EXPERIENCE SECTION
      ==================================================== */}
      <section className="experience-section section">
        <div className="experience-bg-text">NEXUS</div>

        <div className="experience-content">
          <div className="experience-left">
            <div className="section-heading" style={{ textAlign: "left" }}>
              <span>THE NEXUS EXPERIENCE</span>
              <h2>
                LEVEL UP
                <br />
                <strong>YOUR GAME.</strong>
              </h2>
            </div>

            <p className="experience-desc">
              Step into our arena and feel the difference. From casual
              sessions to high-stakes tournaments, Nexus Games delivers
              an immersive environment built around performance and passion.
            </p>

            <div className="experience-perks">
              {[
                { icon: <Zap size={20} />, text: "Lightning-fast fiber internet — zero lag, zero excuses." },
                { icon: <Shield size={20} />, text: "Secure accounts & loyalty points on every session." },
                { icon: <Swords size={20} />, text: "Weekly PvP tournaments with real prizes." },
                { icon: <Timer size={20} />, text: "Flexible booking — hourly or all-day passes." },
              ].map((perk, i) => (
                <div key={i} className="experience-perk">
                  <div className="experience-perk-icon">{perk.icon}</div>
                  <span>{perk.text}</span>
                </div>
              ))}
            </div>

            <Link to="/reservation" className="primary-button" style={{ marginTop: "24px", display: "inline-flex" }}>
              BOOK A SESSION
              <ArrowRight size={18} />
            </Link>
          </div>

          <div className="experience-right">
            <div className="experience-card-grid">
              <div className="exp-card exp-card--red">
                <Swords size={28} />
                <h4>WEEKLY TOURNAMENTS</h4>
                <p>Join competitive brackets every Friday & Saturday night.</p>
              </div>
              <div className="exp-card exp-card--dark">
                <Star size={28} />
                <h4>LOYALTY REWARDS</h4>
                <p>Earn points every session. Redeem for free hours and gear.</p>
              </div>
              <div className="exp-card exp-card--dark">
                <Cpu size={28} />
                <h4>PRO HARDWARE</h4>
                <p>Every station runs the latest gaming hardware — no compromises.</p>
              </div>
              <div className="exp-card exp-card--red">
                <Users size={28} />
                <h4>SQUAD MODE</h4>
                <p>Book adjacent stations and play alongside your whole crew.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================
          MATCHMAKING PROMO
      ==================================================== */}
      <section className="matchmaking-promo section">
        <div className="matchmaking-promo-inner">
          <div className="matchmaking-promo-text">
            <span>FIND YOUR OPPONENT</span>
            <h2>
              MATCHMAKING
              <br />
              <strong>IS LIVE.</strong>
            </h2>
            <p>
              Create or join a match session with 8 to 10 players.
              Fill your squad, pick your game and let the battle begin.
            </p>
            <Link to="/matchmaking" className="primary-button">
              START MATCHMAKING
              <ChevronRight size={18} />
            </Link>
          </div>

          <div className="matchmaking-promo-visual">
            <div className="mm-promo-icon">
              <Gamepad2 size={80} strokeWidth={1.2} />
            </div>
            <div className="mm-promo-slots">
              {Array.from({ length: 10 }, (_, i) => (
                <div
                  key={i}
                  className={`mm-slot ${i < 3 ? "mm-slot--filled" : ""}`}
                  title={i < 3 ? "Player joined" : "Open slot"}
                />
              ))}
            </div>
            <p className="mm-promo-hint">3 / 10 players joined · 7 slots open</p>
          </div>
        </div>
      </section>

      {/* ====================================================
          GAME LIBRARY PREVIEW
      ==================================================== */}
      <section className="games-preview section">
        <div className="section-heading split">
          <div>
            <span>GAME LIBRARY</span>
            <h2>
              CHOOSE YOUR
              <br />
              <strong>BATTLE.</strong>
            </h2>
          </div>
          <Link to="/games" className="text-link">
            VIEW ALL GAMES
            <ArrowRight size={18} />
          </Link>
        </div>

        {loading && (
          <div className="games-loading">
            <p>LOADING GAMES...</p>
          </div>
        )}

        {!loading && error && (
          <div className="games-error">
            <p>{error}</p>
            <button className="primary-button" onClick={loadGames}>
              TRY AGAIN
            </button>
          </div>
        )}

        {!loading && !error && (
          <div className="games-grid">
            {games.slice(0, 3).map((game) => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
        )}
      </section>

      {/* ====================================================
          TESTIMONIALS
      ==================================================== */}
      <section className="testimonials-section section">
        <div className="section-heading">
          <span>PLAYER REVIEWS</span>
          <h2>
            WHAT GAMERS
            <br />
            <strong>SAY.</strong>
          </h2>
        </div>

        <div className="testimonials-grid">
          {[
            {
              name: "Aymen K.",
              tag: "FPS Competitor",
              stars: 5,
              text: "Best gaming cafe in town. The RTX 4090 stations are unreal — I finally hit my ranked goals here.",
            },
            {
              name: "Yasmine B.",
              tag: "Casual Gamer",
              stars: 5,
              text: "Came for the FIFA tournament and stayed all night. The vibe, the screens, the speed — top tier.",
            },
            {
              name: "Ramy S.",
              tag: "Squad Leader",
              stars: 5,
              text: "Used the matchmaking to find teammates. We had 8 players in under 10 minutes. Legendary session.",
            },
          ].map((review, i) => (
            <div key={i} className="testimonial-card">
              <div className="testimonial-stars">
                {Array.from({ length: review.stars }, (_, s) => (
                  <Star key={s} size={14} fill="#ef4444" color="#ef4444" />
                ))}
              </div>
              <p>"{review.text}"</p>
              <div className="testimonial-author">
                <div className="testimonial-avatar">
                  {review.name[0]}
                </div>
                <div>
                  <strong>{review.name}</strong>
                  <span>{review.tag}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ====================================================
          CTA
      ==================================================== */}
      <section className="cta-section">
        <div>
          <span>READY?</span>
          <h2>
            YOUR NEXT
            <br />
            <strong>VICTORY</strong>
            <br />
            STARTS HERE.
          </h2>
          <Link to="/reservation" className="primary-button">
            BOOK NOW
            <ArrowRight size={20} />
          </Link>
        </div>
      </section>
    </>
  );
}

export default Home;
