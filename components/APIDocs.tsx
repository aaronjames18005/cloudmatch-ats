
import React, { useState } from 'react';
import { Lock, ChevronDown, Key, RefreshCw, Copy, Check, Play, ShieldAlert, Terminal, Trash2, Plus, Activity, Info, AlertCircle, ShieldCheck, Eye } from 'lucide-react';
import { ApiKey } from '../types';

interface TooltipProps {
  text: string;
  children: React.ReactNode;
}

const Tooltip: React.FC<TooltipProps> = ({ text, children }) => {
  const [show, setShow] = useState(false);
  return (
    <div className="relative inline-block group" onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      {children}
      {show && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-slate-800 text-white text-[10px] rounded-lg shadow-xl z-50 border border-white/10 animate-fade-in pointer-events-none">
          {text}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-slate-800"></div>
        </div>
      )}
    </div>
  );
};

interface APIDocsProps {
  keys: ApiKey[];
  onUpdateKeys: (keys: ApiKey[]) => void;
}

const APIDocs: React.FC<APIDocsProps> = ({ keys, onUpdateKeys }) => {
  const [isCreatingKey, setIsCreatingKey] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [pendingKey, setPendingKey] = useState<string | null>(null);
  const [confirmationInput, setConfirmationInput] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  const [isTestRunning, setIsTestRunning] = useState(false);
  const [includeKey, setIncludeKey] = useState(true);
  const [testResponse, setTestResponse] = useState<any>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const KEY_REGEX = /^sk_live_[A-Za-z0-9]{24}$/;

  const validateKeyFormat = (key: string): boolean => {
    return KEY_REGEX.test(key);
  };

  const handleInitialGenerate = () => {
    if (!newKeyName.trim()) {
      setValidationError("Please provide a name for this key.");
      return;
    }

    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let newKeyString = 'sk_live_';
    for (let i = 0; i < 24; i++) {
      newKeyString += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    setPendingKey(newKeyString);
    setValidationError(null);
  };

  const handleFinalizeKey = () => {
    if (!pendingKey) return;

    if (confirmationInput !== pendingKey) {
      setValidationError("Confirmation key does not match the generated key.");
      return;
    }

    if (!validateKeyFormat(confirmationInput)) {
      setValidationError("Invalid key format detected in confirmation.");
      return;
    }

    const newKey: ApiKey = {
      id: `key_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      name: newKeyName,
      key: confirmationInput,
      status: 'active',
      createdAt: new Date().toISOString().split('T')[0],
      lastUsed: '-'
    };

    onUpdateKeys([...keys, newKey]);
    // Reset all creation states
    setNewKeyName('');
    setPendingKey(null);
    setConfirmationInput('');
    setValidationError(null);
    setIsCreatingKey(false);
  };

  const cancelCreation = () => {
    setIsCreatingKey(false);
    setPendingKey(null);
    setNewKeyName('');
    setConfirmationInput('');
    setValidationError(null);
  };

  const revokeKey = (id: string) => {
    onUpdateKeys(keys.map(k => k.id === id ? { ...k, status: 'revoked' } : k));
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const runTestRequest = () => {
    setIsTestRunning(true);
    setTestResponse(null);
    
    setTimeout(() => {
      const activeKeyExists = keys.some(k => k.status === 'active');

      if (includeKey && activeKeyExists) {
        setTestResponse({
          status: 200,
          statusText: 'OK',
          data: {
            id: "job_12345",
            title: "Senior Frontend Engineer",
            skills_extracted: ["React", "TypeScript", "AWS"],
            status: "active"
          }
        });
      } else {
        setTestResponse({
          status: 401,
          statusText: 'Unauthorized',
          error: "Missing, invalid, or revoked X-API-Key header"
        });
      }
      setIsTestRunning(false);
    }, 800);
  };

  return (
    <div className="max-w-5xl mx-auto animate-fade-in space-y-8 pb-20">
      {/* Header */}
      <div className="glass-panel rounded-3xl p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
        <div className="flex items-start justify-between relative z-10">
          <div>
            <h2 className="text-3xl font-bold text-white mb-3 flex items-center gap-2">
              API Reference
              <Tooltip text="Direct documentation for the Matching Engine REST API">
                <Info className="w-4 h-4 text-slate-500 cursor-help" />
              </Tooltip>
            </h2>
            <p className="text-slate-400 max-w-2xl font-light">
              Programmatic access to the matching engine. Authenticate via <code className="text-blue-300 bg-blue-500/10 px-1.5 py-0.5 rounded border border-blue-500/20 text-sm">X-API-Key</code>.
            </p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 text-green-400 text-xs border border-green-500/20 backdrop-blur-md shadow-[0_0_10px_rgba(34,197,94,0.2)]">
             <Activity className="w-3 h-3 animate-pulse" />
             <span>v1.2.0 Stable</span>
          </div>
        </div>
      </div>

      {/* API Key Management */}
      <div className="glass-panel rounded-3xl p-8 shadow-xl">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-400 border border-blue-500/10">
              <Key className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                Access Keys
                <Tooltip text="Secure tokens for your external applications to authenticate">
                  <Info className="w-3.5 h-3.5 text-slate-500 cursor-help" />
                </Tooltip>
              </h3>
              <p className="text-sm text-slate-400">Manage credentials for server-to-server communication.</p>
            </div>
          </div>
          {!isCreatingKey && (
            <Tooltip text="Create a new sk_live key">
              <button 
                onClick={() => {
                  setIsCreatingKey(true);
                  setValidationError(null);
                }}
                className="glass-button px-5 py-2.5 text-white rounded-xl text-sm font-medium flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Generate Key
              </button>
            </Tooltip>
          )}
        </div>

        {isCreatingKey && (
          <div className="bg-white/5 p-8 rounded-2xl border border-white/10 mb-8 animate-slide-up space-y-6">
            {!pendingKey ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-white">1. Name your credential</h4>
                  {validationError && (
                    <span className="text-[10px] text-red-400 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {validationError}
                    </span>
                  )}
                </div>
                <div className="flex gap-4">
                  <input 
                    type="text" 
                    placeholder="Key Name (e.g. Production Mobile App)" 
                    value={newKeyName}
                    onChange={(e) => {
                      setNewKeyName(e.target.value);
                      if (e.target.value.trim()) setValidationError(null);
                    }}
                    className={`flex-1 glass-input rounded-xl px-4 py-2 text-sm outline-none ${validationError ? 'border-red-500/50' : ''}`}
                  />
                  <button 
                    onClick={handleInitialGenerate}
                    className="px-6 py-2 bg-primary hover:bg-blue-600 text-white rounded-xl text-sm font-medium transition-colors"
                  >
                    Generate
                  </button>
                  <button 
                    onClick={cancelCreation}
                    className="px-6 py-2 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl text-sm transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6 animate-fade-in">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-green-400" />
                    2. Confirm & Validate Key
                  </h4>
                  {validationError && (
                    <span className="text-[10px] text-red-400 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {validationError}
                    </span>
                  )}
                </div>
                
                <div className="p-4 bg-black/40 rounded-xl border border-white/5 space-y-3">
                   <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest flex items-center gap-2">
                     <Eye className="w-3 h-3" /> Generated Token (Copy this)
                   </p>
                   <div className="flex items-center justify-between bg-white/5 p-3 rounded-lg border border-white/5">
                      <code className="text-blue-300 font-mono text-sm">{pendingKey}</code>
                      <button onClick={() => copyToClipboard(pendingKey, 'pending')} className="text-slate-500 hover:text-white transition-colors">
                        {copiedId === 'pending' ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                      </button>
                   </div>
                </div>

                <div className="space-y-4">
                   <p className="text-xs text-slate-400 italic">
                     To finalize, please paste the key exactly as shown above. This confirms you have saved the credential.
                   </p>
                   <div className="flex gap-4">
                     <input 
                       type="text" 
                       placeholder="Paste key to confirm (sk_live_...)" 
                       value={confirmationInput}
                       onChange={(e) => {
                         setConfirmationInput(e.target.value);
                         setValidationError(null);
                       }}
                       className={`flex-1 glass-input rounded-xl px-4 py-2 text-sm font-mono outline-none ${validationError ? 'border-red-500/50' : ''}`}
                     />
                     <button 
                       onClick={handleFinalizeKey}
                       disabled={confirmationInput !== pendingKey}
                       className={`px-6 py-2 rounded-xl text-sm font-medium transition-all ${
                         confirmationInput === pendingKey 
                           ? 'bg-green-600 hover:bg-green-500 text-white shadow-lg shadow-green-500/20' 
                           : 'bg-white/5 text-slate-600 cursor-not-allowed'
                       }`}
                     >
                       Finalize & Save
                     </button>
                     <button 
                       onClick={cancelCreation}
                       className="px-6 py-2 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl text-sm transition-colors"
                     >
                       Discard
                     </button>
                   </div>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="overflow-x-auto rounded-2xl border border-white/5">
          <table className="w-full text-sm text-left">
            <thead className="bg-black/20 text-slate-400 uppercase font-medium text-xs">
              <tr>
                <th className="px-6 py-4">
                   <Tooltip text="Friendly name to identify the key usage">Name</Tooltip>
                </th>
                <th className="px-6 py-4">
                   <Tooltip text="Secret token (Keep this secure!)">Token</Tooltip>
                </th>
                <th className="px-6 py-4">
                   <Tooltip text="Only 'Active' keys can access the Matching Engine">Status</Tooltip>
                </th>
                <th className="px-6 py-4">Created</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {keys.length > 0 ? (
                keys.map((key) => (
                  <tr key={key.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 font-medium text-white">{key.name}</td>
                    <td className="px-6 py-4 font-mono text-slate-400">
                      <div className="flex items-center gap-3">
                        <span className={key.status === 'revoked' ? 'line-through opacity-50' : ''}>{key.key}</span>
                        <Tooltip text={copiedId === key.id ? "Copied!" : "Copy to clipboard"}>
                          <button onClick={() => copyToClipboard(key.key, key.id)} className="hover:text-blue-300 transition-colors">
                            {copiedId === key.id ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </Tooltip>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Tooltip text={key.status === 'active' ? 'Key is authorized for requests' : 'Key access has been permanently disabled'}>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] border uppercase tracking-wider font-semibold ${
                          key.status === 'active' 
                            ? 'bg-green-500/10 text-green-400 border-green-500/20' 
                            : 'bg-red-500/10 text-red-400 border-red-500/20'
                        }`}>
                          {key.status}
                        </span>
                      </Tooltip>
                    </td>
                    <td className="px-6 py-4 text-slate-500">{key.createdAt}</td>
                    <td className="px-6 py-4 text-right">
                      {key.status === 'active' && (
                        <Tooltip text="Immediately invalidate this credential">
                          <button 
                            onClick={() => revokeKey(key.id)}
                            className="text-red-400 hover:text-red-300 text-xs hover:underline flex items-center gap-1 ml-auto"
                          >
                            <Trash2 className="w-3 h-3" /> Revoke
                          </button>
                        </Tooltip>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500 italic">
                    No API keys generated. Create one to begin integration.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Test Console */}
      <div className="glass-panel rounded-3xl p-8">
        <div className="flex items-center gap-3 mb-6">
           <div className="p-2 bg-white/5 rounded-lg">
             <Terminal className="w-5 h-5 text-slate-300" />
           </div>
           <h3 className="text-xl font-bold text-white flex items-center gap-2">
            Live Console
            <Tooltip text="Live simulator for cloud-to-cloud testing">
              <Info className="w-3.5 h-3.5 text-slate-500 cursor-help" />
            </Tooltip>
           </h3>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
             <div className="bg-black/30 p-4 rounded-xl border border-white/10 flex items-center gap-3 font-mono text-sm">
                <span className="text-green-400 font-bold">GET</span>
                <span className="text-slate-300">/api/v1/jobs/job_12345</span>
             </div>
             
             <Tooltip text="Add the credential to the request payload">
              <div className="flex items-center gap-3 p-4 bg-white/5 rounded-xl border border-white/5 cursor-pointer hover:bg-white/10 transition-colors" onClick={() => setIncludeKey(!includeKey)}>
                  <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${includeKey ? 'bg-blue-500 border-blue-500' : 'border-slate-500'}`}>
                    {includeKey && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <label className="text-sm text-slate-300 cursor-pointer select-none flex-1">
                    Send <code className="text-purple-300 bg-purple-500/10 px-1 rounded">X-API-Key</code> Header
                  </label>
              </div>
             </Tooltip>

             <Tooltip text="Perform a diagnostic request to the gateway">
              <button 
                onClick={runTestRequest}
                disabled={isTestRunning}
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.5)] flex items-center justify-center gap-2 border border-blue-400/20"
              >
                {isTestRunning ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
                Execute Request
              </button>
             </Tooltip>
          </div>

          <div className="bg-black/40 rounded-xl border border-white/10 p-5 min-h-[200px] font-mono text-xs relative overflow-hidden shadow-inner">
             {!testResponse && !isTestRunning && (
               <div className="absolute inset-0 flex items-center justify-center text-slate-600">
                 Ready to dispatch...
               </div>
             )}
             
             {isTestRunning && (
               <div className="absolute inset-0 flex flex-col items-center justify-center text-blue-400 gap-2">
                 <RefreshCw className="w-6 h-6 animate-spin" />
                 <span>Connecting to gateway...</span>
               </div>
             )}

             {testResponse && !isTestRunning && (
               <div className="animate-fade-in relative z-10">
                 <div className="flex items-center gap-3 mb-3 border-b border-white/10 pb-3">
                   <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${testResponse.status === 200 ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
                     {testResponse.status} {testResponse.statusText}
                   </span>
                   <span className="text-slate-600 text-[10px]">145ms latency</span>
                 </div>
                 <pre className={testResponse.status === 200 ? "text-blue-200" : "text-red-300"}>
                   {JSON.stringify(testResponse.data || testResponse.error, null, 2)}
                 </pre>
               </div>
             )}
          </div>
        </div>
      </div>

      {/* Endpoints List */}
      <div className="space-y-4">
        {[
          { method: 'POST', url: '/resumes', desc: 'Upload and ingest candidate resume', tooltip: 'Submit a file for analysis' },
          { method: 'POST', url: '/jobs', desc: 'Create job & auto-extract skills', isNew: true, tooltip: 'Initialize a new job profile' },
          { method: 'GET', url: '/matches/{id}', desc: 'Get computed score from matching_engine', isSecured: true, tooltip: 'Retrieve score for a candidate' },
        ].map((ep, idx) => (
          <Tooltip text={ep.tooltip} key={idx}>
            <div className="glass-panel rounded-2xl overflow-hidden hover:bg-white/5 transition-colors group cursor-pointer border border-white/5 w-full">
              <div className="px-6 py-5 flex items-center gap-5">
                <span className={`px-3 py-1 text-xs font-bold rounded border ${ep.method === 'POST' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'}`}>
                  {ep.method}
                </span>
                <code className="text-slate-200 font-mono text-sm">{ep.url}</code>
                <span className="text-slate-500 text-sm flex-1 group-hover:text-slate-400 transition-colors hidden md:block">- {ep.desc}</span>
                {ep.isNew && <span className="text-[10px] bg-blue-500 text-white px-2 py-0.5 rounded shadow-[0_0_10px_rgba(59,130,246,0.5)]">New</span>}
                {ep.isSecured && <span className="text-[10px] flex items-center gap-1 text-yellow-400 bg-yellow-500/10 px-2 py-0.5 rounded border border-yellow-500/20"><Lock className="w-3 h-3" /> Secured</span>}
                <ChevronDown className="w-4 h-4 text-slate-600 group-hover:text-white transition-colors" />
              </div>
            </div>
          </Tooltip>
        ))}
      </div>
    </div>
  );
};

export default APIDocs;
