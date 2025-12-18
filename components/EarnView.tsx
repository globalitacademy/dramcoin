
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { translations } from '../translations';
import { 
  Trophy, Coins, Zap, Sparkles, MousePointer2, 
  KeyRound, Check, Star, ShoppingBag, ArrowUpCircle, ListChecks, Users, Twitter, Send as SendIcon, Github, Calendar, Battery, Bot, LogIn
} from 'lucide-react';
import { LeaderboardEntry } from '../types';

const MORSE_MAP: Record<string, string> = {
  '.-': 'A', '-...': 'B', '-.-.': 'C', '-..': 'D', '.': 'E',
  '..-.': 'F', '--.': 'G', '....': 'H', '..': 'I', '.---': 'J',
  '-.-': 'K', '.-..': 'L', '--': 'M', '-.': 'N', '---': 'O',
  '.--.': 'P', '--.-': 'Q', '.-.': 'R', '...': 'S', '-': 'T',
  '..-': 'U', '...-': 'V', '.--': 'W', '-..-': 'X', '-.--': 'Y',
  '--..': 'Z', '.----': '1', '..---': '2', '...--': '3', '....-': '4',
  '.....': '5', '-....': '6', '--...': '7', '---..': '8', '----.': '9',
  '-----': '0'
};

const RANKS = [
  { name: 'Newbie', am: 'Նորեկ', min: 0, color: 'text-gray-400' },
  { name: 'Bronze', am: 'Բրոնզե', min: 1000, color: 'text-orange-400' },
  { name: 'Silver', am: 'Արծաթե', min: 10000, color: 'text-gray-300' },
  { name: 'Gold', am: 'Ոսկե', min: 50000, color: 'text-yellow-400' },
  { name: 'Diamond', am: 'Ադամանդե', min: 200000, color: 'text-cyan-400' },
];

interface TapObject {
  id: number;
  x: number;
  y: number;
  drift: number;
}

