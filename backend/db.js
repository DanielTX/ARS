const { Pool } = require('pg');
const { S3Client, PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const path = require('path');
require('dotenv').config();

// Configuración de PostgreSQL en NeonDB
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Configuración de Neon Object Storage (S3)
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-2',
  endpoint: process.env.AWS_ENDPOINT_URL_S3,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
  },
  forcePathStyle: true
});

const S3_BUCKET = 'uploads';

// Formateador de hora en zona horaria oficial de Perú (America/Lima)
function formatPeruTime(dateInput) {
  const d = dateInput ? new Date(dateInput) : new Date();
  return new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Lima',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  }).format(d);
}

// Formateador de fecha relativa para Perú
function formatPeruDate(dateInput) {
  const d = dateInput ? new Date(dateInput) : new Date();
  const now = new Date();
  
  const peruNowStr = now.toLocaleDateString('en-CA', { timeZone: 'America/Lima' });
  const targetStr = d.toLocaleDateString('en-CA', { timeZone: 'America/Lima' });

  if (peruNowStr === targetStr) return 'Hoy';

  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const yesterdayStr = yesterday.toLocaleDateString('en-CA', { timeZone: 'America/Lima' });
  if (yesterdayStr === targetStr) return 'Ayer';

  return new Intl.DateTimeFormat('es-PE', {
    timeZone: 'America/Lima',
    day: '2-digit',
    month: '2-digit'
  }).format(d);
}

