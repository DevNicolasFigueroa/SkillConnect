import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../services/supabase";
import { ThemeSwitcher } from "./ThemeSwitcher";

export function Navbar() {
  const { user, profile } = useAuth();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

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
      <div className="navbar-container">
        <Link to="/" className="navbar-brand" onClick={() => setIsMenuOpen(false)}>
          <span className="navbar-brand-icon">⚡</span>
          SkillConnect
        </Link>

        {/* Botón Hamburguesa */}
        <button className={`navbar-burger ${isMenuOpen ? 'active' : ''}`} onClick={toggleMenu}>
          <span></span>
          <span></span>
          <span></span>
        </button>

        <div className={`navbar-links ${isMenuOpen ? 'active' : ''}`}>
          {location.pathname !== "/" && location.pathname !== "/services" && (
            <Link to="/services" className="navbar-link" onClick={() => setIsMenuOpen(false)}>
              Explorar
            </Link>
          )}

          <div className="navbar-theme-container">
             <ThemeSwitcher />
          </div>

          <div className="navbar-divider" />

          {user ? (
            <>
              <Link 
                to="/dashboard" 
                className="navbar-user-info" 
                style={{ textDecoration: 'none', cursor: 'pointer' }}
                onClick={() => setIsMenuOpen(false)}
              >
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="Avatar" className="navbar-avatar" style={{ objectFit: 'cover' }} />
                ) : (
                  <div className="navbar-avatar">{getInitials()}</div>
                )}
                <span className="navbar-username">
                  {profile?.full_name || user?.user_metadata?.fullName || "Usuario"}
                </span>
              </Link>
              <button className="btn btn-ghost btn-sm logout-btn" onClick={() => { handleLogout(); setIsMenuOpen(false); }}>
                Cerrar sesión
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="navbar-link" onClick={() => setIsMenuOpen(false)}>
                Iniciar sesión
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm" onClick={() => setIsMenuOpen(false)}>
                Registrarse
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
