// ── MENSAJES VIEW (WhatsApp Inbox style) ──
import { useState } from 'react';

const conversaciones = [
  { id: 1, initials: 'MZ', nombre: 'Mauro Zanetti', numero: '+1 333-333-0342', preview: 'Marcos', fecha: '28/09/26', unread: 0, tags: [] },
  { id: 2, initials: 'TL', nombre: 'Tomás López', numero: '+1 333-333-0342', preview: '¿Cómo lo resolvemos?', fecha: '20/06/26', unread: 2, tags: ['Soporte'] },
  { id: 3, initials: 'RL', nombre: 'Ramiro López', numero: '+1 333-333-0342', preview: 'Lo necesito para la semana que viene', fecha: '20/06/26', unread: 0, tags: ['Nuevo lead'] },
  { id: 4, initials: 'BM', nombre: 'Benjamín Moli...', numero: '+1 333-333-0342', preview: '¡Avisa! Cuando eso estamos por acc...', fecha: '18/06/26', unread: 0, tags: ['Nuevo Activo'] },
  { id: 5, initials: 'ER', nombre: 'Emilio Ramos', numero: '+1 847-554-3545', preview: 'Lista, agenda a las 13hs 🗓', fecha: '17/06/26', unread: 1, tags: ['Caliente'] },
  { id: 6, initials: 'TC', nombre: 'Tomás Castro', numero: '+1 847-554-3545', preview: 'También 100 unidas, que sane 2hs. Te pa...', fecha: '16/06/26', unread: 0, tags: ['Descartado'] },
  { id: 7, initials: 'RR', nombre: 'Renata Ruiz', numero: '+1 262-333-2012', preview: 'Genial. Si, estás abierto. Gracias!', fecha: '16/06/26', unread: 0, tags: [] },
];

const mensajes = [
  { id: 1, from: 'contact', text: '¡Llegó con un palét dañado 😢', time: '17:51' },
  { id: 2, from: 'me', text: 'Hola, tuve un problema con la última entrega', time: '18:24' },
  { id: 3, from: 'contact', text: '¿Cómo lo resolvemos?', time: '19:06' },
];

export default function Mensajes() {
  const [selected, setSelected] = useState(conversaciones[1]);
  const [input, setInput] = useState('');
  const [tab, setTab] = useState('todos');

  const tagColor = { 'Soporte': '#7c6dff', 'Nuevo lead': '#f59e0b', 'Nuevo Activo': '#25c460', 'Caliente': '#ef4444', 'Descartado': '#6b7280' };

  return (
    <div className="mensajes-layout">
      {/* LEFT: Conversation list */}
      <div className="mensajes-list">
        <div className="mensajes-list-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            <span style={{ fontWeight: 700, fontSize: '15px' }}>Mensajes</span>
          </div>
          <div style={{ display: 'flex', gap: '6px' }}>
            <div style={{ padding: '4px 10px', background: '#25d36620', color: '#25d366', borderRadius: '100px', fontSize: '12px', fontWeight: 600 }}>WhatsApp ▾</div>
            <button style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', padding: '4px' }}>⋯</button>
          </div>
        </div>

        <div className="mensajes-search">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input placeholder="Buscar..." />
          <button style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: '12px' }}>+ Nuevo</button>
        </div>

        <div className="mensajes-tabs">
          {['Todos', 'No leídos', 'Archivados'].map(t => (
            <button key={t} className={`mensajes-tab ${tab === t.toLowerCase().replace(' ', '') ? 'active' : ''}`} onClick={() => setTab(t.toLowerCase().replace(' ', ''))}>
              {t}
            </button>
          ))}
        </div>

        <div className="mensajes-filters">
          <button className="filter-mini">↓ Vendedor ▾</button>
          <button className="filter-mini">+ Etiquetas ▾</button>
        </div>

        <div className="conv-list">
          {conversaciones.map(c => (
            <div
              key={c.id}
              className={`conv-item ${selected?.id === c.id ? 'conv-selected' : ''}`}
              onClick={() => setSelected(c)}
            >
              <div className="conv-avatar" style={{ background: `hsl(${c.id * 50}, 55%, 35%)` }}>{c.initials}</div>
              <div className="conv-body">
                <div className="conv-top">
                  <span className="conv-name">{c.nombre}</span>
                  <span className="conv-date">{c.fecha}</span>
                </div>
                <div className="conv-num">{c.numero}</div>
                <div className="conv-footer-row">
                  <span className="conv-preview">{c.preview}</span>
                  {c.unread > 0 && <span className="conv-badge">{c.unread}</span>}
                </div>
                {c.tags.length > 0 && (
                  <div style={{ marginTop: '4px' }}>
                    {c.tags.map(tag => (
                      <span key={tag} className="tag-chip" style={{ fontSize: '10px', background: (tagColor[tag] || '#666') + '22', color: tagColor[tag] || '#aaa' }}>{tag}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT: Chat window */}
      <div className="mensajes-chat">
        {selected ? (
          <>
            <div className="chat-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div className="conv-avatar" style={{ width: '36px', height: '36px', fontSize: '13px', background: `hsl(${selected.id * 50}, 55%, 35%)` }}>{selected.initials}</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '14px' }}>{selected.nombre}</div>
                  <div style={{ fontSize: '12px', color: 'var(--muted)' }}>
                    {selected.numero} &nbsp;·&nbsp; 
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: 'middle' }}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    &nbsp;Laura Giménez
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button className="topbar-icon-btn"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg></button>
                <button className="topbar-icon-btn"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg></button>
                <button className="topbar-icon-btn"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg></button>
              </div>
            </div>

            <div className="chat-messages">
              <div className="chat-date-divider">20 de junio de 2026</div>
              {mensajes.map(m => (
                <div key={m.id} className={`chat-bubble-wrap ${m.from === 'me' ? 'from-me' : 'from-them'}`}>
                  <div className={`chat-bubble ${m.from === 'me' ? 'bubble-me' : 'bubble-them'}`}>
                    {m.text}
                    <span className="bubble-time">{m.time}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="chat-input-bar">
              <button className="chat-input-icon-btn" title="Emoji">😊</button>
              <button className="chat-input-icon-btn" title="Adjuntar">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
              </button>
              <input
                className="chat-input"
                placeholder="Escribe un mensaje..."
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && setInput('')}
              />
              <button className="chat-send-btn" onClick={() => setInput('')}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
              </button>
            </div>
          </>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--muted)', flexDirection: 'column', gap: '12px' }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.3 }}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            <span>Selecciona una conversación</span>
          </div>
        )}
      </div>
    </div>
  );
}
