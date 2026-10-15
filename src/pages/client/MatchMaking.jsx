
import { useEffect, useMemo, useState } from "react";
import {
  Users,
  Plus,
  Search,
  Calendar,
  Clock,
  Gamepad2,
  X,
} from "lucide-react";

const API_URL = "https://nexusgameback.onrender.com/api";

const MIN_PLAYERS = 8;
const MAX_PLAYERS = 10;

// Créneaux horaires : 00:00, 01:00, ..., 23:00
const TIME_OPTIONS = Array.from({ length: 24 }, (_, hour) =>
  `${String(hour).padStart(2, "0")}:00`
);

const getToday = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const normalizeNumber = (value, fallback = 0) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
};

function MatchMaking() {
  // =========================================================
  // TABS
  // =========================================================

  const [activeTab, setActiveTab] = useState("find");
  const [showCreateForm, setShowCreateForm] = useState(false);

  // =========================================================
  // GAMES
  // =========================================================

  const [games, setGames] = useState([]);
  const [gamesLoading, setGamesLoading] = useState(true);
  const [gamesError, setGamesError] = useState("");

  // =========================================================
  // MATCHES
  // =========================================================

  const [matches, setMatches] = useState([]);
  const [matchesLoading, setMatchesLoading] = useState(true);
  const [matchesError, setMatchesError] = useState("");

  // =========================================================
  // ACTIONS
  // =========================================================

  const [actionLoading, setActionLoading] = useState("");

  // =========================================================
  // JOIN FORM
  // =========================================================

  const [showJoinForm, setShowJoinForm] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [joinError, setJoinError] = useState("");

  const [joinForm, setJoinForm] = useState({
    name: "",
    phone: "",
  });

  // =========================================================
  // CREATE FORM
  // =========================================================

  const [form, setForm] = useState({
    name: "",
    phone: "",
    platform: "",
    game: "",
    date: "",
    time: "",
    totalPlayers: "8",
    accompanyingPlayers: "0",
  });

  // =========================================================
  // API REQUEST
  // =========================================================

  const apiRequest = async (url, options = {}) => {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
    });

    const contentType = response.headers.get("content-type") || "";
    let data = null;

    if (contentType.includes("application/json")) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      console.error("API ERROR:", {
        url,
        status: response.status,
        data,
      });

      let message = `Erreur API ${response.status}`;

      if (typeof data === "string" && data.trim()) {
        message += ` : ${data.substring(0, 300)}`;
      } else if (data && typeof data === "object") {
        message = Object.entries(data)
          .map(([key, value]) => {
            const valueText = Array.isArray(value)
              ? value.join(", ")
              : typeof value === "object" && value !== null
                ? JSON.stringify(value)
                : String(value);

            return `${key}: ${valueText}`;
          })
          .join(" | ");
      }

      throw new Error(message);
    }

    return data;
  };

  // =========================================================
  // LOAD GAMES
  // =========================================================

  const loadGames = async () => {
    try {
      setGamesLoading(true);
      setGamesError("");

      const data = await apiRequest(`${API_URL}/games/`);

      setGames(
        Array.isArray(data)
          ? data
          : Array.isArray(data?.results)
            ? data.results
            : []
      );
    } catch (error) {
      console.error("Games API error:", error);
      setGamesError(error.message || "Impossible de charger les jeux.");
    } finally {
      setGamesLoading(false);
    }
  };

  // =========================================================
  // LOAD OPEN MATCHES
  // =========================================================

  const loadOpenMatches = async () => {
    try {
      setMatchesLoading(true);
      setMatchesError("");

      const data = await apiRequest(`${API_URL}/matches/open/`);

      setMatches(
        Array.isArray(data)
          ? data
          : Array.isArray(data?.results)
            ? data.results
            : []
      );
    } catch (error) {
      console.error("Matches API error:", error);
      setMatchesError(
        error.message || "Impossible de charger les matchs."
      );
    } finally {
      setMatchesLoading(false);
    }
  };

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    loadGames();
    loadOpenMatches();
  }, []);

  // =========================================================
  // AVAILABLE PLATFORMS
  // =========================================================

  const availablePlatforms = useMemo(
    () => [
      ...new Set(
        games
          .map((game) => game.platform)
          .filter(Boolean)
      ),
    ],
    [games]
  );

  // =========================================================
  // FILTER GAMES BY PLATFORM
  // =========================================================

  const filteredGames = useMemo(() => {
    if (!form.platform) return [];

    return games.filter(
      (game) => game.platform === form.platform
    );
  }, [games, form.platform]);

  // =========================================================
  // AUTOMATIC PLAYER CALCULATION
  // =========================================================

  const totalPlayers = Number(form.totalPlayers);
  const accompanyingPlayers = Number(form.accompanyingPlayers);

  // Le créateur compte comme un joueur.
  const creatorGroupSize = 1 + accompanyingPlayers;

  // Places restant à remplir après inscription du créateur
  // et de ses accompagnants.
  const remainingPlayers = totalPlayers - creatorGroupSize;

  // =========================================================
  // CREATE FORM CHANGE
  // =========================================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => {
      const next = {
        ...previous,
        [name]: value,
      };

      if (name === "platform") {
        next.game = "";
      }

      // Le nombre d'accompagnants ne peut pas dépasser
      // le nombre total de joueurs moins le créateur.
      if (name === "totalPlayers") {
        const maxAccompanying = Number(value) - 1;

        if (Number(next.accompanyingPlayers) > maxAccompanying) {
          next.accompanyingPlayers = String(maxAccompanying);
        }
      }

      return next;
    });
  };

  // =========================================================
  // JOIN FORM CHANGE
  // =========================================================

  const handleJoinChange = (event) => {
    const { name, value } = event.target;

    setJoinForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setJoinError("");
  };

  // =========================================================
  // RESET CREATE FORM
  // =========================================================

  const resetCreateForm = () => {
    setForm({
      name: "",
      phone: "",
      platform: "",
      game: "",
      date: "",
      time: "",
      totalPlayers: "8",
      accompanyingPlayers: "0",
    });
  };

  // =========================================================
  // CREATE MATCH
  // =========================================================

  const createMatch = async (event) => {
    event.preventDefault();

    const selectedGame = games.find(
      (game) => Number(game.id) === Number(form.game)
    );

    if (!form.name.trim()) {
      alert("Veuillez saisir le nom du créateur.");
      return;
    }

    if (!form.phone.trim()) {
      alert("Veuillez saisir le numéro de téléphone.");
      return;
    }

    if (!form.platform) {
      alert("Veuillez sélectionner une plateforme.");
      return;
    }

    if (!selectedGame) {
      alert("Veuillez sélectionner un jeu.");
      return;
    }

    if (!form.date || form.date < getToday()) {
      alert("Veuillez sélectionner une date valide.");
      return;
    }

    if (!TIME_OPTIONS.includes(form.time)) {
      alert("Veuillez sélectionner une heure valide.");
      return;
    }

    if (
      !Number.isInteger(totalPlayers) ||
      totalPlayers < MIN_PLAYERS ||
      totalPlayers > MAX_PLAYERS
    ) {
      alert("Le match doit compter entre 8 et 10 joueurs.");
      return;
    }

    if (
      !Number.isInteger(accompanyingPlayers) ||
      accompanyingPlayers < 0 ||
      accompanyingPlayers > totalPlayers - 1
    ) {
      alert("Le nombre d'accompagnants est invalide.");
      return;
    }

    if (remainingPlayers < 0) {
      alert("Le nombre de joueurs est invalide.");
      return;
    }

    /*
     * IMPORTANT :
     * players_needed représente ici le nombre TOTAL de joueurs
     * souhaité pour le match, créateur et accompagnants compris.
     *
     * accompanying_players est un champ supplémentaire.
     * Le serializer Django doit accepter ce champ pour que
     * le backend puisse l'enregistrer.
     */
    const payload = {
      name: form.name.trim(),
      phone: form.phone.trim(),
      game: Number(selectedGame.id),
      platform: form.platform,
      date: form.date,
      time: form.time,
      players_needed: totalPlayers,
      accompanying_players: accompanyingPlayers,
    };

    console.log("[MATCH CREATE] Payload envoyé :", payload);
    console.log("[MATCH CREATE] Calcul des joueurs :", {
      totalPlayers,
      creator: 1,
      accompanyingPlayers,
      remainingPlayers,
    });

    try {
      setActionLoading("create");

      const data = await apiRequest(`${API_URL}/matches/`, {
        method: "POST",
        body: JSON.stringify(payload),
      });

      console.log("[MATCH CREATE] Réponse API :", data);

      alert("Match créé avec succès.");

      resetCreateForm();
      setShowCreateForm(false);
      setActiveTab("find");

      await loadOpenMatches();
    } catch (error) {
      console.error("[MATCH CREATE] Erreur :", error);
      alert(error.message || "Impossible de créer le match.");
    } finally {
      setActionLoading("");
    }
  };

  // =========================================================
  // OPEN JOIN FORM
  // =========================================================

  const openJoinForm = (match) => {
    setSelectedMatch(match);

    setJoinForm({
      name: "",
      phone: "",
    });

    setJoinError("");
    setShowJoinForm(true);
  };

  // =========================================================
  // CLOSE JOIN FORM
  // =========================================================

  const closeJoinForm = () => {
    if (actionLoading.startsWith("join-")) return;

    setShowJoinForm(false);
    setSelectedMatch(null);
    setJoinError("");

    setJoinForm({
      name: "",
      phone: "",
    });
  };

  // =========================================================
  // JOIN MATCH
  // =========================================================

  const joinMatch = async (event) => {
    event.preventDefault();

    if (!selectedMatch) {
      setJoinError("Aucun match sélectionné.");
      return;
    }

    if (!joinForm.name.trim()) {
      setJoinError("Veuillez saisir votre nom.");
      return;
    }

    if (!joinForm.phone.trim()) {
      setJoinError("Veuillez saisir votre numéro de téléphone.");
      return;
    }

    const matchId = selectedMatch.id;

    const payload = {
      name: joinForm.name.trim(),
      phone: joinForm.phone.trim(),
    };

    try {
      setActionLoading(`join-${matchId}`);
      setJoinError("");

      const data = await apiRequest(
        `${API_URL}/matches/${matchId}/join/`,
        {
          method: "POST",
          body: JSON.stringify(payload),
        }
      );

      console.log("[MATCH JOIN] Réponse API :", data);

      alert(data?.message || "Vous avez rejoint le match.");

      setShowJoinForm(false);
      setSelectedMatch(null);

      setJoinForm({
        name: "",
        phone: "",
      });

      await loadOpenMatches();
    } catch (error) {
      console.error("[MATCH JOIN] Erreur :", error);
      setJoinError(error.message || "Impossible de rejoindre le match.");
    } finally {
      setActionLoading("");
    }
  };

  // =========================================================
  // CONFIRM MATCH
  // =========================================================

  const confirmMatch = async (matchId) => {
    try {
      setActionLoading(`confirm-${matchId}`);

      const data = await apiRequest(
        `${API_URL}/matches/${matchId}/confirm/`,
        { method: "POST" }
      );

      alert(data?.message || "Match confirmé.");
      await loadOpenMatches();
    } catch (error) {
      console.error("[MATCH CONFIRM] Erreur :", error);
      alert(error.message || "Impossible de confirmer le match.");
    } finally {
      setActionLoading("");
    }
  };

  // =========================================================
  // CANCEL MATCH
  // =========================================================

  const cancelMatch = async (matchId) => {
    if (!window.confirm("Voulez-vous vraiment annuler ce match ?")) {
      return;
    }

    try {
      setActionLoading(`cancel-${matchId}`);

      const data = await apiRequest(
        `${API_URL}/matches/${matchId}/cancel/`,
        { method: "POST" }
      );

      alert(data?.message || "Match annulé.");
      await loadOpenMatches();
    } catch (error) {
      console.error("[MATCH CANCEL] Erreur :", error);
      alert(error.message || "Impossible d'annuler le match.");
    } finally {
      setActionLoading("");
    }
  };

  // =========================================================
  // COMPLETE MATCH
  // =========================================================

  const completeMatch = async (matchId) => {
    if (!window.confirm("Voulez-vous terminer ce match ?")) {
      return;
    }

    try {
      setActionLoading(`complete-${matchId}`);

      const data = await apiRequest(
        `${API_URL}/matches/${matchId}/complete/`,
        { method: "POST" }
      );

      alert(data?.message || "Match terminé.");
      await loadOpenMatches();
    } catch (error) {
      console.error("[MATCH COMPLETE] Erreur :", error);
      alert(error.message || "Impossible de terminer le match.");
    } finally {
      setActionLoading("");
    }
  };

  // =========================================================
  // MATCH PLAYER COUNTS
  // =========================================================

  const getMatchCounts = (match) => {
    const needed = normalizeNumber(
      match.players_needed ?? match.playersNeeded,
      MIN_PLAYERS
    );

    const joined = normalizeNumber(
      match.players_joined ?? match.playersJoined,
      0
    );

    const companions = normalizeNumber(
      match.accompanying_players ?? match.accompanyingPlayers,
      0
    );

    /*
     * Le backend doit retourner players_joined avec le créateur
     * et les accompagnants déjà comptabilisés pour obtenir un
     * décompte exact. On n'ajoute donc pas les accompagnants ici.
     */
    return {
      needed,
      joined,
      companions,
      full: joined >= needed,
      remaining: Math.max(0, needed - joined),
    };
  };

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <section className="matchmaking-page">

      {/* HEADER */}

      <div className="matchmaking-header">
        <div>
          <span>NEXUS MATCHMAKING</span>

          <h1>
            FIND YOUR
            <br />
            <strong>OPPONENT.</strong>
          </h1>

          <p>
            Create a match, invite your friends, or join an existing
            session and compete with other players.
          </p>
        </div>

        <div className="matchmaking-header-icon">
          <Users size={60} />
        </div>
      </div>

      {/* TABS */}

      <div className="matchmaking-tabs">
        <button
          type="button"
          className={`matchmaking-tab ${
            activeTab === "find" ? "active" : ""
          }`}
          onClick={() => {
            setActiveTab("find");
            setShowCreateForm(false);
            loadOpenMatches();
          }}
        >
          <Search size={17} />
          FIND A MATCH
        </button>

        <button
          type="button"
          className={`matchmaking-tab ${
            activeTab === "create" ? "active" : ""
          }`}
          onClick={() => {
            setActiveTab("create");
            setShowCreateForm(true);
          }}
        >
          <Plus size={17} />
          CREATE A MATCH
        </button>
      </div>

      <div className="matchmaking-content">

        {/* ===================================================
            FIND MATCH
        =================================================== */}

        {activeTab === "find" && (
          <div>
            <div className="matchmaking-section-header">
              <div>
                <span>AVAILABLE NOW</span>

                <h2>
                  OPEN <strong>MATCHES</strong>
                </h2>
              </div>

              <button
                type="button"
                className="primary-button"
                onClick={() => {
                  setActiveTab("create");
                  setShowCreateForm(true);
                }}
              >
                <Plus size={18} />
                CREATE MATCH
              </button>
            </div>

            {matchesLoading && (
              <div className="matchmaking-empty">
                <p>LOADING MATCHES...</p>
              </div>
            )}

            {!matchesLoading && matchesError && (
              <div className="matchmaking-empty">
                <p>{matchesError}</p>

                <button
                  type="button"
                  className="primary-button"
                  onClick={loadOpenMatches}
                >
                  RETRY
                </button>
              </div>
            )}

            {!matchesLoading &&
              !matchesError &&
              matches.length === 0 && (
                <div className="matchmaking-empty">
                  <Users size={45} />

                  <h3>NO OPEN MATCHES</h3>

                  <p>
                    Be the first player to create a matchmaking session.
                  </p>

                  <button
                    type="button"
                    className="primary-button"
                    onClick={() => {
                      setActiveTab("create");
                      setShowCreateForm(true);
                    }}
                  >
                    <Plus size={18} />
                    CREATE A MATCH
                  </button>
                </div>
              )}

            {!matchesLoading &&
              !matchesError &&
              matches.length > 0 && (
                <div className="matchmaking-list">
                  {matches.map((match) => {
                    const gameName =
                      match.game_name ||
                      match.game?.name ||
                      "Unknown game";

                    const playerName =
                      match.player_name ||
                      match.creator_name ||
                      match.creatorName ||
                      "Player";

                    const counts = getMatchCounts(match);

                    const isJoining =
                      actionLoading === `join-${match.id}`;

                    return (
                      <div className="match-card" key={match.id}>
                        <div className="match-card-main">
                          <div className="match-game-icon">
                            <Gamepad2 size={27} />
                          </div>

                          <div className="match-card-info">
                            <span>{match.platform}</span>

                            <h3>{gameName}</h3>

                            <p>
                              Created by{" "}
                              <strong>{playerName}</strong>
                            </p>
                          </div>
                        </div>

                        <div className="match-card-details">
                          <div>
                            <Calendar size={15} />
                            <span>{match.date || "-"}</span>
                          </div>

                          <div>
                            <Clock size={15} />
                            <span>{match.time || "-"}</span>
                          </div>

                          <div>
                            <Users size={15} />
                            <span>
                              {counts.joined}/{counts.needed} PLAYERS
                            </span>
                          </div>
                        </div>

                        <div className="match-card-action">
                          <button
                            type="button"
                            className="primary-button"
                            disabled={counts.full || isJoining}
                            onClick={() => openJoinForm(match)}
                          >
                            <Users size={17} />

                            {counts.full
                              ? "MATCH FULL"
                              : isJoining
                                ? "JOINING..."
                                : "JOIN MATCH"}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
          </div>
        )}

        {/* ===================================================
            CREATE MATCH
        =================================================== */}

        {activeTab === "create" && showCreateForm && (
          <div className="matchmaking-create">
            <div className="matchmaking-section-header">
              <div>
                <span>NEW SESSION</span>

                <h2>
                  CREATE <strong>MATCH</strong>
                </h2>
              </div>

              <button
                type="button"
                className="matchmaking-close-button"
                onClick={() => {
                  setShowCreateForm(false);
                  setActiveTab("find");
                }}
              >
                <X size={17} />
                CANCEL
              </button>
            </div>

            {gamesLoading && <p>LOADING GAMES...</p>}

            {!gamesLoading && gamesError && <p>{gamesError}</p>}

            {!gamesLoading &&
              !gamesError &&
              games.length === 0 && <p>No games are available.</p>}

            {!gamesLoading && !gamesError && games.length > 0 && (
              <form className="matchmaking-form" onSubmit={createMatch}>

                {/* PLAYER NAME */}

                <div className="matchmaking-form-group">
                  <label htmlFor="match-name">PLAYER NAME</label>

                  <input
                    id="match-name"
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Enter your name"
                    required
                    disabled={actionLoading === "create"}
                  />
                </div>

                {/* PHONE */}

                <div className="matchmaking-form-group">
                  <label htmlFor="match-phone">PHONE NUMBER</label>

                  <input
                    id="match-phone"
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="Enter your phone"
                    required
                    disabled={actionLoading === "create"}
                  />
                </div>

                {/* PLATFORM */}

                <div className="matchmaking-form-group">
                  <label htmlFor="match-platform">PLATFORM</label>

                  <select
                    id="match-platform"
                    name="platform"
                    value={form.platform}
                    onChange={handleChange}
                    required
                    disabled={actionLoading === "create"}
                  >
                    <option value="">SELECT PLATFORM</option>

                    {availablePlatforms.map((platform) => (
                      <option key={platform} value={platform}>
                        {platform}
                      </option>
                    ))}
                  </select>
                </div>

                {/* GAME */}

                <div className="matchmaking-form-group">
                  <label htmlFor="match-game">GAME</label>

                  <select
                    id="match-game"
                    name="game"
                    value={form.game}
                    onChange={handleChange}
                    disabled={!form.platform || actionLoading === "create"}
                    required
                  >
                    <option value="">
                      {!form.platform
                        ? "SELECT PLATFORM FIRST"
                        : "SELECT GAME"}
                    </option>

                    {filteredGames.map((game) => (
                      <option key={game.id} value={game.id}>
                        {game.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* DATE */}

                <div className="matchmaking-form-group">
                  <label htmlFor="match-date">DATE</label>

                  <input
                    id="match-date"
                    type="date"
                    name="date"
                    value={form.date}
                    min={getToday()}
                    onChange={handleChange}
                    required
                    disabled={actionLoading === "create"}
                  />
                </div>

                {/* TIME : HOURLY OPTIONS */}

                <div className="matchmaking-form-group">
                  <label htmlFor="match-time">START TIME</label>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    <Clock size={19} color="#ef4444" />

                    <select
                      id="match-time"
                      name="time"
                      value={form.time}
                      onChange={handleChange}
                      required
                      disabled={actionLoading === "create"}
                      style={{ flex: 1, minWidth: 0 }}
                    >
                      <option value="">SELECT START TIME</option>

                      {TIME_OPTIONS.map((time) => (
                        <option key={time} value={time}>
                          {time}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* TOTAL PLAYERS */}

                <div className="matchmaking-form-group">
                  <label htmlFor="totalPlayers">
                    TOTAL PLAYERS (8–10)
                  </label>

                  <select
                    id="totalPlayers"
                    name="totalPlayers"
                    value={form.totalPlayers}
                    onChange={handleChange}
                    required
                    disabled={actionLoading === "create"}
                  >
                    <option value="8">8 PLAYERS</option>
                    <option value="9">9 PLAYERS</option>
                    <option value="10">10 PLAYERS</option>
                  </select>
                </div>

                {/* ACCOMPANYING PLAYERS */}

                <div className="matchmaking-form-group">
                  <label htmlFor="accompanyingPlayers">
                    PLAYERS COMING WITH YOU
                  </label>

                  <select
                    id="accompanyingPlayers"
                    name="accompanyingPlayers"
                    value={form.accompanyingPlayers}
                    onChange={handleChange}
                    required
                    disabled={actionLoading === "create"}
                  >
                    {Array.from(
                      { length: totalPlayers },
                      (_, index) => index
                    ).map((number) => (
                      <option key={number} value={number}>
                        {number} {number === 1 ? "PLAYER" : "PLAYERS"}
                      </option>
                    ))}
                  </select>

                  <small>
                    The creator is automatically counted as one player.
                  </small>
                </div>

                {/* AUTOMATIC CALCULATION */}

                <div
                  className="matchmaking-player-summary"
                  style={{
                    gridColumn: "1 / -1",
                    padding: "18px",
                    border: "1px solid rgba(239,68,68,0.35)",
                    borderRadius: "10px",
                    background: "rgba(239,68,68,0.06)",
                    color: "#fff",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: "12px",
                      marginBottom: "12px",
                    }}
                  >
                    <span>Total players planned</span>
                    <strong>{totalPlayers}</strong>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: "12px",
                      marginBottom: "12px",
                    }}
                  >
                    <span>Creator</span>
                    <strong>1</strong>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: "12px",
                      marginBottom: "12px",
                    }}
                  >
                    <span>Accompanying players</span>
                    <strong>{accompanyingPlayers}</strong>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: "12px",
                      paddingTop: "12px",
                      borderTop: "1px solid rgba(255,255,255,0.12)",
                    }}
                  >
                    <span>Players still needed</span>

                    <strong style={{ color: "#ef4444" }}>
                      {remainingPlayers}
                    </strong>
                  </div>

                  <p
                    style={{
                      margin: "12px 0 0",
                      fontSize: "12px",
                      color: "#aaa",
                    }}
                  >
                    {remainingPlayers === 0
                      ? "Your group already reaches the planned number of players."
                      : `${remainingPlayers} more ${
                          remainingPlayers === 1 ? "player is" : "players are"
                        } needed to complete the match.`}
                  </p>
                </div>

                {/* SUBMIT */}

                <div className="matchmaking-form-footer">
                  <button
                    type="submit"
                    className="primary-button"
                    disabled={
                      !form.platform ||
                      !form.game ||
                      !form.date ||
                      !form.time ||
                      actionLoading === "create"
                    }
                  >
                    <Plus size={18} />

                    {actionLoading === "create"
                      ? "CREATING..."
                      : "CREATE MATCH"}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>

      {/* =====================================================
          JOIN MATCH MODAL
      ===================================================== */}

      {showJoinForm && selectedMatch && (
        <div className="matchmaking-modal-overlay">
          <div className="matchmaking-modal">
            <div className="matchmaking-modal-header">
              <div>
                <span>JOIN SESSION</span>

                <h2>
                  JOIN <strong>MATCH</strong>
                </h2>
              </div>

              <button
                type="button"
                className="matchmaking-close-button"
                onClick={closeJoinForm}
                disabled={actionLoading.startsWith("join-")}
              >
                <X size={17} />
              </button>
            </div>

            {/* MATCH INFORMATION */}

            <div className="matchmaking-join-info">
              <div>
                <Gamepad2 size={20} />

                <span>
                  {selectedMatch.game_name ||
                    selectedMatch.game?.name ||
                    "Unknown game"}
                </span>
              </div>

              <div>
                <Users size={20} />

                <span>
                  {getMatchCounts(selectedMatch).joined}/
                  {getMatchCounts(selectedMatch).needed} PLAYERS
                </span>
              </div>

              <div>
                <Calendar size={20} />

                <span>{selectedMatch.date || "-"}</span>
              </div>

              <div>
                <Clock size={20} />

                <span>{selectedMatch.time || "-"}</span>
              </div>
            </div>

            <form className="matchmaking-form" onSubmit={joinMatch}>
              <div className="matchmaking-form-group">
                <label htmlFor="join-name">PLAYER NAME</label>

                <input
                  id="join-name"
                  type="text"
                  name="name"
                  value={joinForm.name}
                  onChange={handleJoinChange}
                  placeholder="Enter your name"
                  required
                  disabled={actionLoading.startsWith("join-")}
                />
              </div>

              <div className="matchmaking-form-group">
                <label htmlFor="join-phone">PHONE NUMBER</label>

                <input
                  id="join-phone"
                  type="tel"
                  name="phone"
                  value={joinForm.phone}
                  onChange={handleJoinChange}
                  placeholder="Enter your phone"
                  required
                  disabled={actionLoading.startsWith("join-")}
                />
              </div>

              {joinError && (
                <div
                  className="matchmaking-error"
                  role="alert"
                  style={{
                    gridColumn: "1 / -1",
                    color: "#ef4444",
                    fontSize: "13px",
                  }}
                >
                  {joinError}
                </div>
              )}

              <div className="matchmaking-form-footer">
                <button
                  type="button"
                  className="matchmaking-close-button"
                  onClick={closeJoinForm}
                  disabled={actionLoading.startsWith("join-")}
                >
                  CANCEL
                </button>

                <button
                  type="submit"
                  className="primary-button"
                  disabled={
                    !joinForm.name.trim() ||
                    !joinForm.phone.trim() ||
                    actionLoading === `join-${selectedMatch.id}`
                  }
                >
                  <Users size={18} />

                  {actionLoading === `join-${selectedMatch.id}`
                    ? "JOINING..."
                    : "JOIN MATCH"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}

export default MatchMaking;
