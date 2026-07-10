# GoldTrack — Setup del proyecto

## 1. Prerrequisitos (instalar globalmente)

| Herramienta | Versión | Instalación |
|---|---|---|
| **Node.js** | `v24.16.0` | `winget install OpenJS.NodeJS.LTS` |
| **pnpm** | `11.2.2` | `iwr https://get.pnpm.io/install.ps1 -useb \| iex` |
| **PostgreSQL** | `17` | `winget install PostgreSQL.PostgreSQL.17` |
| **Python** | `3.13.13` | `winget install Python.Python.3.13` |
| **Git** | `2.54.0` | `winget install Git.Git` |
| **VS Code** | `1.128.0` | `winget install Microsoft.VisualStudioCode` |
| **opencode** | `1.17.18` | `npx opencode --version` (usa npx, no instalar) |

Agregar al `PATH` (si no se agregan solos):
- `C:\Program Files\nodejs\`
- `C:\Users\<tu-user>\AppData\Local\pnpm\`
- `C:\Program Files\PostgreSQL\17\bin\`

Verificar:

```powershell
node --version
pnpm --version
psql --version
git --version
```

---

## 2. Clonar

```powershell
git clone <repo-url> refineria
cd refineria
```

---

## 3. PostgreSQL — Base de datos

```powershell
# Iniciar servicio si no corre
Start-Service postgresql-x64-17

# Crear la base de datos
psql -U postgres -c "CREATE DATABASE goldtrack;"
```

Por defecto el usuario es `postgres` con contraseña `postgres`.

---

## 4. Backend (`refineria-backend/`)

```powershell
cd refineria-backend

# Copiar env
cp .env.example .env
# Editar .env si hace falta (local no necesita cambios)

# Instalar dependencias
pnpm install

# Inicializar BD con Prisma
pnpm prisma migrate dev --name init

# (opcional) seed
pnpm prisma db seed  # si existe seed

# Iniciar en dev
pnpm start:dev
```

El backend corre en `http://localhost:4000`.

### Scripts disponibles

```json
"build":        "prisma generate && prisma migrate deploy && nest build",
"start":        "nest start",
"start:dev":    "nest start --watch",
"start:prod":   "node dist/main",
"lint":         "eslint \"{src,apps,libs,test}/**/*.ts\" --fix",
"test":         "jest",
"test:e2e":     "jest --config ./test/jest-e2e.json"
```

---

## 5. Frontend (`refineria-frontend/`)

```powershell
cd refineria-frontend

# Instalar dependencias
pnpm install

# Iniciar dev server
pnpm dev
```

El frontend corre en `http://localhost:3000`.

### Scripts disponibles

```json
"dev":    "next dev",
"build":  "next build",
"start":  "next start",
"lint":   "eslint"
```

> NOTA: El frontend es **mock-only** — toda la data viene de `services/mock/mockData.ts`. No necesita backend ni BD para funcionar.

---

## 6. Variables de entorno

### Backend — `.env`

```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/goldtrack?schema=public
JWT_SECRET=goldtrack-dev-secret-key-change-in-production
JWT_EXPIRES_IN=7d
NODE_ENV=development
PORT=4000
FRONTEND_URL=http://localhost:3000
```

### Frontend — `.env`

```
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_...
BLOB_STORE_ID=store_...
```

> El `.env` del frontend **está commiteado** (tiene tokens de Vercel Blob). No gitignored.

---

## 7. VS Code — Extensiones

Las siguientes extensiones están instaladas en el equipo original. Recomendadas:

| Extensión | ID |
|---|---|
| Prettier | `esbenp.prettier-vscode` |
| Gemini Code Assist | `google.geminicodeassist` |
| Draw.io | `hediet.vscode-drawio` |
| React TypeScript | `infeng.vscode-react-typescript` |
| TypeScript Nightly | `ms-vscode.vscode-typescript-next` |
| Material Icon Theme | `pkief.material-icon-theme` |
| Native Preview | `typescriptteam.native-preview` |
| Pretty TS Errors | `yoavbls.pretty-ts-errors` |

```powershell
code --install-extension esbenp.prettier-vscode
code --install-extension google.geminicodeassist
code --install-extension hediet.vscode-drawio
code --install-extension pkief.material-icon-theme
code --install-extension infeng.vscode-react-typescript
code --install-extension ms-vscode.vscode-typescript-next
code --install-extension typescriptteam.native-preview
code --install-extension yoavbls.pretty-ts-errors
```

---

## 8. opencode — Configuración del agente AI

El proyecto usa [opencode](https://opencode.ai) como agente de IA para desarrollo.

### Instalación del agente

Ya viene con `npx`, no requiere instalación global. La configuración del proyecto está en:

- `C:\Users\<tu-user>\.config\opencode\opencode.json`
- `C:\Users\<tu-user>\.config\opencode\AGENTS.md`
- `refineria-frontend\AGENTS.md` — instrucciones específicas del frontend

### MCP Servers configurados

```json
{
  "mcp": {
    "context7": {
      "type": "remote",
      "url": "https://mcp.context7.com/mcp",
      "headers": {
        "CONTEXT7_API_KEY": "<tu-api-key>"
      }
    },
    "codegraph": {
      "type": "local",
      "command": ["npx", "-y", "@memoryx/codegraph-mcp"]
    }
  }
}
```

> El `CONTEXT7_API_KEY` se obtiene en https://context7.com. El `codegraph` corre localmente sin API key.

---

## 9. Resumen rápido de comandos

```powershell
# Backend
cd refineria-backend
pnpm install
pnpm prisma migrate dev --name init
pnpm start:dev

# Frontend (en otra terminal)
cd refineria-frontend
pnpm install
pnpm dev

# Tests
cd refineria-backend && pnpm test
```

---

## Credenciales de prueba (mock)

| Rol | Email | Password |
|---|---|---|
| ADMIN | admin@goldtrack.com | 123 |
| OWNER | dueno@goldtrack.com | 123 |

Login en `http://localhost:3000/login`.
