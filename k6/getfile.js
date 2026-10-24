/**
 * k6 load test — GET /api/file/:code/info
 *
 * Setup: uploads one file and hammers the info endpoint with 50 VUs for 30s.
 * This is the hot path — every user who clicks a share link hits this.
 *
 * Checks:
 *   - 95% of requests under 1 second (info is lightweight, should be fast)
 *   - Error rate below 1%
 *
 * Run:
 *   k6 run k6/getfile.js
 *
 * Against prod:
 *   k6 run -e BASE_URL=https://flexshare-api.onrender.com k6/getfile.js
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

const errorRate = new Rate('error_rate');

export const options = {
  vus:      50,
  duration: '30s',
  thresholds: {
    http_req_duration: ['p(95)<1000'],  // info endpoint should be fast
    error_rate:        ['rate<0.01'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

// Upload a file once before the test starts — all VUs share this code
export function setup() {
  const res = http.post(`${BASE_URL}/api/uploads`, {
    file:           http.file('setup file for load test', 'setup.txt', 'text/plain'),
    conversionType: 'none',
  });

  if (res.status !== 200) {
    throw new Error(`Setup upload failed with status ${res.status}: ${res.body}`);
  }

  const code = res.json('code');
  console.log(`[setup] uploaded file with code: ${code}`);
  return { code };
}

export default function ({ code }) {
  const res = http.get(`${BASE_URL}/api/file/${code}/info`);

  const ok = check(res, {
    'status is 200':           (r) => r.status === 200,
    'has originalFileName':    (r) => r.json('originalFileName') !== undefined,
    'hasPassword is false':    (r) => r.json('hasPassword') === false,
  });

  errorRate.add(!ok);
  sleep(0.5);
}
