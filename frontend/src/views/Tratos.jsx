// ── TRATOS VIEW ──
const tratos = [
  { id: 1, title: 'Bustos - Almacenaje + f...', etapa: 'Negociación', valor: 'USD 14.000', resp: 'Diego Paranas', empresa: 'Patagonia Seafood', persona: 'Marina Bustos', cierre: '31/8/2026', prob: '50%' },
  { id: 2, title: 'Vega - Flete aéreo expresa', etapa: 'Cerrado ✓', valor: 'USD 25.000', resp: 'Valentina Ríos', empresa: 'Sara Textiles', persona: 'Camila Vega', cierre: '15/8/2026', prob: '25%' },
  { id: 3, title: 'Díaz - Almacenaje - Fuli...', etapa: 'Lead nuevo', valor: 'USD 1.800', resp: 'Laura Jiménez', empresa: 'Tecnar Distribución', persona: 'Mateo Díaz', cierre: '22/8/2026', prob: '0%', tags: ['Mañana', 'Activo'] },
  { id: 4, title: 'Ramón - Flete marítimo...', etapa: 'Negociación', valor: 'USD 3.500', resp: 'Diego Paranas', empresa: 'Patagonia Seafood', persona: 'Julieta Ramón', cierre: '11/8/2026', prob: '54%' },
  { id: 5, title: 'Vega - Seguro de camiones...', etapa: 'Cerrado ✓', valor: 'USD 28.000', resp: 'Diego Paranas', empresa: 'Sara Textiles', persona: 'Sierra Textiles', cierre: '11/9/2026', prob: '21%' },
  { id: 6, title: 'López - Almacenaje + fu...', etapa: 'Negociación', valor: 'USD 15.000', resp: 'Lía — Saller Comer...', empresa: 'Andex Trading Co.', persona: 'Ramiro López', cierre: '31/8/2026', prob: '37%', tags: ['Activo'] },
  { id: 7, title: 'Quiroga - Flete marítimo...', etapa: 'Propuesta enviada', valor: 'USD 6.000', resp: 'Condillos Wines', empresa: 'Condillos Wines', persona: 'Evan Quiroga', cierre: '21/8/2026', prob: '22%' },
  { id: 8, title: 'Bustos - Flete marítimo...', etapa: 'Negociación', valor: 'USD 21.000', resp: 'Sara Navara', empresa: 'Patagonia Seafood', persona: 'Marina Bustos', cierre: '31/8/2026', prob: '79%' },
];

const etapaColor = {
  'Negociación': { bg: '#ff6b9d20', color: '#ff6b9d' },
  'Cerrado ✓': { bg: '#25c46020', color: '#25c460' },
  'Lead nuevo': { bg: '#7c6dff20', color: '#7c6dff' },
  'Propuesta enviada': { bg: '#f59e0b20', color: '#f59e0b' },
};

export default function Tratos() {
  return (
    <div className="view-container">
      <div className="view-header">
        <div className="view-header-left">
          <div className="view-title-icon">🤝</div>
          <div>
            <h1 className="view-title">Tratos</h1>
            <p className="view-subtitle">Gestiona todos los tratos en una planilla editable.</p>
          </div>
        </div>
        <div className="view-header-actions">
          <button className="btn-secondary">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            Importar
          </button>
          <button className="btn-secondary">↑ Exportar CSV</button>
          <button className="btn-primary">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Crear trato
          </button>
        </div>
      </div>

      <div className="table-filters">
        <div className="filter-group">
          <button className="filter-pill active">Abiertos ▾</button>
          <button className="filter-pill">Pipeline: Pipeline principal ▾</button>
          <div className="search-box">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <input placeholder="Buscar..." />
          </div>
          <button className="filter-pill">Filtros ▾</button>
        </div>
      </div>

      <div className="crm-table-wrap">
        <table className="crm-table">
          <thead>
            <tr>
              <th><input type="checkbox" /></th>
              <th>TÍTULO</th>
              <th>ETAPA</th>
              <th>VALOR</th>
              <th>RESPONSABLE</th>
              <th>EMPRESA</th>
              <th>PERSONA</th>
              <th>CIERRE ESP.</th>
              <th>PROBAB.</th>
              <th>ETIQUETAS</th>
            </tr>
          </thead>
          <tbody>
            {tratos.map(t => (
              <tr key={t.id} className="crm-row">
                <td><input type="checkbox" /></td>
                <td className="row-title">{t.title}</td>
                <td>
                  <span className="estado-tag" style={etapaColor[t.etapa] || { bg: '#66666620', color: '#666' }}>
                    {t.etapa}
                  </span>
                </td>
                <td className="row-valor">{t.valor}</td>
                <td>
                  <div className="row-persona">
                    <div className="mini-avatar">{t.resp[0]}</div>
                    <span className="persona-name">{t.resp}</span>
                  </div>
                </td>
                <td className="row-empresa">{t.empresa}</td>
                <td className="persona-name">{t.persona}</td>
                <td className="row-date">{t.cierre}</td>
                <td className="row-prob">{t.prob}</td>
                <td>
                  {(t.tags || []).map(tag => (
                    <span key={tag} className="tag-chip">{tag}</span>
                  ))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="table-footer">
        <span>Mostrar <select><option>20</option><option>50</option></select></span>
        <span className="table-count">Mostrando 1-12 de 12</span>
      </div>
    </div>
  );
}
