import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function ReservationForm({ selectedGame }) {
  const navigate = useNavigate();

  const [games, setGames] = useState([]);
  const [loadingGames, setLoadingGames] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    platform: selectedGame
      ? selectedGame.platform
      : "",

    game: selectedGame
      ? selectedGame.id
      : "",

    date: "",
    time: "",
    duration: "1",
    name: "",
    phone: "",
  });

  const GAMES_API =
    "https://nexusgameback.onrender.com/api/games/";

  const PLAYERS_API =
    "https://nexusgameback.onrender.com/api/players/";

  const RESERVATIONS_API =
    "https://nexusgameback.onrender.com/api/reservations/";

  // ==========================================
  // LOAD GAMES
  // ==========================================

  useEffect(() => {
    const loadGames = async () => {
      try {
        setLoadingGames(true);

        const response = await fetch(
          GAMES_API
        );

        if (!response.ok) {
          throw new Error(
            "Failed to load games"
          );
        }

        const data =
          await response.json();

        setGames(data);

      } catch (err) {

        console.error(
          "Games API error:",
          err
        );

      } finally {

        setLoadingGames(false);

      }
    };

    loadGames();

  }, []);

  // ==========================================
  // SELECTED GAME
  // ==========================================

  useEffect(() => {

    if (selectedGame) {

      setForm((previous) => ({
        ...previous,

        platform:
          selectedGame.platform,

        game:
          selectedGame.id,
      }));

    }

  }, [selectedGame]);

  // ==========================================
  // HANDLE CHANGE
  // ==========================================

  const handleChange = (e) => {

    const {
      name,
      value,
    } = e.target;

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

  // ==========================================
  // FILTER GAMES
  // ==========================================

  const filteredGames = form.platform
    ? games.filter(
        (game) =>
          game.platform ===
            form.platform &&
          game.available
      )
    : games.filter(
        (game) => game.available
      );

  // ==========================================
  // CREATE PLAYER
  // ==========================================

  const createPlayer = async () => {

    const response = await fetch(
      PLAYERS_API,
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify({
          name: form.name.trim(),
          phone: form.phone.trim(),
        }),
      }
    );

    const data =
      await response.json();

    if (!response.ok) {

      console.error(
        "Player API error:",
        data
      );

      throw new Error(
        "Unable to create player."
      );
    }

    return data;
  };

  // ==========================================
  // CREATE RESERVATION
  // ==========================================

  const createReservation = async (
    playerId
  ) => {

    const response = await fetch(
      RESERVATIONS_API,
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify({
          player: playerId,

          game: Number(form.game),

          platform: form.platform,

          date: form.date,

          time: form.time,

          duration:
            Number(form.duration),
        }),
      }
    );

    const data =
      await response.json();

    if (!response.ok) {

      console.error(
        "Reservation API error:",
        data
      );

      throw new Error(
        "Unable to create reservation."
      );
    }

    return data;
  };

  // ==========================================
  // SUBMIT
  // ==========================================

  const handleSubmit = async (e) => {

    e.preventDefault();

    if (
      !form.platform ||
      !form.game ||
      !form.date ||
      !form.time ||
      !form.duration ||
      !form.name.trim() ||
      !form.phone.trim()
    ) {

      alert(
        "Please complete all required fields."
      );

      return;
    }

    try {

      setSubmitting(true);

      // 1. CREATE PLAYER
      const player =
        await createPlayer();

      console.log(
        "Player created:",
        player
      );

      // 2. CREATE RESERVATION
      const reservation =
        await createReservation(
          player.id
        );

      console.log(
        "Reservation created:",
        reservation
      );

      // 3. GO TO SUCCESS PAGE
      navigate(
        `/reservation/success?id=${reservation.id}`
      );

    } catch (err) {

      console.error(
        "Reservation error:",
        err
      );

      alert(
        "Unable to create the reservation. Please try again."
      );

    } finally {

      setSubmitting(false);

    }
  };

  return (
    <form
      className="reservation-form"
      onSubmit={handleSubmit}
    >

      <div className="form-group">

        <label>
          SELECT PLATFORM
        </label>

        <select
          name="platform"
          value={form.platform}
          onChange={handleChange}
          disabled={submitting}
        >

          <option value="">
            Choose a platform
          </option>

          <option value="PC">
            PC
          </option>

          <option value="PS5">
            PS5
          </option>

        </select>

      </div>

      <div className="form-group">

        <label>
          SELECT GAME
        </label>

        <select
          name="game"
          value={form.game}
          onChange={handleChange}
          disabled={
            loadingGames ||
            !form.platform ||
            submitting
          }
        >

          <option value="">
            {!form.platform
              ? "Choose a platform first"
              : loadingGames
              ? "Loading games..."
              : "Choose a game"}
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

      <div className="form-row">

        <div className="form-group">

          <label>
            DATE
          </label>

          <input
            type="date"
            name="date"
            value={form.date}
            onChange={handleChange}
            min={
              new Date()
                .toISOString()
                .split("T")[0]
            }
            disabled={submitting}
          />

        </div>

        <div className="form-group">

          <label>
            TIME
          </label>

          <input
            type="time"
            name="time"
            value={form.time}
            onChange={handleChange}
            disabled={submitting}
          />

        </div>

      </div>

      <div className="form-group">

        <label>
          DURATION
        </label>

        <select
          name="duration"
          value={form.duration}
          onChange={handleChange}
          disabled={submitting}
        >

          <option value="1">
            1 Hour
          </option>

          <option value="2">
            2 Hours
          </option>

          <option value="3">
            3 Hours
          </option>

          <option value="4">
            4 Hours
          </option>

        </select>

      </div>

      <div className="form-row">

        <div className="form-group">

          <label>
            YOUR NAME
          </label>

          <input
            type="text"
            name="name"
            placeholder="Enter your name"
            value={form.name}
            onChange={handleChange}
            disabled={submitting}
          />

        </div>

        <div className="form-group">

          <label>
            PHONE
          </label>

          <input
            type="tel"
            name="phone"
            placeholder="05 XX XX XX XX"
            value={form.phone}
            onChange={handleChange}
            disabled={submitting}
          />

        </div>

      </div>

      <button
        type="submit"
        className="primary-button full"
        disabled={submitting}
      >

        {submitting
          ? "CREATING RESERVATION..."
          : "CONFIRM RESERVATION"}

      </button>

    </form>
  );
}

export default ReservationForm;