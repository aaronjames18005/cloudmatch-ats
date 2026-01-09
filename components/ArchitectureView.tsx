import React from 'react';
import { Folder, FileCode, Server, Database, Cloud, Layers, GitBranch, Box, Rocket, Cpu } from 'lucide-react';

const FolderItem: React.FC<{ name: string; children?: React.ReactNode }> = ({ name, children }) => (
  <div className="ml-4">
    <div className="flex items-center gap-2 py-1.5 text-slate-300 group">
      <Folder className="w-4 h-4 text-blue-400/70 fill-blue-400/10 group-hover:text-blue-400 transition-colors" />
      <span className="font-mono text-sm group-hover:text-white transition-colors">{name}</span>
    </div>
    <div className="border-l border-white/10 ml-2 pl-2">
      {children}
    </div>
  </div>
);

const FileItem: React.FC<{ name: string; desc?: string }> = ({ name, desc }) => (
  <div className="ml-4 flex items-center gap-2 py-1 group">
    <FileCode className="w-4 h-4 text-slate-600 group-hover:text-blue-300 transition-colors" />
    <span className="font-mono text-sm text-slate-500 group-hover:text-slate-200 transition-colors">{name}</span>
    {desc && <span className="text-xs text-slate-600 hidden md:inline-block ml-2 opacity-0 group-hover:opacity-100 transition-opacity">// {desc}</span>}
  </div>
);

const ArchitectureView: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto animate-fade-in grid grid-cols-1 lg:grid-cols-2 gap-8">
      
      {/* Left Column: Code Structure */}
      <div className="glass-panel rounded-3xl overflow-hidden flex flex-col h-full shadow-2xl border border-white/10">
        <div className="bg-white/5 p-5 border-b border-white/10 flex items-center justify-between backdrop-blur-md">
           <h3 className="font-bold text-white flex items-center gap-2">
             <Layers className="w-5 h-5 text-blue-400" />
             Backend Source Layout
           </h3>
           <span className="text-xs bg-blue-500/20 text-blue-200 border border-blue-500/30 px-2 py-1 rounded font-mono">/src</span>
        </div>
        <div className="p-6 overflow-y-auto max-h-[600px] bg-black/20">
          <div className="font-mono text-sm">
            <FolderItem name="smart-resume-analyzer">
              <FolderItem name="app">
                <FileItem name="main.py" desc="FastAPI entrypoint / Mangum handler" />
                <FolderItem name="api/v1">
                  <FileItem name="resumes.py" desc="Resume upload endpoints" />
                  <FileItem name="jobs.py" desc="JD management + Extraction" />
                  <FileItem name="matches.py" desc="Query match results" />
                </FolderItem>
                <FolderItem name="services">
                  <FileItem name="resume_service.py" />
                  <FileItem name="matching_service.py" />
                </FolderItem>
                <FolderItem name="core">
                  <FileItem name="config.py" />
                  <FileItem name="security.py" desc="JWT & API Keys Middleware" />
                </FolderItem>
              </FolderItem>
              
              <FolderItem name="lambdas">
                <FolderItem name="resume_ingest">
                  <FileItem name="handler.py" desc="Triggered by S3 upload" />
                </FolderItem>
                <FolderItem name="jd_ingest">
                  <FileItem name="handler.py" />
                </FolderItem>
                <FolderItem name="skill_extraction">
                  <FileItem name="handler.py" desc="NER (Spacy/Transformers)" />
                </FolderItem>
                <FolderItem name="matching_engine">
                  <FileItem name="handler.py" desc="Core scoring logic" />
                </FolderItem>
              </FolderItem>

              <FolderItem name="infra">
                <FileItem name="template.yaml" desc="SAM / Terraform definitions" />
              </FolderItem>
              <FileItem name="Dockerfile" />
              <FileItem name="requirements.txt" />
            </FolderItem>
          </div>
        </div>
      </div>

      {/* Right Column: Architecture & CI/CD */}
      <div className="space-y-8">
        {/* Infrastructure */}
        <div className="glass-panel rounded-3xl p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
          <h3 className="font-bold text-white mb-6 flex items-center gap-3">
            <Cloud className="w-6 h-6 text-blue-400" />
            Cloud Native Components
          </h3>
          <div className="space-y-5 relative z-10">
            <div className="flex items-start gap-5 p-5 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors">
              <div className="bg-orange-500/10 p-3 rounded-xl border border-orange-500/10">
                <Server className="w-6 h-6 text-orange-400" />
              </div>
              <div>
                <h4 className="font-semibold text-white">AWS Lambda</h4>
                <p className="text-sm text-slate-400 mt-1 leading-relaxed">
                  Serverless compute for <code className="text-orange-300">resume_ingest</code> and <code className="text-orange-300">matching_engine</code>. 
                  Enhanced with <strong>NER</strong> for precise skill tagging.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-5 p-5 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors">
              <div className="bg-green-500/10 p-3 rounded-xl border border-green-500/10">
                <Database className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <h4 className="font-semibold text-white">S3 + RDS</h4>
                <p className="text-sm text-slate-400 mt-1 leading-relaxed">
                  Scalable object storage for docs. Relational data (PostgreSQL) for structured candidate profiles.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-5 p-5 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors">
              <div className="bg-blue-500/10 p-3 rounded-xl border border-blue-500/10">
                <Cpu className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h4 className="font-semibold text-white">FastAPI Gateway</h4>
                <p className="text-sm text-slate-400 mt-1 leading-relaxed">
                  High-performance async REST Interface. Handles <strong>Authentication</strong> via <code className="text-blue-300">core/security.py</code>.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CI/CD Pipeline */}
        <div className="glass-panel rounded-3xl p-8 shadow-2xl">
          <h3 className="font-bold text-white mb-6 flex items-center gap-3">
            <Rocket className="w-6 h-6 text-purple-400" />
            CI/CD Pipeline
          </h3>
          <div className="relative pl-6 border-l-2 border-white/10 space-y-8">
            
            <div className="relative group">
              <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-slate-800 border-2 border-slate-600 group-hover:border-blue-500 transition-colors" />
              <div className="flex items-start gap-4">
                <GitBranch className="w-5 h-5 text-slate-400 mt-0.5 group-hover:text-blue-400 transition-colors" />
                <div>
                  <h4 className="text-sm font-bold text-white group-hover:text-blue-300 transition-colors">GitHub Actions</h4>
                  <p className="text-xs text-slate-500 mt-1">Lint, Test, & Security Scan triggers on PR.</p>
                </div>
              </div>
            </div>

            <div className="relative group">
              <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-slate-800 border-2 border-slate-600 group-hover:border-blue-500 transition-colors" />
              <div className="flex items-start gap-4">
                <Box className="w-5 h-5 text-slate-400 mt-0.5 group-hover:text-blue-400 transition-colors" />
                <div>
                  <h4 className="text-sm font-bold text-white group-hover:text-blue-300 transition-colors">Build & Push</h4>
                  <p className="text-xs text-slate-500 mt-1">Docker Image → AWS ECR Container Registry.</p>
                </div>
              </div>
            </div>

            <div className="relative group">
              <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-green-500 border-2 border-green-300 shadow-[0_0_10px_rgba(34,197,94,0.6)] animate-pulse" />
              <div className="flex items-start gap-4">
                <Cloud className="w-5 h-5 text-green-400 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-white group-hover:text-green-300 transition-colors">Production Deploy</h4>
                  <p className="text-xs text-slate-500 mt-1">AWS SAM updates Lambda aliases & API Gateway stages.</p>
                </div>
              </div>
            </div>
          
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArchitectureView;