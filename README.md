# FlexShare

A file conversion and sharing platform built with React and Node.js. Upload files, convert between formats, and share via a 6-digit code with optional password protection, expiry, and download limits.

Live: [flex-share.vercel.app](https://flex-share.vercel.app)

---

## Features

- 17 conversion formats — images, PDF, Word, Excel, PowerPoint
- Async conversion via BullMQ job queue (Redis-backed)
- AWS S3 storage with automatic file expiry via lifecycle rules
- Password-protected files with bcrypt hashing
- Configurable expiry (1 hour to 7 days) and download limits
- 6-digit shareable codes — no long URLs, no sign-up required
- Rate limiting per endpoint, Helmet security headers, CORS whitelist
- Docker-based backend deployed on Render via GHCR

---

## Architecture

```
Browser (React + Vite)
    |
    | REST API
    v
Express Backend (Node.js 20)
    |           |           |
    v           v           v
MongoDB      Redis       AWS S3
(metadata)  (job queue) (file storage)
```

Upload flow with conversion:
1. Client uploads file — backend stores job in Redis queue, responds immediately with code
2. BullMQ worker picks up job, converts file (Sharp / LibreOffice)
3. Worker uploads converted file to S3, updates DB record status to done
4. Client polls `/api/uploads/status/:code` until status is done

Download flow:
1. Client requests file by code
2. Backend validates expiry, password, download limit
3. Backend generates a 1-hour S3 presigned URL
4. Client downloads directly from S3

---

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| Frontend | React 19, Vite 7, React Router v7, Axios, Lucide React |
| Backend | Node.js 20, Express 5, Mongoose |
| Queue | BullMQ, Redis (Redis Cloud) |
| Storage | AWS S3 |
| Database | MongoDB Atlas |
| File Processing | Sharp (images), LibreOffice (documents), pdf-lib, pdf-parse |
| Security | bcrypt, Helmet, CORS, Joi, express-rate-limit |
| DevOps | Docker, GitHub Actions, GHCR, Render, Vercel |

---

## Local Development

### Prerequisites

- Node.js 20+
- Docker (for Redis)
- MongoDB Atlas URI or local MongoDB
- AWS account with S3 bucket
- LibreOffice installed (for document conversions)

### Backend

```bash
cd backend
npm install
```

Create `backend/.env.development`:

```
MONGO_URI=mongodb://localhost:27017/flexshare
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:5173

REDIS_URL=redis://localhost:6379

AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_REGION=ap-south-1
AWS_S3_BUCKET=your-bucket-name
```

Start Redis via Docker:

```bash
docker run -d --name redis-flexshare -p 6379:6379 redis:alpine
```

Start backend:

```bash
npm run dev
```

### Frontend

```bash
cd frontend
npm install
```

Create `frontend/.env.development`:

```
VITE_API_URL=http://localhost:3000
```

```bash
npm run dev
```

### LibreOffice Installation

Ubuntu/Debian:
```bash
sudo apt-get install libreoffice
```

macOS:
```bash
brew install --cask libreoffice
```

Windows: download from [libreoffice.org](https://www.libreoffice.org/download/)

---

## Project Structure

```
FlexShare/
├── backend/
│   ├── config/          # S3 client, database connection
│   ├── controller/      # Upload and file access logic
│   ├── middleware/       # Multer, validation, rate limiting
│   ├── model/           # Mongoose file schema
│   ├── queue/           # BullMQ queue, worker, Redis connection
│   ├── route/           # API routes
│   ├── utils/           # S3 helper, LibreOffice converter, logger, cleanup
│   ├── Dockerfile
│   └── app.js
├── frontend/
│   └── src/
│       ├── component/   # Navbar, Toast, Footer
│       ├── components/  # File page sub-components
│       ├── context/     # Toast context
│       ├── pages/       # Hero, UploadPage, FilePage
│       └── styles/
└── .github/workflows/   # Docker build and push to GHCR
```

---

## API Reference

### Upload file
```
POST /api/uploads
Content-Type: multipart/form-data

Fields:
  file           required, max 10MB
  conversionType e.g. "pdf->word", "image->png", "none"
  description    optional, max 500 chars
  password       optional, min 4 chars
  expiryHours    1-168, default 1
  maxDownloads   1-100, optional

Response:
  { code, jobId, expiry, status: "pending" | "done" }
```

### Check conversion status
```
GET /api/uploads/status/:code

Response:
  { code, status: "pending" | "processing" | "done" | "failed" }
```

### Get file info
```
GET /api/file/:code/info

Response:
  { originalFileName, fileSize, conversionType, expiry, hasPassword, downloadCount, maxDownloads }
```

### Access / download file
```
POST /api/file/:code
Body: { password? }

Response:
  { fileUrl: "<presigned S3 URL>", originalFileName, downloadCount, ... }
```

### Health check
```
GET /api/health

Response:
  { status: "OK", uptime, memory, environment }
```

---

## Rate Limits

| Endpoint | Limit |
|----------|-------|
| File info | 2 req/min |
| File access | 5 req/min |
| Upload | 10 req/min |
| General API | 30 req/min |

---

## Deployment

### Backend (Render via Docker)

Push to main triggers GitHub Actions which builds the Docker image and pushes to GHCR. Render pulls the latest image automatically.

Required environment variables on Render:

```
NODE_ENV=production
MONGO_URI=
REDIS_URL=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=
AWS_S3_BUCKET=
FRONTEND_URL=
PORT=3000
```

### Frontend (Vercel)

```
Build command: npm run build
Output: dist
Environment: VITE_API_URL=https://your-backend.onrender.com
```

---

## S3 Bucket Setup

1. Create bucket with block all public access enabled
2. Create IAM user with `AmazonS3FullAccess` policy, generate access keys
3. Add lifecycle rule: expire objects after 8 days (covers max 7-day user expiry)

Files are never publicly accessible. All downloads go through backend-generated presigned URLs valid for 1 hour.

---

## Author

Uttkarsh Singh — [github.com/UttkarshSingh1738](https://github.com/UttkarshSingh1738)

---

## License

ISC
