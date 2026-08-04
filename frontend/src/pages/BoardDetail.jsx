import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, useDroppable } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

function SortableTask({ task, onDelete, theme }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const isLight = theme === 'light';

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...attributes} 
      {...listeners}
      className={`p-3.5 rounded-xl border text-sm font-medium flex justify-between items-start group cursor-grab active:cursor-grabbing transition-all select-none ${
        isLight 
          ? 'bg-white border-slate-200 text-slate-800 hover:border-indigo-300 shadow-sm' 
          : 'bg-slate-900/90 border-slate-700/60 text-slate-200 hover:border-indigo-500/50'
      }`}
    >
      <span className="flex-1 mr-2">{task.content}</span>
      <button 
        type="button"
        onPointerDown={(e) => e.stopPropagation()}
        onClick={() => onDelete(task.id)}
        className="text-slate-400 hover:text-red-500 font-bold opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
        title="Eliminar tarea"
      >
        ✕
      </button>
    </div>
  );
}

function ColumnContainer({ column, onDeleteTask, activeColumnId, setActiveColumnId, newTaskContent, setNewTaskContent, handleCreateTask, theme }) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });
  const isLight = theme === 'light';

  return (
    <div 
      ref={setNodeRef} 
      className={`w-80 shrink-0 rounded-2xl p-4 flex flex-col max-h-full border transition-colors shadow-sm ${
        isLight 
          ? `bg-slate-100 ${isOver ? 'border-indigo-400 bg-indigo-50/40' : 'border-slate-200'}` 
          : `bg-slate-900/40 border-slate-800 ${isOver ? 'border-indigo-500 bg-indigo-950/20' : ''}`
      }`}
    >
      <div className="flex justify-between items-center mb-4 px-1">
        <h3 className={`font-bold text-sm tracking-wide uppercase ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>{column.title}</h3>
        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isLight ? 'bg-slate-200 text-slate-600' : 'bg-slate-800 text-slate-400'}`}>
          {column.tasks?.length || 0}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 pr-1 min-h-[150px]">
        <SortableContext items={column.tasks?.map(t => t.id) || []} strategy={verticalListSortingStrategy}>
          {column.tasks?.map((task) => (
            <SortableTask key={task.id} task={task} onDelete={onDeleteTask} theme={theme} />
          ))}
        </SortableContext>
      </div>

      <div className="mt-4 pt-2">
        {activeColumnId === column.id ? (
          <form onSubmit={(e) => handleCreateTask(e, column.id)} className="space-y-2">
            <textarea 
              rows="2"
              value={newTaskContent}
              onChange={(e) => setNewTaskContent(e.target.value)}
              placeholder="Escribe el contenido de la tarea..."
              className={`w-full p-2.5 border rounded-xl text-sm outline-none ${
                isLight 
                  ? 'bg-white border-slate-200 text-slate-800 focus:ring-2 focus:ring-indigo-600' 
                  : 'bg-slate-950 border-slate-800 text-white focus:ring-2 focus:ring-indigo-600'
              }`}
              required
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button 
                type="button" 
                onClick={() => setActiveColumnId(null)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg cursor-pointer ${isLight ? 'text-slate-500 hover:bg-slate-200' : 'text-slate-400 hover:bg-slate-800'}`}
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
            type="button"
            onClick={() => setActiveColumnId(column.id)}
            className={`w-full py-2 px-3 text-left text-sm font-semibold rounded-xl transition-colors cursor-pointer flex items-center gap-2 ${
              isLight ? 'text-slate-500 hover:text-indigo-600 hover:bg-slate-200/60' : 'text-slate-400 hover:text-indigo-400 hover:bg-slate-800/60'
            }`}
          >
            <span>+ Añadir tarea</span>
          </button>
        )}
      </div>
    </div>
  );
}

export default function BoardDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [board, setBoard] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [newTaskContent, setNewTaskContent] = useState('');
  const [activeColumnId, setActiveColumnId] = useState(null);

  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');

  // Notificaciones y Temas
  const [notifications, setNotifications] = useState([]);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('colabty_theme') || 'dark');

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      fetchBoardDetails(id);
      fetchNotifications(parsedUser.id);
    } else {
      navigate('/login');
    }
  }, [id, navigate]);

  const changeTheme = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem('colabty_theme', newTheme);
  };

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

  const fetchNotifications = async (userId) => {
    try {
      const response = await fetch(`http://localhost:4000/api/notifications/${userId}`);
      const data = await response.json();
      if (response.ok) setNotifications(data);
    } catch (error) {
      console.error('Error al obtener notificaciones:', error);
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

  const handleDeleteTask = async (taskId) => {
    try {
      const response = await fetch(`http://localhost:4000/api/tasks/${taskId}`, { method: 'DELETE' });
      if (response.ok) fetchBoardDetails(id);
    } catch (error) {
      console.error('Error al eliminar tarea:', error);
    }
  };

  const handleCreateTask = async (e, columnId) => {
    e.preventDefault();
    if (!newTaskContent.trim()) return;

    try {
      const response = await fetch('http://localhost:4000/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newTaskContent, columnId })
      });

      if (response.ok) {
        fetchBoardDetails(id);
        setNewTaskContent('');
        setActiveColumnId(null);
      }
    } catch (error) {
      console.error('Error al crear tarea:', error);
    }
  };

  const handleInviteMember = async (e) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    try {
      const response = await fetch(`http://localhost:4000/api/boards/${id}/invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail })
      });

      const data = await response.json();
      if (response.ok) {
        alert(data.message);
        setInviteEmail('');
        setIsInviteModalOpen(false);
      } else {
        alert('Error: ' + data.error);
      }
    } catch (error) {
      console.error('Error al invitar miembro:', error);
      alert('Error de conexión con el servidor.');
    }
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (!over) return;

    const activeTaskId = active.id;
    const overId = over.id;

    let targetColumnId = null;
    const matchedColumn = board.columns.find(col => col.id === overId);
    if (matchedColumn) {
      targetColumnId = matchedColumn.id;
    } else {
      for (const col of board.columns) {
        const foundTask = col.tasks.find(t => t.id === overId);
        if (foundTask) {
          targetColumnId = col.id;
          break;
        }
      }
    }

    if (!targetColumnId) return;

    const currentColumn = board.columns.find(col => col.tasks.some(t => t.id === activeTaskId));
    if (currentColumn && currentColumn.id === targetColumnId) return;

    let movedTask = null;
    const updatedColumns = board.columns.map(col => {
      if (col.id === currentColumn.id) {
        return { ...col, tasks: col.tasks.filter(t => t.id !== activeTaskId) };
      }
      if (col.id === targetColumnId) {
        const taskToMove = currentColumn.tasks.find(t => t.id === activeTaskId);
        movedTask = taskToMove;
        return { ...col, tasks: [...col.tasks, taskToMove] };
      }
      return col;
    });

    setBoard({ ...board, columns: updatedColumns });

    try {
      await fetch(`http://localhost:4000/api/tasks/${activeTaskId}/move`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ columnId: targetColumnId })
      });
    } catch (error) {
      console.error('Error al sincronizar el movimiento:', error);
      fetchBoardDetails(id);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  const themesConfig = {
    dark: {
      bg: 'bg-slate-950 text-slate-100',
      sidebar: 'bg-slate-900/60 border-slate-800',
      header: 'bg-slate-900/40 border-slate-800/80',
      textMain: 'text-white',
      textMuted: 'text-slate-400',
      accent: 'text-indigo-400 bg-indigo-600/20 border-indigo-500/30',
    },
    light: {
      bg: 'bg-slate-50 text-slate-900',
      sidebar: 'bg-indigo-950 text-white border-indigo-900',
      header: 'bg-white border-slate-200',
      textMain: 'text-slate-900',
      textMuted: 'text-slate-500',
      accent: 'text-indigo-600 bg-indigo-50 border-indigo-200',
    },
    emerald: {
      bg: 'bg-zinc-950 text-emerald-50',
      sidebar: 'bg-zinc-900/80 border-emerald-950',
      header: 'bg-zinc-900/50 border-emerald-950',
      textMain: 'text-emerald-100',
      textMuted: 'text-zinc-400',
      accent: 'text-emerald-400 bg-emerald-500/20 border-emerald-500/30',
    },
    violet: {
      bg: 'bg-purple-950/30 text-purple-100',
      sidebar: 'bg-purple-950/60 border-purple-900/40',
      header: 'bg-purple-950/40 border-purple-900/40',
      textMain: 'text-white',
      textMuted: 'text-purple-300/70',
      accent: 'text-purple-300 bg-purple-600/30 border-purple-500/40',
    }
  };

  const currentTheme = themesConfig[theme] || themesConfig.dark;

  if (!user || loading) {
    return <div className="flex h-screen items-center justify-center bg-slate-950 text-slate-400 font-sans">Cargando tablero...</div>;
  }

  return (
    <div className={`flex h-screen ${currentTheme.bg} font-sans overflow-hidden transition-colors duration-300`}>
      <aside className={`hidden lg:flex flex-col w-72 ${currentTheme.sidebar} border-r backdrop-blur-xl`}>
        <div className={`h-20 flex items-center px-8 border-b ${theme === 'light' ? 'border-indigo-900/50' : 'border-slate-800/80'}`}>
          <h1 className="text-2xl font-black tracking-wider bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">CoLabTy</h1>
        </div>
        <nav className="flex-1 px-4 py-8 space-y-3">
          <Link to="/dashboard" className={`flex items-center gap-3.5 px-4 py-3 ${theme === 'light' ? 'text-indigo-200 hover:bg-indigo-900/50' : 'text-slate-400 hover:bg-slate-800/50'} rounded-2xl font-medium transition-all`}>
            <span>Panel General</span>
          </Link>
          <Link to="/boards" className={`flex items-center gap-3.5 px-4 py-3 border rounded-2xl font-semibold transition-all ${currentTheme.accent}`}>
            <span>Mis Tableros</span>
          </Link>
          <Link to="/chat" className={`flex items-center gap-3.5 px-4 py-3 ${theme === 'light' ? 'text-indigo-200 hover:bg-indigo-900/50' : 'text-slate-400 hover:bg-slate-800/50'} rounded-2xl font-medium transition-all`}>
            <span>Chat en Vivo</span>
          </Link>
        </nav>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className={`h-20 border-b ${currentTheme.header} backdrop-blur-xl flex items-center justify-between px-8 z-10 shrink-0`}>
          <div className="flex items-center gap-4">
            <Link to="/boards" className="text-sm font-bold text-indigo-400 hover:underline">
              ← Volver
            </Link>
            <span className="text-slate-600">|</span>
            <h2 className={`text-xl font-bold ${currentTheme.textMain}`}>{board?.title}</h2>
          </div>

          <div className="flex items-center gap-4">
            {/* Selector de Temas */}
            <div className="flex items-center bg-slate-900/10 dark:bg-slate-800 border border-slate-700/40 p-1 rounded-xl gap-1">
              <button onClick={() => changeTheme('dark')} className={`px-2.5 py-1 text-xs font-bold rounded-lg cursor-pointer ${theme === 'dark' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}>🌙</button>
              <button onClick={() => changeTheme('light')} className={`px-2.5 py-1 text-xs font-bold rounded-lg cursor-pointer ${theme === 'light' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}>☀️</button>
              <button onClick={() => changeTheme('emerald')} className={`px-2.5 py-1 text-xs font-bold rounded-lg cursor-pointer ${theme === 'emerald' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'}`}>🌿</button>
              <button onClick={() => changeTheme('violet')} className={`px-2.5 py-1 text-xs font-bold rounded-lg cursor-pointer ${theme === 'violet' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'}`}>🍇</button>
            </div>

            <button 
              onClick={() => setIsInviteModalOpen(true)}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-4 py-2.5 rounded-xl text-sm transition-colors flex items-center gap-2 cursor-pointer shadow-md"
            >
              <span>+ Invitar Miembro</span>
            </button>
          </div>
        </header>

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <div className="flex-1 overflow-x-auto p-6 lg:p-8 flex gap-6 items-start">
            {board?.columns?.map((column) => (
              <ColumnContainer 
                key={column.id} 
                column={column} 
                onDeleteTask={handleDeleteTask}
                activeColumnId={activeColumnId}
                setActiveColumnId={setActiveColumnId}
                newTaskContent={newTaskContent}
                setNewTaskContent={setNewTaskContent}
                handleCreateTask={handleCreateTask}
                theme={theme}
              />
            ))}
          </div>
        </DndContext>
      </main>

      {/* Modal Invitar */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 text-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-6">
            <div className="flex justify-between items-center border-b border-slate-800 pb-4">
              <h3 className="text-xl font-bold">Invitar compañero al tablero</h3>
              <button onClick={() => setIsInviteModalOpen(false)} className="text-slate-400 hover:text-white font-bold text-xl cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleInviteMember} className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">Correo electrónico</label>
                <input 
                  type="email" 
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="ejemplo@correo.com"
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-600 outline-none font-medium text-sm text-white"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button 
                  type="button" 
                  onClick={() => setIsInviteModalOpen(false)}
                  className="px-4 py-2 text-slate-400 font-bold hover:bg-slate-800 rounded-xl transition-colors cursor-pointer text-sm"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all shadow-md cursor-pointer text-sm"
                >
                  Enviar Invitación
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}