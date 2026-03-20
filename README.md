<div align="center">

<img src="https://capsule-render.vercel.app/api?type=rect&color=0:0d0d0d,40:1a0000,100:0d0d0d&height=180&section=header&text=ARC-NETWORK&fontSize=72&fontColor=ff2020&fontAlignY=55&animation=fadeIn&desc=FULL-STACK%20CYBERSECURITY%20HUB%20%7C%20CLASSIFIED%20ACCESS%20ONLY&descSize=14&descAlignY=78&descColor=ff6666&stroke=ff2020&strokeWidth=1"/>

</div>

<div align="center">

<img src="https://readme-typing-svg.demolab.com?font=JetBrains+Mono&weight=700&size=15&pause=1000&color=FF2020&center=true&vCenter=true&width=800&lines=INITIALIZING+ARC-NETWORK+CORE+SYSTEMS...;%5B+%E2%9C%93+%5D+Auth+Module+%E2%80%94+HMAC-SHA256+JWT+LOADED;%5B+%E2%9C%93+%5D+Software+Depot+%E2%80%94+ONLINE;%5B+%E2%9C%93+%5D+Live+Chat+%E2%80%94+ONLINE;%5B+%E2%9C%93+%5D+Admin+Panel+%E2%80%94+RESTRICTED;%5B+%E2%9C%93+%5D+All+Systems+Nominal+%E2%80%94+ACCESS+GRANTED+%F0%9F%94%93" alt="Typing SVG"/>

</div>

<br/>

<div align="center">

