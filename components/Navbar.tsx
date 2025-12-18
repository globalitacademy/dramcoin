
import React, { useState } from 'react';
import { ViewState } from '../types';
import { useStore } from '../context/StoreContext';
import { Menu, Globe, Wallet, LogOut, X, ChevronDown, User as UserIcon, Zap } from 'lucide-react';
import { translations } from '../translations';

const Navbar: React.FC = () => {
  const { user, logout, language, setLanguage, setView } = useStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const t = translations[language].nav;

  const navLinks = [
    { name: t.home, view: ViewState.HOME, sectionId: 'hero' },
    { name: t.markets, view: ViewState.MARKETS },
    { name: t.trade, view: ViewState.TRADE },
    { name: t.earn, view: ViewState.EARN },
  ];

  const handleNavClick = (view: ViewState, sectionId?: string) => {
    setView(view);
    setIsMobileMenuOpen(false);
    if (view === ViewState.HOME && sectionId) {
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) element.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-binance-black/90 backdrop-blur-md border-b border-binance-gray">
      <div className="container mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
        
        <div 
          className="flex items-center gap-2 cursor-pointer group"
          onClick={() => setView(ViewState.HOME)}
        >
          <div className="w-10 h-10 rounded-full bg-gradient-to-b from-[#fcd535] to-[#fbc02d] flex items-center justify-center text-black shadow-[0_0_15px_rgba(252,213,53,0.4)] border border-[#f9a825] group-hover:scale-105 transition-transform">
             <span className="text-2xl font-bold leading-none pb-1">֏</span>
          </div>
          <div className="flex flex-col leading-none">
            <span className="tracking-wide text-lg font-bold text-white">DRAM<span className="text-binance-yellow">COIN</span></span>
          </div>
        </div>

        <div className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <button
              key={link.name}
              onClick={() => handleNavClick(link.view, link.sectionId)}
              className="text-sm font-medium text-binance-text hover:text-binance-yellow transition-colors uppercase tracking-wider flex items-center gap-1"
            >
              {link.view === ViewState.EARN && <Zap size={14} className="text-binance-yellow" />}
              {link.name}
            </button>
          ))}
        </div>

        <div className="hidden lg:flex items-center gap-4">
          {!user.isLoggedIn ? (
            <div className="flex items-center gap-3">
                <button onClick={() => setView(ViewState.AUTH)} className="text-sm font-bold text-white hover:text-binance-yellow px-2">{t.login}</button>
                <button 
                  onClick={() => setView(ViewState.AUTH)}
                  className="bg-gradient-to-r from-binance-yellow to-[#fbc02d] text-black px-6 py-2 rounded-lg font-bold text-sm hover:shadow-[0_0_15px_rgba(252,213,53,0.3)] transition-all"
                >
                  {t.register}
                </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
               <button 
                onClick={() => setView(ViewState.WALLET)} 
                className="flex items-center gap-2 bg-binance-gray/50 border border-binance-gray hover:border-binance-yellow px-4 py-2 rounded-xl transition-all"
               >
                 <UserIcon size={16} className="text-binance-yellow" />
                 <span className="text-sm font-bold text-white">{user.username}</span>
               </button>
               <button onClick={logout} className="text-binance-subtext hover:text-binance-red p-2">
                  <LogOut size={18} />
               </button>
            </div>
          )}
        </div>

        <button className="lg:hidden text-white" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {isMobileMenuOpen && (
        <div className="lg:hidden bg-binance-black border-t border-binance-gray p-4 flex flex-col gap-4 absolute w-full left-0 animate-fade-in shadow-2xl">
          {navLinks.map((link) => (
            <button
              key={link.name}
              onClick={() => handleNavClick(link.view, link.sectionId)}
              className="text-left font-medium text-white hover:text-binance-yellow py-2 flex items-center gap-2"
            >
              {link.view === ViewState.EARN && <Zap size={16} className="text-binance-yellow" />}
              {link.name}
            </button>
          ))}
          <div className="h-px w-full bg-binance-gray"></div>
          {!user.isLoggedIn ? (
                <button onClick={() => handleNavClick(ViewState.AUTH)} className="bg-binance-yellow text-black px-6 py-2 rounded-lg font-bold text-sm">
                  {t.login}
                </button>
             ) : (
                <div className="flex items-center gap-4">
                  <button onClick={() => handleNavClick(ViewState.WALLET)} className="flex items-center gap-2 text-white font-bold text-sm">
                    <UserIcon size={16} className="text-binance-yellow" />
                    <span>Իմ հաշիվը</span>
                  </button>
                  <button onClick={logout} className="text-binance-red font-bold text-sm flex items-center gap-1">
                    <LogOut size={16} />
                    {t.logout}
                  </button>
                </div>
             )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
