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
        <div className="space-y-3">
          {type !== 'TRANSFER' && (
            <button className="w-full flex items-center justify-between p-4 rounded-xl border border-border hover:bg-surface-muted transition-colors text-left">
              <div>
                <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1">Kategori</p>
                <p className="font-medium text-text-primary">Pilih Kategori...</p>
              </div>
              <ChevronRight size={20} className="text-text-secondary" />
            </button>
          )}

          <div className="flex gap-3">
            <button className="flex-1 flex items-center justify-between p-4 rounded-xl border border-border hover:bg-surface-muted transition-colors text-left">
              <div>
                <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1">
                  {type === 'TRANSFER' ? 'Dari Dompet' : 'Dompet'}
                </p>
                <p className="font-medium text-text-primary">Tunai</p>
              </div>
              <ChevronRight size={20} className="text-text-secondary" />
            </button>

            {type === 'TRANSFER' && (
              <button className="flex-1 flex items-center justify-between p-4 rounded-xl border border-border hover:bg-surface-muted transition-colors text-left">
                <div>
                  <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1">Ke Dompet</p>
                  <p className="font-medium text-text-primary">Pilih...</p>
                </div>
                <ChevronRight size={20} className="text-text-secondary" />
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
    </BottomSheet>
  );
};
