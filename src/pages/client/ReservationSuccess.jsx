import { Link } from "react-router-dom";
import { CheckCircle, ArrowRight } from "lucide-react";
import { games } from "../../data/games";

function ReservationSuccess() {
  const reservation = JSON.parse(
    localStorage.getItem("nexusReservation")
  );

  if (!reservation) {
    return (
      <section className="success-page">
        <h1>NO RESERVATION FOUND</h1>

        <Link to="/reservation" className="primary-button">
          MAKE A RESERVATION
        </Link>
      </section>
    );
  }

  const game = games.find(
    (item) => item.id === Number(reservation.game)
  );

  return (
    <section className="success-page">
      <CheckCircle size={80} />

      <span>RESERVATION CONFIRMED</span>

      <h1>
        YOU'RE
        <br />
        <strong>IN.</strong>
      </h1>

      <div className="reservation-ticket">
        <div>
          <span>RESERVATION</span>
          <strong>{reservation.reservationNumber}</strong>
        </div>

        <div>
          <span>GAME</span>
          <strong>{game?.name}</strong>
        </div>

        <div>
          <span>DATE</span>
          <strong>{reservation.date}</strong>
        </div>

        <div>
          <span>TIME</span>
          <strong>{reservation.time}</strong>
        </div>

        <div>
          <span>DURATION</span>
          <strong>{reservation.duration} HOUR(S)</strong>
        </div>

        <div>
          <span>PLAYER</span>
          <strong>{reservation.name}</strong>
        </div>
      </div>

      <p>
        Please arrive 10 minutes before your reservation.
      </p>

      <Link to="/" className="primary-button">
        BACK TO HOME
        <ArrowRight size={20} />
      </Link>
    </section>
  );
}

export default ReservationSuccess;