
import { PrismaClient } from './src/generated/prisma/client';
const prisma = new PrismaClient();
async function main() {
  const item = await prisma.supplyItem.findUnique({ where: { code: 'RO12' } });
  if (!item) { console.log('No se encontr\u00f3 insumo con c\u00f3digo RO12'); return; }
  console.log('Encontrado:', item.name, '(' + item.id + ')');
  await prisma.supplyTransaction.deleteMany({ where: { itemId: item.id } });
  await prisma.supplyItem.delete({ where: { id: item.id } });
  console.log('Eliminado correctamente');
}
main().catch(console.error).finally(() => prisma.\());
