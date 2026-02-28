# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies (leverage cache)
COPY package.json package-lock.json ./
RUN npm ci

# Copy source and build
COPY . .
RUN npm run build && npm prune --production

# Stage 2: Runtime
FROM nginx:alpine-slim AS runtime

# Install curl for healthcheck and configure non-root user
# hadolint ignore=DL3018
RUN apk add --no-cache curl && \
    adduser -D -H -u 1000 -s /bin/false app && \
    mkdir -p /var/run/nginx /var/log/nginx /var/cache/nginx && \
    touch /var/run/nginx.pid && \
    chown -R app:app /var/run/nginx.pid /var/log/nginx /var/cache/nginx /etc/nginx/conf.d

# Copy build artifacts with correct ownership
COPY --from=builder --chown=app:app /app/dist /usr/share/nginx/html

# Copy custom nginx config with correct ownership
COPY --chown=app:app .docker/nginx.conf /etc/nginx/conf.d/default.conf

USER app

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
