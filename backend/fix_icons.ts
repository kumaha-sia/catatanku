import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  await prisma.category.updateMany({
    where: { name: 'Utang', user_id: null },
    data: { icon: '📥' }
  });
  await prisma.category.updateMany({
    where: { name: 'Piutang', user_id: null },
    data: { icon: '📤' }
  });
  await prisma.category.updateMany({
    where: { name: 'Bayar Utang', user_id: null },
    data: { icon: '💸' }
  });
  await prisma.category.updateMany({
    where: { name: 'Terima Piutang', user_id: null },
    data: { icon: '💰' }
  });
  console.log('Icons updated');
}

main().catch(console.error).finally(() => prisma.$disconnect());
