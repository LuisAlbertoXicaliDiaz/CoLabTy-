<div align="center">

# 🚀 CoLabTy
### *Plataforma colaborativa de gestión de proyectos en tiempo real*

[![Node.js](https://img.shields.io/badge/Node.js-v18+-green.svg?style=for-the-badge&logo=nodedotjs)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-Vite-blue.svg?style=for-the-badge&logo=react)](https://react.dev/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748.svg?style=for-the-badge&logo=prisma)](https://www.prisma.io/)
[![Socket.io](https://img.shields.io/badge/Socket.io-Realtime-010101.svg?style=for-the-badge&logo=socket.io)](https://socket.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-316192.svg?style=for-the-badge&logo=postgresql)](https://www.postgresql.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.0-06B6D4.svg?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)
[![Vercel](https://img.shields.io/badge/Vercel-Deployed-black.svg?style=for-the-badge&logo=vercel)](https://vercel.com/)
[![Render](https://img.shields.io/badge/Render-Deployed-46E3B7.svg?style=for-the-badge&logo=render)](https://render.com/)

</div>

---

## 💡 Sobre el Proyecto

**CoLabTy** es una aplicación web full-stack diseñada para potenciar la colaboración en equipos de desarrollo, diseño y cualquier área creativa. Permite la gestión de proyectos mediante tableros Kanban y cuenta con un **sistema de chat integrado en tiempo real** por cada tablero, facilitando la comunicación fluida y la coordinación entre compañeros.

La plataforma responde a tres preguntas clave:  
❓ *¿Qué estamos haciendo?*  
❓ *¿Quién está libre?*  
❓ *¿Por qué decidimos hacerlo así?*

### 🎯 Características principales

- ✅ **Autenticación segura** con JWT, verificación de correo y recuperación de contraseña.
- ✅ **Tableros Kanban** con drag & drop para organizar tareas en columnas personalizables.
- ✅ **Tareas enriquecidas** con título, descripción, prioridad (baja/media/alta) y fechas de inicio/finalización.
- ✅ **Asignación múltiple de usuarios** mediante un sistema de chips visuales e intuitivo.
- ✅ **Checklist dinámico** con progreso en tiempo real y eliminación de ítems.
- ✅ **Chat en tiempo real** por tablero con historial persistente (Socket.io).
- ✅ **Sistema de invitaciones** con notificaciones y aceptación/rechazo.
- ✅ **Temas personalizables** (Oscuro, Claro, Esmeralda, Violeta).
- ✅ **Sidebar colapsable** para maximizar el espacio de trabajo.
- ✅ **Notificaciones elegantes** con `react-hot-toast` (sin `alert`s molestos).
- ✅ **Calendario moderno** con `react-datepicker` (reemplazo del input nativo).
- ✅ **Preparado para producción** con variables de entorno y despliegue en Vercel + Render.

---

## 🛠️ Stack Tecnológico

| Capa | Tecnología | Propósito |
| :--- | :--- | :--- |
| **Frontend** | React + Vite + TypeScript | Interfaz de usuario dinámica y optimizada. |
| **Estilos** | Tailwind CSS + shadcn/ui | Diseño moderno, responsivo y consistente. |
| **Drag & Drop** | dnd-kit | Interacción fluida en los tableros Kanban. |
| **Calendario** | react-datepicker | Selección de fechas elegante y personalizable. |
| **Notificaciones** | react-hot-toast | Feedback visual moderno sin `alert`s. |
| **Backend** | Node.js + Express | API RESTful y lógica de negocio. |
| **ORM** | Prisma | Modelado relacional y consultas seguras. |
| **Base de Datos** | PostgreSQL (Neon) | Almacenamiento de datos en la nube. |
| **Tiempo Real** | Socket.io | Chat y actualizaciones en tiempo real. |
| **Autenticación** | JWT + bcrypt | Seguridad en el manejo de sesiones. |
| **Emails** | Resend | Envío de correos de verificación y recuperación. |
| **Despliegue** | Vercel (Frontend) + Render (Backend) | Hosting en producción. |

---

## 📁 Estructura del Proyecto
CoLabTy/
├── backend/
│ ├── prisma/
│ │ ├── schema.prisma # Modelos de datos (PostgreSQL)
│ │ └── migrations/ # Migraciones de Prisma
│ ├── index.js # Servidor Express + Socket.io
│ ├── package.json
│ └── .env # Variables de entorno (no subir a GitHub)
├── frontend/
│ ├── src/
│ │ ├── pages/ # Componentes de página (Login, Boards, BoardDetail, etc.)
│ │ ├── components/ # Componentes reutilizables
│ │ ├── styles/ # Estilos globales
│ │ └── main.jsx # Punto de entrada de React
│ ├── index.html
│ ├── package.json
│ └── .env # Variables de entorno del frontend
├── .gitignore
└── README.md

text

---

## ⚙️ Guía de Instalación y Configuración Local

### Requisitos previos

- Node.js (v18 o superior)
- PostgreSQL (local o en la nube, ej. Neon)
- Git

### 1. Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/CoLabTy.git
cd CoLabTy
2. Configurar el Backend
bash
cd backend
npm install
Crea un archivo .env en la carpeta backend con las siguientes variables:

env
DATABASE_URL="postgresql://usuario:contraseña@localhost:5432/colabty"
PORT=4000
RESEND_API_KEY="tu_clave_de_resend"  # Opcional, para emails
Genera el cliente de Prisma y ejecuta las migraciones:

bash
npx prisma generate
npx prisma migrate dev --name init
3. Configurar el Frontend
bash
cd ../frontend
npm install
Crea un archivo .env en la carpeta frontend:

env
VITE_API_URL=http://localhost:4000
4. Ejecutar el proyecto en desarrollo
Necesitarás dos terminales abiertas:

Terminal 1 — Backend:

bash
cd backend
npm run dev
Terminal 2 — Frontend:

bash
cd frontend
npm run dev
Accede a http://localhost:5173 y ¡listo! 🚀

🔧 Scripts Disponibles
Backend (backend/package.json)
Script	Descripción
npm start	Inicia el servidor en modo producción.
npm run dev	Inicia el servidor con recarga automática (nodemon).
npx prisma studio	Abre Prisma Studio para gestionar la base de datos visualmente.
npx prisma migrate deploy	Aplica migraciones en producción.
Frontend (frontend/package.json)
Script	Descripción
npm run dev	Inicia el servidor de desarrollo de Vite.
npm run build	Genera la build de producción.
npm run preview	Previsualiza la build localmente.
