
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { User, CoinData, Language, Transaction, ViewState, SystemSettings, Asset } from '../types';

interface StoreContextType {
  user: User;
  allUsers: User[];
  marketData: CoinData[];
  systemSettings: SystemSettings;
  isAdminAuthenticated: boolean;
  login: (email: string, pass: string) => { success: boolean; message?: string };
  register: (username: string, email: string, pass: string) => { success: boolean; message?: string };
  logout: () => void;
  adminLogin: (user: string, pass: string) => boolean;
  adminLogout: () => void;
  executeTrade: (type: 'buy' | 'sell', symbol: string, amount: number, price: number) => { success: boolean; message: string };
  deposit: (symbol: string, amount: number) => void;
  transfer: (symbol: string, amount: number) => { success: boolean; message?: string };
  updateSettings: (settings: Partial<SystemSettings>) => void;
  manipulatePrice: (symbol: string, percentage: number) => void;
  currentPrice: number;
  language: Language;
  setLanguage: (lang: Language) => void;
  selectedSymbol: string;
  setSelectedSymbol: (symbol: string) => void;
  currentView: ViewState;
  setView: (view: ViewState) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

// Initial empty user state
const INITIAL_USER: User = {
  username: 'Guest',
  email: '',
  isLoggedIn: false,
  isAdmin: false,
  kycStatus: 'unverified',
  twoFactorEnabled: false,
  assets: [
    { symbol: 'USDT', amount: 10000, valueUsd: 10000 },
    { symbol: 'BTC', amount: 0.05, valueUsd: 0 },
    { symbol: 'DMC', amount: 500, valueUsd: 0 }, 
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
  const wsRef = useRef<WebSocket | null>(null);

  const [systemSettings, setSystemSettings] = useState<SystemSettings>({
    usdToAmdRate: 390,
    isAiEnabled: true,
    platformFee: 0.1
  });

  const [user, setUser] = useState<User>(INITIAL_USER);

  // Mock Database
  const [registeredUsers, setRegisteredUsers] = useState<User[]>([
    {
      username: 'Armen',
      email: 'armen@example.am',
      isLoggedIn: false,
      kycStatus: 'verified',
      twoFactorEnabled: true,
      assets: [{ symbol: 'USDT', amount: 2500, valueUsd: 2500 }, { symbol: 'BTC', amount: 0.1, valueUsd: 6400 }],
      transactions: []
    }
  ]);

  const fetchMarketData = async () => {
    try {
      const response = await fetch('https://api.binance.com/api/v3/ticker/24hr');
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

      const btcPrice = formattedData.find(c => c.symbol === 'BTC')?.price || 64000;
      const baseDmcPrice = btcPrice * 0.0035;
      const dmcCoin: CoinData = {
          id: 'dmc-001',
          symbol: 'DMC',
          name: 'DramCoin',
          price: baseDmcPrice * dmcMultiplier,
          change24h: dmcMultiplier > 1 ? 5.4 + (dmcMultiplier - 1) * 100 : 5.4 - (1 - dmcMultiplier) * 100,
          volume: '2.5M',
          marketCap: '120M'
      };

      setMarketData([dmcCoin, ...formattedData]);
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    fetchMarketData();
    const interval = setInterval(fetchMarketData, 10000);
    return () => clearInterval(interval);
  }, [dmcMultiplier]);

  useEffect(() => {
    const streamSymbol = selectedSymbol === 'DMC' ? 'btcusdt' : `${selectedSymbol.toLowerCase()}usdt`;
    if (wsRef.current) wsRef.current.close();
    wsRef.current = new WebSocket(`wss://stream.binance.com:9443/ws/${streamSymbol}@trade`);
    wsRef.current.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.p) {
        const rawPrice = parseFloat(message.p);
        setCurrentPrice(selectedSymbol === 'DMC' ? (rawPrice * 0.0035) * dmcMultiplier : rawPrice);
      }
    };
    return () => wsRef.current?.close();
  }, [selectedSymbol, dmcMultiplier]);

  // Auth Methods
  const login = (email: string, pass: string) => {
    // In a real app, pass would be hashed and checked on server
    const found = registeredUsers.find(u => u.email === email);
    if (found) {
        const loggedUser = { ...found, isLoggedIn: true, lastLogin: new Date().toISOString() };
        setUser(loggedUser);
        setView(ViewState.HOME);
        return { success: true };
    }
    return { success: false, message: 'auth.error_invalid' };
  };

  const register = (username: string, email: string, pass: string) => {
    if (registeredUsers.some(u => u.email === email)) {
        return { success: false, message: 'auth.error_exists' };
    }
    const newUser: User = {
        ...INITIAL_USER,
        username,
        email,
        isLoggedIn: true,
        kycStatus: 'unverified'
    };
    setRegisteredUsers(prev => [...prev, newUser]);
    setUser(newUser);
    setView(ViewState.HOME);
    return { success: true };
  };

