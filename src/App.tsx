import React, { useState, useEffect } from 'react';
import {
  Users,
  LayoutDashboard,
  Gamepad2,
  Search,
  Bell,
  TrendingUp,
  DollarSign,
  Trophy,
  Trash2,
  Plus,
  ShieldAlert,
  Diamond,
  Zap,
  RefreshCw,
  X
} from 'lucide-react';
import axios from 'axios';

const BASE_URL = 'http://localhost:3005/api/admin';

interface Stats {
  totalUsers: number;
  activeToday: number;
  totalMatches: number;
  totalDepositBal: number;
  totalWonBal: number;
  totalBonusBal: number;
  totalGems: number;
}

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [liveGames, setLiveGames] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // 30s auto-refresh
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, usersRes, gamesRes, logsRes, achvRes] = await Promise.all([
        axios.get(`${BASE_URL}/stats`),
        axios.get(`${BASE_URL}/users`),
        axios.get(`${BASE_URL}/games/live`),
        axios.get(`${BASE_URL}/audit-logs`),
        axios.get(`${BASE_URL}/achievements`)
      ]);
      setStats(statsRes.data.stats);
      setUsers(usersRes.data.users);
      setLiveGames(gamesRes.data.rooms);
      setAuditLogs(logsRes.data.logs);
      setAchievements(achvRes.data.achievements || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-premium-dark text-premium-text overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-72 border-r border-white/5 flex flex-col p-6 space-y-8 bg-premium-card/30 backdrop-blur-3xl">
        <div className="flex items-center space-x-3 px-2 mb-4">
          <div className="w-10 h-10 rounded-xl premium-gradient flex items-center justify-center neon-glow">
            <Gamepad2 className="text-white w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-black tracking-tighter text-white">
              DREAMLUDO
            </span>
            <span className="text-[10px] font-bold text-premium-accent tracking-[0.2em] uppercase">
              Admin Ops
            </span>
          </div>
        </div>

        <nav className="flex-1 space-y-2">
          <SidebarLink
            icon={<LayoutDashboard size={20} />}
            label="Dashboard"
            active={activeTab === 'dashboard'}
            onClick={() => setActiveTab('dashboard')}
          />
          <SidebarLink
            icon={<Users size={20} />}
            label="User Arena"
            active={activeTab === 'users'}
            onClick={() => setActiveTab('users')}
          />
          <SidebarLink
            icon={<Trophy size={20} />}
            label="Achievements"
            active={activeTab === 'achievements'}
            onClick={() => setActiveTab('achievements')}
          />
          <SidebarLink
            icon={<Zap size={20} />}
            label="Live Games"
            active={activeTab === 'games'}
            onClick={() => setActiveTab('games')}
          />
          <SidebarLink
            icon={<Bell size={20} />}
            label="Global Broadcast"
            active={activeTab === 'broadcast'}
            onClick={() => setActiveTab('broadcast')}
          />
          <SidebarLink
            icon={<ShieldAlert size={20} />}
            label="Audit Logs"
            active={activeTab === 'logs'}
            onClick={() => setActiveTab('logs')}
          />
        </nav>

        <div className="mt-auto p-4 glass-card bg-premium-accent/5 border-premium-accent/10">
          <div className="flex items-center space-x-2 text-[10px] font-bold text-premium-accent uppercase tracking-widest mb-1">
            <span className="w-1.5 h-1.5 rounded-full bg-premium-accent animate-pulse" />
            <span>System Status</span>
          </div>
          <p className="text-xs text-premium-muted">Core V2.4 Connected</p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-premium-accent/5 via-premium-dark to-premium-dark">
        {/* Header */}
        <header className="h-20 border-b border-white/5 flex items-center justify-between px-10 bg-premium-dark/40 backdrop-blur-md z-10">
          <div className="relative w-96 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-premium-muted group-focus-within:text-premium-accent transition-colors" size={18} />
            <input
              type="text"
              placeholder="Search the arena..."
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-2.5 pl-12 pr-4 focus:outline-none focus:border-premium-accent/50 focus:bg-white/10 text-sm transition-all"
            />
          </div>
          <div className="flex items-center space-x-6">
            <button
              className="p-2.5 bg-white/5 border border-white/10 rounded-xl text-premium-muted hover:text-white hover:bg-white/10 transition-all group"
              onClick={fetchData}
              title="Refresh Data"
            >
              <RefreshCw size={20} className={loading ? "animate-spin text-premium-accent" : "group-hover:rotate-180 transition-transform duration-500"} />
            </button>
            <div className="flex items-center space-x-3 pl-4 border-l border-white/10">
              <div className="text-right">
                <p className="text-xs font-bold text-white uppercase">Headmaster</p>
                <p className="text-[10px] text-premium-accent font-bold uppercase tracking-tighter">Root Admin</p>
              </div>
              <div className="h-10 w-10 rounded-xl premium-gradient flex items-center justify-center font-black text-white shadow-lg shadow-premium-accent/20">
                AD
              </div>
            </div>
          </div>
        </header>

        {/* Viewport */}
        <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
          {activeTab === 'dashboard' && <DashboardHome stats={stats} loading={loading} />}
          {activeTab === 'users' && <UserList users={users} loading={loading} onRefresh={fetchData} />}
          {activeTab === 'achievements' && <AchievementList achievements={achievements} loading={loading} onRefresh={fetchData} />}
          {activeTab === 'games' && <LiveGames rooms={liveGames} loading={loading} />}
          {activeTab === 'logs' && <AuditLogs logs={auditLogs} loading={loading} />}
          {activeTab === 'broadcast' && <Broadcaster />}
        </div>
      </main>
    </div>
  );
}

