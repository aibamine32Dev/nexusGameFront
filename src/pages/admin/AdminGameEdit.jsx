import { useEffect, useState } from "react";
import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  ArrowLeft,
  Save,
  Gamepad2,
} from "lucide-react";

function AdminGameEdit() {
  const { id } = useParams();
  const navigate = useNavigate();

  const API_URL = "https://nexusgameback.onrender.com/api/games/";

  const [game, setGame] = useState(null);
  const [form, setForm] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // ================================
  // LOAD GAME FROM DJANGO
  // ================================

  useEffect(() => {
    const loadGame = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_URL}${id}/`
        );

        if (!response.ok) {
          throw new Error("Game not found");
        }

        const data = await response.json();

        setGame(data);

        setForm({
          name: data.name,
          category: data.category,
          platform: data.platform,
          price: data.price,
          image: data.image || "",
          description: data.description || "",
          tags: Array.isArray(data.tags)
            ? data.tags.join(", ")
            : "",
          available: data.available,
        });
      } catch (err) {
        console.error(
          "Load game error:",
          err
        );

        setError(
          "Unable to load the game."
        );
        setGame(null);
        setForm(null);
      } finally {
        setLoading(false);
      }
    };

    loadGame();
  }, [id]);

  // ================================
  // HANDLE INPUT CHANGES
  // ================================

  const handleChange = (e) => {
    const {
      name,
      value,
      type,
      checked,
    } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  };

  // ================================
  // UPDATE GAME
  // ================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !form.name ||
      !form.category ||
      !form.price ||
      !form.description
    ) {
      alert(
        "Please complete all required fields."
      );
      return;
    }

    try {
      setSaving(true);

      const updatedGame = {
        name: form.name,
        category: form.category,
        platform: form.platform,
        price: Number(form.price),
        image: form.image,
        description: form.description,
        tags: form.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
        available: form.available,
      };

      const response = await fetch(
        `${API_URL}${id}/`,
        {
          method: "PATCH",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify(
            updatedGame
          ),
        }
      );

      if (!response.ok) {
        const errorData =
          await response.json();

        console.error(
          "Update game API error:",
          errorData
        );

        throw new Error(
          "Failed to update game"
        );
      }

      const data =
        await response.json();

      console.log(
        "Game updated:",
        data
      );

      navigate("/admin/games");
    } catch (err) {
      console.error(
        "Update game error:",
        err
      );

      alert(
        "Unable to update the game. Please check the server."
      );
    } finally {
      setSaving(false);
    }
  };

  // ================================
  // LOADING
  // ================================

  if (loading) {
    return (
      <section className="admin-page">

        <div className="admin-empty">

          <Gamepad2 size={50} />

          <h2>
            LOADING GAME
          </h2>

          <p>
            Loading game information
            from the server...
          </p>

        </div>

      </section>
    );
  }

  // ================================
  // ERROR / GAME NOT FOUND
  // ================================

  if (error || !game || !form) {
    return (
      <section className="admin-page">

        <div className="admin-empty">

          <Gamepad2 size={50} />

          <h2>
            GAME NOT FOUND
          </h2>

          <p>
            {error ||
              "The requested game does not exist."}
          </p>

          <Link
            to="/admin/games"
            className="admin-primary-button"
          >
            BACK TO GAMES
          </Link>

        </div>

      </section>
    );
  }

  // ================================
  // PAGE
  // ================================

  return (
    <section className="admin-page">

      <div className="admin-page-header">

        <div>

          <span>
            GAME MANAGEMENT
          </span>

          <h1>
            EDIT
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

            <span>
              EDITING
            </span>

            <h2>
              {game.name}
            </h2>

          </div>

        </div>

        <form
          className="admin-game-form"
          onSubmit={handleSubmit}
        >

          <div className="admin-form-grid">

            <div className="admin-form-group">

              <label>
                GAME NAME *
              </label>

              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
              />

            </div>

            <div className="admin-form-group">

              <label>
                CATEGORY *
              </label>

              <input
                type="text"
                name="category"
                value={form.category}
                onChange={handleChange}
              />

            </div>

            <div className="admin-form-group">

              <label>
                PLATFORM *
              </label>

              <select
                name="platform"
                value={form.platform}
                onChange={handleChange}
              >
                <option value="PC">
                  PC
                </option>

                <option value="PS5">
                  PS5
                </option>

              </select>

            </div>

            <div className="admin-form-group">

              <label>
                PRICE / HOUR *
              </label>

              <input
                type="number"
                name="price"
                min="0"
                value={form.price}
                onChange={handleChange}
              />

            </div>

            <div className="admin-form-group full-width">

              <label>
                IMAGE URL
              </label>

              <input
                type="url"
                name="image"
                value={form.image}
                onChange={handleChange}
              />

            </div>

            <div className="admin-form-group full-width">

              <label>
                DESCRIPTION *
              </label>

              <textarea
                name="description"
                rows="5"
                value={form.description}
                onChange={handleChange}
              />

            </div>

            <div className="admin-form-group full-width">

              <label>
                TAGS
              </label>

              <input
                type="text"
                name="tags"
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
              disabled={saving}
            >

              <Save size={18} />

              {saving
                ? "UPDATING..."
                : "UPDATE GAME"}

            </button>

          </div>

        </form>

      </div>

    </section>
  );
}

export default AdminGameEdit;