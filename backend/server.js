'use strict';
// Load .env file if present (no dotenv needed)
(function loadEnv() {
  const fs = require('fs'), path = require('path');
  const envFile = path.join(__dirname, '.env');
  if (!fs.existsSync(envFile)) return;
  fs.readFileSync(envFile, 'utf8').split('\n').forEach(line => {
    line = line.trim();
    if (!line || line.startsWith('#')) return;
    const eq = line.indexOf('=');
    if (eq < 0) return;
    const key = line.slice(0, eq).trim();
    const val = line.slice(eq + 1).trim().replace(/^["']|["']$/g, '');
    if (!process.env[key]) process.env[key] = val;
  });
})();

const http   = require('http');
const url    = require('url');
const path   = require('path');
const fs     = require('fs');
const DB     = require('./db/database');
const router = require('./routes/router');
const { log }= require('./utils/logger');

const PORT         = process.env.PORT || 3000;
const FRONTEND_DIR = path.join(__dirname, '..', 'frontend');
const UPLOADS_DIR  = path.join(__dirname, 'uploads');

if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

const MIME = {
  '.html':'text/html','.css':'text/css','.js':'application/javascript',
  '.json':'application/json','.png':'image/png','.jpg':'image/jpeg',
  '.jpeg':'image/jpeg','.gif':'image/gif','.svg':'image/svg+xml',
  '.ico':'image/x-icon','.woff2':'font/woff2','.woff':'font/woff',
  '.zip':'application/zip','.pdf':'application/pdf','.tar':'application/x-tar',
};

const PAGE_MAP = {
  '/':'/pages/index.html','/login':'/pages/login.html',
  '/register':'/pages/register.html','/dashboard':'/pages/dashboard.html',
  '/topics':'/pages/topics.html','/download':'/pages/download.html',
  '/guide':'/pages/guide.html','/support':'/pages/support.html',
  '/about':'/pages/about.html','/admin':'/pages/admin.html',
};

function serveStatic(req, res) {
  const cleanPath = req.url.split('?')[0];
  let filePath;
  const mapped = PAGE_MAP[cleanPath];
  if (mapped) {
    filePath = path.join(FRONTEND_DIR, mapped);
  } else if (cleanPath.startsWith('/uploads/')) {
    filePath = path.join(UPLOADS_DIR, path.basename(cleanPath));
  } else {
    filePath = path.join(FRONTEND_DIR, cleanPath);
  }
  // path traversal guard
  const resolved     = path.resolve(filePath);
  const frontendBase = path.resolve(FRONTEND_DIR);
  const uploadsBase  = path.resolve(UPLOADS_DIR);
  if (!resolved.startsWith(frontendBase) && !resolved.startsWith(uploadsBase)) {
    res.writeHead(403); res.end('Forbidden'); return;
  }
  fs.readFile(resolved, (err, data) => {
    if (err) {
      fs.readFile(path.join(FRONTEND_DIR, 'pages/index.html'), (e2, d2) => {
        if (e2) { res.writeHead(404); res.end('Not Found'); return; }
        res.writeHead(200, { 'Content-Type': 'text/html', 'Cache-Control': 'no-cache' });
        res.end(d2);
      });
      return;
    }
    const ext = path.extname(resolved).toLowerCase();
    res.writeHead(200, {
      'Content-Type': MIME[ext] || 'application/octet-stream',
      'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=3600',
    });
    res.end(data);
  });
}

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }
  const parsed = url.parse(req.url, true);
  log(`${req.method} ${parsed.pathname}`);
  if (parsed.pathname.startsWith('/api/')) { router.handle(req, res, parsed); return; }
  serveStatic(req, res);
});

DB.init();
server.listen(PORT, () => log(`ARC-NETWORK v3 → http://localhost:${PORT}`));
