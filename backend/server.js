const express = require('express');
const axios = require('axios');
const cors = require('cors');
const multer = require('multer');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const {
  initDb,
  getChats,
  saveIncomingMessage,
  saveOutgoingMessage,
  markChatAsRead,
  updateChatMeta,
  uploadToS3,
  savePublication
} = require('./db');

// Iniciar base de datos NeonDB
initDb().catch(e => console.error('[InitDB Error]:', e.message));

const app = express();
const PORT = process.env.PORT || 3000;

const os = require('os');
const uploadDir = process.env.VERCEL ? os.tmpdir() : path.join(__dirname, 'uploads');
if (!process.env.VERCEL && !fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}
const upload = multer({ dest: uploadDir });

app.use(cors());
app.use(express.json());

// ==========================================================
// Funciones de Publicación Directa
// ==========================================================
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

async function executeWhatsAppPublish(post) {
  const waToken = process.env.WHATSAPP_TOKEN;
  const waPhoneId = process.env.WHATSAPP_PHONE_ID;

  if (!waToken || !waPhoneId) {
    throw new Error('Credenciales de WhatsApp no configuradas en el .env');
  }

  if (!post.whatsappNumber) {
    throw new Error('Número de WhatsApp de destino no proporcionado.');
  }

  const payload = {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to: post.whatsappNumber,
    type: "text",
    text: {
      preview_url: false,
      body: post.message || ""
    }
  };

  const response = await axios.post(`https://graph.facebook.com/v19.0/${waPhoneId}/messages`, payload, {
    headers: {
      'Authorization': `Bearer ${waToken}`,
      'Content-Type': 'application/json'
    }
  });

  return response.data;
}

// ==========================================
// Middleware de Autenticación
// ==========================================
function requireAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>
  if (!token) {
    return res.status(401).json({ error: 'Acceso denegado. Se requiere token de autenticación.' });
  }
  try {
    const secret = process.env.JWT_SECRET || 'fallback_secret';
    const decoded = jwt.verify(token, secret);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Token inválido o expirado. Inicia sesión nuevamente.' });
  }
}

// ==========================================
// Endpoints de la API
// ==========================================

// Endpoint de Login
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  const validUser = process.env.APP_USERNAME;
  const validPass = process.env.APP_PASSWORD;
  const secret = process.env.JWT_SECRET || 'fallback_secret';

  if (!validUser || !validPass) {
    return res.status(500).json({ error: 'Credenciales de app no configuradas en el servidor.' });
  }

  if (username === validUser && password === validPass) {
    const token = jwt.sign(
      { username, loginAt: new Date().toISOString() },
      secret,
      { expiresIn: '7d' }
    );
    return res.json({ success: true, token });
  }

  return res.status(401).json({ error: 'Usuario o contraseña incorrectos.' });
});

// Endpoint público de diagnóstico para verificar variables en Vercel
app.get('/api/health', (req, res) => {
  const envKeys = Object.keys(process.env).filter(k => 
    !k.includes('SECRET') && !k.includes('PASS') && !k.includes('KEY') && !k.includes('TOKEN')
  );
  res.json({
    status: 'ok',
    envKeys,
    hasDatabaseUrl: !!process.env.DATABASE_URL,
    dbUrlLength: process.env.DATABASE_URL ? process.env.DATABASE_URL.length : 0,
    hasWaToken: !!process.env.WHATSAPP_TOKEN,
    hasWaPhoneId: !!process.env.WHATSAPP_PHONE_ID,
    timestamp: new Date().toISOString()
  });
});

// Endpoint para verificar token (usado por el frontend al recargar)
app.get('/api/auth/verify', requireAuth, (req, res) => {
  res.json({ valid: true, user: req.user.username });
});

// Endpoint de diagnóstico para encontrar el PAGE_ID correcto
app.get('/api/debug/pages', async (req, res) => {
  const accessToken = process.env.PAGE_ACCESS_TOKEN;
  if (!accessToken) return res.status(400).json({ error: 'Falta PAGE_ACCESS_TOKEN en el .env' });
  
  try {
    const response = await axios.get(`https://graph.facebook.com/v19.0/me?fields=id,name&access_token=${accessToken}`);
    res.json({
      mensaje: "Copia este ID en tu archivo .env",
      info: response.data
    });
  } catch (error) {
    console.error('[Debug] Error al identificar cuenta:', error.response?.data || error.message);
    res.status(500).json({ 
      error: 'Error al consultar Meta Graph API', 
      details: error.response?.data || error.message 
    });
  }
});

