import { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [message, setMessage] = useState('');
  const [image, setImage] = useState(null);
  const [status, setStatus] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);
  const [queue, setQueue] = useState([]);
  const [autoPublish, setAutoPublish] = useState(false);

  useEffect(() => {
    fetchQueue();
    fetchSettings();
    // Refrescamos en tiempo real para ver los inyectados por el generador
    const interval = setInterval(() => {
      fetchQueue();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchQueue = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/queue');
      setQueue(res.data.queue);
    } catch (error) {
      console.error('Error fetching queue:', error);
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/settings');
      setAutoPublish(res.data.autoPublish);
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const toggleAutoPublish = async () => {
    try {
      const newValue = !autoPublish;
      const res = await axios.post('http://localhost:3000/api/settings', { autoPublish: newValue });
      setAutoPublish(res.data.autoPublish);
      fetchQueue();
    } catch (error) {
      console.error('Error toggling auto publish:', error);
    }
  };

  const handleAction = async () => {
    if (!message.trim() && !image) {
      setStatus({ type: 'error', text: 'Debes incluir al menos un mensaje o una imagen.' });
      return;
    }

    setLoading(true);
    setStatus({ type: '', text: '' });

    try {
      const formData = new FormData();
      if (message) formData.append('message', message);
      if (image) formData.append('image', image);

      const response = await axios.post(`http://localhost:3000/api/schedule`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      if (response.data.success) {
        setStatus({ type: 'success', text: '¡Publicación añadida a la cola automática!' });
        setMessage('');
        setImage(null);
        fetchQueue();
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



  const handlePublishNow = async (id) => {
    try {
      setStatus({ type: 'success', text: 'Publicando manualmente...' });
      await axios.post(`http://localhost:3000/api/queue/${id}/publish`);
      fetchQueue();
      setStatus({ type: 'success', text: 'Publicado manualmente con éxito.' });
    } catch (error) {
      console.error('Error publishing immediately', error);
      setStatus({ type: 'error', text: 'Error al forzar la publicación.' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex p-4 justify-center py-10">
      <div className="w-full transition-all duration-500 grid grid-cols-1 max-w-5xl md:grid-cols-2 gap-8">
        
        {/* Panel Izquierdo: Creación */}
        <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100 backdrop-blur-sm flex flex-col h-full max-h-[750px]">
          <div className="flex items-center justify-between mb-6 border-b pb-4">
            <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight flex items-center">
              <div className="p-3 bg-indigo-600 rounded-full shadow-md mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" />
                </svg>
              </div>
              Automate Post
            </h1>
          </div>
          
          <p className="text-gray-500 mb-6 font-medium">Programa tus textos. Si Auto-Publicar está activo, se publicarán automáticamente en su turno.</p>

          <div className="space-y-6">
            <div>
              <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-2">
                Agendar publicación
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

            {/* Selector de Imagen */}
            <div>
              <div className="flex items-center space-x-4">
                <label className="flex items-center justify-center px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg cursor-pointer hover:bg-indigo-100 transition-colors font-medium text-sm border border-indigo-200">
                  <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Añadir Imagen
                  <input type="file" className="hidden" accept="image/*" onChange={(e) => setImage(e.target.files[0])} />
                </label>
                {image && (
                  <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg p-1.5 pr-3">
                    <img src={URL.createObjectURL(image)} alt="Preview" className="w-10 h-10 object-cover rounded-md" />
                    <span className="ml-3 text-sm text-gray-600 font-medium truncate max-w-[150px]">{image.name}</span>
                    <button onClick={() => setImage(null)} className="ml-3 text-red-400 hover:text-red-600">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {status.text && (
              <div className={`p-4 rounded-xl text-sm font-medium transition-all ${status.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                {status.text}
              </div>
            )}

            <button
              onClick={handleAction}
              disabled={loading}
              className={`w-full py-4 px-4 rounded-xl text-white font-bold text-lg transition-all duration-200 flex items-center justify-center
                ${loading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-indigo-600 hover:bg-indigo-700'
                } hover:shadow-xl hover:-translate-y-1 active:transform active:translate-y-0`}
            >
              {loading ? 'Procesando...' : 'Añadir a la Cola Automática'}
            </button>
          </div>
        </div>

        {/* Panel Derecho: Cola de publicación */}
        <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100 backdrop-blur-sm flex flex-col h-full max-h-[750px] animate-fade-in">
          <div className="flex items-center justify-between mb-6 border-b pb-4">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center">
              <svg className="w-6 h-6 mr-3 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Próximas <span className="ml-2 bg-indigo-100 text-indigo-700 text-sm font-bold py-1 px-3 rounded-full">{queue.length}</span>
            </h2>
            <div className="flex items-center">
              <span className="text-sm font-semibold text-gray-600 mr-2">Auto-Publicar</span>
              <button
                onClick={toggleAutoPublish}
                className={`w-14 h-8 flex items-center rounded-full p-1 transition-colors duration-300 ${autoPublish ? 'bg-indigo-600' : 'bg-gray-300'}`}
              >
                <div className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform duration-300 ${autoPublish ? 'translate-x-6' : 'translate-x-0'}`}></div>
              </button>
            </div>
          </div>
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
                <div key={item.id} className="bg-indigo-50/50 border border-indigo-100/50 p-4 rounded-2xl flex flex-col items-start transition-all hover:bg-white hover:border-indigo-300 hover:shadow-md">
                  <div className="flex w-full">
                    <div className="bg-indigo-600 text-white text-xs font-bold px-2.5 py-1 rounded-md mr-4 mt-0.5 shadow-sm">
                      #{index + 1}
                    </div>
                    <div className="flex-1">
                      {item.imagePath && (
                         <div className="mb-2 w-fit bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center">
                           <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                           CON IMAGEN
                         </div>
                      )}
                      <p className="text-sm font-semibold text-gray-800 leading-relaxed">{item.message || '(Solo Imagen)'}</p>
                    </div>
                    <button 
                      onClick={() => handleRemove(item.id)}
                      className="ml-3 text-gray-400 hover:text-red-500 transition-opacity p-1.5 rounded-lg hover:bg-red-50"
                      title="Eliminar"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                  
                  {/* Controles de Publicación Manual */}
                  <div className="mt-3 flex space-x-2 border-t pt-3 w-full border-indigo-100">
                    <button 
                       onClick={() => handlePublishNow(item.id)}
                       className="flex-1 py-1.5 px-3 bg-blue-100 text-blue-700 hover:bg-blue-200 text-xs font-bold rounded-lg transition-colors flex justify-center items-center"
                    >
                       <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                       Publicar Inmediato
                    </button>
                  </div>

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
              El sistema procesa la cola cada 10 minutos
            </div>
          )}
        </div>

      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 20px; }
        .animate-fade-in { animation: fadeIn 0.4s ease-out forwards; }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}} />
    </div>
  );
}

export default App;
