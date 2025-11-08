## Docker Setup Guide

This guide explains how to build and run the backend (Spring Boot) and frontend (React + Vite) containers, plus MySQL, using Docker and Docker Compose.

### 1. Components

Services defined in `docker-compose.yml`:

- `db`: MySQL 8.0 database
- `backend`: Spring Boot app (Java 17) built via multi-stage Maven Dockerfile
- `frontend`: React/Vite static build served by Nginx

### 2. Backend Dockerfile (summary)

Located at `backend/Dockerfile`.
Multi-stage:

1. Maven build image downloads dependencies & packages the jar.
2. Slim Temurin JRE image runs the app as non-root user `appuser`.

Environment variables you can override:

- `SPRING_DATASOURCE_URL` (default points to internal `db` container)
- `SPRING_DATASOURCE_USERNAME`
- `SPRING_DATASOURCE_PASSWORD`
- `SPRING_JPA_HIBERNATE_DDL_AUTO`
- `SPRING_PROFILES_ACTIVE`

### 3. Frontend Dockerfile (summary)

Located at `frontend/Dockerfile`.
Multi-stage:

1. Node alpine builds static assets to `dist`.
2. Nginx alpine serves them with SPA fallback (see `frontend/nginx.conf`).

### 4. .dockerignore

Both `backend/.dockerignore` and `frontend/.dockerignore` trim build context (ignore VCS, `node_modules`, `target`, IDE files, etc.).

### 5. Build & Run

#### Quick start (development parity)

```powershell
cd "f:\sem 5 mine\DevOps\project\version_2.0"
docker compose up --build
```

Access:

- Backend API: http://localhost:8080/api
- Frontend (Nginx): http://localhost:9000
- MySQL: localhost:3307 (root / password from compose)

#### Detached mode

```powershell
docker compose up -d --build
```

#### Stop & clean

```powershell
docker compose down
```

Add `-v` to also remove the MySQL volume if you want a fresh DB:

```powershell
docker compose down -v
```

### 6. Overriding Environment Variables

You can supply a `.env` file next to `docker-compose.yml`:

```
MYSQL_ROOT_PASSWORD=StrongPassword123!
MYSQL_DATABASE=task_tracker
SPRING_PROFILES_ACTIVE=prod
VITE_API_BASE_URL=http://localhost:8080/api
```

Docker Compose automatically loads it.

### 7. Rebuilding After Code Changes

- Frontend static rebuild: `docker compose build frontend` then `docker compose up -d frontend`.
- Backend change: `docker compose build backend` (Maven layer cache still helps).

### 8. Logs & Troubleshooting

```powershell
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f db
```

Common issues:

- 404 from frontend to API: ensure `VITE_API_BASE_URL` points to `http://localhost:8080/api`.
- DB connection errors: confirm `db` is healthy (`docker compose ps`).
- Port conflicts: change published ports in `docker-compose.yml` (e.g., `8081:8080`).

### 9. Production Notes

- Add a proper healthcheck for backend (enable `curl` or use Spring Boot Actuator endpoints).
- Consider using a MySQL managed service instead of container for prod.
- Externalize secrets using Docker Secrets or environment manager (never commit real passwords).
- Enable multi-arch builds if deploying to ARM hosts (use `docker buildx`).

### 10. Cleaning Maven & Node Cache Layers

If you change dependencies drastically:

```powershell
docker compose build --no-cache backend
docker compose build --no-cache frontend
```

### 11. Running Backend Locally Without Docker

```powershell
cd backend
.\n+mvnw.cmd spring-boot:run
```

### 12. Running Frontend Locally Without Docker

```powershell
cd frontend
npm install
npm run dev
```

Visit: http://localhost:5173

---

This setup balances build caching, small runtime images, security (non-root), and SPA routing.
Let me know if you’d like to add CI/CD, multi-stage test phase, or image scanning next.
