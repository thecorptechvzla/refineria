# GoldTrack — Backend API

API REST para el sistema de gestión de refinería de oro. Construido con **NestJS 11**, **Prisma 7** y **PostgreSQL 17**.

## Stack

| Herramienta | Versión |
|-------------|---------|
| NestJS | ^11 |
| Prisma | ^7 |
| PostgreSQL | 17 |
| TypeScript | ^5 |
| Passport (JWT) | ^2 |

## Prerrequisitos

- Node.js ≥ 24
- PostgreSQL 17+ corriendo
- Base de datos `goldtrack` creada

## Variables de entorno

| Variable | Defecto | Descripción |
|----------|---------|-------------|
| `DATABASE_URL` | `postgresql://postgres:postgres@localhost:5432/goldtrack?schema=public` | Conexión PostgreSQL |
| `JWT_SECRET` | — | Secreto para firmar JWT |
| `PORT` | `4000` | Puerto del servidor |

## Inicio rápido

```bash
# 1. Instalar dependencias
pnpm install

# 2. Crear la base de datos
psql -U postgres -c "CREATE DATABASE goldtrack;"

# 3. Ejecutar migraciones
npx prisma migrate dev

# 4. Sembrar datos de prueba
npx tsx prisma/seed.ts

# 5. Iniciar servidor
pnpm start:dev
```

Servidor en [http://localhost:4000](http://localhost:4000).

### Credenciales de prueba (seed)

| Rol | Email | Contraseña |
|-----|-------|------------|
| Admin | admin@goldtrack.com | 123 |
| Dueño | dueno@goldtrack.com | 123 |

## Scripts

| Comando | Descripción |
|---------|-------------|
| `pnpm start` | Producción (`node dist/src/main.js`) |
| `pnpm start:dev` | Desarrollo (hot-reload) |
| `pnpm build` | Compilar TypeScript |
| `pnpm lint` | ESLint |
| `npx prisma migrate dev` | Ejecutar migraciones |
| `npx prisma studio` | Interfaz gráfica de datos |
| `npx tsx prisma/seed.ts` | Sembrar datos de prueba |

## Modelos de datos

### User

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | UUID (PK) | |
| name | String | Nombre completo |
| email | String (único) | Correo electrónico |
| password | String | Hash bcrypt |
| role | Enum (ADMIN, SUPERADMIN) | Rol de acceso |
| createdAt | DateTime | |
| updatedAt | DateTime | |

### Supplier

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | UUID (PK) | |
| name | String | Nombre de empresa |
| contactInfo | String | Teléfono, email, dirección |
| registrationDate | DateTime | Fecha de registro |
| createdAt | DateTime | |
| updatedAt | DateTime | |

### Transaction

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | UUID (PK) | |
| type | Enum (IN, OUT) | Ingreso o egreso |
| weight | Float | Peso bruto |
| weightUnit | Enum (g, kg) | Unidad de peso |
| purity | Float | Pureza (0-1) |
| supplierId | UUID? | Proveedor (FK) |
| date | DateTime | Fecha de operación |
| userId | UUID? | Usuario que registró (FK) |
| createdAt | DateTime | |
| updatedAt | DateTime | |

### Worker

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | UUID (PK) | |
| name | String | Nombre completo |
| position | String | Cargo |
| status | Enum (active, inactive) | Estado laboral |
| startDate | DateTime | Fecha de ingreso |
| createdAt | DateTime | |
| updatedAt | DateTime | |

## API Endpoints

### Auth

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/auth/register` | — | Registrar usuario |
| POST | `/auth/login` | — | Iniciar sesión (setea cookie) |
| GET | `/auth/profile` | JWT | Obtener usuario actual |

### Users (solo SUPERADMIN)

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/users` | Listar usuarios |
| GET | `/users/:id` | Obtener usuario |
| PATCH | `/users/:id` | Actualizar usuario |
| DELETE | `/users/:id` | Eliminar usuario |

### Suppliers

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/suppliers` | JWT | Listar proveedores |
| POST | `/suppliers` | JWT | Crear proveedor |
| GET | `/suppliers/:id` | JWT | Obtener proveedor |
| PATCH | `/suppliers/:id` | JWT | Actualizar proveedor |
| DELETE | `/suppliers/:id` | SUPERADMIN | Eliminar proveedor |

### Transactions

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/transactions` | JWT | Listar (paginado, filtros) |
| POST | `/transactions` | JWT | Crear transacción |
| GET | `/transactions/metrics` | JWT | Métricas del dashboard |
| GET | `/transactions/:id` | JWT | Obtener transacción |
| DELETE | `/transactions/:id` | JWT | Eliminar transacción |

### Workers

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/workers` | JWT | Listar trabajadores |
| POST | `/workers` | JWT | Crear trabajador |
| GET | `/workers/:id` | JWT | Obtener trabajador |
| PATCH | `/workers/:id` | JWT | Actualizar trabajador |
| DELETE | `/workers/:id` | SUPERADMIN | Eliminar trabajador |

## Autenticación

- **Login**: `POST /auth/login` devuelve `{ token, user }` y setea cookie `goldtrack_session` (httpOnly, SameSite=Lax, 7 días).
- **Autorización**: Enviar JWT vía cookie `goldtrack_session` o header `Authorization: Bearer <token>`.
- **RBAC**: Decorador `@Roles('SUPERADMIN')` en endpoints protegidos.

## Estructura del proyecto

```
prisma/
  schema.prisma      # Esquema de datos
  seed.ts            # Seed de prueba
src/
  auth/              # Módulo de autenticación (JWT)
  common/            # Guards, decoradores, filtros
  prisma/            # PrismaService (adaptador PostgreSQL)
  suppliers/         # CRUD proveedores
  transactions/      # CRUD transacciones + métricas
  users/             # CRUD usuarios
  workers/           # CRUD trabajadores
  main.ts            # Entry point
  app.module.ts      # Módulo raíz
generated/prisma/    # Cliente Prisma generado
```
