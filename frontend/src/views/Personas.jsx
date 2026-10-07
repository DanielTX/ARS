// ── PERSONAS VIEW ──
const personas = [
  { id: 1, nombre: 'Agustina Vidal', email: 'agustina.vidal@llventino', telefono: '', cargo: 'Fundadora', empresa: 'Sector Cinco Décor', resp: 'Sofia Navara', tags: ['Mañana'], act: '—' },
  { id: 2, nombre: 'André Castro', email: 'andrea.castro@avacen.e...', telefono: '+1(555) 771 4515', cargo: 'Coordinación de Pr...', empresa: 'Norvet Agr Químico', resp: 'Valentina Ríos', tags: ['Mañana', 'Carne'], act: '—' },
  { id: 3, nombre: 'Antonella Roz', email: 'antonella.roz@conditi-m...', telefono: '', cargo: 'Responsable de Im...', empresa: 'Nordika Importa Srl', resp: 'Sofia Navara', tags: [], act: '—' },
  { id: 4, nombre: 'Benjamín Molina', email: 'benjamin.molina@atlema...', telefono: '+1(555) 445 7765', cargo: 'Responsable de Co...', empresa: 'AtleMar Logística Fer...', resp: 'Mariana Ferreyre', tags: ['Manzana', 'Distribu...'], act: '—' },
  { id: 5, nombre: 'Bianca Ferrero', email: 'bianca.ferrero@lumen-e...', telefono: '', cargo: 'Directora de Come...', empresa: 'Lumen Eléctrico Arsa', resp: 'Valentina Ríos', tags: [], act: '—' },
  { id: 6, nombre: 'Camila Fuentes', email: 'camila.fuentes@austral-f...', telefono: '', cargo: 'Jefa de Comanda...', empresa: 'Austral Fresh Foods', resp: 'Sofia Navara', tags: [], act: '—' },
  { id: 7, nombre: 'Cara Domínguez', email: 'cara.dominguez@dif...', telefono: '+1(555) 553-007', cargo: 'Directora de Opera...', empresa: '', resp: 'Mariana Ferreyre', tags: [], act: '—' },
  { id: 8, nombre: 'Carolina Nuñez', email: 'carolina.nuñez@proceso-...', telefono: '', cargo: 'Directora Comercial', empresa: 'Pro Clave Cosmética', resp: 'Valentina Ríos', tags: [], act: '—' },
  { id: 9, nombre: 'Diego Herrera', email: 'diego.herrea@clenoyda...', telefono: '', cargo: 'Analista', empresa: 'Blanco & Cía Textil', resp: 'Valentina Ríos', tags: [], act: '—' },
  { id: 10, nombre: 'Elena Quiroga', email: 'elena.quiroga@condlure...', telefono: '', cargo: 'Gerenta de Opera...', empresa: 'Condillos Wines', resp: 'Laura Giménez', tags: [], act: '—' },
  { id: 11, nombre: 'Emilio Ramos', email: 'emilio.ramos@para-textil...', telefono: '+1(555) 299-1454', cargo: 'Gerente de Planta', empresa: 'Sara Textiles', resp: 'Valentina Ríos', tags: [], act: '—' },
  { id: 12, nombre: 'Emilio Turco', email: 'emilio.turco@condilore...', telefono: '+1(555) 299-1454', cargo: 'Gerente General', empresa: 'Condillos Wines', resp: 'Laura Giménez', tags: [], act: '—' },
];

export default function Personas() {
  return (
    <div className="view-container">
      <div className="view-header">
        <div className="view-header-left">
          <div className="view-title-icon">👤</div>
          <div>
            <h1 className="view-title">Personas <span className="title-count">{personas.length} personas</span></h1>
            <p className="view-subtitle">Contactos individuales asociados a tus tratos.</p>
          </div>
        </div>
        <div className="view-header-actions">
          <button className="btn-secondary">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            Importar
          </button>
          <button className="btn-primary">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Nueva persona
          </button>
        </div>
      </div>

      <div className="table-filters">
        <div className="filter-group">
          <button className="filter-pill active">Activos ▾</button>
          <div className="search-box">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <input placeholder="Buscar personas..." />
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
              <th>EMAIL</th>
              <th>TELÉFONO</th>
              <th>CARGO</th>
              <th>EMPRESA</th>
              <th>PAÍS</th>
              <th>RESPONSABLE</th>
              <th>ETIQUETAS</th>
              <th>ÚLTIMA ACTIVIDAD</th>
            </tr>
          </thead>
          <tbody>
            {personas.map(p => (
              <tr key={p.id} className="crm-row">
                <td><input type="checkbox" /></td>
                <td>
                  <div className="row-persona">
                    <div className="mini-avatar" style={{ background: `hsl(${p.id * 40}, 60%, 40%)` }}>{p.nombre[0]}</div>
                    <span className="persona-name">{p.nombre}</span>
                  </div>
                </td>
                <td className="row-email">{p.email}</td>
                <td className="row-tel">{p.telefono || '—'}</td>
                <td className="row-cargo">{p.cargo}</td>
                <td>
                  {p.empresa ? (
                    <span className="empresa-link">{p.empresa}</span>
                  ) : <span style={{ color: '#444' }}>—</span>}
                </td>
                <td style={{ color: '#444' }}>—</td>
                <td>
                  <div className="row-persona">
                    <div className="mini-avatar" style={{ fontSize: '10px', background: '#7c6dff30', color: '#7c6dff' }}>{p.resp[0]}</div>
                    <span className="persona-name" style={{ fontSize: '12px' }}>{p.resp}</span>
                  </div>
                </td>
                <td>
                  {p.tags.map(tag => (
                    <span key={tag} className="tag-chip">{tag}</span>
                  ))}
                </td>
                <td className="row-act">{p.act}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="table-footer">
        <span>Mostrar <select><option>20</option><option>50</option><option>70</option></select></span>
        <span className="table-count">Mostrando 1-{personas.length} de 70</span>
      </div>
    </div>
  );
}
