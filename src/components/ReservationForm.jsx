import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { games } from "../data/games";

function ReservationForm({ selectedGame }) {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    game: selectedGame ? selectedGame.id : "",
    date: "",
    time: "",
    duration: "1",
    name: "",
    phone: "",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (
      !form.game ||
      !form.date ||
      !form.time ||
      !form.name ||
      !form.phone
    ) {
      alert("Please complete all required fields.");
      return;
    }

    const reservation = {
      ...form,
      reservationNumber: `NG-${Date.now()}`,
    };

    localStorage.setItem(
      "nexusReservation",
      JSON.stringify(reservation)
    );

    navigate("/reservation/success");
  };

  return (
    <form className="reservation-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label>SELECT GAME</label>

        <select
          name="game"
          value={form.game}
          onChange={handleChange}
        >
          <option value="">Choose a game</option>

          {games.map((game) => (
            <option key={game.id} value={game.id}>
              {game.name} — {game.platform}
            </option>
          ))}
        </select>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>DATE</label>

          <input
            type="date"
            name="date"
            value={form.date}
            onChange={handleChange}
            min={new Date().toISOString().split("T")[0]}
          />
        </div>

        <div className="form-group">
          <label>TIME</label>

          <input
            type="time"
            name="time"
            value={form.time}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="form-group">
        <label>DURATION</label>

        <select
          name="duration"
          value={form.duration}
          onChange={handleChange}
        >
          <option value="1">1 Hour</option>
          <option value="2">2 Hours</option>
          <option value="3">3 Hours</option>
          <option value="4">4 Hours</option>
        </select>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>YOUR NAME</label>

          <input
            type="text"
            name="name"
            placeholder="Enter your name"
            value={form.name}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>PHONE</label>

          <input
            type="tel"
            name="phone"
            placeholder="05 XX XX XX XX"
            value={form.phone}
            onChange={handleChange}
          />
        </div>
      </div>

      <button type="submit" className="primary-button full">
        CONFIRM RESERVATION
      </button>
    </form>
  );
}

export default ReservationForm;