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

