/**
 * k6 stress test — find the breaking point
 *
 * Ramps from 1 to 100 VUs on the getfile endpoint (lightest route).
 * Watch where p(95) spikes or errors appear — that's your limit.
 *
 * Run:
 *   k6 run k6/stress.js
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

const errorRate = new Rate('error_rate');

export const options = {
  stages: [
    { duration: '30s', target: 10  },  // ramp to 10
    { duration: '30s', target: 25  },  // ramp to 25
    { duration: '30s', target: 50  },  // ramp to 50
    { duration: '30s', target: 100 },  // ramp to 100
    { duration: '30s', target: 0   },  // ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'],
    error_rate:        ['rate<0.05'],   // tolerate up to 5% — we want to find the limit
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export function setup() {
  // Upload one file to use for all retrieval requests
  const res = http.post(`${BASE_URL}/api/uploads`, {
    file:           http.file('stress test file', 'stress.txt', 'text/plain'),
    conversionType: 'none',
  });
  if (res.status !== 200) throw new Error(`Setup failed: ${res.status}`);
  const code = res.json('code');
  console.log(`[setup] code: ${code}`);
  return { code };
}

export default function ({ code }) {
  const res = http.get(`${BASE_URL}/api/file/${code}/info`);

  const ok = check(res, {
    'status 200': (r) => r.status === 200,
    'no 500':     (r) => r.status !== 500,
  });

  errorRate.add(!ok);
  sleep(0.5);
}
