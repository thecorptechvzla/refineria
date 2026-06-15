"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const adapter_pg_1 = require("@prisma/adapter-pg");
const client_1 = require("../src/generated/prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const connectionString = process.env['DATABASE_URL'] || 'postgresql://postgres:postgres@localhost:5432/goldtrack?schema=public';
const adapter = new adapter_pg_1.PrismaPg({ connectionString });
const prisma = new client_1.PrismaClient({ adapter });
async function main() {
    console.log('Seeding database....');
    const hashedPassword = await bcrypt_1.default.hash('TheCorpAdmin*', 10);
    const hashedPassword1 = await bcrypt_1.default.hash('JuanDavila*', 10);
    const hashedPassword2 = await bcrypt_1.default.hash('AngelEspinosa*', 10);
    const hashedPassword3 = await bcrypt_1.default.hash('RodrigoRojas*', 10);
    const superadminCorp = await prisma.user.upsert({
        where: { email: 'thecorptech@goldtrack.com' },
        update: {},
        create: {
            name: 'The Corp Tech',
            email: 'thecorptech@goldtrack.com',
            password: hashedPassword,
            role: 'SUPERADMIN',
        },
    });
    const superadmin = await prisma.user.upsert({
        where: { email: 'juandavila@goldtrack.com' },
        update: { password: hashedPassword1 },
        create: {
            name: 'Juan Davila',
            email: 'juandavila@goldtrack.com',
            password: hashedPassword1,
            role: 'SUPERADMIN',
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
    console.log('Users created:', superadminCorp.email, superadmin.email, admin.email, admin1.email);
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