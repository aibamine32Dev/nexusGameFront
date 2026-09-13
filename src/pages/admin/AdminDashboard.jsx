
import {
  CalendarDays,
  Gamepad2,
  Users,
  TrendingUp,
} from "lucide-react";

function AdminDashboard() {

  const reservations = JSON.parse(
    localStorage.getItem("nexusReservations") || "[]"
  );

  return (
    <section className="admin-page">

      <div className="admin-page-header">
        <div>
          <span>OVERVIEW</span>

          <h1>
            DASHBOARD
            <br />
            <strong>CONTROL.</strong>
          </h1>
        </div>

        <div className="admin-status">
          <span></span>
          SYSTEM ONLINE
        </div>
      </div>

      <div className="admin-stats">

        <div className="admin-stat-card">
          <CalendarDays size={28} />

          <span>TOTAL RESERVATIONS</span>

          <strong>
            {reservations.length}
          </strong>
        </div>

        <div className="admin-stat-card">
          <Gamepad2 size={28} />

          <span>AVAILABLE GAMES</span>

          <strong>6</strong>
        </div>

        <div className="admin-stat-card">
          <Users size={28} />

          <span>PLAYERS</span>

          <strong>
            {reservations.length}
          </strong>
        </div>

        <div className="admin-stat-card">
          <TrendingUp size={28} />

          <span>REVENUE</span>

          <strong>0 DA</strong>
        </div>

      </div>

      <div className="admin-panel">

        <div className="admin-panel-header">
          <h2>RECENT RESERVATIONS</h2>
        </div>

        {reservations.length === 0 ? (
          <div className="admin-empty">
            <CalendarDays size={40} />
            <p>No reservations yet.</p>
          </div>
        ) : (
          <div className="admin-table-wrapper">
            <table className="admin-table">

              <thead>
                <tr>
                  <th>RESERVATION</th>
                  <th>PLAYER</th>
                  <th>DATE</th>
                  <th>TIME</th>
                </tr>
              </thead>

              <tbody>
                {reservations.slice(-5).reverse().map((reservation) => (
                  <tr key={reservation.reservationNumber}>

                    <td>
                      {reservation.reservationNumber}
                    </td>

                    <td>
                      {reservation.name}
                    </td>

                    <td>
                      {reservation.date}
                    </td>

                    <td>
                      {reservation.time}
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

export default AdminDashboard;

