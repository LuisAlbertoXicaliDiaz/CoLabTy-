Markdown
# 🚀 CoLabTy

> La plataforma inteligente de colaboración y gestión de proyectos para equipos modernos.

## 📋 Descripción del Proyecto
**CoLabTy** es una aplicación Web Full-Stack diseñada para optimizar la organización de equipos de trabajo, ofreciendo un flujo completo de autenticación de usuarios, gestión de workspaces y tableros Kanban interactivos.

---

## 🛠️ Tecnologías Utilizadas

### Frontend
* **React** (con Vite)
* **React Router DOM** (Gestión de rutas y navegación)
* **Tailwind CSS** (Diseño y estilos modernos)

### Backend
* **Node.js & Express.js** (API RESTful)
* **Prisma ORM (v7)** (Gestión y mapeo de objetos para la base de datos)
* **PostgreSQL** (Base de datos relacional alojada en **Neon**)
* **Bcrypt** (Encriptación segura de credenciales)

---

## 📂 Estructura del Repositorio

```text
CoLabTy-/
├── backend/            # Servidor API, modelos Prisma y rutas
│   ├── prisma/         # Esquema y migraciones de la BD
│   ├── index.js        # Punto de entrada de Express
│   └── prisma.config.ts# Configuración de Prisma v7
└── frontend/           # Interfaz de usuario en React
    ├── src/
    │   ├── pages/      # Vistas (Login, Register, Dashboard)
    │   └── ...
    └── package.json
⚙️ Guía de Instalación y Dependencias
Para levantar este proyecto en tu entorno local, necesitarás abrir dos terminales simultáneamente (una para el Backend y otra para el Frontend).

1. Configurar y arrancar el Backend
Entra a la carpeta del backend e instala las dependencias necesarias:

Bash
cd backend
npm install express cors dotenv bcrypt @prisma/client @prisma/adapter-pg pg
npm install -D prisma dotenv
Asegúrate de tener tu archivo .env configurado con tu variable DATABASE_URL conectada a Neon, y arranca el servidor:

Bash
node index.js
(El servidor correrá por defecto en http://localhost:4000)

2. Configurar y arrancar el Frontend
En una segunda terminal, entra a la carpeta del frontend e instala las dependencias:

Bash
cd frontend
npm install react-router-dom
npm install -D tailwindcss postcss autoprefixer
Arranca el servidor de desarrollo de React:

Bash
npm run dev
(El frontend correrá típicamente en http://localhost:5173)

🗄️ Comandos Útiles de Base de Datos (Prisma)
Si necesitas administrar la base de datos durante el desarrollo:

Bash
# Aplicar migraciones pendientes a la base de datos en Neon
npx prisma migrate dev

# Abrir la interfaz gráfica web para visualizar los registros (Prisma Studio)
npx prisma studio
