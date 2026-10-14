
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
import MatchMaking from "./pages/client/MatchMaking";
import Login from "./pages/client/Login";
import Register from "./pages/client/Register";
import Account from "./pages/client/Account";
import ClientRoute from "./components/ClientRoute";

/* ADMIN */
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminReservations from "./pages/admin/AdminReservations";
import AdminGames from "./pages/admin/AdminGames";
import AdminGameNew from "./pages/admin/AdminGameNew";
import AdminGameEdit from "./pages/admin/AdminGameEdit";
import AdminMatches from "./pages/admin/AdminMatchescopy";
import AdminPlayers from "./pages/admin/AdminPlayers";

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
          path="/matchmaking"
          element={<MatchMaking />}
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

        {/* CLIENT ACCOUNT */}

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        <Route
          path="/account"
          element={
            <ClientRoute>
              <Account />
            </ClientRoute>
          }
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
          path="/admin/matches"
          element={<AdminMatches />}
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
          path="/admin/players" 
          element={<AdminPlayers />} 
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

