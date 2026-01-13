FROM node:18-alpine AS base

RUN apk add --no-cache \
    python3 \
    py3-pip \
    make \
    g++ \
    libreoffice \
    cairo-dev \
    jpeg-dev \
    pango-dev \
    musl-dev \
    giflib-dev \
    pixman-dev \
    pangomm-dev \
    libjpeg-turbo-dev \
    freetype-dev \
    vips-dev \
    && rm -rf /var/cache/apk/*

RUN pip3 install --no-cache-dir --break-system-packages docx2pdf pdf2docx

WORKDIR /app

COPY package*.json ./

RUN npm ci --only=production --no-audit --no-fund \
    && npm cache clean --force

RUN addgroup -g 1001 -S nodejs \
    && adduser -S flexshare -u 1001

RUN mkdir -p uploads storage \
    && chown -R flexshare:nodejs /app

COPY --chown=flexshare:nodejs . .

RUN rm -rf \
    test-*.js \
    *.md \
    .env.example \
    node_modules/.cache \
    && find . -name "*.test.js" -delete \
    && find . -name "*.spec.js" -delete

USER flexshare

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

CMD ["node", "index.js"]


# Labels for GHCR
LABEL org.opencontainers.image.title="FlexShare Backend"
LABEL org.opencontainers.image.description="Backend API for FlexShare - File sharing and conversion service"
LABEL org.opencontainers.image.vendor="Uttkarsh Singh"
LABEL org.opencontainers.image.licenses="ISC"
LABEL org.opencontainers.image.source="https://github.com/YOUR_USERNAME/flexshare"