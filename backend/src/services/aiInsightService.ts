import prisma from '../db';

export const generateRoast = async (userId: string, persona: string = 'savage') => {
  try {
    // Check Cache first
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error('User not found');

    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);
    const lastRoastStr = user.last_roast_date ? new Date(user.last_roast_date).toISOString().slice(0, 10) : null;

    // We can also cache based on the persona so if they switch persona it regenerates.
    // For now, if they switch persona, it will just use the cached one unless we force it.
    // Let's just check if it's the same day.
    if (lastRoastStr === todayStr && user.last_roast_text) {
      return user.last_roast_text;
    }

    // --- CACHE MISS: GENERATE NEW ROAST ---
    
    // 1. Fetch Config
    const settings = await prisma.systemSetting.findMany({
      where: { key: { in: ['AI_BASE_URL', 'AI_API_KEY', 'AI_MODEL'] } }
    });
    
    const getVal = (k) => settings.find(s => s.key === k)?.value;
    const apiKey = getVal('AI_API_KEY');
    const baseUrl = getVal('AI_BASE_URL');
    const aiModel = getVal('AI_MODEL') || 'gpt-4o'; 

    if (!baseUrl || !apiKey) {
      throw new Error('Konfigurasi AI (AI_BASE_URL, AI_API_KEY) belum diatur di sistem.');
    }

    // 2. Fetch Data for Current Month
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const transactions = await prisma.transaction.findMany({
      where: {
        created_by: userId,
        date: { gte: start, lte: end }
      },
      include: {
        category: true,
      }
    });

    let totalIncome = 0;
    let totalExpense = 0;
    const expenseByCategory = {};

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
      personaInstruction = 'Kamu adalah penasihat keuangan yang SANGAT GALAK, SARKAS, PEDAS, dan SAVAGE (Roast Mode). Marahi kebodohan finansial pengguna. Gunakan bahasa gaul Jakarta (lo/gue). JANGAN PERNAH sopan.';
    } else if (persona === 'chill') {
      personaInstruction = 'Kamu adalah penasihat keuangan yang santai, gaya anak skena (Chill Bro). Gunakan bahasa gaul (lo/gue, ngab, cuy).';
    } else {
      personaInstruction = 'Kamu adalah penasihat keuangan profesional yang tegas dan tanpa basa-basi (Strict Advisor). Bicara formal.';
    }

    const systemInstruction = `
${personaInstruction}

Tugasmu adalah menganalisa data keuangan pengguna bulan ini dan memberikan TEPAT 1-2 paragraf singkat, padat, dan langsung menohok. Buat semenarik mungkin untuk ditampilkan sebagai Sticky Note di Dashboard mereka. JANGAN pakai kata pembuka bertele-tele.

DATA PENGGUNA BULAN INI:
- Total Pemasukan: Rp ${totalIncome.toLocaleString('id-ID')}
- Total Pengeluaran: Rp ${totalExpense.toLocaleString('id-ID')}
- 3 Pengeluaran Terbesar:
${topExpenses || '- Belum ada pengeluaran'}

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
          { role: 'user', content: "Roast saya hari ini." }
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
