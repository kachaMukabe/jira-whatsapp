import { fetchProjects, createIssue } from './jira';
import { sendMessage } from './whatsapp';

exports.runSync = async (request) => {
  let response = {
    headers: {
      'Content-Type': ['application/json'],
    },
    statusCode: 403,
    statusText: 'Forbidden',
  };
  if (request.method === 'GET') {
    response = handleVerifyRequest(request);
  }
  if (request.method === 'POST') {
    response = handlePostRequest(request);
  }
  return response;
};

function handleVerifyRequest(request) {
  let mode = request.queryParameters['hub.mode'];
  let token = request.queryParameters['hub.verify_token'];
  let challenge = request.queryParameters['hub.challenge'];
  console.log(mode, token, challenge);
  if (mode && token) {
    if (mode[0] === 'subscribe' && token[0] === 'banana') {
      console.log('WEBHOOK_VERIFIED');
      return {
        body: challenge[0],
        headers: {
          'Content-Type': ['application/json'],
        },
        statusCode: 200,
        statusText: 'OK',
      };
    }
  }
  return {
    headers: {
      'Content-Type': ['application/json'],
    },
    statusCode: 403,
    statusText: 'Forbidden',
  };
}

async function handlePostRequest(request) {
  let body = JSON.parse(request.body);
  if (body.object) {
    if (
      body.entry &&
      body.entry[0].changes &&
      body.entry[0].changes[0] &&
      body.entry[0].changes[0].value.messages &&
      body.entry[0].changes[0].value.messages[0]
    ) {
      let phone_number_id =
        body.entry[0].changes[0].value.metadata.phone_number_id;
      let from = body.entry[0].changes[0].value.messages[0].from; // extract the phone number from the webhook payload
      let msg_body = body.entry[0].changes[0].value.messages[0].text.body; // extract the message text from the webhook payload

      await sendMessage(phone_number_id, from, msg_body);

      let te = await createIssue(
        '10000',
        `From: ${from}`,
        msg_body,
        'Whatsapp',
        '2022-09-28'
      );
      console.log(te);
    }
    return {
      headers: {
        'Content-Type': ['application/json'],
      },
      statusCode: 200,
      statusText: 'OK',
    };
  }
  // Return a '404 Not Found' if event is not from a WhatsApp API
  return {
    headers: {
      'Content-Type': ['application/json'],
    },
    statusCode: 403,
    statusText: 'Forbidden',
  };
}