![Node.js](https://img.shields.io/badge/Node.js-Zero%20Dependencies-ff2020?style=flat-square&logo=node.js&logoColor=white&labelColor=0d0d0d)
![Auth](https://img.shields.io/badge/Auth-HMAC--SHA256%20JWT-ff2020?style=flat-square&logo=jsonwebtokens&logoColor=white&labelColor=0d0d0d)
![License](https://img.shields.io/badge/License-MIT-ff4444?style=flat-square&labelColor=0d0d0d)
![Status](https://img.shields.io/badge/Status-ACTIVE-ff2020?style=flat-square&labelColor=0d0d0d)
![Version](https://img.shields.io/badge/Version-1.0.0-ff4444?style=flat-square&labelColor=0d0d0d)
![Deploy](https://img.shields.io/badge/Deploy-Render%20%7C%20Railway-ff2020?style=flat-square&labelColor=0d0d0d)

</div>

---

## `>> SYSTEM OVERVIEW`

```
 ╔════════════════════════════════════════════════════════════════════╗
 ║  CLASSIFICATION : UNRESTRICTED (OSS)                               ║
 ║  CODENAME       : ARC-NETWORK                                      ║
 ║  TYPE           : Full-Stack Cybersecurity Web Hub                 ║
 ║  BACKEND        : Node.js — zero external dependencies             ║
 ║  FRONTEND       : Multi-page HTML / CSS / JS                       ║
 ║  DATABASE       : JSON persistence (upgradeable → SQLite/Postgres) ║
 ║  AUTH           : HMAC-SHA256 JWT + salted password hashing        ║
 ║  FEATURES       : Real-time chat · Ticket system · Admin panel     ║
 ║                   Software depot · User management · Live stats    ║
 ╚════════════════════════════════════════════════════════════════════╝
```

---

## `>> QUICK DEPLOY`

```bash
# ─── ZERO DEPENDENCY MODE ───────────────────────────────
git clone https://github.com/Arunachalam-gojosaturo/arc-network
cd arc-network/backend
node server.js
# → http://localhost:3000 ✓

# ─── WITH NPM PACKAGES ──────────────────────────────────
cd backend && npm install && node server.js
```

> ⚡ No build step. No bundler. No boilerplate. Just `node server.js`.

---

## `>> MISSION MODULES`

<div align="center">

<table>
<tr>
<td width="50%" valign="top">

### 🔐 Auth Engine
```
  ALGORITHM  : HMAC-SHA256
  TOKENS     : JWT-style (custom)
  PASSWORDS  : salted hash per user
  PROTECTION : timing-safe compare
  ROLES      : admin / user
```

</td>
<td width="50%" valign="top">

### 💬 Live Chat
```
  TYPE       : REST-polled messaging
  ACCESS     : authenticated users
  STORAGE    : JSON persistence
  ESCAPE     : HTML-sanitized output
  STATUS     : ONLINE ✓
```

</td>
</tr>
<tr>
<td width="50%" valign="top">

### 🎫 Support Tickets
```
  CREATE     : any logged-in user
  MANAGE     : admin only
  STATES     : open / in-progress / closed
  VIEW       : /tickets/mine + /tickets
  STATUS     : ONLINE ✓
```

</td>
<td width="50%" valign="top">

### 📦 Software Depot
```
  UPLOAD     : admin only
  DOWNLOAD   : authenticated users
  LIST       : public access
  DELETE     : admin only
  STATUS     : ONLINE ✓
```

</td>
</tr>
</table>

</div>

---

## `>> DIRECTORY STRUCTURE`

```
arc-network/
│
├── 🖥️  backend/
│   ├── server.js                 ← Entry point (run this)
│   ├── db/
│   │   └── database.js           ← JSON DB + auth utilities
│   ├── routes/
│   │   ├── router.js             ← API dispatcher
│   │   ├── auth.js               ← Register / Login / Me
│   │   ├── software.js           ← Tool depot endpoints
│   │   ├── tickets.js            ← Support ticket endpoints
│   │   ├── messages.js           ← Live chat endpoints
│   │   └── admin.js              ← Admin panel endpoints
│   ├── middleware/
│   │   └── auth.js               ← JWT verification layer
│   └── utils/
│       ├── logger.js
│       └── respond.js
│
└── 🌐  frontend/
    ├── css/
    │   └── main.css              ← Full custom design system
    ├── js/
    │   ├── api.js                ← Fetch wrapper / API client
    │   ├── ui.js                 ← Shared UI utilities
    │   └── nav.js                ← Injected nav component
    └── pages/
        ├── index.html            ← Homepage
        ├── login.html
        ├── register.html
        ├── dashboard.html
        ├── admin.html            ← 🔒 Admin only
        ├── topics.html
        ├── download.html
        ├── guide.html
        ├── support.html
        └── about.html
```

---

## `>> API MANIFEST`

<div align="center">

### 🔐 Authentication

| `METHOD` | `ENDPOINT` | `AUTH` | `ACTION` |
|:---:|---|:---:|---|
| `POST` | `/api/auth/register` | ○ Public | Create new account |
| `POST` | `/api/auth/login` | ○ Public | Login → receive token |
| `GET` | `/api/auth/me` | 🔒 User | Fetch current session |

### 📦 Software Depot

| `METHOD` | `ENDPOINT` | `AUTH` | `ACTION` |
|:---:|---|:---:|---|
| `GET` | `/api/software` | ○ Public | Browse all tools |
| `POST` | `/api/software` | 👑 Admin | Upload new tool |
| `POST` | `/api/software/:id/download` | 🔒 User | Download tool |
| `DELETE` | `/api/software/:id` | 👑 Admin | Remove tool |

### 🎫 Support Tickets

| `METHOD` | `ENDPOINT` | `AUTH` | `ACTION` |
|:---:|---|:---:|---|
| `POST` | `/api/tickets` | 🔒 User | Open new ticket |
| `GET` | `/api/tickets/mine` | 🔒 User | View my tickets |
| `GET` | `/api/tickets` | 👑 Admin | View all tickets |
| `PUT` | `/api/tickets/:id` | 👑 Admin | Update ticket status |

### 💬 Live Chat

| `METHOD` | `ENDPOINT` | `AUTH` | `ACTION` |
|:---:|---|:---:|---|
| `GET` | `/api/messages` | 🔒 User | Fetch chat history |
| `POST` | `/api/messages` | 🔒 User | Send message |

### 👑 Admin Panel

| `METHOD` | `ENDPOINT` | `AUTH` | `ACTION` |
|:---:|---|:---:|---|
| `GET` | `/api/admin/users` | 👑 Admin | List all users |
| `DELETE` | `/api/admin/users/:id` | 👑 Admin | Remove user |
| `GET` | `/api/admin/stats` | 👑 Admin | Dashboard metrics |

</div>

---

## `>> DEFAULT ACCESS KEYS`

```bash
# ─── ADMIN ACCOUNT ──────────────────────────────────────
USERNAME : admin
PASSWORD : admin123
ACCESS   : FULL — admin panel, user mgmt, all routes

# ─── TEST USER ──────────────────────────────────────────
USERNAME : ghost_op
PASSWORD : test123
ACCESS   : USER — chat, tickets, software download

# ⚠  CHANGE THESE BEFORE DEPLOYING TO PRODUCTION
```

---

## `>> SECURITY ARCHITECTURE`

```
LAYER 1 — PASSWORD STORAGE
  ├── Random salt generated per user (crypto.randomBytes)
  ├── HMAC-SHA256(password + salt) → stored hash
  └── Timing-safe comparison on every login attempt

LAYER 2 — SESSION TOKENS
  ├── JWT-style header.payload.signature structure
  ├── Signed with HMAC-SHA256 + secret key
  └── Verified on every protected API route

LAYER 3 — ROLE ENFORCEMENT
  ├── middleware/auth.js validates token on every request
  ├── Admin routes check role === "admin" explicitly
  └── User routes reject unauthenticated requests (401)

LAYER 4 — OUTPUT SANITIZATION
  ├── All user-generated content HTML-escaped on render
  ├── CORS headers applied globally
  └── No raw SQL → no injection surface
```

---

## `>> DEPLOY PROTOCOLS`

<div align="center">

<table>
<tr>
<td width="50%" valign="top">

### ☁️ Render.com (Free)
```bash
1. Push repo to GitHub
2. New Web Service → connect repo
3. Root directory : backend
4. Start command  : node server.js
5. Env variable   : PORT=10000
6. Deploy ✓
```

</td>
<td width="50%" valign="top">

### 🚂 Railway.app (Free)
```bash
1. Push repo to GitHub
2. New Project → Deploy from GitHub
3. Root        : backend
4. Start cmd   : node server.js
5. Deploy ✓
```

</td>
</tr>
<tr>
<td width="50%" valign="top">

### 🔵 Cyclic.sh
```bash
# Zero-dependency Node.js
# supported out of the box
# Connect repo → auto deploy ✓
```

</td>
<td width="50%" valign="top">

### 🎨 Glitch.com
```bash
# Import from GitHub
# Edit in browser IDE
# Live at *.glitch.me ✓
```

</td>
</tr>
</table>

</div>

---

## `>> UPGRADE ROADMAP`

```
v1.0  [✓] Zero-dependency JSON backend
v1.1  [✓] HMAC-SHA256 auth + JWT tokens
v1.2  [✓] Live chat + support tickets
v1.3  [✓] Admin panel + software depot
─────────────────────────────────────────
v2.0  [ ] SQLite / PostgreSQL migration
v2.1  [ ] WebSocket real-time chat
v2.2  [ ] File upload for software depot
v2.3  [ ] Rate limiting + IP banning
v2.4  [ ] 2FA support (TOTP)
v2.5  [ ] Dark/light theme toggle (UI)
v3.0  [ ] Docker containerization
```

---

## `>> CREATOR`

<div align="center">

```
  OPERATOR  : ARUNACHALAM
  ALIAS     : gojosaturo
  BASE      : Vellore, Tamil Nadu 🇮🇳
  OS        : Arch Linux + Hyprland
  SPECIALTY : Full-Stack · Android · Linux · Cybersecurity
```

[![GitHub](https://img.shields.io/badge/GITHUB-Arunachalam--gojosaturo-ff2020?style=for-the-badge&logo=github&logoColor=white&labelColor=0d0d0d)](https://github.com/Arunachalam-gojosaturo)
[![Instagram](https://img.shields.io/badge/INSTAGRAM-@saturogojo__ac-ff2020?style=for-the-badge&logo=instagram&logoColor=white&labelColor=0d0d0d)](https://instagram.com/saturogojo_ac)

</div>

---

<div align="center">

<img src="https://capsule-render.vercel.app/api?type=rect&color=0:0d0d0d,40:1a0000,100:0d0d0d&height=80&section=footer&text=ARC-NETWORK+%7C+BUILT+BY+ARUNACHALAM&fontSize=16&fontColor=ff2020&animation=fadeIn"/>

</div>
