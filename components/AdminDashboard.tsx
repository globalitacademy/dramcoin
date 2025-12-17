
import React, { useState } from 'react';
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
  Trash2,
  TrendingDown,
  Zap,
  RefreshCw,
  Plus
} from 'lucide-react';
import { ViewState } from '../types';

const AdminDashboard: React.FC = () => {
  const { allUsers, marketData, systemSettings, updateSettings, executeTrade, setView } = useStore();
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'transactions' | 'settings' | 'trading'>('overview');
  const [tempSettings, setTempSettings] = useState(systemSettings);

  // Admin Trading State
  const [adminTradeAmount, setAdminTradeAmount] = useState('');
  const [adminTradePrice, setAdminTradePrice] = useState('');
  const [selectedSymbol, setSelectedSymbol] = useState('DMC');

  const stats = [
    { label: 'Ընդհանուր Օգտատերեր', value: allUsers.length + 154, icon: <Users className="text-blue-500" />, change: '+12%' },
    { label: 'Շուկայական Շրջանառություն', value: '$1.2M', icon: <TrendingUp className="text-binance-green" />, change: '+5.4%' },
    { label: 'DMC Պահուստներ', value: '450,000 DMC', icon: <Database className="text-binance-yellow" />, change: 'Կայուն' },
    { label: 'Ակտիվ Գործարքներ', value: '42', icon: <Activity className="text-purple-500" />, change: 'Իրական ժամանակ' },
  ];

  const handleAdminTrade = (type: 'buy' | 'sell') => {
    const amount = parseFloat(adminTradeAmount);
    const price = parseFloat(adminTradePrice) || (marketData.find(c => c.symbol === selectedSymbol)?.price || 0);
    
    if (amount > 0) {
      alert(`Համակարգային գործարք կատարված է: ${type === 'buy' ? 'Գնում' : 'Վաճառք'} ${amount} ${selectedSymbol}`);
      setAdminTradeAmount('');
    }
  };

  const renderContent = () => {
    switch(activeTab) {
      case 'users':
        return (
          <div className="bg-binance-black border border-binance-gray rounded-xl overflow-hidden animate-fade-in">
            <div className="p-4 border-b border-binance-gray flex justify-between items-center bg-binance-gray/20">
              <h3 className="font-bold text-lg">Օգտատերերի Կառավարում</h3>
              <div className="flex gap-2">
                <input type="text" placeholder="Որոնել..." className="bg-binance-dark border border-binance-gray rounded-lg px-3 py-1 text-sm focus:outline-none focus:border-binance-yellow" />
              </div>
            </div>
            <table className="w-full text-left">
              <thead className="bg-binance-gray/10 text-binance-subtext text-xs uppercase">
                <tr>
                  <th className="p-4">Օգտատեր</th>
                  <th className="p-4">Էլ. հասցե</th>
                  <th className="p-4">Հաշվեկշիռ (USDT)</th>
                  <th className="p-4 text-right">Գործողություն</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-binance-gray/20">
                {allUsers.map((u, i) => (
                  <tr key={i} className="hover:bg-binance-gray/10 text-sm">
                    <td className="p-4 font-medium text-white">{u.name}</td>
                    <td className="p-4 text-binance-subtext">{u.email}</td>
                    <td className="p-4 font-mono">${u.assets.find(a => a.symbol === 'USDT')?.amount || 0}</td>
                    <td className="p-4 text-right flex justify-end gap-2">
                      <button className="text-binance-yellow hover:underline text-xs">Խմբագրել</button>
                      <button className="text-binance-red hover:underline text-xs">Արգելափակել</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      
      case 'transactions':
        return (
          <div className="bg-binance-black border border-binance-gray rounded-xl overflow-hidden animate-fade-in">
             <div className="p-4 border-b border-binance-gray flex justify-between items-center bg-binance-gray/20">
              <h3 className="font-bold text-lg">Համակարգային Գործարքներ</h3>
              <button className="bg-binance-gray hover:bg-gray-700 px-3 py-1 rounded text-xs flex items-center gap-1">
                 <RefreshCw size={14} /> Թարմացնել
              </button>
            </div>
            <table className="w-full text-left">
              <thead className="bg-binance-gray/10 text-binance-subtext text-xs uppercase">
                <tr>
                  <th className="p-4">Տեսակ</th>
                  <th className="p-4">Օգտատեր</th>
                  <th className="p-4">Ակտիվ</th>
                  <th className="p-4 text-right">Քանակ</th>
                  <th className="p-4 text-right">Կարգավիճակ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-binance-gray/20">
                {[
                  { type: 'buy', user: 'Արմեն Ս.', coin: 'BTC', amount: '0.05', status: 'Կատարված' },
                  { type: 'sell', user: 'Աննա Գ.', coin: 'DMC', amount: '250', status: 'Կատարված' },
                  { type: 'buy', user: 'Հարութ Գ.', coin: 'ETH', amount: '1.2', status: 'Կատարված' },
                ].map((tx, i) => (
                  <tr key={i} className="hover:bg-binance-gray/10 text-sm">
                    <td className="p-4">
                      {tx.type === 'buy' ? 
                        <span className="flex items-center gap-1 text-binance-green"><ArrowDownLeft size={14} /> Գնում</span> : 
                        <span className="flex items-center gap-1 text-binance-red"><ArrowUpRight size={14} /> Վաճառք</span>
                      }
                    </td>
                    <td className="p-4">{tx.user}</td>
                    <td className="p-4 font-bold">{tx.coin}</td>
                    <td className="p-4 text-right font-mono">{tx.amount}</td>
                    <td className="p-4 text-right">
                      <span className="px-2 py-0.5 bg-green-900/30 text-green-400 text-[10px] rounded uppercase">Հաջողված</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      case 'trading':
        return (
          <div className="grid lg:grid-cols-2 gap-8 animate-fade-in">
             {/* Platform Trading Control */}
             <div className="bg-binance-black border border-binance-gray rounded-xl p-8">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <Zap size={22} className="text-binance-yellow" /> Հարթակի Առևտուր (Market Making)
                </h3>
                <p className="text-sm text-binance-subtext mb-6">Այստեղից կարող եք կառավարել հարթակի պահուստները և կատարել համակարգային գործարքներ։</p>
                
                <div className="space-y-4">
                   <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs text-binance-subtext">Արժույթ</label>
                        <select 
                          value={selectedSymbol}
                          onChange={(e) => setSelectedSymbol(e.target.value)}
                          className="w-full bg-binance-dark border border-binance-gray rounded-lg p-3 text-white focus:outline-none focus:border-binance-yellow"
                        >
                          {marketData.map(c => <option key={c.symbol} value={c.symbol}>{c.symbol}</option>)}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs text-binance-subtext">Քանակ</label>
                        <input 
                          type="number" 
                          value={adminTradeAmount}
                          onChange={(e) => setAdminTradeAmount(e.target.value)}
                          placeholder="0.00"
                          className="w-full bg-binance-dark border border-binance-gray rounded-lg p-3 text-white focus:outline-none focus:border-binance-yellow"
                        />
                      </div>
                   </div>

                   <div className="space-y-2">
                      <label className="text-xs text-binance-subtext">Գին (թողնել դատարկ շուկայականի համար)</label>
                      <input 
                        type="number" 
                        value={adminTradePrice}
                        onChange={(e) => setAdminTradePrice(e.target.value)}
                        placeholder="Շուկայական գին"
                        className="w-full bg-binance-dark border border-binance-gray rounded-lg p-3 text-white focus:outline-none focus:border-binance-yellow"
                      />
                   </div>

                   <div className="grid grid-cols-2 gap-4 pt-4">
                      <button 
                        onClick={() => handleAdminTrade('buy')}
                        className="py-4 bg-binance-green text-black font-bold rounded-xl hover:opacity-90 flex items-center justify-center gap-2"
                      >
                         <Plus size={18} /> ԳՆՈՒՄ (System)
                      </button>
                      <button 
                        onClick={() => handleAdminTrade('sell')}
                        className="py-4 bg-binance-red text-white font-bold rounded-xl hover:opacity-90 flex items-center justify-center gap-2"
                      >
                         <TrendingDown size={18} /> ՎԱՃԱՌՔ (System)
                      </button>
                   </div>
                </div>
             </div>

             {/* Market Control Tools */}
             <div className="bg-binance-black border border-binance-gray rounded-xl p-8">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <TrendingUp size={22} className="text-binance-yellow" /> DMC Շուկայի Վերահսկողություն
                </h3>
                <div className="p-4 bg-binance-gray/10 rounded-xl mb-6">
                   <div className="flex justify-between items-center mb-2">
                      <span className="text-sm">Ընթացիկ DMC Գին:</span>
                      <span className="text-xl font-bold text-binance-yellow">${marketData.find(c => c.symbol === 'DMC')?.price.toFixed(4)}</span>
                   </div>
                </div>

                <div className="space-y-4">
                   <p className="text-sm text-binance-subtext">Ակնթարթային Գործողություններ:</p>
                   <button className="w-full py-3 bg-binance-green/20 border border-binance-green text-binance-green rounded-lg font-bold hover:bg-binance-green hover:text-black transition-all flex items-center justify-center gap-2">
                      <ArrowUpRight size={18} /> DMC Pump (+15%)
                   </button>
                   <button className="w-full py-3 bg-binance-red/20 border border-binance-red text-binance-red rounded-lg font-bold hover:bg-binance-red hover:text-white transition-all flex items-center justify-center gap-2">
                      <ArrowDownLeft size={18} /> DMC Dump (-15%)
                   </button>
                   <button className="w-full py-3 bg-binance-gray hover:bg-gray-700 text-white rounded-lg font-bold transition-all flex items-center justify-center gap-2">
                      <RefreshCw size={18} /> Վերականգնել Շուկայական Գինը
                   </button>
                </div>
             </div>
          </div>
        );

      case 'settings':
        return (
          <div className="max-w-2xl bg-binance-black border border-binance-gray rounded-xl p-8 animate-fade-in">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Settings size={22} className="text-binance-yellow" /> Համակարգային Կարգավորումներ
            </h3>
            <div className="space-y-6">
              <div className="flex flex-col gap-2">
                <label className="text-sm text-binance-subtext">USD/AMD Փոխարժեք</label>
                <input 
                  type="number" 
                  value={tempSettings.usdToAmdRate} 
                  onChange={(e) => setTempSettings({...tempSettings, usdToAmdRate: Number(e.target.value)})}
                  className="bg-binance-dark border border-binance-gray rounded-lg p-3 text-white focus:outline-none focus:border-binance-yellow" 
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm text-binance-subtext">Հարթակի Միջնորդավճար (%)</label>
                <input 
                  type="number" 
                  value={tempSettings.platformFee} 
                  onChange={(e) => setTempSettings({...tempSettings, platformFee: Number(e.target.value)})}
                  className="bg-binance-dark border border-binance-gray rounded-lg p-3 text-white focus:outline-none focus:border-binance-yellow" 
                />
              </div>
              <div className="flex items-center justify-between p-4 bg-binance-gray/10 rounded-lg">
                <div>
                  <h4 className="font-bold text-sm">AI Վերլուծաբան</h4>
                  <p className="text-xs text-binance-subtext">Ակտիվացնել AI օգնականի գործառույթը բոլորի համար</p>
                </div>
                <button 
                  onClick={() => setTempSettings({...tempSettings, isAiEnabled: !tempSettings.isAiEnabled})}
                  className={`w-12 h-6 rounded-full relative transition-colors ${tempSettings.isAiEnabled ? 'bg-binance-green' : 'bg-binance-gray'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${tempSettings.isAiEnabled ? 'left-7' : 'left-1'}`}></div>
                </button>
              </div>
              <button 
                onClick={() => {
                  updateSettings(tempSettings);
                  alert('Կարգավորումները պահպանվեցին:');
                }}
                className="w-full py-3 bg-binance-yellow text-black font-bold rounded-lg hover:bg-yellow-400 flex items-center justify-center gap-2 transition-transform active:scale-95"
              >
                <Save size={18} /> Պահպանել Փոփոխությունները
              </button>
            </div>
          </div>
        );

      case 'overview':
      default:
        return (
          <div className="space-y-8 animate-fade-in">
            {/* Stats Grid */}
            <div className="grid md:grid-cols-4 gap-4">
              {stats.map((s, i) => (
                <div key={i} className="bg-binance-black border border-binance-gray p-6 rounded-xl hover:border-binance-yellow/50 transition-colors">
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-2 bg-binance-gray/20 rounded-lg">{s.icon}</div>
                    <span className="text-[10px] font-bold text-binance-green bg-binance-green/10 px-1.5 py-0.5 rounded">{s.change}</span>
                  </div>
                  <h4 className="text-binance-subtext text-xs mb-1 uppercase font-bold tracking-wider">{s.label}</h4>
                  <div className="text-2xl font-bold text-white font-mono">{s.value}</div>
                </div>
              ))}
            </div>

            {/* Platform Health Section */}
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-binance-black border border-binance-gray rounded-xl p-6">
                <h3 className="font-bold mb-6 flex items-center gap-2"><BarChart3 size={18} className="text-binance-yellow" /> Հարթակի Ակտիվություն (24ժ)</h3>
                <div className="h-64 bg-binance-gray/10 rounded-lg flex items-end justify-between p-4 gap-1">
                   {[40, 70, 45, 90, 65, 85, 40, 60, 75, 55, 95, 80].map((h, i) => (
                     <div key={i} className="flex-1 bg-binance-yellow/40 hover:bg-binance-yellow transition-all rounded-t-sm" style={{ height: `${h}%` }}></div>
                   ))}
                </div>
              </div>
              <div className="bg-binance-black border border-binance-gray rounded-xl p-6">
                <h3 className="font-bold mb-6">Արագ Գործողություններ</h3>
                <div className="space-y-4">
                   <button 
                     onClick={() => setActiveTab('trading')}
                     className="w-full flex items-center justify-between p-4 bg-binance-gray/20 rounded-xl hover:bg-binance-gray/40 transition-all border border-transparent hover:border-binance-yellow/30"
                   >
                      <div className="flex items-center gap-3">
                         <Zap size={18} className="text-binance-yellow" />
                         <span className="text-sm font-bold">Կատարել Առևտուր</span>
                      </div>
                      <Plus size={16} className="text-binance-subtext" />
                   </button>
                   <button 
                     onClick={() => setView(ViewState.TRADE)}
                     className="w-full flex items-center justify-between p-4 bg-binance-gray/20 rounded-xl hover:bg-binance-gray/40 transition-all border border-transparent hover:border-binance-yellow/30"
                   >
                      <div className="flex items-center gap-3">
                         <Activity size={18} className="text-blue-500" />
                         <span className="text-sm font-bold">Դիտել Շուկան</span>
                      </div>
                      <ArrowUpRight size={16} className="text-binance-subtext" />
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
      {/* Admin Sidebar */}
      <aside className="w-64 bg-binance-black border-r border-binance-gray p-4 hidden md:block">
        <div className="flex items-center gap-3 p-4 mb-8 bg-binance-gray/20 rounded-xl">
           <div className="w-10 h-10 rounded-full bg-binance-yellow flex items-center justify-center text-black shadow-lg"><ShieldCheck size={24} /></div>
           <div>
              <p className="text-xs text-binance-subtext font-bold">ԱԴՄԻՆ</p>
              <p className="text-sm font-bold truncate">DramCoin Office</p>
           </div>
        </div>
        <nav className="space-y-1">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'overview' ? 'bg-binance-yellow text-black' : 'text-binance-subtext hover:bg-binance-gray/30 hover:text-white'}`}
          >
            <BarChart3 size={18} /> Վիճակագրություն
          </button>
          <button 
            onClick={() => setActiveTab('trading')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'trading' ? 'bg-binance-yellow text-black' : 'text-binance-subtext hover:bg-binance-gray/30 hover:text-white'}`}
          >
            <Zap size={18} /> Առևտուր (Platform)
          </button>
          <button 
            onClick={() => setActiveTab('users')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'users' ? 'bg-binance-yellow text-black' : 'text-binance-subtext hover:bg-binance-gray/30 hover:text-white'}`}
          >
            <Users size={18} /> Օգտատերեր
          </button>
          <button 
            onClick={() => setActiveTab('transactions')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'transactions' ? 'bg-binance-yellow text-black' : 'text-binance-subtext hover:bg-binance-gray/30 hover:text-white'}`}
          >
            <Database size={18} /> Գործարքներ
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'settings' ? 'bg-binance-yellow text-black' : 'text-binance-subtext hover:bg-binance-gray/30 hover:text-white'}`}
          >
            <Settings size={18} /> Կարգավորումներ
          </button>
        </nav>
      </aside>

      {/* Main Admin Area */}
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
             {activeTab === 'overview' && 'Ընդհանուր Վերահսկողություն'}
             {activeTab === 'trading' && 'Շուկայի Կառավարում'}
             {activeTab === 'users' && 'Օգտատերերի Ցուցակ'}
             {activeTab === 'settings' && 'Համակարգի Կառավարում'}
             {activeTab === 'transactions' && 'Գործարքների Մոնիտորինգ'}
          </h2>
          <div className="flex items-center gap-4">
             <div className="text-right hidden sm:block">
                <p className="text-xs text-binance-subtext font-bold">ՍԵՐՎԵՐԻ ՎԻՃԱԿ</p>
                <p className="text-xs text-binance-green font-mono flex items-center gap-1 justify-end"><span className="w-2 h-2 bg-binance-green rounded-full animate-pulse"></span> ONLINE</p>
             </div>
             <div className="w-10 h-10 rounded-full bg-binance-gray flex items-center justify-center text-binance-yellow"><Activity size={20} /></div>
          </div>
        </header>

        {renderContent()}
      </main>
    </div>
  );
};

export default AdminDashboard;
