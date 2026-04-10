import { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);
  const [isScheduleMode, setIsScheduleMode] = useState(false);
  const [queue, setQueue] = useState([]);

  useEffect(() => {
    if (isScheduleMode) {
      fetchQueue();
    }
  }, [isScheduleMode]);

  const fetchQueue = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/queue');
      setQueue(res.data.queue);
    } catch (error) {
      console.error('Error fetching queue:', error);
    }
  };

  const handleAction = async () => {
    if (!message.trim()) {
      setStatus({ type: 'error', text: 'El mensaje no puede estar vacío.' });
      return;
    }

    setLoading(true);
    setStatus({ type: '', text: '' });

    try {
      const endpoint = isScheduleMode ? '/api/schedule' : '/api/publish';
      const response = await axios.post(`http://localhost:3000${endpoint}`, { message });
      
      if (response.data.success) {
        setStatus({ 
          type: 'success', 
          text: isScheduleMode ? '¡Publicación añadida a la cola automática!' : '¡Publicado con éxito en Facebook!' 
        });
        setMessage('');
        if (isScheduleMode) fetchQueue();
      } else {
        setStatus({ type: 'error', text: 'Hubo un error al procesar.' });
      }
    } catch (error) {
      setStatus({ 
        type: 'error', 
        text: error.response?.data?.error || 'Error de conexión con el servidor.' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (id) => {
    try {
      await axios.delete(`http://localhost:3000/api/queue/${id}`);
      fetchQueue();
    } catch (error) {
      console.error('Error removing from queue', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex p-4 justify-center py-10">
      <div className={`w-full transition-all duration-500 grid grid-cols-1 ${isScheduleMode ? 'max-w-5xl md:grid-cols-2 gap-8' : 'max-w-lg'}`}>
        {/* Panel Izquierdo: Creación */}
        <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100 backdrop-blur-sm self-start">
          <div className="flex items-center justify-center mb-6">
            <div className={`p-4 rounded-full shadow-md transition-colors ${isScheduleMode ? 'bg-indigo-600' : 'bg-blue-600'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" />
              </svg>
            </div>
          </div>
          
          <h1 className="text-3xl font-extrabold text-center text-gray-800 mb-2 tracking-tight">Automate Post</h1>
          <p className="text-center text-gray-500 mb-6 font-medium">Gestiona tus publicaciones inteligentemente</p>

          <div className="flex bg-gray-100 p-1.5 rounded-xl mb-6 shadow-inner">
            <button 
              onClick={() => { setIsScheduleMode(false); setStatus({type:'', text:''}); }}
              className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${!isScheduleMode ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Publicar Ahora
            </button>
            <button 
              onClick={() => { setIsScheduleMode(true); setStatus({type:'', text:''}); }}
              className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${isScheduleMode ? 'bg-white shadow text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Programación
            </button>
          </div>
          
          <div className="space-y-6">
            <div>
              <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-2">
                Contenido de la publicación
              </label>
              <textarea
                id="message"
                rows="5"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all resize-none text-gray-800 shadow-sm"
                placeholder="¿Qué estás pensando?"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                disabled={loading}
              ></textarea>
            </div>

            {status.text && (
              <div className={`p-4 rounded-xl text-sm font-medium transition-all ${status.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                <div className="flex items-center">
                  {status.type === 'success' ? (
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                  ) : (
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                  )}
                  {status.text}
                </div>
              </div>
            )}

            <button
              onClick={handleAction}
              disabled={loading}
              className={`w-full py-4 px-4 rounded-xl text-white font-bold text-lg transition-all duration-200 flex items-center justify-center
                ${loading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : (isScheduleMode ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-blue-600 hover:bg-blue-700')
                } hover:shadow-xl hover:-translate-y-1 active:transform active:translate-y-0`}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Procesando...
                </>
              ) : (
                isScheduleMode ? 'Añadir a la Cola Automática' : 'Publicar Inmediatamente'
              )}
            </button>
            {isScheduleMode && (
              <p className="text-xs text-center text-gray-500 mt-2 font-medium">
                Se publicará 1 mensaje cada 10 minutos (según configuración del servidor)
              </p>
            )}
          </div>
        </div>

        {/* Panel Derecho: Cola de publicación (Solo visible en Schedule Mode) */}
        {isScheduleMode && (
          <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100 backdrop-blur-sm self-start flex flex-col h-full max-h-[650px] animate-fade-in">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center border-b pb-4">
              <svg className="w-6 h-6 mr-3 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Próximas Publicaciones
              <span className="ml-auto bg-indigo-100 text-indigo-700 text-sm font-bold py-1 px-3 rounded-full">{queue.length}</span>
            </h2>
            <div className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar">
              {queue.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-gray-400">
                  <svg className="w-16 h-16 mb-4 opacity-50 text-indigo-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                  <p className="font-medium text-lg">La cola está vacía</p>
                  <p className="text-sm mt-1">Añade mensajes para automatizar</p>
                </div>
              ) : (
                queue.map((item, index) => (
                  <div key={item.id} className="bg-indigo-50/50 border border-indigo-100/50 p-4 rounded-2xl flex items-start group transition-all hover:bg-white hover:border-indigo-300 hover:shadow-md">
                    <div className="bg-indigo-600 text-white text-xs font-bold px-2.5 py-1 rounded-md mr-4 mt-0.5 shadow-sm">
                      #{index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-800 line-clamp-3 leading-relaxed">{item.message}</p>
                    </div>
                    <button 
                      onClick={() => handleRemove(item.id)}
                      className="ml-3 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-red-50"
                      title="Eliminar de la cola"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                ))
              )}
            </div>
            {queue.length > 0 && (
              <div className="mt-6 pt-4 border-t border-gray-100 text-xs font-medium text-center text-gray-500 flex items-center justify-center">
                <span className="flex h-2 w-2 relative mr-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                </span>
                Procesando automáticamente en segundo plano...
              </div>
            )}
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #e2e8f0;
          border-radius: 20px;
        }
        .animate-fade-in {
          animation: fadeIn 0.4s ease-out forwards;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}} />
    </div>
  );
}

export default App;
