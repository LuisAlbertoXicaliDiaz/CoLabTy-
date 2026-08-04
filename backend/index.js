import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt'; // <-- NUEVO: Para encriptar
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

// --- 1. RUTA DE REGISTRO (Ahora con encriptación) ---
app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    // NUEVO: Encriptar la contraseña (10 es el nivel de seguridad estándar)
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword, // Guardamos la contraseña revuelta, no la original
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

// --- 2. NUEVA RUTA DE LOGIN ---
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Correo y contraseña son obligatorios' });
    }

    // Buscar al usuario en la base de datos por su correo
    const user = await prisma.user.findUnique({
      where: { email }
    });

    // Si no existe el usuario, damos error genérico por seguridad
    if (!user) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    // Comparar la contraseña que escribió con la encriptada en la base de datos
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    // Si todo coincide, damos luz verde
    res.status(200).json({ 
      message: '¡Inicio de sesión exitoso!',
      user: { id: user.id, name: user.name, email: user.email }
    });

  } catch (error) {
    console.error('Error en el login:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});