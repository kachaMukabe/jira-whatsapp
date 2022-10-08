import { fetch } from '@forge/api';
import { storage } from '@forge/api';

export const sendMessage = async (phone_number_id, recipient, message) => {
  const accessToken = await storage.getSecret('whatsapp-accessToken');
  console.log('Sending message', accessToken);
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
        text: { body: 'Away ' + message },
      }),
    }
  );
  console.log(result.json());
  if (result.status === 200) {
    return true;
  }
  return false;
};

export const parseWhatsappRequest = (request) => {};
