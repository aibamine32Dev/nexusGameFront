import { useEffect, useMemo, useState } from "react";

import {
  Trash2,
  CalendarDays,
  Check,
  X,
  CircleCheck,
  Monitor,
  Clock,
  User,
  Phone,
  Users,
  RefreshCw,
} from "lucide-react";


function AdminReservations() {
  const API_URL =
    "https://nexusgameback.onrender.com/api/reservations/";

  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /*
   * We store the group currently being modified.
   *
   * Example:
   * "GRP-A12B34CD"
   */
  const [updatingGroup, setUpdatingGroup] = useState(null);


  /*
   * =========================================================
   * LOAD RESERVATIONS
   * =========================================================
   */

  const loadReservations = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error(
          "Unable to load reservations."
        );
      }

      const data = await response.json();

      setReservations(
        Array.isArray(data) ? data : []
      );

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


  useEffect(() => {
    loadReservations();
  }, []);


  /*
   * =========================================================
   * GROUP RESERVATIONS
   *
   * All reservations having the same reservation_group
   * become ONE block.
   *
   * Old reservations without reservation_group are kept
   * individually.
   * =========================================================
   */

  const groupedReservations = useMemo(() => {

    const groups = {};

    reservations.forEach((reservation) => {

      /*
       * If reservation_group exists:
       * use it.
       *
       * Otherwise create a temporary group for
       * old reservations.
       */

      const groupKey =
        reservation.reservation_group
          ? reservation.reservation_group
          : `SINGLE-${reservation.id}`;


      if (!groups[groupKey]) {

        groups[groupKey] = {
          groupId: groupKey,

          reservationGroup:
            reservation.reservation_group || null,

          reservationNumber:
            reservation.reservation_number,

          playerName:
            reservation.player_name || "—",

          playerPhone:
            reservation.player_phone || "—",

          date:
            reservation.date,

          time:
            reservation.time,

          duration:
            reservation.duration,

          status:
            reservation.status,

          reservations: [],

          stations: [],

          createdAt:
            reservation.created_at,
        };
      }


      /*
       * Add reservation to group
       */

      groups[groupKey].reservations.push(
        reservation
      );


      /*
       * Add station to group
       */

      groups[groupKey].stations.push({
        id: reservation.station,
        name:
          reservation.station_name ||
          `Station ${reservation.station_number || reservation.station}`,
        number:
          reservation.station_number,
        status:
          reservation.status,
      });


      /*
       * Keep newest creation date
       */

      if (
        new Date(reservation.created_at) >
        new Date(groups[groupKey].createdAt)
      ) {
        groups[groupKey].createdAt =
          reservation.created_at;
      }
    });


    /*
     * =======================================================
     * DETERMINE GROUP STATUS
     *
     * Normally all stations have the same status.
     *
     * If old/inconsistent data contains different statuses,
     * we prioritize:
     *
     * PENDING
     * CONFIRMED
     * COMPLETED
     * CANCELLED
     * =======================================================
     */

    const statusPriority = {
      PENDING: 1,
      CONFIRMED: 2,
      COMPLETED: 3,
      CANCELLED: 4,
    };


    Object.values(groups).forEach((group) => {

      const statuses =
        group.reservations.map(
          (reservation) =>
            reservation.status
        );


      /*
       * If every reservation has the same status,
       * use it directly.
       */

      const allSame =
        statuses.every(
          (status) =>
            status === statuses[0]
        );


      if (allSame) {

        group.status =
          statuses[0];

      } else {

        /*
         * Otherwise use the lowest-priority
         * active state.
         */

        group.status =
          statuses.sort(
            (a, b) =>
              statusPriority[a] -
              statusPriority[b]
          )[0];
      }
    });


    /*
     * Convert object to array and sort
     * newest first.
     */

    return Object.values(groups).sort(
      (a, b) =>
        new Date(b.createdAt) -
        new Date(a.createdAt)
    );

  }, [reservations]);


  /*
   * =========================================================
   * STATUS LABEL
   * =========================================================
   */

  const getStatusLabel = (status) => {

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
   * =========================================================
   * STATUS CSS CLASS
   * =========================================================
   */

  const getStatusClass = (status) => {

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


  /*
   * =========================================================
   * UPDATE WHOLE GROUP
   *
   * Example:
   *
   * GRP-A12B34CD
   *
   * contains 8 reservations.
   *
   * PATCH is sent to all 8 reservations.
   * =========================================================
   */

  const updateGroupStatus = async (
    group,
    newStatus
  ) => {

    /*
     * Prevent two actions at the same time.
     */

    if (updatingGroup) {
      return;
    }


    let confirmationMessage = "";


    if (newStatus === "CONFIRMED") {

      confirmationMessage =
        `Confirm this reservation for all ${group.stations.length} stations?`;

    } else if (newStatus === "CANCELLED") {

      confirmationMessage =
        `Reject this reservation for all ${group.stations.length} stations?`;

    } else if (newStatus === "COMPLETED") {

      confirmationMessage =
        `Mark all ${group.stations.length} stations as completed?`;
    }


    const confirmed =
      window.confirm(
        confirmationMessage
      );


    if (!confirmed) {
      return;
    }


    try {

      setUpdatingGroup(
        group.groupId
      );


      /*
       * =====================================================
       * UPDATE EVERY RESERVATION IN THIS GROUP
       * =====================================================
       */

      const results =
        await Promise.all(

          group.reservations.map(
            async (reservation) => {

              const response =
                await fetch(
                  `${API_URL}${reservation.id}/`,
                  {
                    method: "PATCH",

                    headers: {
                      "Content-Type":
                        "application/json",
                    },

                    body: JSON.stringify({
                      status:
                        newStatus,
                    }),
                  }
                );


              if (!response.ok) {

                const errorData =
                  await response
                    .json()
                    .catch(
                      () => ({})
                    );

                console.error(
                  "Reservation update error:",
                  errorData
                );

                throw new Error(
                  `Unable to update reservation ${reservation.id}`
                );
              }


              return response.json();
            }
          )
        );


      /*
       * Replace all updated reservations
       * in the local state.
       */

      setReservations(
        (previous) =>
          previous.map(
            (reservation) => {

              const updated =
                results.find(
                  (item) =>
                    item.id ===
                    reservation.id
                );

              return updated ||
                reservation;
            }
          )
      );


    } catch (err) {

      console.error(
        "Group status update error:",
        err
      );

      alert(
        "Unable to update all stations of this reservation."
      );

      /*
       * Reload from backend to make sure
       * the UI reflects the real state.
       */

      await loadReservations();

    } finally {

      setUpdatingGroup(null);
    }
  };


  /*
   * =========================================================
   * DELETE WHOLE GROUP
   * =========================================================
   */

  const deleteGroup = async (group) => {

    if (updatingGroup) {
      return;
    }


    const confirmed =
      window.confirm(
        `Delete this reservation and all ${group.stations.length} stations? This action cannot be undone.`
      );


    if (!confirmed) {
      return;
    }


    try {

      setUpdatingGroup(
        group.groupId
      );


      /*
       * Delete every reservation belonging
       * to the same group.
       */

      await Promise.all(

        group.reservations.map(
          async (reservation) => {

            const response =
              await fetch(
                `${API_URL}${reservation.id}/`,
                {
                  method: "DELETE",
                }
              );


            if (!response.ok) {

              throw new Error(
                `Unable to delete reservation ${reservation.id}`
              );
            }
          }
        )
      );


      /*
       * Remove all reservations belonging
       * to this group from the UI.
       */

      const reservationIds =
        new Set(
          group.reservations.map(
            (reservation) =>
              reservation.id
          )
        );


      setReservations(
        (previous) =>
          previous.filter(
            (reservation) =>
              !reservationIds.has(
                reservation.id
              )
          )
      );


    } catch (err) {

      console.error(
        "Delete group error:",
        err
      );

      alert(
        "Unable to delete all stations of this reservation."
      );

      await loadReservations();

    } finally {

      setUpdatingGroup(null);
    }
  };


  /*
   * =========================================================
   * RENDER
   * =========================================================
   */

  return (
    <section className="admin-page">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="admin-page-header">

        <div>

          <span>
            BOOKINGS
          </span>

          <h1>
            RESERVATIONS
            <br />

            <strong>
              MANAGER.
            </strong>
          </h1>

        </div>

      </div>


      {/* =====================================================
          MAIN PANEL
      ===================================================== */}

      <div className="admin-panel">

        <div className="admin-panel-header">

          <h2>
            RESERVATION GROUPS
          </h2>

          <span>
            {groupedReservations.length} BOOKINGS
          </span>

        </div>


        {/* ===================================================
            LOADING
        =================================================== */}

        {loading && (

          <div className="admin-empty">

            <CalendarDays size={45} />

            <p>
              Loading reservations...
            </p>

          </div>
        )}


        {/* ===================================================
            ERROR
        =================================================== */}

        {!loading && error && (

          <div className="admin-empty">

            <CalendarDays size={45} />

            <p>
              {error}
            </p>

            <button
              className="admin-primary-button"
              onClick={loadReservations}
            >
              RETRY
            </button>

          </div>
        )}


        {/* ===================================================
            EMPTY
        =================================================== */}

        {!loading &&
          !error &&
          groupedReservations.length === 0 && (

            <div className="admin-empty">

              <CalendarDays size={45} />

              <p>
                No reservations found.
              </p>

            </div>
          )}


        {/* ===================================================
            RESERVATION GROUPS
        =================================================== */}

        {!loading &&
          !error &&
          groupedReservations.length > 0 && (

            <div className="reservation-groups">

              {groupedReservations.map(
                (group) => {

                  const isUpdating =
                    updatingGroup ===
                    group.groupId;


                  return (

                    <div
                      key={
                        group.groupId
                      }
                      className="reservation-group-card"
                    >

                      {/* =====================================
                          GROUP HEADER
                      ====================================== */}

                      <div className="reservation-group-header">

                        <div className="reservation-group-title">

                          <div className="reservation-group-icon">

                            <Users
                              size={22}
                            />

                          </div>

                          <div>

                            <span className="reservation-group-label">
                              RESERVATION GROUP
                            </span>

                            <h3>
                              {group.reservationGroup ||
                                group.reservationNumber}
                            </h3>

                          </div>

                        </div>


                        <span
                          className={`reservation-status ${getStatusClass(
                            group.status
                          )}`}
                        >
                          {getStatusLabel(
                            group.status
                          )}
                        </span>

                      </div>


                      {/* =====================================
                          CLIENT INFORMATION
                      ====================================== */}

                      <div className="reservation-group-info">

                        <div className="reservation-info-item">

                          <User
                            size={18}
                          />

                          <div>

                            <span>
                              PLAYER
                            </span>

                            <strong>
                              {group.playerName}
                            </strong>

                          </div>

                        </div>


                        <div className="reservation-info-item">

                          <Phone
                            size={18}
                          />

                          <div>

                            <span>
                              PHONE
                            </span>

                            <strong>
                              {group.playerPhone}
                            </strong>

                          </div>

                        </div>


                        <div className="reservation-info-item">

                          <CalendarDays
                            size={18}
                          />

                          <div>

                            <span>
                              DATE
                            </span>

                            <strong>
                              {group.date}
                            </strong>

                          </div>

                        </div>


                        <div className="reservation-info-item">

                          <Clock
                            size={18}
                          />

                          <div>

                            <span>
                              TIME
                            </span>

                            <strong>
                              {group.time}
                            </strong>

                          </div>

                        </div>


                        <div className="reservation-info-item">

                          <Clock
                            size={18}
                          />

                          <div>

                            <span>
                              DURATION
                            </span>

                            <strong>
                              {group.duration} H
                            </strong>

                          </div>

                        </div>


                        <div className="reservation-info-item">

                          <Monitor
                            size={18}
                          />

                          <div>

                            <span>
                              STATIONS
                            </span>

                            <strong>
                              {group.stations.length}
                            </strong>

                          </div>

                        </div>

                      </div>


                      {/* =====================================
                          STATIONS
                      ====================================== */}

                      <div className="reservation-stations-section">

                        <div className="reservation-stations-title">

                          <Monitor
                            size={19}
                          />

                          <span>
                            RESERVED STATIONS
                          </span>

                        </div>


                        <div className="reservation-stations-list">

                          {group.stations
                            .sort(
                              (a, b) =>
                                (a.number || 0) -
                                (b.number || 0)
                            )
                            .map(
                              (
                                station
                              ) => (

                                <div
                                  key={
                                    station.id
                                  }
                                  className="reservation-station-chip"
                                >

                                  <Monitor
                                    size={16}
                                  />

                                  <span>
                                    {station.name}
                                  </span>

                                </div>

                              )
                            )}

                        </div>

                      </div>


                      {/* =====================================
                          ACTIONS
                      ====================================== */}

                      <div className="reservation-group-actions">

                        <div className="reservation-group-action-info">

                          <span>
                            {group.stations.length} stations
                          </span>

                          <small>
                            Actions apply to the entire reservation
                          </small>

                        </div>


                        <div className="reservation-actions">

                          {/* =================================
                              CONFIRM
                          ================================= */}

                          {group.status ===
                            "PENDING" && (

                            <button
                              className="confirm-button"
                              title="Confirm entire reservation"
                              disabled={
                                isUpdating
                              }
                              onClick={() =>
                                updateGroupStatus(
                                  group,
                                  "CONFIRMED"
                                )
                              }
                            >

                              {isUpdating ? (
                                <RefreshCw
                                  size={17}
                                  className="spin"
                                />
                              ) : (
                                <Check
                                  size={17}
                                />
                              )}

                            </button>
                          )}


                          {/* =================================
                              COMPLETE
                          ================================= */}

                          {group.status ===
                            "CONFIRMED" && (

                            <button
                              className="complete-button"
                              title="Complete entire reservation"
                              disabled={
                                isUpdating
                              }
                              onClick={() =>
                                updateGroupStatus(
                                  group,
                                  "COMPLETED"
                                )
                              }
                            >

                              {isUpdating ? (
                                <RefreshCw
                                  size={17}
                                  className="spin"
                                />
                              ) : (
                                <CircleCheck
                                  size={17}
                                />
                              )}

                            </button>
                          )}


                          {/* =================================
                              REJECT
                          ================================= */}

                          {(group.status ===
                            "PENDING" ||
                            group.status ===
                              "CONFIRMED") && (

                            <button
                              className="reject-button"
                              title="Reject entire reservation"
                              disabled={
                                isUpdating
                              }
                              onClick={() =>
                                updateGroupStatus(
                                  group,
                                  "CANCELLED"
                                )
                              }
                            >

                              <X
                                size={17}
                              />

                            </button>
                          )}


                          {/* =================================
                              DELETE
                          ================================= */}

                          <button
                            className="delete-button"
                            title="Delete entire reservation"
                            disabled={
                              isUpdating
                            }
                            onClick={() =>
                              deleteGroup(
                                group
                              )
                            }
                          >

                            {isUpdating ? (
                              <RefreshCw
                                size={17}
                                className="spin"
                              />
                            ) : (
                              <Trash2
                                size={17}
                              />
                            )}

                          </button>

                        </div>

                      </div>

                    </div>
                  );
                }
              )}

            </div>
          )}

      </div>

    </section>
  );
}

export default AdminReservations;