// --- API Helpers ---

const handleToggleBan = async (userId: number, isBanned: boolean) => {
  if (!window.confirm(`Are you sure you want to ${isBanned ? 'unban' : 'ban'} this user?`)) return;
  try {
    await axios.post(`${BASE_URL}/users/toggle-ban`, { userId, isBanned: !isBanned });
    return true;
  } catch (e) { alert("Ban action failed"); return false; }
};

const handleDeleteUser = async (userId: number) => {
  if (!window.confirm("PERMANENT DELETE: Are you sure you want to completely remove this user? This cannot be undone.")) return;
  try {
    await axios.delete(`${BASE_URL}/users/${userId}`);
    return true;
  } catch (e) { alert("User deletion failed"); return false; }
};

const handleUpdateBalance = async (userId: number) => {
  const val = window.prompt("Enter total gems to set:");
  if (val === null) return;
  try {
    await axios.post(`${BASE_URL}/users/update-balance`, { userId, gems: parseInt(val) });
    return true;
  } catch (e) { alert("Balance update failed"); return false; }
};

// --- Custom Components ---

function SidebarLink({ icon, label, active, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center space-x-3 px-4 py-3.5 rounded-2xl transition-all duration-300 ${active
        ? 'bg-premium-accent/10 text-premium-accent border border-premium-accent/20 shadow-[0_0_20px_rgba(255,0,77,0.1)]'
        : 'text-premium-muted hover:text-slate-200 hover:bg-white/5'
        }`}
    >
      <span className={`${active ? 'scale-110' : ''} transition-transform`}>{icon}</span>
      <span className="font-bold tracking-tight text-sm">{label}</span>
      {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-premium-accent shadow-[0_0_8px_#FF004D]" />}
    </button>
  );
}

function StatsCard({ icon, label, value, trend, colorClass }: any) {
  return (
    <div className={`glass-card p-6 flex flex-col justify-between group hover:border-premium-accent/30 transition-all duration-500 relative overflow-hidden`}>
      <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full blur-3xl opacity-10 ${colorClass}`} />
      <div className="flex items-center justify-between mb-4">
        <div className="p-3 bg-white/5 rounded-xl border border-white/5 group-hover:scale-110 group-hover:bg-premium-accent/10 group-hover:border-premium-accent/20 transition-all duration-500">
          {icon}
        </div>
        <div className="text-[10px] font-black uppercase tracking-widest text-premium-muted group-hover:text-premium-accent transition-colors">
          {trend}
        </div>
      </div>
      <div>
        <p className="text-premium-muted text-xs font-bold uppercase tracking-wider">{label}</p>
        <h3 className="text-3xl font-black text-white mt-1 group-hover:translate-x-1 transition-transform">{value}</h3>
      </div>
    </div>
  );
}

