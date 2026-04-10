const express = require('express');
const axios = require('axios');
const cors = require('cors');
const cron = require('node-cron');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Memoria simple para almacenar publicaciones programadas
let postQueue = [];

app.post('/api/publish', async (req, res) => {
  const { message } = req.body;
  const pageId = process.env.PAGE_ID;
  const accessToken = process.env.PAGE_ACCESS_TOKEN;

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }
  
  if (!pageId || !accessToken) {
    return res.status(500).json({ error: 'Facebook credentials not configured' });
  }

  try {
    const response = await axios.post(`https://graph.facebook.com/v19.0/${pageId}/feed`, {
      message: message,
      access_token: accessToken
    });

    res.status(200).json({ success: true, data: response.data });
  } catch (error) {
    console.error('Error publishing to Facebook:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to publish message', details: error.response?.data || error.message });
  }
});

/* ==========================================================
 *  Sistema de Programación Inteligente (Intervalo dinámico)
 * ========================================================== */
let isPublishing = false;
const TIMER_MINUTES = 10;

async function processQueue() {
  if (postQueue.length === 0) {
    isPublishing = false;
    console.log('\n[Sistema] Sistema procesador detenido (Cola vacía).');
    return;
  }

  isPublishing = true;
  const post = postQueue.shift();
  const pageId = process.env.PAGE_ID;
  const accessToken = process.env.PAGE_ACCESS_TOKEN;

  if (!pageId || !accessToken) {
    console.error('\n[Sistema] Error: Credenciales de FB no configuradas en el .env');
    postQueue.unshift(post);
    isPublishing = false;
    return;
  }

  try {
    console.log(`\n[Sistema] Publicando ahora mismo en Facebook: "${post.message.substring(0, 30)}..."`);
    const response = await axios.post(`https://graph.facebook.com/v19.0/${pageId}/feed`, {
      message: post.message,
      access_token: accessToken
    });
    console.log(`[Sistema] ¡Exitoso! ID del post Facebook: ${response.data.id}`);
  } catch (error) {
    console.error('\n[Sistema] Error al publicar en FB:', error.response?.data || error.message);
  }

  if (postQueue.length > 0) {
    console.log(`[Sistema] Quedan ${postQueue.length} mensajes pendientes.`);
    console.log(`[Sistema] Esperando ${TIMER_MINUTES} minutos exactos para la siguiente publicación...`);
    setTimeout(processQueue, TIMER_MINUTES * 60 * 1000);
  } else {
    isPublishing = false;
    console.log('\n[Sistema] Se completaron todas las publicaciones en cola. Sistema detenido y en reposo.');
  }
}

// Endpoint: Añadir mensaje a la cola (programar)
app.post('/api/schedule', (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: 'Message is required' });
  
  postQueue.push({ id: Date.now(), message });
  
  // ¡Cambio Clave! Iniciamos el procesamiento instantáneamente si estaba detenido
  if (!isPublishing) {
    console.log('\n[Sistema] Nuevo mensaje detectado. Iniciando publicación.');
    processQueue();
  }
  
  res.status(200).json({ success: true, queueLength: postQueue.length, queuedMessage: message });
});

// Endpoint: Obtener todos los mensajes en la cola
app.get('/api/queue', (req, res) => {
  res.status(200).json({ queue: postQueue });
});

// Endpoint: Eliminar mensaje de la cola por ID
app.delete('/api/queue/:id', (req, res) => {
  const idToRemove = parseInt(req.params.id);
  postQueue = postQueue.filter(post => post.id !== idToRemove);
  res.status(200).json({ success: true, queue: postQueue });
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
  console.log(`Sistema de Intervalo Dinámico activado (${TIMER_MINUTES} mins entre posts).`);
});
