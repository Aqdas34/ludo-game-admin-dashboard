import { useState, useEffect } from 'react';
import {
  Users,
  LayoutDashboard,
  Gamepad2,
  Search,
  Bell,
  DollarSign,
  Trophy,
  Trash2,
  Plus,
  ShieldAlert,
  Diamond,
  Zap,
  RefreshCw,
  RefreshCcw,
  Settings,
  UserCog,
  X
} from 'lucide-react';
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://104.207.65.118:3005/api/admin';
const ADMIN_TOKEN_KEY = 'ludo_admin_token';

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
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!localStorage.getItem(ADMIN_TOKEN_KEY));
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [liveGames, setLiveGames] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [gemPackages, setGemPackages] = useState<any[]>([]);
  const [purchases, setPurchases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem(ADMIN_TOKEN_KEY);
    if (token) {
      axios.defaults.headers.common.Authorization = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common.Authorization;
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    fetchData();
    const interval = setInterval(fetchData, 30000); // 30s auto-refresh
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [
        statsRes,
        usersRes,
        gamesRes,
        logsRes,
        achievementsRes,
        packagesRes,
        purchasesRes
      ] = await Promise.all([
        axios.get(`${BASE_URL}/stats`),
        axios.get(`${BASE_URL}/users`),
        axios.get(`${BASE_URL}/games/live`),
        axios.get(`${BASE_URL}/audit-logs`),
        axios.get(`${BASE_URL}/achievements`),
        axios.get(`${BASE_URL}/gem-packages`),
        axios.get(`${BASE_URL}/purchases`)
      ]);

      setStats(statsRes.data.stats);
      setUsers(usersRes.data.users);
      setLiveGames(gamesRes.data.rooms);
      setAuditLogs(logsRes.data.logs);
      setAchievements(achievementsRes.data.achievements || []);
      setGemPackages(packagesRes.data.packages || []);
      setPurchases(purchasesRes.data.purchases || []);

      setError(null);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        handleLogout();
        setLoginError('Session expired. Please login again.');
      } else {
        console.error("Global fetch error:", error);
        setError("COMMUNICATION BREACH: Backend Unreachable.");
      }
    } finally {
      // Set loading to false after a short delay to allow parallel promises to start resolving
      setTimeout(() => setLoading(false), 800);
    }
  };

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAuthLoading(true);
    try {
      const response = await axios.post(`${BASE_URL}/login`, {
        username: loginUsername,
        password: loginPassword
      });

      const token = response.data?.result?.[0]?.token;
      if (!token) {
        setLoginError('Login failed. Token not received.');
        return;
      }

      localStorage.setItem(ADMIN_TOKEN_KEY, token);
      axios.defaults.headers.common.Authorization = `Bearer ${token}`;
      setIsAuthenticated(true);
      setLoginError(null);
      setLoginPassword('');
      setError(null);
      return;
    } catch (error: any) {
      setLoginError(error?.response?.data?.msg || 'Invalid admin credentials.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    delete axios.defaults.headers.common.Authorization;
    setIsAuthenticated(false);
    setLoginUsername('');
    setLoginPassword('');
    setLoading(false);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-premium-dark text-premium-text flex items-center justify-center p-6">
        <div className="w-full max-w-md glass-card p-10 space-y-8 border border-white/10">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-black text-white tracking-tight uppercase italic">Admin Login</h1>
            <p className="text-premium-muted text-sm">Enter credentials to access the command center.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-premium-accent">Username</label>
              <input
                type="text"
                value={loginUsername}
                onChange={(e) => setLoginUsername(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-premium-accent/50"
                placeholder="Enter admin username"
                autoComplete="username"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-premium-accent">Password</label>
              <input
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-premium-accent/50"
                placeholder="Enter admin password"
                autoComplete="current-password"
                required
              />
            </div>

            {loginError && <p className="text-sm font-bold text-premium-accent">{loginError}</p>}

            <button
              type="submit"
              disabled={authLoading}
              className="w-full premium-gradient p-4 rounded-2xl font-black uppercase tracking-[0.3em] text-white shadow-xl shadow-premium-accent/40"
            >
              {authLoading ? 'Checking...' : 'Access Dashboard'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-premium-dark text-premium-text overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-72 border-r border-white/5 flex flex-col p-6 space-y-8 bg-premium-card/30 backdrop-blur-3xl">
        <div className="flex items-center space-x-3 px-2 mb-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center p-1.5 bg-white/5 border border-white/10 shadow-neon-purple mt-2">
            <img src="./logo.png" alt="XLUDO" className="w-full h-full object-contain" />
          </div>
          <div className="flex flex-col pt-3">
            <span className="text-2xl font-black tracking-tighter text-white leading-none">
              XLUDO
            </span>
            <span className="text-[9px] font-bold text-premium-accent tracking-[0.3em] uppercase mt-1">
              Command Center
            </span>
          </div>
        </div>

        <nav className="flex-1 space-y-2">
          <SidebarLink
            icon={<LayoutDashboard size={20} />}
            label="Match Statistics"
            active={activeTab === 'dashboard'}
            onClick={() => setActiveTab('dashboard')}
          />
          <SidebarLink
            icon={<Users size={20} />}
            label="User Management"
            active={activeTab === 'users'}
            onClick={() => setActiveTab('users')}
          />
          <SidebarLink
            icon={<Trophy size={20} />}
            label="User Ranks"
            active={activeTab === 'ranks'}
            onClick={() => setActiveTab('ranks')}
          />
          <SidebarLink
            icon={<Diamond size={20} />}
            label="Gem Achievements"
            active={activeTab === 'achievements'}
            onClick={() => setActiveTab('achievements')}
          />
          <SidebarLink
            icon={<Diamond size={20} />}
            label="Gem Shop Manager"
            active={activeTab === 'gemstore'}
            onClick={() => setActiveTab('gemstore')}
          />
          <SidebarLink
            icon={<Zap size={20} />}
            label="Live Matches"
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
          <SidebarLink
            icon={<DollarSign size={20} />}
            label="Transactions"
            active={activeTab === 'purchases'}
            onClick={() => setActiveTab('purchases')}
          />
          <SidebarLink
            icon={<Settings size={20} />}
            label="Profile Settings"
            active={activeTab === 'profile'}
            onClick={() => setActiveTab('profile')}
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
      <main className="flex-1 flex flex-col overflow-hidden bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-premium-accent/10 via-premium-dark to-premium-dark relative">
        {/* Animated Background Blur */}
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-premium-accent/5 rounded-full blur-[120px] animate-pulse-slow pointer-events-none" />
        <div className="absolute bottom-[-5%] left-[-5%] w-[30%] h-[30%] bg-premium-secondary/5 rounded-full blur-[100px] animate-pulse-slow pointer-events-none" />
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
              <button
                onClick={handleLogout}
                className="px-3 py-2 text-[10px] font-black uppercase tracking-widest bg-premium-accent/10 border border-premium-accent/30 text-premium-accent rounded-xl hover:bg-premium-accent/20 transition-all"
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        {/* Viewport */}
        <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
          {error && (
            <div className="h-full flex flex-col items-center justify-center space-y-6 animate-pulse">
              <ShieldAlert size={64} className="text-premium-accent" />
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-black text-white uppercase italic">{error}</h2>
                <p className="text-premium-muted font-medium">Verify Backend Core (Port 3005) & Database Status</p>
              </div>
              <button
                onClick={fetchData}
                className="px-8 py-3 bg-white/5 border border-white/10 rounded-2xl text-premium-accent font-black uppercase tracking-widest hover:bg-premium-accent/10 transition-all"
              >
                Retry Reconnection
              </button>
            </div>
          )}
          {!error && activeTab === 'dashboard' && <DashboardHome stats={stats} loading={loading} />}
          {!error && activeTab === 'users' && <UserList users={users} loading={loading} onRefresh={fetchData} />}
          {!error && activeTab === 'ranks' && <UserRanks users={users} loading={loading} />}
          {!error && activeTab === 'achievements' && <AchievementList achievements={achievements} loading={loading} onRefresh={fetchData} />}
          {!error && activeTab === 'gemstore' && <GemStoreManager packages={gemPackages} loading={loading} onRefresh={fetchData} />}
          {!error && activeTab === 'games' && <LiveGames rooms={liveGames} loading={loading} />}
          {!error && activeTab === 'logs' && <AuditLogs logs={auditLogs} loading={loading} />}
          {!error && activeTab === 'purchases' && <PurchaseList purchases={purchases} loading={loading} />}
          {!error && activeTab === 'broadcast' && <Broadcaster />}
          {!error && activeTab === 'profile' && <AdminProfileSettings />}
        </div>
      </main>
    </div>
  );
}

// --- API Helpers ---

function GemStoreManager({ packages, loading, onRefresh }: { packages: any[], loading: boolean, onRefresh: () => void }) {
  const [showAdd, setShowAdd] = useState(false);
  const [newPkg, setNewPkg] = useState({
    id: '',
    name: '',
    gems_amount: 0,
    bonus_gems: 0,
    price: 0,
    currency: 'SAR',
    is_popular: false,
    sort_order: 0,
    is_active: true
  });

  const handleCreate = async () => {
    if (!newPkg.id || !newPkg.name || newPkg.price <= 0) return;
    try {
      await axios.post(`${BASE_URL}/gem-packages`, newPkg);
      setShowAdd(false);
      onRefresh();
    } catch (e) { alert("Forge failed"); }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete package?")) return;
    try {
      await axios.delete(`${BASE_URL}/gem-packages/${id}`);
      onRefresh();
    } catch (e) { alert("Deletion failed"); }
  }

  const toggleActive = async (pkg: any) => {
    try {
      await axios.patch(`${BASE_URL}/gem-packages/${pkg.id}`, { is_active: !pkg.is_active });
      onRefresh();
    } catch (e) { alert("Update failed"); }
  }

  if (loading) return <div className="h-full flex items-center justify-center text-premium-muted font-bold tracking-widest uppercase italic animate-pulse">STOCKING VAULT...</div>;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-700">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">Gem Supply Chain</h1>
          <p className="text-premium-muted font-medium mt-2">Manage currency packages and platform monetization</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="px-8 py-3 premium-gradient text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-105 transition-all shadow-xl shadow-premium-accent/40 flex items-center space-x-2"
        >
          <Plus size={18} />
          <span>New Gem Pack</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {packages.map((pkg) => (
          <div key={pkg.id} className={`glass-card p-6 flex flex-col group hover:border-premium-accent/30 transition-all duration-500 overflow-hidden relative ${!pkg.is_active ? 'opacity-50 grayscale' : ''}`}>
            <div className="absolute -right-6 -bottom-6 opacity-5 group-hover:opacity-10 transition-opacity">
              <Diamond size={160} />
            </div>
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-premium-secondary/10 border border-premium-secondary/20 rounded-2xl text-premium-secondary">
                <Diamond size={24} />
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => toggleActive(pkg)}
                  className={`p-2 rounded-lg border border-white/5 ${pkg.is_active ? 'text-emerald-400 bg-emerald-400/5' : 'text-orange-400 bg-orange-400/5'}`}
                  title={pkg.is_active ? "Deactivate" : "Activate"}
                >
                  <Zap size={16} />
                </button>
                <button
                  onClick={() => handleDelete(pkg.id)}
                  className="p-2 text-premium-muted hover:text-premium-accent transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
            <h3 className="text-xl font-black text-white tracking-tight uppercase group-hover:text-premium-accent transition-colors">{pkg.name}</h3>
            <div className="mt-2 flex items-center space-x-2">
              <span className="text-2xl font-black text-white">{pkg.gems_amount}</span>
              <span className="text-xs font-bold text-premium-muted">GEMS</span>
              {pkg.bonus_gems > 0 && (
                <span className="text-[10px] font-black bg-emerald-400/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-400/20">+{pkg.bonus_gems} BONUS</span>
              )}
            </div>

            <div className="mt-6 flex items-center justify-between border-t border-white/5 pt-4">
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-premium-muted uppercase tracking-widest">Price Unit</span>
                <span className="text-lg font-black text-white">{pkg.currency} {pkg.price}</span>
              </div>
              {pkg.is_popular && (
                <div className="px-3 py-1 bg-premium-accent/10 rounded-lg border border-premium-accent/20 text-[10px] font-black uppercase tracking-widest text-premium-accent">
                  BEST VALUE
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 backdrop-blur-xl bg-premium-dark/80">
          <div className="glass-card w-full max-w-xl p-10 space-y-8 animate-in zoom-in-95 duration-300 relative border-premium-accent/20">
            <button onClick={() => setShowAdd(false)} className="absolute right-6 top-6 text-premium-muted hover:text-white"><X /></button>
            <div>
              <h2 className="text-3xl font-black text-white tracking-tighter uppercase italic">Configure Vault</h2>
              <p className="text-premium-muted font-medium mt-1">Design a new monetization package</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-premium-accent">Package ID</label>
                <input
                  type="text"
                  value={newPkg.id}
                  onChange={e => setNewPkg({ ...newPkg, id: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-premium-accent/50"
                  placeholder="e.g. mega_pack_sar"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-premium-accent">Display Name</label>
                <input
                  type="text"
                  value={newPkg.name}
                  onChange={e => setNewPkg({ ...newPkg, name: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-premium-accent/50"
                  placeholder="e.g. Super Saver"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-premium-accent">Base Gems</label>
                <input
                  type="number"
                  value={newPkg.gems_amount}
                  onChange={e => setNewPkg({ ...newPkg, gems_amount: parseInt(e.target.value) || 0 })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-premium-accent/50"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-premium-accent">Bonus Gems</label>
                <input
                  type="number"
                  value={newPkg.bonus_gems}
                  onChange={e => setNewPkg({ ...newPkg, bonus_gems: parseInt(e.target.value) || 0 })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-premium-accent/50"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-premium-accent">Price</label>
                <input
                  type="number"
                  value={newPkg.price}
                  onChange={e => setNewPkg({ ...newPkg, price: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-premium-accent/50"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-premium-accent">Currency</label>
                <select
                  value={newPkg.currency}
                  onChange={e => setNewPkg({ ...newPkg, currency: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-premium-accent/50 appearance-none bg-premium-card"
                >
                  <option value="SAR">SAR</option>
                  <option value="USD">USD</option>
                  <option value="INR">INR</option>
                </select>
              </div>
              <div className="col-span-2 flex items-center space-x-6 p-4 bg-white/5 rounded-xl border border-white/10">
                <label className="flex items-center space-x-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={newPkg.is_popular}
                    onChange={e => setNewPkg({ ...newPkg, is_popular: e.target.checked })}
                    className="w-4 h-4 rounded border-white/10 bg-white/5 text-premium-accent focus:ring-premium-accent"
                  />
                  <span className="text-xs font-bold text-premium-muted group-hover:text-white transition-colors uppercase tracking-widest">Mark as Popular</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={newPkg.is_active}
                    onChange={e => setNewPkg({ ...newPkg, is_active: e.target.checked })}
                    className="w-4 h-4 rounded border-white/10 bg-white/5 text-premium-accent focus:ring-premium-accent"
                  />
                  <span className="text-xs font-bold text-premium-muted group-hover:text-white transition-colors uppercase tracking-widest">Available Induce</span>
                </label>
              </div>
            </div>

            <button onClick={handleCreate} className="w-full premium-gradient p-5 rounded-2xl font-black uppercase tracking-[0.3em] text-white shadow-2xl shadow-premium-accent/50">Authorize Package</button>
          </div>
        </div>
      )}
    </div>
  );
}

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

const handleDeletePurchase = async (purchaseId: string) => {
  if (!window.confirm("Delete this transaction record? This cannot be undone.")) return;
  try {
    await axios.delete(`${BASE_URL}/purchases/${purchaseId}`);
    return true;
  } catch (e) { alert("Deletion failed"); return false; }
};

const handleVerifyPurchase = async (purchaseId: string) => {
  try {
    const res = await axios.post(`${BASE_URL}/verify-purchase/${purchaseId}`);
    alert(res.data.msg);
    return true;
  } catch (e: any) {
    alert(e.response?.data?.msg || "Verification failed");
    return false;
  }
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
      {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-premium-accent shadow-neon-purple ring-2 ring-premium-accent/20" />}
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
  if (loading) return (
    <div className="h-full flex flex-col items-center justify-center space-y-4">
      <div className="w-12 h-12 border-4 border-premium-accent border-t-transparent rounded-full animate-spin" />
      <div className="text-premium-muted font-bold tracking-widest uppercase">CALIBRATING METRICS...</div>
    </div>
  );

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
          icon={<Diamond className="text-premium-secondary" />}
          label="Platform Gems"
          value={(stats?.totalGems || 0).toLocaleString()}
          trend="In Circulation"
          colorClass="bg-premium-secondary"
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
        <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">Live Matches</h1>
        <p className="text-premium-muted font-medium mt-2">Active game traffic and real-time monitoring</p>
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
                <span className="text-sm font-bold text-white">{room.players.length} / {room.totalPlayerCount} Players</span>
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

function UserRanks({ users, loading }: { users: any[], loading: boolean }) {
  if (loading) return <div className="h-full flex items-center justify-center text-premium-muted font-bold tracking-widest uppercase">Calculating Standings...</div>;

  // Derive Ranks (Sorted by Win Balance) - Added Safety Check
  const rankedUsers = Array.isArray(users)
    ? [...users].sort((a, b) => (b.wonBal || 0) - (a.wonBal || 0))
    : [];

  return (
    <div className="space-y-8 animate-in slide-in-from-right-4 duration-700">
      <div>
        <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">User Ranks</h1>
        <p className="text-premium-muted font-medium mt-2">Leaderboard and performance standing based on earnings</p>
      </div>

      <div className="glass-card overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-white/5 border-b border-white/5">
              <th className="px-8 py-5 text-premium-muted font-black uppercase tracking-widest text-[10px]">Rank</th>
              <th className="px-8 py-5 text-premium-muted font-black uppercase tracking-widest text-[10px]">Commandant</th>
              <th className="px-8 py-5 text-premium-muted font-black uppercase tracking-widest text-[10px]">Net Earnings (Spoils)</th>
              <th className="px-8 py-5 text-premium-muted font-black uppercase tracking-widest text-[10px]">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {rankedUsers.map((user, idx) => (
              <tr key={user.id} className="hover:bg-white/[0.02] transition-colors group">
                <td className="px-8 py-6">
                  <span className={`text-2xl font-black italic ${idx === 0 ? 'text-yellow-400' : idx === 1 ? 'text-slate-400' : idx === 2 ? 'text-orange-400' : 'text-premium-muted'}`}>
                    #{idx + 1}
                  </span>
                </td>
                <td className="px-8 py-6">
                  <div className="flex items-center space-x-4">
                    <div className="font-black text-white text-base tracking-tight">{user.username}</div>
                  </div>
                </td>
                <td className="px-8 py-6 text-emerald-400 font-black font-mono text-xl">
                  ₹{Number(user.wonBal).toLocaleString()}
                </td>
                <td className="px-8 py-6">
                  <div className={user.isBanned ? 'text-premium-accent font-black uppercase text-[10px]' : 'text-emerald-500 font-bold uppercase text-[10px]'}>
                    {user.isBanned ? 'Restricted' : 'Active Duty'}
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

function PurchaseList({ purchases, loading }: { purchases: any[], loading: boolean }) {
  if (loading) return <div className="h-full flex items-center justify-center text-premium-muted font-bold tracking-widest uppercase animate-pulse">Retrieving Financial Logs...</div>;
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-700">
      <div>
        <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">Gem Transactions</h1>
        <p className="text-premium-muted font-medium mt-2">Historical and real-time ledger of all gem purchases</p>
      </div>

      <div className="glass-card overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-white/5 border-b border-white/5">
              <th className="px-8 py-5 text-premium-muted font-black uppercase tracking-widest text-[10px]">Reference</th>
              <th className="px-8 py-5 text-premium-muted font-black uppercase tracking-widest text-[10px]">User (Commander)</th>
              <th className="px-8 py-5 text-premium-muted font-black uppercase tracking-widest text-[10px]">Volume (Gems)</th>
              <th className="px-8 py-5 text-premium-muted font-black uppercase tracking-widest text-[10px]">Investment</th>
              <th className="px-8 py-5 text-premium-muted font-black uppercase tracking-widest text-[10px]">Protocol Status</th>
              <th className="px-8 py-5 text-premium-muted font-black uppercase tracking-widest text-[10px]">Timestamp</th>
              <th className="px-8 py-5 text-premium-muted font-black uppercase tracking-widest text-[10px] text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {purchases.map((purchase) => (
              <tr key={purchase.id} className="hover:bg-white/[0.02] transition-colors group">
                <td className="px-8 py-6">
                  <div className="flex flex-col">
                    <span className="text-white font-mono text-xs font-bold truncate w-32" title={purchase.id}>{purchase.id}</span>
                    <span className="text-[10px] text-premium-muted uppercase font-black mt-1">Invoice: {purchase.invoice_id || 'N/A'}</span>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <span className="text-slate-300 font-bold">UID: {purchase.user_id}</span>
                </td>
                <td className="px-8 py-6">
                  <div className="flex items-center space-x-2 text-premium-secondary font-black">
                    <Diamond size={14} />
                    <span>{purchase.gems_amount.toLocaleString()}</span>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <span className="text-emerald-400 font-black font-mono">{purchase.currency} {purchase.price}</span>
                </td>
                <td className="px-8 py-6">
                  <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${purchase.status === 'completed' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                      purchase.status === 'pending' ? 'bg-orange-500/10 text-orange-500 border-orange-500/20' :
                        'bg-premium-accent/10 text-premium-accent border-premium-accent/20'
                    }`}>
                    {purchase.status}
                  </span>
                </td>
                <td className="px-8 py-6">
                  <span className="text-premium-muted text-[10px] font-black uppercase tracking-tighter">
                    {new Date(purchase.created_at).toLocaleString()}
                  </span>
                </td>
                <td className="px-8 py-6 text-right">
                  <div className="flex items-center justify-end space-x-2">
                    {purchase.status === 'pending' && (
                      <button
                        onClick={async () => (await handleVerifyPurchase(purchase.id)) && window.location.reload()}
                        className="p-2 text-premium-secondary hover:text-white transition-colors"
                        title="Force Verify Status"
                      >
                        <RefreshCcw size={16} />
                      </button>
                    )}
                    <button
                      onClick={async () => (await handleDeletePurchase(purchase.id)) && window.location.reload()}
                      className="p-2 text-premium-muted hover:text-premium-accent transition-colors"
                      title="Delete Transaction"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {purchases.length === 0 && (
              <tr>
                <td colSpan={6} className="p-20 text-center text-premium-muted font-bold uppercase tracking-[0.3em] italic">No transactions detected in the logs</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}


function AdminProfileSettings() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [updating, setUpdating] = useState(false);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email && !password) return alert("Please enter new email or password");
    setUpdating(true);
    try {
      await axios.post(`${BASE_URL}/update-profile`, { email, password });
      alert("Profile updated successfully!");
      setEmail('');
      setPassword('');
      window.location.reload(); 
    } catch (e: any) {
      alert(e.response?.data?.msg || "Update failed");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-10 max-w-4xl animate-in slide-in-from-right-4 duration-700">
      <div>
        <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">Profile Settings</h1>
        <p className="text-premium-muted font-medium mt-2">Manage your administrative identity and access keys</p>
      </div>

      <div className="glass-card p-10 space-y-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <UserCog size={120} className="animate-pulse" />
        </div>

        <form onSubmit={handleUpdate} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-premium-accent">New Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-bold focus:outline-none focus:border-premium-accent/50"
              placeholder="admin@example.com"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-premium-accent">New Security Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:outline-none focus:border-premium-accent/50"
              placeholder="••••••••"
            />
            <p className="text-[9px] text-premium-muted font-bold uppercase tracking-widest mt-2">Leave blank to keep existing password</p>
          </div>

          <button
            type="submit"
            disabled={updating}
            className="w-full premium-gradient hover:scale-[1.02] disabled:opacity-50 text-white font-black uppercase tracking-[0.3em] py-5 rounded-2xl transition-all shadow-2xl shadow-premium-accent/40"
          >
            {updating ? "AUTHORIZING CHANGES..." : "UPDATE PROFILE SECRETS"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default App;
