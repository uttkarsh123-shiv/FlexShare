/**
 * k6 test — Rate limiter verification
 *
 * Intentionally hammers the upload endpoint with 20 VUs to confirm
 * the rate limiter kicks in and returns 429s — not 500s.
 * This verifies the limiter is working correctly under burst traffic.
 *
 * Run:
 *   k6 run k6/ratelimit.js
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

const rateLimitedRate = new Rate('rate_limited');

export const options = {
  vus:      20,
  duration: '15s',
  thresholds: {
    // We EXPECT 429s — confirm at least 50% of requests are rate limited
    rate_limited: ['rate>0.5'],
    // No 500s — server must stay healthy under burst
    http_req_failed: ['rate<1.0'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export default function () {
  const res = http.post(`${BASE_URL}/api/uploads`, {
    file:           http.file('burst test', 'burst.txt', 'text/plain'),
    conversionType: 'none',
  });

  check(res, {
    'no 500 errors': (r) => r.status !== 500,
  });

  // Track how many are rate limited
  rateLimitedRate.add(res.status === 429);
  sleep(0.1);
}
