import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.wallet.updateMany({
    where: { name: 'Main Wallet' },
    data: { name: 'Tunai' }
  });
  console.log('Updated existing Main Wallet to Tunai successfully');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
