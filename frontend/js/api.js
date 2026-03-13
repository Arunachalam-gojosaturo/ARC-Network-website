/* frontend/js/api.js — ARC-NETWORK API Client */

const API_BASE = '/api';

function getToken() { return localStorage.getItem('arc_token'); }
function setToken(t) { localStorage.setItem('arc_token', t); }
function clearToken() { localStorage.removeItem('arc_token'); }
function getUser() { try { return JSON.parse(localStorage.getItem('arc_user')); } catch { return null; } }
function setUser(u) { localStorage.setItem('arc_user', JSON.stringify(u)); }
function clearUser() { localStorage.removeItem('arc_user'); }

async function request(method, path, body = null) {
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers['Authorization'] = 'Bearer ' + token;

  const opts = { method, headers };
  if (body) opts.body = JSON.stringify(body);

  const res = await fetch(API_BASE + path, opts);
  const data = await res.json();
  if (!data.ok && data.message) throw new Error(data.message);
  return data;
}

const API = {
  // Auth
  async register(username, email, password) {
    const d = await request('POST', '/auth/register', { username, email, password });
    setToken(d.token); setUser(d.user); return d;
  },
  async login(username, password) {
    const d = await request('POST', '/auth/login', { username, password });
    setToken(d.token); setUser(d.user); return d;
  },
  async me() { return request('GET', '/auth/me'); },
  logout() { clearToken(); clearUser(); window.location.href = '/'; },

  // Software
  getSoftware()   { return request('GET', '/software'); },
  uploadSoftware(data) { return request('POST', '/software', data); },
  download(id)    { return request('POST', `/software/${id}/download`); },
  deleteSoftware(id) { return request('DELETE', `/software/${id}`); },

  // Tickets
  createTicket(data)  { return request('POST', '/tickets', data); },
  myTickets()         { return request('GET', '/tickets/mine'); },
  allTickets()        { return request('GET', '/tickets'); },
  updateTicket(id, d) { return request('PUT', `/tickets/${id}`, d); },

  // Messages
  getMessages()   { return request('GET', '/messages'); },
  sendMessage(message) { return request('POST', '/messages', { message }); },

  // Admin
  adminUsers()       { return request('GET', '/admin/users'); },
  adminDeleteUser(id){ return request('DELETE', `/admin/users/${id}`); },
  adminStats()       { return request('GET', '/admin/stats'); },

  // Helpers
  isLoggedIn() { return !!getToken(); },
  currentUser() { return getUser(); },
  isAdmin() { const u = getUser(); return u && u.role === 'admin'; },
};

window.API = API;
