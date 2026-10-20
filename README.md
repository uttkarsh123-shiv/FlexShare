# FlexShare

A file conversion and sharing platform. Upload files, convert between 15+ formats, and share with a 6-digit code — with optional password protection, expiry, and download limits. No sign-up required.

**Live:** [flex-share.vercel.app](https://flex-share.vercel.app)  
**API:** [flexshare-api.onrender.com](https://flexshare-api.onrender.com/api/health)

---

## Product Status

| Area | Completion |
|---|---|
| Core upload + share flow | ██████████ 100% |
| File conversion (images) | ██████████ 100% |
| File conversion (documents) | █████████░ 90% |
| Download + presigned URL flow | ██████████ 100% |
| Password protection | ██████████ 100% |
| Expiry + download limits | ██████████ 100% |
| Async conversion queue (BullMQ) | ██████████ 100% |
| S3 cleanup cron | ██████████ 100% |
| In-memory fallback storage | ████████░░ 80% |
| Upload queue UI + progress | ██████████ 100% |
| File history (localStorage) | ██████████ 100% |
| QR code sharing | ██████████ 100% |
| Rate limiting + security headers | ██████████ 100% |
| Input validation (Joi) | ██████████ 100% |
| Backend tests | ████░░░░░░ 40% |
| Frontend tests | ██░░░░░░░░ 20% |
| Benchmarks | █████░░░░░ 50% |

**Overall: ~88% production-ready**

---

## Features

- **15+ conversion formats** — Images (PNG, JPG, WebP, GIF, BMP, AVIF), PDF, Word (DOCX), Excel (CSV), PowerPoint, plain text
- **Async conversion via BullMQ** — job queue backed by Redis; client polls status until done
- **AWS S3 storage with presigned URLs** — files never publicly accessible; direct client download, no proxying
- **Automatic S3 + MongoDB cleanup** — cron runs hourly; expires S3 objects before MongoDB TTL fires, preventing orphans
- **Password protection** — bcrypt-hashed; never stored in plaintext
- **Configurable expiry** — 1 hour to 7 days; per-file download limits (1–100)
- **6-digit shareable codes** — no long URLs
- **Upload queue with real-time progress** — multiple concurrent uploads, live status per job
- **File history** — browser-local; tracks codes, filenames, expiry; no account needed
- **QR code generation** — share any file via QR on the file page
- **Rate limiting, Helmet security headers, CORS whitelist**
- **In-memory fallback** — API stays functional if MongoDB is temporarily unavailable

---

## Optimization Notes

| Optimization | Status |
|---|---|
| S3 presigned URLs (no proxying) | ✅ Implemented |
| gzip compression (`compression` middleware) | ✅ Implemented |
| S3 key-only in Redis queue (no buffer serialization) | ✅ Implemented |
| Worker concurrency: 2 parallel conversion jobs | ✅ Implemented |
| LibreOffice concurrency cap (maxConcurrent: 2) | ✅ Implemented |
| Sharp: resize cap before image→PDF (2000×2000) | ✅ Implemented |
| Sharp JPEG quality: 85 (size vs quality balance) | ✅ Implemented |
| React lazy loading for all pages | ✅ Implemented |
| MongoDB indexes on `expiry`, `createdAt`, `downloadCount` | ✅ Implemented |
| Morgan: noisy bot requests suppressed | ✅ Implemented |
| Temp S3 file deleted after worker completes | ✅ Implemented |
| Local temp files cleaned up after each job | ✅ Implemented |
| Multer: buffer storage (no disk write on upload path) | ✅ Implemented |
| PDF→TXT via mammoth (avoids LibreOffice TXT bug on Windows) | ✅ Implemented |
| Axios upload timeout: 5 min (large file guard) | ✅ Implemented |
| Sharp: `withoutEnlargement` on resize | ✅ Implemented |
| Worker retry on LibreOffice output polling (50 × 100ms) | ✅ Implemented |
| MongoDB TTL index as last-resort cleanup backup | ✅ Implemented |
| Streaming converted file to S3 (`uploadFileToS3`) | ✅ Implemented |
| Caching / CDN for static assets | ⚠️ Vercel CDN only (no custom cache-control) |
| Worker autoscale / horizontal scaling | ⚠️ Single Render worker (manual scale) |
| PPT→image conversion | ❌ Not supported |

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
1. Client uploads file → backend stores original in S3 (`temp_files/`), enqueues job with S3 key only
2. BullMQ worker downloads from S3, converts (Sharp / LibreOffice)
3. Worker uploads converted file to S3 (`converted_files/`), deletes temp S3 key, sets DB status → `done`
4. Client polls `/api/uploads/status/:code` every 2 s until `done` or `failed`

**Upload flow (no conversion):**
1. Client uploads file → backend stores in S3 (`original_files/`), sets DB status → `done` immediately
2. Response returns code + expiry in one round trip — no polling

**Download flow:**
1. Client sends code + optional password
2. Backend validates expiry, password (bcrypt compare), download limit
3. Backend generates 1-hour S3 presigned URL
4. Client downloads directly from S3 — no API proxying, no bandwidth cost on the server

**File cleanup:**
- Cron runs on startup then every hour — finds expired MongoDB docs, deletes S3 objects first, then removes docs
- MongoDB TTL index (`expireAfterSeconds: 0`) acts as a safety net in case the cron misses a cycle
- Prevents orphaned files in S3

---

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React 19, Vite 7, React Router v7, Tailwind CSS v4, Lucide React |
| Backend | Node.js 20, Express 5, Mongoose 8 |
| Queue | BullMQ 5, Redis (ioredis) |
| Storage | AWS S3 (`@aws-sdk/client-s3` v3) |
| Database | MongoDB Atlas |
| File Processing | Sharp 0.34, LibreOffice, pdf-lib, pdf-parse, mammoth, xlsx |
| Security | bcryptjs, Helmet, CORS whitelist, Joi, express-rate-limit |
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

Create `backend/.env` (development):

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

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:3000
```

```bash
npm run dev
```

### LibreOffice

```bash
# Ubuntu / Debian
sudo apt-get install -y libreoffice

# macOS
brew install --cask libreoffice
```

> Document conversions (PDF↔Word, Excel→PDF, PPT→PDF) require LibreOffice. Image conversions work without it.

---

## Project Structure

```
FlexShare/
├── render.yaml                   # Render service definitions
├── backend/
│   ├── config/                   # DB + S3 client init
│   ├── controller/               # Upload + file access logic
│   ├── middleware/               # Multer, Joi validation, rate limiting, error handler
│   ├── model/                    # Mongoose file schema + in-memory proxy
│   ├── queue/                    # BullMQ queue, worker, Redis connection
│   ├── route/                    # API routes
│   ├── storage/                  # In-memory fallback store (MongoDB unavailable)
│   ├── tests/                    # Jest + Supertest integration tests
│   ├── utils/                    # S3 helper, LibreOffice converter, cleanup cron, logger
│   ├── Dockerfile                # Worker image (Node 20 + LibreOffice)
│   ├── app.js                    # Express app setup
│   ├── index.js                  # API server entry
│   └── worker.js                 # BullMQ worker entry
└── frontend/
    └── src/
        ├── component/            # Navbar, Toast, Footer, Accordion
        ├── components/           # File page sub-components, lazy loaders, error boundary
        ├── context/              # ToastContext, UploadQueueContext
        ├── hooks/                # useFileHistory (localStorage)
        ├── pages/                # Hero, UploadPage, FilePage, HistoryPage, NotFound
        └── styles/               # CSS per-component
```

---

## Testing

The backend uses **Jest** + **Supertest** for integration tests. Tests run against the Express app directly — no live server needed.

```bash
cd backend
npm test
```

| File | What it covers |
|---|---|
| `tests/upload.test.js` | Upload validation — missing file, invalid conversion type, short password, out-of-range download limit |
| `tests/getFile.test.js` | File retrieval — short/invalid codes (400), non-existent codes (404) |

**Notes:**
- Tests run without a real MongoDB or Redis connection — the app falls back to in-memory storage automatically.
- Each test file closes its own Redis and Mongoose connections via `afterAll` so Jest exits cleanly.

---

## API Reference

### Upload
```
POST /api/uploads
Content-Type: multipart/form-data

file           required  max 10 MB
conversionType           "pdf->word" | "image->png" | "none" | ...
description    optional  max 500 chars
password       optional  min 4 chars
expiryHours              1–168 (default: 1)
maxDownloads   optional  1–100

→ { code, status: "pending" | "done", expiry, hasPassword, maxDownloads, expiresIn }
```

### Conversion status
```
GET /api/uploads/status/:code
→ { code, status: "pending" | "processing" | "done" | "failed" }
```

### File info
```
GET /api/file/:code/info
→ { originalFileName, fileSize, conversionType, expiry, description,
    hasPassword, downloadCount, maxDownloads, createdAt }
```

### Download
```
POST /api/file/:code
{ password? }
→ { fileUrl: "<1-hour presigned S3 URL>", originalFileName, fileSize,
    conversionType, expiry, downloadCount, maxDownloads }
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

Two services defined in `render.yaml`:

| Service | Type | Entry point |
|---|---|---|
| `flexshare-api` | Web Service (Node 20) | `node index.js` |
| `flexshare-worker` | Web Service (Docker) | `node worker.js` via Dockerfile |

Render auto-deploys on every push to `main`.

Required env vars (Render dashboard or `render.yaml`):

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
2. Attach IAM policy scoped to the bucket:

```json
{
  "Effect": "Allow",
  "Action": ["s3:PutObject", "s3:GetObject", "s3:DeleteObject"],
  "Resource": "arn:aws:s3:::your-bucket-name/*"
}
```

3. Add CORS rule allowing your frontend origin
4. No lifecycle rules needed — the backend cron handles all cleanup; MongoDB TTL index is the safety net

---

## Known Limitations

- **10 MB file size limit** — enforced at the API layer
- **PPT→image** not supported (only PPT→PDF via LibreOffice)
- **Single worker instance** — conversion throughput scales manually; worker concurrency is set to 2
- **LibreOffice required for document conversions** — not available in all hosting environments; Dockerfile includes it for the worker
- **File history is browser-local** — clearing browser storage removes it; no cross-device sync

---

## Author

Uttkarsh Singh — [github.com/uttkarsh123-shiv](https://github.com/uttkarsh123-shiv)

---

## License

ISC