  const logout = () => {
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

  const updateSettings = (newSettings: Partial<SystemSettings>) => {
    setSystemSettings(prev => ({ ...prev, ...newSettings }));
  };

  const manipulatePrice = (symbol: string, percentage: number) => {
    if (symbol === 'DMC') {
      if (percentage === 0) {
        setDmcMultiplier(1.0);
      } else {
        setDmcMultiplier(prev => prev * (1 + percentage / 100));
      }
    }
  };

  const executeTrade = (type: 'buy' | 'sell', symbol: string, amount: number, price: number) => {
    if (!user.isLoggedIn && !isAdminAuthenticated) return { success: false, message: 'Please log in' };
    
    const totalValue = amount * price;
    const fee = totalValue * (systemSettings.platformFee / 100);
    
    let updatedAssets = user.assets.map(a => ({ ...a }));
    const usdtAsset = updatedAssets.find(a => a.symbol === 'USDT');
    const coinAsset = updatedAssets.find(a => a.symbol === symbol);

    if (type === 'buy') {
      const cost = totalValue + fee;
      if (!isAdminAuthenticated && (!usdtAsset || usdtAsset.amount < cost)) {
        return { success: false, message: 'Insufficient USDT balance' };
      }
      if (usdtAsset) usdtAsset.amount -= cost;
      if (coinAsset) {
        coinAsset.amount += amount;
      } else {
        updatedAssets.push({ symbol, amount, valueUsd: 0 });
      }
    } else {
      if (!isAdminAuthenticated && (!coinAsset || coinAsset.amount < amount)) {
        return { success: false, message: `Insufficient ${symbol} balance` };
      }
      if (coinAsset) coinAsset.amount -= amount;
      const proceeds = totalValue - fee;
      if (usdtAsset) {
        usdtAsset.amount += proceeds;
      } else {
        updatedAssets.push({ symbol: 'USDT', amount: proceeds, valueUsd: proceeds });
      }
    }

    const newTx: Transaction = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      symbol,
      amount,
      date: new Date().toISOString(),
      status: 'completed'
    };

    if (!isAdminAuthenticated) {
        setUser(prev => ({
          ...prev,
          assets: updatedAssets,
          transactions: [newTx, ...prev.transactions]
        }));
    }

    return { 
      success: true, 
      message: `${language === 'AM' ? (type === 'buy' ? 'Գնումը' : 'Վաճառքը') : (type === 'buy' ? 'Buy' : 'Sell')} ${amount} ${symbol} ${language === 'AM' ? 'հաջողվեց:' : 'successful.'}` 
    };
  };

  const deposit = (symbol: string, amount: number) => {
    if (!user.isLoggedIn) return;
    
    setUser(prev => {
      const updatedAssets = prev.assets.map(a => ({ ...a }));
      const asset = updatedAssets.find(a => a.symbol === symbol);
      if (asset) {
        asset.amount += amount;
      } else {
        updatedAssets.push({ symbol, amount, valueUsd: 0 });
      }

      const newTx: Transaction = {
        id: Math.random().toString(36).substr(2, 9),
        type: 'deposit',
        symbol,
        amount,
        date: new Date().toISOString(),
        status: 'completed'
      };

      return {
        ...prev,
        assets: updatedAssets,
        transactions: [newTx, ...prev.transactions]
      };
    });
  };

  const transfer = (symbol: string, amount: number) => {
    if (!user.isLoggedIn) return { success: false };
    
    const asset = user.assets.find(a => a.symbol === symbol);
    if (!asset || asset.amount < amount) {
      return { success: false, message: 'Insufficient funds' };
    }

    setUser(prev => {
      const updatedAssets = prev.assets.map(a => ({ ...a }));
      const targetAsset = updatedAssets.find(a => a.symbol === symbol);
      if (targetAsset) targetAsset.amount -= amount;

      const newTx: Transaction = {
        id: Math.random().toString(36).substr(2, 9),
        type: 'withdrawal',
        symbol,
        amount,
        date: new Date().toISOString(),
        status: 'completed'
      };

      return {
        ...prev,
        assets: updatedAssets,
        transactions: [newTx, ...prev.transactions]
      };
    });

    return { success: true };
  };

  return (
    <StoreContext.Provider value={{ 
        user, allUsers: registeredUsers, marketData, systemSettings, isAdminAuthenticated, login, register, logout, adminLogin, adminLogout, executeTrade, deposit, transfer, updateSettings, manipulatePrice,
        currentPrice, language, setLanguage, selectedSymbol, setSelectedSymbol,
        currentView, setView
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
