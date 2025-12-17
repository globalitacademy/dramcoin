
import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { translations } from '../translations';
import { Mail, Lock, User, ShieldCheck, Eye, EyeOff, AlertCircle, CheckCircle, ArrowLeft, Smartphone, Globe, Loader2, Phone } from 'lucide-react';

type AuthStep = 'login' | 'register' | 'forgot' | 'verify' | 'phone';

const AuthView: React.FC = () => {
  const { language, login, register, loginWithGoogle, loginWithPhone, verifyOtp } = useStore();
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

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError('');
    setSuccess('');
    try {
      const result = await loginWithGoogle();
      if (result && !result.success) {
        setError(result.message || (language === 'AM' ? 'Google-ով մուտքը ձախողվեց:' : 'Google login failed.'));
      }
    } catch (err: any) {
      setError(err.message || 'OAuth Error');
    } finally {
      setIsLoading(false);
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
    if (!res.success) {
      setError(res.message || 'Invalid code');
    }
    setIsLoading(false);
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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');
    const result = await login(email, password);
    if (!result.success) {
        setError(language === 'AM' ? 'Մուտքի տվյալները սխալ են' : 'Invalid login credentials');
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
        setSuccess(language === 'AM' 
            ? 'Գրանցումը հաջողվեց։ Տեղափոխում ենք հաստատման էջ...' 
            : 'Registration successful! Redirecting to verification...');
    } else {
        setError(result.message || (language === 'AM' ? 'Գրանցումը ձախողվեց' : 'Registration failed'));
    }
    setIsLoading(false);
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
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-binance-yellow/5 rounded-full blur-[120px] -z-10"></div>
      
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
                {step === 'login' ? t.login_title : step === 'register' ? t.register_title : step === 'verify' ? t.verify_title : step === 'phone' ? (language === 'AM' ? 'Հեռախոսով մուտք' : 'Phone Login') : t.reset_title}
            </h2>
        </div>

        {error && (
            <div className="bg-red-900/20 border border-red-900/50 text-red-400 p-3 rounded-xl text-xs flex items-center gap-2 mb-6 animate-shake">
                <AlertCircle size={16} /> {error}
            </div>
        )}

        {success && (
            <div className="bg-binance-green/10 border border-binance-green/30 text-binance-green p-3 rounded-xl text-xs flex items-center gap-2 mb-6 animate-fade-in">
                <CheckCircle size={16} /> {success}
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

                <button 
                    disabled={isLoading}
                    className="w-full py-4 bg-binance-yellow text-black font-bold rounded-xl hover:shadow-xl transition-all active:scale-95 disabled:opacity-50 mt-4"
                >
                    {isLoading ? <Loader2 className="animate-spin mx-auto" /> : t.btn_login}
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
                        onClick={handleGoogleLogin}
                        disabled={isLoading}
                        className="flex items-center justify-center gap-2 py-3 border border-binance-gray rounded-xl hover:bg-binance-gray/30 transition-colors text-sm font-medium disabled:opacity-50"
                    >
                        {isLoading ? <Loader2 className="animate-spin" size={18} /> : <Globe size={18} className="text-blue-400" />} Google
                    </button>
                    <button 
                        type="button" 
                        onClick={() => setStep('phone')}
                        disabled={isLoading}
                        className="flex items-center justify-center gap-2 py-3 border border-binance-gray rounded-xl hover:bg-binance-gray/30 transition-colors text-sm font-medium disabled:opacity-50"
                    >
                        <Smartphone size={18} className="text-binance-yellow" /> Phone
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
                            type={showPass ? 'text' : 'password'} required
                            value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                            className="w-full bg-binance-dark border border-binance-gray rounded-xl py-3 pl-10 pr-4 text-white focus:border-binance-yellow focus:outline-none"
                        />
                    </div>
                </div>
                <button 
                    disabled={isLoading}
                    className="w-full py-4 bg-binance-yellow text-black font-bold rounded-xl hover:shadow-xl transition-all active:scale-95 disabled:opacity-50 mt-4"
                >
                    {isLoading ? <Loader2 className="animate-spin mx-auto" /> : t.btn_register}
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
                <p className="text-center text-binance-subtext text-sm">{t.verify_desc}</p>
                <form onSubmit={handleOtpVerify} className="space-y-4">
                    <input 
                        type="text" maxLength={6} required
                        placeholder="XXXXXX"
                        value={otpToken} onChange={e => setOtpToken(e.target.value)}
                        className="w-full bg-binance-dark border border-binance-gray rounded-xl py-4 text-center text-2xl font-bold text-binance-yellow focus:border-binance-yellow focus:outline-none"
                    />
                    <button 
                        disabled={isLoading}
                        className="w-full py-4 bg-binance-yellow text-black font-bold rounded-xl hover:shadow-xl transition-all active:scale-95"
                    >
                        {isLoading ? <Loader2 className="animate-spin mx-auto" /> : t.verify_btn}
                    </button>
                </form>
            </div>
        )}
      </div>
    </div>
  );
};

export default AuthView;
