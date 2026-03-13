# ARC-NETWORK v3 — Complete Setup Guide

## ═══════════════════════════════════════
## 1. RUN THE SERVER
## ═══════════════════════════════════════

```bash
cd backend
node server.js
# → http://localhost:3000
```
No npm install needed. Pure Node.js, zero dependencies.

---

## ═══════════════════════════════════════
## 2. DATABASE SETUP
## ═══════════════════════════════════════

The database is a **JSON file** stored at `backend/data/arc_network.json`.
It auto-creates on first run with seed data.

### Location
```
backend/
└── data/
    └── arc_network.json    ← your entire database
```

### Backup your database
```bash
cp backend/data/arc_network.json backup_$(date +%Y%m%d).json
```

### Reset database to defaults
```bash
rm backend/data/arc_network.json
node server.js    # recreates with admin/admin123 + sample data
```

### Want SQLite instead? (upgrade path)
Install better-sqlite3 and swap the DB module:
```bash
npm install better-sqlite3
# Then edit backend/db/database.js to use SQLite
# (see sqlite-upgrade branch in future releases)
```

---

## ═══════════════════════════════════════
## 3. CREATING ADMIN ACCOUNTS
## ═══════════════════════════════════════

### Method A — Use the CLI tool (RECOMMENDED)
```bash
cd backend

# Create a new admin from scratch
node setup-admin.js create --username=arunachalam --email=you@gmail.com --password=SecurePass123

# List all users and their IDs
node setup-admin.js list

# Promote an existing user to admin (use their ID from list)
node setup-admin.js promote --id=u-a1b2c3d4e5f6

# Reset a forgotten admin password
node setup-admin.js reset --username=admin --password=NewPassword456
```

### Method B — Via Admin Panel UI
1. Login as admin → go to /admin
2. In USERS tab, click **PROMOTE** next to any user
3. They become admin instantly

### Method C — Edit JSON directly
```bash
nano backend/data/arc_network.json
# Find the user in "users" array
# Change "role": "user"  →  "role": "admin"
# Save → no restart needed (DB reloads on next request)
```

---

## ═══════════════════════════════════════
## 4. GOOGLE OAUTH SETUP
## ═══════════════════════════════════════

### Step 1 — Create Google Cloud Project
1. Go to https://console.cloud.google.com
2. Click **"Select a project"** → **"New Project"**
3. Name it: `arc-network`
4. Click **"Create"**

### Step 2 — Enable Google Sign-In API
1. Go to **APIs & Services** → **Library**
2. Search: **"Google Identity"** or **"OAuth"**
3. Click **"Google Identity Services"** → **Enable**

### Step 3 — Create OAuth Credentials
1. Go to **APIs & Services** → **Credentials**
2. Click **"Create Credentials"** → **"OAuth 2.0 Client ID"**
3. If asked to configure consent screen:
   - Choose **External**
   - App name: `ARC-NETWORK`
   - User support email: your email
   - Developer contact: your email
   - Save → Back to Credentials
4. Application type: **Web application**
5. Name: `ARC-NETWORK Web`
6. **Authorized JavaScript origins:**
   - `http://localhost:3000` (for local dev)
   - `https://yourdomain.com` (for production)
7. **Authorized redirect URIs:**
   - `http://localhost:3000/api/auth/google/callback`
   - `https://yourdomain.com/api/auth/google/callback`
8. Click **Create** → Copy **Client ID** and **Client Secret**

### Step 4 — Set Environment Variables

**Local development (.env file in backend/):**
```bash
# backend/.env  (create this file)
PORT=3000
GOOGLE_CLIENT_ID=123456789-abcdef.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your-secret-here
BASE_URL=http://localhost:3000
JWT_SECRET=paste-a-long-random-string-here-64-chars-minimum
NODE_ENV=development
```

