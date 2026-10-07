import { useEffect, useMemo, useState } from "react";
import {
  Gamepad2,
  Users,
  CalendarDays,
  Clock,
  Phone,
  Mail,
  Hash,
  Check,
  X,
  Trash2,
  Trophy,
  RefreshCw,
  User,
  AtSign,
  Info,
} from "lucide-react";

function AdminMatches() {
  const API_URL = "https://nexusgameback.onrender.com/api/matches/";

  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingMatch, setUpdatingMatch] = useState(null);

  // =========================================================
  // LOAD MATCHES
  // =========================================================

  const loadMatches = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error("Impossible de charger les matchs.");
      }

      const data = await response.json();

      console.log("MATCHES API RESPONSE:", data);

      setMatches(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Erreur chargement matchs:", err);

      setError(err.message || "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMatches();
  }, []);

  // =========================================================
  // STATUS
  // =========================================================

  const getStatusLabel = (status) => {
    switch (status) {
      case "PENDING":
        return "PENDING";
      case "READY":
        return "READY";
      case "CONFIRMED":
        return "CONFIRMED";
      case "CANCELLED":
        return "CANCELLED";
      case "COMPLETED":
        return "COMPLETED";
      default:
        return status || "UNKNOWN";
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "PENDING":
        return "status-pending";
      case "READY":
        return "status-ready";
      case "CONFIRMED":
        return "status-confirmed";
      case "CANCELLED":
        return "status-cancelled";
      case "COMPLETED":
        return "status-completed";
      default:
        return "status-pending";
    }
  };

  // =========================================================
  // FORMAT DATE JOINED
  // =========================================================

  const formatJoinedAt = (date) => {
    if (!date) {
      return "-";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }

    return parsedDate.toLocaleString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // =========================================================
  // PLAYER HELPERS
  // Le serializer peut renvoyer les infos à plat
  // (player_name, player_phone...) ou dans un objet imbriqué
  // (player_details / player_info). On gère les deux cas.
  // =========================================================

  const getPlayerDetails = (matchPlayer) => {
    const nested =
      (matchPlayer.player_details &&
        typeof matchPlayer.player_details === "object" &&
        matchPlayer.player_details) ||
      (matchPlayer.player_info &&
        typeof matchPlayer.player_info === "object" &&
        matchPlayer.player_info) ||
      (matchPlayer.player &&
        typeof matchPlayer.player === "object" &&
        matchPlayer.player) ||
      {};

    const playerId =
      typeof matchPlayer.player === "object"
        ? matchPlayer.player?.id
        : matchPlayer.player;

    return {
      id: playerId ?? nested.id ?? "-",
      name:
        matchPlayer.player_name ||
        nested.name ||
        nested.full_name ||
        [nested.first_name, nested.last_name]
          .filter(Boolean)
          .join(" ") ||
        "-",
      phone:
        matchPlayer.player_phone ||
        nested.phone ||
        nested.phone_number ||
        "-",
      email:
        matchPlayer.player_email ||
        nested.email ||
        "-",
      username:
        matchPlayer.player_username ||
        nested.username ||
        "",
      status: matchPlayer.status || "",
      notes: matchPlayer.notes || "",
      joinedAt: matchPlayer.joined_at,
    };
  };

  // =========================================================
  // SORT
  // =========================================================

  const statusPriority = {
    READY: 1,
    PENDING: 2,
    CONFIRMED: 3,
    CANCELLED: 4,
    COMPLETED: 5,
  };

  const sortedMatches = useMemo(() => {
    return [...matches].sort((a, b) => {
      const priorityA = statusPriority[a.status] || 99;
      const priorityB = statusPriority[b.status] || 99;

      if (priorityA !== priorityB) {
        return priorityA - priorityB;
      }

      return new Date(b.created_at || 0) - new Date(a.created_at || 0);
    });
  }, [matches]);

  // =========================================================
  // UPDATE MATCH STATUS
  // =========================================================

  const updateMatchStatus = async (match, newStatus) => {
    if (!match?.id) {
      return;
    }

    let action = "";

    switch (newStatus) {
      case "CONFIRMED":
        action = "confirm";
        break;
      case "CANCELLED":
        action = "cancel";
        break;
      case "COMPLETED":
        action = "complete";
        break;
      default:
        return;
    }

    let confirmationMessage = "";

    if (newStatus === "CONFIRMED") {
      confirmationMessage = `Confirm match ${match.match_number}?`;
    }

    if (newStatus === "CANCELLED") {
      confirmationMessage = `Cancel match ${match.match_number}?`;
    }

    if (newStatus === "COMPLETED") {
      confirmationMessage = `Complete match ${match.match_number}?`;
    }

    if (!window.confirm(confirmationMessage)) {
      return;
    }

    try {
      setUpdatingMatch(match.id);
      setError("");

      const response = await fetch(`${API_URL}${match.id}/${action}/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);

        throw new Error(
          errorData?.detail ||
            errorData?.message ||
            `Impossible d'effectuer l'action ${action}.`
        );
      }

      const updatedMatch = await response.json().catch(() => null);

      setMatches((currentMatches) =>
        currentMatches.map((item) => {
          if (item.id !== match.id) {
            return item;
          }

          if (updatedMatch && updatedMatch.id) {
            return updatedMatch;
          }

          return {
            ...item,
            status: newStatus,
          };
        })
      );
    } catch (err) {
      console.error("Erreur statut match:", err);

      setError(err.message || "Impossible de modifier le statut.");

      await loadMatches();
    } finally {
      setUpdatingMatch(null);
    }
  };

  // =========================================================
  // DELETE MATCH
  // =========================================================

  const deleteMatch = async (match) => {
    if (!match?.id) {
      return;
    }

    const confirmed = window.confirm(
      `Delete match ${match.match_number}?\n\nThis action cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    try {
      setUpdatingMatch(match.id);
      setError("");

      const response = await fetch(`${API_URL}${match.id}/`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);

        throw new Error(
          errorData?.detail ||
            errorData?.message ||
            "Impossible de supprimer le match."
        );
      }

      setMatches((currentMatches) =>
        currentMatches.filter((item) => item.id !== match.id)
      );
    } catch (err) {
      console.error("Erreur suppression:", err);

      setError(err.message || "Impossible de supprimer le match.");

      await loadMatches();
    } finally {
      setUpdatingMatch(null);
    }
  };

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="admin-page">
      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="admin-page-header">
        <div>
          <h1>
            <Gamepad2 size={28} />
            MATCH MANAGEMENT
          </h1>

          <p>Manage gaming matches and players.</p>
        </div>

        <button
          className="admin-primary-button"
          onClick={loadMatches}
          disabled={loading}
        >
          <RefreshCw size={17} className={loading ? "spin" : ""} />
          REFRESH
        </button>
      </div>

      {/* =====================================================
          PANEL
      ===================================================== */}

      <div className="admin-panel">
        <div className="admin-panel-header">
          <div>
            <h2>
              <Gamepad2 size={21} />
              MATCHES
            </h2>

            <span>
              {matches.length} match
              {matches.length !== 1 ? "es" : ""}
            </span>
          </div>
        </div>

        {/* ERROR */}

        {error && <div className="admin-error">{error}</div>}

        {/* LOADING */}

        {loading ? (
          <div className="admin-empty">
            <RefreshCw size={35} className="spin" />
            <p>Loading matches...</p>
          </div>
        ) : sortedMatches.length === 0 ? (
          <div className="admin-empty">
            <Gamepad2 size={45} />
            <h3>NO MATCH FOUND</h3>
            <p>There are currently no matches.</p>
          </div>
        ) : (
          /* =================================================
             MATCHES
          ================================================= */

          <div className="reservation-groups">
            {sortedMatches.map((match) => {
              const players = Array.isArray(match.players)
                ? match.players
                : [];

              const playersJoined = Number(
                match.players_joined ?? players.length ?? 0
              );

              const playersNeeded = Number(match.players_needed || 0);

              const isUpdating = updatingMatch === match.id;

              return (
                <div key={match.id} className="reservation-group-card">
                  {/* =========================================
                      MATCH HEADER
                  ========================================== */}

                  <div className="reservation-group-header">
                    <div className="reservation-group-title">
                      <div className="reservation-group-icon">
                        <Gamepad2 size={20} />
                      </div>

                      <div>
                        <span className="reservation-group-label">
                          MATCH
                        </span>

                        <h3>{match.match_number}</h3>
                      </div>
                    </div>

                    <div
                      className={`reservation-status ${getStatusClass(
                        match.status
                      )}`}
                    >
                      {getStatusLabel(match.status)}
                    </div>
                  </div>

                  {/* =========================================
                      MATCH INFORMATION
                  ========================================== */}

                  <div className="reservation-group-info">
                    {/* GAME */}

                    <div className="reservation-info-item">
                      <Gamepad2 size={18} />

                      <div>
                        <span>GAME</span>
                        <strong>{match.game_name}</strong>
                      </div>
                    </div>

                    {/* PLATFORM */}

                    <div className="reservation-info-item">
                      <Trophy size={18} />

                      <div>
                        <span>PLATFORM</span>
                        <strong>{match.platform}</strong>
                      </div>
                    </div>

                    {/* DATE */}

                    <div className="reservation-info-item">
                      <CalendarDays size={18} />

                      <div>
                        <span>DATE</span>
                        <strong>{match.date}</strong>
                      </div>
                    </div>

                    {/* TIME */}

                    <div className="reservation-info-item">
                      <Clock size={18} />

                      <div>
                        <span>TIME</span>
                        <strong>
                          {match.time ? match.time.substring(0, 5) : "-"}
                        </strong>
                      </div>
                    </div>

                    {/* PLAYERS */}

                    <div className="reservation-info-item">
                      <Users size={18} />

                      <div>
                        <span>PLAYERS</span>
                        <strong>
                          {playersJoined} / {playersNeeded}
                        </strong>
                      </div>
                    </div>
                  </div>

                  {/* =========================================
                      ALL PLAYERS (CLIENTS DU MATCH)
                  ========================================== */}

                  <div className="reservation-stations-section">
                    <div className="reservation-stations-title">
                      <Users size={18} />

                      <span>
                        MATCH PLAYERS ({players.length})
                      </span>
                    </div>

                    {players.length > 0 ? (
                      <div className="match-players-grid">
                        {players.map((matchPlayer, index) => {
                          const info = getPlayerDetails(matchPlayer);

                          return (
                            <div
                              key={matchPlayer.id ?? `${match.id}-${index}`}
                              className="match-player-card"
                            >
                              {/* PLAYER HEADER */}

                              <div className="match-player-header">
                                <div className="match-player-icon">
                                  <User size={20} />
                                </div>

                                <div>
                                  <strong>{info.name}</strong>

                                  <span>Player #{index + 1}</span>
                                </div>
                              </div>

                              {/* PLAYER ID */}

                              <div className="match-player-info">
                                <Hash size={16} />

                                <span>Player ID: {info.id}</span>
                              </div>

                              {/* USERNAME */}

                              {info.username && (
                                <div className="match-player-info">
                                  <AtSign size={16} />

                                  <span>Username: {info.username}</span>
                                </div>
                              )}

                              {/* PHONE */}

                              <div className="match-player-info">
                                <Phone size={16} />

                                <span>{info.phone}</span>
                              </div>

                              {/* EMAIL */}

                              <div className="match-player-info">
                                <Mail size={16} />

                                <span>{info.email}</span>
                              </div>

                              {/* PLAYER STATUS */}

                              {info.status && (
                                <div className="match-player-info">
                                  <Info size={16} />

                                  <span>Status: {info.status}</span>
                                </div>
                              )}

                              {/* NOTES */}

                              {info.notes && (
                                <div className="match-player-info">
                                  <Info size={16} />

                                  <span>Notes: {info.notes}</span>
                                </div>
                              )}

                              {/* JOINED AT */}

                              <div className="match-player-info">
                                <Clock size={16} />

                                <span>
                                  Joined: {formatJoinedAt(info.joinedAt)}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="admin-empty">
                        <Users size={30} />

                        <p>No players have joined this match yet.</p>
                      </div>
                    )}
                  </div>

                  {/* =========================================
                      ACTIONS
                  ========================================== */}

                  <div className="reservation-group-actions">
                    <div className="reservation-group-action-info">
                      Current status:
                      <strong style={{ marginLeft: "6px" }}>
                        {getStatusLabel(match.status)}
                      </strong>
                    </div>

                    <div className="reservation-actions">
                      {/* CONFIRM */}

                      <button
                        className="confirm-button"
                        onClick={() => updateMatchStatus(match, "CONFIRMED")}
                        disabled={isUpdating}
                      >
                        {isUpdating ? (
                          <RefreshCw size={16} className="spin" />
                        ) : (
                          <Check size={16} />
                        )}
                        CONFIRM
                      </button>

                      {/* CANCEL */}

                      <button
                        className="reject-button"
                        onClick={() => updateMatchStatus(match, "CANCELLED")}
                        disabled={isUpdating}
                      >
                        {isUpdating ? (
                          <RefreshCw size={16} className="spin" />
                        ) : (
                          <X size={16} />
                        )}
                        CANCEL
                      </button>

                      {/* COMPLETE */}

                      <button
                        className="complete-button"
                        onClick={() => updateMatchStatus(match, "COMPLETED")}
                        disabled={isUpdating}
                      >
                        {isUpdating ? (
                          <RefreshCw size={16} className="spin" />
                        ) : (
                          <Trophy size={16} />
                        )}
                        COMPLETE
                      </button>

                      {/* DELETE */}

                      <button
                        className="delete-button"
                        onClick={() => deleteMatch(match)}
                        disabled={isUpdating}
                      >
                        {isUpdating ? (
                          <RefreshCw size={16} className="spin" />
                        ) : (
                          <Trash2 size={16} />
                        )}
                        DELETE
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminMatches;