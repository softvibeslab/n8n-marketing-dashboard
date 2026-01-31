# 🚀 COMENZAR AQUÍ - Guía Rápida

## Paso 1: Subir a GitHub (5 minutos)

### Opción A: Automático (Recomendado)

```bash
# En tu terminal, navega al proyecto:
cd ruta/a/n8nvibes

# Ejecuta el script:
bash push-to-github.sh
```

### Opción B: Manual

```bash
# 1. Ve a https://github.com/new y crea un repositorio llamado "n8n-marketing-dashboard"
#    NO marques "Add README"

# 2. En tu terminal:
cd ruta/a/n8nvibes
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/n8n-marketing-dashboard.git
git push -u origin main
```

📖 **Guía detallada**: Ver `GITHUB-GUIA.md`

---

## Paso 2: Desplegar en Hostinger VPS (30 minutos)

### 2.1 Conectar a tu VPS

```bash
ssh root@TU_IP_PUBLICA
```

### 2.2 Clonar repositorio

```bash
cd /opt
git clone https://github.com/TU_USUARIO/n8n-marketing-dashboard.git
cd n8n-marketing-dashboard
```

### 2.3 Ejecutar script de configuración

```bash
chmod +x scripts/setup-hostinger.sh
./scripts/setup-hostinger.sh --domain tudominio.com --email tu@email.com
```

### 2.4 Configurar variables de entorno

```bash
cp .env.production.example .env.production
nano .env.production
```

**Generar contraseñas seguras:**
```bash
openssl rand -base64 32  # Para JWT_SECRET
openssl rand -hex 16     # Para ENCRYPTION_KEY
```

### 2.5 Desplegar

```bash
chmod +x scripts/deploy.sh
./scripts/deploy.sh production
```

📖 **Guía detallada**: Ver `HOSTINGER-DEPLOY.md`

---

## Paso 3: Configurar Dominio y DNS

### En tu proveedor de dominio (Hostinger, GoDaddy, etc.)

| Tipo | Nombre | Valor |
|------|--------|-------|
| A | @ | TU_IP_PUBLICA |
| A | www | TU_IP_PUBLICA |
| A | api | TU_IP_PUBLICA |
| A | n8n | TU_IP_PUBLICA |

---

## Paso 4: Configurar SSL (HTTPS)

```bash
# En tu VPS
certbot --nginx -d tudominio.com -d www.tudominio.com \
                 -d api.tudominio.com -d n8n.tudominio.com \
                 --email tu@email.com --agree-tos --non-interactive
```

---

## ✨ URLs Finales

| Servicio | URL |
|----------|-----|
| Frontend | https://tudominio.com |
| Backend API | https://api.tudominio.com |
| n8n | https://n8n.tudominio.com |

---

## 📚 Documentación Completa

- **GITHUB-GUIA.md** - Guía detallada para subir a GitHub
- **HOSTINGER-DEPLOY.md** - Guía completa de despliegue en Hostinger
- **README.md** - Documentación general del proyecto

---

## ❓ ¿Necesitas Ayuda?

### Verificar archivos
```bash
# Ver contenedores activos
docker ps

# Ver logs
docker logs n8n-backend -f

# Ver estado de servicios
docker-compose ps
```

### Reiniciar servicios
```bash
cd /opt/n8n-marketing-dashboard
docker-compose restart
```

### Actualizar aplicación
```bash
cd /opt/n8n-marketing-dashboard
git pull
./scripts/deploy.sh production
```

---

## 🔑 Variables de Entorno Críticas

```bash
# .env.production - CAMBIAR ESTOS VALORES:

POSTGRES_PASSWORD=genera-contraseña-segura-aquí
REDIS_PASSWORD=genera-otra-contraseña-segura-aquí
JWT_SECRET=usa-openssl-rand-base64-32
N8N_ENCRYPTION_KEY=usa-openssl-rand-hex-16
OPENAI_API_KEY=sk-tu-key-de-openai
CORS_ORIGIN=https://tudominio.com,https://www.tudominio.com
VITE_API_URL=https://api.tudominio.com/api/v1
VITE_APP_URL=https://tudominio.com
```

---

**¡Listo! Tu dashboard estará funcionando en menos de 1 hora 🎉**
