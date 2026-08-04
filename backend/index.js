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

// Crear un nuevo tablero (con sus columnas por defecto)
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
        columns: {
          create: [
            { title: 'Por Hacer', order: 1 },
            { title: 'En Progreso', order: 2 },
            { title: 'Completado', order: 3 }
          ]
        }
      },
      include: {
        columns: true
      }
    });

    res.status(201).json({ message: '¡Tablero creado con éxito!', board: newBoard });

  } catch (error) {
    console.error('Error al crear tablero:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});