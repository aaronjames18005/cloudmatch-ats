
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Task, Roadmap } from '../types';
import { Calendar, CheckSquare, Clock, X, ListChecks, ChevronRight, AlertCircle, Flag, Coffee, ArrowRight, CheckCircle2, Sparkles, Smile, MessageSquare, Star, Send, Play, Layout, Kanban, GripVertical } from 'lucide-react';

interface TaskBoardProps {
  roadmap: Roadmap | null;
}

// --- Confetti Component ---
const Confetti = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-[200] overflow-hidden flex items-center justify-center">
      <style>
        {`
          @keyframes pop {
            0% { transform: translate(-50%, -50%) scale(0); opacity: 1; }
            50% { opacity: 1; }
            100% { transform: translate(var(--tx), var(--ty)) scale(1); opacity: 0; }
          }
          .confetti-particle {
            position: absolute;
            left: 50%;
            top: 50%;
            width: 8px;
            height: 8px;
            border-radius: 50%;
            animation: pop 1s ease-out forwards;
          }
        `}
      </style>
      {Array.from({ length: 60 }).map((_, i) => {
         const angle = Math.random() * 360;
         const distance = Math.random() * 400 + 50;
         const tx = Math.cos(angle * Math.PI / 180) * distance + 'px';
         const ty = Math.sin(angle * Math.PI / 180) * distance + 'px';
         const color = ['#60A5FA', '#34D399', '#F472B6', '#FBBF24', '#A78BFA', '#FFFFFF'][Math.floor(Math.random() * 6)];
         return (
           <div 
             key={i} 
             className="confetti-particle"
             style={{ 
               '--tx': tx, 
               '--ty': ty, 
               backgroundColor: color,
               animationDelay: Math.random() * 0.2 + 's',
               width: Math.random() * 8 + 4 + 'px',
               height: Math.random() * 8 + 4 + 'px'
             } as any} 
           />
         );
      })}
    </div>
  );
};

// --- Feedback Modal ---
const FeedbackModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    setSubmitted(true);
    setTimeout(onClose, 2000);
  };

  if (submitted) {
     return (
        <div className="fixed inset-0 z-[160] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
           <Confetti />
           <div className="glass-panel p-8 rounded-3xl text-center">
              <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                 <CheckCircle2 className="w-8 h-8 text-green-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Thank You!</h3>
              <p className="text-slate-400">Your feedback helps improve RoleCoach.</p>
           </div>
        </div>
     )
  }

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
       <div className="w-full max-w-md glass-panel rounded-3xl p-8 relative border border-white/10 bg-[#0f172a] shadow-2xl">
          <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white">
             <X className="w-5 h-5" />
          </button>
          
          <div className="text-center mb-8">
             <h2 className="text-2xl font-bold text-white mb-2">Interview Complete</h2>
             <p className="text-slate-400 text-sm">We hope you smashed it! How was your experience?</p>
          </div>

          <div className="space-y-6">
             <div className="text-center">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 block">Rate your preparation</label>
                <div className="flex justify-center gap-2">
                   {[1, 2, 3, 4, 5].map((star) => (
                      <button 
                        key={star}
                        onClick={() => setRating(star)}
                        className={`p-2 transition-all hover:scale-110 ${rating >= star ? 'text-yellow-400' : 'text-slate-600'}`}
                      >
                         <Star className={`w-8 h-8 ${rating >= star ? 'fill-current' : ''}`} />
                      </button>
                   ))}
                </div>
             </div>

             <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 block">What can we improve?</label>
                <textarea 
                   value={comment}
                   onChange={(e) => setComment(e.target.value)}
                   placeholder="Share your thoughts..."
                   className="w-full h-32 glass-input rounded-xl p-4 text-sm resize-none"
                />
             </div>

             <button 
                onClick={handleSubmit}
                disabled={rating === 0}
                className="w-full py-3 bg-primary hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold shadow-lg transition-all flex items-center justify-center gap-2"
             >
                <Send className="w-4 h-4" /> Submit Review
             </button>
          </div>
       </div>
    </div>
  );
};

