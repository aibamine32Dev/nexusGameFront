import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check, Monitor, Gamepad2 } from "lucide-react";
import { games } from "../../data/games";

function GameDetails() {
  const { id } = useParams();

  const game = games.find(
    (item) => item.id === Number(id)
  );

  if (!game) {
    return (
      <section className="page-section">
        <h1>GAME NOT FOUND</h1>
        <Link to="/games" className="primary-button">
          BACK TO GAMES
        </Link>
      </section>
    );
  }

  return (
    <section className="game-details">
      <div className="game-details-image">
        <img src={game.image} alt={game.name} />
      </div>

      <div className="game-details-content">
        <Link to="/games" className="back-link">
          <ArrowLeft size={18} />
          BACK TO GAMES
        </Link>

        <span className="game-category">
          {game.category}
        </span>

        <h1>{game.name}</h1>

        <p className="game-description">
          {game.description}
        </p>

        <div className="detail-info">
          <div>
            {game.platform === "PC" ? (
              <Monitor />
            ) : (
              <Gamepad2 />
            )}

            <span>PLATFORM</span>
            <strong>{game.platform}</strong>
          </div>

          <div>
            <span>PRICE</span>
            <strong>{game.price} DA / HOUR</strong>
          </div>

          <div>
            <span>STATUS</span>
            <strong className="status">
              <Check size={16} />
              AVAILABLE
            </strong>
          </div>
        </div>

        <div className="tags">
          {game.tags.map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>

        <Link
          to={`/reservation?game=${game.id}`}
          className="primary-button"
        >
          RESERVE THIS GAME
          <ArrowRight size={20} />
        </Link>
      </div>
    </section>
  );
}

export default GameDetails;