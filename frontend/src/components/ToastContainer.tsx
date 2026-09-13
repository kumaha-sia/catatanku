import React from 'react';
import { useToastStore } from '../store/toastStore';
import { X, CheckCircle, AlertTriangle, Info } from 'lucide-react';

export const ToastContainer = () => {
  const toasts = useToastStore(state => state.toasts);
  const removeToast = useToastStore(state => state.removeToast);

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-3 w-full max-w-[90%] md:max-w-md pointer-events-none">
      {toasts.map(toast => {
        const bg = toast.type === 'SUCCESS' ? 'bg-[#A3E635]' : toast.type === 'ERROR' ? 'bg-[#FFA6A6]' : 'bg-surface';
        const Icon = toast.type === 'SUCCESS' ? CheckCircle : toast.type === 'ERROR' ? AlertTriangle : Info;

        return (
          <div 
            key={toast.id} 
            className={`pointer-events-auto flex items-center justify-between p-4 ${bg} border-4 border-text-primary shadow-[4px_4px_0_0_#171B22] animate-slide-down`}
          >
            <div className="flex items-center gap-3">
              <Icon className="text-text-primary shrink-0" size={24} />
              <p className="font-black text-text-primary text-sm uppercase tracking-wide leading-tight">
                {toast.message}
              </p>
            </div>
            <button 
              onClick={() => removeToast(toast.id)}
              className="ml-4 shrink-0 text-text-primary hover:scale-110 transition-transform"
            >
              <X size={20} className="font-black" />
            </button>
          </div>
        )
      })}
    </div>
  );
};

