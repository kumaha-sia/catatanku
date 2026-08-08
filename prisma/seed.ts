import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  const existingUser = await prisma.user.findUnique({
    where: { email: "demo@catatanku.local" },
  });

  if (existingUser) {
    console.log("Demo user already exists, skipping seed.");
    return;
  }

  const passwordHash = await bcrypt.hash("demo12345", 12);

  const user = await prisma.user.create({
    data: {
      name: "Demo User",
      email: "demo@catatanku.local",
      passwordHash,
      role: "OWNER",
    },
  });

  const family = await prisma.family.create({
    data: {
      name: "Keluarga Demo",
      members: { connect: { id: user.id } },
    },
  });

  await prisma.user.update({
    where: { id: user.id },
    data: { familyId: family.id },
  });

  const categories = await prisma.category.createManyAndReturn({
    data: [
      { userId: user.id, type: "INCOME", name: "Gaji" },
      { userId: user.id, type: "INCOME", name: "Bonus" },
      { userId: user.id, type: "INCOME", name: "Freelance" },
      { userId: user.id, type: "EXPENSE", name: "Makan", budget: 2000000 },
      {
        userId: user.id,
        type: "EXPENSE",
        name: "Transportasi",
        budget: 500000,
      },
      {
        userId: user.id,
        type: "EXPENSE",
        name: "Belanja Harian",
        budget: 1000000,
      },
      { userId: user.id, type: "EXPENSE", name: "Hiburan", budget: 300000 },
      { userId: user.id, type: "EXPENSE", name: "Kesehatan" },
      { userId: user.id, type: "EXPENSE", name: "Pendidikan" },
      { userId: user.id, type: "EXPENSE", name: "Tagihan", budget: 1500000 },
      {
        userId: user.id,
        type: "SAVINGS",
        name: "Dana Darurat",
        budget: 50000000,
      },
      { userId: user.id, type: "SAVINGS", name: "Liburan", budget: 10000000 },
      {
        userId: user.id,
        type: "SAVINGS",
        name: "Pendidikan Anak",
        budget: 20000000,
      },
      { userId: user.id, type: "DEBT", name: "Cicilan" },
    ],
  });

  const bankAccount = await prisma.account.create({
    data: {
      userId: user.id,
      type: "BANK",
      name: "BCA",
      balance: 15000000,
    },
  });

  await prisma.account.create({
    data: {
      userId: user.id,
      type: "E_WALLET",
      name: "GoPay",
      balance: 500000,
    },
  });

  const now = new Date();
  const gajiCat = categories.find((c) => c.name === "Gaji");
  const makanCat = categories.find((c) => c.name === "Makan");
  const transportCat = categories.find((c) => c.name === "Transportasi");
  const tagihanCat = categories.find((c) => c.name === "Tagihan");

  await prisma.transaction.createMany({
    data: [
      {
        userId: user.id,
        accountId: bankAccount.id,
        categoryId: gajiCat?.id,
        type: "INCOME",
        amount: 10000000,
        description: "Gaji bulanan",
        date: new Date(now.getFullYear(), now.getMonth(), 1),
      },
      {
        userId: user.id,
        accountId: bankAccount.id,
        categoryId: makanCat?.id,
        type: "EXPENSE",
        amount: 50000,
        description: "Makan siang",
        date: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
      },
      {
        userId: user.id,
        accountId: bankAccount.id,
        categoryId: transportCat?.id,
        type: "EXPENSE",
        amount: 25000,
        description: "Grab ke kantor",
        date: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
      },
      {
        userId: user.id,
        accountId: bankAccount.id,
        categoryId: tagihanCat?.id,
        type: "EXPENSE",
        amount: 500000,
        description: "Listrik & WiFi",
        date: new Date(now.getFullYear(), now.getMonth(), 5),
      },
    ],
  });

  console.log("Seed completed. Demo user: demo@catatanku.local / demo12345");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
