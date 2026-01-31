# Guía Paso a Paso: Subir a GitHub

Esta guía te lleva paso a paso para subir tu proyecto n8n Marketing Dashboard a GitHub.

## 📋 Requisitos Previos

- ✅ Cuenta en GitHub (crea una en https://github.com/signup si no tienes)
- ✅ Git instalado en tu computadora (https://git-scm.com/downloads)
- ✅ El proyecto completo descargado

---

## 🔧 Opción 1: Usar el Script Automatizado (RECOMENDADO)

### Paso 1: Abre una terminal

- **Windows**: PowerShell o CMD
- **Mac**: Terminal
- **Linux**: Terminal

### Paso 2: Navega al directorio del proyecto

```bash
cd ruta/donde/esta/n8nvibes
```

Ejemplo en Windows:
```bash
cd C:\Users\TuUsuario\Downloads\n8nvibes
```

Ejemplo en Mac/Linux:
```bash
cd ~/Downloads/n8nvibes
```

### Paso 3: Da permisos de ejecución al script (Mac/Linux)

```bash
chmod +x push-to-github.sh
```

### Paso 4: Ejecuta el script

**Windows:**
```bash
bash push-to-github.sh
```

**Mac/Linux:**
```bash
./push-to-github.sh
```

### Paso 5: Sigue las instrucciones del script

El script te pedirá:
1. Tu nombre de usuario de GitHub
2. Que crees el repositorio en GitHub
3. Esperará a que lo hagas antes de continuar

---

## 👆 Opción 2: Subir Manualmente

Si prefieres hacerlo manualmente, sigue estos pasos:

### Paso 1: Crear repositorio en GitHub

1. Ve a https://github.com/new
2. Llena los campos:
   - **Repository name**: `n8n-marketing-dashboard`
   - **Description**: `AI-powered marketing dashboard with n8n workflow automation`
   - **Visibility**: Private o Public (tu preferencia)
3. ⚠️ **IMPORTANTE**: NO marques estas casillas:
   - ❌ Add a README file
   - ❌ Add .gitignore
   - ❌ Choose a license
4. Clic en **Create repository**

### Paso 2: Configurar Git en tu computadora

Abre una terminal en el directorio del proyecto y ejecuta:

```bash
# Configura tu nombre (reemplaza con tu nombre real)
git config --global user.name "Tu Nombre"

# Configura tu email (reemplaza con tu email de GitHub)
git config --global user.email "tu-email@example.com"
```

### Paso 3: Inicializar repositorio Git

```bash
# Inicializar Git
git init

# Cambiar rama a main
git branch -M main
```

### Paso 4: Agregar archivos y hacer commit

```bash
# Agregar todos los archivos
git add .

# Hacer el commit inicial
git commit -m "Initial commit: n8n Marketing Dashboard"
```

### Paso 5: Conectar con GitHub y subir

**Reemplaza `TU_USUARIO` con tu nombre de usuario de GitHub:**

```bash
# Agregar remote
git remote add origin https://github.com/TU_USUARIO/n8n-marketing-dashboard.git

# Subir a GitHub
git push -u origin main
```

---

## 🔐 Solución de Problemas Comunes

### Problema 1: Git pide usuario y contraseña

Si usas HTTPS y GitHub te pide credenciales, necesitas usar un **Personal Access Token**:

1. Ve a GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Generate new token → Classic
3. Nombre: "n8n Dashboard"
4. Selecciona scopes: `repo`, `workflow`
5. Generate token → **COPIA EL TOKEN** (solo se muestra una vez)

Luego usa el token como contraseña:

```bash
git push -u origin main
# Usuario: TU_USUARIO
# Contraseña: ghp_TU_TOKEN_AQUI
```

### Problema 2: Error "Support for password authentication was removed"

Solución: Crear un Personal Access Token (ver Problema 1)

### Problema 3: Error "remote origin already exists"

```bash
# Remover el remote existente
git remote remove origin

# Agregar el nuevo
git remote add origin https://github.com/TU_USUARIO/n8n-marketing-dashboard.git
```

### Problema 4: Error "failed to push some refs"

```bash
# Forzar el push (con cuidado, solo si es necesario)
git push -u origin main --force
```

---

## ✅ Verificar que todo funcionó

1. Ve a: `https://github.com/TU_USUARIO/n8n-marketing-dashboard`
2. Deberías ver todos los archivos del proyecto
3. Verifica que la rama sea `main`
4. Confirma que NO hay archivos `.env` en el repositorio

---

## 📦 Archivos que deberías ver en GitHub

```
n8n-marketing-dashboard/
├── .gitignore
├── README.md
├── HOSTINGER-DEPLOY.md
├── docker-compose.yml
├── push-to-github.sh
├── easypanel.json
├── .env.production.example
├── backend/
│   ├── Dockerfile
│   ├── package.json
│   ├── prisma/
│   ├── src/
│   └── tsconfig.json
├── frontend/
│   ├── Dockerfile
│   ├── package.json
│   ├── src/
│   └── vite.config.ts
├── scripts/
│   ├── deploy.sh
│   └── setup-hostinger.sh
└── docs/
    ├── api/
    ├── user-guide/
    ├── developer-guide/
    └── deployment/
```

---

## 🚀 Próximos Pasos

Una vez que tu código está en GitHub:

1. **Conéctate a tu VPS de Hostinger**
   ```bash
   ssh root@TU_IP_PUBLICA
   ```

2. **Clona el repositorio**
   ```bash
   cd /opt
   git clone https://github.com/TU_USUARIO/n8n-marketing-dashboard.git
   cd n8n-marketing-dashboard
   ```

3. **Sigue la guía HOSTINGER-DEPLOY.md** para completar el despliegue

---

## 💡 Tips Útiles

### Ver el estado de Git
```bash
git status
```

### Ver historial de commits
```bash
git log --oneline
```

### Ver remotes configurados
```bash
git remote -v
```

### Cancelar cambios no commiteados
```bash
git restore .
```

---

**¿Necesitas ayuda?** Consulta la documentación oficial de Git: https://git-scm.com/doc
