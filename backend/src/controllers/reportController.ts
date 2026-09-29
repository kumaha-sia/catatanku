import { Response } from 'express';
import prisma from '../db';
import { AuthRequest } from '../middlewares/authMiddleware';
import asyncHandler from 'express-async-handler';

export const getSummary = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;
  const householdId = req.query.household_id as string | undefined;
  const { month, year, scope } = req.query;

  if (!householdId) {
    res.status(400);
    throw new Error('household_id is required');
  }

  const membership = await prisma.householdMember.findUnique({
    where: { household_id_user_id: { household_id: householdId, user_id: userId! } }
  });
  if (!membership || membership.status !== 'ACTIVE') {
    res.status(403);
    throw new Error('Access denied to household');
  }

  let startDate, endDate;
  const now = new Date();
  const y = year ? Number(year) : now.getFullYear();
  const isMonthly = !!month && month !== 'all';

  if (isMonthly) {
    startDate = new Date(y, Number(month) - 1, 1);
    endDate = new Date(y, Number(month), 0, 23, 59, 59, 999);
  } else {
    startDate = new Date(y, 0, 1);
    endDate = new Date(y, 11, 31, 23, 59, 59, 999);
  }

  const allMembers = await prisma.householdMember.findMany({
    where: { household_id: householdId, status: 'ACTIVE' }
  });
  const memberIds = allMembers.map(m => m.user_id);

  const creatorsToInclude = scope === 'PERSONAL' ? [userId!] : memberIds;

  const whereClause: any = {
    household_id: householdId,
    created_by: { in: creatorsToInclude },
    date: { gte: startDate, lte: endDate },
    status: 'COMPLETED'
  };

  if (scope !== 'PERSONAL') {
    whereClause.OR = [
      { visibility: 'FAMILY' },
      { created_by: userId }
    ];
  }

  const allTransactions = await prisma.transaction.findMany({
    where: whereClause,
    include: { category: true }
  });

  let totalIncome = 0;
  let totalExpense = 0;
  const categoryMap: any = {};
  const cashflowMap: any = {};

  if (isMonthly) {
    for (let i = 1; i <= 4; i++) {
      cashflowMap[`W${i}`] = { name: `W${i}`, income: 0, expense: 0 };
    }
  } else {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'];
    months.forEach(m => {
      cashflowMap[m] = { name: m, income: 0, expense: 0 };
    });
  }

  allTransactions.forEach(t => {
    if (t.type === 'INCOME') totalIncome += t.amount;
    if (t.type === 'EXPENSE') {
      totalExpense += t.amount;
      const catName = t.category?.name || 'Lainnya';
      const catColor = t.category?.color || '#cccccc';
      if (!categoryMap[catName]) categoryMap[catName] = { name: catName, value: 0, color: catColor };
      categoryMap[catName].value += t.amount;
    }

    if (isMonthly) {
      const week = Math.ceil(t.date.getDate() / 7);
      const wkKey = `W${week > 4 ? 4 : week}`;
      if (t.type === 'INCOME') cashflowMap[wkKey].income += t.amount;
      if (t.type === 'EXPENSE') cashflowMap[wkKey].expense += t.amount;
    } else {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'];
      const mKey = months[t.date.getMonth()];
      if (t.type === 'INCOME') cashflowMap[mKey].income += t.amount;
      if (t.type === 'EXPENSE') cashflowMap[mKey].expense += t.amount;
    }
  });

  res.status(200).json({
    status: 'success',
    data: {
      total_income: totalIncome,
      total_expense: totalExpense,
      balance: totalIncome - totalExpense,
      spending_by_category: Object.values(categoryMap),
      cashflow: Object.values(cashflowMap)
    }
  });
});

