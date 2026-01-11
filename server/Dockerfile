FROM node:20-alpine

WORKDIR /app

# Csak a szerver fájlokat másoljuk
COPY server/package*.json ./
RUN npm ci --only=production

COPY server/websocket-server.js ./

# Cloud Run a PORT környezeti változót használja
ENV PORT=8080
EXPOSE 8080

CMD ["node", "websocket-server.js"]
