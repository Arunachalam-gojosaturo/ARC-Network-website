'use strict';
/**
 * utils/multipart.js
 * Pure Node.js multipart/form-data parser — no multer needed
 */
const fs   = require('fs');
const path = require('path');
const crypto = require('crypto');

const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');
const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500 MB

function parseMultipart(req) {
  return new Promise((resolve, reject) => {
    const contentType = req.headers['content-type'] || '';
    if (!contentType.includes('multipart/form-data')) {
      return reject(new Error('Not multipart/form-data'));
    }

    const boundaryMatch = contentType.match(/boundary=([^\s;]+)/);
    if (!boundaryMatch) return reject(new Error('No boundary found'));
    const boundary = boundaryMatch[1];

    const chunks = [];
    let totalSize = 0;

    req.on('data', chunk => {
      totalSize += chunk.length;
      if (totalSize > MAX_FILE_SIZE) {
        reject(new Error('File too large (max 500MB)'));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });

    req.on('end', () => {
      try {
        const buf = Buffer.concat(chunks);
        const result = parseBuffer(buf, boundary);
        resolve(result);
      } catch (e) { reject(e); }
    });

    req.on('error', reject);
  });
}

function parseBuffer(buf, boundary) {
  const fields = {};
  const files  = {};

  const delimBuf  = Buffer.from(`--${boundary}`);
  const finalBuf  = Buffer.from(`--${boundary}--`);
  const crlf      = Buffer.from('\r\n');
  const crlfcrlf  = Buffer.from('\r\n\r\n');

  let pos = 0;

  while (pos < buf.length) {
    // find boundary
    const delimPos = bufIndexOf(buf, delimBuf, pos);
    if (delimPos < 0) break;
    pos = delimPos + delimBuf.length;

    // check if final boundary
    if (buf.slice(pos, pos + 2).equals(Buffer.from('--'))) break;

    // skip CRLF after boundary
    if (buf.slice(pos, pos + 2).equals(crlf)) pos += 2;

    // find end of headers
    const headerEnd = bufIndexOf(buf, crlfcrlf, pos);
    if (headerEnd < 0) break;

    const headerStr = buf.slice(pos, headerEnd).toString('utf8');
    pos = headerEnd + 4; // skip \r\n\r\n

    // find next boundary to get body end
    const nextDelim = bufIndexOf(buf, delimBuf, pos);
    if (nextDelim < 0) break;

    // body is from pos to nextDelim - 2 (strip trailing \r\n)
    const bodyEnd = nextDelim - 2;
    const body    = buf.slice(pos, bodyEnd);
    pos = nextDelim;

    // parse headers
    const headers = {};
    headerStr.split('\r\n').forEach(line => {
      const colonIdx = line.indexOf(':');
      if (colonIdx < 0) return;
      const k = line.slice(0, colonIdx).trim().toLowerCase();
      const v = line.slice(colonIdx + 1).trim();
      headers[k] = v;
    });

    const disposition = headers['content-disposition'] || '';
    const nameMatch   = disposition.match(/name="([^"]+)"/);
    const fileMatch   = disposition.match(/filename="([^"]+)"/);

    if (!nameMatch) continue;
    const fieldName = nameMatch[1];

    if (fileMatch) {
      // it's a file
      const originalName = fileMatch[1];
      const ext = path.extname(originalName).toLowerCase();
      const safeExt = /^\.[a-z0-9]+$/.test(ext) ? ext : '.bin';
      const savedName = `${crypto.randomBytes(12).toString('hex')}${safeExt}`;
      const savePath  = path.join(UPLOADS_DIR, savedName);
      fs.writeFileSync(savePath, body);
      files[fieldName] = {
        originalName,
        savedName,
        path: savePath,
        size: body.length,
        mimetype: headers['content-type'] || 'application/octet-stream',
      };
    } else {
      // text field
      fields[fieldName] = body.toString('utf8');
    }
  }

  return { fields, files };
}

function bufIndexOf(haystack, needle, start = 0) {
  for (let i = start; i <= haystack.length - needle.length; i++) {
    let found = true;
    for (let j = 0; j < needle.length; j++) {
      if (haystack[i + j] !== needle[j]) { found = false; break; }
    }
    if (found) return i;
  }
  return -1;
}

// Format bytes to human readable
function formatSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
}

module.exports = { parseMultipart, formatSize };
