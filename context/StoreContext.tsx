
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { User, CoinData, Language, Transaction, ViewState, SystemSettings, Asset, Toast, LeaderboardEntry } from '../types';
import { supabase } from '../supabase';
import { translations } from '../translations';

interface StoreContextType {
  user: User;
  marketData: CoinData[];
  systemSettings: SystemSettings;
  isAdminAuthenticated: boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; message?: string }>;
  register: (username: string, email: string, pass: string) => Promise<{ success: boolean; message?: string }>;
  loginWithGoogle: () => Promise<{ success: boolean; message?: string }>;
  loginWithPhone: (phone: string) => Promise<{ success: boolean; message?: string }>;
  verifyOtp: (phone: string, token: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  adminLogin: (email: string, pass: string) => Promise<{ success: boolean; message?: string }>;
  adminLogout: () => void;
  executeTrade: (type: 'buy' | 'sell', symbol: string, amount: number, price: number) => Promise<{ success: boolean; message: string }>;
  clickCoin: () => void;
  submitMorse: (code: string) => Promise<{ success: boolean; message?: string }>;
  exchangeApricots: () => Promise<{ success: boolean; message?: string }>;
  upgradeTap: () => Promise<{ success: boolean; message?: string }>;
  upgradeEnergy: () => Promise<{ success: boolean; message?: string }>;
  upgradeBot: () => Promise<{ success: boolean; message?: string }>;
  claimDailyReward: () => Promise<{ success: boolean; message?: string }>;
  completeTask: (taskId: string, reward: number) => Promise<{ success: boolean; message?: string }>;
  getLeaderboard: () => Promise<LeaderboardEntry[]>;
  currentPrice: number;
  language: Language;
  setLanguage: (lang: Language) => void;
  selectedSymbol: string;
  setSelectedSymbol: (symbol: string) => void;
  currentView: ViewState;
  setView: (view: ViewState) => void;
  isLoading: boolean;
  toasts: Toast[];
  addToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  updateSettings: (settings: Partial<SystemSettings>) => Promise<void>;
  manipulatePrice: (symbol: string, percentage: number) => Promise<void>;
  setDirectPrice: (symbol: string, price: number) => Promise<void>;
  submitKyc: () => Promise<void>;
  deposit: (symbol: string, amount: number) => Promise<void>;
  transfer: (symbol: string, amount: number) => Promise<{ success: boolean; message?: string }>;
  adminVerifyKyc: (userId: string, status: 'verified' | 'unverified') => Promise<void>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const ADMIN_EMAIL = 'gitedu@bk.ru';

const INITIAL_USER: User = {
  username: 'Guest',
  email: '',
  isLoggedIn: false,
  role: 'user',
  kycStatus: 'unverified',
  twoFactorEnabled: false,
  assets: [{ symbol: 'USDT', amount: 0, valueUsd: 0 }, { symbol: 'BTC', amount: 0, valueUsd: 0 }, { symbol: 'DMC', amount: 0, valueUsd: 0 }],
  transactions: [],
  apricots: 0,
  totalEarnedApricots: 0,
  tapLevel: 1,
  energy: 1000,
  maxEnergy: 1000,
  tapBotLevel: 0,
  lastMorseClaimedAt: null,
  completedTasks: [],
  lastCheckInAt: null,
  checkInStreak: 0,
  lastEnergyUpdateAt: new Date().toISOString()
};

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('AM');
  const [selectedSymbol, setSelectedSymbol] = useState<string>('DMC');
  const [currentView, setView] = useState<ViewState>(ViewState.HOME);
  const [marketData, setMarketData] = useState<CoinData[]>([]);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [user, setUser] = useState<User>(INITIAL_USER);
  const [systemSettings, setSystemSettings] = useState<SystemSettings>({
    usdToAmdRate: 395,
    isAiEnabled: true,
    platformFee: 0.1,
    secretMorseCode: 'DRAM',
    morseReward: 50000
  });

  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  };

  const syncUserData = useCallback(async (userId: string, email: string) => {
    try {
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
      if (!profile) return;

      const { data: assets } = await supabase.from('assets').select('*').eq('user_id', userId);
      const isMasterAdmin = email.toLowerCase() === ADMIN_EMAIL;
      if (isMasterAdmin || profile.role === 'admin') setIsAdminAuthenticated(true);

      setUser(prev => ({
        ...prev,
        id: userId,
        username: profile.username || email.split('@')[0],
        email: email,
        isLoggedIn: true,
        role: (isMasterAdmin || profile.role === 'admin') ? 'admin' : 'user',
        kycStatus: profile.kyc_status || 'unverified',
        apricots: Number(profile.apricots) || 0,
        totalEarnedApricots: Number(profile.total_earned_apricots) || 0,
        tapLevel: profile.tap_level || 1,
        energy: Number(profile.energy) || 1000,
        maxEnergy: profile.max_energy || 1000,
        tapBotLevel: profile.tap_bot_level || 0,
        completedTasks: profile.completed_tasks || [],
        checkInStreak: profile.check_in_streak || 0,
        lastCheckInAt: profile.last_check_in_at,
        lastMorseClaimedAt: profile.last_morse_claimed_at,
        assets: assets?.map(a => ({ symbol: a.symbol, amount: Number(a.amount), valueUsd: 0 })) || INITIAL_USER.assets,
      }));
    } catch (err) {
      console.error("Sync error", err);
    }
  }, []);

  const fetchSettings = async () => {
    try {
      const { data: settings } = await supabase.from('settings').select('*').eq('id', 1).maybeSingle();
      if (settings) {
        setSystemSettings({
          usdToAmdRate: Number(settings.usd_to_amd),
          isAiEnabled: true,
          platformFee: Number(settings.platform_fee),
          secretMorseCode: settings.morse_code || 'DRAM',
          morseReward: Number(settings.morse_reward) || 50000
        });
      }
    } catch (e) {
      console.error("Settings fetch failed", e);
    }
  };

  const fetchPrices = async () => {
    try {
      const mirrors = ['https://api.binance.com', 'https://api1.binance.com', 'https://api2.binance.com'];
      let data = null;
      for (const mirror of mirrors) {
        try {
          const res = await fetch(`${mirror}/api/v3/ticker/24hr?symbols=["BTCUSDT","ETHUSDT","BNBUSDT","SOLUSDT"]`);
          if (res.ok) { data = await res.json(); break; }
        } catch (e) { continue; }
      }
      const { data: settings } = await supabase.from('settings').select('listing_price').eq('id', 1).maybeSingle();
      const dmcListingPrice = settings?.listing_price || 0.54;
      const liveCoins = Array.isArray(data) ? data.map((d: any) => ({
        id: d.symbol,
        symbol: d.symbol.replace('USDT', ''),
        name: d.symbol.replace('USDT', ''),
        price: parseFloat(d.lastPrice),
        change24h: parseFloat(d.priceChangePercent),
        volume: parseFloat(d.quoteVolume).toLocaleString(),
        marketCap: 'Live'
      })) : [];
      setMarketData([{ id: 'DMCUSDT', symbol: 'DMC', name: 'DramCoin', price: Number(dmcListingPrice), change24h: 0.15, volume: '1.2M', marketCap: '540M' }, ...liveCoins]);
    } catch (e) {
      console.warn("Prices fetch failed", e);
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        setIsLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        if (session) await syncUserData(session.user.id, session.user.email || '');
        await Promise.all([fetchSettings(), fetchPrices()]);
      } catch (err) {
        console.error("Initialization failed", err);
      } finally {
        setIsLoading(false);
      }
    };
    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) await syncUserData(session.user.id, session.user.email || '');
      else { setUser(INITIAL_USER); setIsAdminAuthenticated(false); }
    });
    return () => subscription.unsubscribe();
  }, [syncUserData]);

  return (
    <StoreContext.Provider value={{
      user, marketData, systemSettings, isAdminAuthenticated,
      currentPrice: marketData.find(c => c.symbol === selectedSymbol)?.price || 0,
      language, setLanguage, selectedSymbol, setSelectedSymbol, currentView, setView, isLoading, toasts, addToast,
      login: async (e, p) => {
        const { error } = await supabase.auth.signInWithPassword({ email: e, password: p });
        return { success: !error, message: error?.message };
      },
      register: async (u, e, p) => {
        const { error } = await supabase.auth.signUp({ email: e, password: p, options: { data: { username: u } } });
        return { success: !error, message: error?.message };
      },
      loginWithGoogle: async () => {
        const { error } = await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin } });
        return { success: !error, message: error?.message };
      },
      loginWithPhone: async (phone) => {
        const { error } = await supabase.auth.signInWithOtp({ phone });
        return { success: !error, message: error?.message };
      },
      verifyOtp: async (phone, token) => {
        const { error } = await supabase.auth.verifyOtp({ phone, token, type: 'sms' });
        return { success: !error, message: error?.message };
      },
      logout: async () => { await supabase.auth.signOut(); setView(ViewState.HOME); },
      adminLogin: async (e, p) => {
        const { data, error } = await supabase.auth.signInWithPassword({ email: e, password: p });
        if (error) return { success: false, message: error.message };
        const isMaster = e.toLowerCase().trim() === ADMIN_EMAIL;
        const { data: profile } = await supabase.from('profiles').select('role').eq('id', data.user.id).single();
        if (isMaster || profile?.role === 'admin') { setIsAdminAuthenticated(true); return { success: true }; }
        return { success: false, message: 'Իրավունքների բացակայություն' };
      },
      adminLogout: () => { supabase.auth.signOut(); setIsAdminAuthenticated(false); setView(ViewState.HOME); },
      clickCoin: () => {
        if (user.energy < user.tapLevel) return;
        setUser(prev => ({ ...prev, apricots: prev.apricots + prev.tapLevel, energy: prev.energy - prev.tapLevel }));
      },
      submitMorse: async (code) => {
        if (code.toUpperCase() === systemSettings.secretMorseCode.toUpperCase()) {
          const reward = systemSettings.morseReward;
          const newUser = { ...user, apricots: user.apricots + reward, lastMorseClaimedAt: new Date().toISOString() };
          setUser(newUser);
          await supabase.from('profiles').update({ apricots: newUser.apricots, last_morse_claimed_at: newUser.lastMorseClaimedAt }).eq('id', user.id);
          addToast(`Շնորհավոր: Դուք ստացաք ${reward.toLocaleString()} Ծիրան`, "success");
          return { success: true };
        }
        return { success: false };
      },
      updateSettings: async (ns) => {
        await supabase.from('settings').upsert({ id: 1, usd_to_amd: ns.usdToAmdRate, platform_fee: ns.platformFee, morse_code: ns.secretMorseCode, morse_reward: ns.morseReward });
        fetchSettings();
        addToast("Կարգավորումները պահպանվեցին", "success");
      },
      manipulatePrice: async (s, p) => {
        const cur = marketData.find(c => c.symbol === 'DMC')?.price || 0.54;
        const n = Math.max(0.0001, cur * (1 + p / 100));
        await supabase.from('settings').upsert({ id: 1, listing_price: n });
        fetchPrices();
        addToast(`Գինը փոխվեց: $${n.toFixed(4)}`, "success");
      },
      setDirectPrice: async (s, pr) => {
        await supabase.from('settings').upsert({ id: 1, listing_price: pr });
        fetchPrices();
        addToast(`Գինը սահմանվեց: $${pr.toFixed(4)}`, "success");
      },
      adminVerifyKyc: async (uid, status) => {
        await supabase.from('profiles').update({ kyc_status: status }).eq('id', uid);
        addToast(`KYC Կարգավիճակը թարմացվեց`, 'success');
      },
      upgradeTap: async () => ({ success: true }),
      upgradeEnergy: async () => ({ success: true }),
      upgradeBot: async () => ({ success: true }),
      claimDailyReward: async () => ({ success: true }),
      completeTask: async () => ({ success: true }),
      getLeaderboard: async () => [],
      exchangeApricots: async () => ({ success: true }),
      executeTrade: async () => ({ success: true, message: '' }),
      submitKyc: async () => {}, deposit: async () => {}, transfer: async () => ({ success: true })
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used within StoreProvider');
  return context;
};
