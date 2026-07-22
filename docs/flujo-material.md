# Flujo de Material — ControlMining

## Ciclo de vida completo

```
INGRESO (barras)  ──→  PROCESOS (asignar a lotes, fundir, recuperar)  ──→  SALIDA (egresar)
/ingreso               /procesos                                             /transacciones
                                                                            
Barra registrada       Barra asignada a lote                                Transaction(type: OUT)
Transaction(type: IN)  Barra.available = false                              lot.egresadoG = recovered
Barra.available = true Process cerrado
                       Transaction(type: IN)
```

---

### 1. Ingreso de Material (`/ingreso`)

Registro de barras de oro en el sistema.

| Modo | Descripción |
|---|---|
| **Individual** | Formulario: Cliente, Código, Peso Bruto, LEY Au, LEY Ag (opcional). Auto-cálculo de FA, FE, Peso Fino Ag. |
| **Carga Masiva** | Subida de Excel (.xlsx/.xls/.csv) con columnas: CÓDIGO, PESO BRUTO, LEY Au, PESO FINO Au, LOTE N°. |

**Endpoint:** `POST /api/gold-bars` + `POST /api/transactions { type: 'IN' }`

**Modelo:**

```prisma
model GoldBar {
  code             String    // Código único por proveedor
  supplierId       String    // FK → Supplier
  grossWeight      Float     // Peso bruto (g)
  ley              Float?    // LEY Au (‰)
  analytical       Float     // FA = grossWeight × ley / 1000
  expected         Float     // FE = analytical × 0.99
  recovered        Float     // Peso recuperado (se llena en proceso)
  leyAg            Float?    // LEY Ag (‰)
  analyticalAg     Float?    // Peso Fino Ag
  available        Boolean   // true = disponible para asignar
}
```

---

### 2. Procesos (`/procesos`)

Configuración de lotes de fundición y refinación.

1. **Crear proceso** para un proveedor (`POST /api/processes`)
2. **Asignar barras disponibles** a lotes dentro del proceso (`POST /api/processes/:id/lots`)
   - Barra pasa a `available: false`
3. **Registrar peso recuperado** por lote tras fundición (`PATCH /api/processes/:id/lots/:lotId`)
4. **Registrar LEY Ag** por barra en el lote
5. **Cerrar proceso** (opcional: subir actas de recepción, fundición y conformidad)

---

### 3. Salida de Material (`/transacciones`)

Egreso de oro refinado a clientes.

1. **Seleccionar cliente** → muestra procesos cerrados con sus lotes
2. Cada lote muestra: **Recuperado (R)** – **Egresado** – **Disponible** (R - egresadoG)
3. **Seleccionar lotes** a egresar
4. **Confirmar salida** → `POST /api/transactions { type: 'OUT', lotId }`
   - Lote se marca como egresado (`egresadoG = recovered`)
   - Solo lotes de procesos cerrados pueden egresarse
   - El egreso es todo o nada

---

### Resumen de estados de una barra

| Estado | `available` | Descripción |
|---|---|---|
| **DISPONIBLE** | `true` | Registrada, no asignada a ningún lote de proceso |
| **EN LOTE** | `false` | Asignada a un lote dentro de un proceso abierto/en_progreso |
| **RECUPERADA** | `false` | Proceso cerrado, peso recuperado registrado |
| **EGRESADA** | `false` | El lote fue egresado (egresadoG = recovered), salió del sistema |
