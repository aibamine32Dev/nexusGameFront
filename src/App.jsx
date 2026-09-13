
import { Routes, Route } from "react-router-dom";

import ClientLayout from "./layouts/ClientLayout";
import AdminLayout from "./layouts/AdminLayout";

/* CLIENT */
import Home from "./pages/client/Home";
import Games from "./pages/client/Games";
import GameDetails from "./pages/client/GameDetails";
import Reservation from "./pages/client/Reservation";
import ReservationSuccess from "./pages/client/ReservationSuccess";
import About from "./pages/client/About";
import Contact from "./pages/client/Contact";

/* ADMIN */
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminReservations from "./pages/admin/AdminReservations";
import AdminGames from "./pages/admin/AdminGames";
import AdminGameNew from "./pages/admin/AdminGameNew";
import AdminGameEdit from "./pages/admin/AdminGameEdit";

function App() {
  return (
    <Routes>

      {/* =================================================
          CLIENT
          ================================================= */}

      <Route element={<ClientLayout />}>

        <Route
          path="/"
          element={<Home />}
        />

        <Route
          path="/games"
          element={<Games />}
        />

        <Route
          path="/games/:id"
          element={<GameDetails />}
        />

        <Route
          path="/reservation"
          element={<Reservation />}
        />

        <Route
          path="/reservation/success"
          element={<ReservationSuccess />}
        />

        <Route
          path="/about"
          element={<About />}
        />

        <Route
          path="/contact"
          element={<Contact />}
        />

      </Route>


      {/* =================================================
          ADMIN LOGIN
          ================================================= */}

      <Route
        path="/admin/login"
        element={<AdminLogin />}
      />


      {/* =================================================
          ADMIN
          ================================================= */}

      <Route element={<AdminLayout />}>

        <Route
          path="/admin/dashboard"
          element={<AdminDashboard />}
        />

        <Route
          path="/admin/reservations"
          element={<AdminReservations />}
        />

        <Route
          path="/admin/games"
          element={<AdminGames />}
        />

        <Route
          path="/admin/games/new"
          element={<AdminGameNew />}
        />

        <Route
          path="/admin/games/:id/edit"
          element={<AdminGameEdit />}
        />

      </Route>

    </Routes>
  );
}

export default App;

