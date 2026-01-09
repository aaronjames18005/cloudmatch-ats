
import React, { useState } from 'react';
import { Job } from '../types';
import { extractJobEntities } from '../services/gemini';
import { Briefcase, Plus, Loader2, CheckCircle, Tag, Sparkles, Cpu, ShieldAlert, List, ArrowRight, Search, Calendar } from 'lucide-react';

interface JobManagerProps {
  jobs: Job[];
  onJobCreated: (job: Job) => void;
}

const JobManager: React.FC<JobManagerProps> = ({ jobs, onJobCreated }) => {
  const [activeTab, setActiveTab] = useState<'create' | 'library'>('create');
  
  // Create State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastCreatedJob, setLastCreatedJob] = useState<Job | null>(null);

  // Library State
  const [searchTerm, setSearchTerm] = useState('');

  const handleCreate = async () => {
    if (!title || !description) return;

    setIsProcessing(true);
    
    try {
      // Use Gemini NER to extract skills with importance
      const extractedSkills = await extractJobEntities(description);
      
      const skills = extractedSkills.length > 0 ? extractedSkills : [
        { name: 'General Analysis', category: 'Domain' as const, importance: 'Nice-to-have' as const },
        { name: 'Communication', category: 'Soft' as const, importance: 'Critical' as const }
      ];

      const newJob: Job = {
        id: `job_${Math.random().toString(36).substr(2, 9)}`,
        title,
        description,
        skills: skills,
        createdAt: new Date().toISOString()
      };

      setLastCreatedJob(newJob);
      onJobCreated(newJob);
      setTitle('');
      setDescription('');
    } catch (error) {
      console.error("Failed to process job", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredJobs = jobs.filter(j => 
    j.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    j.id.includes(searchTerm)
  );

  return (
    <div className="max-w-6xl mx-auto animate-fade-in space-y-8">
       {/* Header */}
       <div className="flex flex-col md:flex-row items-center justify-between gap-6">
         <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-300 text-xs border border-blue-500/20 mb-3">
              <Cpu className="w-3 h-3" />
              <span>Job Intelligence Engine</span>
            </div>
            <h2 className="text-3xl font-bold text-white tracking-tight">Role Management</h2>
            <p className="text-slate-400 font-light mt-1">
              Create and manage job requirements powered by Gemini NER.
            </p>
         </div>
         
         <div className="flex p-1 bg-black/20 rounded-xl border border-white/10 backdrop-blur-md">
            <button 
              onClick={() => setActiveTab('create')}
              className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'create' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
            >
              <Plus className="w-4 h-4" /> New Posting
            </button>
            <button 
              onClick={() => setActiveTab('library')}
              className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'library' ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/25' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
            >
              <List className="w-4 h-4" /> Library <span className="px-1.5 py-0.5 rounded bg-black/20 text-[10px] ml-1">{jobs.length}</span>
            </button>
         </div>
      </div>

      {activeTab === 'create' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form */}
          <div className="glass-panel rounded-3xl p-8 shadow-xl relative overflow-hidden h-fit">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
            
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-3 relative z-10">
              <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                 <Briefcase className="w-5 h-5" />
              </div>
              Define New Role
            </h3>
            
            <div className="space-y-5 relative z-10">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2 tracking-wider">Role Title</label>
                <input 
                  type="text" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Senior Backend Engineer"
                  className="w-full glass-input rounded-xl px-5 py-3 text-white placeholder-slate-600 outline-none focus:ring-1 focus:ring-blue-500/50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2 tracking-wider">Job Description</label>
                <textarea 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Paste the full job requirements here..."
                  className="w-full h-64 glass-input rounded-xl px-5 py-3 text-white placeholder-slate-600 outline-none resize-none focus:ring-1 focus:ring-blue-500/50 leading-relaxed text-sm"
                />
              </div>

              <button
                onClick={handleCreate}
                disabled={isProcessing || !title || !description}
                className={`w-full py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg ${
                  isProcessing || !title || !description
                    ? 'bg-white/5 text-slate-500 cursor-not-allowed border border-white/5' 
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-blue-500/30 hover:shadow-blue-500/50'
                }`}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Running NER Extraction...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Extract Skills & Create
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Output / Preview */}
          <div className="space-y-6">
             {!lastCreatedJob ? (
               <div className="h-full min-h-[400px] glass-panel rounded-3xl border-dashed border-2 border-white/10 flex flex-col items-center justify-center p-10 text-center text-slate-500">
                 <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6 animate-pulse">
                   <Tag className="w-8 h-8 opacity-30" />
                 </div>
                 <h3 className="text-xl font-medium text-slate-300">Entity Extraction Pending</h3>
                 <p className="text-sm mt-2 max-w-xs mx-auto">
                   Our AI will parse the job description to identify technical skills, soft skills, and domain requirements automatically.
                 </p>
               </div>
             ) : (
               <div className="glass-panel rounded-3xl p-8 shadow-2xl animate-float border-green-500/20 relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-40 h-40 bg-green-500/10 rounded-full blur-3xl -mr-12 -mt-12 pointer-events-none"></div>
                 
                 <div className="flex items-center gap-3 mb-8 text-green-400 bg-green-500/10 px-4 py-2 rounded-xl w-fit border border-green-500/10">
                   <CheckCircle className="w-5 h-5" />
                   <span className="font-bold text-sm">Successfully Ingested</span>
                 </div>

                 <div className="space-y-6 relative z-10">
                   <div>
                     <h4 className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Role Title</h4>
                     <p className="text-2xl text-white font-bold tracking-tight">{lastCreatedJob.title}</p>
                     <p className="font-mono text-xs text-slate-500 mt-1">ID: {lastCreatedJob.id}</p>
                   </div>
                   
                   <div>
                     <h4 className="text-[10px] text-slate-500 uppercase font-bold flex items-center gap-2 mb-4 tracking-widest">
                       Extracted Entities (NER)
                       <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse"></span>
                     </h4>
                     <div className="flex flex-wrap gap-2">
                       {lastCreatedJob.skills?.map((skill, idx) => (
                         <div 
                           key={idx} 
                           className={`px-3 py-1.5 rounded-lg text-xs border flex items-center gap-2 shadow-sm font-medium cursor-default group ${
                             skill.category === 'Technical' ? 'bg-blue-500/10 text-blue-300 border-blue-500/20' :
                             skill.category === 'Soft' ? 'bg-orange-500/10 text-orange-300 border-orange-500/20' :
                             'bg-purple-500/10 text-purple-300 border-purple-500/20'
                           }`}
                         >
                           {skill.name}
                           {skill.importance === 'Critical' && (
                             <span className="bg-red-500 text-white text-[9px] px-1 rounded flex items-center" title="Critical Requirement">
                               <ShieldAlert className="w-2 h-2" />
                             </span>
                           )}
                         </div>
                       ))}
                     </div>
                   </div>

                   <div className="pt-6 border-t border-white/5">
                      <button 
                         onClick={() => setActiveTab('library')}
                         className="text-sm text-slate-400 hover:text-white flex items-center gap-2 transition-colors"
                      >
                        View in Library <ArrowRight className="w-4 h-4" />
                      </button>
                   </div>
                 </div>
               </div>
             )}
          </div>
        </div>
      ) : (
        /* LIBRARY VIEW */
        <div className="space-y-6 animate-fade-in">
           <div className="flex items-center gap-4 bg-white/5 p-2 rounded-xl border border-white/5">
              <Search className="w-5 h-5 text-slate-500 ml-2" />
              <input 
                type="text" 
                placeholder="Search job titles or IDs..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-transparent flex-1 text-sm text-white placeholder-slate-500 outline-none h-full py-2"
              />
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredJobs.length > 0 ? (
                filteredJobs.map(job => (
                  <div key={job.id} className="glass-panel rounded-2xl p-6 hover:border-white/20 transition-all group hover:-translate-y-1">
                     <div className="flex justify-between items-start mb-4">
                        <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
                          <Briefcase className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono bg-white/5 px-2 py-1 rounded">{new Date(job.createdAt).toLocaleDateString()}</span>
                     </div>
                     <h3 className="font-bold text-white mb-1 truncate">{job.title}</h3>
                     <p className="text-xs text-slate-500 mb-4 line-clamp-2">{job.description}</p>
                     
                     <div className="flex flex-wrap gap-1.5 mb-5 h-16 overflow-hidden content-start">
                        {job.skills.slice(0, 5).map((s, i) => (
                          <span key={i} className={`text-[10px] px-2 py-0.5 rounded border ${
                             s.importance === 'Critical' ? 'bg-red-500/10 border-red-500/10 text-red-300' : 'bg-white/5 border-white/5 text-slate-400'
                          }`}>
                            {s.name}
                          </span>
                        ))}
                        {job.skills.length > 5 && <span className="text-[10px] text-slate-500 pt-1">+{job.skills.length - 5} more</span>}
                     </div>

                     <button className="w-full py-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold transition-colors border border-white/5 group-hover:border-white/10">
                       View Details
                     </button>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-12 text-slate-500">
                  <Briefcase className="w-12 h-12 mx-auto mb-4 opacity-20" />
                  <p>No jobs found matching your search.</p>
                </div>
              )}
           </div>
        </div>
      )}
    </div>
  );
};

export default JobManager;
