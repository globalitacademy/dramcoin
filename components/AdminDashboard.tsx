
import React, { useState, useEffect, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { supabase } from '../supabase';
import { 
  Users, ShieldCheck, Activity, LogOut, Search, TrendingUp, 
  Settings, UserCheck, LayoutDashboard, Terminal, RefreshCw, 
  ArrowUp, ArrowDown, Database, ShieldAlert, Loader2, AlertTriangle, 
  Edit3, Trash2, CheckCircle, XCircle, DollarSign, Wallet, MoreVertical,
  Briefcase, BarChart3, Lock, Download, Clock, UserPlus, Eye, ArrowUpCircle, ArrowDownCircle, Save
} from 'lucide-react';
import { translations } from '../translations';

const AdminDashboard: React.FC = () => {
  const { adminLogout, language, addToast, adminVerifyKyc, manipulatePrice, setDirectPrice, updateSettings, systemSettings, marketData } = useStore();
  const t = translations[language].admin;
  
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'market' | 'kyc' | 'settings' | 'repair'>('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);

  // System Settings local state for form
  const [localSettings, setLocalSettings] = useState(systemSettings);

  useEffect(() => {
    setLocalSettings(systemSettings);
  }, [systemSettings]);

  // Market Manipulation State
  const dmcPrice = marketData.find(c => c.symbol === 'DMC')?.price || 0.54;

  // Edit User Modal State
  const [editingUser, setEditingUser] = useState<any>(null);

  const fetchAdminData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data: profiles, error: pError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (pError) throw pError;

      const { data: assets } = await supabase.from('assets').select('*');

      const enrichedUsers = (profiles || []).map(p => {
        const uAssets = (assets || []).filter(a => a.user_id === p.id);
        const usdt = uAssets.find(a => a.symbol === 'USDT')?.amount || 0;
        return {
          ...p,
          balance: usdt,
          assets: uAssets
        };
      });

      setUsers(enrichedUsers);
    } catch (err: any) {
      console.error("Admin fetch error:", err);
      setError(err.message || "Տվյալների բեռնման սխալ");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, [activeTab]);

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    try {
        const { error } = await supabase
            .from('profiles')
            .update({
                username: editingUser.username,
                role: editingUser.role,
                apricots: editingUser.apricots,
                kyc_status: editingUser.kyc_status
            })
            .eq('id', editingUser.id);
        
        if (error) throw error;
        addToast("Օգտատիրոջ տվյալները թարմացվեցին", "success");
        setEditingUser(null);
        fetchAdminData();
    } catch (err: any) {
        addToast(err.message, "error");
    }
  };

  const handleSaveSettings = async () => {
    await updateSettings(localSettings);
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm("Վստա՞հ եք, որ ցանկանում եք հեռացնել այս օգտատիրոջը:")) return;
    try {
        const { error } = await supabase.from('profiles').delete().eq('id', userId);
        if (error) throw error;
        addToast("Օգտատերը հեռացվեց", "success");
        fetchAdminData();
    } catch (err: any) {
        addToast(err.message, "error");
    }
  };

  const filteredUsers = useMemo(() => {
    const lowSearch = searchTerm.toLowerCase();
    return users.filter(u => 
      (u.email?.toLowerCase().includes(lowSearch)) || 
      (u.username?.toLowerCase().includes(lowSearch)) ||
      (u.id?.toLowerCase().includes(lowSearch))
    );
  }, [users, searchTerm]);

  return (
    <div className="flex min-h-screen bg-[#080a0c] text-[#eaecef] font-sans">
      {/* Sidebar */}
      <aside className="w-72 bg-[#12161c] border-r border-[#2b3139] flex flex-col p-6 sticky top-0 h-screen z-20">
        <div className="flex items-center gap-3 mb-10 px-2 cursor-pointer" onClick={() => setActiveTab('overview')}>
          <div className="w-10 h-10 bg-binance-yellow rounded-xl flex items-center justify-center text-black font-black text-xl shadow-[0_0_15px_rgba(252,213,53,0.3)]">֏</div>
          <div>
            <h1 className="text-white font-black text-xs uppercase tracking-widest">DMC Control</h1>
            <p className="text-[10px] text-binance-yellow font-bold uppercase">Super Admin V3.2</p>
          </div>
        </div>

        <nav className="flex-1 space-y-2">
          {[
            { id: 'overview', icon: <LayoutDashboard size={18} />, label: t.overview },
            { id: 'users', icon: <Users size={18} />, label: t.users_db },
            { id: 'market', icon: <TrendingUp size={18} />, label: t.market_control },
            { id: 'kyc', icon: <UserCheck size={18} />, label: t.kyc_review },
            { id: 'settings', icon: <Settings size={18} />, label: t.settings },
            { id: 'repair', icon: <Terminal size={18} />, label: t.security_fix },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-sm font-bold transition-all ${
                activeTab === item.id 
                  ? 'bg-binance-yellow text-black shadow-lg shadow-yellow-500/10' 
                  : 'text-binance-subtext hover:bg-white/5 hover:text-white'
              }`}
            >
              {item.icon} {item.label}
            </button>
          ))}
        </nav>

        <button onClick={adminLogout} className="mt-auto flex items-center gap-4 px-5 py-4 rounded-2xl text-binance-red font-bold hover:bg-red-500/10 transition-all">
          <LogOut size={18} /> {t.logout}
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-10 bg-[#080a0c]">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h2 className="text-3xl font-black text-white uppercase tracking-tight">{t.panel_name}</h2>
            <p className="text-binance-subtext text-sm">Վահանակ / {activeTab.toUpperCase()}</p>
          </div>
          <button onClick={fetchAdminData} className="p-3 bg-binance-gray/20 rounded-xl text-binance-subtext hover:text-white transition-all">
            <RefreshCw size={20} className={isLoading ? 'animate-spin' : ''} />
          </button>
        </header>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-96">
            <Loader2 className="animate-spin text-binance-yellow mb-4" size={48} />
            <p className="text-binance-subtext font-bold uppercase tracking-widest text-xs">Բեռնվում է...</p>
          </div>
        ) : (
          <div className="animate-fade-in space-y-10">
            
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: t.stats.total_users, value: users.length, icon: <Users />, color: 'text-blue-400' },
                    { label: 'Total Apricots', value: users.reduce((a,b)=>a+(Number(b.apricots)||0), 0).toLocaleString(), icon: <Activity />, color: 'text-orange-400' },
                    { label: 'KYC Pending', value: users.filter(u=>u.kyc_status==='pending').length, icon: <ShieldCheck />, color: 'text-binance-green' },
                    { label: 'Total TVL', value: `$${users.reduce((a,b)=>a+(Number(b.balance)||0), 0).toLocaleString()}`, icon: <Database />, color: 'text-binance-yellow' }
                ].map((stat, i) => (
                    <div key={i} className="bg-[#12161c] border border-[#2b3139] p-8 rounded-[32px] shadow-xl">
                      <div className={`${stat.color} mb-4 opacity-70`}>{stat.icon}</div>
                      <p className="text-[10px] font-black text-binance-subtext uppercase tracking-widest mb-1">{stat.label}</p>
                      <div className="text-3xl font-black text-white font-mono">{stat.value}</div>
                    </div>
                ))}
              </div>
            )}

            {activeTab === 'users' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center gap-4">
                    <div className="relative flex-1 max-w-xl">
                        <Search className="absolute left-6 top-5 text-binance-subtext" size={20} />
                        <input 
                            type="text" 
                            placeholder="Փնտրել ըստ էլ. հասցեի կամ ID-ի..."
                            className="w-full bg-[#12161c] border border-[#2b3139] rounded-3xl py-5 pl-14 pr-6 text-white outline-none focus:border-binance-yellow transition-all shadow-lg"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="bg-[#12161c] border border-[#2b3139] rounded-[40px] overflow-hidden shadow-2xl">
                  <table className="w-full text-left">
                    <thead className="bg-[#1b2028] text-binance-subtext text-[10px] font-black uppercase tracking-widest border-b border-[#2b3139]">
                      <tr>
                        <th className="p-8">Օգտատեր</th>
                        <th className="p-8">Դեր / KYC</th>
                        <th className="p-8 text-right">Ծիրաններ</th>
                        <th className="p-8 text-right">Հաշվեկշիռ (USDT)</th>
                        <th className="p-8 text-right">Գործողություն</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#2b3139]/30">
                      {filteredUsers.map(u => (
                        <tr key={u.id} className="hover:bg-white/5 transition-colors group">
                          <td className="p-8">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-2xl bg-binance-gray/50 flex items-center justify-center font-bold text-binance-yellow border border-white/5 group-hover:scale-110 transition-transform">
                                {u.username ? u.username[0].toUpperCase() : 'U'}
                              </div>
                              <div>
                                <p className="font-bold text-white">{u.username || 'Անանուն'}</p>
                                <p className="text-[10px] text-binance-subtext font-mono">{u.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-8">
                            <div className="flex flex-col gap-1">
                                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded w-fit ${u.role === 'admin' ? 'bg-binance-yellow text-black' : 'bg-white/5 text-binance-subtext'}`}>
                                    {u.role || 'user'}
                                </span>
                                <span className={`text-[10px] font-black uppercase ${u.kyc_status === 'verified' ? 'text-binance-green' : 'text-binance-red'}`}>
                                    KYC: {u.kyc_status || 'NONE'}
                                </span>
                            </div>
                          </td>
                          <td className="p-8 text-right font-mono font-bold text-orange-400">
                            {(Number(u.apricots) || 0).toLocaleString()}
                          </td>
                          <td className="p-8 text-right font-mono font-bold text-white">
                            ${(Number(u.balance) || 0).toLocaleString()}
                          </td>
                          <td className="p-8 text-right">
                             <div className="flex justify-end gap-2">
                                <button onClick={() => setEditingUser(u)} className="p-2 bg-white/5 rounded-lg text-binance-subtext hover:text-white transition-all"><Edit3 size={18} /></button>
                                <button onClick={() => handleDeleteUser(u.id)} className="p-2 bg-red-900/10 rounded-lg text-binance-red hover:bg-red-900/30 transition-all"><Trash2 size={18} /></button>
                             </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'market' && (
              <div className="grid md:grid-cols-2 gap-8 animate-fade-in">
                <div className="bg-[#12161c] border border-[#2b3139] p-10 rounded-[48px] shadow-2xl flex flex-col relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity"><TrendingUp size={160} /></div>
                  <h3 className="text-2xl font-black text-white mb-2 uppercase tracking-tight">Market Manipulation</h3>
                  <p className="text-binance-subtext text-sm mb-10 font-medium">Կառավարեք DMC մետաղադրամի արժեքը</p>
                  
                  <div className="mb-10 p-6 bg-black/30 rounded-3xl border border-white/5">
                      <p className="text-[10px] text-binance-subtext uppercase font-black mb-1">Current Listing Price</p>
                      <p className="text-4xl font-mono font-black text-binance-yellow">${dmcPrice.toFixed(4)}</p>
                  </div>

                  <div className="space-y-4">
                    <button onClick={() => manipulatePrice('DMC', 15)} className="w-full flex justify-between items-center bg-binance-green/10 border border-binance-green/20 text-binance-green p-6 rounded-3xl hover:bg-binance-green hover:text-white transition-all transform hover:scale-[1.02] shadow-xl">
                      <div className="flex items-center gap-4">
                        <ArrowUpCircle size={24} />
                        <span className="font-black uppercase tracking-widest">Pump DMC (+15%)</span>
                      </div>
                      <span className="text-xs font-bold opacity-50">EXECUTE</span>
                    </button>
                    <button onClick={() => manipulatePrice('DMC', -15)} className="w-full flex justify-between items-center bg-binance-red/10 border border-binance-red/20 text-binance-red p-6 rounded-3xl hover:bg-binance-red hover:text-white transition-all transform hover:scale-[1.02] shadow-xl">
                      <div className="flex items-center gap-4">
                        <ArrowDownCircle size={24} />
                        <span className="font-black uppercase tracking-widest">Dump DMC (-15%)</span>
                      </div>
                      <span className="text-xs font-bold opacity-50">EXECUTE</span>
                    </button>
                    <button onClick={() => setDirectPrice('DMC', 0.54)} className="w-full flex justify-between items-center bg-white/5 border border-white/10 text-white p-6 rounded-3xl hover:bg-white hover:text-black transition-all transform hover:scale-[1.02]">
                      <div className="flex items-center gap-4">
                        <RefreshCw size={24} />
                        <span className="font-black uppercase tracking-widest">Reset to $0.54</span>
                      </div>
                    </button>
                  </div>
                </div>

                <div className="bg-[#12161c] border border-[#2b3139] p-10 rounded-[48px] shadow-2xl">
                   <h3 className="text-2xl font-black text-white mb-8 uppercase tracking-tight">Market Settings</h3>
                   <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-xs font-black text-binance-subtext uppercase tracking-widest ml-1">Force Listing Price (USDT)</label>
                        <div className="relative">
                           <DollarSign className="absolute left-4 top-5 text-binance-subtext" size={18} />
                           <input 
                            type="number" 
                            step="0.0001"
                            className="w-full bg-[#0b0e11] border border-[#2b3139] rounded-2xl py-5 pl-12 pr-6 text-white font-mono text-xl focus:border-binance-yellow outline-none transition-all" 
                            value={dmcPrice}
                            onChange={(e) => setDirectPrice('DMC', parseFloat(e.target.value) || 0)}
                           />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-black text-binance-subtext uppercase tracking-widest ml-1">Global Trade Fee (%)</label>
                        <input 
                            type="number" 
                            className="w-full bg-[#0b0e11] border border-[#2b3139] rounded-2xl py-5 px-6 text-white font-mono text-xl focus:border-binance-yellow outline-none transition-all" 
                            defaultValue={systemSettings.platformFee}
                            onBlur={(e) => updateSettings({ ...systemSettings, platformFee: parseFloat(e.target.value) })}
                        />
                      </div>
                      <div className="p-6 bg-yellow-500/5 border border-yellow-500/10 rounded-3xl">
                         <div className="flex gap-4">
                            <AlertTriangle className="text-yellow-500 shrink-0" size={24} />
                            <p className="text-xs text-binance-subtext leading-relaxed">
                                <span className="text-yellow-500 font-bold uppercase block mb-1">Warning</span>
                                Շուկայի մանիպուլյացիաները կիրառվում են ակնթարթորեն բոլոր օգտատերերի համար։
                            </p>
                         </div>
                      </div>
                   </div>
                </div>
              </div>
            )}

            {/* Other tabs remain unchanged */}
            {activeTab === 'kyc' && (
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-white mb-6 uppercase tracking-widest">KYC Review Center</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {users.filter(u => u.kyc_status === 'pending').map(u => (
                        <div key={u.id} className="bg-[#12161c] border border-[#2b3139] p-8 rounded-[32px] shadow-xl hover:border-binance-yellow/40 transition-all">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-14 h-14 rounded-2xl bg-binance-yellow/10 flex items-center justify-center text-binance-yellow"><UserCheck size={28} /></div>
                                <div>
                                    <h4 className="font-bold text-white">{u.username}</h4>
                                    <p className="text-xs text-binance-subtext">{u.email}</p>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <button onClick={() => adminVerifyKyc(u.id, 'verified')} className="flex-1 bg-binance-green text-black py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest">Approve</button>
                                <button onClick={() => adminVerifyKyc(u.id, 'unverified')} className="flex-1 bg-binance-red text-white py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest">Reject</button>
                            </div>
                        </div>
                    ))}
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="max-w-4xl space-y-8 animate-fade-in">
                <div className="bg-[#12161c] border border-[#2b3139] p-10 rounded-[48px] shadow-2xl">
                   <h3 className="text-2xl font-black text-white mb-8 uppercase tracking-widest flex items-center gap-4">
                       <Settings className="text-binance-yellow" /> System Configuration
                   </h3>
                   <div className="grid md:grid-cols-2 gap-8">
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-binance-subtext uppercase tracking-widest ml-1">USD/AMD Rate</label>
                        <input 
                            type="number" 
                            className="w-full bg-[#0b0e11] border border-[#2b3139] rounded-2xl p-5 text-white font-mono text-xl focus:border-binance-yellow outline-none transition-all" 
                            value={localSettings.usdToAmdRate}
                            onChange={(e) => setLocalSettings({ ...localSettings, usdToAmdRate: parseFloat(e.target.value) })}
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-binance-subtext uppercase tracking-widest ml-1">Transaction Fee (%)</label>
                        <input 
                            type="number" 
                            className="w-full bg-[#0b0e11] border border-[#2b3139] rounded-2xl p-5 text-white font-mono text-xl focus:border-binance-yellow outline-none transition-all" 
                            value={localSettings.platformFee}
                            onChange={(e) => setLocalSettings({ ...localSettings, platformFee: parseFloat(e.target.value) })}
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-binance-subtext uppercase tracking-widest ml-1">Daily Morse Code</label>
                        <input 
                            type="text" 
                            className="w-full bg-[#0b0e11] border border-[#2b3139] rounded-2xl p-5 text-white font-mono text-xl focus:border-binance-yellow outline-none transition-all" 
                            value={localSettings.secretMorseCode}
                            onChange={(e) => setLocalSettings({ ...localSettings, secretMorseCode: e.target.value.toUpperCase() })}
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-binance-subtext uppercase tracking-widest ml-1">Morse Reward (Apricot)</label>
                        <input 
                            type="number" 
                            className="w-full bg-[#0b0e11] border border-[#2b3139] rounded-2xl p-5 text-white font-mono text-xl focus:border-binance-yellow outline-none transition-all" 
                            value={localSettings.morseReward}
                            onChange={(e) => setLocalSettings({ ...localSettings, morseReward: parseInt(e.target.value) })}
                        />
                      </div>
                   </div>
                   <button 
                     onClick={handleSaveSettings}
                     className="mt-10 w-full py-5 bg-binance-yellow text-black font-black uppercase tracking-widest rounded-3xl shadow-xl flex items-center justify-center gap-3"
                   >
                     <Save size={20} /> {t.sys.save}
                   </button>
                </div>
              </div>
            )}
            
            {activeTab === 'repair' && (
              <div className="max-w-4xl mx-auto animate-fade-in">
                <div className="bg-[#12161c] border border-binance-yellow/20 p-12 rounded-[48px] shadow-2xl">
                  <h2 className="text-3xl font-black text-white mb-6 flex items-center gap-4">
                    <Terminal className="text-binance-yellow" size={32} /> Security Overhaul
                  </h2>
                  <pre className="bg-[#0b0e11] p-8 rounded-[32px] border border-binance-gray text-[11px] font-mono text-binance-yellow overflow-x-auto leading-relaxed shadow-inner">
{`/* 1. Ադմինի իրավունքների տրամադրում */
UPDATE public.profiles SET role = 'admin' WHERE email = 'gitedu@bk.ru';

/* 2. Settings աղյուսակի կառուցվածք */
CREATE TABLE IF NOT EXISTS public.settings (
  id integer PRIMARY KEY DEFAULT 1,
  usd_to_amd numeric DEFAULT 395,
  platform_fee numeric DEFAULT 0.1,
  morse_code text DEFAULT 'DRAM',
  morse_reward bigint DEFAULT 50000,
  listing_price numeric DEFAULT 0.54,
  updated_at timestamp with time zone DEFAULT now()
);`}
                  </pre>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
