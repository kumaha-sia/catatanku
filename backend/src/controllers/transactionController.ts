import { Response } from 'express';
import prisma from '../db';
import { AuthRequest } from '../middlewares/authMiddleware';
import asyncHandler from 'express-async-handler';
import { z } from 'zod';

const createTransactionSchema = z.object({
  household_id: z.string().uuid(),
  wallet_id: z.string().uuid(),
  destination_wallet_id: z.string().uuid().optional().nullable(),
  category_id: z.string().uuid().optional().nullable(),
  type: z.enum(['INCOME', 'EXPENSE', 'TRANSFER']),
  amount: z.number().positive(),
  date: z.string().datetime(),
  note: z.string().optional().nullable(),
  visibility: z.enum(['PRIVATE', 'FAMILY']).default('FAMILY'),
  paid_by_member_id: z.string().uuid().optional().nullable(),
});

export const getTransactions = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;
  const householdId = req.query.household_id as string | undefined;
  const month = req.query.month as string | undefined;
  const year = req.query.year as string | undefined;
  const { limit = 20, page = 1 } = req.query;

  const take = Number(limit);
  const skip = (Number(page) - 1) * take;

  let whereClause: any = {};

  if (month && year) {
    const startDate = new Date(Number(year), Number(month) - 1, 1);
    const endDate = new Date(Number(year), Number(month), 0, 23, 59, 59, 999);
    whereClause.date = {
      gte: startDate,
      lte: endDate
    };
  }

  if (householdId) {
    const membership = await prisma.householdMember.findUnique({
      where: { household_id_user_id: { household_id: householdId, user_id: userId! } }
    });

    if (!membership || membership.status !== 'ACTIVE') {
      res.status(403);
      throw new Error('Access denied to household');
    }
    
    // Get all active members of this household
    const allMembers = await prisma.householdMember.findMany({
      where: { household_id: householdId, status: 'ACTIVE' }
    });
    const memberIds = allMembers.map(m => m.user_id);
    
    // Isolate by household_id, created_by in members, and enforce privacy
    whereClause.household_id = householdId;
    whereClause.created_by = { in: memberIds };
    whereClause.OR = [
      { visibility: 'FAMILY' },
      { created_by: userId } // Creator can always see their own private transactions
    ];
  } else {
    // If no household specified, return the user's own transactions
    whereClause.created_by = userId;
  }

  const transactions = await prisma.transaction.findMany({
    where: whereClause,
    include: {
      category: true,
      wallet: true,
      destination_wallet: true,
      creator: { select: { id: true, name: true } }
    },
    orderBy: { date: 'desc' },
    take,
    skip
  });

  const total = await prisma.transaction.count({
    where: whereClause
  });

  res.json({
    status: 'success',
    data: transactions,
    pagination: { total, page: Number(page), limit: take }
  });
});

export const createTransaction = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;
  const data = createTransactionSchema.parse(req.body);

  const membership = await prisma.householdMember.findUnique({
    where: { household_id_user_id: { household_id: data.household_id, user_id: userId! } }
  });

  if (!membership || membership.status !== 'ACTIVE') {
    res.status(403);
    throw new Error('Access denied to household');
  }

  // Validate origin wallet ownership
  const originWallet = await prisma.wallet.findUnique({ where: { id: data.wallet_id } });
  if (!originWallet) {
    res.status(404);
    throw new Error('Dompet asal tidak ditemukan');
  }
  if (originWallet.user_id !== userId && (originWallet.scope !== 'SHARED' || originWallet.household_id !== data.household_id)) {
    res.status(403);
    throw new Error('Anda tidak memiliki akses ke dompet ini');
  }

  // Handle transfer validations
  let destWalletId: string | null = null;
  if (data.type === 'TRANSFER') {
    if (!data.destination_wallet_id) {
      res.status(400);
      throw new Error('Dompet tujuan wajib diisi untuk transaksi transfer');
    }
    if (data.destination_wallet_id === data.wallet_id) {
      res.status(400);
      throw new Error('Dompet tujuan tidak boleh sama dengan dompet asal');
    }
    const destWallet = await prisma.wallet.findUnique({ where: { id: data.destination_wallet_id } });
    if (!destWallet) {
      res.status(404);
      throw new Error('Dompet tujuan tidak ditemukan');
    }
    destWalletId = data.destination_wallet_id;
  }

  const transaction = await prisma.transaction.create({
    data: {
      household_id: data.household_id,
      wallet_id: data.wallet_id,
      destination_wallet_id: destWalletId,
      category_id: data.type === 'TRANSFER' ? null : data.category_id,
      type: data.type,
      amount: data.amount,
      date: new Date(data.date),
      note: data.note,
      visibility: data.visibility,
      created_by: userId!,
      paid_by_member_id: data.paid_by_member_id
    },
    include: { category: true, wallet: true, destination_wallet: true }
  });

  res.status(201).json({ status: 'success', data: transaction });
});

