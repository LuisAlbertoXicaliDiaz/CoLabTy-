import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { Resend } from 'resend';
import pkg from '@prisma/client';
const { PrismaClient } = pkg;

import pg from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

import { createServer } from 'http';
import { Server } from 'socket.io';

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const app = express();
app.use(cors());
app.use(express.json());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PATCH", "DELETE"]
  }
});

const resend = new Resend(process.env.RESEND_API_KEY);

app.get('/', (req, res) => {
  res.send('Servidor de CoLabTy funcionando al 100% 🚀');
});

// ==========================================
// 1. AUTENTICACIÓN
// ==========================================

app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const newUser = await prisma.user.create({
      data: { name, email, password: hashedPassword },
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

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Correo y contraseña son obligatorios' });
    }
    const user = await prisma.user.findUnique({ where: { email } });
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
// 2. RECUPERACIÓN DE CONTRASEÑA
// ==========================================

app.post('/api/forgot-password', async (req, res) => {
  const { email } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(200).json({ message: 'Si el correo está registrado, recibirás un enlace.' });
    }
    const resetToken = crypto.randomBytes(32).toString('hex');
    const tokenExpiry = new Date(Date.now() + 3600000);
    await prisma.user.update({
      where: { email },
      data: { resetPasswordToken: resetToken, resetPasswordExpires: tokenExpiry },
    });
    const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;
    const { error } = await resend.emails.send({
      from: 'CoLabTy <onboarding@resend.dev>',
      to: user.email,
      subject: 'Recuperación de contraseña - CoLabTy',
      html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
          <h2 style="color: #312e81; text-align: center;">CoLabTy.</h2>
          <h3 style="color: #333;">Hola, ${user.name}</h3>
          <p style="color: #555; line-height: 1.5;">Has solicitado restablecer tu contraseña en CoLabTy. Para hacerlo, haz clic en el siguiente botón:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Restablecer mi contraseña</a>
          </div>
          <p style="color: #555; font-size: 14px;">Este enlace expirará en 1 hora por motivos de seguridad.</p>
        </div>`
    });
    if (error) {
      console.error('Error de Resend:', error);
      return res.status(500).json({ error: 'No se pudo enviar el correo.' });
    }
    res.status(200).json({ message: 'Correo enviado. Revisa tu bandeja de entrada o spam.' });
  } catch (error) {
    console.error('Error en el servidor al recuperar contraseña:', error);
    res.status(500).json({ error: 'Hubo un error al procesar la solicitud' });
  }
});

app.post('/api/reset-password', async (req, res) => {
  const { token, newPassword } = req.body;
  try {
    const user = await prisma.user.findFirst({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: { gt: new Date() }
      }
    });
    if (!user) {
      return res.status(400).json({ error: 'El enlace es inválido o ha expirado.' });
    }
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpires: null
      }
    });
    res.status(200).json({ message: 'Contraseña actualizada correctamente.' });
  } catch (error) {
    console.error('Error al restablecer contraseña:', error);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

// ==========================================
// 3. COLUMNAS
// ==========================================

app.post('/api/columns', async (req, res) => {
  console.log('📥 Recibida petición para crear columna:', req.body);
  try {
    const { title, boardId } = req.body;
    if (!title || !boardId) {
      return res.status(400).json({ error: 'El título y el ID del tablero son obligatorios' });
    }
    const existingColumns = await prisma.column.findMany({
      where: { boardId: boardId },
      orderBy: { order: 'desc' },
      take: 1
    });
    const nextOrder = existingColumns.length > 0 ? existingColumns[0].order + 1 : 1;
    const newColumn = await prisma.column.create({
      data: { title, boardId: boardId, order: nextOrder },
    });
    console.log('✅ Columna creada en BD:', newColumn);
    res.status(201).json({ message: 'Columna creada con éxito', column: newColumn });
  } catch (error) {
    console.error('❌ Error al crear columna:', error);
    res.status(500).json({ error: 'Error interno del servidor: ' + error.message });
  }
});

app.delete('/api/columns/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.column.delete({ where: { id: id } });
    console.log(`✅ Columna ${id} eliminada`);
    res.json({ message: 'Columna eliminada con éxito' });
  } catch (error) {
    console.error('❌ Error al eliminar columna:', error);
    res.status(500).json({ error: 'Error interno del servidor al eliminar' });
  }
});

// ==========================================
// 4. TABLEROS
// ==========================================

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
        columns: { include: { tasks: true }, orderBy: { order: 'asc' } },
        user: { select: { name: true } }
      }
    });
    res.status(200).json(boards);
  } catch (error) {
    console.error('Error al obtener tableros:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.get('/api/boards/single/:boardId', async (req, res) => {
  console.log(`📥 Solicitando tablero ${req.params.boardId}`);
  try {
    const { boardId } = req.params;
    const board = await prisma.board.findUnique({
      where: { id: boardId },
      include: {
        user: { select: { id: true, name: true, email: true } },
        members: {
          where: { status: 'accepted' },
          include: { user: { select: { id: true, name: true, email: true } } }
        },
        columns: {
          include: {
            tasks: {
              include: {
                assignedUsers: {
                  include: { user: { select: { id: true, name: true, email: true } } }
                },
                checklist: true
              },
              orderBy: { order: 'asc' }
            }
          },
          orderBy: { order: 'asc' }
        }
      }
    });
    if (!board) {
      console.warn('⚠️ Tablero no encontrado');
      return res.status(404).json({ error: 'Tablero no encontrado' });
    }
    console.log('✅ Tablero obtenido correctamente');
    return res.status(200).json(board);
  } catch (error) {
    console.error('❌ Error en GET /api/boards/single/:boardId:', error);
    return res.status(500).json({ error: 'Error interno del servidor: ' + error.message });
  }
});

app.post('/api/boards', async (req, res) => {
  try {
    const { title, userId } = req.body;
    if (!title || !userId) {
      return res.status(400).json({ error: 'El título y el usuario son obligatorios' });
    }
    const newBoard = await prisma.board.create({
      data: { title, userId: parseInt(userId) }
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
      include: { columns: { include: { tasks: true }, orderBy: { order: 'asc' } } }
    });
    res.status(201).json({ message: '¡Tablero creado con éxito!', board: completeBoard });
  } catch (error) {
    console.error('Error al crear tablero:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.delete('/api/boards/:boardId', async (req, res) => {
  try {
    const { boardId } = req.params;
    await prisma.board.delete({ where: { id: boardId } });
    res.status(200).json({ message: '¡Tablero eliminado con éxito!' });
  } catch (error) {
    console.error('Error al eliminar tablero:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ==========================================
// 5. TAREAS
// ==========================================

app.post('/api/tasks', async (req, res) => {
  try {
    const { content, description, columnId, priority, dueDate, startDate, assignedUserIds } = req.body;
    if (!content || !columnId) {
      return res.status(400).json({ error: 'El contenido y la columna son obligatorios' });
    }
    const taskCount = await prisma.task.count({ where: { columnId: columnId } });
    const newTask = await prisma.task.create({
      data: {
        content,
        description: description || null,
        startDate: startDate || null,
        dueDate: dueDate || null,
        priority: priority || 'media',
        order: taskCount + 1,
        columnId: columnId,
      }
    });
    if (assignedUserIds && assignedUserIds.length > 0) {
      await prisma.taskAssignment.createMany({
        data: assignedUserIds.map(userId => ({
          taskId: newTask.id,
          userId: parseInt(userId)
        }))
      });
    }
    const column = await prisma.column.findUnique({ where: { id: columnId }, select: { boardId: true } });
    if (column && column.boardId) {
      io.to(column.boardId).emit('board_updated');
    }
    return res.status(201).json({ message: '¡Tarea creada con éxito!', task: newTask });
  } catch (error) {
    console.error('Error al crear tarea:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.delete('/api/tasks/:taskId', async (req, res) => {
  try {
    const { taskId } = req.params;
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: { column: true }
    });
    await prisma.task.delete({ where: { id: taskId } });
    if (task && task.column && task.column.boardId) {
      io.to(task.column.boardId).emit('board_updated');
    }
    res.status(200).json({ message: '¡Tarea eliminada con éxito!' });
  } catch (error) {
    console.error('Error al eliminar tarea:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.patch('/api/tasks/:taskId/move', async (req, res) => {
  try {
    const { taskId } = req.params;
    const { columnId, newOrder, boardId } = req.body;
    if (!columnId) {
      return res.status(400).json({ error: 'La columna de destino es obligatoria' });
    }
    let order = newOrder;
    if (order === undefined) {
      order = await prisma.task.count({ where: { columnId: columnId } }) + 1;
    }
    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: { columnId: columnId, order: order }
    });
    if (boardId) {
      io.to(boardId).emit('board_updated');
    }
    return res.status(200).json({ message: '¡Tarea movida con éxito!', task: updatedTask });
  } catch (error) {
    console.error('Error al mover tarea:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ==========================================
// 6. DETALLES DE TAREA (incluye asignación múltiple y prioridad)
// ==========================================

app.patch('/api/tasks/:taskId/details', async (req, res) => {
  console.log('🔁 PATCH /api/tasks/:taskId/details - recibida para tarea:', req.params.taskId);
  console.log('📦 Body:', req.body);
  try {
    const { taskId } = req.params;
    const { description, dueDate, startDate, priority, assignedUserIds } = req.body;

    const updateData = {};
    if (description !== undefined) updateData.description = description;
    if (dueDate !== undefined) updateData.dueDate = dueDate;
    if (startDate !== undefined) updateData.startDate = startDate;
    if (priority !== undefined) updateData.priority = priority;

    // Actualizar la tarea
    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: updateData,
    });

    // ✅ Actualizar asignaciones con manejo de duplicados
    if (assignedUserIds !== undefined) {
      // 1. Eliminar todas las asignaciones existentes
      await prisma.taskAssignment.deleteMany({
        where: { taskId: taskId }
      });

      // 2. Si hay IDs, crear nuevas asignaciones (sin duplicados)
      if (assignedUserIds && assignedUserIds.length > 0) {
        // 🔥 Eliminar duplicados y convertir a números
        const uniqueUserIds = [...new Set(assignedUserIds.map(id => parseInt(id)))];
        
        await prisma.taskAssignment.createMany({
          data: uniqueUserIds.map(userId => ({
            taskId: taskId,
            userId: userId
          }))
        });
      }
    }

    // Obtener la tarea completa con asignaciones
    const taskWithAssignments = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        assignedUsers: {
          include: { user: { select: { id: true, name: true, email: true } } }
        },
        checklist: true
      }
    });

    // Emitir evento
    const taskWithBoard = await prisma.task.findUnique({
      where: { id: taskId },
      include: { column: true }
    });
    if (taskWithBoard && taskWithBoard.column && taskWithBoard.column.boardId) {
      io.to(taskWithBoard.column.boardId).emit('board_updated');
    }

    res.status(200).json({ message: 'Tarea actualizada', task: taskWithAssignments });
  } catch (error) {
    console.error('Error al actualizar tarea:', error);
    res.status(500).json({ error: 'Error interno del servidor: ' + error.message });
  }
});

// ==========================================
// 7. COMPLETAR TAREA (mover a columna "Completado")
// ==========================================

app.patch('/api/tasks/:taskId/complete', async (req, res) => {
  try {
    const { taskId } = req.params;
    const { boardId } = req.body;
    if (!boardId) {
      return res.status(400).json({ error: 'El ID del tablero es obligatorio' });
    }
    const completedColumn = await prisma.column.findFirst({
      where: {
        boardId: boardId,
        title: { contains: 'completado', mode: 'insensitive' }
      }
    });
    if (!completedColumn) {
      return res.status(404).json({ error: 'No se encontró una columna de "Completado"' });
    }
    const taskCount = await prisma.task.count({ where: { columnId: completedColumn.id } });
    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: {
        columnId: completedColumn.id,
        order: taskCount + 1
      }
    });
    io.to(boardId).emit('board_updated');
    res.status(200).json({ message: 'Tarea completada con éxito', task: updatedTask });
  } catch (error) {
    console.error('Error al completar tarea:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ==========================================
// 8. CHECKLIST
// ==========================================

app.post('/api/checklist', async (req, res) => {
  console.log('📥 POST /api/checklist - recibido:', req.body);
  try {
    const { content, taskId } = req.body;
    if (!content || !taskId) {
      return res.status(400).json({ error: 'Faltan datos obligatorios' });
    }
    const newItem = await prisma.checklistItem.create({
      data: { content, taskId, isCompleted: false }
    });
    const taskWithBoard = await prisma.task.findUnique({
      where: { id: taskId },
      include: { column: true }
    });
    if (taskWithBoard && taskWithBoard.column && taskWithBoard.column.boardId) {
      io.to(taskWithBoard.column.boardId).emit('board_updated');
    }
    res.status(201).json(newItem);
  } catch (error) {
    console.error('Error al crear elemento de checklist:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.patch('/api/checklist/:itemId', async (req, res) => {
  console.log('🔁 PATCH /api/checklist/:itemId - recibido para ítem:', req.params.itemId);
  console.log('📦 Body:', req.body);
  try {
    const { itemId } = req.params;
    const { isCompleted } = req.body;
    if (isCompleted === undefined) {
      return res.status(400).json({ error: 'El campo isCompleted es obligatorio' });
    }
    const item = await prisma.checklistItem.findUnique({
      where: { id: itemId },
      include: { task: { include: { column: true } } }
    });
    const updatedItem = await prisma.checklistItem.update({
      where: { id: itemId },
      data: { isCompleted }
    });
    if (item && item.task && item.task.column && item.task.column.boardId) {
      io.to(item.task.column.boardId).emit('board_updated');
    }
    res.status(200).json(updatedItem);
  } catch (error) {
    console.error('Error al actualizar checklist:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.delete('/api/checklist/:itemId', async (req, res) => {
  console.log('🗑️ DELETE /api/checklist/:itemId - eliminando ítem:', req.params.itemId);
  try {
    const { itemId } = req.params;
    const item = await prisma.checklistItem.findUnique({
      where: { id: itemId },
      include: { task: { include: { column: true } } }
    });
    await prisma.checklistItem.delete({ where: { id: itemId } });
    if (item && item.task && item.task.column && item.task.column.boardId) {
      io.to(item.task.column.boardId).emit('board_updated');
    }
    res.status(200).json({ message: 'Elemento eliminado' });
  } catch (error) {
    console.error('Error al eliminar checklist:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ==========================================
// 9. INVITACIONES Y NOTIFICACIONES
// ==========================================

app.post('/api/boards/:boardId/invite', async (req, res) => {
  try {
    const { boardId } = req.params;
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'El correo electrónico es obligatorio' });
    }
    const userToInvite = await prisma.user.findUnique({ where: { email } });
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
        status: 'pending'
      }
    });
    return res.status(200).json({ message: `¡${userToInvite.name} ha sido invitado con éxito!` });
  } catch (error) {
    console.error('Error al invitar usuario:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
});

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
            user: { select: { name: true } }
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

app.patch('/api/notifications/:inviteId', async (req, res) => {
  try {
    const { inviteId } = req.params;
    const { action } = req.body;
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
// 10. MENSAJES (CHAT)
// ==========================================

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
// 11. SOCKET.IO
// ==========================================

io.on('connection', (socket) => {
  console.log('Usuario conectado al chat/tablero:', socket.id);

  socket.on('join_board', (boardId) => {
    socket.join(boardId);
    console.log(`Usuario ${socket.id} se unió a la sala del tablero: ${boardId}`);
  });

  socket.on('send_message', async (data) => {
    try {
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
    console.log('Usuario desconectado del socket');
  });
});

// ==========================================
// 12. INICIO DEL SERVIDOR
// ==========================================

const PORT = process.env.PORT || 4000;
httpServer.listen(PORT, () => {
  console.log(`Servidor y WebSockets corriendo en http://localhost:${PORT}`);
});