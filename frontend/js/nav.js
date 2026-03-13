/* frontend/js/nav.js — injects nav + cursor + canvas into every page */

(function () {
  const navHTML = `
<div id="loader">
  <div class="loader-logo"><span class="arc">ARC</span><span style="color:var(--muted)">—</span><span class="net">NETWORK</span></div>
  <div class="loader-bar-wrap"><div class="loader-bar" id="loader-bar"></div></div>
  <div class="loader-text" id="loader-text">INITIALIZING SECURE ENVIRONMENT...</div>
</div>
<canvas id="matrix-canvas"></canvas>
<div id="cursor"></div>
<div id="cursor-ring"></div>
<nav>
  <a class="nav-logo" href="/">
    <span class="arc">ARC</span><span class="sep">—</span><span class="net">NETWORK</span>
  </a>
  <ul class="nav-links">
    <li><a href="/" id="nl-home">HOME</a></li>
    <li><a href="/topics" id="nl-topics">TOPICS</a></li>
    <li><a href="/download" id="nl-download">DOWNLOAD</a></li>
    <li><a href="/guide" id="nl-guide">GUIDE</a></li>
    <li><a href="/support" id="nl-support">SUPPORT</a></li>
    <li><a href="/about" id="nl-about">ABOUT</a></li>
  </ul>
  <div class="nav-actions">
    <a href="/login"    id="nav-login-btn" class="btn btn-ghost">LOGIN</a>
    <a href="/register" id="nav-reg-btn"   class="btn btn-solid">REGISTER</a>
    <div id="nav-user-area" style="display:none;align-items:center;gap:10px;">
      <span id="nav-username-label" style="font-family:var(--font-mono);font-size:.65rem;color:var(--muted)"></span>
      <a href="/dashboard" class="btn btn-ghost">DASHBOARD</a>
      <a href="/admin" id="nav-admin-link" class="btn btn-danger btn-sm" style="display:none">ADMIN</a>
      <button onclick="API.logout()" class="btn btn-ghost">LOGOUT</button>
    </div>
  </div>
</nav>
`;

  const footer = `
<footer>
  <div>◈ ARC-NETWORK © 2025 — Built by <span style="color:var(--accent-b)">ARUNACHALAM</span></div>
  <div style="margin-top:.3rem;opacity:.4">ALL CONNECTIONS ENCRYPTED // <span style="color:var(--cyan)">v3.2.1</span> // UPTIME 99.8%</div>
</footer>`;

  // Inject nav before first child
  document.body.insertAdjacentHTML('afterbegin', navHTML);

  // Inject footer at end
  document.body.insertAdjacentHTML('beforeend', footer);

  // Highlight active nav link
  const path = window.location.pathname;
  const map  = { '/': 'nl-home', '/topics': 'nl-topics', '/download': 'nl-download', '/guide': 'nl-guide', '/support': 'nl-support', '/about': 'nl-about' };
  const activeId = map[path];
  if (activeId) { const el = document.getElementById(activeId); if (el) el.classList.add('active'); }

  // Init after DOM ready
  document.addEventListener('DOMContentLoaded', () => {
    UI.initLoader(() => {
      UI.initMatrix('matrix-canvas');
      UI.initCursor();
      UI.syncNav();
      UI.initScrollReveal();
    });
  });
})();
