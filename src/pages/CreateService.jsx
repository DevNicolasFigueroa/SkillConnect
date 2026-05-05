import { useState, useEffect } from "react";
import { supabase } from "../services/supabase";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link, useParams } from "react-router-dom";
import { useToast } from "../context/ToastContext";
import { CATEGORIES } from "../utils/mockData";

export function CreateService() {
  const { id } = useParams();
  const isEditing = !!id;
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEditing);
  const [error, setError] = useState(null);
  
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (isEditing) {
      const fetchService = async () => {
        setFetching(true);
        const { data, error } = await supabase
          .from("services")
          .select("*")
          .eq("id", id)
          .single();

        if (error) {
          setError("Error al cargar el servicio: " + error.message);
        } else if (data) {
          // Verificar que el servicio pertenezca al usuario actual
          if (data.user_id !== user.id) {
            setError("No tienes permiso para editar este servicio.");
          } else {
            setTitle(data.title);
            setDescription(data.description);
            setPrice(data.price.toString());
            setCategory(data.category);
          }
        }
        setFetching(false);
      };
      fetchService();
    }
  }, [id, isEditing, user.id]);

  const handleSave = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const serviceData = {
      title,
      description,
      price: parseFloat(price),
      category,
      user_id: user.id,
    };

    let result;
    if (isEditing) {
      result = await supabase
        .from("services")
        .update(serviceData)
        .eq("id", id);
    } else {
      result = await supabase
        .from("services")
        .insert([serviceData]);
    }

    setLoading(false);

    if (result.error) {
      setError("Error al guardar: " + result.error.message);
      showToast("Error al guardar el servicio", "error");
    } else {
      showToast(isEditing ? "¡Servicio actualizado con éxito!" : "¡Servicio publicado con éxito!", "success");
      navigate("/dashboard");
    }
  };

  // Vista previa del servicio
  const selectedCategory = CATEGORIES.find((c) => c.value === category);

  if (fetching) {
    return (
      <div className="page-container">
        <div className="loading-screen">
          <div className="spinner" />
          <p>Cargando información del servicio...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container" style={{ paddingBottom: "4rem" }}>
      <nav className="breadcrumb animate-in">
        <Link to="/dashboard" className="breadcrumb-link">
          ← Volver al Dashboard
        </Link>
      </nav>

      <div style={{ marginBottom: "2rem" }}>
        <h1 className="animate-in animate-delay-1">
          {isEditing ? "Editar servicio" : "Publicar nuevo servicio"}
        </h1>
        <p className="animate-in animate-delay-1" style={{ color: "var(--text-secondary)" }}>
          {isEditing 
            ? "Actualiza los detalles de tu servicio para mantener informados a tus clientes."
            : "Describe tu servicio detalladamente para que los clientes puedan encontrarte y contratarte."}
        </p>
      </div>

      <div className="create-layout">
        {/* ── Formulario ── */}
        <div className="card-static form-card animate-in animate-delay-2">
          {error && (
            <div className="alert alert-error" style={{ marginBottom: "16px" }}>
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSave}>
            <div className="form-group">
              <label className="form-label" htmlFor="service-category">
                Categoría
              </label>
              <select
                id="service-category"
                className="form-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
              >
                <option value="" disabled>
                  Selecciona una categoría...
                </option>
                {CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.icon} {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="service-title">
                Título del servicio
              </label>
              <input
                id="service-title"
                className="form-input"
                type="text"
                placeholder="Ej: Desarrollo de sitios web profesionales"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
              <span className="form-hint">
                Sé claro y específico. Un buen título atrae más clientes.
              </span>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="service-desc">
                Descripción
              </label>
              <textarea
                id="service-desc"
                className="form-textarea"
                placeholder="Cuéntanos más sobre lo que ofreces, tu experiencia, qué incluye el servicio y por qué elegirte..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
              <span className="form-hint">
                Mínimo 50 caracteres. Incluye qué herramientas usas y qué
                entregables ofreces.
              </span>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="service-price">
                Precio estimado (USD)
              </label>
              <input
                id="service-price"
                className="form-input"
                type="number"
                placeholder="Ej: 250"
                min="1"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
              />
              <span className="form-hint">
                Puedes ajustar el precio después según cada proyecto.
              </span>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ width: "100%" }}
            >
              {loading 
                ? (isEditing ? "Guardando..." : "Publicando...") 
                : (isEditing ? "Guardar cambios ✓" : "Publicar servicio →")}
            </button>
          </form>
        </div>

        {/* ── Vista Previa ── */}
        <div className="preview-section animate-in animate-delay-3">
          <h4 className="preview-label">Vista previa</h4>
          <div className="card preview-card">
            <div className="explore-card-top">
              <span className="explore-card-category">
                {selectedCategory
                  ? `${selectedCategory.icon} ${selectedCategory.label}`
                  : "🏷️ Categoría"}
              </span>
              <span className="badge badge-success">Disponible</span>
            </div>
            <h3 className="explore-card-title">
              {title || "Título de tu servicio"}
            </h3>
            <p className="explore-card-desc">
              {description || "La descripción de tu servicio aparecerá aquí..."}
            </p>
            <div className="explore-card-footer">
              <div className="explore-card-author">
                <div className="explore-card-avatar">
                  {user?.user_metadata?.fullName
                    ? user.user_metadata.fullName
                        .split(" ")
                        .map((w) => w[0])
                        .join("")
                        .toUpperCase()
                        .slice(0, 2)
                    : "TÚ"}
                </div>
                <div>
                  <span className="explore-card-name">
                    {user?.user_metadata?.fullName || "Tu nombre"}
                  </span>
                  <span className="explore-card-rating">⭐ Nuevo</span>
                </div>
              </div>
              <div className="explore-card-price">
                {price ? `$${price}` : "$0"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
