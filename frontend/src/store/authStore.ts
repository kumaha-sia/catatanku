import { create } from 'zustand';

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  whatsapp?: string;
  reminder_enabled?: boolean;
  reminder_time?: string;
  role?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  login: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: JSON.parse(localStorage.getItem('catatu_user') || 'null'),
  token: localStorage.getItem('catatu_token') || null,
  login: (user, token) => {
    localStorage.setItem('catatu_token', token);
    localStorage.setItem('catatu_user', JSON.stringify(user));
    set({ user, token });
  },
  logout: () => {
    localStorage.removeItem('catatu_token');
    localStorage.removeItem('catatu_user');
    set({ user: null, token: null });
  }
}));
