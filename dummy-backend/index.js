const http = require('http');

const hostname = '0.0.0.0';
const port = 5000;
const authToken = 'auth_token';

const appeals = [
  {
    id: 1,
    title: 'Something went wrong!',
    messages: [{ text: 'a message', isAdmin: false }],
  },
  {
    id: 2,
    title: 'I got an error',
    messages: [{ text: 'another message', isAdmin: false }],
  },
  {
    id: 3,
    title: 'An error occurred',
    messages: [{ text: 'test', isAdmin: false }],
  },
];

const handleLogin = (req, res) => {
  let body = '';

  req.on('data', (chunk) => {
    body += chunk;
  });

  req.on('end', () => {
    const data = JSON.parse(body);
    const username = data.username;
    const password = data.password;

    res.setHeader('Content-Type', 'application/json');

    if (username === 'admin' && password === 'admin') {
      const response = { token: authToken, refreshToken: 'refresh_token' };
      res.statusCode = 200;
      res.end(JSON.stringify(response));
    } else {
      res.statusCode = 401;
      res.end(JSON.stringify({ error: 'Unauthorized' }));
    }
  });
};

const executeHandlerForAuthenticatedUser = (req, res, handler) => {
  const headers = req.headers;

  if (headers.authorization !== `Bearer ${authToken}`) {
    res.statusCode = 401;
    res.end(JSON.stringify({ error: 'Unauthorized' }));
    return false;
  }

  handler(req, res);
};

const responseInJson = (res, data, code = 200) => {
  res.setHeader('Content-Type', 'application/json');
  res.statusCode = code;
  res.end(JSON.stringify(data));
};

const handleAppeal = (req, res) => {
  const appealId = req.url.split('/').pop();
  const item = appeals.find((item) => item.id.toString() === appealId);

  responseInJson(res, item);
};

const handleAddMessage = (req, res) => {
  const appealId = req.url.match(/\d+/).shift();
  let body = '';

  req.on('data', (chunk) => {
    body += chunk;
  });

  req.on('end', () => {
    const data = JSON.parse(body);
    const message = data.message;
    const isAdmin = data.isAdmin;

    appeals.forEach((appeal) => {
      if (appeal.id.toString() === appealId) {
        appeal.messages.push({ text: message, isAdmin });
      }
    });

    responseInJson(res, '');
  });
};

const handleAppealsList = (req, res) => {
  const appealsList = appeals.map((item) => ({
    id: item.id,
    title: item.title,
  }));

  responseInJson(res, appealsList);
};

const addMessageUrlRx = /\/api\/appeals\/\d+\/add-message/;

const server = http.createServer((req, res) => {
  if (req.url === '/api/admin_login' && req.method === 'POST') {
    handleLogin(req, res);
  } else if (req.url === '/api/appeals' && req.method === 'GET') {
    executeHandlerForAuthenticatedUser(req, res, handleAppealsList);
  } else if (/\/api\/appeals\/\d+/.test(req.url) && req.method === 'GET') {
    executeHandlerForAuthenticatedUser(req, res, handleAppeal);
  } else if (addMessageUrlRx.test(req.url) && req.method === 'POST') {
    executeHandlerForAuthenticatedUser(req, res, handleAddMessage);
  } else {
    responseInJson(res, { error: 'Not found' }, 404);
  }
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
