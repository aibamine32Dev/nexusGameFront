import { useSearchParams } from "react-router-dom";
import ReservationForm from "../../components/ReservationForm";
import { games } from "../../data/games";

function Reservation() {
  const [searchParams] = useSearchParams();

  const gameId = Number(searchParams.get("game"));

  const selectedGame = games.find(
    (game) => game.id === gameId
  );

  return (
    <section className="reservation-page">
      <div className="reservation-intro">
        <span>ENTER THE ARENA</span>

        <h1>
          BOOK YOUR
          <br />
          <strong>SESSION.</strong>
        </h1>

        <p>
          No account. No complicated registration.
          Just choose your game, pick your time and get
          ready to play.
        </p>

        <div className="reservation-warning">
          <strong>IMPORTANT</strong>
          <p>
            Please arrive at least 10 minutes before your
            reservation.
          </p>
        </div>
      </div>

      <div className="reservation-container">
        <div className="reservation-form-wrapper">
          <ReservationForm selectedGame={selectedGame} />
        </div>
      </div>
    </section>
  );
}

export default Reservation;