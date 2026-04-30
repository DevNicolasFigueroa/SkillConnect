import { useParams, Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { CATEGORIES } from "../utils/mockData";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../services/supabase";

export function ServiceDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [service, setService] = useState(null);
  const [relatedServices, setRelatedServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServiceData = async () => {
      setLoading(true);
      
      // 1. Obtener el servicio actual
      const { data: serviceData, error: serviceError } = await supabase
        .from("services")
        .select(`
          *,
          professional:user_id (
            id,
            full_name,
            avatar_url,
            is_verified
          )
        `)
        .eq("id", id)
        .single();

      if (serviceError) {
        console.error("Error cargando servicio:", serviceError);
        setService(null);
        setLoading(false);
        return;
      }

      setService(serviceData);

      // 2. Obtener servicios relacionados (misma categoría, distinto ID)
      if (serviceData?.category) {
        const { data: relatedData } = await supabase
          .from("services")
          .select(`
            *,
            professional:user_id (
              id,
              full_name,
              avatar_url,
              is_verified
            )
          `)
          .eq("category", serviceData.category)
          .eq("is_available", true)
          .neq("id", serviceData.id)
          .limit(3);
          
        setRelatedServices(relatedData || []);
      }
      
      setLoading(false);
    };

    fetchServiceData();
  }, [id]);

  if (loading) {
    return (
      <div className="page-container">
        <div className="empty-state animate-in">
          <div className="spinner"></div>
          <p>Cargando información del servicio...</p>
        </div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="page-container">
        <div className="empty-state animate-in">
          <div className="empty-state-icon">😕</div>
          <h3>Servicio no encontrado</h3>
          <p>El servicio que buscas no existe o fue eliminado</p>
          <Link to="/services" className="btn btn-primary">
            ← Volver a explorar
          </Link>
        </div>
      </div>
    );
  }

  const category = CATEGORIES.find((c) => c.value === service.category);

  const getInitials = (name) => {
    if (!name) return "?";
    return name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
  };

  return (
    <div className="page-container">
      {/* ── Breadcrumb ── */}
      <nav className="breadcrumb animate-in">
        <Link to="/services" className="breadcrumb-link">
          ← Explorar servicios
        </Link>
        <span className="breadcrumb-separator">/</span>
        <span className="breadcrumb-current">
          {category?.icon} {category?.label}
        </span>
      </nav>

      {/* ── Layout principal ── */}
      <div className="detail-layout">
        {/* Columna izquierda: Info del servicio */}
        <div className="detail-main animate-in animate-delay-1">
          <div className="card-static detail-content">
            {/* Header */}
            <div className="detail-header">
              <span className="explore-card-category">
                {category?.icon} {category?.label}
              </span>
              <h1 className="detail-title">{service.title}</h1>
            </div>

            {/* Descripción */}
            <div className="detail-section">
              <h3 className="detail-section-title">Descripción del servicio</h3>
              <p className="detail-description">{service.description}</p>
            </div>

            {/* Detalles */}
            <div className="detail-section">
              <h3 className="detail-section-title">Detalles</h3>
              <div className="detail-specs">
                <div className="detail-spec">
                  <span className="detail-spec-label">💰 Precio</span>
                  <span className="detail-spec-value">${service.price} USD</span>
                </div>
                <div className="detail-spec">
                  <span className="detail-spec-label">📅 Publicado</span>
                  <span className="detail-spec-value">
                    {new Date(service.created_at).toLocaleDateString("es-ES", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <div className="detail-spec">
                  <span className="detail-spec-label">✅ Estado</span>
                  <span className="detail-spec-value">
                    <span className="badge badge-success">Disponible</span>
                  </span>
                </div>
                <div className="detail-spec">
                  <span className="detail-spec-label">🏷️ Categoría</span>
                  <span className="detail-spec-value">{category?.label}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Columna derecha: Profesional + CTA */}
        <aside className="detail-sidebar animate-in animate-delay-2">
          {/* Tarjeta del profesional */}
          <div className="card-static sidebar-pro-card">
            <div className="sidebar-pro-header">
              <Link to={`/profile/${service.professional?.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'flex', gap: '12px', alignItems: 'center' }}>
                <div className="sidebar-pro-avatar">
                  {service.professional?.avatar_url ? (
                    <img 
                      src={service.professional.avatar_url} 
                      alt="Avatar" 
                      style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} 
                    />
                  ) : (
                    getInitials(service.professional?.full_name)
                  )}
                </div>
                <div>
                  <h3 className="sidebar-pro-name" style={{ display: 'flex', alignItems: 'center' }}>
                    {service.professional?.full_name || "Usuario Profesional"}
                    {service.professional?.role === 'professional' && service.professional?.is_verified && (
                      <span className="verified-badge" title="Verificado">✓</span>
                    )}
                  </h3>
                  <p className="sidebar-pro-location">
                    📍 Profesional de SkillConnect
                  </p>
                </div>
              </Link>
            </div>

            <div className="sidebar-pro-stats">
              <div className="sidebar-pro-stat">
                <span className="sidebar-pro-stat-value">
                  ⭐ Nuevo
                </span>
                <span className="sidebar-pro-stat-label">Calificación</span>
              </div>
              <div className="sidebar-pro-stat">
                <span className="sidebar-pro-stat-value">
                  0
                </span>
                <span className="sidebar-pro-stat-label">Reseñas</span>
              </div>
            </div>

            <div className="sidebar-pro-actions">
              <button
                className="btn btn-primary"
                style={{ width: "100%" }}
                onClick={() => {
                  if (!user) {
                    navigate("/login");
                  } else {
                    alert(
                      "¡Función de contacto próximamente! Aquí se abrirá un chat con " + service.professional?.full_name
                    );
                  }
                }}
              >
                💬 Contactar profesional
              </button>
              <button className="btn btn-secondary" style={{ width: "100%" }}>
                ❤️ Guardar en favoritos
              </button>
            </div>
          </div>

          {/* Precio destacado */}
          <div className="card-static sidebar-price-card">
            <p className="sidebar-price-label">Precio del servicio</p>
            <p className="sidebar-price-value">${service.price}</p>
            <p className="sidebar-price-unit">USD por proyecto</p>
          </div>
        </aside>
      </div>

      {/* ── Servicios Relacionados ── */}
      {relatedServices.length > 0 && (
        <section className="related-section animate-in animate-delay-3">
          <h2>Servicios similares</h2>
          <div className="explore-grid" style={{ marginTop: "24px" }}>
            {relatedServices.map((s, i) => (
              <Link
                to={`/service/${s.id}`}
                key={s.id}
                className={`explore-card animate-in animate-delay-${i + 4}`}
              >
                <div className="explore-card-top">
                  <span className="explore-card-category">
                    {category?.icon} {category?.label}
                  </span>
                </div>
                <h3 className="explore-card-title">{s.title}</h3>
                <p className="explore-card-desc">{s.description}</p>
                <div className="explore-card-footer">
                  <div className="explore-card-author">
                    <div className="explore-card-avatar">
                      {s.professional?.avatar_url ? (
                        <img 
                          src={s.professional.avatar_url} 
                          alt="Avatar" 
                          style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} 
                        />
                      ) : (
                        getInitials(s.professional?.full_name)
                      )}
                    </div>
                    <div>
                      <span className="explore-card-name" style={{ display: 'flex', alignItems: 'center' }}>
                        {s.professional?.full_name}
                        {s.professional?.is_verified && <span className="verified-badge" title="Verificado">✓</span>}
                      </span>
                      <span className="explore-card-rating">
                        ⭐ Nuevo
                      </span>
                    </div>
                  </div>
                  <div className="explore-card-price">${s.price}</div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
