import React from 'react';
import { Twitter, Send, Disc, Github, Linkedin } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { translations } from '../translations';

const Footer: React.FC = () => {
  const { language } = useStore();
  const t = translations[language].footer;

  return (
    <footer className="bg-binance-black border-t border-binance-gray pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-binance-yellow flex items-center justify-center text-black font-bold">֏</div>
              <span className="text-xl font-bold text-white">DRAM<span className="text-binance-yellow">COIN</span></span>
            </div>
            <p className="text-binance-subtext text-sm leading-relaxed">
              {t.desc}
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-white font-bold mb-4">{t.ecosystem}</h4>
            <ul className="space-y-2 text-sm text-binance-subtext">
              <li><a href="#" className="hover:text-binance-yellow">Exchange</a></li>
              <li><a href="#" className="hover:text-binance-yellow">Wallet</a></li>
              <li><a href="#" className="hover:text-binance-yellow">Staking</a></li>
              <li><a href="#" className="hover:text-binance-yellow">Explorer</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-4">{t.support}</h4>
            <ul className="space-y-2 text-sm text-binance-subtext">
              <li><a href="#" className="hover:text-binance-yellow">Help Center</a></li>
              <li><a href="#" className="hover:text-binance-yellow">API Documentation</a></li>
              <li><a href="#" className="hover:text-binance-yellow">Fees</a></li>
              <li><a href="#" className="hover:text-binance-yellow">Contact Us</a></li>
            </ul>
          </div>

          {/* Community */}
          <div>
            <h4 className="text-white font-bold mb-4">{t.community}</h4>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-lg bg-binance-gray flex items-center justify-center text-binance-subtext hover:bg-binance-yellow hover:text-black transition-colors">
                <Twitter size={20} />
              </a>
              <a href="#" className="w-10 h-10 rounded-lg bg-binance-gray flex items-center justify-center text-binance-subtext hover:bg-binance-yellow hover:text-black transition-colors">
                <Send size={20} />
              </a>
              <a href="#" className="w-10 h-10 rounded-lg bg-binance-gray flex items-center justify-center text-binance-subtext hover:bg-binance-yellow hover:text-black transition-colors">
                <Disc size={20} />
              </a>
              <a href="#" className="w-10 h-10 rounded-lg bg-binance-gray flex items-center justify-center text-binance-subtext hover:bg-binance-yellow hover:text-black transition-colors">
                <Github size={20} />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-binance-gray pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-binance-subtext">
          <p>{t.rights}</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-white">Privacy Policy</a>
            <a href="#" className="hover:text-white">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;