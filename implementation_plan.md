# SkillConnect — Plan de Implementación

## Descripción General

SkillConnect es un marketplace de servicios que conecta **clientes** (quienes necesitan ayuda) con **profesionales** (quienes ofrecen servicios). El MVP se construirá con **React.js** en el frontend y **Supabase** como backend (base de datos, autenticación y API).

El objetivo es aprender construyendo, por lo que iremos **fase por fase**, con explicaciones antes de cada bloque de código.

---

## 🗺️ Hoja de Ruta: Las 5 Fases

```
Fase 1 → Fundamentos y Setup
Fase 2 → Autenticación y Roles
Fase 3 → Gestión de Perfiles y Servicios
Fase 4 → Sistema de Matching (Recomendación)
Fase 5 → Sistema de Reputación y Calificaciones
```

---

## Fase 1 — Fundamentos y Setup del Proyecto

**¿Qué vamos a aprender?**
- Estructura de un proyecto React profesional
- Qué es Supabase y cómo conectarlo a React
- Variables de entorno y seguridad

### Pasos:
1. Crear el proyecto con Vite + React
2. Instalar dependencias clave:
   - `@supabase/supabase-js` — cliente de Supabase
   - `react-router-dom` — navegación entre páginas
3. Crear proyecto en Supabase (consola web)
4. Configurar variables de entorno (`.env`)
5. Estructurar carpetas del proyecto

### Estructura de carpetas que construiremos:
```
skillconnect/
├── public/
├── src/
│   ├── assets/           # Imágenes, íconos
│   ├── components/       # Componentes reutilizables (Navbar, Button, etc.)
│   ├── pages/            # Vistas completas (Home, Login, Dashboard...)
│   ├── services/         # Lógica de comunicación con Supabase
│   ├── hooks/            # Custom hooks de React
│   ├── context/          # Estado global (AuthContext)
│   ├── utils/            # Funciones auxiliares
│   └── main.jsx          # Punto de entrada
├── .env                  # Variables secretas (NO se sube a GitHub)
├── .gitignore
└── package.json
```

---

## Fase 2 — Autenticación y Roles de Usuario

**¿Qué vamos a aprender?**
- Autenticación con Supabase Auth (email/password)
- Context API de React para estado global
- Rutas protegidas (solo usuarios autenticados acceden)
- Diferenciación de roles: `cliente` vs `profesional`

### Tablas en Supabase:
```sql
-- Tabla de perfiles (extiende el usuario de Supabase Auth)
profiles (
  id          uuid PRIMARY KEY,  -- mismo id que auth.users
  full_name   text,
  role        text,              -- 'client' | 'professional'
  avatar_url  text,
  created_at  timestamp
)
```

### Páginas a crear:
- `/login` — Formulario de inicio de sesión
- `/register` — Formulario de registro con selección de rol
- `/` — Landing page pública

---

## Fase 3 — Perfiles, Servicios y Solicitudes

**¿Qué vamos a aprender?**
- CRUD completo con Supabase
- Subida de archivos (avatares) con Supabase Storage
- Formularios controlados en React

### Tablas en Supabase:
```sql
-- Servicios que ofrecen los profesionales
services (
  id              uuid PRIMARY KEY,
  professional_id uuid REFERENCES profiles(id),
  title           text,
  description     text,
  category        text,
  price_range     text,
  is_available    boolean
)

-- Solicitudes que hacen los clientes
requests (
  id              uuid PRIMARY KEY,
  client_id       uuid REFERENCES profiles(id),
  title           text,
  description     text,
  category        text,
  status          text,   -- 'pending' | 'in_progress' | 'completed'
  created_at      timestamp
)
```

### Páginas a crear:
- `/dashboard/client` — Panel del cliente
- `/dashboard/professional` — Panel del profesional
- `/services` — Explorar servicios disponibles
- `/profile/:id` — Ver perfil de un profesional

---

## Fase 4 — Sistema de Matching (Recomendación)

**¿Qué vamos a aprender?**
- Lógica de negocio en JavaScript
- Queries avanzadas en Supabase
- Algoritmos de scoring simple

### Lógica de Matching:
El sistema calculará un **score** para cada profesional, basándose en:

| Variable | Peso |
|---|---|
| Habilidades coincidentes | 40% |
| Calificación promedio (rating) | 30% |
| Disponibilidad activa | 20% |
| Experiencia (nº de trabajos) | 10% |

La fórmula es sencilla pero efectiva para el MVP.

---

## Fase 5 — Sistema de Reputación y Calificaciones

**¿Qué vamos a aprender?**
- Relaciones entre tablas en SQL
- Triggers en Supabase (actualizar promedio automáticamente)
- UI de estrellas en React

### Tabla en Supabase:
```sql
reviews (
  id              uuid PRIMARY KEY,
  request_id      uuid REFERENCES requests(id),
  client_id       uuid REFERENCES profiles(id),
  professional_id uuid REFERENCES profiles(id),
  rating          int,  -- 1 a 5
  comment         text,
  created_at      timestamp
)
```

---

## 🛠️ Stack Tecnológico

| Capa | Tecnología | Por qué |
|---|---|---|
| Frontend | React + Vite | Rápido, moderno, componentes |
| Routing | React Router v6 | Estándar en React |
| Backend/DB | Supabase | PostgreSQL + Auth + Storage en uno |
| Estilos | CSS Modules / Vanilla CSS | Sin magia, aprenderás a fondo |
| Control de versiones | Git + GitHub | Flujo profesional |

---

## ✅ Por dónde empezamos

**La próxima sesión arrancará con la Fase 1:**
1. Crear el proyecto React con Vite
2. Explicar cada archivo que genera (qué es `main.jsx`, qué es `vite.config.js`, etc.)
3. Crear el proyecto en Supabase
4. Conectar ambos

> [!IMPORTANT]
> El objetivo es que TÚ escribas cada línea de código. Yo te explicaré el "qué" y el "por qué" antes de pedirte que escribas. Nunca avanzaremos al siguiente paso sin que el anterior esté claro y funcionando.

> [!TIP]
> Antes de empezar, asegúrate de tener instalado: **Node.js** (versión 18 o superior) y **Git**. Puedes verificarlo con `node -v` y `git -v` en tu terminal.
