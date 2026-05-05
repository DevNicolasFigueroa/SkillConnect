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
import { ThemeProvider } from "./context/ThemeContext";
import { BackgroundEffects } from "./components/BackgroundEffects";
import { ThemeSwitcher } from "./components/ThemeSwitcher";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";

import "./App.css";

function NotFound() {
  return (
    <div className="page-container" style={{ textAlign: 'center', paddingTop: '10vh' }}>
      <h1 style={{ fontSize: '8rem', marginBottom: '0', opacity: 0.2 }}>404</h1>
      <h2 style={{ marginTop: '-2rem' }}>Página no encontrada</h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
        Lo sentimos, el enlace que seguiste no existe o ha sido movido.
      </p>
      <Link to="/" className="btn btn-primary">Volver al Inicio</Link>
    </div>
  );
}


function AppContent() {
  return (
    <BrowserRouter>
      <BackgroundEffects />
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
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </BrowserRouter>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;

