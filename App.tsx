
import React from 'react';
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
import { Loader2 } from 'lucide-react';

const AppContent: React.FC = () => {
  const { language, setSelectedSymbol, currentView, setView, isLoading, isAdminAuthenticated } = useStore();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-binance-dark flex flex-col items-center justify-center">
        <div className="w-16 h-16 bg-binance-yellow/20 rounded-3xl flex items-center justify-center mb-4">
           <Loader2 className="animate-spin text-binance-yellow" size={32} />
        </div>
        <p className="text-binance-subtext font-bold animate-pulse">Initializing DramCoin Hub...</p>
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
        <div className="container mx-auto px-4 py-8 animate-fade-in pt-[100px] min-h-screen">
          <MarketTable onTradeClick={(s) => { setSelectedSymbol(s); setView(ViewState.TRADE); }} />
        </div>
      );
      case ViewState.WALLET: return <div className="min-h-screen pt-[72px]"><WalletView /></div>;
      case ViewState.HOME:
      default: return (
        <div className="animate-fade-in">
          <HeroSection onBuyClick={() => { setSelectedSymbol('DMC'); setView(ViewState.TRADE); }} />
          <FeaturesSection />
          <TokenomicsSection />
          <RoadmapSection />
          <TeamSection />
          <CalculatorSection />
          <Footer />
        </div>
      );
    }
  };

  const showNavbar = currentView !== ViewState.ADMIN && currentView !== ViewState.AUTH && currentView !== ViewState.VERIFY;

  return (
    <div className="min-h-screen bg-[#181a20] text-[#eaecef] font-sans">
      {showNavbar && <Navbar />}
      <ToastContainer />
      <main>{renderView()}</main>
      {showNavbar && <AIAssistant />}
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
