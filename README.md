# ARC-NETWORK — Full-Stack Cybersecurity Hub

A complete full-stack web application with:
- **Backend:** Node.js HTTP server (zero dependencies to run)
- **Frontend:** Multi-page HTML/CSS/JS
- **Database:** JSON file persistence (upgradeable to SQLite/PostgreSQL)
- **Auth:** HMAC-SHA256 JWT tokens + secure password hashing
- **Real-time chat, support tickets, software depot, admin panel**

---

## Project Structure

```
arc-network/
├── backend/
│   ├── server.js            # Main HTTP server
│   ├── db/
│   │   └── database.js      # JSON DB + auth utilities
│   ├── routes/
│   │   ├── router.js        # API dispatcher
│   │   ├── auth.js          # Register / Login / Me
│   │   ├── software.js      # Tool depot
│   │   ├── tickets.js       # Support tickets
│   │   ├── messages.js      # Live chat
│   │   └── admin.js         # Admin panel
│   ├── middleware/
│   │   └── auth.js          # JWT verification
│   └── utils/
│       ├── logger.js
│       └── respond.js
├── frontend/
│   ├── css/
│   │   └── main.css         # Full design system
│   ├── js/
│   │   ├── api.js           # API client (fetch wrapper)
│   │   ├── ui.js            # Shared UI utilities
│   │   └── nav.js           # Shared nav injection
│   └── pages/
│       ├── index.html       # Homepage
│       ├── login.html
│       ├── register.html
│       ├── dashboard.html
│       ├── admin.html
│       ├── topics.html
│       ├── download.html
│       ├── guide.html
│       ├── support.html
│       └── about.html
└── README.md
```

---

## Quick Start (Zero Dependencies)

```bash
cd backend
node server.js
```
Then open: **http://localhost:3000**

---

## Production Start (with npm packages)

```bash
cd backend
npm install
node server.js
```

---

## Default Credentials

| Role  | Username | Password   |
|-------|----------|------------|
| Admin | admin    | admin123   |
| User  | ghost_op | test123    |

---

## API Endpoints

| Method | Path                        | Auth     | Description         |
|--------|-----------------------------|----------|---------------------|
| POST   | /api/auth/register          | None     | Register user       |
| POST   | /api/auth/login             | None     | Login               |
| GET    | /api/auth/me                | User     | Current user info   |
| GET    | /api/software               | None     | List all tools      |
| POST   | /api/software               | Admin    | Upload tool         |
| POST   | /api/software/:id/download  | User     | Download tool       |
| DELETE | /api/software/:id           | Admin    | Delete tool         |
| POST   | /api/tickets                | User     | Create ticket       |
| GET    | /api/tickets/mine           | User     | My tickets          |
| GET    | /api/tickets                | Admin    | All tickets         |
| PUT    | /api/tickets/:id            | Admin    | Update ticket       |
| GET    | /api/messages               | User     | Get chat messages   |
| POST   | /api/messages               | User     | Send message        |
| GET    | /api/admin/users            | Admin    | All users           |
| DELETE | /api/admin/users/:id        | Admin    | Delete user         |
| GET    | /api/admin/stats            | Admin    | Dashboard stats     |

---

## Deploy to Free Hosting

### Render.com (Free)
1. Push to GitHub
2. New Web Service → connect repo
3. Root directory: `backend`
4. Start command: `node server.js`
5. Add env var: `PORT=10000`

### Railway.app (Free)
1. Push to GitHub
2. New project → Deploy from GitHub
3. Root: `backend`, Start: `node server.js`

### Cyclic.sh / Glitch.com
- Both support zero-dependency Node.js apps out of the box.

---

## Security Features
- HMAC-SHA256 password hashing with random salt per user
- JWT-style tokens signed with HMAC-SHA256
- Timing-safe password comparison (prevents timing attacks)
- CORS headers on all responses
- HTML escaping on all user-generated content
- Admin role verification on every protected route

---

## Creator
**ARUNACHALAM**  
Instagram: [@saturogojo_ac](https://instagram.com/saturogojo_ac)  
GitHub: [Arunachalam-gojosaturo](https://github.com/Arunachalam-gojosaturo)
