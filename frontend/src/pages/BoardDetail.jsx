import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, useDroppable } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { io } from 'socket.io-client';

// --- SortableTask (sin cambios) ---
function SortableTask({ task, onDelete, theme }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const isLight = theme === 'light';

  const priorityColors = {
    alta: 'bg-red-500/20 text-red-400 border-red-500/30',
    media: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    baja: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...attributes} 
      {...listeners}
      className={`p-4 rounded-2xl border text-sm flex flex-col gap-3 group cursor-grab active:cursor-grabbing transition-all select-none shadow-sm ${
        isLight 
          ? 'bg-white border-slate-200 text-slate-800 hover:border-indigo-300' 
          : 'bg-slate-900/90 border-slate-700/60 text-slate-200 hover:border-indigo-500/50'
      }`}
    >
      <div className="flex justify-between items-start gap-2">
        <span className="font-medium leading-relaxed flex-1">{task.content}</span>
        <button 
          type="button"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={() => onDelete(task.id)}
          className="text-slate-400 hover:text-red-500 font-bold opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer p-1"
          title="Eliminar tarea"
        >
          ✕
        </button>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-slate-700/20 text-xs">
        <span className={`px-2.5 py-0.5 rounded-full font-bold uppercase border ${priorityColors[task.priority] || priorityColors.media}`}>
          {task.priority || 'media'}
        </span>

        {task.dueDate && (
          <span className="text-slate-400 font-semibold flex items-center gap-1">
            📅 {task.dueDate}
          </span>
        )}
      </div>
    </div>
  );
}

