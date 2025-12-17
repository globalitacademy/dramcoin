
import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { translations } from '../translations';
import { ShieldCheck, Lock, User, AlertCircle } from 'lucide-react';

const AdminLogin: React.FC = () => {
  const { language, adminLogin } = useStore();
  const t = translations[language].admin;

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = adminLogin(username, password);
    if (!success) {
      setError(true);
      setTimeout(() => setError(false), 3000);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-binance-dark p-4">
      <div className="w-full max-w-md bg-binance-black border border-binance-gray rounded-3xl p-8 shadow-2xl animate-fade-in">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-binance-yellow/10 rounded-2xl flex items-center justify-center text-binance-yellow mx-auto mb-4 border border-binance-yellow/20">
            <ShieldCheck size={32} />
          </div>
          <h2 className="text-2xl font-bold text-white">{t.login_title}</h2>
          <p className="text-binance-subtext text-sm mt-2">DramCoin Management Portal</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm text-binance-subtext ml-1">{t.username}</label>
            <div className="relative">
              <User className="absolute left-3 top-3.5 text-binance-subtext" size={18} />
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-binance-dark border border-binance-gray rounded-xl py-3 pl-10 pr-4 text-white focus:border-binance-yellow focus:outline-none transition-colors"
                placeholder="Admin"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-binance-subtext ml-1">{t.password}</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 text-binance-subtext" size={18} />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-binance-dark border border-binance-gray rounded-xl py-3 pl-10 pr-4 text-white focus:border-binance-yellow focus:outline-none transition-colors"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-900/20 border border-red-900/50 text-red-400 p-3 rounded-lg text-sm flex items-center gap-2 animate-shake">
              <AlertCircle size={16} />
              {t.error}
            </div>
          )}

          <button 
            type="submit"
            className="w-full py-4 bg-binance-yellow text-black font-bold rounded-xl hover:shadow-[0_0_20px_rgba(252,213,53,0.3)] transition-all active:scale-95 text-lg"
          >
            {t.login_btn}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
