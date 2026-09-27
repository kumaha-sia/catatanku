import prisma from '../db';

export const sendWhatsAppMessage = async (phone: string, text: string, quotedMessageId?: string) => {
  try {
    const settings = await prisma.systemSetting.findMany({
      where: { key: { in: ['WA_ENDPOINT', 'WA_API_KEY', 'WA_SESSION_ID'] } }
    });

    const getVal = (k: string) => settings.find(s => s.key === k)?.value;
    
    const waEndpoint = getVal('WA_ENDPOINT');
    const waApiKey = getVal('WA_API_KEY');
    const waSessionId = getVal('WA_SESSION_ID');

    if (!waEndpoint || !waApiKey || !waSessionId) {
      console.log('WhatsApp configuration is missing in System Settings.');
      return false;
    }

    // Format phone number to standard WA @c.us format, unless it's already an LID or JID
    let chatId = phone;
    if (!phone.includes('@')) {
      let formattedPhone = phone.replace(/\D/g, '');
      if (formattedPhone.startsWith('0')) {
        formattedPhone = '62' + formattedPhone.slice(1);
      }
      chatId = `${formattedPhone}@c.us`;
    }
    
    let url = `${waEndpoint}/api/sessions/${waSessionId}/messages/send-text`;
    let payload: any = { chatId, text };

    if (quotedMessageId) {
      url = `${waEndpoint}/api/sessions/${waSessionId}/messages/reply`;
      payload = { chatId, text, quotedMessageId };
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'X-API-Key': waApiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Failed to send WA message:', errText);
      return false;
    }

    console.log(`WA message sent successfully to ${chatId}`);
    return true;

  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
    return false;
  }
};
