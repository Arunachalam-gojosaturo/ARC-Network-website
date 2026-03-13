'use strict';
/**
 * ARC-NETWORK Database v3
 * JSON-file persistence — no external dependencies
 * Supports: local auth + Google OAuth + file uploads
 */
const fs     = require('fs');
const path   = require('path');
const crypto = require('crypto');

const DATA_DIR  = path.join(__dirname, '..', 'data');
const DATA_FILE = path.join(DATA_DIR, 'arc_network.json');
const JWT_SECRET= process.env.JWT_SECRET || crypto.randomBytes(32).toString('hex');

// ── Password hashing (HMAC-SHA256 + random salt) ─────────────
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.createHmac('sha256', salt).update(password).digest('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(password, stored) {
  try {
    const [salt, hash] = stored.split(':');
    const computed = crypto.createHmac('sha256', salt).update(password).digest('hex');
    return crypto.timingSafeEqual(Buffer.from(computed,'hex'), Buffer.from(hash,'hex'));
  } catch { return false; }
}

// ── JWT (HMAC-SHA256, zero deps) ─────────────────────────────
function signToken(payload, expiresInMs = 7 * 24 * 3600 * 1000) {
  const header = Buffer.from(JSON.stringify({ alg:'HS256', typ:'JWT' })).toString('base64url');
  const body   = Buffer.from(JSON.stringify({ ...payload, iat: Date.now(), exp: Date.now() + expiresInMs })).toString('base64url');
  const sig    = crypto.createHmac('sha256', JWT_SECRET).update(`${header}.${body}`).digest('base64url');
  return `${header}.${body}.${sig}`;
}

function verifyToken(token) {
  try {
    const [header, body, sig] = token.split('.');
    const expected = crypto.createHmac('sha256', JWT_SECRET).update(`${header}.${body}`).digest('base64url');
    if (sig !== expected) return null;
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString());
    if (payload.exp < Date.now()) return null;
    return payload;
  } catch { return null; }
}

function newId(prefix) {
  return `${prefix}-${crypto.randomBytes(6).toString('hex')}`;
}

// ── Default seed data ─────────────────────────────────────────
function getDefaults() {
  return {
    users: [
      {
        id: 'u-admin-001',
        username: 'admin',
        email: 'admin@arc-network.sh',
        passwordHash: hashPassword('admin123'),
        role: 'admin',
        provider: 'local',   // 'local' | 'google'
        googleId: null,
        avatar: 'A',
        joined: new Date().toISOString().split('T')[0],
        lastLogin: null,
        banned: false,
        bio: 'ARC-NETWORK Administrator',
      },
      {
        id: 'u-ghost-002',
        username: 'ghost_op',
        email: 'ghost@arc.sh',
        passwordHash: hashPassword('test123'),
        role: 'user',
        provider: 'local',
        googleId: null,
        avatar: 'G',
        joined: '2024-06-15',
        lastLogin: null,
        banned: false,
        bio: '',
      },
    ],
    software: [
      { id:'sw-001', name:'NmapStealth', version:'7.94', category:'Network Scanner', platform:'Linux', description:'Advanced network discovery and security auditing with stealth scan capabilities.', size:'28.4 MB', icon:'🔍', downloads:1420, uploadedBy:'admin', uploadedAt:'2024-01-15', filename:null },
      { id:'sw-002', name:'HashCrackPro', version:'2.1', category:'Password Tool', platform:'Cross-platform', description:'High-speed password hash cracker supporting MD5, SHA-1, SHA-256, bcrypt.', size:'45.2 MB', icon:'🔓', downloads:892, uploadedBy:'admin', uploadedAt:'2024-02-01', filename:null },
      { id:'sw-003', name:'WireShark-ARC', version:'4.2', category:'Network Scanner', platform:'Cross-platform', description:'Custom-patched Wireshark build with ARC-NETWORK protocol dissectors.', size:'72.1 MB', icon:'📡', downloads:2103, uploadedBy:'admin', uploadedAt:'2024-02-20', filename:null },
      { id:'sw-004', name:'MetaFramework-X', version:'6.3.1', category:'Exploit Framework', platform:'Linux', description:'Enhanced exploitation framework forked from Metasploit with custom modules.', size:'310 MB', icon:'💀', downloads:654, uploadedBy:'admin', uploadedAt:'2024-03-05', filename:null },
      { id:'sw-005', name:'VolatileForensics', version:'3.0', category:'Forensics', platform:'Linux', description:'Memory forensics toolkit for analyzing RAM dumps and live system artifacts.', size:'88.7 MB', icon:'🧬', downloads:431, uploadedBy:'admin', uploadedAt:'2024-03-18', filename:null },
      { id:'sw-006', name:'OSINT-Recon', version:'1.8', category:'OSINT', platform:'Cross-platform', description:'Automated open-source intelligence gathering and reporting framework.', size:'19.3 MB', icon:'👁', downloads:1876, uploadedBy:'admin', uploadedAt:'2024-04-01', filename:null },
    ],
    tickets: [
      { id:'t-001', userId:'u-ghost-002', username:'ghost_op', type:'Bug Report', subject:'NmapStealth crash on IPv6', body:'App crashes when targeting IPv6 range on Arch Linux.', status:'open', priority:'high', createdAt:'2025-03-10', updatedAt:'2025-03-10', adminNote:'' },
      { id:'t-002', userId:'u-ghost-002', username:'ghost_op', type:'Feature Request', subject:'Add Tor proxy support', body:'Would be great to route scans through Tor.', status:'in-progress', priority:'medium', createdAt:'2025-03-08', updatedAt:'2025-03-09', adminNote:'Planned for v2.0' },
    ],
    messages: [
      { id:'m-001', fromUserId:'u-admin-001', fromUsername:'ADMIN', message:'Welcome to ARC-NETWORK! How can I assist you today?', timestamp:new Date().toISOString(), isAdmin:true },
    ],
    downloads: [],
  };
}

