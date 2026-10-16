import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarDays, LogOut, Mail, Phone, User, Award, Clock, Monitor, RefreshCw } from "lucide-react";

import { useAuth } from "../../context/AuthContext";

function Account() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const API_RESERVATIONS = "https://amineaibeche8.pythonanywhere.com/api/reservations/";

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await fetch(API_RESERVATIONS);
        if (!response.ok) throw new Error("Impossible de charger les réservations.");
        const data = await response.json();

        const allReservations = Array.isArray(data) ? data : [];

        // Filtrer les réservations appartenant à l'utilisateur connecté
        // (Vérification par téléphone ou ID selon le retour de votre API)
        const userReservations = allReservations.filter((res) => {
          if (res.player_phone && user.phone) {
            return res.player_phone === user.phone;
          }
          if (res.player_details?.phone && user.phone) {
            return res.player_details.phone === user.phone;
          }
          if (res.player === user.id || res.player_id === user.id) {
            return true;
          }
          return false;
        });

        setReservations(userReservations);
      } catch (err) {
        console.error("Erreur réservations:", err);
        setError("Erreur lors de la récupération de l'historique.");
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchReservations();
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    window.location.assign("/");
  };

  // Helper pour afficher le badge de statut
  const getStatusBadgeClass = (status) => {
    switch (status?.toUpperCase()) {
      case "CONFIRMED":
        return "status-confirmed";
      case "PENDING":
        return "status-pending";
      case "CANCELLED":
        return "status-rejected";
      case "COMPLETED":
        return "status-completed";
      default:
        return "";
    }
  };

  return (
    <section className="auth-page">
      <div className="auth-box account-box" style={{ maxWidth: "600px", width: "100%" }}>
        <div className="auth-title">
          <span>MY ACCOUNT</span>
          <h1>
            HELLO,
            <br />
            <strong>{user?.name ? user.name.split(" ")[0].toUpperCase() : "CLIENT"}.</strong>
          </h1>
        </div>

        {/* Détails du compte client */}
        <ul className="account-details">
          <li>
            <User size={19} />
            <div>
              <small>NAME</small>
              <span>{user?.name}</span>
            </div>
          </li>

          <li>
            <Mail size={19} />
            <div>
              <small>EMAIL</small>
              <span>{user?.email}</span>
            </div>
          </li>

          <li>
            <Phone size={19} />
            <div>
              <small>PHONE</small>
              <span>{user?.phone}</span>
            </div>
          </li>

          <li>
            <Award size={19} />
            <div>
              <small>YOUR POINTS</small>
              <span>{user?.points ?? 0} PTS</span>
            </div>
          </li>
        </ul>

        <button
          type="button"
          className="primary-button full"
          onClick={() => navigate("/reservation")}
          style={{ marginBottom: "25px" }}
        >
          <CalendarDays size={20} />
          BOOK A STATION
        </button>

        {/* Section Historique des Réservations */}
        <div className="account-reservations-section" style={{ marginTop: "20px", textAlign: "left" }}>
          <h3 style={{ fontSize: "16px", fontWeight: "700", marginBottom: "15px", color: "#fff", display: "flex", alignItems: "center", gap: "8px" }}>
            <Clock size={18} /> HISTORIQUE DES RÉSERVATIONS
          </h3>

          {loading && (
            <div style={{ textAlign: "center", padding: "15px", color: "rgba(255,255,255,0.6)" }}>
              <RefreshCw size={20} className="spin" /> Chargement de vos réservations...
            </div>
          )}

          {!loading && error && (
            <p style={{ color: "#ef4444", fontSize: "14px" }}>{error}</p>
          )}

          {!loading && !error && reservations.length === 0 && (
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "14px", fontStyle: "italic" }}>
              Vous n'avez pas encore effectué de réservation.
            </p>
          )}

          {!loading && !error && reservations.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", maxHeight: "300px", overflowY: "auto", paddingRight: "5px" }}>
              {reservations.map((res) => (
                <div
                  key={res.id || res.reservation_number}
                  style={{
                    background: "rgba(255, 255, 255, 0.04)",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    borderRadius: "8px",
                    padding: "12px 15px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                      <Monitor size={16} color="#10b981" />
                      <strong style={{ color: "#fff", fontSize: "14px" }}>
                        {res.station_name || `Station ${res.station}`}
                      </strong>
                    </div>
                    <div style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.6)", display: "flex", gap: "10px" }}>
                      <span>📅 {res.date}</span>
                      <span>⏰ {res.time}</span>
                      <span>⏳ {res.duration}h</span>
                    </div>
                  </div>

                  <span className={`reservation-status ${getStatusBadgeClass(res.status)}`} style={{ fontSize: "11px", padding: "4px 8px", borderRadius: "4px" }}>
                    {res.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          type="button"
          className="auth-logout"
          onClick={handleLogout}
          style={{ marginTop: "25px" }}
        >
          <LogOut size={16} />
          LOGOUT
        </button>
      </div>
    </section>
  );
}

export default Account;