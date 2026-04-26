import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [services, setServices] = useState([]);

  useEffect(() => {
    const fetchServices = async () => {
      const { data, error } = await supabase
        .from("services")
        .select("*")
        .eq("user_id", user.id); // Solo trae los servicios que me pertenecen
      if (error) {
        console.error("Error al obtener servicios:", error);
      } else {
        setServices(data);
      }
    };
    if (user) {
      fetchServices();
    }
  }, [user]);

  if (!user) {
    return <p>Inicia sesión para ver esta página.</p>;
  }

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto" }}>
      <div>
        <h1>Mi perfil</h1>
        <p>
          <strong>Nombre: </strong>
          {user.user_metadata?.fullName}
        </p>
        <p>
          <strong>Correo electrónico:</strong> {user.email}
        </p>
        <p>
          <strong>Teléfono:</strong> {user.user_metadata?.phone}
        </p>
      </div>

      <div>
        <h1>Mis servicios</h1>

        {services.length === 0 ? (
          <p style={{ color: "#999" }}>Aún no has publicado ningún servicio.</p>
        ) : (
          <div style={{ display: "grid", gap: "15px" }}>
            {services.map(service => (
              <div
                key={service.id}
                style={{
                  padding: "15px",
                  border: "1px solid #eee",
                  borderRadius: "8px",
                  background: "#fff",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                }}
              >
                <h3 style={{ margin: "0 0 10px 0" }}>{service.title}</h3>
                <p style={{ margin: "0 0 10px 0", color: "#555" }}>
                  {service.description}
                </p>
                <p style={{ fontWeight: "bold", color: "#28a745" }}>
                  ${service.price}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      <button
        onClick={() => navigate("/create-service")}
        style={{
          padding: "10px 20px",
          background: "#007bff",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        + Publicar servicios
      </button>
    </div>
  );
}
