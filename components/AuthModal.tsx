
import React, { useState, useEffect } from 'react';
import { X, Lock, Mail, Shield, AlertCircle, Loader2, CheckCircle2, Key, User as UserIcon, ArrowLeft, Info, Sparkles, RefreshCw, ArrowRight } from 'lucide-react';
import { User } from '../types';
import { authService } from '../services/authMock';

interface AuthModalProps {
  onClose: () => void;
  onLogin: (user: User) => void;
}

type AuthView = 'LOGIN' | 'REGISTER' | 'VERIFY' | 'RESET_PASSWORD';

const AuthModal: React.FC<AuthModalProps> = ({ onClose, onLogin }) => {
  const [view, setView] = useState<AuthView>('LOGIN');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [otp, setOtp] = useState('');
  const [demoCode, setDemoCode] = useState<string | null>(null);
  const [simulatedLink, setSimulatedLink] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const resetState = (newView: AuthView) => {
    setError(null);
    setSuccessMsg(null);
    setDemoCode(null);
    setSimulatedLink(null);
    setView(newView);
  };

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const result = await authService.signIn(email, password);
      setIsLoading(false);

      if (result.success && result.user) {
        onLogin(result.user);
      } else {
        if (result.code) {
          setEmail(email);
          setView('VERIFY');
          setDemoCode(result.code);
          setError(result.message || 'Verification required.');
        } else {
          setError(result.message || 'Login failed. Please check your credentials.');
        }
      }
    } catch (e) {
      setIsLoading(false);
      setError("An unexpected error occurred during sign in.");
    }
  };

  const handleRegister = async () => {
    if (!email || !password || !name) {
      setError('Full Name, Email, and Password are required.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    try {
      const result = await authService.signUp(name, email, password);
      setIsLoading(false);

      if (!result.success) {
        setError(result.message || 'Registration failed.');
        return;
      }

      if (result.code) setDemoCode(result.code);
      setSuccessMsg('Local account created! Please verify.');
      setView('VERIFY');
    } catch (e) {
      setIsLoading(false);
      setError("An unexpected error occurred during registration.");
    }
  };

  const handleVerify = async () => {
    if (!otp) return;
    setIsLoading(true);
    setError(null);
    try {
      const result = await authService.verifyEmailSandbox(email, otp);
      setIsLoading(false);
      if (result.success) {
        setSuccessMsg('Email verified! Logging you in...');
        setTimeout(handleLogin, 1000);
      } else {
        setError(result.message || 'Invalid code.');
      }
    } catch (e) {
      setIsLoading(false);
      setError("Verification failed.");
    }
  };

  const handlePasswordReset = async () => {
    if (!email) {
      setError('Please enter your email.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setSimulatedLink(null);
    try {
      const result = await authService.resetPassword(email);
      setIsLoading(false);
      if (result.success) {
        setSuccessMsg(result.message || 'Reset instructions generated.');
        if (result.simulatedLink) setSimulatedLink(result.simulatedLink);
      } else {
        setError(result.message || 'Reset failed.');
      }
    } catch (e) {
      setIsLoading(false);
      setError("Password reset request failed.");
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-md glass-panel rounded-[2.5rem] relative border border-white/10 bg-[#0f172a] shadow-2xl overflow-hidden">
        <button 
          onClick={onClose} 
          className="absolute top-6 right-6 z-20 text-slate-400 hover:text-white p-2 hover:bg-white/5 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className={`absolute top-0 left-0 w-full h-1.5 transition-all duration-700 ${view === 'REGISTER' ? 'bg-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.5)]' : 'bg-primary shadow-glow'}`} />

        <div className="p-10">
          <div className="text-center mb-10">
            <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 bg-gradient-to-br transition-all duration-700 ${view === 'REGISTER' ? 'from-purple-600 to-indigo-600 shadow-purple-500/20' : 'from-blue-600 to-cyan-600 shadow-primary/20'} shadow-2xl`}>
              {view === 'VERIFY' ? <Shield className="w-10 h-10 text-white" /> : 
               view === 'RESET_PASSWORD' ? <Key className="w-10 h-10 text-white" /> :
               view === 'REGISTER' ? <UserIcon className="w-10 h-10 text-white" /> :
               <Lock className="w-10 h-10 text-white" />}
            </div>
            <h2 className="text-3xl font-black text-white tracking-tight">
              {view === 'LOGIN' && 'Local Login'}
              {view === 'REGISTER' && 'Create Account'}
              {view === 'VERIFY' && 'Quick Verification'}
              {view === 'RESET_PASSWORD' && 'Recover Access'}
            </h2>
            <p className="text-slate-400 text-sm mt-3 leading-relaxed">
              {view === 'LOGIN' && 'Sign in to access your local career data.'}
              {view === 'REGISTER' && 'Initialize your personal ATS dashboard.'}
              {view === 'VERIFY' && `A simulated code was sent to ${email}`}
              {view === 'RESET_PASSWORD' && 'Enter email to receive a local recovery link.'}
            </p>
          </div>

          <div className="space-y-5">
            {error && (
              <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-3 animate-slide-up">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-4 rounded-2xl bg-green-500/10 border border-green-500/20 text-green-400 text-xs flex items-center gap-3 animate-slide-up">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {view === 'REGISTER' && (
              <div className="space-y-1.5 group">
                <label className="text-[10px] uppercase font-bold text-slate-500 tracking-widest ml-1">Full Name</label>
                <div className="relative">
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full glass-input rounded-2xl pl-11 pr-4 py-4 text-sm"
                    placeholder="John Doe"
                  />
                </div>
              </div>
            )}

            {(view === 'LOGIN' || view === 'REGISTER' || view === 'RESET_PASSWORD') && (
              <div className="space-y-1.5 group">
                <label className="text-[10px] uppercase font-bold text-slate-500 tracking-widest ml-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full glass-input rounded-2xl pl-11 pr-4 py-4 text-sm"
                    placeholder="name@cloudmatch.io"
                  />
                </div>
              </div>
            )}

            {(view === 'LOGIN' || view === 'REGISTER') && (
              <div className="space-y-1.5 group">
                <div className="flex justify-between items-center px-1">
                  <label className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Password</label>
                  {view === 'LOGIN' && (
                    <button 
                      onClick={() => resetState('RESET_PASSWORD')}
                      className="text-[10px] text-blue-400 hover:text-blue-300 font-bold uppercase tracking-widest"
                    >
                      Forgot?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full glass-input rounded-2xl pl-11 pr-4 py-4 text-sm"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            )}

            {view === 'VERIFY' && (
              <div className="space-y-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-slate-500 tracking-widest ml-1">Security Code</label>
                  <input 
                    type="text" 
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    maxLength={6}
                    className="w-full glass-input rounded-2xl px-4 py-5 text-center text-3xl font-black tracking-[0.4em] text-white"
                    placeholder="000000"
                  />
                </div>
                {demoCode && (
                  <div className="p-5 bg-blue-500/10 border border-blue-500/20 rounded-2xl text-center">
                      <p className="text-[10px] text-blue-400 uppercase font-bold mb-1 tracking-widest">System Signal</p>
                      <p className="text-2xl font-mono font-bold text-white tracking-widest">{demoCode}</p>
                  </div>
                )}
              </div>
            )}

            <button 
              onClick={
                view === 'LOGIN' ? handleLogin : 
                view === 'REGISTER' ? handleRegister : 
                view === 'VERIFY' ? handleVerify : 
                handlePasswordReset
              }
              disabled={isLoading}
              className={`w-full py-5 rounded-2xl font-black text-sm tracking-widest transition-all shadow-2xl flex items-center justify-center gap-3 mt-6
                ${view === 'REGISTER' ? 'bg-purple-600 hover:bg-purple-500 shadow-purple-500/20' : 'bg-primary hover:bg-blue-500 shadow-primary/20'} 
                disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  PROCESSING...
                </>
              ) : (
                <>
                  {view === 'LOGIN' && 'SIGN IN'}
                  {view === 'REGISTER' && 'CREATE ACCOUNT'}
                  {view === 'VERIFY' && 'VERIFY CODE'}
                  {view === 'RESET_PASSWORD' && 'RECOVER ACCOUNT'}
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>

            {simulatedLink && (
               <div className="mt-4 p-5 bg-orange-500/10 border border-orange-500/20 rounded-2xl overflow-hidden">
                  <p className="text-[10px] text-orange-400 font-bold uppercase mb-2 flex items-center gap-2"><Info className="w-3.5 h-3.5" /> Local Link</p>
                  <a href={simulatedLink} className="text-[10px] text-blue-400 hover:underline break-all font-mono block">{simulatedLink}</a>
               </div>
            )}

            <div className="pt-8 border-t border-white/5 text-center">
              {view === 'LOGIN' ? (
                <p className="text-xs text-slate-500">
                  New to CloudMatch? {' '}
                  <button onClick={() => resetState('REGISTER')} className="text-white font-black hover:underline tracking-tight">Register locally</button>
                </p>
              ) : (
                <button 
                  onClick={() => resetState('LOGIN')} 
                  className="text-xs text-slate-500 hover:text-white flex items-center justify-center gap-2 mx-auto font-bold transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" /> BACK TO SIGN IN
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="bg-black/40 px-10 py-5 flex items-center justify-between border-t border-white/5">
           <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-slate-500" />
              <span className="text-[10px] text-slate-500 font-black uppercase tracking-[0.15em]">Standalone Mode</span>
           </div>
           <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-widest">
              <Sparkles className="w-3 h-3" /> LOCAL STORAGE
           </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
