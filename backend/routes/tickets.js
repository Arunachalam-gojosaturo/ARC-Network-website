// routes/tickets.js
const DB = require('../db/database');
const { parseBody, requireAuth, requireAdmin } = require('../middleware/auth');
const { ok, err } = require('../utils/respond');

async function create(req, res) {
  const user = requireAuth(req);
  if (!user) return err(res, 401, 'Login required');
  const body = await parseBody(req);
  const { type, subject, message, priority } = body;
  if (!subject || !message) return err(res, 400, 'Subject and message required');
  const t = DB.createTicket({
    userId: user.id,
    username: user.username,
    type: type || 'Bug Report',
    subject,
    body: message,
    status: 'open',
    priority: priority || 'medium',
  });
  ok(res, { ticket: t });
}

function myTickets(req, res) {
  const user = requireAuth(req);
  if (!user) return err(res, 401, 'Login required');
  ok(res, { tickets: DB.getTicketsByUser(user.id) });
}

function allTickets(req, res) {
  const admin = requireAdmin(req);
  if (!admin) return err(res, 403, 'Admin only');
  ok(res, { tickets: DB.getAllTickets() });
}

async function updateTicket(req, res, parsed) {
  const admin = requireAdmin(req);
  if (!admin) return err(res, 403, 'Admin only');
  const id = parsed.pathname.split('/').pop();
  const body = await parseBody(req);
  const t = DB.updateTicket(id, body);
  if (!t) return err(res, 404, 'Ticket not found');
  ok(res, { ticket: t });
}

module.exports = { create, myTickets, allTickets, updateTicket };
