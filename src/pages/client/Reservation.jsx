import { useState } from "react";
import ReservationForm from "../../components/ReservationForm";

function Reservation() {
  const [reservationCreated, setReservationCreated] =
    useState(false);

  return (
    <section className="reservation-page">

      <div className="reservation-intro">
        <span>ENTER THE ARENA</span>

        <h1>
          BOOK YOUR
          <br />
          <strong>STATION.</strong>
        </h1>

        <p>
          Choose your gaming station, select your
          date and time, and book your session.
          No account required.
        </p>

        <div className="reservation-warning">
          <strong>IMPORTANT</strong>

          <p>
            The minimum reservation duration is
            2 hours.
          </p>
        </div>
      </div>

      <div className="reservation-container">

        <div className="reservation-form-wrapper">

          {!reservationCreated ? (
            <ReservationForm
              onReservationCreated={() =>
                setReservationCreated(true)
              }
            />
          ) : (
            <div className="reservation-success-message">

              <h2>
                RESERVATION CREATED
              </h2>

              <p>
                Your gaming station has been
                successfully reserved.
              </p>

              <button
                type="button"
                className="primary-button"
                onClick={() =>
                  setReservationCreated(false)
                }
              >
                MAKE ANOTHER RESERVATION
              </button>

            </div>
          )}

        </div>

      </div>

    </section>
  );
}

export default Reservation;