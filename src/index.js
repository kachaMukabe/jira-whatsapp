import { fetchProjects, createIssue, createDefaultProject } from './jira';
import { sendCannedResponse, sendUpdateMessage } from './whatsapp';
import { storage } from '@forge/api';

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

exports.updated = async (event, context) => {
  console.log(event);
  console.log(event.issue.fields.status);
};

async function handleVerifyRequest(request) {
  let mode = request.queryParameters['hub.mode'];
  let token = request.queryParameters['hub.verify_token'];
  let challenge = request.queryParameters['hub.challenge'];
  const secretKey = await storage.getSecret('whatsapp-secretKey');
  console.log(mode, token, challenge);
  if (mode && token) {
    if (mode[0] === 'subscribe' && token[0] === secretKey) {
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
  const projectId = await storage.getSecret('whatsapp-jira-project');
  console.log(projectId, 'project Id here');
  if (!projectId) {
    createDefaultProject();
  }
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
      let name = body.entry[0].changes[0].value.contacts[0].profile.name;
      let timestamp = body.entry[0].changes[0].value.messages[0].timestamp;
      let duedate = new Date(timestamp * 1000);

      await sendCannedResponse(phone_number_id, from);

      let issue = await createIssue(
        projectId,
        `From: ${name}`,
        msg_body,
        'Whatsapp',
        duedate.toISOString().slice(0, 10)
      );
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
