import { useEffect, useState } from "react";

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

function ReservationForm() {

  // =========================================================
  // API LOCALE DJANGO
  // =========================================================

  const API_URL = "https://nexusgameback.onrender.com/api";


  // =========================================================
  // STATES
  // =========================================================

  const [stations, setStations] = useState([]);

  const [availableStations, setAvailableStations] =
    useState([]);

  const [loadingStations, setLoadingStations] =
    useState(true);

  const [checkingAvailability, setCheckingAvailability] =
    useState(false);

  const [submitting, setSubmitting] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState(false);

  const [selectedStations, setSelectedStations] =
    useState([]);


  // =========================================================
  // SUCCESS DATA
  // =========================================================

  const [reservationResult, setReservationResult] =
    useState(null);


  // =========================================================
  // FORM
  // =========================================================

  const [form, setForm] = useState({
    name: "",
    phone: "",
    date: "",
    time: "",
    duration: 2,
  });


  // =========================================================
  // CHARGER LES STATIONS
  // =========================================================

  useEffect(() => {

    const loadStations = async () => {

      try {

        setLoadingStations(true);
        setError("");

        const response = await fetch(
          `${API_URL}/stations/`
        );

        if (!response.ok) {
          throw new Error(
            "Unable to load stations."
          );
        }

        const data = await response.json();

        setStations(data);

        setAvailableStations(
          data.filter(
            (station) => station.available
          )
        );

      } catch (err) {

        console.error(
          "Stations API error:",
          err
        );

        setError(
          "Unable to load gaming stations."
        );

      } finally {

        setLoadingStations(false);

      }

    };

    loadStations();

  }, []);


  // =========================================================
  // MODIFIER LE FORMULAIRE
  // =========================================================

  const handleChange = (event) => {

    const {
      name,
      value,
    } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");

  };


  // =========================================================
  // VÉRIFIER LA DISPONIBILITÉ
  // =========================================================

  const checkAvailability = async () => {

    if (
      !form.date ||
      !form.time ||
      !form.duration
    ) {

      setAvailableStations([]);
      setSelectedStations([]);

      return;

    }

    try {

      setCheckingAvailability(true);
      setError("");

      const params = new URLSearchParams({
        date: form.date,
        time: form.time,
        duration: String(form.duration),
      });

      const response = await fetch(
        `${API_URL}/reservations/availability/?${params.toString()}`
      );

      if (!response.ok) {

        const errorData =
          await response
            .json()
            .catch(() => ({}));

        throw new Error(
          errorData.detail ||
          "Unable to check availability."
        );

      }

      const data = await response.json();

      const available =
        data.available_stations || [];

      setAvailableStations(available);

      // Garder uniquement les stations
      // encore disponibles
      setSelectedStations((previous) =>
        previous.filter((stationId) =>
          available.some(
            (station) =>
              Number(station.id) ===
              Number(stationId)
          )
        )
      );

    } catch (err) {

      console.error(
        "Availability API error:",
        err
      );

      setAvailableStations([]);
      setSelectedStations([]);

      setError(
        err.message ||
        "Unable to check station availability."
      );

    } finally {

      setCheckingAvailability(false);

    }

  };


  // =========================================================
  // VÉRIFICATION AUTOMATIQUE
  // =========================================================

  useEffect(() => {

    if (
      form.date &&
      form.time &&
      form.duration
    ) {

      checkAvailability();

    }

  }, [
    form.date,
    form.time,
    form.duration,
  ]);


  // =========================================================
  // SÉLECTION STATION
  // =========================================================

  const toggleStation = (stationId) => {

    setError("");

    setSelectedStations((previous) => {

      // Désélectionner
      if (
        previous.includes(stationId)
      ) {

        return previous.filter(
          (id) => id !== stationId
        );

      }

      // Maximum 10
      if (
        previous.length >= 10
      ) {

        setError(
          "You can reserve a maximum of 10 stations."
        );

        return previous;

      }

      return [
        ...previous,
        stationId,
      ];

    });

  };


  // =========================================================
  // RÉCUPÉRER OU CRÉER LE PLAYER
  // =========================================================
  //
  // LOGIQUE :
  //
  // 1. Recherche avec le téléphone
  // 2. Si trouvé -> utiliser le player existant
  // 3. Sinon -> créer un nouveau player
  //
  // =========================================================

  const getOrCreatePlayer = async () => {

    const phone =
      form.phone.trim();

    const name =
      form.name.trim();


    if (!phone) {

      throw new Error(
        "Phone number is required."
      );

    }


    // =======================================================
    // 1. CHERCHER LE PLAYER EXISTANT
    // =======================================================

    try {

      const searchParams =
        new URLSearchParams({
          phone: phone,
        });

      const searchResponse =
        await fetch(
          `${API_URL}/players/?${searchParams.toString()}`
        );


      if (
        searchResponse.ok
      ) {

        const data =
          await searchResponse.json();


        // Selon le serializer Django :
        // data peut être une liste
        // ou un objet.

        let existingPlayer = null;


        if (Array.isArray(data)) {

          existingPlayer =
            data.length > 0
              ? data[0]
              : null;

        } else if (
          data &&
          Array.isArray(data.results)
        ) {

          existingPlayer =
            data.results.length > 0
              ? data.results[0]
              : null;

        } else if (
          data &&
          data.id
        ) {

          existingPlayer =
            data;

        }


        // ===================================================
        // PLAYER EXISTANT
        // ===================================================

        if (
          existingPlayer &&
          existingPlayer.id
        ) {

          console.log(
            "Existing player found:",
            existingPlayer
          );


          return existingPlayer;

        }

      }

    } catch (searchError) {

      console.warn(
        "Player search failed:",
        searchError
      );

      // On continue vers la création.
      // Cela permet de ne pas bloquer
      // la réservation si la recherche échoue.

    }


    // =======================================================
    // 2. PLAYER NON TROUVÉ -> CRÉATION
    // =======================================================

    const createResponse =
      await fetch(
        `${API_URL}/players/`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            name: name,
            phone: phone,
          }),

        }
      );


    const createData =
      await createResponse
        .json()
        .catch(() => ({}));


    // =======================================================
    // 3. SI LE BACKEND DIT QUE LE PLAYER EXISTE DÉJÀ
    // =======================================================

    if (
      !createResponse.ok
    ) {

      /*
       * Si ton backend possède une contrainte
       * unique sur phone, il peut répondre
       * avec une erreur 400.
       *
       * Dans ce cas, on fait une deuxième
       * recherche pour récupérer le player.
       */

      try {

        const retryParams =
          new URLSearchParams({
            phone: phone,
          });

        const retryResponse =
          await fetch(
            `${API_URL}/players/?${retryParams.toString()}`
          );


        if (
          retryResponse.ok
        ) {

          const retryData =
            await retryResponse.json();


          let existingPlayer = null;


          if (
            Array.isArray(retryData)
          ) {

            existingPlayer =
              retryData.length > 0
                ? retryData[0]
                : null;

          } else if (
            retryData &&
            Array.isArray(
              retryData.results
            )
          ) {

            existingPlayer =
              retryData.results.length > 0
                ? retryData.results[0]
                : null;

          } else if (
            retryData &&
            retryData.id
          ) {

            existingPlayer =
              retryData;

          }


          if (
            existingPlayer &&
            existingPlayer.id
          ) {

            console.log(
              "Existing player found after create conflict:",
              existingPlayer
            );


            return existingPlayer;

          }

        }

      } catch (retryError) {

        console.error(
          "Retry player search error:",
          retryError
        );

      }


      console.error(
        "Player creation error:",
        createData
      );


      throw new Error(
        createData.detail ||
        createData.phone?.[0] ||
        createData.name?.[0] ||
        "Unable to create or retrieve player."
      );

    }


    // =======================================================
    // 4. NOUVEAU PLAYER CRÉÉ
    // =======================================================

    console.log(
      "New player created:",
      createData
    );


    return createData;

  };


  // =========================================================
  // RESET FORMULAIRE
  // =========================================================

  const resetReservation = () => {

    setSuccess(false);

    setReservationResult(null);

    setError("");

    setSelectedStations([]);

    setForm({
      name: "",
      phone: "",
      date: "",
      time: "",
      duration: 2,
    });

    setAvailableStations([]);

  };


  // =========================================================
  // ENVOYER LA RÉSERVATION
  // =========================================================

  const handleSubmit = async (event) => {

    event.preventDefault();

    setError("");
    setSuccess(false);


    // =======================================================
    // VALIDATION NOM
    // =======================================================

    if (!form.name.trim()) {

      setError(
        "Please enter your name."
      );

      return;

    }


    // =======================================================
    // VALIDATION TÉLÉPHONE
    // =======================================================

    if (!form.phone.trim()) {

      setError(
        "Please enter your phone number."
      );

      return;

    }


    // =======================================================
    // VALIDATION DATE
    // =======================================================

    if (!form.date) {

      setError(
        "Please select a date."
      );

      return;

    }


    // =======================================================
    // VALIDATION HEURE
    // =======================================================

    if (!form.time) {

      setError(
        "Please select a time."
      );

      return;

    }


    // =======================================================
    // VALIDATION DURÉE
    // =======================================================

    const duration =
      Number(form.duration);


    if (
      !duration ||
      duration < 2
    ) {

      setError(
        "The minimum reservation duration is 2 hours."
      );

      return;

    }


    // =======================================================
    // MINIMUM 8 STATIONS
    // =======================================================

    if (
      selectedStations.length < 8
    ) {

      setError(
        "You must reserve at least 8 stations."
      );

      return;

    }


    // =======================================================
    // MAXIMUM 10 STATIONS
    // =======================================================

    if (
      selectedStations.length > 10
    ) {

      setError(
        "You can reserve a maximum of 10 stations."
      );

      return;

    }


    // =======================================================
    // VÉRIFIER DISPONIBILITÉ
    // =======================================================

    const allSelectedAreAvailable =
      selectedStations.every(
        (stationId) =>
          availableStations.some(
            (station) =>
              Number(station.id) ===
              Number(stationId)
          )
      );


    if (
      !allSelectedAreAvailable
    ) {

      setError(
        "One or more selected stations are no longer available. Please check availability again."
      );

      await checkAvailability();

      return;

    }


    try {

      setSubmitting(true);


      // =====================================================
      // 1. RÉCUPÉRER OU CRÉER LE PLAYER
      // =====================================================

      const player =
        await getOrCreatePlayer();


      // Vérification
      if (
        !player ||
        !player.id
      ) {

        throw new Error(
          "Unable to identify the player."
        );

      }


      console.log(
        "Player used for reservation:",
        player
      );


      // =====================================================
      // 2. GÉNÉRER LE GROUPE
      // =====================================================

      const reservationGroup =
        `GRP-${crypto
          .randomUUID()
          .replaceAll("-", "")
          .slice(0, 8)
          .toUpperCase()}`;


      // =====================================================
      // 3. CRÉER LES RÉSERVATIONS
      // =====================================================

      const createdReservations = [];


      for (
        const stationId
        of selectedStations
      ) {

        const response =
          await fetch(
            `${API_URL}/reservations/`,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body: JSON.stringify({

                // IMPORTANT :
                // On utilise l'ID du player
                // existant ou nouvellement créé.

                player:
                  Number(player.id),

                station:
                  Number(stationId),

                date:
                  form.date,

                time:
                  form.time,

                duration:
                  duration,

                reservation_group:
                  reservationGroup,

              }),

            }
          );


        const data =
          await response
            .json()
            .catch(() => ({}));


        if (!response.ok) {

          console.error(
            "Reservation API error:",
            data
          );


          throw new Error(
            data.detail ||
            data.station?.[0] ||
            "Unable to create reservation."
          );

        }


        createdReservations.push(
          data
        );

      }


      // =====================================================
      // 4. RÉCUPÉRER LES STATIONS RÉSERVÉES
      // =====================================================

      const reservedStations =
        selectedStations
          .map(
            (stationId) =>
              stations.find(
                (station) =>
                  Number(station.id) ===
                  Number(stationId)
              )
          )
          .filter(Boolean);


      // =====================================================
      // 5. CONSTRUIRE LE RÉSULTAT
      // =====================================================

      const result = {

        reservation_group:
          reservationGroup,

        player:
          player,

        name:
          form.name.trim(),

        phone:
          form.phone.trim(),

        date:
          form.date,

        time:
          form.time,

        duration:
          duration,

        station_ids:
          selectedStations,

        station_count:
          selectedStations.length,

        stations:
          reservedStations,

        reservations:
          createdReservations,

      };


      // =====================================================
      // 6. SAUVEGARDER SESSION
      // =====================================================

      sessionStorage.setItem(
        "nexusReservation",
        JSON.stringify(result)
      );


      // =====================================================
      // 7. AFFICHER LE SUCCÈS
      // =====================================================

      setReservationResult(
        result
      );

      setSuccess(true);


      // =====================================================
      // 8. VIDER LA SÉLECTION
      // =====================================================

      setSelectedStations([]);


    } catch (err) {

      console.error(
        "Reservation submission error:",
        err
      );


      setError(
        err.message ||
        "Unable to create the reservation."
      );

    } finally {

      setSubmitting(false);

    }

  };


  // =========================================================
  // UTILITAIRES
  // =========================================================

  const isStationAvailable = (
    stationId
  ) => {

    return availableStations.some(
      (station) =>
        Number(station.id) ===
        Number(stationId)
    );

  };


  const isStationSelected = (
    stationId
  ) => {

    return selectedStations.some(
      (id) =>
        Number(id) ===
        Number(stationId)
    );

  };


  // =========================================================
  // SUCCESS SCREEN
  // =========================================================

  if (
    success &&
    reservationResult
  ) {

    return (

      <div className="reservation-form">

        <div className="reservation-success-screen">

          {/* ICON */}

          <div className="reservation-success-icon">

            <CircleCheck size={70} />

          </div>


          {/* TITLE */}

          <div className="reservation-success-header">

            <span>
              NEXUS GAMES
            </span>

            <h2>
              RESERVATION
              <strong>
                CONFIRMED.
              </strong>
            </h2>

            <p>
              Your gaming reservation has been
              successfully created.
            </p>

          </div>


          {/* GROUP */}

          <div className="reservation-success-group">

            <span>
              RESERVATION GROUP
            </span>

            <strong>
              {
                reservationResult
                  .reservation_group
              }
            </strong>

          </div>


          {/* INFORMATION */}

          <div className="reservation-success-info">

            <div className="reservation-success-item">

              <Users size={20} />

              <div>

                <span>
                  PLAYER
                </span>

                <strong>
                  {
                    reservationResult.name
                  }
                </strong>

              </div>

            </div>


            <div className="reservation-success-item">

              <Phone size={20} />

              <div>

                <span>
                  PHONE
                </span>

                <strong>
                  {
                    reservationResult.phone
                  }
                </strong>

              </div>

            </div>


            <div className="reservation-success-item">

              <CalendarDays size={20} />

              <div>

                <span>
                  DATE
                </span>

                <strong>
                  {
                    reservationResult.date
                  }
                </strong>

              </div>

            </div>


            <div className="reservation-success-item">

              <Clock size={20} />

              <div>

                <span>
                  START TIME
                </span>

                <strong>
                  {
                    reservationResult.time
                  }
                </strong>

              </div>

            </div>


            <div className="reservation-success-item">

              <Clock size={20} />

              <div>

                <span>
                  DURATION
                </span>

                <strong>
                  {
                    reservationResult.duration
                  }{" "}
                  HOURS
                </strong>

              </div>

            </div>


            <div className="reservation-success-item">

              <Monitor size={20} />

              <div>

                <span>
                  STATIONS
                </span>

                <strong>
                  {
                    reservationResult.station_count
                  }
                </strong>

              </div>

            </div>

          </div>


          {/* STATIONS LIST */}

          <div className="reservation-success-stations">

            <div className="reservation-success-stations-title">

              <Monitor size={19} />

              <span>
                RESERVED STATIONS
              </span>

            </div>


            <div className="reservation-success-stations-list">

              {reservationResult.stations.map(
                (station) => (

                  <div
                    key={station.id}
                    className="reservation-success-station"
                  >

                    <Check size={15} />

                    <span>
                      {station.name}
                    </span>

                  </div>

                )
              )}

            </div>

          </div>


          {/* MESSAGE */}

          <div className="reservation-success-message">

            <Check size={18} />

            <span>
              Your reservation has been successfully
              registered. Please keep your reservation
              group number.
            </span>

          </div>


          {/* NEW RESERVATION */}

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
  // FORM
  // =========================================================

  return (

    <div className="reservation-form">

      {/* ===================================================
          PLAYER INFORMATION
      =================================================== */}

      <div className="reservation-section">

        <div className="reservation-section-header">

          <Users size={22} />

          <div>

            <h3>
              PLAYER INFORMATION
            </h3>

            <p>
              Enter your contact information
            </p>

          </div>

        </div>


        <div className="reservation-form-grid">

          <div className="form-group">

            <label htmlFor="name">
              FULL NAME
            </label>

            <input
              id="name"
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Enter your full name"
              disabled={submitting}
            />

          </div>


          <div className="form-group">

            <label htmlFor="phone">
              PHONE NUMBER
            </label>

            <input
              id="phone"
              type="tel"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="Enter your phone number"
              disabled={submitting}
            />

          </div>

        </div>

      </div>


      {/* ===================================================
          RESERVATION DETAILS
      =================================================== */}

      <div className="reservation-section">

        <div className="reservation-section-header">

          <CalendarDays size={22} />

          <div>

            <h3>
              RESERVATION DETAILS
            </h3>

            <p>
              Choose your date, time and duration
            </p>

          </div>

        </div>


        <div className="reservation-form-grid">

          {/* DATE */}

          <div className="form-group">

            <label htmlFor="date">
              DATE
            </label>

            <input
              id="date"
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


          {/* TIME */}

          <div className="form-group">

            <label htmlFor="time">
              START TIME
            </label>

            <input
              id="time"
              type="time"
              name="time"
              value={form.time}
              onChange={handleChange}
              disabled={submitting}
            />

          </div>


          {/* DURATION */}

          <div className="form-group">

            <label htmlFor="duration">
              DURATION
            </label>

            <select
              id="duration"
              name="duration"
              value={form.duration}
              onChange={handleChange}
              disabled={submitting}
            >

              <option value={2}>
                2 HOURS
              </option>

              <option value={3}>
                3 HOURS
              </option>

              <option value={4}>
                4 HOURS
              </option>

              <option value={5}>
                5 HOURS
              </option>

              <option value={6}>
                6 HOURS
              </option>

              <option value={7}>
                7 HOURS
              </option>

              <option value={8}>
                8 HOURS
              </option>

            </select>

          </div>

        </div>


        {checkingAvailability && (

          <div className="reservation-info">

            <Clock size={18} />

            <span>
              Checking station availability...
            </span>

          </div>

        )}

      </div>


      {/* ===================================================
          STATIONS
      =================================================== */}

      <div className="reservation-section">

        <div className="reservation-section-header">

          <Monitor size={22} />

          <div>

            <h3>
              SELECT YOUR STATIONS
            </h3>

            <p>
              Select between 8 and 10 stations
              for the same reservation
            </p>

          </div>

        </div>


        <div className="station-selection-info">

          <span>
            SELECTED:

            <strong>
              {" "}
              {selectedStations.length}/10
            </strong>
          </span>


          <span>
            MINIMUM:

            <strong>
              {" "}
              8
            </strong>
          </span>

        </div>


        {loadingStations ? (

          <div className="reservation-loading">
            Loading stations...
          </div>

        ) : stations.length === 0 ? (

          <div className="reservation-empty">
            No gaming stations found.
          </div>

        ) : (

          <div className="stations-grid">

            {stations.map(
              (station) => {

                const available =
                  isStationAvailable(
                    station.id
                  );

                const selected =
                  isStationSelected(
                    station.id
                  );

                const disabled =
                  !available ||
                  submitting ||
                  (
                    !selected &&
                    selectedStations.length >= 10
                  );


                return (

                  <button
                    key={station.id}
                    type="button"
                    className={`station-card ${
                      selected
                        ? "selected"
                        : ""
                    } ${
                      !available
                        ? "unavailable"
                        : ""
                    }`}
                    onClick={() => {

                      if (!disabled) {

                        toggleStation(
                          station.id
                        );

                      }

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

              }
            )}

          </div>

        )}


        {selectedStations.length > 0 &&
          selectedStations.length < 8 && (

            <div className="reservation-warning">

              Please select at least{" "}

              <strong>
                8 stations
              </strong>

              .

              You currently selected{" "}

              <strong>
                {selectedStations.length}
              </strong>

              .

            </div>

          )}

      </div>


      {/* ===================================================
          ERROR
      =================================================== */}

      {error && (

        <div className="reservation-error">
          {error}
        </div>

      )}


      {/* ===================================================
          SUMMARY
      =================================================== */}

      <div className="reservation-summary">

        <div className="reservation-summary-row">

          <span>
            SELECTED STATIONS
          </span>

          <strong>
            {selectedStations.length}
          </strong>

        </div>


        <div className="reservation-summary-row">

          <span>
            DATE
          </span>

          <strong>
            {form.date || "--"}
          </strong>

        </div>


        <div className="reservation-summary-row">

          <span>
            START TIME
          </span>

          <strong>
            {form.time || "--"}
          </strong>

        </div>


        <div className="reservation-summary-row">

          <span>
            DURATION
          </span>

          <strong>
            {form.duration} H
          </strong>

        </div>

      </div>


      {/* ===================================================
          SUBMIT
      =================================================== */}

      <button
        type="button"
        className="reservation-submit-button"
        onClick={handleSubmit}
        disabled={
          submitting ||
          checkingAvailability ||
          selectedStations.length < 8 ||
          selectedStations.length > 10
        }
      >

        {submitting
          ? "CREATING RESERVATION..."
          : `RESERVE ${selectedStations.length} STATIONS`
        }

      </button>

    </div>

  );

}

export default ReservationForm;