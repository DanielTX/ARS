// ── EMPRESAS VIEW ──
const empresas = [
  { id: 1, nombre: 'AgroSur Servicios', dominio: 'agrosur-serviliss.com', industria: 'Agroindustria —...', pais: '', tamaño: '', resp: 'Sofia Navara', personas: 1, tratos: 0, ganado: 'USD 0,00', tags: [] },
  { id: 2, nombre: 'AtleMar Logística Pannet', dominio: 'atemar-logistice.com', industria: 'Logística — Freig...', pais: '', tamaño: '', resp: 'Sofia Navara', personas: 2, tratos: 1, ganado: 'USD 0,00', tags: [] },
  { id: 3, nombre: 'Andex Trading Co.', dominio: 'andex-trading-co.com', industria: 'Logística — Freig...', pais: '', tamaño: '', resp: 'Valentina Ríos', personas: 1, tratos: 2, ganado: 'USD 23,66', tags: ['Carne'] },
  { id: 4, nombre: 'Austral Fresh Foods', dominio: 'austrafresh.com', industria: 'Alimentos Congel...', pais: '', tamaño: '', resp: 'Sofia Navara', personas: 1, tratos: 0, ganado: 'USD 0,00', tags: [] },
  { id: 5, nombre: 'Bahía Papelera', dominio: 'bahia-papelera.com', industria: 'Papel & insumos ...', pais: '', tamaño: '', resp: 'Sofia Navara', personas: 1, tratos: 0, ganado: 'USD 0,00', tags: [] },
  { id: 6, nombre: 'BioAndex Pharma', dominio: 'bioandex-pharma.com', industria: 'Logística — Freig...', pais: '', tamaño: '', resp: 'Diego Paranas', personas: 1, tratos: 0, ganado: 'USD 23.227', tags: ['Activo'] },
  { id: 7, nombre: 'Blanco & Cía Textil', dominio: 'blancos-text.com', industria: 'Textil — Importa...', pais: '', tamaño: '', resp: 'Sofia Navara', personas: 1, tratos: 0, ganado: 'USD 0,00', tags: [] },
  { id: 8, nombre: 'Condillos Wines', dominio: 'condillor-wines.com', industria: 'Logística — Freig...', pais: '', tamaño: '', resp: 'Laura Giménez', personas: 2, tratos: 0, ganado: 'USD 13.905', tags: [] },
  { id: 9, nombre: 'De Valle Autopartes', dominio: 'devalle-autopart.com', industria: 'Autopartes — Im...', pais: '', tamaño: '', resp: 'Sofia Navara', personas: 1, tratos: 0, ganado: 'USD 0,00', tags: [] },
  { id: 10, nombre: 'Global Foods Imports', dominio: 'global-fonda-imports.com', industria: 'Logística — Freig...', pais: '', tamaño: '', resp: 'Diego Paranas', personas: 2, tratos: 1, ganado: 'USD 35.227', tags: [] },
  { id: 11, nombre: 'Kunza Minerals', dominio: 'kunza-minerals.com', industria: 'Minería — Export...', pais: '', tamaño: '', resp: 'Sofia Navara', personas: 1, tratos: 0, ganado: 'USD 0,00', tags: [] },
  { id: 12, nombre: 'Lineal Agreement', dominio: 'lineal-agreement.com', industria: 'Logística — Freig...', pais: '', tamaño: '', resp: 'Diego Paranas', personas: 2, tratos: 2, ganado: 'USD 0,00', tags: ['2 cambiarlos', 'Mañana'] },
];

export default function Empresas() {
  return (
    <div className="view-container">
      <div className="view-header">
        <div className="view-header-left">
          <div className="view-title-icon">🏢</div>
          <div>
            <h1 className="view-title">Empresas <span className="title-count">{empresas.length} empresas</span></h1>
            <p className="view-subtitle">Clientes y organizaciones con las que trabajas.</p>
          </div>
        </div>
        <div className="view-header-actions">
          <button className="btn-secondary">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            Importar
          </button>
          <button className="btn-primary">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Nueva empresa
          </button>
        </div>
      </div>

      <div className="table-filters">
        <div className="filter-group">
          <button className="filter-pill active">Activos ▾</button>
          <div className="search-box">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <input placeholder="Buscar empresas..." />
          </div>
          <button className="filter-pill">Filtros ▾</button>
        </div>
      </div>

      <div className="crm-table-wrap">
        <table className="crm-table">
          <thead>
            <tr>
              <th><input type="checkbox" /></th>
              <th>NOMBRE ↑</th>
              <th>DOMINIO</th>
              <th>INDUSTRIA</th>
              <th>PAÍS</th>
              <th>TAMAÑO</th>
              <th>RESPONSABLE</th>
              <th>PERSONAS</th>
              <th>TRATOS ABIER.</th>
              <th>GANADO</th>
              <th>ETIQUETAS</th>
            </tr>
          </thead>
          <tbody>
            {empresas.map(e => (
              <tr key={e.id} className="crm-row">
                <td><input type="checkbox" /></td>
                <td>
                  <div className="row-persona">
                    <div className="mini-avatar company-avatar" style={{ borderRadius: '6px', background: `hsl(${e.id * 55}, 50%, 35%)` }}>
                      {e.nombre[0]}
                    </div>
                    <span className="persona-name">{e.nombre}</span>
                  </div>
                </td>
                <td><span className="empresa-link">{e.dominio}</span></td>
                <td className="row-cargo">{e.industria}</td>
                <td style={{ color: '#444' }}>—</td>
                <td style={{ color: '#444' }}>—</td>
                <td>
                  <div className="row-persona">
                    <div className="mini-avatar" style={{ fontSize: '10px', background: '#7c6dff30', color: '#7c6dff' }}>{e.resp[0]}</div>
                    <span className="persona-name" style={{ fontSize: '12px' }}>{e.resp}</span>
                  </div>
                </td>
                <td style={{ textAlign: 'center' }}>{e.personas}</td>
                <td style={{ textAlign: 'center' }}>{e.tratos}</td>
                <td className="row-valor">{e.ganado}</td>
                <td>
                  {e.tags.map(tag => (
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
        <span className="table-count">Mostrando 1-{empresas.length} de 26</span>
      </div>
    </div>
  );
}
