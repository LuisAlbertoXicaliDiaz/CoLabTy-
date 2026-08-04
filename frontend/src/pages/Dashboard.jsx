import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  // Verificamos si hay un usuario al cargar el Dashboard
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      // Si alguien intenta entrar a /dashboard sin iniciar sesión, lo rebotamos al login
      navigate('/login');
    }
  }, [navigate]);

  // Función para cerrar la sesión de forma segura
  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  // Mientras carga la validación, no mostramos nada para evitar parpadeos
  if (!user) return null;

  return (
    <div className="flex h-screen bg-slate-50 font-sans">
      
      {/* =======================
          SIDEBAR (Barra Lateral)
          ======================= */}
      <aside className="hidden md:flex flex-col w-64 bg-indigo-950 text-white shadow-xl">
        {/* Logo del Sidebar */}
        <div className="h-16 flex items-center px-6 border-b border-indigo-900/50">
          <h1 className="text-2xl font-black tracking-tighter text-white">CoLabTy.</h1>
        </div>

        {/* Menú de Navegación */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {/* Item Activo */}
          <Link to="/dashboard" className="flex items-center gap-3 px-3 py-2.5 bg-indigo-600 rounded-lg text-white font-medium transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
            Inicio
          </Link>
          
          {/* Link hacia /boards */}
          <Link to="/boards" className="flex items-center gap-3 px-3 py-2.5 text-indigo-200 hover:bg-indigo-900/50 hover:text-white rounded-lg font-medium transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 002 2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"></path></svg>
            Mis Tableros
          </Link>
          
          {/* CORREGIDO: Ahora usa Link hacia /chat */}
          <Link to="/chat" className="flex items-center gap-3 px-3 py-2.5 text-indigo-200 hover:bg-indigo-900/50 hover:text-white rounded-lg font-medium transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
            Chat de Equipo
          </Link>
        </nav>

        {/* Perfil de Usuario al fondo del Sidebar */}
        <div className="p-4 border-t border-indigo-900/50">
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-indigo-900/50 cursor-pointer transition-colors">
            <div className="w-9 h-9 rounded-full bg-violet-500 flex items-center justify-center text-white font-bold uppercase">
              {/* Tomamos las primeras 2 letras del nombre para el avatar */}
              {user.name.substring(0, 2)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{user.name}</p>
              <p className="text-xs text-indigo-300 truncate">{user.email}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* =======================
          ÁREA PRINCIPAL (Header + Contenido)
          ======================= */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Header Superior */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 z-10">
          {/* Buscador */}
          <div className="flex items-center w-full max-w-md">
            <div className="relative w-full">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              </span>
              <input 
                type="text" 
                placeholder="Buscar tareas, proyectos o miembros..." 
                className="w-full pl-10 pr-4 py-2 bg-slate-100 border-transparent rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
              />
            </div>
          </div>

          {/* Botones de Acción Derecho */}
          <div className="flex items-center gap-4">
            <button className="text-slate-400 hover:text-indigo-600 transition-colors relative">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            {/* Botón real para cerrar sesión */}
            <button onClick={handleLogout} className="text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors cursor-pointer">
              Cerrar Sesión
            </button>
          </div>
        </header>

        {/* Contenido del Dashboard (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-6 lg:p-8">
          
          <div className="mb-8">
            {/* Extraemos el primer nombre de la persona para el saludo */}
            <h2 className="text-2xl font-bold text-slate-900">Hola de nuevo, {user.name.split(' ')[0]} 👋</h2>
            <p className="text-slate-500 mt-1">Aquí tienes un resumen de tu espacio de trabajo.</p>
          </div>

          {/* Tarjetas de Resumen (Widgets) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
              <span className="text-slate-500 text-sm font-semibold mb-2">Tareas Pendientes</span>
              <span className="text-3xl font-black text-slate-900">12</span>
            </div>
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
              <span className="text-slate-500 text-sm font-semibold mb-2">Proyectos Activos</span>
              <span className="text-3xl font-black text-slate-900">3</span>
            </div>
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
              <span className="text-slate-500 text-sm font-semibold mb-2">Miembros del Equipo</span>
              <span className="text-3xl font-black text-slate-900">4</span>
            </div>
          </div>

          {/* Área para el futuro Tablero Kanban */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 min-h-[400px] flex items-center justify-center border-dashed">
            <div className="text-center">
              <svg className="w-12 h-12 text-slate-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
              <p className="text-slate-500 font-medium">El Tablero Kanban se renderizará aquí</p>
            </div>
          </div>

        </div>
      </main>

    </div>
  );
}