import { useState } from 'react';

// ---- Icons ----
const Icon = ({ d, size = 18, stroke = 'currentColor', fill = 'none', strokeWidth = 1.8 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    {Array.isArray(d) ? d.map((path, i) => <path key={i} d={path} />) : <path d={d} />}
  </svg>
);

const icons = {
  prospectos: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75',
  tratos: 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5',
  pipelines: 'M3 3h18v4H3zM3 10h12v4H3zM3 17h8v4H3z',
  personas: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
  empresas: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10',
  mensajes: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z',
  calendario: 'M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z',
  rendimiento: 'M18 20V10M12 20V4M6 20v-6',
  configuracion: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z',
  social: 'M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z M22 6l-10 7L2 6',
  bell: 'M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9 M13.73 21a2 2 0 0 1-3.46 0',
  tasks: 'M9 11l3 3L22 4 M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11',
  user: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
  search: 'M11 17a6 6 0 1 0 0-12 6 6 0 0 0 0 12z M21 21l-4.35-4.35',
  chevronDown: 'M6 9l6 6 6-6',
  logout: 'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4 M16 17l5-5-5-5 M21 12H9',
  menu: 'M3 12h18M3 6h18M3 18h18',
  appConfig: 'M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2z M7 7h.01',
};

const navItems = [
  {
    group: 'CRM',
    items: [
      { id: 'prospectos', label: 'Prospectos', icon: icons.prospectos },
      { id: 'tratos', label: 'Tratos', icon: icons.tratos },
      { id: 'pipelines', label: 'Pipelines', icon: icons.pipelines },
    ]
  },
  {
    group: null,
    items: [
      { id: 'personas', label: 'Personas', icon: icons.personas },
      { id: 'empresas', label: 'Empresas', icon: icons.empresas },
    ]
  },
  {
    group: null,
    items: [
      { id: 'mensajes', label: 'Mensajes', icon: icons.mensajes },
      { id: 'calendario', label: 'Calendario', icon: icons.calendario },
    ]
  },
  {
    group: null,
    items: [
      { id: 'rendimiento', label: 'Rendimiento', icon: icons.rendimiento },
      { id: 'crm-config', label: 'Configuración', icon: icons.configuracion },
    ]
  },
  {
    group: 'Social Media',
    items: [
      { id: 'social', label: 'Publicaciones', icon: icons.social },
    ]
  },
  {
    group: 'Configuración',
    items: [
      { id: 'app-config', label: 'General', icon: icons.appConfig },
    ]
  },
];

export default function Layout({ currentView, onNavigate, onLogout, username, children }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const activeLabel = navItems.flatMap(g => g.items).find(i => i.id === currentView)?.label || '';

  return (
    <div className={`crm-shell ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="sidebar-overlay" onClick={() => setMobileOpen(false)} />
      )}

      {/* ── SIDEBAR ── */}
      <aside className={`crm-sidebar ${mobileOpen ? 'mobile-open' : ''}`}>
        {/* Logo */}
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M22 2L11 13" stroke="url(#sl1)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="url(#sl1)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
              <defs>
                <linearGradient id="sl1" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#7c6dff"/><stop offset="1" stopColor="#ff6b9d"/>
                </linearGradient>
              </defs>
            </svg>
          </div>
          {!sidebarCollapsed && (
            <div className="sidebar-brand-text">
              <span className="sidebar-brand-name">AutoPost</span>
              <span className="sidebar-brand-sub">CRM Suite</span>
            </div>
          )}
          <button className="sidebar-collapse-btn" onClick={() => setSidebarCollapsed(c => !c)} title={sidebarCollapsed ? 'Expandir' : 'Colapsar'}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d={sidebarCollapsed ? 'M9 18l6-6-6-6' : 'M15 18l-6-6 6-6'} />
            </svg>
          </button>
        </div>

        {/* Workspace */}
        {!sidebarCollapsed && (
          <div className="sidebar-workspace">
            <div className="workspace-avatar">{username?.[0]?.toUpperCase() || 'D'}</div>
            <div className="workspace-info">
              <div className="workspace-name">Mi empresa</div>
              <div className="workspace-role">Administrador</div>
            </div>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6"/></svg>
          </div>
        )}

        {/* Search */}
        {!sidebarCollapsed && (
          <div className="sidebar-search">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <input placeholder="Buscar..." />
          </div>
        )}

        {/* Nav */}
        <nav className="sidebar-nav">
          {navItems.map((group, gi) => (
            <div key={gi} className="nav-group">
              {group.group && !sidebarCollapsed && (
                <div className="nav-group-label">{group.group}</div>
              )}
              {gi > 0 && !group.group && <div className="nav-divider" />}
              {group.items.map(item => (
                <button
                  key={item.id}
                  className={`nav-item ${currentView === item.id ? 'nav-item-active' : ''}`}
                  onClick={() => { onNavigate(item.id); setMobileOpen(false); }}
                  title={sidebarCollapsed ? item.label : undefined}
                >
                  <span className="nav-item-icon">
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      {item.icon.split(' M').map((seg, si) => (
                        <path key={si} d={si === 0 ? seg : 'M' + seg} />
                      ))}
                    </svg>
                  </span>
                  {!sidebarCollapsed && <span className="nav-item-label">{item.label}</span>}
                  {!sidebarCollapsed && currentView === item.id && <span className="nav-item-active-dot" />}
                </button>
              ))}
            </div>
          ))}
        </nav>

        {/* Logout */}
        <button className="sidebar-logout" onClick={onLogout} title="Cerrar sesión">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          {!sidebarCollapsed && <span>Cerrar sesión</span>}
        </button>
      </aside>

      {/* ── MAIN AREA ── */}
      <div className="crm-main">
        {/* Top bar */}
        <header className="crm-topbar">
          <div className="topbar-left">
            <button className="topbar-menu-btn" onClick={() => setMobileOpen(o => !o)}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 12h18M3 6h18M3 18h18"/>
              </svg>
            </button>
            <div className="topbar-breadcrumb">
              <span className="breadcrumb-root">AutoPost CRM</span>
              <span className="breadcrumb-sep">/</span>
              <span className="breadcrumb-current">{activeLabel}</span>
            </div>
          </div>

          <div className="topbar-search">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <input placeholder="Buscar en CRM — personas, empresas, prospectos..." />
          </div>

          <div className="topbar-actions">
            {/* Tasks */}
            <button className="topbar-icon-btn" title="Tareas">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
              </svg>
            </button>
            {/* Notifications */}
            <button className="topbar-icon-btn topbar-notif-btn" title="Notificaciones">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
              <span className="notif-badge">3</span>
            </button>
            {/* Profile */}
            <button className="topbar-profile-btn" title="Perfil">
              <div className="topbar-avatar">{username?.[0]?.toUpperCase() || 'D'}</div>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="crm-content">
          {children}
        </main>
      </div>
    </div>
  );
}
