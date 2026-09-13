
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Plus,
  Edit,
  Trash2,
  Monitor,
  Gamepad2,
  Check,
  X,
} from "lucide-react";

import { games as initialGames } from "../../data/games";

function AdminGames() {
  const [games, setGames] = useState(() => {
    const savedGames = localStorage.getItem("nexusGames");

    return savedGames
      ? JSON.parse(savedGames)
      : initialGames;
  });

  const deleteGame = (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this game?"
    );

    if (!confirmed) return;

    const updatedGames = games.filter(
      (game) => game.id !== id
    );

    localStorage.setItem(
      "nexusGames",
      JSON.stringify(updatedGames)
    );

    setGames(updatedGames);
  };

  const toggleAvailability = (id) => {
    const updatedGames = games.map((game) =>
      game.id === id
        ? {
            ...game,
            available: !game.available,
          }
        : game
    );

    localStorage.setItem(
      "nexusGames",
      JSON.stringify(updatedGames)
    );

    setGames(updatedGames);
  };

  return (
    <section className="admin-page">

      <div className="admin-page-header">

        <div>
          <span>GAME MANAGEMENT</span>

          <h1>
            OUR
            <br />
            <strong>GAMES.</strong>
          </h1>
        </div>

        <Link
          to="/admin/games/new"
          className="admin-primary-button"
        >
          <Plus size={19} />
          ADD GAME
        </Link>

      </div>

      <div className="admin-games-grid">

        {games.length === 0 ? (

          <div className="admin-empty admin-games-empty">
            <Gamepad2 size={50} />

            <h3>NO GAMES</h3>

            <p>
              Add your first game to the library.
            </p>

            <Link
              to="/admin/games/new"
              className="admin-primary-button"
            >
              <Plus size={18} />
              ADD GAME
            </Link>
          </div>

        ) : (

          games.map((game) => (

            <article
              className="admin-game-card"
              key={game.id}
            >

              <div className="admin-game-image">

                <img
                  src={game.image}
                  alt={game.name}
                />

                <div
                  className={
                    game.available
                      ? "admin-game-status available"
                      : "admin-game-status unavailable"
                  }
                >
                  {game.available ? (
                    <>
                      <Check size={13} />
                      AVAILABLE
                    </>
                  ) : (
                    <>
                      <X size={13} />
                      UNAVAILABLE
                    </>
                  )}
                </div>

              </div>

              <div className="admin-game-content">

                <div className="admin-game-category">
                  {game.category}
                </div>

                <h2>{game.name}</h2>

                <p>
                  {game.description}
                </p>

                <div className="admin-game-info">

                  <span>
                    {game.platform === "PC" ? (
                      <Monitor size={15} />
                    ) : (
                      <Gamepad2 size={15} />
                    )}

                    {game.platform}
                  </span>

                  <strong>
                    {game.price} DA / H
                  </strong>

                </div>

                <div className="admin-game-actions">

                  <button
                    onClick={() =>
                      toggleAvailability(game.id)
                    }
                    className="admin-action-button"
                  >
                    {game.available
                      ? "DISABLE"
                      : "ENABLE"}
                  </button>

                  <Link
                    to={`/admin/games/${game.id}/edit`}
                    className="admin-action-button"
                  >
                    <Edit size={15} />
                    EDIT
                  </Link>

                  <button
                    onClick={() =>
                      deleteGame(game.id)
                    }
                    className="admin-action-button danger"
                  >
                    <Trash2 size={15} />
                    DELETE
                  </button>

                </div>

              </div>

            </article>

          ))

        )}

      </div>

    </section>
  );
}

export default AdminGames;
