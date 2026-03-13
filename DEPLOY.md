# ARC-NETWORK — Complete Deployment Guide

## ════════════════════════════════════════
## STEP 0 — PROJECT STRUCTURE
## ════════════════════════════════════════

```
arc-network/
├── backend/
│   ├── server.js          ← Main server entry point
│   ├── package.json
│   ├── .env.example       ← Copy to .env and fill in
│   ├── data/              ← Auto-created on first run (JSON database)
│   ├── db/database.js
│   ├── middleware/auth.js
│   ├── routes/
│   │   ├── router.js
│   │   ├── auth.js
│   │   ├── software.js
│   │   ├── tickets.js
│   │   ├── messages.js
│   │   └── admin.js
│   └── utils/
│       ├── logger.js
│       └── respond.js
├── frontend/
│   ├── css/main.css
│   ├── js/
│   │   ├── api.js
│   │   ├── ui.js
│   │   └── nav.js
│   └── pages/
│       ├── index.html
│       ├── login.html
│       ├── register.html
│       ├── dashboard.html
│       ├── admin.html
│       ├── topics.html
│       ├── download.html
│       ├── guide.html
│       ├── support.html
│       └── about.html
├── .gitignore
├── Procfile               ← For Railway / Heroku
├── render.yaml            ← For Render.com
├── DEPLOY.md              ← This file
└── README.md
```

---

## ════════════════════════════════════════
## METHOD 1 — RUN LOCALLY (Fastest, 30 sec)
## ════════════════════════════════════════

### Requirements
- Node.js 18+ → https://nodejs.org

### Steps

```bash
# 1. Unzip the project
unzip arc-network.zip
cd arc-network

# 2. Go into backend
cd backend

# 3. Run the server (NO npm install needed — zero dependencies!)
node server.js

# 4. Open browser
#    http://localhost:3000
```

### Default Login Credentials
| Role  | Username  | Password  |
|-------|-----------|-----------|
| Admin | admin     | admin123  |
| User  | ghost_op  | test123   |

---

## ════════════════════════════════════════
## METHOD 2 — DEPLOY TO RENDER.COM (Free, Recommended)
## ════════════════════════════════════════

Render gives you a free live URL like: https://arc-network.onrender.com

### Step 1 — Create GitHub Repo

```bash
# Inside the arc-network folder:
git init
git add .
git commit -m "Initial commit — ARC-NETWORK"

# Go to https://github.com/new
# Create a new PRIVATE repo named: arc-network
# Then:
git remote add origin https://github.com/YOUR_USERNAME/arc-network.git
git branch -M main
git push -u origin main
```

### Step 2 — Deploy on Render

1. Go to **https://render.com** → Sign up (free)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub account → Select **arc-network** repo
4. Fill in settings:
   - **Name:** arc-network
   - **Root Directory:** `backend`
   - **Environment:** `Node`
   - **Build Command:** *(leave empty)*
   - **Start Command:** `node server.js`
   - **Plan:** Free
5. Click **"Advanced"** → Add Environment Variables:
   - `NODE_ENV` = `production`
   - `JWT_SECRET` = *(click "Generate")*
   - `PORT` = `10000`
6. Click **"Create Web Service"**
7. Wait ~2 minutes → your site is live!

⚠️ **Note:** Free Render instances sleep after 15 min of inactivity. First load may take ~30 seconds.

---

## ════════════════════════════════════════
## METHOD 3 — DEPLOY TO RAILWAY.APP (Free)
## ════════════════════════════════════════

Railway gives $5/month free credit — enough for 24/7 hosting.

### Steps

1. Go to **https://railway.app** → Sign up with GitHub
2. Click **"New Project"** → **"Deploy from GitHub repo"**
3. Select your **arc-network** repo
4. Railway auto-detects Node.js
5. Click the service → **"Settings"** tab:
   - **Root Directory:** `backend`
   - **Start Command:** `node server.js`
6. Go to **"Variables"** tab → Add:
   - `NODE_ENV` = `production`
   - `JWT_SECRET` = *(any random 64-char string)*
7. Go to **"Settings"** → **"Networking"** → **"Generate Domain"**
8. Your site is live instantly!

---

## ════════════════════════════════════════
## METHOD 4 — DEPLOY TO VPS (Ubuntu Server)
## ════════════════════════════════════════

For full control. Works on any Linux VPS (DigitalOcean, Hetzner, Linode, etc.)
DigitalOcean Droplet = $4/month, Hetzner = €3.29/month

### Step 1 — Set up VPS

```bash
# SSH into your server
ssh root@YOUR_SERVER_IP

# Update system
apt update && apt upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Verify
node --version   # should be v20.x.x
```

### Step 2 — Upload Project

