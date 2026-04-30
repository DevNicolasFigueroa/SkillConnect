import { useState, useMemo, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CATEGORIES } from "../utils/mockData";
import { supabase } from "../services/supabase";
import { useAuth } from "../context/AuthContext";

export function Services() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
  
  const { user, profile } = useAuth();
  const isProfessional = profile?.role === "professional";
  const navigate = useNavigate();

  // Nuevos estados para los datos reales
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. Efecto para cargar los servicios desde Supabase
  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true);
      // Consulta a la tabla services
      // La sintaxis profiles:user_id(...) hace el JOIN automático con la tabla profiles
      const { data, error } = await supabase
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
        .eq("is_available", true); // Solo mostramos los disponibles

      if (error) {
        console.error("Error al cargar servicios:", error);
      } else {
        setServices(data || []);
      }
      setLoading(false);
    };

    fetchServices();
  }, []);

  // 2. Filtrar y ordenar servicios (ahora sobre 'services' en vez de MOCK_SERVICES)
  const filteredServices = useMemo(() => {
    let result = [...services];

    // Filtro por categoría
    if (activeCategory !== "all") {
      result = result.filter((s) => s.category === activeCategory);
    }

    // Filtro por búsqueda
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (s) =>
          s.title?.toLowerCase().includes(query) ||
          s.description?.toLowerCase().includes(query) ||
          s.professional?.full_name?.toLowerCase().includes(query)
      );
    }

    // Ordenar
    if (sortBy === "price-low") {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-high") {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === "recent") {
      result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }

    return result;
  }, [searchQuery, activeCategory, sortBy, services]);

  // Obtener el label de la categoría
  const getCategoryLabel = (value) => {
    const cat = CATEGORIES.find((c) => c.value === value);
    return cat ? cat.label : value;
  };

  const getCategoryIcon = (value) => {
    const cat = CATEGORIES.find((c) => c.value === value);
    return cat ? cat.icon : "📦";
  };
  
  // Helper para las iniciales si no hay avatar_url
  const getInitials = (name) => {
    if (!name) return "?";
    return name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
  };

  return (
    <div className="page-container">
      {/* ── Header de Exploración ── */}
      <div className="services-page-header animate-in">
        <h1>
          Explora <span className="text-gradient">Servicios</span>
        </h1>
        <p className="services-page-subtitle">
          Encuentra al profesional ideal para tu proyecto entre cientos de
          servicios verificados
        </p>
        
        {/* Botón CTA para profesionales */}
        {isProfessional && (
          <div style={{ marginTop: "24px" }}>
            <Link to="/create-service" className="btn btn-primary">
              + Publicar nuevo servicio
            </Link>
          </div>
        )}
      </div>

      {/* ── Barra de Búsqueda ── */}
      <div className="search-bar-container animate-in animate-delay-1">
        <div className="search-bar">
          <span className="search-bar-icon">🔍</span>
          <input
            type="text"
            className="search-bar-input"
            placeholder="Busca servicios, categorías o profesionales..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              className="search-bar-clear"
              onClick={() => setSearchQuery("")}
              aria-label="Limpiar búsqueda"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* ── Filtros por Categoría ── */}
      <div className="filters-row animate-in animate-delay-2">
        <div className="category-chips">
          <button
            className={`chip ${activeCategory === "all" ? "chip-active" : ""}`}
            onClick={() => setActiveCategory("all")}
          >
            🌐 Todos
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              className={`chip ${activeCategory === cat.value ? "chip-active" : ""}`}
              onClick={() => setActiveCategory(cat.value)}
            >
              {cat.icon} {cat.label}
            </button>
          ))}
        </div>

        <div className="sort-control">
          <label className="sort-label" htmlFor="sort-select">
            Ordenar:
          </label>
          <select
            id="sort-select"
            className="sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="recent">Más recientes</option>
            <option value="price-low">Precio: menor a mayor</option>
            <option value="price-high">Precio: mayor a menor</option>
          </select>
        </div>
      </div>

      {/* ── Contador de resultados ── */}
      <div className="results-count animate-in animate-delay-3">
        <p>
          <strong>{filteredServices.length}</strong>{" "}
          {filteredServices.length === 1
            ? "servicio encontrado"
            : "servicios encontrados"}
          {activeCategory !== "all" && (
            <span>
              {" "}
              en{" "}
              <span className="text-accent">
                {getCategoryLabel(activeCategory)}
              </span>
            </span>
          )}
        </p>
      </div>

      {/* ── Grid de Servicios ── */}
      {loading ? (
        <div className="empty-state animate-in">
          <div className="spinner"></div>
          <p>Cargando servicios...</p>
        </div>
      ) : filteredServices.length === 0 ? (
        <div className="empty-state animate-in">
          <div className="empty-state-icon">🔎</div>
          <h3>No encontramos servicios</h3>
          <p>Intenta con otra búsqueda o explora otra categoría</p>
          <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap", marginTop: "16px" }}>
            <button
              className="btn btn-secondary"
              onClick={() => {
                setSearchQuery("");
                setActiveCategory("all");
              }}
            >
              Ver todos los servicios
            </button>
            {isProfessional && (
              <button
                className="btn btn-primary"
                onClick={() => navigate("/create-service")}
              >
                Publicar mi servicio
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="explore-grid">
          {filteredServices.map((service, i) => (
            <Link
              to={`/service/${service.id}`}
              key={service.id}
              className={`explore-card animate-in animate-delay-${Math.min(i + 1, 6)}`}
            >
              {/* Etiqueta de categoría */}
              <div className="explore-card-top">
                <span className="explore-card-category">
                  {getCategoryIcon(service.category)}{" "}
                  {getCategoryLabel(service.category)}
                </span>
                {service.is_available && (
                  <span className="badge badge-success">Disponible</span>
                )}
              </div>

              {/* Contenido */}
              <h3 className="explore-card-title">{service.title}</h3>
              <p className="explore-card-desc">{service.description}</p>

              {/* Footer: profesional + precio */}
              <div className="explore-card-footer">
                <div className="explore-card-author">
                  <div className="explore-card-avatar">
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
                    <span className="explore-card-name" style={{ display: 'flex', alignItems: 'center' }}>
                      {service.professional?.full_name || "Usuario"}
                      {service.professional?.role === 'professional' && service.professional?.is_verified && (
                        <span className="verified-badge" title="Verificado">✓</span>
                      )}
                    </span>
                    <span className="explore-card-rating">
                      ⭐ Nuevo
                    </span>
                  </div>
                </div>
                <div className="explore-card-price">
                  ${service.price}
                  <span className="explore-card-price-label">/proyecto</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
