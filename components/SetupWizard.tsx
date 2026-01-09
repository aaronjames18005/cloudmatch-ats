import React, { useState } from 'react';
import { Shield, Save, Box, AlertTriangle, ArrowRight, ExternalLink } from 'lucide-react';
import { saveFirebaseConfig, setSandboxMode } from '../services/firebase';

const SetupWizard: React.FC = () => {
  const [apiKey, setApiKey] = useState('');
  const [authDomain, setAuthDomain] = useState('');
  const [projectId, setProjectId] = useState('');
  
  const handleSave = () => {
    if (!apiKey || !authDomain || !projectId) return;
    saveFirebaseConfig({ apiKey, authDomain, projectId });
  };

  return (
    <div className="fixed inset-0 z-[300] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4">
       <div className="w-full max-w-2xl glass-panel rounded-3xl overflow-hidden shadow-2xl border border-white/10 bg-[#0f172a] relative">
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none"></div>

          <div className="p-10 relative z-10">
             <div className="text-center mb-10">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-blue-500/20">
                   <Shield className="w-10 h-10 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-white mb-3">System Configuration</h1>
                <p className="text-slate-400 max-w-md mx-auto leading-relaxed">
                   Connect to your secure Firebase infrastructure to enable actual authentication and role-based access control.
                </p>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                {/* Real Auth Option */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/[0.07] transition-colors group">
                   <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400">
                         <Shield className="w-5 h-5" />
                      </div>
                      <h3 className="font-bold text-white">Production Mode</h3>
                   </div>
                   
                   <div className="space-y-4">
                      <div>
                         <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">API Key</label>
                         <input 
                           type="text" 
                           value={apiKey} 
                           onChange={(e) => setApiKey(e.target.value)}
                           className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500/50 outline-none"
                           placeholder="AIzaSy..." 
                         />
                      </div>
                      <div>
                         <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Auth Domain</label>
                         <input 
                           type="text" 
                           value={authDomain} 
                           onChange={(e) => setAuthDomain(e.target.value)}
                           className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500/50 outline-none"
                           placeholder="myapp.firebaseapp.com" 
                         />
                      </div>
                      <div>
                         <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Project ID</label>
                         <input 
                           type="text" 
                           value={projectId} 
                           onChange={(e) => setProjectId(e.target.value)}
                           className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500/50 outline-none"
                           placeholder="myapp-123" 
                         />
                      </div>
                      
                      <button 
                         onClick={handleSave}
                         disabled={!apiKey || !authDomain || !projectId}
                         className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                      >
                         <Save className="w-4 h-4" /> Connect Backend
                      </button>
                      
                      <p className="text-[10px] text-slate-500 text-center">
                         Don't have keys? <a href="https://console.firebase.google.com" target="_blank" rel="noreferrer" className="text-blue-400 hover:underline inline-flex items-center gap-0.5">Create Project <ExternalLink className="w-2.5 h-2.5" /></a>
                      </p>
                   </div>
                </div>

                {/* Sandbox Option */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col hover:bg-white/[0.07] transition-colors">
                   <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-purple-500/20 rounded-lg text-purple-400">
                         <Box className="w-5 h-5" />
                      </div>
                      <h3 className="font-bold text-white">Sandbox Mode</h3>
                   </div>
                   <p className="text-sm text-slate-400 mb-6 flex-1">
                      Use an in-memory database simulation. Ideal for testing UI flows without external dependencies. 
                      <br/><br/>
                      <span className="text-orange-400 text-xs flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> Data is local to this browser.
                      </span>
                   </p>
                   <button 
                     onClick={setSandboxMode}
                     className="w-full py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold text-sm border border-white/10 transition-all flex items-center justify-center gap-2"
                   >
                      Enter Sandbox <ArrowRight className="w-4 h-4" />
                   </button>
                </div>
             </div>
          </div>
       </div>
    </div>
  );
};

export default SetupWizard;
