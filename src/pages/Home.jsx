import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function Home() {
  const { user } = useAuth();

  return (
    <>
      {/* ── Hero Section ── */}
      <section className="hero">
        <div className="hero-content">
          <div
            className="badge badge-accent animate-in"
            style={{ marginBottom: "var(--space-md)" }}
          >
            NUEVA PLATAFORMA 2026
          </div>
          <h1
            className="animate-in"
            style={{ fontWeight: 900, textTransform: "uppercase" }}
          >
            Domina el <span className="text-gradient">Mercado Digital</span> con
            SkillConnect
          </h1>
          <p className="hero-subtitle">
            La plataforma definitiva donde el talento excepcional se encuentra
            con oportunidades ilimitadas. Eleva tus proyectos con profesionales
            de élite.
          </p>
          <div className="hero-actions">
            {user ? (
              <>
                <Link to="/services" className="btn btn-primary btn-lg-glow">
                  Explorar Talentos
                </Link>
                <Link to="/dashboard" className="btn btn-secondary">
                  Mi Panel de Control
                </Link>
              </>
            ) : (
              <>
                <Link to="/services" className="btn btn-primary btn-lg-glow">
                  Explorar Talentos
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
