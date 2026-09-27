import prisma from '../db';
import { startOfMonth, endOfMonth } from 'date-fns';

export const generateRoast = async (userId: string, persona: string) => {
  try {
    // 1. Fetch Config
    const settings = await prisma.systemSetting.findMany({
      where: { key: { in: ['AI_BASE_URL', 'AI_API_KEY', 'AI_MODEL'] } }
    });
    
    const getVal = (k: string) => settings.find(s => s.key === k)?.value;
    const apiKey = getVal('AI_API_KEY');
    const baseUrl = getVal('AI_BASE_URL');
    const aiModel = getVal('AI_MODEL') || 'gpt-4o'; // Use gpt-4o for better text reasoning

    if (!baseUrl || !apiKey) {
      throw new Error('Konfigurasi AI (AI_BASE_URL, AI_API_KEY) belum diatur di sistem.');
    }

    // 2. Fetch Data for Current Month
    const now = new Date();
    const start = startOfMonth(now);
    const end = endOfMonth(now);

    const transactions = await prisma.transaction.findMany({
      where: {
        created_by: userId,
        date: { gte: start, lte: end }
      },
      include: {
        category: true,
        wallet: true
      }
    });

    const wallets = await prisma.wallet.findMany({
      where: { user_id: userId }
    });

    const totalBalance = wallets.reduce((acc, w) => acc + w.balance, 0);
    
    let totalIncome = 0;
    let totalExpense = 0;
    const expenseByCategory: Record<string, number> = {};

    transactions.forEach(t => {
      if (t.type === 'INCOME') totalIncome += t.amount;
      if (t.type === 'EXPENSE') {
        totalExpense += t.amount;
        const catName = t.category?.name || 'Lainnya';
        expenseByCategory[catName] = (expenseByCategory[catName] || 0) + t.amount;
      }
    });

    // Top 3 Expense Categories
    const topExpenses = Object.entries(expenseByCategory)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([name, amount]) => `- ${name}: Rp ${amount.toLocaleString('id-ID')}`)
      .join('\n');

    // 3. Build Prompt
    let personaInstruction = '';
    if (persona === 'savage') {
      personaInstruction = 'Kamu adalah penasihat keuangan yang SANGAT GALAK, SARKAS, PEDAS, dan SAVAGE (Roast Mode). Kamu suka memarahi kebiasaan buruk pengguna dan mengejek pengeluaran tersier mereka yang tidak masuk akal. Gunakan bahasa gaul anak muda Jakarta (lo/gue). Berikan rating kebodohan finansial mereka di akhir. JANGAN PERNAH sopan.';
    } else if (persona === 'chill') {
      personaInstruction = 'Kamu adalah penasihat keuangan yang santai, gaya anak skena (Chill Bro). Gunakan bahasa gaul (lo/gue, ngab, cuy). Berikan wawasan dengan cara yang asyik, tidak menghakimi tapi tetap mengingatkan secara halus.';
    } else {
      // strict / professional
      personaInstruction = 'Kamu adalah penasihat keuangan profesional yang tegas dan tanpa basa-basi (Strict Advisor). Bicara formal, fokus pada metrik, dan berikan evaluasi yang sangat analitis dan terukur.';
    }

    const systemInstruction = `
${personaInstruction}

Tugasmu adalah menganalisa data keuangan pengguna bulan ini dan memberikan rangkuman maksimal 3-4 paragraf yang singkat, padat, dan sesuai personamu.

DATA PENGGUNA BULAN INI:
- Saldo Tersisa di Semua Dompet: Rp ${totalBalance.toLocaleString('id-ID')}
- Total Pemasukan: Rp ${totalIncome.toLocaleString('id-ID')}
- Total Pengeluaran: Rp ${totalExpense.toLocaleString('id-ID')}
- 3 Pengeluaran Terbesar:
${topExpenses || '- Belum ada pengeluaran'}

Berikan hasil dalam bentuk teks biasa (Markdown boleh dipakai untuk bold/italic). Dilarang membungkus dengan tag JSON. Langsung berikan komentarmu.`;

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
          { role: 'user', content: "Tolong analisa keuanganku bulan ini." }
        ],
        max_tokens: 500,
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

    return aiData.choices[0].message?.content || 'Gagal mendapatkan insight.';
  } catch (error: any) {
    console.error('Error in AI Roasting:', error);
    throw error;
  }
};
