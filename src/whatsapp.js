import { fetch } from '@forge/api';
import { storage } from '@forge/api';

const sendMessage = async (phone_number_id, recipient, message) => {
  const accessToken = await storage.getSecret('whatsapp-accessToken');
  const result = await fetch(
    'https://graph.facebook.com/v12.0/' +
      phone_number_id +
      '/messages?access_token=' +
      accessToken,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: recipient,
        text: {
          body: 'Thank you for your message. Your issue is being looked into and you will get feedback when it has been resolved.',
        },
      }),
    }
  );
  console.log(result.json());
  if (result.status === 200) {
    return true;
  }
  return false;
};

export const sendCannedResponse = async (phone_number_id, recipient) => {
  await sendMessage(
    phone_number_id,
    recipient,
    'Thank you for your message. Your issue is being looked into and you will get feedback when it has been resolved.'
  );
};

export const sendUpdateMessage = async (phone_number_id, recipient) => {
  await sendMessage(
    phone_number_id,
    recipient,
    'Your problem has been resolved.'
  );
};

export const parseWhatsappRequest = (request) => {};
