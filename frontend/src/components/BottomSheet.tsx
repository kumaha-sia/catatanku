import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({ isOpen, onClose, title, children }) => {
  // Prevent body scrolling when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      
      {/* Sheet */}
      <div 
        className="w-full sm:w-full sm:max-w-md bg-surface rounded-t-3xl sm:rounded-3xl shadow-2xl relative z-10 max-h-[90vh] flex flex-col animate-slide-up"
      >
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="w-8" /> {/* Spacer for centering */}
          <h2 className="font-bold text-lg text-text-primary">{title}</h2>
          <button 
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-surface-muted text-text-secondary hover:text-text-primary transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-4 overflow-y-auto pb-safe">
          {children}
        </div>
      </div>
    </div>
  );
};
