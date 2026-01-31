#!/bin/bash
# ===========================================
# Deployment Script for Hostinger VPS
# ===========================================
# This script automates the deployment process
# Usage: ./scripts/deploy.sh [environment]
# ===========================================

set -e  # Exit on error
set -o pipefail  # Exit on pipe failure

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
ENVIRONMENT=${1:-production}
COMPOSE_FILE="docker-compose.yml"
BACKUP_DIR="./backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}n8n Marketing Dashboard Deployment${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "${YELLOW}Environment: ${ENVIRONMENT}${NC}\n"

# Function to print colored messages
print_message() {
    local color=$1
    local message=$2
    echo -e "${color}${message}${NC}"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# ===========================================
# Prerequisites Check
# ===========================================
print_message "${YELLOW}" "Checking prerequisites..."

if ! command_exists docker; then
    print_message "${RED}" "Error: Docker is not installed"
    exit 1
fi

if ! command_exists docker-compose; then
    print_message "${RED}" "Error: Docker Compose is not installed"
    exit 1
fi

print_message "${GREEN}" "✓ Docker and Docker Compose are installed"

# ===========================================
# Environment Variables Check
# ===========================================
print_message "${YELLOW}" "Checking environment variables..."

if [ ! -f ".env.${ENVIRONMENT}" ]; then
    print_message "${RED}" "Error: .env.${ENVIRONMENT} file not found"
    print_message "${YELLOW}" "Please create .env.${ENVIRONMENT} from .env.production.example"
    exit 1
fi

print_message "${GREEN}" "✓ Environment file found"

# ===========================================
# Backup Database (if running)
# ===========================================
print_message "${YELLOW}" "Creating database backup..."

mkdir -p "$BACKUP_DIR"

if docker ps | grep -q n8n-postgres; then
    docker exec n8n-postgres pg_dump -U n8n_user n8n_marketing_dashboard | gzip > "$BACKUP_DIR/backup_${TIMESTAMP}.sql.gz"
    print_message "${GREEN}" "✓ Database backup created: backup_${TIMESTAMP}.sql.gz"
else
    print_message "${YELLOW}" "⚠ Database container not running, skipping backup"
fi

# ===========================================
# Stop Running Containers
# ===========================================
print_message "${YELLOW}" "Stopping existing containers..."

docker-compose down 2>/dev/null || true

print_message "${GREEN}" "✓ Containers stopped"

# ===========================================
# Build Docker Images
# ===========================================
print_message "${YELLOW}" "Building Docker images..."

docker-compose build --no-cache --parallel

print_message "${GREEN}" "✓ Docker images built successfully"

# ===========================================
# Start Services
# ===========================================
print_message "${YELLOW}" "Starting services..."

docker-compose up -d postgres redis
sleep 5  # Wait for database to be ready

print_message "${GREEN}" "✓ Database and Redis started"

# ===========================================
# Run Database Migrations
# ===========================================
print_message "${YELLOW}" "Running database migrations..."

docker-compose run --rm backend npx prisma migrate deploy

print_message "${GREEN}" "✓ Database migrations completed"

# ===========================================
# Start All Services
# ==========================================
print_message "${YELLOW}" "Starting all services..."

docker-compose up -d

print_message "${GREEN}" "✓ All services started"

# ===========================================
# Wait for Health Checks
# ===========================================
print_message "${YELLOW}" "Waiting for services to be healthy..."

sleep 10

# Check backend health
for i in {1..30}; do
    if curl -sf http://localhost:3001/health > /dev/null 2>&1; then
        print_message "${GREEN}" "✓ Backend is healthy"
        break
    fi
    if [ $i -eq 30 ]; then
        print_message "${RED}" "✗ Backend health check failed"
        exit 1
    fi
    sleep 2
done

# Check frontend health
for i in {1..30}; do
    if curl -sf http://localhost/health > /dev/null 2>&1; then
        print_message "${GREEN}" "✓ Frontend is healthy"
        break
    fi
    if [ $i -eq 30 ]; then
        print_message "${RED}" "✗ Frontend health check failed"
        exit 1
    fi
    sleep 2
done

# ===========================================
# Display Service URLs
# ===========================================
print_message "${GREEN}" "\n========================================"
print_message "${GREEN}" "Deployment Successful!${NC}"
print_message "${GREEN}" "========================================\n"

echo -e "${YELLOW}Services are now running:${NC}"
echo -e "  Frontend:  ${GREEN}http://localhost${NC}"
echo -e "  Backend:   ${GREEN}http://localhost:3001${NC}"
echo -e "  n8n:       ${GREEN}http://localhost:5678${NC}"
echo -e "  PostgreSQL:${GREEN} localhost:5432${NC}"
echo -e "  Redis:     ${GREEN} localhost:6379${NC}\n"

echo -e "${YELLOW}Useful Commands:${NC}"
echo -e "  View logs:     ${GREEN}docker-compose logs -f${NC}"
echo -e "  Stop services: ${GREEN}docker-compose down${NC}"
echo -e "  Restart:       ${GREEN}docker-compose restart${NC}"
echo -e "  Status:        ${GREEN}docker-compose ps${NC}\n"

echo -e "${YELLOW}Database Connection:${NC}"
echo -e "  ${GREEN}psql -h localhost -U n8n_user -d n8n_marketing_dashboard${NC}\n"

print_message "${GREEN}" "Deployment completed successfully!${NC}"
