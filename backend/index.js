const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Inicializar la aplicación
const app = express();
const PORT = process.env.PORT || 3000;

// Configurar Middlewares (intermediarios)
app.use(cors()); // Permite que el frontend se conecte sin bloqueos de seguridad
app.use(express.json()); // Permite recibir datos en formato JSON

// Ruta de prueba (Endpoint)
app.get('/', (req, res) => {
    res.send('¡El servidor de CoLabTy está vivo y funcionando!');
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});