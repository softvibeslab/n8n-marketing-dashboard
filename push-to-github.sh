#!/bin/bash
# ===========================================
# Script para Subir Proyecto a GitHub
# ===========================================
# Este script automatiza todo el proceso de
# subir el n8n Marketing Dashboard a GitHub
# ===========================================

set -e  # Salir si hay error

# Colores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Subir n8n Marketing Dashboard a GitHub${NC}"
echo -e "${GREEN}========================================${NC}\n"

# ===========================================
# Paso 1: Verificar Git
# ===========================================
echo -e "${BLUE}Paso 1: Verificando Git...${NC}"
if ! command -v git &> /dev/null; then
    echo -e "${RED}Error: Git no está instalado${NC}"
    echo "Instala Git: https://git-scm.com/downloads"
    exit 1
fi
echo -e "${GREEN}✓ Git está instalado${NC}\n"

# ===========================================
# Paso 2: Verificar que estamos en el directorio correcto
# ===========================================
echo -e "${BLUE}Paso 2: Verificando directorio del proyecto...${NC}"
if [ ! -f "package.json" ] && [ ! -f "backend/package.json" ]; then
    echo -e "${RED}Error: No estás en el directorio raíz del proyecto${NC}"
    echo "Navega al directorio del proyecto antes de ejecutar este script"
    exit 1
fi
echo -e "${GREEN}✓ Directorio correcto${NC}\n"

# ===========================================
# Paso 3: Inicializar repositorio Git
# ===========================================
echo -e "${BLUE}Paso 3: Inicializando repositorio Git...${NC}"
if [ -d ".git" ]; then
    echo -e "${YELLOW}El repositorio ya está inicializado${NC}"
else
    git init
    echo -e "${GREEN}✓ Repositorio inicializado${NC}"
fi
echo ""

# ===========================================
# Paso 4: Agregar archivos .gitignore
# ===========================================
echo -e "${BLUE}Paso 4: Verificando .gitignore...${NC}"
if [ -f ".gitignore" ]; then
    echo -e "${GREEN}✓ .gitignore existe${NC}"
else
    echo -e "${RED}Error: .gitignore no encontrado${NC}"
    exit 1
fi
echo ""

# ===========================================
# Paso 5: Preguntar por nombre de usuario de GitHub
# ===========================================
echo -e "${BLUE}Paso 5: Configuración de GitHub${NC}"
read -p "Ingresa tu nombre de usuario de GitHub: " GITHUB_USERNAME

if [ -z "$GITHUB_USERNAME" ]; then
    echo -e "${RED}Error: Debes ingresar tu nombre de usuario${NC}"
    exit 1
fi

REPO_NAME="n8n-marketing-dashboard"
REPO_URL="https://github.com/$GITHUB_USERNAME/$REPO_NAME.git"

echo -e "Repositorio: ${YELLOW}$REPO_URL${NC}"
echo ""

# ===========================================
# Paso 6: Verificar archivos sensibles
# ===========================================
echo -e "${BLUE}Paso 6: Verificando archivos sensibles...${NC}"

# Verificar que .env no esté en el repositorio
if git ls-files | grep -q "\.env$"; then
    echo -e "${YELLOW}Advertencia: Archivos .env detectados en el repositorio${NC}"
    echo "Eliminándolos del tracking..."
    git rm --cached -r .env 2>/dev/null || true
    git rm --cached -r backend/.env 2>/dev/null || true
    git rm --cached -r frontend/.env 2>/dev/null || true
fi
echo -e "${GREEN}✓ Verificación completa${NC}\n"

# ===========================================
# Paso 7: Agregar todos los archivos
# ===========================================
echo -e "${BLUE}Paso 7: Agregando archivos al repositorio...${NC}"
git add .
echo -e "${GREEN}✓ Archivos agregados${NC}\n"

# ===========================================
# Paso 8: Hacer commit inicial
# ===========================================
echo -e "${BLUE}Paso 8: Creando commit inicial...${NC}"
COMMIT_MSG="Initial commit: n8n Marketing Dashboard

Features:
- AI-powered Strategy Input Panel
- Natural Language Workflow Generator
- Asset Creation Automation
- Analytics Dashboard with AI Insights
- AI Assistant Chat
- Complete n8n Integration

Tech Stack:
- Frontend: React 19 + TypeScript + TailwindCSS
- Backend: Node.js + Express + TypeScript + Prisma
- Database: PostgreSQL 16
- Cache: Redis 7
- Workflow: n8n
- Deployment: Docker + Docker Compose"

