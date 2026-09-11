import { useState } from "react";
import GameCard from "../../components/GameCard";
import { games } from "../../data/games";

function Games() {
  const [filter, setFilter] = useState("ALL");

  const filteredGames =
    filter === "ALL"
      ? games
      : games.filter(
          (game) => game.platform.toUpperCase() === filter
        );

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

      <div className="games-grid">
        {filteredGames.map((game) => (
          <GameCard key={game.id} game={game} />
        ))}
      </div>
    </section>
  );
}

export default Games;