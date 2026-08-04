import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Login() {
  // 1. Declaramos los estados para guardar lo que el usuario escribe
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // 2. Función que se ejecuta al enviar el formulario
  const handleSubmit = (e) => {
    e.preventDefault(); // Evita que la página se recargue
    console.log('Enviando datos de Login al servidor:', { email, password });
    
    // Aquí es donde en el futuro haremos el "fetch" a tu backend (Express)
  };

  return (
    <div className="min-h-screen flex w-full bg-white font-sans">
      
      {/* Sección Izquierda: Identidad de Marca */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-indigo-950 via-indigo-900 to-violet-800 p-12 relative overflow-hidden items-end">
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-[20%] right-[-10%] w-72 h-72 bg-violet-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>

        <div className="relative z-10 w-full max-w-xl text-white">
          <h1 className="text-5xl font-black tracking-tighter mb-6">CoLabTy.</h1>
          <p className="text-3xl font-light leading-tight mb-8">
            La forma inteligente de planificar, ejecutar y <span className="font-semibold text-violet-300">conectar a tu equipo.</span>
          </p>
          
          <div className="flex items-center gap-4 text-indigo-200 text-sm font-medium mt-12 border-t border-indigo-800/50 pt-6">
            <span>✓ Tableros Kanban</span>
            <span>•</span>
            <span>✓ Chat Integrado</span>
            <span>•</span>
            <span>✓ Carga de Trabajo</span>
          </div>
        </div>
      </div>

      {/* Sección Derecha: Formulario de Login */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12">
        <div className="w-full max-w-md space-y-10">
          
          <div className="lg:hidden text-center mb-8">
            <h1 className="text-4xl font-black text-indigo-950 tracking-tighter">CoLabTy.</h1>
          </div>

          <div>
            <h2 className="text-3xl font-bold text-slate-900">Bienvenido de vuelta</h2>
            <p className="text-slate-500 mt-2">Ingresa tus credenciales para acceder a tu workspace.</p>
          </div>

          {/* 3. Conectamos el formulario a nuestra función */}
          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-900 tracking-wide" htmlFor="email">
                Correo Electrónico
              </label>
              <input 
                type="email" 
                id="email"
                // 4. Conectamos el input a su variable de estado
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition-all text-slate-900 placeholder:text-slate-400 font-medium"
                placeholder="ejemplo@empresa.com"
                required
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-bold text-slate-900 tracking-wide" htmlFor="password">
                  Contraseña
                </label>
                <a href="#" className="text-sm text-indigo-600 hover:text-indigo-800 font-bold transition-colors">
                  ¿La olvidaste?
                </a>
              </div>
              <input 
                type="password" 
                id="password"
                // 4. Conectamos el input a su variable de estado
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition-all text-slate-900 placeholder:text-slate-400 font-medium"
                placeholder="••••••••"
                required
              />
            </div>

            {/* 5. IMPORTANTE: Cambiar type="button" a type="submit" */}
            <button 
              type="submit" 
              className="w-full bg-indigo-950 hover:bg-indigo-900 text-white font-bold text-lg py-3.5 px-4 rounded-xl transition-all shadow-[0_4px_14px_0_rgba(49,46,129,0.39)] hover:shadow-[0_6px_20px_rgba(49,46,129,0.23)] hover:-translate-y-0.5 active:translate-y-0 mt-4"
            >
              Iniciar Sesión
            </button>
          </form>

          <div className="text-center pt-6 text-slate-600 font-medium">
            ¿Nuevo en CoLabTy?{' '}
            <Link to="/register" className="text-indigo-600 font-bold hover:text-indigo-800 transition-colors">
              Crea tu cuenta gratis
            </Link>
          </div>

        </div>
      </div>
      
    </div>
  );
}