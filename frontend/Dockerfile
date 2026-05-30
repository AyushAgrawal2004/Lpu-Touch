# ──────────────────────────────────────────────
# Stage 1: Build the React/Vite app
# ──────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files and install ALL deps (including devDeps needed for build)
COPY package*.json ./
RUN npm install

# Copy source and build
COPY . .

# VITE_API_URL will be injected at build time via docker-compose build arg
ARG VITE_API_URL=/api
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# ──────────────────────────────────────────────
# Stage 2: Serve with Nginx
# ──────────────────────────────────────────────
FROM nginx:1.26-alpine AS runner

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy built Vite output
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom nginx config for SPA routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:80/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
