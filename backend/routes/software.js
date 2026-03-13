'use strict';
const path = require('path');
const fs   = require('fs');
const DB   = require('../db/database');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const { ok, err } = require('../utils/respond');
const { parseMultipart, formatSize } = require('../utils/multipart');

function list(req, res) {
  ok(res, { software: DB.getAllSoftware() });
}

// ── Upload with actual file ───────────────────────────────────
async function upload(req, res) {
  const admin = requireAdmin(req);
  if (!admin) return err(res, 403, 'Admin only');

  const contentType = req.headers['content-type'] || '';

  let name, version, category, platform, description, size, icon, filename = null;

  if (contentType.includes('multipart/form-data')) {
    try {
      const { fields, files } = await parseMultipart(req);
      name        = fields.name;
      version     = fields.version;
      category    = fields.category;
      platform    = fields.platform;
      description = fields.description;
      icon        = fields.icon;

      if (files.file) {
        const f = files.file;
        size     = formatSize(f.size);
        filename = f.savedName;
      } else {
        size = fields.size;
      }
    } catch (e) {
      return err(res, 400, 'Upload failed: ' + e.message);
    }
  } else {
    // JSON body (no file)
    const body = await parseBody(req);
    ({ name, version, category, platform, description, size, icon } = body);
  }

  if (!name || !version) return err(res, 400, 'Name and version required');

  const sw = DB.addSoftware({
    name, version,
    category:    category    || 'Other',
    platform:    platform    || 'Linux',
    description: description || '',
    size:        size        || 'Unknown',
    icon:        icon        || '📦',
    filename:    filename,
    uploadedBy:  admin.username,
  });

  ok(res, { software: sw });
}

function parseBody(req) {
  return new Promise(resolve => {
    let body = '';
    req.on('data', c => body += c.toString());
    req.on('end', () => { try { resolve(JSON.parse(body)); } catch { resolve({}); } });
  });
}

// ── Download ──────────────────────────────────────────────────
async function download(req, res, parsed) {
  const user = requireAuth(req);
  if (!user) return err(res, 401, 'Login required to download');

  const id = parsed.pathname.split('/').filter(Boolean)[2]; // /api/software/:id/download
  const sw = DB.getSoftwareById(id);
  if (!sw) return err(res, 404, 'Software not found');

  DB.incrementDownload(id);
  DB.logDownload(user.id, id);

  // if real file exists, serve it
  if (sw.filename) {
    const filePath = path.join(__dirname, '..', 'uploads', sw.filename);
    if (fs.existsSync(filePath)) {
      const stat = fs.statSync(filePath);
      const ext  = path.extname(sw.filename);
      res.writeHead(200, {
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${sw.name}_v${sw.version}${ext}"`,
        'Content-Length': stat.size,
      });
      fs.createReadStream(filePath).pipe(res);
      return;
    }
  }

  // no file — return metadata only
  ok(res, { message: `Download logged: ${sw.name} v${sw.version}`, software: sw });
}

// ── Delete ────────────────────────────────────────────────────
async function deleteSw(req, res, parsed) {
  const admin = requireAdmin(req);
  if (!admin) return err(res, 403, 'Admin only');

  const id = parsed.pathname.split('/').filter(Boolean)[2];
  const sw = DB.getSoftwareById(id);
  if (!sw) return err(res, 404, 'Not found');

  // delete physical file if exists
  if (sw.filename) {
    const fp = path.join(__dirname, '..', 'uploads', sw.filename);
    if (fs.existsSync(fp)) { try { fs.unlinkSync(fp); } catch {} }
  }

  DB.deleteSoftware(id);
  ok(res, { message: 'Deleted' });
}

module.exports = { list, upload, download, deleteSw };
