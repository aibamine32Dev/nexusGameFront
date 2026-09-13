
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  CalendarDays,
  Gamepad2,
  Plus,
  LogOut,
  Globe,
} from "lucide-react";

function AdminSidebar() {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("nexusAdminAuth");
    navigate("/admin/login");
  };

  return (
    <aside className="admin-sidebar">

      <div className="admin-brand">
        <Gamepad2 size={30} />

        <div>
          <span>NEXUS</span>
          <strong>GAMES</strong>
        </div>
      </div>

      <div className="admin-label">
        ADMIN PANEL
      </div>

      <nav className="admin-nav">

        <NavLink to="/admin/dashboard">
          <LayoutDashboard size={19} />
          Dashboard
        </NavLink>

        <NavLink to="/admin/reservations">
          <CalendarDays size={19} />
          Reservations
        </NavLink>

        <NavLink to="/admin/games">
          <Gamepad2 size={19} />
          Games
        </NavLink>

        <NavLink to="/admin/games/new">
          <Plus size={19} />
          Add Game
        </NavLink>

      </nav>

      <div className="admin-sidebar-bottom">

        <button onClick={() => navigate("/")}>
          <Globe size={18} />
          View Website
        </button>

        <button onClick={logout}>
          <LogOut size={18} />
          Logout
        </button>

      </div>

    </aside>
  );
}

export default AdminSidebar;

