import React from 'react';
import { UploadCloud, Server, Cpu, CheckCircle, Database, Loader2 } from 'lucide-react';
import { AppState } from '../types';

interface ProcessingViewProps {
  state: AppState;
}

const steps = [
  { 
    id: AppState.UPLOADING, 
    label: 'Ingesting to Cloud Storage', 
    sub: 'S3 Event Notification → SQS Queue',
    icon: UploadCloud 
  },
  { 
    id: AppState.PROCESSING, 
    label: 'Serverless Execution',
    sub: 'Lambda Ingest → NLP Parsing', 
    icon: Server 
  },
  { 
    id: AppState.ANALYZING, 
    label: 'Matching Engine', 
    sub: 'Vector Embedding → Similarity Score',
    icon: Cpu 
  },
];

const ProcessingView: React.FC<ProcessingViewProps> = ({ state }) => {
  const getCurrentStepIndex = () => {
    if (state === AppState.COMPLETE) return 3;
    const order = [AppState.IDLE, AppState.UPLOADING, AppState.PROCESSING, AppState.ANALYZING];
    return order.indexOf(state) - 1;
  };

  const activeIndex = getCurrentStepIndex();

  return (
    <div className="w-full max-w-2xl mx-auto glass-panel rounded-3xl p-10 relative overflow-hidden">
      {/* Scanning Line Animation */}
      <div className="absolute top-0 left-0 w-full h-1 bg-blue-400/50 shadow-[0_0_20px_rgba(96,165,250,0.8)] animate-scan pointer-events-none z-20 opacity-30"></div>
      
      <div className="flex flex-col items-center mb-10 relative z-10">
         <div className="w-20 h-20 glass rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(59,130,246,0.2)] border border-blue-500/20">
            <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
         </div>
         <h3 className="text-2xl font-bold text-white text-center tracking-tight">Processing Candidate</h3>
         <p className="text-sm text-blue-300/70 mt-1 font-mono">Pipeline Active • {new Date().toLocaleTimeString()}</p>
      </div>
      
      <div className="space-y-4 relative z-10">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isActive = index === activeIndex;
          const isCompleted = index < activeIndex;

          return (
            <div 
              key={step.id}
              className={`relative flex items-center gap-5 p-5 rounded-2xl transition-all duration-500 border ${
                isActive ? 'bg-white/10 border-blue-500/30 shadow-[0_0_20px_rgba(59,130,246,0.1)]' : 
                isCompleted ? 'bg-black/20 border-green-500/10' : 'bg-transparent border-transparent opacity-30'
              }`}
            >
              <div className={`
                w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 flex-shrink-0 border
                ${isActive ? 'bg-blue-500/20 text-blue-300 border-blue-500/40 shadow-[0_0_15px_rgba(59,130,246,0.3)]' : 
                  isCompleted ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-white/5 text-slate-500 border-white/5'}
              `}>
                {isCompleted ? <CheckCircle className="w-6 h-6" /> : <Icon className="w-6 h-6" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`font-medium text-base ${isActive ? 'text-white' : isCompleted ? 'text-green-400' : 'text-slate-400'}`}>
                  {step.label}
                </p>
                <p className="text-xs text-slate-500 mt-1 font-mono uppercase tracking-wider truncate">
                  {step.sub}
                </p>
                
                {isActive && (
                  <div className="w-full bg-black/30 h-1 mt-4 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 animate-progress-bar w-full origin-left shadow-[0_0_10px_rgba(59,130,246,0.8)]"></div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <style>{`
        @keyframes scan {
          0% { top: 0%; opacity: 0; }
          10% { opacity: 0.5; }
          90% { opacity: 0.5; }
          100% { top: 100%; opacity: 0; }
        }
        .animate-scan {
          animation: scan 3s linear infinite;
        }
        @keyframes progress-bar {
          0% { transform: scaleX(0); }
          100% { transform: scaleX(1); }
        }
        .animate-progress-bar {
          animation: progress-bar 1.5s ease-out infinite;
        }
      `}</style>
    </div>
  );
};

export default ProcessingView;