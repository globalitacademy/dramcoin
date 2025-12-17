
import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { translations } from '../translations';
import { Mail, Lock, User, ShieldCheck, Eye, EyeOff, AlertCircle, CheckCircle2, ArrowLeft, Smartphone, Globe } from 'lucide-react';

type AuthStep = 'login' | 'register' | 'forgot' | 'verify';

const AuthView: React.FC = () => {
  const { language, login, register, setView } = useStore();
  const t = translations[language].auth;
  
  const [step, setStep] = useState<AuthStep>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Password strength calculation
  const getPasswordStrength = (pass: string) => {
    if (!pass) return 0;
    let strength = 0;
    if (pass.length >= 8) strength += 1;
    if (/[A-Z]/.test(pass)) strength += 1;
    if (/[0-9]/.test(pass)) strength += 1;
    if (/[^A-Za-z0-9]/.test(pass)) strength += 1;
    return strength;
  };

  const strength = getPasswordStrength(password);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    setTimeout(() => {
        const result = login(email, password);
        if (!result.success) {
            setError(language === 'AM' ? 'Սխալ էլ. հասցե կամ գաղտնաբառ' : 'Invalid email or password');
            setIsLoading(false);
        }
    }, 1000);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
        setError(language === 'AM' ? 'Գաղտնաբառերը չեն համընկնում' : 'Passwords do not match');
        return;
    }
    if (strength < 2) {
        setError(language === 'AM' ? 'Գաղտնաբառը շատ թույլ է' : 'Password is too weak');
        return;
    }
    
    setIsLoading(true);
    setError('');
    
    setTimeout(() => {
        // Go to verification step first
        setStep('verify');
        setIsLoading(false);
    }, 1000);
  };

  const handleVerify = () => {
    setIsLoading(true);
    setTimeout(() => {
        register(username, email, password);
        setIsLoading(false);
    }, 1500);
  };

  const renderStrengthMeter = () => (
    <div className="mt-2 flex gap-1 h-1 w-full">
        {[1, 2, 3, 4].map(i => (
            <div key={i} className={`flex-1 rounded-full transition-all duration-300 ${
                strength >= i 
                    ? (strength <= 2 ? 'bg-binance-red' : strength === 3 ? 'bg-yellow-500' : 'bg-binance-green')
                    : 'bg-binance-gray'
            }`}></div>
        ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-binance-dark flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-binance-black border border-binance-gray rounded-3xl p-8 shadow-2xl animate-fade-in">
        
        {step !== 'login' && (
            <button onClick={() => setStep('login')} className="mb-6 text-binance-subtext hover:text-white flex items-center gap-1 text-sm transition-colors">
                <ArrowLeft size={16} /> {language === 'AM' ? 'Հետ' : 'Back'}
            </button>
        )}

        <div className="text-center mb-8">
            <div className="w-16 h-16 bg-binance-yellow/10 rounded-2xl flex items-center justify-center text-binance-yellow mx-auto mb-4 border border-binance-yellow/20">
                <ShieldCheck size={32} />
            </div>
            <h2 className="text-2xl font-bold text-white">
                {step === 'login' ? t.login_title : step === 'register' ? t.register_title : step === 'verify' ? t.verify_title : t.reset_title}
            </h2>
            <p className="text-binance-subtext text-sm mt-2">
                {step === 'verify' ? t.verify_desc : step === 'forgot' ? t.reset_desc : ''}
            </p>
        </div>

        {error && (
            <div className="bg-red-900/20 border border-red-900/50 text-red-400 p-3 rounded-xl text-xs flex items-center gap-2 mb-6 animate-shake">
                <AlertCircle size={16} /> {error}
            </div>
        )}

        {step === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-1">
                    <label className="text-xs text-binance-subtext ml-1">{t.email}</label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-3.5 text-binance-subtext" size={18} />
                        <input 
                            type="email" required
                            value={email} onChange={e => setEmail(e.target.value)}
                            className="w-full bg-binance-dark border border-binance-gray rounded-xl py-3 pl-10 pr-4 text-white focus:border-binance-yellow focus:outline-none transition-colors"
                        />
                    </div>
                </div>
                <div className="space-y-1">
                    <div className="flex justify-between items-center px-1">
                        <label className="text-xs text-binance-subtext">{t.password}</label>
                        <button type="button" onClick={() => setStep('forgot')} className="text-xs text-binance-yellow hover:underline">{t.forgot_password}</button>
                    </div>
                    <div className="relative">
                        <Lock className="absolute left-3 top-3.5 text-binance-subtext" size={18} />
                        <input 
                            type={showPass ? 'text' : 'password'} required
                            value={password} onChange={e => setPassword(e.target.value)}
                            className="w-full bg-binance-dark border border-binance-gray rounded-xl py-3 pl-10 pr-12 text-white focus:border-binance-yellow focus:outline-none transition-colors"
                        />
                        <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-3.5 text-binance-subtext hover:text-white">
                            {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                </div>

                <div className="flex items-center gap-2 px-1">
                    <input type="checkbox" id="remember" checked={rememberMe} onChange={e => setRememberMe(e.target.checked)} className="accent-binance-yellow" />
                    <label htmlFor="remember" className="text-xs text-binance-subtext cursor-pointer">{t.remember_me}</label>
                </div>

                <button 
                    disabled={isLoading}
                    className="w-full py-4 bg-binance-yellow text-black font-bold rounded-xl hover:shadow-xl transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none mt-4"
                >
                    {isLoading ? <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto"></div> : t.btn_login}
                </button>

                <div className="text-center pt-4">
                    <p className="text-sm text-binance-subtext">
                        {t.no_account} <button type="button" onClick={() => setStep('register')} className="text-binance-yellow font-bold hover:underline">{t.btn_register}</button>
                    </p>
                </div>

                <div className="relative py-4">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-binance-gray"></div></div>
                    <div className="relative flex justify-center text-xs uppercase"><span className="bg-binance-black px-2 text-binance-subtext">{t.social_login}</span></div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <button type="button" className="flex items-center justify-center gap-2 py-3 border border-binance-gray rounded-xl hover:bg-binance-gray/30 transition-colors text-sm font-medium">
                        <Globe size={18} className="text-blue-400" /> Google
                    </button>
                    <button type="button" className="flex items-center justify-center gap-2 py-3 border border-binance-gray rounded-xl hover:bg-binance-gray/30 transition-colors text-sm font-medium">
                        <Smartphone size={18} className="text-binance-yellow" /> Wallet
                    </button>
                </div>
            </form>
        )}

        {step === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-1">
                    <label className="text-xs text-binance-subtext ml-1">{t.username}</label>
                    <div className="relative">
                        <User className="absolute left-3 top-3.5 text-binance-subtext" size={18} />
                        <input 
                            type="text" required
                            value={username} onChange={e => setUsername(e.target.value)}
                            className="w-full bg-binance-dark border border-binance-gray rounded-xl py-3 pl-10 pr-4 text-white focus:border-binance-yellow focus:outline-none"
                        />
                    </div>
                </div>
                <div className="space-y-1">
                    <label className="text-xs text-binance-subtext ml-1">{t.email}</label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-3.5 text-binance-subtext" size={18} />
                        <input 
                            type="email" required
                            value={email} onChange={e => setEmail(e.target.value)}
                            className="w-full bg-binance-dark border border-binance-gray rounded-xl py-3 pl-10 pr-4 text-white focus:border-binance-yellow focus:outline-none"
                        />
                    </div>
                </div>
                <div className="space-y-1">
                    <label className="text-xs text-binance-subtext ml-1">{t.password}</label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-3.5 text-binance-subtext" size={18} />
                        <input 
                            type={showPass ? 'text' : 'password'} required
                            value={password} onChange={e => setPassword(e.target.value)}
                            className="w-full bg-binance-dark border border-binance-gray rounded-xl py-3 pl-10 pr-4 text-white focus:border-binance-yellow focus:outline-none"
                        />
                    </div>
                    {renderStrengthMeter()}
                </div>
                <div className="space-y-1">
                    <label className="text-xs text-binance-subtext ml-1">{t.confirm_password}</label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-3.5 text-binance-subtext" size={18} />
                        <input 
                            type="password" required
                            value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                            className="w-full bg-binance-dark border border-binance-gray rounded-xl py-3 pl-10 pr-4 text-white focus:border-binance-yellow focus:outline-none"
                        />
                    </div>
                </div>

                <button 
                    disabled={isLoading}
                    className="w-full py-4 bg-binance-yellow text-black font-bold rounded-xl hover:shadow-xl transition-all active:scale-95 disabled:opacity-50 mt-4"
                >
                    {isLoading ? <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto"></div> : t.btn_register}
                </button>

                <div className="text-center pt-4">
                    <p className="text-sm text-binance-subtext">
                        {t.have_account} <button type="button" onClick={() => setStep('login')} className="text-binance-yellow font-bold hover:underline">{t.btn_login}</button>
                    </p>
                </div>
            </form>
        )}

        {step === 'verify' && (
            <div className="space-y-6">
                <div className="flex justify-center gap-2">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <input 
                            key={i} type="text" maxLength={1}
                            className="w-12 h-14 bg-binance-dark border border-binance-gray rounded-xl text-center text-xl font-bold text-binance-yellow focus:border-binance-yellow focus:outline-none"
                        />
                    ))}
                </div>
                <button 
                    onClick={handleVerify}
                    className="w-full py-4 bg-binance-yellow text-black font-bold rounded-xl hover:shadow-xl transition-all active:scale-95"
                >
                    {isLoading ? <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto"></div> : t.verify_btn}
                </button>
            </div>
        )}

        {step === 'forgot' && (
             <form onSubmit={e => { e.preventDefault(); alert('Reset link sent!'); setStep('login'); }} className="space-y-4">
                <div className="space-y-1">
                    <label className="text-xs text-binance-subtext ml-1">{t.email}</label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-3.5 text-binance-subtext" size={18} />
                        <input 
                            type="email" required
                            className="w-full bg-binance-dark border border-binance-gray rounded-xl py-3 pl-10 pr-4 text-white focus:border-binance-yellow focus:outline-none"
                        />
                    </div>
                </div>
                <button 
                    className="w-full py-4 bg-binance-yellow text-black font-bold rounded-xl hover:shadow-xl transition-all active:scale-95 mt-4"
                >
                    {t.reset_btn}
                </button>
            </form>
        )}
      </div>
    </div>
  );
};

export default AuthView;
