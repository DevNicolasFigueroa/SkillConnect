import { useAuth } from "./context/AuthContext";
import { supabase } from "./services/supabase";
import { BrowserRouter, Routes, Route, Link, useLocation } from "react-router-dom";
import { Home } from "./pages/Home";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { Dashboard } from "./pages/Dashboard";
import { Services } from "./pages/Services";
import { ServiceDetail } from "./pages/ServiceDetail";
import ProtectedRoute from "./pages/ProtectedRoute";
import { CreateService } from "./pages/CreateService";
import { PublicProfile } from "./pages/PublicProfile";

import "./App.css";

function Navbar() {
  const { user, profile } = useAuth();
  const location = useLocation();

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const getInitials = () => {
    const name = profile?.full_name || user?.user_metadata?.fullName;
    if (!name) return "?";
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        <span className="navbar-brand-icon">⚡</span>
        SkillConnect
      </Link>

      <div className="navbar-links">
        {location.pathname !== "/" && location.pathname !== "/services" && (
          <Link to="/services" className="navbar-link">
            Explorar
          </Link>
        )}

        {user ? (
          <>
            <div className="navbar-divider" />
            <Link to="/dashboard" className="navbar-user-info" style={{ textDecoration: 'none', cursor: 'pointer' }}>
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="Avatar" className="navbar-avatar" style={{ objectFit: 'cover' }} />
              ) : (
                <div className="navbar-avatar">{getInitials()}</div>
              )}
              <span className="navbar-email">{user.email}</span>
            </Link>
            <button className="btn btn-ghost btn-sm" onClick={handleLogout}>
              Cerrar sesión
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="navbar-link">
              Iniciar sesión
            </Link>
            <Link to="/register" className="btn btn-primary btn-sm">
              Registrarse
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/services" element={<Services />} />
          <Route path="/service/:id" element={<ServiceDetail />} />
          <Route path="/profile/:id" element={<PublicProfile />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/create-service"
            element={
              <ProtectedRoute>
                <CreateService />
              </ProtectedRoute>
            }
          />
          <Route
            path="/edit-service/:id"
            element={
              <ProtectedRoute>
                <CreateService />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

export default App;
