'use strict';
const path = require('path');
const fs   = require('fs');
const DB   = require('../db/database');
const { requireAuth, requireAdmin, verifyToken } = require('../middleware/auth');
const { ok, err } = require('../utils/respond');
const { parseMultipart, formatSize } = require('../utils/multipart');

// ── List all software ─────────────────────────────────────────
function list(req, res) {
  ok(res, { software: DB.getAllSoftware() });
}

// ── Upload (admin only, supports real file or metadata-only) ──
async function upload(req, res) {
  const admin = requireAdmin(req);
  if (!admin) return err(res, 403, 'Admin only');

  const contentType = req.headers['content-type'] || '';
  let name, version, category, platform, description, size, icon, filename = null;

  if (contentType.includes('multipart/form-data')) {
    try {
      const { fields, files } = await parseMultipart(req);
      name        = (fields.name        || '').trim();
      version     = (fields.version     || '').trim();
      category    = (fields.category    || 'Other').trim();
      platform    = (fields.platform    || 'Linux').trim();
      description = (fields.description || '').trim();
      icon        = (fields.icon        || '📦').trim();

      if (files.file) {
        size     = formatSize(files.file.size);
        filename = files.file.savedName;
        console.log(`[Upload] File saved: ${filename} (${size})`);
      } else {
        size = (fields.size || 'Unknown').trim();
      }
    } catch (e) {
      console.error('[Upload] Parse error:', e.message);
      return err(res, 400, 'Upload failed: ' + e.message);
    }
  } else {
    // JSON-only (no file)
    const body = await parseBody(req);
    name        = (body.name        || '').trim();
    version     = (body.version     || '').trim();
    category    = (body.category    || 'Other').trim();
    platform    = (body.platform    || 'Linux').trim();
    description = (body.description || '').trim();
    size        = (body.size        || 'Unknown').trim();
    icon        = (body.icon        || '📦').trim();
  }

  if (!name || !version) return err(res, 400, 'Name and version are required');

  const sw = DB.addSoftware({
    name, version, category, platform,
    description: description || 'No description provided.',
    size, icon, filename,
    uploadedBy: admin.username,
  });

  console.log(`[Upload] Added: ${sw.name} v${sw.version} | file: ${filename || 'none'}`);
  ok(res, { software: sw });
}

// ── Log download + return whether a real file exists ──────────
async function download(req, res, parsed) {
  const user = requireAuth(req);
  if (!user) return err(res, 401, 'Login required to download');

  const id = parsed.pathname.split('/').filter(Boolean)[2];
  const sw = DB.getSoftwareById(id);
  if (!sw) return err(res, 404, 'Software not found');

  DB.incrementDownload(id);
  DB.logDownload(user.id, id);

  const hasFile = !!(sw.filename && fs.existsSync(
    path.join(__dirname, '..', 'uploads', sw.filename)
  ));

  ok(res, {
    hasFile,
    filename: sw.filename ? `${sw.name}_v${sw.version}${path.extname(sw.filename)}` : null,
    software: sw,
    message: hasFile
      ? `Downloading ${sw.name} v${sw.version}`
      : `Download logged: ${sw.name} v${sw.version} (no file attached)`,
  });
}

// ── Serve the actual file bytes ───────────────────────────────
// GET /api/software/:id/file?token=JWT
function serveFile(req, res, parsed) {
  // Auth via query param token (since it's a direct browser navigation)
  const token = parsed.query.token || '';
  const payload = token ? verifyToken(token) : null;
  if (!payload) {
    res.writeHead(401, { 'Content-Type': 'text/plain' });
    res.end('Unauthorized — please log in');
    return;
  }

  const id = parsed.pathname.split('/').filter(Boolean)[2];
  const sw = DB.getSoftwareById(id);
  if (!sw || !sw.filename) {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('File not found');
    return;
  }

  const filePath = path.join(__dirname, '..', 'uploads', sw.filename);
  if (!fs.existsSync(filePath)) {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('File not found on server');
    return;
  }

  const stat     = fs.statSync(filePath);
  const ext      = path.extname(sw.filename).toLowerCase();
  const dlName   = `${sw.name}_v${sw.version}${ext}`.replace(/[^a-zA-Z0-9._-]/g, '_');

  console.log(`[Download] Serving file: ${dlName} (${formatSize(stat.size)}) to user ${payload.id}`);

  res.writeHead(200, {
    'Content-Type':        'application/octet-stream',
    'Content-Disposition': `attachment; filename="${dlName}"`,
    'Content-Length':      stat.size,
    'Cache-Control':       'no-cache',
  });
  fs.createReadStream(filePath).pipe(res);
}

// ── Delete software + its file ────────────────────────────────
async function deleteSw(req, res, parsed) {
  const admin = requireAdmin(req);
  if (!admin) return err(res, 403, 'Admin only');

  const id = parsed.pathname.split('/').filter(Boolean)[2];
  const sw = DB.getSoftwareById(id);
  if (!sw) return err(res, 404, 'Not found');

  if (sw.filename) {
    const fp = path.join(__dirname, '..', 'uploads', sw.filename);
    if (fs.existsSync(fp)) { try { fs.unlinkSync(fp); } catch(e) { console.warn('Could not delete file:', e.message); } }
  }

  DB.deleteSoftware(id);
  console.log(`[Delete] Removed: ${sw.name}`);
  ok(res, { message: `${sw.name} deleted` });
}

function parseBody(req) {
  return new Promise(resolve => {
    let body = '';
    req.on('data', c => body += c.toString());
    req.on('end', () => { try { resolve(JSON.parse(body)); } catch { resolve({}); } });
  });
}

module.exports = { list, upload, download, serveFile, deleteSw };
