// ── MENSAJES VIEW (WhatsApp Inbox style - Full CRM Implementation) ──
import { useState, useRef, useEffect } from 'react';
import axios from 'axios';

// Vendedores disponibles en el CRM
const VENDEDORES_CRM = [
  { id: 'marcos', nombre: 'Marcos Ferreyra', avatar: 'MF', color: '#7c6dff' },
  { id: 'laura', nombre: 'Laura Giménez', avatar: 'LG', color: '#ff6b9d' },
  { id: 'sofia', nombre: 'Sofía Navarro', avatar: 'SN', color: '#25c460' },
];

// Etiquetas iniciales (según diseño MB Suite)
const ETIQUETAS_INICIALES = [
  { id: 'caliente', nombre: 'Caliente', color: '#ef4444' },
  { id: 'cotizando', nombre: 'Cotizando', color: '#f59e0b' },
  { id: 'seguimiento', nombre: 'Seguimiento', color: '#3b82f6' },
  { id: 'cliente_activo', nombre: 'Cliente activo', color: '#10b981' },
  { id: 'soporte', nombre: 'Soporte', color: '#8b5cf6' },
  { id: 'nuevo_lead', nombre: 'Nuevo lead', color: '#06b6d4' },
];

// Plantillas predeterminadas de WhatsApp (según captura MB Suite)
const PLANTILLAS_WHATSAPP = [
  {
    id: 1,
    nombre: 'confirmacion_reunion',
    categoria: 'UTILITY',
    texto: 'Hola {{1}}, confirmamos tu reunión para el {{2}}. Te enviaremos el enlace de la videollamada unos minutos antes. ¡Nos vemos!'
  },
  {
    id: 2,
    nombre: 'recordatorio_reunion_24h',
    categoria: 'UTILITY',
    texto: 'Hola {{1}}, te recordamos que mañana {{2}} tenemos nuestra reunión agendada. Si necesitas reprogramar, avísanos por acá.'
  },
  {
    id: 3,
    nombre: 'recordatorio_reunion_1h',
    categoria: 'UTILITY',
    texto: '¡Hola {{1}}! En una hora arrancamos la reunión {{2}}. Acá tenés el enlace para unirte.'
  },
  {
    id: 4,
    nombre: 'reagendar_reunion',
    categoria: 'UTILITY',
    texto: 'Hola {{1}}, vimos que necesitas reprogramar. Elegí un nuevo horario que te quede cómodo desde el siguiente enlace y lo confirmamos al instante.'
  },
  {
    id: 5,
    nombre: 'primer_contacto_prospecto',
    categoria: 'MARKETING',
    texto: 'Hola {{1}}, soy del equipo de ventas. Vi que te interesó nuestra solución en logística. ¿Te parece si coordinamos una llamada breve de 15 minutos para mostrarte cómo podemos ayudarte?'
  },
  {
    id: 6,
    nombre: 'seguimiento_sin_respuesta',
    categoria: 'MARKETING',
    texto: 'Hola {{1}}, te escribí hace unos días por tu consulta y no quiero que se te pase 😊 ¿Seguís interesado en optimizar tus envíos? Quedo atento.'
  },
  {
    id: 7,
    nombre: 'envio_informacion',
    categoria: 'UTILITY',
    texto: 'Hola {{1}}, adjunto te comparto la información y cotización detallada que conversamos. Cualquier duda podés responderme directamente por este chat.'
  }
];

// Categorías de Emojis para el CRM
const EMOJIS_CATEGORIES = [
  { name: 'Frecuentes / CRM', emojis: ['👍', '😊', '👋', '🙏', '🚀', '🔥', '❤️', '👏', '🎉', '💼', '📦', '💬', '📞', '🤝', '💰', '📅', '⏰', '🎯', '✅', '❌'] },
  { name: 'Caritas', emojis: ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '🙂', '😉', '😌', '😍', '🥰', '😘', '😋', '😎', '🤩', '🥳', '🤔', '🙌'] },
  { name: 'Gestos', emojis: ['👍', '👎', '👌', '✌️', '🤞', '🤝', '👏', '🙌', '👐', '🤲', '🙏', '💪', '👋', '👉', '👈', '👆', '👇', '✋', '✨', '⭐'] },
  { name: 'Ventas y oficina', emojis: ['📊', '📈', '📉', '💡', '🏷️', '🛒', '🛍️', '📦', '🚚', '✈️', '💻', '📱', '📧', '✉️', '📋', '📁', '🏢', '🏆', '🥇', '⚡'] }
];

// Conversaciones de WhatsApp reales (sin datos ficticios)
const CONVERSACIONES_INICIALES = [];

function getAvatarColor(id) {
  const str = String(id || 'WA');
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return `hsl(${Math.abs(hash) % 360}, 60%, 35%)`;
}

