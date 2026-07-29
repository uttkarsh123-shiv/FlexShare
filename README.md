# FlexShare

A file conversion and sharing platform built with React and Node.js. Upload files, convert between formats, and share via a 6-digit code with optional password protection, expiry, and download limits.

Live: [flexshare-omega.vercel.app](https://flexshare-omega.vercel.app)

---

## Features

- 17 conversion formats — images, PDF, Word, Excel, PowerPoint
- Async conversion via BullMQ job queue (Redis-backed)
- AWS S3 storage with presigned URLs — files are never publicly accessible
- Automatic S3 cleanup cron tied to MongoDB document expiry
- Password-protected files with bcrypt hashing
- Configurable expiry (1 hour to 7 days) and download limits
- 6-digit shareable codes — no long URLs, no sign-up required
- Rate limiting per endpoint, Helmet security headers, CORS whitelist

---

## Architecture

```
Browser (React + Vite on Vercel)
    |
    | HTTPS
    v
Nginx (SSL termination)
    |
    v
Express Backend (Node.js 20, PM2)
    |           |           |
    v           v           v
MongoDB      Redis       AWS S3
(metadata)  (job queue) (file storage)
```

Upload flow with conversion:
1. Client uploads file — backend uploads original to S3 temp folder, enqueues job with S3 key only (no buffer in Redis)
2. BullMQ worker downloads file from S3, converts (Sharp / LibreOffice)
3. Worker streams converted file to S3, updates DB record status to done
4. Client polls `/api/uploads/status/:code` until status is done

Download flow:
1. Client requests file by code
2. Backend validates expiry, password, download limit
3. Backend generates a 1-hour S3 presigned URL
4. Client downloads directly from S3

File expiry:
- Cleanup cron runs on startup and every hour
- Finds expired MongoDB documents, deletes their S3 files first, then removes the documents
- Prevents orphaned S3 files

---

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| Frontend | React 19, Vite 7, React Router v7, Axios, Lucide React |
| Backend | Node.js 20, Express 5, Mongoose |
| Queue | BullMQ, Redis (local) |
| Storage | AWS S3 (ap-southeast-2) |
| Database | MongoDB Atlas |
| File Processing | Sharp (images), LibreOffice (documents), pdf-lib, pdf-parse |
| Security | bcrypt, Helmet, CORS, Joi, express-rate-limit |
| Deployment | EC2 (Ubuntu 22.04) + Nginx + PM2 + Let's Encrypt, Vercel |

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

```env
MONGO_URI=mongodb://localhost:27017/flexshare
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:5173

REDIS_URL=redis://localhost:6379

AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_REGION=ap-southeast-2
AWS_S3_BUCKET=your-bucket-name
```

Start Redis via Docker:

```bash
docker run -d --name redis-local -p 6379:6379 redis:7-alpine
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

```env
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
│   ├── utils/           # S3 helper, LibreOffice converter, logger, S3 cleanup cron
│   └── app.js
└── frontend/
    └── src/
        ├── component/   # Navbar, Toast, Footer
        ├── components/  # File page sub-components
        ├── context/     # Toast context
        ├── pages/       # Hero, UploadPage, FilePage
        └── styles/
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
| File info | 20 req/min |
| File access | 10 req/min |
| Upload | 10 req/min |
| General API | 30 req/min |

---

## Deployment

### Backend (EC2 + Nginx + PM2)

Requirements:
- Ubuntu 22.04 LTS
- Node.js 20, Nginx, Redis, PM2, LibreOffice

```bash
git clone https://github.com/UttkarshSingh1738/FlexShare.git
cd FlexShare/backend
npm install --omit=dev
```

Create `.env.production` with all required variables, then:

```bash
NODE_ENV=production pm2 start index.js --name flexshare-backend
pm2 save
pm2 startup
```

Required environment variables:

```env
NODE_ENV=production
MONGO_URI=
REDIS_URL=redis://localhost:6379
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=
AWS_S3_BUCKET=
FRONTEND_URL=
PORT=3000
```

SSL via Certbot (Let's Encrypt):

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.duckdns.org
```

### Frontend (Vercel)

```
Root directory: frontend
Build command: npm run build
Output: dist
Environment: VITE_API_URL=https://your-backend-domain
```

---

## S3 Bucket Setup

1. Create bucket with block all public access enabled
2. Create IAM user with policy scoped to your bucket:
```json
{
  "Effect": "Allow",
  "Action": ["s3:PutObject", "s3:GetObject", "s3:DeleteObject"],
  "Resource": "arn:aws:s3:::your-bucket-name/*"
}
```
3. Add CORS rule allowing your frontend origin
4. No lifecycle rules needed — cleanup is handled by the backend cron

Files are never publicly accessible. All downloads go through backend-generated presigned URLs valid for 1 hour.

---

## Author

Uttkarsh Singh — [github.com/UttkarshSingh1738](https://github.com/UttkarshSingh1738)

---

## License

ISC
