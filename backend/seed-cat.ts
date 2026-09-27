import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Clear existing default categories
  await prisma.category.deleteMany({
    where: { user_id: null }
  });

  await prisma.category.createMany({
    data: [
      // EXPENSES
      { name: 'Makanan & Minuman', type: 'EXPENSE', icon: '🍜', is_default: true, color: '#FFB43A' },
      { name: 'Transportasi', type: 'EXPENSE', icon: '🚗', is_default: true, color: '#3A82FF' },
      { name: 'Belanja', type: 'EXPENSE', icon: '🛒', is_default: true, color: '#0C6B58' },
      { name: 'Tagihan & Utilitas', type: 'EXPENSE', icon: '💡', is_default: true, color: '#FF3A60' },
      { name: 'Hiburan & Hobi', type: 'EXPENSE', icon: '🎮', is_default: true, color: '#9D3AFF' },
      { name: 'Kesehatan & Medis', type: 'EXPENSE', icon: '💊', is_default: true, color: '#FF3A60' },
      { name: 'Pendidikan', type: 'EXPENSE', icon: '📚', is_default: true, color: '#3A82FF' },
      { name: 'Perawatan Diri', type: 'EXPENSE', icon: '💅', is_default: true, color: '#FFB43A' },
      { name: 'Asuransi', type: 'EXPENSE', icon: '🛡️', is_default: true, color: '#0C6B58' },
      { name: 'Pajak', type: 'EXPENSE', icon: '📝', is_default: true, color: '#FF3A60' },
      { name: 'Donasi & Amal', type: 'EXPENSE', icon: '🤝', is_default: true, color: '#9D3AFF' },
      { name: 'Hadiah & Kado', type: 'EXPENSE', icon: '🎁', is_default: true, color: '#FFB43A' },
      { name: 'Biaya Admin', type: 'EXPENSE', icon: '🏦', is_default: true, color: '#3A82FF' },
      { name: 'Cicilan & Utang', type: 'EXPENSE', icon: '💳', is_default: true, color: '#FF3A60' },
      { name: 'Rumah Tangga', type: 'EXPENSE', icon: '🏠', is_default: true, color: '#0C6B58' },
      { name: 'Peliharaan', type: 'EXPENSE', icon: '🐾', is_default: true, color: '#FFB43A' },
      { name: 'Pengeluaran Lainnya', type: 'EXPENSE', icon: '❓', is_default: true, color: '#6B7280' },

      // INCOMES
      { name: 'Gaji', type: 'INCOME', icon: '💰', is_default: true, color: '#0C6B58' },
      { name: 'Bonus & THR', type: 'INCOME', icon: '🎉', is_default: true, color: '#FFB43A' },
      { name: 'Investasi & Dividen', type: 'INCOME', icon: '📈', is_default: true, color: '#3A82FF' },
      { name: 'Uang Saku / Pemberian', type: 'INCOME', icon: '💵', is_default: true, color: '#9D3AFF' },
      { name: 'Penjualan / Bisnis', type: 'INCOME', icon: '🤝', is_default: true, color: '#0C6B58' },
      { name: 'Bunga Bank / Deposito', type: 'INCOME', icon: '🏦', is_default: true, color: '#3A82FF' },
      { name: 'Pengembalian Dana', type: 'INCOME', icon: '🔙', is_default: true, color: '#6B7280' },
      { name: 'Pemasukan Lainnya', type: 'INCOME', icon: '❓', is_default: true, color: '#6B7280' }
    ]
  });
  console.log('Seeded comprehensive categories successfully');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
