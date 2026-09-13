import React from 'react';
import { useConfirmStore } from '../store/confirmStore';
import { AlertTriangle, X } from 'lucide-react';

export const ConfirmDialog = () => {
  const { isOpen, message, onConfirm, onCancel, closeConfirm } = useConfirmStore();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-text-primary/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-surface w-full max-w-sm border-4 border-text-primary shadow-[8px_8px_0_0_#171B22] p-6 relative animate-slide-up">
        
        <div className="flex items-start gap-4 mb-6">
          <div className="w-12 h-12 bg-[#FFA6A6] border-4 border-text-primary flex items-center justify-center shrink-0 shadow-[4px_4px_0_0_#171B22]">
            <AlertTriangle className="text-text-primary" size={24} />
          </div>
          <p className="font-black text-text-primary text-lg uppercase leading-tight pt-1">
            {message}
          </p>
        </div>

        <div className="flex gap-4">
          <button 
            onClick={onCancel}
            className="flex-1 py-3 bg-surface border-4 border-text-primary font-black uppercase tracking-wider text-text-primary shadow-[4px_4px_0_0_#171B22] hover:-translate-y-1 hover:shadow-[6px_6px_0_0_#171B22] active:translate-y-0 active:shadow-none transition-all"
          >
            Batal
          </button>
          <button 
            onClick={onConfirm}
            className="flex-1 py-3 bg-error text-surface border-4 border-text-primary font-black uppercase tracking-wider shadow-[4px_4px_0_0_#171B22] hover:-translate-y-1 hover:shadow-[6px_6px_0_0_#171B22] active:translate-y-0 active:shadow-none transition-all"
          >
            Ya, Lanjut
          </button>
        </div>
      </div>
    </div>
  );
};

