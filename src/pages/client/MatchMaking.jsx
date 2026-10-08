
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

function MatchMaking() {
  // =========================================================
  // API
  // =========================================================

  const API_URL = "https://nexusgameback.onrender.com/api";

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
  // ACTION LOADING
  // =========================================================

  const [actionLoading, setActionLoading] = useState("");

  // =========================================================
  // JOIN FORM
  // =========================================================

  const [showJoinForm, setShowJoinForm] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState(null);

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
    playersNeeded: "2",
  });

  // =========================================================
  // GENERIC API REQUEST
  // =========================================================

  const apiRequest = async (url, options = {}) => {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
    });

    const contentType =
      response.headers.get("content-type") || "";

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

      let message = `API error ${response.status}`;

      if (typeof data === "string" && data.trim()) {
        message = `${message}: ${data.substring(0, 300)}`;
      } else if (data && typeof data === "object") {
        message = Object.entries(data)
          .map(([key, value]) => {
            const valueText = Array.isArray(value)
              ? value.join(", ")
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

      const data = await apiRequest(
        `${API_URL}/games/`
      );

      setGames(
        Array.isArray(data)
          ? data
          : data.results || []
      );
    } catch (error) {
      console.error(
        "Games API error:",
        error
      );

      setGamesError(
        error.message ||
          "Unable to load games."
      );
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

      const data = await apiRequest(
        `${API_URL}/matches/open/`
      );

      setMatches(
        Array.isArray(data)
          ? data
          : data.results || []
      );
    } catch (error) {
      console.error(
        "Matches API error:",
        error
      );

      setMatchesError(
        error.message ||
          "Unable to load open matches."
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

  const availablePlatforms = useMemo(() => {
    return [
      ...new Set(
        games
          .map((game) => game.platform)
          .filter(Boolean)
      ),
    ];
  }, [games]);

  // =========================================================
  // FILTER GAMES BY PLATFORM
  // =========================================================

  const filteredGames = useMemo(() => {
    if (!form.platform) {
      return [];
    }

    return games.filter(
      (game) =>
        game.platform === form.platform
    );
  }, [games, form.platform]);

  // =========================================================
  // HANDLE CREATE FORM
  // =========================================================

  const handleChange = (event) => {
    const { name, value } =
      event.target;

    if (name === "platform") {
      setForm((previous) => ({
        ...previous,
        platform: value,
        game: "",
      }));

      return;
    }

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // =========================================================
  // HANDLE JOIN FORM
  // =========================================================

  const handleJoinChange = (event) => {
    const { name, value } =
      event.target;

    setJoinForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // =========================================================
  // CREATE MATCH
  // =========================================================

  const createMatch = async (event) => {
    event.preventDefault();

    const selectedGame = games.find(
      (game) =>
        game.id === Number(form.game)
    );

    if (!form.name.trim()) {
      alert("Please enter your name.");
      return;
    }

    if (!form.phone.trim()) {
      alert("Please enter your phone number.");
      return;
    }

    if (!form.platform) {
      alert("Please select a platform.");
      return;
    }

    if (!selectedGame) {
      alert("Please select a game.");
      return;
    }

    if (!form.date) {
      alert("Please select a date.");
      return;
    }

    if (!form.time) {
      alert("Please select a time.");
      return;
    }

    const payload = {
      name: form.name.trim(),
      phone: form.phone.trim(),
      game: selectedGame.id,
      platform: form.platform,
      date: form.date,
      time: form.time,
      players_needed: Number(
        form.playersNeeded
      ),
    };

    console.log(
      "Creating match:",
      payload
    );

    try {
      setActionLoading("create");

      const data = await apiRequest(
        `${API_URL}/matches/`,
        {
          method: "POST",
          body: JSON.stringify(payload),
        }
      );

      console.log(
        "Match created:",
        data
      );

      alert(
        "Match created successfully."
      );

      setForm({
        name: "",
        phone: "",
        platform: "",
        game: "",
        date: "",
        time: "",
        playersNeeded: "2",
      });

      setShowCreateForm(false);
      setActiveTab("find");

      await loadOpenMatches();
    } catch (error) {
      console.error(
        "Create match error:",
        error
      );

      alert(
        error.message ||
          "Unable to create match."
      );
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

    setShowJoinForm(true);
  };

  // =========================================================
  // CLOSE JOIN FORM
  // =========================================================

  const closeJoinForm = () => {
    if (actionLoading.startsWith("join-")) {
      return;
    }

    setShowJoinForm(false);
    setSelectedMatch(null);

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
      alert("No match selected.");
      return;
    }

    if (!joinForm.name.trim()) {
      alert("Please enter your name.");
      return;
    }

    if (!joinForm.phone.trim()) {
      alert("Please enter your phone number.");
      return;
    }

    const matchId = selectedMatch.id;

    const payload = {
      name: joinForm.name.trim(),
      phone: joinForm.phone.trim(),
    };

    console.log(
      "Joining match:",
      matchId,
      payload
    );

    try {
      setActionLoading(
        `join-${matchId}`
      );

      const data = await apiRequest(
        `${API_URL}/matches/${matchId}/join/`,
        {
          method: "POST",
          body: JSON.stringify(payload),
        }
      );

      console.log(
        "Joined match:",
        data
      );

      alert(
        data?.message ||
          "You joined the match successfully."
      );

      setShowJoinForm(false);
      setSelectedMatch(null);

      setJoinForm({
        name: "",
        phone: "",
      });

      await loadOpenMatches();
    } catch (error) {
      console.error(
        "Join match error:",
        error
      );

      alert(
        error.message ||
          "Unable to join match."
      );
    } finally {
      setActionLoading("");
    }
  };

  // =========================================================
  // CONFIRM MATCH
  // =========================================================

  const confirmMatch = async (matchId) => {
    try {
      setActionLoading(
        `confirm-${matchId}`
      );

      const data = await apiRequest(
        `${API_URL}/matches/${matchId}/confirm/`,
        {
          method: "POST",
        }
      );

      alert(
        data?.message ||
          "Match confirmed successfully."
      );

      await loadOpenMatches();
    } catch (error) {
      console.error(
        "Confirm match error:",
        error
      );

      alert(
        error.message ||
          "Unable to confirm the match."
      );
    } finally {
      setActionLoading("");
    }
  };

  // =========================================================
  // CANCEL MATCH
  // =========================================================

  const cancelMatch = async (matchId) => {
    const confirmed =
      window.confirm(
        "Are you sure you want to cancel this match?"
      );

    if (!confirmed) {
      return;
    }

    try {
      setActionLoading(
        `cancel-${matchId}`
      );

      const data = await apiRequest(
        `${API_URL}/matches/${matchId}/cancel/`,
        {
          method: "POST",
        }
      );

      alert(
        data?.message ||
          "Match cancelled successfully."
      );

      await loadOpenMatches();
    } catch (error) {
      console.error(
        "Cancel match error:",
        error
      );

      alert(
        error.message ||
          "Unable to cancel the match."
      );
    } finally {
      setActionLoading("");
    }
  };

  // =========================================================
  // COMPLETE MATCH
  // =========================================================

  const completeMatch = async (matchId) => {
    const confirmed =
      window.confirm(
        "Are you sure you want to complete this match?"
      );

    if (!confirmed) {
      return;
    }

    try {
      setActionLoading(
        `complete-${matchId}`
      );

      const data = await apiRequest(
        `${API_URL}/matches/${matchId}/complete/`,
        {
          method: "POST",
        }
      );

      alert(
        data?.message ||
          "Match completed successfully."
      );

      await loadOpenMatches();
    } catch (error) {
      console.error(
        "Complete match error:",
        error
      );

      alert(
        error.message ||
          "Unable to complete the match."
      );
    } finally {
      setActionLoading("");
    }
  };

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <section className="matchmaking-page">

      {/* HEADER */}

      <div className="matchmaking-header">

        <div>
          <span>
            NEXUS MATCHMAKING
          </span>

          <h1>
            FIND YOUR
            <br />
            <strong>
              OPPONENT.
            </strong>
          </h1>

          <p>
            Create a match and invite
            other players to join your
            session, or find an existing
            match and join the competition.
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
            activeTab === "find"
              ? "active"
              : ""
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
            activeTab === "create"
              ? "active"
              : ""
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
                <span>
                  AVAILABLE NOW
                </span>

                <h2>
                  OPEN{" "}
                  <strong>
                    MATCHES
                  </strong>
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

            {/* LOADING */}

            {matchesLoading && (
              <div className="matchmaking-empty">
                <p>
                  LOADING MATCHES...
                </p>
              </div>
            )}

            {/* ERROR */}

            {!matchesLoading &&
              matchesError && (
                <div className="matchmaking-empty">

                  <p>
                    {matchesError}
                  </p>

                  <button
                    type="button"
                    className="primary-button"
                    onClick={loadOpenMatches}
                  >
                    RETRY
                  </button>

                </div>
              )}

            {/* EMPTY */}

            {!matchesLoading &&
              !matchesError &&
              matches.length === 0 && (
                <div className="matchmaking-empty">

                  <Users size={45} />

                  <h3>
                    NO OPEN MATCHES
                  </h3>

                  <p>
                    Be the first player
                    to create a
                    matchmaking session.
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

            {/* MATCHES */}

            {!matchesLoading &&
              !matchesError &&
              matches.length > 0 && (

                <div className="matchmaking-list">

                  {matches.map(
                    (match) => {

                      const gameName =
                        match.game_name ||
                        match.game?.name ||
                        "Unknown game";

                      const playerName =
                        match.player_name ||
                        match.creator_name ||
                        match.creatorName ||
                        "Player";

                      const playersJoined =
                        match.players_joined ??
                        match.playersJoined ??
                        0;

                      const playersNeeded =
                        match.players_needed ??
                        match.playersNeeded ??
                        2;

                      const isFull =
                        Number(playersJoined) >=
                        Number(playersNeeded);

                      return (
                        <div
                          className="match-card"
                          key={match.id}
                        >

                          {/* MAIN */}

                          <div className="match-card-main">

                            <div className="match-game-icon">
                              <Gamepad2 size={27} />
                            </div>

                            <div className="match-card-info">

                              <span>
                                {match.platform}
                              </span>

                              <h3>
                                {gameName}
                              </h3>

                              <p>
                                Created by{" "}
                                <strong>
                                  {playerName}
                                </strong>
                              </p>

                            </div>

                          </div>

                          {/* DETAILS */}

                          <div className="match-card-details">

                            <div>
                              <Calendar size={15} />

                              <span>
                                {match.date || "-"}
                              </span>
                            </div>

                            <div>
                              <Clock size={15} />

                              <span>
                                {match.time || "-"}
                              </span>
                            </div>

                            <div>
                              <Users size={15} />

                              <span>
                                {playersJoined}
                                /
                                {playersNeeded}
                              </span>
                            </div>

                          </div>

                          {/* ACTION */}

                          <div className="match-card-action">

                            <button
                              type="button"
                              className="primary-button"
                              disabled={
                                isFull ||
                                actionLoading ===
                                  `join-${match.id}`
                              }
                              onClick={() =>
                                openJoinForm(match)
                              }
                            >
                              <Users size={17} />

                              {isFull
                                ? "MATCH FULL"
                                : actionLoading ===
                                  `join-${match.id}`
                                ? "JOINING..."
                                : "JOIN MATCH"}
                            </button>

                          </div>

                        </div>
                      );
                    }
                  )}

                </div>
              )}

          </div>
        )}

        {/* ===================================================
            CREATE MATCH
        =================================================== */}

        {activeTab === "create" &&
          showCreateForm && (

            <div className="matchmaking-create">

              <div className="matchmaking-section-header">

                <div>
                  <span>
                    NEW SESSION
                  </span>

                  <h2>
                    CREATE{" "}
                    <strong>
                      MATCH
                    </strong>
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

              {/* GAMES LOADING */}

              {gamesLoading && (
                <p>
                  LOADING GAMES...
                </p>
              )}

              {/* GAMES ERROR */}

              {!gamesLoading &&
                gamesError && (
                  <p>
                    {gamesError}
                  </p>
                )}

              {/* NO GAMES */}

              {!gamesLoading &&
                !gamesError &&
                games.length === 0 && (
                  <p>
                    No games are available.
                  </p>
                )}

              {/* FORM */}

              {!gamesLoading &&
                !gamesError &&
                games.length > 0 && (

                  <form
                    className="matchmaking-form"
                    onSubmit={createMatch}
                  >

                    {/* NAME */}

                    <div className="matchmaking-form-group">

                      <label>
                        PLAYER NAME
                      </label>

                      <input
                        type="text"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        placeholder="Enter your name"
                        required
                      />

                    </div>

                    {/* PHONE */}

                    <div className="matchmaking-form-group">

                      <label>
                        PHONE NUMBER
                      </label>

                      <input
                        type="tel"
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
                        placeholder="Enter your phone"
                        required
                      />

                    </div>

                    {/* PLATFORM */}

                    <div className="matchmaking-form-group">

                      <label>
                        PLATFORM
                      </label>

                      <select
                        name="platform"
                        value={form.platform}
                        onChange={handleChange}
                        required
                      >

                        <option value="">
                          SELECT PLATFORM
                        </option>

                        {availablePlatforms.map(
                          (platform) => (
                            <option
                              key={platform}
                              value={platform}
                            >
                              {platform}
                            </option>
                          )
                        )}

                      </select>

                    </div>

                    {/* GAME */}

                    <div className="matchmaking-form-group">

                      <label>
                        GAME
                      </label>

                      <select
                        name="game"
                        value={form.game}
                        onChange={handleChange}
                        disabled={!form.platform}
                        required
                      >

                        <option value="">
                          {!form.platform
                            ? "SELECT PLATFORM FIRST"
                            : "SELECT GAME"}
                        </option>

                        {filteredGames.map(
                          (game) => (
                            <option
                              key={game.id}
                              value={game.id}
                            >
                              {game.name}
                            </option>
                          )
                        )}

                      </select>

                    </div>

                    {/* DATE */}

                    <div className="matchmaking-form-group">

                      <label>
                        DATE
                      </label>

                      <input
                        type="date"
                        name="date"
                        value={form.date}
                        onChange={handleChange}
                        required
                      />

                    </div>

                    {/* TIME */}

                    <div className="matchmaking-form-group">

                      <label>
                        TIME
                      </label>

                      <input
                        type="time"
                        name="time"
                        value={form.time}
                        onChange={handleChange}
                        required
                      />

                    </div>

                    {/* PLAYERS */}

                    <div className="matchmaking-form-group">

                      <label>
                        PLAYERS NEEDED
                      </label>

                      <select
                        name="playersNeeded"
                        value={form.playersNeeded}
                        onChange={handleChange}
                        required
                      >

                        <option value="2">
                          2 PLAYERS
                        </option>

                        <option value="3">
                          3 PLAYERS
                        </option>

                        <option value="4">
                          4 PLAYERS
                        </option>

                        <option value="5">
                          5 PLAYERS
                        </option>

                        <option value="6">
                          6 PLAYERS
                        </option>

                      </select>

                    </div>

                    {/* SUBMIT */}

                    <div className="matchmaking-form-footer">

                      <button
                        type="submit"
                        className="primary-button"
                        disabled={
                          !form.platform ||
                          !form.game ||
                          actionLoading ===
                            "create"
                        }
                      >

                        <Plus size={18} />

                        {actionLoading ===
                        "create"
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

      {showJoinForm &&
        selectedMatch && (

          <div className="matchmaking-modal-overlay">

            <div className="matchmaking-modal">

              <div className="matchmaking-modal-header">

                <div>
                  <span>
                    JOIN SESSION
                  </span>

                  <h2>
                    JOIN{" "}
                    <strong>
                      MATCH
                    </strong>
                  </h2>
                </div>

                <button
                  type="button"
                  className="matchmaking-close-button"
                  onClick={closeJoinForm}
                  disabled={
                    actionLoading.startsWith(
                      "join-"
                    )
                  }
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
                    {selectedMatch.players_joined ??
                      0}
                    /
                    {selectedMatch.players_needed ??
                      2}
                    {" "}PLAYERS
                  </span>
                </div>

              </div>

              {/* JOIN FORM */}

              <form
                className="matchmaking-form"
                onSubmit={joinMatch}
              >

                {/* NAME */}

                <div className="matchmaking-form-group">

                  <label>
                    PLAYER NAME
                  </label>

                  <input
                    type="text"
                    name="name"
                    value={joinForm.name}
                    onChange={handleJoinChange}
                    placeholder="Enter your name"
                    required
                    disabled={
                      actionLoading.startsWith(
                        "join-"
                      )
                    }
                  />

                </div>

                {/* PHONE */}

                <div className="matchmaking-form-group">

                  <label>
                    PHONE NUMBER
                  </label>

                  <input
                    type="tel"
                    name="phone"
                    value={joinForm.phone}
                    onChange={handleJoinChange}
                    placeholder="Enter your phone"
                    required
                    disabled={
                      actionLoading.startsWith(
                        "join-"
                      )
                    }
                  />

                </div>

                {/* BUTTONS */}

                <div className="matchmaking-form-footer">

                  <button
                    type="button"
                    className="matchmaking-close-button"
                    onClick={closeJoinForm}
                    disabled={
                      actionLoading.startsWith(
                        "join-"
                      )
                    }
                  >
                    CANCEL
                  </button>

                  <button
                    type="submit"
                    className="primary-button"
                    disabled={
                      !joinForm.name.trim() ||
                      !joinForm.phone.trim() ||
                      actionLoading ===
                        `join-${selectedMatch.id}`
                    }
                  >

                    <Users size={18} />

                    {actionLoading ===
                    `join-${selectedMatch.id}`
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

