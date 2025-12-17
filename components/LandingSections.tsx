import React, { useState, useEffect } from 'react';
import { Shield, Zap, Percent, ArrowRight, CheckCircle, Twitter, Linkedin, Github } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useStore } from '../context/StoreContext';
import { translations } from '../translations';
import { ViewState } from '../types';

// --- Hero Section ---
export const HeroSection: React.FC<{ onBuyClick: () => void }> = ({ onBuyClick }) => {
  const { language } = useStore();
  const t = translations[language].hero;

  const TickerItems = () => (
    <>
        <span className="text-white font-bold flex items-center gap-2">
            <span className="text-binance-yellow text-lg">֏</span>
            DRAMCOIN <span className="text-binance-green">$0.54 (+12%)</span>
        </span>
        <span className="text-binance-subtext">BTC $64,230</span>
        <span className="text-binance-subtext">ETH $3,450</span>
        <span className="text-binance-subtext">SOL $145</span>
        <span className="text-binance-subtext">BNB $590</span>
        <span className="text-binance-subtext">XRP $0.62</span>
        <span className="text-binance-subtext">ADA $0.45</span>
        <span className="text-binance-subtext">DOGE $0.12</span>
        <span className="text-binance-subtext">DOT $7.20</span>
        <span className="text-binance-subtext">AVAX $35.4</span>
    </>
  );

  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-[#0b0e11]">
         <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-[#0b0e11] to-[#0b0e11]"></div>
         <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-binance-yellow/5 rounded-full blur-[100px]"></div>
      </div>

      <div className="container mx-auto px-4 grid md:grid-cols-2 gap-12 items-center relative z-10">
        <div className="space-y-6 text-center md:text-left">
          <div className="inline-block px-3 py-1 bg-binance-yellow/10 border border-binance-yellow/30 rounded-full text-binance-yellow text-xs font-bold tracking-wider mb-2">
            {t.badge}
          </div>
          <h1 className="text-5xl md:text-7xl font-bold leading-tight text-white">
            {t.title_prefix && <>{t.title_prefix} <br /></>}
            <span 
              className="text-transparent bg-clip-text bg-gradient-to-r from-binance-yellow to-[#fbc02d] inline-block py-2"
              style={{ WebkitBackgroundClip: 'text', backgroundClip: 'text' }}
            >
              {t.title_main}
            </span> <br />
            {t.title_suffix}
          </h1>
          <p className="text-lg text-binance-subtext max-w-xl mx-auto md:mx-0">
            {t.subtitle}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start pt-4">
            <button 
              onClick={onBuyClick}
              className="px-8 py-4 bg-gradient-to-r from-binance-yellow to-[#fbc02d] text-black font-bold rounded-lg hover:shadow-[0_0_20px_rgba(252,213,53,0.4)] transition-all active:scale-95 text-lg"
            >
              {t.buy_btn}
            </button>
            <button className="px-8 py-4 bg-binance-gray/30 border border-binance-gray text-white font-bold rounded-lg hover:bg-binance-gray/50 transition-colors backdrop-blur-sm">
              {t.whitepaper_btn}
            </button>
          </div>
        </div>

        {/* 3D Coin Animation */}
        <div className="flex justify-center md:justify-end relative">
          <div className="w-[300px] h-[300px] md:w-[450px] md:h-[450px] relative animate-float">
             {/* Glow */}
             <div className="absolute inset-0 bg-binance-yellow/20 rounded-full blur-[60px]"></div>
             <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-2xl" style={{filter: 'drop-shadow(0 20px 30px rgba(0,0,0,0.5))'}}>
                  <defs>
                    <linearGradient id="coinGradientHero" x1="20%" y1="0%" x2="80%" y2="100%">
                      <stop offset="0%" stopColor="#ffee95" />
                      <stop offset="40%" stopColor="#ffd700" />
                      <stop offset="100%" stopColor="#b8860b" />
                    </linearGradient>
                    <linearGradient id="edgeGradientHero" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#b8860b" />
                      <stop offset="50%" stopColor="#ffee95" />
                      <stop offset="100%" stopColor="#b8860b" />
                    </linearGradient>
                  </defs>
                  <circle cx="100" cy="100" r="95" fill="url(#edgeGradientHero)" />
                  <circle cx="100" cy="100" r="90" fill="#2b2100" />
                  <circle cx="100" cy="100" r="88" fill="url(#coinGradientHero)" />
                  <g opacity="0.4" stroke="#7a5c10" strokeWidth="0.8" fill="none">
                    <circle cx="100" cy="100" r="65" />
                    <path d="M100 35 L100 12 M35 100 L12 100 M100 165 L100 188 M165 100 L188 100" />
                    <path d="M60 60 L45 45" /> <circle cx="45" cy="45" r="2" fill="#7a5c10" stroke="none" />
                    <path d="M140 60 L165 60" /> <circle cx="165" cy="60" r="2" fill="#7a5c10" stroke="none" />
                    <path d="M70 145 L55 160" /> <circle cx="55" cy="160" r="2" fill="#7a5c10" stroke="none" />
                    <path d="M130 145 L145 160" /> <circle cx="145" cy="160" r="2" fill="#7a5c10" stroke="none" />
                  </g>
                  <circle cx="100" cy="100" r="60" fill="none" stroke="#b8860b" strokeWidth="1" opacity="0.5" />
                  <text x="50%" y="54%" textAnchor="middle" dominantBaseline="middle" fontSize="100" fontWeight="bold" fill="#7a5c10" fontFamily="sans-serif" transform="translate(2, 2)">֏</text>
                  <text x="50%" y="54%" textAnchor="middle" dominantBaseline="middle" fontSize="100" fontWeight="bold" fill="url(#edgeGradientHero)" fontFamily="sans-serif">֏</text>
                  <ellipse cx="60" cy="60" rx="30" ry="15" fill="white" opacity="0.3" transform="rotate(-45 60 60)" />
             </svg>
          </div>
        </div>
      </div>
      
      {/* Live Ticker Marquee */}
      <div className="absolute bottom-0 w-full bg-binance-gray/50 backdrop-blur-md border-t border-binance-gray py-3 overflow-hidden flex">
         <div className="flex animate-marquee whitespace-nowrap min-w-full shrink-0 justify-around items-center px-4">
             <TickerItems />
         </div>
         <div className="flex animate-marquee whitespace-nowrap min-w-full shrink-0 justify-around items-center px-4">
             <TickerItems />
         </div>
      </div>
    </section>
  );
};

// --- Features Section ---
export const FeaturesSection: React.FC = () => {
    const { language } = useStore();
    const t = translations[language].features;

    const features = [
        { icon: <Shield size={32} />, title: t.f1_title, desc: t.f1_desc },
        { icon: <Zap size={32} />, title: t.f2_title, desc: t.f2_desc },
        { icon: <Percent size={32} />, title: t.f3_title, desc: t.f3_desc },
    ];

    return (
        <section id="features" className="py-20 bg-binance-black">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">{t.title}</h2>
                    <div className="w-20 h-1 bg-binance-yellow mx-auto"></div>
                </div>
                <div className="grid md:grid-cols-3 gap-8">
                    {features.map((f, i) => (
                        <div key={i} className="bg-[#1e2026] p-8 rounded-2xl border border-binance-gray hover:border-binance-yellow transition-all hover:transform hover:-translate-y-2 group">
                            <div className="w-16 h-16 bg-binance-gray/50 rounded-xl flex items-center justify-center text-binance-yellow mb-6 group-hover:bg-binance-yellow group-hover:text-black transition-colors">
                                {f.icon}
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3">{f.title}</h3>
                            <p className="text-binance-subtext leading-relaxed">{f.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

// --- Tokenomics Section ---
export const TokenomicsSection: React.FC = () => {
    const { language } = useStore();
    const t = translations[language].tokenomics;

    const data = [
        { name: t.public, value: 40, color: '#fcd535' },
        { name: t.marketing, value: 25, color: '#0ecb81' },
        { name: t.liquidity, value: 20, color: '#3b82f6' },
        { name: t.team, value: 15, color: '#f6465d' },
    ];

    return (
        <section id="tokenomics" className="py-20 bg-[#0b0e11] relative overflow-hidden">
             <div className="container mx-auto px-4 relative z-10">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">{t.title}</h2>
                    <p className="text-binance-subtext">{t.supply}</p>
                </div>
                
                <div className="flex flex-col md:flex-row items-center justify-center gap-12">
                    <div className="w-full md:w-1/2 h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={data}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={80}
                                    outerRadius={140}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {data.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                                    ))}
                                </Pie>
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#181a20', border: '1px solid #2b3139', borderRadius: '8px' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="w-full md:w-1/2 space-y-4">
                        {data.map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between p-4 bg-binance-black rounded-xl border border-binance-gray">
                                <div className="flex items-center gap-3">
                                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: item.color }}></div>
                                    <span className="font-bold text-white">{item.name}</span>
                                </div>
                                <span className="font-mono text-binance-subtext">{item.value}%</span>
                            </div>
                        ))}
                    </div>
                </div>
             </div>
        </section>
    );
};

// --- Roadmap Section ---
export const RoadmapSection: React.FC = () => {
    const { language } = useStore();
    const t = translations[language].roadmap;

    const phases = [
        { phase: "Phase 1", title: t.p1, date: "Q1 2024", status: "completed" },
        { phase: "Phase 2", title: t.p2, date: "Q2 2024", status: "completed" },
        { phase: "Phase 3", title: t.p3, date: "Q3 2024", status: "active" },
        { phase: "Phase 4", title: t.p4, date: "Q4 2024", status: "upcoming" },
    ];

    return (
        <section id="roadmap" className="py-20 bg-binance-black">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">{t.title}</h2>
                    <div className="w-20 h-1 bg-binance-yellow mx-auto"></div>
                </div>

                <div className="relative max-w-4xl mx-auto">
                    {/* Vertical Line */}
                    <div className="absolute left-[19px] md:left-1/2 top-0 bottom-0 w-1 bg-binance-gray transform md:-translate-x-1/2"></div>

                    <div className="space-y-12">
                        {phases.map((item, idx) => (
                            <div key={idx} className={`relative flex flex-col md:flex-row gap-8 ${idx % 2 === 0 ? 'md:flex-row-reverse' : ''}`}>
                                <div className="hidden md:block flex-1"></div>
                                
                                {/* Timeline Dot */}
                                <div className={`absolute left-0 md:left-1/2 transform md:-translate-x-1/2 w-10 h-10 rounded-full border-4 flex items-center justify-center z-10 ${
                                    item.status === 'completed' ? 'bg-binance-green border-binance-black text-black' : 
                                    item.status === 'active' ? 'bg-binance-yellow border-binance-yellow text-black animate-pulse' : 
                                    'bg-binance-black border-binance-gray text-binance-subtext'
                                }`}>
                                    {item.status === 'completed' ? <CheckCircle size={20} /> : <div className="w-3 h-3 bg-current rounded-full"></div>}
                                </div>

                                <div className="flex-1 ml-12 md:ml-0">
                                    <div className={`p-6 bg-[#1e2026] rounded-xl border ${item.status === 'active' ? 'border-binance-yellow' : 'border-binance-gray'}`}>
                                        <div className="flex justify-between items-start mb-2">
                                            <span className={`text-xs font-bold uppercase px-2 py-1 rounded ${
                                                item.status === 'active' ? 'bg-binance-yellow text-black' : 'bg-binance-gray text-binance-subtext'
                                            }`}>{item.phase}</span>
                                            <span className="text-sm text-binance-subtext">{item.date}</span>
                                        </div>
                                        <h3 className="text-xl font-bold text-white">{item.title}</h3>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

// --- Team Section ---
export const TeamSection: React.FC = () => {
    const { language } = useStore();
    const t = translations[language].teamSection;

    const team = [
        { 
          name: language === 'AM' ? "Սերգեյ Մակարյան" : "Sergey Makaryan", 
          role: language === 'AM' ? "Ծրագրավորող" : "Developer", 
          color: "from-yellow-400 to-orange-500" 
        },
        { 
          name: language === 'AM' ? "Հարութ Գապայեան" : "Harut Gapayean", 
          role: language === 'AM' ? "Վեբ Ծրագրավորող" : "Web Developer", 
          color: "from-blue-400 to-cyan-500" 
        },
    ];

    return (
        <section id="team" className="py-20 bg-[#0b0e11]">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">{t.title}</h2>
                    <p className="text-binance-subtext max-w-2xl mx-auto">{t.subtitle}</p>
                    <div className="w-20 h-1 bg-binance-yellow mx-auto mt-6"></div>
                </div>

                <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
                    {team.map((member, index) => (
                        <div key={index} className="bg-binance-black p-6 rounded-2xl border border-binance-gray hover:border-binance-yellow/50 transition-all hover:-translate-y-2 group">
                            <div className={`w-24 h-24 mx-auto rounded-full bg-gradient-to-br ${member.color} mb-6 flex items-center justify-center text-3xl font-bold text-white shadow-lg`}>
                                {member.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <h3 className="text-xl font-bold text-white text-center mb-1">{member.name}</h3>
                            <p className="text-binance-yellow text-center text-sm font-medium mb-4">{member.role}</p>
                            
                            <div className="flex justify-center gap-4 mt-6 pt-6 border-t border-binance-gray/30">
                                <a href="#" className="text-binance-subtext hover:text-white transition-colors"><Twitter size={18} /></a>
                                <a href="#" className="text-binance-subtext hover:text-white transition-colors"><Linkedin size={18} /></a>
                                <a href="#" className="text-binance-subtext hover:text-white transition-colors"><Github size={18} /></a>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

// --- Calculator Section ---
export const CalculatorSection: React.FC = () => {
    const { language, marketData, setView, setSelectedSymbol } = useStore();
    const t = translations[language].calculator;
    
    // Initial Values
    const [payAmount, setPayAmount] = useState<string>('1000');
    const [receiveAmount, setReceiveAmount] = useState<string>('');
    const [currency, setCurrency] = useState<'USD' | 'AMD'>('USD');
    
    // Constants
    const USD_AMD_RATE = 390;
    
    // Get live price of DMC from store (defaults to 200 if loading/not found)
    const dmcCoin = marketData.find(c => c.symbol === 'DMC');
    const dmcPriceUsd = dmcCoin ? dmcCoin.price : 200; 

    // Bi-directional Calculation Logic
    const handlePayChange = (val: string) => {
        setPayAmount(val);
        const amount = parseFloat(val);
        if (!isNaN(amount) && dmcPriceUsd > 0) {
            const usdValue = currency === 'USD' ? amount : amount / USD_AMD_RATE;
            const dmcVal = usdValue / dmcPriceUsd;
            setReceiveAmount(dmcVal.toFixed(6));
        } else {
            setReceiveAmount('');
        }
    };

    const handleReceiveChange = (val: string) => {
        setReceiveAmount(val);
        const dmcVal = parseFloat(val);
        if (!isNaN(dmcVal) && dmcPriceUsd > 0) {
            const usdValue = dmcVal * dmcPriceUsd;
            const payVal = currency === 'USD' ? usdValue : usdValue * USD_AMD_RATE;
            setPayAmount(payVal.toFixed(2));
        } else {
            setPayAmount('');
        }
    };

    // Recalculate if currency changes, keeping the DMC amount constant (logic choice)
    // Or keep Pay amount constant? Usually user inputs "Pay", so we keep "Pay" constant but adjust visual if needed.
    // Here we will trigger recalculation based on current payAmount when currency toggles.
    useEffect(() => {
        handlePayChange(payAmount);
    }, [currency, dmcPriceUsd]);

    const handleBuyNow = () => {
        // Navigate to Trade view with DMC selected
        setSelectedSymbol('DMC');
        setView(ViewState.TRADE);
        // Optionally pass the calculated amount to the trade view via local storage or a store action if needed
        // For now, just taking them to the trade page for DMC is the logical next step.
    };

    return (
        <section id="calculator" className="py-20 bg-binance-black">
            <div className="container mx-auto px-4">
                <div className="max-w-4xl mx-auto bg-[#131517] border border-binance-gray/30 rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden">
                     {/* Decorative background circle */}
                     <div className="absolute top-10 right-10 w-48 h-48 bg-binance-yellow/5 rounded-full blur-[60px] pointer-events-none"></div>

                    <div className="text-center mb-10 relative z-10">
                        <h2 className="text-3xl font-bold text-white mb-2">{t.title}</h2>
                        <p className="text-binance-subtext">{t.subtitle}</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-12 items-center relative z-10 max-w-3xl mx-auto">
                         {/* Input Side */}
                         <div className="space-y-4">
                            <label className="text-sm text-binance-subtext ml-1">{t.you_pay}</label>
                            <div className="relative">
                                <input 
                                    type="number" 
                                    value={payAmount}
                                    onChange={(e) => handlePayChange(e.target.value)}
                                    className="w-full bg-[#0b0e11] border border-binance-gray rounded-xl p-4 text-white text-xl focus:border-binance-yellow focus:outline-none transition-colors pr-32 font-bold"
                                />
                                <div className="absolute right-2 top-2 bottom-2 bg-[#2b3139] rounded-lg flex p-1">
                                    <button 
                                        onClick={() => setCurrency('USD')}
                                        className={`px-3 rounded-md text-sm font-bold transition-colors ${currency === 'USD' ? 'bg-binance-yellow text-black' : 'text-binance-subtext hover:text-white'}`}
                                    >USD</button>
                                    <button 
                                        onClick={() => setCurrency('AMD')}
                                        className={`px-3 rounded-md text-sm font-bold transition-colors ${currency === 'AMD' ? 'bg-binance-yellow text-black' : 'text-binance-subtext hover:text-white'}`}
                                    >AMD</button>
                                </div>
                            </div>
                            <div className="text-xs text-binance-subtext ml-1">
                                1 DMC ≈ {currency === 'USD' ? `$${dmcPriceUsd.toFixed(2)}` : `${(dmcPriceUsd * USD_AMD_RATE).toFixed(0)} ֏`}
                            </div>
                         </div>

                         {/* Output Side */}
                         <div className="space-y-4">
                            <label className="text-sm text-binance-subtext ml-1">{t.you_receive}</label>
                            <div className="relative">
                                <input 
                                    type="number" 
                                    value={receiveAmount}
                                    onChange={(e) => handleReceiveChange(e.target.value)}
                                    className="w-full bg-[#0b0e11] border border-binance-yellow/50 rounded-xl p-4 text-binance-yellow text-xl focus:border-binance-yellow focus:outline-none transition-colors pr-20 font-bold"
                                />
                                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 font-bold text-white">
                                    DMC
                                </div>
                            </div>
                            <div className="h-4"></div> {/* Spacer to align with left side text */}
                         </div>
                    </div>

                    <div className="mt-8 flex justify-center">
                        <button 
                            onClick={handleBuyNow}
                            className="bg-binance-yellow text-black px-10 py-3 rounded-full font-bold text-lg hover:shadow-[0_0_20px_rgba(252,213,53,0.4)] transition-all active:scale-95 flex items-center gap-2"
                        >
                            {t.buy_btn} <ArrowRight size={20} />
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
};