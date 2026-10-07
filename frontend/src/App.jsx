import { useState, useEffect } from 'react';
import axios from 'axios';
import LoginPage from './LoginPage';
import Layout from './Layout';
import Prospectos from './views/Prospectos';
import Tratos from './views/Tratos';
import Personas from './views/Personas';
import Empresas from './views/Empresas';
import Mensajes from './views/Mensajes';
import SocialMedia from './views/SocialMedia';
import { Pipelines, Calendario, Rendimiento, CRMConfig, AppConfig } from './views/Placeholders';

function App() {
  // Auth state
  const [token, setToken] = useState(() => localStorage.getItem('ap_token') || null);
  const [authChecked, setAuthChecked] = useState(false);
  const [username, setUsername] = useState('');

  // Navigation state
  const [currentView, setCurrentView] = useState('prospectos');

  useEffect(() => {
    const storedToken = localStorage.getItem('ap_token');
    if (!storedToken) {
      setToken(null);
      setAuthChecked(true);
      return;
    }
    axios.get('/api/auth/verify', {
      headers: { Authorization: `Bearer ${storedToken}` }
    }).then(res => {
      setToken(storedToken);
      setUsername(res.data.user || 'daniel');
    }).catch(() => {
      localStorage.removeItem('ap_token');
      setToken(null);
    }).finally(() => {
      setAuthChecked(true);
    });
  }, []);

  const handleLogin = (newToken) => {
    setToken(newToken);
    // Decode username from token payload (base64)
    try {
      const payload = JSON.parse(atob(newToken.split('.')[1]));
      setUsername(payload.username || 'daniel');
    } catch { setUsername('daniel'); }
  };

  const handleLogout = () => {
    localStorage.removeItem('ap_token');
    setToken(null);
    setUsername('');
  };

  // Loading state while verifying token
  if (!authChecked) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
        <div className="spinner show" style={{ width: '32px', height: '32px', borderWidth: '3px' }} />
      </div>
    );
  }

  // Show login if not authenticated
  if (!token) {
    return <LoginPage onLogin={handleLogin} />;
  }

  // Render current view
  const renderView = () => {
    switch (currentView) {
      case 'prospectos':   return <Prospectos />;
      case 'tratos':       return <Tratos />;
      case 'pipelines':    return <Pipelines />;
      case 'personas':     return <Personas />;
      case 'empresas':     return <Empresas />;
      case 'mensajes':     return <Mensajes />;
      case 'calendario':   return <Calendario />;
      case 'rendimiento':  return <Rendimiento />;
      case 'crm-config':   return <CRMConfig />;
      case 'social':       return <SocialMedia token={token} />;
      case 'app-config':   return <AppConfig />;
      default:             return <Prospectos />;
    }
  };

  return (
    <Layout
      currentView={currentView}
      onNavigate={setCurrentView}
      onLogout={handleLogout}
      username={username}
    >
      {renderView()}
    </Layout>
  );
}

export default App;
