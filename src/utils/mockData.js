/**
 * Datos de prueba (mock data) para demostrar la UI
 * mientras no haya datos reales en Supabase.
 *
 * Estos se eliminarán cuando la app esté en producción.
 */

export const CATEGORIES = [
  { value: "desarrollo-web", label: "Desarrollo Web", icon: "💻" },
  { value: "diseno-grafico", label: "Diseño Gráfico", icon: "🎨" },
  { value: "marketing-digital", label: "Marketing Digital", icon: "📱" },
  { value: "redaccion", label: "Redacción", icon: "✍️" },
  { value: "consultoria-it", label: "Consultoría IT", icon: "☁️" },
  { value: "soporte-tecnico", label: "Soporte Técnico", icon: "🎧" },
  { value: "educacion", label: "Educación y Tutorías", icon: "📚" },
  { value: "fotografia", label: "Fotografía y Video", icon: "📸" },
];

export const MOCK_PROFESSIONALS = [
  {
    id: "prof-001",
    full_name: "Valentina Rojas",
    avatar_initials: "VR",
    role: "professional",
    rating: 4.9,
    reviews_count: 47,
    location: "Santiago, Chile",
  },
  {
    id: "prof-002",
    full_name: "Diego Morales",
    avatar_initials: "DM",
    role: "professional",
    rating: 4.7,
    reviews_count: 32,
    location: "Buenos Aires, Argentina",
  },
  {
    id: "prof-003",
    full_name: "Camila Torres",
    avatar_initials: "CT",
    role: "professional",
    rating: 5.0,
    reviews_count: 18,
    location: "Bogotá, Colombia",
  },
  {
    id: "prof-004",
    full_name: "Andrés Castillo",
    avatar_initials: "AC",
    role: "professional",
    rating: 4.6,
    reviews_count: 55,
    location: "Lima, Perú",
  },
  {
    id: "prof-005",
    full_name: "Sofía Méndez",
    avatar_initials: "SM",
    role: "professional",
    rating: 4.8,
    reviews_count: 23,
    location: "CDMX, México",
  },
  {
    id: "prof-006",
    full_name: "Mateo Herrera",
    avatar_initials: "MH",
    role: "professional",
    rating: 4.5,
    reviews_count: 61,
    location: "Medellín, Colombia",
  },
];

export const MOCK_SERVICES = [
  {
    id: "svc-001",
    title: "Desarrollo de Aplicaciones Web con React",
    description:
      "Creo aplicaciones web modernas, rápidas y escalables usando React, Next.js y Tailwind CSS. Incluye diseño responsive, integración con APIs y despliegue en producción.",
    price: 450,
    category: "desarrollo-web",
    is_available: true,
    professional: MOCK_PROFESSIONALS[0],
    created_at: "2026-04-15",
  },
  {
    id: "svc-002",
    title: "Diseño de Identidad de Marca Completa",
    description:
      "Diseño tu logo, paleta de colores, tipografías y manual de marca. Te entrego archivos en alta resolución listos para imprenta y digital.",
    price: 280,
    category: "diseno-grafico",
    is_available: true,
    professional: MOCK_PROFESSIONALS[1],
    created_at: "2026-04-10",
  },
  {
    id: "svc-003",
    title: "Gestión de Redes Sociales (Instagram + TikTok)",
    description:
      "Manejo profesional de tus redes: calendario editorial, creación de contenido, stories y reels. Reportes mensuales de métricas y crecimiento.",
    price: 350,
    category: "marketing-digital",
    is_available: true,
    professional: MOCK_PROFESSIONALS[2],
    created_at: "2026-04-12",
  },
  {
    id: "svc-004",
    title: "Redacción SEO para Blogs y Sitios Web",
    description:
      "Contenido optimizado para motores de búsqueda que posiciona tu sitio en Google. Artículos de 1000+ palabras con investigación de keywords.",
    price: 75,
    category: "redaccion",
    is_available: true,
    professional: MOCK_PROFESSIONALS[3],
    created_at: "2026-04-18",
  },
  {
    id: "svc-005",
    title: "Migración a la Nube (AWS / Google Cloud)",
    description:
      "Te ayudo a migrar tu infraestructura a la nube de forma segura. Configuración de servidores, bases de datos, CI/CD y monitoreo.",
    price: 600,
    category: "consultoria-it",
    is_available: true,
    professional: MOCK_PROFESSIONALS[4],
    created_at: "2026-04-20",
  },
  {
    id: "svc-006",
    title: "Soporte Técnico Remoto para PyMEs",
    description:
      "Resuelvo problemas de hardware, software y redes de forma remota. Incluye mantenimiento preventivo y backups automáticos para tu empresa.",
    price: 120,
    category: "soporte-tecnico",
    is_available: true,
    professional: MOCK_PROFESSIONALS[5],
    created_at: "2026-04-08",
  },
  {
    id: "svc-007",
    title: "Clases de Programación (JavaScript / Python)",
    description:
      "Clases personalizadas 1:1 adaptadas a tu ritmo. Desde cero hasta nivel intermedio. Proyectos prácticos, ejercicios y acompañamiento por chat.",
    price: 40,
    category: "educacion",
    is_available: true,
    professional: MOCK_PROFESSIONALS[0],
    created_at: "2026-04-22",
  },
  {
    id: "svc-008",
    title: "Fotografía Profesional de Producto",
    description:
      "Sesión fotográfica para tus productos con iluminación de estudio. Edición profesional, fondos blancos y lifestyle. Ideal para e-commerce.",
    price: 200,
    category: "fotografia",
    is_available: true,
    professional: MOCK_PROFESSIONALS[1],
    created_at: "2026-04-25",
  },
  {
    id: "svc-009",
    title: "Landing Page de Alta Conversión",
    description:
      "Diseño y desarrollo de landing pages que convierten visitantes en clientes. A/B testing, copywriting persuasivo y analytics integrados.",
    price: 320,
    category: "desarrollo-web",
    is_available: true,
    professional: MOCK_PROFESSIONALS[4],
    created_at: "2026-04-27",
  },
  {
    id: "svc-010",
    title: "Edición de Video para YouTube",
    description:
      "Edición profesional de videos: cortes, transiciones, motion graphics, subtítulos y color grading. Entrega en 48 horas.",
    price: 150,
    category: "fotografia",
    is_available: true,
    professional: MOCK_PROFESSIONALS[2],
    created_at: "2026-04-26",
  },
  {
    id: "svc-011",
    title: "Campañas de Email Marketing",
    description:
      "Diseño de estrategia de email marketing completa: secuencias automatizadas, newsletters, segmentación de audiencia y análisis de métricas.",
    price: 180,
    category: "marketing-digital",
    is_available: true,
    professional: MOCK_PROFESSIONALS[3],
    created_at: "2026-04-19",
  },
  {
    id: "svc-012",
    title: "Diseño UI/UX para Aplicaciones Móviles",
    description:
      "Diseño la interfaz y experiencia de usuario de tu app. Wireframes, prototipos interactivos en Figma, design system y handoff para desarrollo.",
    price: 500,
    category: "diseno-grafico",
    is_available: true,
    professional: MOCK_PROFESSIONALS[5],
    created_at: "2026-04-28",
  },
];
