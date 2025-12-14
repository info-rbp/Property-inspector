# syntax=docker/dockerfile:1

FROM node:20-slim AS deps
WORKDIR /app
COPY package.json package-lock.json pnpm-workspace.yaml turbo.json ./
COPY packages/gateway/package.json packages/gateway/package.json
RUN npm ci

FROM node:20-slim AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY package.json package-lock.json pnpm-workspace.yaml turbo.json ./
COPY packages packages
COPY services services
COPY apps apps
RUN npm run build --workspace packages/gateway

FROM node:20-slim AS prod-deps
WORKDIR /app
COPY package.json package-lock.json pnpm-workspace.yaml turbo.json ./
COPY packages/gateway/package.json packages/gateway/package.json
RUN npm ci --omit=dev

FROM node:20-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=build /app/packages/gateway/dist ./packages/gateway/dist
COPY packages/gateway/prisma ./packages/gateway/prisma
EXPOSE 8080
CMD ["node", "packages/gateway/dist/server.js"]
