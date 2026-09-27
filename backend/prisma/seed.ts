import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const defaultCategories = [
  // EXPENSES
  { name: 'Makanan & Minuman', type: 'EXPENSE', icon: '🍔' },
  { name: 'Belanja Bulanan', type: 'EXPENSE', icon: '🛒' },
  { name: 'Transportasi & Bensin', type: 'EXPENSE', icon: '🚗' },
  { name: 'Tagihan Listrik & Air', type: 'EXPENSE', icon: '⚡' },
  { name: 'Kuota & Internet', type: 'EXPENSE', icon: '📱' },
  { name: 'Hiburan & Langganan', type: 'EXPENSE', icon: '🎮' },
  { name: 'Kesehatan & Medis', type: 'EXPENSE', icon: '🏥' },
  { name: 'Pendidikan & Buku', type: 'EXPENSE', icon: '📚' },
  { name: 'Perawatan Diri & Kosmetik', type: 'EXPENSE', icon: '💅' },
  { name: 'Pakaian & Sepatu', type: 'EXPENSE', icon: '👕' },
  { name: 'Cicilan & Utang', type: 'EXPENSE', icon: '💳' },
  { name: 'Amal & Donasi', type: 'EXPENSE', icon: '🤲' },
  { name: 'Hadiah & Sosial', type: 'EXPENSE', icon: '🎁' },
  { name: 'Hewan Peliharaan', type: 'EXPENSE', icon: '🐾' },
  { name: 'Asuransi & Pajak', type: 'EXPENSE', icon: '🛡️' },
  { name: 'Rumah & Perabotan', type: 'EXPENSE', icon: '🛋️' },
  { name: 'Lain-lain', type: 'EXPENSE', icon: '📌' },

  // INCOME
  { name: 'Gaji Bulanan', type: 'INCOME', icon: '💰' },
  { name: 'Bonus & THR', type: 'INCOME', icon: '🎉' },
  { name: 'Hasil Investasi', type: 'INCOME', icon: '📈' },
  { name: 'Bisnis & Sampingan', type: 'INCOME', icon: '💼' },
  { name: 'Pencairan Tabungan', type: 'INCOME', icon: '🏦' },
  { name: 'Terima Pinjaman', type: 'INCOME', icon: '🤝' },

  // TRANSFER
  { name: 'Transfer Keluar', type: 'TRANSFER', icon: '📤' },
  { name: 'Transfer Masuk', type: 'TRANSFER', icon: '📥' },
  { name: 'Tarik Tunai', type: 'TRANSFER', icon: '🏧' }
];

async function main() {
  console.log('Start seeding...');

  // Upsert categories based on name so we don't duplicate on multiple seed runs
  for (const cat of defaultCategories) {
    const existing = await prisma.category.findFirst({
      where: { name: cat.name, is_default: true }
    });

    if (!existing) {
      await prisma.category.create({
        data: {
          name: cat.name,
          type: cat.type,
          icon: cat.icon,
          is_default: true,
        },
      });
      console.log(`Created default category: ${cat.name}`);
    } else {
      console.log(`Skipped existing category: ${cat.name}`);
    }
  }

  // Also ensure basic System Settings exist
  const settings = [
    { key: 'AI_BASE_URL', value: '' },
    { key: 'AI_API_KEY', value: '' },
    { key: 'AI_MODEL', value: 'gpt-4o' },
    { key: 'WA_ENDPOINT', value: '' },
    { key: 'WA_API_KEY', value: '' },
    { key: 'WA_SESSION_ID', value: '' },
  ];

  for (const s of settings) {
    await prisma.systemSetting.upsert({
      where: { key: s.key },
      update: {},
      create: { key: s.key, value: s.value }
    });
  }

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
