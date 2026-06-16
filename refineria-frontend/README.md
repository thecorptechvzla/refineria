# GoldTrack — Gestión de Refinería de Oro

Frontend del sistema de gestión operativa para refinería de oro. Construido con **Next.js 16**, **React 19**, **TanStack Query** y **Tailwind CSS v4**.

Consume una API REST NestJS + PostgreSQL. Ver [`refineria-backend/`](https://github.com/your-org/goldtrack) para el backend.

---

## Stack

| Herramienta | Versión |
|-------------|---------|
| Next.js | 16.2.6 |
| React | 19.2.4 |
| TanStack Query | ^5 |
| TypeScript | ^5 |
| Tailwind CSS | ^4 |
| Recharts | ^3 |
| Lucide React | ^1 |

## Prerrequisitos

- Node.js ≥ 24
- PostgreSQL 17+ con base de datos `goldtrack`
- Backend NestJS corriendo en `http://localhost:4000`

## Variables de entorno

| Variable | Defecto | Descripción |
|----------|---------|-------------|
| `NEXT_PUBLIC_API_URL` | `http://localhost:4000` | URL del backend |

## Inicio rápido

```bash
pnpm install
pnpm dev
```

Abrir [http://localhost:3000](http://localhost:3000). El backend debe estar corriendo.

### Credenciales de prueba

| Rol | Email | Contraseña |
|-----|-------|------------|
| Admin | admin@goldtrack.com | 123 |
| Dueño | dueno@goldtrack.com | 123 |

## Scripts

| Comando | Descripción |
|---------|-------------|
| `pnpm dev` | Entorno de desarrollo |
| `pnpm build` | Build de producción |
| `pnpm start` | Servir build de producción |
| `pnpm lint` | ESLint |

## Funcionalidades

- **Dashboard Ejecutivo** — KPIs (ingresos/egresos/balance), métricas de colaboradores, gráfico de volumen por proveedor (Recharts), feed de últimas transacciones.
- **Registro de Operaciones** — Formulario de ingreso/egreso con cálculo automático de peso fino, historial desde la API.
- **Directorio de Proveedores** — Registro y listado de empresas proveedoras vía API.

## Arquitectura

```
GoldContext (auth) → TanStack Query (datos) → lib/api.ts (fetch) → Backend API
```

- **GoldContext**: Estado de autenticación (usuario activo, vía `/auth/profile`).
- **TanStack Query**: Cache y estado del servidor (transacciones, proveedores, trabajadores).
- **lib/api.ts**: Cliente HTTP con `credentials: 'include'` para cookies JWT.

## Estructura del proyecto

```
app/
  (dashboard)/       # Layout protegido con sidebar y header
    page.tsx         # Dashboard del Super Admin
    transacciones/   # Panel del Admin (registro + historial)
    proveedores/     # Directorio de proveedores
  login/             # Página de inicio de sesión
  providers.tsx      # QueryClientProvider
components/
  layout/            # Sidebar, Header
lib/
  api.ts             # Cliente HTTP (fetch con cookie)
  GoldContext.tsx     # Contexto de autenticación
  hooks/             # TanStack Query hooks
    useAuth.ts
    useSuppliers.ts
    useTransactions.ts
    useWorkers.ts
  utils.ts           # Formato y cálculo
  ThemeContext.tsx    # Contexto de tema (dark/light)
services/
  mock/              # Datos mock (legado, no usado)
types/
  index.ts           # Interfaces TypeScript
```

## Autenticación

- Login via `POST /auth/login` → backend setea cookie `goldtrack_session` (JWT httpOnly).
- El middleware `middleware.ts` decodifica el JWT para redirección por rol (SUPERADMIN/OWNER/ADMIN).
- Token también puede enviarse vía header `Authorization: Bearer <token>`.
