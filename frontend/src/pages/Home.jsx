import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Efecto para cambiar el estilo del header al hacer scroll
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#05050a] text-slate-100 font-sans overflow-x-hidden flex flex-col relative selection:bg-indigo-500/30">
      
      {/* 🌌 FONDOS ANIMADOS Y CUADRÍCULA */}
      <div className="fixed inset-0 z-0 pointer-events-none flex justify-center">
        {/* Cuadrícula moderna */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f10_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f10_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
        {/* Brillos (Glows) */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/20 blur-[120px] rounded-full animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[40%] bg-fuchsia-600/10 blur-[130px] rounded-full"></div>
      </div>
      
      {/* 🚀 HEADER CON EFECTO CRISTAL */}
      <header className={`fixed top-0 w-full h-20 px-6 flex items-center justify-between z-40 transition-all duration-300 ${scrolled ? 'bg-[#05050a]/80 backdrop-blur-xl border-b border-white/5 shadow-2xl' : 'bg-transparent'}`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-fuchsia-600 flex items-center justify-center font-black text-white shadow-lg shadow-indigo-500/20 ring-1 ring-white/20">
            C
          </div>
          <h1 className="text-2xl font-black tracking-wider bg-gradient-to-r from-white via-indigo-100 to-indigo-400 bg-clip-text text-transparent">
            CoLabTy.
          </h1>
        </div>

        {/* Botón del menú oculto (Hamburguesa) */}
        <button 
          onClick={() => setIsMenuOpen(true)}
          className="p-2.5 bg-white/5 border border-white/10 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-all backdrop-blur-md"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path>
          </svg>
        </button>
      </header>

      {/* 📱 NAVEGACIÓN LATERAL DESLIZABLE (Vertical/Hidden) */}
      <div className={`fixed inset-y-0 right-0 w-72 bg-[#0a0a0f]/95 backdrop-blur-3xl border-l border-white/5 shadow-2xl z-50 transform transition-transform duration-500 cubic-bezier(0.4, 0, 0.2, 1) ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-8 flex flex-col h-full relative overflow-hidden">
          {/* Brillo interno del menú */}
          <div className="absolute top-0 right-0 w-full h-64 bg-indigo-500/10 blur-[80px] pointer-events-none"></div>

          <div className="flex justify-between items-center mb-12 relative z-10">
            <span className="font-bold text-sm tracking-widest text-slate-500 uppercase">Menú</span>
            <button onClick={() => setIsMenuOpen(false)} className="p-2 bg-white/5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>
          
          <nav className="flex flex-col gap-5 flex-1 relative z-10">
            <Link to="/login" className="group flex items-center justify-between px-5 py-4 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-indigo-500/30 rounded-2xl transition-all">
              <span className="font-bold text-slate-200 group-hover:text-white">Iniciar Sesión</span>
              <svg className="w-5 h-5 text-slate-500 group-hover:text-indigo-400 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
            </Link>
            
            <Link to="/register" className="relative group px-5 py-4 rounded-2xl overflow-hidden transition-all">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-fuchsia-600 opacity-80 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative flex items-center justify-between">
                <span className="font-bold text-white">Crear Cuenta Libre</span>
                <svg className="w-5 h-5 text-white transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
              </div>
            </Link>
          </nav>
          
          <div className="mt-auto pt-6 border-t border-white/5 flex items-center justify-center gap-2 text-xs font-medium text-slate-500 relative z-10">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            Sistemas Operativos 100%
          </div>
        </div>
      </div>

      {/* Overlay oscuro */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-500"
          onClick={() => setIsMenuOpen(false)}
        ></div>
      )}

      {/* 🎯 CONTENIDO PRINCIPAL (Flujo Vertical) */}
      <main className="flex-1 flex flex-col items-center pt-32 pb-20 px-6 z-10 relative">
        
        {/* --- SECCIÓN HERO --- */}
        <div className="max-w-4xl space-y-8 flex flex-col items-center text-center mt-10 md:mt-20">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-bold uppercase tracking-widest backdrop-blur-md shadow-[0_0_20px_rgba(99,102,241,0.15)]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            Colaboración en Tiempo Real
          </div>
          
          <h2 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-400 leading-[1.1] tracking-tight">
            Gestión de proyectos <br className="hidden md:block" /> que <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-fuchsia-500 drop-shadow-[0_0_30px_rgba(99,102,241,0.3)]">fluye contigo.</span>
          </h2>
          
          <p className="text-slate-400 text-lg md:text-xl leading-relaxed max-w-2xl font-medium">
            Sincroniza a tu equipo instantáneamente. Tableros Kanban, chat en vivo y notificaciones en tiempo real, todo integrado en un ecosistema diseñado para la velocidad.
          </p>

          <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-4 pt-8">
            <Link to="/register" className="group relative px-8 py-4 bg-white text-slate-950 font-black rounded-2xl overflow-hidden shadow-[0_0_40px_rgba(255,255,255,0.15)] transition-all hover:scale-[1.02]">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-100 to-white opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <span className="relative flex items-center justify-center gap-2">
                Comenzar gratis
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
              </span>
            </Link>
            
            <Link to="/login" className="px-8 py-4 bg-white/5 text-white font-bold rounded-2xl border border-white/10 hover:bg-white/10 transition-colors flex items-center justify-center backdrop-blur-md">
              Ya tengo cuenta
            </Link>
          </div>
        </div>

        {/* --- KANBAN MOCKUP (Representación Visual con CSS puro) --- */}
        <div className="w-full max-w-4xl mt-24 relative perspective-1000 group">
          {/* Sombra de la base */}
          <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-fuchsia-500 rounded-3xl blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-700"></div>
          
          {/* Contenedor del Mockup */}
          <div className="relative bg-[#0a0a0f]/80 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl transform transition-transform duration-700 hover:-translate-y-2">
            
            {/* Header del falso tablero */}
            <div className="flex items-center justify-between border-b border-white/10 pb-6 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">📊</div>
                <div className="h-4 w-32 bg-slate-700/50 rounded"></div>
              </div>
              <div className="flex -space-x-2">
                <div className="w-8 h-8 rounded-full border-2 border-[#0a0a0f] bg-indigo-500 z-20"></div>
                <div className="w-8 h-8 rounded-full border-2 border-[#0a0a0f] bg-fuchsia-500 z-10"></div>
                <div className="w-8 h-8 rounded-full border-2 border-[#0a0a0f] bg-emerald-500 z-0"></div>
              </div>
            </div>

            {/* Columnas falsas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 opacity-80">
              {/* Columna 1 */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="h-3 w-20 bg-slate-700/50 rounded"></div>
                  <div className="h-4 w-6 bg-slate-800 rounded"></div>
                </div>
                <div className="h-24 bg-white/5 border border-white/5 rounded-2xl p-4">
                  <div className="h-3 w-3/4 bg-slate-600/50 rounded mb-3"></div>
                  <div className="h-3 w-1/2 bg-slate-700/50 rounded"></div>
                </div>
                <div className="h-32 bg-white/5 border border-white/5 rounded-2xl p-4 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
                  <div className="h-3 w-4/5 bg-slate-600/50 rounded mb-3"></div>
                  <div className="flex gap-2 mt-8">
                    <div className="h-4 w-12 bg-indigo-500/20 rounded"></div>
                    <div className="h-4 w-8 bg-slate-700/50 rounded"></div>
                  </div>
                </div>
              </div>

              {/* Columna 2 */}
              <div className="space-y-4 hidden md:block mt-8">
                <div className="flex justify-between items-center">
                  <div className="h-3 w-24 bg-slate-700/50 rounded"></div>
                  <div className="h-4 w-6 bg-slate-800 rounded"></div>
                </div>
                {/* Tarjeta con efecto "Moviéndose" */}
                <div className="h-28 bg-indigo-500/10 border border-indigo-500/30 rounded-2xl p-4 ring-1 ring-indigo-500/50 shadow-[0_10_30px_rgba(99,102,241,0.2)] transform -rotate-2 scale-105 transition-all">
                  <div className="h-3 w-3/4 bg-indigo-400/60 rounded mb-3"></div>
                  <div className="flex justify-between items-end mt-8">
                    <div className="h-2 w-16 bg-slate-700/50 rounded-full"></div>
                    <div className="w-5 h-5 rounded-full bg-fuchsia-500"></div>
                  </div>
                </div>
              </div>

              {/* Columna 3 */}
              <div className="space-y-4 hidden md:block">
                <div className="flex justify-between items-center">
                  <div className="h-3 w-20 bg-slate-700/50 rounded"></div>
                  <div className="h-4 w-6 bg-slate-800 rounded"></div>
                </div>
                <div className="h-20 bg-white/5 border border-white/5 rounded-2xl p-4 opacity-50">
                  <div className="h-3 w-2/3 bg-slate-600/50 rounded mb-3 line-through"></div>
                </div>
                <div className="h-24 bg-white/5 border border-white/5 rounded-2xl p-4 opacity-50">
                  <div className="h-3 w-full bg-slate-600/50 rounded mb-3 line-through"></div>
                  <div className="h-3 w-1/3 bg-slate-700/50 rounded line-through"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* --- SECCIÓN FEATURES (Tarjetas de Cristal) --- */}
        <div className="w-full max-w-4xl mt-32 space-y-6 md:space-y-0 md:grid md:grid-cols-3 md:gap-6">
          
          <div className="group bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-md hover:bg-white/10 hover:border-indigo-500/30 transition-all duration-300">
            <div className="w-14 h-14 bg-indigo-500/10 text-indigo-400 rounded-2xl flex items-center justify-center mb-6 border border-indigo-500/20 group-hover:scale-110 transition-transform">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Sockets en Vivo</h3>
            <p className="text-sm text-slate-400 leading-relaxed">No hace falta recargar la página. Los movimientos, tareas y mensajes se reflejan al instante en la pantalla de todos.</p>
          </div>

          <div className="group bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-md hover:bg-white/10 hover:border-fuchsia-500/30 transition-all duration-300 transform md:-translate-y-4">
            <div className="w-14 h-14 bg-fuchsia-500/10 text-fuchsia-400 rounded-2xl flex items-center justify-center mb-6 border border-fuchsia-500/20 group-hover:scale-110 transition-transform">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Kanban Avanzado</h3>
            <p className="text-sm text-slate-400 leading-relaxed">Asigna responsables, configura fechas de entrega urgentes y desglosa todo con checklists para un control total.</p>
          </div>

          <div className="group bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-md hover:bg-white/10 hover:border-emerald-500/30 transition-all duration-300">
            <div className="w-14 h-14 bg-emerald-500/10 text-emerald-400 rounded-2xl flex items-center justify-center mb-6 border border-emerald-500/20 group-hover:scale-110 transition-transform">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"></path></svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Salas de Chat</h3>
            <p className="text-sm text-slate-400 leading-relaxed">Cada tablero cuenta con su propio chat integrado. Discute el avance del proyecto sin salir de la plataforma.</p>
          </div>

        </div>
      </main>

    </div>
  );
}