// --- Task Detail Modal ---
const TaskDetailModal: React.FC<{ 
  task: Task; 
  onClose: () => void; 
  onComplete: () => void;
  isCompleted: boolean;
}> = ({ task, onClose, onComplete, isCompleted }) => {
  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg glass-panel rounded-3xl p-6 shadow-2xl border border-white/10 relative bg-[#0f172a]">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-6">
           <div className="flex items-center gap-2 mb-2">
             <span className={`text-[10px] px-2 py-0.5 rounded border uppercase font-bold tracking-wider ${
                task.priority === 'High' ? 'bg-red-500/10 text-red-300 border-red-500/20' : 'bg-blue-500/10 text-blue-300 border-blue-500/20'
             }`}>
               {task.priority} Priority
             </span>
             <span className="text-[10px] px-2 py-0.5 rounded border border-white/10 bg-white/5 text-slate-400 uppercase tracking-wider">
               {task.category}
             </span>
             {isCompleted && (
               <span className="text-[10px] px-2 py-0.5 rounded bg-green-500/20 text-green-400 border border-green-500/20 uppercase tracking-wider flex items-center gap-1">
                 <CheckCircle2 className="w-3 h-3" /> Completed
               </span>
             )}
           </div>
           <h3 className={`text-xl font-bold text-white leading-snug ${isCompleted ? 'line-through opacity-50' : ''}`}>{task.title}</h3>
        </div>

        <div className="space-y-6">
           <div className="bg-white/5 rounded-xl p-4 border border-white/5">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                <AlertCircle className="w-3 h-3" /> Why this matters
              </h4>
              <p className="text-sm text-slate-300 leading-relaxed">
                {task.description}
              </p>
           </div>

           <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                <ListChecks className="w-3 h-3" /> Checklist
              </h4>
              <div className="space-y-2">
                {task.actionItems && task.actionItems.length > 0 ? (
                  task.actionItems.map((item, i) => (
                    <label key={i} className="flex items-start gap-3 p-3 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/5 cursor-pointer transition-all group">
                       <input 
                         type="checkbox" 
                         className="mt-1 w-4 h-4 rounded border-slate-600 bg-transparent checked:bg-primary checked:border-primary"
                         defaultChecked={isCompleted}
                         disabled={isCompleted} 
                       />
                       <span className={`text-sm text-slate-300 group-hover:text-white ${isCompleted ? 'line-through opacity-50' : ''}`}>{item}</span>
                    </label>
                  ))
                ) : (
                  <p className="text-sm text-slate-500 italic">No specific sub-tasks.</p>
                )}
              </div>
           </div>
        </div>

        <div className="mt-8 pt-4 border-t border-white/10 flex justify-between items-center">
           <div className="flex items-center gap-2 text-xs text-slate-500">
              <Clock className="w-3.5 h-3.5" />
              Est. {task.timeEstimate}
           </div>
           <button 
             onClick={onComplete}
             disabled={isCompleted}
             className={`px-6 py-2 rounded-full font-bold text-sm transition-all flex items-center gap-2 shadow-lg ${
               isCompleted 
                 ? 'bg-green-500/20 text-green-400 cursor-default border border-green-500/20' 
                 : 'bg-primary hover:bg-blue-600 text-white shadow-primary/20'
             }`}
           >
             {isCompleted ? (
               <>
                 <CheckCircle2 className="w-4 h-4" /> Done
               </>
             ) : (
               'Mark Complete'
             )}
           </button>
        </div>
      </div>
    </div>
  );
};

