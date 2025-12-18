
import React, { useEffect, useState } from 'react';
import Navbar from './components/Navbar';
import MarketTable from './components/MarketTable';
import TradingView from './components/TradingView';
import AIAssistant from './components/AIAssistant';
import WalletView from './components/WalletView';
import EarnView from './components/EarnView';
import AdminDashboard from './components/AdminDashboard';
import AdminLogin from './components/AdminLogin';
import AuthView from './components/AuthView';
import VerificationView from './components/VerificationView';
import WhitepaperView from './components/WhitepaperView';
import Footer from './components/Footer';
import ToastContainer from './components/ToastContainer';
import { HeroSection, FeaturesSection, TokenomicsSection, RoadmapSection, CalculatorSection, TeamSection } from './components/LandingSections';
import { ViewState } from './types';
import { StoreProvider, useStore } from './context/StoreContext';
import { translations } from './translations';
import { Loader2, Zap } from 'lucide-react';

const AppContent: React.FC = () => {
  const { user, language, setSelectedSymbol, currentView, setView, isLoading, isAdminAuthenticated } = useStore();
  const [isMounting, setIsMounting] = useState(true);

  // Automatic redirect if user is logged in but stuck on AUTH view
  useEffect(() => {
    if (user.isLoggedIn && currentView === ViewState.AUTH) {
      setTimeout(() => setView(ViewState.HOME), 300);
    }
  }, [user.isLoggedIn, currentView, setView]);

  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => setIsMounting(false), 500);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0b0e11] flex flex-col items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-binance-yellow/10 via-transparent to-transparent"></div>
        <div className="relative z-10 flex flex-col items-center">
            <div className="w-24 h-24 bg-binance-yellow rounded-[2rem] flex items-center justify-center text-black shadow-[0_0_50px_rgba(252,213,53,0.3)] animate-bounce mb-8">
               <span className="text-5xl font-black">֏</span>
            </div>
            <div className="flex flex-col items-center gap-2">
                <p className="text-white text-xl font-black uppercase tracking-[0.2em]">DramCoin Hub</p>
                <div className="flex items-center gap-2 text-binance-subtext font-bold text-sm">
                   <Loader2 className="animate-spin text-binance-yellow" size={16} />
                   <span className="animate-pulse">Initializing Security Protocol...</span>
                </div>
            </div>
        </div>
      </div>
    );
  }

  const renderView = () => {
    switch(currentView) {
      case ViewState.AUTH: return <AuthView />;
      case ViewState.VERIFY: return <VerificationView />;
      case ViewState.WHITEPAPER: return <WhitepaperView />;
      case ViewState.ADMIN: return isAdminAuthenticated ? <AdminDashboard /> : <AdminLogin />;
      case ViewState.TRADE: return <div className="min-h-screen pt-[72px]"><TradingView /></div>;
      case ViewState.EARN: return <EarnView />;
      case ViewState.MARKETS: return (
        <div className="container mx-auto px-4 py-8 pt-[100px] min-h-screen">
          <MarketTable onTradeClick={(s) => { setSelectedSymbol(s); setView(ViewState.TRADE); }} />
        </div>
      );
      case ViewState.WALLET: return <div className="min-h-screen pt-[72px]"><WalletView /></div>;
      case ViewState.HOME:
      default: return (
        <>
          <HeroSection onBuyClick={() => { setSelectedSymbol('DMC'); setView(ViewState.TRADE); }} />
          <FeaturesSection />
          <TokenomicsSection />
          <RoadmapSection />
          <TeamSection />
          <CalculatorSection />
          <Footer />
        </>
      );
    }
  };

  const showNavbar = currentView !== ViewState.ADMIN && currentView !== ViewState.AUTH && currentView !== ViewState.VERIFY;

  return (
    <div className={`min-h-screen bg-[#181a20] text-[#eaecef] font-sans transition-opacity duration-1000 ${isMounting ? 'opacity-0' : 'opacity-100'}`}>
      {showNavbar && <Navbar />}
      <ToastContainer />
      <main className="animate-page-transition">{renderView()}</main>
      {showNavbar && <AIAssistant />}
      
      <style>{`
        @keyframes page-transition {
          from { opacity: 0; transform: scale(0.98) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .animate-page-transition {
          animation: page-transition 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <StoreProvider>
      <AppContent />
    </StoreProvider>
  );
};

export default App;
