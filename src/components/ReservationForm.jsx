import { useEffect, useState, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import {
  CalendarDays,
  Clock,
  Users,
  Monitor,
  Check,
  CircleCheck,
  Phone,
  RotateCcw,
} from "lucide-react";

const API_URL = "https://nexusgameback.onrender.com/api";

const pad = (value) => String(value).padStart(2, "0");

const getLocalDate = () => {
  const now = new Date();
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(
    now.getDate()
  )}`;
};

// Convertit JJ/MM/AAAA vers AAAA-MM-JJ
const parseDate = (value) => {
  const match = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);

  if (!match) return "";

  const [, day, month, year] = match;
  const date = new Date(Number(year), Number(month) - 1, Number(day));

  if (
    date.getFullYear() !== Number(year) ||
    date.getMonth() !== Number(month) - 1 ||
    date.getDate() !== Number(day)
  ) {
    return "";
  }

  return `${year}-${month}-${day}`;
};

// Accepte aussi bien une liste qu'une réponse paginée Django
const extractPlayer = (data) => {
  if (Array.isArray(data)) return data[0] || null;
  if (Array.isArray(data?.results)) return data.results[0] || null;
  if (data?.id) return data;
  return null;
};

function ReservationForm() {
  const { user } = useAuth();

  const [stations, setStations] = useState([]);
  const [availableStations, setAvailableStations] = useState([]);
  const [loadingStations, setLoadingStations] = useState(true);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [reservationResult, setReservationResult] = useState(null);
  const [selectedStations, setSelectedStations] = useState([]);

  // Date affichée dans le champ : JJ/MM/AAAA
  const [dateInput, setDateInput] = useState("");

  // Heure séparée en deux listes pour éviter input type="time"
  const [hour, setHour] = useState("");
  const [minute, setMinute] = useState("");

  const [form, setForm] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    date: "",
    time: "",
    duration: "2",
  });

  // ---------------------------------------------------------
  // CHARGEMENT DES STATIONS
  // ---------------------------------------------------------
  useEffect(() => {
    let active = true;

    const loadStations = async () => {
      try {
        setLoadingStations(true);
        setError("");

        const response = await fetch(`${API_URL}/stations/`);

        if (!response.ok) {
          throw new Error("Unable to load stations.");
        }

        const data = await response.json();

        if (!active) return;

        setStations(Array.isArray(data) ? data : []);
        setAvailableStations(
          Array.isArray(data)
            ? data.filter((station) => station.available)
            : []
        );
      } catch (err) {
        if (!active) return;

        console.error("Stations API error:", err);
        setError("Unable to load gaming stations.");
      } finally {
        if (active) setLoadingStations(false);
      }
    };

    loadStations();

    return () => {
      active = false;
    };
  }, []);

  // ---------------------------------------------------------
  // MODIFICATION DES CHAMPS
  // ---------------------------------------------------------
  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
  };

  // ---------------------------------------------------------
  // DATE : SAISIE MANUELLE
  // ---------------------------------------------------------
  const handleDateChange = (event) => {
    const value = event.target.value;
    setDateInput(value);
    setError("");

    const parsedDate = parseDate(value);

    setForm((previous) => ({
      ...previous,
      date: parsedDate,
    }));

    setSelectedStations([]);
    setAvailableStations([]);
  };

  // ---------------------------------------------------------
  // HEURE : LISTES DÉROULANTES
  // ---------------------------------------------------------
  const updateTime = (newHour, newMinute) => {
    setHour(newHour);
    setMinute(newMinute);
    setError("");

    const time =
      newHour !== "" && newMinute !== ""
        ? `${pad(newHour)}:${pad(newMinute)}`
        : "";

    setForm((previous) => ({
      ...previous,
      time,
    }));

    setSelectedStations([]);
    setAvailableStations([]);
  };

  // ---------------------------------------------------------
  // VÉRIFICATION DE DISPONIBILITÉ
  // ---------------------------------------------------------
  const checkAvailability = useCallback(async () => {
    if (!form.date || !form.time || !form.duration) {
      setAvailableStations([]);
      setSelectedStations([]);
      return;
    }

    try {
      setCheckingAvailability(true);

      const params = new URLSearchParams({
        date: form.date,
        time: form.time,
        duration: String(form.duration),
      });

      const response = await fetch(
        `${API_URL}/reservations/availability/?${params.toString()}`
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.detail || "Unable to check availability."
        );
      }

      const available = Array.isArray(data.available_stations)
        ? data.available_stations
        : [];

      setAvailableStations(available);

      setSelectedStations((previous) =>
        previous.filter((stationId) =>
          available.some(
            (station) => Number(station.id) === Number(stationId)
          )
        )
      );
    } catch (err) {
      console.error("Availability API error:", err);
      setAvailableStations([]);
      setSelectedStations([]);
      setError(err.message || "Unable to check station availability.");
    } finally {
      setCheckingAvailability(false);
    }
  }, [form.date, form.time, form.duration]);

  useEffect(() => {
    if (form.date && form.time && form.duration) {
      checkAvailability();
    }
  }, [form.date, form.time, form.duration, checkAvailability]);

  // ---------------------------------------------------------
  // SÉLECTION DES STATIONS
  // ---------------------------------------------------------
  const toggleStation = (stationId) => {
    setError("");

    setSelectedStations((previous) => {
      const alreadySelected = previous.some(
        (id) => Number(id) === Number(stationId)
      );

      if (alreadySelected) {
        return previous.filter(
          (id) => Number(id) !== Number(stationId)
        );
      }

      if (previous.length >= 10) {
        setError("You can reserve a maximum of 10 stations.");
        return previous;
      }

      return [...previous, stationId];
    });
  };

  const isStationAvailable = (stationId) =>
    availableStations.some(
      (station) => Number(station.id) === Number(stationId)
    );

  const isStationSelected = (stationId) =>
    selectedStations.some((id) => Number(id) === Number(stationId));

  // ---------------------------------------------------------
  // RÉCUPÉRER OU CRÉER LE JOUEUR
  // ---------------------------------------------------------
  const getOrCreatePlayer = async () => {
    const phone = form.phone.trim();
    const name = form.name.trim();

    if (!phone) {
      throw new Error("Phone number is required.");
    }

    const searchPlayer = async () => {
      const params = new URLSearchParams({ phone });

      const response = await fetch(
        `${API_URL}/players/?${params.toString()}`
      );

      if (!response.ok) return null;

      const data = await response.json();
      return extractPlayer(data);
    };

    try {
      const existingPlayer = await searchPlayer();

      if (existingPlayer?.id) {
        return existingPlayer;
      }
    } catch (err) {
      console.warn("Player search failed:", err);
    }

    const createResponse = await fetch(`${API_URL}/players/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, phone }),
    });

    const createData = await createResponse.json().catch(() => ({}));

    if (createResponse.ok && createData.id) {
      return createData;
    }

    // Une recherche supplémentaire couvre le cas où le joueur
    // existe déjà et où le backend refuse sa création.
    try {
      const existingPlayer = await searchPlayer();

      if (existingPlayer?.id) {
        return existingPlayer;
      }
    } catch (err) {
      console.warn("Retry player search failed:", err);
    }

    throw new Error(
      createData.detail ||
        createData.phone?.[0] ||
        createData.name?.[0] ||
        "Unable to create or retrieve player."
    );
  };

  // ---------------------------------------------------------
  // RÉINITIALISER LE FORMULAIRE
  // ---------------------------------------------------------
  const resetReservation = () => {
    setSuccess(false);
    setReservationResult(null);
    setError("");
    setSelectedStations([]);
    setAvailableStations([]);
    setDateInput("");
    setHour("");
    setMinute("");

    setForm({
      name: user?.name || "",
      phone: user?.phone || "",
      date: "",
      time: "",
      duration: "2",
    });
  };

  // ---------------------------------------------------------
  // ENVOYER LA RÉSERVATION
  // ---------------------------------------------------------
  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!form.name.trim()) {
      setError("Please enter your name.");
      return;
    }

    if (!form.phone.trim()) {
      setError("Please enter your phone number.");
      return;
    }

    const parsedDate = parseDate(dateInput);

    if (!parsedDate || parsedDate !== form.date) {
      setError("Enter a valid date in DD/MM/YYYY format.");
      return;
    }

    if (parsedDate < getLocalDate()) {
      setError("The reservation date cannot be in the past.");
      return;
    }

    if (
      !form.time ||
      !/^([01]\d|2[0-3]):([0-5]\d)$/.test(form.time)
    ) {
      setError("Please select a valid start time.");
      return;
    }

    const duration = Number(form.duration);

    if (!Number.isInteger(duration) || duration < 1) {
      setError("The minimum reservation duration is 1 hour.");
      return;
    }

    if (selectedStations.length < 8) {
      setError("You must reserve at least 8 stations.");
      return;
    }

    if (selectedStations.length > 10) {
      setError("You can reserve a maximum of 10 stations.");
      return;
    }

    try {
      setSubmitting(true);

      // Vérifier une dernière fois la disponibilité côté serveur.
      const params = new URLSearchParams({
        date: form.date,
        time: form.time,
        duration: String(duration),
      });

      const availabilityResponse = await fetch(
        `${API_URL}/reservations/availability/?${params.toString()}`
      );

      const availabilityData = await availabilityResponse
        .json()
        .catch(() => ({}));

      if (!availabilityResponse.ok) {
        throw new Error(
          availabilityData.detail ||
            "Unable to verify station availability."
        );
      }

      const latestAvailable = Array.isArray(
        availabilityData.available_stations
      )
        ? availabilityData.available_stations
        : [];

      const allAvailable = selectedStations.every((stationId) =>
        latestAvailable.some(
          (station) => Number(station.id) === Number(stationId)
        )
      );

      if (!allAvailable) {
        setAvailableStations(latestAvailable);
        setSelectedStations((previous) =>
          previous.filter((stationId) =>
            latestAvailable.some(
              (station) => Number(station.id) === Number(stationId)
            )
          )
        );

        throw new Error(
          "One or more stations are no longer available. Please check your selection."
        );
      }

      const player = await getOrCreatePlayer();

      if (!player?.id) {
        throw new Error("Unable to identify the player.");
      }

      // Ne dépend pas de crypto.randomUUID(), qui peut ne pas
      // être disponible dans certains navigateurs intégrés.
      const reservationGroup =
        `GRP-${Date.now().toString(36)}-${Math.random()
          .toString(36)
          .slice(2, 7)}`.toUpperCase();

      const createdReservations = [];

      for (const stationId of selectedStations) {
        const response = await fetch(`${API_URL}/reservations/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            player: Number(player.id),
            station: Number(stationId),
            date: form.date,
            time: form.time,
            duration,
            reservation_group: reservationGroup,
          }),
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(
            data.detail ||
              data.station?.[0] ||
              "Unable to create reservation."
          );
        }

        createdReservations.push(data);
      }

      const reservedStations = selectedStations
        .map((stationId) =>
          stations.find(
            (station) => Number(station.id) === Number(stationId)
          )
        )
        .filter(Boolean);

      const result = {
        reservation_group: reservationGroup,
        player,
        name: form.name.trim(),
        phone: form.phone.trim(),
        date: form.date,
        time: form.time,
        duration,
        station_ids: selectedStations,
        station_count: selectedStations.length,
        stations: reservedStations,
        reservations: createdReservations,
      };

      // La confirmation reste visible même si sessionStorage
      // est bloqué par le navigateur intégré.
      try {
        sessionStorage.setItem("nexusReservation", JSON.stringify(result));
      } catch (storageError) {
        console.warn("Session storage unavailable:", storageError);
      }

      setReservationResult(result);
      setSuccess(true);
      setSelectedStations([]);
    } catch (err) {
      console.error("Reservation submission error:", err);
      setError(err.message || "Unable to create the reservation.");
    } finally {
      setSubmitting(false);
    }
  };

  // ---------------------------------------------------------
  // ÉCRAN DE CONFIRMATION
  // ---------------------------------------------------------
  if (success && reservationResult) {
    return (
      <div className="reservation-form">
        <div className="reservation-success-screen">
          <div className="reservation-success-icon">
            <CircleCheck size={70} />
          </div>

          <div className="reservation-success-header">
            <span>NEXUS GAMES</span>
            <h2>
              RESERVATION <strong>CONFIRMED.</strong>
            </h2>
            <p>
              Your gaming reservation has been successfully created.
            </p>
          </div>

          <div className="reservation-success-group">
            <span>RESERVATION GROUP</span>
            <strong>{reservationResult.reservation_group}</strong>
          </div>

          <div className="reservation-success-info">
            <div className="reservation-success-item">
              <Users size={20} />
              <div>
                <span>PLAYER</span>
                <strong>{reservationResult.name}</strong>
              </div>
            </div>

            <div className="reservation-success-item">
              <Phone size={20} />
              <div>
                <span>PHONE</span>
                <strong>{reservationResult.phone}</strong>
              </div>
            </div>

            <div className="reservation-success-item">
              <CalendarDays size={20} />
              <div>
                <span>DATE</span>
                <strong>{reservationResult.date}</strong>
              </div>
            </div>

            <div className="reservation-success-item">
              <Clock size={20} />
              <div>
                <span>START TIME</span>
                <strong>{reservationResult.time}</strong>
              </div>
            </div>

            <div className="reservation-success-item">
              <Clock size={20} />
              <div>
                <span>DURATION</span>
                <strong>{reservationResult.duration} HOURS</strong>
              </div>
            </div>

            <div className="reservation-success-item">
              <Monitor size={20} />
              <div>
                <span>STATIONS</span>
                <strong>{reservationResult.station_count}</strong>
              </div>
            </div>
          </div>

          <div className="reservation-success-stations">
            <div className="reservation-success-stations-title">
              <Monitor size={19} />
              <span>RESERVED STATIONS</span>
            </div>

            <div className="reservation-success-stations-list">
              {reservationResult.stations.map((station) => (
                <div
                  key={station.id}
                  className="reservation-success-station"
                >
                  <Check size={15} />
                  <span>{station.name}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="reservation-success-message">
            <Check size={18} />
            <span>
              Your reservation has been successfully registered.
              Please keep your reservation group number.
            </span>
          </div>

          <button
            type="button"
            className="reservation-new-button"
            onClick={resetReservation}
          >
            <RotateCcw size={18} />
            MAKE ANOTHER RESERVATION
          </button>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------
  // FORMULAIRE PRINCIPAL
  // ---------------------------------------------------------
  return (
    <div className="reservation-form">
      {/* INFORMATIONS DU JOUEUR */}
      <div className="reservation-section">
        <div className="reservation-section-header">
          <Users size={22} />
          <div>
            <h3>PLAYER INFORMATION</h3>
            <p>Enter your contact information</p>
          </div>
        </div>

        <div className="reservation-form-grid">
          <div className="form-group">
            <label htmlFor="name">FULL NAME</label>
            <input
              id="name"
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Enter your full name"
              autoComplete="name"
              disabled={submitting}
            />
          </div>

          <div className="form-group">
            <label htmlFor="phone">PHONE NUMBER</label>
            <input
              id="phone"
              type="tel"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="Enter your phone number"
              autoComplete="tel"
              disabled={submitting}
            />
          </div>
        </div>
      </div>

      {/* DÉTAILS DE LA RÉSERVATION */}
      <div className="reservation-section">
        <div className="reservation-section-header">
          <CalendarDays size={22} />
          <div>
            <h3>RESERVATION DETAILS</h3>
            <p>Choose your date, time and duration</p>
          </div>
        </div>

        <div className="reservation-form-grid">
          {/* DATE MANUELLE */}
          <div className="form-group">
            <label htmlFor="reservation-date">DATE</label>
            <input
              id="reservation-date"
              type="text"
              inputMode="numeric"
              name="dateInput"
              value={dateInput}
              onChange={handleDateChange}
              placeholder="DD/MM/YYYY"
              maxLength={10}
              autoComplete="off"
              disabled={submitting}
              aria-describedby="date-help"
            />
            <small
              id="date-help"
              style={{
                color: "rgba(255,255,255,0.55)",
                fontSize: "11px",
                marginTop: "4px",
              }}
            >
              Enter the date, for example 25/12/2026
            </small>
          </div>

          {/* HEURE SANS INPUT TYPE TIME */}
          <div className="form-group">
            <label>START TIME</label>

            <div
              style={{
                display: "flex",
                gap: "10px",
                alignItems: "center",
              }}
            >
              <select
                aria-label="Start hour"
                value={hour}
                onChange={(event) =>
                  updateTime(event.target.value, minute)
                }
                disabled={submitting}
                style={{ flex: 1, minWidth: 0 }}
              >
                <option value="">Hour</option>
                {Array.from({ length: 24 }, (_, index) => (
                  <option key={index} value={String(index)}>
                    {pad(index)}
                  </option>
                ))}
              </select>

              <span>:</span>

              <select
                aria-label="Start minute"
                value={minute}
                onChange={(event) =>
                  updateTime(hour, event.target.value)
                }
                disabled={submitting}
                style={{ flex: 1, minWidth: 0 }}
              >
                <option value="">Minute</option>
                {["00", "15", "30", "45"].map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </div>

            <small
              style={{
                color: "rgba(255,255,255,0.55)",
                fontSize: "11px",
                marginTop: "4px",
              }}
            >
              Selected time: {form.time || "--:--"}
            </small>
          </div>

          {/* DURÉE */}
          <div className="form-group">
            <label htmlFor="duration">DURATION</label>
            <select
              id="duration"
              name="duration"
              value={form.duration}
              onChange={handleChange}
              disabled={submitting}
            >
              {Array.from({ length: 8 }, (_, index) => (
                <option key={index + 1} value={String(index + 1)}>
                  {index + 1} HOURS
                </option>
              ))}
            </select>
          </div>
        </div>

        {checkingAvailability && (
          <div className="reservation-info">
            <Clock size={18} />
            <span>Checking station availability...</span>
          </div>
        )}
      </div>

      {/* SÉLECTION DES STATIONS */}
      <div className="reservation-section">
        <div className="reservation-section-header">
          <Monitor size={22} />
          <div>
            <h3>SELECT YOUR STATIONS</h3>
            <p>Select between 8 and 10 stations for the same reservation</p>
          </div>
        </div>

        <div className="station-selection-info">
          <span>
            SELECTED: <strong>{selectedStations.length}/10</strong>
          </span>
          <span>
            MINIMUM: <strong>8</strong>
          </span>
        </div>

        {!form.date || !form.time ? (
          <div className="reservation-info">
            <CalendarDays size={18} />
            <span>Enter a valid date and select a start time first.</span>
          </div>
        ) : loadingStations ? (
          <div className="reservation-loading">Loading stations...</div>
        ) : stations.length === 0 ? (
          <div className="reservation-empty">
            No gaming stations found.
          </div>
        ) : checkingAvailability ? (
          <div className="reservation-loading">
            Checking available stations...
          </div>
        ) : (
          <div className="stations-grid">
            {stations.map((station) => {
              const available = isStationAvailable(station.id);
              const selected = isStationSelected(station.id);

              const disabled =
                !available ||
                submitting ||
                (!selected && selectedStations.length >= 10);

              return (
                <button
                  key={station.id}
                  type="button"
                  className={`station-card ${
                    selected ? "selected" : ""
                  } ${!available ? "unavailable" : ""}`}
                  onClick={() => {
                    if (!disabled) toggleStation(station.id);
                  }}
                  disabled={disabled}
                >
                  <div className="station-card-number">
                    {station.number}
                  </div>

                  <div className="station-card-name">
                    {station.name}
                  </div>

                  <div className="station-card-status">
                    {selected ? (
                      <>
                        <Check size={15} />
                        SELECTED
                      </>
                    ) : !available ? (
                      "UNAVAILABLE"
                    ) : (
                      "AVAILABLE"
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {selectedStations.length > 0 && selectedStations.length < 8 && (
          <div className="reservation-warning">
            Please select at least <strong>8 stations</strong>.
            You currently selected <strong>{selectedStations.length}</strong>.
          </div>
        )}
      </div>

      {/* ERREUR */}
      {error && (
        <div className="reservation-error" role="alert">
          {error}
        </div>
      )}

      {/* RÉSUMÉ */}
      <div className="reservation-summary">
        <div className="reservation-summary-row">
          <span>SELECTED STATIONS</span>
          <strong>{selectedStations.length}</strong>
        </div>

        <div className="reservation-summary-row">
          <span>DATE</span>
          <strong>{form.date || "--"}</strong>
        </div>

        <div className="reservation-summary-row">
          <span>START TIME</span>
          <strong>{form.time || "--:--"}</strong>
        </div>

        <div className="reservation-summary-row">
          <span>DURATION</span>
          <strong>{form.duration} H</strong>
        </div>
      </div>

      {/* VALIDATION */}
      <button
        type="button"
        className="reservation-submit-button"
        onClick={handleSubmit}
        disabled={
          submitting ||
          checkingAvailability ||
          loadingStations ||
          !form.date ||
          !form.time ||
          selectedStations.length < 8 ||
          selectedStations.length > 10
        }
      >
        {submitting
          ? "CREATING RESERVATION..."
          : `RESERVE ${selectedStations.length} STATIONS`}
      </button>
    </div>
  );
}

export default ReservationForm;
