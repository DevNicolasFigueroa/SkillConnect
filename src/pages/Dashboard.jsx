import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export function Dashboard() {
  const { user, refreshProfile } = useAuth();
  const navigate = useNavigate();
  
  // Estados para el perfil y servicios
  const [profile, setProfile] = useState(null);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Estados para la edición
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    avatar_url: ""
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Estado para el flujo de upgrade
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [upgradeForm, setUpgradeForm] = useState({
    profession: "",
    experience_years: "",
    bio: ""
  });

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
          bio: profileData.bio || ""
        });
      }

      // 2. Obtener servicios si es profesional
      if (profileData?.role === "professional" || user?.user_metadata?.role === "professional") {
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
      
      setLoading(false);
    };

    fetchData();
  }, [user]);

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      setEditForm(prev => ({ ...prev, avatar_url: publicUrl }));
      
      // Actualizar inmediatamente en el perfil para que la navbar lo vea
      await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', user.id);
      refreshProfile();
      
    } catch (err) {
      alert("Error al subir imagen: " + err.message);
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
        bio: profile.bio || ""
      });
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      let emailChanged = false;
      if (editForm.email !== user.email) {
        const { error: emailError } = await supabase.auth.updateUser({
          email: editForm.email
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
        role: profile?.role || user?.user_metadata?.role
      };

      // Solo añadir campos pro si el usuario es profesional
      if (updates.role === 'professional') {
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
      alert("Error al actualizar: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleBecomeProfessional = async (e) => {
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
          is_verified: true // Se verifica automáticamente al completar el perfil pro
        })
        .eq("id", user.id);

      if (error) throw error;

      // Actualizar metadatos de auth para consistencia
      await supabase.auth.updateUser({
        data: { role: "professional" }
      });

      // Recargar para aplicar cambios en toda la app
      window.location.reload();
      
    } catch (err) {
      alert("Error al actualizar a profesional: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return <div className="page-container"><p>Inicia sesión para ver esta página.</p></div>;
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
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleRemoveAvatar = async () => {
    if (!confirm("¿Estás seguro de que quieres eliminar tu foto de perfil?")) return;
    
    setUploading(true);
    try {
      setEditForm(prev => ({ ...prev, avatar_url: "" }));
      // También podríamos borrar el archivo en Storage, pero por ahora lo dejamos
      // ya que el upsert lo sobreescribirá o lo dejará nulo en el perfil.
    } catch (err) {
      alert("Error al eliminar imagen: " + err.message);
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
              style={{ objectFit: 'cover' }}
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
                  style={{ display: 'none' }}
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
                  onChange={(e) => setEditForm({...editForm, full_name: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Correo electrónico</label>
                <input 
                  type="email" 
                  className="form-input" 
                  value={editForm.email}
                  onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                  required
                />
              </div>
              
              {role === 'professional' && (
                <>
                  <div className="form-group">
                    <label className="form-label">Profesión / Especialidad</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={editForm.profession || ""}
                      onChange={(e) => setEditForm({...editForm, profession: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Años de experiencia</label>
                    <input 
                      type="number" 
                      className="form-input" 
                      value={editForm.experience_years || 0}
                      onChange={(e) => setEditForm({...editForm, experience_years: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Biografía</label>
                    <textarea 
                      className="form-textarea" 
                      value={editForm.bio || ""}
                      onChange={(e) => setEditForm({...editForm, bio: e.target.value})}
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
                  onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                  placeholder="+56 9 ..."
                />
              </div>
              <div className="profile-actions">
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? "Guardando..." : "Guardar cambios ✓"}
                </button>
                <button type="button" className="btn btn-ghost" onClick={() => setIsEditing(false)}>
                  Cancelar
                </button>
              </div>
            </form>
          ) : (
            <>
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {profile?.full_name || "Sin nombre"}
                {profile?.role === 'professional' && profile?.is_verified && (
                  <span className="verified-badge" title="Profesional Verificado">✓</span>
                )}
              </h2>
              
              {role === 'professional' && profile?.profession && (
                <p className="profile-profession-tag">🚀 {profile.profession}</p>
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
                {role === 'professional' && (
                  <div className="profile-detail">
                    <span>🕒</span>
                    <span>{profile?.experience_years || 0} años de exp.</span>
                  </div>
                )}
              </div>

              {role === 'professional' && profile?.bio && (
                <div className="profile-bio-preview">
                  <p>{profile.bio.substring(0, 120)}...</p>
                </div>
              )}

              <button className="btn btn-ghost btn-sm" onClick={() => setIsEditing(true)} style={{ marginTop: '1rem' }}>
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
                  style={{ cursor: 'pointer', position: 'relative' }}
                  onClick={() => navigate(`/service/${service.id}`)}
                >
                  <h3 className="service-card-title">{service.title}</h3>
                  <p className="service-card-desc">{service.description}</p>
                  <div className="service-card-footer">
                    <span className="service-price">${service.price}</span>
                    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                      <button 
                        className="btn btn-ghost btn-sm"
                        style={{ padding: "4px 8px", fontSize: "0.75rem" }}
                        onClick={(e) => {
                          e.stopPropagation(); // Evita navegar al detalle al editar
                          navigate(`/edit-service/${service.id}`);
                        }}
                      >
                        ✏️ Editar
                      </button>
                      <span className="badge badge-success">Activo</span>
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
                      Transforma tu perfil en uno profesional para empezar a publicar
                      servicios, conectar con clientes y hacer crecer tu negocio.
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
              <div style={{ marginBottom: '2rem' }}>
                <h1>Solicitud de Perfil Profesional</h1>
                <p style={{ color: 'var(--text-secondary)' }}>
                  Completa tu información profesional para obtener tu insignia de verificado y empezar a publicar servicios.
                </p>
              </div>

              <div className="card-static" style={{ maxWidth: '600px' }}>
                <form onSubmit={handleBecomeProfessional}>
                  <div className="form-group">
                    <label className="form-label">¿Cuál es tu profesión o especialidad?</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="Ej: Diseñador Web Senior, Gasfiter Certificado..."
                      required
                      value={upgradeForm.profession}
                      onChange={e => setUpgradeForm({...upgradeForm, profession: e.target.value})}
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
                      onChange={e => setUpgradeForm({...upgradeForm, experience_years: e.target.value})}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Tu biografía profesional</label>
                    <textarea 
                      className="form-textarea" 
                      placeholder="Cuéntale a tus clientes quién eres, qué haces y por qué deberían elegirte..."
                      required
                      value={upgradeForm.bio}
                      onChange={e => setUpgradeForm({...upgradeForm, bio: e.target.value})}
                    />
                    <span className="form-hint">Mínimo 100 caracteres para generar confianza.</span>
                  </div>

                  <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                    <button type="submit" className="btn btn-primary" disabled={saving} style={{ flex: 1 }}>
                      {saving ? "Procesando..." : "Finalizar y Obtener Insignia ✓"}
                    </button>
                    <button type="button" className="btn btn-ghost" onClick={() => setIsUpgrading(false)} disabled={saving}>
                      Cancelar
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          <div className="client-banner card-static animate-in animate-delay-3" style={{ marginTop: "24px", opacity: 0.7 }}>
            <div className="client-banner-icon">🔍</div>
            <h3>Próximamente para clientes</h3>
            <p style={{ maxWidth: "400px", margin: "8px auto 0" }}>
              Estamos preparando herramientas para que gestiones tus contrataciones y favoritos de forma más sencilla.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
