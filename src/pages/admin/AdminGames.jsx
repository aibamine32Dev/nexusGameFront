import { useEffect, useState } from "react";
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

function AdminGames() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const API_URL = "https://nexusgameback.onrender.com/api/games/";

  // =========================
  // GET - Load games
  // =========================
  const loadGames = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(API_URL);

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

  // =========================
  // DELETE - Delete game
  // =========================
  const deleteGame = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this game?"
    );

    if (!confirmed) return;

    try {
      const response = await fetch(
        `${API_URL}${id}/`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete game");
      }

      setGames((prevGames) =>
        prevGames.filter((game) => game.id !== id)
      );
    } catch (err) {
      console.error("Delete game error:", err);
      alert("Unable to delete this game.");
    }
  };

  // =========================
  // PATCH - Toggle availability
  // =========================
  const toggleAvailability = async (game) => {
    try {
      const response = await fetch(
        `${API_URL}${game.id}/`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            available: !game.available,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          "Failed to update game availability"
        );
      }

      const updatedGame = await response.json();

      setGames((prevGames) =>
        prevGames.map((item) =>
          item.id === game.id
            ? updatedGame
            : item
        )
      );
    } catch (err) {
      console.error(
        "Availability update error:",
        err
      );

      alert(
        "Unable to update game availability."
      );
    }
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

      {loading && (
        <div className="admin-empty admin-games-empty">
          <Gamepad2 size={50} />

          <h3>LOADING GAMES</h3>

          <p>
            Loading games from the server...
          </p>
        </div>
      )}

      {!loading && error && (
        <div className="admin-empty admin-games-empty">
          <X size={50} />

          <h3>ERROR</h3>

          <p>{error}</p>

          <button
            onClick={loadGames}
            className="admin-primary-button"
          >
            TRY AGAIN
          </button>
        </div>
      )}

      {!loading &&
        !error &&
        games.length === 0 && (

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
        )}

      {!loading &&
        !error &&
        games.length > 0 && (

          <div className="admin-games-grid">

            {games.map((game) => (

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
                        toggleAvailability(game)
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

            ))}

          </div>
        )}

    </section>
  );
}

export default AdminGames;