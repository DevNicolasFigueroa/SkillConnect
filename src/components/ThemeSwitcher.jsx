import React, { useState } from 'react';
import { useTheme, themes } from '../context/ThemeContext';

export const ThemeSwitcher = () => {
  const { currentTheme, setCurrentTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="theme-switcher-container" style={{ position: 'relative' }}>
      <button 
        className={`btn btn-ghost btn-sm theme-toggle-btn ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        title="Personalizar Experiencia"
        style={{ 
          fontSize: '1.4rem', 
          padding: '8px',
          background: isOpen ? 'var(--bg-hover)' : 'transparent',
          borderRadius: '12px'
        }}
      >
        🎨
      </button>

      {isOpen && (
        <>
          <div 
            className="theme-switcher-overlay" 
            onClick={() => setIsOpen(false)}
            style={{ position: 'fixed', inset: 0, zIndex: 998 }}
          />
          <div className="theme-menu card" style={{
            position: 'absolute',
            top: 'calc(100% + 12px)',
            right: 0,
            width: '240px',
            zIndex: 999,
            padding: '20px',
            animation: 'slideDown 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
            boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
            border: '1px solid var(--border-accent)'
          }}>
            <h4 style={{ 
              fontSize: '0.75rem', 
              color: 'var(--text-accent)', 
              marginBottom: '16px', 
              textTransform: 'uppercase', 
              letterSpacing: '0.1em',
              fontWeight: 800
            }}>
              Estética del Entorno
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {themes.map((theme) => (
                <button
                  key={theme.id}
                  className={`btn btn-sm ${currentTheme === theme.id ? 'btn-primary' : 'btn-ghost'}`}
                  onClick={() => {
                    setCurrentTheme(theme.id);
                    setIsOpen(false);
                  }}
                  style={{ 
                    justifyContent: 'flex-start', 
                    width: '100%', 
                    padding: '10px 14px',
                    fontSize: '0.9rem',
                    border: currentTheme === theme.id ? 'none' : '1px solid transparent'
                  }}
                >
                  <span style={{ marginRight: '12px', fontSize: '1.1rem' }}>{theme.icon}</span>
                  {theme.name}
                </button>

              ))}
            </div>
            <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)' }}>
               <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                Selecciona un entorno que se adapte a tu flujo de trabajo.
               </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

