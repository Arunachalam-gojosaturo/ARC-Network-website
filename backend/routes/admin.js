'use strict';
const DB = require('../db/database');
const { parseBody, requireAdmin } = require('../middleware/auth');
const { ok, err } = require('../utils/respond');

function users(req, res) {
  const admin = requireAdmin(req);
  if (!admin) return err(res, 403, 'Admin only');
  ok(res, { users: DB.getAllUsers() });
}

async function deleteUser(req, res, parsed) {
  const admin = requireAdmin(req);
  if (!admin) return err(res, 403, 'Admin only');
  const id = parsed.pathname.split('/').filter(Boolean).pop();
  if (id === admin.id) return err(res, 400, 'Cannot delete yourself');
  if (!DB.deleteUser(id)) return err(res, 404, 'User not found');
  ok(res, { message: 'User deleted' });
}

async function promoteUser(req, res, parsed) {
  const admin = requireAdmin(req);
  if (!admin) return err(res, 403, 'Admin only');
  const id = parsed.pathname.split('/').filter(Boolean)[3]; // /api/admin/users/:id/promote
  if (!DB.promoteToAdmin(id)) return err(res, 404, 'User not found');
  ok(res, { message: 'User promoted to admin' });
}

async function banUser(req, res, parsed) {
  const admin = requireAdmin(req);
  if (!admin) return err(res, 403, 'Admin only');
  const id = parsed.pathname.split('/').filter(Boolean)[3];
  const body = await parseBody(req);
  const u = DB.updateUser(id, { banned: body.banned === true });
  if (!u) return err(res, 404, 'User not found');
  ok(res, { message: body.banned ? 'User banned' : 'User unbanned' });
}

function stats(req, res) {
  const admin = requireAdmin(req);
  if (!admin) return err(res, 403, 'Admin only');
  ok(res, { stats: DB.getStats() });
}

module.exports = { users, deleteUser, promoteUser, banUser, stats };
