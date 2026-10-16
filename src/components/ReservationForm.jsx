
import { useEffect, useState } from "react";
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
  ChevronLeft,
  ChevronRight,
  X,
  Banknote,
} from "lucide-react";

const API_URL = "https://amineaibeche8.pythonanywhere.com/api";
const PLAYER_DEBUG = "[NEXUS PLAYER DEBUG]";

// Prix fixe d'une station pour une heure
const STATION_PRICE_PER_HOUR = 150;

// =========================================================
// UTILITAIRES DATE LOCALE : SANS CONVERSION UTC
// =========================================================

const getLocalDate = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const parseLocalDate = (dateString) => {
  if (!dateString || !/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return null;
  }

  const [year, month, day] = dateString.split("-").map(Number);
  const date = new Date(year, month - 1, day);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
};

const formatDateForDisplay = (dateString) => {
  const date = parseLocalDate(dateString);
  if (!date) return "";

  return new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
};

const getMonthName = (date) =>
  new Intl.DateTimeFormat("fr-FR", {
    month: "long",
    year: "numeric",
  }).format(date);

const toDateKey = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const normalizePlayerName = (name) =>
  String(name ?? "")
    .trim()
    .replace(/\s+/g, " ")
    .toLocaleLowerCase("fr");

// =========================================================
// FORMATAGE PRIX
// =========================================================

const formatPrice = (amount) =>
  `${Number(amount || 0).toLocaleString("fr-FR")} DA`;

// =========================================================
// CALENDRIER REACT PERSONNALISÉ
// =========================================================

