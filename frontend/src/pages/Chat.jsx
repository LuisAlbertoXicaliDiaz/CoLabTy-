import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { io } from 'socket.io-client';

const socket = io('http://localhost:4000');

export default function Chat() {
  const navigate = useNavigate();
  const { boardId } = useParams(); // <-- Extraemos el ID del tablero de la URL
  
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);

  const [notifications, setNotifications] = useState([]);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('colabty_theme') || 'dark');

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      fetchNotifications(parsedUser.id);
      
      // Si estamos dentro de un tablero, nos unimos a la sala y traemos el historial
      if (boardId) {
        socket.emit('join_board', boardId);
        fetchMessageHistory(boardId);
      }
    } else {
      navigate('/login');
    }

    // Escuchar mensajes nuevos
    socket.on('receive_message', (data) => {
      setMessages((prev) => [...prev, data]);
    });

    return () => {
      socket.off('receive_message');
    };
  }, [navigate, boardId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const changeTheme = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem('colabty_theme', newTheme);
  };

  const fetchNotifications = async (userId) => {
    try {
      const response = await fetch(`http://localhost:4000/api/notifications/${userId}`);
      const data = await response.json();
      if (response.ok) setNotifications(data);
    } catch (error) {
      console.error('Error al obtener notificaciones:', error);
    }
  };

  // Traer historial de mensajes desde la base de datos
  const fetchMessageHistory = async (id) => {
    try {
      const response = await fetch(`http://localhost:4000/api/boards/${id}/messages`);
      const data = await response.json();
      if (response.ok) {
        setMessages(data);
      }
    } catch (error) {
      console.error('Error al cargar historial del chat:', error);
    }
  };

  const handleRespondNotification = async (inviteId, action) => {
    try {
      const response = await fetch(`http://localhost:4000/api/notifications/${inviteId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });
      const data = await response.json();
      if (response.ok) {
        alert(data.message);
        fetchNotifications(user.id);
      } else {
        alert('Error: ' + data.error);
      }
    } catch (error) {
      console.error('Error al responder invitación:', error);
    }
  };

  // Función corregida: Envía los datos exactamente como los pide Prisma
  const sendMessage = (e) => {
    e.preventDefault();
    if (!message.trim() || !user || !boardId) return;

    const messageData = {
      content: message,        // El texto
      userId: user.id,         // ID numérico del usuario
      boardId: boardId         // ID del tablero actual
    };

    socket.emit('send_message', messageData);
    setMessage('');
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  const themesConfig = {
    dark: { bg: 'bg-slate-950 text-slate-100', sidebar: 'bg-slate-900/60 border-slate-800', header: 'bg-slate-900/40 border-slate-800/80', card: 'bg-slate-900/50 border-slate-800', textMain: 'text-white', textMuted: 'text-slate-400', accent: 'text-indigo-400 bg-indigo-600/20 border-indigo-500/30' },
    light: { bg: 'bg-slate-50 text-slate-900', sidebar: 'bg-indigo-950 text-white border-indigo-900', header: 'bg-white border-slate-200', card: 'bg-white border-slate-200 shadow-sm', textMain: 'text-slate-900', textMuted: 'text-slate-500', accent: 'text-indigo-600 bg-indigo-50 border-indigo-200' },
    emerald: { bg: 'bg-zinc-950 text-emerald-50', sidebar: 'bg-zinc-900/80 border-emerald-950', header: 'bg-zinc-900/50 border-emerald-950', card: 'bg-zinc-900/60 border-emerald-900/40', textMain: 'text-emerald-100', textMuted: 'text-zinc-400', accent: 'text-emerald-400 bg-emerald-500/20 border-emerald-500/30' },
    violet: { bg: 'bg-purple-950/30 text-purple-100', sidebar: 'bg-purple-950/60 border-purple-900/40', header: 'bg-purple-950/40 border-purple-900/40', card: 'bg-purple-900/20 border-purple-800/30', textMain: 'text-white', textMuted: 'text-purple-300/70', accent: 'text-purple-300 bg-purple-600/30 border-purple-500/40' }
  };

  const currentTheme = themesConfig[theme] || themesConfig.dark;

  if (!user) return null;

  return (
    <div className={`flex h-screen ${currentTheme.bg} font-sans overflow-hidden transition-colors duration-300`}>
      {/* Sidebar */}
      <aside className={`hidden lg:flex flex-col w-72 ${currentTheme.sidebar} border-r backdrop-blur-xl`}>
        <div className={`h-20 flex items-center px-8 border-b ${theme === 'light' ? 'border-indigo-900/50' : 'border-slate-800/80'}`}>
          <h1 className="text-2xl font-black tracking-wider bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">CoLabTy</h1>
        </div>

        <nav className="flex-1 px-4 py-8 space-y-3">
          <Link to="/dashboard" className={`flex items-center gap-3.5 px-4 py-3 ${theme === 'light' ? 'text-indigo-200 hover:bg-indigo-900/50' : 'text-slate-400 hover:bg-slate-800/50'} rounded-2xl font-medium transition-all`}>
            <span>Panel General</span>
          </Link>
          <Link to="/boards" className={`flex items-center gap-3.5 px-4 py-3 ${theme === 'light' ? 'text-indigo-200 hover:bg-indigo-900/50' : 'text-slate-400 hover:bg-slate-800/50'} rounded-2xl font-medium transition-all`}>
            <span>Mis Tableros</span>
          </Link>
          <Link to="/chat" className={`flex items-center gap-3.5 px-4 py-3 border rounded-2xl font-semibold transition-all ${currentTheme.accent}`}>
            <span>Chat en Vivo</span>
          </Link>
        </nav>

        <div className={`p-6 border-t ${theme === 'light' ? 'border-indigo-900/50' : 'border-slate-800/80'}`}>
          <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl ${theme === 'light' ? 'bg-indigo-900/40' : 'bg-slate-800/40 border border-slate-700/50'}`}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center font-bold text-white shadow-md uppercase">
              {user.name.substring(0, 2)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white truncate">{user.name}</p>
              <p className="text-xs text-indigo-300 truncate">{user.email}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content (Chat Moderno) */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className={`h-20 border-b ${currentTheme.header} backdrop-blur-xl flex items-center justify-between px-8 z-20 shrink-0`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
              💬
            </div>
            <div>
              <h2 className={`text-lg font-bold tracking-tight ${currentTheme.textMain}`}>Canal de Equipo</h2>
              <p className={`text-xs ${currentTheme.textMuted}`}>Conectado en tiempo real con WebSockets</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Selector de Temas */}
            <div className="flex items-center bg-slate-900/10 dark:bg-slate-800 border border-slate-700/40 p-1 rounded-xl gap-1">
              <button onClick={() => changeTheme('dark')} className={`px-2.5 py-1 text-xs font-bold rounded-lg cursor-pointer ${theme === 'dark' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}>🌙</button>
              <button onClick={() => changeTheme('light')} className={`px-2.5 py-1 text-xs font-bold rounded-lg cursor-pointer ${theme === 'light' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}>☀️</button>
              <button onClick={() => changeTheme('emerald')} className={`px-2.5 py-1 text-xs font-bold rounded-lg cursor-pointer ${theme === 'emerald' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'}`}>🌿</button>
              <button onClick={() => changeTheme('violet')} className={`px-2.5 py-1 text-xs font-bold rounded-lg cursor-pointer ${theme === 'violet' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'}`}>🍇</button>
            </div>

            {/* Campanita omitida por brevedad, mantenla igual */}
            
            <button onClick={handleLogout} className="text-xs font-bold text-red-500 hover:text-red-400 transition-colors bg-slate-900/10 border border-slate-700/40 px-4 py-2.5 rounded-xl cursor-pointer">
              Salir
            </button>
          </div>
        </header>

        <div className="flex-1 flex flex-col p-6 lg:p-8 max-w-4xl mx-auto w-full overflow-hidden">
          <div className={`flex-1 ${currentTheme.card} border rounded-3xl flex flex-col overflow-hidden shadow-2xl`}>
            
            {/* Zona de Mensajes */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              {!boardId ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-3">
                  <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center text-2xl font-bold shadow-inner">⚠️</div>
                  <h3 className={`text-base font-bold ${currentTheme.textMain}`}>Selecciona un tablero primero</h3>
                  <p className={`text-xs max-w-sm ${currentTheme.textMuted}`}>Para usar el chat debes entrar desde uno de tus tableros específicos.</p>
                </div>
              ) : messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-3">
                  <div className="w-16 h-16 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center text-2xl font-bold shadow-inner">💬</div>
                  <h3 className={`text-base font-bold ${currentTheme.textMain}`}>Comienza la conversación</h3>
                  <p className={`text-xs max-w-sm ${currentTheme.textMuted}`}>Envía un mensaje para coordinar tareas con tu equipo en este tablero.</p>
                </div>
              ) : (
                messages.map((msg, index) => {
                  // Ajuste: Leer los datos tal cual los envía la base de datos
                  const msgUser = msg.user?.name || msg.user; 
                  const isMe = msgUser === user.name;
                  const msgText = msg.content || msg.text;
                  const msgTime = msg.createdAt 
                    ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
                    : msg.time;

                  return (
                    <div key={index} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} space-y-1`}>
                      <div className="flex items-center gap-2 px-1">
                        <span className={`text-xs font-bold ${isMe ? 'text-indigo-400' : 'text-slate-400'}`}>{isMe ? 'Tú' : msgUser}</span>
                        <span className="text-[10px] opacity-60">{msgTime}</span>
                      </div>
                      <div className={`max-w-md px-4 py-3 rounded-2xl text-sm font-medium shadow-md leading-relaxed ${
                        isMe 
                          ? 'bg-indigo-600 text-white rounded-tr-sm' 
                          : theme === 'light' 
                            ? 'bg-slate-100 text-slate-800 border border-slate-200 rounded-tl-sm' 
                            : 'bg-slate-800/90 text-slate-100 border border-slate-700/60 rounded-tl-sm'
                      }`}>
                        {msgText}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input de Mensaje (Solo se muestra si hay un boardId) */}
            {boardId && (
              <form onSubmit={sendMessage} className={`p-4 border-t ${theme === 'light' ? 'border-slate-200 bg-white' : 'border-slate-800/80 bg-slate-900/90'} flex gap-3 items-center backdrop-blur-md`}>
                <input 
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Escribe un mensaje..."
                  className={`flex-1 px-5 py-3.5 rounded-2xl border outline-none text-sm font-medium transition-all shadow-inner ${
                    theme === 'light' 
                      ? 'bg-slate-50 border-slate-200 text-slate-900 focus:ring-2 focus:ring-indigo-600' 
                      : 'bg-slate-950 border-slate-800 text-white focus:ring-2 focus:ring-indigo-500'
                  }`}
                  required
                />
                <button 
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-6 py-3.5 rounded-2xl text-sm transition-all shadow-lg shadow-indigo-600/30 cursor-pointer flex items-center gap-2 shrink-0"
                >
                  <span>Enviar</span>
                  <svg className="w-4 h-4 rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
                </button>
              </form>
            )}

          </div>
        </div>
      </main>
    </div>
  );
}