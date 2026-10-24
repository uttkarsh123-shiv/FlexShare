# k6 Load Tests

Performance tests for FlexShare's two critical endpoints.

## Install k6

```bash
# Windows (winget)
winget install k6 --source winget

# or download from https://k6.io/docs/get-started/installation/
```

## Run locally (dev server must be running)

```bash
# Upload throughput — 20 VUs for 30s
k6 run k6/upload.js

# File retrieval under load — 50 VUs for 30s
k6 run k6/getfile.js
```

## Run against production

```bash
k6 run -e BASE_URL=https://flexshare-api.onrender.com k6/upload.js
k6 run -e BASE_URL=https://flexshare-api.onrender.com k6/getfile.js
```

## What to look at in results

| Metric | Target |
|---|---|
| `http_req_duration p(95)` | uploads < 3s, getfile < 1s |
| `error_rate` | < 1% |
| `http_reqs` | total throughput (req/s) |