const TaskBoard: React.FC<TaskBoardProps> = ({ roadmap }) => {
  const [viewMode, setViewMode] = useState<'planner' | 'board'>('board');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [activeDayIndex, setActiveDayIndex] = useState<number>(0); 
  const [showConfetti, setShowConfetti] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [draggingTaskId, setDraggingTaskId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Load initial tasks from roadmap
  useEffect(() => {
    if (roadmap?.phases) {
      const flattened = roadmap.phases.flatMap(p => p.tasks || []);
      setTasks(flattened);
    }
  }, [roadmap]);

  // View start date tracking
  const [viewStartDate, setViewStartDate] = useState(() => {
    if (roadmap?.startDate) {
        const parts = roadmap.startDate.split('-');
        if (parts.length === 3) {
            return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        }
    }
    return new Date();
  });

  useEffect(() => {
    if (roadmap?.startDate) {
        const parts = roadmap.startDate.split('-');
        if (parts.length === 3) {
            setViewStartDate(new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2])));
        }
    }
  }, [roadmap?.startDate]);

  const interviewDateObj = useMemo(() => {
    if (!roadmap?.interviewDate) return null;
    const parts = roadmap.interviewDate.split('-');
    if (parts.length === 3) {
        return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    }
    return new Date(roadmap.interviewDate);
  }, [roadmap]);

  const calendarDates = useMemo(() => {
    const days = [];
    const start = new Date(viewStartDate);
    start.setHours(0,0,0,0);
    
    let numberOfDays = 7;
    if (interviewDateObj) {
      const diffTime = interviewDateObj.getTime() - start.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      numberOfDays = Math.max(7, diffDays + 1);
    }
    
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    for (let i = 0; i < numberOfDays; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      days.push({
        name: dayNames[d.getDay()], 
        date: d.getDate(),
        fullDate: d
      });
    }
    return days;
  }, [viewStartDate, interviewDateObj]);

  const isInterviewDay = (date: Date) => {
    if (!interviewDateObj) return false;
    return date.getDate() === interviewDateObj.getDate() && 
           date.getMonth() === interviewDateObj.getMonth() &&
           date.getFullYear() === interviewDateObj.getFullYear();
  };

  const isActiveDayInterview = useMemo(() => {
     if (!calendarDates[activeDayIndex]) return false;
     return isInterviewDay(calendarDates[activeDayIndex].fullDate);
  }, [activeDayIndex, calendarDates, interviewDateObj]);

  const todoTasks = useMemo(() => tasks.filter(t => t.status === 'todo'), [tasks]);
  const progressTasks = useMemo(() => tasks.filter(t => t.status === 'in-progress'), [tasks]);
  const doneTasks = useMemo(() => tasks.filter(t => t.status === 'done'), [tasks]);

  const tasksPerDay = useMemo(() => {
     if (calendarDates.length <= 1) return todoTasks.length;
     const workDays = Math.max(1, calendarDates.length - 1);
     return Math.max(1, Math.ceil(todoTasks.length / workDays));
  }, [todoTasks, calendarDates]);

  const dailyTasks = useMemo(() => {
    if (todoTasks.length === 0 || isActiveDayInterview) return [];
    const startIndex = activeDayIndex * tasksPerDay;
    return todoTasks.slice(startIndex, startIndex + tasksPerDay);
  }, [todoTasks, activeDayIndex, tasksPerDay, isActiveDayInterview]);

  const updateTaskStatus = (taskId: string, newStatus: Task['status']) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
    if (newStatus === 'done') {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 2000);
    }
  };

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    setDraggingTaskId(taskId);
    e.dataTransfer.setData('taskId', taskId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, status: Task['status']) => {
    e.preventDefault();
    setDragOverColumn(status);
  };

  const handleDrop = (e: React.DragEvent, newStatus: Task['status']) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    if (taskId) {
      updateTaskStatus(taskId, newStatus);
    }
    setDraggingTaskId(null);
    setDragOverColumn(null);
  };

  if (!roadmap) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] text-slate-500">
         <CheckSquare className="w-12 h-12 mb-4 opacity-20" />
         <p>No active plan. Generate a roadmap in the Path tab first.</p>
      </div>
    );
  }

  const daysToInterview = interviewDateObj 
    ? Math.ceil((interviewDateObj.getTime() - new Date().getTime()) / (1000 * 3600 * 24))
    : null;

  const isPostInterview = daysToInterview !== null && daysToInterview <= 0;

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      {showConfetti && <Confetti />}
      {showFeedback && <FeedbackModal onClose={() => setShowFeedback(false)} />}
      
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <h2 className="text-3xl font-bold text-white flex items-center gap-3">
          <CheckSquare className="w-8 h-8 text-green-400" /> 
          Action Center
        </h2>
        
        <div className="flex items-center gap-4">
           {/* View Toggle */}
           <div className="flex p-1 bg-black/30 rounded-xl border border-white/10 backdrop-blur-md">
              <button 
                onClick={() => setViewMode('planner')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${viewMode === 'planner' ? 'bg-white/10 text-white shadow-sm' : 'text-slate-500 hover:text-white'}`}
              >
                <Layout className="w-4 h-4" /> Planner
              </button>
              <button 
                onClick={() => setViewMode('board')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${viewMode === 'board' ? 'bg-white/10 text-white shadow-sm' : 'text-slate-500 hover:text-white'}`}
              >
                <Kanban className="w-4 h-4" /> Board
              </button>
           </div>

           <div className="text-right hidden md:block pl-4 border-l border-white/10">
             <p className="text-2xl font-bold text-white">{doneTasks.length}/{tasks.length}</p>
             <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Progress Rate</p>
           </div>
        </div>
      </div>

      {daysToInterview !== null && daysToInterview > 0 && (
        <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 border border-blue-500/20 rounded-2xl p-4 flex items-center gap-4">
           <div className="p-2 bg-blue-500/20 rounded-full">
             <Flag className="w-5 h-5 text-blue-300" />
           </div>
           <div>
             <h3 className="font-bold text-blue-100 text-sm">Target Countdown</h3>
             <p className="text-xs text-blue-300/70">{daysToInterview} days remaining. Status updates help track your readiness.</p>
           </div>
        </div>
      )}

      {viewMode === 'planner' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Daily Planner View */}
          <div className="lg:col-span-2 space-y-6">
              <div className="glass-panel rounded-3xl p-6 md:p-8 min-h-[600px] flex flex-col">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-blue-400" />
                    <h3 className="font-bold text-white">Daily Timeline</h3>
                  </div>
                </div>
                
                <div 
                    ref={scrollContainerRef}
                    className="flex overflow-x-auto gap-2 md:gap-4 mb-8 pb-4 snap-x snap-mandatory custom-scrollbar scroll-smooth"
                >
                    {calendarDates.map((day, i) => {
                      const isActive = activeDayIndex === i;
                      const isTargetDay = isInterviewDay(day.fullDate);
                      return (
                        <button 
                          key={i} 
                          onClick={() => setActiveDayIndex(i)}
                          className={`flex flex-col items-center p-2 md:p-3 rounded-2xl border transition-all duration-300 flex-shrink-0 min-w-[70px] md:min-w-[85px] snap-center ${
                            isActive 
                              ? 'bg-blue-500/20 border-blue-500/40 shadow-[0_0_15px_rgba(59,130,246,0.3)] scale-105 z-10' 
                              : isTargetDay ? 'bg-purple-500/10 border-purple-500/30' 
                              : 'bg-white/5 border-white/5 hover:bg-white/10 text-slate-400'
                          }`}
                        >
                          <span className={`text-[10px] md:text-xs font-bold uppercase tracking-wider ${isActive ? 'text-blue-300' : 'text-slate-500'}`}>{day.name}</span>
                          <span className={`text-lg md:text-xl font-bold mt-1 md:mt-2 ${isActive ? 'text-white' : 'text-slate-300'}`}>{day.date}</span>
                        </button>
                      );
                    })}
                </div>

                <div className="space-y-4 flex-1">
                    <div className="space-y-3 animate-fade-in" key={activeDayIndex}>
                      {isActiveDayInterview ? (
                        <div className="h-64 rounded-2xl border-2 border-dashed border-purple-500/30 flex flex-col items-center justify-center text-center p-6 bg-purple-500/[0.05]">
                            <div className="w-16 h-16 rounded-full bg-purple-500/20 flex items-center justify-center mb-4">
                              <Coffee className="w-8 h-8 text-purple-300" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Interview Day</h3>
                            <button onClick={() => setShowFeedback(true)} className="px-6 py-2 bg-purple-500 hover:bg-purple-600 text-white font-bold rounded-xl shadow-lg mt-4 transition-all">
                              I've Finished the Interview
                            </button>
                        </div>
                      ) : (
                        dailyTasks.length > 0 ? (
                          dailyTasks.map(task => (
                            <div 
                              key={task.id} 
                              onClick={() => setSelectedTask(task)}
                              className="flex items-center gap-4 p-4 rounded-2xl border bg-white/5 border-white/10 hover:bg-white/10 transition-all group cursor-pointer"
                            >
                              <div className="flex-1 min-w-0">
                                <h5 className="text-sm font-medium text-slate-200 truncate group-hover:text-white transition-colors">{task.title}</h5>
                                <p className="text-xs text-slate-500 truncate">{task.description}</p>
                              </div>
                              <ChevronRight className="w-4 h-4 text-slate-600" />
                            </div>
                          ))
                        ) : (
                          <div className="h-40 flex items-center justify-center text-slate-500 border border-dashed border-white/10 rounded-2xl">
                             No tasks scheduled for today.
                          </div>
                        )
                      )}
                    </div>
                </div>
              </div>
          </div>

          <div className="space-y-6">
              <div className="glass-panel rounded-3xl p-6">
                <h3 className="font-bold text-white mb-6">Master Completion</h3>
                <div className="relative w-40 h-40 mx-auto">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="45" stroke="#1e293b" strokeWidth="8" fill="transparent" />
                      <circle 
                        cx="50" cy="50" r="45" stroke="#3b82f6" strokeWidth="8" fill="transparent" 
                        strokeDasharray="283"
                        strokeDashoffset={283 - (doneTasks.length / (tasks.length || 1)) * 283}
                        strokeLinecap="round"
                        className="transition-all duration-1000"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center text-3xl font-bold text-white">
                      {Math.round((doneTasks.length / (tasks.length || 1)) * 100)}%
                    </div>
                </div>
              </div>
          </div>
        </div>
      ) : (
        /* Kanban Board View */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
           {[
             { id: 'todo', label: 'To Do', items: todoTasks, color: 'slate' },
             { id: 'in-progress', label: 'In Progress', items: progressTasks, color: 'blue' },
             { id: 'done', label: 'Done', items: doneTasks, color: 'green' }
           ].map(column => (
             <div 
               key={column.id}
               onDragOver={(e) => handleDragOver(e, column.id as any)}
               onDrop={(e) => handleDrop(e, column.id as any)}
               className={`flex flex-col h-full min-h-[600px] rounded-3xl transition-all duration-300 ${
                 dragOverColumn === column.id ? 'bg-white/10 scale-[1.01] shadow-glow' : 'bg-[#0f172a]/40 border border-white/5'
               }`}
             >
                <div className="p-5 flex items-center justify-between border-b border-white/5">
                   <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${
                        column.id === 'todo' ? 'bg-slate-500' : column.id === 'in-progress' ? 'bg-blue-500' : 'bg-green-500 shadow-[0_0_8px_#10b981]'
                      }`} />
                      <h3 className="font-bold text-white text-sm">{column.label}</h3>
                   </div>
                   <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded-full text-slate-500 font-bold">{column.items.length}</span>
                </div>

                <div className="p-4 flex-1 space-y-4">
                   {column.items.length > 0 ? (
                     column.items.map(task => (
                       <div 
                         key={task.id}
                         draggable
                         onDragStart={(e) => handleDragStart(e, task.id)}
                         onClick={() => setSelectedTask(task)}
                         className={`p-4 rounded-2xl glass-panel border border-white/10 cursor-grab active:cursor-grabbing group transition-all hover:border-white/20 hover:bg-white/5 ${
                           draggingTaskId === task.id ? 'opacity-30' : 'opacity-100'
                         }`}
                       >
                          <div className="flex items-start justify-between mb-2">
                             <div className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${
                               task.priority === 'High' ? 'bg-red-500/10 text-red-400' : 'bg-blue-500/10 text-blue-400'
                             }`}>
                                {task.priority}
                             </div>
                             <GripVertical className="w-3 h-3 text-slate-700 group-hover:text-slate-500 transition-colors" />
                          </div>
                          <h4 className={`text-sm font-bold leading-tight ${column.id === 'done' ? 'text-slate-500 line-through' : 'text-slate-200'}`}>
                            {task.title}
                          </h4>
                          <div className="mt-4 flex items-center justify-between text-[10px] text-slate-500">
                             <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {task.timeEstimate}</span>
                             <span className="opacity-0 group-hover:opacity-100 transition-opacity">View Detail →</span>
                          </div>
                       </div>
                     ))
                   ) : (
                     <div className="h-full flex flex-col items-center justify-center opacity-20 py-10">
                        <Smile className="w-8 h-8 mb-2" />
                        <p className="text-[10px] uppercase font-bold tracking-widest">No Tasks</p>
                     </div>
                   )}
                </div>
             </div>
           ))}
        </div>
      )}

      {selectedTask && (
        <TaskDetailModal 
          task={selectedTask} 
          onClose={() => setSelectedTask(null)}
          onComplete={() => {
            updateTaskStatus(selectedTask.id, 'done');
            setSelectedTask(null);
          }}
          isCompleted={selectedTask.status === 'done'}
        />
      )}
    </div>
  );
};

export default TaskBoard;
