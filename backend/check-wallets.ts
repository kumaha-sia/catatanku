import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const w = await prisma.wallet.findMany();
  console.log('Wallets count:', w.length);
  w.forEach(wallet => console.log('- ', wallet.name, wallet.user_id));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