```bash
# Option A — From your local machine, use SCP:
scp -r arc-network/ root@YOUR_SERVER_IP:/var/www/

# Option B — Clone from GitHub on the server:
cd /var/www
git clone https://github.com/YOUR_USERNAME/arc-network.git
```

### Step 3 — Configure Environment

```bash
cd /var/www/arc-network/backend

# Create .env file
cp .env.example .env
nano .env

# Edit these values:
PORT=3000
JWT_SECRET=paste_a_long_random_string_here_at_least_64_chars
NODE_ENV=production
```

### Step 4 — Install PM2 (Process Manager)

PM2 keeps your server running 24/7 and auto-restarts on crashes.

```bash
npm install -g pm2

# Start the app
cd /var/www/arc-network/backend
pm2 start server.js --name arc-network

# Auto-start on server reboot
pm2 startup
pm2 save

# Useful PM2 commands:
pm2 status          # check if running
pm2 logs arc-network   # see live logs
pm2 restart arc-network
pm2 stop arc-network
```

### Step 5 — Set Up Nginx Reverse Proxy

Nginx handles port 80/443 and forwards to your Node app on port 3000.

```bash
# Install nginx
apt install -y nginx

# Create site config
nano /etc/nginx/sites-available/arc-network
```

Paste this into the file:

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Enable the site
ln -s /etc/nginx/sites-available/arc-network /etc/nginx/sites-enabled/
nginx -t          # test config — should say "ok"
systemctl restart nginx
systemctl enable nginx
```

### Step 6 — Free SSL with Certbot (HTTPS)

```bash
# Install certbot
apt install -y certbot python3-certbot-nginx

# Get free SSL certificate (replace with your domain)
certbot --nginx -d your-domain.com -d www.your-domain.com

# Auto-renewal (certbot handles this automatically)
# Verify with:
certbot renew --dry-run
```

Your site is now live at **https://your-domain.com** 🎉

---

## ════════════════════════════════════════
## METHOD 5 — DEPLOY TO HEROKU
## ════════════════════════════════════════

```bash
# Install Heroku CLI: https://devcenter.heroku.com/articles/heroku-cli

# Login
heroku login

# Create app
heroku create arc-network-app

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=$(node -e "require('crypto').randomBytes(32).toString('hex')|console.log")

# The Procfile is already included — just push:
git push heroku main

# Open in browser
heroku open
```

---

## ════════════════════════════════════════
## API ENDPOINTS REFERENCE
## ════════════════════════════════════════

| Method | Endpoint                       | Auth   | Description          |
|--------|--------------------------------|--------|----------------------|
| POST   | /api/auth/register             | None   | Create account       |
| POST   | /api/auth/login                | None   | Login → get token    |
| GET    | /api/auth/me                   | User   | Get current user     |
| GET    | /api/software                  | None   | List tools           |
| POST   | /api/software                  | Admin  | Upload tool          |
| POST   | /api/software/:id/download     | User   | Download tool        |
| DELETE | /api/software/:id              | Admin  | Delete tool          |
| POST   | /api/tickets                   | User   | Create ticket        |
| GET    | /api/tickets/mine              | User   | My tickets           |
| GET    | /api/tickets                   | Admin  | All tickets          |
| PUT    | /api/tickets/:id               | Admin  | Update ticket status |
| GET    | /api/messages                  | User   | Get chat messages    |
| POST   | /api/messages                  | User   | Send chat message    |
| GET    | /api/admin/users               | Admin  | All users            |
| DELETE | /api/admin/users/:id           | Admin  | Delete user          |
| GET    | /api/admin/stats               | Admin  | Dashboard stats      |

---

## ════════════════════════════════════════
## TROUBLESHOOTING
## ════════════════════════════════════════

**Port already in use:**
```bash
lsof -i :3000
kill -9 PID_NUMBER
```

**Cannot find module / errors on start:**
```bash
node --version   # must be 18+
cd backend && node server.js
```

**Data not saving (permissions):**
```bash
chmod 755 backend/data/
```

**Forgotten admin password:**
```bash
# Delete the data file to reset to defaults
rm backend/data/arc_network.json
node server.js   # recreates with admin/admin123
```

**CORS errors in browser:**
- Make sure you're accessing via http://localhost:3000 (not opening HTML files directly)

---

## ════════════════════════════════════════
## SECURITY CHECKLIST FOR PRODUCTION
## ════════════════════════════════════════

- [ ] Change default passwords (admin/admin123, ghost_op/test123)
- [ ] Set a strong random JWT_SECRET (64+ chars)
- [ ] Enable HTTPS (Certbot on VPS, automatic on Render/Railway)
- [ ] Set NODE_ENV=production
- [ ] Keep Node.js updated
- [ ] Regularly backup backend/data/arc_network.json

---

**Built by ARUNACHALAM**
GitHub: https://github.com/Arunachalam-gojosaturo
Instagram: @saturogojo_ac