export default function Mensajes() {
  const [conversaciones, setConversaciones] = useState(CONVERSACIONES_INICIALES);
  const [etiquetas, setEtiquetas] = useState(ETIQUETAS_INICIALES);
  const [plantillas, setPlantillas] = useState(PLANTILLAS_WHATSAPP);
  const [selectedId, setSelectedId] = useState(() => {
    try {
      return localStorage.getItem('ap_selected_chat') || null;
    } catch {
      return null;
    }
  });
  const selectedIdRef = useRef(selectedId);

  useEffect(() => {
    selectedIdRef.current = selectedId;
  }, [selectedId]);

  // Estados de filtros
  const [tab, setTab] = useState('todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVendedor, setSelectedVendedor] = useState(null);
  const [selectedTag, setSelectedTag] = useState(null);

  // Estados de dropdowns
  const [vendedorDropdownOpen, setVendedorDropdownOpen] = useState(false);
  const [etiquetasDropdownOpen, setEtiquetasDropdownOpen] = useState(false);
  const [menuTresPuntosOpen, setMenuTresPuntosOpen] = useState(false);
  const [submenuEtiquetasOpen, setSubmenuEtiquetasOpen] = useState(false);

  // Estados de búsqueda dentro del chat
  const [chatSearchOpen, setChatSearchOpen] = useState(false);
  const [chatSearchQuery, setChatSearchQuery] = useState('');

  // Estados de modales
  const [plantillasModalOpen, setPlantillasModalOpen] = useState(false);
  const [plantillasSearchQuery, setPlantillasSearchQuery] = useState('');

  const [nuevoModalOpen, setNuevoModalOpen] = useState(false);
  const [nuevoContacto, setNuevoContacto] = useState({ nombre: '', numero: '', tag: 'Nuevo lead', vendedor: 'Marcos Ferreyra', primerMensaje: '' });

  const [gestionarModalOpen, setGestionarModalOpen] = useState(false);
  const [nuevaEtiqueta, setNuevaEtiqueta] = useState({ nombre: '', color: '#7c6dff' });

  // Input de chat, Emojis y Adjuntos
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef(null);
  const chatMessagesContainerRef = useRef(null);
  const chatInputRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const fileInputRef = useRef(null);
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null); // { file, name, size, type, previewUrl }
  const [isUploading, setIsUploading] = useState(false);

  const scrollToBottom = (behavior = 'auto') => {
    if (chatMessagesContainerRef.current) {
      chatMessagesContainerRef.current.scrollTop = chatMessagesContainerRef.current.scrollHeight;
    } else if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior });
    }
  };

  const dropdownRefVendedor = useRef(null);
  const dropdownRefEtiquetas = useRef(null);
  const dropdownRefTresPuntos = useRef(null);

  // Cerrar dropdowns y emoji picker al hacer click afuera
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRefVendedor.current && !dropdownRefVendedor.current.contains(e.target)) {
        setVendedorDropdownOpen(false);
      }
      if (dropdownRefEtiquetas.current && !dropdownRefEtiquetas.current.contains(e.target)) {
        setEtiquetasDropdownOpen(false);
      }
      if (dropdownRefTresPuntos.current && !dropdownRefTresPuntos.current.contains(e.target)) {
        setMenuTresPuntosOpen(false);
        setSubmenuEtiquetasOpen(false);
      }
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(e.target)) {
        setEmojiPickerOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Marcar chat como leído tanto en React local como en la base de datos NeonDB
  const markAsRead = (chatId) => {
    if (!chatId) return;
    setConversaciones(prev => prev.map(c => String(c.id) === String(chatId) ? { ...c, unread: 0 } : c));
    const token = localStorage.getItem('ap_token');
    if (token) {
      axios.post('/api/whatsapp/read', { chatId }, {
        headers: { Authorization: `Bearer ${token}` }
      }).catch(() => {});
    }
  };

  // Guardar metadatos del chat (fijar, archivar, silenciar, etiquetas) en NeonDB
  const saveChatMeta = (chatId, fields) => {
    const token = localStorage.getItem('ap_token');
    if (token) {
      axios.post('/api/whatsapp/chat-meta', { chatId, fields }, {
        headers: { Authorization: `Bearer ${token}` }
      }).catch(() => {});
    }
  };

  // Seleccionar un chat y marcarlo como leído inmediatamente
  const handleSelectChat = (chatId) => {
    setSelectedId(chatId);
    try {
      localStorage.setItem('ap_selected_chat', String(chatId));
    } catch {}
    markAsRead(chatId);
  };

  // Sincronizar mensajes en tiempo real desde NeonDB
  useEffect(() => {
    const token = localStorage.getItem('ap_token');
    if (!token) return;

    const syncChats = () => {
      axios.get('/api/whatsapp/chats', {
        headers: { Authorization: `Bearer ${token}` }
      }).then(res => {
        if (res.data?.success && Array.isArray(res.data.chats)) {
          const incomingChats = res.data.chats;
          const currentSelected = selectedIdRef.current;

          setConversaciones(incomingChats.map(inc => {
            const isCurrentlyOpen = String(inc.id) === String(currentSelected);
            return {
              ...inc,
              unread: isCurrentlyOpen ? 0 : (inc.unread || 0)
            };
          }));

          setSelectedId(prev => {
            const savedChat = localStorage.getItem('ap_selected_chat');
            const target = prev || savedChat;
            const found = incomingChats.find(c => String(c.id) === String(target));
            if (found) {
              return found.id;
            }
            if (incomingChats.length > 0) {
              const firstId = incomingChats[0].id;
              markAsRead(firstId);
              return firstId;
            }
            return null;
          });
        }
      }).catch(() => {});
    };

    syncChats();
    const timer = setInterval(syncChats, 3000);
    return () => clearInterval(timer);
  }, []);

  const activeChat = conversaciones.find(c => c.id === selectedId) || null;

  // Mantener el scroll en el último mensaje enviado/recibido al recargar o cambiar de chat
  useEffect(() => {
    if (activeChat?.messages && activeChat.messages.length > 0) {
      scrollToBottom('auto');
      const timer = setTimeout(() => {
        scrollToBottom('auto');
      }, 60);
      return () => clearTimeout(timer);
    }
  }, [selectedId, activeChat?.messages?.length]);

  const tagColorMap = etiquetas.reduce((acc, t) => {
    acc[t.nombre] = t.color;
    return acc;
  }, {});

  const countNoLeidos = conversaciones.filter(c => !c.archivado && c.unread > 0).length;
  const countArchivados = conversaciones.filter(c => c.archivado).length;

  // Filtrado y ordenamiento de conversaciones (los fijados van arriba)
  const filteredConversaciones = conversaciones
    .filter(c => {
      if (tab === 'noleidos' && (c.unread === 0 || c.archivado)) return false;
      if (tab === 'archivados' && !c.archivado) return false;
      if (tab === 'todos' && c.archivado) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = c.nombre.toLowerCase().includes(q);
        const matchNum = c.numero.toLowerCase().includes(q);
        const matchPrev = (c.preview || '').toLowerCase().includes(q);
        const matchMsgs = (c.messages || []).some(m => m.text.toLowerCase().includes(q));
        if (!matchName && !matchNum && !matchPrev && !matchMsgs) return false;
      }

      if (selectedVendedor) {
        if (selectedVendedor === 'sin_vendedor') {
          if (c.vendedores && c.vendedores.length > 0) return false;
        } else {
          if (!c.vendedores || !c.vendedores.includes(selectedVendedor)) return false;
        }
      }

      if (selectedTag) {
        if (!c.tags || !c.tags.includes(selectedTag)) return false;
      }

      return true;
    })
    .sort((a, b) => {
      // Fijados primero
      if (a.fijado && !b.fijado) return -1;
      if (!a.fijado && b.fijado) return 1;
      return 0;
    });

  // Manejadores de archivos adjuntos
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const isImage = file.type.startsWith('image/');
    const previewUrl = isImage ? URL.createObjectURL(file) : null;
    setSelectedFile({
      file,
      name: file.name,
      size: (file.size / 1024).toFixed(1) + ' KB',
      type: isImage ? 'image' : 'document',
      previewUrl
    });
    e.target.value = '';
  };

  const handleRemoveFile = () => {
    if (selectedFile?.previewUrl) {
      URL.revokeObjectURL(selectedFile.previewUrl);
    }
    setSelectedFile(null);
  };

  const handleInsertEmoji = (emoji) => {
    setInputText(prev => prev + emoji);
    if (chatInputRef.current) {
      chatInputRef.current.focus();
    }
  };

  // Enviar mensaje (con soporte de texto, hora de Perú y archivos adjuntos)
  const handleSendMessage = async (customText) => {
    const textToSend = (customText || inputText).trim();
    if (!textToSend && !selectedFile) return;
    if (!activeChat) return;

    // Hora oficial zonal de Perú (UTC-5)
    const timeStr = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Lima',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(new Date());

    const currentVendedor = 'Marcos Ferreyra';

    let mediaUrl = null;
    let mediaType = 'text';
    let mediaFilename = null;

    if (selectedFile) {
      setIsUploading(true);
      try {
        const formData = new FormData();
        formData.append('file', selectedFile.file);
        const token = localStorage.getItem('ap_token');
        const uploadRes = await axios.post('/api/whatsapp/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`
          }
        });
        if (uploadRes.data?.success && uploadRes.data?.file) {
          mediaUrl = uploadRes.data.file.url;
          mediaType = selectedFile.type;
          mediaFilename = selectedFile.name;
        }
      } catch (err) {
        console.error('Error subiendo archivo a Neon S3:', err);
      } finally {
        setIsUploading(false);
      }
    }

    const previewMsgText = textToSend || (mediaType === 'image' ? '📷 Imagen' : `📄 ${mediaFilename || 'Archivo'}`);

    const newMsg = {
      id: Date.now(),
      from: 'me',
      text: textToSend, // Solo el comentario/texto del usuario (vacío si solo adjuntó archivo)
      time: timeStr,
      vendedor: currentVendedor,
      mediaType,
      mediaUrl: mediaUrl || selectedFile?.previewUrl,
      mediaFilename
    };

    setConversaciones(prev => prev.map(c => {
      if (c.id === activeChat.id) {
        const updatedVendedores = c.vendedores.includes(currentVendedor)
          ? c.vendedores
          : [...c.vendedores, currentVendedor];

        return {
          ...c,
          messages: [...(c.messages || []), newMsg],
          preview: previewMsgText,
          fecha: 'Hoy',
          unread: 0,
          cerrado: false,
          vendedores: updatedVendedores
        };
      }
      return c;
    }));

    if (!customText) setInputText('');
    handleRemoveFile();

    // Disparar envío a través del backend hacia NeonDB y Meta WhatsApp Cloud API
    const token = localStorage.getItem('ap_token');
    if (token) {
      axios.post('/api/whatsapp/send', {
        to: activeChat.numero,
        message: textToSend,
        vendedor: currentVendedor,
        nombre: activeChat.nombre,
        mediaUrl,
        mediaType,
        mediaFilename
      }, {
        headers: { Authorization: `Bearer ${token}` }
      }).catch(err => {
        console.error('[WhatsApp Send] Error:', err.response?.data || err.message);
        const errMsg = err.response?.data?.details?.error?.message || err.response?.data?.error || err.message;
        alert(`No se pudo enviar el mensaje por WhatsApp: ${errMsg}`);
      });
    }
  };

  // Alternar archivar
  const toggleArchivar = (chatId) => {
    setConversaciones(prev => prev.map(c => {
      if (c.id === chatId) {
        const newVal = !c.archivado;
        saveChatMeta(chatId, { archivado: newVal });
        return { ...c, archivado: newVal };
      }
      return c;
    }));
  };

  // Alternar fijar
  const toggleFijar = (chatId) => {
    setConversaciones(prev => prev.map(c => {
      if (c.id === chatId) {
        const newVal = !c.fijado;
        saveChatMeta(chatId, { fijado: newVal });
        return { ...c, fijado: newVal };
      }
      return c;
    }));
  };

  // Alternar silenciar
  const toggleSilenciar = (chatId) => {
    setConversaciones(prev => prev.map(c => {
      if (c.id === chatId) {
        const newVal = !c.silenciado;
        saveChatMeta(chatId, { silenciado: newVal });
        return { ...c, silenciado: newVal };
      }
      return c;
    }));
  };

  // Alternar leído / no leído
  const toggleLeido = (chatId) => {
    setConversaciones(prev => prev.map(c => {
      if (c.id === chatId) {
        const newVal = c.unread > 0 ? 0 : 1;
        if (newVal === 0) {
          markAsRead(chatId);
        } else {
          saveChatMeta(chatId, { unread: 1 });
        }
        return { ...c, unread: newVal };
      }
      return c;
    }));
  };

  // Cerrar conversación
  const handleCerrarConversacion = (chatId) => {
    setConversaciones(prev => prev.map(c => {
      if (c.id === chatId) {
        saveChatMeta(chatId, { cerrado: true, unread: 0 });
        return {
          ...c,
          cerrado: true,
          unread: 0,
          messages: [
            ...(c.messages || []),
            { id: Date.now(), from: 'system', text: 'Conversación marcada como resuelta y cerrada.', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
          ]
        };
      }
      return c;
    }));
    setMenuTresPuntosOpen(false);
  };

  // Alternar etiqueta en el chat activo
  const toggleTagInActiveChat = (tagName) => {
    if (!activeChat) return;
    setConversaciones(prev => prev.map(c => {
      if (c.id === activeChat.id) {
        const hasTag = c.tags.includes(tagName);
        const newTags = hasTag
          ? c.tags.filter(t => t !== tagName)
          : [...c.tags, tagName];
        saveChatMeta(activeChat.id, { tags: newTags });
        return { ...c, tags: newTags };
      }
      return c;
    }));
  };

  // Usar plantilla
  const handleUsarPlantilla = (plantilla) => {
    if (!activeChat) return;
    const primerNombre = activeChat.nombre.split(' ')[0] || 'Cliente';
    const fechaPlaceholder = 'próximo jueves a las 15:00 hs';

    const textoListo = plantilla.texto
      .replace(/{{1}}/g, primerNombre)
      .replace(/{{2}}/g, fechaPlaceholder);

    handleSendMessage(textoListo);
    setPlantillasModalOpen(false);
  };

  // Crear nuevo chat
  const handleCrearChat = (e) => {
    e.preventDefault();
    if (!nuevoContacto.nombre || !nuevoContacto.numero) return;

    const initials = nuevoContacto.nombre
      .split(' ')
      .map(p => p[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() || 'NC';

    const newChatId = Date.now();
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newChat = {
      id: newChatId,
      initials,
      nombre: nuevoContacto.nombre,
      numero: nuevoContacto.numero,
      fecha: 'Hoy',
      unread: 0,
      archivado: false,
      fijado: false,
      silenciado: false,
      cerrado: false,
      vendedores: nuevoContacto.primerMensaje ? [nuevoContacto.vendedor] : [],
      tags: nuevoContacto.tag ? [nuevoContacto.tag] : [],
      messages: nuevoContacto.primerMensaje ? [
        {
          id: 1,
          from: 'me',
          text: nuevoContacto.primerMensaje,
          time: timeStr,
          vendedor: nuevoContacto.vendedor
        }
      ] : []
    };

    setConversaciones([newChat, ...conversaciones]);
    setSelectedId(newChatId);
    setNuevoModalOpen(false);
    setNuevoContacto({ nombre: '', numero: '', tag: 'Nuevo lead', vendedor: 'Marcos Ferreyra', primerMensaje: '' });
  };

  // Crear nueva etiqueta
  const handleCrearEtiqueta = (e) => {
    e.preventDefault();
    if (!nuevaEtiqueta.nombre.trim()) return;

    const id = nuevaEtiqueta.nombre.toLowerCase().replace(/\s+/g, '_');
    if (etiquetas.some(et => et.id === id || et.nombre.toLowerCase() === nuevaEtiqueta.nombre.toLowerCase())) return;

    setEtiquetas([...etiquetas, { id, nombre: nuevaEtiqueta.nombre.trim(), color: nuevaEtiqueta.color }]);
    setNuevaEtiqueta({ nombre: '', color: '#7c6dff' });
  };

  // Mensajes a mostrar en el chat (soporta búsqueda interna de chat)
  const displayMessages = activeChat?.messages ? activeChat.messages.filter(m => {
    if (!chatSearchQuery.trim()) return true;
    return m.text.toLowerCase().includes(chatSearchQuery.toLowerCase().trim());
  }) : [];

  return (
    <div className="mensajes-layout">
      {/* ── COLUMNA IZQUIERDA: LISTA DE CHATS Y FILTROS ── */}
      <div className="mensajes-list">
        {/* Header de la lista */}
        <div className="mensajes-list-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            <span style={{ fontWeight: 700, fontSize: '15px' }}>Mensajes</span>
          </div>
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <div style={{ padding: '4px 10px', background: 'rgba(37,211,102,0.15)', color: '#25d366', borderRadius: '100px', fontSize: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#25d366' }} />
              WhatsApp ▾
            </div>
            <button style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', padding: '4px' }} title="Opciones">⋯</button>
          </div>
        </div>

        {/* Buscador */}
        <div className="mensajes-search">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            placeholder="Buscar por nombre, número..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', padding: '2px 4px', fontSize: '11px' }}
              title="Limpiar búsqueda"
            >
              ✕
            </button>
          )}
          <button
            onClick={() => setNuevoModalOpen(true)}
            style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}
          >
            + Nuevo
          </button>
        </div>

        {/* Pestañas (Todos, No leídos, Archivados) */}
        <div className="mensajes-tabs">
          <button
            className={`mensajes-tab ${tab === 'todos' ? 'active' : ''}`}
            onClick={() => setTab('todos')}
          >
            Todos
          </button>
          <button
            className={`mensajes-tab ${tab === 'noleidos' ? 'active' : ''}`}
            onClick={() => setTab('noleidos')}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}
          >
            No leídos
            {countNoLeidos > 0 && (
              <span style={{
                background: 'var(--accent)',
                color: '#fff',
                fontSize: '9px',
                fontWeight: 700,
                padding: '1px 5px',
                borderRadius: '10px'
              }}>
                {countNoLeidos}
              </span>
            )}
          </button>
          <button
            className={`mensajes-tab ${tab === 'archivados' ? 'active' : ''}`}
            onClick={() => setTab('archivados')}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}
          >
            Archivados
            {countArchivados > 0 && (
              <span style={{
                background: 'var(--surface2)',
                color: 'var(--muted)',
                fontSize: '9px',
                padding: '1px 5px',
                borderRadius: '10px'
              }}>
                {countArchivados}
              </span>
            )}
          </button>
        </div>

        {/* Filtros: Vendedor y Etiquetas */}
        <div className="mensajes-filters">
          {/* Dropdown Vendedor */}
          <div className="filter-dropdown-wrap" ref={dropdownRefVendedor}>
            <button
              className={`filter-mini ${selectedVendedor ? 'active' : ''}`}
              onClick={() => {
                setVendedorDropdownOpen(o => !o);
                setEtiquetasDropdownOpen(false);
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
              {selectedVendedor ? (
                selectedVendedor === 'sin_vendedor' ? 'Sin vendedor' : selectedVendedor.split(' ')[0]
              ) : '↓ Vendedor'} ▾
              {selectedVendedor && (
                <span
                  className="filter-mini-clear"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedVendedor(null);
                  }}
                  title="Quitar filtro de vendedor"
                >
                  ✕
                </span>
              )}
            </button>

            {vendedorDropdownOpen && (
              <div className="filter-dropdown-menu">
                <button
                  className={`dropdown-item ${selectedVendedor === null ? 'active' : ''}`}
                  onClick={() => {
                    setSelectedVendedor(null);
                    setVendedorDropdownOpen(false);
                  }}
                >
                  <span style={{ color: 'var(--muted)', fontSize: '11px' }}>Todos los vendedores</span>
                </button>

                <div className="dropdown-divider" />

                {VENDEDORES_CRM.map(v => (
                  <button
                    key={v.id}
                    className={`dropdown-item ${selectedVendedor === v.nombre ? 'active' : ''}`}
                    onClick={() => {
                      setSelectedVendedor(v.nombre);
                      setVendedorDropdownOpen(false);
                    }}
                  >
                    <div className="dropdown-avatar" style={{ background: v.color }}>
                      {v.avatar}
                    </div>
                    <span>{v.nombre}</span>
                  </button>
                ))}

                <div className="dropdown-divider" />

                <button
                  className={`dropdown-item ${selectedVendedor === 'sin_vendedor' ? 'active' : ''}`}
                  onClick={() => {
                    setSelectedVendedor('sin_vendedor');
                    setVendedorDropdownOpen(false);
                  }}
                >
                  <span style={{ color: 'var(--muted)' }}>Sin vendedor</span>
                </button>
              </div>
            )}
          </div>

          {/* Dropdown Etiquetas */}
          <div className="filter-dropdown-wrap" ref={dropdownRefEtiquetas}>
            <button
              className={`filter-mini ${selectedTag ? 'active' : ''}`}
              onClick={() => {
                setEtiquetasDropdownOpen(o => !o);
                setVendedorDropdownOpen(false);
              }}
            >
              {selectedTag ? (
                <>
                  <span
                    className="tag-dot"
                    style={{ background: tagColorMap[selectedTag] || '#7c6dff' }}
                  />
                  {selectedTag}
                </>
              ) : (
                '+ Etiquetas'
              )} ▾
              {selectedTag && (
                <span
                  className="filter-mini-clear"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedTag(null);
                  }}
                  title="Quitar filtro de etiqueta"
                >
                  ✕
                </span>
              )}
            </button>

            {etiquetasDropdownOpen && (
              <div className="filter-dropdown-menu">
                <button
                  className={`dropdown-item ${selectedTag === null ? 'active' : ''}`}
                  onClick={() => {
                    setSelectedTag(null);
                    setEtiquetasDropdownOpen(false);
                  }}
                >
                  <span style={{ color: 'var(--muted)', fontSize: '11px' }}>Todas las etiquetas</span>
                </button>

                <div className="dropdown-divider" />

                {etiquetas.map(et => (
                  <button
                    key={et.id}
                    className={`dropdown-item ${selectedTag === et.nombre ? 'active' : ''}`}
                    onClick={() => {
                      setSelectedTag(et.nombre);
                      setEtiquetasDropdownOpen(false);
                    }}
                  >
                    <span className="tag-dot" style={{ background: et.color }} />
                    <span>{et.nombre}</span>
                  </button>
                ))}

                <div className="dropdown-divider" />

                <button
                  className="dropdown-item"
                  onClick={() => {
                    setEtiquetasDropdownOpen(false);
                    setGestionarModalOpen(true);
                  }}
                  style={{ color: 'var(--accent)' }}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/>
                  </svg>
                  <span>Gestionar etiquetas</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Lista de conversaciones */}
        <div className="conv-list">
          {filteredConversaciones.length === 0 ? (
            <div style={{ padding: '36px 16px', textAlign: 'center', color: 'var(--muted)', fontSize: '13px' }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.35, marginBottom: '8px' }}>
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <div>No se encontraron conversaciones</div>
              <div style={{ fontSize: '11px', marginTop: '4px', opacity: 0.7 }}>Prueba cambiando o limpiando los filtros</div>
            </div>
          ) : (
            filteredConversaciones.map(c => {
              const lastMsg = c.messages && c.messages.length > 0 ? c.messages[c.messages.length - 1].text : (c.preview || 'Sin mensajes');

              return (
                <div
                  key={c.id}
                  className={`conv-item ${selectedId === c.id ? 'conv-selected' : ''}`}
                  onClick={() => handleSelectChat(c.id)}
                >
                  {/* Avatar de contacto */}
                  <div className="conv-avatar" style={{ background: getAvatarColor(c.id), position: 'relative' }}>
                    {c.initials}
                    {c.fijado && (
                      <span style={{ position: 'absolute', bottom: '-2px', right: '-2px', fontSize: '10px' }} title="Fijado">
                        📌
                      </span>
                    )}
                  </div>

                  {/* Cuerpo de la conversación */}
                  <div className="conv-body">
                    <div className="conv-top">
                      <span className="conv-name" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {c.nombre}
                        {c.silenciado && <span style={{ fontSize: '11px', opacity: 0.7 }} title="Silenciado">🔕</span>}
                        {c.cerrado && <span style={{ fontSize: '9px', background: 'rgba(255,255,255,0.1)', color: 'var(--muted)', padding: '1px 4px', borderRadius: '4px' }}>Cerrado</span>}
                      </span>
                      <span className="conv-date">{c.fecha}</span>
                    </div>

                    {/* Teléfono con icono WhatsApp */}
                    <div className="conv-num" style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '1px' }}>
                      <span style={{ color: '#25d366', fontSize: '11px' }}>●</span>
                      <span>{c.numero}</span>
                    </div>

                    {/* Vendedores que han participado y etiquetas */}
                    <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '4px', marginTop: '4px' }}>
                      {c.vendedores && c.vendedores.map(vendName => {
                        const vData = VENDEDORES_CRM.find(v => v.nombre === vendName);
                        return (
                          <span key={vendName} className="vendedor-chip" title={`Vendedor: ${vendName}`}>
                            <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: vData?.color || '#7c6dff' }} />
                            {vendName.split(' ')[0]}
                          </span>
                        );
                      })}

                      {c.tags && c.tags.map(tagName => {
                        const color = tagColorMap[tagName] || '#7c6dff';
                        return (
                          <span
                            key={tagName}
                            className="tag-chip"
                            style={{
                              fontSize: '10px',
                              background: color + '22',
                              color: color,
                              border: `1px solid ${color}33`,
                              padding: '1px 6px',
                              borderRadius: '6px'
                            }}
                          >
                            {tagName}
                          </span>
                        );
                      })}
                    </div>

                    {/* Preview del mensaje y badge no leídos */}
                    <div className="conv-footer-row" style={{ marginTop: '5px' }}>
                      <span className="conv-preview" style={{ fontWeight: c.unread > 0 ? 600 : 400, color: c.unread > 0 ? 'var(--text)' : 'var(--muted)' }}>
                        {lastMsg}
                      </span>
                      {c.unread > 0 && <span className="conv-badge">{c.unread}</span>}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ── COLUMNA DERECHA: VENTANA DE CHAT ── */}
      <div className="mensajes-chat">
        {activeChat ? (
          <>
            {/* Header del chat */}
            <div className="chat-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div className="conv-avatar" style={{ width: '40px', height: '40px', fontSize: '14px', background: getAvatarColor(activeChat.id), position: 'relative' }}>
                  {activeChat.initials}
                  {activeChat.fijado && <span style={{ position: 'absolute', bottom: '-2px', right: '-2px', fontSize: '10px' }}>📌</span>}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '15px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {activeChat.nombre}
                    {activeChat.silenciado && <span style={{ fontSize: '12px', opacity: 0.7 }} title="Silenciado">🔕</span>}
                    {activeChat.cerrado && <span style={{ fontSize: '10px', background: 'rgba(255,255,255,0.1)', color: 'var(--muted)', padding: '1px 6px', borderRadius: '4px' }}>Cerrada</span>}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                    <span style={{ color: '#25d366', fontWeight: 600 }}>WhatsApp</span>
                    <span>·</span>
                    <span>{activeChat.numero}</span>
                    <span>·</span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                      </svg>
                      {activeChat.vendedores.length > 0 ? activeChat.vendedores.join(', ') : 'Sin vendedor'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Botones de acción del header: 1º LUPA, 2º TRES PUNTOS */}
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                {/* 1. Lupa (Buscar en conversación) */}
                <button
                  className={`topbar-icon-btn ${chatSearchOpen ? 'active' : ''}`}
                  title="Buscar en conversación"
                  onClick={() => setChatSearchOpen(o => !o)}
                  style={{ background: chatSearchOpen ? 'var(--surface2)' : undefined, color: chatSearchOpen ? 'var(--accent)' : undefined }}
                >
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                  </svg>
                </button>

                {/* 2. Tres puntos con dropdown completo */}
                <div className="filter-dropdown-wrap" ref={dropdownRefTresPuntos}>
                  <button
                    className="topbar-icon-btn"
                    title="Más acciones"
                    onClick={() => {
                      setMenuTresPuntosOpen(o => !o);
                      setSubmenuEtiquetasOpen(false);
                    }}
                    style={{ background: menuTresPuntosOpen ? 'var(--surface2)' : undefined }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="19" r="1.5"/>
                    </svg>
                  </button>

                  {/* Menú de tres puntos (según imagen MB Suite) */}
                  {menuTresPuntosOpen && (
                    <div className="menu-tres-puntos">
                      {/* 1. Plantillas */}
                      <button
                        className="dropdown-item"
                        onClick={() => {
                          setMenuTresPuntosOpen(false);
                          setPlantillasModalOpen(true);
                        }}
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
                        </svg>
                        <span>Plantillas</span>
                      </button>

                      {/* 2. Marcar como no leído */}
                      <button
                        className="dropdown-item"
                        onClick={() => {
                          toggleLeido(activeChat.id);
                          setMenuTresPuntosOpen(false);
                        }}
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
                        </svg>
                        <span>{activeChat.unread > 0 ? 'Marcar como leído' : 'Marcar como no leído'}</span>
                      </button>

                      {/* 3. Etiquetar chat (con submenú interactivo) */}
                      <div
                        className="menu-submenu-wrap"
                        onMouseEnter={() => setSubmenuEtiquetasOpen(true)}
                      >
                        <button
                          className="dropdown-item"
                          onClick={() => setSubmenuEtiquetasOpen(o => !o)}
                          style={{ justifyContent: 'space-between' }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/>
                            </svg>
                            <span>Etiquetar chat</span>
                          </div>
                          <span style={{ fontSize: '11px', color: 'var(--muted)' }}>›</span>
                        </button>

                        {/* Submenú de etiquetas desplegado al lado */}
                        {submenuEtiquetasOpen && (
                          <div className="menu-submenu">
                            {etiquetas.map(et => {
                              const tieneTag = activeChat.tags.includes(et.nombre);
                              return (
                                <button
                                  key={et.id}
                                  className="dropdown-item"
                                  onClick={() => toggleTagInActiveChat(et.nombre)}
                                  style={{ justifyContent: 'space-between' }}
                                >
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span className="tag-dot" style={{ background: et.color }} />
                                    <span>{et.nombre}</span>
                                  </div>
                                  {tieneTag && (
                                    <span style={{ color: 'var(--accent)', fontWeight: 700, fontSize: '13px' }}>✓</span>
                                  )}
                                </button>
                              );
                            })}

                            <div className="dropdown-divider" />

                            <button
                              className="dropdown-item"
                              onClick={() => {
                                setMenuTresPuntosOpen(false);
                                setSubmenuEtiquetasOpen(false);
                                setGestionarModalOpen(true);
                              }}
                              style={{ color: 'var(--accent)' }}
                            >
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                              </svg>
                              <span>Gestionar etiquetas</span>
                            </button>
                          </div>
                        )}
                      </div>

                      {/* 4. Fijar / Desfijar */}
                      <button
                        className="dropdown-item"
                        onClick={() => {
                          toggleFijar(activeChat.id);
                          setMenuTresPuntosOpen(false);
                        }}
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="12" y1="17" x2="12" y2="22"/><path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.89A2 2 0 0 1 15 10.77V6a3 3 0 0 0-6 0v4.77a2 2 0 0 1-1.11 1.79l-1.78.89A2 2 0 0 0 5 15.24Z"/>
                        </svg>
                        <span>{activeChat.fijado ? 'Desfijar' : 'Fijar'}</span>
                      </button>

                      {/* 5. Silenciar */}
                      <button
                        className="dropdown-item"
                        onClick={() => {
                          toggleSilenciar(activeChat.id);
                          setMenuTresPuntosOpen(false);
                        }}
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="1" y1="1" x2="23" y2="23"/><path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"/><path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/>
                        </svg>
                        <span>{activeChat.silenciado ? 'Desactivar silencio' : 'Silenciar'}</span>
                      </button>

                      {/* 6. Archivar */}
                      <button
                        className="dropdown-item"
                        onClick={() => {
                          toggleArchivar(activeChat.id);
                          setMenuTresPuntosOpen(false);
                        }}
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5"/><line x1="10" y1="12" x2="14" y2="12"/>
                        </svg>
                        <span>{activeChat.archivado ? 'Desarchivar' : 'Archivar'}</span>
                      </button>

                      <div className="dropdown-divider" />

                      {/* 7. Cerrar conversación (Rojo) */}
                      <button
                        className="dropdown-item dropdown-item-danger"
                        onClick={() => handleCerrarConversacion(activeChat.id)}
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                        <span>Cerrar conversación</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Barra secundaria de búsqueda dentro del chat (si está activa) */}
            {chatSearchOpen && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 20px', background: 'var(--surface2)', borderBottom: '1px solid var(--border)' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                <input
                  style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: 'var(--text)', fontSize: '13px' }}
                  placeholder="Buscar mensajes en este chat..."
                  value={chatSearchQuery}
                  onChange={e => setChatSearchQuery(e.target.value)}
                  autoFocus
                />
                {chatSearchQuery && (
                  <button onClick={() => setChatSearchQuery('')} style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer' }}>✕</button>
                )}
                <button onClick={() => { setChatSearchOpen(false); setChatSearchQuery(''); }} style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: '12px' }}>Cerrar</button>
              </div>
            )}

            {/* Mensajes del chat */}
            <div className="chat-messages" ref={chatMessagesContainerRef}>
              {displayMessages.length === 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--muted)', textAlign: 'center' }}>
                  <div style={{ padding: '8px 16px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '100px', fontSize: '13px' }}>
                    {chatSearchQuery ? 'No se encontraron mensajes con ese texto.' : 'Sin mensajes todavía. Envía el primer mensaje.'}
                  </div>
                </div>
              ) : (
                <>
                  <div className="chat-date-divider">{activeChat.fecha === 'Hoy' ? 'Hoy' : '20 de junio de 2026'}</div>

                  {displayMessages.map(m => {
                    if (m.from === 'system') {
                      return (
                        <div key={m.id} style={{ alignSelf: 'center', margin: '8px 0', padding: '4px 14px', background: 'rgba(255,255,255,0.06)', borderRadius: '100px', fontSize: '11px', color: 'var(--muted)' }}>
                          {m.text} · {m.time}
                        </div>
                      );
                    }

                    return (
                      <div key={m.id} className={`chat-bubble-wrap ${m.from === 'me' ? 'from-me' : 'from-them'}`}>
                        <div className={`chat-bubble ${m.from === 'me' ? 'bubble-me' : 'bubble-them'}`}>
                          {m.vendedor && (
                            <div style={{ fontSize: '10px', opacity: 0.8, marginBottom: '2px', fontWeight: 600 }}>
                              {m.vendedor}
                            </div>
                          )}

                          {/* Previsualización de Imagen si el mensaje contiene una */}
                          {m.mediaType === 'image' && m.mediaUrl && (
                            <div style={{ marginBottom: '6px' }}>
                              <a href={m.mediaUrl} target="_blank" rel="noreferrer" title="Abrir imagen completa">
                                <img
                                  src={m.mediaUrl}
                                  alt="Adjunto"
                                  onLoad={() => scrollToBottom('auto')}
                                  style={{ maxWidth: '100%', maxHeight: '240px', borderRadius: '8px', display: 'block', cursor: 'pointer' }}
                                />
                              </a>
                            </div>
                          )}

                          {/* Previsualización de Documento si el mensaje contiene uno */}
                          {m.mediaType === 'document' && m.mediaUrl && (
                            <div style={{ marginBottom: '6px' }}>
                              <a
                                href={m.mediaUrl}
                                target="_blank"
                                rel="noreferrer"
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '8px',
                                  color: '#60a5fa',
                                  textDecoration: 'none',
                                  background: 'rgba(0,0,0,0.25)',
                                  padding: '6px 10px',
                                  borderRadius: '6px',
                                  fontSize: '12px',
                                  fontWeight: 500
                                }}
                              >
                                <span>📄</span>
                                <span style={{ textDecoration: 'underline' }}>{m.mediaFilename || 'Descargar archivo'}</span>
                              </a>
                            </div>
                          )}

                          {/* Texto o comentario del mensaje */}
                          {(() => {
                            if (!m.text) return null;
                            if (m.mediaUrl) {
                              const cleanText = m.text.replace(/^[📄📷📎\s]+/, '').trim().toLowerCase();
                              const cleanFilename = (m.mediaFilename || '').replace(/^[📄📷📎\s]+/, '').trim().toLowerCase();
                              if (
                                !cleanText ||
                                cleanText === cleanFilename ||
                                cleanText === 'imagen' ||
                                cleanText === 'imagen enviada' ||
                                cleanText === 'archivo' ||
                                cleanText === 'documento adjunto'
                              ) {
                                return null;
                              }
                            }
                            return <div style={{ marginTop: m.mediaUrl ? '6px' : 0 }}>{m.text}</div>;
                          })()}
                          <span className="bubble-time">{m.time}</span>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Barra de previsualización de archivo adjunto antes de enviar */}
            {selectedFile && (
              <div className="chat-attachment-bar">
                {selectedFile.type === 'image' && selectedFile.previewUrl ? (
                  <img src={selectedFile.previewUrl} alt="Preview" className="chat-attachment-thumb" />
                ) : (
                  <div className="chat-attachment-icon">📄</div>
                )}
                <div className="chat-attachment-info">
                  <div className="chat-attachment-name">{selectedFile.name}</div>
                  <div className="chat-attachment-size">{selectedFile.size}</div>
                </div>
                <button className="chat-attachment-close" onClick={handleRemoveFile} title="Quitar archivo">
                  ✕
                </button>
              </div>
            )}

            {/* Selector interactivo de Emojis */}
            {emojiPickerOpen && (
              <div className="emoji-picker-container" ref={emojiPickerRef}>
                <div className="emoji-picker-header">Seleccionar Emoji</div>
                <div className="emoji-picker-body">
                  {EMOJIS_CATEGORIES.map(cat => (
                    <div key={cat.name}>
                      <div className="emoji-category-title">{cat.name}</div>
                      <div className="emoji-grid">
                        {cat.emojis.map((em, idx) => (
                          <button
                            key={idx}
                            type="button"
                            className="emoji-btn"
                            onClick={() => handleInsertEmoji(em)}
                          >
                            {em}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Input de archivo oculto para el botón de clip */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              style={{ display: 'none' }}
              accept="image/*,.pdf,.doc,.docx"
            />

            {/* Barra de entrada de texto */}
            <div className="chat-input-bar">
              <button
                type="button"
                className={`chat-input-icon-btn ${emojiPickerOpen ? 'active' : ''}`}
                onClick={() => setEmojiPickerOpen(o => !o)}
                title="Emojis"
              >
                😊
              </button>
              <button
                type="button"
                className="chat-input-icon-btn"
                onClick={() => fileInputRef.current?.click()}
                title="Adjuntar documento o imagen"
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
                </svg>
              </button>
              <input
                ref={chatInputRef}
                className="chat-input"
                placeholder={isUploading ? "Subiendo archivo..." : "Escribe un mensaje..."}
                value={inputText}
                disabled={isUploading}
                onChange={e => setInputText(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
              />
              <button
                className="chat-send-btn"
                onClick={() => handleSendMessage()}
                disabled={isUploading}
                title={isUploading ? "Enviando..." : "Enviar mensaje"}
              >
                {isUploading ? (
                  <span style={{ fontSize: '12px' }}>⏳</span>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                  </svg>
                )}
              </button>
            </div>
          </>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--muted)', flexDirection: 'column', gap: '12px' }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.3 }}>
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            <span>Selecciona una conversación para ver los mensajes</span>
          </div>
        )}
      </div>

      {/* ── MODAL PLANTILLAS DE WHATSAPP (según captura MB Suite) ── */}
      {plantillasModalOpen && (
        <div className="modal-backdrop" onClick={() => setPlantillasModalOpen(false)}>
          <div className="modal-card modal-plantillas" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Plantillas de WhatsApp</h3>
              <button className="modal-close-btn" onClick={() => setPlantillasModalOpen(false)}>✕</button>
            </div>

            {/* Buscador de plantillas */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
              <div className="search-box" style={{ flex: 1 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                <input
                  style={{ width: '100%' }}
                  placeholder="Buscar plantilla..."
                  value={plantillasSearchQuery}
                  onChange={e => setPlantillasSearchQuery(e.target.value)}
                />
              </div>
              <button
                className="btn-secondary"
                style={{ padding: '8px 12px' }}
                onClick={() => setPlantillasSearchQuery('')}
                title="Refrescar lista"
              >
                🔄
              </button>
            </div>

            {/* Lista de plantillas */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '420px', overflowY: 'auto', paddingRight: '4px' }}>
              {plantillas
                .filter(p => !plantillasSearchQuery.trim() || p.nombre.toLowerCase().includes(plantillasSearchQuery.toLowerCase()) || p.texto.toLowerCase().includes(plantillasSearchQuery.toLowerCase()))
                .map(pl => (
                  <div key={pl.id} className="plantilla-item">
                    <div style={{ fontSize: '20px', lineHeight: 1, marginTop: '2px' }}>📄</div>
                    <div className="plantilla-info">
                      <div className="plantilla-top">
                        <span className="plantilla-nombre">{pl.nombre}</span>
                        <span className={`plantilla-tag ${pl.categoria === 'MARKETING' ? 'marketing' : ''}`}>
                          {pl.categoria}
                        </span>
                      </div>
                      <div className="plantilla-text">{pl.texto}</div>
                    </div>
                    <div className="plantilla-actions">
                      <button
                        className="plantilla-send-btn"
                        onClick={() => handleUsarPlantilla(pl)}
                        title="Enviar esta plantilla al chat"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
              <button
                className="btn-secondary"
                style={{ fontSize: '12px' }}
                onClick={() => alert('Próximamente: configuración y sincronización de plantillas Meta Cloud API')}
              >
                ⚙️ Gestionar plantillas
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL NUEVO CONTACTO / CHAT ── */}
      {nuevoModalOpen && (
        <div className="modal-backdrop" onClick={() => setNuevoModalOpen(false)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">+ Iniciar conversación de WhatsApp</h3>
              <button className="modal-close-btn" onClick={() => setNuevoModalOpen(false)}>✕</button>
            </div>
            <form onSubmit={handleCrearChat} className="modal-body">
              <div className="modal-field">
                <label>Nombre del contacto</label>
                <input
                  required
                  placeholder="Ej: Carlos Domínguez"
                  value={nuevoContacto.nombre}
                  onChange={e => setNuevoContacto({ ...nuevoContacto, nombre: e.target.value })}
                />
              </div>

              <div className="modal-field">
                <label>Número de WhatsApp</label>
                <input
                  required
                  placeholder="Ej: +1 555-0199"
                  value={nuevoContacto.numero}
                  onChange={e => setNuevoContacto({ ...nuevoContacto, numero: e.target.value })}
                />
              </div>

              <div className="modal-field">
                <label>Vendedor responsable</label>
                <select
                  value={nuevoContacto.vendedor}
                  onChange={e => setNuevoContacto({ ...nuevoContacto, vendedor: e.target.value })}
                >
                  {VENDEDORES_CRM.map(v => (
                    <option key={v.id} value={v.nombre}>{v.nombre}</option>
                  ))}
                </select>
              </div>

              <div className="modal-field">
                <label>Etiqueta inicial</label>
                <select
                  value={nuevoContacto.tag}
                  onChange={e => setNuevoContacto({ ...nuevoContacto, tag: e.target.value })}
                >
                  {etiquetas.map(et => (
                    <option key={et.id} value={et.nombre}>{et.nombre}</option>
                  ))}
                </select>
              </div>

              <div className="modal-field">
                <label>Primer mensaje (opcional)</label>
                <textarea
                  rows="2"
                  placeholder="Escribe el primer mensaje para enviar..."
                  value={nuevoContacto.primerMensaje}
                  onChange={e => setNuevoContacto({ ...nuevoContacto, primerMensaje: e.target.value })}
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setNuevoModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn-primary">Iniciar chat</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL GESTIONAR ETIQUETAS ── */}
      {gestionarModalOpen && (
        <div className="modal-backdrop" onClick={() => setGestionarModalOpen(false)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">🏷️ Gestionar Etiquetas</h3>
              <button className="modal-close-btn" onClick={() => setGestionarModalOpen(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto' }}>
                {etiquetas.map(et => (
                  <div key={et.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: 'var(--surface2)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className="tag-dot" style={{ background: et.color }} />
                      <span style={{ fontSize: '13px', fontWeight: 500 }}>{et.nombre}</span>
                    </div>
                    <span style={{ fontSize: '11px', color: 'var(--muted)' }}>
                      {conversaciones.filter(c => c.tags.includes(et.nombre)).length} chats
                    </span>
                  </div>
                ))}
              </div>

              <div className="dropdown-divider" style={{ margin: '8px 0' }} />

              <form onSubmit={handleCrearEtiqueta} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--muted)' }}>Crear nueva etiqueta</div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    required
                    style={{ flex: 1 }}
                    placeholder="Nombre de etiqueta..."
                    value={nuevaEtiqueta.nombre}
                    onChange={e => setNuevaEtiqueta({ ...nuevaEtiqueta, nombre: e.target.value })}
                  />
                  <input
                    type="color"
                    value={nuevaEtiqueta.color}
                    onChange={e => setNuevaEtiqueta({ ...nuevaEtiqueta, color: e.target.value })}
                    style={{ width: '42px', height: '38px', padding: '2px', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '8px', cursor: 'pointer' }}
                    title="Elegir color"
                  />
                </div>
                <div className="modal-actions">
                  <button type="button" className="btn-secondary" onClick={() => setGestionarModalOpen(false)}>Cerrar</button>
                  <button type="submit" className="btn-primary">+ Agregar etiqueta</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
