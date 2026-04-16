const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');
const PORT = process.env.PORT || 3000;
const HTML_FILE = path.join(__dirname, 'index.html');
let SHARED = null;
function readBody(req, cb) {
  let body = '';
  req.on('data', chunk => body += chunk);
  req.on('end', () => { try { cb(JSON.parse(body)); } catch(e) { cb(null); } });
}
const server = http.createServer((req, res) => {
  const { pathname } = url.parse(req.url);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.writeHead(200); res.end(); return; }
  if (pathname === '/' && req.method === 'GET') {
    fs.readFile(HTML_FILE, (err, data) => {
      if (err) { res.writeHead(500); res.end('Erreur'); return; }
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(data);
    });
    return;
  }
  if (pathname === '/api/data' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(SHARED));
    return;
  }
  if (pathname === '/api/data' && req.method === 'POST') {
    readBody(req, data => {
      if (data) SHARED = data;
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: true }));
    });
    return;
  }
  res.writeHead(404); res.end('Not found');
});
server.listen(PORT, () => console.log('Port ' + PORT));
