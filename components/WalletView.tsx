import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Eye, EyeOff, Wallet, PieChart, ArrowRightLeft, CreditCard, X, ChevronDown, History, ArrowDownLeft, ArrowUpRight, TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';
import { translations } from '../translations';
import { ViewState } from '../types';

const WalletView: React.FC = () => {
  const { user, marketData, language, deposit, transfer, setSelectedSymbol, setView } = useStore();
  const [showBalance, setShowBalance] = React.useState(true);
  const t = translations[language].wallet;

  // Modals State
  const [activeModal, setActiveModal] = useState<'deposit' | 'transfer' | null>(null);
  const [modalAmount, setModalAmount] = useState('');
  const [modalAddress, setModalAddress] = useState('');
  const [selectedAsset, setSelectedAsset] = useState('USDT');
  const [message, setMessage] = useState<{text: string, type: 'success' | 'error'} | null>(null);

  // Calculate real-time total balance based on current market data
  const totalBalanceUSDT = user.assets.reduce((acc, asset) => {
    if (asset.symbol === 'USDT') return acc + asset.amount;
    const price = marketData.find(c => c.symbol === asset.symbol)?.price || 0;
    return acc + (asset.amount * price);
  }, 0);

  const handleDeposit = () => {
      const amount = parseFloat(modalAmount);
      if (amount > 0) {
          deposit('USDT', amount); // Default to USDT for simplicity, or selectedAsset
          setMessage({ text: t.success_deposit, type: 'success' });
          setTimeout(() => {
              setMessage(null);
              setActiveModal(null);
              setModalAmount('');
          }, 1500);
      }
  };

  const handleTransfer = () => {
      const amount = parseFloat(modalAmount);
      if (amount > 0 && modalAddress.trim()) {
          const result = transfer(selectedAsset, amount);
          if (result.success) {
              setMessage({ text: t.success_transfer, type: 'success' });
              setTimeout(() => {
                  setMessage(null);
                  setActiveModal(null);
                  setModalAmount('');
                  setModalAddress('');
              }, 1500);
          } else {
               setMessage({ text: t.error_funds, type: 'error' });
          }
      }
  };

  const closeModal = () => {
      setActiveModal(null);
      setMessage(null);
      setModalAmount('');
      setModalAddress('');
  };

  const handleTradeAction = (symbol: string) => {
      setSelectedSymbol(symbol);
      setView(ViewState.TRADE);
  };

  const getTxIcon = (type: string) => {
      switch(type) {
          case 'deposit': return <ArrowDownLeft size={16} className="text-binance-green" />;
          case 'withdrawal': return <ArrowUpRight size={16} className="text-binance-red" />;
          case 'buy': return <TrendingUp size={16} className="text-binance-green" />;
          case 'sell': return <TrendingDown size={16} className="text-binance-red" />;
          default: return null;
      }
  };

  const getTxLabel = (type: string) => {
      switch(type) {
          case 'deposit': return t.type_deposit;
          case 'withdrawal': return t.type_withdrawal;
          case 'buy': return t.type_buy;
          case 'sell': return t.type_sell;
          default: return type;
      }
  };

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8 animate-fade-in relative">
      {/* Wallet Header */}
      <div className="bg-binance-black border border-binance-gray rounded-2xl p-6 mb-8 shadow-lg">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h2 className="text-binance-subtext text-sm font-medium mb-1">{t.total_balance}</h2>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl md:text-4xl font-bold text-white">
                {showBalance 
                  ? `${totalBalanceUSDT.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                  : '******'} 
                <span className="text-xl text-binance-subtext ml-2">USDT</span>
              </h1>
              <button 
                onClick={() => setShowBalance(!showBalance)}
                className="text-binance-subtext hover:text-white transition-colors"
              >
                {showBalance ? <Eye size={20} /> : <EyeOff size={20} />}
              </button>
            </div>
            <p className="text-binance-subtext text-sm mt-1">
               ≈ {showBalance ? (totalBalanceUSDT / (marketData.find(c => c.symbol === 'BTC')?.price || 64000)).toFixed(6) : '******'} BTC
            </p>
          </div>
          <div className="flex gap-3 mt-4 md:mt-0">
             <button 
                onClick={() => setActiveModal('deposit')}
                className="bg-binance-yellow text-black px-6 py-2.5 rounded-lg font-bold hover:bg-yellow-400 transition-colors flex items-center gap-2"
             >
                 <CreditCard size={18} /> {t.deposit}
             </button>
             <button 
                onClick={() => setActiveModal('transfer')}
                className="bg-binance-gray text-white px-6 py-2.5 rounded-lg font-bold hover:bg-gray-700 transition-colors flex items-center gap-2"
             >
                 <ArrowRightLeft size={18} /> {t.transfer}
             </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Left: Asset List */}
          <div className="lg:col-span-2 bg-binance-black border border-binance-gray rounded-xl overflow-hidden shadow-lg">
              <div className="p-4 border-b border-binance-gray flex justify-between items-center">
                  <h3 className="font-bold text-lg flex items-center gap-2">
                      <Wallet size={20} className="text-binance-yellow" />
                      {t.assets}
                  </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-binance-gray/30 text-binance-subtext text-xs">
                        <tr>
                            <th className="py-3 pl-4">{t.coin}</th>
                            <th className="py-3 text-right">{language === 'AM' ? 'Գին' : 'Price'}</th>
                            <th className="py-3 text-right">{t.total_balance}</th>
                            <th className="py-3 text-right">{t.value}</th>
                            <th className="py-3 text-right pr-4">{language === 'AM' ? 'Գործողություն' : 'Action'}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-binance-gray/20">
                        {user.assets.map((asset) => {
                            const marketPrice = asset.symbol === 'USDT' ? 1 : marketData.find(c => c.symbol === asset.symbol)?.price || 0;
                            const value = asset.amount * marketPrice;
                            
                            return (
                                <tr key={asset.symbol} className="hover:bg-binance-gray/10 transition-colors">
                                    <td className="py-4 pl-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-binance-gray flex items-center justify-center font-bold text-xs">
                                                {asset.symbol[0]}
                                            </div>
                                            <span className="font-bold">{asset.symbol}</span>
                                        </div>
                                    </td>
                                    <td className="py-4 text-right font-mono text-sm text-binance-subtext">
                                        {asset.symbol === 'USDT' ? '$1.00' : 
                                            marketPrice > 0 ? `$${marketPrice.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 4})}` : '...'}
                                    </td>
                                    <td className="py-4 text-right font-mono text-sm">
                                        {asset.amount.toLocaleString(undefined, {maximumFractionDigits: 6})}
                                    </td>
                                    <td className="py-4 text-right font-mono text-sm font-medium text-white">
                                        ${value.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                                    </td>
                                    <td className="py-4 text-right pr-4">
                                        {asset.symbol !== 'USDT' && (
                                            <button 
                                                onClick={() => handleTradeAction(asset.symbol)}
                                                className="text-binance-yellow hover:text-white text-xs font-bold transition-colors"
                                            >
                                                {language === 'AM' ? 'Առևտուր' : 'Trade'}
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
              </div>
          </div>

          {/* Right: Portfolio Analysis */}
          <div className="lg:col-span-1 space-y-6">
               <div className="bg-binance-black border border-binance-gray rounded-xl p-6 shadow-lg">
                   <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                       <PieChart size={20} className="text-binance-green" />
                       {t.portfolio}
                   </h3>
                   <div className="h-48 flex items-center justify-center relative">
                       <div className="w-32 h-32 rounded-full border-8 border-binance-yellow border-r-binance-green border-b-binance-gray"></div>
                       <div className="absolute text-center">
                           <span className="text-xs text-binance-subtext">Total</span>
                           <div className="font-bold text-sm">100%</div>
                       </div>
                   </div>
                   <div className="mt-4 space-y-2">
                       <div className="flex justify-between text-sm">
                           <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-binance-yellow"></div>USDT</span>
                           <span>{totalBalanceUSDT > 0 ? ((user.assets.find(a => a.symbol === 'USDT')?.amount || 0) / totalBalanceUSDT * 100).toFixed(1) : 0}%</span>
                       </div>
                       <div className="flex justify-between text-sm">
                           <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-binance-green"></div>Crypto</span>
                           <span>{totalBalanceUSDT > 0 ? (100 - ((user.assets.find(a => a.symbol === 'USDT')?.amount || 0) / totalBalanceUSDT * 100)).toFixed(1) : 0}%</span>
                       </div>
                   </div>
               </div>
          </div>
      </div>

      {/* Transaction History Section */}
      <div className="bg-binance-black border border-binance-gray rounded-xl overflow-hidden shadow-lg">
          <div className="p-4 border-b border-binance-gray">
              <h3 className="font-bold text-lg flex items-center gap-2">
                  <History size={20} className="text-binance-subtext" />
                  {t.history_title}
              </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead className="bg-binance-gray/30 text-binance-subtext text-xs">
                    <tr>
                        <th className="py-3 pl-4">{t.history_type}</th>
                        <th className="py-3">{t.coin}</th>
                        <th className="py-3">{t.amount}</th>
                        <th className="py-3">{t.history_date}</th>
                        <th className="py-3 pr-4 text-right">{t.history_status}</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-binance-gray/20">
                    {user.transactions && user.transactions.length > 0 ? (
                        user.transactions.map((tx) => (
                            <tr key={tx.id} className="hover:bg-binance-gray/10 transition-colors">
                                <td className="py-4 pl-4">
                                    <div className="flex items-center gap-2">
                                        {getTxIcon(tx.type)}
                                        <span className={`text-sm font-medium ${
                                            tx.type === 'deposit' || tx.type === 'buy' ? 'text-binance-green' : 'text-binance-red'
                                        }`}>
                                            {getTxLabel(tx.type)}
                                        </span>
                                    </div>
                                </td>
                                <td className="py-4 font-bold text-sm">{tx.symbol}</td>
                                <td className="py-4 font-mono text-sm">
                                    {tx.amount.toLocaleString(undefined, {maximumFractionDigits: 6})}
                                </td>
                                <td className="py-4 text-sm text-binance-subtext">
                                    {new Date(tx.date).toLocaleDateString()} {new Date(tx.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </td>
                                <td className="py-4 pr-4 text-right">
                                    <span className="text-xs bg-green-900/30 text-green-400 px-2 py-1 rounded">
                                        {t.status_completed}
                                    </span>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={5} className="py-8 text-center text-binance-subtext text-sm">
                                {language === 'AM' ? 'Գործարքներ չեն գտնվել' : 'No transactions found'}
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
          </div>
      </div>

      {/* Modals */}
      {activeModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-[#1e2026] w-full max-w-md rounded-2xl border border-binance-gray p-6 shadow-2xl transform transition-all animate-fade-in">
                  <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-bold text-white">
                          {activeModal === 'deposit' ? t.modal_deposit_title : t.modal_transfer_title}
                      </h3>
                      <button onClick={closeModal} className="text-binance-subtext hover:text-white">
                          <X size={24} />
                      </button>
                  </div>

                  {message && (
                      <div className={`p-3 rounded mb-4 text-sm font-medium ${message.type === 'success' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                          {message.text}
                      </div>
                  )}

                  <div className="space-y-4">
                      {activeModal === 'transfer' && (
                        <div>
                             <label className="text-xs text-binance-subtext mb-1 block">{t.asset}</label>
                             <div className="relative">
                                 <select 
                                    value={selectedAsset}
                                    onChange={(e) => setSelectedAsset(e.target.value)}
                                    className="w-full bg-binance-dark border border-binance-gray rounded-lg p-3 text-white appearance-none focus:outline-none focus:border-binance-yellow"
                                 >
                                     {user.assets.map(a => (
                                         <option key={a.symbol} value={a.symbol}>{a.symbol}</option>
                                     ))}
                                 </select>
                                 <ChevronDown className="absolute right-3 top-3 text-binance-subtext pointer-events-none" size={16} />
                             </div>
                        </div>
                      )}

                      {activeModal === 'deposit' && (
                          <div>
                              <label className="text-xs text-binance-subtext mb-1 block">{t.asset}</label>
                              <div className="w-full bg-binance-dark border border-binance-gray rounded-lg p-3 text-binance-subtext cursor-not-allowed">
                                  USDT
                              </div>
                          </div>
                      )}

                      {activeModal === 'transfer' && (
                          <div>
                              <label className="text-xs text-binance-subtext mb-1 block">{t.address}</label>
                              <input 
                                  type="text" 
                                  value={modalAddress}
                                  onChange={(e) => setModalAddress(e.target.value)}
                                  className="w-full bg-binance-dark border border-binance-gray rounded-lg p-3 text-white focus:outline-none focus:border-binance-yellow placeholder-binance-gray"
                                  placeholder="0x..."
                              />
                          </div>
                      )}

                      <div>
                          <label className="text-xs text-binance-subtext mb-1 block">{t.amount}</label>
                          <input 
                              type="number" 
                              value={modalAmount}
                              onChange={(e) => setModalAmount(e.target.value)}
                              className="w-full bg-binance-dark border border-binance-gray rounded-lg p-3 text-white focus:outline-none focus:border-binance-yellow"
                              placeholder="0.00"
                          />
                      </div>

                      <div className="flex gap-3 mt-6">
                          <button 
                             onClick={closeModal}
                             className="flex-1 py-3 bg-binance-gray/30 text-white rounded-lg font-bold hover:bg-binance-gray/50 transition-colors"
                          >
                              {t.cancel}
                          </button>
                          <button 
                             onClick={activeModal === 'deposit' ? handleDeposit : handleTransfer}
                             className="flex-1 py-3 bg-binance-yellow text-black rounded-lg font-bold hover:bg-yellow-400 transition-colors"
                          >
                              {t.confirm}
                          </button>
                      </div>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default WalletView;