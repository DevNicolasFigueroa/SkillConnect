import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const themes = [
  { id: 'ocean', name: 'Ocean Deep', color: '#00D2FF', icon: '🌙' },
  { id: 'light', name: 'Modo Claro', color: '#0EA5E9', icon: '☀️' },
];

export const ThemeProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState(() => {
    return localStorage.getItem('skillconnect-theme') || 'ocean';
  });


  useEffect(() => {
    document.documentElement.setAttribute('data-theme', currentTheme);
    localStorage.setItem('skillconnect-theme', currentTheme);
  }, [currentTheme]);

  return (
    <ThemeContext.Provider value={{ currentTheme, setCurrentTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
