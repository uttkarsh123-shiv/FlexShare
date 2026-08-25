# FlexShare

A file conversion and sharing platform. Upload files, convert between formats, and share via a 6-digit code — with optional password protection, expiry, and download limits. No sign-up required.

**Live:** [flex-share.vercel.app](https://flex-share.vercel.app)  
**API:** [flexshare-api.duckdns.org](https://flexshare-api.duckdns.org/api/health)

---

## Features

- 13+ conversion formats — Images (PNG, JPG, WebP, GIF, BMP, AVIF), PDF, Word, Excel, PowerPoint
- Async conversion via BullMQ job queue (Redis-backed)
- AWS S3 storage with presigned URLs — files never publicly accessible
- Automatic S3 + MongoDB cleanup cron on expiry
- Password-protected files with bcrypt hashing
- Configurable expiry (1h → 7d) and per-file download limits
- 6-digit shareable codes — no long URLs
- Rate limiting, Helmet security headers, CORS whitelist
- Auto-deployment via GitHub Actions → EC2

---

## Architecture

```
Browser (React + Vite)          Vercel (CDN)
        │
        │ HTTPS
        ▼
Nginx (SSL · Let's Encrypt)     EC2 Ubuntu 22.04
        │
        ▼
Express API (Node 20 · PM2)
        │            │            │
        ▼            ▼            ▼
   MongoDB        Redis         AWS S3
  (metadata)   (job queue)  (file storage)
        │
        ▼
  BullMQ Worker (PM2)
```

**Upload flow (with conversion):**
1. Client uploads file → backend stores original in S3, enqueues job
2. BullMQ worker downloads from S3, converts (Sharp / LibreOffice)
3. Worker uploads converted file to S3, sets DB status → `done`
4. Client polls `/api/uploads/status/:code` until done

**Download flow:**
1. Client sends code + optional password
2. Backend validates expiry, password, download limit
3. Backend generates 1-hour S3 presigned URL
4. Client downloads directly from S3 — no proxying

**File cleanup:**
- Cron runs hourly — finds expired MongoDB documents, deletes S3 objects first, then removes documents
- Prevents orphaned files in S3

---

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React 19, Vite 7, React Router v7, Space Grotesk, Lucide React |
| Backend | Node.js 20, Express 5, Mongoose 8 |
| Queue | BullMQ 5, Redis |
| Storage | AWS S3 |
| Database | MongoDB Atlas |
| File Processing | Sharp, LibreOffice, pdf-lib, pdf-parse, mammoth |
| Security | bcryptjs, Helmet, CORS, Joi, express-rate-limit |
| Deployment | EC2 (Ubuntu 22.04) + Nginx + PM2 + Certbot, Vercel |
| CI/CD | GitHub Actions |

---

## Local Development

### Prerequisites

- Node.js 20+
- Docker (for Redis)
- MongoDB Atlas URI or local MongoDB
- AWS S3 bucket + IAM credentials
- LibreOffice (for document conversions)

### Backend

```bash
cd backend
npm install
```

Create `backend/.env.development`:

```env
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:5173

MONGO_URI=mongodb://localhost:27017/flexshare

REDIS_URL=redis://localhost:6379

AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_REGION=ap-southeast-2
AWS_S3_BUCKET=your-bucket-name
```

Start Redis:

```bash
docker run -d --name redis-local -p 6379:6379 redis:7-alpine
```

Start API server + worker (two terminals):

```bash
npm run dev
npm run dev:worker
```

### Frontend

```bash
cd frontend
npm install
```

Create `frontend/.env.development`:

```env
VITE_API_URL=http://localhost:3000
```

```bash
npm run dev
```

### LibreOffice

```bash
# Ubuntu
sudo apt-get install -y libreoffice

# macOS
brew install --cask libreoffice
```

---

## Project Structure

```
FlexShare/
├── .github/
│   └── workflows/
│       └── deploy.yml        # Auto-deploy backend to EC2 on push
├── backend/
│   ├── config/               # DB + S3 client
│   ├── controller/           # Upload + file access logic
│   ├── middleware/            # Multer, validation, rate limiting, error handler
│   ├── model/                # Mongoose file schema
│   ├── queue/                # BullMQ queue, worker, Redis connection
│   ├── route/                # API routes
│   ├── utils/                # S3 helper, LibreOffice converter, cleanup cron, logger
│   ├── app.js
│   ├── index.js              # API server entry
│   └── worker.js             # BullMQ worker entry
└── frontend/
    └── src/
        ├── component/        # Navbar (+ modals), Toast, Footer
        ├── components/       # File page sub-components (lazy-loaded)
        ├── context/          # Toast context
        ├── pages/            # Hero, UploadPage, FilePage, Notfound
        └── styles/           # CSS per-component
```

---

## API Reference

### Upload
```
POST /api/uploads
Content-Type: multipart/form-data

file           required  max 10MB
conversionType           "pdf->word" | "image->png" | "none" | ...
description    optional  max 500 chars
password       optional  min 4 chars
expiryHours              1–168 (default: 1)
maxDownloads   optional  1–100

→ { code, status: "pending" | "done", expiry }
```

### Conversion status
```
GET /api/uploads/status/:code
→ { code, status: "pending" | "processing" | "done" | "failed" }
```

### File info
```
GET /api/file/:code/info
→ { originalFileName, conversionType, expiry, hasPassword, downloadCount, maxDownloads }
```

### Download
```
POST /api/file/:code
{ password? }
→ { fileUrl: "<1hr presigned S3 URL>", downloadCount }
```

### Health
```
GET /api/health
→ { status: "OK", uptime, memory, environment }
```

---

## Rate Limits

| Endpoint | Limit |
|---|---|
| Upload | 10 req / min |
| File access | 10 req / min |
| File info | 20 req / min |
| General API | 30 req / min |

---

## Deployment

### Backend — EC2 + Nginx + PM2

```bash
# On EC2 (Ubuntu 22.04)
git clone https://github.com/uttkarsh123-shiv/FlexShare.git ~/FlexShare
cd ~/FlexShare/backend
npm ci --omit=dev

# Create production env
nano .env.production

# Start with PM2
NODE_ENV=production pm2 start index.js  --name flexshare-backend
NODE_ENV=production pm2 start worker.js --name flexshare-worker
pm2 save && pm2 startup

# SSL
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.duckdns.org
```

Required `.env.production` keys:

```env
NODE_ENV=production
PORT=3000
FRONTEND_URL=https://your-app.vercel.app
MONGO_URI=
REDIS_URL=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=
AWS_S3_BUCKET=
```

### CI/CD — GitHub Actions

Push to `main` with any `backend/` change → workflow SSHs into EC2 → pulls code → `npm ci` → restarts PM2 → verifies both processes online.

Required GitHub secrets: `EC2_HOST`, `EC2_USER`, `EC2_SSH_KEY`.

### Frontend — Vercel

```
Root directory:   frontend
Build command:    npm run build
Output directory: dist
Env variable:     VITE_API_URL=https://your-backend-domain
```

---

## S3 Setup

1. Create bucket with **Block all public access** enabled
2. IAM user policy scoped to bucket:

```json
{
  "Effect": "Allow",
  "Action": ["s3:PutObject", "s3:GetObject", "s3:DeleteObject"],
  "Resource": "arn:aws:s3:::your-bucket-name/*"
}
```

3. Add CORS rule allowing your frontend origin
4. No lifecycle rules needed — backend cron handles all cleanup

---

## Author

Uttkarsh Singh — [github.com/uttkarsh123-shiv](https://github.com/uttkarsh123-shiv)

---

## License

ISC