const EarnView: React.FC = () => {
  const { user, language, clickCoin, submitMorse, exchangeApricots, systemSettings, upgradeTap, upgradeEnergy, upgradeBot, completeTask, claimDailyReward, getLeaderboard } = useStore();
  const t = translations[language].earn;
  
  const [activeTab, setActiveTab] = useState<'tap' | 'tasks' | 'leaderboard'>('tap');
  const [clicks, setClicks] = useState<TapObject[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  
  const [isCipherMode, setIsCipherMode] = useState(false);
  const [revealedWord, setRevealedWord] = useState('');
  const [currentMorseSymbols, setCurrentMorseSymbols] = useState('');
  const [lastRecognizedLetter, setLastRecognizedLetter] = useState('');
  const [isError, setIsError] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0, scale: 1 });
  
  const pressStartTime = useRef<number>(0);
  const letterTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const targetWord = systemSettings.secretMorseCode.toUpperCase().trim();

  useEffect(() => {
    if (activeTab === 'leaderboard') {
      getLeaderboard().then(setLeaderboard);
    }
  }, [activeTab, getLeaderboard]);

  const currentRank = useMemo(() => {
    return [...RANKS].reverse().find(r => user.totalEarnedApricots >= r.min) || RANKS[0];
  }, [user.totalEarnedApricots]);

  const isAlreadyClaimedToday = useMemo(() => {
    if (!user.lastMorseClaimedAt) return false;
    return new Date(user.lastMorseClaimedAt).toDateString() === new Date().toDateString();
  }, [user.lastMorseClaimedAt]);

  const isCheckInClaimedToday = useMemo(() => {
    if (!user.lastCheckInAt) return false;
    return new Date(user.lastCheckInAt).toDateString() === new Date().toDateString();
  }, [user.lastCheckInAt]);

  const processLetter = (symbols: string) => {
    if (!symbols || isAlreadyClaimedToday) return;
    const recognizedLetter = MORSE_MAP[symbols];
    const expectedLetter = targetWord[revealedWord.length];

    if (recognizedLetter) {
      if (recognizedLetter === expectedLetter) {
        const newRevealed = revealedWord + recognizedLetter;
        setRevealedWord(newRevealed);
        setLastRecognizedLetter(recognizedLetter);
        setIsError(false);
        if (newRevealed === targetWord) {
          setTimeout(() => {
            submitMorse(targetWord);
            setIsCipherMode(false);
            setRevealedWord('');
          }, 800);
        }
      } else {
        setIsError(true);
        setLastRecognizedLetter('?');
        setTimeout(() => {
            setIsError(false);
            setRevealedWord('');
        }, 600);
      }
    } else {
      setIsError(true);
      setLastRecognizedLetter('?');
      setTimeout(() => setIsError(false), 500);
    }
    setCurrentMorseSymbols('');
    setTimeout(() => setLastRecognizedLetter(''), 1000);
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (user.energy < user.tapLevel) return;
    pressStartTime.current = Date.now();
    if (letterTimer.current) clearTimeout(letterTimer.current);
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    setTilt({ x: x / 8, y: -y / 8, scale: 0.95 });
    if (navigator.vibrate) navigator.vibrate(15);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (user.energy < user.tapLevel) {
        setTilt({ x: 0, y: 0, scale: 1 });
        return;
    }
    const duration = Date.now() - pressStartTime.current;
    setTilt({ x: 0, y: 0, scale: 1 });
    clickCoin();
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const drift = (Math.random() - 0.5) * 40;
    setClicks(prev => [...prev, { id: Date.now(), x, y, drift }]);
    if (isCipherMode && !isAlreadyClaimedToday) {
      const symbol = duration < 250 ? '.' : '-';
      const nextSymbols = currentMorseSymbols + symbol;
      setCurrentMorseSymbols(nextSymbols);
      if (letterTimer.current) clearTimeout(letterTimer.current);
      letterTimer.current = setTimeout(() => processLetter(nextSymbols), 850);
    }
    setTimeout(() => {
      setClicks(prev => prev.filter(c => c.id > Date.now() - 1000));
    }, 1000);
  };

  const tapUpgradeCost = Math.pow(user.tapLevel + 1, 2) * 2000;
  const energyUpgradeCost = (user.maxEnergy / 500) * 5000;
  const botUpgradeCost = (user.tapBotLevel + 1) * 25000;

  const tasks = [
    { id: 'follow_twitter', title: 'Հետևել X-ում', icon: <Twitter size={18} />, reward: 50000 },
    { id: 'join_tg', title: 'Միանալ Telegram ալիքին', icon: <SendIcon size={18} />, reward: 100000 },
    { id: 'github_star', title: 'Աստղ տալ GitHub-ում', icon: <Github size={18} />, reward: 75000 },
  ];

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8 animate-fade-in pt-24 min-h-screen select-none overflow-hidden font-sans">
      <div className="flex flex-col items-center mb-8">
        <div className={`flex items-center gap-2 mb-3 px-4 py-1.5 bg-binance-gray/30 rounded-full border border-binance-gray/50 ${currentRank.color} shadow-inner`}>
          <Star size={14} fill="currentColor" className="animate-pulse" />
          <span className="text-[13px] font-bold uppercase tracking-widest">
            {language === 'AM' ? currentRank.am : currentRank.name} {t.rank_label}
          </span>
        </div>
        <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 uppercase tracking-tight text-center drop-shadow-md">
          {t.title}
        </h1>
        <p className="text-binance-subtext text-center font-medium text-base max-w-lg">{t.subtitle}</p>
        <p className="text-binance-yellow text-center font-bold text-sm mt-2 uppercase tracking-widest bg-yellow-500/10 px-4 py-1 rounded-full border border-yellow-500/20">
            Օրվա նվերը: {systemSettings.morseReward.toLocaleString()} Ծիրան
        </p>
      </div>

      <div className="flex bg-binance-black/60 p-1.5 rounded-2xl mb-8 border border-binance-gray/40 w-full max-w-xl mx-auto backdrop-blur-sm gap-1">
        <button 
          onClick={() => setActiveTab('tap')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-3 px-1 rounded-xl text-[12px] md:text-sm font-bold transition-all duration-300 ${activeTab === 'tap' ? 'bg-binance-yellow text-black shadow-lg scale-[1.03]' : 'text-binance-subtext hover:text-white'}`}
        >
          <MousePointer2 size={14} className="shrink-0" /> <span className="truncate">{t.tab_tap}</span>
        </button>
        <button 
          onClick={() => setActiveTab('tasks')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-3 px-1 rounded-xl text-[12px] md:text-sm font-bold transition-all duration-300 ${activeTab === 'tasks' ? 'bg-binance-yellow text-black shadow-lg scale-[1.03]' : 'text-binance-subtext hover:text-white'}`}
        >
          <ListChecks size={14} className="shrink-0" /> <span className="truncate">{t.tab_tasks}</span>
        </button>
        <button 
          onClick={() => setActiveTab('leaderboard')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-3 px-1 rounded-xl text-[12px] md:text-sm font-bold transition-all duration-300 ${activeTab === 'leaderboard' ? 'bg-binance-yellow text-black shadow-lg scale-[1.03]' : 'text-binance-subtext hover:text-white'}`}
        >
          <Users size={14} className="shrink-0" /> <span className="truncate">{t.tab_leaderboard}</span>
        </button>
      </div>

      <div className="grid lg:grid-cols-2 gap-8 items-start">
        <div className={`bg-binance-black border ${isError ? 'border-binance-red shadow-[0_0_30px_rgba(246,70,93,0.3)]' : 'border-binance-gray'} rounded-[48px] p-6 md:p-8 flex flex-col items-center shadow-2xl relative overflow-hidden min-h-[550px] transition-all duration-300`}>
          <div className={`absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-transparent via-${isCipherMode ? 'binance-red' : isAlreadyClaimedToday ? 'binance-green' : 'binance-yellow'} to-transparent opacity-60 shadow-lg`}></div>
          
          {activeTab === 'tap' && (
            <div className="w-full flex flex-col items-center animate-fade-in">
              <div className="w-full flex justify-between items-center mb-10">
                <div className="flex items-center gap-3 bg-binance-gray/30 px-6 py-3 rounded-2xl border border-binance-gray/40 shadow-inner">
                  <Zap size={20} className="text-binance-yellow animate-pulse" fill="currentColor" />
                  <div>
                    <p className="text-[11px] text-binance-subtext uppercase font-bold tracking-widest">{t.apricots}</p>
                    <p className="text-2xl font-bold text-white font-mono">{user.apricots.toLocaleString()}</p>
                  </div>
                </div>

                <button 
                  onClick={() => !isAlreadyClaimedToday && setIsCipherMode(!isCipherMode)}
                  disabled={isAlreadyClaimedToday}
                  className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-[13px] transition-all duration-500 shadow-lg ${
                    isAlreadyClaimedToday
                      ? 'bg-binance-green/20 text-binance-green border border-binance-green/30'
                      : isCipherMode 
                        ? 'bg-binance-red text-white shadow-[0_0_25px_rgba(246,70,93,0.6)] scale-110' 
                        : 'bg-binance-gray/50 text-binance-subtext hover:text-white border border-binance-gray/50 hover:scale-105'
                  }`}
                >
                  {isAlreadyClaimedToday ? <Check size={18} /> : <KeyRound size={18} />}
                  {isAlreadyClaimedToday ? t.claimed : isCipherMode ? t.cipher_mode_on : t.cipher_mode_off}
                </button>
              </div>

              {(isCipherMode || revealedWord.length > 0 || isAlreadyClaimedToday) && (
                <div className={`mb-10 flex flex-col items-center transition-all ${isError ? 'animate-shake-heavy' : ''}`}>
                   <div className="flex gap-2.5 mb-4 h-16 items-center">
                      {targetWord.split('').map((char, i) => (
                        <span 
                          key={i} 
                          className={`w-11 h-14 flex items-center justify-center text-4xl font-bold border-b-[5px] transition-all duration-500 ${
                            isAlreadyClaimedToday || revealedWord.length > i 
                              ? (isAlreadyClaimedToday ? 'text-binance-green border-binance-green' : isCipherMode ? 'text-binance-red border-binance-red' : 'text-binance-yellow border-binance-yellow') + ' scale-115 drop-shadow-[0_0_10px_currentColor]' 
                              : 'text-binance-gray border-binance-gray/20'
                          }`}
                        >
                          {isAlreadyClaimedToday ? targetWord[i] : (revealedWord[i] || '')}
                        </span>
                      ))}
                   </div>
                   {isCipherMode && !isAlreadyClaimedToday && (
                     <div className="h-10 flex flex-col items-center gap-3">
                        <div className="flex gap-3 min-h-[14px]">
                          {currentMorseSymbols.split('').map((s, i) => (
                            <div key={i} className={`rounded-full bg-binance-red shadow-[0_0_15px_rgba(246,70,93,1)] animate-pop-in ${s === '.' ? 'w-3.5 h-3.5' : 'w-10 h-3.5'}`}></div>
                          ))}
                        </div>
                        {lastRecognizedLetter && (
                            <span className={`text-[15px] font-bold uppercase animate-bounce ${isError ? 'text-binance-red' : 'text-binance-green'}`}>
                                {isError ? 'ՍԽԱԼ' : `Տառ: ${lastRecognizedLetter}`}
                            </span>
                        )}
                     </div>
                   )}
                </div>
              )}

              <div 
                className={`relative cursor-pointer select-none transition-all touch-none duration-150`} 
                style={{ 
                    transform: `perspective(1000px) rotateX(${tilt.y}deg) rotateY(${tilt.x}deg) scale(${tilt.scale})`,
                    WebkitUserSelect: 'none'
                }}
                onPointerDown={handlePointerDown} 
                onPointerUp={handlePointerUp}
              >
                <div className={`w-72 h-72 md:w-80 md:h-80 relative group`}>
                    <div className={`absolute -inset-4 rounded-full blur-2xl opacity-20 group-active:opacity-40 transition-opacity bg-${isCipherMode ? 'binance-red' : isAlreadyClaimedToday ? 'binance-green' : 'binance-yellow'}`}></div>
                    <svg viewBox="0 0 200 200" className={`w-full h-full drop-shadow-[0_20px_60px_rgba(0,0,0,0.6)]`}>
                        <defs>
                          <linearGradient id="coinGradMain" x1="0%" x2="100%" y1="0%" y2="100%">
                              {isAlreadyClaimedToday ? (<><stop offset="0%" stopColor="#a7f3d0" /><stop offset="50%" stopColor="#0ecb81" /><stop offset="100%" stopColor="#065f46" /></>) : 
                              isCipherMode ? (<><stop offset="0%" stopColor="#ffb2b2" /><stop offset="50%" stopColor="#f6465d" /><stop offset="100%" stopColor="#910d1b" /></>) : 
                              (<><stop offset="0%" stopColor="#ffee95" /><stop offset="50%" stopColor="#fcd535" /><stop offset="100%" stopColor="#b8860b" /></>)}
                          </linearGradient>
                          <radialGradient id="tapGlow"><stop offset="0%" stopColor={isAlreadyClaimedToday ? '#0ecb81' : isCipherMode ? '#f6465d' : '#fcd535'} stopOpacity="0.5" /><stop offset="100%" stopColor="transparent" stopOpacity="0" /></radialGradient>
                        </defs>
                        <circle cx="100" cy="100" r="98" fill="url(#tapGlow)" className={isCipherMode ? "animate-pulse" : ""} />
                        <circle cx="100" cy="100" r="95" fill={isAlreadyClaimedToday ? "#064e3b" : isCipherMode ? "#40060d" : "#2b2100"} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                        <circle cx="100" cy="100" r="90" fill="url(#coinGradMain)" />
                        <text x="50%" y="54%" textAnchor="middle" dominantBaseline="middle" fontSize="110" fontWeight="bold" fill={isAlreadyClaimedToday ? "#065f46" : isCipherMode ? "#910d1b" : "#7a5c10"} opacity="0.8" transform="translate(2, 2)">֏</text>
                        <text x="50%" y="54%" textAnchor="middle" dominantBaseline="middle" fontSize="110" fontWeight="bold" fill="white" fillOpacity="0.2" transform="translate(-1, -1)">֏</text>
                    </svg>
                    {clicks.map(click => (
                        <div 
                            key={click.id} 
                            className={`absolute text-5xl font-bold ${isAlreadyClaimedToday ? 'text-binance-green' : isCipherMode ? 'text-binance-red' : 'text-binance-yellow'} pointer-events-none animate-hamster-tap-pro`} 
                            style={{ 
                                left: click.x, 
                                top: click.y,
                                '--drift': `${click.drift}px`,
                                textShadow: '0 8px 20px rgba(0,0,0,0.4), 0 0 10px currentColor'
                            } as any}
                        >
                            +{user.tapLevel}
                        </div>
                    ))}
                </div>
              </div>

              <div className="w-full mt-10 flex flex-col gap-3">
                 <div className="flex justify-between items-center text-[13px] px-2">
                    <span className="flex items-center gap-1.5 font-bold text-white uppercase tracking-tighter">
                      <Battery size={18} className={`text-binance-yellow ${user.energy < 50 ? 'animate-pulse' : ''}`} /> ԷՆԵՐԳԻԱ
                    </span>
                    <span className="font-mono text-binance-subtext font-bold">{Math.floor(user.energy)} <span className="opacity-40">/</span> {user.maxEnergy}</span>
                 </div>
                 <div className="w-full h-5 bg-binance-gray/40 rounded-full overflow-hidden border border-binance-gray/50 p-1 shadow-inner">
                    <div 
                      className="h-full bg-gradient-to-r from-binance-yellow via-yellow-400 to-yellow-600 rounded-full transition-all duration-500 relative overflow-hidden" 
                      style={{ width: `${(user.energy / user.maxEnergy) * 100}%` }}
                    >
                      <div className="absolute inset-0 bg-white/20 animate-shine"></div>
                    </div>
                 </div>
              </div>

              {user.isLoggedIn ? (
                <button onClick={exchangeApricots} className="mt-10 w-full bg-binance-yellow text-black font-bold py-5 rounded-[22px] flex items-center justify-center gap-3 hover:shadow-[0_0_30px_rgba(252,213,53,0.4)] transition-all active:scale-95 group text-[19px]">
                  <Coins size={24} className="group-hover:rotate-12 transition-transform" /> {t.exchange_btn}
                </button>
              ) : (
                <button onClick={() => {}} className="mt-10 w-full bg-binance-gray text-binance-subtext font-bold py-5 rounded-[22px] flex items-center justify-center gap-3 border border-binance-gray/50 opacity-80 cursor-not-allowed text-[16px]">
                  <LogIn size={20} /> {t.login_msg}
                </button>
              )}
            </div>
          )}

          {activeTab === 'tasks' && (
            <div className="w-full flex flex-col gap-5 animate-fade-in">
               <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                 <Sparkles className="text-binance-yellow" size={26} /> {t.tab_tasks}
               </h3>
               {tasks.map((task) => (
                 <div key={task.id} className="bg-binance-gray/20 border border-binance-gray/40 p-5 rounded-3xl flex justify-between items-center group transition-all hover:border-binance-yellow/60 hover:bg-binance-gray/30">
                   <div className="flex items-center gap-5">
                     <div className="w-16 h-16 bg-binance-gray/50 rounded-2xl flex items-center justify-center text-binance-yellow shadow-inner">
                       {task.icon}
                     </div>
                     <div>
                       <p className="font-bold text-white text-[17px]">{task.title}</p>
                       <p className="text-xs text-binance-yellow font-bold uppercase tracking-widest mt-1">+{task.reward.toLocaleString()} {t.apricots}</p>
                     </div>
                   </div>
                   <button 
                    onClick={() => completeTask(task.id, task.reward)}
                    disabled={user.completedTasks.includes(task.id)}
                    className={`px-7 py-3 rounded-2xl text-sm font-bold transition-all ${user.completedTasks.includes(task.id) ? 'bg-binance-green/20 text-binance-green' : 'bg-binance-yellow text-black hover:scale-110 active:scale-95 shadow-md'}`}
                   >
                     {user.completedTasks.includes(task.id) ? <Check size={22} /> : t.claim}
                   </button>
                 </div>
               ))}
            </div>
          )}

          {activeTab === 'leaderboard' && (
            <div className="w-full flex flex-col gap-5 animate-fade-in overflow-hidden">
               <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                 <Trophy className="text-binance-yellow" size={26} /> {t.leaderboard_top}
               </h3>
               <div className="space-y-3 overflow-y-auto pr-1 max-h-[400px] scrollbar-hide">
                 {leaderboard.map((entry) => (
                   <div key={entry.rank} className={`flex items-center justify-between p-5 rounded-3xl border transition-all ${entry.username === user.username ? 'bg-binance-yellow/10 border-binance-yellow scale-[1.02] shadow-lg' : 'bg-binance-gray/10 border-binance-gray/30'}`}>
                     <div className="flex items-center gap-5">
                        <span className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-lg shadow-sm ${entry.rank === 1 ? 'bg-yellow-400 text-black' : entry.rank === 2 ? 'bg-gray-300 text-black' : entry.rank === 3 ? 'bg-orange-400 text-black' : 'bg-binance-gray text-white'}`}>
                          {entry.rank}
                        </span>
                        <span className="font-bold text-white text-[17px] truncate max-w-[140px]">{entry.username}</span>
                     </div>
                     <div className="flex flex-col items-end">
                        <span className="text-[17px] font-bold text-binance-yellow font-mono">{entry.apricots.toLocaleString()}</span>
                        <span className="text-[11px] text-binance-subtext uppercase font-bold tracking-tighter">{t.apricots}</span>
                     </div>
                   </div>
                 ))}
               </div>
            </div>
          )}
        </div>

        <div className="space-y-8">
          <div className="bg-binance-black border border-binance-gray/40 rounded-[40px] p-8 shadow-xl backdrop-blur-md">
             <h3 className="text-[21px] font-bold text-white mb-8 flex items-center gap-3 uppercase tracking-tight">
               <Calendar size={24} className="text-binance-yellow" /> {t.daily_checkin}
             </h3>
             <div className="grid grid-cols-4 gap-3 mb-6">
                {[1, 2, 3, 4, 5, 6, 7].map(day => (
                  <div 
                    key={day} 
                    className={`h-22 rounded-2xl flex flex-col items-center justify-center border-2 transition-all duration-300 ${
                      user.checkInStreak >= day 
                        ? 'bg-binance-green/10 border-binance-green/40 text-binance-green shadow-sm' 
                        : 'bg-binance-gray/20 border-binance-gray/30 text-binance-subtext opacity-50'
                    }`}
                  >
                    <span className="text-[11px] font-bold uppercase tracking-tighter">{language === 'AM' ? 'ՕՐ' : 'DAY'} {day}</span>
                    <Sparkles size={18} className="my-2" />
                    <span className="text-sm font-bold">{day * 5}k</span>
                  </div>
                ))}
                <div className="h-22 bg-binance-yellow/10 border-2 border-binance-yellow/40 rounded-2xl flex items-center justify-center text-binance-yellow animate-pulse-soft">
                  <Star size={26} />
                </div>
             </div>
             <button 
              onClick={claimDailyReward}
              disabled={isCheckInClaimedToday}
              className={`w-full py-5 rounded-[22px] font-bold text-[17px] transition-all shadow-xl active:scale-95 ${isCheckInClaimedToday ? 'bg-binance-green/20 text-binance-green cursor-not-allowed opacity-60' : 'bg-binance-yellow text-black hover:shadow-yellow-500/30'}`}
             >
               {isCheckInClaimedToday ? t.claimed : t.claim}
             </button>
          </div>

          <div className="bg-binance-black border border-binance-gray/40 rounded-[40px] p-8 shadow-xl">
            <h3 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
               <ShoppingBag size={26} className="text-binance-yellow" /> {t.boosters_title}
            </h3>
            
            <div className="space-y-6">
                {[
                  { id: 'tap', icon: <ArrowUpCircle size={30} />, color: 'yellow', title: t.multitap_title, level: user.tapLevel, desc: `+${user.tapLevel} per tap`, cost: tapUpgradeCost, action: upgradeTap },
                  { id: 'energy', icon: <Battery size={30} />, color: 'blue', title: t.energy_limit_title, level: user.maxEnergy, desc: `Max: ${user.maxEnergy}`, cost: energyUpgradeCost, action: upgradeEnergy },
                  { id: 'bot', icon: <Bot size={30} />, color: 'green', title: t.tapbot_title, level: user.tapBotLevel, desc: `${user.tapBotLevel * 10}/sec offline`, cost: botUpgradeCost, action: upgradeBot },
                ].map(item => (
                  <div key={item.id} className="p-6 bg-binance-gray/20 border border-binance-gray/40 rounded-3xl hover:border-binance-yellow/50 transition-all group shadow-sm">
                    <div className="flex items-center gap-5 mb-5">
                        <div className={`w-16 h-16 bg-${item.color === 'yellow' ? 'binance-yellow' : item.color === 'blue' ? 'blue-500' : 'binance-green'}/10 rounded-2xl flex items-center justify-center text-${item.color === 'yellow' ? 'binance-yellow' : item.color === 'blue' ? 'blue-400' : 'binance-green'} shadow-inner`}>
                            {item.icon}
                        </div>
                        <div className="flex-1">
                            <p className="text-[17px] font-bold text-white uppercase tracking-tight">{item.title}</p>
                            <p className="text-[13px] text-binance-subtext font-bold">{t.rank_label} {item.level} &bull; {item.desc}</p>
                        </div>
                    </div>
                    <button 
                        onClick={item.action}
                        className={`w-full py-3.5 ${item.id === 'energy' ? 'bg-white' : item.id === 'bot' ? 'bg-binance-green' : 'bg-binance-yellow'} text-black text-[15px] font-bold rounded-[20px] hover:scale-[1.03] active:scale-95 transition-all flex justify-between px-7 items-center shadow-lg`}
                    >
                        <span>{t.upgrade_btn}</span>
                        <span className="flex items-center gap-1.5 font-mono font-bold">{item.cost.toLocaleString()} <Coins size={16} /></span>
                    </button>
                  </div>
                ))}
            </div>

            <div className="mt-10 space-y-4">
               <div className="flex items-center justify-between text-[13px]">
                  <span className="text-binance-subtext uppercase font-bold tracking-widest">{language === 'AM' ? 'առաջընթաց' : 'Progress'}</span>
                  <span className="text-white font-bold">{language === 'AM' ? (RANKS.find(r => r.min > user.totalEarnedApricots)?.am || 'Ադամանդե') : (RANKS.find(r => r.min > user.totalEarnedApricots)?.name || 'Diamond')}</span>
               </div>
               <div className="h-4 w-full bg-binance-gray/40 rounded-full overflow-hidden p-0.5 border border-binance-gray/50">
                  <div 
                    className="h-full bg-gradient-to-r from-binance-yellow to-yellow-600 rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(252,213,53,0.5)]" 
                    style={{ width: `${Math.min(100, (user.totalEarnedApricots / (RANKS.find(r => r.min > user.totalEarnedApricots)?.min || user.totalEarnedApricots || 1)) * 100)}%` }}
                  ></div>
               </div>
               <p className="text-[11px] text-binance-subtext text-center italic font-bold tracking-widest uppercase">{t.lifetime_earned}: {user.totalEarnedApricots.toLocaleString()} {t.apricots}</p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes hamster-tap-pro {
          0% { opacity: 0; transform: translateY(0) scale(0.5) rotate(0deg); }
          15% { opacity: 1; transform: translateY(-30px) scale(1.2) rotate(calc(var(--drift) / 5)); }
          100% { opacity: 0; transform: translateY(-150px) translateX(var(--drift)) scale(0.8) rotate(calc(var(--drift) / 2)); }
        }
        @keyframes shake-heavy {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-10px); }
          20%, 40%, 60%, 80% { transform: translateX(10px); }
        }
        @keyframes shine {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes pop-in {
          0% { transform: scale(0); opacity: 0; }
          70% { transform: scale(1.2); }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-hamster-tap-pro {
          animation: hamster-tap-pro 0.9s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
        .animate-shake-heavy {
          animation: shake-heavy 0.5s cubic-bezier(.36,.07,.19,.97) both;
        }
        .animate-shine {
          animation: shine 2s infinite linear;
        }
        .animate-pop-in {
          animation: pop-in 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default EarnView;
