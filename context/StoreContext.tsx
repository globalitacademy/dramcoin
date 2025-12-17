
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { User, CoinData, Language, Transaction, ViewState, SystemSettings, Asset } from '../types';
import { supabase, isSupabaseConfigured } from '../supabase';

interface StoreContextType {
  user: User;
  allUsers: User[];
  marketData: CoinData[];
  systemSettings: SystemSettings;
  isAdminAuthenticated: boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; message?: string }>;
  register: (username: string, email: string, pass: string) => Promise<{ success: boolean; message?: string }>;
  loginWithGoogle: () => Promise<{ success: boolean; message?: string }>;
  loginWithPhone: (phone: string) => Promise<{ success: boolean; message?: string }>;
  verifyOtp: (phone: string, token: string) => Promise<{ success: boolean; message?: string }>;
  connectWallet: () => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  adminLogin: (user: string, pass: string) => boolean;
  adminLogout: () => void;
  adminVerifyKyc: (userId: string, status: 'verified' | 'unverified') => Promise<void>;
  executeTrade: (type: 'buy' | 'sell', symbol: string, amount: number, price: number) => Promise<{ success: boolean; message: string }>;
  deposit: (symbol: string, amount: number) => Promise<void>;
  transfer: (symbol: string, amount: number) => Promise<{ success: boolean; message?: string }>;
  updateSettings: (settings: Partial<SystemSettings>) => void;
  manipulatePrice: (symbol: string, percentage: number) => void;
  submitKyc: () => Promise<void>;
  currentPrice: number;
  language: Language;
  setLanguage: (lang: Language) => void;
  selectedSymbol: string;
  setSelectedSymbol: (symbol: string) => void;
  currentView: ViewState;
  setView: (view: ViewState) => void;
  isLoading: boolean;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const INITIAL_USER: User = {
  username: 'Guest',
  email: '',
  isLoggedIn: false,
  isAdmin: false,
  kycStatus: 'unverified',
  twoFactorEnabled: false,
  assets: [
    { symbol: 'USDT', amount: 0, valueUsd: 0 },
    { symbol: 'BTC', amount: 0, valueUsd: 0 },
    { symbol: 'DMC', amount: 0, valueUsd: 0 }, 
  ],
  transactions: []
};

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('AM');
  const [selectedSymbol, setSelectedSymbol] = useState<string>('BTC');
  const [currentView, setView] = useState<ViewState>(ViewState.HOME);
  const [currentPrice, setCurrentPrice] = useState<number>(0);
  const [marketData, setMarketData] = useState<CoinData[]>([]);
  const [dmcMultiplier, setDmcMultiplier] = useState<number>(1.0);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const wsRef = useRef<WebSocket | null>(null);

  const [systemSettings, setSystemSettings] = useState<SystemSettings>({
    usdToAmdRate: 390,
    isAiEnabled: true,
    platformFee: 0.1
  });

  const [user, setUser] = useState<User>(() => {
    const saved = localStorage.getItem('dramcoin_user_backup');
    return saved ? JSON.parse(saved) : INITIAL_USER;
  });

  useEffect(() => {
    localStorage.setItem('dramcoin_user_backup', JSON.stringify(user));
  }, [user]);

  // Auth & Initial Sync
  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        await syncUserData(session.user.id, session.user.email || session.user.phone || '');
      }
      setIsLoading(false);
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session) {
        await syncUserData(session.user.id, session.user.email || session.user.phone || '');
      } else {
        if (!localStorage.getItem('dramcoin_local_login')) {
          setUser(INITIAL_USER);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Admin Data Sync
  useEffect(() => {
    if (isAdminAuthenticated) {
      fetchAllUsers();
    }
  }, [isAdminAuthenticated]);

  const fetchAllUsers = async () => {
    try {
      const { data: profiles } = await supabase.from('profiles').select('*');
      if (profiles) {
        const usersList: User[] = await Promise.all(profiles.map(async (p) => {
          const { data: assets } = await supabase.from('assets').select('*').eq('user_id', p.id);
          const { data: txs } = await supabase.from('transactions').select('*').eq('user_id', p.id);
          
          return {
            username: p.username,
            email: p.id,
            isLoggedIn: true,
            kycStatus: p.kyc_status,
            twoFactorEnabled: p.two_factor_enabled,
            assets: assets?.map(a => ({ symbol: a.symbol, amount: a.amount, valueUsd: 0 })) || [],
            transactions: txs?.map(t => ({ id: t.id, type: t.type, symbol: t.symbol, amount: t.amount, date: t.created_at, status: t.status })) || []
          };
        }));
        setAllUsers(usersList);
      }
    } catch (err) {
      console.error("Admin fetch error:", err);
    }
  };

  const syncUserData = async (userId: string, contact: string) => {
    try {
      let { data: profile } = await supabase.from('profiles').select('*').eq('id', userId).single();

      if (!profile) {
        const { data: newProfile } = await supabase.from('profiles').insert([{ id: userId, username: contact.split('@')[0], kyc_status: 'unverified' }]).select().single();
        profile = newProfile;
      }

      const { data: assets } = await supabase.from('assets').select('*').eq('user_id', userId);
      const { data: transactions } = await supabase.from('transactions').select('*').eq('user_id', userId).order('created_at', { ascending: false });

      const formattedAssets: Asset[] = assets && assets.length > 0 
        ? assets.map(a => ({ symbol: a.symbol, amount: a.amount, valueUsd: 0 }))
        : INITIAL_USER.assets;

      const formattedTxs: Transaction[] = transactions?.map(t => ({
        id: t.id,
        type: t.type as any,
        symbol: t.symbol,
        amount: t.amount,
        date: t.created_at,
        status: t.status as any
      })) || [];

      setUser({
        username: profile?.username || contact.split('@')[0],
        email: contact,
        isLoggedIn: true,
        kycStatus: profile?.kyc_status || 'unverified',
        twoFactorEnabled: profile?.two_factor_enabled || false,
        assets: formattedAssets,
        transactions: formattedTxs
      });
    } catch (err) {
      console.error("Sync Error:", err);
    }
  };

  const fetchMarketData = async () => {
    const endpoints = ['https://api.binance.com/api/v3/ticker/24hr', 'https://api1.binance.com/api/v3/ticker/24hr'];
    for (const url of endpoints) {
      try {
        const response = await fetch(url);
        if (!response.ok) continue;
        const data = await response.json();
        const targetSymbols = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT', 'ADAUSDT', 'DOGEUSDT', 'XRPUSDT'];
        
        const formattedData: CoinData[] = data
          .filter((item: any) => targetSymbols.includes(item.symbol))
          .map((item: any, index: number) => ({
            id: String(index),
            symbol: item.symbol.replace('USDT', ''),
            name: item.symbol.replace('USDT', ''),
            price: parseFloat(item.lastPrice),
            change24h: parseFloat(item.priceChangePercent),
            volume: (parseFloat(item.quoteVolume) / 1000000).toFixed(2) + 'M',
            marketCap: 'N/A'
          }));

        const dmcCoin: CoinData = {
            id: 'dmc-001',
            symbol: 'DMC',
            name: 'DramCoin',
            price: 0.54 * dmcMultiplier,
            change24h: dmcMultiplier > 1 ? 12 + (dmcMultiplier - 1) * 100 : 12,
            volume: '2.5M',
            marketCap: '120M'
        };

        setMarketData([dmcCoin, ...formattedData]);
        return; 
      } catch (e) { console.warn("Binance fetch error"); }
    }
  };

  useEffect(() => {
    fetchMarketData();
    const interval = setInterval(fetchMarketData, 20000);
    return () => clearInterval(interval);
  }, [dmcMultiplier]);

  useEffect(() => {
    const streamSymbol = selectedSymbol === 'DMC' ? 'btcusdt' : `${selectedSymbol.toLowerCase()}usdt`;
    const wsUrl = `wss://stream.binance.com:9443/ws/${streamSymbol}@trade`;
    if (wsRef.current) wsRef.current.close();
    wsRef.current = new WebSocket(wsUrl);
    wsRef.current.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.p) {
        const rawPrice = parseFloat(message.p);
        setCurrentPrice(selectedSymbol === 'DMC' ? 0.54 * dmcMultiplier : rawPrice);
      }
    };
    return () => wsRef.current?.close();
  }, [selectedSymbol, dmcMultiplier]);

  const login = async (email: string, pass: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password: pass });
    if (error) return { success: false, message: error.message };
    setView(ViewState.HOME);
    return { success: true };
  };

  const register = async (username: string, email: string, pass: string) => {
    const { data, error } = await supabase.auth.signUp({ email, password: pass, options: { data: { username } } });
    if (error) return { success: false, message: error.message };
    if (data.user) {
      await supabase.from('profiles').upsert([{ id: data.user.id, username, kyc_status: 'unverified' }]);
      await supabase.from('assets').upsert([{ user_id: data.user.id, symbol: 'USDT', amount: 500 }]);
    }
    setView(ViewState.HOME);
    return { success: true };
  };

  const loginWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({ 
        provider: 'google', 
        options: { redirectTo: window.location.origin } 
      });
      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      console.error("Google login failed:", error.message);
      return { success: false, message: error.message };
    }
  };

  const loginWithPhone = async (phone: string) => {
    const { error } = await supabase.auth.signInWithOtp({ phone });
    if (error) return { success: false, message: error.message };
    return { success: true };
  };

  const verifyOtp = async (phone: string, token: string) => {
    const { data, error } = await supabase.auth.verifyOtp({ phone, token, type: 'sms' });
    if (error) return { success: false, message: error.message };
    if (data.session) {
      setView(ViewState.HOME);
      return { success: true };
    }
    return { success: false, message: 'Verification failed' };
  };

  const connectWallet = async () => {
    if ((window as any).ethereum) {
      try {
        const accounts = await (window as any).ethereum.request({ method: 'eth_requestAccounts' });
        if (accounts.length > 0) {
          const address = accounts[0];
          setUser(prev => ({ ...prev, username: `${address.substring(0, 6)}...`, isLoggedIn: true }));
          return { success: true };
        }
      } catch (err) { return { success: false, message: 'Wallet connection denied' }; }
    }
    return { success: false, message: 'Please install MetaMask' };
  };

  const logout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('dramcoin_local_login');
    setUser(INITIAL_USER);
    setView(ViewState.HOME);
  };

  const adminLogin = (u: string, p: string) => {
    if (u === 'Admin' && p === 'dramcoin-admin') {
      setIsAdminAuthenticated(true);
      return true;
    }
    return false;
  };

  const adminLogout = () => {
    setIsAdminAuthenticated(false);
    setView(ViewState.HOME);
  };

  const adminVerifyKyc = async (userId: string, status: 'verified' | 'unverified') => {
    await supabase.from('profiles').update({ kyc_status: status }).eq('id', userId);
    fetchAllUsers();
    const { data: { user: currentSbUser } } = await supabase.auth.getUser();
    if (currentSbUser && currentSbUser.id === userId) {
      setUser(prev => ({ ...prev, kycStatus: status }));
    }
  };

  const updateSettings = (newSettings: Partial<SystemSettings>) => {
    setSystemSettings(prev => ({ ...prev, ...newSettings }));
  };

  const manipulatePrice = (symbol: string, percentage: number) => {
    if (symbol === 'DMC') {
      if (percentage === 0) setDmcMultiplier(1.0);
      else setDmcMultiplier(prev => prev * (1 + percentage / 100));
    }
  };

  const submitKyc = async () => {
    const { data: { user: sbUser } } = await supabase.auth.getUser();
    if (sbUser) {
      await supabase.from('profiles').update({ kyc_status: 'pending' }).eq('id', sbUser.id);
      setUser(prev => ({ ...prev, kycStatus: 'pending' }));
    }
  };

  const executeTrade = async (type: 'buy' | 'sell', symbol: string, amount: number, price: number) => {
    const { data: { user: sbUser } } = await supabase.auth.getUser();
    if (!sbUser) return { success: false, message: 'Please login' };

    const totalValue = amount * price;
    const fee = totalValue * (systemSettings.platformFee / 100);
    
    const usdtAsset = user.assets.find(a => a.symbol === 'USDT');
    const coinAsset = user.assets.find(a => a.symbol === symbol);

    if (type === 'buy') {
      const cost = totalValue + fee;
      if (usdtAsset && usdtAsset.amount < cost && !isAdminAuthenticated) return { success: false, message: 'Insufficient funds' };
      
      await supabase.from('assets').upsert({ user_id: sbUser.id, symbol: 'USDT', amount: (usdtAsset?.amount || 0) - cost }, { onConflict: 'user_id,symbol' });
      await supabase.from('assets').upsert({ user_id: sbUser.id, symbol, amount: (coinAsset?.amount || 0) + amount }, { onConflict: 'user_id,symbol' });
    } else {
      if (coinAsset && coinAsset.amount < amount && !isAdminAuthenticated) return { success: false, message: 'Insufficient coins' };
      
      await supabase.from('assets').upsert({ user_id: sbUser.id, symbol, amount: (coinAsset?.amount || 0) - amount }, { onConflict: 'user_id,symbol' });
      await supabase.from('assets').upsert({ user_id: sbUser.id, symbol: 'USDT', amount: (usdtAsset?.amount || 0) + (totalValue - fee) }, { onConflict: 'user_id,symbol' });
    }

    await supabase.from('transactions').insert([{ user_id: sbUser.id, type, symbol, amount, status: 'completed' }]);
    await syncUserData(sbUser.id, sbUser.email || sbUser.phone || '');

    return { success: true, message: 'Trade successful' };
  };

  const deposit = async (symbol: string, amount: number) => {
    const { data: { user: sbUser } } = await supabase.auth.getUser();
    if (sbUser) {
      const asset = user.assets.find(a => a.symbol === symbol);
      await supabase.from('assets').upsert({ user_id: sbUser.id, symbol, amount: (asset?.amount || 0) + amount }, { onConflict: 'user_id,symbol' });
      await supabase.from('transactions').insert([{ user_id: sbUser.id, type: 'deposit', symbol, amount, status: 'completed' }]);
      await syncUserData(sbUser.id, sbUser.email || sbUser.phone || '');
    }
  };

  const transfer = async (symbol: string, amount: number) => {
    const { data: { user: sbUser } } = await supabase.auth.getUser();
    if (!sbUser) return { success: false };
    
    const asset = user.assets.find(a => a.symbol === symbol);
    if (!asset || asset.amount < amount) return { success: false, message: 'Insufficient funds' };

    await supabase.from('assets').update({ amount: asset.amount - amount }).eq('user_id', sbUser.id).eq('symbol', symbol);
    await supabase.from('transactions').insert([{ user_id: sbUser.id, type: 'withdrawal', symbol, amount, status: 'completed' }]);
    await syncUserData(sbUser.id, sbUser.email || sbUser.phone || '');

    return { success: true };
  };

  return (
    <StoreContext.Provider value={{ 
        user, allUsers, marketData, systemSettings, isAdminAuthenticated, login, register, loginWithGoogle, loginWithPhone, verifyOtp, connectWallet, logout, adminLogin, adminLogout, adminVerifyKyc, executeTrade, deposit, transfer, updateSettings, manipulatePrice, submitKyc,
        currentPrice, language, setLanguage, selectedSymbol, setSelectedSymbol,
        currentView, setView, isLoading
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used within a StoreProvider');
  return context;
};
