import { create } from 'zustand';

interface UIState {
  isAddTransactionOpen: boolean;
  editTransactionData?: any;
  openAddTransaction: (data?: any) => void;
  closeAddTransaction: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  isAddTransactionOpen: false,
  editTransactionData: null,
  openAddTransaction: (data?: any) => {
    const isEvent = data && typeof data === 'object' && ('nativeEvent' in data || 'target' in data);
    set({ isAddTransactionOpen: true, editTransactionData: isEvent ? null : (data || null) });
  },
  closeAddTransaction: () => set({ isAddTransactionOpen: false, editTransactionData: null }),
}));
