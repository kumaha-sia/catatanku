import prisma from '../db';

export const processWhatsAppMessage = async (
  userId: string,
  householdId: string,
  messageText: string,
  base64Image?: string,
  mimeType?: string
) => {
  try {
    // 1. Fetch AI Configuration
    const settings = await prisma.systemSetting.findMany({
      where: { key: { in: ['AI_BASE_URL', 'AI_API_KEY', 'AI_MODEL'] } }
    });
    
    const getVal = (k: string) => settings.find(s => s.key === k)?.value;
    const apiKey = getVal('AI_API_KEY');
    const baseUrl = getVal('AI_BASE_URL');
    const aiModel = getVal('AI_MODEL') || 'gpt-4-vision-preview';

    if (!baseUrl || !apiKey) {
      throw new Error('Konfigurasi AI (AI_BASE_URL, AI_API_KEY) belum diatur di sistem.');
    }

    // 2. Fetch User's Wallets and Categories
    const wallets = await prisma.wallet.findMany({
      where: {
        OR: [
          { user_id: userId },
          { household_id: householdId }
        ]
      }
    });

    const categories = await prisma.category.findMany({
      where: {
        OR: [
          { user_id: userId },
          { household_id: householdId },
          { is_default: true } // Include global system categories
        ]
      }
    });

    let defaultWallet = wallets.find(w => w.name.toLowerCase().includes('tunai') || w.name.toLowerCase().includes('cash'));
    if (!defaultWallet && wallets.length > 0) {
      defaultWallet = wallets[0];
    }

    const walletsStr = wallets.map(w => `- ID: ${w.id} | Nama: ${w.name} | Tipe: ${w.type}`).join('\n');
    const categoriesStr = categories.map(c => `- ID: ${c.id} | Nama: ${c.name} | Tipe: ${c.type}`).join('\n');

    const systemInstruction = `
Kamu adalah "FinBareng Bot", asisten keuangan pribadi via WhatsApp yang enerjik, asik, ramah, dan pintar. Gaya bicaramu seperti teman dekat (menggunakan sapaan "Kak" atau "Bosku", menggunakan kata "aku/kamu", menggunakan banyak emoji yang relevan).

Tugas utamamu adalah mendeteksi apakah pesan pengguna merupakan transaksi (pengeluaran/pemasukan/transfer), atau sekadar ngobrol/sapaan biasa.

DATA PENGGUNA SAAT INI:
Daftar Dompet (Wallets):
${walletsStr}
(Default Wallet ID jika pengguna tidak menyebutkan dompet: ${defaultWallet?.id || 'null'})

Daftar Kategori (Categories):
${categoriesStr}

INSTRUKSI PENTING:
1. Jika pengguna berniat mencatat transaksi, atur "is_transaction" menjadi true.
2. Analisa nominal (amount), tipe transaksi (INCOME / EXPENSE / TRANSFER), catatan (note), ID Dompet, dan ID Kategori.
3. Untuk Dompet: Jika pengguna menyebutkan alat pembayaran (misal "BCA", "Gopay", "Cash"), carikan ID yang cocok dari daftar. Jika TIDAK ada yang disebutkan, WAJIB gunakan Default Wallet ID di atas!
4. Untuk Kategori: Analisa konteks pesannya dan pilihkan ID kategori yang paling masuk akal (misal: "Makan seblak" -> Kategori Makanan & Minuman).
5. Buat "reply_message" yang SANGAT INTERAKTIF, TERSTRUKTUR, dan ASYIK dibaca.
   Contoh format balasan transaksi yang diharapkan:
   "Catat Bosku! 📝💸
   Pengeluaran barusan udah sukses aku masukin ke buku catatan ya:

   🛒 *Catatan:* Makan seblak
   💰 *Nominal:* Rp 20.000
   👛 *Dompet:* Tunai
   🏷️ *Kategori:* Makanan & Minuman

   Semangat hematnya hari ini! 💪"
6. Jika pengguna hanya menyapa atau ngobrol di luar konteks transaksi, atur "is_transaction" menjadi false. Isi "reply_message" dengan balasan asisten yang kocak, ramah, dan tawarkan bantuan (misal mengingatkan mereka bisa kirim foto struk belanja untuk dicatat). Kosongkan "transaction_data".
7. Responsmu WAJIB 100% JSON valid sesuai skema berikut tanpa blok markdown (\`\`\`json) atau teks apapun di luar JSON.

SKEMA JSON:
{
  "is_transaction": true/false,
  "reply_message": "Pesan balasan untuk pengguna dengan format WhatsApp yang rapi dan asyik",
  "transaction_data": {
    "amount": 20000,
    "type": "EXPENSE",
    "note": "Makan seblak",
    "wallet_id": "uuid-dompet",
    "category_id": "uuid-kategori"
  }
}
`;

    // 3. Build content payload
    const contentPayload: any[] = [];
    if (messageText) {
      contentPayload.push({ type: "text", text: messageText });
    }
    
    if (base64Image && mimeType) {
      contentPayload.push({
        type: "image_url",
        image_url: {
          url: `data:${mimeType};base64,${base64Image}`
        }
      });
      contentPayload.push({ type: "text", text: "Terdapat gambar struk/nota terlampir. Mohon ekstrak informasi transaksi (nominal, jenis) dari gambar tersebut jika relevan." });
    }

    // 4. Call AI using native fetch
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
          { role: 'user', content: contentPayload }
        ],
        max_tokens: 800
      })
    });

    const rawText = await response.text();
    let aiData;
    
    try {
      aiData = JSON.parse(rawText);
    } catch (parseErr) {
      // Logic from transactionController to handle buggy stream proxy
      if (rawText.includes('data: ')) {
        let combinedContent = '';
        const lines = rawText.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ') && !line.includes('[DONE]')) {
            try {
              const p = JSON.parse(line.substring(6));
              if (p.choices && p.choices[0].delta && p.choices[0].delta.content) {
                combinedContent += p.choices[0].delta.content;
              }
            } catch(e) {}
          }
        }
        if (combinedContent) {
          aiData = { choices: [{ message: { content: combinedContent } }] };
        } else {
          throw new Error('Gagal membaca data stream dari AI Proxy.');
        }
      } else {
         throw new Error(`Respons API tidak valid: ${rawText.substring(0, 100)}`);
      }
    }

    if (aiData.error) {
      throw new Error(aiData.error.message || 'AI API Error');
    }

    if (!aiData.choices || aiData.choices.length === 0) {
      throw new Error('Format respons AI tidak dikenali (tidak ada choices)');
    }

    let content = aiData.choices[0].message?.content || '';
    content = content.replace(/```json/gi, '').replace(/```/g, '').trim();
    
    console.log('[AI Service Parsed Content]:', content);
    
    return JSON.parse(content);
  } catch (error) {
    console.error('Error in AI processing:', error);
    throw error;
  }
};
