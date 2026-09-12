import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  leftIcon?: React.ReactNode;
  onLeftIconClick?: () => void;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({ 
  isOpen, 
  onClose, 
  title, 
  children,
  leftIcon,
  onLeftIconClick
}) => {
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
        className="absolute inset-0 bg-text-primary/20 backdrop-blur-none transition-opacity animate-fade-in" 
        onClick={onClose}
      />
      
      {/* Sheet */}
      <div 
        className="w-full sm:w-full sm:max-w-md bg-surface border-t-4 sm:border-4 border-text-primary rounded-none shadow-[8px_8px_0_0_#171B22] relative z-10 max-h-[90vh] flex flex-col animate-slide-up"
      >
        <div className="flex items-center justify-between p-4 border-b-4 border-text-primary bg-primary">
          {leftIcon ? (
            <button 
              onClick={onLeftIconClick}
              className="w-10 h-10 flex items-center justify-center rounded-none border-2 border-text-primary bg-surface shadow-[2px_2px_0_0_#171B22] hover:-translate-y-1 hover:shadow-[4px_4px_0_0_#171B22] active:translate-y-0 active:shadow-none transition-all"
            >
              {leftIcon}
            </button>
          ) : (
            <div className="w-10" />
          )}
          <h2 className="font-black uppercase tracking-wider text-xl text-text-primary">{title}</h2>
          <button 
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-none border-2 border-text-primary bg-accent shadow-[2px_2px_0_0_#171B22] hover:-translate-y-1 hover:shadow-[4px_4px_0_0_#171B22] active:translate-y-0 active:shadow-none transition-all"
          >
            <X size={20} className="text-text-primary" />
          </button>
        </div>
        
        <div className="p-4 overflow-y-auto pb-safe bg-surface">
          {children}
        </div>
      </div>
    </div>
  );
};
