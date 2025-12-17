
import React, { useState, useEffect, useMemo } from 'react';
import ChartWidget from './ChartWidget';
import { useStore } from '../context/StoreContext';
import { ChartPoint, Order } from '../types';
import { translations } from '../translations';
import { ChevronDown, Search, History } from 'lucide-react';

const TradingView: React.FC = () => {
  const { currentPrice, user, executeTrade, language, marketData, selectedSymbol, setSelectedSymbol } = useStore();
  const t = translations[language].trade;
  
  const [activeTab, setActiveTab] = useState<'buy' | 'sell'>('buy');
  const [isPairDropdownOpen, setIsPairDropdownOpen] = useState(false);
  
  // Form States
  const [amount, setAmount] = useState<string>('');
  const [total, setTotal] = useState<string>('');
  const [sliderValue, setSliderValue] = useState<number>(0);

  const [chartData, setChartData] = useState<ChartPoint[]>([]);
  const [asks, setAsks] = useState<Order[]>([]);
  const [bids, setBids] = useState<Order[]>([]);
  const [tradeMessage, setTradeMessage] = useState<{text: string, type: 'success' | 'error'} | null>(null);

  // Balances - reactive to user state change
  const usdtBalance = useMemo(() => user.assets.find(a => a.symbol === 'USDT')?.amount || 0, [user.assets]);
  const coinBalance = useMemo(() => user.assets.find(a => a.symbol === selectedSymbol)?.amount || 0, [user.assets, selectedSymbol]);
  
  const maxAmount = activeTab === 'buy' 
    ? (currentPrice > 0 ? usdtBalance / currentPrice : 0) 
    : coinBalance;

  // Recent Order History for selected symbol
  const recentOrders = useMemo(() => {
    return user.transactions
      .filter(tx => tx.symbol === selectedSymbol && (tx.type === 'buy' || tx.type === 'sell'))
      .slice(0, 10);
  }, [user.transactions, selectedSymbol]);

  // 1. Fetch Historical Data (K-Lines) for Chart
  useEffect(() => {
    const fetchChartHistory = async () => {
      try {
        const fetchSymbol = selectedSymbol === 'DMC' ? 'BTCUSDT' : `${selectedSymbol}USDT`;
        const res = await fetch(`https://api.binance.com/api/v3/klines?symbol=${fetchSymbol}&interval=1m&limit=60`);
        const data = await res.json();
        
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

  // Update latest chart point with live socket price
  useEffect(() => {
    if (currentPrice > 0 && chartData.length > 0) {
      setChartData(prev => {
        if (prev.length === 0) return prev;
        const newData = [...prev];
        const lastIndex = newData.length - 1;
        newData[lastIndex] = { ...newData[lastIndex], price: currentPrice };
        return newData;
      });
    }
  }, [currentPrice]);

  // 2. Fetch Order Book
  useEffect(() => {
    const fetchOrderBook = async () => {
      try {
        const fetchSymbol = selectedSymbol === 'DMC' ? 'BTCUSDT' : `${selectedSymbol}USDT`;
        const res = await fetch(`https://api.binance.com/api/v3/depth?symbol=${fetchSymbol}&limit=10`);
        const data = await res.json();
        
        const mapOrders = (orders: string[][], type: 'buy' | 'sell'): Order[] => {
            return orders.map(o => {
                const rawPrice = parseFloat(o[0]);
                const rawAmount = parseFloat(o[1]);
                const finalPrice = selectedSymbol === 'DMC' ? rawPrice * 0.0035 : rawPrice;
                
                return {
                    price: finalPrice,
                    amount: rawAmount,
                    total: finalPrice * rawAmount,
                    type
                };
            });
        };

        setAsks(mapOrders(data.asks, 'sell').reverse());
        setBids(mapOrders(data.bids, 'buy'));
      } catch (err) {
        console.error("Error fetching order book", err);
        setAsks([]);
        setBids([]);
      }
    };

    fetchOrderBook();
    const interval = setInterval(fetchOrderBook, 3000);
    return () => clearInterval(interval);
  }, [selectedSymbol]);

  // Reset inputs when tab or symbol changes
  useEffect(() => {
    setAmount('');
    setTotal('');
    setSliderValue(0);
  }, [activeTab, selectedSymbol]);

  const handleAmountChange = (val: string) => {
    setAmount(val);
    const numVal = parseFloat(val);
    if (!isNaN(numVal)) {
      setTotal((numVal * currentPrice).toFixed(2));
      if (maxAmount > 0) {
        setSliderValue(Math.min(100, (numVal / maxAmount) * 100));
      }
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
      if (maxAmount > 0) {
        setSliderValue(Math.min(100, (newAmount / maxAmount) * 100));
      }
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

  const fillMax = () => {
    setSliderValue(100);
    setAmount(maxAmount.toFixed(6));
    setTotal((maxAmount * currentPrice).toFixed(2));
  };

  // Fix: handleTrade must be async and await executeTrade since it returns a Promise
  const handleTrade = async () => {
      const numAmount = parseFloat(amount);
      if (isNaN(numAmount) || numAmount <= 0) return;

      const result = await executeTrade(activeTab, selectedSymbol, numAmount, currentPrice);
      setTradeMessage({
          text: result.message,
          type: result.success ? 'success' : 'error'
      });
      
      if(result.success) {
        setAmount('');
        setTotal('');
        setSliderValue(0);
      }

      setTimeout(() => setTradeMessage(null), 3000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-1 min-h-[calc(100vh-64px)] bg-[#0b0e11] p-1">
      {/* Left Column: Order Book */}
      <div className="hidden lg:flex flex-col bg-binance-black p-2 rounded-sm border border-binance-gray/20 col-span-1 h-full overflow-hidden">
        <h3 className="text-binance-subtext text-xs font-semibold mb-2 px-2">{t.order_book}</h3>
        <div className="grid grid-cols-3 text-[10px] text-binance-subtext mb-1 px-2">
          <span>{t.price}(USDT)</span>
          <span className="text-right">{t.amount}({selectedSymbol})</span>
          <span className="text-right">{t.total}</span>
        </div>
        
        <div className="flex-1 overflow-hidden flex flex-col justify-end pb-1">
          {asks.slice(0, 15).reverse().map((order, i) => (
            <div key={`ask-${i}`} className="grid grid-cols-3 text-xs py-0.5 px-2 hover:bg-binance-gray/20 cursor-pointer relative group">
              <div className="absolute right-0 top-0 bottom-0 bg-binance-red/10 w-0 group-hover:w-full transition-all duration-200" />
              <span className="text-binance-red font-mono relative z-10">{order.price.toFixed(selectedSymbol === 'DMC' ? 4 : 2)}</span>
              <span className="text-right text-white font-mono relative z-10">{order.amount.toFixed(4)}</span>
              <span className="text-right text-binance-subtext font-mono relative z-10">{order.total.toFixed(2)}</span>
            </div>
          ))}
        </div>

        <div className="py-3 border-y border-binance-gray/30 my-1 px-2 flex items-center gap-2">
          <span className={`text-lg font-bold font-mono ${currentPrice > 0 ? 'text-binance-text' : 'text-binance-subtext'}`}>
              {currentPrice > 0 ? currentPrice.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: selectedSymbol === 'DMC' ? 4 : 2}) : 'Loading...'}
          </span>
          {currentPrice > 0 && <span className="text-xs text-binance-subtext">≈ ${currentPrice.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>}
        </div>

        <div className="flex-1 overflow-hidden pt-1">
          {bids.slice(0, 15).map((order, i) => (
            <div key={`bid-${i}`} className="grid grid-cols-3 text-xs py-0.5 px-2 hover:bg-binance-gray/20 cursor-pointer relative group">
               <div className="absolute right-0 top-0 bottom-0 bg-binance-green/10 w-0 group-hover:w-full transition-all duration-200" />
              <span className="text-binance-green font-mono relative z-10">{order.price.toFixed(selectedSymbol === 'DMC' ? 4 : 2)}</span>
              <span className="text-right text-white font-mono relative z-10">{order.amount.toFixed(4)}</span>
              <span className="text-right text-binance-subtext font-mono relative z-10">{order.total.toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Middle Column: Chart */}
      <div className="col-span-1 lg:col-span-2 flex flex-col gap-1">
        <div className="bg-binance-black p-4 flex justify-between items-center border-b lg:border-none border-binance-gray/20">
            <div className="flex flex-col relative">
                <div 
                    className="flex items-center gap-2 cursor-pointer hover:bg-binance-gray/30 p-1 rounded transition-colors group"
                    onClick={() => setIsPairDropdownOpen(!isPairDropdownOpen)}
                >
                    <h1 className="text-xl font-bold text-white">{selectedSymbol}/USDT</h1>
                    <ChevronDown size={16} className="text-binance-subtext group-hover:text-white" />
                    {selectedSymbol === 'BTC' && <span className="text-xs bg-binance-gray text-binance-yellow px-1 rounded">Bitcoin</span>}
                    {selectedSymbol === 'DMC' && <span className="text-xs bg-binance-yellow text-black px-1 rounded font-bold">DramCoin</span>}
                </div>
                
                {isPairDropdownOpen && (
                    <div className="absolute top-full left-0 mt-2 w-64 bg-[#1e2026] border border-binance-gray rounded shadow-xl z-50 max-h-80 overflow-y-auto">
                        <div className="p-2 sticky top-0 bg-[#1e2026] border-b border-binance-gray">
                            <div className="relative">
                                <Search size={14} className="absolute left-3 top-2.5 text-binance-subtext" />
                                <input 
                                    type="text" 
                                    placeholder="Search..." 
                                    className="w-full bg-binance-black text-white text-xs py-2 pl-8 pr-2 rounded border border-transparent focus:border-binance-yellow focus:outline-none"
                                    onClick={(e) => e.stopPropagation()}
                                />
                            </div>
                        </div>
                        {marketData.map((coin) => (
                            <div 
                                key={coin.symbol}
                                onClick={() => {
                                    setSelectedSymbol(coin.symbol);
                                    setIsPairDropdownOpen(false);
                                }}
                                className={`flex justify-between items-center px-4 py-2 hover:bg-binance-gray/30 cursor-pointer ${selectedSymbol === coin.symbol ? 'bg-binance-gray/50' : ''}`}
                            >
                                <div className="flex items-center gap-2">
                                     <span className="font-bold text-sm text-white">{coin.symbol}</span>
                                     <span className="text-xs text-binance-subtext">/USDT</span>
                                </div>
                                <span className={`text-sm ${coin.change24h >= 0 ? 'text-binance-green' : 'text-binance-red'}`}>
                                    {coin.price.toFixed(coin.symbol === 'DMC' ? 4 : 2)}
                                </span>
                            </div>
                        ))}
                    </div>
                )}

                <div className="flex items-center gap-4 text-xs mt-1">
                    <span className={`font-mono ${currentPrice > 0 ? 'text-binance-green' : 'text-white'}`}>{currentPrice.toFixed(selectedSymbol === 'DMC' ? 4 : 2)}</span>
                    <span className="text-binance-subtext">24h Vol: {marketData.find(c => c.symbol === 'DMC' && selectedSymbol === 'DMC' ? c : c.symbol === selectedSymbol)?.volume || '...'}</span>
                </div>
            </div>
        </div>

        <div className="flex-1 bg-binance-black p-2 border border-binance-gray/20 rounded-sm min-h-[400px]">
          {chartData.length > 0 ? <ChartWidget data={chartData} /> : <div className="h-full flex items-center justify-center text-binance-subtext">Loading Chart Data...</div>}
        </div>
      </div>

      {/* Right Column: Trade Form & Order History */}
      <div className="flex flex-col gap-1 col-span-1">
        <div className="bg-binance-black p-4 border border-binance-gray/20 rounded-sm">
           <div className="flex gap-0 bg-binance-dark p-1 rounded mb-6">
               <button 
                  onClick={() => setActiveTab('buy')}
                  className={`flex-1 py-2 text-sm font-bold rounded transition-colors ${activeTab === 'buy' ? 'bg-binance-green text-white' : 'text-binance-subtext hover:text-white'}`}
               >
                   {t.buy}
               </button>
               <button 
                  onClick={() => setActiveTab('sell')}
                  className={`flex-1 py-2 text-sm font-bold rounded transition-colors ${activeTab === 'sell' ? 'bg-binance-red text-white' : 'text-binance-subtext hover:text-white'}`}
               >
                   {t.sell}
               </button>
           </div>

           <div className="space-y-4">
               <div className="flex justify-between text-xs text-binance-subtext mb-1">
                   <span>{t.available}</span>
                   <button 
                      onClick={fillMax}
                      className="text-white font-mono hover:text-binance-yellow transition-colors"
                   >
                       {activeTab === 'buy' 
                          ? `${usdtBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDT` 
                          : `${coinBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })} ${selectedSymbol}`}
                   </button>
               </div>

               <div className="relative">
                   <label className="absolute left-3 top-2.5 text-xs text-binance-subtext">{t.price}</label>
                   <input 
                      type="number" 
                      readOnly 
                      value={currentPrice.toFixed(selectedSymbol === 'DMC' ? 4 : 2)} 
                      className="w-full bg-binance-dark border border-binance-gray rounded h-10 px-3 text-right text-white pt-4 text-sm focus:border-binance-yellow focus:outline-none opacity-80 cursor-not-allowed" 
                  />
                   <span className="absolute right-3 top-3 text-xs text-white">USDT</span>
               </div>

               <div className="relative">
                   <label className="absolute left-3 top-2.5 text-xs text-binance-subtext">{t.amount}</label>
                   <input 
                      type="number" 
                      value={amount}
                      onChange={(e) => handleAmountChange(e.target.value)}
                      className="w-full bg-binance-dark border border-binance-gray rounded h-10 px-3 text-right text-white pt-4 text-sm focus:border-binance-yellow focus:outline-none" 
                      placeholder="0.00" 
                  />
                   <span className="absolute right-3 top-3 text-xs text-white">{selectedSymbol}</span>
               </div>
               
               <div className="relative py-2">
                   <input 
                      type="range" 
                      min="0" 
                      max="100" 
                      value={sliderValue} 
                      onChange={handleSliderChange}
                      className="w-full h-1 bg-binance-gray rounded-lg appearance-none cursor-pointer accent-binance-subtext hover:accent-binance-yellow"
                   />
                   <div className="flex justify-between mt-1">
                      {[0, 25, 50, 75, 100].map((step) => (
                          <div 
                            key={step} 
                            className={`w-2 h-2 rounded-full cursor-pointer ${sliderValue >= step ? 'bg-binance-text' : 'bg-binance-gray'}`}
                            onClick={() => handleSliderChange({ target: { value: step.toString() } } as any)}
                          />
                      ))}
                   </div>
               </div>

               <div className="relative">
                   <label className="absolute left-3 top-2.5 text-xs text-binance-subtext">{t.total}</label>
                   <input 
                      type="number" 
                      value={total}
                      onChange={(e) => handleTotalChange(e.target.value)}
                      className="w-full bg-binance-dark border border-binance-gray rounded h-10 px-3 text-right text-white pt-4 text-sm focus:border-binance-yellow focus:outline-none" 
                      placeholder="0.00" 
                  />
                   <span className="absolute right-3 top-3 text-xs text-white">USDT</span>
               </div>

               {tradeMessage && (
                   <div className={`text-xs p-2 rounded ${tradeMessage.type === 'success' ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400'}`}>
                       {tradeMessage.text}
                   </div>
               )}

               {user.isLoggedIn ? (
                   <button 
                      onClick={handleTrade}
                      className={`w-full py-3 rounded font-bold text-white mt-4 transition-transform active:scale-95 ${activeTab === 'buy' ? 'bg-binance-green hover:bg-green-600' : 'bg-binance-red hover:bg-red-600'}`}
                   >
                       {activeTab === 'buy' ? `${t.buy} ${selectedSymbol}` : `${t.sell} ${selectedSymbol}`}
                   </button>
               ) : (
                   <div className="bg-binance-gray/30 p-3 rounded text-center mt-4 border border-binance-gray/50">
                       <span className="text-sm text-binance-subtext font-medium">{t.login_msg}</span>
                   </div>
               )}
           </div>
        </div>

        {/* Recent Orders Section */}
        <div className="flex-1 bg-binance-black border border-binance-gray/20 rounded-sm overflow-hidden flex flex-col">
          <div className="p-3 border-b border-binance-gray/20 flex items-center justify-between">
            <h3 className="text-xs font-bold text-white flex items-center gap-2">
              <History size={14} className="text-binance-yellow" />
              {t.recent_orders}
            </h3>
          </div>
          <div className="flex-1 overflow-y-auto max-h-[300px]">
            <table className="w-full text-left text-[10px]">
              <thead className="sticky top-0 bg-binance-black text-binance-subtext uppercase font-bold border-b border-binance-gray/10">
                <tr>
                  <th className="p-2">{t.type}</th>
                  <th className="p-2 text-right">{t.amount}</th>
                  <th className="p-2 text-right">{t.price}</th>
                  <th className="p-2 text-right">{t.total}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-binance-gray/5">
                {recentOrders.length > 0 ? (
                  recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-binance-gray/10 transition-colors">
                      <td className={`p-2 font-bold ${order.type === 'buy' ? 'text-binance-green' : 'text-binance-red'}`}>
                        {order.type === 'buy' ? t.buy : t.sell}
                      </td>
                      <td className="p-2 text-right text-white font-mono">
                        {order.amount.toFixed(4)}
                      </td>
                      <td className="p-2 text-right text-binance-subtext font-mono">
                        {currentPrice.toFixed(selectedSymbol === 'DMC' ? 4 : 2)}
                      </td>
                      <td className="p-2 text-right text-white font-mono">
                        {(order.amount * currentPrice).toFixed(2)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-binance-subtext">
                      {language === 'AM' ? 'Պատվերներ չկան' : 'No orders yet'}
                    </td>
                  </tr>
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
