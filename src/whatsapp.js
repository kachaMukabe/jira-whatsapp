import { fetch } from '@forge/api';

export const sendMessage = async (phone_number_id, recipient, message) => {
  const result = await fetch(
    'https://graph.facebook.com/v12.0/' +
      phone_number_id +
      '/messages?access_token=' +
      'EAAQGQXKGmGwBAD8Ka6gtlhvpVdmzpQvTco8IzFnZBAKpZBbD7bBZBE0a33DxZBLQg48jK3sJmIfF5NroL4BL1zwJASbHEEnT2FnHnwVH11nnAMQ8eYwIZAeN8eNbol2mWLLARXDADwGJvfKoKizf8FW9yAHfgdKB534w1QnrSzrwfVBxjZBHzy17p8TzWY3Mw63EgVoSUsPAZDZD',
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
