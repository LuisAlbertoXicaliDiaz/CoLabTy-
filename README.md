# TalentHub México 🚀

Plataforma colaborativa y de gestión orientada a proyectos y tableros en tiempo real, diseñada con una interfaz moderna y optimizada.

## 🛠️ Tecnologías Utilizadas

### Backend
* **Node.js** & **Express**: Servidor principal y manejo de rutas API.
* **Socket.io**: Comunicación en tiempo real para el chat y la colaboración en tableros.
* **Prisma ORM**: Conexión y gestión de la base de datos relacional.

### Frontend
* **React** (con **Vite**): Interfaz de usuario rápida y dinámica.
* **Socket.io-client**: Cliente para la sincronización del chat de los tableros en tiempo real.

---

## ⚙️ Guía de Instalación y Ejecución Local

Sigue estos pasos para clonar y echar a andar el proyecto en tu entorno local:

### 1. Clonar el repositorio y configurar el entorno
Abre tu terminal y clona el proyecto, luego entra a la carpeta del backend:
```bash
cd backend
2. Configurar las Variables de Entorno (Backend)
Crea un archivo llamado .env dentro de la carpeta backend y añade la URL de conexión a tu base de datos:

Fragmento de código
DATABASE_URL="tu_cadena_de_conexion_de_postgresql_o_base_de_datos"
PORT=4000
3. Instalar Dependencias y Prisma
En la carpeta backend:

Bash
npm install
npx prisma generate
En la carpeta frontend:

Bash
cd ../frontend
npm install
🚀 Ejecución del Proyecto
Para correr la aplicación completa, necesitarás dos terminales abiertas simultáneamente:

Terminal 1 (Backend y Servidor WebSockets):

Bash
cd backend
node index.js
Terminal 2 (Frontend / Interfaz):

Bash
cd frontend
npm run dev
¡Listo! Abre el enlace que te proporciona Vite en tu navegador (por lo general http://localhost:5173) y podrás utilizar la plataforma al 100%.

📊 Administración de la Base de Datos
Puedes visualizar y editar los registros de tus tablas de forma gráfica ejecutando en la carpeta del backend:

Bash
npx prisma studio

Guarda los cambios en tu archivo `README.md`, hazle un commit y estará listo para documenta
