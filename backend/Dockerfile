FROM node:20-bullseye-slim

RUN apt-get update && apt-get install -y \
    libreoffice \
    libjpeg62-turbo \
    libcairo2 \
    libpango-1.0-0 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

RUN mkdir -p uploads

EXPOSE 3000

CMD ["node", "index.js"]
