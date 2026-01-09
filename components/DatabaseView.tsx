
import React, { useState, useEffect } from 'react';
import { HistoryRecord, Job, User } from '../types';
import { authService } from '../services/authMock';
import { Database, Search, User as UserIcon, CheckCircle2, BarChart3, List, LayoutGrid, Briefcase, Tag, Calendar, Users, Shield, Trash2, MoreHorizontal } from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, 
  AreaChart, Area
} from 'recharts';

interface DatabaseViewProps {
  history: HistoryRecord[];
  jobs?: Job[];
}

const DatabaseView: React.FC<DatabaseViewProps> = ({ history, jobs = [] }) => {
  const [activeSection, setActiveSection] = useState<'resumes' | 'jobs' | 'users'>('resumes');
  const [viewMode, setViewMode] = useState<'list' | 'analytics'>('analytics');
  
  // User Management State
  const [userList, setUserList] = useState<User[]>([]);
  const [userSearch, setUserSearch] = useState('');

  // Fetch users when entering user tab
  useEffect(() => {
    if (activeSection === 'users') {
      authService.getAllUsers().then(users => setUserList(users));
    }
  }, [activeSection]);

  const handleDeleteUser = async (id: string) => {
    if (confirm("Are you sure you want to delete this user?")) {
      await authService.deleteUser(id);
      setUserList(prev => prev.filter(u => u.id !== id));
    }
  };

  const handleToggleRole = async (user: User) => {
    const newRole = user.role === 'admin' ? 'user' : 'admin';
    await authService.updateUserRole(user.id, newRole);
    setUserList(prev => prev.map(u => u.id === user.id ? { ...u, role: newRole } : u));
  };

  // Analytics Data (Existing logic)
  const skillCounts: Record<string, number> = {};
  history.forEach(record => {
    (record.matchedSkills || []).forEach(skill => {
      skillCounts[skill.name] = (skillCounts[skill.name] || 0) + 1;
    });
  });
  
  const topSkillsData = Object.entries(skillCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const scoreTrendsData = history.slice().reverse().map((record, index) => ({
    name: `C-${index + 1}`,
    score: record.matchScore
  }));

  return (
    <div className="max-w-7xl mx-auto animate-fade-in space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-8">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
            <div className="p-2 bg-white/5 rounded-lg border border-white/10">
               <Database className="w-5 h-5 md:w-6 md:h-6 text-blue-300" />
            </div>
            <span>Global Registry</span>
          </h2>
          <p className="text-slate-400 text-sm mt-2 ml-1">
             Secured data vault. Total Records: {history.length + jobs.length}
          </p>
        </div>
        
        <div className="flex items-center bg-black/30 p-1 rounded-xl border border-white/10 backdrop-blur-md">
           <button 
             onClick={() => setActiveSection('resumes')}
             className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeSection === 'resumes' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
           >
             <UserIcon className="w-4 h-4" /> Candidates
           </button>
           <button 
             onClick={() => setActiveSection('jobs')}
             className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeSection === 'jobs' ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/25' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
           >
             <Briefcase className="w-4 h-4" /> Job Postings
           </button>
           <button 
             onClick={() => setActiveSection('users')}
             className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeSection === 'users' ? 'bg-orange-600 text-white shadow-lg shadow-orange-500/25' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
           >
             <Users className="w-4 h-4" /> Users
           </button>
        </div>
      </div>

      {activeSection === 'resumes' && (
        <>
          {history.length === 0 ? (
            <div className="glass-panel rounded-3xl p-16 text-center border-dashed border-2 border-white/10">
               <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 animate-float">
                 <Database className="w-8 h-8 text-slate-500" />
               </div>
               <h3 className="text-xl font-medium text-white">Candidate Registry Empty</h3>
               <p className="text-slate-400 mt-2">Analyze a resume to populate the database.</p>
            </div>
          ) : (
            <>
              {/* Controls */}
              <div className="flex justify-end items-center gap-3">
                <div className="flex bg-black/20 p-1 rounded-xl border border-white/10 backdrop-blur-sm">
                  <button 
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white/10 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
                    title="List View"
                  >
                    <List className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => setViewMode('analytics')}
                    className={`p-2 rounded-lg transition-all ${viewMode === 'analytics' ? 'bg-white/10 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
                    title="Analytics View"
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input 
                    type="text" 
                    placeholder="Search candidates..." 
                    className="glass-input rounded-xl pl-9 pr-4 py-2 text-sm text-slate-200 w-48 focus:w-64 transition-all"
                  />
                </div>
              </div>

              {viewMode === 'analytics' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in">
                  {/* Score Trend Chart */}
                  <div className="glass-panel rounded-3xl p-8 shadow-xl relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent pointer-events-none"></div>
                    <h3 className="text-lg font-bold text-white mb-6 relative z-10">Match Score Trend</h3>
                    <div className="h-64 w-full relative z-10">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={scoreTrendsData}>
                          <defs>
                            <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.5}/>
                              <stop offset="95%" stopColor="#60a5fa" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                          <XAxis dataKey="name" stroke="#64748b" tick={{fontSize: 11}} tickLine={false} axisLine={false} />
                          <YAxis stroke="#64748b" tick={{fontSize: 11}} tickLine={false} axisLine={false} />
                          <RechartsTooltip 
                            contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', borderColor: 'rgba(255,255,255,0.1)', color: '#f1f5f9', borderRadius: '12px', backdropFilter: 'blur(8px)' }}
                            itemStyle={{ color: '#60a5fa' }}
                            cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1 }}
                          />
                          <Area type="monotone" dataKey="score" stroke="#60a5fa" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Top Skills Chart */}
                  <div className="glass-panel rounded-3xl p-8 shadow-xl relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-bl from-green-500/5 to-transparent pointer-events-none"></div>
                    <h3 className="text-lg font-bold text-white mb-6 relative z-10">Top Matched Skills</h3>
                    <div className="h-64 w-full relative z-10">
                       <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={topSkillsData} layout="vertical" margin={{ left: 20 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                          <XAxis type="number" stroke="#64748b" hide />
                          <YAxis dataKey="name" type="category" stroke="#94a3b8" width={100} tick={{fontSize: 11}} tickLine={false} axisLine={false} />
                          <RechartsTooltip 
                             cursor={{fill: 'rgba(255,255,255,0.05)'}}
                             contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', borderColor: 'rgba(255,255,255,0.1)', color: '#f1f5f9', borderRadius: '12px', backdropFilter: 'blur(8px)' }}
                          />
                          <Bar dataKey="count" fill="#34d399" radius={[0, 4, 4, 0]} barSize={16} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              )}

              {/* List View */}
              <div className={`glass-panel rounded-3xl overflow-hidden shadow-2xl border border-white/10 ${viewMode === 'analytics' ? 'mt-8' : ''}`}>
                 {viewMode === 'analytics' && <div className="px-8 py-5 border-b border-white/10 font-semibold text-white/80 text-sm tracking-wider uppercase">Recent Activity</div>}
                 <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-white/5 text-slate-400 uppercase font-medium text-xs">
                      <tr>
                        <th className="px-8 py-5 font-medium tracking-wider">Candidate</th>
                        <th className="px-8 py-5 font-medium tracking-wider">Experience</th>
                        <th className="px-8 py-5 font-medium tracking-wider">Match Score</th>
                        <th className="px-8 py-5 font-medium tracking-wider">Top Skill</th>
                        <th className="px-8 py-5 font-medium tracking-wider text-right">Ingested At</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {history.map((record) => (
                        <tr key={record.id} className="hover:bg-white/5 transition-colors group">
                          <td className="px-8 py-5">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-full glass flex items-center justify-center text-slate-300 group-hover:bg-blue-500/20 group-hover:text-blue-300 transition-colors">
                                <UserIcon className="w-5 h-5" />
                              </div>
                              <div>
                                <span className="font-medium text-white block">{record.candidateName}</span>
                                <span className="font-mono text-[10px] text-slate-500">{record.id.substring(0, 8)}</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-5 text-slate-300">{record.yearsExperience} Yrs</td>
                          <td className="px-8 py-5">
                            <div className="flex items-center gap-3">
                               <div className="w-24 h-1.5 bg-black/40 rounded-full overflow-hidden">
                                 <div 
                                    className={`h-full rounded-full shadow-[0_0_10px_currentColor] ${
                                      record.matchScore > 70 ? 'bg-green-500 text-green-500' : 
                                      record.matchScore > 40 ? 'bg-yellow-500 text-yellow-500' : 'bg-red-500 text-red-500'
                                    }`} 
                                    style={{ width: `${record.matchScore}%` }}
                                 />
                               </div>
                               <span className={`font-bold text-xs ${
                                 record.matchScore > 70 ? 'text-green-400' : 
                                 record.matchScore > 40 ? 'text-yellow-400' : 'text-red-400'
                               }`}>
                                 {record.matchScore}%
                               </span>
                            </div>
                          </td>
                          <td className="px-8 py-5">
                            {record.matchedSkills && record.matchedSkills[0] ? (
                              <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-blue-500/5 text-blue-300 text-xs border border-blue-500/10">
                                <CheckCircle2 className="w-3 h-3" /> {record.matchedSkills[0].name}
                              </span>
                            ) : (
                              <span className="text-slate-500">-</span>
                            )}
                          </td>
                          <td className="px-8 py-5 text-slate-400 font-mono text-xs text-right">
                            {new Date(record.timestamp).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </>
      )}

      {/* JOBS VIEW */}
      {activeSection === 'jobs' && (
        <>
           {jobs.length === 0 ? (
            <div className="glass-panel rounded-3xl p-16 text-center border-dashed border-2 border-white/10">
               <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 animate-float">
                 <Briefcase className="w-8 h-8 text-slate-500" />
               </div>
               <h3 className="text-xl font-medium text-white">No Job Postings</h3>
               <p className="text-slate-400 mt-2">Create a job description in the Jobs tab to populate this list.</p>
            </div>
          ) : (
            <div className="glass-panel rounded-3xl overflow-hidden shadow-2xl border border-white/10">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-white/5 text-slate-400 uppercase font-medium text-xs">
                    <tr>
                      <th className="px-8 py-5 font-medium tracking-wider">Job Title</th>
                      <th className="px-8 py-5 font-medium tracking-wider">Skills Extracted</th>
                      <th className="px-8 py-5 font-medium tracking-wider">Status</th>
                      <th className="px-8 py-5 font-medium tracking-wider text-right">Created At</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {jobs.map((job) => (
                      <tr key={job.id} className="hover:bg-white/5 transition-colors group">
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full glass flex items-center justify-center text-slate-300 group-hover:bg-purple-500/20 group-hover:text-purple-300 transition-colors">
                              <Briefcase className="w-5 h-5" />
                            </div>
                            <div>
                              <span className="font-medium text-white block">{job.title}</span>
                              <span className="font-mono text-[10px] text-slate-500">{job.id}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <div className="flex flex-wrap gap-1.5">
                             {job.skills?.slice(0, 3).map((skill, i) => (
                               <span key={i} className="px-2 py-0.5 rounded bg-white/5 text-slate-300 text-[10px] border border-white/10 flex items-center gap-1">
                                 <Tag className="w-2.5 h-2.5" /> {skill.name}
                               </span>
                             ))}
                             {job.skills?.length > 3 && <span className="text-[10px] text-slate-500">+{job.skills.length - 3} more</span>}
                          </div>
                        </td>
                        <td className="px-8 py-5">
                           <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold border border-emerald-500/20 uppercase tracking-wide">
                             Active
                           </span>
                        </td>
                        <td className="px-8 py-5 text-slate-400 font-mono text-xs text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Calendar className="w-3 h-3" />
                            {new Date(job.createdAt).toLocaleDateString()}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* USER MANAGEMENT VIEW */}
      {activeSection === 'users' && (
        <div className="glass-panel rounded-3xl overflow-hidden shadow-2xl border border-white/10 animate-fade-in">
             <div className="px-8 py-6 border-b border-white/10 flex items-center justify-between">
                <div>
                   <h3 className="text-lg font-bold text-white flex items-center gap-2">
                     <Users className="w-5 h-5 text-orange-400" /> User Directory
                   </h3>
                   <p className="text-slate-400 text-xs mt-1">Manage system access and roles.</p>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input 
                    type="text" 
                    placeholder="Search users..." 
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="glass-input rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 w-48 focus:w-64 transition-all"
                  />
                </div>
             </div>

             <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-white/5 text-slate-400 uppercase font-medium text-xs">
                    <tr>
                      <th className="px-8 py-4 font-medium tracking-wider">User</th>
                      <th className="px-8 py-4 font-medium tracking-wider">Role</th>
                      <th className="px-8 py-4 font-medium tracking-wider">Status</th>
                      <th className="px-8 py-4 font-medium tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {userList
                      .filter(u => u.name.toLowerCase().includes(userSearch.toLowerCase()) || u.email.toLowerCase().includes(userSearch.toLowerCase()))
                      .map((u) => (
                      <tr key={u.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-8 py-4">
                          <div className="flex items-center gap-3">
                            <img src={u.avatar} alt={u.name} className="w-9 h-9 rounded-full bg-white/5" />
                            <div>
                              <p className="font-bold text-white">{u.name}</p>
                              <p className="text-xs text-slate-400 font-mono">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-4">
                           {u.role === 'admin' ? (
                             <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/10 text-red-300 text-[10px] font-bold border border-red-500/20 uppercase tracking-wide">
                               <Shield className="w-3 h-3" /> Admin
                             </span>
                           ) : (
                             <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-300 text-[10px] font-bold border border-blue-500/20 uppercase tracking-wide">
                               <UserIcon className="w-3 h-3" /> User
                             </span>
                           )}
                        </td>
                        <td className="px-8 py-4">
                           {u.isVerified ? (
                             <span className="text-green-400 text-xs flex items-center gap-1.5 font-medium">
                               <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                             </span>
                           ) : (
                             <span className="text-slate-500 text-xs flex items-center gap-1.5">
                               <div className="w-3 h-3 rounded-full border-2 border-slate-500/50"></div> Pending
                             </span>
                           )}
                        </td>
                        <td className="px-8 py-4 text-right">
                           <div className="flex items-center justify-end gap-3">
                              <button 
                                onClick={() => handleToggleRole(u)}
                                className="text-xs font-medium text-slate-400 hover:text-white transition-colors"
                              >
                                {u.role === 'admin' ? 'Demote' : 'Promote'}
                              </button>
                              <button 
                                onClick={() => handleDeleteUser(u.id)}
                                className="p-2 hover:bg-red-500/10 rounded-lg text-slate-500 hover:text-red-400 transition-colors"
                                title="Delete User"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                           </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
             </div>
        </div>
      )}
    </div>
  );
};

export default DatabaseView;
