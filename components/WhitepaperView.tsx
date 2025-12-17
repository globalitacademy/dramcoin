
import React, { useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { ViewState } from '../types';
import { ArrowLeft, BookOpen, Download, Shield, Zap, Share2, Globe, Users, Target, Rocket } from 'lucide-react';

const WhitepaperView: React.FC = () => {
  // Fix: Added missing setSelectedSymbol from useStore to resolve "Cannot find name 'setSelectedSymbol'" error
  const { setView, language, setSelectedSymbol } = useStore();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Fix: Made children optional in the Section component's props definition to resolve TS errors when using the component
  const Section = ({ icon: Icon, title, children }: { icon: any, title: string, children?: React.ReactNode }) => (
    <section className="mb-16 animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-binance-yellow/10 rounded-xl text-binance-yellow border border-binance-yellow/20 shadow-[0_0_15px_rgba(252,213,53,0.1)]">
          <Icon size={24} />
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-white">{title}</h2>
      </div>
      <div className="prose prose-invert max-w-none text-binance-subtext leading-relaxed text-lg space-y-4">
        {children}
      </div>
    </section>
  );

  return (
    <div className="min-h-screen bg-[#0b0e11] pt-28 pb-20 px-4 md:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Navigation / Header Actions */}
        <div className="flex justify-between items-center mb-12">
          <button 
            onClick={() => setView(ViewState.HOME)}
            className="flex items-center gap-2 text-binance-subtext hover:text-white transition-colors group"
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span className="font-bold">{language === 'AM' ? 'Վերադառնալ' : 'Back to Home'}</span>
          </button>
          <div className="flex gap-4">
            <button className="p-2.5 bg-binance-gray/30 rounded-xl text-binance-subtext hover:text-white transition-all border border-binance-gray/20">
              <Download size={18} />
            </button>
            <button className="p-2.5 bg-binance-gray/30 rounded-xl text-binance-subtext hover:text-white transition-all border border-binance-gray/20">
              <Share2 size={18} />
            </button>
          </div>
        </div>

        {/* Title Block */}
        <div className="text-center mb-20 relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-12 w-64 h-64 bg-binance-yellow/5 rounded-full blur-[80px] -z-10"></div>
          <span className="inline-block px-4 py-1.5 bg-binance-yellow text-black text-xs font-black rounded-full mb-6 tracking-widest uppercase">Version 1.0</span>
          <h1 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight">
            Dramcoin <span className="text-binance-yellow">Whitepaper</span>
          </h1>
          <p className="text-xl md:text-2xl text-binance-subtext max-w-2xl mx-auto font-medium">
            Հայաստանի թվային ֆինանսների ապագան
          </p>
        </div>

        <div className="bg-binance-black border border-binance-gray/30 rounded-[40px] p-8 md:p-16 shadow-2xl shadow-black/50">
          
          <Section icon={Target} title="1. Ներածություն (Introduction)">
            <h3 className="text-white font-bold text-xl mb-2">1.1 Առաքելությունը</h3>
            <p>
              Dramcoin-ը (DRM) ստեղծվել է՝ նպատակ ունենալով միավորել Հայաստանի ֆինանսական ներուժը և բլոկչեյն տեխնոլոգիաների նորարարությունը։ Մեր առաքելությունն է ստեղծել ապակենտրոնացված, արագ և անվտանգ վճարային միջոց, որը հասանելի կլինի յուրաքանչյուր հայի՝ թե՛ Հայաստանում, թե՛ Սփյուռքում։
            </p>
            
            <h3 className="text-white font-bold text-xl mt-6 mb-2">1.2 Խնդիրը</h3>
            <p>
              Ավանդական բանկային փոխանցումները հաճախ դանդաղ են, պահանջում են բարձր միջնորդավճարներ և կախված են կենտրոնացված համակարգերից։ Սփյուռքից դեպի Հայաստան կատարվող փոխանցումները կորցնում են իրենց արժեքի զգալի մասը միջնորդների պատճառով։
            </p>

            <h3 className="text-white font-bold text-xl mt-6 mb-2">1.3 Լուծումը</h3>
            <p>Dramcoin-ը առաջարկում է բլոկչեյնի վրա հիմնված լուծում, որն ապահովում է.</p>
            <ul className="list-disc pl-6 space-y-2 text-binance-text">
              <li>Ակնթարթային փոխանցումներ աշխարհի ցանկացած կետից։</li>
              <li>Նվազագույն միջնորդավճարներ (գրեթե 0)։</li>
              <li>Լիակատար թափանցիկություն և անվտանգություն։</li>
            </ul>
          </Section>

          <Section icon={Shield} title="2. Տեխնոլոգիա (Technology)">
            <h3 className="text-white font-bold text-xl mb-2">2.1 Բլոկչեյն ճարտարապետություն</h3>
            <p>
              Dramcoin-ը կառուցված է Binance Smart Chain (BEP-20) ցանցի վրա։ Սա ընտրվել է՝ հաշվի առնելով գործարքների բարձր արագությունը և ցածր "Gas Fee"-ն, ինչը թույլ է տալիս կատարել միկրո-վճարումներ։
            </p>
            
            <h3 className="text-white font-bold text-xl mt-6 mb-2">2.2 Անվտանգություն</h3>
            <p>
              Սմարթ-պայմանագիրը (Smart Contract) անցնելու է աուդիտ առաջատար ընկերությունների կողմից (օրինակ՝ CertiK)՝ բացառելու խոցելիությունները և ապահովելու ներդրողների միջոցների անվտանգությունը։
            </p>
          </Section>

          <Section icon={Globe} title="3. Էկոհամակարգ (Ecosystem)">
            <div className="grid gap-6">
              <div className="p-6 bg-binance-gray/10 rounded-2xl border border-binance-gray/20">
                <h4 className="text-white font-bold mb-2">Dram Wallet</h4>
                <p>Հատուկ բջջային դրամապանակ՝ DRM պահելու և փոխանցելու համար:</p>
              </div>
              <div className="p-6 bg-binance-gray/10 rounded-2xl border border-binance-gray/20">
                <h4 className="text-white font-bold mb-2">Dram Pay</h4>
                <p>Վճարային համակարգ, որը թույլ կտա գործընկեր խանութներում և ծառայություններում վճարել Dramcoin-ով:</p>
              </div>
              <div className="p-6 bg-binance-gray/10 rounded-2xl border border-binance-gray/20">
                <h4 className="text-white font-bold mb-2">Staking Program</h4>
                <p>Հնարավորություն օգտատերերի համար՝ սառեցնելու իրենց մետաղադրամները և ստանալու տոկոսային եկամուտ:</p>
              </div>
            </div>
          </Section>

          <Section icon={Zap} title="4. Տոկենոմիկա (Tokenomics)">
            <div className="mb-6">
              <p className="font-bold text-white">Ընդհանուր տեղեկություն.</p>
              <ul className="grid grid-cols-2 gap-4 mt-3">
                <li className="bg-binance-dark p-3 rounded-lg border border-binance-gray/30">
                  <span className="text-xs uppercase text-binance-subtext block">Անվանում</span>
                  <span className="text-white font-bold">Dramcoin</span>
                </li>
                <li className="bg-binance-dark p-3 rounded-lg border border-binance-gray/30">
                  <span className="text-xs uppercase text-binance-subtext block">Սիմվոլ</span>
                  <span className="text-binance-yellow font-bold">DRM</span>
                </li>
                <li className="bg-binance-dark p-3 rounded-lg border border-binance-gray/30">
                  <span className="text-xs uppercase text-binance-subtext block">Ծավալ</span>
                  <span className="text-white font-bold">1,000,000,000</span>
                </li>
                <li className="bg-binance-dark p-3 rounded-lg border border-binance-gray/30">
                  <span className="text-xs uppercase text-binance-subtext block">Տասնորդական</span>
                  <span className="text-white font-bold">18</span>
                </li>
              </ul>
            </div>
            
            <h3 className="text-white font-bold text-xl mt-8 mb-4">Բաշխում (Distribution)</h3>
            <div className="space-y-4">
              {[
                { label: 'Public Sale', value: '40%', desc: 'Բաց շուկայի և ներդրողների համար' },
                { label: 'Liquidity Pool', value: '20%', desc: 'Ապահովում է կայունություն DEX-երում' },
                { label: 'Development', value: '15%', desc: 'Ծրագրավորման և տեխնիկական սպասարկման համար' },
                { label: 'Marketing', value: '10%', desc: 'Գովազդի և գործընկերությունների համար' },
                { label: 'Team', value: '10%', desc: 'Սառեցված է 1 տարով (Vesting period)' },
                { label: 'Charity/Reserve', value: '5%', desc: 'Հատկացվում է հայկական կրթական ծրագրերին' }
              ].map((item, i) => (
                <div key={i} className="flex justify-between items-center group">
                  <div className="flex-1">
                    <span className="text-white font-bold group-hover:text-binance-yellow transition-colors">{item.label}</span>
                    <p className="text-sm text-binance-subtext">{item.desc}</p>
                  </div>
                  <div className="text-xl font-black text-white ml-4">{item.value}</div>
                </div>
              ))}
            </div>
          </Section>

          <Section icon={Rocket} title="5. Ճանապարհային Քարտեզ (Roadmap)">
            <div className="space-y-10 border-l-2 border-binance-gray/30 ml-4 pl-8">
              {[
                { phase: 'Փուլ 1', title: 'Մեկնարկ', list: ['Գաղափարի ձևավորում', 'Whitepaper-ի թողարկում', 'Smart Contract-ի ստեղծում'] },
                { phase: 'Փուլ 2', title: 'Ներգրավում', list: ['Մարքետինգային արշավներ', 'Presale (Նախնական վաճառք)', 'Listing DEX-երում'] },
                { phase: 'Փուլ 3', title: 'Զարգացում', list: ['CoinMarketCap ցուցակում', 'Dram Wallet բետա թողարկում', 'Գործընկերություններ'] },
                { phase: 'Փուլ 4', title: 'Ընդլայնում', list: ['Listing CEX-երում', 'NFT հավաքածուի թողարկում', 'Dramcoin ակադեմիայի հիմնում'] }
              ].map((p, i) => (
                <div key={i} className="relative">
                  <div className="absolute -left-[41px] top-1 w-4 h-4 rounded-full bg-binance-yellow shadow-[0_0_10px_rgba(252,213,53,0.5)]"></div>
                  <h4 className="text-binance-yellow font-black uppercase text-xs mb-1">{p.phase}</h4>
                  <h3 className="text-white font-bold text-xl mb-3">{p.title}</h3>
                  <ul className="list-disc pl-5 text-sm space-y-1">
                    {p.list.map((item, idx) => <li key={idx}>{item}</li>)}
                  </ul>
                </div>
              ))}
            </div>
          </Section>

          <div className="pt-10 border-t border-binance-gray/20">
             <div className="flex items-start gap-3 p-6 bg-red-900/10 border border-red-900/20 rounded-2xl">
                <Shield className="text-binance-red mt-1 shrink-0" size={20} />
                <div>
                   <h4 className="text-binance-red font-bold mb-2">Իրավական Ծանուցում (Disclaimer)</h4>
                   <p className="text-xs leading-relaxed text-binance-subtext">
                      Dramcoin-ը ներդրումային արժեթուղթ չէ։ Կրիպտոարժույթները կրում են շուկայական ռիսկեր։ Նախքան ներդրում կատարելը, խնդրում ենք կատարել սեփական ուսումնասիրությունը (DYOR): Թիմը պատասխանատվություն չի կրում շուկայական տատանումների հետևանքով կրած ֆինանսական կորուստների համար:
                   </p>
                </div>
             </div>
          </div>

        </div>

        {/* Footer CTA */}
        <div className="mt-16 text-center">
          <p className="text-binance-subtext mb-6">Պատրա՞ստ եք դառնալ հայկական ֆինանսական հեղափոխության մաս:</p>
          <button 
            onClick={() => { setView(ViewState.TRADE); setSelectedSymbol('DMC'); }}
            className="px-12 py-5 bg-binance-yellow text-black font-black rounded-2xl hover:shadow-[0_0_30px_rgba(252,213,53,0.3)] transition-all active:scale-95 text-lg"
          >
            Գնել DramCoin հիմա
          </button>
        </div>
      </div>
    </div>
  );
};

export default WhitepaperView;