// ── Persistence ───────────────────────────────────────────────
let _data = null;

function load() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(DATA_FILE)) { _data = getDefaults(); save(); return; }
  try { _data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')); }
  catch { _data = getDefaults(); save(); }
}

function save() {
  fs.writeFileSync(DATA_FILE, JSON.stringify(_data, null, 2));
}

function data() { if (!_data) load(); return _data; }

// ── Public API ────────────────────────────────────────────────
module.exports = {
  init() { load(); console.log('[DB] arc_network.json loaded'); },
  save, data, hashPassword, verifyPassword, signToken, verifyToken, newId,

  // ── Users ────────────────────────────────────────────────
  findUserByUsernameOrEmail(q) {
    return data().users.find(u => u.username === q || u.email === q) || null;
  },
  findUserById(id) { return data().users.find(u => u.id === id) || null; },
  findUserByGoogleId(googleId) { return data().users.find(u => u.googleId === googleId) || null; },

  createUser({ username, email, password, provider='local', googleId=null, avatar=null }) {
    const user = {
      id: newId('u'),
      username,
      email,
      passwordHash: password ? hashPassword(password) : null,
      role: 'user',
      provider,
      googleId,
      avatar: avatar || username[0].toUpperCase(),
      joined: new Date().toISOString().split('T')[0],
      lastLogin: new Date().toISOString(),
      banned: false,
      bio: '',
    };
    data().users.push(user);
    save();
    return user;
  },

  // ── Create admin (called from CLI or setup) ──────────────
  createAdmin({ username, email, password }) {
    if (data().users.find(u => u.username === username || u.email === email)) {
      throw new Error('Username or email already exists');
    }
    const user = {
      id: newId('u'),
      username, email,
      passwordHash: hashPassword(password),
      role: 'admin',
      provider: 'local',
      googleId: null,
      avatar: username[0].toUpperCase(),
      joined: new Date().toISOString().split('T')[0],
      lastLogin: null,
      banned: false,
      bio: 'Administrator',
    };
    data().users.push(user);
    save();
    return user;
  },

  promoteToAdmin(id) {
    const u = data().users.find(u => u.id === id);
    if (!u) return false;
    u.role = 'admin'; save(); return true;
  },

  updateUserLastLogin(id) {
    const u = data().users.find(u => u.id === id);
    if (u) { u.lastLogin = new Date().toISOString(); save(); }
  },

  updateUser(id, updates) {
    const u = data().users.find(u => u.id === id);
    if (!u) return null;
    const allowed = ['username','bio','avatar','banned','role'];
    allowed.forEach(k => { if (updates[k] !== undefined) u[k] = updates[k]; });
    save(); return u;
  },

  deleteUser(id) {
    const idx = data().users.findIndex(u => u.id === id);
    if (idx < 0) return false;
    data().users.splice(idx, 1); save(); return true;
  },

  getAllUsers() {
    return data().users.map(u => ({ ...u, passwordHash: undefined }));
  },

  // ── Software ─────────────────────────────────────────────
  getAllSoftware()   { return data().software; },
  getSoftwareById(id){ return data().software.find(s => s.id === id) || null; },

  addSoftware(sw) {
    const item = {
      id: newId('sw'), ...sw,
      downloads: 0,
      uploadedAt: new Date().toISOString().split('T')[0],
    };
    data().software.push(item); save(); return item;
  },

  updateSoftware(id, updates) {
    const sw = data().software.find(s => s.id === id);
    if (!sw) return null;
    Object.assign(sw, updates); save(); return sw;
  },

  incrementDownload(id) {
    const sw = data().software.find(s => s.id === id);
    if (sw) { sw.downloads++; save(); }
  },

  deleteSoftware(id) {
    const idx = data().software.findIndex(s => s.id === id);
    if (idx < 0) return false;
    data().software.splice(idx, 1); save(); return true;
  },

  // ── Tickets ──────────────────────────────────────────────
  getAllTickets() { return data().tickets; },
  getTicketsByUser(userId) { return data().tickets.filter(t => t.userId === userId); },

  createTicket(ticket) {
    const t = {
      id: newId('t'), ...ticket,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      adminNote: '',
    };
    data().tickets.push(t); save(); return t;
  },

  updateTicket(id, updates) {
    const t = data().tickets.find(t => t.id === id);
    if (!t) return null;
    Object.assign(t, updates, { updatedAt: new Date().toISOString().split('T')[0] });
    save(); return t;
  },

  // ── Messages ─────────────────────────────────────────────
  getAllMessages() { return data().messages.slice(-200); },

  addMessage(msg) {
    const m = { id: newId('m'), ...msg, timestamp: new Date().toISOString() };
    data().messages.push(m); save(); return m;
  },

  // ── Downloads log ────────────────────────────────────────
  logDownload(userId, softwareId) {
    if (!data().downloads) data().downloads = [];
    data().downloads.push({ userId, softwareId, at: new Date().toISOString() });
    save();
  },

  getStats() {
    const d = data();
    return {
      totalUsers:     d.users.length,
      totalSoftware:  d.software.length,
      totalTickets:   d.tickets.length,
      openTickets:    d.tickets.filter(t => t.status === 'open').length,
      totalMessages:  d.messages.length,
      totalDownloads: (d.downloads || []).length,
    };
  },
};
