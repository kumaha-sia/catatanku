import { create } from 'zustand';

interface ConfirmState {
  isOpen: boolean;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  showConfirm: (message: string, onConfirm: () => void, onCancel?: () => void) => void;
  closeConfirm: () => void;
}

export const useConfirmStore = create<ConfirmState>((set) => ({
  isOpen: false,
  message: '',
  onConfirm: () => {},
  onCancel: () => {},
  showConfirm: (message, onConfirm, onCancel) => set({
    isOpen: true,
    message,
    onConfirm: () => {
      onConfirm();
      set({ isOpen: false });
    },
    onCancel: () => {
      if (onCancel) onCancel();
      set({ isOpen: false });
    }
  }),
  closeConfirm: () => set({ isOpen: false })
}));

