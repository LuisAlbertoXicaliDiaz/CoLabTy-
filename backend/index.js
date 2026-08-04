import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt';
import pkg from '@prisma/client';
const { PrismaClient } = pkg;

import pg from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

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

// Obtener todos los tableros de un usuario específico
app.get('/api/boards/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const boards = await prisma.board.findMany({
      where: { userId: parseInt(userId) },
      include: {
        columns: {
          include: { tasks: true },
          orderBy: { order: 'asc' }
        }
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

    // 1. Creamos el tablero
    const newBoard = await prisma.board.create({
      data: {
        title,
        userId: parseInt(userId),
      }
    });

    // 2. Creamos las columnas usando createMany
    await prisma.column.createMany({
      data: [
        { title: 'Por Hacer', order: 1, boardId: newBoard.id },
        { title: 'En Progreso', order: 2, boardId: newBoard.id },
        { title: 'Completado', order: 3, boardId: newBoard.id }
      ]
    });

    // 3. Obtenemos el tablero completo con columnas y tareas
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
    const { content, columnId } = req.body;

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
        order: taskCount + 1
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

// --- INICIO DEL SERVIDOR ---
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});