// ── SOCIAL MEDIA VIEW ── (existing publish UI, without WhatsApp section)
import { useState } from 'react';
import axios from 'axios';

export default function SocialMedia({ token }) {
  const [message, setMessage] = useState('');
  const [image, setImage] = useState(null);
  const [platforms, setPlatforms] = useState({ fb: true, tt: false, ig: false });
  const [status, setStatus] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const handleFiles = (fileList) => {
    if (fileList && fileList.length > 0) setImage(fileList[0]);
  };

  const getSubmitLabel = () => {
    const active = [];
    if (platforms.fb) active.push('FACEBOOK');
    return active.length ? `Publicar en ${active.join(', ')}` : 'Selecciona al menos una plataforma';
  };

  const handleAction = async () => {
    const activePlats = Object.keys(platforms).filter(k => platforms[k]);
    if (activePlats.length === 0) { setStatus({ type: 'error', text: 'Selecciona al menos una plataforma.' }); return; }
    if (!message.trim() && !image) { setStatus({ type: 'error', text: 'Debes incluir al menos un mensaje o una imagen.' }); return; }

    setLoading(true);
    setStatus({ type: 'info', text: 'Publicando ahora mismo...' });
    try {
      const promises = [];
      if (platforms.fb) {
        const formData = new FormData();
        if (message) formData.append('message', message);
        if (image) formData.append('image', image);
        formData.append('target', 'facebook');
        promises.push(axios.post('/api/publish', formData, {
          headers: { 'Content-Type': 'multipart/form-data', 'Authorization': `Bearer ${token}` }
        }));
      }
      const responses = await Promise.all(promises);
      if (responses.every(r => r.data.success)) {
        setStatus({ type: 'success', text: '¡Publicado con éxito!' });
        setMessage(''); setImage(null);
      } else {
        setStatus({ type: 'error', text: 'Hubo un error al publicar.' });
      }
    } catch (error) {
      const errorMsg = error.response?.data?.error || error.response?.data?.details || 'Error de conexión.';
      setStatus({ type: 'error', text: typeof errorMsg === 'object' ? JSON.stringify(errorMsg) : errorMsg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="view-container social-media-view">
      <div className="view-header">
        <div className="view-header-left">
          <div className="view-title-icon">📣</div>
          <div>
            <h1 className="view-title">Publica en todas tus redes</h1>
            <p className="view-subtitle">Sube tus archivos, escribe tu mensaje y publica en Facebook, TikTok e Instagram al mismo tiempo.</p>
          </div>
        </div>
      </div>

      {/* Estado de los Bots */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div className="section-label">🤖 Estado de los Bots</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px' }}>
          {[
            { key: 'fb', label: 'Facebook', color: '#1877f2', char: 'f', connected: true },
            { key: 'tt', label: 'TikTok', color: '#666', char: 't', connected: false },
            { key: 'ig', label: 'Instagram', color: '#666', char: 'i', connected: false },
          ].map(pl => (
            <div key={pl.key} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: 'var(--surface2)', borderRadius: '10px', opacity: pl.connected ? 1 : 0.5 }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: pl.color + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', color: pl.color, fontSize: '16px', fontWeight: '700' }}>{pl.char}</div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: '600' }}>{pl.label}</div>
                <div style={{ fontSize: '11px', color: pl.connected ? '#25c460' : 'var(--accent2)' }}>{pl.connected ? '✓ Conectado' : 'Próximamente'}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Paso 1: Plataformas */}
      <div className="section-label">Paso 1 — Elige las plataformas</div>
      <div className="platforms">
        <button type="button" className={`plat-btn ${platforms.fb ? 'active-fb' : ''}`} onClick={() => setPlatforms(p => ({ ...p, fb: !p.fb }))}>
          <span className="icon">
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
          </span>
          Facebook
        </button>
        <div className="tooltip-container" style={{ flex: 1, minWidth: '160px' }}>
          <button type="button" className="plat-btn" disabled style={{ width: '100%' }}>
            <span className="icon"><svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg></span>
            TikTok
          </button>
          <span className="tooltip-text">Próximamente</span>
        </div>
        <div className="tooltip-container" style={{ flex: 1, minWidth: '160px' }}>
          <button type="button" className="plat-btn" disabled style={{ width: '100%' }}>
            <span className="icon"><svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg></span>
            Instagram
          </button>
          <span className="tooltip-text">Próximamente</span>
        </div>
      </div>

      {/* Paso 2: Archivos */}
      <div className="card">
        <div className="section-label">Paso 2 — Sube tu archivo de imagen</div>
        <div className={`upload-zone ${dragOver ? 'dragover' : ''}`}
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={e => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}>
          <input type="file" id="file-input" accept="image/*" onChange={e => handleFiles(e.target.files)} />
          <div className="upload-icon">📁</div>
          <div className="upload-title">Arrastra aquí o haz clic para subir</div>
          <div className="upload-sub">Formatos soportados: JPG, PNG, GIF, WEBP</div>
          <div className="file-types">
            <span className="file-tag">JPG</span><span className="file-tag">PNG</span>
            <span className="file-tag">GIF</span><span className="file-tag">WEBP</span>
          </div>
        </div>
        {image && (
          <div id="preview-list">
            <div className="preview-item">
              <img className="preview-thumb" src={URL.createObjectURL(image)} alt={image.name} />
              <div className="preview-info">
                <div className="preview-name">{image.name}</div>
                <div className="preview-size">{(image.size / (1024 * 1024)).toFixed(2)} MB · Imagen</div>
                <div className="plat-tags">
                  {platforms.fb && <span className="plat-tag tag-fb">Facebook</span>}
                </div>
              </div>
              <button type="button" className="preview-remove" onClick={() => setImage(null)}>×</button>
            </div>
          </div>
        )}
      </div>

      {/* Paso 3: Mensaje */}
      <div className="card">
        <div className="section-label">Paso 3 — Escribe tu mensaje</div>
        <textarea className="msg-box" maxLength="2200"
          placeholder="Escribe el texto que acompañará tu publicación..."
          value={message} onChange={e => setMessage(e.target.value)} />
        <div className="char-count"><span>{message.length}</span> / 2200 caracteres</div>
      </div>

      <button className="submit-btn" id="publish-btn" disabled={loading} onClick={handleAction}>
        <span className="btn-inner">
          <div className={`spinner ${loading ? 'show' : ''}`} />
          <span>{loading ? 'Procesando...' : getSubmitLabel()}</span>
        </span>
      </button>

      {status.text && (
        <div id="status-area" className="show">
          <div className="section-label" style={{ marginTop: '24px' }}>Estado de la Solicitud</div>
          <div className="status-card">
            <div className="status-row">
              <div className={`status-pill ${status.type === 'success' ? 'pill-ok' : status.type === 'info' ? 'pill-loading' : 'pill-err'}`}>
                {status.type === 'success' ? '✓ Éxito' : status.type === 'info' ? 'En proceso' : '✗ Error'}
              </div>
              <div className="status-info" style={{ marginLeft: '12px' }}>
                <div className="status-msg" style={{ fontSize: '13px', color: 'var(--text)' }}>{status.text}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
