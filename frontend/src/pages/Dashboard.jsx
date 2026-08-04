import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [boards, setBoards] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Estado para el tema actual ("dark", "light", "emerald", "violet")
  const [theme, setTheme] = useState(localStorage.getItem('colabty_theme') || 'dark');

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      fetchDashboardData(parsedUser.id);
    } else {
      navigate('/login');
    }
  }, [navigate]);

  // Cambiar y guardar tema
  const changeTheme = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem('colabty_theme', newTheme);
  };

  const fetchDashboardData = async (userId) => {
    try {
      const boardsRes = await fetch(`http://localhost:4000/api/boards/${userId}`);
      const boardsData = await boardsRes.json();
      if (boardsRes.ok) setBoards(boardsData);

      const notifRes = await fetch(`http://localhost:4000/api/notifications/${userId}`);
      const notifData = await notifRes.json();
      if (notifRes.ok) setNotifications(notifData);
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setLoading(false);
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
        fetchDashboardData(user.id);
      } else {
        alert('Error: ' + data.error);
      }
    } catch (error) {
      console.error('Error al responder invitación:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  // Clases dinámicas según el tema seleccionado
  const themesConfig = {
    dark: {
      bg: 'bg-slate-950 text-slate-100',
      sidebar: 'bg-slate-900/60 border-slate-800',
      header: 'bg-slate-900/40 border-slate-800/80',
      card: 'bg-slate-900/50 border-slate-800',
      textMain: 'text-white',
      textMuted: 'text-slate-400',
      accent: 'text-indigo-400 bg-indigo-600/20 border-indigo-500/30',
      buttonPrimary: 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/25',
    },
    light: {
      bg: 'bg-slate-50 text-slate-900',
      sidebar: 'bg-indigo-950 text-white border-indigo-900',
      header: 'bg-white border-slate-200',
      card: 'bg-white border-slate-200 shadow-sm',
      textMain: 'text-slate-900',
      textMuted: 'text-slate-500',
      accent: 'text-indigo-600 bg-indigo-50 border-indigo-200',
      buttonPrimary: 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm',
    },
    emerald: {
      bg: 'bg-zinc-950 text-emerald-50',
      sidebar: 'bg-zinc-900/80 border-emerald-950',
      header: 'bg-zinc-900/50 border-emerald-950',
      card: 'bg-zinc-900/60 border-emerald-900/40',
      textMain: 'text-emerald-100',
      textMuted: 'text-zinc-400',
      accent: 'text-emerald-400 bg-emerald-500/20 border-emerald-500/30',
      buttonPrimary: 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/25',
    },
    violet: {
      bg: 'bg-purple-950/30 text-purple-100',
      sidebar: 'bg-purple-950/60 border-purple-900/40',
      header: 'bg-purple-950/40 border-purple-900/40',
      card: 'bg-purple-900/20 border-purple-800/30',
      textMain: 'text-white',
      textMuted: 'text-purple-300/70',
      accent: 'text-purple-300 bg-purple-600/30 border-purple-500/40',
      buttonPrimary: 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-600/25',
    }
  };

  const currentTheme = themesConfig[theme] || themesConfig.dark;

  if (!user || loading) {
    return <div className="flex h-screen items-center justify-center bg-slate-950 text-slate-400 font-sans">Cargando experiencia...</div>;
  }

  const totalBoards = boards.length;
  const ownedBoards = boards.filter(b => b.userId === user.id).length;
  const sharedBoards = totalBoards - ownedBoards;

  return (
    <div className={`flex h-screen ${currentTheme.bg} font-sans overflow-hidden transition-colors duration-300`}>
      {/* Sidebar */}
      <aside className={`hidden lg:flex flex-col w-72 ${currentTheme.sidebar} border-r backdrop-blur-xl`}>
        <div className={`h-20 flex items-center px-8 border-b ${theme === 'light' ? 'border-indigo-900/50' : 'border-slate-800/80'}`}>
          <h1 className="text-2xl font-black tracking-wider bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">CoLabTy</h1>
        </div>

        <nav className="flex-1 px-4 py-8 space-y-3">
          <Link to="/dashboard" className={`flex items-center gap-3.5 px-4 py-3 border rounded-2xl font-semibold transition-all ${currentTheme.accent}`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>
            Panel General
          </Link>
          <Link to="/boards" className={`flex items-center gap-3.5 px-4 py-3 ${theme === 'light' ? 'text-indigo-200 hover:bg-indigo-900/50' : 'text-slate-400 hover:bg-slate-800/50'} rounded-2xl font-medium transition-all`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"></path></svg>
            Mis Tableros
          </Link>
          <Link to="/chat" className={`flex items-center gap-3.5 px-4 py-3 ${theme === 'light' ? 'text-indigo-200 hover:bg-indigo-900/50' : 'text-slate-400 hover:bg-slate-800/50'} rounded-2xl font-medium transition-all`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"></path></svg>
            Chat en Vivo
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

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className={`h-20 border-b ${currentTheme.header} backdrop-blur-xl flex items-center justify-between px-8 sticky top-0 z-20`}>
          <div>
            <h2 className={`text-xl font-bold tracking-tight ${currentTheme.textMain}`}>Hola, {user.name} 👋</h2>
            <p className={`text-xs ${currentTheme.textMuted}`}>Aquí tienes el resumen de tu espacio de trabajo.</p>
          </div>

          <div className="flex items-center gap-4">
            {/* Selector de Temas */}
            <div className="flex items-center bg-slate-900/10 dark:bg-slate-800 border border-slate-700/40 p-1 rounded-xl gap-1">
              <button onClick={() => changeTheme('dark')} className={`px-2.5 py-1 text-xs font-bold rounded-lg cursor-pointer transition-all ${theme === 'dark' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}>🌙 Oscuro</button>
              <button onClick={() => changeTheme('light')} className={`px-2.5 py-1 text-xs font-bold rounded-lg cursor-pointer transition-all ${theme === 'light' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}>☀️ Claro</button>
              <button onClick={() => changeTheme('emerald')} className={`px-2.5 py-1 text-xs font-bold rounded-lg cursor-pointer transition-all ${theme === 'emerald' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'}`}>🌿 Esmeralda</button>
              <button onClick={() => changeTheme('violet')} className={`px-2.5 py-1 text-xs font-bold rounded-lg cursor-pointer transition-all ${theme === 'violet' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'}`}>🍇 Violeta</button>
            </div>

            {/* Campanita de Notificaciones */}
            <div className="relative">
              <button 
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="relative p-2.5 bg-slate-900/10 border border-slate-700/40 text-slate-300 hover:text-indigo-400 rounded-xl transition-all cursor-pointer shadow-sm"
                title="Notificaciones"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center animate-pulse">
                    {notifications.length}
                  </span>
                )}
              </button>

              {isNotificationsOpen && (
                <div className="absolute right-0 mt-3 w-80 bg-slate-900 text-white border border-slate-800 rounded-2xl shadow-2xl z-50 p-4 space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                    <h3 className="font-bold text-sm">Invitaciones</h3>
                    <span className="bg-indigo-500/20 text-indigo-400 font-bold text-xs px-2.5 py-0.5 rounded-full">{notifications.length}</span>
                  </div>

                  {notifications.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-6">No hay solicitudes pendientes.</p>
                  ) : (
                    <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                      {notifications.map((invite) => (
                        <div key={invite.id} className="bg-slate-800/80 border border-slate-700 p-3 rounded-xl space-y-2.5">
                          <p className="text-xs text-slate-200 leading-relaxed">
                            <span className="font-bold text-indigo-400">{invite.board.user.name}</span> te invitó a <span className="font-semibold text-white">"{invite.board.title}"</span>.
                          </p>
                          <div className="flex gap-2 justify-end">
                            <button onClick={() => handleRespondNotification(invite.id, 'reject')} className="px-3 py-1 bg-slate-700 hover:bg-red-500/20 hover:text-red-400 text-xs font-semibold rounded-lg cursor-pointer">Rechazar</button>
                            <button onClick={() => handleRespondNotification(invite.id, 'accept')} className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg cursor-pointer">Aceptar</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <button onClick={handleLogout} className="text-xs font-bold text-red-500 hover:text-red-400 transition-colors bg-slate-900/10 border border-slate-700/40 px-4 py-2.5 rounded-xl cursor-pointer">
              Salir
            </button>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto w-full space-y-8">
          {/* Banner */}
          <div className="relative overflow-hidden bg-gradient-to-br from-indigo-950 via-slate-900 to-violet-950 border border-indigo-500/20 rounded-3xl p-8 shadow-2xl text-white">
            <div className="relative z-10 max-w-xl space-y-4">
              <span className="inline-block bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                Plataforma Colaborativa CoLabTy
              </span>
              <h2 className="text-3xl lg:text-4xl font-black tracking-tight">
                Diseña, coordina y escala tus proyectos con tu equipo.
              </h2>
              <p className="text-slate-300 text-sm leading-relaxed">
                Gestiona tus tableros Kanban en tiempo real, comparte accesos con colegas y mantén todo tu flujo sincronizado.
              </p>
              <div className="flex gap-4 pt-2">
                <Link to="/boards" className={`font-bold px-6 py-3 rounded-xl text-sm transition-all shadow-lg ${currentTheme.buttonPrimary}`}>
                  Ver Tableros
                </Link>
                <Link to="/chat" className="bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-slate-200 font-bold px-6 py-3 rounded-xl text-sm transition-all">
                  Abrir Chat en Vivo
                </Link>
              </div>
            </div>
          </div>

          {/* Estadísticas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className={`${currentTheme.card} border p-6 rounded-2xl flex items-center gap-4`}>
              <div className="w-12 h-12 rounded-xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xl">📂</div>
              <div>
                <p className={`text-xs font-semibold uppercase tracking-wider ${currentTheme.textMuted}`}>Tableros Totales</p>
                <p className={`text-2xl font-black ${currentTheme.textMain} mt-1`}>{totalBoards}</p>
              </div>
            </div>

            <div className={`${currentTheme.card} border p-6 rounded-2xl flex items-center gap-4`}>
              <div className="w-12 h-12 rounded-xl bg-violet-600/10 border border-violet-500/20 text-violet-400 flex items-center justify-center font-bold text-xl">⭐</div>
              <div>
                <p className={`text-xs font-semibold uppercase tracking-wider ${currentTheme.textMuted}`}>Tableros Propios</p>
                <p className={`text-2xl font-black ${currentTheme.textMain} mt-1`}>{ownedBoards}</p>
              </div>
            </div>

            <div className={`${currentTheme.card} border p-6 rounded-2xl flex items-center gap-4`}>
              <div className="w-12 h-12 rounded-xl bg-emerald-600/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xl">🤝</div>
              <div>
                <p className={`text-xs font-semibold uppercase tracking-wider ${currentTheme.textMuted}`}>Tableros Compartidos</p>
                <p className={`text-2xl font-black ${currentTheme.textMain} mt-1`}>{sharedBoards}</p>
              </div>
            </div>
          </div>

          {/* Tableros Recientes */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className={`text-lg font-bold ${currentTheme.textMain}`}>Acceso Rápido a Tableros</h3>
              <Link to="/boards" className="text-xs font-bold text-indigo-400 hover:underline">Ver todos →</Link>
            </div>

            {boards.length === 0 ? (
              <div className={`${currentTheme.card} border rounded-2xl p-10 text-center ${currentTheme.textMuted} text-sm`}>
                No hay tableros activos. Comienza creando uno nuevo en la sección de tableros.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {boards.slice(0, 3).map((board) => (
                  <Link 
                    to={`/boards/${board.id}`}
                    key={board.id}
                    className={`${currentTheme.card} border hover:border-indigo-500/40 p-6 rounded-2xl transition-all flex flex-col justify-between h-40 group shadow-sm`}
                  >
                    <div>
                      <h4 className={`font-bold ${currentTheme.textMain} group-hover:text-indigo-400 transition-colors truncate`}>{board.title}</h4>
                      {board.user && (
                        <p className="text-xs text-indigo-400/80 font-medium mt-1">Propietario: {board.user.name}</p>
                      )}
                    </div>
                    <div className={`flex justify-between items-center text-xs ${currentTheme.textMuted} pt-4 border-t border-slate-700/20 font-medium`}>
                      <span>{board.columns?.length || 3} columnas</span>
                      <span className="text-indigo-400 group-hover:translate-x-1 transition-transform font-semibold">Abrir →</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}