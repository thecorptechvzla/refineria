"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const adapter_pg_1 = require("@prisma/adapter-pg");
const client_js_1 = require("../src/generated/prisma/client.js");
const bcrypt_1 = __importDefault(require("bcrypt"));
const connectionString = process.env['DATABASE_URL'] || 'postgresql://postgres:postgres@localhost:5432/goldtrack?schema=public';
const adapter = new adapter_pg_1.PrismaPg({ connectionString });
const prisma = new client_js_1.PrismaClient({ adapter });
async function main() {
    console.log('Seeding database...');
    const hashedPassword = await bcrypt_1.default.hash('123', 10);
    const admin = await prisma.user.upsert({
        where: { email: 'admin@goldtrack.com' },
        update: {},
        create: {
            name: 'César Mendoza',
            email: 'admin@goldtrack.com',
            password: hashedPassword,
            role: 'ADMIN',
        },
    });
    const superadmin = await prisma.user.upsert({
        where: { email: 'dueno@goldtrack.com' },
        update: {},
        create: {
            name: 'Alejandro Vargas',
            email: 'dueno@goldtrack.com',
            password: hashedPassword,
            role: 'SUPERADMIN',
        },
    });
    console.log('Users created:', admin.email, superadmin.email);
    const suppliers = await Promise.all([
        prisma.supplier.create({ data: { name: 'Minera Los Andes SAC', contactInfo: 'contacto@losandes.pe | +51 987 654 321', registrationDate: new Date('2023-01-15T10:00:00Z') } }),
        prisma.supplier.create({ data: { name: 'Cooperativa Aurífera del Sur', contactInfo: 'ventas@coopaurifera.com | +51 976 543 210', registrationDate: new Date('2023-03-22T14:30:00Z') } }),
        prisma.supplier.create({ data: { name: 'Corporación Minera Dorado', contactInfo: 'info@doradocorp.pe | +51 965 432 109', registrationDate: new Date('2023-06-10T09:00:00Z') } }),
        prisma.supplier.create({ data: { name: 'Inversiones El Dorado EIRL', contactInfo: 'operaciones@eldorado.pe | +51 954 321 098', registrationDate: new Date('2023-08-05T11:45:00Z') } }),
        prisma.supplier.create({ data: { name: 'Compañía Minera del Centro', contactInfo: 'logistica@cmcentro.pe | +51 943 210 987', registrationDate: new Date('2024-01-20T08:30:00Z') } }),
        prisma.supplier.create({ data: { name: 'Sociedad Minera Río Seco', contactInfo: 'admin@rioseco.pe | +51 932 109 876', registrationDate: new Date('2024-04-12T16:00:00Z') } }),
    ]);
    console.log('Suppliers created:', suppliers.length);
    const txData = [
        { type: 'IN', weight: 3.5, weightUnit: 'kg', purity: 0.95, supplierId: suppliers[0].id, date: new Date('2024-01-08T09:15:00Z') },
        { type: 'IN', weight: 1.2, weightUnit: 'kg', purity: 0.92, supplierId: suppliers[1].id, date: new Date('2024-01-15T14:30:00Z') },
        { type: 'OUT', weight: 2.0, weightUnit: 'kg', purity: 0.99, supplierId: suppliers[0].id, date: new Date('2024-02-01T11:00:00Z') },
        { type: 'IN', weight: 850, weightUnit: 'g', purity: 0.88, supplierId: suppliers[2].id, date: new Date('2024-02-18T10:45:00Z') },
        { type: 'IN', weight: 2.8, weightUnit: 'kg', purity: 0.94, supplierId: suppliers[3].id, date: new Date('2024-03-05T08:20:00Z') },
        { type: 'IN', weight: 1.5, weightUnit: 'kg', purity: 0.91, supplierId: suppliers[0].id, date: new Date('2024-03-22T16:10:00Z') },
        { type: 'OUT', weight: 1.0, weightUnit: 'kg', purity: 0.99, supplierId: suppliers[1].id, date: new Date('2024-04-10T09:30:00Z') },
        { type: 'IN', weight: 620, weightUnit: 'g', purity: 0.85, supplierId: suppliers[4].id, date: new Date('2024-04-28T13:15:00Z') },
        { type: 'IN', weight: 4.2, weightUnit: 'kg', purity: 0.96, supplierId: suppliers[2].id, date: new Date('2024-05-14T11:00:00Z') },
        { type: 'OUT', weight: 3.0, weightUnit: 'kg', purity: 0.99, supplierId: suppliers[3].id, date: new Date('2024-06-01T15:45:00Z') },
        { type: 'IN', weight: 1.8, weightUnit: 'kg', purity: 0.93, supplierId: suppliers[5].id, date: new Date('2024-06-20T08:30:00Z') },
        { type: 'IN', weight: 950, weightUnit: 'g', purity: 0.89, supplierId: suppliers[1].id, date: new Date('2024-07-08T10:00:00Z') },
        { type: 'IN', weight: 2.3, weightUnit: 'kg', purity: 0.94, supplierId: suppliers[0].id, date: new Date('2024-07-25T14:20:00Z') },
        { type: 'OUT', weight: 1.5, weightUnit: 'kg', purity: 0.99, supplierId: suppliers[4].id, date: new Date('2024-08-12T09:00:00Z') },
        { type: 'IN', weight: 3.0, weightUnit: 'kg', purity: 0.97, supplierId: suppliers[3].id, date: new Date('2024-09-03T11:30:00Z') },
        { type: 'IN', weight: 1.1, weightUnit: 'kg', purity: 0.90, supplierId: suppliers[2].id, date: new Date('2024-09-21T16:00:00Z') },
        { type: 'IN', weight: 2.0, weightUnit: 'kg', purity: 0.95, supplierId: suppliers[5].id, date: new Date('2025-01-10T08:45:00Z') },
        { type: 'OUT', weight: 4.0, weightUnit: 'kg', purity: 0.99, supplierId: suppliers[0].id, date: new Date('2025-02-20T10:30:00Z') },
        { type: 'IN', weight: 1.4, weightUnit: 'kg', purity: 0.92, supplierId: suppliers[4].id, date: new Date('2025-03-15T09:15:00Z') },
        { type: 'IN', weight: 750, weightUnit: 'g', purity: 0.87, supplierId: suppliers[1].id, date: new Date('2025-04-02T14:00:00Z') },
    ];
    const transactions = await Promise.all(txData.map((data) => prisma.transaction.create({ data })));
    console.log('Transactions created:', transactions.length);
    const workers = await Promise.all([
        prisma.worker.create({ data: { name: 'Roberto Huamán', position: 'Fundidor', status: 'active', startDate: new Date('2022-06-01T08:00:00Z') } }),
        prisma.worker.create({ data: { name: 'María Quispe', position: 'Analista de Calidad', status: 'active', startDate: new Date('2022-09-15T08:00:00Z') } }),
        prisma.worker.create({ data: { name: 'Juan Paredes', position: 'Operador de Báscula', status: 'active', startDate: new Date('2023-01-10T08:00:00Z') } }),
        prisma.worker.create({ data: { name: 'Lucía Fernández', position: 'Asistente Administrativa', status: 'active', startDate: new Date('2023-04-20T08:00:00Z') } }),
        prisma.worker.create({ data: { name: 'Carlos Gutiérrez', position: 'Jefe de Planta', status: 'active', startDate: new Date('2022-03-01T08:00:00Z') } }),
        prisma.worker.create({ data: { name: 'Ana Condori', position: 'Laboratorista', status: 'active', startDate: new Date('2023-08-05T08:00:00Z') } }),
        prisma.worker.create({ data: { name: 'Pedro Castillo', position: 'Chofer', status: 'inactive', startDate: new Date('2022-11-01T08:00:00Z') } }),
        prisma.worker.create({ data: { name: 'Sofía Mamani', position: 'Auxiliar de Oficina', status: 'inactive', startDate: new Date('2023-02-15T08:00:00Z') } }),
    ]);
    console.log('Workers created:', workers.length);
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
//# sourceMappingURL=seed.js.map