import cron from 'node-cron';
import prisma from '../db';
import { sendWhatsAppMessage } from '../services/waService';

export const startReminderCron = () => {
  // Run every minute
  cron.schedule('* * * * *', async () => {
    try {
      const now = new Date();
      
      // Get users who enabled reminder
      const users = await prisma.user.findMany({
        where: {
          reminder_enabled: true
        }
      });

      for (const user of users) {
        // Determine user's local time string HH:mm
        const userTimeStr = new Intl.DateTimeFormat('en-US', {
          timeZone: user.timezone || 'Asia/Jakarta',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        }).format(now);

        // Check if current minute matches their preference
        if (userTimeStr === user.reminder_time) {
          // Verify if we already sent a message today (prevent duplicates if cron fires multiple times in same minute somehow, or process restarts)
          if (user.last_reminder_sent_at) {
            const lastSentDate = new Intl.DateTimeFormat('en-US', {
              timeZone: user.timezone || 'Asia/Jakarta',
              year: 'numeric',
              month: '2-digit',
              day: '2-digit'
            }).format(user.last_reminder_sent_at);
            
            const todayDate = new Intl.DateTimeFormat('en-US', {
              timeZone: user.timezone || 'Asia/Jakarta',
              year: 'numeric',
              month: '2-digit',
              day: '2-digit'
            }).format(now);

            if (lastSentDate === todayDate) {
              continue; // Already sent today
            }
          }

          // Check if user has any transactions created today
          // We must compute "Start of Day" and "End of Day" in user's timezone, or just fetch all today in UTC?
          // Simplest is to get start/end of day relative to their timezone.
          const dateString = new Intl.DateTimeFormat('en-US', {
            timeZone: user.timezone || 'Asia/Jakarta',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
          }).format(now); // MM/DD/YYYY
          
          const [month, day, year] = dateString.split('/');
          const startOfDay = new Date(`${year}-${month}-${day}T00:00:00.000Z`); // This is UTC, we offset it:
          
          // Better way: Find transactions created by this user in the last 24h, or more precisely today.
          // Since it's run at e.g. 20:00 user time, checking transactions in the last 24h is usually safe.
          const today = new Date();
          const startOfUserDay = new Date(today.toLocaleString("en-US", {timeZone: user.timezone || 'Asia/Jakarta'}));
          startOfUserDay.setHours(0, 0, 0, 0);

          const endOfUserDay = new Date(startOfUserDay);
          endOfUserDay.setDate(endOfUserDay.getDate() + 1);

          const transactionCount = await prisma.transaction.count({
            where: {
              created_by: user.id,
              date: {
                gte: startOfUserDay,
                lt: endOfUserDay
              }
            }
          });

          if (transactionCount === 0) {
            const msg = `Pstt... Halo ${user.name}! 🕵️‍♂️ Dompetmu berbisik nih, katanya ada pengeluaran yang belum dicatat hari ini. Yuk buka FinBareng sekarang dan catat selagi ingat, biar uang belanja bulan ini tetap aman terkendali! 🚀💰`;
            
            let success = false;
            if (user.whatsapp) {
              success = await sendWhatsAppMessage(user.whatsapp, msg);
            }
            
            // Fallback to In-App Notification if WA fails or doesn't exist
            if (!user.whatsapp || !success) {
              await prisma.notification.create({
                data: {
                  user_id: user.id,
                  type: 'REMINDER',
                  title: 'Waktunya Mencatat! 📝',
                  body: msg,
                  action_url: '/'
                }
              });
              success = true;
            }

            if (success) {
              await prisma.user.update({
                where: { id: user.id },
                data: { last_reminder_sent_at: new Date() }
              });
            }
          } else {
             // Even if they have transactions, we update last_reminder_sent_at so we don't query again today
             await prisma.user.update({
              where: { id: user.id },
              data: { last_reminder_sent_at: new Date() }
            });
          }
        }
      }
    } catch (error) {
      console.error('Error in Reminder Cron Job:', error);
    }
  });

  console.log('Daily Reminder Cron Job initialized.');
};
