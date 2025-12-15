# syntax=docker/dockerfile:1

FROM node:20-slim AS deps
WORKDIR /app
COPY package.json package-lock.json pnpm-workspace.yaml turbo.json ./
COPY functions/gateway/package.json functions/gateway/package.json
RUN npm ci

FROM node:20-slim AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY package.json package-lock.json pnpm-workspace.yaml turbo.json ./
COPY packages packages
COPY services services
COPY apps apps
COPY functions functions
RUN npm run build --workspace gateway

FROM node:20-slim AS prod-deps
WORKDIR /app
COPY package.json package-lock.json pnpm-workspace.yaml turbo.json ./
COPY functions/gateway/package.json functions/gateway/package.json
RUN npm ci --omit=dev

FROM node:20-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=build /app/functions/gateway/dist ./functions/gateway/dist
COPY functions/gateway/prisma ./functions/gateway/prisma
EXPOSE 8080
CMD ["node", "functions/gateway/dist/server.js"]
