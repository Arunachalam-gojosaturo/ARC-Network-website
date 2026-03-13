'use strict';
const https  = require('https');
const DB     = require('../db/database');
const { parseBody, requireAuth } = require('../middleware/auth');
const { ok, err } = require('../utils/respond');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Credentials are loaded from .env by server.js at startup
// .env is in .gitignore — never committed to GitHub
function getCreds() {
  return {
    clientId:     process.env.GOOGLE_CLIENT_ID     || '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    baseUrl:      process.env.BASE_URL              || 'http://localhost:3000',
  };
}

function getRedirectUri() {
  return `${getCreds().baseUrl}/api/auth/callback/google`;
}

function googleEnabled() {
  const { clientId, clientSecret } = getCreds();
  return clientId.length > 10 && clientSecret.length > 5;
}

function googleStatus(req, res) {
  ok(res, { enabled: googleEnabled() });
}

async function register(req, res) {
  const body = await parseBody(req);
  const { username, email, password } = body;
  if (!username || !email || !password) return err(res, 400, 'All fields required');
  if (username.length < 3 || username.length > 24) return err(res, 400, 'Username must be 3–24 characters');
  if (!/^[a-zA-Z0-9_]+$/.test(username)) return err(res, 400, 'Username: letters, numbers, underscores only');
  if (!EMAIL_RE.test(email)) return err(res, 400, 'Invalid email address');
  if (password.length < 8) return err(res, 400, 'Password must be at least 8 characters');
  if (DB.findUserByUsernameOrEmail(username)) return err(res, 409, 'Username already taken');
  if (DB.findUserByUsernameOrEmail(email)) return err(res, 409, 'Email already registered');
  const user  = DB.createUser({ username, email, password });
  const token = DB.signToken({ id: user.id, role: user.role });
  ok(res, { token, user: safeUser(user) });
}

async function login(req, res) {
  const body = await parseBody(req);
  const { username, password } = body;
  if (!username || !password) return err(res, 400, 'Username and password required');
  const user = DB.findUserByUsernameOrEmail(username);
  if (!user)              return err(res, 401, 'Invalid credentials');
  if (user.banned)        return err(res, 403, 'Account suspended');
  if (!user.passwordHash) return err(res, 401, 'This account uses Google Sign-In');
  if (!DB.verifyPassword(password, user.passwordHash)) return err(res, 401, 'Invalid credentials');
  DB.updateUserLastLogin(user.id);
  const token = DB.signToken({ id: user.id, role: user.role });
  ok(res, { token, user: safeUser(user) });
}

function me(req, res) {
  const user = requireAuth(req);
  if (!user) return err(res, 401, 'Unauthorized');
  ok(res, { user: safeUser(user) });
}

function googleRedirect(req, res) {
  const { clientId } = getCreds();
  const redirectUri  = getRedirectUri();
  const params = new URLSearchParams({
    client_id: clientId, redirect_uri: redirectUri,
    response_type: 'code', scope: 'openid email profile',
    access_type: 'offline', prompt: 'select_account',
  });
  console.log('[OAuth] redirect_uri =', redirectUri);
  res.writeHead(302, { Location: `https://accounts.google.com/o/oauth2/v2/auth?${params}` });
  res.end();
}

// Route: GET /api/auth/callback/google
// Must match Google Console authorized redirect URI exactly
async function googleCallback(req, res, parsed) {
  const { code, error } = parsed.query;
  if (error || !code) {
    res.writeHead(302, { Location: '/login?error=google_denied' }); res.end(); return;
  }
  try {
    const { clientId, clientSecret } = getCreds();
    const redirectUri = getRedirectUri();
    const tokenData = await tokenExchange(code, clientId, clientSecret, redirectUri);
    if (!tokenData.access_token) throw new Error('No access_token: ' + JSON.stringify(tokenData));
    const profile = await getProfile(tokenData.access_token);
    if (!profile.email) throw new Error('No email in Google profile');
    console.log('[OAuth] login:', profile.email);

    let user = DB.findUserByGoogleId(profile.sub);
    if (!user) {
      user = DB.findUserByUsernameOrEmail(profile.email);
      if (user) {
        DB.updateUser(user.id, { googleId: profile.sub });
        user = DB.findUserById(user.id);
      } else {
        let username = (profile.name || profile.email.split('@')[0])
          .replace(/[^a-zA-Z0-9_]/g, '_').slice(0, 24);
        let base = username, n = 1;
        while (DB.findUserByUsernameOrEmail(username)) username = `${base}_${n++}`;
        user = DB.createUser({
          username, email: profile.email, password: null,
          provider: 'google', googleId: profile.sub,
          avatar: (profile.given_name || 'G')[0].toUpperCase(),
        });
        console.log('[OAuth] new user:', username);
      }
    }
    if (user.banned) { res.writeHead(302, { Location: '/login?error=banned' }); res.end(); return; }
    DB.updateUserLastLogin(user.id);
    const token = DB.signToken({ id: user.id, role: user.role });
    res.writeHead(302, { Location: `/login?token=${encodeURIComponent(token)}&provider=google` });
    res.end();
  } catch (e) {
    console.error('[OAuth] Error:', e.message);
    res.writeHead(302, { Location: '/login?error=google_failed' }); res.end();
  }
}

function tokenExchange(code, clientId, clientSecret, redirectUri) {
  return new Promise((resolve, reject) => {
    const body = new URLSearchParams({ code, client_id: clientId, client_secret: clientSecret, redirect_uri: redirectUri, grant_type: 'authorization_code' }).toString();
    const req = https.request(
      { hostname: 'oauth2.googleapis.com', path: '/token', method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Content-Length': Buffer.byteLength(body) } },
      r => { let d = ''; r.on('data', c => d += c); r.on('end', () => { try { resolve(JSON.parse(d)); } catch(e) { reject(e); } }); }
    );
    req.on('error', reject); req.write(body); req.end();
  });
}

function getProfile(accessToken) {
  return new Promise((resolve, reject) => {
    const req = https.request(
      { hostname: 'www.googleapis.com', path: '/oauth2/v2/userinfo', headers: { Authorization: `Bearer ${accessToken}` } },
      r => { let d = ''; r.on('data', c => d += c); r.on('end', () => { try { resolve(JSON.parse(d)); } catch(e) { reject(e); } }); }
    );
    req.on('error', reject); req.end();
  });
}

function safeUser(u) {
  return { id: u.id, username: u.username, email: u.email, role: u.role, avatar: u.avatar, joined: u.joined, provider: u.provider || 'local', bio: u.bio || '' };
}

module.exports = { register, login, me, googleStatus, googleRedirect, googleCallback };
