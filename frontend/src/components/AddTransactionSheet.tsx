import React, { useState } from 'react';
import { BottomSheet } from './BottomSheet';
import { NumericKeypad } from './NumericKeypad';
import { useUIStore } from '../store/uiStore';
import { ChevronRight, ChevronLeft, Search } from 'lucide-react';

export const AddTransactionSheet = () => {
  const { isAddTransactionOpen, closeAddTransaction } = useUIStore();
  const [type, setType] = useState<'EXPENSE' | 'INCOME' | 'TRANSFER'>('EXPENSE');
  const [amountStr, setAmountStr] = useState('0');
  
  // Selections
  const [selectedCategory, setSelectedCategory] = useState({ icon: '🍜', name: 'Makanan' });
  const [selectedWalletFrom, setSelectedWalletFrom] = useState({ name: 'Tunai', type: 'Pribadi' });
  const [selectedWalletTo, setSelectedWalletTo] = useState({ name: 'Pilih Dompet', type: '' });

  // View State for drill-down selectors
  const [activeView, setActiveView] = useState<'MAIN' | 'CATEGORY' | 'WALLET_FROM' | 'WALLET_TO'>('MAIN');

  const formattedAmount = parseInt(amountStr, 10).toLocaleString('id-ID');

  const handleSave = () => {
    // API Call goes here
    closeAddTransaction();
    setAmountStr('0');
    setActiveView('MAIN');
  };

  const handleClose = () => {
    if (activeView !== 'MAIN') {
      setActiveView('MAIN');
    } else {
      closeAddTransaction();
    }
  };

  return (
    <BottomSheet 
      isOpen={isAddTransactionOpen} 
      onClose={handleClose}
      title={
        activeView === 'MAIN' ? "Tambah Transaksi" : 
        activeView === 'CATEGORY' ? "Pilih Kategori" : 
        "Pilih Dompet"
      }
      leftIcon={activeView !== 'MAIN' ? <ChevronLeft size={24} className="text-text-primary" /> : undefined}
      onLeftIconClick={activeView !== 'MAIN' ? () => setActiveView('MAIN') : undefined}
    >
      
      {/* MAIN VIEW */}
      {activeView === 'MAIN' && (
        <div className="flex flex-col gap-6 animate-fade-in">
          
          {/* Type Selector */}
          <div className="flex p-1 bg-surface-muted rounded-xl">
            <button 
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors ${type === 'EXPENSE' ? 'bg-surface text-expense shadow-sm' : 'text-text-secondary'}`}
              onClick={() => setType('EXPENSE')}
            >
              Pengeluaran
            </button>
            <button 
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors ${type === 'INCOME' ? 'bg-surface text-income shadow-sm' : 'text-text-secondary'}`}
              onClick={() => setType('INCOME')}
            >
              Pemasukan
            </button>
            <button 
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors ${type === 'TRANSFER' ? 'bg-surface text-transfer shadow-sm' : 'text-text-secondary'}`}
              onClick={() => setType('TRANSFER')}
            >
              Transfer
            </button>
          </div>

          {/* Amount Display */}
          <div className="text-center py-4">
            <span className="text-text-secondary font-semibold text-lg">Rp</span>
            <span className={`text-5xl font-bold tracking-tight ml-2 ${amountStr === '0' ? 'text-text-secondary' : 'text-text-primary'}`}>
              {formattedAmount}
            </span>
            {amountStr === '0' && (
              <p className="text-text-secondary text-sm mt-2">ketik nominal di bawah</p>
            )}
          </div>

          {/* Selectors (Premium Drill-Down) */}
          <div className="space-y-3">
            
            {type !== 'TRANSFER' && (
              <button 
                onClick={() => setActiveView('CATEGORY')}
                className="w-full flex items-center justify-between p-4 rounded-2xl border border-border bg-surface hover:bg-surface-muted transition-colors text-left group shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-surface-muted rounded-xl flex items-center justify-center text-2xl border border-border">
                    {selectedCategory.icon}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-0.5">Kategori</p>
                    <p className="font-bold text-text-primary text-base">{selectedCategory.name}</p>
                  </div>
                </div>
                <ChevronRight size={20} className="text-text-secondary group-hover:text-primary transition-colors" />
              </button>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <button 
                onClick={() => setActiveView('WALLET_FROM')}
                className="flex-1 flex items-center justify-between p-4 rounded-2xl border border-border bg-surface hover:bg-surface-muted transition-colors text-left group shadow-sm"
              >
                <div>
                  <p className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-1">
                    {type === 'TRANSFER' ? 'Dari Dompet' : 'Dompet'}
                  </p>
                  <p className="font-bold text-text-primary text-base">{selectedWalletFrom.name}</p>
                </div>
                <ChevronRight size={20} className="text-text-secondary group-hover:text-primary transition-colors" />
              </button>

              {type === 'TRANSFER' && (
                <button 
                  onClick={() => setActiveView('WALLET_TO')}
                  className="flex-1 flex items-center justify-between p-4 rounded-2xl border border-border bg-surface hover:bg-surface-muted transition-colors text-left group shadow-sm"
                >
                  <div>
                    <p className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-1">Ke Dompet</p>
                    <p className={`font-bold text-base ${selectedWalletTo.name === 'Pilih Dompet' ? 'text-text-secondary' : 'text-text-primary'}`}>
                      {selectedWalletTo.name}
                    </p>
                  </div>
                  <ChevronRight size={20} className="text-text-secondary group-hover:text-primary transition-colors" />
                </button>
              )}
            </div>
          </div>

          {/* Save Button */}
          <button 
            onClick={handleSave}
            disabled={amountStr === '0'}
            className="w-full py-4 bg-primary text-surface rounded-xl font-bold text-lg shadow-lg shadow-primary/20 hover:bg-primary/90 disabled:opacity-50 disabled:shadow-none transition-all mt-2"
          >
            Simpan Transaksi
          </button>

          {/* Numeric Keypad */}
          <NumericKeypad value={amountStr} onChange={setAmountStr} />
        </div>
      )}

      {/* CATEGORY SELECTOR VIEW */}
      {activeView === 'CATEGORY' && (
        <div className="animate-fade-in flex flex-col h-[500px]">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={18} />
            <input 
              type="text" 
              placeholder="Cari kategori..." 
              className="w-full bg-surface-muted rounded-xl pl-10 pr-4 py-3 text-sm font-semibold text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div className="flex-1 overflow-y-auto space-y-2 hide-scrollbar pb-6">
            <CategoryListItem icon="🍜" name="Makanan & Minuman" onSelect={() => { setSelectedCategory({ icon: '🍜', name: 'Makanan & Minuman' }); setActiveView('MAIN'); }} />
            <CategoryListItem icon="🚗" name="Transportasi" onSelect={() => { setSelectedCategory({ icon: '🚗', name: 'Transportasi' }); setActiveView('MAIN'); }} />
            <CategoryListItem icon="🛒" name="Belanja" onSelect={() => { setSelectedCategory({ icon: '🛒', name: 'Belanja' }); setActiveView('MAIN'); }} />
            <CategoryListItem icon="💡" name="Tagihan & Utilitas" onSelect={() => { setSelectedCategory({ icon: '💡', name: 'Tagihan & Utilitas' }); setActiveView('MAIN'); }} />
            <CategoryListItem icon="🎮" name="Hiburan" onSelect={() => { setSelectedCategory({ icon: '🎮', name: 'Hiburan' }); setActiveView('MAIN'); }} />
          </div>
        </div>
      )}

      {/* WALLET SELECTOR VIEW */}
      {(activeView === 'WALLET_FROM' || activeView === 'WALLET_TO') && (
        <div className="animate-fade-in flex flex-col h-[400px]">
          <div className="flex-1 overflow-y-auto space-y-2 hide-scrollbar pb-6">
            <WalletListItem 
              name="Tunai" type="Pribadi" balance="Rp 1.500.000" 
              onSelect={() => { 
                const w = { name: 'Tunai', type: 'Pribadi' };
                if (activeView === 'WALLET_FROM') setSelectedWalletFrom(w); else setSelectedWalletTo(w);
                setActiveView('MAIN');
              }} 
            />
            <WalletListItem 
              name="BCA Andi" type="Pribadi" balance="Rp 12.000.000" 
              onSelect={() => { 
                const w = { name: 'BCA Andi', type: 'Pribadi' };
                if (activeView === 'WALLET_FROM') setSelectedWalletFrom(w); else setSelectedWalletTo(w);
                setActiveView('MAIN');
              }} 
            />
            <WalletListItem 
              name="Dompet Keluarga" type="Bersama" balance="Rp 6.500.000" 
              onSelect={() => { 
                const w = { name: 'Dompet Keluarga', type: 'Bersama' };
                if (activeView === 'WALLET_FROM') setSelectedWalletFrom(w); else setSelectedWalletTo(w);
                setActiveView('MAIN');
              }} 
            />
          </div>
        </div>
      )}

    </BottomSheet>
  );
};

const CategoryListItem = ({ icon, name, onSelect }: { icon: string, name: string, onSelect: () => void }) => (
  <button 
    onClick={onSelect}
    className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-surface-muted transition-colors text-left"
  >
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 rounded-xl bg-surface-muted border border-border flex items-center justify-center text-2xl shadow-sm">
        {icon}
      </div>
      <p className="font-bold text-text-primary text-base">{name}</p>
    </div>
  </button>
);

const WalletListItem = ({ name, type, balance, onSelect }: { name: string, type: string, balance: string, onSelect: () => void }) => (
  <button 
    onClick={onSelect}
    className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-surface-muted transition-colors text-left border border-transparent hover:border-border"
  >
    <div>
      <p className="font-bold text-text-primary text-base mb-0.5">{name}</p>
      <span className="text-[10px] font-bold uppercase tracking-widest text-text-secondary bg-surface-muted px-2 py-1 rounded-md">{type}</span>
    </div>
    <p className="font-bold text-text-primary">{balance}</p>
  </button>
);
