import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../services/supabase";

export function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("client");

  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    setError(null);
    setMessage(null);
    setLoading(true);

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          fullName,
          phone,
          role,
        },
      },
    });

    setLoading(false);

    if (error) {
      setError(error.message);
    } else {
      // Redirigir al inicio después de un registro exitoso
      navigate("/");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="card-static">
          <div className="auth-header">
            <h1>Crear cuenta</h1>
            <p>Únete a la comunidad de profesionales más grande</p>
          </div>

          {error && (
            <div className="alert alert-error" style={{ marginBottom: "16px" }}>
              ⚠️ {error}
            </div>
          )}
          {message && (
            <div
              className="alert alert-success"
              style={{ marginBottom: "16px" }}
            >
              ✅ {message}
            </div>
          )}

          <form onSubmit={handleRegister} className="auth-form">
            <div className="form-group">
              <label className="form-label" htmlFor="reg-name">
                Nombre completo
              </label>
              <input
                id="reg-name"
                className="form-input"
                type="text"
                placeholder="Ej: María López"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reg-phone">
                Teléfono
              </label>
              <input
                id="reg-phone"
                className="form-input"
                type="tel"
                placeholder="+56 9 1234 5678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reg-email">
                Correo electrónico
              </label>
              <input
                id="reg-email"
                className="form-input"
                type="email"
                placeholder="tu@correo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reg-password">
                Contraseña
              </label>
              <input
                id="reg-password"
                className="form-input"
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reg-confirm">
                Confirmar contraseña
              </label>
              <input
                id="reg-confirm"
                className="form-input"
                type="password"
                placeholder="Repite tu contraseña"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reg-role">
                ¿Qué tipo de cuenta necesitas?
              </label>
              <select
                id="reg-role"
                className="form-select"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="client">
                  🔍 Soy un Cliente — busco ayuda profesional
                </option>
                <option value="professional">
                  🛠️ Soy un Profesional — ofrezco mis servicios
                </option>
              </select>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ width: "100%", marginTop: "8px" }}
            >
              {loading ? "Creando cuenta..." : "Crear cuenta"}
            </button>
          </form>

          <div className="auth-footer">
            ¿Ya tienes cuenta?{" "}
            <Link to="/login">Inicia sesión</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
