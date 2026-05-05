import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { useToast } from "../context/ToastContext";
import { CATEGORIES } from "../utils/mockData";

export function Dashboard() {
  const { user, refreshProfile } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Estados para el perfil y servicios
  const [profile, setProfile] = useState(null);
  const [services, setServices] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [myReviews, setMyReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  // Estados para la edición
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    avatar_url: "",
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Estado para el flujo de upgrade
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [upgradeForm, setUpgradeForm] = useState({
    profession: "",
    experience_years: "",
    bio: "",
  });

  const getCategoryIcon = (value) => {
    const cat = CATEGORIES.find((c) => c.value === value);
    return cat ? cat.icon : "📦";
  };

  const getCategoryLabel = (value) => {
    const cat = CATEGORIES.find((c) => c.value === value);
    return cat ? cat.label : value;
  };

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      setLoading(true);

      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profileError) {
        console.error("Error al obtener perfil:", profileError);
      } else {
        setProfile(profileData);
        setEditForm({
          full_name: profileData.full_name || "",
          email: user.email || "",
          phone: profileData.phone || "",
          avatar_url: profileData.avatar_url || "",
          profession: profileData.profession || "",
          experience_years: profileData.experience_years || 0,
          bio: profileData.bio || "",
        });
      }

      // 2. Obtener servicios si es profesional
      if (
        profileData?.role === "professional" ||
        user?.user_metadata?.role === "professional"
      ) {
        const { data: servicesData, error: servicesError } = await supabase
          .from("services")
          .select("*")
          .eq("user_id", user.id);

        if (servicesError) {
          console.error("Error al obtener servicios:", servicesError);
        } else {
          setServices(servicesData || []);
        }
      }

      // 3. Obtener favoritos (para todos los usuarios)
      const { data: favoritesData, error: favoritesError } = await supabase
        .from("favorites")
        .select(`
          id,
          service:service_id (
            id,
            title,
            description,
            price,
            category,
            professional:user_id (
              full_name,
              avatar_url
            )
          )
        `)
        .eq("user_id", user.id);

      if (favoritesError) {
        console.error("Error al obtener favoritos:", favoritesError);
      } else {
        setFavorites(favoritesData || []);
      }
      
      // 4. Obtener reseñas dejadas por el usuario
      const { data: reviewsData, error: reviewsError } = await supabase
        .from("reviews")
        .select(`
          *,
          service:service_id (
            title,
            category,
            professional:user_id (
              full_name,
              avatar_url
            )
          )
        `)
        .eq("reviewer_id", user.id);

      if (reviewsError) {
        console.error("Error al obtener reseñas:", reviewsError);
      } else {
        setMyReviews(reviewsData || []);
      }

      setLoading(false);
    };

    fetchData();
  }, [user]);

  const toggleFavorite = async (serviceId) => {
    try {
      const { error } = await supabase
        .from("favorites")
        .delete()
        .eq("user_id", user.id)
        .eq("service_id", serviceId);

      if (error) throw error;

      // Actualizar estado local usando f.service.id que es lo que viene de la query
      setFavorites(prev => prev.filter(f => f.service.id !== serviceId));
      showToast("Eliminado de favoritos", "info");
    } catch (err) {
      showToast("Error al quitar favorito: " + err.message, "error");
    }
  };

  const handleAvatarUpload = async e => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(filePath);

      setEditForm(prev => ({ ...prev, avatar_url: publicUrl }));

      // Actualizar inmediatamente en el perfil para que la navbar lo vea
      await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("id", user.id);
      refreshProfile();
    } catch (err) {
      showToast("Error al subir imagen: " + err.message, "error");
    } finally {
      setUploading(false);
    }
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    if (profile) {
      setEditForm({
        full_name: profile.full_name || "",
        email: user.email || "",
        phone: profile.phone || "",
        avatar_url: profile.avatar_url || "",
        profession: profile.profession || "",
        experience_years: profile.experience_years || 0,
        bio: profile.bio || "",
      });
    }
  };

  const handleSaveProfile = async e => {
    e.preventDefault();
    setSaving(true);

    try {
      let emailChanged = false;
      if (editForm.email !== user.email) {
        const { error: emailError } = await supabase.auth.updateUser({
          email: editForm.email,
        });
        if (emailError) throw emailError;
        emailChanged = true;
      }

      const updates = {
        id: user.id,
        full_name: editForm.full_name,
        phone: editForm.phone,
        email: editForm.email,
        avatar_url: editForm.avatar_url,
        role: profile?.role || user?.user_metadata?.role,
      };

      // Solo añadir campos pro si el usuario es profesional
      if (updates.role === "professional") {
        updates.profession = editForm.profession;
        updates.experience_years = parseInt(editForm.experience_years);
        updates.bio = editForm.bio;
      }

      const { error: profileError } = await supabase
        .from("profiles")
        .upsert(updates);

      if (profileError) throw profileError;

      if (emailChanged) {
        window.location.reload();
      } else {
        setProfile({ ...profile, ...editForm });
        setIsEditing(false);
        refreshProfile(); // <--- Actualiza la Navbar
      }
    } catch (err) {
      showToast("Error al actualizar: " + err.message, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleBecomeProfessional = async e => {
    e.preventDefault();
    setSaving(true);

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          role: "professional",
          profession: upgradeForm.profession,
          experience_years: parseInt(upgradeForm.experience_years),
          bio: upgradeForm.bio,
          is_verified: true, // Se verifica automáticamente al completar el perfil pro
        })
        .eq("id", user.id);

      if (error) throw error;

      // Actualizar metadatos de auth para consistencia
      await supabase.auth.updateUser({
        data: { role: "professional" },
      });

      // Recargar para aplicar cambios en toda la app
      window.location.reload();
    } catch (err) {
      showToast("Error al actualizar a profesional: " + err.message, "error");
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return (
      <div className="page-container">
        <p>Inicia sesión para ver esta página.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-screen">
          <div className="spinner" />
          <p>Cargando tu información...</p>
        </div>
      </div>
    );
  }

  const role = profile?.role || user?.user_metadata?.role;

  // Obtener iniciales del nombre
  const getInitials = () => {
    const name = profile?.full_name || user.user_metadata?.fullName;
    if (!name) return "?";
    return name
      .split(" ")
      .map(word => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // --- Gestión de Servicios ---

  const handleDeleteService = async (serviceId) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este servicio permanentemente?")) return;

    try {
      const { error } = await supabase
        .from("services")
        .delete()
        .eq("id", serviceId);

      if (error) throw error;

      // Actualizar el estado local para que desaparezca de la lista sin recargar
      setServices(services.filter(s => s.id !== serviceId));
      showToast("Servicio eliminado correctamente.", "success");
    } catch (err) {
      showToast("Error al eliminar: " + err.message, "error");
    }
  };

  const handleToggleAvailability = async (serviceId, currentStatus) => {
    try {
      const { error } = await supabase
        .from("services")
        .update({ is_available: !currentStatus })
        .eq("id", serviceId);

      if (error) throw error;

      // Actualizar el estado local
      setServices(services.map(s => 
        s.id === serviceId ? { ...s, is_available: !currentStatus } : s
      ));
    } catch (err) {
      showToast("Error al actualizar disponibilidad: " + err.message, "error");
    }
  };

  const handleRemoveAvatar = async () => {
    if (!confirm("¿Estás seguro de que quieres eliminar tu foto de perfil?"))
      return;

    setUploading(true);
    try {
      // 1. Limpiar el campo en la base de datos
      const { error } = await supabase
        .from("profiles")
        .update({ avatar_url: null })
        .eq("id", user.id);

      if (error) throw error;

      // 2. Actualizar estados locales y globales
      setEditForm(prev => ({ ...prev, avatar_url: "" }));
      setProfile(prev => ({ ...prev, avatar_url: null }));
      refreshProfile(); // Actualiza la Navbar
      
      showToast("Foto de perfil eliminada correctamente.", "success");
    } catch (err) {
      showToast("Error al eliminar imagen: " + err.message, "error");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="page-container">
      {/* ── Perfil del Usuario ── */}
      <div className="card-static profile-card animate-in">
        <div className="profile-avatar-container">
          {editForm.avatar_url || profile?.avatar_url ? (
            <img
              src={isEditing ? editForm.avatar_url : profile.avatar_url}
              alt="Avatar"
              className="profile-avatar-lg"
              style={{ objectFit: "cover" }}
            />
          ) : (
            <div className="profile-avatar-lg">{getInitials()}</div>
          )}

          {isEditing && (
            <div className="avatar-edit-controls">
              <label className="avatar-upload-overlay">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  style={{ display: "none" }}
                  disabled={uploading}
                />
                {uploading ? "..." : "📷"}
              </label>
              {(editForm.avatar_url || profile?.avatar_url) && (
                <button
                  className="avatar-remove-btn"
                  onClick={handleRemoveAvatar}
                  title="Eliminar foto"
                >
                  ✕
                </button>
              )}
            </div>
          )}
        </div>

        <div className="profile-info">
          {isEditing ? (
            <form onSubmit={handleSaveProfile} className="edit-profile-form">
              <div className="form-group">
                <label className="form-label">Nombre completo</label>
                <input
                  type="text"
                  className="form-input"
                  value={editForm.full_name}
                  onChange={e =>
                    setEditForm({ ...editForm, full_name: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Correo electrónico</label>
                <input
                  type="email"
                  className="form-input"
                  value={editForm.email}
                  onChange={e =>
                    setEditForm({ ...editForm, email: e.target.value })
                  }
                  required
                />
              </div>

              {role === "professional" && (
                <>
                  <div className="form-group">
                    <label className="form-label">
                      Profesión / Especialidad
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      value={editForm.profession || ""}
                      onChange={e =>
                        setEditForm({ ...editForm, profession: e.target.value })
                      }
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Años de experiencia</label>
                    <input
                      type="number"
                      className="form-input"
                      value={editForm.experience_years || 0}
                      onChange={e =>
                        setEditForm({
                          ...editForm,
                          experience_years: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Biografía</label>
                    <textarea
                      className="form-textarea"
                      value={editForm.bio || ""}
                      onChange={e =>
                        setEditForm({ ...editForm, bio: e.target.value })
                      }
                    />
                  </div>
                </>
              )}

              <div className="form-group">
                <label className="form-label">Teléfono</label>
                <input
                  type="tel"
                  className="form-input"
                  value={editForm.phone}
                  onChange={e =>
                    setEditForm({ ...editForm, phone: e.target.value })
                  }
                  placeholder="+56 9 ..."
                />
              </div>
              <div className="profile-actions">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={saving}
                >
                  {saving ? "Guardando..." : "Guardar cambios ✓"}
                </button>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setIsEditing(false)}
                >
                  Cancelar
                </button>
              </div>
            </form>
          ) : (
            <>
              <h2 style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                {profile?.full_name || "Sin nombre"}
                {profile?.role === "professional" && profile?.is_verified && (
                  <span
                    className="verified-badge"
                    title="Profesional Verificado"
                    style={{ marginLeft: "8px" }}
                  >
                    ✓
                  </span>
                )}
              </h2>

              {role === "professional" && profile?.profession && (
                <p className="profile-profession-tag">
                  🚀 {profile.profession}
                </p>
              )}

              <div className="profile-details-grid">
                <div className="profile-detail">
                  <span>📧</span>
                  <span>{profile?.email || user.email}</span>
                </div>
                <div className="profile-detail">
                  <span>📞</span>
                  <span>{profile?.phone || "No registrado"}</span>
                </div>
                {role === "professional" && (
                  <div className="profile-detail">
                    <span>🕒</span>
                    <span>{profile?.experience_years || 0} años de exp.</span>
                  </div>
                )}
              </div>

              {role === "professional" && profile?.bio && (
                <div className="profile-bio-preview">
                  <p>{profile.bio.substring(0, 120)}...</p>
                </div>
              )}

              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setIsEditing(true)}
                style={{ marginTop: "1rem" }}
              >
                ✏️ Editar perfil
              </button>
            </>
          )}
        </div>
      </div>

      {/* ── Contenido según el Rol ── */}
      {role === "professional" ? (
        <>
          {/* Vista del Profesional */}
          <div className="dashboard-header animate-in animate-delay-1">
            <div>
              <h1>Mis Servicios</h1>
              <p>Gestiona los servicios que ofreces a la comunidad</p>
            </div>
            <button
              className="btn btn-primary"
              onClick={() => navigate("/create-service")}
            >
              + Publicar servicio
            </button>
          </div>

          {services.length === 0 ? (
            <div className="empty-state animate-in animate-delay-2">
              <div className="empty-state-icon">📦</div>
              <h3>Aún no has publicado ningún servicio</h3>
              <p>
                Publica tu primer servicio y empieza a conectar con clientes que
                necesitan tu ayuda.
              </p>
              <button
                className="btn btn-primary"
                onClick={() => navigate("/create-service")}
              >
                Publicar mi primer servicio
              </button>
            </div>
          ) : (
            <div className="services-grid">
              {services.map((service, i) => (
                <div
                  key={service.id}
                  className={`card animate-in animate-delay-${i + 2}`}
                  style={{ cursor: "pointer", position: "relative" }}
                  onClick={() => navigate(`/service/${service.id}`)}
                >
                  <h3 className="service-card-title">{service.title}</h3>
                  <p className="service-card-desc">{service.description}</p>
                  <div className="service-card-footer">
                    <span className="service-price">${service.price}</span>
                    <div
                      style={{
                        display: "flex",
                        gap: "8px",
                        alignItems: "center",
                      }}
                    >
                      <button
                        className="btn btn-ghost btn-sm"
                        style={{ padding: "4px 8px", fontSize: "0.75rem" }}
                        onClick={e => {
                          e.stopPropagation();
                          navigate(`/edit-service/${service.id}`);
                        }}
                      >
                        ✏️
                      </button>
                      <button
                        className="btn btn-ghost btn-sm"
                        style={{ padding: "4px 8px", fontSize: "0.75rem", color: "var(--error)" }}
                        onClick={e => {
                          e.stopPropagation();
                          handleDeleteService(service.id);
                        }}
                        title="Eliminar servicio"
                      >
                        🗑️
                      </button>
                      <button 
                        className={`badge ${service.is_available ? 'badge-success' : 'badge-accent'}`}
                        style={{ cursor: 'pointer', border: 'none' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleAvailability(service.id, service.is_available);
                        }}
                        title={service.is_available ? "Marcar como no disponible" : "Marcar como disponible"}
                      >
                        {service.is_available ? 'Activo' : 'Inactivo'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <>
          {/* Vista del Cliente */}
          {!isUpgrading ? (
            <>
              <div className="dashboard-header animate-in animate-delay-1">
                <div>
                  <h1>Mi Panel</h1>
                  <p>Bienvenido a tu espacio personal en SkillConnect</p>
                </div>
              </div>

              <div className="client-banner card-static animate-in animate-delay-2">
                <div className="client-banner-content">
                  <div className="client-banner-text">
                    <h2>¿Eres un experto en lo que haces?</h2>
                    <p>
                      Transforma tu perfil en uno profesional para empezar a
                      publicar servicios, conectar con clientes y hacer crecer
                      tu negocio.
                    </p>
                  </div>
                  <button
                    className="btn btn-primary"
                    onClick={() => setIsUpgrading(true)}
                  >
                    🚀 Convertirme en Profesional
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="upgrade-section animate-in">
              <div style={{ marginBottom: "2rem" }}>
                <h1>Solicitud de Perfil Profesional</h1>
                <p style={{ color: "var(--text-secondary)" }}>
                  Completa tu información profesional para obtener tu insignia
                  de verificado y empezar a publicar servicios.
                </p>
              </div>

              <div className="card-static" style={{ maxWidth: "600px" }}>
                <form onSubmit={handleBecomeProfessional}>
                  <div className="form-group">
                    <label className="form-label">
                      ¿Cuál es tu profesión o especialidad?
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Ej: Diseñador Web Senior, Gasfiter Certificado..."
                      required
                      value={upgradeForm.profession}
                      onChange={e =>
                        setUpgradeForm({
                          ...upgradeForm,
                          profession: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Años de experiencia</label>
                    <input
                      type="number"
                      className="form-input"
                      placeholder="Ej: 5"
                      min="0"
                      required
                      value={upgradeForm.experience_years}
                      onChange={e =>
                        setUpgradeForm({
                          ...upgradeForm,
                          experience_years: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      Tu biografía profesional
                    </label>
                    <textarea
                      className="form-textarea"
                      placeholder="Cuéntale a tus clientes quién eres, qué haces y por qué deberían elegirte..."
                      required
                      value={upgradeForm.bio}
                      onChange={e =>
                        setUpgradeForm({ ...upgradeForm, bio: e.target.value })
                      }
                    />
                    <span className="form-hint">
                      Mínimo 100 caracteres para generar confianza.
                    </span>
                  </div>

                  <div
                    style={{ display: "flex", gap: "1rem", marginTop: "2rem" }}
                  >
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={saving}
                      style={{ flex: 1 }}
                    >
                      {saving
                        ? "Procesando..."
                        : "Finalizar y Obtener Insignia ✓"}
                    </button>
                    <button
                      type="button"
                      className="btn btn-ghost"
                      onClick={() => setIsUpgrading(false)}
                      disabled={saving}
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          <div
            className="client-banner card-static animate-in animate-delay-3"
            style={{ marginTop: "24px" }}
          >
            <div className="dashboard-header" style={{ marginBottom: '1.5rem' }}>
              <h1>❤️ Mis Favoritos</h1>
              <p>Servicios que has guardado para revisar más tarde</p>
            </div>

            {favorites.length === 0 ? (
              <div className="empty-state" style={{ padding: '2rem' }}>
                <p>Aún no tienes servicios favoritos.</p>
                <button className="btn btn-ghost" onClick={() => navigate('/services')}>
                  Explorar servicios
                </button>
              </div>
            ) : (
              <div className="services-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                {favorites.map((fav, i) => (
                  <div key={fav.id} className={`explore-card animate-in animate-delay-${(i % 6) + 1}`}>
                    <Link to={`/service/${fav.service.id}`} style={{ textDecoration: 'none', color: 'inherit', height: '100%', display: 'flex', flexDirection: 'column' }}>
                      <div className="explore-card-top">
                        <span className="explore-card-category">
                          {getCategoryIcon(fav.service.category)} {getCategoryLabel(fav.service.category)}
                        </span>
                        <div className="explore-card-price">${fav.service.price}</div>
                      </div>
                      
                      <h3 className="explore-card-title">{fav.service.title}</h3>
                      <p className="explore-card-desc" style={{ WebkitLineClamp: 2 }}>{fav.service.description}</p>
                      
                      <div className="explore-card-footer" style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div className="explore-card-author">
                          {fav.service.professional?.avatar_url ? (
                            <img src={fav.service.professional.avatar_url} alt="Pro" className="explore-card-avatar" style={{ objectFit: 'cover' }} />
                          ) : (
                            <div className="explore-card-avatar">
                              {fav.service.professional?.full_name?.charAt(0)}
                            </div>
                          )}
                          <span className="explore-card-name" style={{ fontSize: '0.8rem' }}>{fav.service.professional?.full_name}</span>
                        </div>
                        
                        <div className="favorite-actions">
                          {confirmDeleteId === fav.service.id ? (
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', animation: 'fadeIn 0.2s ease' }}>
                              <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--text-muted)' }}>¿Seguro?</span>
                              <button 
                                className="btn btn-sm" 
                                style={{ background: '#ff4b4b', color: 'white', padding: '4px 10px', borderRadius: '6px' }}
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  toggleFavorite(fav.service.id);
                                }}
                              >
                                Sí
                              </button>
                              <button 
                                className="btn btn-ghost btn-sm" 
                                style={{ padding: '4px 10px', borderRadius: '6px' }}
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setConfirmDeleteId(null);
                                }}
                              >
                                No
                              </button>
                            </div>
                          ) : (
                            <button 
                              className="btn btn-ghost btn-sm" 
                              style={{ 
                                padding: '6px 12px', 
                                color: '#ff4b4b', 
                                minWidth: 'auto',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                fontSize: '0.8rem',
                                fontWeight: '600',
                                borderRadius: '8px',
                                background: 'rgba(255, 75, 75, 0.05)'
                              }}
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setConfirmDeleteId(fav.service.id);
                              }}
                            >
                              ❤️ Eliminar
                            </button>
                          )}
                        </div>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div
            className="client-banner card-static animate-in animate-delay-4"
            style={{ marginTop: "24px", padding: '2rem' }}
          >
            <div className="dashboard-header" style={{ marginBottom: '1.5rem' }}>
              <h1>💬 Mis Reseñas Dejadas</h1>
              <p>Historial de opiniones y valoraciones que has compartido</p>
            </div>

            {myReviews.length === 0 ? (
              <div className="empty-state">
                <p>Aún no has dejado ninguna reseña.</p>
              </div>
            ) : (
              <div className="my-reviews-list" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                {myReviews.map((rev) => (
                  <div key={rev.id} className="review-card-item card-static animate-in" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <span className="badge badge-category" style={{ fontSize: '0.7rem' }}>
                        {getCategoryIcon(rev.service?.category)} {getCategoryLabel(rev.service?.category)}
                      </span>
                      <span style={{ fontSize: '0.9rem', color: 'var(--primary)', fontWeight: '800', background: 'var(--primary-subtle)', padding: '2px 8px', borderRadius: '12px' }}>
                        ⭐ {rev.rating}
                      </span>
                    </div>
                    
                    <div style={{ flex: 1 }}>
                      <Link to={`/service/${rev.service_id}`} style={{ textDecoration: 'none' }}>
                        <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-primary)', fontSize: '1.1rem', lineHeight: '1.3' }}>
                          {rev.service?.title}
                        </h4>
                      </Link>
                      <p style={{ fontSize: '0.9rem', opacity: 0.9, fontStyle: 'italic', color: 'var(--text-secondary)', borderLeft: '3px solid var(--border-subtle)', paddingLeft: '12px', margin: '1rem 0' }}>
                        "{rev.comment}"
                      </p>
                    </div>

                    <div className="review-card-footer" style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem', marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {rev.service?.professional?.avatar_url ? (
                          <img 
                            src={rev.service.professional.avatar_url} 
                            alt="Pro" 
                            className="navbar-avatar" 
                            style={{ width: '24px', height: '24px', objectFit: 'cover' }} 
                          />
                        ) : (
                          <div className="navbar-avatar" style={{ width: '24px', height: '24px', fontSize: '0.7rem' }}>
                            {rev.service?.professional?.full_name?.charAt(0)}
                          </div>
                        )}
                        <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>{rev.service?.professional?.full_name}</span>
                      </div>
                      <span style={{ fontSize: '0.75rem', opacity: 0.5 }}>{new Date(rev.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
