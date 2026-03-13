// routes/messages.js
const DB = require('../db/database');
const { parseBody, requireAuth, requireAdmin } = require('../middleware/auth');
const { ok, err } = require('../utils/respond');

function list(req, res) {
  const user = requireAuth(req);
  if (!user) return err(res, 401, 'Login required');
  ok(res, { messages: DB.getAllMessages().slice(-100) });
}

async function send(req, res) {
  const user = requireAuth(req);
  if (!user) return err(res, 401, 'Login required');
  const body = await parseBody(req);
  const { message } = body;
  if (!message || !message.trim()) return err(res, 400, 'Message required');
  const m = DB.addMessage({
    fromUserId: user.id,
    fromUsername: user.username,
    message: message.trim().slice(0, 500),
    isAdmin: user.role === 'admin',
  });
  ok(res, { message: m });
}

module.exports = { list, send };
