const https = require('https');
const logger = require('./logger');

const PING_INTERVAL_MS = 14 * 60 * 1000; // 14 minutes — just under Render's 15-min inactivity timeout

/**
 * Keeps the Render free-tier instance warm by pinging /api/health every 14 minutes.
 *
 * OFF by default — Render will sleep normally when idle.
 * Turn it on by setting KEEP_ALIVE=true in the Render dashboard env vars,
 * then triggering a manual redeploy. Remove/unset it when you're done.
 *
 * Only ever runs in production; always a no-op in development.
 */
function startKeepAlive() {
  if (process.env.NODE_ENV !== 'production') return;

  if (process.env.KEEP_ALIVE !== 'true') {
    logger.log('[KeepAlive] Disabled (set KEEP_ALIVE=true in Render dashboard to enable)');
    return;
  }

  const baseUrl = process.env.RENDER_EXTERNAL_URL;
  if (!baseUrl) {
    logger.log('[KeepAlive] RENDER_EXTERNAL_URL not set — skipping keep-alive');
    return;
  }

  const url = `${baseUrl}/api/health`;
  logger.log(`[KeepAlive] Enabled — pinging ${url} every 14 minutes`);

  setInterval(() => {
    https.get(url, (res) => {
      logger.log(`[KeepAlive] Ping → ${res.statusCode}`);
      res.resume(); // drain so the socket closes cleanly
    }).on('error', (err) => {
      logger.error('[KeepAlive] Ping failed:', err.message);
    });
  }, PING_INTERVAL_MS);
}

module.exports = { startKeepAlive };
