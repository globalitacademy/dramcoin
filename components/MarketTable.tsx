import React from 'react';
import { ViewState } from '../types';
import { useStore } from '../context/StoreContext';
import { translations } from '../translations';

interface MarketTableProps {
  onTradeClick: (symbol: string) => void;
}

const MarketTable: React.FC<MarketTableProps> = ({ onTradeClick }) => {
  const { language, marketData } = useStore();
  const t = translations[language].market;

  return (
    <div className="w-full overflow-x-auto bg-binance-black rounded-xl p-4 md:p-6 shadow-lg border border-binance-gray">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white">{t.title}</h2>
        <span className="text-binance-subtext text-sm cursor-pointer hover:text-binance-yellow">{t.view_all} &rarr;</span>
      </div>
      
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="text-binance-subtext text-xs border-b border-binance-gray">
            <th className="py-4 pl-4 font-medium">{t.table_name}</th>
            <th className="py-4 font-medium text-right">{t.table_price}</th>
            <th className="py-4 font-medium text-right">{t.table_change}</th>
            <th className="py-4 font-medium text-right hidden md:table-cell">{t.table_vol}</th>
            <th className="py-4 font-medium text-right hidden lg:table-cell">{t.table_cap}</th>
            <th className="py-4 pr-4 font-medium text-right">{t.table_action}</th>
          </tr>
        </thead>
        <tbody>
          {marketData.map((coin) => (
            <tr key={coin.id} className="hover:bg-binance-gray/30 transition-colors border-b border-binance-gray/20 last:border-0 group">
              <td className="py-4 pl-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center text-xs font-bold text-white">
                    {coin.symbol[0]}
                  </div>
                  <div>
                    <div className="font-semibold text-white">{coin.symbol}</div>
                    <div className="text-xs text-binance-subtext">{coin.name}</div>
                  </div>
                </div>
              </td>
              <td className="py-4 text-right text-white font-medium">
                ${coin.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </td>
              <td className={`py-4 text-right font-medium ${coin.change24h >= 0 ? 'text-binance-green' : 'text-binance-red'}`}>
                {coin.change24h > 0 ? '+' : ''}{coin.change24h}%
              </td>
              <td className="py-4 text-right text-white hidden md:table-cell">{coin.volume}</td>
              <td className="py-4 text-right text-white hidden lg:table-cell">{coin.marketCap}</td>
              <td className="py-4 pr-4 text-right">
                <button 
                  onClick={() => onTradeClick(coin.symbol)}
                  className="text-binance-yellow hover:text-white text-sm font-medium transition-colors"
                >
                  {t.table_action}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MarketTable;