function ReactDatePicker({ value, onChange, disabled = false }) {
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(
    () => parseLocalDate(value) || new Date()
  );

  const today = getLocalDate();

  const firstDay = new Date(
    viewDate.getFullYear(),
    viewDate.getMonth(),
    1
  );

  const daysInMonth = new Date(
    viewDate.getFullYear(),
    viewDate.getMonth() + 1,
    0
  ).getDate();

  // Lundi = 0, dimanche = 6
  const startingDay = (firstDay.getDay() + 6) % 7;
  const calendarDays = [];

  for (let i = 0; i < startingDay; i++) {
    calendarDays.push(null);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  const changeMonth = (offset) => {
    setViewDate(
      (previous) =>
        new Date(
          previous.getFullYear(),
          previous.getMonth() + offset,
          1
        )
    );
  };

  const openCalendar = () => {
    if (disabled) return;

    setViewDate(
      parseLocalDate(value) || parseLocalDate(today) || new Date()
    );

    setIsOpen((previous) => !previous);
  };

  const selectDate = (day) => {
    if (!day) return;

    const selected = new Date(
      viewDate.getFullYear(),
      viewDate.getMonth(),
      day
    );

    const selectedKey = toDateKey(selected);

    if (selectedKey < getLocalDate()) return;

    onChange(selectedKey);
    setIsOpen(false);
  };

  return (
    <div
      className="react-date-picker"
      style={{ position: "relative", width: "100%" }}
    >
      <button
        type="button"
        className="react-date-trigger"
        onClick={openCalendar}
        disabled={disabled}
        aria-label="Choisir la date de réservation"
        aria-expanded={isOpen}
        style={{
          width: "100%",
          minHeight: "46px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "10px",
          padding: "12px 14px",
          border: "1px solid rgba(255,255,255,0.15)",
          borderRadius: "8px",
          background: "#171717",
          color: "#fff",
          cursor: disabled ? "not-allowed" : "pointer",
          textAlign: "left",
          fontSize: "14px",
        }}
      >
        <span
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            minWidth: 0,
          }}
        >
          <CalendarDays size={19} color="#ef4444" />

          <span>
            {value ? formatDateForDisplay(value) : "Choisir une date"}
          </span>
        </span>

        <ChevronRight
          size={18}
          style={{
            transform: isOpen ? "rotate(90deg)" : "none",
            flexShrink: 0,
          }}
        />
      </button>

      {isOpen && (
        <div
          className="react-date-calendar"
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            left: 0,
            right: 0,
            zIndex: 1000,
            minWidth: "280px",
            padding: "14px",
            border: "1px solid #383838",
            borderRadius: "12px",
            background: "#111",
            color: "#fff",
            boxShadow: "0 12px 35px rgba(0,0,0,0.55)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "8px",
              marginBottom: "14px",
            }}
          >
            <button
              type="button"
              onClick={() => changeMonth(-1)}
              aria-label="Mois précédent"
              style={calendarNavigationStyle}
            >
              <ChevronLeft size={19} />
            </button>

            <strong
              style={{ textTransform: "capitalize", fontSize: "14px" }}
            >
              {getMonthName(viewDate)}
            </strong>

            <button
              type="button"
              onClick={() => changeMonth(1)}
              aria-label="Mois suivant"
              style={calendarNavigationStyle}
            >
              <ChevronRight size={19} />
            </button>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
              gap: "4px",
              marginBottom: "5px",
            }}
          >
            {["Lu", "Ma", "Me", "Je", "Ve", "Sa", "Di"].map((day) => (
              <div
                key={day}
                style={{
                  textAlign: "center",
                  fontSize: "11px",
                  color: "#a3a3a3",
                  padding: "5px 0",
                }}
              >
                {day}
              </div>
            ))}
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
              gap: "4px",
            }}
          >
            {calendarDays.map((day, index) => {
              if (day === null) {
                return <div key={`empty-${index}`} />;
              }

              const date = new Date(
                viewDate.getFullYear(),
                viewDate.getMonth(),
                day
              );

              const dateKey = toDateKey(date);
              const isPast = dateKey < today;
              const isToday = dateKey === today;
              const isSelected = dateKey === value;

              return (
                <button
                  key={dateKey}
                  type="button"
                  disabled={isPast}
                  onClick={() => selectDate(day)}
                  aria-label={dateKey}
                  aria-pressed={isSelected}
                  style={{
                    minWidth: 0,
                    height: "36px",
                    padding: 0,
                    border: isToday
                      ? "1px solid #ef4444"
                      : "1px solid transparent",
                    borderRadius: "7px",
                    background: isSelected ? "#dc2626" : "transparent",
                    color: isPast ? "#555" : "#fff",
                    fontSize: "13px",
                    fontWeight: isSelected ? 700 : 400,
                    cursor: isPast ? "not-allowed" : "pointer",
                    opacity: isPast ? 0.4 : 1,
                  }}
                >
                  {day}
                </button>
              );
            })}
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "8px",
              marginTop: "14px",
              paddingTop: "10px",
              borderTop: "1px solid #333",
            }}
          >
            <button
              type="button"
              onClick={() => {
                const currentDate = getLocalDate();

                onChange(currentDate);
                setViewDate(parseLocalDate(currentDate) || new Date());
                setIsOpen(false);
              }}
              style={{
                border: "none",
                background: "transparent",
                color: "#ef4444",
                fontSize: "12px",
                cursor: "pointer",
                padding: "6px 0",
              }}
            >
              Aujourd'hui
            </button>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Fermer le calendrier"
              style={{
                border: "none",
                background: "transparent",
                color: "#aaa",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "5px",
                fontSize: "12px",
              }}
            >
              <X size={14} />
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const calendarNavigationStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "34px",
  height: "34px",
  border: "1px solid #333",
  borderRadius: "7px",
  background: "#202020",
  color: "#fff",
  cursor: "pointer",
};

// =========================================================
// COMPOSANT PRINCIPAL
// =========================================================

