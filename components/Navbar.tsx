
import React from 'react';
import { ActiveTab, User } from '../types';
import { Map, CheckSquare, Database, LogIn, User as UserIcon, ChevronDown, LogOut, UploadCloud, Code } from 'lucide-react';

interface NavbarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  user: User | null;
  onLoginClick: () => void;
  onLogoutClick: () => void;
  isLanding?: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ activeTab, onTabChange, user, onLoginClick, onLogoutClick, isLanding = false }) => {
  // Filter nav items based on role, only show if NOT in landing mode
  const navItems = [
    { id: 'analyzer', label: 'Analyzer' },
    { id: 'path', label: 'Roadmap', icon: Map },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare },
    { id: 'jobs', label: 'Jobs' },
  ];

  if (user?.role === 'admin') {
    navItems.push({ id: 'database', label: 'Registry', icon: Database });
    navItems.push({ id: 'api', label: 'Developers', icon: Code });
  }

  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-[#020617]/80 backdrop-blur-xl transition-all duration-300">
      <div className="mx-auto flex w-full max-w-[1400px] items-center justify-between px-4 py-3 md:px-8">
        {/* Branding */}
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => onTabChange('analyzer')}>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primaryDark to-primary border border-white/10 shadow-glow transition-transform duration-300 group-hover:scale-105">
            <span className="text-sm font-bold text-white">CM</span>
          </div>
          <div className="leading-tight">
            <p className="text-base font-bold text-white tracking-tight">
              CloudMatch ATS
            </p>
            <p className="text-[0.6rem] text-accent uppercase tracking-wider font-bold opacity-80">
              AI Resume Analyzer
            </p>
          </div>
        </div>

        {/* Desktop Nav - Only show if NOT landing page */}
        {!isLanding && (
          <nav className="hidden md:flex items-center gap-1 p-1 rounded-full bg-white/5 border border-white/5 backdrop-blur-md">
            {navItems.map((item) => (
              <button 
                key={item.id}
                onClick={() => onTabChange(item.id as ActiveTab)}
                className={`flex items-center gap-2 justify-center rounded-full px-5 py-2 text-sm font-medium transition-all duration-300 ${activeTab === item.id ? 'bg-white/10 text-white shadow-sm border border-white/10' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
              >
                {item.icon && <item.icon className="w-4 h-4 opacity-80" />}
                {item.label}
              </button>
            ))}
          </nav>
        )}

        {/* User Auth Section */}
        <div className="flex items-center gap-4">
          {/* Upload CTA - Visible on Landing */}
          {isLanding && (
            <button 
               onClick={() => document.getElementById('resume-upload-input')?.click()}
               className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full border border-accent/30 text-accent text-sm font-bold hover:bg-accent/10 transition-all shadow-[0_0_15px_rgba(6,182,212,0.15)]"
            >
               <UploadCloud className="w-4 h-4" />
               <span className="hidden sm:inline">Upload Resume</span>
            </button>
          )}

          {user ? (
            <div className="group relative">
              <button className="flex items-center gap-3 pl-2 pr-4 py-1.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full border border-white/20" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary border border-primary/30">
                    <UserIcon className="w-4 h-4" />
                  </div>
                )}
                <div className="text-left hidden sm:block">
                  <p className="text-xs font-bold text-white leading-none mb-0.5">{user.name}</p>
                  <p className="text-[0.6rem] text-slate-400 uppercase tracking-wider font-bold">{user.role}</p>
                </div>
                <ChevronDown className="w-3 h-3 text-slate-500" />
              </button>
              
              {/* Dropdown */}
              <div className="absolute right-0 top-full mt-2 w-48 py-2 bg-[#0f172a] border border-white/10 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all transform origin-top-right z-50">
                 <div className="px-4 py-2 border-b border-white/5 mb-1">
                   <p className="text-xs text-slate-400">Signed in as</p>
                   <p className="text-sm font-bold text-white truncate">{user.email}</p>
                 </div>
                 <button 
                   onClick={onLogoutClick}
                   className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-white/5 flex items-center gap-2"
                 >
                   <LogOut className="w-4 h-4" /> Sign Out
                 </button>
              </div>
            </div>
          ) : (
            <button 
              onClick={onLoginClick}
              className="text-slate-300 hover:text-white text-sm font-bold transition-colors px-2"
            >
              Sign In
            </button>
          )}
        </div>
      </div>
      
      {/* Mobile Nav - Only if not landing */}
      {!isLanding && (
        <div className="md:hidden flex justify-center pb-3 pt-2 border-t border-white/5 bg-[#020617]/90 backdrop-blur-xl overflow-x-auto scrollbar-hide">
           <nav className="flex gap-6 px-4 text-sm font-medium min-w-max">
             {navItems.map((item) => (
               <button 
                 key={item.id}
                 onClick={() => onTabChange(item.id as ActiveTab)} 
                 className={activeTab === item.id ? 'text-accent font-bold border-b-2 border-accent pb-1' : 'text-slate-400 pb-1'}
               >
                 {item.label}
               </button>
             ))}
           </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;
