import { Request, Response } from 'express';
import prisma from '../db';
import { sendWhatsAppMessage } from '../services/waService';

export const handleOpenWaWebhook = async (req: Request, res: Response) => {
  // Always return 200 OK immediately so OpenWA doesn't timeout
  res.status(200).send('OK');

  try {
    const payload = req.body;
    console.log('[Webhook Payload received]:', JSON.stringify(payload, null, 2));
    
    // Check if this is a message event
    if (payload?.event !== 'message.received' || !payload?.data) return;

    const { from, body, type, isGroup, fromMe } = payload.data;
    
    // Ignore group messages and own messages
    if (isGroup || fromMe) return;

    const isText = type === 'text' || type === 'chat';
    const msgText = (body || '').trim();
    
    // Ignore spurious/unknown events that have no text and no image
    if (!msgText && type !== 'image') {
      console.log(`[Webhook] Ignoring empty/unknown message type: ${type}`);
      return;
    }

    console.log(`[Webhook] Incoming message from ${from}: ${msgText}`);

    // ----------------------------------------------------
    // CHECK FOR BIND COMMAND (Even if user is already known)
    // ----------------------------------------------------
    if (isText && msgText.startsWith('BIND-')) {
      const token = msgText.trim();
      
      if (token) {
        const userToBind = await prisma.user.findUnique({
          where: { wa_bind_token: token }
        });

        if (userToBind && userToBind.wa_bind_expires_at && userToBind.wa_bind_expires_at > new Date()) {
          // Fallback phone
          let fallbackPhone = from.split('@')[0];

          await prisma.user.update({
            where: { id: userToBind.id },
            data: {
              wa_lid: from,
              whatsapp: fallbackPhone,
              wa_bind_token: null,
              wa_bind_expires_at: null
            }
          });

          await sendWhatsAppMessage(from, '✅ *Berhasil!* 🎉\n\nWhatsApp Anda telah terhubung ke akun FinBareng. Mulai sekarang Anda bisa mencatat transaksi langsung dari sini!', payload.data.id);
          return;
        } else {
          await sendWhatsAppMessage(from, '❌ *Kode Kadaluarsa/Tidak Valid*\n\nSilakan generate ulang tautan dari menu Profil di web ya!', payload.data.id);
          return;
        }
      }
    }

    // Check if user is known by this LID/JID
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { wa_lid: from },
          { whatsapp: from.split('@')[0] } // Fallback if it's a real JID
        ]
      },
      include: {
        households: true
      }
    });

    if (!user) {
      // Default response for completely unknown user
      await sendWhatsAppMessage(from, '❓ *Akun Belum Terhubung*\n\nSilakan tautkan WhatsApp Anda melalui menu Profil di aplikasi web FinBareng. Klik tombol "Hubungkan WhatsApp".', payload.data.id);
      return;
    }

    // ----------------------------------------------------
    // KNOWN USER: PROCEED TO AI LOGIC
    // ----------------------------------------------------
    console.log(`[Webhook] Message from recognized user: ${user.name}`);
    
    // Always determine the target JID for replies
    let targetId = from;
    let quoteId = payload.data.id;
    if (user.whatsapp && from.includes('@lid')) {
      let formattedPhone = user.whatsapp.replace(/\D/g, '');
      if (formattedPhone.startsWith('0')) {
        formattedPhone = '62' + formattedPhone.slice(1);
      }
      targetId = `${formattedPhone}@c.us`; 
      quoteId = undefined; // Do NOT quote LID messages in a JID chat
    }

    try {
      // Check if there is an image
      let base64Image;
      let mimeType;
      if (type === 'image' && payload.data.media) {
        base64Image = payload.data.media.data;
        mimeType = payload.data.media.mimetype;
        console.log(`[Webhook] Image detected. Mimetype: ${mimeType}, Size: ${base64Image?.length}`);
      }

      // Call AI Service
      const aiService = await import('../services/aiChatService');
      const aiResponse = await aiService.processWhatsAppMessage(
        user.id,
        user.households?.[0]?.household_id || '',
        msgText,
        base64Image,
        mimeType
      );

      if (aiResponse.is_transaction && aiResponse.transaction_data) {
        let { amount, type: trxType, note, wallet_id, category_id } = aiResponse.transaction_data;
        
        const householdId = user.households?.[0]?.household_id;
        if (!householdId) {
          throw new Error('User does not belong to any household.');
        }

        const validAmount = Math.abs(Number(amount));
        if (!validAmount || isNaN(validAmount) || validAmount <= 0) {
          throw new Error('Nominal transaksi tidak valid.');
        }

        // Fallback wallet if missing or invalid
        let validWalletId = wallet_id;
        if (validWalletId) {
          const walletExists = await prisma.wallet.findUnique({ where: { id: validWalletId } });
          if (!walletExists) validWalletId = null;
        }
        if (!validWalletId) {
          const defaultWallet = await prisma.wallet.findFirst({
            where: { user_id: user.id },
            orderBy: { created_at: 'asc' }
          });
          if (!defaultWallet) {
            throw new Error('Belum ada dompet terdaftar di akun Anda.');
          }
          validWalletId = defaultWallet.id;
        }
        
        // Validate Category ID existence
        if (category_id) {
          const catExists = await prisma.category.findUnique({ where: { id: category_id } });
          if (!catExists) category_id = null;
        }

        // Force EXPENSE if TRANSFER was detected without destination
        const safeType = trxType === 'TRANSFER' ? 'EXPENSE' : trxType;

        // Create transaction
        await prisma.transaction.create({
          data: {
            amount: validAmount,
            type: safeType,
            note: note,
            date: new Date(),
            created_by: user.id,
            household_id: householdId,
            visibility: 'PRIVATE',
            wallet_id: validWalletId,
            category_id: category_id || null
          }
        });
        console.log('[Webhook] Transaction saved successfully from AI response.');
      }

      await sendWhatsAppMessage(targetId, aiResponse.reply_message, quoteId);

    } catch (aiError: any) {
      console.error('[Webhook] Error processing AI logic:', aiError);
      // Send error fallback to WA so user isn't left hanging
      const errorMsg = '🙏 Maaf, terjadi kesalahan saat memproses pesan Anda. (Error: ' + (aiError.message || 'Unknown') + ')';
      await sendWhatsAppMessage(targetId, errorMsg, quoteId);
    }

  } catch (error) {
    console.error('Error handling webhook core:', error);
  }
};
