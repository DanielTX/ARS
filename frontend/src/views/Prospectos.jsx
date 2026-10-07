// ── PROSPECTOS VIEW ──
const prospectos = [
  { id: 1, score: 74, title: 'WhatsApp: Mauro...', persona: 'Mauro Zanetti', email: 'mauro.zanetti@industri...', empresa: '', estado: 'Interesado', canal: 'Manual', source: 'WhatsApp Venta', recibido: '10/27/26', valor: 'USD 3,00' },
  { id: 2, score: 91, title: 'Fuentes - Foter...', persona: 'Camila Fuentes', email: 'camila.fuentes@austral...', empresa: 'Austral Fresh Foods', estado: 'Muy Interesado', canal: 'LinkedIn Ads', source: 'LinkedIn Ads', recibido: '11/7/26', valor: 'USD 4.500,00' },
  { id: 3, score: 88, title: 'WhatsApp: Julieta...', persona: 'Julieta Barranca', email: 'julieta.barranca@datos-vi...', empresa: '', estado: 'Sin estado', canal: 'Google Ads', source: 'WhatsApp Venta', recibido: '11/7/26', valor: 'USD 22.00' },
  { id: 4, score: 74, title: 'Salazar - Consul...', persona: 'Hernán Salazar', email: 'hernán.salazar@de-valle-au...', empresa: 'Del Valle Autopartes', estado: 'Interesado', canal: 'Meta Ads', source: 'Meta Ads', recibido: '11/7/26', valor: 'USD 1.500,00' },
  { id: 5, score: 62, title: 'WhatsApp: Cara D...', persona: 'Cara Domínguez', email: 'cara.dominguez@echenda-l...', empresa: '', estado: 'Sin estado', canal: 'Meta Ads', source: 'WhatsApp Venta', recibido: '11/7/26', valor: 'USD 3,00' },
  { id: 6, score: 88, title: 'Benítez - Prayec...', persona: 'Luca Benítez', email: 'luca.benitez@kunza-mineral...', empresa: 'Kunza Minerals', estado: 'Muy Interesado', canal: 'Manual', source: 'Referencia', recibido: '9/7/25', valor: 'USD 5.600,00' },
  { id: 7, score: 55, title: 'WhatsApp: Rocío F...', persona: 'Rocío Ferrer', email: 'rocio.ferrer@marina-seafod...', empresa: '', estado: 'Sin estado', canal: 'WhatsApp', source: 'WhatsApp Venta', recibido: '9/7/25', valor: 'USD 3,00' },
  { id: 8, score: 62, title: 'Acosta - Flota ad...', persona: 'Horencia Acosta', email: 'horencia.acosta@lumen-ele...', empresa: 'Lumen Eléctrico', estado: 'Interesado', canal: 'TikTok Ads', source: 'TikTok Ads', recibido: '9/7/25', valor: 'USD 800,00' },
];

const estadoColor = {
  'Interesado': '#7c6dff',
  'Muy Interesado': '#25c460',
  'Sin estado': '#666',
};

export default function Prospectos() {
  return (
    <div className="view-container">
      <div className="view-header">
        <div className="view-header-left">
          <div className="view-title-icon">📥</div>
          <div>
            <h1 className="view-title">Buzón de prospectos</h1>
            <p className="view-subtitle">Revise los prospectos entrantes antes de convertirlos en tratos.</p>
          </div>
        </div>
        <div className="view-header-actions">
          <button className="btn-secondary">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            Importar
          </button>
          <button className="btn-primary">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Crear prospecto
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="table-filters">
        <div className="filter-group">
          <button className="filter-pill active">Activos ▾</button>
          <div className="search-box">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <input placeholder="Buscar..." />
          </div>
          <button className="filter-pill">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/></svg>
            Todos
          </button>
          <button className="filter-pill">Filtros ▾</button>
        </div>
      </div>

      {/* Table */}
      <div className="crm-table-wrap">
        <table className="crm-table">
          <thead>
            <tr>
              <th><input type="checkbox" /></th>
              <th>SCO...</th>
              <th>TÍTULO</th>
              <th>PERSONA</th>
              <th>EMPRESA</th>
              <th>ESTADO</th>
              <th>CANAL</th>
              <th>LEAD SOURCE</th>
              <th>RECIBIDO ↓</th>
              <th>VALOR</th>
            </tr>
          </thead>
          <tbody>
            {prospectos.map(p => (
              <tr key={p.id} className="crm-row">
                <td><input type="checkbox" /></td>
                <td>
                  <div className="score-badge" style={{ background: p.score >= 80 ? '#25c46020' : '#7c6dff20', color: p.score >= 80 ? '#25c460' : '#7c6dff' }}>
                    {p.score}
                  </div>
                </td>
                <td className="row-title">{p.title}</td>
                <td>
                  <div className="row-persona">
                    <div className="mini-avatar">{p.persona[0]}</div>
                    <div>
                      <div className="persona-name">{p.persona}</div>
                      <div className="persona-email">{p.email}</div>
                    </div>
                  </div>
                </td>
                <td className="row-empresa">{p.empresa || <span style={{ color: '#444' }}>—</span>}</td>
                <td>
                  {p.estado !== 'Sin estado' ? (
                    <span className="estado-tag" style={{ background: estadoColor[p.estado] + '20', color: estadoColor[p.estado] }}>
                      + {p.estado}
                    </span>
                  ) : <span style={{ color: '#444' }}>+ Sin estado</span>}
                </td>
                <td className="row-canal">{p.canal}</td>
                <td className="row-source">{p.source}</td>
                <td className="row-date">{p.recibido}</td>
                <td className="row-valor">{p.valor}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="table-footer">
        <span>Mostrar <select><option>30</option><option>50</option><option>100</option></select></span>
        <span className="table-count">Mostrando 1-8 de 8</span>
      </div>
    </div>
  );
}