function ReservationForm() {
  const { user } = useAuth();

  const [stations, setStations] = useState([]);
  const [availableStations, setAvailableStations] = useState([]);
  const [loadingStations, setLoadingStations] = useState(true);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [selectedStations, setSelectedStations] = useState([]);
  const [reservationResult, setReservationResult] = useState(null);

  const [form, setForm] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    date: "",
    time: "",
    duration: 2,
  });

  const timeOptions = Array.from({ length: 24 }, (_, hour) =>
    `${String(hour).padStart(2, "0")}:00`
  );

  // =========================================================
  // CALCUL AUTOMATIQUE DU PRIX
  // 150 DA par station et par heure
  // =========================================================

  const totalPrice =
    selectedStations.length *
    STATION_PRICE_PER_HOUR *
    Number(form.duration || 0);

  // =========================================================
  // CHARGER LES STATIONS
  // =========================================================

  useEffect(() => {
    const controller = new AbortController();

    const loadStations = async () => {
      try {
        setLoadingStations(true);
        setError("");

        const response = await fetch(`${API_URL}/stations/`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Unable to load stations.");
        }

        const data = await response.json();

        const stationList = Array.isArray(data)
          ? data
          : data.results || [];

        setStations(stationList);

        setAvailableStations(
          stationList.filter((station) => station.available)
        );
      } catch (err) {
        if (err.name === "AbortError") return;

        console.error("Stations API error:", err);
        setError("Unable to load gaming stations.");
      } finally {
        if (!controller.signal.aborted) {
          setLoadingStations(false);
        }
      }
    };

    loadStations();

    return () => controller.abort();
  }, []);

  // =========================================================
  // MODIFIER LE FORMULAIRE
  // =========================================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: name === "duration" ? Number(value) : value,
    }));

    setError("");
  };

  // =========================================================
  // CHANGER LA DATE
  // =========================================================

  const handleDateChange = (date) => {
    setForm((previous) => ({ ...previous, date }));
    setSelectedStations([]);
    setAvailableStations([]);
    setError("");
  };

  // =========================================================
  // VÉRIFIER LA DISPONIBILITÉ
  // =========================================================

  useEffect(() => {
    if (!form.date || !form.time || !form.duration) {
      setAvailableStations([]);
      setSelectedStations([]);
      setCheckingAvailability(false);
      return undefined;
    }

    const controller = new AbortController();

    const checkAvailability = async () => {
      try {
        setCheckingAvailability(true);
        setError("");

        const params = new URLSearchParams({
          date: form.date,
          time: form.time,
          duration: String(form.duration),
        });

        const response = await fetch(
          `${API_URL}/reservations/availability/?${params.toString()}`,
          { signal: controller.signal }
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));

          throw new Error(
            errorData.detail || "Unable to check availability."
          );
        }

        const data = await response.json();

        if (controller.signal.aborted) return;

        const available = Array.isArray(data)
          ? data
          : data.available_stations || [];

        setAvailableStations(available);

        setSelectedStations((previous) =>
          previous.filter((stationId) =>
            available.some(
              (station) => Number(station.id) === Number(stationId)
            )
          )
        );
      } catch (err) {
        if (err.name === "AbortError" || controller.signal.aborted) {
          return;
        }

        console.error("Availability API error:", err);

        setAvailableStations([]);
        setSelectedStations([]);
        setError(err.message || "Unable to check station availability.");
      } finally {
        if (!controller.signal.aborted) {
          setCheckingAvailability(false);
        }
      }
    };

    checkAvailability();

    return () => controller.abort();
  }, [form.date, form.time, form.duration]);

  // =========================================================
  // SÉLECTION DES STATIONS
  // =========================================================

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

  // =========================================================
  // RÉCUPÉRER TOUS LES JOUEURS, Y COMPRIS LES PAGES SUIVANTES
  // =========================================================

  const getAllPlayers = async () => {
    let nextUrl = `${API_URL}/players/`;

    const allPlayers = [];
    const visitedUrls = new Set();

    while (nextUrl) {
      if (visitedUrls.has(nextUrl)) {
        throw new Error(
          "Boucle détectée pendant la récupération des joueurs."
        );
      }

      visitedUrls.add(nextUrl);

      console.log(`${PLAYER_DEBUG} GET joueurs :`, nextUrl);

      const response = await fetch(nextUrl);

      if (!response.ok) {
        const errorText = await response.text().catch(() => "");

        console.error(
          `${PLAYER_DEBUG} Erreur de récupération`,
          response.status,
          errorText
        );

        throw new Error(
          "Impossible de récupérer la liste complète des joueurs."
        );
      }

      const data = await response.json();

      if (Array.isArray(data?.results)) {
        allPlayers.push(...data.results);
        nextUrl = data.next || null;
      } else if (Array.isArray(data)) {
        allPlayers.push(...data);
        nextUrl = null;
      } else if (data?.id != null) {
        allPlayers.push(data);
        nextUrl = null;
      } else {
        nextUrl = null;
      }

      console.log(
        `${PLAYER_DEBUG} Nombre de joueurs chargés :`,
        allPlayers.length
      );
    }

    const uniquePlayers = Array.from(
      new Map(
        allPlayers
          .filter((player) => player?.id != null)
          .map((player) => [String(player.id), player])
      ).values()
    );

    console.table(
      uniquePlayers.map((player) => ({
        id: player.id,
        name: player.name,
        phone: player.phone,
      }))
    );

    return uniquePlayers;
  };

  // =========================================================
  // CHOISIR LE JOUEUR PAR NOM EXACT, SINON LE CRÉER
  // =========================================================

  const getOrCreatePlayer = async () => {
    const name = String(form.name ?? "")
      .trim()
      .replace(/\s+/g, " ");

    const phone = String(form.phone ?? "").trim();

    console.group(`${PLAYER_DEBUG} getOrCreatePlayer`);

    console.log("Nom saisi :", name);
    console.log("Téléphone saisi :", phone);

    try {
      if (!name) {
        throw new Error("Phone/name: le nom du joueur est obligatoire.");
      }

      if (!phone) {
        throw new Error("Phone number is required.");
      }

      const allPlayers = await getAllPlayers();
      const normalizedName = normalizePlayerName(name);

      const exactMatches = allPlayers.filter(
        (player) => normalizePlayerName(player.name) === normalizedName
      );

      console.log(
        `${PLAYER_DEBUG} Correspondances exactes :`,
        exactMatches
      );

      if (exactMatches.length > 0) {
        const player =
          exactMatches.find(
            (item) => String(item.phone ?? "").trim() === phone
          ) || exactMatches[0];

        console.log(
          `${PLAYER_DEBUG} Joueur existant sélectionné :`,
          {
            id: player.id,
            name: player.name,
            phone: player.phone,
            exactNameMatch:
              normalizePlayerName(player.name) === normalizedName,
            exactPhoneMatch:
              String(player.phone ?? "").trim() === phone,
          }
        );

        return player;
      }

      const payload = { name, phone };

      console.log(
        `${PLAYER_DEBUG} Création d'un nouveau joueur :`,
        payload
      );

      const response = await fetch(`${API_URL}/players/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => ({}));

      console.log(
        `${PLAYER_DEBUG} Statut POST joueur :`,
        response.status
      );

      console.log(
        `${PLAYER_DEBUG} Réponse POST joueur :`,
        data
      );

      if (!response.ok) {
        const refreshedPlayers = await getAllPlayers().catch(() => []);

        const matchingPlayer = refreshedPlayers.find(
          (player) =>
            normalizePlayerName(player.name) === normalizedName &&
            String(player.phone ?? "").trim() === phone
        );

        if (matchingPlayer) {
          console.warn(
            `${PLAYER_DEBUG} Joueur exact retrouvé après le refus de création :`,
            matchingPlayer
          );

          return matchingPlayer;
        }

        throw new Error(
          data.detail ||
            data.phone?.[0] ||
            data.name?.[0] ||
            "Unable to create or retrieve player."
        );
      }

      if (data?.id == null) {
        throw new Error(
          "La création du joueur n'a pas retourné d'identifiant valide."
        );
      }

      if (normalizePlayerName(data.name) !== normalizedName) {
        console.error(
          `${PLAYER_DEBUG} Nom retourné inattendu :`,
          {
            requestedName: name,
            returnedName: data.name,
            playerId: data.id,
          }
        );

        throw new Error(
          "Le joueur créé ne correspond pas exactement au nom saisi."
        );
      }

      console.log(`${PLAYER_DEBUG} Nouveau joueur créé :`, {
        id: data.id,
        name: data.name,
        phone: data.phone,
      });

      return data;
    } finally {
      console.groupEnd();
    }
  };

  // =========================================================
  // RESET FORMULAIRE
  // =========================================================

  const resetReservation = () => {
    setSuccess(false);
    setReservationResult(null);
    setError("");
    setSelectedStations([]);
    setAvailableStations([]);

    setForm({
      name: user?.name || "",
      phone: user?.phone || "",
      date: "",
      time: "",
      duration: 2,
    });
  };

  // =========================================================
  // ENVOYER LA RÉSERVATION
  // =========================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess(false);

    if (!form.name.trim()) {
      setError("Please enter your name.");
      return;
    }

    if (!form.phone.trim()) {
      setError("Please enter your phone number.");
      return;
    }

    if (!parseLocalDate(form.date)) {
      setError("Please select a valid reservation date.");
      return;
    }

    if (form.date < getLocalDate()) {
      setError("The reservation date cannot be in the past.");
      return;
    }

    if (!timeOptions.includes(form.time)) {
      setError("Please select a valid start time.");
      return;
    }

    const duration = Number(form.duration);

    if (
      !Number.isInteger(duration) ||
      duration < 1 ||
      duration > 8
    ) {
      setError("Please select a duration between 1 and 8 hours.");
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

    const allSelectedAreAvailable = selectedStations.every(
      (stationId) =>
        availableStations.some(
          (station) => Number(station.id) === Number(stationId)
        )
    );

    if (!allSelectedAreAvailable) {
      setError(
        "One or more selected stations are no longer available. Please check availability again."
      );
      return;
    }

    console.group(`${PLAYER_DEBUG} SOUMISSION RÉSERVATION`);

    console.log("Formulaire envoyé :", {
      name: form.name.trim(),
      phone: form.phone.trim(),
      date: form.date,
      time: form.time,
      duration,
      selectedStations: [...selectedStations],
      pricePerStationPerHour: STATION_PRICE_PER_HOUR,
      totalPrice:
        selectedStations.length *
        STATION_PRICE_PER_HOUR *
        duration,
    });

    setSubmitting(true);

    try {
      const player = await getOrCreatePlayer();

      console.log(`${PLAYER_DEBUG} Joueur final pour le groupe :`, {
        id: player?.id,
        name: player?.name,
        phone: player?.phone,
        formName: form.name.trim(),
        formPhone: form.phone.trim(),
        exactNameMatch:
          normalizePlayerName(player?.name) ===
          normalizePlayerName(form.name),
      });

      if (player?.id == null) {
        throw new Error("Unable to identify the player.");
      }

      const randomId =
        typeof crypto !== "undefined" &&
        typeof crypto.randomUUID === "function"
          ? crypto.randomUUID().replace(/-/g, "")
          : `${Date.now()}${Math.random().toString(16).slice(2)}`;

      const reservationGroup = `GRP-${randomId
        .slice(0, 8)
        .toUpperCase()}`;

      const createdReservations = [];

      for (const stationId of selectedStations) {
        const reservationPayload = {
          player: Number(player.id),
          station: Number(stationId),
          date: form.date,
          time: form.time,
          duration,
          reservation_group: reservationGroup,
        };

        console.group(
          `${PLAYER_DEBUG} POST réservation station ${stationId}`
        );

        console.log("Payload envoyé :", reservationPayload);

        const response = await fetch(`${API_URL}/reservations/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(reservationPayload),
        });

        const data = await response.json().catch(() => ({}));

        console.log("Statut HTTP :", response.status);
        console.log("Réponse réservation :", data);

        console.log("ID joueur envoyé/reçu :", {
          sentPlayerId: reservationPayload.player,
          returnedPlayerId: data?.player,
        });

        if (!response.ok) {
          console.error("Reservation API error:", data);
          console.groupEnd();

          throw new Error(
            data.detail ||
              data.station?.[0] ||
              data.date?.[0] ||
              data.time?.[0] ||
              "Unable to create reservation."
          );
        }

        createdReservations.push(data);

        console.groupEnd();
      }

      const finalTotalPrice =
        selectedStations.length *
        STATION_PRICE_PER_HOUR *
        duration;

      console.log(
        `${PLAYER_DEBUG} Réservations créées :`,
        createdReservations
      );

      console.log(`${PLAYER_DEBUG} Résumé du groupe :`, {
        playerId: player.id,
        playerName: player.name,
        playerPhone: player.phone,
        reservationGroup,
        reservationIds: createdReservations.map((item) => item?.id),
        reservationPlayerIds: createdReservations.map(
          (item) => item?.player
        ),
        stationCount: selectedStations.length,
        duration,
        pricePerStationPerHour: STATION_PRICE_PER_HOUR,
        totalPrice: finalTotalPrice,
      });

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
        price_per_station_per_hour: STATION_PRICE_PER_HOUR,
        total_price: finalTotalPrice,
      };

      try {
        sessionStorage.setItem(
          "nexusReservation",
          JSON.stringify(result)
        );
      } catch (storageError) {
        console.warn("Session storage unavailable:", storageError);
      }

      setReservationResult(result);
      setSuccess(true);
      setSelectedStations([]);
    } catch (err) {
      console.error(`${PLAYER_DEBUG} ERREUR SOUMISSION :`, err);

      console.error(
        `${PLAYER_DEBUG} Attention : si plusieurs stations ont été créées avant cette erreur, le groupe peut être partiellement enregistré.`,
        {
          selectedStations,
          reservationDate: form.date,
          reservationTime: form.time,
        }
      );

      setError(err.message || "Unable to create the reservation.");
    } finally {
      console.groupEnd();
      setSubmitting(false);
    }
  };

  // =========================================================
  // UTILITAIRES STATIONS
  // =========================================================

  const isStationAvailable = (stationId) =>
    availableStations.some(
      (station) => Number(station.id) === Number(stationId)
    );

  const isStationSelected = (stationId) =>
    selectedStations.some(
      (id) => Number(id) === Number(stationId)
    );

  // =========================================================
  // ÉCRAN DE CONFIRMATION
  // =========================================================

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
              RESERVATION
              <strong> CONFIRMED.</strong>
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
                <strong>
                  {formatDateForDisplay(reservationResult.date)}
                </strong>
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
                <strong>
                  {reservationResult.duration}{" "}
                  {reservationResult.duration === 1 ? "HOUR" : "HOURS"}
                </strong>
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

          {/* DÉTAIL DU PRIX SUR LA CONFIRMATION */}
          <div
            className="reservation-total-price"
            style={{
              marginTop: "24px",
              padding: "20px",
              border: "1px solid rgba(239,68,68,0.4)",
              borderRadius: "12px",
              background: "rgba(239,68,68,0.08)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginBottom: "14px",
              }}
            >
              <Banknote size={22} color="#ef4444" />
              <strong style={{ color: "#fff" }}>
                RESERVATION PRICE
              </strong>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: "12px",
                marginBottom: "10px",
                color: "#ccc",
                fontSize: "14px",
              }}
            >
              <span>Price per station / hour</span>
              <strong>
                {formatPrice(
                  reservationResult.price_per_station_per_hour
                )}
              </strong>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: "12px",
                marginBottom: "10px",
                color: "#ccc",
                fontSize: "14px",
              }}
            >
              <span>Number of stations</span>
              <strong>{reservationResult.station_count}</strong>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: "12px",
                marginBottom: "14px",
                color: "#ccc",
                fontSize: "14px",
              }}
            >
              <span>Duration</span>
              <strong>{reservationResult.duration} h</strong>
            </div>

            <div
              style={{
                borderTop: "1px solid rgba(255,255,255,0.15)",
                paddingTop: "14px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <span style={{ color: "#fff", fontWeight: 700 }}>
                TOTAL PRICE
              </span>

              <strong
                style={{
                  color: "#ef4444",
                  fontSize: "25px",
                  fontWeight: 800,
                }}
              >
                {formatPrice(reservationResult.total_price)}
              </strong>
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

  // =========================================================
  // FORMULAIRE
  // =========================================================

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
              disabled={submitting}
              required
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
              disabled={submitting}
              required
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
          <div className="form-group">
            <label>DATE</label>

            <ReactDatePicker
              value={form.date}
              onChange={handleDateChange}
              disabled={submitting}
            />
          </div>

          <div className="form-group">
            <label htmlFor="time">START TIME</label>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <Clock size={19} color="#ef4444" />

              <select
                id="time"
                name="time"
                value={form.time}
                onChange={handleChange}
                disabled={submitting}
                required
                style={{ flex: 1, minWidth: 0 }}
              >
                <option value="">Select start time</option>

                {timeOptions.map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="duration">DURATION</label>

            <select
              id="duration"
              name="duration"
              value={form.duration}
              onChange={handleChange}
              disabled={submitting}
              required
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map((hours) => (
                <option key={hours} value={hours}>
                  {hours} {hours === 1 ? "HOUR" : "HOURS"}
                </option>
              ))}
            </select>
          </div>
        </div>

        {form.date && (
          <div className="reservation-info">
            <CalendarDays size={18} />

            <span>
              Selected date: {formatDateForDisplay(form.date)}
            </span>
          </div>
        )}

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
            <p>
              Select between 8 and 10 stations for the same reservation
            </p>
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

            <span>
              Select a reservation date and start time to check availability.
            </span>
          </div>
        ) : loadingStations ? (
          <div className="reservation-loading">
            Loading stations...
          </div>
        ) : stations.length === 0 ? (
          <div className="reservation-empty">
            No gaming stations found.
          </div>
        ) : checkingAvailability ? (
          <div className="reservation-loading">
            Checking availability...
          </div>
        ) : availableStations.length === 0 ? (
          <div className="reservation-empty">
            No stations are available for this date, time and duration.
          </div>
        ) : (
          <div className="stations-grid">
            {stations.map((station) => {
              const available = isStationAvailable(station.id);
              const selected = isStationSelected(station.id);

              const disabled =
                !available ||
                submitting ||
                checkingAvailability ||
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
            Please select at least <strong>8 stations</strong>. You
            currently selected <strong>{selectedStations.length}</strong>.
          </div>
        )}
      </div>

      {/* ERREUR */}
      {error && (
        <div className="reservation-error" role="alert">
          {error}
        </div>
      )}

      {/* RÉSUMÉ DE LA RÉSERVATION */}
      <div className="reservation-summary">
        <div className="reservation-summary-row">
          <span>SELECTED STATIONS</span>
          <strong>{selectedStations.length}</strong>
        </div>

        <div className="reservation-summary-row">
          <span>PRICE PER STATION / HOUR</span>
          <strong>{formatPrice(STATION_PRICE_PER_HOUR)}</strong>
        </div>

        <div className="reservation-summary-row">
          <span>DATE</span>

          <strong>
            {form.date ? formatDateForDisplay(form.date) : "--"}
          </strong>
        </div>

        <div className="reservation-summary-row">
          <span>START TIME</span>
          <strong>{form.time || "--"}</strong>
        </div>

        <div className="reservation-summary-row">
          <span>DURATION</span>
          <strong>{form.duration} H</strong>
        </div>

        {/* NOUVEAU : PRIX TOTAL CALCULÉ AUTOMATIQUEMENT */}
        <div
          className="reservation-summary-row reservation-summary-total"
          style={{
            marginTop: "12px",
            paddingTop: "16px",
            borderTop: "1px solid rgba(255,255,255,0.15)",
          }}
        >
          <span
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontWeight: 700,
            }}
          >
            <Banknote size={20} color="#ef4444" />
            TOTAL PRICE
          </span>

          <strong
            style={{
              color: "#ef4444",
              fontSize: "24px",
              fontWeight: 800,
            }}
          >
            {formatPrice(totalPrice)}
          </strong>
        </div>

        <div
          style={{
            marginTop: "8px",
            color: "#aaa",
            fontSize: "12px",
            textAlign: "right",
          }}
        >
          {selectedStations.length} station(s) ×{" "}
          {STATION_PRICE_PER_HOUR} DA × {form.duration} heure(s)
        </div>
      </div>

      {/* BOUTON DE RÉSERVATION */}
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
          : `RESERVE ${selectedStations.length} STATIONS — ${formatPrice(
              totalPrice
            )}`}
      </button>
    </div>
  );
}

export default ReservationForm;
