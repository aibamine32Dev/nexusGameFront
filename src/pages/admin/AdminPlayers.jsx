
import { useEffect, useState } from "react";
import {
  User,
  Users,
  Mail,
  Phone,
  Award,
  RefreshCw,
  Trash2,
  Search,
  PlusCircle,
  MinusCircle,
  Trophy,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

function AdminPlayers() {
  const API_URL =
    "https://amineaibeche8.pythonanywhere.com/api/players/";

  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [updatingId, setUpdatingId] = useState(null);
  const [pointInputs, setPointInputs] = useState({});
  const [expandedId, setExpandedId] = useState(null);

  // Exclure les joueurs dont le nom commence par "Companion 2 of"
  const isCompanionToHide = (player) => {
    const name = (player.name || "").trim().toLowerCase();

    return name.startsWith("companion");
  };

  const loadPlayers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error("Unable to load players.");
      }

      const data = await response.json();

      // Filtrer les joueurs avant de les afficher
      const loadedPlayers = Array.isArray(data) ? data : [];

      setPlayers(
        loadedPlayers.filter((player) => !isCompanionToHide(player))
      );
    } catch (err) {
      console.error("Players API error:", err);
      setError("Unable to load players.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlayers();
  }, []);

  const handleInputChange = (playerId, value) => {
    setPointInputs((prev) => ({
      ...prev,
      [playerId]: value,
    }));
  };

  const updatePointsCustom = async (player, operation) => {
    const rawValue = pointInputs[player.id];
    const amount = parseInt(rawValue, 10);

    if (isNaN(amount) || amount <= 0) {
      alert("Please enter a valid number of points greater than 0.");
      return;
    }

    const delta = operation === "add" ? amount : -amount;
    const newPoints = Math.max(0, (player.points || 0) + delta);

    try {
      setUpdatingId(player.id);

      const response = await fetch(`${API_URL}${player.id}/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          points: newPoints,
        }),
      });

      if (!response.ok) {
        throw new Error("Unable to update player points.");
      }

      const updatedPlayer = await response.json();

      // Ne jamais ajouter un accompagnant à la liste affichée
      if (isCompanionToHide(updatedPlayer)) {
        setPlayers((prev) =>
          prev.filter((p) => p.id !== updatedPlayer.id)
        );
      } else {
        setPlayers((prev) =>
          prev.map((p) =>
            p.id === updatedPlayer.id ? updatedPlayer : p
          )
        );
      }

      setPointInputs((prev) => ({
        ...prev,
        [player.id]: "",
      }));
    } catch (err) {
      console.error(err);
      alert("Error while updating points.");
    } finally {
      setUpdatingId(null);
    }
  };

  const deletePlayer = async (id) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this player?"
      )
    ) {
      return;
    }

    try {
      setUpdatingId(id);

      const response = await fetch(`${API_URL}${id}/`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Unable to delete player.");
      }

      setPlayers((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error(err);
      alert("Error while deleting player.");
    } finally {
      setUpdatingId(null);
    }
  };

  const getRankLabel = (points = 0) => {
    if (points >= 1000) {
      return { label: "LEGEND", color: "#f59e0b" };
    }

    if (points >= 500) {
      return { label: "DIAMOND", color: "#60a5fa" };
    }

    if (points >= 200) {
      return { label: "GOLD", color: "#fbbf24" };
    }

    if (points >= 50) {
      return { label: "SILVER", color: "#9ca3af" };
    }

    return { label: "BRONZE", color: "#b45309" };
  };

  // Liste des joueurs visibles, sans les Companion 2 of
  const visiblePlayers = players.filter(
    (player) => !isCompanionToHide(player)
  );

  const filteredPlayers = visiblePlayers.filter((player) => {
    const query = searchQuery.trim().toLowerCase();

    return (
      (player.name || "").toLowerCase().includes(query) ||
      (player.phone || "").includes(query) ||
      (player.email || "").toLowerCase().includes(query)
    );
  });

  const totalPoints = visiblePlayers.reduce(
    (sum, player) => sum + (player.points || 0),
    0
  );

  const topScorer = [...visiblePlayers].sort(
    (a, b) => (b.points || 0) - (a.points || 0)
  )[0];

  return (
    <section className="admin-page">
      {/* PAGE HEADER */}
      <div className="admin-page-header">
        <div>
          <span
            style={{
              color: "#ef4444",
              fontSize: "12px",
              fontWeight: 700,
              letterSpacing: "3px",
              textTransform: "uppercase",
            }}
          >
            MANAGEMENT
          </span>

          <h1 style={{ margin: "6px 0 0" }}>
            PLAYERS
            <br />
            <strong>MANAGER.</strong>
          </h1>
        </div>

        <button
          className="admin-primary-button"
          onClick={loadPlayers}
          disabled={loading}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <RefreshCw
            size={16}
            className={loading ? "spin" : ""}
          />
          REFRESH
        </button>
      </div>

      {/* SUMMARY STATS */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "16px",
          marginBottom: "24px",
        }}
      >
        {[
          {
            icon: <Users size={22} />,
            label: "Total Players",
            value: visiblePlayers.length,
          },
          {
            icon: <Trophy size={22} />,
            label: "Total Points Awarded",
            value: totalPoints.toLocaleString(),
          },
          {
            icon: <Award size={22} />,
            label: "Top Scorer",
            value: topScorer?.name || "—",
          },
        ].map((stat, i) => (
          <div
            key={i}
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "12px",
              padding: "18px 20px",
              display: "flex",
              alignItems: "center",
              gap: "14px",
            }}
          >
            <div
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "10px",
                background: "rgba(239,68,68,0.15)",
                color: "#ef4444",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {stat.icon}
            </div>

            <div>
              <div
                style={{
                  fontSize: "11px",
                  color: "#888",
                  letterSpacing: "1px",
                  textTransform: "uppercase",
                }}
              >
                {stat.label}
              </div>

              <div
                style={{
                  fontSize: "20px",
                  fontWeight: 700,
                  color: "#fff",
                  marginTop: "2px",
                  overflowWrap: "anywhere",
                }}
              >
                {stat.value}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* PANEL */}
      <div className="admin-panel">
        {/* SEARCH HEADER */}
        <div
          className="admin-panel-header"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          <div>
            <h2
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <User size={20} />
              PLAYER LIST
            </h2>

            <span style={{ fontSize: "13px", color: "#888" }}>
              {filteredPlayers.length} / {visiblePlayers.length} players
            </span>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              padding: "8px 14px",
              borderRadius: "8px",
              minWidth: "240px",
            }}
          >
            <Search size={16} color="#888" />

            <input
              type="text"
              placeholder="Search by name, email, phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                background: "transparent",
                border: "none",
                color: "#fff",
                outline: "none",
                width: "100%",
                fontSize: "13px",
              }}
            />
          </div>
        </div>

        {loading && (
          <div className="admin-empty">
            <RefreshCw size={35} className="spin" />
            <p>Loading players...</p>
          </div>
        )}

        {!loading && error && (
          <div className="admin-empty">
            <p style={{ color: "#ef4444" }}>{error}</p>

            <button
              className="admin-primary-button"
              onClick={loadPlayers}
            >
              RETRY
            </button>
          </div>
        )}

        {!loading && !error && filteredPlayers.length === 0 && (
          <div className="admin-empty">
            <User size={45} />
            <h3>NO PLAYERS FOUND</h3>
            <p>Try adjusting your search.</p>
          </div>
        )}

        {!loading && !error && filteredPlayers.length > 0 && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "12px",
            }}
          >
            {[...filteredPlayers]
              .sort(
                (a, b) => (b.points || 0) - (a.points || 0)
              )
              .map((player, idx) => {
                const isUpdating = updatingId === player.id;
                const customValue = pointInputs[player.id] || "";
                const rank = getRankLabel(player.points || 0);
                const isExpanded = expandedId === player.id;

                return (
                  <div
                    key={player.id}
                    style={{
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: "14px",
                      overflow: "hidden",
                      transition: "border-color 0.2s",
                    }}
                  >
                    {/* PLAYER ROW */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "16px",
                        padding: "16px 20px",
                        cursor: "pointer",
                      }}
                      onClick={() =>
                        setExpandedId(isExpanded ? null : player.id)
                      }
                    >
                      {/* RANK BADGE */}
                      <div
                        style={{
                          width: "36px",
                          height: "36px",
                          borderRadius: "50%",
                          background:
                            idx === 0
                              ? "#f59e0b22"
                              : "rgba(255,255,255,0.06)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: 700,
                          fontSize: "14px",
                          color: idx === 0 ? "#f59e0b" : "#aaa",
                          flexShrink: 0,
                        }}
                      >
                        #{idx + 1}
                      </div>

                      {/* AVATAR */}
                      <div
                        style={{
                          width: "44px",
                          height: "44px",
                          borderRadius: "12px",
                          background: "rgba(239,68,68,0.15)",
                          border: "1px solid rgba(239,68,68,0.25)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: 700,
                          fontSize: "18px",
                          color: "#ef4444",
                          flexShrink: 0,
                        }}
                      >
                        {player.name?.[0]?.toUpperCase() || "?"}
                      </div>

                      {/* INFO */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                            flexWrap: "wrap",
                          }}
                        >
                          <strong
                            style={{ fontSize: "15px", color: "#fff" }}
                          >
                            {player.name}
                          </strong>

                          <span
                            style={{
                              fontSize: "10px",
                              fontWeight: 700,
                              letterSpacing: "1px",
                              padding: "2px 8px",
                              borderRadius: "20px",
                              background: `${rank.color}22`,
                              color: rank.color,
                              border: `1px solid ${rank.color}44`,
                            }}
                          >
                            {rank.label}
                          </span>
                        </div>

                        <div
                          style={{
                            fontSize: "12px",
                            color: "#888",
                            marginTop: "2px",
                          }}
                        >
                          {player.phone || "No phone"}
                          {player.email && ` · ${player.email}`}
                        </div>
                      </div>

                      {/* POINTS BADGE */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          background: "rgba(239,68,68,0.1)",
                          border: "1px solid rgba(239,68,68,0.2)",
                          borderRadius: "8px",
                          padding: "6px 12px",
                          color: "#ef4444",
                          fontWeight: 700,
                          fontSize: "14px",
                          flexShrink: 0,
                        }}
                      >
                        <Award size={15} />
                        {player.points || 0} PTS
                      </div>

                      {/* EXPAND */}
                      <div style={{ color: "#666", flexShrink: 0 }}>
                        {isExpanded ? (
                          <ChevronUp size={18} />
                        ) : (
                          <ChevronDown size={18} />
                        )}
                      </div>
                    </div>

                    {/* EXPANDED PANEL */}
                    {isExpanded && (
                      <div
                        style={{
                          padding: "0 20px 20px",
                          borderTop: "1px solid rgba(255,255,255,0.06)",
                        }}
                      >
                        {/* CONTACT INFO */}
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr",
                            gap: "10px",
                            margin: "16px 0",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "10px",
                              background: "rgba(255,255,255,0.03)",
                              borderRadius: "8px",
                              padding: "10px 14px",
                            }}
                          >
                            <Phone size={16} color="#ef4444" />

                            <div>
                              <div
                                style={{
                                  fontSize: "10px",
                                  color: "#888",
                                  letterSpacing: "1px",
                                }}
                              >
                                PHONE
                              </div>

                              <div
                                style={{
                                  fontSize: "13px",
                                  color: "#fff",
                                  fontWeight: 600,
                                }}
                              >
                                {player.phone || "Not provided"}
                              </div>
                            </div>
                          </div>

                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "10px",
                              background: "rgba(255,255,255,0.03)",
                              borderRadius: "8px",
                              padding: "10px 14px",
                            }}
                          >
                            <Mail size={16} color="#ef4444" />

                            <div>
                              <div
                                style={{
                                  fontSize: "10px",
                                  color: "#888",
                                  letterSpacing: "1px",
                                }}
                              >
                                EMAIL
                              </div>

                              <div
                                style={{
                                  fontSize: "13px",
                                  color: "#fff",
                                  fontWeight: 600,
                                }}
                              >
                                {player.email || "Not provided"}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* POINTS CONTROL */}
                        <div
                          style={{
                            background: "rgba(255,255,255,0.03)",
                            border: "1px solid rgba(255,255,255,0.07)",
                            borderRadius: "10px",
                            padding: "14px 16px",
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                            flexWrap: "wrap",
                            marginBottom: "14px",
                          }}
                        >
                          <div style={{ flex: 1, minWidth: "160px" }}>
                            <div
                              style={{
                                fontSize: "11px",
                                color: "#888",
                                letterSpacing: "1px",
                                marginBottom: "6px",
                              }}
                            >
                              ADJUST POINTS
                            </div>

                            <input
                              type="number"
                              min="1"
                              placeholder="Enter amount"
                              value={customValue}
                              onChange={(e) =>
                                handleInputChange(
                                  player.id,
                                  e.target.value
                                )
                              }
                              onClick={(e) => e.stopPropagation()}
                              disabled={isUpdating}
                              style={{
                                background: "rgba(0,0,0,0.3)",
                                border: "1px solid rgba(255,255,255,0.12)",
                                color: "#fff",
                                padding: "8px 12px",
                                borderRadius: "8px",
                                width: "100%",
                                outline: "none",
                                fontSize: "14px",
                              }}
                            />
                          </div>

                          <div
                            style={{
                              display: "flex",
                              gap: "8px",
                              alignItems: "flex-end",
                              paddingTop: "18px",
                            }}
                          >
                            <button
                              className="confirm-button"
                              onClick={(e) => {
                                e.stopPropagation();
                                updatePointsCustom(player, "add");
                              }}
                              disabled={isUpdating || !customValue}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "6px",
                                padding: "8px 16px",
                              }}
                            >
                              {isUpdating ? (
                                <RefreshCw size={15} className="spin" />
                              ) : (
                                <PlusCircle size={15} />
                              )}
                              ADD
                            </button>

                            <button
                              className="reject-button"
                              onClick={(e) => {
                                e.stopPropagation();
                                updatePointsCustom(player, "sub");
                              }}
                              disabled={
                                isUpdating ||
                                (player.points || 0) <= 0 ||
                                !customValue
                              }
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "6px",
                                padding: "8px 16px",
                              }}
                            >
                              {isUpdating ? (
                                <RefreshCw size={15} className="spin" />
                              ) : (
                                <MinusCircle size={15} />
                              )}
                              REMOVE
                            </button>
                          </div>
                        </div>

                        {/* DELETE */}
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "flex-end",
                          }}
                        >
                          <button
                            className="delete-button"
                            onClick={(e) => {
                              e.stopPropagation();
                              deletePlayer(player.id);
                            }}
                            disabled={isUpdating}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "6px",
                            }}
                          >
                            {isUpdating ? (
                              <RefreshCw size={15} className="spin" />
                            ) : (
                              <Trash2 size={15} />
                            )}
                            DELETE PLAYER
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        )}
      </div>
    </section>
  );
}

export default AdminPlayers;
