FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=builder /app/dist ./dist
COPY init.sql ./init.sql
RUN mkdir -p uploads uploads/thumbnails
EXPOSE 3000
CMD ["node", "dist/app.js"]
