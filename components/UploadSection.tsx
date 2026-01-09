
import React, { useState, useRef, useCallback } from 'react';
import { UploadCloud, Briefcase, Sparkles, ArrowRight, FileCheck, RefreshCw, AlertCircle, FileX, Info, CheckCircle, FileText } from 'lucide-react';

interface UploadSectionProps {
  onAnalyze: (jd: string, resumeData: { mimeType: string; data: string } | string, fileName: string) => void;
  isLoading: boolean;
  error: string | null;
  onClearError: () => void;
}

const UploadSection: React.FC<UploadSectionProps> = ({ onAnalyze, isLoading, error, onClearError }) => {
  const [jd, setJd] = useState('');
  const [resumeData, setResumeData] = useState<{ mimeType: string; data: string } | string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileSize, setFileSize] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Validation logic - Lowered JD requirement for better UX
  const jdMinLength = 20;
  const isJdValid = jd.trim().length >= jdMinLength;
  const isResumeReady = !!resumeData;
  const canAnalyze = isJdValid && isResumeReady && !isLoading;

  const processFile = (file: File) => {
    setLocalError(null);
    onClearError();

    // Size limit 10MB
    if (file.size > 10 * 1024 * 1024) {
      setLocalError("File is too large. Maximum size is 10MB.");
      return;
    }

    const allowedTypes = ['application/pdf', 'text/plain'];
    if (!allowedTypes.includes(file.type)) {
      setLocalError("Unsupported format. Please upload a PDF or TXT file.");
      return;
    }

    setFileName(file.name);
    setFileSize((file.size / 1024).toFixed(1) + ' KB');
    
    const reader = new FileReader();
    reader.onerror = () => setLocalError("Failed to read the file. It might be corrupted.");
    
    if (file.type === 'application/pdf') {
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setResumeData({ mimeType: 'application/pdf', data: result });
      };
      reader.readAsDataURL(file);
    } else {
      reader.onload = (event) => {
        const text = event.target?.result as string;
        setResumeData(text);
      };
      reader.readAsText(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  }, []);

  const handleClearFile = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setFileName(null);
    setResumeData(null);
    setLocalError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = () => {
    if (!isJdValid) {
      setLocalError(`Job description needs at least ${jdMinLength} characters.`);
      return;
    }
    if (jd.trim() && resumeData && fileName) {
      onAnalyze(jd, resumeData, fileName);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto animate-slide-up pb-20 px-4">
      
      {/* Header Info */}
      <div className="text-center mb-10 space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-[10px] uppercase font-black tracking-widest text-primary shadow-glow">
           <Sparkles className="w-3.5 h-3.5" />
           <span>CloudMatch Match Engine v1.5</span>
        </div>
        <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter leading-none">
          Analyze. Match.<br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">Advance Your Career.</span>
        </h1>
      </div>

      {/* Main Analysis Card */}
      <div className="glass-panel rounded-[2.5rem] p-1 bg-[#0f172a]/40 backdrop-blur-2xl border border-white/10 shadow-2xl relative overflow-hidden">
        
        {/* Progress Overlay when Loading */}
        {isLoading && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-md z-50 flex flex-col items-center justify-center p-10 text-center space-y-6">
            <div className="w-20 h-20 rounded-full border-4 border-primary/20 border-t-primary animate-spin shadow-glow"></div>
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-white tracking-tight italic">Initiating Analysis...</h3>
              <p className="text-sm text-slate-400 font-mono">Parsing Resume • Scoring Entities • Comparing Requirements</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2">
          
          {/* Left: File Ingestion */}
          <div className="p-8 border-b lg:border-b-0 lg:border-r border-white/5 bg-white/[0.01]">
            <div className="flex items-center justify-between mb-6">
               <h3 className="text-xs font-bold text-white flex items-center gap-2 uppercase tracking-wider">
                 <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/20">
                   <FileText className="w-4 h-4" />
                 </div>
                 Resume Document
               </h3>
               {resumeData && (
                 <button onClick={handleClearFile} className="text-[10px] font-bold text-slate-500 hover:text-red-400 flex items-center gap-1 transition-colors">
                   <FileX className="w-3 h-3" /> Remove
                 </button>
               )}
            </div>

            {resumeData ? (
              <div className="p-6 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl animate-fade-in text-center flex flex-col items-center">
                  <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-400 mb-4 border border-emerald-500/20 shadow-glow">
                    <CheckCircle className="w-8 h-8" />
                  </div>
                  <h4 className="font-bold text-white text-base mb-1 truncate w-full px-2">{fileName}</h4>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black">{fileSize} • File Accepted</p>
              </div>
            ) : (
              <div 
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`
                  relative h-[250px] rounded-3xl border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center group cursor-pointer
                  ${isDragging ? 'border-primary bg-primary/10' : 'border-white/10 bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/20'}
                `}
              >
                <input ref={fileInputRef} type="file" className="hidden" accept=".pdf,.txt" onChange={handleFileChange} />
                <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-500">
                  <UploadCloud className="w-6 h-6 text-slate-600 group-hover:text-primary transition-colors" />
                </div>
                <h4 className="text-base font-bold text-white mb-2">Upload Resume</h4>
                <p className="text-[10px] text-slate-500 px-8 text-center leading-relaxed">PDF or TXT required for scoring.</p>
              </div>
            )}
          </div>

          {/* Right: Requirements Input */}
          <div className="p-8 flex flex-col">
            <div className="flex items-center justify-between mb-6">
               <h3 className="text-xs font-bold text-white flex items-center gap-2 uppercase tracking-wider">
                 <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400 border border-cyan-500/20">
                   <Briefcase className="w-4 h-4" />
                 </div>
                 Job Description
               </h3>
               <div className={`text-[10px] font-mono px-2 py-0.5 rounded border ${isJdValid ? 'text-emerald-400 border-emerald-400/20 bg-emerald-400/5' : 'text-slate-500 border-white/5'}`}>
                  {jd.length} / {jdMinLength} chars
               </div>
            </div>

            <div className="relative flex-1">
               <textarea 
                  value={jd}
                  onChange={(e) => setJd(e.target.value)}
                  placeholder="Paste the target job description here..."
                  className="w-full h-[250px] bg-black/40 border border-white/10 rounded-2xl p-5 text-sm text-slate-200 placeholder-slate-600 outline-none focus:border-primary/50 transition-all resize-none leading-relaxed font-light"
               />
            </div>
          </div>
        </div>

        {/* Action Bar - Enhanced Visibility */}
        <div className="p-8 bg-slate-900/60 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-6 relative">
          <div className="flex-1">
            {localError || error ? (
              <div className="flex items-center gap-3 text-red-400 text-xs font-bold bg-red-400/5 px-4 py-3 rounded-xl border border-red-400/20 animate-slide-up">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{localError || error}</span>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center gap-4 text-[10px] uppercase font-black tracking-widest">
                  <div className={`flex items-center gap-1.5 ${isResumeReady ? 'text-emerald-400' : 'text-slate-600'}`}>
                    <div className={`w-2 h-2 rounded-full ${isResumeReady ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-slate-800'}`} />
                    Resume
                  </div>
                  <div className={`flex items-center gap-1.5 ${isJdValid ? 'text-emerald-400' : 'text-slate-600'}`}>
                    <div className={`w-2 h-2 rounded-full ${isJdValid ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-slate-800'}`} />
                    Job Details
                  </div>
                </div>
                {!canAnalyze && (
                  <p className="text-[10px] text-slate-500 font-medium">
                    {!isResumeReady ? "Please upload a resume file first." : !isJdValid ? "The job description is too short to analyze." : ""}
                  </p>
                )}
              </div>
            )}
          </div>
          
          <button
            onClick={handleSubmit}
            disabled={!canAnalyze}
            className={`
              relative group overflow-hidden px-12 py-5 rounded-2xl font-black text-xs tracking-[0.2em] transition-all flex items-center gap-4 shadow-2xl
              ${canAnalyze 
                ? 'bg-primary hover:bg-blue-600 text-white shadow-primary/40 hover:scale-105 active:scale-95' 
                : 'bg-white/5 text-slate-600 cursor-not-allowed border border-white/10'}
            `}
          >
            {canAnalyze && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer" />
            )}
            {canAnalyze ? 'START MATCHING ENGINE' : 'AWAITING INPUT'}
            <ArrowRight className={`w-4 h-4 transition-transform ${canAnalyze ? 'group-hover:translate-x-1' : ''}`} />
          </button>
        </div>
      </div>
      
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 1.5s infinite;
        }
      `}</style>
    </div>
  );
};

export default UploadSection;
