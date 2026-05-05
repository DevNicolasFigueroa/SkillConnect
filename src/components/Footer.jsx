import React from 'react';
import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-grid">
          {/* Branding */}
          <div className="footer-brand">
            <Link to="/" className="navbar-brand" style={{ marginBottom: '1.5rem', display: 'inline-flex' }}>
              <span className="navbar-brand-icon">⚡</span>
              SkillConnect
            </Link>
            <p className="footer-text">
              La plataforma líder para conectar talento excepcional con proyectos ambiciosos. 
              Impulsando la economía digital desde 2026.
            </p>
            <div className="footer-socials">
              <a href="#" className="social-link" title="Twitter">𝕏</a>
              <a href="#" className="social-link" title="LinkedIn">in</a>
              <a href="#" className="social-link" title="Instagram">ig</a>
            </div>
          </div>

          {/* Categorías */}
          <div className="footer-links-group">
            <h4 className="footer-title">Categorías</h4>
            <ul className="footer-links">
              <li><Link to="/services?category=desarrollo-web">Desarrollo Web</Link></li>
              <li><Link to="/services?category=diseno-grafico">Diseño Gráfico</Link></li>
              <li><Link to="/services?category=marketing-digital">Marketing Digital</Link></li>
              <li><Link to="/services?category=fotografia">Fotografía y Video</Link></li>
            </ul>
          </div>

          {/* Plataforma */}
          <div className="footer-links-group">
            <h4 className="footer-title">Plataforma</h4>
            <ul className="footer-links">
              <li><Link to="/services">Explorar</Link></li>
              <li><Link to="/login">Iniciar Sesión</Link></li>
              <li><Link to="/register">Unirse como Profesional</Link></li>
              <li><Link to="/dashboard">Mi Panel</Link></li>
            </ul>
          </div>

          {/* Soporte */}
          <div className="footer-links-group">
            <h4 className="footer-title">Soporte</h4>
            <ul className="footer-links">
              <li><a href="#">Centro de Ayuda</a></li>
              <li><a href="#">Guía de Seguridad</a></li>
              <li><a href="#">Términos y Condiciones</a></li>
              <li><a href="#">Privacidad</a></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2026 SkillConnect. Todos los derechos reservados.</p>
          <div className="footer-bottom-links">
            <span>Hecho con ❤️ para la comunidad global</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
