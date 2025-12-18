
import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { translations } from '../translations';
import { Mail, Lock, User, ShieldCheck, Eye, EyeOff, AlertCircle, CheckCircle, ArrowLeft, Smartphone, Globe, Loader2, Phone } from 'lucide-react';
import { ViewState } from '../types';

type AuthStep = 'login' | 'register' | 'forgot' | 'verify' | 'phone';

const AuthView: React.FC = () => {
  const { language, login, register, loginWithGoogle, loginWithPhone, verifyOtp, setView } = useStore();
  const t = translations[language].auth;
  
  const [step, setStep] = useState<AuthStep>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpToken, setOtpToken] = useState('');
  
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    setError('');
    setSuccess('');
    try {
      const result = await loginWithGoogle();
      if (result && !result.success) {
        setError(result.message || (language === 'AM' ? 'Google-ով մուտքը ձախողվեց:' : 'Google login failed.'));
        setIsGoogleLoading(false);
      }
      // Note: If success, browser will redirect, so no need to set loading to false here
    } catch (err: any) {
      setError(err.message || 'OAuth Error');
      setIsGoogleLoading(false);
    }
  };

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');
    const res = await loginWithPhone(phoneNumber);
    if (res.success) {
      setStep('verify');
    } else {
      setError(res.message || 'Phone auth failed');
    }
    setIsLoading(false);
  };

  const handleOtpVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    const res = await verifyOtp(phoneNumber, otpToken);
    if (res.success) {
      setView(ViewState.HOME);
    } else {
      setError(res.message || 'Invalid code');
    }
    setIsLoading(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');
    const result = await login(email, password);
    if (result.success) {
        setView(ViewState.HOME);
    } else {
        const msg = result.message || '';
        if (msg.includes('Email not confirmed')) {
          setError(language === 'AM' ? 'Էլ. հասցեն հաստատված չէ։ Ստուգեք Ձեր էլ. փոստը:' : 'Email not confirmed. Please check your inbox.');
        } else {
          setError(msg || (language === 'AM' ? 'Մուտքի տվյալները սխալ են' : 'Invalid login credentials'));
        }
    }
    setIsLoading(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (password !== confirmPassword) {
        setError(language === 'AM' ? 'Գաղտնաբառերը չեն համընկնում' : 'Passwords do not match');
        return;
    }
    setIsLoading(true);
    const result = await register(username, email, password);
    if (result.success) {
        setSuccess(result.message || (language === 'AM' 
            ? 'Գրանցումը հաջողվեց։ Խնդրում ենք հաստատել Ձեր էլ. փոստը:' 
            : 'Registration successful! Please verify your email.'));
    } else {
        setError(result.message || (language === 'AM' ? 'Գրանցումը ձախողվեց' : 'Registration failed'));
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-binance-dark flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-binance-yellow/5 rounded-full blur-[120px] -z-10"></div>
      
      <div className="w-full max-w-md bg-binance-black border border-binance-gray rounded-[2.5rem] p-8 md:p-10 shadow-2xl animate-fade-in z-10">
        
        {(step !== 'login' || success) && (
            <button onClick={() => { setStep('login'); setSuccess(''); setError(''); }} className="mb-6 text-binance-subtext hover:text-white flex items-center gap-1 text-sm transition-colors font-bold">
                <ArrowLeft size={16} /> {language === 'AM' ? 'Հետ' : 'Back'}
            </button>
        )}

        <div className="text-center mb-8">
            <div className="w-20 h-20 bg-binance-yellow/10 rounded-3xl flex items-center justify-center text-binance-yellow mx-auto mb-4 border border-binance-yellow/20 shadow-xl">
                <ShieldCheck size={40} />
            </div>
            <h2 className="text-3xl font-black text-white tracking-tight">
                {step === 'login' ? t.login_title : step === 'register' ? t.register_title : step === 'verify' ? t.verify_title : step === 'phone' ? (language === 'AM' ? 'Հեռախոսով' : 'Phone') : t.reset_title}
            </h2>
        </div>

        {error && (
            <div className="bg-red-900/20 border border-red-900/50 text-red-400 p-4 rounded-2xl text-xs flex items-center gap-3 mb-6 animate-shake">
                <AlertCircle size={20} /> {error}
            </div>
        )}

        {success && (
            <div className="bg-binance-green/10 border border-binance-green/30 text-binance-green p-6 rounded-3xl text-sm flex flex-col items-center gap-4 mb-6 animate-fade-in text-center">
                <CheckCircle size={32} />
                <p className="font-bold text-lg">{success}</p>
                <button onClick={() => { setSuccess(''); setStep('login'); }} className="mt-2 text-sm underline font-bold hover:text-white transition-colors">
                    {language === 'AM' ? 'Մուտք' : 'Go to Login'}
                </button>
            </div>
        )}

        {!success && step === 'login' && (
            <div className="space-y-6">
                <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-[10px] text-binance-subtext ml-1 uppercase font-black tracking-widest">{t.email}</label>
                        <div className="relative group">
                            <Mail className="absolute left-4 top-3.5 text-binance-subtext group-focus-within:text-binance-yellow transition-colors" size={18} />
                            <input 
                                type="email" required
                                value={email} onChange={e => setEmail(e.target.value)}
                                className="w-full bg-[#1e2026] border border-binance-gray rounded-2xl py-3.5 pl-11 pr-4 text-white focus:border-binance-yellow focus:outline-none transition-all shadow-inner"
                                placeholder="example@mail.com"
                            />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <div className="flex justify-between items-center px-1">
                            <label className="text-[10px] text-binance-subtext uppercase font-black tracking-widest">{t.password}</label>
                            <button type="button" onClick={() => setStep('forgot')} className="text-[10px] text-binance-yellow font-black uppercase tracking-widest hover:underline">{t.forgot_password}</button>
                        </div>
                        <div className="relative group">
                            <Lock className="absolute left-4 top-3.5 text-binance-subtext group-focus-within:text-binance-yellow transition-colors" size={18} />
                            <input 
                                type={showPass ? 'text' : 'password'} required
                                value={password} onChange={e => setPassword(e.target.value)}
                                className="w-full bg-[#1e2026] border border-binance-gray rounded-2xl py-3.5 pl-11 pr-12 text-white focus:border-binance-yellow focus:outline-none transition-all shadow-inner"
                            />
                            <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-3.5 text-binance-subtext hover:text-white">
                                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <button 
                        type="submit"
                        disabled={isLoading || isGoogleLoading}
                        className="w-full py-4.5 bg-binance-yellow text-black font-black uppercase tracking-widest rounded-2xl hover:shadow-[0_0_20px_rgba(252,213,53,0.3)] transition-all active:scale-95 disabled:opacity-50 mt-4 flex items-center justify-center"
                    >
                        {isLoading ? <Loader2 className="animate-spin" size={24} /> : t.btn_login}
                    </button>
                </form>

                <div className="text-center">
                    <p className="text-sm text-binance-subtext font-medium">
                        {t.no_account} <button type="button" onClick={() => { setStep('register'); setError(''); }} className="text-binance-yellow font-black hover:underline">{t.btn_register}</button>
                    </p>
                </div>

                <div className="relative py-2">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-binance-gray/50"></div></div>
                    <div className="relative flex justify-center text-[10px] font-black uppercase tracking-widest"><span className="bg-binance-black px-3 text-binance-subtext">{t.social_login}</span></div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <button 
                        type="button" 
                        onClick={handleGoogleLogin}
                        disabled={isLoading || isGoogleLoading}
                        className="flex items-center justify-center gap-3 py-4 bg-[#1e2026] border border-binance-gray rounded-2xl hover:border-binance-yellow transition-all text-sm font-black uppercase tracking-widest group shadow-lg disabled:opacity-50"
                    >
                        {isGoogleLoading ? <Loader2 className="animate-spin text-binance-yellow" size={18} /> : <Globe size={20} className="text-blue-400 group-hover:scale-110 transition-transform" />} Google
                    </button>
                    <button 
                        type="button" 
                        onClick={() => { setStep('phone'); setError(''); }}
                        disabled={isLoading || isGoogleLoading}
                        className="flex items-center justify-center gap-3 py-4 bg-[#1e2026] border border-binance-gray rounded-2xl hover:border-binance-yellow transition-all text-sm font-black uppercase tracking-widest group shadow-lg disabled:opacity-50"
                    >
                        <Smartphone size={20} className="text-binance-yellow group-hover:scale-110 transition-transform" /> Phone
                    </button>
                </div>
            </div>
        )}

        {!success && step === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-1">
                    <label className="text-[10px] text-binance-subtext ml-1 uppercase font-black tracking-widest">{t.username}</label>
                    <div className="relative group">
                        <User className="absolute left-4 top-3.5 text-binance-subtext group-focus-within:text-binance-yellow transition-colors" size={18} />
                        <input 
                            type="text" required
                            value={username} onChange={e => setUsername(e.target.value)}
                            className="w-full bg-[#1e2026] border border-binance-gray rounded-2xl py-3.5 pl-11 pr-4 text-white focus:border-binance-yellow focus:outline-none transition-all"
                            placeholder="Username"
                        />
                    </div>
                </div>
                <div className="space-y-1">
                    <label className="text-[10px] text-binance-subtext ml-1 uppercase font-black tracking-widest">{t.email}</label>
                    <div className="relative group">
                        <Mail className="absolute left-4 top-3.5 text-binance-subtext group-focus-within:text-binance-yellow transition-colors" size={18} />
                        <input 
                            type="email" required
                            value={email} onChange={e => setEmail(e.target.value)}
                            className="w-full bg-[#1e2026] border border-binance-gray rounded-2xl py-3.5 pl-11 pr-4 text-white focus:border-binance-yellow focus:outline-none transition-all"
                            placeholder="Email"
                        />
                    </div>
                </div>
                <div className="space-y-1">
                    <label className="text-[10px] text-binance-subtext ml-1 uppercase font-black tracking-widest">{t.password}</label>
                    <div className="relative group">
                        <Lock className="absolute left-4 top-3.5 text-binance-subtext group-focus-within:text-binance-yellow transition-colors" size={18} />
                        <input 
                            type={showPass ? 'text' : 'password'} required
                            value={password} onChange={e => setPassword(e.target.value)}
                            className="w-full bg-[#1e2026] border border-binance-gray rounded-2xl py-3.5 pl-11 pr-4 text-white focus:border-binance-yellow focus:outline-none transition-all"
                            placeholder="••••••••"
                        />
                    </div>
                </div>
                <div className="space-y-1">
                    <label className="text-[10px] text-binance-subtext ml-1 uppercase font-black tracking-widest">{t.confirm_password}</label>
                    <div className="relative group">
                        <Lock className="absolute left-4 top-3.5 text-binance-subtext group-focus-within:text-binance-yellow transition-colors" size={18} />
                        <input 
                            type={showPass ? 'text' : 'password'} required
                            value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                            className="w-full bg-[#1e2026] border border-binance-gray rounded-2xl py-3.5 pl-11 pr-4 text-white focus:border-binance-yellow focus:outline-none transition-all"
                            placeholder="••••••••"
                        />
                    </div>
                </div>
                <button 
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-4.5 bg-binance-yellow text-black font-black uppercase tracking-widest rounded-2xl hover:shadow-xl transition-all active:scale-95 disabled:opacity-50 mt-4 flex items-center justify-center"
                >
                    {isLoading ? <Loader2 className="animate-spin" size={24} /> : t.btn_register}
                </button>
                <div className="text-center pt-4">
                    <p className="text-sm text-binance-subtext font-medium">
                        {t.have_account} <button type="button" onClick={() => { setStep('login'); setError(''); }} className="text-binance-yellow font-black hover:underline">{t.btn_login}</button>
                    </p>
                </div>
            </form>
        )}

        {/* Other steps handled similarly */}
        {!success && step === 'phone' && (
            <form onSubmit={handlePhoneSubmit} className="space-y-6 animate-fade-in">
                <p className="text-center text-binance-subtext text-sm font-medium">Մուտքագրեք հեռախոսահամարը՝ մուտքի կոդ ստանալու համար։</p>
                <div className="relative group">
                    <Phone className="absolute left-4 top-3.5 text-binance-subtext group-focus-within:text-binance-yellow transition-colors" size={18} />
                    <input 
                        type="tel" required
                        value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)}
                        placeholder="+374XXXXXXXX"
                        className="w-full bg-[#1e2026] border border-binance-gray rounded-2xl py-3.5 pl-11 pr-4 text-white focus:border-binance-yellow focus:outline-none transition-all"
                    />
                </div>
                <button 
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-4.5 bg-binance-yellow text-black font-black uppercase tracking-widest rounded-2xl hover:shadow-xl transition-all active:scale-95 flex items-center justify-center"
                >
                    {isLoading ? <Loader2 className="animate-spin" size={24} /> : 'Ուղարկել կոդը'}
                </button>
            </form>
        )}

        {!success && step === 'verify' && (
            <div className="space-y-6 animate-fade-in">
                <p className="text-center text-binance-subtext text-sm font-medium">{t.verify_desc}</p>
                <form onSubmit={handleOtpVerify} className="space-y-6">
                    <input 
                        type="text" maxLength={6} required
                        placeholder="XXXXXX"
                        value={otpToken} onChange={e => setOtpToken(e.target.value)}
                        className="w-full bg-[#1e2026] border border-binance-gray rounded-2xl py-6 text-center text-4xl font-black text-binance-yellow tracking-[0.3em] focus:border-binance-yellow focus:outline-none shadow-inner"
                    />
                    <button 
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-4.5 bg-binance-yellow text-black font-black uppercase tracking-widest rounded-2xl hover:shadow-xl transition-all active:scale-95 flex items-center justify-center"
                    >
                        {isLoading ? <Loader2 className="animate-spin" size={24} /> : t.verify_btn}
                    </button>
                </form>
            </div>
        )}
      </div>
      <style>{`
        .py-4.5 { padding-top: 1.125rem; padding-bottom: 1.125rem; }
      `}</style>
    </div>
  );
};

export default AuthView;
