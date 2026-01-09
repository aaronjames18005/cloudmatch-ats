import React from "react";
import { Upload } from "lucide-react";

// Utility for class merging
export function mergeClasses(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(" ");
}

interface GlassProps {
  className?: string;
  children?: React.ReactNode;
  [key: string]: any;
}

export function GlassCard({ className = "", children, ...props }: GlassProps) {
  return (
    <div
      className={mergeClasses(
        "glass-panel transition-all duration-300 ease-soft-bounce hover:shadow-glass relative overflow-hidden",
        className
      )}
      {...props}
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-primary/5 opacity-40 mix-blend-screen" />
      <div className="relative">{children}</div>
    </div>
  );
}

interface GlassButtonProps extends GlassProps {
    variant?: 'primary' | 'ghost' | 'danger';
}

export function GlassButton({ className = "", children, variant = "primary", ...props }: GlassButtonProps) {
  const base = "glass-button px-5 py-2.5 text-sm font-medium text-white/90 shadow-glass-soft active:scale-[0.98]";
  const variants = {
    primary: "bg-primary/80 hover:bg-primary text-white shadow-glass hover:shadow-primary/30",
    ghost:
      "bg-white/5 hover:bg-white/10 text-white/80 border-white/20 shadow-none hover:border-white/40",
    danger:
      "bg-danger/80 hover:bg-danger text-white border-danger/40 shadow-glass-soft",
  };

  return (
    <button
      className={mergeClasses(base, variants[variant], className)}
      {...props}
    >
      {children}
    </button>
  );
}

export function GlassInput({ label, helper, className = "", ...props }: any) {
  return (
    <label className="flex flex-col gap-2 text-xs text-slate-300 w-full">
      {label && <span className="pl-3 uppercase tracking-wider text-[0.65rem] font-bold opacity-70">{label}</span>}
      <input className={mergeClasses("glass-input w-full rounded-2xl px-5 py-3 text-sm text-white placeholder:text-slate-500 focus:ring-2 focus:ring-primary/70 focus:border-primary/70 transition-all", className)} {...props} />
      {helper && (
        <span className="pl-3 text-[0.7rem] text-slate-400">{helper}</span>
      )}
    </label>
  );
}

export const SkillChip: React.FC<{ label: string; level?: 'low' | 'medium' | 'high' }> = ({ label, level = "medium" }) => {
  const levelStyles = {
    low: "bg-amber-500/10 text-amber-200 border-amber-500/40",
    medium: "bg-primary/20 text-blue-100 border-primary/50",
    high: "bg-emerald-500/10 text-emerald-100 border-emerald-500/40",
  };

  return (
    <span
      className={mergeClasses(
        "inline-flex items-center gap-1.5 rounded-lg px-3 py-1 text-[0.7rem] font-medium border backdrop-blur-sm shadow-sm",
        levelStyles[level]
      )}
    >
      <span className="inline-block h-1.5 w-1.5 rounded-full bg-current" />
      {label}
    </span>
  );
};

export function StatCard({ label, value, sublabel, trend }: any) {
  const trendColor =
    trend && trend.startsWith("+")
      ? "text-emerald-400"
      : trend && trend.startsWith("-")
      ? "text-rose-400"
      : "text-slate-400";

  return (
    <GlassCard className="px-5 py-5 md:px-6 md:py-6 flex flex-col justify-center">
      <div className="flex items-baseline justify-between gap-2">
        <div>
          <p className="text-[0.65rem] uppercase tracking-wide text-slate-400 font-bold">
            {label}
          </p>
          <p className="mt-1.5 text-xl md:text-2xl font-semibold text-slate-50 tracking-tight">{value}</p>
        </div>
        {trend && (
          <span className={mergeClasses("text-xs font-bold bg-white/5 px-2 py-0.5 rounded-full border border-white/5", trendColor)}>
            {trend}
          </span>
        )}
      </div>
      {sublabel && (
        <p className="mt-1 text-[0.7rem] text-slate-400 font-medium">{sublabel}</p>
      )}
    </GlassCard>
  );
}

export function MatchScoreRing({ score = 78, size = 160 }: { score: number, size?: number }) {
  const radius = size * 0.4;
  const strokeWidth = size * 0.08;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, score));
  const offset = circumference - (clamped / 100) * circumference;
  
  // Define color based on score
  let gradientId = "scoreGradient";
  let colorStart = "#3b82f6"; // Blue
  let colorEnd = "#06b6d4"; // Cyan
  
  if (score < 40) {
    colorStart = "#ef4444";
    colorEnd = "#f87171";
  } else if (score < 70) {
    colorStart = "#f59e0b";
    colorEnd = "#fbbf24";
  } else {
    colorStart = "#10b981";
    colorEnd = "#34d399";
  }

  return (
    <div className="relative flex items-center justify-center">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="rotate-[-90deg]"
      >
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={colorStart} />
            <stop offset="100%" stopColor={colorEnd} />
          </linearGradient>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        
        {/* Background Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="rgba(255,255,255,0.05)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        
        {/* Progress Arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          filter="url(#glow)"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      
      {/* Inner Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-4xl md:text-5xl font-bold text-white tracking-tighter drop-shadow-lg">
          {clamped}%
        </span>
      </div>
    </div>
  );
}

export function UploadDropzone({ onFileSelect, onTextPaste }: { onFileSelect: (file: File) => void, onTextPaste?: (text: string) => void }) {
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onFileSelect(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) onFileSelect(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <GlassCard
      className="border-dashed border-2 border-white/10 px-6 py-8 md:py-12 text-center transition-all hover:bg-white/5 hover:border-primary/50 group cursor-pointer w-full"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onClick={() => inputRef.current?.click()}
    >
      <div className="flex flex-col items-center justify-center gap-6 md:gap-8 w-full">
        <div className="flex h-16 w-16 md:h-20 md:w-20 flex-shrink-0 items-center justify-center rounded-2xl bg-primary/20 border border-primary/60 group-hover:scale-110 transition-transform duration-300 shadow-[0_0_25px_rgba(77,124,255,0.25)]">
          <Upload className="w-6 h-6 md:w-8 md:h-8 text-primary" />
        </div>
        
        <div className="space-y-2 flex flex-col items-center">
          <p className="text-xl md:text-2xl font-bold text-slate-50 tracking-tight">
            Drop your resume here
          </p>
          <p className="text-xs md:text-sm text-slate-400 font-medium">
            PDF, TXT, DOCX • Max 10 MB
          </p>
        </div>

        <div className="inline-flex items-center justify-center px-8 py-3 rounded-full bg-white/10 border border-white/10 text-sm font-semibold text-white group-hover:bg-white/20 transition-all shadow-sm">
          Browse Files
        </div>
      </div>
      
      <input 
        ref={inputRef}
        type="file" 
        className="hidden" 
        accept=".txt,.pdf,.doc,.docx" 
        onChange={handleFileChange} 
        onClick={(e) => e.stopPropagation()} 
      />
    </GlassCard>
  );
}