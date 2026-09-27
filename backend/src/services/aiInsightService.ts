import prisma from '../db';

export const generateRoast = async (userId: string, persona: string = 'savage') => {
  try {
    // Check Cache first
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error('User not found');

    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);
    const lastRoastStr = user.last_roast_date ? new Date(user.last_roast_date).toISOString().slice(0, 10) : null;

    if (lastRoastStr === todayStr && user.last_roast_text) {
      return user.last_roast_text;
    }

    // --- CACHE MISS: GENERATE NEW ROAST ---
    
    // 1. Fetch Config
    const settings = await prisma.systemSetting.findMany({
      where: { key: { in: ['AI_BASE_URL', 'AI_API_KEY', 'AI_MODEL'] } }
    });
    
    const getVal = (k: string) => settings.find(s => s.key === k)?.value;
    const apiKey = getVal('AI_API_KEY');
    const baseUrl = getVal('AI_BASE_URL');
    const aiModel = getVal('AI_MODEL') || 'gpt-4o'; 

    if (!baseUrl || !apiKey) {
      throw new Error('Konfigurasi AI (AI_BASE_URL, AI_API_KEY) belum diatur di sistem.');
    }

    // 2. Fetch Deep Context Data in Parallel
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const [transactions, wallets, allTimeAgg, goals, debts] = await Promise.all([
      prisma.transaction.findMany({
        where: { created_by: userId, date: { gte: start, lte: end } },
        include: { category: true }
      }),
      prisma.wallet.findMany({ where: { user_id: userId } }),
      prisma.transaction.groupBy({
        by: ['type'],
        where: { created_by: userId },
        _sum: { amount: true }
      }),
      prisma.goal.findMany({ where: { user_id: userId, status: 'ACTIVE' } }),
      prisma.debt.findMany({ where: { user_id: userId, status: 'ACTIVE' } })
    ]);

    // Process Wallets & Balances
    let totalBalance = wallets.reduce((acc, w) => acc + (w.initial_balance || 0), 0);
    allTimeAgg.forEach(agg => {
      if (agg.type === 'INCOME') totalBalance += (agg._sum.amount || 0);
      if (agg.type === 'EXPENSE') totalBalance -= (agg._sum.amount || 0);
    });

    // Process Transactions
    let totalIncome = 0;
    let totalExpense = 0;
    const expenseByCategory: Record<string, number> = {};

    transactions.forEach((t: any) => {
      if (t.type === 'INCOME') totalIncome += t.amount;
      if (t.type === 'EXPENSE') {
        totalExpense += t.amount;
        const catName = t.category?.name || 'Lainnya';
        expenseByCategory[catName] = (expenseByCategory[catName] || 0) + t.amount;
      }
    });

    const topExpenses = Object.entries(expenseByCategory)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, amount]) => `- ${name}: Rp ${amount.toLocaleString('id-ID')}`)
      .join('\n');

    // Process Goals
    const goalsList = goals.map(g => `- ${g.name}: Terkumpul Rp ${g.current_amount.toLocaleString('id-ID')} dari target Rp ${g.target_amount.toLocaleString('id-ID')}`).join('\n');

    // Process Debts
    let totalBorrow = 0;
    let totalLend = 0;
    debts.forEach((d) => {
      if (d.type === 'BORROW') totalBorrow += d.remaining_amount;
      if (d.type === 'LEND') totalLend += d.remaining_amount;
    });

    // 3. Build Prompt
    let personaInstruction = '';
    if (persona === 'savage') {
      personaInstruction = 'Kamu adalah penasihat keuangan yang SANGAT GALAK, SARKAS, PEDAS, dan SAVAGE (Roast Mode). Marahi kebodohan finansial pengguna berdasarkan konteks kekayaan, hutang, dan tujuannya. Gunakan bahasa gaul Jakarta (lo/gue). JANGAN PERNAH sopan.';
    } else if (persona === 'chill') {
      personaInstruction = 'Kamu adalah penasihat keuangan yang santai, gaya anak skena (Chill Bro). Gunakan bahasa gaul (lo/gue, ngab, cuy).';
    } else {
      personaInstruction = 'Kamu adalah penasihat keuangan profesional yang tegas dan tanpa basa-basi (Strict Advisor). Bicara formal.';
    }

    const systemInstruction = `
${personaInstruction}

Tugasmu adalah menganalisa KONDISI FINANSIAL MENDALAM pengguna saat ini dan memberikan TEPAT 1-2 paragraf singkat, padat, dan langsung menohok. Buat semenarik mungkin untuk ditampilkan sebagai Sticky Note di Dashboard mereka. JANGAN pakai kata pembuka bertele-tele. Kaitkan pengeluaran mereka dengan hutang, tabungan (goals), atau saldo tersisa jika relevan.

DATA KEUANGAN PENGGUNA SAAT INI:
- Sisa Saldo Semua Dompet: Rp ${totalBalance.toLocaleString('id-ID')}
- Total Pemasukan (Bulan Ini): Rp ${totalIncome.toLocaleString('id-ID')}
- Total Pengeluaran (Bulan Ini): Rp ${totalExpense.toLocaleString('id-ID')}

5 PENGELUARAN TERBESAR (BULAN INI):
${topExpenses || '- Belum ada pengeluaran'}

HUTANG & PIUTANG AKTIF:
- Total Hutang (Harus Dibayar): Rp ${totalBorrow.toLocaleString('id-ID')}
- Total Piutang (Uang di Orang Lain): Rp ${totalLend.toLocaleString('id-ID')}

TARGET TABUNGAN (GOALS) AKTIF:
${goalsList || '- Tidak ada target tabungan (Parah, hidup ngalir aja?)'}

Berikan hasil teks biasa.`;

    // 4. Fetch from LLM
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: aiModel,
        stream: false,
        messages: [
          { role: 'system', content: systemInstruction },
          { role: 'user', content: "Roast kondisi keuanganku hari ini berdasarkan semua data." }
        ],
        max_tokens: 300,
        temperature: 0.8
      })
    });

    const rawText = await response.text();
    let aiData;
    try {
      aiData = JSON.parse(rawText);
    } catch (e) {
      throw new Error(`Respons API tidak valid: ${rawText.substring(0, 100)}`);
    }

    if (aiData.error) throw new Error(aiData.error.message || 'AI API Error');
    if (!aiData.choices || aiData.choices.length === 0) throw new Error('Format respons AI tidak dikenali');

    const resultText = aiData.choices[0].message?.content || 'Gagal mendapatkan insight.';

    // 5. Save to Cache
    await prisma.user.update({
      where: { id: userId },
      data: {
        last_roast_text: resultText,
        last_roast_date: new Date()
      }
    });

    return resultText;
  } catch (error) {
    console.error('Error in AI Roasting:', error);
    throw error;
  }
};
