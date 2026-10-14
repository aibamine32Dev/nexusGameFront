import { useEffect, useState } from "react";
import { User, Mail, Phone, Award, RefreshCw, Trash2, Search, PlusCircle, MinusCircle } from "lucide-react";

function AdminPlayers() {
  const API_URL = "https://nexusgameback.onrender.com/api/players/";

  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [updatingId, setUpdatingId] = useState(null);
  
  // État local pour stocker la valeur personnalisée de points saisie pour chaque joueur (clé: playerId)
  const [pointInputs, setPointInputs] = useState({});

  const loadPlayers = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error("Unable to load players.");
      const data = await response.json();
      setPlayers(Array.isArray(data) ? data : []);
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

  // Gérer la modification de la valeur dans l'input de points pour un joueur spécifique
  const handleInputChange = (playerId, value) => {
    setPointInputs((prev) => ({ ...prev, [playerId]: value }));
  };

  // Modifier les points avec une valeur personnalisée (ajout ou retrait)
  const updatePointsCustom = async (player, operation) => {
    const rawValue = pointInputs[player.id];
    const amount = parseInt(rawValue, 10);

    if (isNaN(amount) || amount <= 0) {
      alert("Veuillez entrer un nombre de points valide supérieur à 0.");
      return;
    }

    const delta = operation === "add" ? amount : -amount;
    const newPoints = Math.max(0, player.points + delta);

    try {
      setUpdatingId(player.id);
      const response = await fetch(`${API_URL}${player.id}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ points: newPoints }),
      });

      if (!response.ok) throw new Error("Unable to update player points.");
      const updatedPlayer = await response.json();

      setPlayers((prev) =>
        prev.map((p) => (p.id === updatedPlayer.id ? updatedPlayer : p))
      );

      // Réinitialiser l'input après succès
      setPointInputs((prev) => ({ ...prev, [player.id]: "" }));
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la modification des points.");
    } finally {
      setUpdatingId(null);
    }
  };

  const deletePlayer = async (id) => {
    if (!window.confirm("Voulez-vous vraiment supprimer ce joueur ?")) return;

    try {
      setUpdatingId(id);
      const response = await fetch(`${API_URL}${id}/`, { method: "DELETE" });
      if (!response.ok) throw new Error("Unable to delete player.");
      setPlayers((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la suppression.");
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredPlayers = players.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.phone.includes(searchQuery) ||
      (p.email && p.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <section className="admin-page">
      <div className="admin-page-header">
        <div>
          <span>MANAGEMENT</span>
          <h1>
            PLAYERS <br />
            <strong>MANAGER.</strong>
          </h1>
        </div>
      </div>

      <div className="admin-panel">
        <div className="admin-panel-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2>LISTE DES JOUEURS</h2>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "rgba(255,255,255,0.05)", padding: "6px 12px", borderRadius: "8px" }}>
            <Search size={18} />
            <input
              type="text"
              placeholder="Rechercher (Nom, Email, Tél)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ background: "transparent", border: "none", color: "#fff", outline: "none" }}
            />
          </div>
        </div>

        {loading && <div className="admin-empty"><p>Chargement des joueurs...</p></div>}
        {!loading && error && <div className="admin-empty"><p>{error}</p></div>}

        {!loading && !error && filteredPlayers.length === 0 && (
          <div className="admin-empty"><p>Aucun joueur trouvé.</p></div>
        )}

        {!loading && !error && filteredPlayers.length > 0 && (
          <div className="reservation-groups">
            {filteredPlayers.map((player) => {
              const isUpdating = updatingId === player.id;
              const customValue = pointInputs[player.id] || "";

              return (
                <div key={player.id} className="reservation-group-card">
                  <div className="reservation-group-header">
                    <div className="reservation-group-title">
                      <div className="reservation-group-icon">
                        <User size={22} />
                      </div>
                      <div>
                        <span className="reservation-group-label">PLAYER</span>
                        <h3>{player.name}</h3>
                      </div>
                    </div>
                    <span className="reservation-status status-confirmed" style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                      <Award size={16} /> {player.points} PTS
                    </span>
                  </div>

                  <div className="reservation-group-info" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                    <div className="reservation-info-item">
                      <Phone size={18} />
                      <div>
                        <span>PHONE</span>
                        <strong>{player.phone}</strong>
                      </div>
                    </div>
                    <div className="reservation-info-item">
                      <Mail size={18} />
                      <div>
                        <span>EMAIL</span>
                        <strong>{player.email || "Non renseigné"}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Section de gestion personnalisée des points */}
                  <div style={{ marginTop: "15px", background: "rgba(255,255,255,0.03)", padding: "10px", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px" }}>
                    <input
                      type="number"
                      min="1"
                      placeholder="Nombre de points"
                      value={customValue}
                      onChange={(e) => handleInputChange(player.id, e.target.value)}
                      style={{ background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", padding: "6px 10px", borderRadius: "6px", width: "130px", outline: "none" }}
                    />
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button
                        className="confirm-button"
                        onClick={() => updatePointsCustom(player, "add")}
                        disabled={isUpdating}
                        style={{ display: "flex", alignItems: "center", gap: "4px", padding: "6px 10px" }}
                        title="Ajouter les points"
                      >
                        <PlusCircle size={16} /> +
                      </button>
                      <button
                        className="reject-button"
                        onClick={() => updatePointsCustom(player, "sub")}
                        disabled={isUpdating || player.points <= 0}
                        style={{ display: "flex", alignItems: "center", gap: "4px", padding: "6px 10px" }}
                        title="Retirer les points"
                      >
                        <MinusCircle size={16} /> -
                      </button>
                    </div>
                  </div>

                  <div className="reservation-group-actions" style={{ display: "flex", justifyContent: "flex-end", marginTop: "10px" }}>
                    <button
                      className="delete-button"
                      onClick={() => deletePlayer(player.id)}
                      disabled={isUpdating}
                      title="Supprimer le joueur"
                    >
                      {isUpdating ? <RefreshCw size={17} className="spin" /> : <Trash2 size={17} />} Supprimer
                    </button>
                  </div>
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