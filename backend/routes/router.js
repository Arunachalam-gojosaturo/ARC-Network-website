'use strict';
const auth     = require('./auth');
const software = require('./software');
const tickets  = require('./tickets');
const messages = require('./messages');
const admin    = require('./admin');
const { err }  = require('../utils/respond');

module.exports = {
  handle(req, res, parsed) {
    const m = req.method;
    const p = parsed.pathname;

    // ── Auth ─────────────────────────────────────────────
    if (m==='POST' && p==='/api/auth/register')                            return auth.register(req,res);
    if (m==='POST' && p==='/api/auth/login')                               return auth.login(req,res);
    if (m==='GET'  && p==='/api/auth/me')                                  return auth.me(req,res);
    if (m==='GET'  && p==='/api/auth/google/status')                       return auth.googleStatus(req,res);
    if (m==='GET'  && p==='/api/auth/google')                              return auth.googleRedirect(req,res);
    if (m==='GET'  && p==='/api/auth/callback/google')                     return auth.googleCallback(req,res,parsed);

    // ── Software ──────────────────────────────────────────
    if (m==='GET'    && p==='/api/software')                               return software.list(req,res);
    if (m==='POST'   && p==='/api/software')                               return software.upload(req,res);
    // POST /api/software/:id/download — log download, return hasFile info
    if (m==='POST'   && p.match(/^\/api\/software\/[^/]+\/download$/))    return software.download(req,res,parsed);
    // GET  /api/software/:id/file?token=JWT — serve actual file bytes
    if (m==='GET'    && p.match(/^\/api\/software\/[^/]+\/file$/))        return software.serveFile(req,res,parsed);
    if (m==='DELETE' && p.match(/^\/api\/software\/[^/]+$/))              return software.deleteSw(req,res,parsed);

    // ── Tickets ───────────────────────────────────────────
    if (m==='POST'  && p==='/api/tickets')                                 return tickets.create(req,res);
    if (m==='GET'   && p==='/api/tickets/mine')                            return tickets.myTickets(req,res);
    if (m==='GET'   && p==='/api/tickets')                                 return tickets.allTickets(req,res);
    if (m==='PUT'   && p.match(/^\/api\/tickets\/[^/]+$/))                return tickets.updateTicket(req,res,parsed);

    // ── Messages ──────────────────────────────────────────
    if (m==='GET'  && p==='/api/messages')                                 return messages.list(req,res);
    if (m==='POST' && p==='/api/messages')                                 return messages.send(req,res);

    // ── Admin ─────────────────────────────────────────────
    if (m==='GET'    && p==='/api/admin/users')                            return admin.users(req,res);
    if (m==='DELETE' && p.match(/^\/api\/admin\/users\/[^/]+$/))          return admin.deleteUser(req,res,parsed);
    if (m==='POST'   && p.match(/^\/api\/admin\/users\/[^/]+\/promote$/)) return admin.promoteUser(req,res,parsed);
    if (m==='PUT'    && p.match(/^\/api\/admin\/users\/[^/]+\/ban$/))     return admin.banUser(req,res,parsed);
    if (m==='GET'    && p==='/api/admin/stats')                            return admin.stats(req,res);

    err(res, 404, `Not found: ${m} ${p}`);
  }
};
