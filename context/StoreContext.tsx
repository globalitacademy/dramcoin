
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { User, CoinData, Language, Transaction, ViewState, SystemSettings } from '../types';

interface StoreContextType {
  user: User;
  allUsers: User[];
  marketData: CoinData[];
  systemSettings: SystemSettings;
  login: () => void;
  logout: () => void;
  executeTrade: (type: 'buy' | 'sell', symbol: string, amount: number, price: number) => { success: boolean; message: string };
  deposit: (symbol: string, amount: number) => void;
  transfer: (symbol: string, amount: number) => { success: boolean; message?: string };
  updateSettings: (settings: Partial<SystemSettings>) => void;
  currentPrice: number;
  language: Language;
  setLanguage: (lang: Language) => void;
  selectedSymbol: string;
  setSelectedSymbol: (symbol: string) => void;
  currentView: ViewState;
  setView: (view: ViewState) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('AM');
  const [selectedSymbol, setSelectedSymbol] = useState<string>('BTC');
  const [currentView, setView] = useState<ViewState>(ViewState.HOME);
  const [currentPrice, setCurrentPrice] = useState<number>(0);
  const [marketData, setMarketData] = useState<CoinData[]>([]);
  const wsRef = useRef<WebSocket | null>(null);

  const [systemSettings, setSystemSettings] = useState<SystemSettings>({
    usdToAmdRate: 390,
    isAiEnabled: true,
    platformFee: 0.1
  });

  const [user, setUser] = useState<User>({
    name: 'Guest',
    email: '',
    isLoggedIn: false,
    isAdmin: false,
    assets: [
      { symbol: 'USDT', amount: 10000, valueUsd: 10000 },
      { symbol: 'BTC', amount: 0.05, valueUsd: 0 },
      { symbol: 'DMC', amount: 500, valueUsd: 0 }, 
    ],
    transactions: []
  });

  // Mock data for Admin panel
  const [allUsers, setAllUsers] = useState<User[]>([
    {
      name: 'Արմեն Սարգսյան',
      email: 'armen@example.am',
      isLoggedIn: false,
      assets: [{ symbol: 'USDT', amount: 2500, valueUsd: 2500 }, { symbol: 'BTC', amount: 0.1, valueUsd: 6400 }],
      transactions: []
    },
    {
      name: 'Աննա Գրիգորյան',
      email: 'anna@example.am',
      isLoggedIn: false,
      assets: [{ symbol: 'USDT', amount: 12000, valueUsd: 12000 }, { symbol: 'DMC', amount: 5000, valueUsd: 2500 }],
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
      const dmcCoin: CoinData = {
          id: 'dmc-001',
          symbol: 'DMC',
          name: 'DramCoin',
          price: btcPrice * 0.0035,
          change24h: 5.4,
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
  }, []);

  useEffect(() => {
    const streamSymbol = selectedSymbol === 'DMC' ? 'btcusdt' : `${selectedSymbol.toLowerCase()}usdt`;
    if (wsRef.current) wsRef.current.close();
    wsRef.current = new WebSocket(`wss://stream.binance.com:9443/ws/${streamSymbol}@trade`);
    wsRef.current.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.p) {
        const rawPrice = parseFloat(message.p);
        setCurrentPrice(selectedSymbol === 'DMC' ? rawPrice * 0.0035 : rawPrice);
      }
    };
    return () => wsRef.current?.close();
  }, [selectedSymbol]);

  const login = () => {
    setUser(prev => ({ ...prev, name: 'Admin User', email: 'admin@dramcoin.am', isLoggedIn: true, isAdmin: true }));
  };

  const logout = () => {
    setUser(prev => ({ ...prev, isLoggedIn: false, isAdmin: false, name: 'Guest' }));
    setView(ViewState.HOME);
  };

  const updateSettings = (newSettings: Partial<SystemSettings>) => {
    setSystemSettings(prev => ({ ...prev, ...newSettings }));
  };

  const executeTrade = (type: 'buy' | 'sell', symbol: string, amount: number, price: number) => {
    if (!user.isLoggedIn) return { success: false, message: 'Please log in' };
    const totalCost = amount * price;
    let newAssets = [...user.assets];
    // Simple logic for mock
    return { success: true, message: 'Success' };
  };

  const deposit = (symbol: string, amount: number) => {};
  const transfer = (symbol: string, amount: number) => ({ success: true });

  return (
    <StoreContext.Provider value={{ 
        user, allUsers, marketData, systemSettings, login, logout, executeTrade, deposit, transfer, updateSettings,
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
