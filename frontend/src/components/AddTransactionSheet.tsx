import React, { useState, useMemo, useEffect } from 'react';
import { BottomSheet } from './BottomSheet';
import { NumericKeypad } from './NumericKeypad';
import { useUIStore } from '../store/uiStore';
import { ChevronRight, ChevronLeft, Search } from 'lucide-react';
import { useWallets, useCategories, useCreateTransaction, useUpdateTransaction, useHouseholds } from '../hooks/useFinances';
import { useAuthStore } from '../store/authStore';

export const AddTransactionSheet = () => {
  const { isAddTransactionOpen, closeAddTransaction, editTransactionData } = useUIStore();
  const [type, setType] = useState<'EXPENSE' | 'INCOME' | 'TRANSFER'>('EXPENSE');
  const [amountStr, setAmountStr] = useState('0');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(() => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 10);
  });
  
  const { data: walletsData } = useWallets();
  const { data: categories } = useCategories();
  const { data: households } = useHouseholds();
  const user = useAuthStore(state => state.user);
  const createTx = useCreateTransaction();

  const allWallets = useMemo(() => {
    if (!walletsData) return [];
    return [...(walletsData.personal || []), ...(walletsData.shared || [])];
  }, [walletsData]);

  // Selections
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [selectedWalletFrom, setSelectedWalletFrom] = useState<any>(null);
  const [selectedWalletTo, setSelectedWalletTo] = useState<any>(null);

  const [searchCat, setSearchCat] = useState('');
  
  const updateTx = useUpdateTransaction();

  // Populate data when editing
  useEffect(() => {
    if (isAddTransactionOpen && editTransactionData) {
      setType(editTransactionData.type);
      setAmountStr(editTransactionData.amount.toString());
      setNote(editTransactionData.note || '');
      
      const txDate = new Date(editTransactionData.date);
      txDate.setMinutes(txDate.getMinutes() - txDate.getTimezoneOffset());
      setDate(txDate.toISOString().slice(0, 10));
      
      if (allWallets.length > 0) {
        const wf = allWallets.find(w => w.id === editTransactionData.wallet_id);
        if (wf) setSelectedWalletFrom(wf);
        
        if (editTransactionData.type === 'TRANSFER' && editTransactionData.destination_wallet_id) {
          const wt = allWallets.find(w => w.id === editTransactionData.destination_wallet_id);
          if (wt) setSelectedWalletTo(wt);
        }
      }
      if (categories && categories.length > 0) {
        const c = categories.find((cat: any) => cat.id === editTransactionData.category_id);
        if (c) setSelectedCategory(c);
      }
    } else if (isAddTransactionOpen && !editTransactionData) {
      // Reset if adding new
      setType('EXPENSE');
      setAmountStr('0');
      setNote('');
      setSelectedCategory(null);
      setSelectedWalletFrom(null);
      setSelectedWalletTo(null);
      const now = new Date();
      now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
      setDate(now.toISOString().slice(0, 10));
    }
  }, [isAddTransactionOpen, editTransactionData, allWallets, categories]);

  // Default selections when data loads
  useEffect(() => {
    if (isAddTransactionOpen && !editTransactionData) {
      if (allWallets.length > 0 && !selectedWalletFrom) {
        const tunaiWallet = allWallets.find((w: any) => w.name.toLowerCase() === 'tunai');
        setSelectedWalletFrom(tunaiWallet || allWallets[0]);
      }
      if (categories && categories.length > 0 && !selectedCategory) {
        // Find first matching category for type
        const defaultCat = categories.find((c: any) => c.type === type);
        if (defaultCat) setSelectedCategory(defaultCat);
      }
    }
  }, [allWallets, categories, selectedWalletFrom, selectedCategory, type, isAddTransactionOpen, editTransactionData]);

  const filteredCategories = useMemo(() => {
    if (!categories) return [];
    return categories.filter((c: any) => c.type === type && c.name.toLowerCase().includes(searchCat.toLowerCase()));
  }, [categories, type, searchCat]);

  // View State for drill-down selectors
  const [activeView, setActiveView] = useState<'MAIN' | 'CATEGORY' | 'WALLET_FROM' | 'WALLET_TO' | 'NOTE'>('MAIN');

  const formattedAmount = parseInt(amountStr || '0', 10).toLocaleString('id-ID');

  const handleSave = async () => {
    if (!selectedWalletFrom) return alert('Pilih dompet sumber');
    if (type !== 'TRANSFER' && !selectedCategory) return alert('Pilih kategori');
    if (type === 'TRANSFER' && !selectedWalletTo) return alert('Pilih dompet tujuan');

    const personalHouseholdId = households?.find((h: any) => h.owner_id === user?.id)?.id || households?.[0]?.id;

    const payload = {
      household_id: selectedWalletFrom.household_id || personalHouseholdId,
      wallet_id: selectedWalletFrom.id,
      destination_wallet_id: type === 'TRANSFER' ? selectedWalletTo.id : undefined,
      category_id: type !== 'TRANSFER' ? selectedCategory.id : undefined,
      type,
      amount: parseInt(amountStr, 10),
      currency: 'IDR',
      date: new Date(date).toISOString(),
      note: note || undefined,
      visibility: selectedWalletFrom.scope === 'SHARED' ? 'FAMILY' : 'PRIVATE'
    };

    try {
      if (editTransactionData && editTransactionData.id) {
        await updateTx.mutateAsync({ id: editTransactionData.id, data: payload });
      } else {
        await createTx.mutateAsync(payload);
      }
      closeAddTransaction();
      setAmountStr('0');
      setNote('');
      setActiveView('MAIN');
    } catch (e) {
      alert('Gagal menyimpan transaksi');
    }
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
          
          {/* Type Selector (Hidden in Transfer mode) */}
          {type !== 'TRANSFER' && (
            <div className="flex bg-surface border-2 border-text-primary rounded-none shadow-[4px_4px_0_0_#171B22]">
              <button 
                className={`flex-1 py-3 text-sm font-black uppercase tracking-wider transition-all border-r-2 border-text-primary ${type === 'EXPENSE' ? 'bg-expense text-text-primary' : 'bg-surface text-text-primary hover:bg-surface-muted'}`}
                onClick={() => { setType('EXPENSE'); setSelectedCategory(null); }}
              >
                Pengeluaran
              </button>
              <button 
                className={`flex-1 py-3 text-sm font-black uppercase tracking-wider transition-all ${type === 'INCOME' ? 'bg-income text-text-primary' : 'bg-surface text-text-primary hover:bg-surface-muted'}`}
                onClick={() => { setType('INCOME'); setSelectedCategory(null); }}
              >
                Pemasukan
              </button>
            </div>
          )}

          {/* Amount Display */}
          <div className="text-center py-4 px-2">
            <span className="text-text-primary font-black text-2xl relative -top-2 md:-top-4">Rp</span>
            <span 
              className={`font-black ml-1 md:ml-2 break-all tracking-tight leading-none ${amountStr === '0' ? 'text-text-primary/50' : 'text-text-primary'}
                ${formattedAmount.length > 11 ? 'text-3xl' : formattedAmount.length > 8 ? 'text-4xl' : formattedAmount.length > 6 ? 'text-5xl' : 'text-6xl'}
              `}
            >
              {formattedAmount}
            </span>
            {amountStr === '0' && (
              <p className="text-text-primary font-bold uppercase tracking-wider text-sm mt-2">Ketik nominal di bawah</p>
            )}
          </div>

          {/* Selectors (Premium Drill-Down) */}
          <div className="space-y-4">
            
            {type !== 'TRANSFER' && (
              <button 
                onClick={() => setActiveView('CATEGORY')}
                className="w-full flex items-center justify-between p-4 rounded-none border-2 border-text-primary bg-surface hover:-translate-y-1 hover:shadow-[4px_4px_0_0_#171B22] active:translate-y-0 active:shadow-[2px_2px_0_0_#171B22] transition-all text-left group shadow-[2px_2px_0_0_#171B22]"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-surface rounded-none flex items-center justify-center text-2xl border-2 border-text-primary shadow-[2px_2px_0_0_#171B22]">
                    {selectedCategory ? selectedCategory.icon : '❓'}
                  </div>
                  <div>
                    <p className="text-xs font-black text-text-primary uppercase tracking-widest mb-0.5">Kategori</p>
                    <p className="font-black text-text-primary text-lg">{selectedCategory ? selectedCategory.name : 'Pilih Kategori'}</p>
                  </div>
                </div>
                <ChevronRight size={24} className="text-text-primary" />
              </button>
            )}

            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={() => setActiveView('WALLET_FROM')}
                className="flex-1 flex items-center justify-between p-4 rounded-none border-2 border-text-primary bg-surface hover:-translate-y-1 hover:shadow-[4px_4px_0_0_#171B22] active:translate-y-0 active:shadow-[2px_2px_0_0_#171B22] transition-all text-left group shadow-[2px_2px_0_0_#171B22]"
              >
                <div>
                  <p className="text-xs font-black text-text-primary uppercase tracking-widest mb-1">
                    {type === 'TRANSFER' ? 'Dari Dompet' : 'Dompet'}
                  </p>
                  <p className="font-black text-text-primary text-lg">{selectedWalletFrom ? selectedWalletFrom.name : 'Pilih Dompet'}</p>
                </div>
                <ChevronRight size={24} className="text-text-primary" />
              </button>

              {type === 'TRANSFER' && (
                <button 
                  onClick={() => setActiveView('WALLET_TO')}
                  className="flex-1 flex items-center justify-between p-4 rounded-none border-2 border-text-primary bg-surface hover:-translate-y-1 hover:shadow-[4px_4px_0_0_#171B22] active:translate-y-0 active:shadow-[2px_2px_0_0_#171B22] transition-all text-left group shadow-[2px_2px_0_0_#171B22]"
                >
                  <div>
                    <p className="text-xs font-black text-text-primary uppercase tracking-widest mb-1">Ke Dompet</p>
                    <p className={`font-black text-lg ${!selectedWalletTo ? 'text-text-primary/50' : 'text-text-primary'}`}>
                      {selectedWalletTo ? selectedWalletTo.name : 'Pilih Dompet'}
                    </p>
                  </div>
                  <ChevronRight size={24} className="text-text-primary" />
                </button>
              )}
            </div>

            <button 
              onClick={() => setActiveView('NOTE')}
              className="w-full flex items-center justify-between p-4 rounded-none border-2 border-text-primary bg-surface hover:-translate-y-1 hover:shadow-[4px_4px_0_0_#171B22] active:translate-y-0 active:shadow-[2px_2px_0_0_#171B22] transition-all text-left group shadow-[2px_2px_0_0_#171B22]"
            >
              <div>
                <p className="text-xs font-black text-text-primary uppercase tracking-widest mb-1">Catatan</p>
                <p className={`font-black text-lg truncate ${!note ? 'text-text-primary/50' : 'text-text-primary'}`}>
                  {note || 'Tambahkan catatan opsional'}
                </p>
              </div>
              <ChevronRight size={24} className="text-text-primary" />
            </button>

            {/* Date Picker */}
            <div className="w-full flex items-center justify-between p-4 rounded-none border-2 border-text-primary bg-surface shadow-[2px_2px_0_0_#171B22]">
              <div className="w-full">
                <p className="text-xs font-black text-text-primary uppercase tracking-widest mb-1">Tanggal</p>
                <input 
                  type="date" 
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full font-black text-lg bg-transparent border-none focus:outline-none focus:ring-0 p-0 text-text-primary"
                />
              </div>
            </div>
          </div>

          {/* Save Button */}
          <button 
            onClick={handleSave}
            disabled={!amountStr || amountStr === '0' || createTx.isPending}
            className="w-full py-4 bg-primary text-surface rounded-none border-2 border-text-primary font-black uppercase tracking-wider text-xl shadow-[4px_4px_0_0_#171B22] hover:-translate-y-1 hover:shadow-[6px_6px_0_0_#171B22] active:translate-y-0 active:shadow-none disabled:opacity-50 disabled:hover:translate-y-0 disabled:shadow-none transition-all mt-4"
          >
            {createTx.isPending ? 'Menyimpan...' : 'Simpan Transaksi'}
          </button>

          {/* Numeric Keypad */}
          <NumericKeypad value={amountStr} onChange={setAmountStr} />
        </div>
      )}

      {/* CATEGORY SELECTOR VIEW */}
      {activeView === 'CATEGORY' && (
        <div className="animate-fade-in flex flex-col h-[500px]">
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-primary" size={20} />
            <input 
              type="text" 
              placeholder="CARI KATEGORI..." 
              value={searchCat}
              onChange={e => setSearchCat(e.target.value)}
              className="w-full bg-surface rounded-none border-2 border-text-primary pl-12 pr-4 py-4 text-sm font-black uppercase tracking-wider text-text-primary focus:outline-none focus:ring-0 focus:shadow-[4px_4px_0_0_#FFB43A] shadow-[2px_2px_0_0_#171B22]"
            />
          </div>
          <div className="flex-1 overflow-y-auto space-y-4 hide-scrollbar pb-6 px-1">
            {filteredCategories.map((c: any) => (
              <CategoryListItem 
                key={c.id} 
                icon={c.icon} 
                name={c.name} 
                onSelect={() => { setSelectedCategory(c); setActiveView('MAIN'); setSearchCat(''); }} 
              />
            ))}
            {filteredCategories.length === 0 && <p className="text-center font-black uppercase tracking-wider text-text-primary mt-10">Kategori tidak ditemukan</p>}
          </div>
        </div>
      )}

      {/* WALLET SELECTOR VIEW */}
      {(activeView === 'WALLET_FROM' || activeView === 'WALLET_TO') && (
        <div className="animate-fade-in flex flex-col h-[400px]">
          <div className="flex-1 overflow-y-auto space-y-4 hide-scrollbar pb-6 px-1 mt-2">
            {allWallets.map((w: any) => (
              <WalletListItem 
                key={w.id}
                name={w.name} 
                type={w.scope === 'PERSONAL' ? 'Pribadi' : 'Bersama'} 
                balance={`Rp ${(w.balance || 0).toLocaleString('id-ID')}`} 
                onSelect={() => { 
                  if (activeView === 'WALLET_FROM') setSelectedWalletFrom(w); else setSelectedWalletTo(w);
                  setActiveView('MAIN');
                }} 
              />
            ))}
          </div>
        </div>
      )}

      {/* NOTE VIEW */}
      {activeView === 'NOTE' && (
        <div className="animate-fade-in flex flex-col h-[300px]">
          <textarea 
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="TULISKAN DETAIL TRANSAKSI DI SINI..."
            className="w-full flex-1 bg-surface rounded-none border-2 border-text-primary p-4 font-black uppercase tracking-wider text-text-primary focus:outline-none focus:ring-0 focus:shadow-[4px_4px_0_0_#FFB43A] shadow-[2px_2px_0_0_#171B22] resize-none"
            autoFocus
          />
          <button 
            onClick={() => setActiveView('MAIN')}
            className="w-full py-4 bg-primary text-surface rounded-none border-2 border-text-primary font-black uppercase tracking-wider text-xl shadow-[4px_4px_0_0_#171B22] hover:-translate-y-1 hover:shadow-[6px_6px_0_0_#171B22] active:translate-y-0 active:shadow-none transition-all mt-6"
          >
            Selesai
          </button>
        </div>
      )}

    </BottomSheet>
  );
};

