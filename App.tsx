
import React from 'react';
import Navbar from './components/Navbar';
import MarketTable from './components/MarketTable';
import TradingView from './components/TradingView';
import AIAssistant from './components/AIAssistant';
import WalletView from './components/WalletView';
import AdminDashboard from './components/AdminDashboard';
import AdminLogin from './components/AdminLogin';
import AuthView from './components/AuthView';
import Footer from './components/Footer';
import { HeroSection, FeaturesSection, TokenomicsSection, RoadmapSection, CalculatorSection, TeamSection } from './components/LandingSections';
import { ViewState } from './types';
import { StoreProvider, useStore } from './context/StoreContext';
import { translations } from './translations';

const AppContent: React.FC = () => {
  const { language, setSelectedSymbol, currentView, setView, user, isAdminAuthenticated } = useStore();
  const t = translations[language].market;

  const renderView = () => {
    switch(currentView) {
      case ViewState.AUTH:
        return <AuthView />;
      case ViewState.ADMIN:
        return isAdminAuthenticated ? <AdminDashboard /> : <AdminLogin />;
      case ViewState.TRADE:
        return (
          <div className="min-h-screen pt-[72px]">
             <TradingView />
          </div>
        );
      case ViewState.MARKETS:
        return (
          <div className="container mx-auto px-4 py-8 animate-fade-in pt-[100px] min-h-screen">
            <div className="bg-binance-black p-8 rounded-2xl border border-binance-gray mb-8 shadow-xl">
                <h1 className="text-3xl md:text-4xl font-bold mb-4 text-white">{t.title}</h1>
                <p className="text-binance-subtext text-lg">{t.subtitle}</p>
            </div>
            <MarketTable onTradeClick={(symbol) => {
                setSelectedSymbol(symbol);
                setView(ViewState.TRADE);
            }} />
          </div>
        );
      case ViewState.WALLET:
        return (
          <div className="min-h-screen pt-[72px]">
            <WalletView />
          </div>
        );
      case ViewState.HOME:
      default:
        return (
          <div className="animate-fade-in">
             <HeroSection onBuyClick={() => {
                 setSelectedSymbol('DMC');
                 setView(ViewState.TRADE);
             }} />
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

  const showNavbar = currentView !== ViewState.ADMIN && currentView !== ViewState.AUTH;

  return (
    <div className="min-h-screen bg-[#181a20] text-[#eaecef] font-sans">
      {showNavbar && <Navbar />}
      
      <main>
        {renderView()}
      </main>

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
