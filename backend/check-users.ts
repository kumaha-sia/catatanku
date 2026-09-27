import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany();
  console.log('Users count:', users.length);
  for (const u of users) {
    console.log(u.email);
    // Create wallet for them if none exists
    const w = await prisma.wallet.findFirst({ where: { user_id: u.id } });
    if (!w) {
      await prisma.wallet.create({
        data: {
          user_id: u.id,
          name: 'Tunai',
          type: 'CASH',
          scope: 'PERSONAL',
          currency: 'IDR'
        }
      });
      console.log('Created wallet for', u.email);
    }
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
