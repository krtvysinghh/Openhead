# Stage 1: Build Stage
FROM node:22-alpine AS builder

WORKDIR /app

# Install PNPM
RUN corepack enable && corepack prepare pnpm@9.15.4 --activate

# Copy dependency manifests
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/core/package.json ./packages/core/
COPY packages/formula/package.json ./packages/formula/
COPY packages/pen/package.json ./packages/pen/
COPY packages/sum/package.json ./packages/sum/
COPY packages/glimpse/package.json ./packages/glimpse/
COPY packages/ai/package.json ./packages/ai/
COPY packages/ui/package.json ./packages/ui/
COPY apps/studio/package.json ./apps/studio/

# Install dependencies reproducibly
RUN pnpm install --frozen-lockfile

# Copy source code
COPY packages ./packages
COPY apps ./apps
COPY tsconfig.json ./

# Build all packages and the studio web application
RUN pnpm run build

# Stage 2: Minimal Hardened Runtime
FROM nginxinc/nginx-unprivileged:alpine-slim

USER 101

# Copy custom Nginx configuration
COPY --chown=101:101 nginx.conf /etc/nginx/conf.d/default.conf

# Copy production built artifacts from builder stage
COPY --from=builder --chown=101:101 /app/apps/studio/dist /usr/share/nginx/html

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
    CMD wget -qO- http://localhost:8080/healthz || exit 1

CMD ["nginx", "-g", "daemon off;"]
