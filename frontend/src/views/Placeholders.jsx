// ── PLACEHOLDER VIEWS ──

export function Pipelines() {
  return (
    <div className="view-container">
      <div className="view-header">
        <div className="view-header-left">
          <div className="view-title-icon">🔀</div>
          <div>
            <h1 className="view-title">Pipelines</h1>
            <p className="view-subtitle">Visualiza el flujo de tus tratos por etapa.</p>
          </div>
        </div>
        <div className="view-header-actions">
          <button className="btn-primary">+ Nuevo pipeline</button>
        </div>
      </div>
      <div className="placeholder-view">
        <div className="placeholder-icon">🔀</div>
        <h2>Vista de Pipelines</h2>
        <p>Próximamente — aquí verás el tablero Kanban con todas las etapas de tus tratos.</p>
      </div>
    </div>
  );
}

export function Calendario() {
  return (
    <div className="view-container">
      <div className="view-header">
        <div className="view-header-left">
          <div className="view-title-icon">📅</div>
          <div>
            <h1 className="view-title">Calendario</h1>
            <p className="view-subtitle">Organiza tus actividades y reuniones.</p>
          </div>
        </div>
        <div className="view-header-actions">
          <button className="btn-primary">+ Nueva actividad</button>
        </div>
      </div>
      <div className="placeholder-view">
        <div className="placeholder-icon">📅</div>
        <h2>Calendario</h2>
        <p>Próximamente — aquí verás tus actividades, reuniones y tareas programadas.</p>
      </div>
    </div>
  );
}

export function Rendimiento() {
  return (
    <div className="view-container">
      <div className="view-header">
        <div className="view-header-left">
          <div className="view-title-icon">📊</div>
          <div>
            <h1 className="view-title">Rendimiento</h1>
            <p className="view-subtitle">Analiza métricas y resultados de tu equipo.</p>
          </div>
        </div>
      </div>
      <div className="placeholder-view">
        <div className="placeholder-icon">📊</div>
        <h2>Dashboard de Rendimiento</h2>
        <p>Próximamente — aquí verás gráficos de ventas, conversión y desempeño del equipo.</p>
      </div>
    </div>
  );
}

export function CRMConfig() {
  return (
    <div className="view-container">
      <div className="view-header">
        <div className="view-header-left">
          <div className="view-title-icon">⚙️</div>
          <div>
            <h1 className="view-title">Configuración CRM</h1>
            <p className="view-subtitle">Personaliza etapas, etiquetas y flujos de trabajo.</p>
          </div>
        </div>
      </div>
      <div className="placeholder-view">
        <div className="placeholder-icon">⚙️</div>
        <h2>Configuración</h2>
        <p>Próximamente — aquí configurarás pipelines, etiquetas, usuarios y permisos.</p>
      </div>
    </div>
  );
}

export function AppConfig() {
  return (
    <div className="view-container">
      <div className="view-header">
        <div className="view-header-left">
          <div className="view-title-icon">🔧</div>
          <div>
            <h1 className="view-title">Configuración General</h1>
            <p className="view-subtitle">Ajustes de la aplicación y preferencias.</p>
          </div>
        </div>
      </div>
      <div className="placeholder-view">
        <div className="placeholder-icon">🔧</div>
        <h2>Configuración General</h2>
        <p>Vista en construcción — próximamente aquí podrás ajustar las preferencias del sistema.</p>
      </div>
    </div>
  );
}
