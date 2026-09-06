import React, { useState } from 'react';
import { BottomSheet } from './BottomSheet';
import { NumericKeypad } from './NumericKeypad';
import { useUIStore } from '../store/uiStore';
import { ChevronRight } from 'lucide-react';

export const AddTransactionSheet = () => {
  const { isAddTransactionOpen, closeAddTransaction } = useUIStore();
  const [type, setType] = useState<'EXPENSE' | 'INCOME' | 'TRANSFER'>('EXPENSE');
  const [amountStr, setAmountStr] = useState('0');

  const formattedAmount = parseInt(amountStr, 10).toLocaleString('id-ID');

  const handleSave = () => {
    // API Call goes here
    closeAddTransaction();
    setAmountStr('0');
  };

  return (
    <BottomSheet 
      isOpen={isAddTransactionOpen} 
      onClose={closeAddTransaction}
      title="Tambah Transaksi"
    >
      <div className="flex flex-col gap-6">
        
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

        {/* Selectors (Category & Wallet) */}
        <div className="space-y-4">
          
          {/* Categories Horizontal Scroll */}
          {type !== 'TRANSFER' && (
            <div>
              <p className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-2 px-1">Kategori</p>
              <div className="flex overflow-x-auto gap-3 pb-2 px-1 hide-scrollbar -mx-1">
                {type === 'EXPENSE' ? (
                  <>
                    <CategoryChip icon="🍜" label="Makanan" active />
                    <CategoryChip icon="🚗" label="Transport" />
                    <CategoryChip icon="🛒" label="Belanja" />
                    <CategoryChip icon="💡" label="Tagihan" />
                    <CategoryChip icon="🎮" label="Hiburan" />
                  </>
                ) : (
                  <>
                    <CategoryChip icon="💼" label="Gaji" active />
                    <CategoryChip icon="💰" label="Bonus" />
                    <CategoryChip icon="📈" label="Investasi" />
                  </>
                )}
              </div>
            </div>
          )}

          {/* Wallets Horizontal Scroll */}
          <div>
            <p className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-2 px-1">
              {type === 'TRANSFER' ? 'Dari Dompet' : 'Dompet'}
            </p>
            <div className="flex overflow-x-auto gap-3 pb-2 px-1 hide-scrollbar -mx-1">
              <WalletChip name="Tunai" type="Pribadi" active />
              <WalletChip name="BCA Andi" type="Pribadi" />
              <WalletChip name="Dompet Keluarga" type="Bersama" />
            </div>
          </div>

          {type === 'TRANSFER' && (
            <div>
              <p className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-2 px-1">Ke Dompet</p>
              <div className="flex overflow-x-auto gap-3 pb-2 px-1 hide-scrollbar -mx-1">
                <WalletChip name="Tunai" type="Pribadi" />
                <WalletChip name="BCA Andi" type="Pribadi" />
                <WalletChip name="Dompet Keluarga" type="Bersama" active />
              </div>
            </div>
          )}
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
    </BottomSheet>
  );
};

const CategoryChip = ({ icon, label, active = false }: { icon: string, label: string, active?: boolean }) => (
  <button 
    className={`flex flex-col items-center gap-2 min-w-[72px] p-2 rounded-xl border-2 transition-all ${
      active ? 'border-primary bg-primary/5' : 'border-transparent hover:bg-surface-muted'
    }`}
  >
    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${active ? 'bg-primary/20 shadow-sm' : 'bg-surface-muted'}`}>
      {icon}
    </div>
    <span className={`text-xs font-bold ${active ? 'text-primary' : 'text-text-secondary'}`}>{label}</span>
  </button>
);

const WalletChip = ({ name, type, active = false }: { name: string, type: string, active?: boolean }) => (
  <button 
    className={`flex flex-col justify-center min-w-[120px] p-3 rounded-xl border-2 transition-all text-left ${
      active ? 'border-primary bg-primary/5 shadow-sm' : 'border-border bg-surface hover:bg-surface-muted'
    }`}
  >
    <span className={`text-sm font-bold truncate w-full ${active ? 'text-primary' : 'text-text-primary'}`}>{name}</span>
    <span className={`text-[10px] font-bold uppercase tracking-widest mt-1 ${active ? 'text-primary/70' : 'text-text-secondary'}`}>{type}</span>
  </button>
);
