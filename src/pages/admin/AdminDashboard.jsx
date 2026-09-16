import { useEffect, useState } from "react";

import {
  CalendarDays,
  Gamepad2,
  Users,
  TrendingUp,
  Bell,
  X,
} from "lucide-react";

function AdminDashboard() {
  const API_URL =
    "https://nexusgameback.onrender.com/api";

  const [reservations, setReservations] =
    useState([]);

  const [games, setGames] =
    useState([]);

  const [players, setPlayers] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  /*
   * Notification
   */
  const [notification, setNotification] =
    useState(null);

  /*
   * Store the IDs of reservations
   * already known by the dashboard.
   */
  const [knownReservationIds, setKnownReservationIds] =
    useState(new Set());

  /*
   * Load dashboard data
   */
  const loadDashboard = async (
    isInitialLoad = false
  ) => {
    try {
      if (isInitialLoad) {
        setLoading(true);
      }

      setError("");

      const [
        reservationsResponse,
        gamesResponse,
        playersResponse,
      ] = await Promise.all([
        fetch(
          `${API_URL}/reservations/`
        ),
        fetch(
          `${API_URL}/games/`
        ),
        fetch(
          `${API_URL}/players/`
        ),
      ]);

      if (
        !reservationsResponse.ok ||
        !gamesResponse.ok ||
        !playersResponse.ok
      ) {
        throw new Error(
          "Unable to load dashboard data"
        );
      }

      const reservationsData =
        await reservationsResponse.json();

      const gamesData =
        await gamesResponse.json();

      const playersData =
        await playersResponse.json();

      /*
       * Detect new reservations
       *
       * We only check for new reservations
       * after the initial loading.
       */
      if (!isInitialLoad) {
        const newReservations =
          reservationsData.filter(
            (reservation) =>
              !knownReservationIds.has(
                reservation.id
              )
          );

        if (
          newReservations.length > 0
        ) {
          /*
           * Take the newest reservation
           */
          const newestReservation =
            [...newReservations].sort(
              (a, b) =>
                new Date(
                  b.created_at
                ) -
                new Date(
                  a.created_at
                )
            )[0];

          /*
           * Show notification only for
           * pending reservations.
           */
          if (
            newestReservation.status ===
            "PENDING"
          ) {
            setNotification(
              newestReservation
            );
          }
        }
      }

      /*
       * Update known reservation IDs
       */
      setKnownReservationIds(
        new Set(
          reservationsData.map(
            (reservation) =>
              reservation.id
          )
        )
      );

      setReservations(
        reservationsData
      );

      setGames(gamesData);

      setPlayers(playersData);

    } catch (err) {
      console.error(
        "Dashboard API error:",
        err
      );

      setError(
        "Unable to load dashboard data."
      );
    } finally {
      if (isInitialLoad) {
        setLoading(false);
      }
    }
  };

  /*
   * Initial loading
   */
  useEffect(() => {
    loadDashboard(true);
  }, []);

  /*
   * Check for new reservations
   * every 5 seconds.
   */
  useEffect(() => {
    const interval =
      setInterval(() => {
        loadDashboard(false);
      }, 5000);

    return () => {
      clearInterval(interval);
    };
  }, [knownReservationIds]);

  /*
   * Automatically hide notification
   * after 8 seconds.
   */
  useEffect(() => {
    if (!notification) {
      return;
    }

    const timer =
      setTimeout(() => {
        setNotification(null);
      }, 10000);

    return () => {
      clearTimeout(timer);
    };
  }, [notification]);

  /*
   * Available games
   */
  const availableGames =
    games.filter(
      (game) =>
        game.available
    );

  /*
   * Revenue
   *
   * ONLY COMPLETED reservations
   *
   * price × duration
   */
  const revenue =
    reservations.reduce(
      (total, reservation) => {

        /*
         * Ignore reservations that are
         * not completed.
         */
        if (
          reservation.status !==
          "COMPLETED"
        ) {
          return total;
        }

        const game =
          games.find(
            (game) =>
              game.id ===
              reservation.game
          );

        if (!game) {
          return total;
        }

        const price =
          Number(game.price) || 0;

        const duration =
          Number(
            reservation.duration
          ) || 0;

        return (
          total +
          price * duration
        );
      },
      0
    );

  /*
   * Last 5 reservations
   */
  const recentReservations =
    [...reservations]
      .sort(
        (a, b) =>
          new Date(
            b.created_at
          ) -
          new Date(
            a.created_at
          )
      )
      .slice(0, 5);

  /*
   * Close notification
   */
  const closeNotification = () => {
    setNotification(null);
  };

  return (
    <section className="admin-page">

      {/* =====================================
          NEW RESERVATION NOTIFICATION
      ====================================== */}

      {notification && (
        <div className="admin-notification">

          <div className="admin-notification-icon">
            <Bell size={22} />
          </div>

          <div className="admin-notification-content">

            <strong>
              NEW RESERVATION
            </strong>

            <span>
              {notification.player_name}
              {" - "}
              {notification.game_name}
            </span>

            <small>
              {notification.date}
              {" at "}
              {notification.time}
            </small>

          </div>

          <button
            className="admin-notification-close"
            onClick={
              closeNotification
            }
          >
            <X size={18} />
          </button>

        </div>
      )}

      {/* =====================================
          HEADER
      ====================================== */}

      <div className="admin-page-header">

        <div>

          <span>
            OVERVIEW
          </span>

          <h1>
            DASHBOARD
            <br />
            <strong>
              CONTROL.
            </strong>
          </h1>

        </div>

        <div className="admin-status">

          <span></span>

          SYSTEM ONLINE

        </div>

      </div>

      {/* =====================================
          LOADING
      ====================================== */}

      {loading ? (

        <div className="admin-empty">

          <CalendarDays
            size={40}
          />

          <p>
            LOADING DASHBOARD...
          </p>

        </div>

      ) : error ? (

        /* =====================================
           ERROR
        ====================================== */

        <div className="admin-empty">

          <CalendarDays
            size={40}
          />

          <p>
            {error}
          </p>

          <button
            className="admin-primary-button"
            onClick={() =>
              loadDashboard(true)
            }
          >
            RETRY
          </button>

        </div>

      ) : (

        /* =====================================
           DASHBOARD CONTENT
        ====================================== */

        <>

          <div className="admin-stats">

            {/* TOTAL RESERVATIONS */}

            <div className="admin-stat-card">

              <CalendarDays
                size={28}
              />

              <span>
                TOTAL RESERVATIONS
              </span>

              <strong>
                {
                  reservations.length
                }
              </strong>

            </div>

            {/* AVAILABLE GAMES */}

            <div className="admin-stat-card">

              <Gamepad2
                size={28}
              />

              <span>
                AVAILABLE GAMES
              </span>

              <strong>
                {
                  availableGames.length
                }
              </strong>

            </div>

            {/* PLAYERS */}

            <div className="admin-stat-card">

              <Users
                size={28}
              />

              <span>
                PLAYERS
              </span>

              <strong>
                {players.length}
              </strong>

            </div>

            {/* REVENUE */}

            <div className="admin-stat-card">

              <TrendingUp
                size={28}
              />

              <span>
                REVENUE
              </span>

              <strong>
                {
                  revenue.toLocaleString(
                    "fr-DZ"
                  )
                }{" "}
                DA
              </strong>

            </div>

          </div>

          {/* =====================================
              RECENT RESERVATIONS
          ====================================== */}

          <div className="admin-panel">

            <div className="admin-panel-header">

              <h2>
                RECENT RESERVATIONS
              </h2>

            </div>

            {recentReservations.length ===
            0 ? (

              <div className="admin-empty">

                <CalendarDays
                  size={40}
                />

                <p>
                  No reservations yet.
                </p>

              </div>

            ) : (

              <div className="admin-table-wrapper">

                <table className="admin-table">

                  <thead>

                    <tr>

                      <th>
                        RESERVATION
                      </th>

                      <th>
                        PLAYER
                      </th>

                      <th>
                        DATE
                      </th>

                      <th>
                        TIME
                      </th>

                      <th>
                        STATUS
                      </th>

                    </tr>

                  </thead>

                  <tbody>

                    {recentReservations.map(
                      (
                        reservation
                      ) => (

                        <tr
                          key={
                            reservation.id
                          }
                        >

                          <td>
                            {
                              reservation.reservation_number
                            }
                          </td>

                          <td>
                            {
                              reservation.player_name
                            }
                          </td>

                          <td>
                            {
                              reservation.date
                            }
                          </td>

                          <td>
                            {
                              reservation.time
                            }
                          </td>

                          <td>

                            <span
                              className={`reservation-status ${
                                reservation.status ===
                                "PENDING"
                                  ? "status-pending"
                                  : reservation.status ===
                                    "CONFIRMED"
                                  ? "status-confirmed"
                                  : reservation.status ===
                                    "COMPLETED"
                                  ? "status-completed"
                                  : "status-cancelled"
                              }`}
                            >
                              {
                                reservation.status
                              }
                            </span>

                          </td>

                        </tr>

                      )
                    )}

                  </tbody>

                </table>

              </div>

            )}

          </div>

        </>

      )}

    </section>
  );
}

export default AdminDashboard;