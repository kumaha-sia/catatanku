import React, { useState } from 'react';
import { Search, SlidersHorizontal, ArrowDownRight, ArrowUpRight, ArrowRightLeft, Calendar, ChevronDown, Download, Filter, Trash2, Edit3, Users, Lock, ChevronRight } from 'lucide-react';
import { BottomSheet } from '../components/BottomSheet';
import { useTransactions, useDeleteTransaction, useCategories } from '../hooks/useFinances';
import { useUIStore } from '../store/uiStore';

export const Transactions = () => {
  const [activeType, setActiveType] = useState('SEMUA');
  const [activeVisibility, setActiveVisibility] = useState('SEMUA');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedTx, setSelectedTx] = useState<any>(null);

  const { data: transactions } = useTransactions(undefined, 1);
  const { data: categories } = useCategories();
  const deleteTx = useDeleteTransaction();
  const openAddTransaction = useUIStore(state => state.openAddTransaction);

  const openDetail = (tx: any) => {
    setSelectedTx(tx);
    setIsDetailOpen(true);
  };

  const filteredTransactions = transactions?.filter((tx: any) => {
    if (activeType !== 'SEMUA' && tx.type !== activeType) return false;
    if (activeVisibility !== 'SEMUA' && tx.visibility !== activeVisibility) return false;
    if (filterCategory && tx.category_id !== filterCategory) return false;
    
    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase();
      const matchName = tx.category?.name?.toLowerCase().includes(lowerTerm) || false;
      const matchNote = tx.note?.toLowerCase().includes(lowerTerm) || false;
      const matchAmount = tx.amount.toString().includes(lowerTerm);
      if (!matchName && !matchNote && !matchAmount) return false;
    }
    
    return true;
  }) || [];

  // Group by date
  const grouped = filteredTransactions.reduce((acc: any, tx: any) => {
    const date = new Date(tx.date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' });
    if (!acc[date]) acc[date] = { transactions: [], total: 0 };
    acc[date].transactions.push(tx);
    acc[date].total += tx.type === 'INCOME' ? tx.amount : -tx.amount;
    return acc;
  }, {});

  return (
    <div className="space-y-8 animate-fade-in pb-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-text-primary uppercase tracking-wide">Transaksi</h1>
          <button className="flex items-center gap-2 mt-2 px-3 py-1.5 bg-accent border-2 border-text-primary rounded-none font-black text-xs shadow-[2px_2px_0_0_#171B22] text-text-primary hover:-translate-y-1 hover:shadow-[4px_4px_0_0_#171B22] active:translate-y-0 active:shadow-none transition-all uppercase tracking-wider">
            <Calendar size={14} className="stroke-[3]" />
            Bulan Ini
          </button>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-primary stroke-[3]" size={18} />
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari transaksi..." 
              className="w-full pl-10 pr-4 py-3 bg-surface border-4 border-text-primary rounded-none focus:outline-none focus:shadow-[4px_4px_0_0_#FFB43A] transition-all text-sm font-black"
            />
          </div>
          <button 
            onClick={() => setIsFilterModalOpen(true)}
            className="w-12 h-12 flex items-center justify-center bg-primary border-4 border-text-primary rounded-none text-text-primary shadow-[4px_4px_0_0_#171B22] hover:-translate-y-1 hover:shadow-[6px_6px_0_0_#171B22] active:translate-y-0 active:shadow-none transition-all"
          >
            <SlidersHorizontal size={20} className="stroke-[3]" />
          </button>
        </div>
      </div>

      {/* Filter Chips - Horizontal Scroll */}
      <div className="flex flex-col gap-4">
        {/* Type Filter */}
        <div className="flex overflow-x-auto gap-3 pb-2 -mx-4 px-4 md:mx-0 md:px-0 hide-scrollbar">
          {['SEMUA', 'EXPENSE', 'INCOME', 'TRANSFER'].map((type) => (
            <button 
              key={type}
              onClick={() => setActiveType(type)}
              className={`whitespace-nowrap px-4 py-2 rounded-none text-xs uppercase tracking-wider font-black transition-all border-2 border-text-primary ${
                activeType === type 
                  ? 'bg-text-primary text-surface shadow-[4px_4px_0_0_#FFB43A] -translate-y-0.5' 
                  : 'bg-surface text-text-primary shadow-[2px_2px_0_0_#171B22] hover:-translate-y-0.5 hover:shadow-[4px_4px_0_0_#171B22]'
              }`}
            >
              {type === 'SEMUA' ? 'Semua Tipe' : type === 'EXPENSE' ? 'Pengeluaran' : type === 'INCOME' ? 'Pemasukan' : 'Transfer'}
            </button>
          ))}
        </div>

        {/* Visibility Filter */}
        <div className="flex overflow-x-auto gap-3 pb-2 -mx-4 px-4 md:mx-0 md:px-0 hide-scrollbar">
          {['SEMUA', 'PRIVATE', 'FAMILY'].map((vis) => (
            <button 
              key={vis}
              onClick={() => setActiveVisibility(vis)}
              className={`whitespace-nowrap px-4 py-1.5 rounded-none text-xs uppercase tracking-wider font-black transition-all border-2 border-text-primary ${
                activeVisibility === vis 
                  ? 'bg-accent text-text-primary shadow-[4px_4px_0_0_#171B22] -translate-y-0.5' 
                  : 'bg-surface text-text-primary shadow-[2px_2px_0_0_#171B22] hover:-translate-y-0.5 hover:shadow-[4px_4px_0_0_#171B22]'
              }`}
            >
              {vis === 'SEMUA' ? 'Semua' : vis === 'PRIVATE' ? 'Pribadi' : 'Keluarga'}
            </button>
          ))}
        </div>
      </div>

      {/* Transaction List */}
      <div className="bg-surface rounded-none shadow-[8px_8px_0_0_#171B22] border-4 border-text-primary overflow-hidden">
        
        {Object.keys(grouped).length === 0 ? (
          <div className="text-center p-12 bg-surface">
            <p className="text-text-primary font-black uppercase tracking-widest">Belum ada transaksi</p>
          </div>
        ) : (
          Object.keys(grouped).map((date) => (
            <div key={date}>
              <div className="bg-text-primary px-4 py-3 flex justify-between items-center border-y-2 border-text-primary first:border-t-0">
                <p className="text-xs font-black text-surface uppercase tracking-widest">{date}</p>
                <p className={`text-xs font-black bg-surface px-2 py-1 border-2 border-text-primary shadow-[2px_2px_0_0_#171B22] ${grouped[date].total > 0 ? 'text-income' : 'text-error'}`}>
                  {grouped[date].total > 0 ? '+' : ''}{grouped[date].total.toLocaleString('id-ID')}
                </p>
              </div>
              <div className="divide-y-2 divide-text-primary bg-surface">
                {grouped[date].transactions.map((tx: any) => (
                  <div key={tx.id} onClick={() => openDetail(tx)} className="flex items-center justify-between p-4 hover:bg-primary/20 cursor-pointer transition-colors group">
                    <div className="flex items-center gap-4">
                      <div className={`w-14 h-14 border-2 border-text-primary rounded-none flex items-center justify-center text-2xl shadow-[2px_2px_0_0_#171B22] group-hover:-translate-y-1 transition-transform ${tx.type === 'INCOME' ? 'bg-income' : tx.type === 'EXPENSE' ? 'bg-expense' : 'bg-[#89CFF0]'}`}>
                        {tx.category?.icon || (tx.type === 'INCOME' ? '💰' : '💸')}
                      </div>
                      <div>
                        <p className="font-black text-text-primary uppercase text-sm md:text-base">{tx.note || tx.category?.name || 'Transaksi'}</p>
                        <div className="flex items-center gap-2 mt-1 text-xs font-bold">
                          <span className={`px-2 py-0.5 border-2 border-text-primary ${tx.visibility === 'PRIVATE' ? 'bg-primary text-text-primary' : 'bg-accent text-text-primary'}`}>
                            {tx.visibility === 'PRIVATE' ? '🔒 PRIBADI' : '👥 KELUARGA'}
                          </span>
                          <span className="bg-surface-muted px-2 py-0.5 border-2 border-text-primary">{tx.wallet?.name}</span>
                          {tx.creator && tx.visibility === 'FAMILY' && (
                            <span className="bg-surface-muted px-2 py-0.5 border-2 border-text-primary">{tx.creator.name.split(' ')[0]}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-black text-lg ${tx.type === 'INCOME' ? 'text-income' : 'text-expense'}`}>
                        {tx.type === 'INCOME' ? '+' : '-'} {tx.amount.toLocaleString('id-ID')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Advanced Filter Modal */}
      <BottomSheet isOpen={isFilterModalOpen} onClose={() => setIsFilterModalOpen(false)} title="Filter Lanjutan">
        <div className="space-y-6 pt-4">
          
          <div>
            <label className="text-xs font-black text-text-primary uppercase tracking-widest mb-3 block">Urutkan Berdasarkan</label>
            <div className="grid grid-cols-2 gap-3">
              <button className="py-3 rounded-none text-xs uppercase tracking-wider font-black bg-primary text-text-primary border-2 border-text-primary shadow-[2px_2px_0_0_#171B22] hover:-translate-y-0.5 transition-all">
                Terbaru
              </button>
              <button className="py-3 rounded-none text-xs uppercase tracking-wider font-black bg-surface text-text-primary border-2 border-text-primary shadow-[2px_2px_0_0_#171B22] hover:-translate-y-0.5 transition-all">
                Terlama
              </button>
              <button className="py-3 rounded-none text-xs uppercase tracking-wider font-black bg-surface text-text-primary border-2 border-text-primary shadow-[2px_2px_0_0_#171B22] hover:-translate-y-0.5 transition-all">
                Nominal Terbesar
              </button>
              <button className="py-3 rounded-none text-xs uppercase tracking-wider font-black bg-surface text-text-primary border-2 border-text-primary shadow-[2px_2px_0_0_#171B22] hover:-translate-y-0.5 transition-all">
                Nominal Terkecil
              </button>
            </div>
          </div>

            <div>
              <label className="text-xs font-black text-text-primary uppercase tracking-widest mb-3 block">Kategori Spesifik</label>
              <select 
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full bg-surface border-4 border-text-primary rounded-none px-4 py-3 font-black text-text-primary focus:outline-none focus:shadow-[4px_4px_0_0_#FFB43A] appearance-none cursor-pointer"
              >
                <option value="">Semua Kategori</option>
                {categories?.map((c: any) => (
                  <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                ))}
              </select>
            </div>

          <button 
            onClick={() => setIsFilterModalOpen(false)}
            className="w-full py-4 bg-primary text-text-primary rounded-none border-4 border-text-primary font-black text-lg uppercase tracking-wider shadow-[4px_4px_0_0_#171B22] hover:-translate-y-1 hover:shadow-[6px_6px_0_0_#171B22] active:translate-y-0 active:shadow-none transition-all mt-4"
          >
            Terapkan Filter
          </button>
        </div>
      </BottomSheet>

      {/* Transaction Detail Modal */}
      <BottomSheet isOpen={isDetailOpen} onClose={() => setIsDetailOpen(false)} title="Detail Transaksi">
        {selectedTx && (
          <div className="space-y-6 pt-4">
            <div className="flex flex-col items-center justify-center text-center">
              <div className={`w-24 h-24 rounded-none border-4 border-text-primary shadow-[4px_4px_0_0_#171B22] flex items-center justify-center text-5xl mb-6 ${selectedTx.type === 'INCOME' ? 'bg-income' : selectedTx.type === 'EXPENSE' ? 'bg-expense' : 'bg-[#89CFF0]'}`}>
                {selectedTx.category?.icon || (selectedTx.type === 'INCOME' ? '💰' : '💸')}
              </div>
              <h2 className="text-2xl font-black text-text-primary uppercase mb-2">{selectedTx.note || selectedTx.category?.name || 'Transaksi'}</h2>
              <p className={`text-4xl font-black bg-text-primary px-4 py-2 ${selectedTx.type === 'EXPENSE' ? 'text-expense' : 'text-income'}`}>
                {selectedTx.type === 'EXPENSE' ? '-' : '+'}Rp {Math.abs(selectedTx.amount).toLocaleString('id-ID')}
              </p>
            </div>

            <div className="bg-surface border-4 border-text-primary rounded-none p-5 space-y-4 shadow-[4px_4px_0_0_#171B22]">
              <div className="flex justify-between items-center pb-4 border-b-2 border-text-primary">
                <span className="text-xs font-black text-text-primary uppercase tracking-widest">Visibilitas</span>
                <span className={`text-sm font-black px-3 py-1 border-2 border-text-primary flex items-center gap-2 ${selectedTx.visibility === 'PRIVATE' ? 'bg-primary' : 'bg-accent'}`}>
                  {selectedTx.visibility === 'PRIVATE' ? <Lock size={14} className="stroke-[3]"/> : <Users size={14} className="stroke-[3]"/>}
                  {selectedTx.visibility === 'PRIVATE' ? 'PRIBADI' : 'KELUARGA'}
                </span>
              </div>
              <div className="flex justify-between items-center pb-4 border-b-2 border-text-primary">
                <span className="text-xs font-black text-text-primary uppercase tracking-widest">Dompet</span>
                <span className="text-sm font-black text-text-primary uppercase">{selectedTx.wallet?.name}</span>
              </div>
              {selectedTx.creator && (
                <div className="flex justify-between items-center pb-4 border-b-2 border-text-primary">
                  <span className="text-xs font-black text-text-primary uppercase tracking-widest">Dibuat oleh</span>
                  <span className="text-sm font-black text-text-primary uppercase">{selectedTx.creator?.name}</span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-xs font-black text-text-primary uppercase tracking-widest">Tanggal</span>
                <span className="text-sm font-black text-text-primary uppercase">
                  {new Date(selectedTx.date).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                </span>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button 
                onClick={async () => {
                  if (confirm('Yakin ingin menghapus transaksi ini?')) {
                    await deleteTx.mutateAsync(selectedTx.id);
                    setIsDetailOpen(false);
                  }
                }}
                className="flex-1 py-4 bg-error text-text-primary border-4 border-text-primary rounded-none font-black text-lg uppercase tracking-wider shadow-[4px_4px_0_0_#171B22] hover:-translate-y-1 hover:shadow-[6px_6px_0_0_#171B22] active:translate-y-0 active:shadow-none transition-all flex items-center justify-center gap-2"
              >
                <Trash2 size={24} className="stroke-[3]" />
                Hapus
              </button>
              <button 
                onClick={() => {
                  setIsDetailOpen(false);
                  openAddTransaction(selectedTx);
                }}
                className="flex-1 py-4 bg-primary text-text-primary rounded-none border-4 border-text-primary font-black text-lg uppercase tracking-wider shadow-[4px_4px_0_0_#171B22] hover:-translate-y-1 hover:shadow-[6px_6px_0_0_#171B22] active:translate-y-0 active:shadow-none transition-all flex items-center justify-center gap-2"
              >
                <Edit3 size={24} className="stroke-[3]" />
                Edit
              </button>
            </div>
          </div>
        )}
      </BottomSheet>

    </div>
  );
};
