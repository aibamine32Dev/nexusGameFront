import { useEffect, useMemo, useState } from "react";
import {
  Gamepad2,
  Users,
  CalendarDays,
  Clock,
  Phone,
  Hash,
  Check,
  X,
  Trash2,
  Trophy,
  RefreshCw,
  User,
  UserCheck,
  UserPlus,
  Info,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

function AdminMatches() {
  const API_URL = "https://nexusgameback.onrender.com/api/matches/";

  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingMatch, setUpdatingMatch] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  // =========================================================
  // LOAD MATCHES
  // =========================================================

  const loadMatches = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(API_URL);
      if (!response.ok) throw new Error("Unable to load matches.");

      const data = await response.json();
      setMatches(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Matches load error:", err);
      setError(err.message || "An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMatches();
  }, []);

  // =========================================================
  // STATUS HELPERS
  // =========================================================

  const getStatusLabel = (status) => {
    const map = {
      PENDING: "PENDING",
      READY: "READY",
      CONFIRMED: "CONFIRMED",
      CANCELLED: "CANCELLED",
      COMPLETED: "COMPLETED",
    };
    return map[status] || status || "UNKNOWN";
  };

  const getStatusClass = (status) => {
    const map = {
      PENDING: "status-pending",
      READY: "status-ready",
      CONFIRMED: "status-confirmed",
      CANCELLED: "status-cancelled",
      COMPLETED: "status-completed",
    };
    return map[status] || "status-pending";
  };

  // =========================================================
  // DATE FORMATTER
  // =========================================================

  const formatJoinedAt = (date) => {
    if (!date) return "-";
    const d = new Date(date);
    if (isNaN(d.getTime())) return date;
    return d.toLocaleString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // =========================================================
  // PLAYER DETAILS HELPER
  // =========================================================

  const getPlayerDetails = (matchPlayer) => {
    const nested =
      (matchPlayer.player_details && typeof matchPlayer.player_details === "object" && matchPlayer.player_details) ||
      (matchPlayer.player_info && typeof matchPlayer.player_info === "object" && matchPlayer.player_info) ||
      (matchPlayer.player && typeof matchPlayer.player === "object" && matchPlayer.player) ||
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
        [nested.first_name, nested.last_name].filter(Boolean).join(" ") ||
        "-",
      phone:
        matchPlayer.player_phone ||
        nested.phone ||
        nested.phone_number ||
        "-",
      status: matchPlayer.status || "",
      joinedAt: matchPlayer.joined_at,
    };
  };

  // =========================================================
  // SORT MATCHES
  // =========================================================

  const statusPriority = { READY: 1, PENDING: 2, CONFIRMED: 3, CANCELLED: 4, COMPLETED: 5 };

  const sortedMatches = useMemo(() => {
    return [...matches].sort((a, b) => {
      const pa = statusPriority[a.status] || 99;
      const pb = statusPriority[b.status] || 99;
      if (pa !== pb) return pa - pb;
      return new Date(b.created_at || 0) - new Date(a.created_at || 0);
    });
  }, [matches]);

  // =========================================================
  // UPDATE MATCH STATUS
  // =========================================================

  const updateMatchStatus = async (match, newStatus) => {
    if (!match?.id) return;

    const actionMap = { CONFIRMED: "confirm", CANCELLED: "cancel", COMPLETED: "complete" };
    const action = actionMap[newStatus];
    if (!action) return;

    if (!window.confirm(`${newStatus === "CONFIRMED" ? "Confirm" : newStatus === "CANCELLED" ? "Cancel" : "Complete"} match ${match.match_number}?`)) {
      return;
    }

    try {
      setUpdatingMatch(match.id);
      setError("");

      const response = await fetch(`${API_URL}${match.id}/${action}/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.detail || errorData?.message || `Cannot perform action ${action}.`);
      }

      const updatedMatch = await response.json().catch(() => null);

      setMatches((current) =>
        current.map((item) => {
          if (item.id !== match.id) return item;
          if (updatedMatch?.id) return updatedMatch;
          return { ...item, status: newStatus };
        })
      );
    } catch (err) {
      console.error("Match status error:", err);
      setError(err.message || "Cannot change match status.");
      await loadMatches();
    } finally {
      setUpdatingMatch(null);
    }
  };

  // =========================================================
  // DELETE MATCH
  // =========================================================

  const deleteMatch = async (match) => {
    if (!match?.id) return;
    if (!window.confirm(`Delete match ${match.match_number}?\n\nThis action cannot be undone.`)) return;

    try {
      setUpdatingMatch(match.id);
      setError("");

      const response = await fetch(`${API_URL}${match.id}/`, { method: "DELETE" });
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.detail || errorData?.message || "Cannot delete match.");
      }

      setMatches((current) => current.filter((item) => item.id !== match.id));
    } catch (err) {
      console.error("Delete error:", err);
      setError(err.message || "Cannot delete match.");
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
      {/* PAGE HEADER */}
      <div className="admin-page-header">
        <div>
          <h1>
            <Gamepad2 size={28} />
            MATCH MANAGEMENT
          </h1>
          <p>Manage gaming matches, player slots and status.</p>
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

      {/* PANEL */}
      <div className="admin-panel">
        <div className="admin-panel-header">
          <div>
            <h2>
              <Gamepad2 size={21} />
              MATCHES
            </h2>
            <span>
              {matches.length} match{matches.length !== 1 ? "es" : ""}
            </span>
          </div>
        </div>

        {error && <div className="admin-error">{error}</div>}

        {loading ? (
          <div className="admin-empty">
            <RefreshCw size={35} className="spin" />
            <p>Loading matches...</p>
          </div>
        ) : sortedMatches.length === 0 ? (
          <div className="admin-empty">
            <Gamepad2 size={45} />
            <h3>NO MATCHES FOUND</h3>
            <p>There are currently no matches.</p>
          </div>
        ) : (
          <div className="reservation-groups">
            {sortedMatches.map((match) => {
              const players = Array.isArray(match.players) ? match.players : [];

              const playersNeeded = Number(match.players_needed || 0);
              const playersJoined = Number(match.players_joined ?? players.length ?? 0);
              const accompanyingPlayers = Number(match.accompanying_players ?? 0);
              const remainingSlots = Number(match.remaining_slots ?? Math.max(0, playersNeeded - playersJoined));

              const creatorName = match.creator_name || match.player_name || "—";
              const creatorPhone = match.creator_phone || match.player_phone || "—";

              const isUpdating = updatingMatch === match.id;
              const isExpanded = expandedId === match.id;

              // Progress bar percentage
              const fillPercent = playersNeeded > 0 ? Math.round((playersJoined / playersNeeded) * 100) : 0;

              return (
                <div key={match.id} className="reservation-group-card">
                  {/* =========================================
                      MATCH HEADER
                  ========================================= */}
                  <div className="reservation-group-header">
                    <div className="reservation-group-title">
                      <div className="reservation-group-icon">
                        <Gamepad2 size={20} />
                      </div>
                      <div>
                        <span className="reservation-group-label">MATCH</span>
                        <h3>{match.match_number}</h3>
                      </div>
                    </div>

                    <div className={`reservation-status ${getStatusClass(match.status)}`}>
                      {getStatusLabel(match.status)}
                    </div>
                  </div>

                  {/* =========================================
                      MATCH INFO GRID
                  ========================================= */}
                  <div className="reservation-group-info">
                    <div className="reservation-info-item">
                      <Gamepad2 size={18} />
                      <div>
                        <span>GAME</span>
                        <strong>{match.game_name || "—"}</strong>
                      </div>
                    </div>

                    <div className="reservation-info-item">
                      <Trophy size={18} />
                      <div>
                        <span>PLATFORM</span>
                        <strong>{match.platform || "—"}</strong>
                      </div>
                    </div>

                    <div className="reservation-info-item">
                      <CalendarDays size={18} />
                      <div>
                        <span>DATE</span>
                        <strong>{match.date || "—"}</strong>
                      </div>
                    </div>

                    <div className="reservation-info-item">
                      <Clock size={18} />
                      <div>
                        <span>TIME</span>
                        <strong>{match.time ? match.time.substring(0, 5) : "—"}</strong>
                      </div>
                    </div>
                  </div>

                  {/* =========================================
                      CREATOR INFO
                  ========================================= */}
                  <div
                    style={{
                      display: "flex",
                      gap: "12px",
                      padding: "12px 0",
                      borderTop: "1px solid rgba(255,255,255,0.06)",
                      marginTop: "4px",
                      flexWrap: "wrap",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        flex: 1,
                        minWidth: "160px",
                        background: "rgba(239,68,68,0.06)",
                        borderRadius: "8px",
                        padding: "8px 12px",
                        border: "1px solid rgba(239,68,68,0.15)",
                      }}
                    >
                      <UserCheck size={16} color="#ef4444" />
                      <div>
                        <div style={{ fontSize: "10px", color: "#888", letterSpacing: "1px" }}>CREATOR</div>
                        <div style={{ fontSize: "13px", fontWeight: 600, color: "#fff" }}>{creatorName}</div>
                        <div style={{ fontSize: "11px", color: "#aaa" }}>{creatorPhone}</div>
                      </div>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        flex: 1,
                        minWidth: "160px",
                        background: "rgba(255,255,255,0.03)",
                        borderRadius: "8px",
                        padding: "8px 12px",
                        border: "1px solid rgba(255,255,255,0.07)",
                      }}
                    >
                      <Users size={16} color="#aaa" />
                      <div>
                        <div style={{ fontSize: "10px", color: "#888", letterSpacing: "1px" }}>COMPANIONS</div>
                        <div style={{ fontSize: "20px", fontWeight: 700, color: "#fff" }}>{accompanyingPlayers}</div>
                      </div>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        flex: 1,
                        minWidth: "160px",
                        background: remainingSlots === 0 ? "rgba(239,68,68,0.08)" : "rgba(255,255,255,0.03)",
                        borderRadius: "8px",
                        padding: "8px 12px",
                        border: remainingSlots === 0 ? "1px solid rgba(239,68,68,0.2)" : "1px solid rgba(255,255,255,0.07)",
                      }}
                    >
                      <UserPlus size={16} color={remainingSlots === 0 ? "#ef4444" : "#aaa"} />
                      <div>
                        <div style={{ fontSize: "10px", color: "#888", letterSpacing: "1px" }}>OPEN SLOTS</div>
                        <div
                          style={{
                            fontSize: "20px",
                            fontWeight: 700,
                            color: remainingSlots === 0 ? "#ef4444" : "#fff",
                          }}
                        >
                          {remainingSlots}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* PROGRESS BAR */}
                  <div style={{ marginBottom: "14px" }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: "12px",
                        color: "#aaa",
                        marginBottom: "6px",
                      }}
                    >
                      <span>
                        <Users size={12} style={{ verticalAlign: "middle", marginRight: "4px" }} />
                        {playersJoined} / {playersNeeded} PLAYERS
                      </span>
                      <span style={{ color: remainingSlots === 0 ? "#ef4444" : "#aaa" }}>
                        {fillPercent}%
                        {remainingSlots === 0 ? " · FULL" : ` · ${remainingSlots} slot${remainingSlots !== 1 ? "s" : ""} left`}
                      </span>
                    </div>
                    <div
                      style={{
                        height: "6px",
                        background: "rgba(255,255,255,0.08)",
                        borderRadius: "3px",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          width: `${fillPercent}%`,
                          background:
                            fillPercent === 100
                              ? "linear-gradient(90deg, #ef4444, #f87171)"
                              : "linear-gradient(90deg, #ef4444, #f87171)",
                          borderRadius: "3px",
                          transition: "width 0.4s ease",
                        }}
                      />
                    </div>
                  </div>

                  {/* =========================================
                      PLAYERS LIST (collapsible)
                  ========================================= */}
                  <div className="reservation-stations-section">
                    <div
                      className="reservation-stations-title"
                      style={{ cursor: "pointer", userSelect: "none" }}
                      onClick={() => setExpandedId(isExpanded ? null : match.id)}
                    >
                      <Users size={18} />
                      <span>MATCH PLAYERS ({players.length})</span>
                      <span style={{ marginLeft: "auto", color: "#888" }}>
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </span>
                    </div>

                    {isExpanded && (
                      players.length > 0 ? (
                        <div className="match-players-grid">
                          {players.map((matchPlayer, index) => {
                            const info = getPlayerDetails(matchPlayer);
                            const isCompanion = info.name.startsWith("Companion ");

                            return (
                              <div
                                key={matchPlayer.id ?? `${match.id}-${index}`}
                                className="match-player-card"
                                style={{
                                  borderLeft: isCompanion
                                    ? "2px solid rgba(239,68,68,0.3)"
                                    : index === 0
                                    ? "2px solid #ef4444"
                                    : "2px solid rgba(255,255,255,0.08)",
                                }}
                              >
                                <div className="match-player-header">
                                  <div
                                    className="match-player-icon"
                                    style={{
                                      background:
                                        index === 0
                                          ? "rgba(239,68,68,0.2)"
                                          : isCompanion
                                          ? "rgba(239,68,68,0.1)"
                                          : "rgba(255,255,255,0.07)",
                                    }}
                                  >
                                    {index === 0 ? (
                                      <UserCheck size={18} color="#ef4444" />
                                    ) : (
                                      <User size={18} />
                                    )}
                                  </div>
                                  <div>
                                    <strong>{info.name}</strong>
                                    <span>
                                      {index === 0
                                        ? "Creator"
                                        : isCompanion
                                        ? "Companion"
                                        : `Player #${index + 1}`}
                                    </span>
                                  </div>
                                </div>

                                {!isCompanion && (
                                  <div className="match-player-info">
                                    <Phone size={14} />
                                    <span>{info.phone}</span>
                                  </div>
                                )}

                                <div className="match-player-info">
                                  <Clock size={14} />
                                  <span>Joined: {formatJoinedAt(info.joinedAt)}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="admin-empty" style={{ padding: "20px 0" }}>
                          <Users size={28} />
                          <p>No players have joined yet.</p>
                        </div>
                      )
                    )}
                  </div>

                  {/* =========================================
                      ACTIONS
                  ========================================= */}
                  <div className="reservation-group-actions">
                    <div className="reservation-group-action-info">
                      Status:
                      <strong style={{ marginLeft: "6px" }}>
                        {getStatusLabel(match.status)}
                      </strong>
                    </div>

                    <div className="reservation-actions">
                      <button
                        className="confirm-button"
                        onClick={() => updateMatchStatus(match, "CONFIRMED")}
                        disabled={isUpdating}
                      >
                        {isUpdating ? <RefreshCw size={16} className="spin" /> : <Check size={16} />}
                        CONFIRM
                      </button>

                      <button
                        className="reject-button"
                        onClick={() => updateMatchStatus(match, "CANCELLED")}
                        disabled={isUpdating}
                      >
                        {isUpdating ? <RefreshCw size={16} className="spin" /> : <X size={16} />}
                        CANCEL
                      </button>

                      <button
                        className="complete-button"
                        onClick={() => updateMatchStatus(match, "COMPLETED")}
                        disabled={isUpdating}
                      >
                        {isUpdating ? <RefreshCw size={16} className="spin" /> : <Trophy size={16} />}
                        COMPLETE
                      </button>

                      <button
                        className="delete-button"
                        onClick={() => deleteMatch(match)}
                        disabled={isUpdating}
                      >
                        {isUpdating ? <RefreshCw size={16} className="spin" /> : <Trash2 size={16} />}
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
