import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigate = useNavigate();

  // Estado para el selector de temas
  const [theme, setTheme] = useState(localStorage.getItem('colabty_theme') || 'dark');

  const changeTheme = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem('colabty_theme', newTheme);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("Las contraseñas no coinciden");
      return;
    }

    try {
      const response = await fetch('http://localhost:4000/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        alert('¡' + data.message + '!');
        navigate('/login');
      } else {
        alert('Error: ' + data.error);
      }

    } catch (error) {
      console.error('Error al conectar con el backend:', error);
      alert('Hubo un problema al conectar con el servidor.');
    }
  };

  // Mapeo de colores dinámicos manteniendo tu diseño original
  const themesConfig = {
    dark: {
      bg: 'bg-slate-950 text-slate-100',
      leftBg: 'bg-gradient-to-br from-indigo-950 via-indigo-900 to-violet-800 text-white',
      rightBg: 'bg-slate-950 text-slate-100',
      inputBg: 'bg-slate-900 border-slate-800 text-white placeholder:text-slate-500',
      textColor: 'text-white',
      mutedText: 'text-slate-400',
      brandText: 'text-white',
      btnBg: 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30'
    },
    light: {
      bg: 'bg-white text-slate-900',
      leftBg: 'bg-gradient-to-br from-indigo-950 via-indigo-900 to-violet-800 text-white',
      rightBg: 'bg-white text-slate-900',
      inputBg: 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400',
      textColor: 'text-slate-900',
      mutedText: 'text-slate-500',
      brandText: 'text-indigo-950',
      btnBg: 'bg-indigo-950 hover:bg-indigo-900 text-white shadow-[0_4px_14px_0_rgba(49,46,129,0.39)]'
    },
    emerald: {
      bg: 'bg-zinc-950 text-emerald-50',
      leftBg: 'bg-gradient-to-br from-emerald-950 via-zinc-900 to-teal-900 text-emerald-50',
      rightBg: 'bg-zinc-950 text-emerald-50',
      inputBg: 'bg-zinc-900 border-emerald-950 text-emerald-100 placeholder:text-zinc-500',
      textColor: 'text-emerald-100',
      mutedText: 'text-zinc-400',
      brandText: 'text-emerald-400',
      btnBg: 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30'
    },
    violet: {
      bg: 'bg-purple-950/30 text-purple-100',
      leftBg: 'bg-gradient-to-br from-purple-950 via-indigo-950 to-purple-900 text-white',
      rightBg: 'bg-purple-950/20 text-purple-100',
      inputBg: 'bg-purple-950/40 border-purple-800/40 text-white placeholder:text-purple-300/50',
      textColor: 'text-white',
      mutedText: 'text-purple-300/70',
      brandText: 'text-purple-300',
      btnBg: 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-600/30'
    }
  };

  const currentTheme = themesConfig[theme] || themesConfig.dark;

  return (
    <div className={`min-h-screen flex w-full font-sans transition-colors duration-300 ${currentTheme.bg}`}>
      
      {/* Selector de Temas Flotante */}
      <div className="absolute top-6 right-6 flex items-center bg-slate-900/20 border border-slate-700/40 p-1 rounded-xl gap-1 z-50">
        <button onClick={() => changeTheme('dark')} className={`px-2.5 py-1 text-xs font-bold rounded-lg cursor-pointer ${theme === 'dark' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}>🌙</button>
        <button onClick={() => changeTheme('light')} className={`px-2.5 py-1 text-xs font-bold rounded-lg cursor-pointer ${theme === 'light' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}>☀️</button>
        <button onClick={() => changeTheme('emerald')} className={`px-2.5 py-1 text-xs font-bold rounded-lg cursor-pointer ${theme === 'emerald' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'}`}>🌿</button>
        <button onClick={() => changeTheme('violet')} className={`px-2.5 py-1 text-xs font-bold rounded-lg cursor-pointer ${theme === 'violet' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'}`}>🍇</button>
      </div>

      {/* Sección Izquierda */}
      <div className={`hidden lg:flex w-1/2 ${currentTheme.leftBg} p-12 relative overflow-hidden items-end`}>
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
        <div className="absolute top-[20%] right-[-10%] w-72 h-72 bg-violet-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>

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
      <div className={`w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 h-screen overflow-y-auto ${currentTheme.rightBg}`}>
        <div className="w-full max-w-md space-y-8 my-auto py-8">
          
          <div className="lg:hidden text-center mb-4">
            <h1 className={`text-4xl font-black tracking-tighter ${currentTheme.brandText}`}>CoLabTy.</h1>
          </div>

          <div>
            <h2 className={`text-3xl font-bold ${currentTheme.textColor}`}>Crea tu cuenta</h2>
            <p className={`mt-2 ${currentTheme.mutedText}`}>Únete a CoLabTy y organiza a tu equipo.</p>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-5">
            
            <div className="space-y-2">
              <label className={`text-sm font-bold tracking-wide ${currentTheme.textColor}`} htmlFor="name">
                Nombre Completo
              </label>
              <input 
                type="text" 
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition-all font-medium ${currentTheme.inputBg}`}
                placeholder="Ej. Luis Díaz"
                required
              />
            </div>

            <div className="space-y-2">
              <label className={`text-sm font-bold tracking-wide ${currentTheme.textColor}`} htmlFor="email">
                Correo Electrónico
              </label>
              <input 
                type="email" 
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition-all font-medium ${currentTheme.inputBg}`}
                placeholder="ejemplo@empresa.com"
                required
              />
            </div>

            <div className="space-y-2">
              <label className={`text-sm font-bold tracking-wide ${currentTheme.textColor}`} htmlFor="password">
                Contraseña
              </label>
              <input 
                type="password" 
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition-all font-medium ${currentTheme.inputBg}`}
                placeholder="••••••••"
                required
              />
              <div className="pt-1">
                <div className="flex gap-1">
                  <div className="h-1.5 w-1/4 rounded-full bg-red-400"></div>
                  <div className="h-1.5 w-1/4 rounded-full bg-amber-400"></div>
                  <div className="h-1.5 w-1/4 rounded-full bg-green-500"></div>
                  <div className="h-1.5 w-1/4 rounded-full bg-slate-700"></div>
                </div>
                <p className={`text-xs mt-1.5 font-medium text-right ${currentTheme.mutedText}`}>Fortaleza: Buena</p>
              </div>
            </div>

            <div className="space-y-2">
              <label className={`text-sm font-bold tracking-wide ${currentTheme.textColor}`} htmlFor="confirmPassword">
                Confirmar Contraseña
              </label>
              <input 
                type="password" 
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition-all font-medium ${currentTheme.inputBg}`}
                placeholder="••••••••"
                required
              />
            </div>

            <button 
              type="submit" 
              className={`w-full font-bold text-lg py-3.5 px-4 rounded-xl transition-all hover:-translate-y-0.5 active:translate-y-0 mt-6 cursor-pointer ${currentTheme.btnBg}`}
            >
              Crear Cuenta
            </button>
          </form>

          <div className={`text-center pt-4 font-medium pb-4 ${currentTheme.mutedText}`}>
            ¿Ya tienes una cuenta?{' '}
            <Link to="/login" className="text-indigo-500 font-bold hover:text-indigo-400 transition-colors">
              Inicia Sesión
            </Link>
          </div>

        </div>
      </div>
      
    </div>
  );
}