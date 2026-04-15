const express = require('express');
const axios = require('axios');
const cors = require('cors');
const multer = require('multer');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}
const upload = multer({ dest: 'uploads/' });

app.use(cors());
app.use(express.json());

// Configuracion Global
let globalAutoPublish = false;

// Memoria simple para almacenar publicaciones programadas
// Estructura: { id, message, approved }
let postQueue = [];

// ==========================================
// Nuevos Endpoints de Configuración
// ==========================================
app.get('/api/settings', (req, res) => {
  res.json({ autoPublish: globalAutoPublish });
});

app.post('/api/settings', (req, res) => {
  const { autoPublish } = req.body;
  globalAutoPublish = !!autoPublish;
  
  if (globalAutoPublish) {
    if (postQueue.length > 0 && !queueTimer) {
      startQueueTimer();
    }
  } else {
    stopQueueTimer();
  }
  
  res.json({ success: true, autoPublish: globalAutoPublish });
});

/* ==========================================================
 *  Sistema de Programación Inteligente (Intervalo dinámico)
 * ========================================================== */
let isPublishing = false;
let queueTimer = null;
const TIMER_MINUTES = 10;

function startQueueTimer() {
  if (queueTimer) return;
  console.log(`\n[Sistema] Temporizador iniciado. Próxima publicación en ${TIMER_MINUTES} minutos.`);
  queueTimer = setTimeout(processQueue, TIMER_MINUTES * 60 * 1000);
}

function stopQueueTimer() {
  if (queueTimer) {
    console.log(`\n[Sistema] Temporizador detenido.`);
    clearTimeout(queueTimer);
    queueTimer = null;
  }
}

async function executeFacebookPublish(post) {
  const pageId = process.env.PAGE_ID;
  const accessToken = process.env.PAGE_ACCESS_TOKEN;

  if (!pageId || !accessToken) {
    throw new Error('Credenciales de FB no configuradas en el .env');
  }

  if (post.imagePath && fs.existsSync(post.imagePath)) {
    const form = new FormData();
    form.append('access_token', accessToken);
    if (post.message) form.append('message', post.message);
    form.append('source', fs.createReadStream(post.imagePath));

    const response = await axios.post(`https://graph.facebook.com/v19.0/${pageId}/photos`, form, {
      headers: form.getHeaders()
    });
    return response.data;
  } else {
    const response = await axios.post(`https://graph.facebook.com/v19.0/${pageId}/feed`, {
      message: post.message || '',
      access_token: accessToken
    });
    return response.data;
  }
}

async function processQueue() {
  queueTimer = null; // El timer ya se ejecutó

  if (!globalAutoPublish) {
    console.log(`\n[Sistema] Auto-Publicar APAGADO. Mensajes acumularán en la cola.`);
    return;
  }

  if (postQueue.length === 0) {
    console.log('\n[Sistema] Sistema procesador detenido (Cola vacía).');
    return;
  }

  isPublishing = true;
  const post = postQueue.shift(); // Sacamos de la cola el elemento actual

  try {
    console.log(`\n[Sistema] Publicando ahora mismo en Facebook...`);
    const data = await executeFacebookPublish(post);
    console.log(`[Sistema] ¡Exitoso! ID del post Facebook: ${data.id}`);
  } catch (error) {
    console.error('\n[Sistema] Error al publicar en FB:', error.response?.data || error.message);
  } finally {
    if (post.imagePath && fs.existsSync(post.imagePath)) {
      try { fs.unlinkSync(post.imagePath); } catch (e) { console.error('Error al limpiar upload:', e); }
    }
  }

  isPublishing = false;

  if (postQueue.length > 0) {
    console.log(`[Sistema] Quedan ${postQueue.length} mensajes pendientes.`);
    startQueueTimer();
  } else {
    console.log('\n[Sistema] Se completaron todas las publicaciones en cola. Sistema en reposo.');
  }
}

// ==========================================
// Endpoints de Gestión de Cola
// ==========================================

