
import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
// Added missing icon imports: Smartphone, User (as UserIcon), AlertCircle
import { Eye, EyeOff, Wallet, PieChart, ArrowRightLeft, CreditCard, X, ChevronDown, History, ArrowDownLeft, ArrowUpRight, TrendingUp, TrendingDown, Shield, CheckCircle2, Clock, Smartphone, User as UserIcon, AlertCircle } from 'lucide-react';
import { translations } from '../translations';
import { ViewState } from '../types';

const WalletView: React.FC = () => {
  const { user, marketData, language, deposit, transfer, setSelectedSymbol, setView } = useStore();
  const [showBalance, setShowBalance] = React.useState(true);
  const [activeTab, setActiveTab] = useState<'assets' | 'history' | 'security'>('assets');
  const t = translations[language].wallet;

  // Modals State
  const [activeModal, setActiveModal] = useState<'deposit' | 'transfer' | null>(null);
  const [modalAmount, setModalAmount] = useState('');
  const [modalAddress, setModalAddress] = useState('');
  const [selectedAsset, setSelectedAsset] = useState('USDT');
  const [message, setMessage] = useState<{text: string, type: 'success' | 'error'} | null>(null);

  const totalBalanceUSDT = user.assets.reduce((acc, asset) => {
    if (asset.symbol === 'USDT') return acc + asset.amount;
    const price = marketData.find(c => c.symbol === asset.symbol)?.price || 0;
    return acc + (asset.amount * price);
  }, 0);

  const handleDeposit = () => {
      const amount = parseFloat(modalAmount);
      if (amount > 0) {
          deposit('USDT', amount);
          setMessage({ text: t.success_deposit, type: 'success' });
          setTimeout(() => { setMessage(null); setActiveModal(null); setModalAmount(''); }, 1500);
      }
  };

  const handleTransfer = () => {
      const amount = parseFloat(modalAmount);
      if (amount > 0 && modalAddress.trim()) {
          const result = transfer(selectedAsset, amount);
          if (result.success) {
              setMessage({ text: t.success_transfer, type: 'success' });
              setTimeout(() => { setMessage(null); setActiveModal(null); setModalAmount(''); setModalAddress(''); }, 1500);
          } else {
               setMessage({ text: t.error_funds, type: 'error' });
          }
      }
  };

  const closeModal = () => { setActiveModal(null); setMessage(null); setModalAmount(''); setModalAddress(''); };

  const getTxIcon = (type: string) => {
      switch(type) {
          case 'deposit': return <ArrowDownLeft size={16} className="text-binance-green" />;
          case 'withdrawal': return <ArrowUpRight size={16} className="text-binance-red" />;
          case 'buy': return <TrendingUp size={16} className="text-binance-green" />;
          case 'sell': return <TrendingDown size={16} className="text-binance-red" />;
          default: return null;
      }
  };

  const getKycBadge = () => {
      switch(user.kycStatus) {
          case 'verified': return <div className="flex items-center gap-1 text-binance-green bg-binance-green/10 px-2 py-0.5 rounded text-xs font-bold"><CheckCircle2 size={12} /> {t.kyc_verified}</div>;
          case 'pending': return <div className="flex items-center gap-1 text-yellow-500 bg-yellow-500/10 px-2 py-0.5 rounded text-xs font-bold"><Clock size={12} /> {t.kyc_pending}</div>;
          default: return <div className="flex items-center gap-1 text-binance-red bg-binance-red/10 px-2 py-0.5 rounded text-xs font-bold"><X size={12} /> {t.kyc_unverified}</div>;
      }
  }

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8 animate-fade-in relative">
      <div className="bg-binance-black border border-binance-gray rounded-3xl p-8 mb-8 shadow-lg">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6">
          <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-binance-gray rounded-2xl flex items-center justify-center text-binance-yellow text-2xl font-bold border border-binance-gray">
                  {user.username[0].toUpperCase()}
              </div>
              <div>
                  <div className="flex items-center gap-2 mb-1">
                      <h2 className="text-2xl font-bold text-white">{user.username}</h2>
                      {getKycBadge()}
                  </div>
                  <p className="text-binance-subtext text-sm">{user.email}</p>
              </div>
          </div>
          <div className="flex gap-3">
             <button onClick={() => setActiveModal('deposit')} className="bg-binance-yellow text-black px-8 py-3 rounded-xl font-bold hover:bg-yellow-400 transition-all active:scale-95 shadow-lg shadow-yellow-500/10">
                 {t.deposit}
             </button>
             <button onClick={() => setActiveModal('transfer')} className="bg-binance-gray text-white px-8 py-3 rounded-xl font-bold hover:bg-gray-700 transition-all active:scale-95">
                 {t.transfer}
             </button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 pt-8 border-t border-binance-gray/20">
            <div>
                <p className="text-binance-subtext text-xs uppercase font-bold tracking-wider mb-2">{t.total_balance}</p>
                <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-white font-mono">
                        {showBalance ? totalBalanceUSDT.toLocaleString() : '******'}
                    </span>
                    <span className="text-binance-subtext font-bold">USDT</span>
                    <button onClick={() => setShowBalance(!showBalance)} className="text-binance-subtext hover:text-white">
                        {showBalance ? <Eye size={16} /> : <EyeOff size={16} />}
                    </button>
                </div>
            </div>
            <div>
                <p className="text-binance-subtext text-xs uppercase font-bold tracking-wider mb-2">Security Level</p>
                <div className="flex items-center gap-2">
                    <div className="h-2 w-24 bg-binance-gray rounded-full overflow-hidden">
                        <div className={`h-full ${user.twoFactorEnabled ? 'w-full bg-binance-green' : 'w-1/2 bg-yellow-500'}`}></div>
                    </div>
                    <span className={`text-xs font-bold ${user.twoFactorEnabled ? 'text-binance-green' : 'text-yellow-500'}`}>
                        {user.twoFactorEnabled ? 'High' : 'Medium'}
                    </span>
                </div>
            </div>
        </div>
      </div>

      <div className="flex gap-4 mb-6">
          <button onClick={() => setActiveTab('assets')} className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'assets' ? 'bg-binance-yellow text-black' : 'text-binance-subtext hover:text-white'}`}>
              {t.assets}
          </button>
          <button onClick={() => setActiveTab('history')} className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'history' ? 'bg-binance-yellow text-black' : 'text-binance-subtext hover:text-white'}`}>
              {t.history_title}
          </button>
          <button onClick={() => setActiveTab('security')} className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'security' ? 'bg-binance-yellow text-black' : 'text-binance-subtext hover:text-white'}`}>
              {t.security_tab}
          </button>
      </div>

      {activeTab === 'assets' && (
          <div className="bg-binance-black border border-binance-gray rounded-3xl overflow-hidden shadow-lg animate-fade-in">
              <table className="w-full text-left">
                  <thead className="bg-binance-gray/20 text-binance-subtext text-xs font-bold uppercase">
                      <tr>
                          <th className="py-4 pl-8">{t.coin}</th>
                          <th className="py-4 text-right">Balance</th>
                          <th className="py-4 text-right pr-8">{t.value}</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-binance-gray/10">
                      {user.assets.map((asset) => (
                          <tr key={asset.symbol} className="hover:bg-binance-gray/5 transition-colors">
                              <td className="py-5 pl-8">
                                  <div className="flex items-center gap-3">
                                      <div className="w-10 h-10 rounded-full bg-binance-gray flex items-center justify-center font-bold text-sm text-binance-yellow">
                                          {asset.symbol[0]}
                                      </div>
                                      <span className="font-bold text-white">{asset.symbol}</span>
                                  </div>
                              </td>
                              <td className="py-5 text-right font-mono text-white">{asset.amount.toLocaleString()}</td>
                              <td className="py-5 text-right font-mono text-binance-subtext pr-8">
                                  ${(asset.amount * (marketData.find(c => c.symbol === asset.symbol)?.price || 1)).toLocaleString()}
                              </td>
                          </tr>
                      ))}
                  </tbody>
              </table>
          </div>
      )}

      {activeTab === 'history' && (
          <div className="bg-binance-black border border-binance-gray rounded-3xl overflow-hidden shadow-lg animate-fade-in">
              <table className="w-full text-left">
                  <thead className="bg-binance-gray/20 text-binance-subtext text-xs font-bold uppercase">
                      <tr>
                          <th className="py-4 pl-8">{t.history_type}</th>
                          <th className="py-4">Asset</th>
                          <th className="py-4 text-right">{t.amount}</th>
                          <th className="py-4 text-right pr-8">Status</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-binance-gray/10">
                      {user.transactions.length > 0 ? user.transactions.map(tx => (
                          <tr key={tx.id} className="hover:bg-binance-gray/5 transition-colors">
                              <td className="py-5 pl-8">
                                  <div className="flex items-center gap-2">
                                      {getTxIcon(tx.type)}
                                      <span className={`text-sm font-bold ${tx.type === 'deposit' || tx.type === 'buy' ? 'text-binance-green' : 'text-binance-red'}`}>
                                          {tx.type.toUpperCase()}
                                      </span>
                                  </div>
                              </td>
                              <td className="py-5 font-bold text-white">{tx.symbol}</td>
                              <td className="py-5 text-right font-mono text-white">{tx.amount.toFixed(4)}</td>
                              <td className="py-5 text-right pr-8">
                                  <span className="text-[10px] bg-binance-green/10 text-binance-green px-2 py-0.5 rounded uppercase font-bold">Success</span>
                              </td>
                          </tr>
                      )) : (
                          <tr><td colSpan={4} className="py-20 text-center text-binance-subtext">No transactions found</td></tr>
                      )}
                  </tbody>
              </table>
          </div>
      )}

      {activeTab === 'security' && (
          <div className="grid md:grid-cols-2 gap-8 animate-fade-in">
              <div className="bg-binance-black border border-binance-gray rounded-3xl p-8">
                  <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                      <Shield className="text-binance-yellow" size={24} /> 2FA Authentication
                  </h3>
                  <p className="text-sm text-binance-subtext mb-8">
                      Secure your account with 2FA using Google Authenticator or Email OTP.
                  </p>
                  <div className="flex items-center justify-between p-4 bg-binance-gray/20 rounded-2xl">
                      <div className="flex items-center gap-4">
                          {/* Replaced incorrect Hindi tag name with the correct icon component */}
                          <Smartphone className="text-binance-yellow" />
                          <div>
                              <p className="font-bold text-white">Google Authenticator</p>
                              <p className="text-xs text-binance-subtext">Used for withdrawals and security changes</p>
                          </div>
                      </div>
                      <button className={`px-6 py-2 rounded-xl text-xs font-bold ${user.twoFactorEnabled ? 'bg-binance-red/20 text-binance-red' : 'bg-binance-yellow text-black'}`}>
                          {user.twoFactorEnabled ? 'Disable' : 'Enable'}
                      </button>
                  </div>
              </div>

              <div className="bg-binance-black border border-binance-gray rounded-3xl p-8">
                  <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                      <UserIcon className="text-binance-yellow" size={24} /> Identity Verification (KYC)
                  </h3>
                  <p className="text-sm text-binance-subtext mb-8">
                      Verify your identity to increase withdrawal limits and access premium features.
                  </p>
                  <div className="p-6 border-2 border-dashed border-binance-gray rounded-2xl text-center">
                      <CreditCard className="mx-auto text-binance-subtext mb-4" size={32} />
                      <p className="text-sm font-bold text-white mb-1">Verify your identity</p>
                      <p className="text-xs text-binance-subtext mb-6">Complete KYC in less than 2 minutes</p>
                      <button 
                        onClick={() => setView(ViewState.VERIFY)}
                        disabled={user.kycStatus !== 'unverified'}
                        className="px-8 py-3 bg-binance-yellow text-black font-bold rounded-xl text-sm transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                          {user.kycStatus === 'unverified' ? 'Start Verification' : user.kycStatus === 'pending' ? 'Verification Pending' : 'Verified'}
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* Modals */}
      {activeModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-binance-black w-full max-w-md rounded-3xl border border-binance-gray p-8 shadow-2xl animate-fade-in">
                  <div className="flex justify-between items-center mb-8">
                      <h3 className="text-2xl font-bold text-white">
                          {activeModal === 'deposit' ? t.modal_deposit_title : t.modal_transfer_title}
                      </h3>
                      <button onClick={closeModal} className="text-binance-subtext hover:text-white">
                          <X size={28} />
                      </button>
                  </div>

                  {message && (
                      <div className={`p-4 rounded-xl mb-6 text-sm font-bold flex items-center gap-2 ${message.type === 'success' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                          {message.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                          {message.text}
                      </div>
                  )}

                  <div className="space-y-6">
                      <div>
                          <label className="text-xs text-binance-subtext mb-2 block font-bold uppercase tracking-wider">{t.asset}</label>
                          <div className="relative">
                              <select 
                                value={selectedAsset} onChange={(e) => setSelectedAsset(e.target.value)}
                                className="w-full bg-binance-dark border border-binance-gray rounded-xl p-4 text-white appearance-none focus:outline-none focus:border-binance-yellow font-bold"
                              >
                                  {user.assets.map(a => <option key={a.symbol} value={a.symbol}>{a.symbol}</option>)}
                              </select>
                              <ChevronDown className="absolute right-4 top-5 text-binance-subtext pointer-events-none" size={18} />
                          </div>
                      </div>

                      {activeModal === 'transfer' && (
                          <div>
                              <label className="text-xs text-binance-subtext mb-2 block font-bold uppercase tracking-wider">{t.address}</label>
                              <input 
                                  type="text" value={modalAddress} onChange={(e) => setModalAddress(e.target.value)}
                                  className="w-full bg-binance-dark border border-binance-gray rounded-xl p-4 text-white focus:outline-none focus:border-binance-yellow font-mono"
                                  placeholder="0x..."
                              />
                          </div>
                      )}

                      <div>
                          <label className="text-xs text-binance-subtext mb-2 block font-bold uppercase tracking-wider">{t.amount}</label>
                          <input 
                              type="number" value={modalAmount} onChange={(e) => setModalAmount(e.target.value)}
                              className="w-full bg-binance-dark border border-binance-gray rounded-xl p-4 text-white focus:outline-none focus:border-binance-yellow font-mono text-lg"
                              placeholder="0.00"
                          />
                      </div>

                      <div className="grid grid-cols-2 gap-4 pt-4">
                          <button onClick={closeModal} className="py-4 bg-binance-gray/30 text-white rounded-xl font-bold hover:bg-binance-gray/50 transition-colors">
                              {t.cancel}
                          </button>
                          <button onClick={activeModal === 'deposit' ? handleDeposit : handleTransfer} className="py-4 bg-binance-yellow text-black rounded-xl font-bold hover:bg-yellow-400 transition-all active:scale-95">
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
