
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  Gamepad2,
} from "lucide-react";

import { games as initialGames } from "../../data/games";

function AdminGameNew() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    category: "",
    platform: "PC",
    price: "",
    image: "",
    description: "",
    tags: "",
    available: true,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (
      !form.name ||
      !form.category ||
      !form.price ||
      !form.description
    ) {
      alert("Please complete all required fields.");
      return;
    }

    const savedGames = JSON.parse(
      localStorage.getItem("nexusGames") ||
        "null"
    );

    const currentGames =
      savedGames || initialGames;

    const newGame = {
      id: Date.now(),
      name: form.name,
      category: form.category,
      platform: form.platform,
      price: Number(form.price),
      image:
        form.image ||
        "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80",
      description: form.description,
      tags: form.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      available: form.available,
    };

    const updatedGames = [
      ...currentGames,
      newGame,
    ];

    localStorage.setItem(
      "nexusGames",
      JSON.stringify(updatedGames)
    );

    navigate("/admin/games");
  };

  return (
    <section className="admin-page">

      <div className="admin-page-header">

        <div>
          <span>GAME MANAGEMENT</span>

          <h1>
            ADD
            <br />
            <strong>GAME.</strong>
          </h1>
        </div>

        <Link
          to="/admin/games"
          className="admin-back-button"
        >
          <ArrowLeft size={18} />
          BACK TO GAMES
        </Link>

      </div>

      <div className="admin-form-panel">

        <div className="admin-form-title">

          <Gamepad2 size={30} />

          <div>
            <span>NEW ENTRY</span>
            <h2>GAME INFORMATION</h2>
          </div>

        </div>

        <form
          className="admin-game-form"
          onSubmit={handleSubmit}
        >

          <div className="admin-form-grid">

            <div className="admin-form-group">
              <label>GAME NAME *</label>

              <input
                type="text"
                name="name"
                placeholder="e.g. Counter-Strike 2"
                value={form.name}
                onChange={handleChange}
              />
            </div>

            <div className="admin-form-group">
              <label>CATEGORY *</label>

              <input
                type="text"
                name="category"
                placeholder="e.g. FPS"
                value={form.category}
                onChange={handleChange}
              />
            </div>

            <div className="admin-form-group">
              <label>PLATFORM *</label>

              <select
                name="platform"
                value={form.platform}
                onChange={handleChange}
              >
                <option value="PC">PC</option>
                <option value="PS5">PS5</option>
              </select>
            </div>

            <div className="admin-form-group">
              <label>PRICE / HOUR *</label>

              <input
                type="number"
                name="price"
                min="0"
                placeholder="300"
                value={form.price}
                onChange={handleChange}
              />
            </div>

            <div className="admin-form-group full-width">
              <label>IMAGE URL</label>

              <input
                type="url"
                name="image"
                placeholder="https://..."
                value={form.image}
                onChange={handleChange}
              />
            </div>

            <div className="admin-form-group full-width">
              <label>DESCRIPTION *</label>

              <textarea
                name="description"
                rows="5"
                placeholder="Describe the game..."
                value={form.description}
                onChange={handleChange}
              />
            </div>

            <div className="admin-form-group full-width">
              <label>TAGS</label>

              <input
                type="text"
                name="tags"
                placeholder="PC, FPS, Competitive"
                value={form.tags}
                onChange={handleChange}
              />

              <small>
                Separate tags using commas.
              </small>
            </div>

            <label className="admin-checkbox">
              <input
                type="checkbox"
                name="available"
                checked={form.available}
                onChange={handleChange}
              />

              <span>
                Game is currently available
              </span>
            </label>

          </div>

          <div className="admin-form-footer">

            <Link
              to="/admin/games"
              className="admin-cancel-button"
            >
              CANCEL
            </Link>

            <button
              type="submit"
              className="admin-primary-button"
            >
              <Save size={18} />
              SAVE GAME
            </button>

          </div>

        </form>

      </div>

    </section>
  );
}

export default AdminGameNew;

