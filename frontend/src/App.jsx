import { useState, useEffect } from 'react';
import axios from 'axios';
import LoginPage from './LoginPage';

function App() {
  const [message, setMessage] = useState('');
  const [image, setImage] = useState(null);
  const [platforms, setPlatforms] = useState({ fb: true, wsp: false, tt: false, ig: false });
  const [numbers, setNumbers] = useState([]);
  const [wspInput, setWspInput] = useState('');
  
  const [status, setStatus] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  // Auth state
  const [token, setToken] = useState(() => localStorage.getItem('ap_token') || null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const storedToken = localStorage.getItem('ap_token');
    if (!storedToken) {
      setToken(null);
      setAuthChecked(true);
      return;
    }
    // Verify token is still valid with the backend
    axios.get('/api/auth/verify', {
      headers: { Authorization: `Bearer ${storedToken}` }
    }).then(() => {
      setToken(storedToken);
    }).catch(() => {
      localStorage.removeItem('ap_token');
      setToken(null);
    }).finally(() => {
      setAuthChecked(true);
    });
  }, []);

  const handleLogin = (newToken) => {
    setToken(newToken);
  };

  const handleLogout = () => {
    localStorage.removeItem('ap_token');
    setToken(null);
  };

  const handleAction = async () => {
    const activePlats = Object.keys(platforms).filter(k => platforms[k]);
    if (activePlats.length === 0) {
      setStatus({ type: 'error', text: 'Selecciona al menos una plataforma activa (Facebook o WhatsApp).' });
      return;
    }

    if (!message.trim() && !image) {
      setStatus({ type: 'error', text: 'Debes incluir al menos un mensaje o una imagen.' });
      return;
    }

    // Si hay texto en el input de número pero no se presionó "+", lo añadimos automáticamente a la lista a procesar
    let finalNumbers = [...numbers];
    if (platforms.wsp && wspInput.trim()) {
      const val = wspInput.trim();
      if (!finalNumbers.includes(val)) {
        finalNumbers.push(val);
      }
    }

    if (platforms.wsp && finalNumbers.length === 0) {
      setStatus({ type: 'error', text: 'Por favor, añade al menos un número de WhatsApp de destino.' });
      return;
    }

    setLoading(true);
    setStatus({ type: 'info', text: 'Publicando ahora mismo...' });

    try {
      const promises = [];

      // Si Facebook está activo
      if (platforms.fb) {
        const formData = new FormData();
        if (message) formData.append('message', message);
        if (image) formData.append('image', image);
        formData.append('target', 'facebook');

        promises.push(axios.post('/api/publish', formData, {
          headers: { 
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          }
        }));
      }

      // Si WhatsApp está activo
      if (platforms.wsp) {
        for (const num of finalNumbers) {
          const formData = new FormData();
          if (message) formData.append('message', message);
          if (image) formData.append('image', image);
          formData.append('target', 'whatsapp');
          formData.append('whatsappNumber', num);

          promises.push(axios.post('/api/publish', formData, {
            headers: { 
              'Content-Type': 'multipart/form-data',
              'Authorization': `Bearer ${token}`
            }
          }));
        }
      }

      const responses = await Promise.all(promises);
      const allSuccess = responses.every(r => r.data.success);

      if (allSuccess) {
        setStatus({ type: 'success', text: '¡Publicado con éxito!' });
        setMessage('');
        setImage(null);
        setNumbers([]);
        setWspInput('');
      } else {
        setStatus({ type: 'error', text: 'Hubo un error al publicar en el servidor.' });
      }
    } catch (error) {
      const errorMsg = error.response?.data?.error || error.response?.data?.details || 'Error de conexión con el servidor.';
      setStatus({ 
        type: 'error', 
        text: typeof errorMsg === 'object' ? JSON.stringify(errorMsg) : errorMsg
      });
    } finally {
      setLoading(false);
    }
  };

  const addNumber = () => {
    const val = wspInput.trim();
    if (!val) return;
    if (numbers.includes(val)) {
      setWspInput('');
      return;
    }
    setNumbers([...numbers, val]);
    setWspInput('');
  };

  const removeNumber = (num) => {
    setNumbers(numbers.filter(n => n !== num));
  };

  const handleFiles = (fileList) => {
    if (fileList && fileList.length > 0) {
      setImage(fileList[0]);
    }
  };

  const getSubmitLabel = () => {
    const active = [];
    if (platforms.fb) active.push('FACEBOOK');
    if (platforms.wsp) active.push('WHATSAPP');

    return active.length ? `Publicar en ${active.join(', ')}` : 'Selecciona al menos una plataforma';
  };

  // Loading state while verifying token
  if (!authChecked) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner show" style={{ width: '32px', height: '32px', borderWidth: '3px' }} />
      </div>
    );
  }

  // Show login if not authenticated
  if (!token) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div>
      <div className="blob blob1" />
      <div className="blob blob2" />

      {/* Logout button */}
      <button className="logout-btn" onClick={handleLogout} title="Cerrar sesión">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
          <polyline points="16 17 21 12 16 7"/>
          <line x1="21" y1="12" x2="9" y2="12"/>
        </svg>
        Salir
      </button>

      <main>
        <header>
          <div className="logo-badge">
            <span className="logo-dot"></span>
            Sistema de automatización
          </div>
          <h1 className="beta-title">
            Publica en <span>todas tus redes</span><br />desde un solo lugar
          </h1>
          <p className="subtitle">
            Sube tus archivos, escribe tu mensaje y listo — Facebook, TikTok, Instagram y WhatsApp al mismo tiempo.
          </p>
        </header>

        {/* Estado de los Bots */}
        <div className="card" id="bots-card">
          <div className="section-label">🤖 Estado de los Bots</div>
          <div id="bots-status">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: 'var(--surface2)', borderRadius: '10px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#1877f222', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1877f2', fontSize: '18px', fontWeight: '700' }}>f</div>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '600' }}>Facebook</div>
                  <div style={{ fontSize: '12px', color: 'var(--accent3)' }}>✓ Conectado</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: 'var(--surface2)', borderRadius: '10px', opacity: 0.5 }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#66666622', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666', fontSize: '18px', fontWeight: '700' }}>t</div>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '600' }}>TikTok</div>
                  <div style={{ fontSize: '12px', color: 'var(--accent2)' }}>Próximamente</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: 'var(--surface2)', borderRadius: '10px', opacity: 0.5 }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#66666622', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666', fontSize: '18px', fontWeight: '700' }}>i</div>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '600' }}>Instagram</div>
                  <div style={{ fontSize: '12px', color: 'var(--accent2)' }}>Próximamente</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: 'var(--surface2)', borderRadius: '10px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#25d36622', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#25d366', fontSize: '18px', fontWeight: '700' }}>w</div>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '600' }}>WhatsApp</div>
                  <div style={{ fontSize: '12px', color: 'var(--accent3)' }}>✓ Conectado</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Paso 1: Plataformas */}
        <div className="section-label">Paso 1 — Elige las plataformas</div>
        <div className="platforms">
          <button 
            type="button"
            className={`plat-btn ${platforms.fb ? 'active-fb' : ''}`} 
            onClick={() => setPlatforms(p => ({ ...p, fb: !p.fb }))}
          >
            <span className="icon">
              <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            </span>
            Facebook
          </button>
          
          <div className="tooltip-container" style={{ flex: 1, minWidth: '160px' }}>
            <button 
              type="button"
              className="plat-btn" 
              disabled 
              style={{ width: '100%' }}
            >
              <span className="icon">
                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>
              </span>
              TikTok
            </button>
            <span className="tooltip-text">Próximamente</span>
          </div>

          <div className="tooltip-container" style={{ flex: 1, minWidth: '160px' }}>
            <button 
              type="button"
              className="plat-btn" 
              disabled
              style={{ width: '100%' }}
            >
              <span className="icon">
                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              </span>
              Instagram
            </button>
            <span className="tooltip-text">Próximamente</span>
          </div>

          <button 
            type="button"
            className={`plat-btn ${platforms.wsp ? 'active-wsp' : ''}`} 
            onClick={() => setPlatforms(p => ({ ...p, wsp: !p.wsp }))}
          >
            <span className="icon">
              <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            </span>
            WhatsApp
          </button>
        </div>

        {/* Paso 2: Archivos */}
        <div className="card">
          <div className="section-label">Paso 2 — Sube tu archivo de imagen</div>
          <div 
            className={`upload-zone ${dragOver ? 'dragover' : ''}`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
          >
            <input 
              type="file" 
              id="file-input" 
              accept="image/*"
              onChange={(e) => handleFiles(e.target.files)}
            />
            <div className="upload-icon">📁</div>
            <div className="upload-title">Arrastra aquí o haz clic para subir</div>
            <div className="upload-sub">Formatos soportados: JPG, PNG, GIF, WEBP</div>
            <div className="file-types">
              <span className="file-tag">JPG</span>
              <span className="file-tag">PNG</span>
              <span className="file-tag">GIF</span>
              <span className="file-tag">WEBP</span>
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
                    {platforms.wsp && <span className="plat-tag tag-wsp">WhatsApp</span>}
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
          <textarea 
            className="msg-box" 
            maxLength="2200"
            placeholder="Escribe el texto que acompañará tu publicación en todas las plataformas...&#10;&#10;Puedes usar emojis, hashtags, links, etc."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          ></textarea>
          <div className="char-count"><span>{message.length}</span> / 2200 caracteres</div>
        </div>

        {/* Números WhatsApp (solo si WSP activo) */}
        {platforms.wsp && (
          <div id="wsp-section" className="card show">
            <div className="section-label">WhatsApp — Números de destino</div>
            <div className="number-input-row">
              <input 
                type="tel" 
                className="number-input" 
                placeholder="Ej: 5211234567890 (código país, sin +)"
                value={wspInput}
                onChange={(e) => setWspInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addNumber();
                  }
                }}
              />
              <button className="add-btn" type="button" onClick={addNumber}>+</button>
            </div>
            <div id="number-list">
              {numbers.map((num) => (
                <div className="number-chip" key={num}>
                  <span>{num}</span>
                  <button type="button" onClick={() => removeNumber(num)}>×</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Botón Publicar */}
        <button 
          className="submit-btn" 
          id="publish-btn" 
          disabled={loading}
          onClick={handleAction}
        >
          <span className="btn-inner">
            <div className={`spinner ${loading ? 'show' : ''}`} id="spinner"></div>
            <span id="btn-text">{loading ? 'Procesando...' : getSubmitLabel()}</span>
          </span>
        </button>

        {/* Resultados / Status */}
        {status.text && (
          <div id="status-area" className="show">
            <div className="section-label" style={{ marginTop: '24px' }}>Estado de la Solicitud</div>
            <div className="status-card">
              <div className="status-row">
                <div className={`status-pill ${status.type === 'success' ? 'pill-ok' : status.type === 'info' ? 'pill-loading' : 'pill-err'}`}>
                  {status.type === 'success' ? '✓ Éxito' : status.type === 'info' ? 'En proceso' : '✗ Error'}
                </div>
                <div className="status-info" style={{ marginLeft: '12px' }}>
                  <div className="status-msg" style={{ fontSize: '13px', color: 'var(--text)' }}>
                    {status.text}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="main-footer">
          <div className="footer-links">
            <a href="/terms">Términos de Servicio</a>
            <span className="footer-divider">·</span>
            <a href="/privacy">Política de Privacidad</a>
          </div>
          <p>© 2026 Autopost System. Todos los derechos reservados.</p>
        </footer>
      </main>
    </div>
  );
}

export default App;

