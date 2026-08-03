import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  const defaultCategories = [
    { type: "INCOME", name: "Gaji" },
    { type: "INCOME", name: "Bonus" },
    { type: "INCOME", name: "Freelance" },
    { type: "EXPENSE", name: "Makan" },
    { type: "EXPENSE", name: "Transportasi" },
    { type: "EXPENSE", name: "Belanja Harian" },
    { type: "EXPENSE", name: "Hiburan" },
    { type: "EXPENSE", name: "Kesehatan" },
    { type: "EXPENSE", name: "Pendidikan" },
    { type: "EXPENSE", name: "Tagihan" },
    { type: "SAVINGS", name: "Dana Darurat" },
    { type: "SAVINGS", name: "Liburan" },
    { type: "SAVINGS", name: "Pendidikan Anak" },
    { type: "DEBT", name: "Cicilan" },
  ];

  console.log("Default categories ready (will be created per-user on register)");
  console.log("Seed completed.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
