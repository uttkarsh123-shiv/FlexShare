/**
 * k6 load test — POST /api/uploads
 *
 * Simulates 20 concurrent users uploading a small text file for 30 seconds.
 * Checks that:
 *   - Every upload returns a 6-char share code
 *   - 95% of requests complete under 3 seconds
 *   - Error rate stays below 1%
 *
 * Run:
 *   k6 run k6/upload.js
 *
 * Against prod:
 *   k6 run -e BASE_URL=https://flexshare-api.onrender.com k6/upload.js
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

const errorRate    = new Rate('error_rate');
const uploadTrend  = new Trend('upload_duration', true);

export const options = {
  vus:      20,
  duration: '30s',
  thresholds: {
    http_req_duration: ['p(95)<3000'],  // 95% of uploads under 3s
    error_rate:        ['rate<0.01'],   // less than 1% errors
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export default function () {
  const fileContent  = http.file('hello from k6 load test', 'test.txt', 'text/plain');

  const payload = {
    file:           fileContent,
    conversionType: 'none',
  };

  const start = Date.now();
  const res   = http.post(`${BASE_URL}/api/uploads`, payload);
  uploadTrend.add(Date.now() - start);

  const ok = check(res, {
    'status is 200':      (r) => r.status === 200,
    'has share code':     (r) => r.json('code') !== undefined,
    'code is 6 chars':    (r) => r.json('code')?.length === 6,
  });

  errorRate.add(!ok);
  sleep(1);
}
