import api, { route } from '@forge/api';

export const createDefaultProject = async () => {};

export const fetchProjects = async () => {
  const res = await api.asApp().requestJira(route`/rest/api/3/project/search`, {
    headers: {
      Accept: 'application/json',
    },
  });

  const data = await res.json();
  return data.values.map(({ key, name, id }) => ({ key, name, id }));
};

export const createIssue = async (
  projectId,
  summary,
  issueContent,
  task,
  duedate
) => {
  let bodyData = `{
	  "update": {},
	  "fields": {
	    "summary": "${summary}",
	    "issuetype": {
	      "id": "10002"
	    },
	    "project": {
	      "id": "${projectId}"
	    },
	    "description": {
	      "type": "doc",
	      "version": 1,
	      "content": [
		{
		  "type": "paragraph",
		  "content": [
		    {
		      "text": "${issueContent}",
		      "type": "text"
		    }
		  ]
		}
	      ]
	    },
	    "labels": [
	      "bugfix",
	      "blitz_test"
	    ],
	    "duedate": "${duedate}"
	  }
	}`;
  const response = await api.asApp().requestJira(route`/rest/api/3/issue`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: bodyData,
  });
  let result = await response.json();
  return result;
};
