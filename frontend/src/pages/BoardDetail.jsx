import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';

export default function BoardDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [board, setBoard] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Estados para crear tarea nueva en una columna específica
  const [newTaskContent, setNewTaskContent] = useState('');
  const [activeColumnId, setActiveColumnId] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      fetchBoardDetails(id);
    } else {
      navigate('/login');
    }
  }, [id, navigate]);

  // Cargar detalles del tablero y sus tareas
  const fetchBoardDetails = async (boardId) => {
    try {
      const response = await fetch(`http://localhost:4000/api/boards/single/${boardId}`);
      const data = await response.json();
      if (response.ok) {
        setBoard(data);
      } else {
        alert(data.error);
        navigate('/boards');
      }
    } catch (error) {
      console.error('Error al obtener el tablero:', error);
    } finally {
      setLoading(false);
    }
  };

  // Función para agregar una tarea
  const handleCreateTask = async (e, columnId) => {
    e.preventDefault();
    if (!newTaskContent.trim()) return;

    try {
      const response = await fetch('http://localhost:4000/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: newTaskContent,
          columnId: columnId
        })
      });

      const data = await response.json();

      if (response.ok) {
        // Recargamos el tablero para ver la nueva tarea reflejada
        fetchBoardDetails(id);
        setNewTaskContent('');
        setActiveColumnId(null);
      } else {
        alert('Error: ' + data.error);
      }
    } catch (error) {
      console.error('Error al crear tarea:', error);
    }
  };

  if (!user || loading) {
    return <div className="flex h-screen items-center justify-center bg-slate-50 font-sans text-slate-500">Cargando tablero...</div>;
  }

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      
      {/* SIDEBAR */}
      <aside className="hidden md:flex flex-col w-64 bg-indigo-950 text-white shadow-xl">
        <div className="h-16 flex items-center px-6 border-b border-indigo-900/50">
          <h1 className="text-2xl font-black tracking-tighter text-white">CoLabTy.</h1>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          <Link to="/dashboard" className="flex items-center gap-3 px-3 py-2.5 text-indigo-200 hover:bg-indigo-900/50 hover:text-white rounded-lg font-medium transition-colors">
            Inicio
          </Link>
          <Link to="/boards" className="flex items-center gap-3 px-3 py-2.5 bg-indigo-600 rounded-lg text-white font-medium transition-colors">
            Mis Tableros
          </Link>
        </nav>
      </aside>

      {/* ÁREA PRINCIPAL */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Header del Tablero */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 z-10 shrink-0">
          <div className="flex items-center gap-4">
            <Link to="/boards" className="text-sm font-bold text-indigo-600 hover:underline">
              ← Volver a Tableros
            </Link>
            <span className="text-slate-300">|</span>
            <h2 className="text-xl font-bold text-slate-800">{board?.title}</h2>
          </div>
          <span className="text-sm text-slate-500 font-medium">{user.name}</span>
        </header>

        {/* Contenedor Columnas Kanban */}
        <div className="flex-1 overflow-x-auto p-6 lg:p-8 flex gap-6 items-start">
          {board?.columns?.map((column) => (
            <div key={column.id} className="w-80 shrink-0 bg-slate-100 rounded-2xl p-4 flex flex-col max-h-full border border-slate-200 shadow-sm">
              
              {/* Título de la Columna */}
              <div className="flex justify-between items-center mb-4 px-1">
                <h3 className="font-bold text-slate-700 text-sm tracking-wide uppercase">{column.title}</h3>
                <span className="bg-slate-200 text-slate-600 text-xs font-bold px-2 py-0.5 rounded-full">
                  {column.tasks?.length || 0}
                </span>
              </div>

              {/* Lista de Tareas */}
              <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                {column.tasks?.map((task) => (
                  <div key={task.id} className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm text-slate-800 text-sm font-medium">
                    {task.content}
                  </div>
                ))}
              </div>

              {/* Botón / Formulario para Agregar Tarea */}
              <div className="mt-4 pt-2">
                {activeColumnId === column.id ? (
                  <form onSubmit={(e) => handleCreateTask(e, column.id)} className="space-y-2">
                    <textarea 
                      rows="2"
                      value={newTaskContent}
                      onChange={(e) => setNewTaskContent(e.target.value)}
                      placeholder="Escribe el contenido de la tarea..."
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-600 outline-none"
                      required
                      autoFocus
                    />
                    <div className="flex justify-end gap-2">
                      <button 
                        type="button" 
                        onClick={() => setActiveColumnId(null)}
                        className="px-3 py-1.5 text-xs text-slate-500 font-bold hover:bg-slate-200 rounded-lg cursor-pointer"
                      >
                        Cancelar
                      </button>
                      <button 
                        type="submit"
                        className="px-3 py-1.5 text-xs bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 cursor-pointer shadow-sm"
                      >
                        Añadir
                      </button>
                    </div>
                  </form>
                ) : (
                  <button 
                    onClick={() => setActiveColumnId(column.id)}
                    className="w-full py-2 px-3 text-left text-sm font-semibold text-slate-500 hover:text-indigo-600 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer flex items-center gap-2"
                  >
                    <span>+ Añadir tarea</span>
                  </button>
                )}
              </div>

            </div>
          ))}
        </div>

      </main>

    </div>
  );
}