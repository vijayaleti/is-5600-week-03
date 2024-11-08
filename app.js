const express = require('express');
const path = require('path');
const EventEmitter = require('events');

const port = process.env.PORT || 3000;
const chatEmitter = new EventEmitter();


function respondText(req, res) {
    res.setHeader('Content-Type', 'text/plain');
    res.end('hi');
}
  
function respondJson(req, res) {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ text: 'hi', numbers: [1, 2, 3] }));
}

function respondNotFound(req, res) {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
}

function respondEcho(req, res) {
    const urlObj = new URL(req.url, `http://${req.headers.host}`);
    const input = urlObj.searchParams.get('input') || '';

    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
        normal: input,
        shouty: input.toUpperCase(),
        charCount: input.length,
        backwards: input.split('').reverse().join(''),
    }));
}

function chatApp(req, res){
    res.sendFile(path.join(__dirname, '/chat.html'));
}

function respondChat(req, res) {
    const {message} = req.query

    chatEmitter.emit('message', message);
    res.end();
}

function respondSSE(req, res) {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    });
  
    const onMessage = message => res.write(`data: ${message}\n\n`);
    chatEmitter.on('message', onMessage);
  
    res.on('close', () => {
      chatEmitter.off('message', onMessage);
      res.end();
    });
  }

const app = express();
app.use(express.static(path.join(__dirname, '/public')));
app.get('/', chatApp);
app.get('/chat', respondChat);
app.get('/sse', respondSSE);

app.listen(port, function() {
  console.log(`Server is listening on port ${port}`);
});