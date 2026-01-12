# FlexShare Backend - Production Docker Image
# Optimized for GHCR deployment

# Use Node.js 18 Alpine for smaller image size
FROM node:18-alpine AS base

# Install system dependencies required for native modules
RUN apk add --no-cache \
    python3 \
    py3-pip \
    make \
    g++ \
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

# Install Python dependencies for PDF conversion
RUN pip3 install --no-cache-dir docx2pdf pdf2docx

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies with production optimizations
RUN npm ci --only=production --no-audit --no-fund \
    && npm cache clean --force

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs \
    && adduser -S flexshare -u 1001

# Create necessary directories with proper permissions
RUN mkdir -p uploads storage \
    && chown -R flexshare:nodejs /app

# Copy application code
COPY --chown=flexshare:nodejs . .

# Remove unnecessary files to reduce image size
RUN rm -rf \
    test-*.js \
    *.md \
    .env.example \
    node_modules/.cache \
    && find . -name "*.test.js" -delete \
    && find . -name "*.spec.js" -delete

# Switch to non-root user
USER flexshare

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Start the application
CMD ["node", "index.js"]

# Labels for GHCR
LABEL org.opencontainers.image.title="FlexShare Backend"
LABEL org.opencontainers.image.description="Backend API for FlexShare - File sharing and conversion service"
LABEL org.opencontainers.image.vendor="Uttkarsh Singh"
LABEL org.opencontainers.image.licenses="ISC"
LABEL org.opencontainers.image.source="https://github.com/YOUR_USERNAME/flexshare"