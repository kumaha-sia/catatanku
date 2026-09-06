import { create } from 'zustand';

interface UIState {
  isAddTransactionOpen: boolean;
  openAddTransaction: () => void;
  closeAddTransaction: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  isAddTransactionOpen: false,
  openAddTransaction: () => set({ isAddTransactionOpen: true }),
  closeAddTransaction: () => set({ isAddTransactionOpen: false }),
}));