**Load .env on startup — add to top of server.js:**
```javascript
// Add this as the VERY FIRST LINE of backend/server.js:
require('fs').existsSync('.env') && require('fs').readFileSync('.env','utf8').split('\n').forEach(line=>{ const [k,...v]=line.split('='); if(k&&v.length) process.env[k.trim()]=v.join('=').trim(); });
```

**Or just set env vars in terminal:**
```bash
export GOOGLE_CLIENT_ID="your-client-id"
export GOOGLE_CLIENT_SECRET="your-secret"
export BASE_URL="http://localhost:3000"
node server.js
```

**Render.com / Railway — add in Environment Variables panel:**
| Key                   | Value                          |
|-----------------------|-------------------------------|
| GOOGLE_CLIENT_ID      | your-client-id                 |
| GOOGLE_CLIENT_SECRET  | your-secret                    |
| BASE_URL              | https://your-app.onrender.com  |
| JWT_SECRET            | (generate random)              |
| NODE_ENV              | production                     |

### Step 5 — Test Google Login
Start server → go to /login → click "Continue with Google"
New users get auto-registered. Existing users with same email get linked.

---

## ═══════════════════════════════════════
## 5. FILE UPLOADS (ADMIN)
## ═══════════════════════════════════════

### How it works
- Admin goes to /admin → "UPLOAD SOFTWARE" tab
- Drag & drop or click to select any file
- Fill in name, version, description
- Click **PUBLISH TO DEPOT**
- File is saved to `backend/uploads/` with a random name
- Users on /download see the tool and can click DOWNLOAD
- A real file download starts in their browser

### File storage location
```
backend/
└── uploads/
    ├── a1b2c3d4e5f6.zip    ← uploaded files (random names)
    ├── 7890abcdef12.sh
    └── ...
```

### File size limit
Default: **500 MB per file**
To change, edit `backend/utils/multipart.js`:
```javascript
const MAX_FILE_SIZE = 500 * 1024 * 1024; // change this
```

### For large files on production
Consider using **Cloudflare R2** or **AWS S3**:
1. Upload file to S3/R2 → get a URL
2. In admin panel: don't attach a file, just put the URL in description
3. Or modify `routes/software.js` to use S3 SDK instead of local storage

---

## ═══════════════════════════════════════
## 6. ENVIRONMENT VARIABLES REFERENCE
## ═══════════════════════════════════════

| Variable              | Default                | Description               |
|-----------------------|------------------------|---------------------------|
| PORT                  | 3000                   | Server port               |
| JWT_SECRET            | random (changes on restart!) | MUST SET for production |
| GOOGLE_CLIENT_ID      | (empty = disabled)     | Google OAuth Client ID    |
| GOOGLE_CLIENT_SECRET  | (empty = disabled)     | Google OAuth Secret       |
| BASE_URL              | http://localhost:3000  | Your domain URL           |
| NODE_ENV              | development            | Set "production" for prod |

⚠️ **IMPORTANT:** Set JWT_SECRET as a fixed value in production!
If not set, it's random per restart, invalidating all user sessions.

Generate a good secret:
```bash
node -e "const crypto=require('crypto');console.log(crypto.randomBytes(32).toString('hex'))"
```

---

## ═══════════════════════════════════════
## 7. DEPLOYMENT CHECKLIST
## ═══════════════════════════════════════

Before going live:
- [ ] Change admin password from `admin123`
- [ ] Set `JWT_SECRET` to a fixed 64+ char random string
- [ ] Set `NODE_ENV=production`
- [ ] Set `BASE_URL` to your actual domain
- [ ] Configure Google OAuth redirect URIs for your domain
- [ ] Enable HTTPS (Certbot on VPS, automatic on Render/Railway)
- [ ] Set up regular database backups
- [ ] Test Google login end-to-end

---

**Built by ARUNACHALAM**
GitHub: https://github.com/Arunachalam-gojosaturo
Instagram: @saturogojo_ac
