import { useEffect, useState } from "react";
import {
  Link,
  useSearchParams,
} from "react-router-dom";

import {
  CheckCircle,
  ArrowRight,
} from "lucide-react";

function ReservationSuccess() {
  const [searchParams] =
    useSearchParams();

  const reservationId =
    Number(searchParams.get("id"));

  const [reservation, setReservation] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const API_URL =
    "https://nexusgameback.onrender.com/api/reservations/";

  useEffect(() => {
    const loadReservation =
      async () => {

        if (!reservationId) {
          setError(
            "No reservation found."
          );

          setLoading(false);

          return;
        }

        try {
          setLoading(true);
          setError("");

          const response =
            await fetch(
              `${API_URL}${reservationId}/`
            );

          if (!response.ok) {
            throw new Error(
              "Reservation not found"
            );
          }

          const data =
            await response.json();

          setReservation(data);

        } catch (err) {

          console.error(
            "Reservation API error:",
            err
          );

          setReservation(null);

          setError(
            "Unable to load the reservation."
          );

        } finally {

          setLoading(false);

        }
      };

    loadReservation();

  }, [reservationId]);

  // ================================
  // LOADING
  // ================================

  if (loading) {
    return (
      <section className="success-page">

        <h1>
          LOADING RESERVATION...
        </h1>

      </section>
    );
  }

  // ================================
  // RESERVATION NOT FOUND
  // ================================

  if (error || !reservation) {
    return (
      <section className="success-page">

        <h1>
          NO RESERVATION FOUND
        </h1>

        <Link
          to="/reservation"
          className="primary-button"
        >
          MAKE A RESERVATION
        </Link>

      </section>
    );
  }

  // ================================
  // RESERVATION SUCCESS
  // ================================

  return (
    <section className="success-page">

      <CheckCircle size={80} />

      <span>
        RESERVATION CONFIRMED
      </span>

      <h1>
        YOU'RE
        <br />
        <strong>
          IN.
        </strong>
      </h1>

      <div className="reservation-ticket">

        <div>
          <span>
            RESERVATION
          </span>

          <strong>
            {reservation.reservation_number}
          </strong>
        </div>

        <div>
          <span>
            GAME
          </span>

          <strong>
            {reservation.game_name ||
              `GAME #${reservation.game}`}
          </strong>
        </div>

        <div>
          <span>
            PLATFORM
          </span>

          <strong>
            {reservation.platform}
          </strong>
        </div>

        <div>
          <span>
            DATE
          </span>

          <strong>
            {reservation.date}
          </strong>
        </div>

        <div>
          <span>
            TIME
          </span>

          <strong>
            {reservation.time}
          </strong>
        </div>

        <div>
          <span>
            DURATION
          </span>

          <strong>
            {reservation.duration} HOUR(S)
          </strong>
        </div>

        <div>
          <span>
            PLAYER
          </span>

          <strong>
            {reservation.player_name ||
              `PLAYER #${reservation.player}`}
          </strong>
        </div>

      </div>

      <p>
        Please arrive 10 minutes before
        your reservation.
      </p>

      <Link
        to="/"
        className="primary-button"
      >
        BACK TO HOME

        <ArrowRight size={20} />

      </Link>

    </section>
  );
}

export default ReservationSuccess;