// Inicialización de tablas en PostgreSQL
async function initDb() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS whatsapp_chats (
        id VARCHAR(50) PRIMARY KEY,
        numero VARCHAR(50) NOT NULL,
        nombre VARCHAR(255) NOT NULL,
        initials VARCHAR(10),
        unread INTEGER DEFAULT 0,
        archivado BOOLEAN DEFAULT false,
        fijado BOOLEAN DEFAULT false,
        silenciado BOOLEAN DEFAULT false,
        cerrado BOOLEAN DEFAULT false,
        vendedores JSONB DEFAULT '[]'::jsonb,
        tags JSONB DEFAULT '["Nuevo lead"]'::jsonb,
        preview TEXT,
        fecha VARCHAR(50) DEFAULT 'Hoy',
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS whatsapp_messages (
        id VARCHAR(100) PRIMARY KEY,
        chat_id VARCHAR(50) REFERENCES whatsapp_chats(id) ON DELETE CASCADE,
        from_type VARCHAR(20) NOT NULL,
        text TEXT,
        time VARCHAR(30),
        timestamp BIGINT,
        vendedor VARCHAR(100),
        media_type VARCHAR(30) DEFAULT 'text',
        media_url TEXT,
        media_filename VARCHAR(255),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS crm_publications (
        id SERIAL PRIMARY KEY,
        message TEXT,
        target VARCHAR(30),
        media_url TEXT,
        status VARCHAR(30) DEFAULT 'success',
        details JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
    console.log('[NeonDB] Tablas inicializadas con éxito en PostgreSQL');
  } catch (err) {
    console.error('[NeonDB Init Error]:', err.message);
  }
}

// Obtener todas las conversaciones y sus mensajes ordenados
async function getChats() {
  const chatsResult = await pool.query(`
    SELECT * FROM whatsapp_chats 
    ORDER BY fijado DESC, updated_at DESC
  `);

  if (chatsResult.rows.length === 0) {
    return [];
  }

  const messagesResult = await pool.query(`
    SELECT * FROM whatsapp_messages 
    ORDER BY timestamp ASC, created_at ASC
  `);

  const messagesByChat = {};
  for (const m of messagesResult.rows) {
    if (!messagesByChat[m.chat_id]) {
      messagesByChat[m.chat_id] = [];
    }
    messagesByChat[m.chat_id].push({
      id: m.id,
      from: m.from_type,
      text: m.text || '',
      time: m.time || formatPeruTime(m.created_at),
      timestamp: m.timestamp,
      vendedor: m.vendedor,
      mediaType: m.media_type,
      mediaUrl: m.media_url,
      mediaFilename: m.media_filename
    });
  }

  return chatsResult.rows.map(c => ({
    id: c.id,
    numero: c.numero,
    nombre: c.nombre,
    initials: c.initials || 'WA',
    unread: parseInt(c.unread) || 0,
    archivado: !!c.archivado,
    fijado: !!c.fijado,
    silenciado: !!c.silenciado,
    cerrado: !!c.cerrado,
    vendedores: Array.isArray(c.vendedores) ? c.vendedores : [],
    tags: Array.isArray(c.tags) ? c.tags : ['Nuevo lead'],
    preview: c.preview || '',
    fecha: formatPeruDate(c.updated_at),
    messages: messagesByChat[c.id] || []
  }));
}

// Guardar mensaje entrante recibido vía Webhook de Meta WhatsApp
async function saveIncomingMessage({ from, contactName, text, mediaType = 'text', mediaUrl = null, mediaFilename = null, timestamp, msgId }) {
  const initials = contactName.split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase() || 'WA';
  const cleanId = String(from).replace(/\D/g, '');
  const numero = `+${cleanId}`;
  const nowMs = timestamp ? (parseInt(timestamp) * 1000) : Date.now();
  const timeStr = formatPeruTime(nowMs);
  const messageId = msgId || `in_${Date.now()}_${Math.random().toString(36).substring(7)}`;

  // Upsert en tabla de chats
  await pool.query(`
    INSERT INTO whatsapp_chats (id, numero, nombre, initials, unread, preview, fecha, updated_at)
    VALUES ($1, $2, $3, $4, 1, $5, 'Hoy', NOW())
    ON CONFLICT (id) DO UPDATE SET
      nombre = EXCLUDED.nombre,
      unread = whatsapp_chats.unread + 1,
      preview = EXCLUDED.preview,
      fecha = 'Hoy',
      updated_at = NOW();
  `, [cleanId, numero, contactName, initials, text]);

  // Insertar mensaje
  await pool.query(`
    INSERT INTO whatsapp_messages (id, chat_id, from_type, text, time, timestamp, media_type, media_url, media_filename)
    VALUES ($1, $2, 'contact', $3, $4, $5, $6, $7, $8)
    ON CONFLICT (id) DO NOTHING;
  `, [messageId, cleanId, text, timeStr, nowMs, mediaType, mediaUrl, mediaFilename]);

  return { messageId, timeStr };
}

// Guardar mensaje saliente enviado por un monitor / vendedor desde el CRM
async function saveOutgoingMessage({ to, contactName, text, mediaType = 'text', mediaUrl = null, mediaFilename = null, vendedor = 'Marcos Ferreyra', msgId }) {
  const cleanId = String(to).replace(/\D/g, '');
  const numero = `+${cleanId}`;
  const nowMs = Date.now();
  const timeStr = formatPeruTime(nowMs);
  const messageId = msgId || `out_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  const initials = (contactName || cleanId).split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase() || 'WA';

  // Upsert chat
  await pool.query(`
    INSERT INTO whatsapp_chats (id, numero, nombre, initials, unread, preview, fecha, updated_at)
    VALUES ($1, $2, $3, $4, 0, $5, 'Hoy', NOW())
    ON CONFLICT (id) DO UPDATE SET
      preview = EXCLUDED.preview,
      fecha = 'Hoy',
      updated_at = NOW();
  `, [cleanId, numero, contactName || numero, initials, text]);

  // Agregar vendedor al array de vendedores del chat si no está
  if (vendedor) {
    await pool.query(`
      UPDATE whatsapp_chats 
      SET vendedores = CASE 
        WHEN vendedores @> $1::jsonb THEN vendedores 
        ELSE vendedores || $1::jsonb 
      END
      WHERE id = $2
    `, [JSON.stringify([vendedor]), cleanId]);
  }

  // Insertar mensaje
  await pool.query(`
    INSERT INTO whatsapp_messages (id, chat_id, from_type, text, time, timestamp, vendedor, media_type, media_url, media_filename)
    VALUES ($1, $2, 'me', $3, $4, $5, $6, $7, $8, $9)
    ON CONFLICT (id) DO NOTHING;
  `, [messageId, cleanId, text, timeStr, nowMs, vendedor, mediaType, mediaUrl, mediaFilename]);

  return { messageId, timeStr };
}

// Marcar chat como leído (unread = 0)
async function markChatAsRead(chatId) {
  const cleanId = String(chatId).replace(/\D/g, '');
  await pool.query(`
    UPDATE whatsapp_chats 
    SET unread = 0 
    WHERE id = $1
  `, [cleanId]);
}

// Alternar o fijar metadatos del chat (fijar, archivar, silenciar, cerrar, tags)
async function updateChatMeta(chatId, fields) {
  const cleanId = String(chatId).replace(/\D/g, '');
  const keys = Object.keys(fields);
  if (keys.length === 0) return;

  const sets = [];
  const values = [cleanId];
  let idx = 2;

  for (const key of keys) {
    if (['archivado', 'fijado', 'silenciado', 'cerrado', 'nombre', 'unread'].includes(key)) {
      sets.push(`${key} = $${idx}`);
      values.push(fields[key]);
      idx++;
    } else if (['tags', 'vendedores'].includes(key)) {
      sets.push(`${key} = $${idx}::jsonb`);
      values.push(JSON.stringify(fields[key]));
      idx++;
    }
  }

  if (sets.length > 0) {
    await pool.query(`
      UPDATE whatsapp_chats 
      SET ${sets.join(', ')} 
      WHERE id = $1
    `, values);
  }
}

// Subir archivo a Neon Object Storage (S3)
async function uploadToS3(fileBuffer, originalFilename, mimeType) {
  const ext = path.extname(originalFilename);
  const cleanBase = path.basename(originalFilename, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
  const uniqueKey = `attachments/${Date.now()}_${cleanBase}${ext}`;

  await s3Client.send(new PutObjectCommand({
    Bucket: S3_BUCKET,
    Key: uniqueKey,
    Body: fileBuffer,
    ContentType: mimeType
  }));

  // Endpoint directo o URL proxy
  const endpoint = process.env.AWS_ENDPOINT_URL_S3 ? process.env.AWS_ENDPOINT_URL_S3.replace(/\/$/, '') : '';
  const publicUrl = `${endpoint}/${S3_BUCKET}/${uniqueKey}`;
  return { key: uniqueKey, url: publicUrl, filename: originalFilename, mimeType };
}

// Guardar historial de publicaciones de FB/IG
async function savePublication({ message, target, mediaUrl = null, status = 'success', details = {} }) {
  const res = await pool.query(`
    INSERT INTO crm_publications (message, target, media_url, status, details, created_at)
    VALUES ($1, $2, $3, $4, $5, NOW())
    RETURNING *;
  `, [message, target, mediaUrl, status, JSON.stringify(details)]);
  return res.rows[0];
}

module.exports = {
  pool,
  initDb,
  getChats,
  saveIncomingMessage,
  saveOutgoingMessage,
  markChatAsRead,
  updateChatMeta,
  uploadToS3,
  savePublication,
  formatPeruTime,
  formatPeruDate
};