export const updateTransaction = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;
  const id = req.params.id as string;
  const data = createTransactionSchema.partial().parse(req.body);

  const existing = await prisma.transaction.findUnique({ where: { id } });
  if (!existing) {
    res.status(404);
    throw new Error('Transaction not found');
  }

  if (existing.created_by !== userId) {
    res.status(403);
    throw new Error('Only the creator can edit this transaction');
  }

  const updated = await prisma.transaction.update({
    where: { id },
    data: {
      ...data,
      date: data.date ? new Date(data.date) : undefined
    },
    include: { category: true, wallet: true, destination_wallet: true }
  });

  res.status(200).json({ status: 'success', data: updated });
});

export const deleteTransaction = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;
  const id = req.params.id as string;

  const existing = await prisma.transaction.findUnique({ where: { id } });
  if (!existing) {
    res.status(404);
    throw new Error('Transaction not found');
  }

  if (existing.created_by !== userId) {
    res.status(403);
    throw new Error('Only the creator can delete this transaction');
  }

  await prisma.transaction.delete({ where: { id } });
  res.status(200).json({ status: 'success', message: 'Transaction deleted' });
});

// trigger restart

// trigger restart 2


export const scanReceipt = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      res.status(400).json({ status: 'error', message: 'No image provided' });
      return;
    }

    // Read AI config from DB
    const settings = await prisma.systemSetting.findMany({
      where: { key: { in: ['AI_BASE_URL', 'AI_API_KEY', 'AI_MODEL'] } }
    });
    
    const getConfig = (k: string) => settings.find(s => s.key === k)?.value;
    const baseUrl = getConfig('AI_BASE_URL');
    const apiKey = getConfig('AI_API_KEY');
    const aiModel = getConfig('AI_MODEL') || 'gpt-4-vision-preview';

    if (!baseUrl || !apiKey) {
      res.status(500).json({ status: 'error', message: 'Konfigurasi AI belum diatur oleh Admin' });
      return;
    }

    const base64Image = req.file.buffer.toString('base64');
    const mimeType = req.file.mimetype;

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
          {
            role: 'user',
            content: [
              { type: 'text', text: 'Extract the transaction data from this receipt. Return ONLY a JSON object in this exact format, with no markdown wrapping: {"amount": number, "note": "string", "date": "YYYY-MM-DD"}. Ignore currency symbols. Return just the raw JSON.' },
              { type: 'image_url', image_url: { url: `data:${mimeType};base64,${base64Image}` } }
            ]
          }
        ],
        max_tokens: 200
      })
    });

    const rawText = await response.text();
    let aiData;
    
    try {
      aiData = JSON.parse(rawText);
    } catch (parseErr) {
      // Proxy Router returned a stream even though stream: false was passed, or returned invalid JSON
      console.log('AI returned non-JSON or stream. Attempting to parse stream data...');
      if (rawText.includes('data: ')) {
        let combinedContent = '';
        const lines = rawText.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ') && !line.includes('[DONE]')) {
            try {
              const chunk = JSON.parse(line.replace('data: ', '').trim());
              if (chunk.choices?.[0]?.delta?.content) {
                combinedContent += chunk.choices[0].delta.content;
              } else if (chunk.choices?.[0]?.message?.content) {
                combinedContent += chunk.choices[0].message.content;
              }
            } catch(e) {}
          }
        }
        if (combinedContent) {
          aiData = { choices: [{ message: { content: combinedContent } }] };
        } else {
          throw new Error('Gagal membaca data stream dari AI Proxy. Format tidak didukung.');
        }
      } else {
         // Some other HTML error (like 502 Bad Gateway from Nginx)
         throw new Error(`Respons API tidak valid: ${rawText.substring(0, 100)}`);
      }
    }

    console.log('AI Parsed Response:', JSON.stringify(aiData, null, 2));

    if (aiData.error) {
      res.status(500).json({ status: 'error', message: aiData.error.message || 'AI API Error' });
      return;
    }

    if (!aiData.choices || aiData.choices.length === 0) {
      res.status(500).json({ status: 'error', message: 'Format respons AI tidak dikenali (tidak ada choices)' });
      return;
    }

    let content = aiData.choices[0].message?.content || '';
    // Cleanup markdown if AI ignores instructions
    content = content.replace(/```json/gi, '').replace(/```/g, '').trim();
    const extractedData = JSON.parse(content);

    res.status(200).json({ status: 'success', data: extractedData });
  } catch (error: any) {
    console.error('AI Scan Error:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
};
