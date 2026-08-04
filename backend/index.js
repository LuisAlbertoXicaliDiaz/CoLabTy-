import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt';
import pkg from '@prisma/client';
const { PrismaClient } = pkg;

import pg from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

// --- Importaciones para Socket.io ---
import { createServer } from 'http';
import { Server } from 'socket.io';

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Servidor de CoLabTy funcionando al 100% 🚀');
});

// --- 1. RUTA DE REGISTRO ---
app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    res.status(201).json({ 
      message: '¡Usuario registrado con éxito!', 
      user: { id: newUser.id, name: newUser.name, email: newUser.email } 
    });

  } catch (error) {
    console.error('Error en el registro:', error);
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Este correo electrónico ya está registrado.' });
    }
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// --- 2. RUTA DE LOGIN ---
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Correo y contraseña son obligatorios' });
    }

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    res.status(200).json({ 
      message: '¡Inicio de sesión exitoso!',
      user: { id: user.id, name: user.name, email: user.email }
    });

  } catch (error) {
    console.error('Error en el login:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ==========================================
// --- 3. RUTAS DE TABLEROS KANBAN ---
// ==========================================

// Obtener todos los tableros de un usuario (Propios + en los que ya fue ACEPTADO)
app.get('/api/boards/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const parsedUserId = parseInt(userId);

    const boards = await prisma.board.findMany({
      where: {
        OR: [
          { userId: parsedUserId },
          { members: { some: { userId: parsedUserId, status: 'accepted' } } }
        ]
      },
      include: {
        columns: {
          include: { tasks: true },
          orderBy: { order: 'asc' }
        },
        user: { select: { name: true } }
      }
    });

    res.status(200).json(boards);
  } catch (error) {
    console.error('Error al obtener tableros:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Obtener un tablero individual por su ID (para la vista de detalle)
app.get('/api/boards/single/:boardId', async (req, res) => {
  try {
    const { boardId } = req.params;

    const board = await prisma.board.findUnique({
      where: { id: boardId },
      include: {
        columns: {
          include: {
            tasks: {
              orderBy: { order: 'asc' }
            }
          },
          orderBy: { order: 'asc' }
        }
      }
    });

    if (!board) {
      return res.status(404).json({ error: 'Tablero no encontrado' });
    }

    return res.status(200).json(board);
  } catch (error) {
    console.error('Error al obtener el tablero individual:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Crear un nuevo tablero y sus columnas por defecto
app.post('/api/boards', async (req, res) => {
  try {
    const { title, userId } = req.body;

    if (!title || !userId) {
      return res.status(400).json({ error: 'El título y el usuario son obligatorios' });
    }

    const newBoard = await prisma.board.create({
      data: {
        title,
        userId: parseInt(userId),
      }
    });

    await prisma.column.createMany({
      data: [
        { title: 'Por Hacer', order: 1, boardId: newBoard.id },
        { title: 'En Progreso', order: 2, boardId: newBoard.id },
        { title: 'Completado', order: 3, boardId: newBoard.id }
      ]
    });

    const completeBoard = await prisma.board.findUnique({
      where: { id: newBoard.id },
      include: {
        columns: {
          include: { tasks: true },
          orderBy: { order: 'asc' }
        }
      }
    });

    res.status(201).json({ message: '¡Tablero creado con éxito!', board: completeBoard });

  } catch (error) {
    console.error('Error al crear tablero:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ==========================================
// --- 4. RUTAS DE TAREAS ---
// ==========================================

app.post('/api/tasks', async (req, res) => {
  try {
    const { content, columnId, priority, dueDate } = req.body;

    if (!content || !columnId) {
      return res.status(400).json({ error: 'El contenido y la columna son obligatorios' });
    }

    const taskCount = await prisma.task.count({
      where: { columnId: columnId }
    });

    const newTask = await prisma.task.create({
      data: {
        content,
        columnId: columnId,
        order: taskCount + 1,
        priority: priority || 'media',
        dueDate: dueDate || null
      }
    });

    return res.status(201).json({ message: '¡Tarea creada con éxito!', task: newTask });
  } catch (error) {
    console.error('Error al crear tarea:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// --- 5. RUTA PARA ELIMINAR TAREAS ---
app.delete('/api/tasks/:taskId', async (req, res) => {
  try {
    const { taskId } = req.params;

    await prisma.task.delete({
      where: { id: taskId }
    });

    res.status(200).json({ message: '¡Tarea eliminada con éxito!' });
  } catch (error) {
    console.error('Error al eliminar tarea:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// --- 6. RUTA PARA ELIMINAR TABLEROS ---
app.delete('/api/boards/:boardId', async (req, res) => {
  try {
    const { boardId } = req.params;

    await prisma.board.delete({
      where: { id: boardId }
    });

    res.status(200).json({ message: '¡Tablero eliminado con éxito!' });
  } catch (error) {
    console.error('Error al eliminar tablero:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// --- 7. RUTA PARA MOVER TAREAS ENTRE COLUMNAS ---
app.patch('/api/tasks/:taskId/move', async (req, res) => {
  try {
    const { taskId } = req.params;
    const { columnId } = req.body;

    if (!columnId) {
      return res.status(400).json({ error: 'La columna de destino es obligatoria' });
    }

    const taskCount = await prisma.task.count({
      where: { columnId: columnId }
    });

    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: {
        columnId: columnId,
        order: taskCount + 1
      }
    });

    return res.status(200).json({ message: '¡Tarea movida con éxito!', task: updatedTask });
  } catch (error) {
    console.error('Error al mover tarea:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ==========================================
// --- 8. RUTAS DE INVITACIONES Y NOTIFICACIONES ---
// ==========================================

// 8.1 Invitar usuario a un tablero
app.post('/api/boards/:boardId/invite', async (req, res) => {
  try {
    const { boardId } = req.params;
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'El correo electrónico es obligatorio' });
    }

    const userToInvite = await prisma.user.findUnique({
      where: { email }
    });

    if (!userToInvite) {
      return res.status(404).json({ error: 'El usuario con ese correo no está registrado en CoLabTy' });
    }

    const existingMembership = await prisma.userBoard.findUnique({
      where: {
        userId_boardId: {
          userId: userToInvite.id,
          boardId: boardId
        }
      }
    });

    if (existingMembership) {
      return res.status(400).json({ error: 'Este usuario ya es miembro de este tablero' });
    }

    await prisma.userBoard.create({
      data: {
        userId: userToInvite.id,
        boardId: boardId,
        status: 'pending' // Estado por defecto
      }
    });

    return res.status(200).json({ message: `¡${userToInvite.name} ha sido invitado con éxito!` });
  } catch (error) {
    console.error('Error al invitar usuario:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// 8.2 Obtener notificaciones pendientes de un usuario
app.get('/api/notifications/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const invites = await prisma.userBoard.findMany({
      where: {
        userId: parseInt(userId),
        status: 'pending'
      },
      include: {
        board: {
          include: {
            user: { select: { name: true } } // Propietario del tablero
          }
        }
      }
    });

    res.status(200).json(invites);
  } catch (error) {
    console.error('Error al obtener notificaciones:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// 8.3 Aceptar o Rechazar una invitación
app.patch('/api/notifications/:inviteId', async (req, res) => {
  try {
    const { inviteId } = req.params;
    const { action } = req.body; // "accept" o "reject"

    if (!action || !['accept', 'reject'].includes(action)) {
      return res.status(400).json({ error: 'La acción debe ser "accept" o "reject"' });
    }

    if (action === 'accept') {
      await prisma.userBoard.update({
        where: { id: parseInt(inviteId) },
        data: { status: 'accepted' }
      });
      return res.status(200).json({ message: '¡Invitación aceptada!' });
    } else {
      await prisma.userBoard.delete({
        where: { id: parseInt(inviteId) }
      });
      return res.status(200).json({ message: 'Invitación rechazada' });
    }
  } catch (error) {
    console.error('Error al procesar invitación:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ==========================================
// --- 9. RUTAS DE MENSAJES (CHAT) ---
// ==========================================

// Obtener historial de mensajes de un tablero
app.get('/api/boards/:boardId/messages', async (req, res) => {
  try {
    const { boardId } = req.params;

    const messages = await prisma.message.findMany({
      where: { boardId: boardId },
      include: {
        user: { select: { id: true, name: true } }
      },
      orderBy: { createdAt: 'asc' }
    });

    res.status(200).json(messages);
  } catch (error) {
    console.error('Error al obtener mensajes:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ==========================================
// --- CONFIGURACIÓN DE SOCKET.IO (CHAT POR TABLERO) ---
// ==========================================

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

io.on('connection', (socket) => {
  console.log('Usuario conectado al chat:', socket.id);

  // El cliente se une a una sala específica de un tablero
  socket.on('join_board', (boardId) => {
    socket.join(boardId);
    console.log(`Usuario ${socket.id} se unió a la sala del tablero: ${boardId}`);
  });
// Escuchar mensajes y guardarlos en la BD, luego emitirlos a la sala
  socket.on('send_message', async (data) => {
    try {
      // Soportar tanto data.content como data.message por seguridad
      const messageText = data.content || data.message;
      const targetBoardId = data.boardId;
      const currentUserId = data.userId;

      if (!messageText || !targetBoardId || !currentUserId) {
        console.error('Faltan datos para guardar el mensaje:', data);
        return;
      }

      const savedMessage = await prisma.message.create({
        data: {
          content: messageText,
          board: { connect: { id: targetBoardId } },
          user: { connect: { id: parseInt(currentUserId) } }
        },
        include: {
          user: { select: { id: true, name: true } }
        }
      });

      io.to(targetBoardId).emit('receive_message', savedMessage);
    } catch (error) {
      console.error('Error al guardar mensaje:', error);
    }
  });

  socket.on('disconnect', () => {
    console.log('Usuario desconectado del chat');
  });
}); // <--- Cierra io.on('connection')

// ==========================================
// --- INICIO DEL SERVIDOR HTTP + SOCKETS ---
// ==========================================

const PORT = process.env.PORT || 4000;
httpServer.listen(PORT, () => {
  console.log(`Servidor y WebSockets corriendo en http://localhost:${PORT}`);
});