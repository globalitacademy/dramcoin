
import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { translations } from '../translations';
import { Mail, Lock, User, ShieldCheck, Eye, EyeOff, AlertCircle, ArrowLeft, Smartphone, Globe, Loader2, X } from 'lucide-react';

type AuthStep = 'login' | 'register' | 'forgot' | 'verify';

const AuthView: React.FC = () => {
  const { language, login, register, loginWithGoogle } = useStore();
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

  // Google Simulation State
  const [showGooglePopup, setShowGooglePopup] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const mockGoogleAccounts = [
    { name: 'Armen Sargsyan', email: 'armen.s@gmail.com', avatar: 'AS' },
    { name: 'Hayk Martirosyan', email: 'hayk.crypto@gmail.com', avatar: 'HM' },
    { name: 'Anush Davtyan', email: 'anush.d88@gmail.com', avatar: 'AD' }
  ];

  const handleGoogleSelect = (account: typeof mockGoogleAccounts[0]) => {
    setIsGoogleLoading(true);
    setTimeout(() => {
        loginWithGoogle(account.email, account.name.split(' ')[0]);
        setIsGoogleLoading(false);
        setShowGooglePopup(false);
    }, 1500);
  };

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
    <div className="min-h-screen bg-binance-dark flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decorative Circles */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-binance-yellow/5 rounded-full blur-[120px] -z-10"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px] -z-10"></div>

      <div className="w-full max-w-md bg-binance-black border border-binance-gray rounded-3xl p-8 shadow-2xl animate-fade-in z-10">
        
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
                    <label className="text-xs text-binance-subtext ml-1 uppercase font-bold tracking-wider">{t.email}</label>
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
                        <label className="text-xs text-binance-subtext uppercase font-bold tracking-wider">{t.password}</label>
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
                    <button 
                        type="button" 
                        onClick={() => setShowGooglePopup(true)}
                        className="flex items-center justify-center gap-2 py-3 border border-binance-gray rounded-xl hover:bg-binance-gray/30 transition-colors text-sm font-medium"
                    >
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
                    <label className="text-xs text-binance-subtext ml-1 uppercase font-bold tracking-wider">{t.username}</label>
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
                    <label className="text-xs text-binance-subtext ml-1 uppercase font-bold tracking-wider">{t.email}</label>
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
                    <label className="text-xs text-binance-subtext ml-1 uppercase font-bold tracking-wider">{t.password}</label>
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
                    <label className="text-xs text-binance-subtext ml-1 uppercase font-bold tracking-wider">{t.confirm_password}</label>
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

      {/* Google Sign-In Simulation Popup */}
      {showGooglePopup && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-sm rounded-lg shadow-2xl overflow-hidden animate-fade-in relative">
                {isGoogleLoading && (
                    <div className="absolute inset-0 bg-white/80 z-10 flex flex-col items-center justify-center">
                        <Loader2 className="animate-spin text-blue-600 mb-2" size={32} />
                        <span className="text-xs text-gray-600 font-medium">Signing in...</span>
                    </div>
                )}
                
                <div className="p-6 border-b flex justify-between items-center">
                    <img src="https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_92x30dp.png" alt="Google" className="h-6" />
                    <button onClick={() => setShowGooglePopup(false)} className="text-gray-400 hover:text-gray-600">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-8">
                    <h3 className="text-xl font-medium text-gray-900 text-center mb-1">Choose an account</h3>
                    <p className="text-sm text-gray-600 text-center mb-8">to continue to DramCoin</p>

                    <div className="space-y-2">
                        {mockGoogleAccounts.map((acc, i) => (
                            <button 
                                key={i}
                                onClick={() => handleGoogleSelect(acc)}
                                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition-colors border-b border-gray-100 last:border-0"
                            >
                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">
                                    {acc.avatar}
                                </div>
                                <div className="text-left">
                                    <div className="text-sm font-medium text-gray-900">{acc.name}</div>
                                    <div className="text-xs text-gray-500">{acc.email}</div>
                                </div>
                            </button>
                        ))}
                        <button className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition-colors mt-4">
                            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-bold text-xs">
                                <User size={16} />
                            </div>
                            <div className="text-sm font-medium text-gray-700">Use another account</div>
                        </button>
                    </div>

                    <div className="mt-8 text-[11px] text-gray-500 text-center">
                        To continue, Google will share your name, email address, language preference, and profile picture with DramCoin.
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default AuthView;