export const exportCSV = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;
  const householdId = req.query.household_id as string | undefined;

  if (!householdId) {
    res.status(400);
    throw new Error('household_id is required');
  }

  const membership = await prisma.householdMember.findUnique({
    where: { household_id_user_id: { household_id: householdId, user_id: userId! } }
  });
  if (!membership || membership.status !== 'ACTIVE') {
    res.status(403);
    throw new Error('Access denied to household');
  }

  const transactions = await prisma.transaction.findMany({
    where: {
      household_id: householdId,
      status: 'COMPLETED',
      OR: [
        { visibility: 'FAMILY' },
        { created_by: userId }
      ]
    },
    include: { category: true, wallet: true, creator: { select: { name: true } } },
    orderBy: { date: 'desc' }
  });

  const escapeCSV = (val: string) => {
    if (val.includes(',') || val.includes('"') || val.includes('\n')) {
      return `"${val.replace(/"/g, '""')}"`;
    }
    return val;
  };

  const header = 'Tanggal,Tipe,Kategori,Catatan,Jumlah,Dompet,Oleh';
  const rows = transactions.map(t => {
    const date = t.date.toISOString().split('T')[0];
    const type = t.type === 'INCOME' ? 'Pemasukan' : t.type === 'EXPENSE' ? 'Pengeluaran' : 'Transfer';
    const category = escapeCSV(t.category?.name || '-');
    const desc = escapeCSV(t.note || '-');
    const amount = t.amount.toString();
    const wallet = escapeCSV(t.wallet?.name || '-');
    const by = escapeCSV(t.creator?.name || '-');
    return `${date},${type},${category},${desc},${amount},${wallet},${by}`;
  });

  const csv = [header, ...rows].join('\n');

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename=finbareng_export_${new Date().toISOString().split('T')[0]}.csv`);
  res.send('\uFEFF' + csv); // BOM for Excel UTF-8
});

export const exportPDF = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;
  const householdId = req.query.household_id as string | undefined;
  const scope = req.query.scope as string | undefined;

  if (!householdId) {
    res.status(400);
    throw new Error('household_id is required');
  }

  const membership = await prisma.householdMember.findUnique({
    where: { household_id_user_id: { household_id: householdId, user_id: userId! } }
  });
  if (!membership || membership.status !== 'ACTIVE') {
    res.status(403);
    throw new Error('Access denied to household');
  }

  const allMembers = await prisma.householdMember.findMany({
    where: { household_id: householdId, status: 'ACTIVE' }
  });
  const memberIds = allMembers.map(m => m.user_id);
  const creatorsToInclude = scope === 'PERSONAL' ? [userId!] : memberIds;

  const whereClause: any = {
    household_id: householdId,
    created_by: { in: creatorsToInclude },
    status: 'COMPLETED'
  };

  if (scope !== 'PERSONAL') {
    whereClause.OR = [
      { visibility: 'FAMILY' },
      { created_by: userId }
    ];
  }

  const transactions = await prisma.transaction.findMany({
    where: whereClause,
    include: { category: true, wallet: true, creator: { select: { name: true } } },
    orderBy: { date: 'desc' }
  });

  // Calculate summaries
  let totalIncome = 0;
  let totalExpense = 0;
  transactions.forEach(t => {
    if (t.type === 'INCOME') totalIncome += t.amount;
    if (t.type === 'EXPENSE') totalExpense += t.amount;
  });
  const balance = totalIncome - totalExpense;

  // Dynamic import of PDFKit and PDFKit-Table
  const PDFDocument = require('pdfkit-table');

  const doc = new PDFDocument({ margin: 40, size: 'A4', bufferPages: true });
  
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=finbareng_export_${new Date().toISOString().split('T')[0]}.pdf`);
  
  doc.pipe(res);

  // --- HEADER SECTION ---
  doc.font('Helvetica-Bold').fontSize(28).fillColor('#0C6B58').text('FINBARENG', 40, 40, { align: 'left' });
  doc.font('Helvetica').fontSize(10).fillColor('#666666').text('LAPORAN RIWAYAT TRANSAKSI', 40, 70, { align: 'left' });
  
  // Date on the right
  doc.font('Helvetica').fontSize(9).fillColor('#333333').text(`Dicetak pada: ${new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}`, 40, 70, { align: 'right' });
  
  // Divider Line
  doc.moveTo(40, 95).lineTo(555, 95).strokeColor('#E5E7EB').lineWidth(2).stroke();
  
  // --- SUMMARY SECTION ---
  doc.y = 115;
  doc.x = 40;
  doc.font('Helvetica-Bold').fontSize(11).fillColor('#171B22').text('RINGKASAN KEUANGAN');
  doc.moveDown(0.5);
  
  // Income
  let currY = doc.y;
  doc.font('Helvetica-Bold').fontSize(10).fillColor('#171B22').text('Total Pemasukan', 40, currY);
  doc.text(':', 150, currY);
  doc.font('Helvetica').fillColor('#059669').text(`Rp ${totalIncome.toLocaleString('id-ID')}`, 160, currY);
  
  // Expense
  currY = doc.y + 4;
  doc.font('Helvetica-Bold').fillColor('#171B22').text('Total Pengeluaran', 40, currY);
  doc.text(':', 150, currY);
  doc.font('Helvetica').fillColor('#DC2626').text(`Rp ${totalExpense.toLocaleString('id-ID')}`, 160, currY);
  
  // Balance
  currY = doc.y + 4;
  doc.font('Helvetica-Bold').fillColor('#171B22').text('Sisa Saldo Bersih', 40, currY);
  doc.text(':', 150, currY);
  doc.font('Helvetica-Bold').fillColor(balance >= 0 ? '#059669' : '#DC2626').text(`Rp ${balance.toLocaleString('id-ID')}`, 160, currY);
  
  doc.x = 40;
  doc.y = currY + 30;

  // --- TABLE SECTION ---
  const table = {
    title: 'Detail Transaksi',
    headers: [
      { label: 'Tanggal', property: 'date', width: 85 },
      { label: 'Tipe', property: 'type', width: 60 },
      { label: 'Kategori', property: 'category', width: 80 },
      { label: 'Catatan', property: 'note', width: 110 },
      { label: 'Dompet', property: 'wallet', width: 55 },
      { label: 'Oleh', property: 'by', width: 55 },
      { label: 'Jumlah', property: 'amount', width: 70, align: 'right' }
    ],
    datas: transactions.map(t => ({
      date: t.date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
      type: t.type === 'INCOME' ? 'Pemasukan' : t.type === 'EXPENSE' ? 'Pengeluaran' : 'Transfer',
      category: t.category?.name || '-',
      note: t.note || '-',
      wallet: t.wallet?.name || '-',
      by: t.creator?.name || '-',
      amount: `Rp ${t.amount.toLocaleString('id-ID')}`
    })),
  };

  await doc.table(table, {
    prepareHeader: () => doc.font('Helvetica-Bold').fontSize(8).fillColor('#171B22'),
    prepareRow: (row: any, indexColumn: any, indexRow: any, rectRow: any) => {
      doc.font('Helvetica').fontSize(8).fillColor('#4B5563');
    }
  });

  // Footer with Page Numbers (lineBreak: false prevents blank extra pages)
  const pages = doc.bufferedPageRange();
  for (let i = 0; i < pages.count; i++) {
    doc.switchToPage(i);
    doc.font('Helvetica').fontSize(8).fillColor('#9CA3AF');
    doc.text(
      `Halaman ${i + 1} dari ${pages.count} — © 2026 FinBareng`,
      40,
      doc.page.height - 40,
      { align: 'center', lineBreak: false }
    );
  }

  doc.end();
});
