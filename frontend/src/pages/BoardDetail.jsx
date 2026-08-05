import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, useDroppable } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { io } from 'socket.io-client';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

// --- SortableTask con soporte para múltiples avatares ---
function SortableTask({ task, onDelete, onClick, theme }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const isLight = theme === 'light';

  const priorityColors = {
    alta: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
    media: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    baja: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
  };

  // Obtener lista de usuarios asignados (nuevo formato muchos a muchos)
  const assignedUsers = task.assignedUsers?.map(au => au.user) || (task.assignedUser ? [task.assignedUser] : []);

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...attributes} 
      {...listeners}
      onClick={onClick}
      className={`group rounded-xl border p-4 cursor-grab active:cursor-grabbing transition-all select-none shadow-sm ${
        isLight 
          ? 'bg-white border-slate-200 text-slate-800 hover:border-indigo-300 hover:shadow-md' 
          : 'bg-[#11111a] border-slate-800 text-slate-200 hover:border-slate-600 hover:shadow-lg hover:bg-[#161622]'
      }`}
    >
      <div className="flex justify-between items-start gap-2">
        <span className="font-medium leading-relaxed flex-1 text-sm">{task.content}</span>
        <button 
          type="button"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={() => onDelete(task.id)}
          className="text-slate-500 hover:text-red-500 font-bold opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer p-1"
          title="Eliminar tarea"
        >
          ✕
        </button>
      </div>

      <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-800/80 text-xs">
        <div className="flex items-center gap-2">
          <span className={`px-2 py-0.5 rounded font-bold uppercase border text-[10px] ${priorityColors[task.priority] || priorityColors.media}`}>
            {task.priority || 'media'}
          </span>
          {task.dueDate && (
            <span className="text-slate-400 font-medium flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
              {new Date(task.dueDate).toLocaleDateString()}
            </span>
          )}
        </div>
        {/* Avatares múltiples */}
        {assignedUsers.length > 0 && (
          <div className="flex -space-x-2">
            {assignedUsers.slice(0, 3).map((user) => (
              <div 
                key={user.id}
                className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-[10px] font-bold border-2 border-[#11111a] shadow-sm"
                title={user.name}
              >
                {user.name.substring(0,2).toUpperCase()}
              </div>
            ))}
            {assignedUsers.length > 3 && (
              <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-white text-[10px] font-bold border-2 border-[#11111a]">
                +{assignedUsers.length - 3}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// --- ColumnContainer ---
function ColumnContainer({ 
  column, 
  onDeleteTask, 
  onDeleteColumn,
  onTaskClick,
  activeColumnId, 
  setActiveColumnId, 
  newTaskTitle,
  setNewTaskTitle,
  newTaskDescription,
  setNewTaskDescription,
  taskStartDate,
  setTaskStartDate,
  taskDueDate,
  setTaskDueDate,
  taskPriority,
  setTaskPriority,
  handleCreateTask,
  theme 
}) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });
  const isLight = theme === 'light';

  const getColumnColor = (title) => {
    const lower = title.toLowerCase();
    if (lower.includes('progreso') || lower.includes('doing')) return 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]';
    if (lower.includes('completado') || lower.includes('done')) return 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]';
    if (lower.includes('revisión') || lower.includes('review')) return 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]';
    return 'bg-slate-600';
  };

  const barColor = getColumnColor(column.title);

  return (
    <div 
      ref={setNodeRef} 
      className={`w-80 min-w-[320px] max-w-[600px] resize-x overflow-auto shrink-0 flex flex-col max-h-full rounded-2xl relative backdrop-blur-sm ${
        isLight 
          ? `bg-slate-100/80 ${isOver ? 'border-indigo-400 ring-2 ring-indigo-400/30' : 'border-slate-200'}` 
          : `bg-slate-900/40 border ${isOver ? 'border-indigo-500 bg-indigo-950/20' : 'border-slate-800/80'}`
      }`}
    >
      <div className={`absolute top-0 left-0 w-full h-1 ${barColor}`}></div>
      
      <div className="p-4 flex items-center justify-between border-b border-slate-800/50 pt-5">
        <div className="flex items-center gap-2">
          <div className={`w-2.5 h-2.5 rounded-full ${barColor.replace('shadow-[0_0_10px_', '').replace(')]', ')') || 'bg-slate-500'}`}></div>
          <h3 className={`font-bold text-sm ${isLight ? 'text-slate-700' : 'text-slate-200'}`}>{column.title}</h3>
        </div>
        
        <div className="flex items-center gap-3">
          <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${isLight ? 'bg-slate-200 text-slate-600' : 'bg-slate-800 text-slate-400'}`}>
            {column.tasks?.length || 0}
          </span>
          <button
            onClick={() => onDeleteColumn(column.id)}
            className="text-slate-500 hover:text-red-500 font-bold transition-colors cursor-pointer"
            title="Eliminar columna"
          >
            ✕
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
        <SortableContext items={column.tasks?.map(t => t.id) || []} strategy={verticalListSortingStrategy}>
          {column.tasks?.map((task) => (
            <SortableTask 
              key={task.id} 
              task={task} 
              onDelete={onDeleteTask} 
              onClick={() => onTaskClick(task)}
              theme={theme} 
            />
          ))}
        </SortableContext>
      </div>

      <div className="p-3 border-t border-slate-800/50 shrink-0">
        {activeColumnId === column.id ? (
          <form onSubmit={(e) => handleCreateTask(e, column.id)} className="space-y-3 bg-slate-900/60 p-3.5 rounded-xl border border-indigo-500/40 shadow-[0_0_20px_rgba(99,102,241,0.05)] backdrop-blur-md">
            <input
              type="text"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="Título de la tarea..."
              className="w-full bg-transparent border-b border-slate-700/50 pb-1.5 text-sm font-bold text-white outline-none focus:border-indigo-400 transition-colors placeholder-slate-500"
              autoFocus
              required
            />
            <textarea
              rows="2"
              value={newTaskDescription}
              onChange={(e) => setNewTaskDescription(e.target.value)}
              placeholder="Añade una descripción más detallada..."
              className="w-full p-2 bg-black/20 border border-slate-800 rounded-lg text-xs outline-none text-slate-300 focus:ring-1 focus:ring-indigo-500 resize-none custom-scrollbar placeholder-slate-600"
            />
            <div className="grid grid-cols-2 gap-2 mt-2">
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider pl-1">Prioridad</label>
                <select
                  value={taskPriority}
                  onChange={(e) => setTaskPriority(e.target.value)}
                  className="w-full p-1.5 bg-black/20 border border-slate-800 rounded-md text-[11px] font-semibold text-slate-300 outline-none focus:border-indigo-500 cursor-pointer"
                >
                  <option value="baja">🟢 Baja</option>
                  <option value="media">🟡 Media</option>
                  <option value="alta">🔴 Alta</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider pl-1">Fecha Inicio</label>
                <input
                  type="date"
                  value={taskStartDate}
                  onChange={(e) => setTaskStartDate(e.target.value)}
                  className="w-full p-1.5 bg-black/20 border border-slate-800 rounded-md text-[11px] text-slate-400 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 cursor-pointer [color-scheme:dark] [&::-webkit-calendar-picker-indicator]:opacity-40 [&::-webkit-calendar-picker-indicator]:hover:opacity-100 transition-opacity"
                />
              </div>
              <div className="space-y-1 col-span-2">
                <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider pl-1">Fecha Finalización</label>
                <input
                  type="date"
                  value={taskDueDate}
                  onChange={(e) => setTaskDueDate(e.target.value)}
                  className="w-full p-1.5 bg-black/20 border border-slate-800 rounded-md text-[11px] text-slate-400 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 cursor-pointer [color-scheme:dark] [&::-webkit-calendar-picker-indicator]:opacity-40 [&::-webkit-calendar-picker-indicator]:hover:opacity-100 transition-opacity"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-3 mt-1 border-t border-slate-800/80">
              <button
                type="button"
                onClick={() => {
                  setActiveColumnId(null);
                  setNewTaskTitle('');
                  setNewTaskDescription('');
                  setTaskPriority('media');
                  setTaskStartDate('');
                  setTaskDueDate('');
                }}
                className="px-3 py-1.5 text-xs font-bold rounded-lg cursor-pointer text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-xs bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-500 cursor-pointer shadow-[0_0_10px_rgba(79,70,229,0.3)] transition-all transform hover:scale-105"
              >
                Guardar Tarea
              </button>
            </div>
          </form>
        ) : (
          <button 
            type="button"
            onClick={() => setActiveColumnId(column.id)}
            className={`w-full py-2.5 px-3 text-left text-sm font-semibold rounded-xl transition-colors cursor-pointer flex items-center gap-2 ${
              isLight ? 'text-indigo-600 hover:bg-indigo-50' : 'text-slate-400 hover:text-indigo-400 hover:bg-slate-800/60'
            }`}
          >
            <span>+ Añadir tarea avanzada</span>
          </button>
        )}
      </div>
    </div>
  );
}

// --- Componente principal BoardDetail ---
export default function BoardDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [board, setBoard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [taskStartDate, setTaskStartDate] = useState('');
  const [taskDueDate, setTaskDueDate] = useState('');
  const [taskPriority, setTaskPriority] = useState('media');

  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');

  const [notifications, setNotifications] = useState([]);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('colabty_theme') || 'dark');

  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const messagesEndRef = useRef(null);

  const [activeTaskId, setActiveTaskId] = useState(null);
  const [descriptionInput, setDescriptionInput] = useState('');
  const [newChecklistItem, setNewChecklistItem] = useState('');
  const [dueDateInput, setDueDateInput] = useState('');

  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState('');
  const [activeColumnId, setActiveColumnId] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const getActiveTask = () => {
    if (!board || !board.columns || !activeTaskId) return null;
    for (const column of board.columns) {
      const found = column.tasks.find(t => t.id === activeTaskId);
      if (found) return found;
    }
    return null;
  };

  const activeTask = getActiveTask();

  // Obtener miembros del tablero para el selector de asignación (tanto creador como miembros aceptados)
  const teamMembers = board ? [board.user, ...(board.members?.map(m => m.user) || [])] : [];

  // --- Efectos ---
  useEffect(() => {
    if (!id) {
      navigate('/boards');
      return;
    }

    const fetchMessages = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/boards/${id}/messages`);
        const data = await response.json();
        if (response.ok) {
          setMessages(data);
        }
      } catch (error) {
        console.error('Error al cargar historial de chat:', error);
        toast.error('Error al cargar el historial del chat');
      }
    };

    fetchMessages();
  }, [id]);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      if (id) {
        fetchBoardDetails(id);
        fetchNotifications(parsedUser.id);
      } else {
        navigate('/boards');
      }
    } else {
      navigate('/login');
    }
  }, [id, navigate]);

  useEffect(() => {
    if (!user || !id) return;

    const newSocket = io(import.meta.env.VITE_API_URL);
    setSocket(newSocket);

    newSocket.emit('join_board', id);

    newSocket.on('receive_message', (data) => {
      setMessages((prev) => [...prev, data]);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [id, user]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // --- Funciones ---
  const changeTheme = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem('colabty_theme', newTheme);
  };

  const fetchBoardDetails = async (boardId) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/boards/single/${boardId}`);
      const data = await response.json();
      if (response.ok) {
        setBoard(data);
      } else {
        toast.error(data.error || 'Error al cargar el tablero');
        navigate('/boards');
      }
    } catch (error) {
      console.error('Error al obtener el tablero:', error);
      toast.error('Error de conexión con el servidor');
      navigate('/boards');
    } finally {
      setLoading(false);
    }
  };

  const fetchNotifications = async (userId) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/notifications/${userId}`);
      const data = await response.json();
      if (response.ok) setNotifications(data);
    } catch (error) {
      console.error('Error al obtener notificaciones:', error);
      toast.error('Error al cargar notificaciones');
    }
  };

  const handleRespondNotification = async (inviteId, action) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/notifications/${inviteId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });
      const data = await response.json();
      if (response.ok) {
        toast.success(data.message || 'Invitación procesada');
        fetchNotifications(user.id);
      } else {
        toast.error(data.error || 'Error al procesar la invitación');
      }
    } catch (error) {
      console.error('Error al responder invitación:', error);
      toast.error('Error de conexión al responder invitación');
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/tasks/${taskId}`, { method: 'DELETE' });
      if (response.ok) {
        if (activeTaskId === taskId) setActiveTaskId(null);
        toast.success('Tarea eliminada correctamente');
        fetchBoardDetails(id);
      } else {
        toast.error('Error al eliminar la tarea');
      }
    } catch (error) {
      console.error('Error al eliminar tarea:', error);
      toast.error('Error de conexión al eliminar tarea');
    }
  };

  const handleCreateTask = async (e, columnId) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: newTaskTitle,
          description: newTaskDescription,
          columnId,
          priority: taskPriority,
          dueDate: taskDueDate || null,
          // startDate: taskStartDate || null,
        })
      });

      if (response.ok) {
        await fetchBoardDetails(id);
        setNewTaskTitle('');
        setNewTaskDescription('');
        setTaskPriority('media');
        setTaskStartDate('');
        setTaskDueDate('');
        setActiveColumnId(null);
        toast.success('Tarea creada correctamente');
      } else {
        const data = await response.json();
        toast.error(data.error || 'No se pudo crear la tarea');
      }
    } catch (error) {
      console.error('Error al crear tarea:', error);
      toast.error('Error de conexión al crear tarea');
    }
  };

  const handleInviteMember = async (e) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/boards/${id}/invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail })
      });

      const data = await response.json();
      if (response.ok) {
        toast.success(data.message || 'Invitación enviada con éxito');
        setInviteEmail('');
        setIsInviteModalOpen(false);
      } else {
        toast.error(data.error || 'Error al enviar la invitación');
      }
    } catch (error) {
      console.error('Error al invitar miembro:', error);
      toast.error('Error de conexión al invitar miembro');
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

    const updatedColumns = board.columns.map(col => {
      if (col.id === currentColumn.id) {
        return { ...col, tasks: col.tasks.filter(t => t.id !== activeTaskId) };
      }
      if (col.id === targetColumnId) {
        const taskToMove = currentColumn.tasks.find(t => t.id === activeTaskId);
        return { ...col, tasks: [...col.tasks, taskToMove] };
      }
      return col;
    });

    setBoard({ ...board, columns: updatedColumns });

    try {
      await fetch(`${import.meta.env.VITE_API_URL}/api/tasks/${activeTaskId}/move`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ columnId: targetColumnId })
      });
    } catch (error) {
      console.error('Error al sincronizar el movimiento:', error);
      toast.error('Error al mover la tarea');
      fetchBoardDetails(id);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!messageInput.trim() || !socket || !user || !id) return;

    socket.emit('send_message', {
      boardId: id,
      content: messageInput,
      userId: user.id
    });

    setMessageInput('');
  };

  // --- Funciones del modal de tarea ---
  const openTaskModal = (task) => {
    console.log('🔓 Abriendo modal para tarea:', task);
    setActiveTaskId(task.id);
    setDescriptionInput(task.description || '');
    setDueDateInput(task.dueDate || '');
  };

  const updateTaskDetails = async (updates) => {
    if (!activeTaskId) return;
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/tasks/${activeTaskId}/details`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...updates, boardId: id })
      });
      if (response.ok) {
        fetchBoardDetails(id);
      } else {
        const data = await response.json();
        toast.error(data.error || 'Error al actualizar la tarea');
      }
    } catch (error) {
      console.error('Error actualizando tarea:', error);
      toast.error('Error de conexión al actualizar');
    }
  };

  // ✅ Función para completar tarea (mover a columna "Completado")
  const handleCompleteTask = async (taskId) => {
    if (!window.confirm('¿Marcar esta tarea como completada?')) return;
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/tasks/${taskId}/complete`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ boardId: id })
      });

      if (response.ok) {
        toast.success('¡Tarea completada! 🎉', {
          icon: '✅',
          duration: 2500,
          style: {
            background: '#0f172a',
            color: '#e2e8f0',
            border: '1px solid #22c55e',
            borderRadius: '12px',
            padding: '16px 24px',
            fontSize: '14px',
            fontWeight: '600',
          },
        });
        setActiveTaskId(null);
        fetchBoardDetails(id);
      } else {
        const data = await response.json();
        toast.error(data.error || 'Error al completar la tarea');
      }
    } catch (error) {
      console.error('Error al completar tarea:', error);
      toast.error('Error de conexión al completar tarea');
    }
  };

  const addChecklistItem = async (e) => {
    e.preventDefault();
    if (!newChecklistItem.trim() || !activeTaskId) return;
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/checklist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newChecklistItem, taskId: activeTaskId, boardId: id })
      });
      if (response.ok) {
        setNewChecklistItem('');
        fetchBoardDetails(id);
      } else {
        toast.error('Error al añadir elemento al checklist');
      }
    } catch (error) {
      console.error('Error en checklist:', error);
      toast.error('Error de conexión al añadir checklist');
    }
  };

  const toggleChecklist = async (itemId, currentStatus) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/checklist/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isCompleted: !currentStatus, boardId: id })
      });
      if (response.ok) {
        fetchBoardDetails(id);
      } else {
        toast.error('Error al actualizar checklist');
      }
    } catch (error) {
      console.error('Error al cambiar checklist:', error);
      toast.error('Error de conexión al actualizar checklist');
    }
  };

  // ✅ Función para eliminar ítem del checklist
  const handleDeleteChecklistItem = async (itemId) => {
    if (!window.confirm('¿Eliminar este elemento del checklist?')) return;
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/checklist/${itemId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ boardId: id })
      });
      if (response.ok) {
        fetchBoardDetails(id);
      } else {
        toast.error('Error al eliminar elemento del checklist');
      }
    } catch (error) {
      console.error('Error al eliminar checklist:', error);
      toast.error('Error de conexión al eliminar checklist');
    }
  };

  const handleAddColumn = async () => {
    if (!newColumnTitle.trim()) {
      setIsAddingColumn(false);
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/columns`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newColumnTitle, boardId: id }),
      });

      if (!response.ok) {
        throw new Error('Falló la respuesta del servidor');
      }

      await fetchBoardDetails(id);
      setNewColumnTitle('');
      setIsAddingColumn(false);
      toast.success('Columna creada correctamente');

    } catch (error) {
      console.error("Error al guardar la columna:", error);
      toast.error("Hubo un problema al crear la columna. Revisa la consola.");
    }
  };

  const handleDeleteColumn = async (columnId) => {
    const confirmDelete = window.confirm('¿Estás seguro de que deseas eliminar esta columna? Las tareas dentro de ella también se borrarán.');
    if (!confirmDelete) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/columns/${columnId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        fetchBoardDetails(id);
        toast.success('Columna eliminada correctamente');
      } else {
        toast.error('Error al eliminar la columna');
      }
    } catch (error) {
      console.error('Error al eliminar:', error);
      toast.error('Error de conexión al eliminar columna');
    }
  };

  // --- Temas ---
  const themesConfig = {
    dark: {
      bg: 'bg-[#07070c] text-slate-300',
      sidebar: 'bg-[#0a0a10] border-slate-800/60',
      header: 'bg-[#0a0a10]/50 border-slate-800/60',
      textMain: 'text-white',
      textMuted: 'text-slate-400',
      accent: 'text-indigo-400 bg-indigo-600/20 border-indigo-500/30',
      chatBg: 'bg-slate-900/95 border-slate-800',
      chatMessage: 'bg-slate-800 text-slate-100',
      chatOwnMessage: 'bg-indigo-600 text-white',
    },
    light: {
      bg: 'bg-slate-50 text-slate-900',
      sidebar: 'bg-indigo-950 text-white border-indigo-900',
      header: 'bg-white border-slate-200',
      textMain: 'text-slate-900',
      textMuted: 'text-slate-500',
      accent: 'text-indigo-600 bg-indigo-50 border-indigo-200',
      chatBg: 'bg-white/95 border-slate-200',
      chatMessage: 'bg-slate-100 text-slate-800',
      chatOwnMessage: 'bg-indigo-600 text-white',
    },
    emerald: {
      bg: 'bg-zinc-950 text-emerald-50',
      sidebar: 'bg-zinc-900/80 border-emerald-950',
      header: 'bg-zinc-900/50 border-emerald-950',
      textMain: 'text-emerald-100',
      textMuted: 'text-zinc-400',
      accent: 'text-emerald-400 bg-emerald-500/20 border-emerald-500/30',
      chatBg: 'bg-zinc-900/95 border-emerald-900',
      chatMessage: 'bg-zinc-800 text-emerald-100',
      chatOwnMessage: 'bg-emerald-600 text-white',
    },
    violet: {
      bg: 'bg-purple-950/30 text-purple-100',
      sidebar: 'bg-purple-950/60 border-purple-900/40',
      header: 'bg-purple-950/40 border-purple-900/40',
      textMain: 'text-white',
      textMuted: 'text-purple-300/70',
      accent: 'text-purple-300 bg-purple-600/30 border-purple-500/40',
      chatBg: 'bg-purple-950/95 border-purple-900',
      chatMessage: 'bg-purple-900/60 text-purple-100',
      chatOwnMessage: 'bg-purple-600 text-white',
    }
  };

  const currentTheme = themesConfig[theme] || themesConfig.dark;

  if (!user || loading) {
    return <div className={`flex h-screen items-center justify-center ${currentTheme.bg}`}>Cargando tablero...</div>;
  }

  console.log('📋 Board cargado:', board);
  console.log('🔍 Tarea activa:', activeTask);

  return (
    <div className={`flex h-screen ${currentTheme.bg} font-sans overflow-hidden selection:bg-indigo-500/30`}>
      {/* Sidebar */}
      <aside 
        className={`${isSidebarCollapsed ? 'w-20' : 'w-64'} transition-all duration-300 ease-in-out ${currentTheme.sidebar} border-r flex flex-col relative z-20`}
      >
        <div className={`h-20 flex items-center justify-between px-6 border-b ${theme === 'light' ? 'border-indigo-900/50' : 'border-slate-800/60'}`}>
          {!isSidebarCollapsed && (
            <h1 className="text-xl font-black tracking-wider bg-gradient-to-r from-indigo-400 to-fuchsia-500 bg-clip-text text-transparent">
              CoLabTy.
            </h1>
          )}
          {isSidebarCollapsed && (
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-fuchsia-600 flex items-center justify-center font-bold text-white shadow-lg mx-auto">
              C
            </div>
          )}
        </div>

        <nav className="flex-1 py-6 flex flex-col gap-2 px-3">
          <Link to="/dashboard" className="flex items-center gap-4 px-3 py-3 rounded-xl hover:bg-white/5 text-slate-400 hover:text-white transition-colors">
            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>
            {!isSidebarCollapsed && <span className="font-semibold text-sm">Panel General</span>}
          </Link>
          <Link to="/boards" className={`flex items-center gap-4 px-3 py-3 rounded-xl transition-colors ${currentTheme.accent}`}>
            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>
            {!isSidebarCollapsed && <span className="font-semibold text-sm">Mis Tableros</span>}
          </Link>
          <Link to="/chat" className="flex items-center gap-4 px-3 py-3 rounded-xl hover:bg-white/5 text-slate-400 hover:text-white transition-colors">
            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"></path></svg>
            {!isSidebarCollapsed && <span className="font-semibold text-sm">Chat en Vivo</span>}
          </Link>
        </nav>

        <button 
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className="absolute -right-3 top-24 bg-slate-800 border border-slate-700 text-slate-400 hover:text-white p-1 rounded-full shadow-lg transition-transform hover:scale-110"
        >
          <svg className={`w-4 h-4 transform transition-transform ${isSidebarCollapsed ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
        </button>
      </aside>

      {/* Área principal */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <div className="absolute top-[-20%] left-[20%] w-[40%] h-[40%] bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none"></div>

        <header className={`h-20 px-8 flex items-center justify-between border-b ${currentTheme.header} backdrop-blur-md z-10`}>
          <div className="flex items-center gap-6">
            <Link to="/boards" className="text-sm font-semibold text-slate-400 hover:text-white flex items-center gap-2 transition-colors">
              <span className="text-lg">←</span> Volver
            </Link>
            <div className="h-6 w-px bg-slate-800"></div>
            <h2 className={`text-xl font-bold tracking-wide ${currentTheme.textMain}`}>
              {board?.title || 'Cargando...'}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsChatOpen(!isChatOpen)}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-sm font-bold text-indigo-400 transition-all shadow-sm"
            >
              💬 Chat del Tablero
            </button>
            <button 
              onClick={() => setIsInviteModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-bold transition-all shadow-[0_0_15px_rgba(79,70,229,0.3)] hover:shadow-[0_0_25px_rgba(79,70,229,0.5)]"
            >
              + Invitar Miembro
            </button>
          </div>
        </header>

        {/* Área Kanban */}
        <div className="flex-1 overflow-x-auto overflow-y-hidden p-8 flex gap-6 items-start">
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            {board?.columns?.map((column) => (
              <ColumnContainer 
                key={column.id} 
                column={column} 
                onDeleteTask={handleDeleteTask}
                onDeleteColumn={handleDeleteColumn}
                onTaskClick={openTaskModal}
                activeColumnId={activeColumnId}
                setActiveColumnId={setActiveColumnId}
                newTaskTitle={newTaskTitle}
                setNewTaskTitle={setNewTaskTitle}
                newTaskDescription={newTaskDescription}
                setNewTaskDescription={setNewTaskDescription}
                taskStartDate={taskStartDate}
                setTaskStartDate={setTaskStartDate}
                taskDueDate={taskDueDate}
                setTaskDueDate={setTaskDueDate}
                taskPriority={taskPriority}
                setTaskPriority={setTaskPriority}
                handleCreateTask={handleCreateTask}
                theme={theme}
              />
            ))}
            
            {isAddingColumn ? (
              <div className="w-80 shrink-0 bg-slate-900/60 border border-indigo-500/50 rounded-2xl p-4 backdrop-blur-sm shadow-[0_0_15px_rgba(99,102,241,0.1)]">
                <input
                  type="text"
                  autoFocus
                  placeholder="Ej: En Revisión..."
                  value={newColumnTitle}
                  onChange={(e) => setNewColumnTitle(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddColumn()}
                  className="w-full bg-[#0a0a10] border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 mb-3 transition-all"
                />
                <div className="flex items-center gap-2">
                  <button 
                    onClick={handleAddColumn}
                    className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg transition-colors shadow-md"
                  >
                    Guardar
                  </button>
                  <button 
                    onClick={() => {
                      setIsAddingColumn(false);
                      setNewColumnTitle('');
                    }}
                    className="px-4 py-2 hover:bg-slate-800 text-slate-400 hover:text-white text-xs font-bold rounded-lg transition-colors"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ) : (
              <button 
                onClick={() => setIsAddingColumn(true)}
                className="w-80 shrink-0 h-14 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 rounded-2xl flex items-center justify-center gap-2 text-sm font-bold text-slate-400 hover:text-white transition-all backdrop-blur-sm group"
              >
                <span className="text-indigo-400 group-hover:scale-125 transition-transform">+</span> 
                Añadir Columna
              </button>
            )}
          </DndContext>
        </div>
      </main>

      {/* Chat flotante */}
      {isChatOpen && (
        <div className={`fixed bottom-4 right-4 w-96 h-[500px] ${currentTheme.chatBg} border rounded-2xl shadow-2xl flex flex-col overflow-hidden z-50 transition-all duration-300`}>
          <div className={`flex justify-between items-center p-4 border-b ${theme === 'light' ? 'border-slate-200' : 'border-slate-800'}`}>
            <h3 className={`font-bold ${currentTheme.textMain}`}>💬 Chat - {board?.title}</h3>
            <button 
              onClick={() => setIsChatOpen(false)}
              className="text-slate-400 hover:text-white font-bold text-xl cursor-pointer"
            >
              ✕
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
            {messages.length === 0 ? (
              <p className={`text-center text-sm ${currentTheme.textMuted} mt-10`}>No hay mensajes aún. ¡Escribe algo!</p>
            ) : (
              messages.map((msg, index) => (
                <div 
                  key={index} 
                  className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                    msg.user?.id === user?.id 
                      ? `${currentTheme.chatOwnMessage} self-end ml-auto` 
                      : `${currentTheme.chatMessage} self-start`
                  }`}
                >
                  <div className="font-bold text-xs opacity-70 mb-1">
                    {msg.user?.name || 'Anónimo'}
                  </div>
                  <div>{msg.content || msg.message}</div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSendMessage} className={`p-4 border-t ${theme === 'light' ? 'border-slate-200' : 'border-slate-800'} flex gap-2`}>
            <input
              type="text"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              placeholder="Escribe un mensaje..."
              className={`flex-1 px-4 py-2 rounded-xl border text-sm outline-none font-medium ${
                theme === 'light' 
                  ? 'bg-white border-slate-200 text-slate-800 focus:ring-2 focus:ring-indigo-600' 
                  : 'bg-slate-950 border-slate-800 text-white focus:ring-2 focus:ring-indigo-600'
              }`}
            />
            <button 
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-sm transition-colors cursor-pointer"
            >
              Enviar
            </button>
          </form>
        </div>
      )}

      {/* MODAL DE DETALLES DE LA TAREA */}
      {activeTask && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={(e) => { if(e.target === e.currentTarget) setActiveTaskId(null); }}>
          <div className={`w-full max-w-5xl rounded-2xl border shadow-2xl flex flex-col max-h-[90vh] ${currentTheme.chatBg}`}>
            
            <div className="flex justify-between items-start p-6 border-b border-inherit shrink-0">
              <h2 className="text-xl font-bold">{activeTask.content}</h2>
              <button onClick={() => setActiveTaskId(null)} className="text-slate-400 hover:text-red-400 text-xl font-bold ml-4 transition-colors cursor-pointer">✕</button>
            </div>

            <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
              
              {/* Columna izquierda */}
              <div className="flex-1 p-6 overflow-y-auto space-y-8 border-r border-inherit">
                <div className="space-y-3">
                  <h3 className="font-bold flex items-center gap-2 text-indigo-400">📝 Descripción</h3>
                  <textarea
                    value={descriptionInput}
                    onChange={(e) => setDescriptionInput(e.target.value)}
                    placeholder="Añade una descripción más detallada..."
                    className={`w-full p-4 rounded-xl text-sm min-h-[120px] resize-none outline-none border focus:ring-2 focus:ring-indigo-500 transition-shadow ${currentTheme.header}`}
                  />
                </div>

                <div className="space-y-4">
                  <h3 className="font-bold flex items-center gap-2 text-indigo-400">✅ Subtareas (Checklist)</h3>
                  
                  {activeTask.checklist?.length > 0 && (() => {
                    const completed = activeTask.checklist.filter(c => c.isCompleted).length;
                    const percent = Math.round((completed / activeTask.checklist.length) * 100);
                    return (
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-indigo-400 w-8">{percent}%</span>
                        <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-indigo-500 transition-all duration-300" style={{ width: `${percent}%` }}></div>
                        </div>
                      </div>
                    );
                  })()}

                  <div className="space-y-2">
                    {activeTask.checklist?.map(item => (
                      <div key={item.id} className="flex items-center justify-between group bg-black/10 p-2.5 rounded-lg border border-slate-800/40">
                        <label className="flex items-center gap-3 cursor-pointer flex-1">
                          <input 
                            type="checkbox" 
                            checked={item.isCompleted} 
                            onChange={() => toggleChecklist(item.id, item.isCompleted)}
                            className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                          />
                          <span className={`text-sm ${item.isCompleted ? 'line-through text-slate-500' : 'text-slate-200'}`}>{item.content}</span>
                        </label>
                        <button 
                          type="button" 
                          onClick={() => handleDeleteChecklistItem(item.id)}
                          className="text-slate-500 hover:text-red-400 text-xs font-bold px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>

                  <form onSubmit={addChecklistItem} className="flex gap-2">
                    <input 
                      type="text" 
                      value={newChecklistItem}
                      onChange={(e) => setNewChecklistItem(e.target.value)}
                      placeholder="Añadir un elemento..."
                      className={`flex-1 p-2.5 rounded-lg text-sm border outline-none focus:border-indigo-500 ${currentTheme.header}`}
                    />
                    <button type="submit" className="px-4 py-2 bg-indigo-500/20 text-indigo-400 font-bold text-sm rounded-lg hover:bg-indigo-500 hover:text-white transition-colors cursor-pointer">Añadir</button>
                  </form>
                </div>
              </div>

              {/* Columna derecha */}
              <div className="w-full md:w-80 p-6 shrink-0 space-y-6 bg-black/10 flex flex-col justify-between">
                <div className="space-y-6">
                  {/* ASIGNACIÓN CON CHIPS */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Asignar a</h4>
                    
                    {/* Lista de chips */}
                    <div className="flex flex-wrap gap-2 min-h-[40px] p-2 border border-slate-700/50 rounded-lg bg-black/10">
                      {activeTask.assignedUsers?.map((au) => (
                        <div
                          key={au.user.id}
                          className="flex items-center gap-1.5 bg-indigo-500/20 text-indigo-300 px-3 py-1.5 rounded-full text-sm font-medium border border-indigo-500/30"
                        >
                          <span className="w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center text-[10px] font-bold text-white">
                            {au.user.name.substring(0,2).toUpperCase()}
                          </span>
                          {au.user.name}
                          <button
                            type="button"
                            onClick={() => {
                              const newAssignedUsers = activeTask.assignedUsers.filter(a => a.user.id !== au.user.id);
                              updateTaskDetails({ assignedUserIds: newAssignedUsers.map(a => String(a.user.id)) });
                            }}
                            className="text-slate-400 hover:text-red-400 transition-colors ml-1 text-xs"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                      {(!activeTask.assignedUsers || activeTask.assignedUsers.length === 0) && (
                        <span className="text-slate-500 text-sm italic">Ningún usuario asignado</span>
                      )}
                    </div>

                    {/* Selector para añadir */}
                    <div className="relative">
                      <select
                        value=""
                        onChange={(e) => {
                          const userId = e.target.value;
                          if (!userId) return;
                          
                          if (activeTask.assignedUsers?.some(au => String(au.user.id) === userId)) {
                            toast.warning('Este usuario ya está asignado');
                            return;
                          }

                          const currentIds = activeTask.assignedUsers?.map(au => String(au.user.id)) || [];
                          const newIds = [...currentIds, userId];
                          updateTaskDetails({ assignedUserIds: newIds });
                          
                          e.target.value = "";
                        }}
                        className={`w-full p-2.5 rounded-lg text-sm border outline-none cursor-pointer ${currentTheme.header}`}
                      >
                        <option value="">+ Añadir usuario...</option>
                        {teamMembers
                          .filter(member => !activeTask.assignedUsers?.some(au => au.user.id === member.id))
                          .map(member => (
                            <option key={member.id} value={member.id}>
                              {member.name}
                            </option>
                          ))}
                      </select>
                    </div>

                    <p className="text-[10px] text-slate-500">
                      {activeTask.assignedUsers?.length || 0} usuario(s) asignado(s)
                    </p>
                  </div>

                  {/* PRIORIDAD */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Prioridad</h4>
                    <select
                      value={activeTask.priority || 'media'}
                      onChange={(e) => updateTaskDetails({ priority: e.target.value })}
                      className={`w-full p-2.5 rounded-lg text-sm border outline-none cursor-pointer ${currentTheme.header}`}
                    >
                      <option value="baja">🟢 Baja</option>
                      <option value="media">🟡 Media</option>
                      <option value="alta">🔴 Alta</option>
                    </select>
                  </div>

                  {/* Fechas con DatePicker */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Fecha de Inicio</h4>
                    <DatePicker
                      selected={activeTask.startDate ? new Date(activeTask.startDate) : null}
                      onChange={(date) => {
                        const formattedDate = date ? date.toISOString().split('T')[0] : null;
                        updateTaskDetails({ startDate: formattedDate });
                      }}
                      dateFormat="dd/MM/yyyy"
                      placeholderText="Seleccionar fecha"
                      className={`w-full p-2.5 rounded-lg text-sm border outline-none cursor-pointer ${currentTheme.header}`}
                      popperClassName="react-datepicker-popper"
                      calendarClassName="react-datepicker-custom"
                      wrapperClassName="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Fecha de Finalización</h4>
                    <DatePicker
                      selected={dueDateInput ? new Date(dueDateInput) : null}
                      onChange={(date) => {
                        const formattedDate = date ? date.toISOString().split('T')[0] : null;
                        setDueDateInput(formattedDate);
                        updateTaskDetails({ dueDate: formattedDate });
                      }}
                      dateFormat="dd/MM/yyyy"
                      placeholderText="Seleccionar fecha"
                      className={`w-full p-2.5 rounded-lg text-sm border outline-none cursor-pointer ${currentTheme.header}`}
                      popperClassName="react-datepicker-popper"
                      calendarClassName="react-datepicker-custom"
                      wrapperClassName="w-full"
                    />
                  </div>
                </div>

                {/* Botones */}
                <div className="space-y-3 pt-4 border-t border-inherit">
                  <button 
                    onClick={async () => {
                      await updateTaskDetails({ description: descriptionInput });
                      toast.success('¡Cambios guardados correctamente!', {
                        icon: '🚀',
                        duration: 2500,
                        style: {
                          background: '#0f172a',
                          color: '#e2e8f0',
                          border: '1px solid #22c55e',
                          borderRadius: '12px',
                          padding: '16px 24px',
                          fontSize: '14px',
                          fontWeight: '600',
                          boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                        },
                      });
                      setTimeout(() => setActiveTaskId(null), 500);
                    }}
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm rounded-lg transition-colors shadow-md cursor-pointer"
                  >
                    💾 Guardar Cambios
                  </button>

                  <button 
                    onClick={() => handleCompleteTask(activeTask.id)}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-lg transition-colors shadow-md cursor-pointer flex items-center justify-center gap-2"
                  >
                    ✅ Completar Tarea
                  </button>

                  <button 
                    onClick={() => handleDeleteTask(activeTask.id)}
                    className="w-full py-2.5 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white font-bold text-sm rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    🗑️ Eliminar Tarea
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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

      {/* Estilos de scrollbar y DatePicker */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(71, 85, 105, 0.3);
          border-radius: 10px;
        }
        .custom-scrollbar:hover::-webkit-scrollbar-thumb {
          background: rgba(71, 85, 105, 0.6);
        }

        /* Estilos del calendario oscuro */
        .react-datepicker {
          background-color: #0f172a !important;
          border: 1px solid #334155 !important;
          border-radius: 12px !important;
          font-family: inherit !important;
          box-shadow: 0 20px 60px rgba(0,0,0,0.5) !important;
        }
        .react-datepicker__header {
          background-color: #0f172a !important;
          border-bottom: 1px solid #334155 !important;
          border-radius: 12px 12px 0 0 !important;
          padding-top: 12px !important;
        }
        .react-datepicker__current-month {
          color: #e2e8f0 !important;
          font-weight: 600 !important;
          font-size: 14px !important;
        }
        .react-datepicker__day-name {
          color: #94a3b8 !important;
          font-weight: 500 !important;
          font-size: 12px !important;
        }
        .react-datepicker__day {
          color: #e2e8f0 !important;
          border-radius: 8px !important;
          transition: all 0.15s ease !important;
        }
        .react-datepicker__day:hover {
          background-color: #1e293b !important;
          color: #a5b4fc !important;
        }
        .react-datepicker__day--selected {
          background-color: #4f46e5 !important;
          color: white !important;
          font-weight: 600 !important;
        }
        .react-datepicker__day--keyboard-selected {
          background-color: #1e293b !important;
          color: #a5b4fc !important;
        }
        .react-datepicker__day--today {
          font-weight: 600 !important;
          border: 1px solid #4f46e5 !important;
          background-color: rgba(79, 70, 229, 0.1) !important;
        }
        .react-datepicker__navigation-icon::before {
          border-color: #94a3b8 !important;
        }
        .react-datepicker__navigation:hover * {
          border-color: #e2e8f0 !important;
        }
        .react-datepicker__triangle {
          display: none !important;
        }
        .react-datepicker-popper {
          z-index: 100 !important;
        }
        .react-datepicker__day--outside-month {
          color: #475569 !important;
          pointer-events: none !important;
        }
        .react-datepicker__day--outside-month:hover {
          background: transparent !important;
        }
      `}</style>
    </div>
  );
}