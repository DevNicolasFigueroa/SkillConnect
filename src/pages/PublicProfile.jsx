import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { supabase } from "../services/supabase";
import { StarRating } from "../components/StarRating";
import { ReviewsList } from "../components/ReviewsList";
import { CATEGORIES } from "../utils/mockData";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export function PublicProfile() {
  const { id } = useParams();
  const { user: currentUser } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  
  const [profile, setProfile] = useState(null);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPublicData = async () => {
      setLoading(true);
      
      // 1. Obtener datos del perfil
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", id)
        .single();

      if (profileError) {
        console.error("Error al obtener perfil público:", profileError);
        setProfile(null);
      } else {
        setProfile(profileData);
        
        // 2. Obtener servicios del profesional
        const { data: servicesData } = await supabase
          .from("services")
          .select("*")
          .eq("user_id", id)
          .eq("is_available", true);
          
        setServices(servicesData || []);
      }
      
      setLoading(false);
    };

    fetchPublicData();
  }, [id]);

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-screen">
          <div className="spinner" />
          <p>Cargando perfil...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="page-container">
        <div className="empty-state">
          <h2>Usuario no encontrado</h2>
          <p>El perfil que buscas no existe o ha sido desactivado.</p>
          <Link to="/services" className="btn btn-primary">Volver a explorar</Link>
        </div>
      </div>
    );
  }

  const getInitials = () => {
    if (!profile.full_name) return "?";
    return profile.full_name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
  };

  const getCategoryIcon = (catValue) => {
    const cat = CATEGORIES.find(c => c.value === catValue);
    return cat ? cat.icon : "📦";
  };

  return (
    <div className="page-container">
      <nav className="breadcrumb animate-in">
        <Link to="/services" className="breadcrumb-link">← Volver a explorar</Link>
      </nav>

      <div className="profile-public-layout">
        {/* Header del Perfil */}
        <div className="card-static profile-public-header animate-in">
          <div className="profile-public-info-row">
            <div className="profile-avatar-container">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt="Avatar" className="profile-avatar-lg" style={{ objectFit: 'cover' }} />
              ) : (
                <div className="profile-avatar-lg">{getInitials()}</div>
              )}
            </div>
            
            <div className="profile-public-details">
              <h1 className="profile-public-name">
                {profile.full_name}
                {profile.role === 'professional' && profile.is_verified && (
                  <span className="verified-badge-lg" title="Verificado" style={{ marginLeft: "8px" }}>✓</span>
                )}
              </h1>
              <p className="profile-public-role">
                {profile.role === 'professional' ? `🚀 ${profile.profession || 'Profesional Destacado'}` : '👤 Cliente'}
              </p>
              <div className="profile-public-stats">
                <StarRating rating={profile.rating_avg} size={0.9} />
                <a 
                  href="#reviews-section" 
                  style={{ fontSize: "0.85rem", color: "var(--primary)", textDecoration: "none", fontWeight: "600", cursor: "pointer" }}
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById('reviews-section')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  ({profile.reviews_count || 0} reseñas)
                </a>
                <span className="stat-separator">•</span>
                <span className="stat-item">📍 {profile.location || 'Chile'}</span>
                <span className="stat-separator">•</span>
                <span className="stat-item">🕒 {profile.experience_years || 0} años de exp.</span>
              </div>
              
              <div className="profile-public-contact-bar">
                <div className="contact-pill">
                  <span className="contact-icon">✉️</span>
                  <span>{profile.email}</span>
                </div>
                {profile.phone && (
                  <div className="contact-pill">
                    <span className="contact-icon">📞</span>
                    <span>{profile.phone}</span>
                  </div>
                )}
                <div className="contact-pill">
                  <span className="contact-icon">📅</span>
                  <span>Miembro desde {new Date(profile.created_at).getFullYear()}</span>
                </div>
              </div>
            </div>
            
            {currentUser?.id !== profile.id && (
              <div className="profile-public-actions">
                <button 
                  className="btn btn-primary"
                  onClick={() => showToast("¡Chat con " + profile.full_name + " próximamente!", "info")}
                >
                  💬 Contactar ahora
                </button>
              </div>
            )}
          </div>

          <div className="profile-divider" />
          
          <div className="profile-public-bio-section">
            <h3>Sobre mí</h3>
            {profile.bio ? (
              <p className="profile-bio-text">{profile.bio}</p>
            ) : (
              <p className="profile-bio-empty">Este profesional aún no ha redactado su biografía, pero puedes contactarlo directamente para resolver tus dudas.</p>
            )}
          </div>
        </div>

        {/* Separador entre Header y Servicios */}
        <div className="section-divider">
          <span className="divider-line"></span>
          <span className="divider-text">Catálogo de Servicios</span>
          <span className="divider-line"></span>
        </div>

        {/* Lista de Servicios */}
        <div className="profile-public-services animate-in animate-delay-1">
          {services.length === 0 ? (
            <div className="empty-state card-static">
              <p>Este profesional aún no ha publicado servicios.</p>
            </div>
          ) : (
            <div className="services-grid">
              {services.map((service, i) => (
                <div 
                  key={service.id} 
                  className={`card animate-in animate-delay-${i + 2}`}
                  style={{ cursor: 'pointer' }}
                  onClick={() => navigate(`/service/${service.id}`)}
                >
                  <div className="service-card-top">
                    <span className="badge badge-category">{getCategoryIcon(service.category)} {service.category}</span>
                    <span className="service-price">${service.price}</span>
                  </div>
                  <h3 className="service-card-title">{service.title}</h3>
                  <p className="service-card-desc">{service.description}</p>
                  <div className="service-card-footer">
                    <span className="badge badge-success">Disponible</span>
                    <span className="btn-text">Ver detalle →</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sección de Reseñas del Profesional */}
        <section id="reviews-section" className="card-static" style={{ marginTop: "2rem", padding: "2rem" }}>
          <h3 className="detail-section-title" style={{ marginBottom: "1.5rem" }}>
            Opiniones sobre {profile.full_name.split(' ')[0]}
          </h3>
          <ReviewsList professionalId={profile.id} />
        </section>
      </div>
    </div>
  );
}
