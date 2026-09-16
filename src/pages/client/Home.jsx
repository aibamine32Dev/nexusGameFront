import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Trophy,
  Zap,
  Users,
  Gamepad2,
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

      const response = await fetch(
        "https://nexusgameback.onrender.com/api/games/"
      );

      if (!response.ok) {
        throw new Error("Failed to load games");
      }

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
            <Zap size={35} />

            <h3>HIGH PERFORMANCE</h3>

            <p>
              Powerful gaming hardware designed for
              competitive gaming.
            </p>
          </div>

          <div className="feature-card">
            <Trophy size={35} />

            <h3>COMPETE</h3>

            <p>
              Challenge your friends and prove who is the
              ultimate gamer.
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
            <Gamepad2 size={35} />

            <h3>YOUR GAMES</h3>

            <p>
              From competitive FPS to sports and open-world
              adventures.
            </p>
          </div>
        </div>
      </section>

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

            <button
              className="primary-button"
              onClick={loadGames}
            >
              TRY AGAIN
            </button>
          </div>
        )}

        {!loading && !error && (
          <div className="games-grid">
            {games.slice(0, 3).map((game) => (
              <GameCard
                key={game.id}
                game={game}
              />
            ))}
          </div>
        )}
      </section>

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