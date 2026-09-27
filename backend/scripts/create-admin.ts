import bcrypt from 'bcrypt';
import prisma from '../src/db';

async function main() {
  const email = process.argv[2] || 'admin@finbareng.id';
  const password = process.argv[3] || 'admin123';
  const name = process.argv[4] || 'Admin';

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    // Update existing user to admin
    await prisma.user.update({ where: { email }, data: { role: 'ADMIN' } });
    console.log(`✅ User "${email}" promoted to ADMIN.`);
    return;
  }

  const password_hash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { name, email, password_hash, role: 'ADMIN' }
  });

  // Create default household & wallet for admin too
  const household = await prisma.household.create({
    data: { name: `${name}'s Household`, owner_id: user.id }
  });
  await prisma.householdMember.create({
    data: { household_id: household.id, user_id: user.id, role: 'OWNER', status: 'ACTIVE' }
  });
  await prisma.wallet.create({
    data: { user_id: user.id, name: 'Tunai', type: 'CASH', scope: 'PERSONAL' }
  });

  console.log(`✅ Admin created: ${email} / ${password}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