const CategoryListItem = ({ icon, name, onSelect }: { icon: string, name: string, onSelect: () => void }) => (
  <button 
    onClick={onSelect}
    className="w-full flex items-center justify-between p-4 rounded-none border-2 border-text-primary bg-surface hover:-translate-y-1 hover:shadow-[4px_4px_0_0_#171B22] active:translate-y-0 active:shadow-none transition-all text-left shadow-[2px_2px_0_0_#171B22]"
  >
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 rounded-none bg-surface border-2 border-text-primary flex items-center justify-center text-2xl shadow-[2px_2px_0_0_#171B22]">
        {icon}
      </div>
      <p className="font-black text-text-primary text-lg">{name}</p>
    </div>
  </button>
);

const WalletListItem = ({ name, type, balance, onSelect }: { name: string, type: string, balance: string, onSelect: () => void }) => (
  <button 
    onClick={onSelect}
    className="w-full flex items-center justify-between p-4 rounded-none border-2 border-text-primary bg-surface hover:-translate-y-1 hover:shadow-[4px_4px_0_0_#171B22] active:translate-y-0 active:shadow-none transition-all text-left shadow-[2px_2px_0_0_#171B22]"
  >
    <div>
      <p className="font-black text-text-primary text-lg mb-1">{name}</p>
      <span className="text-[10px] font-black uppercase tracking-widest text-text-primary border-2 border-text-primary bg-accent px-2 py-1 rounded-none shadow-[2px_2px_0_0_#171B22]">{type}</span>
    </div>
    <p className="font-black text-text-primary text-lg">{balance}</p>
  </button>
);
