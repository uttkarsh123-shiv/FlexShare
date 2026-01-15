# =========================
# Base Image (STABLE)
# =========================
FROM node:20-bullseye-slim

# =========================
# System dependencies
# =========================
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    libreoffice \
    libcairo2 \
    libjpeg62-turbo \
    libpango-1.0-0 \
    libgif7 \
    libpixman-1-0 \
    libfreetype6 \
    && rm -rf /var/lib/apt/lists/*

# =========================
# Python packages
# =========================
RUN pip3 install --no-cache-dir \
    docx2pdf \
    pdf2docx

# =========================
# App setup
# =========================
WORKDIR /app

COPY package*.json ./

RUN npm ci --only=production --no-audit --no-fund \
    && npm cache clean --force

# =========================
# Non-root user
# =========================
RUN groupadd -g 1001 nodejs \
    && useradd -u 1001 -g nodejs -m flexshare

RUN mkdir -p uploads storage \
    && chown -R flexshare:nodejs /app

COPY --chown=flexshare:nodejs . .

# =========================
# Cleanup
# =========================
RUN rm -rf \
    *.md \
    .env.example \
    node_modules/.cache \
    && find . -name "*.test.js" -delete \
    && find . -name "*.spec.js" -delete

# =========================
# Runtime
# =========================
USER flexshare

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/health', res => process.exit(res.statusCode === 200 ? 0 : 1))"

CMD ["node", "index.js"]

# =========================
# Labels (GHCR)
# =========================
LABEL org.opencontainers.image.title="FlexShare Backend"
LABEL org.opencontainers.image.description="Backend API for FlexShare - File sharing and conversion service"
LABEL org.opencontainers.image.vendor="Uttkarsh Singh"
LABEL org.opencontainers.image.licenses="ISC"
LABEL org.opencontainers.image.source="https://github.com/YOUR_USERNAME/flexshare"
