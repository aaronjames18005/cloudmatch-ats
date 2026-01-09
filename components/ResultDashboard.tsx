
import React, { useState } from 'react';
import { AnalysisResult } from '../types';
import { CheckCircle2, XCircle, MinusCircle, User, Briefcase, Download, RefreshCw, Map, ShieldAlert, Star, TrendingUp, Info, Award, BarChart3, Target } from 'lucide-react';
import { MatchScoreRing } from './Glass';

interface ResultDashboardProps {
  result: AnalysisResult;
  onReset: () => void;
  onGenerateRoadmap: () => void;
}

const ResultDashboard: React.FC<ResultDashboardProps> = ({ result, onReset, onGenerateRoadmap }) => {
  // Safe extraction of benchmarks with defaults if AI didn't provide them
  const benchmarks = result?.industryBenchmarks || {
    averageScore: 65,
    topPercentileScore: 88,
    marketDemand: 'High' as const,
    typicalCandidateYears: result?.yearsExperience || 3
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return '#10B981'; // Green
    if (score >= 40) return '#F59E0B'; // Amber
    return '#EF4444'; // Red
  };

  const getScoreLabel = (score: number) => {
    if (score >= 70) return 'Strong Match';
    if (score >= 40) return 'Partial Match';
    return 'Weak Fit';
  };

  const scoreValue = result?.matchScore ?? 0;
  const MATCH_COLOR = getScoreColor(scoreValue);

  const handleDownloadReport = () => {
    if (!result) return;
    
    const lines = [
        `CLOUDMATCH ATS REPORT`,
        `Generated: ${new Date().toLocaleString()}`,
        `----------------------------------------`,
        `Candidate: ${result.candidateName}`,
        `Experience: ${result.yearsExperience} Years`,
        `Match Score: ${result.matchScore}%`,
        `Summary: ${result.summary}`,
        `\nINDUSTRY BENCHMARKS:`,
        `- Market Demand: ${benchmarks.marketDemand}`,
        `- Average Score: ${benchmarks.averageScore}%`,
        `- Top 10% Percentile: ${benchmarks.topPercentileScore}%`,
        `- Typical Candidate Exp: ${benchmarks.typicalCandidateYears}Y`,
        `\nMATCHED SKILLS:`,
        ...(result.matchedSkills || []).map(s => `- ${s?.name || 'Unknown'} (${s?.proficiency || 'N/A'})`),
        `\nMISSING SKILLS:`,
        ...(result.missingSkills || []).map(s => `- ${s?.name || 'Unknown'} [${s?.importance || 'N/A'}]`),
        `\nRECOMMENDATIONS:`,
        ...(result.recommendations || []).map(r => `- ${r}`),
        `\n----------------------------------------`,
        `Powered by CloudMatch ATS AI`
    ];

    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Analysis_Report_${result.candidateName.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (!result) return null;

  return (
    <div className="space-y-6 animate-fade-in h-full flex flex-col pb-12">
      
      {/* Header Card with Score & Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
         {/* Score Card */}
         <div className="lg:col-span-4 glass-panel rounded-3xl p-6 relative overflow-hidden flex flex-col items-center justify-center text-center">
            <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none"></div>
            
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6">ATS Compatibility</h3>
            
            <div className="mb-6 scale-110">
              <MatchScoreRing score={scoreValue} size={180} />
            </div>
            
            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black border uppercase tracking-widest`}
                 style={{ backgroundColor: `${MATCH_COLOR}20`, borderColor: `${MATCH_COLOR}40`, color: MATCH_COLOR }}>
               {getScoreLabel(scoreValue)}
            </div>
         </div>

         {/* Summary & Candidate Info */}
         <div className="lg:col-span-8 glass-panel rounded-3xl p-8 flex flex-col justify-center relative bg-white/[0.01]">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
               <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-xl">
                     <User className="w-7 h-7" />
                  </div>
                  <div>
                     <h2 className="text-2xl font-black text-white tracking-tight">{result.candidateName}</h2>
                     <div className="flex gap-4 text-xs text-slate-400 mt-1.5 font-medium">
                        <span className="flex items-center gap-1.5"><Briefcase className="w-3.5 h-3.5 text-blue-400" /> {result.yearsExperience} Years Experience</span>
                        <span className="flex items-center gap-1.5"><Target className="w-3.5 h-3.5 text-indigo-400" /> Professional Grade</span>
                     </div>
                  </div>
               </div>

               <div className="flex gap-4">
                  <div className="px-5 py-4 rounded-2xl bg-black/40 border border-white/5 text-center min-w-[110px] shadow-inner">
                     <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">Market Demand</p>
                     <p className={`text-sm font-black ${benchmarks.marketDemand === 'High' ? 'text-accent' : 'text-white'}`}>
                        {benchmarks.marketDemand}
                     </p>
                  </div>
                  <div className="px-5 py-4 rounded-2xl bg-black/40 border border-white/5 text-center min-w-[110px] shadow-inner">
                     <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">Typical Exp</p>
                     <p className="text-sm font-black text-white">
                        {benchmarks.typicalCandidateYears}Y
                     </p>
                  </div>
               </div>
            </div>
            
            <div className="bg-black/40 rounded-2xl p-6 border border-white/5 relative shadow-inner">
               <div className="absolute top-6 right-6 text-accent opacity-30">
                  <Star className="w-6 h-6" />
               </div>
               <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">AI Contextual Analysis</h3>
               <p className="text-sm text-slate-300 leading-relaxed font-light">
                 {result.summary}
               </p>
            </div>
         </div>
      </div>

      {/* Industry Benchmarking Section */}
      <div className="glass-panel rounded-3xl p-8 md:p-10 relative overflow-hidden group">
         <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-transparent pointer-events-none"></div>
         
         <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 bg-accent/10 rounded-2xl flex items-center justify-center text-accent border border-accent/20">
                  <TrendingUp className="w-6 h-6" />
               </div>
               <div>
                  <h3 className="text-xl font-black text-white tracking-tight">Industry Benchmarks</h3>
                  <p className="text-xs text-slate-400 font-medium">Comparative analytics against market-standard candidate profiles</p>
               </div>
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-[10px] text-slate-400 uppercase font-black tracking-widest">
               <Info className="w-3.5 h-3.5" /> Data Refresh: Real-time
            </div>
         </div>

         <div className="space-y-16 py-4">
            {/* Visual Comparative Scale */}
            <div className="relative px-2">
               {/* Background Track */}
               <div className="h-2 w-full bg-slate-800 rounded-full relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 via-amber-500/10 to-emerald-500/10"></div>
               </div>

               <div className="absolute top-0 left-0 w-full h-full pointer-events-none translate-y-[-50%]">
                  {/* Market Average Line */}
                  <div 
                     className="absolute flex flex-col items-center transition-all duration-1000 ease-out" 
                     style={{ left: `${benchmarks.averageScore}%` }}
                  >
                     <div className="h-12 w-px bg-slate-600/60"></div>
                     <div className="mt-2 text-[10px] font-black text-slate-500 uppercase tracking-widest whitespace-nowrap bg-background px-2">
                       Avg: {benchmarks.averageScore}%
                     </div>
                  </div>

                  {/* Top 10% Gold Standard */}
                  <div 
                     className="absolute flex flex-col items-center transition-all duration-1000 ease-out" 
                     style={{ left: `${benchmarks.topPercentileScore}%` }}
                  >
                     <div className="h-12 w-px bg-emerald-500/40"></div>
                     <div className="mt-2 text-[10px] font-black text-emerald-400 uppercase tracking-widest whitespace-nowrap bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-md flex items-center gap-1.5">
                        <Award className="w-3 h-3" /> Top 10%: {benchmarks.topPercentileScore}%
                     </div>
                  </div>

                  {/* User Score Pin */}
                  <div 
                     className="absolute flex flex-col items-center transition-all duration-1000 z-10" 
                     style={{ left: `${scoreValue}%`, top: '-4px' }}
                  >
                     <div className="w-5 h-5 rounded-full bg-white border-4 border-primary shadow-[0_0_20px_rgba(59,130,246,0.6)] animate-pulse"></div>
                     <div className="mt-4 text-[10px] font-black text-white bg-primary px-3 py-1.5 rounded-lg shadow-xl shadow-primary/40 uppercase tracking-widest whitespace-nowrap ring-2 ring-white/10">
                        Your Score
                     </div>
                  </div>
               </div>
            </div>

            {/* Benchmark Insight Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-10">
               <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.05] transition-all group">
                  <div className="flex items-center gap-3 mb-3">
                     <BarChart3 className="w-5 h-5 text-blue-400 group-hover:scale-110 transition-transform" />
                     <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Candidate Positioning</h4>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed font-medium">
                     {scoreValue >= benchmarks.topPercentileScore 
                        ? "Elite standing. Your profile outperforms 90% of applicants in the current talent pool." 
                        : scoreValue >= benchmarks.averageScore 
                           ? "Above market average. You are currently more competitive than a typical applicant." 
                           : "Below benchmark. Strategic upskilling required to meet standard industry expectations."}
                  </p>
               </div>
               
               <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.05] transition-all group">
                  <div className="flex items-center gap-3 mb-3">
                     <TrendingUp className="w-5 h-5 text-accent group-hover:scale-110 transition-transform" />
                     <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Demand Forecast</h4>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed font-medium">
                     {benchmarks.marketDemand === 'High' 
                        ? "Hiring intensity is surging. Fast response times and precise skill-mapping are critical right now." 
                        : "Stable role growth. Focus on unique domain specializations to differentiate yourself."}
                  </p>
               </div>

               <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.05] transition-all group">
                  <div className="flex items-center gap-3 mb-3">
                     <Star className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform" />
                     <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Growth Pathway</h4>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed font-medium">
                     {scoreValue < benchmarks.topPercentileScore 
                        ? `Target the remaining gaps to reach the ${benchmarks.topPercentileScore}% benchmark for maximum leverage.` 
                        : "Maintain your edge by quantifying your impact with data-driven project outcomes."}
                  </p>
               </div>
            </div>
         </div>
      </div>

      {/* Skills Breakdown Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         {/* Matched Skills */}
         <div className="glass-panel rounded-3xl p-8 border-t-4 border-t-emerald-500 bg-white/[0.01]">
            <div className="flex items-center justify-between mb-6">
               <h4 className="flex items-center gap-2 text-emerald-400 font-black uppercase text-xs tracking-[0.15em]">
                 <CheckCircle2 className="w-4 h-4" /> Matched Assets
               </h4>
               <span className="text-[10px] font-bold text-slate-600 bg-white/5 px-2 py-0.5 rounded">{(result.matchedSkills || []).length} DETECTED</span>
            </div>
            <div className="flex flex-wrap gap-2.5">
               {result.matchedSkills && result.matchedSkills.length > 0 ? (
                 result.matchedSkills.map((s, i) => (
                    <div key={i} className="px-3 py-2 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-emerald-200 text-[11px] font-bold tracking-tight">
                       {s?.name || 'Skill'}
                    </div>
                 ))
               ) : <span className="text-slate-600 text-xs italic">No direct matches identified.</span>}
            </div>
         </div>

         {/* Missing Skills */}
         <div className="glass-panel rounded-3xl p-8 border-t-4 border-t-red-500 bg-white/[0.01]">
            <div className="flex items-center justify-between mb-6">
               <h4 className="flex items-center gap-2 text-red-400 font-black uppercase text-xs tracking-[0.15em]">
                 <XCircle className="w-4 h-4" /> Strategic Gaps
               </h4>
               <span className="text-[10px] font-bold text-slate-600 bg-white/5 px-2 py-0.5 rounded">{(result.missingSkills || []).length} MISSING</span>
            </div>
            <div className="flex flex-wrap gap-2.5">
               {result.missingSkills && result.missingSkills.length > 0 ? (
                 result.missingSkills.map((s, i) => (
                    <div key={i} className={`px-3 py-2 rounded-xl border text-[11px] font-bold flex items-center gap-2 tracking-tight ${s?.importance === 'Critical' ? 'bg-red-500/5 border-red-500/20 text-red-300 shadow-sm' : 'bg-slate-800/40 border-slate-700 text-slate-500'}`}>
                       {s?.name || 'Skill'}
                       {s?.importance === 'Critical' && <ShieldAlert className="w-3 h-3" />}
                    </div>
                 ))
               ) : <span className="text-slate-600 text-xs italic">Zero critical gaps found.</span>}
            </div>
         </div>
      </div>
      
      {/* Resume Noise Filter */}
      {result.resumeOnlySkills && result.resumeOnlySkills.length > 0 && (
        <div className="glass-panel rounded-3xl p-8 bg-white/[0.01]">
           <h4 className="flex items-center gap-2 text-slate-500 font-black uppercase text-xs tracking-[0.15em] mb-4">
              <MinusCircle className="w-4 h-4" /> Unaligned Profile Attributes
           </h4>
           <p className="text-[11px] text-slate-500 mb-5 leading-relaxed font-medium">The following keywords were found in your resume but not requested in the job description.</p>
           <div className="flex flex-wrap gap-2 opacity-50 hover:opacity-100 transition-opacity duration-500">
              {result.resumeOnlySkills.slice(0, 18).map((s, i) => (
                 <span key={i} className="px-2.5 py-1 rounded-lg bg-white/5 text-slate-400 text-[10px] border border-white/5 font-medium">
                    {s}
                 </span>
              ))}
              {result.resumeOnlySkills.length > 18 && <span className="text-[10px] text-slate-600 font-bold ml-2">+{result.resumeOnlySkills.length - 18} OTHER ITEMS</span>}
           </div>
        </div>
      )}

      {/* Floating Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/90 border-t border-white/10 backdrop-blur-xl z-[60] shadow-2xl">
         <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="hidden lg:flex items-center gap-4">
               <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                  <Star className="w-5 h-5" />
               </div>
               <div>
                  <p className="text-sm text-white font-black tracking-tight">Optimize your profile</p>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Execute next steps from the dashboard</p>
               </div>
            </div>
            
            <div className="flex items-center gap-3 w-full lg:w-auto">
               <button 
                  onClick={onReset}
                  className="flex-1 lg:flex-none px-6 py-4 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-400 text-xs font-black tracking-widest border border-white/10 transition-all flex items-center justify-center gap-2 active:scale-95"
               >
                  <RefreshCw className="w-4 h-4" /> RE-ANALYZE
               </button>
               
               <button 
                  onClick={handleDownloadReport}
                  className="flex-1 lg:flex-none px-6 py-4 rounded-2xl bg-white/5 hover:bg-white/10 text-white text-xs font-black tracking-widest border border-white/10 transition-all flex items-center justify-center gap-2 active:scale-95"
               >
                  <Download className="w-4 h-4" /> EXPORT PDF
               </button>
               
               <button 
                  onClick={onGenerateRoadmap}
                  className="flex-1 lg:flex-none px-10 py-4 rounded-2xl bg-primary hover:bg-blue-600 text-white text-xs font-black tracking-widest shadow-[0_0_25px_rgba(59,130,246,0.3)] transition-all flex items-center justify-center gap-3 active:scale-95 group"
               >
                  BUILD ROADMAP <Map className="w-4 h-4 group-hover:rotate-12 transition-transform" />
               </button>
            </div>
         </div>
      </div>
      
      <div className="h-24"></div>

    </div>
  );
};

export default ResultDashboard;
