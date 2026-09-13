
import { useState } from "react";
import { Trash2, CalendarDays } from "lucide-react";

function AdminReservations() {

  const [reservations, setReservations] = useState(
    JSON.parse(
      localStorage.getItem("nexusReservations") || "[]"
    )
  );

  const deleteReservation = (reservationNumber) => {

    const updated = reservations.filter(
      (reservation) =>
        reservation.reservationNumber !== reservationNumber
    );

    localStorage.setItem(
      "nexusReservations",
      JSON.stringify(updated)
    );

    setReservations(updated);
  };

  return (
    <section className="admin-page">

      <div className="admin-page-header">
        <div>
          <span>BOOKINGS</span>

          <h1>
            RESERVATIONS
            <br />
            <strong>MANAGER.</strong>
          </h1>
        </div>
      </div>

      <div className="admin-panel">

        <div className="admin-panel-header">
          <h2>
            ALL RESERVATIONS
          </h2>

          <span>
            {reservations.length} BOOKINGS
          </span>
        </div>

        {reservations.length === 0 ? (

          <div className="admin-empty">
            <CalendarDays size={45} />

            <p>
              No reservations found.
            </p>
          </div>

        ) : (

          <div className="admin-table-wrapper">

            <table className="admin-table">

              <thead>
                <tr>
                  <th>NUMBER</th>
                  <th>PLAYER</th>
                  <th>PHONE</th>
                  <th>GAME</th>
                  <th>DATE</th>
                  <th>TIME</th>
                  <th>DURATION</th>
                  <th></th>
                </tr>
              </thead>

              <tbody>

                {reservations
                  .slice()
                  .reverse()
                  .map((reservation) => (

                    <tr key={reservation.reservationNumber}>

                      <td>
                        {reservation.reservationNumber}
                      </td>

                      <td>
                        {reservation.name}
                      </td>

                      <td>
                        {reservation.phone}
                      </td>

                      <td>
                        {reservation.game}
                      </td>

                      <td>
                        {reservation.date}
                      </td>

                      <td>
                        {reservation.time}
                      </td>

                      <td>
                        {reservation.duration} H
                      </td>

                      <td>

                        <button
                          className="delete-button"
                          onClick={() =>
                            deleteReservation(
                              reservation.reservationNumber
                            )
                          }
                        >
                          <Trash2 size={17} />
                        </button>

                      </td>

                    </tr>

                  ))}

              </tbody>

            </table>

          </div>

        )}

      </div>

    </section>
  );
}

export default AdminReservations;