// --- ColumnContainer (sin cambios) ---
function ColumnContainer({ column, onDeleteTask, activeColumnId, setActiveColumnId, newTaskContent, setNewTaskContent, taskPriority, setTaskPriority, taskDueDate, setTaskDueDate, handleCreateTask, theme }) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });
  const isLight = theme === 'light';

  return (
    <div 
      ref={setNodeRef} 
      className={`w-80 shrink-0 rounded-3xl p-5 flex flex-col max-h-full border transition-colors shadow-lg ${
        isLight 
          ? `bg-slate-100 ${isOver ? 'border-indigo-400 bg-indigo-50/40' : 'border-slate-200'}` 
          : `bg-slate-900/40 border-slate-800 ${isOver ? 'border-indigo-500 bg-indigo-950/20' : ''}`
      }`}
    >
      <div className="flex justify-between items-center mb-4 px-1">
        <h3 className={`font-bold text-sm tracking-wide uppercase ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>{column.title}</h3>
        <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${isLight ? 'bg-slate-200 text-slate-600' : 'bg-slate-800 text-slate-400'}`}>
          {column.tasks?.length || 0}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 pr-1 min-h-[180px]">
        <SortableContext items={column.tasks?.map(t => t.id) || []} strategy={verticalListSortingStrategy}>
          {column.tasks?.map((task) => (
            <SortableTask key={task.id} task={task} onDelete={onDeleteTask} theme={theme} />
          ))}
        </SortableContext>
      </div>

      <div className="mt-4 pt-2">
        {activeColumnId === column.id ? (
          <form onSubmit={(e) => handleCreateTask(e, column.id)} className="space-y-3">
            <textarea 
              rows="2"
              value={newTaskContent}
              onChange={(e) => setNewTaskContent(e.target.value)}
              placeholder="¿Qué tarea deseas agregar?"
              className={`w-full p-3 border rounded-xl text-sm outline-none font-medium ${
                isLight 
                  ? 'bg-white border-slate-200 text-slate-800 focus:ring-2 focus:ring-indigo-600' 
                  : 'bg-slate-950 border-slate-800 text-white focus:ring-2 focus:ring-indigo-600'
              }`}
              required
              autoFocus
            />

            <div className="flex gap-2">
              <select 
                value={taskPriority}
                onChange={(e) => setTaskPriority(e.target.value)}
                className={`flex-1 p-2 border rounded-xl text-xs font-bold outline-none ${isLight ? 'bg-white border-slate-200 text-slate-700' : 'bg-slate-950 border-slate-800 text-slate-300'}`}
              >
                <option value="baja">Baja</option>
                <option value="media">Media</option>
                <option value="alta">Alta</option>
              </select>

              <input 
                type="date"
                value={taskDueDate}
                onChange={(e) => setTaskDueDate(e.target.value)}
                className={`p-2 border rounded-xl text-xs font-semibold outline-none ${isLight ? 'bg-white border-slate-200 text-slate-700' : 'bg-slate-950 border-slate-800 text-slate-300'}`}
              />
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button 
                type="button" 
                onClick={() => setActiveColumnId(null)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg cursor-pointer ${isLight ? 'text-slate-500 hover:bg-slate-200' : 'text-slate-400 hover:bg-slate-800'}`}
              >
                Cancelar
              </button>
              <button 
                type="submit"
                className="px-4 py-1.5 text-xs bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-500 cursor-pointer shadow-md"
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
              isLight ? 'text-indigo-600 hover:bg-indigo-50' : 'text-indigo-400 hover:bg-slate-800/60'
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
  
  const [newTaskContent, setNewTaskContent] = useState('');
  const [taskPriority, setTaskPriority] = useState('media');
  const [taskDueDate, setTaskDueDate] = useState('');
  const [activeColumnId, setActiveColumnId] = useState(null);

  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');

  const [notifications, setNotifications] = useState([]);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('colabty_theme') || 'dark');

  // --- Estados para el chat ---
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const messagesEndRef = useRef(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // Al cargar el tablero, traemos el historial del chat
  useEffect(() => {
    if (!id) return;

    const fetchMessages = async () => {
      try {
        const response = await fetch(`http://localhost:4000/api/boards/${id}/messages`);
        const data = await response.json();
        if (response.ok) {
          setMessages(data); // Rellena el chat con lo que se habló antes
        }
      } catch (error) {
        console.error('Error al cargar historial de chat:', error);
      }
    };

    fetchMessages();
  }, [id]);

  // --- Efecto para cargar usuario y datos del tablero ---
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

  // --- Efecto para el socket (chat) ---
  useEffect(() => {
    if (!user || !id) return;

    const newSocket = io('http://localhost:4000');
    setSocket(newSocket);

    // Unirse a la sala del tablero
    newSocket.emit('join_board', id);

    // Escuchar mensajes de esta sala
    newSocket.on('receive_message', (data) => {
      setMessages((prev) => [...prev, data]);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [id, user]);

  // --- Scroll automático al último mensaje ---
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
        body: JSON.stringify({ 
          content: newTaskContent, 
          columnId,
          priority: taskPriority,
          dueDate: taskDueDate || null
        })
      });

      if (response.ok) {
        fetchBoardDetails(id);
        setNewTaskContent('');
        setTaskPriority('media');
        setTaskDueDate('');
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

  // --- Enviar mensaje de chat ---
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

  // --- Temas ---
  const themesConfig = {
    dark: {
      bg: 'bg-slate-950 text-slate-100',
      sidebar: 'bg-slate-900/60 border-slate-800',
      header: 'bg-slate-900/40 border-slate-800/80',
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
    return <div className="flex h-screen items-center justify-center bg-slate-950 text-slate-400 font-sans">Cargando tablero...</div>;
  }

  return (
    <div className={`flex h-screen ${currentTheme.bg} font-sans overflow-hidden transition-colors duration-300`}>
      {/* Sidebar */}
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
        {/* Header */}
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

            {/* Botón para abrir/cerrar chat */}
            <button 
              onClick={() => setIsChatOpen(!isChatOpen)}
              className="bg-slate-800 hover:bg-slate-700 text-indigo-400 font-bold px-4 py-2.5 rounded-xl text-sm transition-colors flex items-center gap-2 cursor-pointer border border-slate-700/50 shadow-md"
            >
              <span>💬 Chat del Tablero</span>
            </button>

            <button 
              onClick={() => setIsInviteModalOpen(true)}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-4 py-2.5 rounded-xl text-sm transition-colors flex items-center gap-2 cursor-pointer shadow-md"
            >
              <span>+ Invitar Miembro</span>
            </button>
          </div>
        </header>

        {/* Contenido del tablero (DnD) */}
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
                taskPriority={taskPriority}
                setTaskPriority={setTaskPriority}
                taskDueDate={taskDueDate}
                setTaskDueDate={setTaskDueDate}
                handleCreateTask={handleCreateTask}
                theme={theme}
              />
            ))}
          </div>
        </DndContext>
      </main>

      {/* Panel flotante de Chat */}
      {isChatOpen && (
        <div className={`fixed bottom-4 right-4 w-96 h-[500px] ${currentTheme.chatBg} border rounded-2xl shadow-2xl flex flex-col overflow-hidden z-50 transition-all duration-300`}>
          {/* Cabecera del chat */}
          <div className={`flex justify-between items-center p-4 border-b ${theme === 'light' ? 'border-slate-200' : 'border-slate-800'}`}>
            <h3 className={`font-bold ${currentTheme.textMain}`}>💬 Chat - {board?.title}</h3>
            <button 
              onClick={() => setIsChatOpen(false)}
              className="text-slate-400 hover:text-white font-bold text-xl cursor-pointer"
            >
              ✕
            </button>
          </div>

          {/* Lista de mensajes */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
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
                  {/* 🔥 CORRECCIÓN AQUÍ: msg.content (o msg.message como fallback) */}
                  <div>{msg.content || msg.message}</div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input para enviar mensajes */}
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

      {/* Modal Invitar (sin cambios) */}
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