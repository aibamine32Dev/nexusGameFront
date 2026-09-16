import { useEffect, useState } from "react";
import GameCard from "../../components/GameCard";

function Games() {
  const [games, setGames] = useState([]);
  const [filter, setFilter] = useState("ALL");
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

  const filteredGames =
    filter === "ALL"
      ? games
      : games.filter((game) => game.platform === filter);

  return (
    <section className="page-section">
      <div className="page-header">
        <span>THE LIBRARY</span>

        <h1>
          OUR
          <br />
          <strong>GAMES.</strong>
        </h1>

        <p>
          Choose your game. Choose your battlefield.
          Prepare to dominate.
        </p>
      </div>

      <div className="game-filters">
        {["ALL", "PC", "PS5"].map((item) => (
          <button
            key={item}
            className={filter === item ? "active" : ""}
            onClick={() => setFilter(item)}
          >
            {item}
          </button>
        ))}
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
          {filteredGames.map((game) => (
            <GameCard
              key={game.id}
              game={game}
            />
          ))}
        </div>
      )}
    </section>
  );
}

export default Games;