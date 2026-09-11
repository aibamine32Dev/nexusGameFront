import { Routes, Route } from "react-router-dom";

import ClientLayout from "./layouts/ClientLayout";

import Home from "./pages/client/Home";
import Games from "./pages/client/Games";
import GameDetails from "./pages/client/GameDetails";
import Reservation from "./pages/client/Reservation";
import ReservationSuccess from "./pages/client/ReservationSuccess";
import About from "./pages/client/About";
import Contact from "./pages/client/Contact";

function App() {
  return (
    <Routes>
      <Route element={<ClientLayout />}>
        <Route path="/" element={<Home />} />

        <Route path="/games" element={<Games />} />

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

        <Route path="/about" element={<About />} />

        <Route path="/contact" element={<Contact />} />
      </Route>
    </Routes>
  );
}

export default App;