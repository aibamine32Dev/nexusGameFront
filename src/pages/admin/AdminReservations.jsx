import { useEffect, useState } from "react";

import {
  Trash2,
  CalendarDays,
  Check,
  X,
  CircleCheck,
} from "lucide-react";

function AdminReservations() {
  const API_URL =
    "https://nexusgameback.onrender.com/api/reservations/";

  const [reservations, setReservations] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [updatingId, setUpdatingId] =
    useState(null);

  /*
   * Load reservations from Django
   */
  const loadReservations = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        API_URL
      );

      if (!response.ok) {
        throw new Error(
          "Unable to load reservations"
        );
      }

      const data =
        await response.json();

      setReservations(data);

    } catch (err) {
      console.error(
        "Reservations API error:",
        err
      );

      setError(
        "Unable to load reservations."
      );
    } finally {
      setLoading(false);
    }
  };

  /*
   * Load when page opens
   */
  useEffect(() => {
    loadReservations();
  }, []);

  /*
   * Change reservation status
   */
  const updateStatus = async (
    reservationId,
    status
  ) => {
    try {
      setUpdatingId(reservationId);

      const response = await fetch(
        `${API_URL}${reservationId}/`,
        {
          method: "PATCH",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            status: status,
          }),
        }
      );

      if (!response.ok) {
        const errorData =
          await response.json();

        console.error(
          "Update reservation error:",
          errorData
        );

        throw new Error(
          "Unable to update reservation"
        );
      }

      const updatedReservation =
        await response.json();

      /*
       * Update only the modified
       * reservation in the state
       */
      setReservations(
        (previous) =>
          previous.map(
            (reservation) =>
              reservation.id ===
              reservationId
                ? updatedReservation
                : reservation
          )
      );

    } catch (err) {
      console.error(
        "Status update error:",
        err
      );

      alert(
        "Unable to update the reservation."
      );
    } finally {
      setUpdatingId(null);
    }
  };

  /*
   * Delete reservation
   */
  const deleteReservation = async (
    reservationId
  ) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this reservation?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setUpdatingId(reservationId);

      const response = await fetch(
        `${API_URL}${reservationId}/`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error(
          "Unable to delete reservation"
        );
      }

      setReservations(
        (previous) =>
          previous.filter(
            (reservation) =>
              reservation.id !==
              reservationId
          )
      );

    } catch (err) {
      console.error(
        "Delete reservation error:",
        err
      );

      alert(
        "Unable to delete the reservation."
      );
    } finally {
      setUpdatingId(null);
    }
  };

  /*
   * Status label
   */
  const getStatusLabel = (
    status
  ) => {
    switch (status) {
      case "PENDING":
        return "PENDING";

      case "CONFIRMED":
        return "CONFIRMED";

      case "COMPLETED":
        return "COMPLETED";

      case "CANCELLED":
        return "REJECTED";

      default:
        return status;
    }
  };

  /*
   * Status class
   */
  const getStatusClass = (
    status
  ) => {
    switch (status) {
      case "PENDING":
        return "status-pending";

      case "CONFIRMED":
        return "status-confirmed";

      case "COMPLETED":
        return "status-completed";

      case "CANCELLED":
        return "status-cancelled";

      default:
        return "";
    }
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

        {loading ? (

          <div className="admin-empty">

            <CalendarDays
              size={45}
            />

            <p>
              Loading reservations...
            </p>

          </div>

        ) : error ? (

          <div className="admin-empty">

            <CalendarDays
              size={45}
            />

            <p>
              {error}
            </p>

            <button
              className="admin-primary-button"
              onClick={
                loadReservations
              }
            >
              RETRY
            </button>

          </div>

        ) : reservations.length ===
          0 ? (

          <div className="admin-empty">

            <CalendarDays
              size={45}
            />

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
                  <th>STATUS</th>
                  <th>ACTIONS</th>
                </tr>

              </thead>

              <tbody>

                {reservations
                  .slice()
                  .sort(
                    (a, b) =>
                      new Date(
                        b.created_at
                      ) -
                      new Date(
                        a.created_at
                      )
                  )
                  .map(
                    (reservation) => (

                      <tr
                        key={
                          reservation.id
                        }
                      >

                        {/* NUMBER */}

                        <td>
                          {
                            reservation.reservation_number
                          }
                        </td>

                        {/* PLAYER */}

                        <td>
                          {
                            reservation.player_name
                          }
                        </td>

                        {/* PHONE */}

                        <td>
                          {
                            reservation.player_phone
                          }
                        </td>

                        {/* GAME */}

                        <td>
                          {
                            reservation.game_name
                          }
                        </td>

                        {/* DATE */}

                        <td>
                          {
                            reservation.date
                          }
                        </td>

                        {/* TIME */}

                        <td>
                          {
                            reservation.time
                          }
                        </td>

                        {/* DURATION */}

                        <td>
                          {
                            reservation.duration
                          }{" "}
                          H
                        </td>

                        {/* STATUS */}

                        <td>

                          <span
                            className={`reservation-status ${getStatusClass(
                              reservation.status
                            )}`}
                          >
                            {getStatusLabel(
                              reservation.status
                            )}
                          </span>

                        </td>

                        {/* ACTIONS */}

                        <td>

                          <div className="reservation-actions">

                            {/* CONFIRM */}

                            {reservation.status ===
                              "PENDING" && (

                              <button
                                className="confirm-button"
                                title="Confirm reservation"
                                disabled={
                                  updatingId ===
                                  reservation.id
                                }
                                onClick={() =>
                                  updateStatus(
                                    reservation.id,
                                    "CONFIRMED"
                                  )
                                }
                              >
                                <Check
                                  size={17}
                                />
                              </button>

                            )}

                            {/* COMPLETE */}

                            {reservation.status ===
                              "CONFIRMED" && (

                              <button
                                className="complete-button"
                                title="Complete reservation"
                                disabled={
                                  updatingId ===
                                  reservation.id
                                }
                                onClick={() =>
                                  updateStatus(
                                    reservation.id,
                                    "COMPLETED"
                                  )
                                }
                              >
                                <CircleCheck
                                  size={17}
                                />
                              </button>

                            )}

                            {/* REJECT */}

                            {(
                              reservation.status ===
                                "PENDING" ||
                              reservation.status ===
                                "CONFIRMED"
                            ) && (

                              <button
                                className="reject-button"
                                title="Reject reservation"
                                disabled={
                                  updatingId ===
                                  reservation.id
                                }
                                onClick={() =>
                                  updateStatus(
                                    reservation.id,
                                    "CANCELLED"
                                  )
                                }
                              >
                                <X
                                  size={17}
                                />
                              </button>

                            )}

                            {/* DELETE */}

                            <button
                              className="delete-button"
                              title="Delete reservation"
                              disabled={
                                updatingId ===
                                reservation.id
                              }
                              onClick={() =>
                                deleteReservation(
                                  reservation.id
                                )
                              }
                            >
                              <Trash2
                                size={17}
                              />
                            </button>

                          </div>

                        </td>

                      </tr>

                    )
                  )}

              </tbody>

            </table>

          </div>

        )}

      </div>

    </section>
  );
}

export default AdminReservations;