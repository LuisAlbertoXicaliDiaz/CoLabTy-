import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';

const socket = io('http://localhost:4000');

export default function Chat() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      navigate('/login');
    }
  }, [navigate]);

  useEffect(() => {
    socket.on('receive_message', (data) => {
      setMessages((prev) => [...prev, data]);
    });

    return () => {
      socket.off('receive_message');
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!message.trim() || !user) return;

    const messageData = {
      name: user.name,
      text: message,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    socket.emit('send_message', messageData);
    setMessage('');
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (!user) return null;

  return (
    <div className="flex h-screen bg-slate-50 font-sans">
      <aside className="hidden md:flex flex-col w-64 bg-indigo-950 text-white shadow-xl">
        <div className="h-16 flex items-center px-6 border-b border-indigo-900/50">
          <h1 className="text-2xl font-black tracking-tighter text-white">CoLabTy.</h1>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          <Link to="/dashboard" className="flex items-center gap-3 px-3 py-2.5 text-indigo-200 hover:bg-indigo-900/50 hover:text-white rounded-lg font-medium transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
            Inicio
          </Link>
          <Link to="/boards" className="flex items-center gap-3 px-3 py-2.5 text-indigo-200 hover:bg-indigo-900/50 hover:text-white rounded-lg font-medium transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"></path></svg>
            Mis Tableros
          </Link>
          <Link to="/chat" className="flex items-center gap-3 px-3 py-2.5 bg-indigo-600 rounded-lg text-white font-medium transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
            Chat de Equipo
          </Link>
        </nav>

        <div className="p-4 border-t border-indigo-900/50">
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-indigo-900/50 cursor-pointer transition-colors">
            <div className="w-9 h-9 rounded-full bg-violet-500 flex items-center justify-center text-white font-bold uppercase">
              {user.name.substring(0, 2)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{user.name}</p>
              <p className="text-xs text-indigo-300 truncate">{user.email}</p>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 z-10">
          <h2 className="text-xl font-bold text-slate-800">Chat de Equipo en Vivo</h2>
          <button onClick={handleLogout} className="text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors cursor-pointer">
            Cerrar Sesión
          </button>
        </header>

        <div className="flex-1 flex flex-col p-6 overflow-hidden max-w-4xl w-full mx-auto">
          <div className="flex-1 bg-white border border-slate-200 rounded-2xl p-6 overflow-y-auto space-y-4 shadow-sm flex flex-col">
            {messages.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-slate-400 text-sm font-medium">
                No hay mensajes aún. ¡Comienza la conversación con tu equipo!
              </div>
            ) : (
              messages.map((msg, index) => {
                const isMyMessage = msg.name === user.name;
                return (
                  <div key={index} className={`flex flex-col ${isMyMessage ? 'items-end' : 'items-start'}`}>
                    <span className="text-xs font-bold text-slate-500 mb-1">{msg.name} <span className="text-slate-300 font-normal">({msg.time})</span></span>
                    <div className={`p-3.5 rounded-2xl max-w-md text-sm ${isMyMessage ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-slate-100 text-slate-800 rounded-bl-none'}`}>
                      {msg.text}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSendMessage} className="mt-4 flex gap-3">
            <input 
              type="text" 
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Escribe un mensaje para tu equipo..." 
              className="flex-1 px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 outline-none text-sm font-medium shadow-sm"
              required
            />
            <button 
              type="submit" 
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-3 rounded-xl transition-all shadow-sm cursor-pointer"
            >
              Enviar
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}