# FlexShare — Testing Documentation

## Stack
- **Unit & Integration:** Jest + Supertest
- **Load/Performance:** k6
- **CI:** GitHub Actions

---

## Unit Tests
**File:** `backend/tests/unit.test.js`

### `validateUpload` middleware
Tests the Joi schema that validates every upload request body.

| Test | Expected |
|---|---|
| valid body (conversionType + expiryHours) | calls next() |
| invalid conversionType (video->mp4) | 400 |
| password shorter than 4 chars | 400 |
| maxDownloads over 100 | 400 |
| expiryHours over 168 | 400 |

### `validateFileCode` middleware
Tests the 6-character code format check on every file route.

| Test | Expected |
|---|---|
| valid 6-char code | calls next() |
| code shorter than 6 chars | 400 |
| code longer than 6 chars | 400 |

### `cleanupFiles` util
Tests the local temp file cleanup function with mocked `fs`.

| Test | Expected |
|---|---|
| deletes files that exist | `fs.unlinkSync` called for each path |
| skips files that do not exist | `fs.unlinkSync` never called |
| does not throw if deletion fails | resolves without throwing |

**Run:** `npx jest tests/unit.test.js`

---

## Integration Tests
**File:** `backend/tests/integration.test.js`

Tests full request/response cycle via Supertest against the real Express app (connects to real MongoDB + Redis using `.env`).

### `POST /api/uploads`

| Test | Expected |
|---|---|
| no file attached | 400, message defined |
| invalid conversionType | 400 |
| password shorter than 4 chars | 400 |
| maxDownloads out of range (200) | 400 |
| valid file upload | 200, 6-char share code returned |

### `GET /api/file/:code/info`

| Test | Expected |
|---|---|
| code shorter than 6 chars | 400 |
| non-existent code | 404 |
| code from a real upload | 200, correct fileName and description |

**Run:** `npx jest tests/integration.test.js`

---

## Load Tests (k6)
**Directory:** `k6/`
**Requires:** k6 installed + backend running on `http://localhost:3000`

### Install k6
```bash
winget install k6 --source winget
```

### `upload.js` — Upload throughput
Simulates 5 concurrent users uploading files for 30 seconds.

**Thresholds:**
- p(95) response time < 5s
- error rate < 1%

**Results (local, S3 ap-southeast-2):**
```
✓ status is 200
✓ has share code
✓ code is 6 chars
p(95) = 3.36s   avg = 3.16s   39 uploads   0 failures
```

**Run:** `k6 run k6/upload.js`

---

### `getfile.js` — File retrieval under load
Uploads one file in setup, then hammers `GET /api/file/:code/info` with 50 concurrent users for 30 seconds.

**Thresholds:**
- p(95) response time < 1s
- error rate < 1%

**Results (local):**
```
✓ status is 200
✓ has originalFileName
✓ hasPassword is false
p(95) = 231ms   avg = 60ms   2692 requests   80 req/s   0 failures
```

**Run:** `k6 run k6/getfile.js`

---

### `stress.js` — Breaking point / max concurrent users
Ramps from 1 → 10 → 25 → 50 → 100 VUs over 2.5 minutes to find where the server starts degrading.

**Results (local, rate limiting disabled):**
```
100 VUs  •  9093 requests  •  59 req/s  •  0 errors
p(95) = 467ms   avg = 110ms   max = 3.14s
✓ Server handled 100 concurrent users with 0% error rate
```

**Run:** `k6 run k6/stress.js`

---

### `ratelimit.js` — Rate limiter verification
Intentionally bursts 20 VUs to confirm the rate limiter returns 429s (not 500s) under traffic.

**Thresholds:**
- At least 50% of requests are rate limited (429)
- No 500 errors (server stays healthy)

**Run:** `k6 run k6/ratelimit.js`

> **Note:** Set `DISABLE_RATE_LIMIT=true` in `backend/.env` when running `upload.js` and `getfile.js` to prevent rate limiting during load tests. Keep it `false` (or remove it) when running `ratelimit.js`.

---

## CI — GitHub Actions
**File:** `.github/workflows/test.yml`

Runs on every push and PR to `main`.

```
push / PR → install deps → jest --forceExit → pass/fail
```

Secrets required in GitHub repo settings:
- `MONGO_URI`
- `REDIS_URL`
- `AWS_REGION`
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_S3_BUCKET`

---

## Running Everything Locally

```bash
cd backend

# All tests
npm test

# Unit only
npx jest tests/unit.test.js

# Integration only
npx jest tests/integration.test.js

# Load tests (backend must be running with DISABLE_RATE_LIMIT=true)
npm run dev
k6 run k6/upload.js
k6 run k6/getfile.js
k6 run k6/ratelimit.js   # set DISABLE_RATE_LIMIT=false first
```
