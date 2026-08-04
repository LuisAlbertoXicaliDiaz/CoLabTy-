import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, useDroppable } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Componente individual para cada Tarjeta de Tarea (Draggable)
function SortableTask({ task, onDelete }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...attributes} 
      {...listeners}
      className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm text-slate-800 text-sm font-medium flex justify-between items-start group cursor-grab active:cursor-grabbing hover:border-indigo-300 transition-all select-none"
    >
      <span className="flex-1 mr-2">{task.content}</span>
      <button 
        type="button"
        onPointerDown={(e) => e.stopPropagation()}
        onClick={() => onDelete(task.id)}
        className="text-slate-300 hover:text-red-500 font-bold opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
        title="Eliminar tarea"
      >
        ✕
      </button>
    </div>
  );
}

// Componente de Columna con zona Droppable independiente
function ColumnContainer({ column, onDeleteTask, activeColumnId, setActiveColumnId, newTaskContent, setNewTaskContent, handleCreateTask }) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });

  return (
    <div 
      ref={setNodeRef} 
      className={`w-80 shrink-0 bg-slate-100 rounded-2xl p-4 flex flex-col max-h-full border transition-colors shadow-sm ${
        isOver ? 'border-indigo-400 bg-indigo-50/40' : 'border-slate-200'
      }`}
    >
      <div className="flex justify-between items-center mb-4 px-1">
        <h3 className="font-bold text-slate-700 text-sm tracking-wide uppercase">{column.title}</h3>
        <span className="bg-slate-200 text-slate-600 text-xs font-bold px-2 py-0.5 rounded-full">
          {column.tasks?.length || 0}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 pr-1 min-h-[150px]">
        <SortableContext items={column.tasks?.map(t => t.id) || []} strategy={verticalListSortingStrategy}>
          {column.tasks?.map((task) => (
            <SortableTask key={task.id} task={task} onDelete={onDeleteTask} />
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
            type="button"
            onClick={() => setActiveColumnId(column.id)}
            className="w-full py-2 px-3 text-left text-sm font-semibold text-slate-500 hover:text-indigo-600 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer flex items-center gap-2"
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

  // Estados para el Modal de Invitación
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      fetchBoardDetails(id);
    } else {
      navigate('/login');
    }
  }, [id, navigate]);

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

  const handleDeleteTask = async (taskId) => {
    try {
      const response = await fetch(`http://localhost:4000/api/tasks/${taskId}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        fetchBoardDetails(id);
      }
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

  // Función para enviar la invitación por correo
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

  // Movimiento con Actualización Optimista (Instantáneo)
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

    // --- ACTUALIZACIÓN OPTIMISTA LOCAL ---
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

    // --- PETICIÓN AL BACKEND EN SEGUNDO PLANO ---
    try {
      await fetch(`http://localhost:4000/api/tasks/${activeTaskId}/move`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ columnId: targetColumnId })
      });
    } catch (error) {
      console.error('Error al sincronizar el movimiento:', error);
      fetchBoardDetails(id); // Revertir si hay error de red
    }
  };

  if (!user || loading) {
    return <div className="flex h-screen items-center justify-center bg-slate-50 font-sans text-slate-500">Cargando tablero...</div>;
  }

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
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
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"></path></svg>
            Mis Tableros
          </Link>
          <Link to="/chat" className="flex items-center gap-3 px-3 py-2.5 text-indigo-200 hover:bg-indigo-900/50 hover:text-white rounded-lg font-medium transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
            Chat de Equipo
          </Link>
        </nav>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 z-10 shrink-0">
          <div className="flex items-center gap-4">
            <Link to="/boards" className="text-sm font-bold text-indigo-600 hover:underline">
              ← Volver
            </Link>
            <span className="text-slate-300">|</span>
            <h2 className="text-xl font-bold text-slate-800">{board?.title}</h2>
          </div>

          <div className="flex items-center gap-4">
            {/* Botón para abrir el modal de invitar */}
            <button 
              onClick={() => setIsInviteModalOpen(true)}
              className="bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-bold px-3.5 py-2 rounded-xl text-sm transition-colors flex items-center gap-2 cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path></svg>
              Invitar Miembro
            </button>
            <span className="text-sm text-slate-500 font-medium">{user.name}</span>
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
              />
            ))}
          </div>
        </DndContext>
      </main>

      {/* Modal para Invitar Colaborador */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold text-slate-900">Invitar compañero al tablero</h3>
              <button onClick={() => setIsInviteModalOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold text-xl cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleInviteMember} className="space-y-4">
              <div>
                <label className="text-sm font-bold text-slate-700 block mb-2">Correo electrónico registrado</label>
                <input 
                  type="email" 
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="ejemplo@correo.com"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-600 outline-none font-medium text-sm"
                  required
                />
                <p className="text-xs text-slate-400 mt-1">El usuario debe estar registrado previamente en CoLabTy.</p>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button 
                  type="button" 
                  onClick={() => setIsInviteModalOpen(false)}
                  className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition-colors cursor-pointer text-sm"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-sm cursor-pointer text-sm"
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