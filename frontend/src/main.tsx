import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { useToastStore } from './store/toastStore';
import { useConfirmStore } from './store/confirmStore';
import { registerSW } from 'virtual:pwa-register';

// Register Service Worker for PWA
if ('serviceWorker' in navigator) {
  registerSW({ immediate: true });
}

declare global {
  interface Window {
    toast: ReturnType<typeof useToastStore.getState>;
    appConfirm: (message: string, onConfirm: () => void, onCancel?: () => void) => void;
  }
}

window.toast = useToastStore.getState();
window.appConfirm = useConfirmStore.getState().showConfirm;

ReactDOM.createRoot(document.getElementById('app')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
