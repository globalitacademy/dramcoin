
import React, { useEffect, useState, useRef } from 'react';
import { ViewState, CoinData } from '../types';
import { useStore } from '../context/StoreContext';
import { translations } from '../translations';

interface MarketTableProps {
  onTradeClick: (symbol: string) => void;
}

const MarketTableRow: React.FC<{ coin: CoinData; t: any; onTradeClick: (s: string) => void }> = ({ coin, t, onTradeClick }) => {
  const [flash, setFlash] = useState<'up' | 'down' | null>(null);
  const prevPrice = useRef(coin.price);

  useEffect(() => {
    if (coin.price > prevPrice.current) {
      setFlash('up');
      const timer = setTimeout(() => setFlash(null), 1000);
      return () => clearTimeout(timer);
    } else if (coin.price < prevPrice.current) {
      setFlash('down');
      const timer = setTimeout(() => setFlash(null), 1000);
      return () => clearTimeout(timer);
    }
    prevPrice.current = coin.price;
  }, [coin.price]);

  return (
    <tr className={`transition-colors duration-500 border-b border-binance-gray/20 last:border-0 group ${
      flash === 'up' ? 'bg-binance-green/10' : flash === 'down' ? 'bg-binance-red/10' : 'hover:bg-binance-gray/30'
    }`}>
      <td className="py-4 pl-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center text-xs font-bold text-white ring-1 ring-binance-gray group-hover:ring-binance-yellow transition-all">
            {coin.symbol[0]}
          </div>
          <div>
            <div className="font-semibold text-white group-hover:text-binance-yellow transition-colors">{coin.symbol}</div>
            <div className="text-xs text-binance-subtext">{coin.name}</div>
          </div>
        </div>
      </td>
      <td className="py-4 text-right text-white font-mono font-medium">
        <span className={`transition-colors duration-300 ${flash === 'up' ? 'text-binance-green' : flash === 'down' ? 'text-binance-red' : ''}`}>
          ${coin.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      </td>
      <td className={`py-4 text-right font-medium ${coin.change24h >= 0 ? 'text-binance-green' : 'text-binance-red'}`}>
        {coin.change24h > 0 ? '+' : ''}{coin.change24h}%
      </td>
      <td className="py-4 text-right text-white hidden md:table-cell font-mono">{coin.volume}</td>
      <td className="py-4 text-right text-white hidden lg:table-cell font-mono">{coin.marketCap}</td>
      <td className="py-4 pr-4 text-right">
        <button 
          onClick={() => onTradeClick(coin.symbol)}
          className="bg-binance-gray hover:bg-binance-yellow hover:text-black px-4 py-1.5 rounded-lg text-binance-yellow text-sm font-bold transition-all active:scale-95"
        >
          {t.table_action}
        </button>
      </td>
    </tr>
  );
};

const MarketTable: React.FC<MarketTableProps> = ({ onTradeClick }) => {
  const { language, marketData } = useStore();
  const t = translations[language].market;

  return (
    <div className="w-full overflow-x-auto bg-binance-black rounded-[24px] p-4 md:p-6 shadow-2xl border border-binance-gray/50 backdrop-blur-sm">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-black text-white uppercase tracking-tight">{t.title}</h2>
          <p className="text-xs text-binance-subtext">{t.subtitle}</p>
        </div>
        <span className="text-binance-yellow text-sm font-bold cursor-pointer hover:underline flex items-center gap-1 group">
          {t.view_all} <span className="group-hover:translate-x-1 transition-transform">→</span>
        </span>
      </div>
      
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="text-binance-subtext text-[10px] uppercase tracking-widest border-b border-binance-gray/50">
            <th className="py-4 pl-4 font-black">{t.table_name}</th>
            <th className="py-4 font-black text-right">{t.table_price}</th>
            <th className="py-4 font-black text-right">{t.table_change}</th>
            <th className="py-4 font-black text-right hidden md:table-cell">{t.table_vol}</th>
            <th className="py-4 font-black text-right hidden lg:table-cell">{t.table_cap}</th>
            <th className="py-4 pr-4 font-black text-right">{t.table_action}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-binance-gray/10">
          {marketData.map((coin) => (
            <MarketTableRow key={coin.id} coin={coin} t={t} onTradeClick={onTradeClick} />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MarketTable;
