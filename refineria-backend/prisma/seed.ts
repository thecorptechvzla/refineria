import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client';
import bcrypt from 'bcrypt';

const connectionString = process.env['DATABASE_URL'] || 'postgresql://postgres:postgres@localhost:5432/goldtrack?schema=public';
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

// #refineria

async function main() {
  console.log('Seeding database....');

  const hashedPassword = await bcrypt.hash('TheCorpAdmin*', 10);
  const hashedPassword1 = await bcrypt.hash('JuanDavila*', 10);
  const hashedPassword2 = await bcrypt.hash('AngelEspinosa*', 10);
  const hashedPassword3 = await bcrypt.hash('RodrigoRojas*', 10);
  const hashedPassword4 = await bcrypt.hash('TheCorpAdmin1*', 10);

  const superadminCorp = await prisma.user.upsert({
    where: { email: 'thecorptech@goldtrack.com' },
    update: {}, // solo le agregue eso que bolas de castor marico
    create: {
      name: 'The Corp Tech',
      email: 'thecorptech@goldtrack.com',
      password: hashedPassword,
      role: 'SUPERADMIN',
    },
  }); //test

  const superadmin = await prisma.user.upsert({
    where: { email: 'juandavila@goldtrack.com' },
    update: { password: hashedPassword1, role: 'OWNER' },
    create: {
      name: 'Juan Davila',
      email: 'juandavila@goldtrack.com',
      password: hashedPassword1,
      role: 'OWNER',
    },
  });

  const admin = await prisma.user.upsert({
    where: { email: 'angelespinosa@goldtrack.com' },
    update: { password: hashedPassword2 },
    create: {
      name: 'Angel Espinosa',
      email: 'angelespinosa@goldtrack.com',
      password: hashedPassword2,
      role: 'ADMIN',
    },
  });

  const admin1 = await prisma.user.upsert({
    where: { email: 'rodrigorojas@goldtrack.com' },
    update: { password: hashedPassword3 },
    create: {
      name: 'Rodrigo Rojas',
      email: 'rodrigorojas@goldtrack.com',
      password: hashedPassword3,
      role: 'ADMIN',
    },
  });

  const owner2 = await prisma.user.upsert({
    where: { email: 'thecorptech1@goldtrack.com' },
    update: {},
    create: {
      name: 'The Corp Tech',
      email: 'thecorptech1@goldtrack.com',
      password: hashedPassword4,
      role: 'OWNER',
    },
  });

  const hashed123 = await bcrypt.hash('123', 10);

  const adminSetup = await prisma.user.upsert({
    where: { email: 'admin@goldtrack.com' },
    update: {},
    create: {
      name: 'Admin GoldTrack',
      email: 'admin@goldtrack.com',
      password: hashed123,
      role: 'ADMIN',
    },
  });

  const ownerSetup = await prisma.user.upsert({
    where: { email: 'dueno@goldtrack.com' },
    update: {},
    create: {
      name: 'Dueño GoldTrack',
      email: 'dueno@goldtrack.com',
      password: hashed123,
      role: 'OWNER',
    },
  });

  console.log('Users created:', superadminCorp.email, superadmin.email, admin.email, admin1.email, owner2.email, adminSetup.email, ownerSetup.email);

  // const suppliers = await Promise.all([
  //   prisma.supplier.create({ data: { name: 'Minera Los Andes SAC', rif: 'J-12345678-9', contactInfo: 'contacto@losandes.pe | +51 987 654 321', registrationDate: new Date('2023-01-15T10:00:00Z') } }),
  //   prisma.supplier.create({ data: { name: 'Cooperativa Aurífera del Sur', rif: 'J-23456789-0', contactInfo: 'ventas@coopaurifera.com | +51 976 543 210', registrationDate: new Date('2023-03-22T14:30:00Z') } }),
  //   prisma.supplier.create({ data: { name: 'Corporación Minera Dorado', rif: 'J-34567890-1', contactInfo: 'info@doradocorp.pe | +51 965 432 109', registrationDate: new Date('2023-06-10T09:00:00Z') } }),
  //   prisma.supplier.create({ data: { name: 'Inversiones El Dorado EIRL', rif: 'J-45678901-2', contactInfo: 'operaciones@eldorado.pe | +51 954 321 098', registrationDate: new Date('2023-08-05T11:45:00Z') } }),
  //   prisma.supplier.create({ data: { name: 'Compañía Minera del Centro', rif: 'J-56789012-3', contactInfo: 'logistica@cmcentro.pe | +51 943 210 987', registrationDate: new Date('2024-01-20T08:30:00Z') } }),
  //   prisma.supplier.create({ data: { name: 'Sociedad Minera Río Seco', rif: 'J-67890123-4', contactInfo: 'admin@rioseco.pe | +51 932 109 876', registrationDate: new Date('2024-04-12T16:00:00Z') } }),
  // ]);

  // console.log('Suppliers created:', suppliers.length);

  // const txData = [
  //   { type: 'IN' as const, weight: 3.5, weightUnit: 'kg' as const, purity: 0.95, supplierId: suppliers[0].id, date: new Date('2024-01-08T09:15:00Z') },
  //   { type: 'IN' as const, weight: 1.2, weightUnit: 'kg' as const, purity: 0.92, supplierId: suppliers[1].id, date: new Date('2024-01-15T14:30:00Z') },
  //   { type: 'OUT' as const, weight: 2.0, weightUnit: 'kg' as const, purity: 0.99, supplierId: suppliers[0].id, date: new Date('2024-02-01T11:00:00Z') },
  //   { type: 'IN' as const, weight: 850, weightUnit: 'g' as const, purity: 0.88, supplierId: suppliers[2].id, date: new Date('2024-02-18T10:45:00Z') },
  //   { type: 'IN' as const, weight: 2.8, weightUnit: 'kg' as const, purity: 0.94, supplierId: suppliers[3].id, date: new Date('2024-03-05T08:20:00Z') },
  //   { type: 'IN' as const, weight: 1.5, weightUnit: 'kg' as const, purity: 0.91, supplierId: suppliers[0].id, date: new Date('2024-03-22T16:10:00Z') },
  //   { type: 'OUT' as const, weight: 1.0, weightUnit: 'kg' as const, purity: 0.99, supplierId: suppliers[1].id, date: new Date('2024-04-10T09:30:00Z') },
  //   { type: 'IN' as const, weight: 620, weightUnit: 'g' as const, purity: 0.85, supplierId: suppliers[4].id, date: new Date('2024-04-28T13:15:00Z') },
  //   { type: 'IN' as const, weight: 4.2, weightUnit: 'kg' as const, purity: 0.96, supplierId: suppliers[2].id, date: new Date('2024-05-14T11:00:00Z') },
  //   { type: 'OUT' as const, weight: 3.0, weightUnit: 'kg' as const, purity: 0.99, supplierId: suppliers[3].id, date: new Date('2024-06-01T15:45:00Z') },
  //   { type: 'IN' as const, weight: 1.8, weightUnit: 'kg' as const, purity: 0.93, supplierId: suppliers[5].id, date: new Date('2024-06-20T08:30:00Z') },
  //   { type: 'IN' as const, weight: 950, weightUnit: 'g' as const, purity: 0.89, supplierId: suppliers[1].id, date: new Date('2024-07-08T10:00:00Z') },
  //   { type: 'IN' as const, weight: 2.3, weightUnit: 'kg' as const, purity: 0.94, supplierId: suppliers[0].id, date: new Date('2024-07-25T14:20:00Z') },
  //   { type: 'OUT' as const, weight: 1.5, weightUnit: 'kg' as const, purity: 0.99, supplierId: suppliers[4].id, date: new Date('2024-08-12T09:00:00Z') },
  //   { type: 'IN' as const, weight: 3.0, weightUnit: 'kg' as const, purity: 0.97, supplierId: suppliers[3].id, date: new Date('2024-09-03T11:30:00Z') },
  //   { type: 'IN' as const, weight: 1.1, weightUnit: 'kg' as const, purity: 0.90, supplierId: suppliers[2].id, date: new Date('2024-09-21T16:00:00Z') },
  //   { type: 'IN' as const, weight: 2.0, weightUnit: 'kg' as const, purity: 0.95, supplierId: suppliers[5].id, date: new Date('2025-01-10T08:45:00Z') },
  //   { type: 'OUT' as const, weight: 4.0, weightUnit: 'kg' as const, purity: 0.99, supplierId: suppliers[0].id, date: new Date('2025-02-20T10:30:00Z') },
  //   { type: 'IN' as const, weight: 1.4, weightUnit: 'kg' as const, purity: 0.92, supplierId: suppliers[4].id, date: new Date('2025-03-15T09:15:00Z') },
  //   { type: 'IN' as const, weight: 750, weightUnit: 'g' as const, purity: 0.87, supplierId: suppliers[1].id, date: new Date('2025-04-02T14:00:00Z') },
  // ];

  // const transactions = await Promise.all(
  //   txData.map((data) => prisma.transaction.create({ data })),
  // );

  // console.log('Transactions created:', transactions.length);

  // const workers = await Promise.all([
  //   prisma.worker.create({ data: { name: 'Roberto Huamán', position: 'Fundidor', status: 'active', startDate: new Date('2022-06-01T08:00:00Z') } }),
  //   prisma.worker.create({ data: { name: 'María Quispe', position: 'Analista de Calidad', status: 'active', startDate: new Date('2022-09-15T08:00:00Z') } }),
  //   prisma.worker.create({ data: { name: 'Juan Paredes', position: 'Operador de Báscula', status: 'active', startDate: new Date('2023-01-10T08:00:00Z') } }),
  //   prisma.worker.create({ data: { name: 'Lucía Fernández', position: 'Asistente Administrativa', status: 'active', startDate: new Date('2023-04-20T08:00:00Z') } }),
  //   prisma.worker.create({ data: { name: 'Carlos Gutiérrez', position: 'Jefe de Planta', status: 'active', startDate: new Date('2022-03-01T08:00:00Z') } }),
  //   prisma.worker.create({ data: { name: 'Ana Condori', position: 'Laboratorista', status: 'active', startDate: new Date('2023-08-05T08:00:00Z') } }),
  //   prisma.worker.create({ data: { name: 'Pedro Castillo', position: 'Chofer', status: 'inactive', startDate: new Date('2022-11-01T08:00:00Z') } }),
  //   prisma.worker.create({ data: { name: 'Sofía Mamani', position: 'Auxiliar de Oficina', status: 'inactive', startDate: new Date('2023-02-15T08:00:00Z') } }),
  // ]);

  // ─── Insumos Críticos (Químicos) ───
  const chemicals = [
    { code: 'CR001', name: 'Ácido Clorhídrico', unit: 'Lts', criticalLevel: 860, criticalType: 'QUIMICO' as const },
    { code: 'CR002', name: 'Ácido Nítrico', unit: 'Lts', criticalLevel: 500, criticalType: 'QUIMICO' as const },
    { code: 'CR003', name: 'Metabisulfito', unit: 'kg', criticalLevel: 300, criticalType: 'QUIMICO' as const },
    { code: 'CR004', name: 'Urea', unit: 'kg', criticalLevel: 600, criticalType: 'QUIMICO' as const },
    { code: 'CR005', name: 'Soda Caustica (Lts)', unit: 'Lts', criticalLevel: 120, criticalType: 'QUIMICO' as const },
    { code: 'CR006', name: 'Soda Caustica (Kg)', unit: 'Kg', criticalLevel: 250, criticalType: 'QUIMICO' as const },
    { code: 'CR007', name: 'Amoniaco', unit: 'Lts', criticalLevel: 500, criticalType: 'QUIMICO' as const },
    { code: 'CR008', name: 'Alcohol Etilico', unit: 'Lts', criticalLevel: 40, criticalType: 'QUIMICO' as const },
  ];

  const created = [];
  for (const chem of chemicals) {
    const item = await prisma.supplyItem.upsert({
      where: { code: chem.code },
      update: {
        name: chem.name,
        unit: chem.unit,
        criticalLevel: chem.criticalLevel,
        criticalType: chem.criticalType,
        category: 'CRITICAL',
      },
      create: {
        code: chem.code,
        name: chem.name,
        category: 'CRITICAL',
        unit: chem.unit,
        currentStock: 0,
        criticalLevel: chem.criticalLevel,
        isCritical: true,
        criticalType: chem.criticalType,
      },
    });
    created.push(item.code);
  }
  console.log('Supply items created:', created.join(', '));

  await prisma.supplyItem.upsert({
    where: { code: 'FUEL01' },
    update: {},
    create: {
      code: 'FUEL01',
      name: 'GASOIL',
      category: 'CRITICAL',
      unit: 'Lts',
      currentStock: 0,
      criticalLevel: 1000,
      isCritical: true,
      criticalType: 'COMBUSTIBLE',
    },
  });
  console.log('Combustible item created: FUEL01 GASOIL');

  /* ─── Insumos de almacén (Almacén Padre de la Patria) ─── */
  const warehouseItems: Array<{
    code: string; name: string; category: 'GENERAL_SERVICES' | 'OPERATIONS';
    unit: string; currentStock: number; criticalLevel: number;
    transactions: Array<{ type: 'IN' | 'OUT'; quantity: number; dateStr: string }>;
  }> = [
    { code: 'SG001', name: 'SERVILLETAS PAQUETE 100 UNIDADES', category: 'GENERAL_SERVICES', unit: 'UNIDAD', currentStock: 3, criticalLevel: 1, transactions: [] },
    { code: 'SG002', name: 'BRAGAS DE TABAJO', category: 'GENERAL_SERVICES', unit: 'UNIDAD', currentStock: 5, criticalLevel: 2, transactions: [{ type: 'OUT', quantity: 1, dateStr: '2026-05-31' }, { type: 'OUT', quantity: 1, dateStr: '2026-06-08' }] },
    { code: 'SG003', name: 'PRESOSTATO DE AGUA UNIDAD', category: 'GENERAL_SERVICES', unit: 'UNIDAD', currentStock: 2, criticalLevel: 1, transactions: [] },
    { code: 'SG004', name: 'EXTRACTOR DE AIRE UNIDAD 12PLG', category: 'GENERAL_SERVICES', unit: 'UNIDAD', currentStock: 1, criticalLevel: 1, transactions: [{ type: 'OUT', quantity: 1, dateStr: '2026-06-09' }] },
    { code: 'SG005', name: 'EXTRACTOR DE AIRE UNIDAD 10PLG', category: 'GENERAL_SERVICES', unit: 'UNIDAD', currentStock: 3, criticalLevel: 1, transactions: [{ type: 'OUT', quantity: 1, dateStr: '2026-05-31' }, { type: 'OUT', quantity: 1, dateStr: '2026-06-22' }] },
    { code: 'SG006', name: 'CARRITO DE COLETO UNIDAD', category: 'GENERAL_SERVICES', unit: 'UNIDAD', currentStock: 1, criticalLevel: 1, transactions: [] },
    { code: 'SG007', name: 'FUNDA PARA LAVAR AIRE UNIDAD', category: 'GENERAL_SERVICES', unit: 'UNIDAD', currentStock: 2, criticalLevel: 1, transactions: [] },
    { code: 'SG008', name: 'EVAR 22 QUIMICO PARA LAVAR AIRE', category: 'GENERAL_SERVICES', unit: 'UNIDAD', currentStock: 2, criticalLevel: 1, transactions: [] },
    { code: 'SG009', name: 'FORMULA MECÁNICA', category: 'GENERAL_SERVICES', unit: 'UNIDAD', currentStock: 2, criticalLevel: 1, transactions: [{ type: 'OUT', quantity: 1, dateStr: '2026-06-12' }] },
    { code: 'SG010', name: 'SILICON TRANSPARENTE TUBO', category: 'GENERAL_SERVICES', unit: 'UNIDAD', currentStock: 3, criticalLevel: 1, transactions: [] },
    { code: 'SG011', name: 'ESPUMA POLIURETANO', category: 'GENERAL_SERVICES', unit: 'UNIDAD', currentStock: 4, criticalLevel: 1, transactions: [] },
    { code: 'SG012', name: 'ABRAZADERAS 16/32', category: 'GENERAL_SERVICES', unit: 'UNIDAD', currentStock: 24, criticalLevel: 10, transactions: [] },
    { code: 'SG013', name: 'ABRAZADERAS 1/2 PLG', category: 'GENERAL_SERVICES', unit: 'UNIDAD', currentStock: 38, criticalLevel: 10, transactions: [] },
    { code: 'SG014', name: 'CONTACTOR 2 LINEAS 220V', category: 'GENERAL_SERVICES', unit: 'UNIDAD', currentStock: 1, criticalLevel: 1, transactions: [] },
    { code: 'SG015', name: 'CONTACTOR 4 LINEAS 220V', category: 'GENERAL_SERVICES', unit: 'UNIDAD', currentStock: 2, criticalLevel: 1, transactions: [] },
    { code: 'SG016', name: 'BREAKER 40 AMP', category: 'GENERAL_SERVICES', unit: 'UNIDAD', currentStock: 4, criticalLevel: 1, transactions: [] },
    { code: 'SG017', name: 'REPELENTE DE INSECTOS', category: 'GENERAL_SERVICES', unit: 'UNIDAD', currentStock: 3, criticalLevel: 1, transactions: [] },
    { code: 'SG018', name: 'VARIADOR DE FRECUENCIA', category: 'GENERAL_SERVICES', unit: 'UNIDAD', currentStock: 1, criticalLevel: 1, transactions: [] },
    { code: 'SG019', name: 'INTERRUPTORES 110V', category: 'GENERAL_SERVICES', unit: 'UNIDAD', currentStock: 10, criticalLevel: 1, transactions: [] },
    { code: 'SG020', name: 'ENCHUFE 110V', category: 'GENERAL_SERVICES', unit: 'UNIDAD', currentStock: 6, criticalLevel: 1, transactions: [{ type: 'OUT', quantity: 1, dateStr: '2026-06-08' }, { type: 'OUT', quantity: 3, dateStr: '2026-06-12' }, { type: 'OUT', quantity: 1, dateStr: '2026-06-19' }] },
    { code: 'SG021', name: 'TOMA CORRIENTE 110V', category: 'GENERAL_SERVICES', unit: 'UNIDAD', currentStock: 7, criticalLevel: 1, transactions: [{ type: 'OUT', quantity: 1, dateStr: '2026-06-10' }] },
    { code: 'SG022', name: 'JUEGO DE MECHAS CONCRETO', category: 'GENERAL_SERVICES', unit: 'UNIDAD', currentStock: 1, criticalLevel: 1, transactions: [] },
    { code: 'SG023', name: 'BARRA DE SILICON', category: 'GENERAL_SERVICES', unit: 'UNIDAD', currentStock: 5, criticalLevel: 1, transactions: [] },
    { code: 'SG024', name: 'ENCHUFE 220V', category: 'GENERAL_SERVICES', unit: 'UNIDAD', currentStock: 14, criticalLevel: 1, transactions: [] },
    { code: 'SG025', name: 'PROTECTOR 110V', category: 'GENERAL_SERVICES', unit: 'UNIDAD', currentStock: 4, criticalLevel: 1, transactions: [] },
    { code: 'SG026', name: 'POTECTOR 220V', category: 'GENERAL_SERVICES', unit: 'UNIDAD', currentStock: 2, criticalLevel: 1, transactions: [] },
    { code: 'SG027', name: 'RODILLOS PARA PINTAR', category: 'GENERAL_SERVICES', unit: 'UNIDAD', currentStock: 5, criticalLevel: 1, transactions: [{ type: 'OUT', quantity: 1, dateStr: '2026-06-20' }] },
    { code: 'SG028', name: 'TAPE DOBLE CARA', category: 'GENERAL_SERVICES', unit: 'UNIDAD', currentStock: 2, criticalLevel: 1, transactions: [] },
    { code: 'SG029', name: 'LENTES DE SEGURIDAD CLAROS', category: 'GENERAL_SERVICES', unit: 'UNIDAD', currentStock: 10, criticalLevel: 1, transactions: [{ type: 'OUT', quantity: 1, dateStr: '2026-06-03' }, { type: 'OUT', quantity: 1, dateStr: '2026-06-12' }] },
    { code: 'SG030', name: 'LENTES OSCUROS', category: 'GENERAL_SERVICES', unit: 'UNIDAD', currentStock: 12, criticalLevel: 1, transactions: [{ type: 'OUT', quantity: 1, dateStr: '2026-05-31' }, { type: 'OUT', quantity: 2, dateStr: '2026-06-12' }, { type: 'OUT', quantity: 2, dateStr: '2026-06-19' }] },
    { code: 'SG031', name: 'MANOMETRO DE PROPANO', category: 'GENERAL_SERVICES', unit: 'UNIDAD', currentStock: 1, criticalLevel: 1, transactions: [] },
    { code: 'SG032', name: 'MANOMETRO DE OXIGENO', category: 'GENERAL_SERVICES', unit: 'UNIDAD', currentStock: 1, criticalLevel: 1, transactions: [] },
    { code: 'SG033', name: 'LAMPARAS CUADRADAS DE 24 WATT', category: 'GENERAL_SERVICES', unit: 'UNIDAD', currentStock: 5, criticalLevel: 1, transactions: [{ type: 'OUT', quantity: 1, dateStr: '2026-06-05' }] },
    { code: 'SG034', name: 'LAMPARAS CUADRADAS DE 24 WATT PLANAS', category: 'GENERAL_SERVICES', unit: 'UNIDAD', currentStock: 2, criticalLevel: 1, transactions: [] },
    { code: 'SG035', name: 'LAMPARAS REDONDAS DE 24 WATT', category: 'GENERAL_SERVICES', unit: 'UNIDAD', currentStock: 5, criticalLevel: 1, transactions: [] },
    { code: 'SG036', name: 'REFLECTORES DE 100 WATT', category: 'GENERAL_SERVICES', unit: 'UNIDAD', currentStock: 8, criticalLevel: 1, transactions: [] },
    { code: 'SG037', name: 'CABLE 12 ROLLO', category: 'GENERAL_SERVICES', unit: 'UNIDAD', currentStock: 2.5, criticalLevel: 1, transactions: [] },
    { code: 'SG038', name: 'CABLE 8 ROLLO', category: 'GENERAL_SERVICES', unit: 'UNIDAD', currentStock: 1, criticalLevel: 1, transactions: [] },
    { code: 'SG039', name: 'BOMBILLO 12 WATT', category: 'GENERAL_SERVICES', unit: 'UNIDAD', currentStock: 7, criticalLevel: 1, transactions: [{ type: 'OUT', quantity: 2, dateStr: '2026-06-11' }, { type: 'OUT', quantity: 2, dateStr: '2026-06-18' }] },
    { code: 'SG040', name: 'REGLETA  DE LUZ 100 WATT', category: 'GENERAL_SERVICES', unit: 'UNIDAD', currentStock: 13, criticalLevel: 1, transactions: [{ type: 'OUT', quantity: 1, dateStr: '2026-06-19' }] },
    { code: 'SG041', name: 'JARRA PLASTICA 4 LITROS', category: 'GENERAL_SERVICES', unit: 'UNIDAD', currentStock: 2, criticalLevel: 1, transactions: [] },
    { code: 'SG042', name: 'SERVILLETAS PAQUETES 1000 UNIDADES', category: 'GENERAL_SERVICES', unit: 'UNIDAD', currentStock: 1, criticalLevel: 1, transactions: [] },
    { code: 'SG043', name: 'CEPILLO DE ALAMBRE', category: 'GENERAL_SERVICES', unit: 'UNIDAD', currentStock: 2, criticalLevel: 1, transactions: [] },
    { code: 'SG044', name: 'DESINFECTANTE LITR0', category: 'GENERAL_SERVICES', unit: 'UNIDAD', currentStock: 3, criticalLevel: 1, transactions: [] },
    { code: 'SG045', name: 'SERRUCHO', category: 'GENERAL_SERVICES', unit: 'UNIDAD', currentStock: 1, criticalLevel: 1, transactions: [] },
    { code: 'SG046', name: 'POLEAS COMPRESOR', category: 'GENERAL_SERVICES', unit: 'UNIDAD', currentStock: 3, criticalLevel: 1, transactions: [] },
    { code: 'SG047', name: 'BOMBA SUMERGIBLE', category: 'GENERAL_SERVICES', unit: 'UNIDAD', currentStock: 2, criticalLevel: 1, transactions: [] },
    { code: 'SG048', name: 'BOMBA DE AGUA 1 HP', category: 'GENERAL_SERVICES', unit: 'UNIDAD', currentStock: 1, criticalLevel: 1, transactions: [] },
    { code: 'SG049', name: 'BOMBA DE AGUA 1/2 HP', category: 'GENERAL_SERVICES', unit: 'UNIDAD', currentStock: 4, criticalLevel: 1, transactions: [] },
    { code: 'SG050', name: 'MAQUINA DE SOLDAR', category: 'GENERAL_SERVICES', unit: 'UNIDAD', currentStock: 1, criticalLevel: 1, transactions: [] },
    { code: 'SG051', name: 'TALADRO', category: 'GENERAL_SERVICES', unit: 'UNIDAD', currentStock: 1, criticalLevel: 1, transactions: [] },
    { code: 'SG052', name: 'SIERRA CIRCULAR', category: 'GENERAL_SERVICES', unit: 'UNIDAD', currentStock: 1, criticalLevel: 1, transactions: [] },
    { code: 'SG053', name: 'SIERRA CALADORA', category: 'GENERAL_SERVICES', unit: 'UNIDAD', currentStock: 1, criticalLevel: 1, transactions: [] },
    { code: 'SG054', name: 'ESMERIL', category: 'GENERAL_SERVICES', unit: 'UNIDAD', currentStock: 1, criticalLevel: 1, transactions: [] },
    { code: 'SG055', name: 'SILICON GRIS', category: 'GENERAL_SERVICES', unit: 'UNIDAD', currentStock: 1, criticalLevel: 1, transactions: [] },
    { code: 'SG056', name: 'PRESOSTATO ARVEK', category: 'GENERAL_SERVICES', unit: 'UNIDAD', currentStock: 2, criticalLevel: 1, transactions: [] },
    { code: 'SG057', name: 'LLAVE DE PASO 3/4 PLG', category: 'GENERAL_SERVICES', unit: 'UNIDAD', currentStock: 6, criticalLevel: 1, transactions: [{ type: 'OUT', quantity: 1, dateStr: '2026-06-05' }] },
    { code: 'SG058', name: 'LLAVE DE PASO 1 PLG', category: 'GENERAL_SERVICES', unit: 'UNIDAD', currentStock: 10, criticalLevel: 1, transactions: [] },
    { code: 'SG059', name: 'TIJERAS', category: 'GENERAL_SERVICES', unit: 'UNIDAD', currentStock: 2, criticalLevel: 1, transactions: [{ type: 'OUT', quantity: 1, dateStr: '2026-06-12' }] },
    { code: 'SG060', name: 'BOLIGRAFOS UNIDAD', category: 'GENERAL_SERVICES', unit: 'UNIDAD', currentStock: 22, criticalLevel: 1, transactions: [{ type: 'OUT', quantity: 2, dateStr: '2026-06-12' }, { type: 'OUT', quantity: 2, dateStr: '2026-06-18' }] },
    { code: 'SG061', name: 'CORREAS PARA MOTOR 5PK1105 GENERADOR', category: 'GENERAL_SERVICES', unit: 'UNIDAD', currentStock: 3, criticalLevel: 1, transactions: [] },
    { code: 'SG062', name: 'CORREA PARA MOTOR AYD 17461 GENERADOR', category: 'GENERAL_SERVICES', unit: 'UNIDAD', currentStock: 1, criticalLevel: 1, transactions: [] },
    { code: 'SG063', name: 'ESCOBA', category: 'GENERAL_SERVICES', unit: 'UNIDAD', currentStock: 2, criticalLevel: 1, transactions: [] },
    { code: 'SG064', name: 'MOPA DE COLETO', category: 'GENERAL_SERVICES', unit: 'UNIDAD', currentStock: 4, criticalLevel: 1, transactions: [] },
    { code: 'SG065', name: 'BOMBA NEUMATICA PACA PACA', category: 'GENERAL_SERVICES', unit: 'UNIDAD', currentStock: 4, criticalLevel: 1, transactions: [{ type: 'OUT', quantity: 1, dateStr: '2026-06-13' }] },
    { code: 'SG066', name: 'HIDROJET', category: 'GENERAL_SERVICES', unit: 'UNIDAD', currentStock: 1, criticalLevel: 1, transactions: [] },
    { code: 'SG067', name: 'ACEITE 15W40 CUÑETE', category: 'GENERAL_SERVICES', unit: 'UNIDAD', currentStock: 1.5, criticalLevel: 1, transactions: [] },
    { code: 'SG068', name: 'DISCO DE ESMERILAR 7 PLG UNIDAD', category: 'GENERAL_SERVICES', unit: 'UNIDAD', currentStock: 4, criticalLevel: 1, transactions: [] },
    { code: 'SG069', name: 'MECATILLO ROLLO', category: 'GENERAL_SERVICES', unit: 'UNIDAD', currentStock: 1, criticalLevel: 1, transactions: [] },
    { code: 'SG070', name: 'MECATE AMARILLO CARRETE', category: 'GENERAL_SERVICES', unit: 'UNIDAD', currentStock: 1, criticalLevel: 1, transactions: [] },
    { code: 'SG071', name: 'MECATE VERDE 1/2 PLG', category: 'GENERAL_SERVICES', unit: 'UNIDAD', currentStock: 1, criticalLevel: 1, transactions: [] },
    { code: 'SG072', name: 'BOLSA NEGRA PARA BASURA', category: 'GENERAL_SERVICES', unit: 'UNIDAD', currentStock: 53, criticalLevel: 1, transactions: [{ type: 'OUT', quantity: 2, dateStr: '2026-06-01' }, { type: 'OUT', quantity: 40, dateStr: '2026-06-03' }, { type: 'OUT', quantity: 2, dateStr: '2026-06-04' }, { type: 'OUT', quantity: 5, dateStr: '2026-06-12' }, { type: 'IN', quantity: 8, dateStr: '2026-06-17' }, { type: 'OUT', quantity: 4, dateStr: '2026-06-18' }, { type: 'OUT', quantity: 2, dateStr: '2026-06-22' }] },
    { code: 'SG073', name: 'BOLSAS 1KG UNIDAD', category: 'GENERAL_SERVICES', unit: 'UNIDAD', currentStock: 95, criticalLevel: 1, transactions: [{ type: 'OUT', quantity: 1, dateStr: '2026-05-31' }, { type: 'OUT', quantity: 4, dateStr: '2026-06-01' }] },
    { code: 'SG074', name: 'TOALLIN PAQUETE 100 UNIDADES', category: 'GENERAL_SERVICES', unit: 'UNIDAD', currentStock: 7, criticalLevel: 1, transactions: [{ type: 'OUT', quantity: 2, dateStr: '2026-06-01' }, { type: 'OUT', quantity: 1, dateStr: '2026-06-03' }, { type: 'OUT', quantity: 2, dateStr: '2026-06-04' }, { type: 'OUT', quantity: 2, dateStr: '2026-06-07' }, { type: 'OUT', quantity: 1, dateStr: '2026-06-09' }, { type: 'OUT', quantity: 1, dateStr: '2026-06-11' }, { type: 'OUT', quantity: 1, dateStr: '2026-06-13' }, { type: 'OUT', quantity: 1, dateStr: '2026-06-14' }, { type: 'IN', quantity: 12, dateStr: '2026-06-17' }, { type: 'OUT', quantity: 3, dateStr: '2026-06-18' }, { type: 'OUT', quantity: 2, dateStr: '2026-06-19' }, { type: 'OUT', quantity: 2, dateStr: '2026-06-20' }, { type: 'OUT', quantity: 2, dateStr: '2026-06-22' }] },
    { code: 'SG075', name: 'CINTA DE EMBALAR ROLLOS', category: 'GENERAL_SERVICES', unit: 'UNIDAD', currentStock: 6, criticalLevel: 1, transactions: [] },
    { code: 'SG076', name: 'TIRRO DE PAPEL 1 PLG UNIDAD', category: 'GENERAL_SERVICES', unit: 'UNIDAD', currentStock: 7, criticalLevel: 2, transactions: [{ type: 'OUT', quantity: 4, dateStr: '2026-06-12' }, { type: 'OUT', quantity: 2, dateStr: '2026-06-15' }, { type: 'OUT', quantity: 1, dateStr: '2026-06-18' }, { type: 'OUT', quantity: 1, dateStr: '2026-06-19' }, { type: 'OUT', quantity: 1, dateStr: '2026-06-20' }] },
    { code: 'SG077', name: 'TIRRO DE PAPEL 2 PLG UNIDAD', category: 'GENERAL_SERVICES', unit: 'UNIDAD', currentStock: 2, criticalLevel: 1, transactions: [] },
    { code: 'SG078', name: 'TEFLON UNIDAD', category: 'GENERAL_SERVICES', unit: 'UNIDAD', currentStock: 4, criticalLevel: 1, transactions: [] },
    { code: 'SG079', name: 'CINTA METRICA 3 M', category: 'GENERAL_SERVICES', unit: 'UNIDAD', currentStock: 1, criticalLevel: 1, transactions: [] },
    { code: 'SG080', name: 'SOCATE CERAMICA REDONDO', category: 'GENERAL_SERVICES', unit: 'UNIDAD', currentStock: 12, criticalLevel: 1, transactions: [{ type: 'OUT', quantity: 5, dateStr: '2026-06-05' }] },
    { code: 'SG081', name: 'BREAKER 30 AMP', category: 'GENERAL_SERVICES', unit: 'UNIDAD', currentStock: 3, criticalLevel: 1, transactions: [] },
    { code: 'SG082', name: 'BOLSAS 5 KG UNIDAD', category: 'GENERAL_SERVICES', unit: 'UNIDAD', currentStock: 85, criticalLevel: 1, transactions: [{ type: 'OUT', quantity: 1, dateStr: '2026-06-02' }, { type: 'OUT', quantity: 8, dateStr: '2026-06-04' }, { type: 'OUT', quantity: 1, dateStr: '2026-06-06' }, { type: 'OUT', quantity: 3, dateStr: '2026-06-08' }, { type: 'OUT', quantity: 3, dateStr: '2026-06-09' }, { type: 'OUT', quantity: 4, dateStr: '2026-06-10' }, { type: 'OUT', quantity: 2, dateStr: '2026-06-13' }, { type: 'OUT', quantity: 5, dateStr: '2026-06-14' }, { type: 'OUT', quantity: 3, dateStr: '2026-06-15' }, { type: 'OUT', quantity: 11, dateStr: '2026-06-18' }, { type: 'OUT', quantity: 10, dateStr: '2026-06-19' }] },
    { code: 'SG083', name: 'PAÑITOS AMARILLOS UNIDAD', category: 'GENERAL_SERVICES', unit: 'UNIDAD', currentStock: 7, criticalLevel: 1, transactions: [{ type: 'OUT', quantity: 4, dateStr: '2026-06-01' }, { type: 'OUT', quantity: 1, dateStr: '2026-06-18' }] },
    { code: 'SG084', name: 'DISCO DE CORTE 7 PLG', category: 'GENERAL_SERVICES', unit: 'UNIDAD', currentStock: 2, criticalLevel: 1, transactions: [] },
    { code: 'SG085', name: 'ESCALERA DE 5 PELDAÑOS', category: 'GENERAL_SERVICES', unit: 'UNIDAD', currentStock: 1, criticalLevel: 1, transactions: [] },
    { code: 'SG086', name: 'ESCALERA  DE 6 PELDAÑOS', category: 'GENERAL_SERVICES', unit: 'UNIDAD', currentStock: 1, criticalLevel: 1, transactions: [] },
    { code: 'SG087', name: 'ESCALERA DE 13 PELDAÑOS', category: 'GENERAL_SERVICES', unit: 'UNIDAD', currentStock: 1, criticalLevel: 1, transactions: [] },
    { code: 'SG088', name: 'MANDO DE LA GRUA', category: 'GENERAL_SERVICES', unit: 'UNIDAD', currentStock: 0, criticalLevel: 1, transactions: [] },
    { code: 'SG089', name: 'MASCARA COMPLETA', category: 'GENERAL_SERVICES', unit: 'UNIDAD', currentStock: 5, criticalLevel: 2, transactions: [{ type: 'IN', quantity: 8, dateStr: '2026-06-17' }, { type: 'OUT', quantity: 3, dateStr: '2026-06-18' }] },
    { code: 'SG090', name: 'MASCARILLA DESECHABLE CAJAS', category: 'GENERAL_SERVICES', unit: 'UNIDAD', currentStock: 2, criticalLevel: 1, transactions: [] },
    { code: 'SG091', name: 'BATERIA AAA PAR', category: 'GENERAL_SERVICES', unit: 'UNIDAD', currentStock: 2, criticalLevel: 1, transactions: [] },
    { code: 'SG092', name: 'LIJA Nº 8O UNIDAD', category: 'GENERAL_SERVICES', unit: 'UNIDAD', currentStock: 38, criticalLevel: 1, transactions: [] },
    { code: 'SG093', name: 'LIJA Nº 100', category: 'GENERAL_SERVICES', unit: 'UNIDAD', currentStock: 38, criticalLevel: 1, transactions: [] },
    { code: 'SG094', name: 'CORREA SISTEMA DE EXTRACCION GASES', category: 'GENERAL_SERVICES', unit: 'UNIDAD', currentStock: 0, criticalLevel: 1, transactions: [] },
    { code: 'SG095', name: 'VACUM DEL CASTING BAR', category: 'GENERAL_SERVICES', unit: 'UNIDAD', currentStock: 0, criticalLevel: 1, transactions: [] },
    { code: 'SG096', name: 'ACEITE 20W50 GENERADOR PAR', category: 'GENERAL_SERVICES', unit: 'UNIDAD', currentStock: 0, criticalLevel: 1, transactions: [{ type: 'IN', quantity: 6, dateStr: '2026-06-17' }, { type: 'OUT', quantity: 1, dateStr: '2026-06-18' }] },
    { code: 'SG097', name: 'FILTRO ACEITE P550777 GENERADOR GRANDE', category: 'GENERAL_SERVICES', unit: 'UNIDAD', currentStock: 0, criticalLevel: 1, transactions: [{ type: 'IN', quantity: 4, dateStr: '2026-06-17' }, { type: 'OUT', quantity: 1, dateStr: '2026-06-18' }] },
    { code: 'SG098', name: 'FILTRO ACEITE P550947 GENERADOR GRANDE', category: 'GENERAL_SERVICES', unit: 'UNIDAD', currentStock: 0, criticalLevel: 1, transactions: [{ type: 'IN', quantity: 2, dateStr: '2026-06-17' }, { type: 'OUT', quantity: 1, dateStr: '2026-06-18' }] },
    { code: 'SG099', name: 'FILTRO ACEITE P558615 GENERADOR PEQ.', category: 'GENERAL_SERVICES', unit: 'UNIDAD', currentStock: 1, criticalLevel: 1, transactions: [] },
    { code: 'SG100', name: 'FILTRO GASOIL P557440 GENERADOR GRANDE', category: 'GENERAL_SERVICES', unit: 'UNIDAD', currentStock: 0, criticalLevel: 1, transactions: [{ type: 'IN', quantity: 2, dateStr: '2026-06-17' }, { type: 'OUT', quantity: 1, dateStr: '2026-06-18' }] },
    { code: 'SG101', name: 'FILTRO GASOIL P558000 GENERADOR GRANDE', category: 'GENERAL_SERVICES', unit: 'UNIDAD', currentStock: 0, criticalLevel: 1, transactions: [{ type: 'IN', quantity: 2, dateStr: '2026-06-17' }, { type: 'OUT', quantity: 1, dateStr: '2026-06-18' }] },
    { code: 'SG102', name: 'FILTRO GASOIL P551329 GENERADOR PEQ.', category: 'GENERAL_SERVICES', unit: 'UNIDAD', currentStock: 1, criticalLevel: 1, transactions: [] },
    { code: 'SG103', name: 'FILTRO GASOIL P550440 GENERADOR PEQ,', category: 'GENERAL_SERVICES', unit: 'UNIDAD', currentStock: 1, criticalLevel: 1, transactions: [] },
    { code: 'SG104', name: 'RASTRILOS', category: 'GENERAL_SERVICES', unit: 'UNIDAD', currentStock: 0, criticalLevel: 1, transactions: [{ type: 'OUT', quantity: 2, dateStr: '2026-06-03' }] },
    { code: 'SG105', name: 'BOTAS DE LONA', category: 'GENERAL_SERVICES', unit: 'UNIDAD', currentStock: 1, criticalLevel: 1, transactions: [{ type: 'OUT', quantity: 4, dateStr: '2026-06-03' }, { type: 'OUT', quantity: 1, dateStr: '2026-06-18' }] },
    { code: 'SG106', name: 'CORREA DE EXTRACTOR GRANDE A69', category: 'GENERAL_SERVICES', unit: 'UNIDAD', currentStock: 0, criticalLevel: 1, transactions: [] },
    { code: 'SG107', name: 'TIRRAS GRANDE', category: 'GENERAL_SERVICES', unit: 'UNIDAD', currentStock: 96, criticalLevel: 1, transactions: [{ type: 'OUT', quantity: 2, dateStr: '2026-06-04' }, { type: 'OUT', quantity: 1, dateStr: '2026-06-06' }, { type: 'OUT', quantity: 2, dateStr: '2026-06-19' }] },
    { code: 'SG108', name: 'T de PVC DE 3/4', category: 'GENERAL_SERVICES', unit: 'UNIDAD', currentStock: 8, criticalLevel: 2, transactions: [] },
    { code: 'SG109', name: 'Tornillos tirafondo', category: 'GENERAL_SERVICES', unit: 'UNIDAD', currentStock: 27, criticalLevel: 10, transactions: [] },
    { code: 'SG110', name: 'Ramplug  Verde', category: 'GENERAL_SERVICES', unit: 'UNIDAD', currentStock: 42, criticalLevel: 10, transactions: [{ type: 'OUT', quantity: 6, dateStr: '2026-06-13' }] },
    { code: 'SG111', name: 'Ramplug Azul', category: 'GENERAL_SERVICES', unit: 'UNIDAD', currentStock: 45, criticalLevel: 10, transactions: [] },
    { code: 'SG112', name: 'Ramplug Naranja', category: 'GENERAL_SERVICES', unit: 'UNIDAD', currentStock: 78, criticalLevel: 10, transactions: [] },
    { code: 'SG113', name: 'LLESQUERO', category: 'GENERAL_SERVICES', unit: 'UNIDAD', currentStock: 2, criticalLevel: 10, transactions: [{ type: 'IN', quantity: 5, dateStr: '2026-06-17' }, { type: 'OUT', quantity: 3, dateStr: '2026-06-22' }] },
    { code: 'SG114', name: 'Tapa de toma corriente', category: 'GENERAL_SERVICES', unit: 'UNIDAD', currentStock: 28, criticalLevel: 4, transactions: [] },
    { code: 'SG115', name: 'ABRAZADERA 33-57', category: 'GENERAL_SERVICES', unit: 'UNIDAD', currentStock: 5, criticalLevel: 5, transactions: [{ type: 'IN', quantity: 6, dateStr: '2026-06-17' }, { type: 'OUT', quantity: 1, dateStr: '2026-06-18' }] },
    { code: 'SG116', name: 'LLAVE VABULA PVC 1/2 PULGADA', category: 'GENERAL_SERVICES', unit: 'UNIDAD', currentStock: 4, criticalLevel: 5, transactions: [{ type: 'IN', quantity: 5, dateStr: '2026-06-17' }, { type: 'OUT', quantity: 1, dateStr: '2026-06-22' }] },
    { code: 'OP001', name: 'FILTRO PARA MASCARAS 3M PAR', category: 'OPERATIONS', unit: 'UNIDAD', currentStock: 27, criticalLevel: 10, transactions: [{ type: 'OUT', quantity: 2, dateStr: '2026-05-31' }, { type: 'OUT', quantity: 2, dateStr: '2026-06-03' }, { type: 'OUT', quantity: 1, dateStr: '2026-06-04' }, { type: 'OUT', quantity: 3, dateStr: '2026-06-05' }, { type: 'OUT', quantity: 3, dateStr: '2026-06-07' }, { type: 'OUT', quantity: 1, dateStr: '2026-06-08' }, { type: 'OUT', quantity: 1, dateStr: '2026-06-11' }, { type: 'OUT', quantity: 6, dateStr: '2026-06-12' }, { type: 'OUT', quantity: 3, dateStr: '2026-06-13' }, { type: 'IN', quantity: 30, dateStr: '2026-06-17' }, { type: 'OUT', quantity: 8, dateStr: '2026-06-18' }] },
    { code: 'OP002', name: 'CRISOL MK5', category: 'OPERATIONS', unit: 'UNIDAD', currentStock: 15, criticalLevel: 16, transactions: [{ type: 'OUT', quantity: 2, dateStr: '2026-05-28' }, { type: 'OUT', quantity: 1, dateStr: '2026-05-30' }, { type: 'OUT', quantity: 1, dateStr: '2026-05-31' }, { type: 'OUT', quantity: 2, dateStr: '2026-06-04' }, { type: 'OUT', quantity: 2, dateStr: '2026-06-06' }, { type: 'OUT', quantity: 2, dateStr: '2026-06-08' }, { type: 'OUT', quantity: 2, dateStr: '2026-06-09' }, { type: 'IN', quantity: 15, dateStr: '2026-06-10' }, { type: 'OUT', quantity: 4, dateStr: '2026-06-11' }, { type: 'OUT', quantity: 2, dateStr: '2026-06-12' }, { type: 'OUT', quantity: 5, dateStr: '2026-06-13' }, { type: 'OUT', quantity: 2, dateStr: '2026-06-14' }, { type: 'IN', quantity: 64, dateStr: '2026-06-17' }, { type: 'OUT', quantity: 4, dateStr: '2026-06-17' }, { type: 'OUT', quantity: 1, dateStr: '2026-06-18' }, { type: 'OUT', quantity: 2, dateStr: '2026-06-21' }, { type: 'OUT', quantity: 4, dateStr: '2026-06-22' }] },
    { code: 'OP003', name: 'CRISOLMK9', category: 'OPERATIONS', unit: 'UNIDAD', currentStock: 0, criticalLevel: 16, transactions: [{ type: 'IN', quantity: 99, dateStr: '2026-06-22' }] },
    { code: 'OP004', name: 'LINGOTERA DE 5KG', category: 'OPERATIONS', unit: 'UNIDAD', currentStock: 6, criticalLevel: 16, transactions: [{ type: 'OUT', quantity: 4, dateStr: '2026-05-28' }, { type: 'OUT', quantity: 3, dateStr: '2026-05-30' }, { type: 'OUT', quantity: 5, dateStr: '2026-06-08' }, { type: 'OUT', quantity: 7, dateStr: '2026-06-13' }, { type: 'IN', quantity: 18, dateStr: '2026-06-17' }, { type: 'OUT', quantity: 4, dateStr: '2026-06-17' }, { type: 'OUT', quantity: 7, dateStr: '2026-06-22' }] },
    { code: 'OP005', name: 'LINGOTERA DE 12.5KG', category: 'OPERATIONS', unit: 'UNIDAD', currentStock: 2, criticalLevel: 5, transactions: [] },
    { code: 'OP006', name: 'CUPELA DE CERAMICA DE 5KG', category: 'OPERATIONS', unit: 'UNIDAD', currentStock: 3, criticalLevel: 3, transactions: [{ type: 'IN', quantity: 6, dateStr: '2026-06-17' }] },
    { code: 'OP007', name: 'CUPELA DE CERAMICA DE 3KG', category: 'OPERATIONS', unit: 'UNIDAD', currentStock: 0, criticalLevel: 3, transactions: [] },
    { code: 'OP008', name: 'CUPELA DE CERAMICA DE 1,5KG', category: 'OPERATIONS', unit: 'UNIDAD', currentStock: 2, criticalLevel: 3, transactions: [] },
    { code: 'OP009', name: 'CUPELAS DE CERÁMICA 1 KG', category: 'OPERATIONS', unit: 'UNIDAD', currentStock: 0, criticalLevel: 3, transactions: [{ type: 'OUT', quantity: 1, dateStr: '2026-06-01' }, { type: 'OUT', quantity: 2, dateStr: '2026-06-06' }] },
    { code: 'OP010', name: 'OLLA DE TITANIO', category: 'OPERATIONS', unit: 'UNIDAD', currentStock: 3, criticalLevel: 2, transactions: [{ type: 'OUT', quantity: 1, dateStr: '2026-06-18' }] },
    { code: 'OP011', name: 'CUCHARA DE ACERO', category: 'OPERATIONS', unit: 'UNIDAD', currentStock: 8, criticalLevel: 1, transactions: [] },
    { code: 'OP012', name: 'OLLAS PARA AGUA CALIENTE', category: 'OPERATIONS', unit: 'UNIDAD', currentStock: 2, criticalLevel: 1, transactions: [] },
    { code: 'OP013', name: 'PIZETA DE LABORATORIO', category: 'OPERATIONS', unit: 'UNIDAD', currentStock: 2, criticalLevel: 1, transactions: [{ type: 'OUT', quantity: 1, dateStr: '2026-05-29' }] },
    { code: 'OP014', name: 'CLORURO DE ESTAÑO', category: 'OPERATIONS', unit: 'UNIDAD', currentStock: 2, criticalLevel: 1, transactions: [] },
    { code: 'OP015', name: 'SENSOR DE PH', category: 'OPERATIONS', unit: 'UNIDAD', currentStock: 3, criticalLevel: 1, transactions: [] },
    { code: 'OP016', name: 'PICO PARA SOPLETE OXICORTE', category: 'OPERATIONS', unit: 'UNIDAD', currentStock: 2, criticalLevel: 1, transactions: [{ type: 'OUT', quantity: 1, dateStr: '2026-06-19' }] },
    { code: 'OP017', name: 'GUANTES DE LATEX (pares)', category: 'OPERATIONS', unit: 'UNIDAD', currentStock: 32, criticalLevel: 1, transactions: [{ type: 'OUT', quantity: 1, dateStr: '2026-06-01' }, { type: 'OUT', quantity: 3, dateStr: '2026-06-03' }, { type: 'OUT', quantity: 1, dateStr: '2026-06-11' }, { type: 'OUT', quantity: 1, dateStr: '2026-06-13' }, { type: 'OUT', quantity: 2, dateStr: '2026-06-14' }, { type: 'OUT', quantity: 20, dateStr: '2026-06-18' }, { type: 'OUT', quantity: 20, dateStr: '2026-06-19' }, { type: 'OUT', quantity: 20, dateStr: '2026-06-22' }] },
    { code: 'OP018', name: 'GUANTES DE CARNAZA PARES GRAN.', category: 'OPERATIONS', unit: 'UNIDAD', currentStock: 4, criticalLevel: 5, transactions: [{ type: 'OUT', quantity: 1, dateStr: '2026-06-08' }, { type: 'OUT', quantity: 1, dateStr: '2026-06-09' }] },
    { code: 'OP019', name: 'GUANTES DE CARNAZA PARES PEQ.', category: 'OPERATIONS', unit: 'UNIDAD', currentStock: 7, criticalLevel: 5, transactions: [{ type: 'OUT', quantity: 1, dateStr: '2026-05-31' }, { type: 'OUT', quantity: 2, dateStr: '2026-06-03' }] },
    { code: 'OP020', name: 'GUANTES DE PUNTO PARES', category: 'OPERATIONS', unit: 'UNIDAD', currentStock: 20, criticalLevel: 5, transactions: [{ type: 'OUT', quantity: 1, dateStr: '2026-05-31' }, { type: 'OUT', quantity: 1, dateStr: '2026-06-10' }, { type: 'OUT', quantity: 1, dateStr: '2026-06-12' }, { type: 'OUT', quantity: 1, dateStr: '2026-06-18' }] },
    { code: 'OP021', name: 'GUANTES DE NITRILO VERDE PARES', category: 'OPERATIONS', unit: 'UNIDAD', currentStock: 22, criticalLevel: 5, transactions: [{ type: 'OUT', quantity: 1, dateStr: '2026-05-31' }, { type: 'OUT', quantity: 1, dateStr: '2026-06-01' }, { type: 'OUT', quantity: 1, dateStr: '2026-06-02' }, { type: 'OUT', quantity: 3, dateStr: '2026-06-03' }, { type: 'OUT', quantity: 3, dateStr: '2026-06-05' }, { type: 'OUT', quantity: 4, dateStr: '2026-06-06' }, { type: 'OUT', quantity: 1, dateStr: '2026-06-08' }, { type: 'OUT', quantity: 3, dateStr: '2026-06-12' }, { type: 'OUT', quantity: 2, dateStr: '2026-06-13' }, { type: 'OUT', quantity: 5, dateStr: '2026-06-18' }] },
    { code: 'OP022', name: 'GUANTES DE NEOPRENO PARES', category: 'OPERATIONS', unit: 'UNIDAD', currentStock: 4, criticalLevel: 12, transactions: [] },
    { code: 'OP023', name: 'MARCADORES DE PIZARRA', category: 'OPERATIONS', unit: 'UNIDAD', currentStock: 22, criticalLevel: 1, transactions: [{ type: 'OUT', quantity: 1, dateStr: '2026-06-18' }] },
    { code: 'OP024', name: 'TIRRO DE PAPEL UNIDAD', category: 'OPERATIONS', unit: 'UNIDAD', currentStock: 24, criticalLevel: 1, transactions: [{ type: 'OUT', quantity: 2, dateStr: '2026-05-31' }, { type: 'OUT', quantity: 1, dateStr: '2026-06-03' }] },
    { code: 'OP025', name: 'PISTOLA DE JARDINERÍA UNIDAD', category: 'OPERATIONS', unit: 'UNIDAD', currentStock: 2, criticalLevel: 2, transactions: [] },
    { code: 'OP026', name: 'TAPE NEGRO UNIDAD', category: 'OPERATIONS', unit: 'UNIDAD', currentStock: 3, criticalLevel: 2, transactions: [{ type: 'OUT', quantity: 1, dateStr: '2026-06-10' }] },
    { code: 'OP027', name: 'FAJA PARA GRUA DEL REACTOR', category: 'OPERATIONS', unit: 'UNIDAD', currentStock: 2, criticalLevel: 1, transactions: [] },
    { code: 'OP028', name: 'BOLSA CLARA MINERA CLARA PAQUETE', category: 'OPERATIONS', unit: 'UNIDAD', currentStock: 12, criticalLevel: 1, transactions: [{ type: 'OUT', quantity: 2, dateStr: '2026-05-31' }, { type: 'OUT', quantity: 1, dateStr: '2026-06-03' }, { type: 'OUT', quantity: 1, dateStr: '2026-06-06' }, { type: 'OUT', quantity: 1, dateStr: '2026-06-09' }, { type: 'OUT', quantity: 1, dateStr: '2026-06-10' }, { type: 'OUT', quantity: 1, dateStr: '2026-06-12' }, { type: 'OUT', quantity: 1, dateStr: '2026-06-18' }, { type: 'OUT', quantity: 1, dateStr: '2026-06-20' }] },
    { code: 'OP029', name: 'FILTRO DE PASO RAPIDO 5 MICRAS UNIDAD', category: 'OPERATIONS', unit: 'UNIDAD', currentStock: 12, criticalLevel: 5, transactions: [{ type: 'OUT', quantity: 2, dateStr: '2026-05-31' }, { type: 'OUT', quantity: 1, dateStr: '2026-06-01' }, { type: 'OUT', quantity: 1, dateStr: '2026-06-06' }, { type: 'IN', quantity: 10, dateStr: '2026-06-10' }, { type: 'OUT', quantity: 1, dateStr: '2026-06-13' }, { type: 'OUT', quantity: 1, dateStr: '2026-06-15' }, { type: 'OUT', quantity: 2, dateStr: '2026-06-18' }, { type: 'OUT', quantity: 1, dateStr: '2026-06-22' }] },
    { code: 'OP030', name: 'COPELA DE ARCILLA GRANDE', category: 'OPERATIONS', unit: 'UNIDAD', currentStock: 3, criticalLevel: 1, transactions: [{ type: 'OUT', quantity: 3, dateStr: '2026-06-01' }] },
    { code: 'OP031', name: 'COPELA DE ARCILLA MEDIANA', category: 'OPERATIONS', unit: 'UNIDAD', currentStock: 13, criticalLevel: 1, transactions: [{ type: 'OUT', quantity: 1, dateStr: '2026-06-04' }, { type: 'OUT', quantity: 6, dateStr: '2026-06-19' }] },
    { code: 'OP032', name: 'COPELA DE ARCILLA PEQUEÑA', category: 'OPERATIONS', unit: 'UNIDAD', currentStock: 26, criticalLevel: 1, transactions: [{ type: 'OUT', quantity: 5, dateStr: '2026-06-01' }, { type: 'OUT', quantity: 1, dateStr: '2026-06-08' }] },
    { code: 'OP033', name: 'TOBO DE ALBAÑILERIA', category: 'OPERATIONS', unit: 'UNIDAD', currentStock: 11, criticalLevel: 4, transactions: [{ type: 'OUT', quantity: 2, dateStr: '2026-06-03' }, { type: 'OUT', quantity: 1, dateStr: '2026-06-08' }, { type: 'OUT', quantity: 3, dateStr: '2026-06-10' }] },
    { code: 'OP034', name: 'CAJA DE HERRAMIENTAS', category: 'OPERATIONS', unit: 'UNIDAD', currentStock: 2, criticalLevel: 1, transactions: [] },
    { code: 'OP035', name: 'BOLSAS PARA MUESTRAS PAQUETE', category: 'OPERATIONS', unit: 'UNIDAD', currentStock: 4, criticalLevel: 1, transactions: [{ type: 'OUT', quantity: 2, dateStr: '2026-05-31' }, { type: 'IN', quantity: 11, dateStr: '2026-06-10' }, { type: 'OUT', quantity: 2, dateStr: '2026-06-11' }, { type: 'OUT', quantity: 1, dateStr: '2026-06-14' }, { type: 'OUT', quantity: 1, dateStr: '2026-06-18' }, { type: 'OUT', quantity: 1, dateStr: '2026-06-20' }] },
    { code: 'OP036', name: 'PIMPINA DE 70 LITROS', category: 'OPERATIONS', unit: 'UNIDAD', currentStock: 0, criticalLevel: 1, transactions: [{ type: 'OUT', quantity: 2, dateStr: '2026-06-03' }] },
    { code: 'OP037', name: 'ABRAZADERAS 17/32', category: 'OPERATIONS', unit: 'UNIDAD', currentStock: 80, criticalLevel: 20, transactions: [{ type: 'OUT', quantity: 1, dateStr: '2026-06-02' }, { type: 'OUT', quantity: 1, dateStr: '2026-06-04' }, { type: 'OUT', quantity: 1, dateStr: '2026-06-05' }, { type: 'OUT', quantity: 2, dateStr: '2026-06-09' }, { type: 'OUT', quantity: 3, dateStr: '2026-06-13' }, { type: 'OUT', quantity: 5, dateStr: '2026-06-18' }, { type: 'OUT', quantity: 1, dateStr: '2026-06-20' }] },
    { code: 'OP038', name: 'COPELAS DE CERÁMICA 1 KG', category: 'OPERATIONS', unit: 'UNIDAD', currentStock: 3, criticalLevel: 1, transactions: [] },
    { code: 'OP039', name: 'GUANTES DE LATEX CAJAS', category: 'OPERATIONS', unit: 'UNIDAD', currentStock: 3, criticalLevel: 1, transactions: [] },
  ];

  const warehouseCodes: string[] = [];
  for (const item of warehouseItems) {
    const created = await prisma.supplyItem.upsert({
      where: { code: item.code },
      update: {
        name: item.name,
        currentStock: item.currentStock,
        criticalLevel: item.criticalLevel,
      },
      create: {
        code: item.code,
        name: item.name,
        category: item.category,
        unit: item.unit,
        currentStock: item.currentStock,
        criticalLevel: item.criticalLevel,
        isCritical: false,
      },
    });
    warehouseCodes.push(created.code);

    if (item.transactions.length > 0) {
      const txData = item.transactions.map((tx) => ({
        itemId: created.id,
        type: tx.type as 'IN' | 'OUT',
        quantity: tx.quantity,
        date: new Date(tx.dateStr + 'T12:00:00Z'),
        reference: 'Inventario inicial Almacén Padre de la Patria',
      }));
      await prisma.supplyTransaction.createMany({ data: txData });
    }
  }
  console.log('Warehouse items created:', warehouseCodes.length);
  console.log('Categories — SG:', warehouseCodes.filter(c => c.startsWith('SG')).length, 'OP:', warehouseCodes.filter(c => c.startsWith('OP')).length);

  console.log('Seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
