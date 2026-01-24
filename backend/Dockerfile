# ---------- Backend (Spring Boot) Dockerfile ----------
# Multi-stage build: Maven builder + slim JRE runtime

# 1) Build stage
FROM maven:3.9.11-eclipse-temurin-17 AS build
WORKDIR /workspace

# Copy pom and resolve deps first to leverage Docker layer cache
COPY pom.xml ./
RUN mvn -B dependency:go-offline -DskipTests

# Copy source and build
COPY src ./src
RUN mvn -B -DskipTests clean package

# 2) Runtime stage
FROM eclipse-temurin:17-jre AS runtime
WORKDIR /app

# Create non-root user
RUN useradd -m -u 10001 appuser

# Copy built jar
COPY --from=build /workspace/target/*.jar /app/app.jar

# Runtime configuration
ENV JAVA_OPTS=""
ENV SERVER_PORT=8088
EXPOSE 8088

# Healthcheck (optional; works when curl is present)
# RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*
# HEALTHCHECK --interval=30s --timeout=3s CMD curl -f http://localhost:${SERVER_PORT}/actuator/health || exit 1

USER appuser
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar /app/app.jar"]