// Añadir mensaje a la cola (programar manual)
app.post('/api/schedule', upload.single('image'), (req, res) => {
  const { message } = req.body;
  const imagePath = req.file ? req.file.path : null;
  
  if (!message && !imagePath) return res.status(400).json({ error: 'Message or image is required' });
  
  postQueue.push({ id: Date.now(), message: message || '', imagePath });
  
  // Iniciamos el procesamiento si estaba detenido
  if (globalAutoPublish && !queueTimer) {
    console.log('\n[Sistema] Nuevo mensaje detectado. Iniciando temporizador...');
    startQueueTimer();
  }
  
  res.status(200).json({ success: true, queueLength: postQueue.length, queuedMessage: message });
});

// Obtener todos los mensajes en la cola
app.get('/api/queue', (req, res) => {
  res.status(200).json({ queue: postQueue });
});



// Publicar mensaje AHORA MISMO y sacarlo de la cola
app.post('/api/queue/:id/publish', async (req, res) => {
  const idToPublish = parseInt(req.params.id);
  const postIndex = postQueue.findIndex(p => p.id === idToPublish);
  
  if (postIndex === -1) return res.status(404).json({ error: 'Post no encontrado en la cola' });
  
  const post = postQueue[postIndex];
  postQueue.splice(postIndex, 1); // Lo remueve
  
  try {
    const data = await executeFacebookPublish(post);
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ error: 'Failed to publish immediately', details: error.response?.data || error.message });
  } finally {
    if (post.imagePath && fs.existsSync(post.imagePath)) {
      try { fs.unlinkSync(post.imagePath); } catch (e) {}
    }
  }
});

// Eliminar mensaje de la cola
app.delete('/api/queue/:id', (req, res) => {
  const idToRemove = parseInt(req.params.id);
  const postToDelete = postQueue.find(post => post.id === idToRemove);
  
  if (postToDelete && postToDelete.imagePath && fs.existsSync(postToDelete.imagePath)) {
    try { fs.unlinkSync(postToDelete.imagePath); } catch (e) {}
  }
  
  postQueue = postQueue.filter(post => post.id !== idToRemove);
  res.status(200).json({ success: true, queue: postQueue });
});

// Endpoint temporal para probar sin frontend (opcional)
app.post('/api/publish', upload.single('image'), async (req, res) => {
  try {
    const postObj = {
      message: req.body.message,
      imagePath: req.file ? req.file.path : null
    };
    const data = await executeFacebookPublish(postObj);
    res.status(200).json({ success: true, data });
    
    if (postObj.imagePath && fs.existsSync(postObj.imagePath)) {
       fs.unlinkSync(postObj.imagePath);
    }
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
  console.log(`Sistema de Intervalo Dinámico activado (${TIMER_MINUTES} mins entre posts).`);
  startTestGenerator();
});

/* ==========================================================
 *  Generador Autónomo de Pruebas
 * ========================================================== */
let holaCounter = 1;
const holaWords = ["Primer", "Segundo", "Tercer", "Cuarto", "Quinto", "Sexto", "Séptimo", "Octavo", "Noveno", "Décimo"];
let testGeneratorInterval;

function startTestGenerator() {
  console.log('[Test Generator] Iniciando generador de saludos automatizado (cada 10 min, max 10)...');
  
  // Función interna que se ejecuta cada ciclo
  function fireTestPost() {
    if (holaCounter > 10) {
      console.log('[Test Generator] Se llegó al límite de 10 saludos. Apagando generador.');
      clearInterval(testGeneratorInterval);
      return;
    }
    
    const message = `${holaWords[holaCounter - 1]} hola`;
    postQueue.push({ id: Date.now(), message });
    console.log(`\n[Test Generator] Se inyectó generador de texto: "${message}"`);
    holaCounter++;
    
    if (globalAutoPublish && !queueTimer) {
      startQueueTimer();
    }
  }

  // Comentar la siguiente linea si NO quieres que dispare el primero inmediatamente al iniciar:
  fireTestPost(); // Dispara el 1ro apenas arranca

  testGeneratorInterval = setInterval(fireTestPost, TIMER_MINUTES * 60 * 1000);
}
