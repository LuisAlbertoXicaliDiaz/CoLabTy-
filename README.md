<div align="center">

# 🚀 TalentHub México
### *Plataforma colaborativa y de gestión de proyectos en tiempo real*

[![Node.js](https://img.shields.io/badge/Node.js-v18+-green.svg?style=for-the-badge&logo=nodedotjs)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-Vite-blue.svg?style=for-the-badge&logo=react)](https://react.dev/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748.svg?style=for-the-badge&logo=prisma)](https://www.prisma.io/)
[![Socket.io](https://img.shields.io/badge/Socket.io-Realtime-010101.svg?style=for-the-badge&logo=socket.io)](https://socket.io/)

</div>

---

## 💡 Sobre el Proyecto

**TalentHub México** es una aplicación web diseñada para potenciar la colaboración en equipo. Permite la gestión de tableros de trabajo y cuenta con un **sistema de chat integrado en tiempo real** por cada tablero mediante WebSockets, facilitando la comunicación fluida entre compañeros y equipos de desarrollo.

---

## 🛠️ Stack Tecnológico

| Componente | Tecnología | Propósito |
| :--- | :--- | :--- |
| **Frontend** | React + Vite | Interfaz de usuario dinámica, moderna y optimizada para dispositivos móviles y escritorio. |
| **Backend** | Node.js & Express | Servidor API RESTful para la lógica de negocio y autenticación. |
| **Tiempo Real** | Socket.io | Sincronización instantánea de mensajes y actualizaciones en los tableros. |
| **Base de Datos** | PostgreSQL & Prisma ORM | Modelado relacional seguro y consultas eficientes de usuarios, tableros y mensajes. |

---

## ⚙️ Guía de Instalación y Configuración Local

Sigue estos sencillos pasos para echar a andar el proyecto en tu entorno de desarrollo local:

### 1. Clonar el repositorio y preparar el Backend
Abre tu terminal, clonar el proyecto y entra a la carpeta del servidor:
```bash
cd backend
2. Configurar las Variables de Entorno
Crea un archivo llamado exactamente .env dentro de la carpeta backend y define tu conexión a la base de datos:

Fragmento de código
DATABASE_URL="tu_cadena_de_conexion_de_postgresql"
PORT=4000
3. Instalar Dependencias y Generar Prisma
Instalar dependencias del Backend y generar el cliente:

Bash
npm install
npx prisma generate
Instalar dependencias del Frontend:

Bash
cd ../frontend
npm install
🚀 Ejecución del Proyecto
Para correr la plataforma al 100%, necesitarás dos terminales abiertas simultáneamente:

Terminal 1 — Backend & WebSockets

Bash
cd backend
node index.js
Terminal 2 — Frontend (Interfaz)

Bash
cd frontend
npm run dev
¡Listo! Abre el enlace proporcionado por Vite en tu navegador (usualmente http://localhost:5173) y disfruta de la aplicación.

📊 Administración Visual de la Base de Datos
Si necesitas inspeccionar, modificar o agregar datos directamente en tus tablas de forma gráfica, puedes utilizar Prisma Studio ejecutando el siguiente comando en la carpeta del backend:

Bash
npx prisma studio
