import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function Home() {
  const { user } = useAuth();

  return (
    <>
      {/* ── Hero Section ── */}
      <section className="hero">
        <div className="hero-content">
          <h1 className="animate-in">
            Conecta con los{" "}
            <span className="text-gradient">mejores profesionales</span>
          </h1>
          <p className="hero-subtitle">
            Encuentra talento experto, calificado y confiable para cualquier
            proyecto. La red de servicios líder para impulsar tu éxito.
          </p>
          <div className="hero-actions">
            {user ? (
              <>
                <Link to="/dashboard" className="btn btn-primary">
                  Ir a mi perfil →
                </Link>
                <Link to="/services" className="btn btn-secondary">
                  Explorar Servicios
                </Link>
              </>
            ) : (
              <>
                <Link to="/services" className="btn btn-primary">
                  Explorar Servicios →
                </Link>
                <Link to="/login" className="btn btn-secondary">
                  Iniciar Sesión
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ── Categorías Destacadas ── */}
      <section className="section">
        <div className="section-header animate-in animate-delay-2">
          <h2>Categorías Destacadas</h2>
          <p>Explora los servicios más solicitados en nuestra plataforma</p>
        </div>

        <div className="categories-grid">
          {[
            {
              icon: "💻",
              title: "Desarrollo Web",
              desc: "Aplicaciones, sitios web y sistemas a medida",
            },
            {
              icon: "🎨",
              title: "Diseño Gráfico",
              desc: "Branding, logos e identidad visual impactante",
            },
            {
              icon: "📱",
              title: "Marketing Digital",
              desc: "Estrategias para crecer tu presencia online",
            },
            {
              icon: "✍️",
              title: "Redacción",
              desc: "Contenido persuasivo que conecta con tu audiencia",
            },
            {
              icon: "☁️",
              title: "Consultoría IT",
              desc: "Optimiza tu infraestructura tecnológica",
            },
            {
              icon: "🎧",
              title: "Soporte Técnico",
              desc: "Soluciones rápidas y mantenimiento preventivo",
            },
          ].map((cat, i) => (
            <div
              key={cat.title}
              className={`card category-card animate-in animate-delay-${i + 1}`}
            >
              <div className="category-card-icon">{cat.icon}</div>
              <h3>{cat.title}</h3>
              <p>{cat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Cómo Funciona ── */}
      <section className="section">
        <div className="section-header animate-in">
          <h2>¿Cómo funciona?</h2>
          <p>Tres pasos simples para comenzar</p>
        </div>

        <div className="features-grid">
          {[
            {
              num: "01",
              title: "Crea tu cuenta",
              desc: "Regístrate como cliente o profesional en menos de un minuto.",
            },
            {
              num: "02",
              title: "Publica o busca",
              desc: "Los profesionales publican sus servicios, los clientes exploran y eligen.",
            },
            {
              num: "03",
              title: "Conecta y crece",
              desc: "Comunícate directamente y construye relaciones de confianza.",
            },
          ].map((feat, i) => (
            <div
              key={feat.num}
              className={`card-static feature-card animate-in animate-delay-${i + 1}`}
            >
              <div className="feature-number">{feat.num}</div>
              <h3>{feat.title}</h3>
              <p>{feat.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}