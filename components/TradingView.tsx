
import React, { useState, useEffect, useMemo, useRef } from 'react';
import ChartWidget from './ChartWidget';
import { useStore } from '../context/StoreContext';
import { ChartPoint, Order } from '../types';
import { translations } from '../translations';
import { ChevronDown, Search, History, TrendingUp, TrendingDown, Zap } from 'lucide-react';

const BINANCE_MIRRORS = [
  'https://api.binance.com',
  'https://api1.binance.com',
  'https://api2.binance.com',
  'https://api3.binance.com'
];

const TradingView: React.FC = () => {
  const { currentPrice, user, executeTrade, language, marketData, selectedSymbol, setSelectedSymbol } = useStore();
  const t = translations[language].trade;
  
  const [activeTab, setActiveTab] = useState<'buy' | 'sell'>('buy');
  const [isPairDropdownOpen, setIsPairDropdownOpen] = useState(false);
  const [pricePulse, setPricePulse] = useState<'up' | 'down' | null>(null);
  const prevPrice = useRef(currentPrice);
  
  const [amount, setAmount] = useState<string>('');
  const [total, setTotal] = useState<string>('');
  const [sliderValue, setSliderValue] = useState<number>(0);

  const [chartData, setChartData] = useState<ChartPoint[]>([]);
  const [asks, setAsks] = useState<Order[]>([]);
  const [bids, setBids] = useState<Order[]>([]);
  const [tradeMessage, setTradeMessage] = useState<{text: string, type: 'success' | 'error'} | null>(null);

  const usdtBalance = useMemo(() => user.assets.find(a => a.symbol === 'USDT')?.amount || 0, [user.assets]);
  const coinBalance = useMemo(() => user.assets.find(a => a.symbol === selectedSymbol)?.amount || 0, [user.assets, selectedSymbol]);
  
  const maxAmount = activeTab === 'buy' 
    ? (currentPrice > 0 ? usdtBalance / currentPrice : 0) 
    : coinBalance;

  useEffect(() => {
    if (currentPrice > prevPrice.current) setPricePulse('up');
    else if (currentPrice < prevPrice.current) setPricePulse('down');
    
    prevPrice.current = currentPrice;
    const timer = setTimeout(() => setPricePulse(null), 400);
    return () => clearTimeout(timer);
  }, [currentPrice]);

  const recentOrders = useMemo(() => {
    return user.transactions
      .filter(tx => tx.symbol === selectedSymbol && (tx.type === 'buy' || tx.type === 'sell'))
      .slice(0, 10);
  }, [user.transactions, selectedSymbol]);

  const fetchWithMirror = async (path: string) => {
    for (const mirror of BINANCE_MIRRORS) {
      try {
        const res = await fetch(`${mirror}${path}`);
        if (res.ok) return await res.json();
      } catch (e) {
        continue;
      }
    }
    throw new Error('All mirrors failed');
  };

  useEffect(() => {
    const fetchChartHistory = async () => {
      try {
        const fetchSymbol = selectedSymbol === 'DMC' ? 'BTCUSDT' : `${selectedSymbol}USDT`;
        const data = await fetchWithMirror(`/api/v3/klines?symbol=${fetchSymbol}&interval=1m&limit=60`);
        
        const formattedChartData: ChartPoint[] = data.map((d: any) => ({
          time: new Date(d[0]).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          price: selectedSymbol === 'DMC' ? parseFloat(d[4]) * 0.0035 : parseFloat(d[4])
        }));
        
        setChartData(formattedChartData);
      } catch (err) {
        console.error("Error fetching chart history", err);
      }
    };

    fetchChartHistory();
    const interval = setInterval(fetchChartHistory, 60000);
    return () => clearInterval(interval);
  }, [selectedSymbol]);

  useEffect(() => {
    const fetchOrderBook = async () => {
      try {
        const fetchSymbol = selectedSymbol === 'DMC' ? 'BTCUSDT' : `${selectedSymbol}USDT`;
        const data = await fetchWithMirror(`/api/v3/depth?symbol=${fetchSymbol}&limit=12`);
        
        const mapOrders = (orders: string[][], type: 'buy' | 'sell'): Order[] => {
            return orders.map(o => {
                const rawPrice = parseFloat(o[0]);
                const rawAmount = parseFloat(o[1]);
                const finalPrice = selectedSymbol === 'DMC' ? rawPrice * 0.0035 : rawPrice;
                return { price: finalPrice, amount: rawAmount, total: finalPrice * rawAmount, type };
            });
        };

        setAsks(mapOrders(data.asks, 'sell').reverse());
        setBids(mapOrders(data.bids, 'buy'));
      } catch (err) {
        console.error("Error fetching order book", err);
      }
    };

    fetchOrderBook();
    const interval = setInterval(fetchOrderBook, 5000);
    return () => clearInterval(interval);
  }, [selectedSymbol]);

  const handleAmountChange = (val: string) => {
    setAmount(val);
    const numVal = parseFloat(val);
    if (!isNaN(numVal)) {
      setTotal((numVal * currentPrice).toFixed(2));
      if (maxAmount > 0) setSliderValue(Math.min(100, (numVal / maxAmount) * 100));
    } else {
      setTotal('');
      setSliderValue(0);
    }
  };

  const handleTotalChange = (val: string) => {
    setTotal(val);
    const numVal = parseFloat(val);
    if (!isNaN(numVal) && currentPrice > 0) {
      const newAmount = numVal / currentPrice;
      setAmount(newAmount.toFixed(6));
      if (maxAmount > 0) setSliderValue(Math.min(100, (newAmount / maxAmount) * 100));
    } else {
      setAmount('');
      setSliderValue(0);
    }
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setSliderValue(val);
    if (maxAmount > 0) {
      const newAmount = (maxAmount * val) / 100;
      setAmount(newAmount.toFixed(6));
      setTotal((newAmount * currentPrice).toFixed(2));
    }
  };

  const handleTrade = async () => {
      const numAmount = parseFloat(amount);
      if (isNaN(numAmount) || numAmount <= 0) return;
      const result = await executeTrade(activeTab, selectedSymbol, numAmount, currentPrice);
      setTradeMessage({ text: result.message, type: result.success ? 'success' : 'error' });
      if(result.success) { setAmount(''); setTotal(''); setSliderValue(0); }
      setTimeout(() => setTradeMessage(null), 3000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-1 min-h-[calc(100vh-64px)] bg-[#0b0e11] p-1 font-sans">
      <div className="hidden lg:flex flex-col bg-binance-black p-2 border border-binance-gray/20 rounded-lg">
        <h3 className="text-binance-subtext text-[10px] uppercase font-black tracking-widest mb-4 px-2">{t.order_book}</h3>
        <div className="grid grid-cols-3 text-[10px] text-binance-subtext mb-2 px-2 font-bold">
          <span>{t.price}</span>
          <span className="text-right">{t.amount}</span>
          <span className="text-right">{t.total}</span>
        </div>
        
        <div className="flex-1 overflow-hidden flex flex-col justify-end">
          {asks.map((order, i) => (
            <div key={`ask-${i}`} className="grid grid-cols-3 text-[11px] py-0.5 px-2 hover:bg-binance-red/5 cursor-pointer relative group transition-colors">
              <div className="absolute right-0 top-0 bottom-0 bg-binance-red/10 transition-all" style={{ width: `${Math.min(100, (order.amount/10)*100)}%` }} />
              <span className="text-binance-red font-mono font-bold z-10">{order.price.toFixed(selectedSymbol === 'DMC' ? 4 : 2)}</span>
              <span className="text-right text-white font-mono z-10">{order.amount.toFixed(4)}</span>
              <span className="text-right text-binance-subtext font-mono z-10">{order.total.toFixed(2)}</span>
            </div>
          ))}
        </div>

        <div className={`py-4 border-y border-binance-gray/30 my-2 px-2 flex items-center justify-between transition-all duration-300 ${
          pricePulse === 'up' ? 'bg-binance-green/5' : pricePulse === 'down' ? 'bg-binance-red/5' : ''
        }`}>
          <div className="flex items-center gap-2">
            <span className={`text-xl font-black font-mono transition-colors duration-300 ${
              pricePulse === 'up' ? 'text-binance-green scale-105' : pricePulse === 'down' ? 'text-binance-red scale-105' : 'text-white'
            }`}>
                {currentPrice > 0 ? currentPrice.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: selectedSymbol === 'DMC' ? 4 : 2}) : '...'}
            </span>
            {pricePulse && (
              pricePulse === 'up' ? <TrendingUp size={16} className="text-binance-green animate-bounce" /> : <TrendingDown size={16} className="text-binance-red animate-bounce" />
            )}
          </div>
          <span className="text-[10px] text-binance-subtext font-bold">LIVE</span>
        </div>

        <div className="flex-1 overflow-hidden">
          {bids.map((order, i) => (
            <div key={`bid-${i}`} className="grid grid-cols-3 text-[11px] py-0.5 px-2 hover:bg-binance-green/5 cursor-pointer relative group transition-colors">
               <div className="absolute right-0 top-0 bottom-0 bg-binance-green/10 transition-all" style={{ width: `${Math.min(100, (order.amount/10)*100)}%` }} />
              <span className="text-binance-green font-mono font-bold z-10">{order.price.toFixed(selectedSymbol === 'DMC' ? 4 : 2)}</span>
              <span className="text-right text-white font-mono z-10">{order.amount.toFixed(4)}</span>
              <span className="text-right text-binance-subtext font-mono z-10">{order.total.toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="col-span-1 lg:col-span-2 flex flex-col gap-1">
        <div className="bg-binance-black p-4 border border-binance-gray/20 rounded-lg flex justify-between items-center">
            <div className="flex flex-col relative">
                <div 
                    className="flex items-center gap-2 cursor-pointer bg-binance-gray/20 hover:bg-binance-gray/40 px-3 py-1.5 rounded-xl transition-all border border-binance-gray group"
                    onClick={() => setIsPairDropdownOpen(!isPairDropdownOpen)}
                >
                    <h1 className="text-lg font-black text-white">{selectedSymbol}/USDT</h1>
                    <ChevronDown size={16} className="text-binance-subtext group-hover:text-binance-yellow transition-transform" />
                    {selectedSymbol === 'DMC' && <Zap size={14} className="text-binance-yellow fill-current" />}
                </div>
                
                {isPairDropdownOpen && (
                    <div className="absolute top-full left-0 mt-2 w-72 bg-binance-black border border-binance-gray rounded-2xl shadow-2xl z-50 animate-fade-in overflow-hidden">
                        <div className="p-3 bg-binance-dark border-b border-binance-gray">
                            <div className="relative">
                                <Search size={14} className="absolute left-3 top-2.5 text-binance-subtext" />
                                <input 
                                    type="text" 
                                    placeholder="Search pair..." 
                                    className="w-full bg-binance-black text-white text-xs py-2 pl-8 pr-2 rounded-lg border border-transparent focus:border-binance-yellow focus:outline-none"
                                    onClick={(e) => e.stopPropagation()}
                                />
                            </div>
                        </div>
                        <div className="max-h-64 overflow-y-auto">
                          {marketData.map((coin) => (
                              <div 
                                  key={coin.symbol}
                                  onClick={() => { setSelectedSymbol(coin.symbol); setIsPairDropdownOpen(false); }}
                                  className={`flex justify-between items-center px-4 py-3 hover:bg-binance-gray/30 cursor-pointer border-b border-binance-gray/10 last:border-0 ${selectedSymbol === coin.symbol ? 'bg-binance-gray/50' : ''}`}
                              >
                                  <div className="flex items-center gap-2">
                                       <span className="font-black text-sm text-white">{coin.symbol}</span>
                                       <span className="text-[10px] text-binance-subtext font-bold uppercase">/USDT</span>
                                  </div>
                                  <span className={`text-xs font-mono font-bold ${coin.change24h >= 0 ? 'text-binance-green' : 'text-binance-red'}`}>
                                      {coin.price.toFixed(coin.symbol === 'DMC' ? 4 : 2)}
                                  </span>
                              </div>
                          ))}
                        </div>
                    </div>
                )}
            </div>
            
            <div className="flex gap-6 items-center">
              <div className="text-center">
                <p className="text-[10px] text-binance-subtext font-bold uppercase">24h Change</p>
                <p className={`text-xs font-mono font-bold ${marketData.find(c => c.symbol === selectedSymbol)?.change24h || 0 >= 0 ? 'text-binance-green' : 'text-binance-red'}`}>
                  {marketData.find(c => c.symbol === selectedSymbol)?.change24h || 0}%
                </p>
              </div>
              <div className="text-center hidden sm:block">
                <p className="text-[10px] text-binance-subtext font-bold uppercase">24h Volume</p>
                <p className="text-xs font-mono font-bold text-white">
                  {marketData.find(c => c.symbol === selectedSymbol)?.volume || '0'}
                </p>
              </div>
            </div>
        </div>

        <div className="flex-1 bg-binance-black p-4 border border-binance-gray/20 rounded-lg min-h-[450px]">
          {chartData.length > 0 ? <ChartWidget data={chartData} /> : <div className="h-full flex items-center justify-center text-binance-subtext">Loading Chart Data...</div>}
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <div className="bg-binance-black p-6 border border-binance-gray/20 rounded-lg shadow-xl">
           <div className="flex bg-binance-dark p-1 rounded-xl mb-6 border border-binance-gray/50">
               <button onClick={() => setActiveTab('buy')} className={`flex-1 py-2.5 text-xs font-black rounded-lg transition-all ${activeTab === 'buy' ? 'bg-binance-green text-white shadow-lg' : 'text-binance-subtext hover:text-white'}`}>{t.buy}</button>
               <button onClick={() => setActiveTab('sell')} className={`flex-1 py-2.5 text-xs font-black rounded-lg transition-all ${activeTab === 'sell' ? 'bg-binance-red text-white shadow-lg' : 'text-binance-subtext hover:text-white'}`}>{t.sell}</button>
           </div>

           <div className="space-y-4">
               <div className="flex justify-between text-[10px] font-bold text-binance-subtext mb-1 uppercase tracking-wider">
                   <span>{t.available}</span>
                   <button onClick={() => { setSliderValue(100); setAmount(maxAmount.toFixed(6)); setTotal((maxAmount * currentPrice).toFixed(2)); }} className="text-white hover:text-binance-yellow transition-colors underline decoration-dotted">
                       {activeTab === 'buy' ? `${usdtBalance.toLocaleString()} USDT` : `${coinBalance.toLocaleString()} ${selectedSymbol}`}
                   </button>
               </div>

               <div className="relative group">
                   <label className="absolute left-3 top-2 text-[10px] text-binance-subtext font-bold uppercase">{t.price}</label>
                   <div className="w-full bg-binance-dark border border-binance-gray group-hover:border-binance-gray/70 rounded-xl h-12 flex items-center justify-between px-3 pt-3">
                      <span className={`text-sm font-mono font-bold transition-colors duration-300 ${pricePulse === 'up' ? 'text-binance-green' : pricePulse === 'down' ? 'text-binance-red' : 'text-white'}`}>
                        {currentPrice.toFixed(selectedSymbol === 'DMC' ? 4 : 2)}
                      </span>
                      <span className="text-[10px] font-bold text-binance-subtext uppercase">USDT</span>
                   </div>
               </div>

               <div className="relative">
                   <label className="absolute left-3 top-2 text-[10px] text-binance-subtext font-bold uppercase">{t.amount}</label>
                   <input type="number" value={amount} onChange={(e) => handleAmountChange(e.target.value)} className="w-full bg-binance-dark border border-binance-gray rounded-xl h-12 px-3 text-right text-white pt-3 text-sm font-mono font-bold focus:border-binance-yellow focus:outline-none" placeholder="0.00" />
                   <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-white uppercase mt-1.5 pointer-events-none">{selectedSymbol}</span>
               </div>
               
               <div className="relative py-4 px-2">
                   <input type="range" min="0" max="100" value={sliderValue} onChange={handleSliderChange} className="w-full h-1 bg-binance-gray rounded-full appearance-none cursor-pointer accent-binance-yellow" />
                   <div className="flex justify-between mt-2">
                      {[0, 25, 50, 75, 100].map((step) => (
                          <div key={step} className={`w-3 h-3 rounded-full border-2 transition-all cursor-pointer ${sliderValue >= step ? 'bg-binance-yellow border-binance-yellow' : 'bg-binance-black border-binance-gray'}`} onClick={() => handleSliderChange({ target: { value: step.toString() } } as any)} />
                      ))}
                   </div>
               </div>

               <div className="relative">
                   <label className="absolute left-3 top-2 text-[10px] text-binance-subtext font-bold uppercase">{t.total}</label>
                   <input type="number" value={total} onChange={(e) => handleTotalChange(e.target.value)} className="w-full bg-binance-dark border border-binance-gray rounded-xl h-12 px-3 text-right text-white pt-3 text-sm font-mono font-bold focus:border-binance-yellow focus:outline-none" placeholder="0.00" />
                   <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-white uppercase mt-1.5 pointer-events-none">USDT</span>
               </div>

               {tradeMessage && (
                   <div className={`text-[10px] p-2.5 rounded-lg font-bold uppercase tracking-tight ${tradeMessage.type === 'success' ? 'bg-binance-green/10 text-binance-green border border-binance-green/20' : 'bg-binance-red/10 text-binance-red border border-binance-red/20'}`}>
                       {tradeMessage.text}
                   </div>
               )}

               {user.isLoggedIn ? (
                   <button onClick={handleTrade} className={`w-full py-4 rounded-xl font-black text-white mt-4 shadow-2xl transition-all active:scale-95 ${activeTab === 'buy' ? 'bg-binance-green hover:shadow-green-500/10' : 'bg-binance-red hover:shadow-red-500/10'}`}>
                       {activeTab === 'buy' ? `${t.buy} ${selectedSymbol}` : `${t.sell} ${selectedSymbol}`}
                   </button>
               ) : (
                   <button onClick={() => setSelectedSymbol(selectedSymbol)} className="w-full py-4 bg-binance-gray text-binance-subtext font-black rounded-xl mt-4 border border-binance-gray/50 opacity-80 cursor-not-allowed">
                       {t.login_msg}
                   </button>
               )}
           </div>
        </div>

        <div className="flex-1 bg-binance-black border border-binance-gray/20 rounded-lg overflow-hidden flex flex-col shadow-lg">
          <div className="p-3 border-b border-binance-gray/20 bg-binance-dark">
            <h3 className="text-[10px] font-black text-white flex items-center gap-2 uppercase tracking-widest">
              <History size={14} className="text-binance-yellow" /> {t.recent_orders}
            </h3>
          </div>
          <div className="flex-1 overflow-y-auto max-h-[350px]">
            <table className="w-full text-left text-[10px]">
              <thead className="sticky top-0 bg-binance-black text-binance-subtext uppercase font-black border-b border-binance-gray/10">
                <tr>
                  <th className="p-3">{t.type}</th>
                  <th className="p-3 text-right">{t.amount}</th>
                  <th className="p-3 text-right">{t.price}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-binance-gray/5">
                {recentOrders.length > 0 ? (
                  recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-binance-gray/10 transition-colors">
                      <td className={`p-3 font-black ${order.type === 'buy' ? 'text-binance-green' : 'text-binance-red'}`}>
                        {order.type === 'buy' ? t.buy : t.sell}
                      </td>
                      <td className="p-3 text-right text-white font-mono font-bold">{order.amount.toFixed(4)}</td>
                      <td className="p-3 text-right text-binance-subtext font-mono">{currentPrice.toFixed(selectedSymbol === 'DMC' ? 4 : 2)}</td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={3} className="p-10 text-center text-binance-subtext italic uppercase text-[9px] font-bold">No history available</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TradingView;
