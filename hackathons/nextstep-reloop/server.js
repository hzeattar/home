const http = require('http');
const fs = require('fs');
const path = require('path');
const port = process.env.PORT || 3000;
const indexPath = path.join(__dirname, 'index.html');
http.createServer((req, res) => {
  if (req.url === '/' || req.url === '/index.html') {
    return fs.readFile(indexPath, (err, data) => {
      if (err) { res.writeHead(500, {'Content-Type':'text/plain'}); return res.end('Unable to load ReLoop.'); }
      res.writeHead(200, {'Content-Type':'text/html; charset=utf-8'}); res.end(data);
    });
  }
  if (req.url === '/health') { res.writeHead(200, {'Content-Type':'application/json'}); return res.end(JSON.stringify({ok:true,service:'reloop'})); }
  res.writeHead(404, {'Content-Type':'text/plain'}); res.end('Not found');
}).listen(port, '0.0.0.0', () => console.log(`ReLoop listening on port ${port}`));
