import { useAuth } from "./context/AuthContext";
import { supabase } from "./services/supabase";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { Home } from "./pages/Home";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { Dashboard } from "./pages/Dashboard";
import ProtectedRoute from "./pages/ProtectedRoute";

import "./App.css";
import { CreateService } from "./pages/CreateService";

function App() {
  const { user } = useAuth();

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <BrowserRouter>
      <nav
        style={{
          display: "flex",
          gap: "15px",
          padding: "15px",
          borderBottom: "1px solid #ccc",
        }}
      >
        <Link to="/">Inicio</Link>
        {user ? (
          <>
            <Link to="/dashboard">Mi Perfil</Link>
            <span style={{ color: "#666" }}>Bienvenido: {user.email}</span>
            <button onClick={handleLogout}>Cerrar sesión</button>
          </>
        ) : (
          <>
            <Link to="/login">Iniciar sesión</Link>
            <Link to="/register">Registrarse</Link>
          </>
        )}
      </nav>

      <div style={{ padding: "20px" }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
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
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
