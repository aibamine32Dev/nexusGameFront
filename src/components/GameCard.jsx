import { Link } from "react-router-dom";
import { Monitor, Gamepad2, ArrowUpRight } from "lucide-react";

function GameCard({ game }) {
  return (
    <article className="game-card">
      <div className="game-image-wrapper">
        <img src={game.image} alt={game.name} />

        <div className="game-platform">
          {game.platform === "PC" ? (
            <Monitor size={15} />
          ) : (
            <Gamepad2 size={15} />
          )}

          {game.platform}
        </div>

        {game.available && (
          <div className="availability">
            AVAILABLE
          </div>
        )}
      </div>

      <div className="game-card-content">
        <div className="game-category">
          {game.category}
        </div>

        <h3>{game.name}</h3>

        <p>{game.description}</p>

        <div className="game-card-bottom">
          <div className="game-price">
            <span>FROM</span>
            <strong>{game.price} DA</strong>
            <small>/ HOUR</small>
          </div>

          <Link to={`/games/${game.id}`} className="game-arrow">
            <ArrowUpRight size={22} />
          </Link>
        </div>
      </div>
    </article>
  );
}

export default GameCard;