
import React from 'react';
import { Twitter, Send, Disc, Github, Shield } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { translations } from '../translations';
import { ViewState } from '../types';

const Footer: React.FC = () => {
  const { language, setView } = useStore();
  const t = translations[language].footer;

  const handleNav = (view: ViewState, sectionId?: string) => {
    setView(view);
    if (sectionId) {
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        el?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-binance-black border-t border-binance-gray pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="col-span-1 md:col-span-1">
            <button 
              onClick={() => handleNav(ViewState.HOME)}
              className="flex items-center gap-2 mb-4 hover:opacity-80 transition-opacity"
            >
              <div className="w-8 h-8 rounded-full bg-binance-yellow flex items-center justify-center text-black font-bold">֏</div>
              <span className="text-xl font-bold text-white">DRAM<span className="text-binance-yellow">COIN</span></span>
            </button>
            <p className="text-binance-subtext text-sm leading-relaxed">
              {t.desc}
            </p>
          </div>

          {/* Ecosystem Links */}
          <div>
            <h4 className="text-white font-bold mb-4">{t.ecosystem}</h4>
            <ul className="space-y-2 text-sm text-binance-subtext">
              <li>
                <button onClick={() => setView(ViewState.TRADE)} className="hover:text-binance-yellow transition-colors text-left">
                  {language === 'AM' ? 'Բորսա (Trade)' : 'Exchange'}
                </button>
              </li>
              <li>
                <button onClick={() => setView(ViewState.MARKETS)} className="hover:text-binance-yellow transition-colors text-left">
                  {language === 'AM' ? 'Շուկաներ' : 'Markets'}
                </button>
              </li>
              <li>
                <button onClick={() => setView(ViewState.WALLET)} className="hover:text-binance-yellow transition-colors text-left">
                  {language === 'AM' ? 'Դրամապանակ' : 'Wallet'}
                </button>
              </li>
              <li>
                <button onClick={() => handleNav(ViewState.HOME, 'tokenomics')} className="hover:text-binance-yellow transition-colors text-left">
                  {language === 'AM' ? 'Տոկենոմիկա' : 'Tokenomics'}
                </button>
              </li>
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h4 className="text-white font-bold mb-4">{t.support}</h4>
            <ul className="space-y-2 text-sm text-binance-subtext">
              <li>
                <button onClick={() => handleNav(ViewState.HOME, 'hero')} className="hover:text-binance-yellow transition-colors text-left">
                  {language === 'AM' ? 'Օգնության կենտրոն' : 'Help Center'}
                </button>
              </li>
              <li>
                <button onClick={() => setView(ViewState.ADMIN)} className="flex items-center gap-1 hover:text-binance-yellow transition-colors text-left">
                  <Shield size={14} /> {t.admin}
                </button>
              </li>
              <li>
                <button className="hover:text-binance-yellow transition-colors text-left">
                  {language === 'AM' ? 'Միջնորդավճարներ' : 'Fees'}
                </button>
              </li>
              <li>
                <button className="hover:text-binance-yellow transition-colors text-left">
                  {language === 'AM' ? 'Կապ մեզ հետ' : 'Contact Us'}
                </button>
              </li>
            </ul>
          </div>

          {/* Community */}
          <div>
            <h4 className="text-white font-bold mb-4">{t.community}</h4>
            <div className="flex gap-4">
              <a href="https://twitter.com" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-lg bg-binance-gray flex items-center justify-center text-binance-subtext hover:bg-binance-yellow hover:text-black transition-colors">
                <Twitter size={20} />
              </a>
              <a href="https://telegram.org" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-lg bg-binance-gray flex items-center justify-center text-binance-subtext hover:bg-binance-yellow hover:text-black transition-colors">
                <Send size={20} />
              </a>
              <a href="https://discord.com" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-lg bg-binance-gray flex items-center justify-center text-binance-subtext hover:bg-binance-yellow hover:text-black transition-colors">
                <Disc size={20} />
              </a>
              <a href="https://github.com" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-lg bg-binance-gray flex items-center justify-center text-binance-subtext hover:bg-binance-yellow hover:text-black transition-colors">
                <Github size={20} />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-binance-gray pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-binance-subtext">
          <p>{t.rights}</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <button className="hover:text-white transition-colors">Privacy Policy</button>
            <button className="hover:text-white transition-colors">Terms of Service</button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
