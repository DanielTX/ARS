// ── MENSAJES VIEW (WhatsApp Inbox style - Full CRM Implementation) ──
import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import {
  findPersonaForContact,
  getStoredPersonas,
  saveStoredPersonas,
  getTratosForPersona,
  getStoredTratos,
  saveStoredTratos
} from '../data/crmData';

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
  const [listHeaderMenuOpen, setListHeaderMenuOpen] = useState(false);

  // Modo de selección de chats
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedChatIds, setSelectedChatIds] = useState([]);

  // Paneles laterales derechos: 'info' | 'detalles' | null
  const [rightPanel, setRightPanel] = useState(null);
  const contactInfoOpen = rightPanel === 'info';
  const detallesOpen = rightPanel === 'detalles';
  const setContactInfoOpen = (val) => {
    if (typeof val === 'function') {
      setRightPanel(prev => val(prev === 'info') ? 'info' : null);
    } else {
      setRightPanel(val ? 'info' : null);
    }
  };
  const [contactSubView, setContactSubView] = useState('main'); // 'main' | 'archivos'
  const [contactFilesTab, setContactFilesTab] = useState('multimedia'); // 'multimedia' | 'documentos' | 'enlaces'

  // Modales de integración CRM (Personas y Tratos)
  const [editDetallesModalOpen, setEditDetallesModalOpen] = useState(false);
  const [crearTratoModalOpen, setCrearTratoModalOpen] = useState(false);
  const [personaEditForm, setPersonaEditForm] = useState({ cargo: '', email: '', telefono: '', empresa: '', pais: '' });
  const [nuevoTratoForm, setNuevoTratoForm] = useState({ title: '', valor: '', etapa: 'Negociación', prob: '50%', cierre: '30/11/2026' });

  // Menú contextual y chevron de mensaje
  const [messageContextMenu, setMessageContextMenu] = useState({ visible: false, x: 0, y: 0, message: null });
  const [messageInfoModal, setMessageInfoModal] = useState({ open: false, message: null });

  // Mensaje flotante de notificación (Toast)
  const [toastMessage, setToastMessage] = useState('');
  const toastTimeoutRef = useRef(null);
  const showToast = (text) => {
    setToastMessage(text);
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage('');
    }, 2400);
  };

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
  const listHeaderMenuRef = useRef(null);
  const contextMenuRef = useRef(null);

  // Cerrar dropdowns, context menu y emoji picker al hacer click afuera
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
      if (listHeaderMenuRef.current && !listHeaderMenuRef.current.contains(e.target)) {
        setListHeaderMenuOpen(false);
      }
      if (contextMenuRef.current && !contextMenuRef.current.contains(e.target)) {
        setMessageContextMenu({ visible: false, x: 0, y: 0, message: null });
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
    if (selectionMode) {
      setSelectedChatIds(prev => 
        prev.includes(chatId) ? prev.filter(id => id !== chatId) : [...prev, chatId]
      );
      return;
    }
    setSelectedId(chatId);
    try {
      localStorage.setItem('ap_selected_chat', String(chatId));
    } catch {}
    markAsRead(chatId);
  };

  // Abrir menú contextual de mensaje
  const openMessageMenu = (msg, clientX, clientY) => {
    const x = Math.max(12, Math.min(clientX, window.innerWidth - 220));
    const y = Math.max(12, Math.min(clientY, window.innerHeight - 280));
    setMessageContextMenu({ visible: true, x, y, message: msg });
  };

  // Copiar texto o enlace de un mensaje
  const handleCopiarMensaje = (msg) => {
    const textToCopy = msg.text || msg.mediaUrl || '';
    if (navigator.clipboard) {
      navigator.clipboard.writeText(textToCopy);
    }
    showToast('Mensaje copiado al portapapeles');
    setMessageContextMenu({ visible: false, x: 0, y: 0, message: null });
  };

  // Fijar / Desfijar mensaje dentro del chat
  const handleFijarMensaje = (msg) => {
    const newPinned = !msg.pinned;
    setConversaciones(prev => prev.map(c => {
      if (c.id !== selectedId) return c;
      return {
        ...c,
        messages: (c.messages || []).map(m => m.id === msg.id ? { ...m, pinned: newPinned } : m)
      };
    }));
    const token = localStorage.getItem('ap_token');
    if (token && msg.id) {
      axios.post('/api/whatsapp/message-meta', { messageId: msg.id, fields: { pinned: newPinned } }, {
        headers: { Authorization: `Bearer ${token}` }
      }).catch(() => {});
    }
    showToast(newPinned ? '📌 Mensaje fijado en el chat' : 'Mensaje desfijado');
    setMessageContextMenu({ visible: false, x: 0, y: 0, message: null });
  };

  // Destacar / Quitar de destacados un mensaje
  const handleDestacarMensaje = (msg) => {
    const newDestacado = !msg.destacado;
    setConversaciones(prev => prev.map(c => {
      if (c.id !== selectedId) return c;
      return {
        ...c,
        messages: (c.messages || []).map(m => m.id === msg.id ? { ...m, destacado: newDestacado } : m)
      };
    }));
    const token = localStorage.getItem('ap_token');
    if (token && msg.id) {
      axios.post('/api/whatsapp/message-meta', { messageId: msg.id, fields: { destacado: newDestacado } }, {
        headers: { Authorization: `Bearer ${token}` }
      }).catch(() => {});
    }
    showToast(newDestacado ? '⭐ Mensaje destacado' : 'Mensaje quitado de destacados');
    setMessageContextMenu({ visible: false, x: 0, y: 0, message: null });
  };

  // Descargar archivo o imagen adjunta
  const handleDescargarAdjunto = (msg) => {
    if (!msg.mediaUrl) return;
    const a = document.createElement('a');
    a.href = msg.mediaUrl;
    a.download = msg.mediaFilename || (msg.mediaType === 'image' ? 'imagen_whatsapp.jpg' : 'archivo_whatsapp');
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast('Descargando archivo adjunto...');
    setMessageContextMenu({ visible: false, x: 0, y: 0, message: null });
  };

  // Eliminar un mensaje del chat
  const handleEliminarMensaje = (msg) => {
    if (!window.confirm('¿Deseas eliminar este mensaje?')) return;
    setConversaciones(prev => prev.map(c => {
      if (c.id !== selectedId) return c;
      return {
        ...c,
        messages: (c.messages || []).filter(m => m.id !== msg.id)
      };
    }));
    const token = localStorage.getItem('ap_token');
    if (token && msg.id) {
      axios.post('/api/whatsapp/message-delete', { messageId: msg.id }, {
        headers: { Authorization: `Bearer ${token}` }
      }).catch(() => {});
    }
    showToast('Mensaje eliminado');
    setMessageContextMenu({ visible: false, x: 0, y: 0, message: null });
  };

  // Alternar chat en Favoritos
  const handleToggleFavoritoChat = () => {
    if (!activeChat) return;
    const newFav = !activeChat.favorito;
    setConversaciones(prev => prev.map(c => c.id === activeChat.id ? { ...c, favorito: newFav } : c));
    saveChatMeta(activeChat.id, { favorito: newFav });
    showToast(newFav ? '⭐ Añadido a favoritos' : 'Quitado de favoritos');
  };

  // Exportar chat completo a .txt
  const handleExportarChat = () => {
    if (!activeChat) return;
    const lines = [
      `=====================================================`,
      `HISTORIAL DE CONVERSACIÓN DE WHATSAPP`,
      `Contacto: ${activeChat.nombre}`,
      `Número: ${activeChat.numero}`,
      `Exportado: ${new Date().toLocaleString('es-PE')}`,
      `=====================================================\n`
    ];
    (activeChat.messages || []).forEach(m => {
      const sender = m.from === 'me' ? (m.vendedor || 'Tú') : activeChat.nombre;
      const time = m.time || '';
      const content = m.text || (m.mediaUrl ? `[Adjunto: ${m.mediaFilename || m.mediaType}] (${m.mediaUrl})` : '');
      lines.push(`[${time}] ${sender}: ${content}`);
    });
    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Chat_${activeChat.nombre.replace(/[^a-zA-Z0-9_-]/g, '_')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Chat exportado en archivo .txt');
  };

  // Vaciar mensajes del chat (conservando el chat)
  const handleVaciarChat = () => {
    if (!activeChat) return;
    if (!window.confirm(`¿Estás seguro de vaciar todos los mensajes con "${activeChat.nombre}"? Los mensajes se borrarán, pero el contacto permanecerá.`)) return;
    setConversaciones(prev => prev.map(c => c.id === activeChat.id ? { ...c, messages: [], preview: '' } : c));
    const token = localStorage.getItem('ap_token');
    if (token) {
      axios.post('/api/whatsapp/chat-clear', { chatId: activeChat.id }, {
        headers: { Authorization: `Bearer ${token}` }
      }).catch(() => {});
    }
    showToast('Mensajes del chat vaciados');
  };

  // Eliminar chat por completo (mensajes y conversación)
  const handleEliminarChat = () => {
    if (!activeChat) return;
    if (!window.confirm(`¿Estás seguro de ELIMINAR por completo el chat con "${activeChat.nombre}" y todos sus mensajes? Esta acción no se puede deshacer.`)) return;
    const chatIdToDelete = activeChat.id;
    setConversaciones(prev => prev.filter(c => c.id !== chatIdToDelete));
    setSelectedId(null);
    setContactInfoOpen(false);
    try { localStorage.removeItem('ap_selected_chat'); } catch {}
    const token = localStorage.getItem('ap_token');
    if (token) {
      axios.post('/api/whatsapp/chat-delete', { chatId: chatIdToDelete }, {
        headers: { Authorization: `Bearer ${token}` }
      }).catch(() => {});
    }
    showToast('Chat eliminado por completo');
  };

  // Marcar todos los chats como leídos
  const handleMarcarTodoLeido = () => {
    setConversaciones(prev => prev.map(c => ({ ...c, unread: 0 })));
    conversaciones.forEach(c => {
      if (c.unread > 0) markAsRead(c.id);
    });
    setListHeaderMenuOpen(false);
    showToast('Todos los chats marcados como leídos');
  };

  // Eliminar chats seleccionados en modo selección
  const handleEliminarChatsSeleccionados = () => {
    if (selectedChatIds.length === 0) return;
    if (!window.confirm(`¿Eliminar los ${selectedChatIds.length} chats seleccionados?`)) return;
    const idsToDelete = [...selectedChatIds];
    setConversaciones(prev => prev.filter(c => !idsToDelete.includes(c.id)));
    if (idsToDelete.includes(selectedId)) {
      setSelectedId(null);
      try { localStorage.removeItem('ap_selected_chat'); } catch {}
    }
    setSelectedChatIds([]);
    setSelectionMode(false);
    const token = localStorage.getItem('ap_token');
    if (token) {
      idsToDelete.forEach(id => {
        axios.post('/api/whatsapp/chat-delete', { chatId: id }, {
          headers: { Authorization: `Bearer ${token}` }
        }).catch(() => {});
      });
    }
    showToast(`${idsToDelete.length} chats eliminados`);
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

  // Persona y tratos vinculados a la conversación activa
  const [crmPersonasVersion, setCrmPersonasVersion] = useState(0);
  const [crmTratosVersion, setCrmTratosVersion] = useState(0);

  useEffect(() => {
    const onPUpdate = () => setCrmPersonasVersion(v => v + 1);
    const onTUpdate = () => setCrmTratosVersion(v => v + 1);
    window.addEventListener('crm_personas_updated', onPUpdate);
    window.addEventListener('crm_tratos_updated', onTUpdate);
    return () => {
      window.removeEventListener('crm_personas_updated', onPUpdate);
      window.removeEventListener('crm_tratos_updated', onTUpdate);
    };
  }, []);

  const linkedPersona = activeChat ? findPersonaForContact(activeChat.nombre, activeChat.numero) : null;
  const linkedTratos = activeChat ? getTratosForPersona(activeChat.nombre) : [];

  const handleOpenEditPersona = () => {
    if (!linkedPersona) return;
    setPersonaEditForm({
      cargo: linkedPersona.cargo || '',
      email: linkedPersona.email || '',
      telefono: linkedPersona.telefono || activeChat?.numero || '',
      empresa: linkedPersona.empresa || '',
      pais: linkedPersona.pais || 'Perú'
    });
    setEditDetallesModalOpen(true);
  };

  const handleSavePersona = (e) => {
    e.preventDefault();
    if (!linkedPersona) return;
    const all = getStoredPersonas();
    const idx = all.findIndex(p => p.id === linkedPersona.id || p.nombre.toLowerCase() === linkedPersona.nombre.toLowerCase());
    const updated = {
      ...linkedPersona,
      ...personaEditForm
    };
    let newList;
    if (idx >= 0) {
      newList = [...all];
      newList[idx] = updated;
    } else {
      newList = [updated, ...all];
    }
    saveStoredPersonas(newList);
    setEditDetallesModalOpen(false);
    showToast('Detalles guardados y sincronizados con Personas');
  };

  const handleSaveNuevoTrato = (e) => {
    e.preventDefault();
    if (!activeChat) return;
    const allTratos = getStoredTratos();
    const newTrato = {
      id: Date.now(),
      title: nuevoTratoForm.title || `${activeChat.nombre} — Nuevo Trato`,
      valor: nuevoTratoForm.valor || 'USD 1.500',
      etapa: nuevoTratoForm.etapa || 'Negociación',
      prob: nuevoTratoForm.prob || '50%',
      cierre: nuevoTratoForm.cierre || '30/11/2026',
      resp: activeChat.vendedores[0] || 'Marcos Ferreyra',
      empresa: linkedPersona?.empresa || 'Andex Trading Co.',
      persona: activeChat.nombre
    };
    saveStoredTratos([newTrato, ...allTratos]);
    setCrearTratoModalOpen(false);
    setNuevoTratoForm({ title: '', valor: '', etapa: 'Negociación', prob: '50%', cierre: '30/11/2026' });
    showToast('Trato creado y sincronizado con Tratos');
  };

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

  // Listas de archivos, documentos y enlaces para el panel de Info. del contacto
  const mediaList = activeChat?.messages ? activeChat.messages.filter(m => m.mediaType === 'image' && m.mediaUrl) : [];
  const docsList = activeChat?.messages ? activeChat.messages.filter(m => m.mediaType === 'document' && m.mediaUrl) : [];
  const linksList = [];
  if (activeChat?.messages) {
    activeChat.messages.forEach(m => {
      if (m.text) {
        const urls = m.text.match(/(https?:\/\/[^\s]+)/g);
        if (urls) {
          urls.forEach(u => linksList.push({ url: u, time: m.time }));
        }
      }
    });
  }
  const totalArchivosCount = mediaList.length + docsList.length + linksList.length;
  const lastThreeMedia = mediaList.slice(-3).reverse();
  const starredMessages = activeChat?.messages ? activeChat.messages.filter(m => m.destacado) : [];

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
            
            {/* Botón de 3 puntos con menú desplegable (MB Suite) */}
            <div className="filter-dropdown-wrap" ref={listHeaderMenuRef} style={{ position: 'relative' }}>
              <button
                className="topbar-icon-btn"
                style={{ width: '28px', height: '28px', padding: '0', background: listHeaderMenuOpen ? 'var(--surface2)' : 'transparent' }}
                title="Opciones de mensajes"
                onClick={() => setListHeaderMenuOpen(o => !o)}
              >
                ⋯
              </button>
              {listHeaderMenuOpen && (
                <div className="list-header-dropdown">
                  <button
                    className="dropdown-item"
                    onClick={() => {
                      setListHeaderMenuOpen(false);
                      setSelectionMode(prev => !prev);
                      setSelectedChatIds([]);
                    }}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="2"/><path d="m9 12 2 2 4-4"/>
                    </svg>
                    {selectionMode ? 'Cancelar selección' : 'Seleccionar chats'}
                  </button>
                  <button className="dropdown-item" onClick={handleMarcarTodoLeido}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 6 7 17l-5-5"/><path d="m22 10-7.5 7.5L13 16"/>
                    </svg>
                    Marcar todo como leído
                  </button>
                  <button
                    className="dropdown-item"
                    onClick={() => {
                      setListHeaderMenuOpen(false);
                      setPlantillasModalOpen(true);
                    }}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
                    </svg>
                    Gestionar plantillas
                  </button>
                  <button
                    className="dropdown-item"
                    onClick={() => {
                      setListHeaderMenuOpen(false);
                      setGestionarModalOpen(true);
                    }}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z"/><circle cx="7" cy="7" r=".5" fill="currentColor"/>
                    </svg>
                    Gestionar etiquetas
                  </button>
                </div>
              )}
            </div>
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

        {/* Barra de acción cuando el modo de selección de chats está activo */}
        {selectionMode && (
          <div className="selection-mode-bar">
            <span>{selectedChatIds.length} seleccionados</span>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                className="btn-danger-mini"
                disabled={selectedChatIds.length === 0}
                onClick={handleEliminarChatsSeleccionados}
                title="Eliminar chats seleccionados"
              >
                Eliminar ({selectedChatIds.length})
              </button>
              <button
                className="btn-secondary-mini"
                onClick={() => { setSelectionMode(false); setSelectedChatIds([]); }}
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

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
                  {/* Checkbox para modo selección */}
                  {selectionMode && (
                    <input
                      type="checkbox"
                      checked={selectedChatIds.includes(c.id)}
                      onChange={() => handleSelectChat(c.id)}
                      onClick={e => e.stopPropagation()}
                      style={{ marginRight: '6px', cursor: 'pointer', accentColor: 'var(--accent)', alignSelf: 'center' }}
                    />
                  )}

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
                        {c.favorito && <span style={{ fontSize: '11px', color: '#fbbf24' }} title="Favorito">⭐</span>}
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
              <div
                className="chat-header-contact-clickable"
                onClick={() => setContactInfoOpen(o => !o)}
                title="Ver Info. del contacto"
              >
                <div className="conv-avatar" style={{ width: '40px', height: '40px', fontSize: '14px', background: getAvatarColor(activeChat.id), position: 'relative' }}>
                  {activeChat.initials}
                  {activeChat.fijado && <span style={{ position: 'absolute', bottom: '-2px', right: '-2px', fontSize: '10px' }}>📌</span>}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '15px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {activeChat.nombre}
                    {activeChat.favorito && <span style={{ fontSize: '12px', color: '#fbbf24' }} title="Favorito">⭐</span>}
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

                      {/* 3. Etiquetar chat (con submenú interactivo al hacer clic) */}
                      <div className="menu-submenu-wrap">
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
                  {/* Banner de mensaje fijado (si existe alguno) */}
                  {activeChat.messages?.some(m => m.pinned) && (
                    <div className="pinned-message-bar">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                        <span style={{ fontSize: '13px' }}>📌</span>
                        <div style={{ fontSize: '12px', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {activeChat.messages.find(m => m.pinned)?.text || 'Mensaje fijado'}
                        </div>
                      </div>
                      <span style={{ fontSize: '11px', color: 'var(--muted)', flexShrink: 0 }}>Fijado</span>
                    </div>
                  )}

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
                        <div
                          className={`chat-bubble ${m.from === 'me' ? 'bubble-me' : 'bubble-them'}`}
                          onContextMenu={(e) => {
                            e.preventDefault();
                            openMessageMenu(m, e.clientX, e.clientY);
                          }}
                        >
                          {/* Botón de mayor/menor (Chevron WhatsApp) en la esquina superior derecha al pasar el mouse */}
                          <button
                            className="bubble-chevron-btn"
                            title="Opciones del mensaje"
                            onClick={(e) => {
                              e.stopPropagation();
                              const rect = e.currentTarget.getBoundingClientRect();
                              openMessageMenu(m, rect.left, rect.bottom + 4);
                            }}
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="6 9 12 15 18 9"/>
                            </svg>
                          </button>

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
                          <span className="bubble-time">
                            {m.pinned && <span style={{ marginRight: '3px', fontSize: '10px' }} title="Fijado">📌</span>}
                            {m.destacado && <span style={{ marginRight: '3px', fontSize: '10px', color: '#fbbf24' }} title="Destacado">⭐</span>}
                            {m.time}
                          </span>
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

      {/* ── PANEL DERECHO: INFO. DEL CONTACTO (WhatsApp Web & MB Suite CRM) ── */}
      {contactInfoOpen && activeChat && (
        <div className="contact-info-panel">
          {contactSubView === 'main' ? (
            <>
              {/* Header principal */}
              <div className="contact-panel-header" style={{ justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <button
                    className="contact-panel-close-btn"
                    onClick={() => setContactInfoOpen(false)}
                    title="Cerrar info del contacto"
                  >
                    ✕
                  </button>
                  <span className="contact-panel-title">Info. del contacto</span>
                </div>

                {/* Botón Detalles dentro de la barra lateral al lado de Info. del contacto */}
                <button
                  className="contact-panel-detalles-btn"
                  onClick={() => setRightPanel('detalles')}
                  title="Ver Detalles"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/>
                  </svg>
                  <span>Detalles</span>
                </button>
              </div>

              <div className="contact-panel-scroll">
                {/* 1. Foto, Nombre y Teléfono */}
                <div className="contact-panel-profile">
                  <div
                    className="contact-panel-avatar"
                    style={{ background: getAvatarColor(activeChat.id) }}
                  >
                    {activeChat.initials}
                  </div>
                  <div className="contact-panel-name">{activeChat.nombre}</div>
                  <div className="contact-panel-phone">{activeChat.numero}</div>
                  {activeChat.vendedores.length > 0 && (
                    <div className="contact-panel-vendor">
                      <span>👤 {activeChat.vendedores.join(', ')}</span>
                    </div>
                  )}
                </div>

                <div className="contact-panel-divider" />

                {/* 6. BOTÓN: ARCHIVOS, ENLACES Y DOCUMENTOS (Con vista previa de los últimos 3 multimedia abajo) */}
                <div className="contact-panel-section">
                  <button
                    className="contact-panel-nav-btn"
                    onClick={() => setContactSubView('archivos')}
                    title="Ver todos los archivos, enlaces y documentos"
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                      </svg>
                      <span style={{ fontWeight: 600, fontSize: '13px' }}>Archivos, enlaces y documentos</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span className="contact-badge">{totalArchivosCount}</span>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="9 18 15 12 9 6"/>
                      </svg>
                    </div>
                  </button>

                  {/* Vista previa predeterminada de los últimos 3 multimedia enviados */}
                  <div className="contact-preview-three-row">
                    {lastThreeMedia.length > 0 ? (
                      lastThreeMedia.map((m, idx) => (
                        <div
                          key={idx}
                          className="contact-preview-three-item"
                          onClick={() => setContactSubView('archivos')}
                          title="Haga clic para ver en multimedia"
                        >
                          <img src={m.mediaUrl} alt="Multimedia reciente" />
                        </div>
                      ))
                    ) : (
                      <>
                        <div className="contact-preview-three-placeholder" onClick={() => setContactSubView('archivos')}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>
                        </div>
                        <div className="contact-preview-three-placeholder" onClick={() => setContactSubView('archivos')}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>
                        </div>
                        <div className="contact-preview-three-placeholder" onClick={() => setContactSubView('archivos')}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="contact-panel-divider" />

                {/* 7. MENSAJES DESTACADOS (Icono SVG elegante) */}
                <div className="contact-panel-section">
                  <div className="contact-panel-section-title">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                      </svg>
                      <span>Mensajes destacados</span>
                    </div>
                    <span className="contact-badge">{starredMessages.length}</span>
                  </div>
                  {starredMessages.length > 0 ? (
                    <div className="contact-starred-list">
                      {starredMessages.map(sm => (
                        <div key={sm.id} className="contact-starred-item">
                          <div className="contact-starred-text">
                            {sm.text || (sm.mediaUrl ? `[${sm.mediaFilename || sm.mediaType || 'Archivo'}]` : '')}
                          </div>
                          <div className="contact-starred-meta">
                            <span>{sm.time} · {sm.from === 'me' ? 'Tú' : activeChat.nombre}</span>
                            <button
                              onClick={() => handleDestacarMensaje(sm)}
                              className="contact-unstar-btn"
                              title="Quitar de destacados"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="contact-empty">No hay mensajes destacados</div>
                  )}
                </div>

                <div className="contact-panel-divider" />

                {/* 8. ACCIONES FINALES DEL CONTACTO (Iconos SVG elegantes - sin emojis) */}
                <div className="contact-panel-actions">
                  <button className="contact-action-btn" onClick={handleToggleFavoritoChat}>
                    <svg className="contact-action-svg" width="16" height="16" viewBox="0 0 24 24" fill={activeChat.favorito ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                    </svg>
                    <span>{activeChat.favorito ? 'Quitar de favoritos' : 'Añadir a favoritos'}</span>
                  </button>

                  <button className="contact-action-btn" onClick={handleExportarChat}>
                    <svg className="contact-action-svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                    </svg>
                    <span>Exportar chat</span>
                  </button>

                  <button className="contact-action-btn warning" onClick={handleVaciarChat}>
                    <svg className="contact-action-svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/>
                    </svg>
                    <span>Vaciar chat</span>
                  </button>

                  <button className="contact-action-btn danger" onClick={handleEliminarChat}>
                    <svg className="contact-action-svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                    </svg>
                    <span>Eliminar chat</span>
                  </button>
                </div>
              </div>
            </>
          ) : (
            /* ── SUB-APARTADO: ARCHIVOS, ENLACES Y DOCUMENTOS (Con navegación atrás) ── */
            <>
              <div className="contact-panel-header">
                <button
                  className="contact-panel-back-btn"
                  onClick={() => setContactSubView('main')}
                  title="Volver a Info. del contacto"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
                  </svg>
                </button>
                <span className="contact-panel-title">Archivos, enlaces y docs.</span>
              </div>

              {/* Pestañas superiores para filtrar */}
              <div className="contact-subpanel-tabs">
                <button
                  className={`contact-subpanel-tab ${contactFilesTab === 'multimedia' ? 'active' : ''}`}
                  onClick={() => setContactFilesTab('multimedia')}
                >
                  Archivos multimedia
                </button>
                <button
                  className={`contact-subpanel-tab ${contactFilesTab === 'documentos' ? 'active' : ''}`}
                  onClick={() => setContactFilesTab('documentos')}
                >
                  Documentos
                </button>
                <button
                  className={`contact-subpanel-tab ${contactFilesTab === 'enlaces' ? 'active' : ''}`}
                  onClick={() => setContactFilesTab('enlaces')}
                >
                  Enlaces
                </button>
              </div>

              <div className="contact-panel-scroll" style={{ padding: '16px' }}>
                {contactFilesTab === 'multimedia' && (
                  mediaList.length > 0 ? (
                    <div>
                      <div className="contact-media-subheading">ESTE MES</div>
                      <div className="contact-media-grid">
                        {mediaList.map((m, idx) => (
                          <a key={idx} href={m.mediaUrl} target="_blank" rel="noreferrer" className="contact-media-thumb" title="Ver imagen">
                            <img src={m.mediaUrl} alt="Multimedia" />
                          </a>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="contact-empty" style={{ paddingTop: '60px' }}>
                      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ opacity: 0.35, marginBottom: '8px' }}>
                        <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/>
                      </svg>
                      <div>No hay archivos multimedia compartidos</div>
                    </div>
                  )
                )}

                {contactFilesTab === 'documentos' && (
                  docsList.length > 0 ? (
                    <div className="contact-docs-list">
                      {docsList.map((d, idx) => (
                        <a key={idx} href={d.mediaUrl} target="_blank" rel="noreferrer" className="contact-doc-item" title="Descargar documento">
                          <span className="contact-doc-icon">📄</span>
                          <div className="contact-doc-info">
                            <span className="contact-doc-name">{d.mediaFilename || 'Documento adjunto'}</span>
                            <span className="contact-doc-date">{d.time}</span>
                          </div>
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                        </a>
                      ))}
                    </div>
                  ) : (
                    <div className="contact-empty" style={{ paddingTop: '60px' }}>
                      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ opacity: 0.35, marginBottom: '8px' }}>
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                      </svg>
                      <div>No hay documentos compartidos</div>
                    </div>
                  )
                )}

                {contactFilesTab === 'enlaces' && (
                  linksList.length > 0 ? (
                    <div className="contact-links-list">
                      {linksList.map((l, idx) => (
                        <a key={idx} href={l.url} target="_blank" rel="noreferrer" className="contact-link-item" title="Abrir enlace">
                          <span className="contact-link-icon">🔗</span>
                          <div className="contact-link-info">
                            <span className="contact-link-url">{l.url}</span>
                            <span className="contact-link-time">{l.time}</span>
                          </div>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>
                        </a>
                      ))}
                    </div>
                  ) : (
                    <div className="contact-empty" style={{ paddingTop: '60px' }}>
                      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ opacity: 0.35, marginBottom: '8px' }}>
                        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                      </svg>
                      <div>No hay enlaces compartidos</div>
                    </div>
                  )
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* ── PANEL DERECHO: DETALLES (Detalles, Responsable, Tratos y Actividad) ── */}
      {rightPanel === 'detalles' && activeChat && (
        <div className="contact-info-panel">
          <div className="contact-panel-header">
            <button
              className="contact-panel-back-btn"
              onClick={() => setRightPanel('info')}
              title="Volver a Info. del contacto"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
              </svg>
            </button>
            <span className="contact-panel-title">Detalles</span>
          </div>

          <div className="contact-panel-scroll">
            {/* 1. RECUADRO: DETALLES (Conectado con la tabla de PERSONAS) */}
            <div className="contact-panel-section">
              <div className="contact-panel-section-title">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                  </svg>
                  <span>Detalles</span>
                </div>
                <button
                  className="contact-card-action-btn"
                  onClick={handleOpenEditPersona}
                  title="Editar detalles del contacto"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
                  </svg>
                  <span>Editar</span>
                </button>
              </div>

              <div className="contact-details-box">
                <div className="contact-detail-row">
                  <span className="contact-detail-label">Cargo / Rol:</span>
                  <span className="contact-detail-val">{linkedPersona?.cargo || 'Gerente Comercial'}</span>
                </div>
                <div className="contact-detail-row">
                  <span className="contact-detail-label">Email:</span>
                  <span className="contact-detail-val">{linkedPersona?.email || '—'}</span>
                </div>
                <div className="contact-detail-row">
                  <span className="contact-detail-label">Teléfono:</span>
                  <span className="contact-detail-val">{linkedPersona?.telefono || activeChat.numero}</span>
                </div>
                <div className="contact-detail-row">
                  <span className="contact-detail-label">Empresa:</span>
                  <span className="contact-detail-val" style={{ color: 'var(--accent)', fontWeight: 600 }}>
                    {linkedPersona?.empresa || 'Andex Trading Co.'}
                  </span>
                </div>
                <div className="contact-detail-row">
                  <span className="contact-detail-label">País / Región:</span>
                  <span className="contact-detail-val">{linkedPersona?.pais || 'Perú'}</span>
                </div>
              </div>
            </div>

            <div className="contact-panel-divider" />

            {/* 2. RECUADRO: RESPONSABLE */}
            <div className="contact-panel-section">
              <div className="contact-panel-section-title">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="7" r="4"/><path d="M5.5 21a8.5 8.5 0 0 1 13 0"/>
                  </svg>
                  <span>Responsable</span>
                </div>
              </div>
              <div className="contact-responsible-card">
                <div className="contact-responsible-avatar">
                  {(activeChat.vendedores[0] || 'Marcos Ferreyra').split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)' }}>
                    {activeChat.vendedores[0] || 'Marcos Ferreyra'}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--muted)' }}>
                    {(activeChat.vendedores[0] || 'Marcos Ferreyra').toLowerCase().replace(/\s+/g, '.')}@ars-soluciones.com
                  </div>
                </div>
              </div>
            </div>

            <div className="contact-panel-divider" />

            {/* 3. RECUADRO: TRATOS (Conectado con la tabla de TRATOS) */}
            <div className="contact-panel-section">
              <div className="contact-panel-section-title">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                  </svg>
                  <span>Tratos ({linkedTratos.length})</span>
                </div>
                <button
                  className="contact-card-action-btn"
                  onClick={() => setCrearTratoModalOpen(true)}
                  title="Agregar trato a este contacto"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                  <span>Crear</span>
                </button>
              </div>

              <div className="contact-tratos-list">
                {linkedTratos.length > 0 ? (
                  linkedTratos.map(t => (
                    <div key={t.id} className="contact-trato-card">
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span className="contact-trato-tag">
                          ● {t.etapa.toUpperCase()}
                        </span>
                        <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--accent)' }}>
                          {t.prob || '50%'}
                        </span>
                      </div>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {t.title}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '6px', fontSize: '12px' }}>
                        <span style={{ fontWeight: 700, color: '#10b981' }}>{t.valor}</span>
                        <span style={{ fontSize: '10px', color: 'var(--muted)' }}>Cierre: {t.cierre || '30/11/2026'}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="contact-empty">No hay tratos asociados</div>
                )}
              </div>
            </div>

            <div className="contact-panel-divider" />

            {/* 4. RECUADRO: ACTIVIDAD / ÚLTIMA ACTIVIDAD */}
            <div className="contact-panel-section">
              <div className="contact-panel-section-title">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                  </svg>
                  <span>Actividad</span>
                </div>
              </div>
              <div className="contact-activity-box">
                <div className="contact-activity-row">
                  <span style={{ color: 'var(--muted)' }}>Primer contacto:</span>
                  <span>hace 10 meses (20/06/2026)</span>
                </div>
                <div className="contact-activity-row">
                  <span style={{ color: 'var(--muted)' }}>Última actividad:</span>
                  <span style={{ color: '#25d366', fontWeight: 500 }}>
                    {activeChat.messages && activeChat.messages.length > 0
                      ? `Hoy a las ${activeChat.messages[activeChat.messages.length - 1].time}`
                      : 'Hoy'}
                  </span>
                </div>
                <div className="contact-activity-row">
                  <span style={{ color: 'var(--muted)' }}>Canal de origen:</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#25d366', fontWeight: 600 }}>
                    <span style={{ fontSize: '10px' }}>●</span> WhatsApp Business API
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── MENÚ CONTEXTUAL DE MENSAJE (Clic derecho y Chevron) ── */}
      {messageContextMenu.visible && messageContextMenu.message && (
        <div
          ref={contextMenuRef}
          className="bubble-context-menu"
          style={{ top: messageContextMenu.y, left: messageContextMenu.x }}
        >
          <button
            className="context-menu-item"
            onClick={() => {
              setMessageInfoModal({ open: true, message: messageContextMenu.message });
              setMessageContextMenu({ visible: false, x: 0, y: 0, message: null });
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
            </svg>
            Info. del mensaje
          </button>

          <button
            className="context-menu-item"
            onClick={() => handleCopiarMensaje(messageContextMenu.message)}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
            </svg>
            Copiar
          </button>

          <button
            className="context-menu-item"
            onClick={() => handleFijarMensaje(messageContextMenu.message)}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="17" x2="12" y2="22"/><path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z"/>
            </svg>
            {messageContextMenu.message.pinned ? 'Desfijar' : 'Fijar'}
          </button>

          <button
            className="context-menu-item"
            onClick={() => handleDestacarMensaje(messageContextMenu.message)}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
            {messageContextMenu.message.destacado ? 'Quitar de destacados' : 'Destacar'}
          </button>

          {/* Opción de DESCARGAR exclusivamente para imágenes o documentos */}
          {(messageContextMenu.message.mediaType === 'image' || messageContextMenu.message.mediaType === 'document' || messageContextMenu.message.mediaUrl) && (
            <button
              className="context-menu-item"
              onClick={() => handleDescargarAdjunto(messageContextMenu.message)}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              Descargar
            </button>
          )}

          <div className="dropdown-divider" style={{ margin: '4px 0' }} />

          <button
            className="context-menu-item danger"
            onClick={() => handleEliminarMensaje(messageContextMenu.message)}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            </svg>
            Eliminar
          </button>
        </div>
      )}

      {/* ── MODAL: INFO. DEL MENSAJE ── */}
      {messageInfoModal.open && messageInfoModal.message && (
        <div className="modal-backdrop" onClick={() => setMessageInfoModal({ open: false, message: null })}>
          <div className="modal-card" style={{ maxWidth: '420px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">ℹ️ Info. del mensaje</h3>
              <button className="modal-close-btn" onClick={() => setMessageInfoModal({ open: false, message: null })}>✕</button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ padding: '12px', background: 'var(--surface2)', borderRadius: '10px', fontSize: '13px' }}>
                {messageInfoModal.message.text || (messageInfoModal.message.mediaFilename ? `Adjunto: ${messageInfoModal.message.mediaFilename}` : 'Contenido multimedia')}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '6px' }}>
                  <span style={{ color: 'var(--muted)' }}>Remitente:</span>
                  <span style={{ fontWeight: 600 }}>{messageInfoModal.message.from === 'me' ? (messageInfoModal.message.vendedor || 'Tú (CRM)') : activeChat?.nombre}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '6px' }}>
                  <span style={{ color: 'var(--muted)' }}>Hora:</span>
                  <span>{messageInfoModal.message.time}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '6px' }}>
                  <span style={{ color: 'var(--muted)' }}>Estado:</span>
                  <span style={{ color: '#25d366', fontWeight: 600 }}>✓✓ Entregado</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--muted)' }}>Tipo de mensaje:</span>
                  <span style={{ textTransform: 'capitalize' }}>{messageInfoModal.message.mediaType || 'Texto'}</span>
                </div>
              </div>
              <div className="modal-actions" style={{ marginTop: '10px' }}>
                <button className="btn-secondary" onClick={() => setMessageInfoModal({ open: false, message: null })}>Cerrar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TOAST FLOTANTE DE NOTIFICACIÓN ── */}
      {toastMessage && (
        <div className="chat-floating-toast">
          {toastMessage}
        </div>
      )}

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

      {/* ── MODAL EDITAR DETALLES DEL CONTACTO (Conectado con Personas) ── */}
      {editDetallesModalOpen && (
        <div className="modal-backdrop" onClick={() => setEditDetallesModalOpen(false)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Editar detalles del contacto</h3>
              <button className="modal-close-btn" onClick={() => setEditDetallesModalOpen(false)}>✕</button>
            </div>
            <form onSubmit={handleSavePersona} className="modal-body">
              <div className="modal-field">
                <label>Cargo / Rol</label>
                <input
                  placeholder="Ej: Gerente Comercial"
                  value={personaEditForm.cargo}
                  onChange={e => setPersonaEditForm({ ...personaEditForm, cargo: e.target.value })}
                />
              </div>
              <div className="modal-field">
                <label>Email</label>
                <input
                  type="email"
                  placeholder="correo@empresa.com"
                  value={personaEditForm.email}
                  onChange={e => setPersonaEditForm({ ...personaEditForm, email: e.target.value })}
                />
              </div>
              <div className="modal-field">
                <label>Teléfono</label>
                <input
                  placeholder="+51 900 000 000"
                  value={personaEditForm.telefono}
                  onChange={e => setPersonaEditForm({ ...personaEditForm, telefono: e.target.value })}
                />
              </div>
              <div className="modal-field">
                <label>Empresa</label>
                <input
                  placeholder="Nombre de la empresa"
                  value={personaEditForm.empresa}
                  onChange={e => setPersonaEditForm({ ...personaEditForm, empresa: e.target.value })}
                />
              </div>
              <div className="modal-field">
                <label>País / Región</label>
                <input
                  placeholder="Perú"
                  value={personaEditForm.pais}
                  onChange={e => setPersonaEditForm({ ...personaEditForm, pais: e.target.value })}
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setEditDetallesModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn-primary">Guardar cambios</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL CREAR TRATO (Conectado con Tratos) ── */}
      {crearTratoModalOpen && (
        <div className="modal-backdrop" onClick={() => setCrearTratoModalOpen(false)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Crear nuevo trato</h3>
              <button className="modal-close-btn" onClick={() => setCrearTratoModalOpen(false)}>✕</button>
            </div>
            <form onSubmit={handleSaveNuevoTrato} className="modal-body">
              <div className="modal-field">
                <label>Título del trato</label>
                <input
                  required
                  placeholder={activeChat ? `${activeChat.nombre} — Nuevo Trato` : 'Título del trato'}
                  value={nuevoTratoForm.title}
                  onChange={e => setNuevoTratoForm({ ...nuevoTratoForm, title: e.target.value })}
                />
              </div>
              <div className="modal-field">
                <label>Valor estimado</label>
                <input
                  placeholder="Ej: USD 2.500"
                  value={nuevoTratoForm.valor}
                  onChange={e => setNuevoTratoForm({ ...nuevoTratoForm, valor: e.target.value })}
                />
              </div>
              <div className="modal-field">
                <label>Etapa</label>
                <select
                  value={nuevoTratoForm.etapa}
                  onChange={e => setNuevoTratoForm({ ...nuevoTratoForm, etapa: e.target.value })}
                >
                  <option>Lead nuevo</option>
                  <option>Prospecto</option>
                  <option>Propuesta enviada</option>
                  <option>Negociación</option>
                  <option>Cerrado ✓</option>
                </select>
              </div>
              <div className="modal-field">
                <label>Probabilidad</label>
                <select
                  value={nuevoTratoForm.prob}
                  onChange={e => setNuevoTratoForm({ ...nuevoTratoForm, prob: e.target.value })}
                >
                  <option>10%</option>
                  <option>25%</option>
                  <option>50%</option>
                  <option>70%</option>
                  <option>90%</option>
                  <option>100%</option>
                </select>
              </div>
              <div className="modal-field">
                <label>Fecha de cierre estimada</label>
                <input
                  placeholder="30/11/2026"
                  value={nuevoTratoForm.cierre}
                  onChange={e => setNuevoTratoForm({ ...nuevoTratoForm, cierre: e.target.value })}
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setCrearTratoModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn-primary">Crear trato</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
