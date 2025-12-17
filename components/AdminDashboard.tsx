
import React, { useState, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { 
  Users, 
  Database, 
  Settings, 
  BarChart3, 
  ShieldCheck, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Activity,
  Save,
  LogOut,
  TrendingDown,
  Zap,
  RefreshCw,
  Plus,
  Search,
  Trash2,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react';
import { ViewState } from '../types';
import { translations } from '../translations';

const AdminDashboard: React.FC = () => {
  const { 
    allUsers, 
    marketData, 
    systemSettings, 
    updateSettings, 
    executeTrade, 
    manipulatePrice, 
    adminLogout, 
    adminVerifyKyc,
    language,
    user 
  } = useStore();
  
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'transactions' | 'settings' | 'trading' | 'kyc'>('overview');
  const [tempSettings, setTempSettings] = useState(systemSettings);
  const [searchTerm, setSearchTerm] = useState('');
  const t = translations[language].admin;

  // Admin Trading State
  const [adminTradeAmount, setAdminTradeAmount] = useState('');
  const [adminTradePrice, setAdminTradePrice] = useState('');
  const [selectedSymbol, setSelectedSymbol] = useState('DMC');

  const globalTransactions = useMemo(() => {
    return allUsers.flatMap(u => u.transactions.map(t => ({ ...t, username: u.username })))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [allUsers]);

  const kycPendingUsers = useMemo(() => {
    return allUsers.filter(u => u.kycStatus === 'pending');
  }, [allUsers]);

  const filteredUsers = allUsers.filter(u => 
    u.username.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = [
    { label: 'Օգտատերեր', value: allUsers.length, icon: <Users className="text-blue-500" />, change: 'Իրական' },
    { label: 'DMC Գին', value: `$${(marketData.find(c => c.symbol === 'DMC')?.price || 0).toFixed(4)}`, icon: <TrendingUp className="text-binance-green" />, change: 'Live' },
    { label: 'Գործարքներ', value: globalTransactions.length, icon: <Activity className="text-purple-500" />, change: 'Ընդհանուր' },
    { label: 'KYC Սպասող', value: kycPendingUsers.length, icon: <ShieldCheck className="text-yellow-500" />, change: 'Հայտեր' },
  ];

  const handleAdminTrade = (type: 'buy' | 'sell') => {
    const amount = parseFloat(adminTradeAmount);
    const price = parseFloat(adminTradePrice) || (marketData.find(c => c.symbol === selectedSymbol)?.price || 0);
    
    if (amount > 0) {
      executeTrade(type, selectedSymbol, amount, price);
      setAdminTradeAmount('');
      setAdminTradePrice('');
      alert('Գործարքը հաջողությամբ կատարվեց ադմինիստրատորի կողմից:');
    }
  };

  const handleManipulation = (type: 'pump' | 'dump' | 'reset') => {
    const symbol = 'DMC';
    if (type === 'pump') manipulatePrice(symbol, 15);
    else if (type === 'dump') manipulatePrice(symbol, -15);
    else manipulatePrice(symbol, 0);
  };

  const renderContent = () => {
    switch(activeTab) {
      case 'users':
        return (
          <div className="bg-binance-black border border-binance-gray rounded-xl overflow-hidden animate-fade-in shadow-xl">
            <div className="p-6 border-b border-binance-gray flex flex-col md:flex-row justify-between items-center gap-4 bg-binance-gray/10">
              <h3 className="font-bold text-xl text-white">Օգտատերերի Բազա</h3>
              <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-2.5 text-binance-subtext" size={16} />
                <input 
                  type="text" 
                  placeholder="Փնտրել օգտատեր..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-binance-dark border border-binance-gray rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-binance-yellow text-white" 
                />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-binance-gray/20 text-binance-subtext text-xs uppercase font-bold">
                  <tr>
                    <th className="p-4">Օգտատեր</th>
                    <th className="p-4">Էլ. հասցե</th>
                    <th className="p-4">KYC</th>
                    <th className="p-4">Հաշվեկշիռ (USDT)</th>
                    <th className="p-4 text-right">Գործողություն</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-binance-gray/20">
                  {filteredUsers.map((u, i) => (
                    <tr key={i} className="hover:bg-binance-gray/5 transition-colors">
                      <td className="p-4 font-bold text-white flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-binance-gray flex items-center justify-center text-[10px]">
                            {u.username.substring(0, 2).toUpperCase()}
                        </div>
                        {u.username}
                      </td>
                      <td className="p-4 text-binance-subtext text-sm">{u.email}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                          u.kycStatus === 'verified' ? 'bg-binance-green/10 text-binance-green' : 
                          u.kycStatus === 'pending' ? 'bg-yellow-500/10 text-yellow-500' : 'bg-binance-red/10 text-binance-red'
                        }`}>
                          {u.kycStatus}
                        </span>
                      </td>
                      <td className="p-4 font-mono text-white">
                        ${(u.assets.find(a => a.symbol === 'USDT')?.amount || 0).toLocaleString()}
                      </td>
                      <td className="p-4 text-right">
                        <button className="p-2 text-binance-subtext hover:text-binance-red transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'kyc':
        return (
          <div className="bg-binance-black border border-binance-gray rounded-xl overflow-hidden animate-fade-in shadow-xl">
            <div className="p-6 border-b border-binance-gray bg-binance-gray/10">
              <h3 className="font-bold text-xl text-white">KYC Վերիֆիկացիայի Հայտեր</h3>
              <p className="text-xs text-binance-subtext mt-1">Հաստատեք կամ մերժեք օգտատերերի ինքնությունը</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-binance-gray/20 text-binance-subtext text-xs uppercase font-bold">
                  <tr>
                    <th className="p-4">Օգտատեր</th>
                    <th className="p-4">Ամսաթիվ</th>
                    <th className="p-4">Կարգավիճակ</th>
                    <th className="p-4 text-right">Գործողություններ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-binance-gray/20">
                  {kycPendingUsers.length > 0 ? kycPendingUsers.map((u, i) => (
                    <tr key={i} className="hover:bg-binance-gray/5 transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-white">{u.username}</div>
                        <div className="text-xs text-binance-subtext">{u.email}</div>
                      </td>
                      <td className="p-4 text-binance-subtext text-sm">Այսօր</td>
                      <td className="p-4 text-yellow-500 font-bold text-xs uppercase flex items-center gap-1 mt-3">
                        <AlertTriangle size={12} /> Pending
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <button 
                          onClick={() => adminVerifyKyc(u.email, 'verified')}
                          className="px-3 py-1 bg-binance-green text-black text-xs font-bold rounded hover:bg-green-400 transition-colors inline-flex items-center gap-1"
                        >
                          <CheckCircle size={14} /> Հաստատել
                        </button>
                        <button 
                          onClick={() => adminVerifyKyc(u.email, 'unverified')}
                          className="px-3 py-1 bg-binance-red text-white text-xs font-bold rounded hover:bg-red-600 transition-colors inline-flex items-center gap-1"
                        >
                          <XCircle size={14} /> Մերժել
                        </button>
                      </td>
                    </tr>
                  )) : (
                    <tr><td colSpan={4} className="p-20 text-center text-binance-subtext">Սպասվող հայտեր չկան</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'trading':
        return (
          <div className="grid lg:grid-cols-2 gap-8 animate-fade-in">
             <div className="bg-binance-black border border-binance-gray rounded-2xl p-8 shadow-xl">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <Zap size={22} className="text-binance-yellow" /> Market Making
                </h3>
                <div className="space-y-6">
                   <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs text-binance-subtext font-bold uppercase">Ակտիվ</label>
                        <select 
                          value={selectedSymbol}
                          onChange={(e) => setSelectedSymbol(e.target.value)}
                          className="w-full bg-binance-dark border border-binance-gray rounded-xl p-3 text-white focus:outline-none focus:border-binance-yellow font-bold"
                        >
                          {marketData.map(c => <option key={c.symbol} value={c.symbol}>{c.symbol}</option>)}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs text-binance-subtext font-bold uppercase">Քանակ</label>
                        <input 
                          type="number" 
                          value={adminTradeAmount}
                          onChange={(e) => setAdminTradeAmount(e.target.value)}
                          placeholder="0.00"
                          className="w-full bg-binance-dark border border-binance-gray rounded-xl p-3 text-white focus:outline-none focus:border-binance-yellow font-mono"
                        />
                      </div>
                   </div>
                   <div className="space-y-2">
                      <label className="text-xs text-binance-subtext font-bold uppercase">Գին (Օպցիոնալ)</label>
                      <input 
                        type="number" 
                        value={adminTradePrice}
                        onChange={(e) => setAdminTradePrice(e.target.value)}
                        placeholder="Շուկայական գին"
                        className="w-full bg-binance-dark border border-binance-gray rounded-xl p-3 text-white focus:outline-none focus:border-binance-yellow font-mono"
                      />
                   </div>
                   <div className="grid grid-cols-2 gap-4 pt-4">
                      <button 
                        onClick={() => handleAdminTrade('buy')}
                        className="py-4 bg-binance-green text-black font-bold rounded-xl hover:shadow-lg hover:shadow-green-500/20 transition-all flex items-center justify-center gap-2"
                      >
                         <Plus size={18} /> Market Buy
                      </button>
                      <button 
                        onClick={() => handleAdminTrade('sell')}
                        className="py-4 bg-binance-red text-white font-bold rounded-xl hover:shadow-lg hover:shadow-red-500/20 transition-all flex items-center justify-center gap-2"
                      >
                         <TrendingDown size={18} /> Market Sell
                      </button>
                   </div>
                </div>
             </div>
             <div className="bg-binance-black border border-binance-gray rounded-2xl p-8 shadow-xl">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <TrendingUp size={22} className="text-binance-yellow" /> DMC Manipulation
                </h3>
                <div className="p-6 bg-binance-gray/10 rounded-2xl mb-8 border border-binance-gray/20">
                   <div className="flex justify-between items-center">
                      <span className="text-binance-subtext text-sm font-bold">DRAMCOIN PRICE</span>
                      <span className="text-2xl font-bold text-binance-yellow font-mono">
                        ${(marketData.find(c => c.symbol === 'DMC')?.price || 0).toFixed(4)}
                      </span>
                   </div>
                </div>
                <div className="space-y-4">
                   <button 
                      onClick={() => handleManipulation('pump')}
                      className="w-full py-4 bg-binance-green/10 border border-binance-green text-binance-green rounded-xl font-bold hover:bg-binance-green hover:text-black transition-all flex items-center justify-center gap-2"
                    >
                      <ArrowUpRight size={18} /> Force Pump (+15%)
                   </button>
                   <button 
                      onClick={() => handleManipulation('dump')}
                      className="w-full py-4 bg-binance-red/10 border border-binance-red text-binance-red rounded-xl font-bold hover:bg-binance-red hover:text-white transition-all flex items-center justify-center gap-2"
                    >
                      <ArrowDownLeft size={18} /> Force Dump (-15%)
                   </button>
                   <button 
                      onClick={() => handleManipulation('reset')}
                      className="w-full py-3 bg-binance-gray/50 hover:bg-binance-gray text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2"
                    >
                      <RefreshCw size={18} /> Reset to Market Price
                   </button>
                </div>
             </div>
          </div>
        );

      case 'settings':
        return (
          <div className="max-w-2xl bg-binance-black border border-binance-gray rounded-2xl p-8 animate-fade-in shadow-xl mx-auto">
            <h3 className="text-xl font-bold text-white mb-8 flex items-center gap-2">
              <Settings size={22} className="text-binance-yellow" /> System Control
            </h3>
            <div className="space-y-8">
              <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs text-binance-subtext font-bold uppercase">USD to AMD Rate</label>
                    <input 
                      type="number" 
                      value={tempSettings.usdToAmdRate} 
                      onChange={(e) => setTempSettings({...tempSettings, usdToAmdRate: Number(e.target.value)})}
                      className="w-full bg-binance-dark border border-binance-gray rounded-xl p-3 text-white focus:outline-none focus:border-binance-yellow font-mono" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-binance-subtext font-bold uppercase">Platform Fee (%)</label>
                    <input 
                      type="number" 
                      step="0.01"
                      value={tempSettings.platformFee} 
                      onChange={(e) => setTempSettings({...tempSettings, platformFee: Number(e.target.value)})}
                      className="w-full bg-binance-dark border border-binance-gray rounded-xl p-3 text-white focus:outline-none focus:border-binance-yellow font-mono" 
                    />
                  </div>
              </div>
              
              <div className="flex items-center justify-between p-5 bg-binance-gray/10 rounded-2xl border border-binance-gray/20">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-binance-yellow/10 rounded-xl text-binance-yellow">
                    <Activity size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-white">AI Analyst Engine</h4>
                    <p className="text-xs text-binance-subtext">Enable real-time market insights for all users</p>
                  </div>
                </div>
                <button 
                  onClick={() => setTempSettings({...tempSettings, isAiEnabled: !tempSettings.isAiEnabled})}
                  className={`w-14 h-7 rounded-full relative transition-all duration-300 ${tempSettings.isAiEnabled ? 'bg-binance-green shadow-[0_0_10px_rgba(14,203,129,0.4)]' : 'bg-binance-gray'}`}
                >
                  <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-lg transition-transform duration-300 ${tempSettings.isAiEnabled ? 'left-8' : 'left-1'}`}></div>
                </button>
              </div>

              <button 
                onClick={() => {
                  updateSettings(tempSettings);
                  alert('Համակարգի կարգավորումները հաջողությամբ թարմացվեցին:');
                }}
                className="w-full py-4 bg-binance-yellow text-black font-bold rounded-xl hover:shadow-xl transition-all flex items-center justify-center gap-2"
              >
                <Save size={20} /> Apply Global Changes
              </button>
            </div>
          </div>
        );

      case 'overview':
      default:
        return (
          <div className="space-y-8 animate-fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((s, i) => (
                <div key={i} className="bg-binance-black border border-binance-gray p-6 rounded-2xl hover:border-binance-yellow/40 transition-all shadow-lg group">
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-binance-gray/30 rounded-xl group-hover:scale-110 transition-transform">{s.icon}</div>
                    <span className="text-[10px] font-bold text-binance-green bg-binance-green/10 px-2 py-1 rounded-full uppercase">{s.change}</span>
                  </div>
                  <h4 className="text-binance-subtext text-xs mb-1 uppercase font-bold tracking-widest">{s.label}</h4>
                  <div className="text-2xl font-bold text-white font-mono">{s.value}</div>
                </div>
              ))}
            </div>
            
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 bg-binance-black border border-binance-gray rounded-2xl p-8 shadow-xl">
                <div className="flex justify-between items-center mb-8">
                    <h3 className="font-bold text-white flex items-center gap-2"><BarChart3 size={20} className="text-binance-yellow" /> Platform Load (24h)</h3>
                    <div className="flex gap-2">
                        <span className="w-2 h-2 bg-binance-green rounded-full"></span>
                        <span className="text-[10px] text-binance-subtext uppercase font-bold">Stable</span>
                    </div>
                </div>
                <div className="h-64 flex items-end justify-between gap-1.5">
                   {[35, 60, 45, 80, 55, 75, 40, 90, 65, 50, 85, 70, 45, 60, 80, 40, 55, 75, 95, 65, 50, 40, 60, 80].map((h, i) => (
                     <div 
                        key={i} 
                        className="flex-1 bg-gradient-to-t from-binance-yellow/20 to-binance-yellow hover:from-binance-yellow hover:to-white transition-all rounded-t-sm" 
                        style={{ height: `${h}%` }}
                        title={`Hour ${i}: ${h}%`}
                     ></div>
                   ))}
                </div>
                <div className="flex justify-between mt-4 text-[10px] text-binance-subtext font-bold">
                    <span>00:00</span>
                    <span>12:00</span>
                    <span>23:59</span>
                </div>
              </div>
              
              <div className="bg-binance-black border border-binance-gray rounded-2xl p-8 shadow-xl flex flex-col">
                <h3 className="font-bold text-white mb-8">Quick Actions</h3>
                <div className="space-y-4 flex-1">
                   <button 
                     onClick={() => setActiveTab('trading')}
                     className="w-full flex items-center justify-between p-5 bg-binance-gray/10 rounded-2xl hover:bg-binance-gray/30 transition-all border border-transparent hover:border-binance-yellow/30 group"
                   >
                      <div className="flex items-center gap-4">
                         <div className="p-2 bg-binance-yellow/10 rounded-lg text-binance-yellow group-hover:scale-110 transition-transform">
                            <Zap size={20} />
                         </div>
                         <span className="text-sm font-bold text-white">Market Making</span>
                      </div>
                      <Plus size={16} className="text-binance-subtext" />
                   </button>
                   
                   <button 
                     onClick={() => setActiveTab('kyc')}
                     className="w-full flex items-center justify-between p-5 bg-binance-gray/10 rounded-2xl hover:bg-binance-gray/30 transition-all border border-transparent hover:border-binance-yellow/30 group"
                   >
                      <div className="flex items-center gap-4">
                         <div className="p-2 bg-yellow-500/10 rounded-lg text-yellow-500 group-hover:scale-110 transition-transform">
                            <ShieldCheck size={20} />
                         </div>
                         <span className="text-sm font-bold text-white">KYC Review</span>
                      </div>
                      <Plus size={16} className="text-binance-subtext" />
                   </button>
                   
                   <button 
                     onClick={adminLogout}
                     className="w-full flex items-center justify-between p-5 bg-binance-red/5 rounded-2xl hover:bg-binance-red/10 transition-all border border-transparent hover:border-binance-red/30 group mt-auto"
                   >
                      <div className="flex items-center gap-4">
                         <div className="p-2 bg-binance-red/10 rounded-lg text-binance-red group-hover:rotate-12 transition-transform">
                            <LogOut size={20} />
                         </div>
                         <span className="text-sm font-bold text-binance-red">Security Sign-out</span>
                      </div>
                   </button>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex min-h-screen bg-[#0b0e11] pt-16">
      <aside className="w-64 bg-binance-black border-r border-binance-gray p-6 hidden lg:block sticky top-16 h-[calc(100vh-64px)] overflow-y-auto">
        <div className="flex items-center gap-4 p-4 mb-10 bg-gradient-to-br from-binance-gray/40 to-transparent rounded-2xl border border-binance-gray/30 shadow-lg">
           <div className="w-12 h-12 rounded-2xl bg-binance-yellow flex items-center justify-center text-black shadow-[0_0_15px_rgba(252,213,53,0.3)]">
              <ShieldCheck size={28} />
           </div>
           <div>
              <p className="text-[10px] text-binance-yellow font-black tracking-widest uppercase">System</p>
              <p className="text-sm font-bold text-white truncate">Administrator</p>
           </div>
        </div>
        
        <nav className="space-y-2">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'overview' ? 'bg-binance-yellow text-black shadow-lg shadow-yellow-500/20' : 'text-binance-subtext hover:bg-binance-gray/40 hover:text-white'}`}
          >
            <BarChart3 size={20} /> Overview
          </button>
          <button 
            onClick={() => setActiveTab('trading')}
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'trading' ? 'bg-binance-yellow text-black shadow-lg shadow-yellow-500/20' : 'text-binance-subtext hover:bg-binance-gray/40 hover:text-white'}`}
          >
            <Zap size={20} /> Market Controls
          </button>
          <button 
            onClick={() => setActiveTab('kyc')}
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'kyc' ? 'bg-binance-yellow text-black shadow-lg shadow-yellow-500/20' : 'text-binance-subtext hover:bg-binance-gray/40 hover:text-white'}`}
          >
            <ShieldCheck size={20} /> KYC Verification
          </button>
          <button 
            onClick={() => setActiveTab('users')}
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'users' ? 'bg-binance-yellow text-black shadow-lg shadow-yellow-500/20' : 'text-binance-subtext hover:bg-binance-gray/40 hover:text-white'}`}
          >
            <Users size={20} /> User Assets
          </button>
          <button 
            onClick={() => setActiveTab('transactions')}
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'transactions' ? 'bg-binance-yellow text-black shadow-lg shadow-yellow-500/20' : 'text-binance-subtext hover:bg-binance-gray/40 hover:text-white'}`}
          >
            <Database size={20} /> Ledger History
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'settings' ? 'bg-binance-yellow text-black shadow-lg shadow-yellow-500/20' : 'text-binance-subtext hover:bg-binance-gray/40 hover:text-white'}`}
          >
            <Settings size={20} /> Global Config
          </button>
          
          <div className="pt-10">
            <button 
              onClick={adminLogout}
              className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-bold text-binance-red hover:bg-binance-red/10 transition-all border border-transparent hover:border-binance-red/20"
            >
              <LogOut size={20} /> {t.logout}
            </button>
          </div>
        </nav>
      </aside>

      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h2 className="text-3xl font-bold text-white tracking-tight">
               {activeTab === 'overview' && 'Dashboard Overview'}
               {activeTab === 'trading' && 'Market Liquidity Control'}
               {activeTab === 'users' && 'User Account Management'}
               {activeTab === 'kyc' && 'Identity Verification Review'}
               {activeTab === 'settings' && 'Platform Governance'}
               {activeTab === 'transactions' && 'Global Transaction Ledger'}
            </h2>
            <p className="text-binance-subtext text-sm mt-1">Management interface for DramCoin ecosystem</p>
          </div>
          <div className="flex items-center gap-5 bg-binance-gray/20 p-3 rounded-2xl border border-binance-gray/30 shadow-inner">
             <div className="text-right hidden sm:block">
                <p className="text-[10px] text-binance-subtext font-black tracking-widest">NETWORK STATUS</p>
                <p className="text-xs text-binance-green font-mono flex items-center gap-2 justify-end">
                    <span className="w-2 h-2 bg-binance-green rounded-full animate-pulse shadow-[0_0_5px_#0ecb81]"></span> 
                    OPERATIONAL
                </p>
             </div>
             <div className="w-10 h-10 rounded-xl bg-binance-yellow/20 flex items-center justify-center text-binance-yellow border border-binance-yellow/20"><Activity size={20} /></div>
          </div>
        </header>
        
        <div className="pb-20">
            {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
