const express = require('express');
const axios = require('axios');
const cors = require('cors');
const multer = require('multer');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
require('dotenv').config();

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
// WhatsApp Cloud API - Webhooks & Mensajería Multimoderador
// ==========================================================

const waChatsFile = process.env.VERCEL 
  ? path.join(os.tmpdir(), 'whatsapp_chats.json')
  : path.join(__dirname, 'whatsapp_chats.json');

function getStoredChats() {
  try {
    if (fs.existsSync(waChatsFile)) {
      return JSON.parse(fs.readFileSync(waChatsFile, 'utf8'));
    }
  } catch (err) {
    console.error('[WhatsApp DB] Error leyendo historial:', err.message);
  }
  return {};
}

function saveStoredChats(data) {
  try {
    fs.writeFileSync(waChatsFile, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('[WhatsApp DB] Error guardando historial:', err.message);
  }
}

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

// 2. Recepción de mensajes en tiempo real (POST) - Enviado por Meta
app.post('/api/whatsapp/webhook', (req, res) => {
  const body = req.body;

  // Responder a Meta INMEDIATAMENTE con 200 OK para evitar reintentos y bloqueos
  res.status(200).send('EVENT_RECEIVED');

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
              if (msg.type === 'text') {
                text = msg.text?.body || '';
              } else if (msg.type === 'image') {
                text = '📷 Imagen recibida';
              } else if (msg.type === 'document') {
                text = `📄 ${msg.document?.filename || 'Documento recibido'}`;
              } else if (msg.type === 'audio') {
                text = '🎤 Nota de voz';
              } else {
                text = `[Mensaje tipo: ${msg.type}]`;
              }

              const timeStr = new Date(parseInt(msg.timestamp) * 1000 || Date.now())
                .toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

              console.log(`[WhatsApp Entrada] De ${contactName} (${from}): ${text}`);

              const chats = getStoredChats();
              if (!chats[from]) {
                const initials = contactName.split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase() || 'WA';
                chats[from] = {
                  id: from,
                  numero: `+${from}`,
                  nombre: contactName,
                  initials,
                  unread: 0,
                  archivado: false,
                  fijado: false,
                  silenciado: false,
                  cerrado: false,
                  vendedores: [],
                  tags: ['Nuevo lead'],
                  messages: []
                };
              }

              chats[from].unread = (chats[from].unread || 0) + 1;
              chats[from].preview = text;
              chats[from].fecha = 'Hoy';
              chats[from].messages.push({
                id: msg.id || Date.now(),
                from: 'contact',
                text,
                time: timeStr
              });

              saveStoredChats(chats);
            }
          }
        }
      }
    }
  } catch (err) {
    console.error('[Meta Webhook POST] Error procesando payload:', err.message);
  }
});

// 3. Obtener chats y mensajes sincronizados para el CRM
app.get('/api/whatsapp/chats', requireAuth, (req, res) => {
  try {
    const chats = getStoredChats();
    res.json({ success: true, chats: Object.values(chats) });
  } catch (err) {
    res.status(500).json({ error: 'Error obteniendo chats', details: err.message });
  }
});

// 4. Enviar mensaje desde el CRM hacia Meta WhatsApp Cloud API
app.post('/api/whatsapp/send', requireAuth, async (req, res) => {
  const { to, message, vendedor, nombre } = req.body;
  const waToken = process.env.WHATSAPP_TOKEN;
  const waPhoneId = process.env.WHATSAPP_PHONE_ID;

  if (!to || !message) {
    return res.status(400).json({ error: 'Faltan campos requeridos: to y message' });
  }

  if (!waToken || !waPhoneId) {
    return res.status(500).json({ error: 'Credenciales de WhatsApp (WHATSAPP_TOKEN, WHATSAPP_PHONE_ID) no configuradas.' });
  }

  try {
    const cleanNumber = to.replace(/\D/g, '');

    const payload = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: cleanNumber,
      type: "text",
      text: {
        preview_url: false,
        body: message
      }
    };

    const response = await axios.post(`https://graph.facebook.com/v21.0/${waPhoneId}/messages`, payload, {
      headers: {
        'Authorization': `Bearer ${waToken}`,
        'Content-Type': 'application/json'
      }
    });

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Guardar en el historial
    const chats = getStoredChats();
    if (!chats[cleanNumber]) {
      const initials = (nombre || cleanNumber).split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase() || 'WA';
      chats[cleanNumber] = {
        id: cleanNumber,
        numero: `+${cleanNumber}`,
        nombre: nombre || `+${cleanNumber}`,
        initials,
        unread: 0,
        archivado: false,
        fijado: false,
        silenciado: false,
        cerrado: false,
        vendedores: [],
        tags: ['Cliente activo'],
        messages: []
      };
    }

    if (vendedor && !chats[cleanNumber].vendedores.includes(vendedor)) {
      chats[cleanNumber].vendedores.push(vendedor);
    }

    chats[cleanNumber].preview = message;
    chats[cleanNumber].fecha = 'Hoy';
    chats[cleanNumber].messages.push({
      id: response.data.messages?.[0]?.id || Date.now(),
      from: 'me',
      text: message,
      time: timeStr,
      vendedor: vendedor || 'Daniel'
    });

    saveStoredChats(chats);

    res.json({ success: true, data: response.data });
  } catch (error) {
    console.error('[WhatsApp Send Error]:', error.response?.data || error.message);
    res.status(500).json({
      error: 'Error enviando mensaje vía WhatsApp Cloud API',
      details: error.response?.data || error.message
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

