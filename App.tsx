
import React, { useState, useCallback, useEffect } from 'react';
import Navbar from './components/Navbar';
import DatabaseView from './components/DatabaseView';
import JobManager from './components/JobManager';
import RoadmapView from './components/RoadmapView';
import TaskBoard from './components/TaskBoard';
import RoleCoach from './components/RoleCoach';
import ResultDashboard from './components/ResultDashboard';
import UploadSection from './components/UploadSection';
import ProcessingView from './components/ProcessingView';
import AuthModal from './components/AuthModal';
import APIDocs from './components/APIDocs';
import { AppState, AnalysisResult, ActiveTab, HistoryRecord, Roadmap, User, Job, ApiKey } from './types';
import { analyzeResume, generateCareerRoadmap } from './services/gemini';
import { initAuthDB, authService } from './services/authMock';
import { RefreshCw, Home, ShieldAlert } from 'lucide-react';

const generateId = () => `rec_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [activeTab, setActiveTab] = useState<ActiveTab>('analyzer');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [history, setHistory] = useState<HistoryRecord[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [resumeData, setResumeData] = useState<{ mimeType: string; data: string } | string | null>(null);
  const [jobDescription, setJobDescription] = useState<string>('');
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [targetDate, setTargetDate] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);

  // Auth Subscription with stability check
  useEffect(() => {
    initAuthDB();
    const unsubscribe = authService.subscribe((u) => {
        // Only update if the user ID or state changed to prevent render loops
        setUser(prev => {
          if (!u && !prev) return null;
          if (u && prev && u.id === prev.id && u.role === prev.role) return prev;
          return u;
        });
        
        if (!u) {
            setHistory([]); 
            setJobs([]); 
            setApiKeys([]); 
            setRoadmap(null); 
            setResult(null); 
            setActiveTab('analyzer');
        }
    });
    return () => unsubscribe();
  }, []);

  // Load persistence
  useEffect(() => {
    if (!user) return;
    try {
      const storageKey = user.role === 'admin' ? 'admin' : `app_data_${user.id}`;
      if (user.role === 'admin') {
        const historyStr = localStorage.getItem('app_global_history');
        const jobsStr = localStorage.getItem('app_global_jobs');
        const apiKeysStr = localStorage.getItem('app_global_apikeys');
        if (historyStr) setHistory(JSON.parse(historyStr));
        if (jobsStr) setJobs(JSON.parse(jobsStr));
        if (apiKeysStr) setApiKeys(JSON.parse(apiKeysStr));
      } else {
        const savedData = localStorage.getItem(storageKey);
        if (savedData) {
          const parsed = JSON.parse(savedData);
          if (parsed.history) setHistory(parsed.history);
          if (parsed.jobs) setJobs(parsed.jobs);
          if (parsed.roadmap) setRoadmap(parsed.roadmap);
          if (parsed.lastResult) setResult(parsed.lastResult);
        }
      }
    } catch (e) { console.error("Load error", e); }
  }, [user]);

  // Save persistence
  useEffect(() => {
    if (user) {
      try {
        if (user.role === 'admin') {
          localStorage.setItem('app_global_history', JSON.stringify(history));
          localStorage.setItem('app_global_jobs', JSON.stringify(jobs));
          localStorage.setItem('app_global_apikeys', JSON.stringify(apiKeys));
        } else {
          localStorage.setItem(`app_data_${user.id}`, JSON.stringify({ 
            history, 
            jobs, 
            roadmap,
            lastResult: result // Ensure result persists across renders/reloads
          }));
        }
      } catch (e) { console.error("Save error", e); }
    }
  }, [history, jobs, roadmap, apiKeys, user, result]);

  const handleAnalyze = useCallback(async (jd: string, data: { mimeType: string; data: string } | string, fileName: string, retryCount = 0) => {
    if (!jd || !data) return;
    try {
      setError(null);
      setAppState(AppState.UPLOADING);
      await new Promise(r => setTimeout(r, 600));
      setAppState(AppState.PROCESSING);
      await new Promise(r => setTimeout(r, 800));
      setAppState(AppState.ANALYZING);
      
      const analysis = await analyzeResume(jd, data);
      
      const newRecord: HistoryRecord = {
        ...analysis,
        id: generateId(),
        timestamp: new Date().toISOString(),
        jobTitle: jd.slice(0, 30) + (jd.length > 30 ? '...' : ''),
      };

      // Batch state updates to prevent intermediate renders triggering logic resets
      setResult(analysis);
      setRoadmap(null);
      setHistory(prev => [newRecord, ...prev]);
      setAppState(AppState.COMPLETE);
    } catch (err: any) {
      if (retryCount < 1) {
        console.warn("Recovering from AI glitch...", err);
        handleAnalyze(jd, data, fileName, retryCount + 1);
      } else {
        setError(err.message || "The AI matching engine encountered an error.");
        setAppState(AppState.ERROR);
      }
    }
  }, []);

  const handleGenerateRoadmap = async () => {
    if (!result || !jobDescription) return;
    setAppState(AppState.GENERATING_ROADMAP);
    try {
      const road = await generateCareerRoadmap(jobDescription.slice(0, 50), result, targetDate, startDate);
      setRoadmap(road);
      setAppState(AppState.COMPLETE);
      setActiveTab('path');
    } catch (e) {
      setError("AI Roadmap failed. Try again in a moment.");
      setAppState(AppState.ERROR);
    }
  };

  const handleReset = () => {
    setAppState(AppState.IDLE); 
    setResult(null); 
    setRoadmap(null); 
    setError(null);
  };

  const renderAnalyzerContent = () => {
    // 1. Loading/Processing States
    if (appState === AppState.UPLOADING || appState === AppState.PROCESSING || appState === AppState.ANALYZING) {
      return <div className="mt-20"><ProcessingView state={appState} /></div>;
    }

    // 2. Error States
    if (appState === AppState.ERROR) {
      return (
        <div className="max-w-2xl mx-auto mt-20 p-12 glass-panel rounded-[2.5rem] text-center space-y-8 animate-slide-up border-red-500/20 shadow-lg">
          <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mx-auto text-red-500">
            <ShieldAlert className="w-12 h-12" />
          </div>
          <div className="space-y-3 px-6">
            <h2 className="text-2xl font-bold text-white">Analysis Interrupted</h2>
            <p className="text-slate-400 text-sm">{error || "The service is temporarily unavailable."}</p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
                onClick={() => handleAnalyze(jobDescription, resumeData!, selectedFileName!)} 
                className="w-full sm:w-auto px-10 py-4 bg-primary text-white rounded-2xl font-bold flex items-center justify-center gap-2"
            >
                <RefreshCw className="w-5 h-5" /> Re-trigger Pipeline
            </button>
            <button 
                onClick={handleReset} 
                className="w-full sm:w-auto px-10 py-4 bg-white/5 text-slate-300 rounded-2xl font-bold flex items-center justify-center gap-2 border border-white/10"
            >
                <Home className="w-5 h-5" /> Home
            </button>
          </div>
        </div>
      );
    }

    // 3. Results (Successful Analysis)
    if (result) {
      return <ResultDashboard result={result} onReset={handleReset} onGenerateRoadmap={() => setActiveTab('path')} />;
    }

    // 4. Default Upload Screen
    const isWorking = [
      AppState.UPLOADING, 
      AppState.PROCESSING, 
      AppState.ANALYZING, 
      AppState.GENERATING_ROADMAP, 
      AppState.GENERATING_JD
    ].includes(appState);

    return (
      <UploadSection 
        onAnalyze={(jd, data, name) => {
          setJobDescription(jd); 
          setResumeData(data); 
          setSelectedFileName(name);
          handleAnalyze(jd, data, name);
        }} 
        isLoading={isWorking} 
        error={null} 
        onClearError={() => setError(null)}
      />
    );
  };

  return (
    <div className="min-h-screen bg-background text-slate-50 font-sans pb-12 overflow-x-hidden">
      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} onLogin={() => setShowAuthModal(false)} />}
      <div className="fixed top-[-10%] left-[-10%] w-[60vw] h-[60vw] bg-primaryDark/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="relative z-10 flex flex-col">
        <Navbar 
            activeTab={activeTab} 
            onTabChange={setActiveTab} 
            user={user} 
            onLoginClick={() => setShowAuthModal(true)} 
            onLogoutClick={() => authService.signOut()} 
            isLanding={!result && appState === AppState.IDLE} 
        />
        <main className="mx-auto w-full max-w-[1400px] px-4 py-6 md:px-6">
          {activeTab === 'analyzer' && renderAnalyzerContent()}
          {activeTab === 'path' && <RoadmapView roadmap={roadmap} isLoading={appState === AppState.GENERATING_ROADMAP} onGenerate={handleGenerateRoadmap} targetDate={targetDate} onTargetDateChange={setTargetDate} />}
          {activeTab === 'tasks' && <TaskBoard roadmap={roadmap} />}
          {activeTab === 'jobs' && <JobManager jobs={jobs} onJobCreated={(j) => setJobs(prev => [j, ...prev])} />}
          {activeTab === 'api' && user?.role === 'admin' && <APIDocs keys={apiKeys} onUpdateKeys={setApiKeys} />}
          {activeTab === 'database' && user?.role === 'admin' && <DatabaseView history={history} jobs={jobs} />}
        </main>
        {result && <RoleCoach analysis={result} jobTitle={jobDescription} />}
      </div>
    </div>
  );
};

export default App;
