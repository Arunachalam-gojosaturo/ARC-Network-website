// middleware/auth.js
const DB = require('../db/database');

function parseBody(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
      try { resolve(JSON.parse(body)); }
      catch { resolve({}); }
    });
  });
}

function requireAuth(req) {
  const auth = req.headers['authorization'] || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) return null;
  const payload = DB.verifyToken(token);
  if (!payload) return null;
  const user = DB.findUserById(payload.id);
  if (!user || user.banned) return null;
  return user;
}

function requireAdmin(req) {
  const user = requireAuth(req);
  return user && user.role === 'admin' ? user : null;
}

// expose verifyToken so routes can auth via query param (e.g. file downloads)
function verifyToken(token) { return DB.verifyToken(token); }

module.exports = { parseBody, requireAuth, requireAdmin, verifyToken };
