# FlexShare

A file conversion and sharing platform. Upload files, convert between formats, and share via a 6-digit code — with optional password protection, expiry, and download limits. No sign-up required.

**Live:** [flex-share.vercel.app](https://flex-share.vercel.app)  
**API:** [flexshare-api.onrender.com](https://flexshare-api.onrender.com/api/health)

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
- Auto-deployment via Render (push to `main` → deploy)

---

## Architecture

```
Browser (React + Vite)          Vercel (CDN)
        │
        │ HTTPS
        ▼
Render (SSL · managed TLS)
        │
        ▼
Express API (Node 20)
        │            │            │
        ▼            ▼            ▼
   MongoDB        Redis         AWS S3
  (metadata)   (job queue)  (file storage)
        │
        ▼
  BullMQ Worker (Docker on Render)
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
| Deployment | Render (Web Service + Docker Worker), Vercel |
| CI/CD | Render auto-deploy on push to `main` |

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
├── render.yaml                   # Render service definitions
├── backend/
│   ├── config/               # DB + S3 client
│   ├── controller/           # Upload + file access logic
│   ├── middleware/            # Multer, validation, rate limiting, error handler
│   ├── model/                # Mongoose file schema
│   ├── queue/                # BullMQ queue, worker, Redis connection
│   ├── route/                # API routes
│   ├── storage/              # In-memory fallback store (used when MongoDB unavailable)
│   ├── tests/                # Jest + Supertest integration tests
│   ├── utils/                # S3 helper, LibreOffice converter, cleanup cron, logger
│   ├── Dockerfile            # Worker image (Node 20 + LibreOffice)
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

## Testing

The backend uses **Jest** + **Supertest** for integration tests. Tests run against the Express app directly — no running server needed.

```bash
cd backend
npm test
```

### Test files

| File | What it covers |
|---|---|
| `tests/upload.test.js` | Upload validation — missing file, invalid conversion type, short password, out-of-range download limit |
| `tests/getFile.test.js` | File retrieval — short/invalid codes (400), non-existent codes (404) |

### Notes

- Tests run without a real MongoDB or Redis connection. If MongoDB is unavailable, the app falls back to an in-memory store automatically.
- Each test file closes its own Redis and Mongoose connections via `afterAll` so Jest exits cleanly.
- To add a new test file, follow the same pattern and include the `afterAll` teardown block.

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

### Backend — Render

The backend is defined in `render.yaml` at the repo root. Render auto-deploys on every push to `main`.

Two services are deployed:

| Service | Type | Entry point |
|---|---|---|
| `flexshare-api` | Web Service (Node 20) | `node index.js` |
| `flexshare-worker` | Web Service (Docker) | `node worker.js` via Dockerfile |

Required environment variables (set in Render dashboard or `render.yaml`):

```env
NODE_ENV=production
PORT=3000
FRONTEND_URL=https://flex-share.vercel.app
MONGO_URI=
REDIS_URL=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=
AWS_S3_BUCKET=
```

### Frontend — Vercel

```
Root directory:   frontend
Build command:    npm run build
Output directory: dist
Env variable:     VITE_API_URL=https://flexshare-api.onrender.com
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
