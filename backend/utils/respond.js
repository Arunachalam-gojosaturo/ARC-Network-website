// utils/respond.js
function json(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}
function ok(res, data)  { json(res, 200, { ok: true,  ...data }); }
function err(res, status, message) { json(res, status, { ok: false, message }); }

module.exports = { ok, err };
