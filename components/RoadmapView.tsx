
import React, { useState } from 'react';
import { Roadmap, MindMapNode, RoadmapPhase } from '../types';
import { CheckCircle2, ArrowRight, Sparkles, BrainCircuit, ChevronDown, Target, ListTodo, Calendar, Edit2, Clock } from 'lucide-react';

interface RoadmapViewProps {
  roadmap: Roadmap | null;
  isLoading: boolean;
  onGenerate: () => void;
  targetDate: string;
  onTargetDateChange: (date: string) => void;
}

const MindMapNodeView: React.FC<{ node: MindMapNode; depth?: number }> = ({ node, depth = 0 }) => {
  const statusColor = {
    acquired: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.2)]',
    'in-progress': 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    missing: 'bg-slate-700/50 text-slate-400 border-slate-600/50 border-dashed opacity-70'
  };

  return (
    <div className="flex flex-col items-center animate-fade-in">
      <div className={`
        relative rounded-full flex items-center justify-center text-center transition-all duration-300 cursor-pointer hover:scale-105 border
        ${statusColor[node.status] || statusColor.missing}
        ${depth === 0 ? 'w-32 h-32 text-sm font-bold z-10 shadow-2xl' : depth === 1 ? 'w-24 h-24 text-xs z-0' : 'w-20 h-20 text-[10px]'}
      `}>
        <span className="px-2">{node.label}</span>
        {node.status === 'acquired' && <CheckCircle2 className="absolute -top-1 -right-1 w-5 h-5 text-emerald-400 bg-black rounded-full" />}
      </div>
      
      {node.children && node.children.length > 0 && (
        <div className="flex gap-4 mt-8 relative">
          {node.children.map((child) => (
            <div key={child.id} className="relative flex flex-col items-center">
               <div className="absolute -top-8 left-1/2 w-px h-8 bg-slate-600/50 -z-10"></div>
               <MindMapNodeView node={child} depth={depth + 1} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const PhaseCard: React.FC<{ phase: RoadmapPhase; index: number }> = ({ phase, index }) => {
  const [isExpanded, setIsExpanded] = useState(index === 0);

  return (
    <div className="relative pl-12 md:pl-20 group">
      <div className="absolute left-[27px] top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500/30 to-transparent group-last:hidden"></div>
      <div className={`absolute left-0 top-0 w-14 h-14 rounded-full border-2 flex items-center justify-center z-10 transition-all duration-300 ${isExpanded ? 'bg-primary border-primary shadow-[0_0_20px_rgba(59,130,246,0.4)] text-white' : 'bg-[#020617] border-white/10 text-slate-500 hover:border-primary/50'}`}>
         <span className="text-xl font-bold">{index + 1}</span>
      </div>

      <div className={`glass-panel rounded-2xl transition-all duration-500 overflow-hidden border ${isExpanded ? 'bg-white/5 border-white/10' : 'hover:bg-white/5 border-transparent'}`}>
         <div className="p-6 flex items-center justify-between cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <h3 className={`text-lg font-bold transition-colors ${isExpanded ? 'text-white' : 'text-slate-300'}`}>{phase.title}</h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/20">{phase.duration}</span>
              </div>
              <p className="text-sm text-slate-400">{phase.description}</p>
            </div>
            <div className={`p-2 rounded-full transition-transform duration-300 ${isExpanded ? 'rotate-180 bg-white/10' : ''}`}>
               <ChevronDown className="w-5 h-5 text-slate-400" />
            </div>
         </div>

         {isExpanded && (
           <div className="px-6 pb-8 animate-fade-in space-y-8 border-t border-white/5 pt-6">
              <div>
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2"><Target className="w-4 h-4" /> Key Outcomes</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                   {phase.goals?.map((goal, i) => (
                     <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-black/20 border border-white/5">
                        <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-slate-300">{goal}</span>
                     </div>
                   ))}
                </div>
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2"><ListTodo className="w-4 h-4" /> Action Items</h4>
                <div className="space-y-3">
                   {phase.tasks?.map((task) => (
                     <div key={task.id} className="p-4 rounded-xl bg-white/5 border border-white/5 hover:border-primary/30 hover:bg-white/10 transition-all">
                        <div className="flex items-start justify-between gap-4">
                           <div className="flex-1">
                              <h5 className="text-sm font-medium text-white mb-1">{task.title}</h5>
                              <p className="text-xs text-slate-400 leading-relaxed">{task.description}</p>
                           </div>
                           <div className="text-[10px] font-mono text-slate-600 bg-black/20 px-2 py-1 rounded">{task.timeEstimate}</div>
                        </div>
                     </div>
                   ))}
                </div>
              </div>
           </div>
         )}
      </div>
    </div>
  );
};

const RoadmapView: React.FC<RoadmapViewProps> = ({ roadmap, isLoading, onGenerate, targetDate, onTargetDateChange }) => {
  const [isEditingDate, setIsEditingDate] = useState(false);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-6">
        <div className="w-16 h-16 glass rounded-full flex items-center justify-center border border-primary/20 shadow-glow">
          <BrainCircuit className="w-8 h-8 text-primary animate-pulse" />
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Architecting Your Path...</h2>
          <p className="text-slate-400 animate-pulse">Consulting Gemini for strategic milestones</p>
        </div>
      </div>
    );
  }

  if (!roadmap) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-8 animate-fade-in px-4">
        <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-blue-500/20 to-purple-500/20 flex items-center justify-center border border-white/10 shadow-2xl">
          <Calendar className="w-10 h-10 text-blue-300" />
        </div>
        <div className="text-center max-w-md">
          <h2 className="text-3xl font-bold text-white mb-3">Schedule Your Interview</h2>
          <p className="text-slate-400 mb-8">
            Select your target date to generate a tailored preparation timeline.
          </p>
          
          <div className="w-full max-w-sm mx-auto space-y-6 bg-white/5 p-8 rounded-[2rem] border border-white/10 backdrop-blur-xl">
             <div className="space-y-2">
               <label className="text-[10px] uppercase font-black text-slate-500 tracking-widest ml-1">Interview Date</label>
               <input 
                 type="date" 
                 value={targetDate}
                 onChange={(e) => onTargetDateChange(e.target.value)}
                 className="w-full glass-input rounded-2xl px-5 py-4 text-white font-bold"
               />
             </div>
             <button 
                onClick={onGenerate}
                disabled={!targetDate}
                className="w-full py-4 bg-primary hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-2xl font-black text-sm tracking-widest transition-all shadow-lg flex items-center justify-center gap-2"
             >
                GENERATE ROADMAP <ArrowRight className="w-4 h-4" />
             </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-12 animate-fade-in pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 glass-panel p-8 rounded-[2.5rem]">
        <div>
           <div className="flex items-center gap-3 mb-2">
              <Sparkles className="w-5 h-5 text-accent" />
              <h2 className="text-3xl font-black text-white tracking-tight">Strategy Map</h2>
           </div>
           <p className="text-slate-400">Preparation milestones for your role as {roadmap.jobTitle}</p>
        </div>
        
        <div className="flex items-center gap-4 bg-white/5 p-3 pr-6 rounded-2xl border border-white/10">
           <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center text-blue-400">
              <Calendar className="w-6 h-6" />
           </div>
           <div>
              <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Interview Target</p>
              {isEditingDate ? (
                <div className="flex items-center gap-2 mt-1">
                   <input 
                     type="date" 
                     value={targetDate} 
                     onChange={(e) => onTargetDateChange(e.target.value)}
                     onBlur={() => setIsEditingDate(false)}
                     autoFocus
                     className="bg-black/40 border border-white/10 rounded px-2 py-1 text-xs text-white outline-none"
                   />
                </div>
              ) : (
                <div className="flex items-center gap-2 mt-1">
                   <span className="text-sm font-black text-white">{targetDate || 'Not Set'}</span>
                   <button onClick={() => setIsEditingDate(true)} className="p-1 hover:bg-white/10 rounded text-slate-400 transition-colors">
                      <Edit2 className="w-3 h-3" />
                   </button>
                </div>
              )}
           </div>
        </div>
      </div>

      <div className="glass-panel rounded-[2.5rem] p-12 overflow-hidden bg-gradient-to-b from-white/[0.03] to-transparent">
        <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] text-center mb-12">Knowledge Mind Map</h3>
        <div className="overflow-x-auto py-8">
           <MindMapNodeView node={roadmap.mindMap} />
        </div>
      </div>

      <div className="space-y-8">
        <div className="flex items-center gap-4 px-4">
           <Clock className="w-5 h-5 text-blue-400" />
           <h3 className="text-xl font-bold text-white">Execution Phases</h3>
           <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent"></div>
        </div>
        <div className="space-y-6">
          {roadmap.phases.map((phase, idx) => (
            <PhaseCard key={phase.id} phase={phase} index={idx} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default RoadmapView;
