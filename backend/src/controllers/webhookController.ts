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
      // ----------------------------------------------------
      // UNKNOWN USER (LID/JID NOT LINKED)
      // ----------------------------------------------------
      if (isText && msgText.startsWith('/link')) {
        const parts = msgText.split(' ');
        const phone = parts[1]?.replace(/\D/g, ''); // Extract only numbers
        
        if (phone) {
          // Normalize phone to both '08...' and '628...' formats for the DB search
          let altPhone = phone;
          if (phone.startsWith('62')) {
            altPhone = '0' + phone.substring(2);
          } else if (phone.startsWith('0')) {
            altPhone = '62' + phone.substring(1);
          }

          // Find user by phone number
          const linkedUser = await prisma.user.findFirst({
            where: { 
              OR: [
                { whatsapp: phone },
                { whatsapp: altPhone }
              ]
            }
          });

          if (linkedUser) {
            await prisma.user.update({
              where: { id: linkedUser.id },
              data: { wa_lid: from }
            });
            await sendWhatsAppMessage(from, '✅ *Hore! Akun FinBareng kamu berhasil terhubung!* 🥳\n\nMulai sekarang, kamu bisa langsung *chat* aku buat nyatet pengeluaran. Contohnya:\n💬 _"Beli kopi 20rb pake BCA"_\n\nAtau kamu juga bisa langsung kirim *foto struk belanja* ke sini! Asik kan? 🚀', payload.data.id);
          } else {
            await sendWhatsAppMessage(from, `❌ *Duh, nomor WA (${phone} / ${altPhone}) gak ketemu nih.* 🥺\n\nPastikan nomornya udah bener dan sesuai sama yang kamu simpan di halaman *Profil* aplikasi FinBareng ya!`, payload.data.id);
          }
        } else {
          await sendWhatsAppMessage(from, '❌ *Formatnya salah, kak!* 😅\n\nKetik kayak gini ya:\n👉 */link 62812345678*', payload.data.id);
        }
      } else {
        await sendWhatsAppMessage(
          from, 
          'Halo kak! 👋 Kenalin, aku asisten cerdas dari *FinBareng*.\n\nKayaknya nomor WA kamu belum terhubung nih. Biar aku bisa bantu catatin pengeluaranmu secara otomatis, balas pesan ini dengan perintah:\n👉 */link 62812345678*\n\n_(Ganti angkanya dengan nomor WA yang terdaftar di aplikasi kamu ya! 🚀)_',
          payload.data.id
        );
      }
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

        // Anti-Hallucination Fallback: Validate Wallet ID existence
        if (wallet_id) {
          const walletExists = await prisma.wallet.findUnique({ where: { id: wallet_id } });
          if (!walletExists) wallet_id = undefined; // Let it fail gracefully or AI prompt will need a solid fallback
        }
        
        // Anti-Hallucination Fallback: Validate Category ID existence
        if (category_id) {
          const catExists = await prisma.category.findUnique({ where: { id: category_id } });
          if (!catExists) category_id = null;
        }

        // Create transaction
        await prisma.transaction.create({
          data: {
            amount: Number(amount),
            type: trxType,
            note: note,
            date: new Date(),
            created_by: user.id,
            household_id: householdId,
            visibility: 'PRIVATE',
            wallet_id: wallet_id,
            category_id: category_id || null
          }
        });
        console.log('[Webhook] Transaction saved successfully from AI response.');
      }

      await sendWhatsAppMessage(targetId, aiResponse.reply_message, quoteId);

    } catch (aiError: any) {
      console.error('[Webhook] Error processing AI logic:', aiError);
      // Send error fallback to WA so user isn't left hanging
      const errorMsg = '⚠️ Maaf, terjadi kesalahan saat memproses pesan Anda. (Error: ' + (aiError.message || 'Unknown') + ')';
      await sendWhatsAppMessage(targetId, errorMsg, quoteId);
    }

  } catch (error) {
    console.error('Error handling webhook core:', error);
  }
};
