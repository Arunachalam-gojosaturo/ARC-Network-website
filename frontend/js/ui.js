/* frontend/js/ui.js — Shared UI utilities */

// ── Notifications ─────────────────────────────────────────────
function notify(msg, type = 'success') {
  const existing = document.querySelector('.arc-notif');
  if (existing) existing.remove();
  const n = document.createElement('div');
  n.className = 'arc-notif arc-notif--' + type;
  const icons = { success: '◈', error: '✕', warn: '⚠', info: 'ℹ' };
  n.innerHTML = `<span class="arc-notif__icon">${icons[type] || '◈'}</span><span>${escHtml(msg)}</span>`;
  document.body.appendChild(n);
  requestAnimationFrame(() => n.classList.add('arc-notif--in'));
  setTimeout(() => { n.classList.add('arc-notif--out'); setTimeout(() => n.remove(), 400); }, 3200);
}

// ── HTML escape ───────────────────────────────────────────────
function escHtml(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ── Auth guard ────────────────────────────────────────────────
function requireLogin(admin = false) {
  if (!API.isLoggedIn()) { window.location.href = '/login'; return false; }
  if (admin && !API.isAdmin()) { window.location.href = '/dashboard'; return false; }
  return true;
}

// ── Update nav for logged-in user ─────────────────────────────
function syncNav() {
  const u = API.currentUser();
  const loginBtn  = document.getElementById('nav-login-btn');
  const regBtn    = document.getElementById('nav-reg-btn');
  const userArea  = document.getElementById('nav-user-area');
  const userLabel = document.getElementById('nav-username-label');
  const adminLink = document.getElementById('nav-admin-link');

  if (u) {
    if (loginBtn)  loginBtn.style.display  = 'none';
    if (regBtn)    regBtn.style.display    = 'none';
    if (userArea)  userArea.style.display  = 'flex';
    if (userLabel) userLabel.textContent   = u.username.toUpperCase();
    if (adminLink) adminLink.style.display = u.role === 'admin' ? 'block' : 'none';
  } else {
    if (loginBtn)  loginBtn.style.display  = '';
    if (regBtn)    regBtn.style.display    = '';
    if (userArea)  userArea.style.display  = 'none';
    if (adminLink) adminLink.style.display = 'none';
  }
}

// ── Matrix rain canvas ────────────────────────────────────────
function initMatrix(canvasId) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const chars = 'アイウエオ0123456789ABCDEF<>/[]{}=+-*%$#@!?\\|~^';
  let cols, drops;

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    cols  = Math.floor(canvas.width / 16);
    drops = Array(cols).fill(1);
  }

  function draw() {
    ctx.fillStyle = 'rgba(4,2,14,0.05)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.font = '13px Share Tech Mono, monospace';
    for (let i = 0; i < drops.length; i++) {
      ctx.fillStyle = i % 7 === 0 ? '#a855f7' : 'rgba(124,58,237,0.7)';
      ctx.fillText(chars[Math.floor(Math.random() * chars.length)], i * 16, drops[i] * 16);
      if (drops[i] * 16 > canvas.height && Math.random() > 0.975) drops[i] = 0;
      drops[i]++;
    }
  }

  resize();
  window.addEventListener('resize', resize);
  setInterval(draw, 50);
}

// ── Custom cursor ─────────────────────────────────────────────
function initCursor() {
  const cursor = document.getElementById('cursor');
  const ring   = document.getElementById('cursor-ring');
  if (!cursor || !ring) return;
  let mx = 0, my = 0, rx = 0, ry = 0;

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    cursor.style.left = mx + 'px';
    cursor.style.top  = my + 'px';
  });

  function anim() {
    rx += (mx - rx) * 0.12;
    ry += (my - ry) * 0.12;
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';
    requestAnimationFrame(anim);
  }
  anim();

  document.addEventListener('mousedown', () => {
    cursor.style.transform = 'translate(-50%,-50%) scale(2)';
  });
  document.addEventListener('mouseup', () => {
    cursor.style.transform = 'translate(-50%,-50%) scale(1)';
  });
}

// ── Error rain ────────────────────────────────────────────────
function initErrorRain(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const errors = [
    'SEGMENTATION FAULT','NULL POINTER DEREF','STACK OVERFLOW',
    'ACCESS VIOLATION','KERNEL PANIC','BUFFER OVERFLOW',
    'USE AFTER FREE','HEAP CORRUPTION','0xDEADBEEF',
    'SIGSEGV','SIGKILL','ECONNRESET','ERR_SSL_HANDSHAKE',
    'INVALID OPCODE','0x00000000','CONNECTION REFUSED',
  ];
  function spawn() {
    const el = document.createElement('div');
    el.className = 'err-particle';
    el.textContent = errors[Math.floor(Math.random() * errors.length)];
    el.style.cssText = `left:${Math.random()*100}vw;top:-30px;animation-duration:${4+Math.random()*8}s;animation-delay:${Math.random()*2}s;font-size:${0.5+Math.random()*.5}rem`;
    container.appendChild(el);
    setTimeout(() => el.remove(), 14000);
  }
  for (let i = 0; i < 8; i++) setTimeout(spawn, i * 500);
  setInterval(spawn, 2000);
}

// ── Scroll reveal ─────────────────────────────────────────────
function initScrollReveal() {
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
  }, { threshold: 0.1 });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));
}

// ── Counter animation ─────────────────────────────────────────
function animateCounter(el, target, suffix = '', duration = 1800) {
  if (!el) return;
  const start = performance.now();
  const step = now => {
    const p = Math.min((now - start) / duration, 1);
    const ease = 1 - Math.pow(1 - p, 4);
    el.textContent = Math.floor(ease * target) + suffix;
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

// ── Loading screen ────────────────────────────────────────────
function initLoader(onDone) {
  const loader  = document.getElementById('loader');
  if (!loader) { onDone && onDone(); return; }
  const bar     = document.getElementById('loader-bar');
  const txt     = document.getElementById('loader-text');
  const steps   = ['LOADING ENCRYPTION MODULES...','ESTABLISHING SECURE TUNNEL...','VERIFYING NODE INTEGRITY...','MASKING IDENTITY...','SYSTEM ONLINE ◈'];
  let p = 0, si = 0;
  const iv = setInterval(() => {
    p += Math.random() * 20 + 8;
    if (p > 100) p = 100;
    if (bar) bar.style.width = p + '%';
    const ni = Math.min(Math.floor(p / 25), steps.length - 1);
    if (ni !== si && txt) { si = ni; txt.textContent = steps[si]; }
    if (p >= 100) {
      clearInterval(iv);
      setTimeout(() => {
        loader.classList.add('done');
        onDone && onDone();
      }, 400);
    }
  }, 100);
}

// ── Typed text ────────────────────────────────────────────────
function typeLines(containerId, lines, delay = 20) {
  const el = document.getElementById(containerId);
  if (!el) return;
  let li = 0;
  function nextLine() {
    if (li >= lines.length) return;
    const { cls, text } = lines[li++];
    const div  = document.createElement('div');
    div.className = 'term-line';
    const span = document.createElement('span');
    span.className = cls || 'term-out';
    div.appendChild(span);
    el.appendChild(div);
    let ci = 0;
    function ch() {
      if (ci < text.length) { span.textContent += text[ci++]; setTimeout(ch, delay + Math.random() * 15); }
      else setTimeout(nextLine, 150);
    }
    ch();
  }
  nextLine();
}

window.UI = { notify, escHtml, requireLogin, syncNav, initMatrix, initCursor, initErrorRain, initScrollReveal, animateCounter, initLoader, typeLines };