git commit -m "$COMMIT_MSG" || {
    echo -e "${YELLOW}No hay cambios para commitear${NC}"
}
echo -e "${GREEN}✓ Commit creado${NC}\n"

# ===========================================
# Paso 9: Configurar branch principal
# ===========================================
echo -e "${BLUE}Paso 9: Configurando rama principal...${NC}"
git branch -M main
echo -e "${GREEN}✓ Rama 'main' configurada${NC}\n"

# ===========================================
# Paso 10: Instrucciones para crear repositorio en GitHub
# ===========================================
echo -e "${BLUE}Paso 10: Crear repositorio en GitHub${NC}"
echo ""
echo -e "${YELLOW}ANTES de continuar, necesitas crear el repositorio en GitHub:${NC}"
echo ""
echo "1. Ve a: https://github.com/new"
echo "2. Nombre del repositorio: ${GREEN}$REPO_NAME${NC}"
echo "3. Descripción: AI-powered marketing dashboard with n8n workflow automation"
echo "4. Visibilidad: Private (recomendado) o Public"
echo "5. ${RED}NO marques${NC} 'Add a README file'"
echo "6. ${RED}NO marques${NC} 'Add .gitignore'"
echo "7. Clic en ${GREEN}Create repository${NC}"
echo ""
read -p "Presiona ENTER cuando hayas creado el repositorio en GitHub..."
echo ""

# ===========================================
# Paso 11: Agregar remote
# ===========================================
echo -e "${BLUE}Paso 11: Configurando remote de GitHub...${NC}"

# Verificar si ya existe un remote
if git remote get-url origin &> /dev/null; then
    echo -e "${YELLOW}Remote 'origin' ya existe. Actualizando...${NC}"
    git remote set-url origin "$REPO_URL"
else
    git remote add origin "$REPO_URL"
fi

echo -e "${GREEN}✓ Remote configurado: $REPO_URL${NC}\n"

# ===========================================
# Paso 12: Subir a GitHub
# ===========================================
echo -e "${BLUE}Paso 12: Subiendo código a GitHub...${NC}"
echo -e "${YELLOW}Esto puede tomar varios minutos...${NC}\n"

if git push -u origin main; then
    echo ""
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}✓ ¡ÉXITO! Código subido a GitHub${NC}"
    echo -e "${GREEN}========================================${NC}\n"
    echo -e "Tu repositorio está disponible en:"
    echo -e "${BLUE}https://github.com/$GITHUB_USERNAME/$REPO_NAME${NC}\n"

    echo -e "${YELLOW}Próximos pasos:${NC}"
    echo "1. Clona el repositorio en tu VPS de Hostinger:"
    echo -e "   ${GREEN}git clone $REPO_URL${NC}"
    echo ""
    echo "2. Sigue la guía HOSTINGER-DEPLOY.md para el despliegue"
    echo ""
    echo "3. Configura las variables de entorno:"
    echo -e "   ${GREEN}cp .env.production.example .env.production${NC}"
    echo -e "   ${GREEN}nano .env.production${NC}"
    echo ""
    echo "4. Ejecuta el despliegue:"
    echo -e "   ${GREEN}./scripts/deploy.sh production${NC}"
    echo ""

else
    echo ""
    echo -e "${RED}========================================${NC}"
    echo -e "${RED}Error al subir a GitHub${NC}"
    echo -e "${RED}========================================${NC}\n"
    echo "Posibles soluciones:"
    echo "1. Verifica que el repositorio exista en GitHub"
    echo "2. Verifica tus credenciales de Git:"
    echo -e "   ${GREEN}git config --global user.name 'Tu Nombre'${NC}"
    echo -e "   ${GREEN}git config --global user.email 'tu@email.com'${NC}"
    echo "3. Si usas autenticación con token, usa:"
    echo -e "   ${GREEN}git remote set-url origin https://TU_TOKEN@github.com/$GITHUB_USERNAME/$REPO_NAME.git${NC}"
    echo "4. Si usas SSH, usa:"
    echo -e "   ${GREEN}git remote set-url origin git@github.com:$GITHUB_USERNAME/$REPO_NAME.git${NC}"
    echo ""
    echo "Intenta de nuevo: ${GREEN}git push -u origin main${NC}"
    echo ""
    exit 1
fi
