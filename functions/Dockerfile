FROM node:22-bookworm-slim
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY distribution ./distribution
USER node
CMD ["node", "distribution/server.js"]