// Endpoint de Publicación Directa e Inmediata
app.post('/api/publish', requireAuth, upload.single('image'), async (req, res) => {
  try {
    const postObj = {
      message: req.body.message,
      imagePath: req.file ? req.file.path : null,
      target: req.body.target || 'facebook',
      whatsappNumber: req.body.whatsappNumber || null
    };

    let result = {};
    if (postObj.target === 'facebook' || postObj.target === 'both') {
      result.facebook = await executeFacebookPublish(postObj);
    }
    if (postObj.target === 'whatsapp' || postObj.target === 'both') {
      result.whatsapp = await executeWhatsAppPublish(postObj);
    }

    res.status(200).json({ success: true, data: result });
    
    if (postObj.imagePath && fs.existsSync(postObj.imagePath)) {
       fs.unlinkSync(postObj.imagePath);
    }
  } catch(e) {
    console.error('[API Error] Error al publicar:', e.response?.data || e.message);
    
    // Intentar limpiar la imagen en caso de error
    if (req.file && req.file.path && fs.existsSync(req.file.path)) {
       try { fs.unlinkSync(req.file.path); } catch (err) {}
    }

    res.status(500).json({ 
      error: 'Error al publicar en las plataformas', 
      details: e.response?.data || e.message 
    });
  }
});

// ==========================================================
// WhatsApp Cloud API - Webhooks & Mensajería Multimoderador (NeonDB)
// ==========================================================

// 1. Verificación del Webhook (GET) - Requerido por Meta
app.get('/api/whatsapp/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];
  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN || 'autopost_crm_webhook_2026';

  console.log('[Meta Webhook GET] Petición de validación recibida:', { mode, token, challenge });

  if (mode && token) {
    if (mode === 'subscribe' && token === verifyToken) {
      console.log('[Meta Webhook GET] ¡Webhook verificado con éxito!');
      return res.status(200).send(challenge);
    } else {
      console.warn('[Meta Webhook GET] Token de verificación no coincide.');
      return res.sendStatus(403);
    }
  }

  res.sendStatus(400);
});

// 2. Recepción de mensajes en tiempo real (POST) - Guardado en NeonDB
app.post('/api/whatsapp/webhook', async (req, res) => {
  const body = req.body;

  try {
    if (body.object === 'whatsapp_business_account') {
      const entries = body.entry || [];
      for (const entry of entries) {
        const changes = entry.changes || [];
        for (const change of changes) {
          if (change.field === 'messages') {
            const val = change.value;
            const contacts = val.contacts || [];
            const messages = val.messages || [];

            for (const msg of messages) {
              const from = msg.from; // Número del cliente
              const contactInfo = contacts.find(c => c.wa_id === from);
              const contactName = contactInfo?.profile?.name || `+${from}`;

              let text = '';
              let mediaType = 'text';
              let mediaUrl = null;
              let mediaFilename = null;

              if (msg.type === 'text') {
                text = msg.text?.body || '';
              } else if (msg.type === 'image') {
                text = '📷 Imagen recibida';
                mediaType = 'image';
              } else if (msg.type === 'document') {
                mediaFilename = msg.document?.filename || 'documento.pdf';
                text = `📄 ${mediaFilename}`;
                mediaType = 'document';
              } else if (msg.type === 'audio') {
                text = '🎤 Nota de voz';
                mediaType = 'audio';
              } else {
                text = `[Mensaje tipo: ${msg.type}]`;
              }

              console.log(`[WhatsApp Entrada NeonDB] De ${contactName} (${from}): ${text}`);

              await saveIncomingMessage({
                from,
                contactName,
                text,
                mediaType,
                mediaUrl,
                mediaFilename,
                timestamp: msg.timestamp,
                msgId: msg.id
              });
            }
          }
        }
      }
    }
  } catch (err) {
    console.error('[Meta Webhook POST Error]:', err.message);
  }

  // Responder a Meta 200 OK DESPUÉS de guardar en NeonDB para asegurar persistencia en Vercel Serverless
  res.status(200).send('EVENT_RECEIVED');
});

// 3. Obtener chats y mensajes sincronizados para el CRM desde NeonDB
app.get('/api/whatsapp/chats', requireAuth, async (req, res) => {
  try {
    const chats = await getChats();
    res.json({ success: true, chats });
  } catch (err) {
    console.error('[GET /api/whatsapp/chats Error]:', err.message);
    res.status(500).json({ error: 'Error obteniendo chats de NeonDB', details: err.message });
  }
});

// 4. Marcar chat como leído de inmediato en NeonDB
app.post('/api/whatsapp/read', requireAuth, async (req, res) => {
  const { chatId } = req.body;
  if (!chatId) return res.status(400).json({ error: 'Falta chatId' });
  try {
    await markChatAsRead(chatId);
    res.json({ success: true, chatId });
  } catch (err) {
    console.error('[POST /api/whatsapp/read Error]:', err.message);
    res.status(500).json({ error: 'Error marcando como leído', details: err.message });
  }
});

