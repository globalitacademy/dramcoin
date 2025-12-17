
import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { translations } from '../translations';
import { ShieldCheck, User, CreditCard, Camera, CheckCircle, ArrowRight, ArrowLeft, Upload, Loader2, RefreshCw } from 'lucide-react';
import { ViewState } from '../types';

const VerificationView: React.FC = () => {
  const { language, setView, submitKyc } = useStore();
  const t = translations[language].kyc;
  
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dob: '',
    docType: 'passport'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  
  // Camera State
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const startCamera = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      setStream(s);
      if (videoRef.current) videoRef.current.srcObject = s;
    } catch (err) {
      console.error("Camera access denied", err);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  useEffect(() => {
    if (step === 3) startCamera();
    else stopCamera();
    return () => stopCamera();
  }, [step]);

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      setIsLoading(true);
      setTimeout(() => {
        submitKyc();
        setIsLoading(false);
        setIsFinished(true);
      }, 2500);
    }
  };

  if (isFinished) {
    return (
      <div className="min-h-screen bg-binance-dark flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-binance-black border border-binance-gray rounded-3xl p-10 text-center animate-fade-in shadow-2xl">
          <div className="w-20 h-20 bg-binance-green/20 rounded-full flex items-center justify-center text-binance-green mx-auto mb-6">
            <CheckCircle size={48} />
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">{t.success_title}</h2>
          <p className="text-binance-subtext mb-8">{t.success_desc}</p>
          <button 
            onClick={() => setView(ViewState.WALLET)}
            className="w-full py-4 bg-binance-yellow text-black font-bold rounded-xl hover:shadow-xl transition-all"
          >
            {t.back_to_wallet}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-binance-dark flex flex-col pt-24 pb-12 px-4">
      <div className="w-full max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
            <button onClick={() => step > 1 ? setStep(step - 1) : setView(ViewState.WALLET)} className="text-binance-subtext hover:text-white flex items-center gap-2">
                <ArrowLeft size={20} /> {language === 'AM' ? 'Հետ' : 'Back'}
            </button>
            <div className="flex items-center gap-2">
                {[1, 2, 3].map(i => (
                    <div key={i} className={`w-10 h-1 h-1 rounded-full ${step >= i ? 'bg-binance-yellow' : 'bg-binance-gray'}`}></div>
                ))}
            </div>
        </div>

        <div className="bg-binance-black border border-binance-gray rounded-3xl p-8 md:p-12 shadow-2xl">
            <header className="mb-10">
                <h1 className="text-3xl font-bold text-white mb-2">{t.title}</h1>
                <p className="text-binance-subtext">{t.subtitle}</p>
            </header>

            {step === 1 && (
                <div className="space-y-6 animate-fade-in">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <User className="text-binance-yellow" /> {t.step1_title}
                    </h2>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs text-binance-subtext uppercase font-bold tracking-wider">{t.first_name}</label>
                            <input 
                                type="text"
                                value={formData.firstName}
                                onChange={e => setFormData({...formData, firstName: e.target.value})}
                                className="w-full bg-binance-dark border border-binance-gray rounded-xl p-4 text-white focus:border-binance-yellow focus:outline-none"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs text-binance-subtext uppercase font-bold tracking-wider">{t.last_name}</label>
                            <input 
                                type="text"
                                value={formData.lastName}
                                onChange={e => setFormData({...formData, lastName: e.target.value})}
                                className="w-full bg-binance-dark border border-binance-gray rounded-xl p-4 text-white focus:border-binance-yellow focus:outline-none"
                            />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs text-binance-subtext uppercase font-bold tracking-wider">{t.dob}</label>
                        <input 
                            type="date"
                            value={formData.dob}
                            onChange={e => setFormData({...formData, dob: e.target.value})}
                            className="w-full bg-binance-dark border border-binance-gray rounded-xl p-4 text-white focus:border-binance-yellow focus:outline-none"
                        />
                    </div>
                </div>
            )}

            {step === 2 && (
                <div className="space-y-8 animate-fade-in">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <CreditCard className="text-binance-yellow" /> {t.step2_title}
                    </h2>
                    <div className="space-y-4">
                        <div className="flex gap-4">
                            <button 
                                onClick={() => setFormData({...formData, docType: 'passport'})}
                                className={`flex-1 py-3 rounded-xl border font-bold text-sm transition-all ${formData.docType === 'passport' ? 'bg-binance-yellow text-black border-binance-yellow' : 'bg-binance-gray/20 text-binance-subtext border-binance-gray'}`}
                            >
                                {t.passport}
                            </button>
                            <button 
                                onClick={() => setFormData({...formData, docType: 'id_card'})}
                                className={`flex-1 py-3 rounded-xl border font-bold text-sm transition-all ${formData.docType === 'id_card' ? 'bg-binance-yellow text-black border-binance-yellow' : 'bg-binance-gray/20 text-binance-subtext border-binance-gray'}`}
                            >
                                {t.id_card}
                            </button>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4 pt-4">
                            <div className="border-2 border-dashed border-binance-gray rounded-2xl p-8 flex flex-col items-center justify-center text-center group hover:border-binance-yellow transition-colors cursor-pointer relative overflow-hidden">
                                <Upload className="text-binance-subtext group-hover:text-binance-yellow mb-4" size={32} />
                                <span className="text-sm font-bold text-white">{t.upload_front}</span>
                                <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
                            </div>
                            {formData.docType === 'id_card' && (
                                <div className="border-2 border-dashed border-binance-gray rounded-2xl p-8 flex flex-col items-center justify-center text-center group hover:border-binance-yellow transition-colors cursor-pointer relative overflow-hidden">
                                    <Upload className="text-binance-subtext group-hover:text-binance-yellow mb-4" size={32} />
                                    <span className="text-sm font-bold text-white">{t.upload_back}</span>
                                    <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {step === 3 && (
                <div className="space-y-8 animate-fade-in text-center">
                    <h2 className="text-xl font-bold text-white flex items-center justify-center gap-2">
                        <Camera className="text-binance-yellow" /> {t.step3_title}
                    </h2>
                    <div className="w-72 h-72 md:w-80 md:h-80 bg-binance-dark border-4 border-binance-gray rounded-full mx-auto relative overflow-hidden flex items-center justify-center shadow-2xl">
                         <video 
                            ref={videoRef} 
                            autoPlay 
                            playsInline 
                            className="w-full h-full object-cover rounded-full transform scale-x-[-1]"
                         />
                         <div className="absolute inset-0 pointer-events-none">
                            <div className="absolute inset-0 border-[16px] border-binance-black/60 rounded-full"></div>
                            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-binance-yellow/40 shadow-[0_0_15px_rgba(252,213,53,0.5)] animate-scan"></div>
                         </div>
                         {!stream && (
                            <div className="absolute inset-0 flex items-center justify-center bg-binance-black/80">
                                <button onClick={startCamera} className="bg-binance-yellow text-black px-6 py-2 rounded-full font-bold flex items-center gap-2">
                                    <RefreshCw size={18} /> Միացնել տեսախցիկը
                                </button>
                            </div>
                         )}
                    </div>
                    <p className="text-sm text-binance-subtext max-w-xs mx-auto">
                        {language === 'AM' ? 'Խնդրում ենք նայել տեսախցիկին և համոզվել, որ լուսավորությունը բավարար է:' : 'Please look at the camera and ensure there is enough lighting.'}
                    </p>
                </div>
            )}

            <button 
                onClick={handleNext}
                disabled={isLoading || (step === 3 && !stream)}
                className="w-full py-4 bg-binance-yellow text-black font-bold rounded-xl hover:shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2 mt-12 disabled:opacity-50"
            >
                {isLoading ? <Loader2 className="animate-spin" /> : <>{t.next} <ArrowRight size={18} /></>}
            </button>
        </div>
      </div>

      <style>{`
        @keyframes scan {
          0%, 100% { top: 0% }
          50% { top: 100% }
        }
        .animate-scan {
          animation: scan 3s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default VerificationView;
