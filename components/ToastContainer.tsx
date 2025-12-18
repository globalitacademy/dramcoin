
import React from 'react';
import { useStore } from '../context/StoreContext';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

const ToastContainer: React.FC = () => {
  const { toasts } = useStore();

  return (
    <div className="fixed top-24 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
      {toasts.map((toast) => (
        <div 
          key={toast.id}
          className={`pointer-events-auto flex items-center gap-3 min-w-[300px] p-4 rounded-2xl shadow-2xl border backdrop-blur-md animate-slide-in-right ${
            toast.type === 'success' 
              ? 'bg-binance-green/10 border-binance-green/20 text-binance-green' 
              : toast.type === 'error'
              ? 'bg-binance-red/10 border-binance-red/20 text-binance-red'
              : 'bg-binance-gray/80 border-binance-gray text-white'
          }`}
        >
          {toast.type === 'success' && <CheckCircle size={20} />}
          {toast.type === 'error' && <AlertCircle size={20} />}
          {toast.type === 'info' && <Info size={20} />}
          <p className="flex-1 text-sm font-bold">{toast.message}</p>
        </div>
      ))}
      <style>{`
        @keyframes slide-in-right {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
};

export default ToastContainer;