// 5. Actualizar metadatos de chat en NeonDB (fijar, archivar, silenciar, cerrar, tags)
app.post('/api/whatsapp/chat-meta', requireAuth, async (req, res) => {
  const { chatId, fields } = req.body;
  if (!chatId || !fields) return res.status(400).json({ error: 'Faltan parámetros: chatId y fields' });
  try {
    await updateChatMeta(chatId, fields);
    res.json({ success: true, chatId, fields });
  } catch (err) {
    console.error('[POST /api/whatsapp/chat-meta Error]:', err.message);
    res.status(500).json({ error: 'Error actualizando chat en NeonDB', details: err.message });
  }
});

// 6. Subir archivo a Neon Object Storage (S3) para adjuntar en chat o publicación
app.post('/api/whatsapp/upload', requireAuth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se subió ningún archivo' });
    }
    const fileBuffer = fs.readFileSync(req.file.path);
    const result = await uploadToS3(fileBuffer, req.file.originalname, req.file.mimetype);
    try { fs.unlinkSync(req.file.path); } catch (e) {}
    res.json({ success: true, file: result });
  } catch (err) {
    console.error('[Upload to Neon S3 Error]:', err.message);
    res.status(500).json({ error: 'Error subiendo archivo a Neon Storage', details: err.message });
  }
});

// 7. Enviar mensaje desde el CRM hacia Meta WhatsApp Cloud API y persistir en NeonDB
app.post('/api/whatsapp/send', requireAuth, async (req, res) => {
  const { to, message, vendedor, nombre, mediaUrl, mediaType, mediaFilename } = req.body;
  const waToken = process.env.WHATSAPP_TOKEN;
  const waPhoneId = process.env.WHATSAPP_PHONE_ID;

  if (!to || (!message && !mediaUrl)) {
    return res.status(400).json({ error: 'Faltan campos requeridos: to y message o mediaUrl' });
  }

  const cleanNumber = to.replace(/\D/g, '');
  let metaResponse = null;

  // Intentar envío a través de WhatsApp Cloud API de Meta si las credenciales existen
  if (waToken && waPhoneId) {
    try {
      let payload;
      if (mediaUrl && (mediaType === 'image' || mediaType === 'document')) {
        payload = {
          messaging_product: "whatsapp",
          recipient_type: "individual",
          to: cleanNumber,
          type: mediaType,
          [mediaType]: {
            link: mediaUrl,
            caption: message || undefined,
            filename: mediaFilename || undefined
          }
        };
      } else {
        payload = {
          messaging_product: "whatsapp",
          recipient_type: "individual",
          to: cleanNumber,
          type: "text",
          text: {
            preview_url: false,
            body: message || ''
          }
        };
      }

      const response = await axios.post(`https://graph.facebook.com/v21.0/${waPhoneId}/messages`, payload, {
        headers: {
          'Authorization': `Bearer ${waToken}`,
          'Content-Type': 'application/json'
        }
      });
      metaResponse = response.data;
    } catch (metaErr) {
      console.warn('[WhatsApp Send Meta Warning]:', metaErr.response?.data || metaErr.message);
    }
  }

  // Guardar siempre en NeonDB para que todos los monitores lo vean de inmediato
  try {
    const textToSave = message || (mediaType === 'image' ? '📷 Imagen enviada' : `📄 ${mediaFilename || 'Archivo'}`);
    const saved = await saveOutgoingMessage({
      to: cleanNumber,
      contactName: nombre,
      text: textToSave,
      mediaType: mediaType || 'text',
      mediaUrl: mediaUrl || null,
      mediaFilename: mediaFilename || null,
      vendedor: vendedor || 'Marcos Ferreyra',
      msgId: metaResponse?.messages?.[0]?.id
    });

    res.json({ success: true, data: metaResponse, saved });
  } catch (error) {
    console.error('[WhatsApp Send DB Error]:', error.message);
    res.status(500).json({
      error: 'Error guardando mensaje en NeonDB',
      details: error.message
    });
  }
});

// Servir archivos estáticos del frontend en producción
const frontendDist = path.join(__dirname, '..', 'frontend', 'dist');
app.use(express.static(frontendDist));
app.get('*', (req, res) => {
  // Solo redirigir peticiones GET no-API al index.html de React
  if (!req.path.startsWith('/api/')) {
    const indexPath = path.join(frontendDist, 'index.html');
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.status(404).send('Frontend no compilado. Por favor corre "npm run build".');
    }
  } else {
    res.status(404).json({ error: 'Ruta API no encontrada' });
  }
});
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
  });
}

module.exports = app;

