# ---------- Frontend (React + Vite) Dockerfile ----------
# Multi-stage: Node build -> Nginx static server

# 1) Build stage
FROM node:22-alpine AS build
WORKDIR /app

# Install deps separately for caching
COPY package.json package-lock.json* yarn.lock* pnpm-lock.yaml* ./
RUN npm install --legacy-peer-deps || yarn install || echo "No lockfile for alternative manager"

# Copy source
COPY . .

# Set build-time environment variable for API base URL
# This gets embedded into the built JavaScript bundle
ARG VITE_API_BASE_URL=http://localhost:8080/api
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

# Build static assets
RUN npm run build

# 2) Runtime stage
FROM nginx:1.27-alpine AS runtime
WORKDIR /usr/share/nginx/html

# Remove default Nginx static content
RUN rm -rf ./*

# Copy built assets
COPY --from=build /app/dist ./

# Add basic nginx config (single-page app fallback)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