function DashboardHome({ stats, loading }: { stats: Stats | null, loading: boolean }) {
  if (loading) return <div className="h-full flex items-center justify-center text-premium-muted font-bold tracking-widest">CALIBRATING METRICS...</div>;

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-700">
      <div>
        <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">Arena Overview</h1>
        <p className="text-premium-muted font-medium mt-2">The Pulse of DreamLudo Ecosystem</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          icon={<Users className="text-premium-secondary" />}
          label="Combatants"
          value={stats?.totalUsers || 0}
          trend={`+${stats?.activeToday || 0} New`}
          colorClass="bg-premium-secondary"
        />
        <StatsCard
          icon={<Gamepad2 className="text-premium-accent" />}
          label="Total Battles"
          value={stats?.totalMatches || 0}
          trend="Lifetime"
          colorClass="bg-premium-accent"
        />
        <StatsCard
          icon={<DollarSign className="text-emerald-400" />}
          label="War Chest"
          value={`₹${Number(stats?.totalDepositBal || 0).toLocaleString()}`}
          trend="Real Funds"
          colorClass="bg-emerald-400"
        />
        <StatsCard
          icon={<Diamond className="text-cyan-400" />}
          label="Platform Gems"
          value={(stats?.totalGems || 0).toLocaleString()}
          trend="Circulating"
          colorClass="bg-cyan-400"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass-card p-8 border-l-4 border-premium-accent bg-premium-accent/5">
          <p className="text-premium-muted text-xs font-black uppercase tracking-widest mb-2">Bonus Pool</p>
          <div className="flex items-end space-x-2">
            <h3 className="text-4xl font-black text-white tracking-tighter">₹{Number(stats?.totalBonusBal || 0).toLocaleString()}</h3>
            <span className="text-premium-accent font-bold mb-1 text-xs">INR</span>
          </div>
        </div>
        <div className="glass-card p-8 border-l-4 border-premium-secondary bg-premium-secondary/5">
          <p className="text-premium-muted text-xs font-black uppercase tracking-widest mb-2">Winners Purse</p>
          <div className="flex items-end space-x-2">
            <h3 className="text-4xl font-black text-white tracking-tighter">₹{Number(stats?.totalWonBal || 0).toLocaleString()}</h3>
            <span className="text-premium-secondary font-bold mb-1 text-xs">INR</span>
          </div>
        </div>
        <div className="glass-card p-8 border-l-4 border-emerald-500 bg-emerald-500/5">
          <p className="text-premium-muted text-xs font-black uppercase tracking-widest mb-2">Active Recruits</p>
          <div className="flex items-end space-x-2">
            <h3 className="text-4xl font-black text-white tracking-tighter">{stats?.activeToday || 0}</h3>
            <span className="text-emerald-500 font-bold mb-1 text-xs uppercase tracking-widest">Today</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function UserList({ users, loading, onRefresh }: { users: any[], loading: boolean, onRefresh: () => void }) {
  if (loading) return <div className="h-full flex items-center justify-center text-premium-muted font-bold tracking-widest uppercase">Fetching Recruits...</div>;

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-700">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">User Arena</h1>
          <p className="text-premium-muted font-medium mt-2">Manage profiles, ban violators, and adjust resources</p>
        </div>
        <button onClick={onRefresh} className="px-6 py-2.5 bg-premium-accent text-white rounded-xl font-bold uppercase tracking-widest text-xs hover:scale-105 transition-all shadow-lg shadow-premium-accent/20">Sync Data</button>
      </div>

      <div className="glass-card overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white/5 border-b border-white/5">
              <th className="px-8 py-5 text-premium-muted font-black uppercase tracking-widest text-[10px]">Commandant</th>
              <th className="px-8 py-5 text-premium-muted font-black uppercase tracking-widest text-[10px]">Access Key</th>
              <th className="px-8 py-5 text-premium-muted font-black uppercase tracking-widest text-[10px]">Armory (Gems)</th>
              <th className="px-8 py-5 text-premium-muted font-black uppercase tracking-widest text-[10px]">Spoils (Won)</th>
              <th className="px-8 py-5 text-premium-muted font-black uppercase tracking-widest text-[10px] text-right">Ops</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-white/[0.02] transition-colors group">
                <td className="px-8 py-6">
                  <div className="flex items-center space-x-4">
                    <div className="h-12 w-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-premium-accent font-black text-lg group-hover:scale-110 transition-transform shadow-inner">
                      {user.fullName?.[0] || 'U'}
                    </div>
                    <div>
                      <div className="font-black text-white text-base tracking-tight">{user.fullName || 'No Name'}</div>
                      <div className="text-xs text-premium-muted font-medium">{user.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <div className="flex items-center space-x-2">
                    <span className="text-slate-300 font-bold">@{user.username}</span>
                    {user.isBanned && (
                      <span className="text-[10px] font-black uppercase tracking-widest bg-premium-accent/10 text-premium-accent px-2 py-0.5 rounded border border-premium-accent/20">Banned</span>
                    )}
                  </div>
                </td>
                <td className="px-8 py-6 text-premium-secondary font-black font-mono text-lg tracking-tighter">
                  <div className="flex items-center space-x-2">
                    <Diamond size={14} />
                    <span>{(user.gems || 0).toLocaleString()}</span>
                  </div>
                </td>
                <td className="px-8 py-6 text-emerald-400 font-bold font-mono">
                  ₹{Number(user.wonBal).toLocaleString()}
                </td>
                <td className="px-8 py-6">
                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={async () => (await handleUpdateBalance(user.id)) && onRefresh()}
                      className="p-2.5 bg-premium-secondary/10 text-premium-secondary border border-premium-secondary/20 rounded-xl hover:bg-premium-secondary hover:text-white transition-all"
                      title="Adjust Gems"
                    >
                      <Diamond size={18} />
                    </button>
                    <button
                      onClick={async () => (await handleToggleBan(user.id, user.isBanned)) && onRefresh()}
                      className={`p-2.5 ${user.isBanned ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-orange-500/10 text-orange-500 border-orange-500/20'} border rounded-xl hover:scale-110 transition-all`}
                      title={user.isBanned ? 'Unban' : 'Ban User'}
                    >
                      {user.isBanned ? <Zap size={18} /> : <ShieldAlert size={18} />}
                    </button>
                    <button
                      onClick={async () => (await handleDeleteUser(user.id)) && onRefresh()}
                      className="p-2.5 bg-premium-accent/10 text-premium-accent border border-premium-accent/20 rounded-xl hover:bg-premium-accent hover:text-white transition-all"
                      title="Terminate Account"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AchievementList({ achievements, loading, onRefresh }: { achievements: any[], loading: boolean, onRefresh: () => void }) {
  const [showAdd, setShowAdd] = useState(false);
  const [newAchv, setNewAchv] = useState({
    name: '',
    achievement_key: '',
    description: '',
    reward_gems: 0,
    max_progress: 1,
    category: 'gameplay'
  });

  const handleCreate = async () => {
    if (!newAchv.name || !newAchv.achievement_key) return;
    try {
      await axios.post(`${BASE_URL}/achievements`, newAchv);
      setShowAdd(false);
      onRefresh();
    } catch (e) { alert("Forge failed"); }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete achievement?")) return;
    try {
      await axios.delete(`${BASE_URL}/achievements/${id}`);
      onRefresh();
    } catch (e) { alert("Deletion failed"); }
  }

  if (loading) return <div className="h-full flex items-center justify-center text-premium-muted font-bold tracking-widest uppercase italic">FORGING MILESTONES...</div>;

  return (
    <div className="space-y-8 animate-in fade-in zoom-in-95 duration-700">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">Achievement Forge</h1>
          <p className="text-premium-muted font-medium mt-2">Design milestones and milestone rewards</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="px-8 py-3 premium-gradient text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-105 transition-all shadow-xl shadow-premium-accent/40 flex items-center space-x-2"
        >
          <Plus size={18} />
          <span>New Milestone</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {achievements.map((a) => (
          <div key={a.id} className="glass-card p-6 flex flex-col group hover:border-premium-accent/30 transition-all duration-500 overflow-hidden relative">
            <div className="absolute -right-6 -bottom-6 opacity-5 group-hover:opacity-10 transition-opacity">
              <Trophy size={160} />
            </div>
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-premium-accent/10 border border-premium-accent/20 rounded-2xl text-premium-accent">
                <Trophy size={24} />
              </div>
              <button
                onClick={() => handleDelete(a.id)}
                className="p-2 text-premium-muted hover:text-premium-accent transition-colors"
              >
                <Trash2 size={18} />
              </button>
            </div>
            <h3 className="text-xl font-black text-white tracking-tight uppercase group-hover:text-premium-accent transition-colors">{a.name}</h3>
            <p className="text-xs text-premium-muted mt-2 leading-relaxed h-12 overflow-hidden">{a.description}</p>

            <div className="mt-6 flex items-center justify-between border-t border-white/5 pt-4">
              <div className="flex items-center space-x-1.5 font-black text-premium-secondary">
                <Diamond size={14} />
                <span className="text-lg tracking-tighter">{a.reward_gems}</span>
              </div>
              <div className="px-3 py-1 bg-white/5 rounded-lg border border-white/5 text-[10px] font-black uppercase tracking-widest text-premium-muted">
                Target: {a.max_progress}
              </div>
            </div>
          </div>
        ))}
      </div>

      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 backdrop-blur-xl bg-premium-dark/80">
          <div className="glass-card w-full max-w-xl p-10 space-y-8 animate-in zoom-in-95 duration-300 relative border-premium-accent/20">
            <button onClick={() => setShowAdd(false)} className="absolute right-6 top-6 text-premium-muted hover:text-white"><X /></button>
            <div>
              <h2 className="text-3xl font-black text-white tracking-tighter uppercase italic">Forge Milestone</h2>
              <p className="text-premium-muted font-medium mt-1">Configure a new platform achievement</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 col-span-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-premium-accent">Display Name</label>
                <input
                  type="text"
                  value={newAchv.name}
                  onChange={e => setNewAchv({ ...newAchv, name: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-premium-accent/50"
                  placeholder="e.g. Grand Arena Champion"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-premium-accent">Logic Key</label>
                <input
                  type="text"
                  value={newAchv.achievement_key}
                  onChange={e => setNewAchv({ ...newAchv, achievement_key: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-premium-accent/50"
                  placeholder="e.g. win_50_games"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-premium-accent">Gem Reward</label>
                <input
                  type="number"
                  value={newAchv.reward_gems}
                  onChange={e => setNewAchv({ ...newAchv, reward_gems: parseInt(e.target.value) || 0 })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-premium-accent/50"
                />
              </div>
              <div className="space-y-2 col-span-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-premium-accent">Brief Mission Description</label>
                <textarea
                  value={newAchv.description}
                  onChange={e => setNewAchv({ ...newAchv, description: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-premium-accent/50 h-24"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-premium-accent">Target Value</label>
                <input
                  type="number"
                  value={newAchv.max_progress}
                  onChange={e => setNewAchv({ ...newAchv, max_progress: parseInt(e.target.value) || 1 })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-premium-accent/50"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-premium-accent">Domain</label>
                <select
                  value={newAchv.category}
                  onChange={e => setNewAchv({ ...newAchv, category: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-premium-accent/50 appearance-none bg-premium-card"
                >
                  <option value="gameplay">Gameplay</option>
                  <option value="social">Social</option>
                  <option value="special">Special Ops</option>
                </select>
              </div>
            </div>

            <button onClick={handleCreate} className="w-full premium-gradient p-5 rounded-2xl font-black uppercase tracking-[0.3em] text-white shadow-2xl shadow-premium-accent/50">Forge Achievement</button>
          </div>
        </div>
      )}
    </div>
  );
}

function LiveGames({ rooms, loading }: { rooms: any[], loading: boolean }) {
  if (loading) return <div className="h-full flex items-center justify-center text-premium-muted font-bold tracking-widest uppercase animate-pulse">Scanning Redis for Battles...</div>;
  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div>
        <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">Combat Scouter</h1>
        <p className="text-premium-muted font-medium mt-2">Live traffic and active rooms monitoring</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rooms.map(room => (
          <div key={room.roomId} className="glass-card p-6 border-l-4 border-premium-accent hover:border-premium-accent/60 transition-all group overflow-hidden relative">
            <div className="absolute right-0 top-0 p-4">
              <div className="px-2 py-1 bg-white/5 rounded-lg border border-white/5 text-[10px] font-black uppercase tracking-widest text-premium-accent group-hover:bg-premium-accent/10 transition-colors">
                {room.status}
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-premium-muted uppercase tracking-[0.3em]">Code</span>
              <h4 className="font-black text-3xl text-white tracking-tighter mt-1">{room.roomId}</h4>
            </div>

            <div className="mt-8 flex items-center justify-between">
              <div className="flex -space-x-3">
                {room.players.map((p: any) => (
                  <div key={p.userId} className="w-10 h-10 rounded-xl border-4 border-premium-card bg-premium-card/80 flex items-center justify-center text-xs uppercase font-black text-white ring-1 ring-white/10 group-hover:scale-110 transition-transform" title={p.username}>
                    {p.username?.[0] || 'P'}
                  </div>
                ))}
              </div>
              <div className="text-right">
                <span className="text-[10px] font-black text-premium-muted uppercase tracking-widest block">Deployment</span>
                <span className="text-sm font-bold text-white">{room.players.length} / {room.totalPlayerCount} Heroes</span>
              </div>
            </div>
          </div>
        ))}
        {rooms.length === 0 && (
          <div className="col-span-full py-32 glass-card flex flex-col items-center justify-center text-premium-muted">
            <Gamepad2 size={64} className="mb-4 opacity-10" />
            <p className="font-black uppercase tracking-[0.3em] text-sm">Quiet sector — No battles detected</p>
          </div>
        )}
      </div>
    </div>
  );
}

function AuditLogs({ logs, loading }: { logs: any[], loading: boolean }) {
  if (loading) return <div className="h-full flex items-center justify-center text-premium-muted font-bold tracking-widest">DECRYPTING LOGS...</div>;
  return (
    <div className="space-y-8 animate-in slide-in-from-left-4 duration-700">
      <div>
        <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">Economy Audit</h1>
        <p className="text-premium-muted font-medium mt-2">Resource tracking and transactional history</p>
      </div>

      <div className="glass-card overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-white/5 border-b border-white/5">
            <tr>
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-premium-muted">Target</th>
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-premium-muted">Vector</th>
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-premium-muted">Mission Reason</th>
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-premium-muted text-right">Timestamp</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {logs.map(log => (
              <tr key={log.id} className="hover:bg-white/[0.01] transition-colors">
                <td className="px-8 py-5 text-sm font-bold text-white tracking-tight">@{log.user?.username || 'Redacted'}</td>
                <td className="px-8 py-5">
                  <div className={`flex items-center space-x-2 font-black text-base italic ${log.amount > 0 ? 'text-emerald-400' : 'text-premium-accent'}`}>
                    <span>{log.amount > 0 ? '+' : ''}{log.amount}</span>
                    <Diamond size={14} />
                  </div>
                </td>
                <td className="px-8 py-5 text-premium-muted text-xs font-medium">{log.description}</td>
                <td className="px-8 py-5 text-premium-muted text-[10px] font-black text-right uppercase tracking-tighter">
                  {new Date(log.createdAt).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function Broadcaster() {
  const [title, setTitle] = useState('');
  const [msg, setMsg] = useState('');
  const [type, setType] = useState('info');
  const [sending, setSending] = useState(false);
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/broadcasts`);
      setHistory(res.data.notifications || []);
    } catch (e) {
      console.error("Failed to fetch broadcast history");
    }
  };

  const handleSend = async () => {
    if (!msg.trim()) return;
    setSending(true);
    try {
      await axios.post(`${BASE_URL}/broadcast`, { title, message: msg, type });
      alert("Broadcast successful!");
      setMsg('');
      setTitle('');
      fetchHistory();
    } catch (e) {
      alert("Broadcast failed");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-10 max-w-4xl animate-in slide-in-from-top-4 duration-700">
      <div>
        <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">Global Broadcaster</h1>
        <p className="text-premium-muted font-medium mt-2">Transmit system-wide alerts to all online heroes</p>
      </div>

      <div className="glass-card p-10 space-y-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <Bell size={120} className="animate-bounce" />
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-premium-accent">Signal Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-bold focus:outline-none focus:border-premium-accent/50"
              placeholder="System Announcement..."
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-premium-accent">Transmission Content</label>
            <textarea
              value={msg}
              onChange={(e) => setMsg(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:outline-none focus:border-premium-accent/50 h-32 leading-relaxed"
              placeholder="Type your system-wide message here..."
            />
          </div>
        </div>

        <div className="flex items-center space-x-12">
          <label className="flex items-center space-x-3 cursor-pointer group">
            <div className={`w-5 h-5 rounded-full border-2 ${type === 'info' ? 'border-premium-secondary bg-premium-secondary bg-inner ring-4 ring-premium-secondary/20' : 'border-white/20'}`} onClick={() => setType('info')} />
            <span className={`font-black uppercase tracking-widest text-xs ${type === 'info' ? 'text-premium-secondary' : 'text-premium-muted'}`}>Information (Blue)</span>
          </label>
          <label className="flex items-center space-x-3 cursor-pointer group">
            <div className={`w-5 h-5 rounded-full border-2 ${type === 'alert' ? 'border-premium-accent bg-premium-accent bg-inner ring-4 ring-premium-accent/20' : 'border-white/20'}`} onClick={() => setType('alert')} />
            <span className={`font-black uppercase tracking-widest text-xs ${type === 'alert' ? 'text-premium-accent' : 'text-premium-muted'}`}>Emergency Alert (Red)</span>
          </label>
        </div>

        <button
          onClick={handleSend}
          disabled={sending || !msg}
          className="w-full premium-gradient hover:scale-[1.02] disabled:opacity-50 text-white font-black uppercase tracking-[0.3em] py-5 rounded-2xl transition-all shadow-2xl shadow-premium-accent/40"
        >
          {sending ? "TRANSMITTING..." : "FIRE GLOBAL SIGNAL"}
        </button>
      </div>

      <div className="space-y-6 mt-16 pb-20">
        <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter">Signal History</h2>
        <div className="glass-card overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-white/5">
              <tr>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-premium-muted">Payload Message</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-premium-muted">Classification</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-premium-muted text-right">Time Log</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {history.map((log: any) => (
                <tr key={log.id} className="hover:bg-white/[0.01] transition-colors">
                  <td className="px-8 py-5">
                    <div className="font-black text-white tracking-tight uppercase text-sm mb-1">{log.title || "No Title"}</div>
                    <div className="text-premium-muted text-xs font-medium leading-relaxed">{log.message}</div>
                  </td>
                  <td className="px-8 py-5">
                    <span className={`px-3 py-1 rounded-lg text-[9px] uppercase font-black tracking-widest border ${log.type === 'alert' ? 'bg-premium-accent/10 text-premium-accent border-premium-accent/20' : 'bg-premium-secondary/10 text-premium-secondary border-premium-secondary/20'}`}>
                      {log.type}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-premium-muted text-[10px] font-black text-right uppercase tracking-tighter">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
              {history.length === 0 && <tr><td colSpan={3} className="p-12 text-center text-premium-muted font-bold uppercase tracking-[0.2em] italic">No prior transmissions logged</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default App;
