import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Register() {
  // 1. Estados para los datos del registro
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // 2. Función que maneja el envío
  const handleSubmit = (e) => {
    e.preventDefault();

    // Validación básica en el frontend
    if (password !== confirmPassword) {
      alert("Las contraseñas no coinciden");
      return;
    }

    console.log('Enviando datos de Registro:', { name, email, password });
    // Aquí es donde tu backend registrará al usuario en la base de datos
  };

  return (
    <div className="min-h-screen flex w-full bg-white font-sans">
      
      {/* Sección Izquierda */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-indigo-950 via-indigo-900 to-violet-800 p-12 relative overflow-hidden items-end">
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-[20%] right-[-10%] w-72 h-72 bg-violet-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>

        <div className="relative z-10 w-full max-w-xl text-white">
          <h1 className="text-5xl font-black tracking-tighter mb-6">CoLabTy.</h1>
          <p className="text-3xl font-light leading-tight mb-8">
            Empieza a construir el futuro de tus proyectos <span className="font-semibold text-violet-300">hoy mismo.</span>
          </p>
          
          <div className="flex flex-col gap-4 text-indigo-200 text-sm font-medium mt-12 border-t border-indigo-800/50 pt-6">
            <p className="flex items-center gap-2">
              <span className="bg-indigo-800/50 p-1 rounded-md text-violet-300">✓</span> 
              Colaboración en tiempo real sin límites.
            </p>
            <p className="flex items-center gap-2">
              <span className="bg-indigo-800/50 p-1 rounded-md text-violet-300">✓</span> 
              Automatización de actas y seguimiento.
            </p>
          </div>
        </div>
      </div>

      {/* Sección Derecha: Formulario de Registro */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 h-screen overflow-y-auto">
        <div className="w-full max-w-md space-y-8 my-auto py-8">
          
          <div className="lg:hidden text-center mb-4">
            <h1 className="text-4xl font-black text-indigo-950 tracking-tighter">CoLabTy.</h1>
          </div>

          <div>
            <h2 className="text-3xl font-bold text-slate-900">Crea tu cuenta</h2>
            <p className="text-slate-500 mt-2">Únete a CoLabTy y organiza a tu equipo.</p>
          </div>

          {/* 3. Conectamos el formulario */}
          <form onSubmit={handleSubmit} className="space-y-5">
            
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-900 tracking-wide" htmlFor="name">
                Nombre Completo
              </label>
              <input 
                type="text" 
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition-all text-slate-900 placeholder:text-slate-400 font-medium"
                placeholder="Ej. Luis Díaz"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-900 tracking-wide" htmlFor="email">
                Correo Electrónico
              </label>
              <input 
                type="email" 
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition-all text-slate-900 placeholder:text-slate-400 font-medium"
                placeholder="ejemplo@empresa.com"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-900 tracking-wide" htmlFor="password">
                Contraseña
              </label>
              <input 
                type="password" 
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition-all text-slate-900 placeholder:text-slate-400 font-medium"
                placeholder="••••••••"
                required
              />
              <div className="pt-1">
                <div className="flex gap-1">
                  <div className="h-1.5 w-1/4 rounded-full bg-red-400"></div>
                  <div className="h-1.5 w-1/4 rounded-full bg-amber-400"></div>
                  <div className="h-1.5 w-1/4 rounded-full bg-green-500"></div>
                  <div className="h-1.5 w-1/4 rounded-full bg-slate-200"></div>
                </div>
                <p className="text-xs text-slate-500 mt-1.5 font-medium text-right">Fortaleza: Buena</p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-900 tracking-wide" htmlFor="confirmPassword">
                Confirmar Contraseña
              </label>
              <input 
                type="password" 
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition-all text-slate-900 placeholder:text-slate-400 font-medium"
                placeholder="••••••••"
                required
              />
            </div>

            {/* 4. Cambiamos a type="submit" */}
            <button 
              type="submit" 
              className="w-full bg-indigo-950 hover:bg-indigo-900 text-white font-bold text-lg py-3.5 px-4 rounded-xl transition-all shadow-[0_4px_14px_0_rgba(49,46,129,0.39)] hover:shadow-[0_6px_20px_rgba(49,46,129,0.23)] hover:-translate-y-0.5 active:translate-y-0 mt-6"
            >
              Crear Cuenta
            </button>
          </form>

          <div className="text-center pt-4 text-slate-600 font-medium pb-4">
            ¿Ya tienes una cuenta?{' '}
            <Link to="/login" className="text-indigo-600 font-bold hover:text-indigo-800 transition-colors">
              Inicia Sesión
            </Link>
          </div>

        </div>
      </div>
      
    </div>
  );
}