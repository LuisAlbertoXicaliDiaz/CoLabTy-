import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Boards() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [boards, setBoards] = useState([]);
  const [newBoardTitle, setNewBoardTitle] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      fetchBoards(parsedUser.id);
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const fetchBoards = async (userId) => {
    try {
      const response = await fetch(`http://localhost:4000/api/boards/${userId}`);
      const data = await response.json();
      if (response.ok) {
        setBoards(data);
      }
    } catch (error) {
      console.error('Error al obtener tableros:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBoard = async (e) => {
    e.preventDefault();
    if (!newBoardTitle.trim()) return;

    try {
      const response = await fetch('http://localhost:4000/api/boards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newBoardTitle,
          userId: user.id
        })
      });

      const data = await response.json();

      if (response.ok) {
        setBoards([...boards, data.board]);
        setNewBoardTitle('');
        setIsModalOpen(false);
      } else {
        alert('Error: ' + data.error);
      }
    } catch (error) {
      console.error('Error al crear tablero:', error);
      alert('Hubo un problema al conectar con el servidor.');
    }
  };

  // Función para eliminar un tablero completo
  const handleDeleteBoard = async (e, boardId) => {
    e.stopPropagation(); // Evita que se abra el tablero al hacer clic en la "X"
    if (!window.confirm('¿Estás seguro de que deseas eliminar este tablero y todas sus tareas?')) return;

    try {
      const response = await fetch(`http://localhost:4000/api/boards/${boardId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setBoards(boards.filter(b => b.id !== boardId));
      } else {
        alert('Error al eliminar el tablero');
      }
    } catch (error) {
      console.error('Error al eliminar el tablero:', error);
    }
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
          
          <Link to="/boards" className="flex items-center gap-3 px-3 py-2.5 bg-indigo-600 rounded-lg text-white font-medium transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 002 2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"></path></svg>
            Mis Tableros
          </Link>
          
          <Link to="/chat" className="flex items-center gap-3 px-3 py-2.5 text-indigo-200 hover:bg-indigo-900/50 hover:text-white rounded-lg font-medium transition-colors">
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
          <h2 className="text-xl font-bold text-slate-800">Panel de Tableros</h2>
          <button onClick={handleLogout} className="text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors">
            Cerrar Sesión
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-6 lg:p-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Tus Tableros Kanban</h2>
              <p className="text-slate-500 mt-1">Organiza tus proyectos y tareas visualmente.</p>
            </div>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2.5 rounded-xl transition-all shadow-sm flex items-center gap-2 cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
              Nuevo Tablero
            </button>
          </div>

          {loading ? (
            <p className="text-slate-500">Cargando tableros...</p>
          ) : boards.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
              <p className="text-slate-500 font-medium mb-4">Aún no tienes ningún tablero creado.</p>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="text-indigo-600 font-bold hover:underline cursor-pointer"
              >
                ¡Crea tu primer tablero ahora!
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {boards.map((board) => (
                <Link 
                  to={`/boards/${board.id}`}
                  key={board.id} 
                  className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between h-40 cursor-pointer group border-l-4 border-l-indigo-600 relative"
                >
                  <div className="flex justify-between items-start">
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors pr-6">{board.title}</h3>
                    <button 
                      onClick={(e) => handleDeleteBoard(e, board.id)}
                      className="text-slate-400 hover:text-red-600 font-bold p-1 rounded-lg hover:bg-slate-100 transition-colors z-10 cursor-pointer"
                      title="Eliminar tablero"
                    >
                      ✕
                    </button>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 mt-1">Creado el {new Date(board.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="flex justify-between items-center text-sm font-semibold text-slate-500 pt-4 border-t border-slate-100">
                    <span>{board.columns ? board.columns.length : 3} columnas</span>
                    <span className="text-indigo-600 group-hover:translate-x-1 transition-transform">Ver tablero →</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold text-slate-900">Crear Nuevo Tablero</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold text-xl cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleCreateBoard} className="space-y-4">
              <div>
                <label className="text-sm font-bold text-slate-700 block mb-2">Nombre del Proyecto / Tablero</label>
                <input 
                  type="text" 
                  value={newBoardTitle}
                  onChange={(e) => setNewBoardTitle(e.target.value)}
                  placeholder="Ej. TalentHub México"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-600 outline-none font-medium"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-sm cursor-pointer"
                >
                  Crear Tablero
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}