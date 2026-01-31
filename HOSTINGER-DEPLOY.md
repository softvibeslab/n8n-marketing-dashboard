# Guía de Despliegue en Hostinger VPS con Easypanel

Esta guía proporciona instrucciones paso a paso para desplegar el n8n Marketing Dashboard en un VPS de Hostinger utilizando Docker y Easypanel.

## Tabla de Contenidos

1. [Requisitos Previos](#requisitos-previos)
2. [Configurar Repositorio en GitHub](#configurar-repositorio-en-github)
3. [Preparar el VPS de Hostinger](#preparar-el-vps-de-hostinger)
4. [Instalar Easypanel](#instalar-easypanel)
5. [Desplegar con Docker Compose](#desplegar-con-docker-compose)
6. [Configurar Dominio y SSL](#configurar-dominio-y-ssl)
7. [Monitoreo y Mantenimiento](#monitoreo-y-mantenimiento)
8. [Solución de Problemas](#solución-de-problemas)

---

## Requisitos Previos

Antes de comenzar, necesitas:

- **Cuenta en GitHub**: Para alojar tu código
- **VPS de Hostinger**: Mínimo 4GB RAM, 2 CPU, 80GB SSD
- **Nombre de Dominio**: Para tu aplicación (ej. tuempresa.com)
- **Cliente SSH**: Para conectarte al VPS (Terminal, PuTTY, etc.)
- **Conocimientos Básicos**: Comandos de Linux y Git

### Requisitos del VPS

**Configuración Recomendada:**
- CPU: 2 núcleos
- RAM: 4GB
- Almacenamiento: 80GB SSD
- Ancho de banda: 2TB/mes
- Sistema Operativo: Ubuntu 22.04 LTS o AlmaLinux 8

**Costo Estimado:**
- Hostinger VPS: $8-12/mes
- Dominio: $10-15/año
- **Total**: ~$10-15/mes

---

## Configurar Repositorio en GitHub

### Paso 1: Crear Nuevo Repositorio

1. **Inicia Sesión en GitHub**
   - Ve a https://github.com
   - Inicia sesión con tu cuenta

2. **Crea Nuevo Repositorio**
   - Clic en el icono `+` > `New repository`
   - Nombre del repositorio: `n8n-marketing-dashboard`
   - Descripción: `AI-powered marketing dashboard with n8n workflow automation`
   - Visibilidad: Private (recomendado) o Public
   - NO marques "Add a README file"
   - Clic en `Create repository`

### Paso 2: Preparar Código Local

1. **Inicializa Git en tu Proyecto**
   ```bash
   cd /ruta/a/tu/proyecto
   git init
   ```

2. **Agrega Archivos al Repositorio**
   ```bash
   git add .
   git commit -m "Initial commit: n8n Marketing Dashboard"
   ```

3. **Conecta con GitHub**
   ```bash
   # Reemplaza TU_USUARIO con tu nombre de usuario de GitHub
   git remote add origin https://github.com/TU_USUARIO/n8n-marketing-dashboard.git
   git branch -M main
   ```

4. **Empuja Código a GitHub**
   ```bash
   git push -u origin main
   ```

### Paso 3: Verificar Repositorio

- Visita: `https://github.com/TU_USUARIO/n8n-marketing-dashboard`
- Verifica que todos los archivos estén presentes
- Confirma que `.env` NO esté en el repositorio

---

## Preparar el VPS de Hostinger

### Paso 1: Acceder al VPS

1. **Obtener Credenciales SSH**
   - Entra al panel de Hostinger
   - Ve a VPS > Tu VPS
   - Copia la dirección IP, usuario (root) y contraseña

2. **Conectarse por SSH**
   ```bash
   # Reemplaza TU_IP con la dirección IP de tu VPS
   ssh root@TU_IP

   # Ingresa la contraseña cuando se solicite
   ```

### Paso 2: Ejecutar Script de Configuración Inicial

1. **Clonar el Repositorio**
   ```bash
   # Actualizar sistema
   apt update && apt upgrade -y

   # Instalar Git
   apt install -y git

   # Clonar repositorio (reemplaza con tu URL)
   cd /opt
   git clone https://github.com/TU_USUARIO/n8n-marketing-dashboard.git
   cd n8n-marketing-dashboard
   ```

2. **Ejecutar Script de Configuración**
   ```bash
   # Dar permisos de ejecución
   chmod +x scripts/setup-hostinger.sh

   # Ejecutar script (reemplaza con tu dominio y email)
   ./scripts/setup-hostinger.sh --domain tudominio.com --email tu@email.com
   ```

Este script instalará:
- Docker y Docker Compose
- Nginx como reverse proxy
- Certbot para certificados SSL
- Configuración de firewall
- Optimización del sistema

---

## Instalar Easypanel

Easypanel es una alternativa moderna a cPanel con soporte nativo para Docker.

### Opción A: Instalación Automática (Recomendada)

1. **Instalar Easypanel con Un Comando**
   ```bash
   curl -sSL https://easypanel.io/install.sh | sh
   ```

2. **Configurar Easypanel**
   - Accede a: `https://TU_IP:3000`
   - Crea tu cuenta de administrador
   - Configura tu dominio

### Opción B: Instalación Manual con Docker Compose

1. **Crear Configuración de Easypanel**
   ```bash
   mkdir -p /opt/easypanel
   cd /opt/easypanel
   ```

2. **Crear docker-compose.yml para Easypanel**
   ```yaml
   version: '3.8'

   services:
     easypanel:
       image: 'easypanel/easypanel:latest'
       restart: unless-stopped
       ports:
         - '3000:3000'
       volumes:
         - /var/run/docker.sock:/var/run/docker.sock
         - easypanel_data:/app/data
       environment:
         - EASYPANEL_DOMAIN=easypanel.tudominio.com

   volumes:
     easypanel_data:
   ```

3. **Iniciar Easypanel**
   ```bash
   docker-compose up -d
   ```

4. **Configurar Reverse Proxy en Nginx**
   ```bash
   nano /etc/nginx/sites-available/easypanel
   ```

   ```nginx
   server {
       listen 80;
       server_name easypanel.tudominio.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }
   }
   ```

   ```bash
   ln -s /etc/nginx/sites-available/easypanel /etc/nginx/sites-enabled/
   systemctl reload nginx
   certbot --nginx -d easypanel.tudominio.com
   ```

---

## Desplegar con Docker Compose

### Paso 1: Configurar Variables de Entorno

1. **Crear Archivo de Producción**
   ```bash
   cd /opt/n8n-marketing-dashboard
   cp .env.production.example .env.production
   nano .env.production
   ```

2. **Editar Variables Importantes**
   ```bash
   # Generar contraseñas seguras
   openssl rand -base64 32  # Para JWT_SECRET
   openssl rand -hex 16     # Para ENCRYPTION_KEY
   ```

   **Variables Obligatorias:**
   ```bash
   # Base de Datos
   POSTGRES_PASSWORD=tu_contraseña_segura_aqui

   # Redis
   REDIS_PASSWORD=tu_contraseña_segura_aqui

   # JWT
   JWT_SECRET=tu_jwt_secreto_32_caracteres_minimo

   # n8n
   N8N_PASSWORD=tu_contraseña_n8n_aqui
   N8N_ENCRYPTION_KEY=tu_clave_encripcion_aqui

   # OpenAI
   OPENAI_API_KEY=sk-tu-api-key-openai

   # Dominio
   CORS_ORIGIN=https://tudominio.com,https://www.tudominio.com
   VITE_API_URL=https://api.tudominio.com/api/v1
   VITE_APP_URL=https://tudominio.com
   ```

### Paso 2: Desplegar Aplicación

1. **Ejecutar Script de Despliegue**
   ```bash
   chmod +x scripts/deploy.sh
   ./scripts/deploy.sh production
   ```

Este script realizará:
- ✅ Backup de base de datos
- ✅ Construcción de imágenes Docker
- ✅ Migraciones de base de datos
- ✅ Inicio de todos los servicios
- ✅ Verificación de salud

2. **Verificar Estado**
   ```bash
   docker-compose ps
   ```

   Deberías ver:
   ```
   NAME                    STATUS              PORTS
   n8n-backend             Up (healthy)        0.0.0.0:3001->3001/tcp
   n8n-frontend            Up (healthy)        0.0.0.0:80->80/tcp
   n8n-postgres            Up (healthy)        0.0.0.0:5432->5432/tcp
   n8n-redis               Up (healthy)        0.0.0.0:6379->6379/tcp
   n8n-workflow            Up                  0.0.0.0:5678->5678/tcp
   ```

### Paso 3: Configurar Nginx Reverse Proxy

1. **Crear Configuración para Frontend**
   ```bash
   nano /etc/nginx/sites-available/tudominio.com
   ```

   ```nginx
   server {
       listen 80;
       server_name tudominio.com www.tudominio.com;

       location / {
           proxy_pass http://localhost:80;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }
   }
   ```

2. **Crear Configuración para Backend API**
   ```bash
   nano /etc/nginx/sites-available/api.tudominio.com
   ```

   ```nginx
   server {
       listen 80;
       server_name api.tudominio.com;

       # WebSocket support
       location /socket.io/ {
           proxy_pass http://localhost:3002;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection "upgrade";
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }

       # API endpoints
       location / {
           proxy_pass http://localhost:3001;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }
   }
   ```

3. **Crear Configuración para n8n**
   ```bash
   nano /etc/nginx/sites-available/n8n.tudominio.com
   ```

   ```nginx
   server {
       listen 80;
       server_name n8n.tudominio.com;

       location / {
           proxy_pass http://localhost:5678;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
           proxy_set_header Connection "upgrade";
           proxy_set_header Upgrade $http_upgrade;
       }
   }
   ```

4. **Habilitar Sitios**
   ```bash
   ln -s /etc/nginx/sites-available/tudominio.com /etc/nginx/sites-enabled/
   ln -s /etc/nginx/sites-available/api.tudominio.com /etc/nginx/sites-enabled/
   ln -s /etc/nginx/sites-available/n8n.tudominio.com /etc/nginx/sites-enabled/

   # Probar configuración
   nginx -t

   # Recargar Nginx
   systemctl reload nginx
   ```

---

## Configurar Dominio y SSL

### Paso 1: Configurar DNS

1. **En tu Proveedor de Dominio (Hostinger, GoDaddy, etc.)**

   **Registros A:**
   ```
   Tipo    Nombre        Valor                TTL
   A       @             TU_IP_PUBLICA        3600
   A       www           TU_IP_PUBLICA        3600
   A       api           TU_IP_PUBLICA        3600
   A       n8n           TU_IP_PUBLICA        3600
   ```

2. **Verificar Propagación DNS**
   ```bash
   # Verificar DNS de dominio principal
   dig tudominio.com

   # Verificar DNS de subdominios
   dig api.tudominio.com
   dig n8n.tudominio.com
   ```

   Espera unos minutos hasta que la propagación se complete.

### Paso 2: Obtener Certificados SSL

1. **Instalar Certbot**
   ```bash
   apt install -y certbot python3-certbot-nginx
   ```

2. **Obtener Certificados para Todos los Dominios**
   ```bash
   certbot --nginx -d tudominio.com -d www.tudominio.com \
                    -d api.tudominio.com \
                    -d n8n.tudominio.com \
                    --email tu@email.com \
                    --agree-tos \
                    --non-interactive \
   ```

3. **Verificar Renovación Automática**
   ```bash
   certbot renew --dry-run
   ```

   Certbot se renovará automáticamente cada 90 días.

### Paso 3: Verificar Despliegue

1. **Probar Frontend**
   - Visita: `https://tudominio.com`
   - Deberías ver la aplicación funcionando

2. **Probar Backend API**
   ```bash
   curl https://api.tudominio.com/health
   ```

   Respuesta esperada:
   ```json
   {
     "success": true,
     "data": {
       "status": "healthy",
       "timestamp": "2026-01-31T12:00:00.000Z",
       "environment": "production"
     }
   }
   ```

3. **Probar n8n**
   - Visita: `https://n8n.tudominio.com`
   - Inicia sesión con las credenciales configuradas

---

## Monitoreo y Mantenimiento

### Ver Logs de Aplicación

```bash
# Ver todos los logs
docker-compose logs -f

# Ver logs de un servicio específico
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres

# Ver últimas 100 líneas
docker-compose logs --tail=100 backend
```

### Backups Automatizados

1. **Crear Script de Backup**
   ```bash
   nano /opt/scripts/backup.sh
   ```

   ```bash
   #!/bin/bash
   DATE=$(date +%Y%m%d_%H%M%S)
   BACKUP_DIR="/opt/backups"

   mkdir -p $BACKUP_DIR

   # Backup de base de datos
   docker exec n8n-postgres pg_dump -U n8n_user n8n_marketing_dashboard | \
     gzip > $BACKUP_DIR/db_backup_$DATE.sql.gz

   # Backup de volúmenes de n8n
   docker run --rm \
     -v n8n_n8n_data:/data \
     -v $BACKUP_DIR:/backup \
     alpine tar czf /backup/n8n_data_$DATE.tar.gz -C /data .

   # Eliminar backups antiguos (mantener últimos 7 días)
   find $BACKUP_DIR -name "*.gz" -mtime +7 -delete

   echo "Backup completado: $DATE"
   ```

2. **Hacer Script Ejecutable**
   ```bash
   chmod +x /opt/scripts/backup.sh
   ```

3. **Configurar Cron Job**
   ```bash
   crontab -e
   ```

   Agregar:
   ```bash
   # Backup diario a las 2 AM
   0 2 * * * /opt/scripts/backup.sh >> /var/log/backup.log 2>&1
   ```

### Actualizar Aplicación

```bash
cd /opt/n8n-marketing-dashboard

# Obtener últimos cambios
git pull origin main

# Ejecutar despliegue
./scripts/deploy.sh production
```

### Monitoreo de Recursos

```bash
# Ver uso de recursos de Docker
docker stats

# Ver espacio en disco
df -h

# Ver uso de memoria
free -h

# Ver procesos activos
htop
```

---

## Solución de Problemas

### Problema: Contenedores No Inician

**Síntoma:** `docker-compose ps` muestra contenedores con estado "Exit"

**Solución:**
```bash
# Ver logs del contenedor
docker-compose logs backend

# Verificar puertos en uso
netstat -tulpn | grep LISTEN

# Reiniciar contenedores
docker-compose restart
```

### Problema: Error de Conexión a Base de Datos

**Síntoma:** Backend muestra "Error connecting to database"

**Solución:**
```bash
# Verificar contenedor de base de datos
docker-compose ps postgres

# Ver logs de PostgreSQL
docker-compose logs postgres

# Conectarse a base de datos manualmente
docker exec -it n8n-postgres psql -U n8n_user -d n8n_marketing_dashboard

# Verificar variables de entorno
docker-compose exec backend env | grep DATABASE
```

### Problema: Certificado SSL No se Renueva

**Síntoma:** Nginx muestra certificado expirado

**Solución:**
```bash
# Renovar manualmente
certbot renew

# Recargar Nginx
systemctl reload nginx

# Verificar configuración de certbot
cat /etc/letsencrypt/renewal/tudominio.com.conf
```

### Problema: Aplicación Lenta

**Síntoma:** Tiempos de carga lentos

**Solución:**
```bash
# Verificar recursos disponibles
docker stats

# Aumentar límites de memoria en docker-compose.yml
# deploy:
#   resources:
#     memory: 4096Mi  # Aumentar de 2048Mi

# Verificar uso de CPU
top -bn1 | head -20

# Optimizar base de datos
docker exec n8n-postgres psql -U n8n_user -d n8n_marketing_dashboard -c "VACUUM ANALYZE;"
```

### Problema: Errores de CORS

**Síntoma:** Browser muestra errores de CORS

**Solución:**
```bash
# Verificar configuración de CORS
docker-compose exec backend env | grep CORS

# Editar .env.production
nano .env.production

# Asegurarse de incluir todos los dominios
CORS_ORIGIN=https://tudominio.com,https://www.tudominio.com

# Reiniciar backend
docker-compose restart backend
```

### Obtener Ayuda Adicional

Si encuentras problemas no documentados:

1. **Verificar Logs Completos**
   ```bash
   docker-compose logs --tail=500 > debug.log
   ```

2. **Verificar Configuración de Docker**
   ```bash
   docker info
   docker version
   docker-compose version
   ```

3. **Consultar Documentación**
   - Documentación del Proyecto: `/docs/deployment/README.md`
   - Docker Docs: https://docs.docker.com
   - Nginx Docs: https://nginx.org/en/docs/

4. **Comunidad**
   - GitHub Issues: https://github.com/TU_USUARIO/n8n-marketing-dashboard/issues
   - Foro de Hostinger: https://www.hostinger.com/tutorials

---

## Resumen de Comandos Útiles

### Gestión de Servicios

```bash
# Iniciar todos los servicios
docker-compose up -d

# Detener todos los servicios
docker-compose down

# Reiniciar un servicio específico
docker-compose restart backend

# Ver estado de servicios
docker-compose ps

# Ver logs en tiempo real
docker-compose logs -f
```

### Mantenimiento

```bash
# Actualizar aplicación
git pull && ./scripts/deploy.sh production

# Backup manual
/opt/scripts/backup.sh

# Limpiar imágenes Docker no utilizadas
docker system prune -a

# Verificar certificados SSL
certbot certificates
```

### Monitoreo

```bash
# Estadísticas de Docker
docker stats

# Uso de disco
du -sh /opt/n8n-marketing-dashboard

# Conexiones activas
netstat -an | grep ESTABLISHED | wc -l

# Logs de Nginx
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

---

## Checklist de Despliegue Completo

Antes de considerar el despliegue como completado, verifica:

- [ ] Repositorio en GitHub creado
- [ ] Código empujado a GitHub
- [ ] VPS de Hostinger configurado
- [ ] Docker y Docker Compose instalados
- [ ] Easypanel instalado y accesible
- [ ] Variables de entorno configuradas
- [ ] Aplicación desplegada con Docker Compose
- [ ] Nginx configurado como reverse proxy
- [ ] DNS configurado correctamente
- [ ] Certificados SSL instalados
- [ ] Frontend accesible en https://tudominio.com
- [ ] Backend API accesible en https://api.tudominio.com
- [ ] n8n accesible en https://n8n.tudominio.com
- [ ] Health checks funcionando
- [ ] Backups automatizados configurados
- [ ] Monitoreo configurado
- [ ] Documentación actualizada

---

## Recursos Adicionales

- **Documentación del Proyecto**: `/docs/`
- **Documentación de Docker**: https://docs.docker.com
- **Documentación de Easypanel**: https://easypanel.io/docs
- **Comunidad de Hostinger**: https://community.hostinger.com
- **Foros de Ubuntu**: https://ubuntuforums.org

---

**Versión:** 1.0.0
**Última Actualización:** 2026-01-31
**Autor:** Equipo de n8n Marketing Dashboard
