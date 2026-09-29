import React, { useState } from 'react';
import { Search, SlidersHorizontal, ArrowDownRight, ArrowUpRight, ArrowRightLeft, Calendar, ChevronDown, Download, Filter, Trash2, Edit3, Users, Lock, ChevronRight } from 'lucide-react';
import { BottomSheet } from '../components/BottomSheet';
import { useTransactions, useDeleteTransaction, useCategories, useHouseholds } from '../hooks/useFinances';
import { useUIStore } from '../store/uiStore';
import { useAuthStore } from '../store/authStore';

export const Transactions = () => {
  const now = new Date();
  const [currentMonth, setCurrentMonth] = useState(now.getMonth() + 1);
  const [currentYear, setCurrentYear] = useState(now.getFullYear());
  
  const [activeType, setActiveType] = useState('SEMUA');
  const [activeVisibility, setActiveVisibility] = useState('SEMUA');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [sortOrder, setSortOrder] = useState<'NEWEST' | 'OLDEST' | 'HIGHEST' | 'LOWEST'>('NEWEST');
  const [page, setPage] = useState(1);
  
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedTx, setSelectedTx] = useState<any>(null);

  const { data: households } = useHouseholds();
  const user = useAuthStore(state => state.user);
  
  const personalHousehold = households?.find((h: any) => h.role === 'OWNER') || households?.[0];
  const joinedHousehold = households?.find((h: any) => h.role !== 'OWNER' && h.status !== 'PENDING');
  const familyHousehold = joinedHousehold || personalHousehold;
  const activeHouseholdId = activeVisibility === 'PRIVATE' ? personalHousehold?.id : familyHousehold?.id;

  const { data: txResponse, isFetching } = useTransactions(familyHousehold?.id, page, currentMonth + "", currentYear + "");
  const transactions = txResponse?.data || [];
  const pagination = txResponse?.pagination;
  const { data: categories } = useCategories();
  const deleteTx = useDeleteTransaction();
  const openAddTransaction = useUIStore(state => state.openAddTransaction);

  const openDetail = (tx: any) => {
    setSelectedTx(tx);
    setIsDetailOpen(true);
  };

  let filteredTransactions = transactions?.filter((tx: any) => {
    if (activeType !== 'SEMUA' && tx.type !== activeType) return false;
    
    if (activeVisibility === 'PRIVATE' && tx.creator?.id !== user?.id) return false;
    if (activeVisibility === 'FAMILY' && tx.creator?.id === user?.id) return false;

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

  filteredTransactions.sort((a: any, b: any) => {
    if (sortOrder === 'NEWEST') return new Date(b.date).getTime() - new Date(a.date).getTime();
    if (sortOrder === 'OLDEST') return new Date(a.date).getTime() - new Date(b.date).getTime();
    if (sortOrder === 'HIGHEST') return b.amount - a.amount;
    if (sortOrder === 'LOWEST') return a.amount - b.amount;
    return 0;
  });

  // Group by date
  const grouped = filteredTransactions.reduce((acc: any, tx: any) => {
    const date = new Date(tx.date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' });
    if (!acc[date]) acc[date] = { transactions: [], total: 0 };
    acc[date].transactions.push(tx);
    acc[date].total += tx.type === 'INCOME' ? tx.amount : -tx.amount;
    return acc;
  }, {});

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h1 className="text-2xl md:text-3xl font-black text-text-primary uppercase tracking-wide">Transaksi</h1>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => {
                { setPage(1); if (currentMonth === 1) { setCurrentMonth(12); setCurrentYear(y => y - 1); }
                else { setCurrentMonth(m => m - 1); } }
              }}
              className="w-10 h-10 flex items-center justify-center bg-surface border-2 border-text-primary shadow-[4px_4px_0_0_#171B22] hover:-translate-y-1 hover:shadow-[4px_4px_0_0_#171B22] transition-all active:translate-y-0 active:shadow-none"
            >
              &lt;
            </button>
            <div className="flex-1 md:flex-none px-4 py-2 bg-surface border-2 border-text-primary shadow-[4px_4px_0_0_#171B22] font-black uppercase tracking-wider text-xs md:text-sm min-w-[140px] text-center">
              {new Date(currentYear, currentMonth - 1).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
            </div>
            <button 
              onClick={() => {
                { setPage(1); if (currentMonth === 12) { setCurrentMonth(1); setCurrentYear(y => y + 1); }
                else { setCurrentMonth((m: number) => m + 1); } }
              }}
              className="w-10 h-10 flex items-center justify-center bg-surface border-2 border-text-primary shadow-[4px_4px_0_0_#171B22] hover:-translate-y-1 hover:shadow-[4px_4px_0_0_#171B22] transition-all active:translate-y-0 active:shadow-none"
            >
              &gt;
            </button>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
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
            className="w-12 h-12 flex-shrink-0 flex items-center justify-center bg-primary text-surface border-4 border-text-primary rounded-none shadow-[4px_4px_0_0_#171B22] hover:-translate-y-1 hover:shadow-[6px_6px_0_0_#171B22] active:translate-y-0 active:shadow-none transition-all"
          >
            <SlidersHorizontal size={20} className="stroke-[3]" />
          </button>
        </div>
      </div>

      {/* Filter Chips - Horizontal Scroll */}
      <div className="flex flex-col gap-3">
        {/* Type Filter */}
        <div className="grid grid-cols-4 gap-2">
          {['SEMUA', 'EXPENSE', 'INCOME', 'TRANSFER'].map((type) => (
            <button 
              key={type}
              onClick={() => setActiveType(type)}
              className={`px-2 py-2 rounded-none text-[10px] sm:text-xs uppercase tracking-wider font-black transition-all border-2 border-text-primary text-center truncate ${
                activeType === type 
                  ? 'bg-text-primary text-surface shadow-[2px_2px_0_0_#FFB43A] translate-y-0.5' 
                  : 'bg-surface text-text-primary shadow-[2px_2px_0_0_#171B22] hover:translate-y-0.5 hover:shadow-[2px_2px_0_0_#171B22]'
              }`}
            >
              {type === 'SEMUA' ? 'Semua' : type === 'EXPENSE' ? 'Keluar' : type === 'INCOME' ? 'Masuk' : 'Transfer'}
            </button>
          ))}
        </div>

        {/* Visibility Filter */}
        <div className="grid grid-cols-3 gap-2">
          {['SEMUA', 'PRIVATE', 'FAMILY'].map((vis) => (
            <button 
              key={vis}
              onClick={() => setActiveVisibility(vis)}
              className={`px-2 py-1.5 rounded-none text-xs uppercase tracking-wider font-black transition-all border-2 border-text-primary text-center truncate ${
                activeVisibility === vis 
                  ? 'bg-accent text-text-primary shadow-[2px_2px_0_0_#171B22] translate-y-0.5' 
                  : 'bg-surface text-text-primary shadow-[2px_2px_0_0_#171B22] hover:translate-y-0.5 hover:shadow-[2px_2px_0_0_#171B22]'
              }`}
            >
              {vis === 'SEMUA' ? 'Semua' : vis === 'PRIVATE' ? 'Pribadi' : 'Keluarga'}
            </button>
          ))}
        </div>
      </div>

      {/* Transaction List */}
      <div className="space-y-6">
        
        {Object.keys(grouped).length === 0 ? (
          <div className="text-center p-12 bg-surface border-4 border-text-primary shadow-[4px_4px_0_0_#171B22]">
            <p className="text-text-primary font-black uppercase tracking-widest">Belum ada transaksi</p>
          </div>
        ) : (
          Object.keys(grouped).map((date) => (
            <div key={date} className="space-y-3">
              <div className="flex justify-between items-center border-b-4 border-text-primary pb-2">
                <p className="text-xs md:text-sm font-black text-text-primary uppercase tracking-widest">{date}</p>
                <p className={`text-xs md:text-sm font-black px-2 py-1 bg-surface border-2 border-text-primary shadow-[2px_2px_0_0_#171B22] ${grouped[date].total > 0 ? 'text-income' : 'text-expense'}`}>
                  {grouped[date].total > 0 ? '+' : ''}{grouped[date].total.toLocaleString('id-ID')}
                </p>
              </div>
              <div className="bg-surface border-2 border-text-primary shadow-[4px_4px_0_0_#171B22] flex flex-col">
                {grouped[date].transactions.map((tx: any, index: number) => (
                  <div key={tx.id} onClick={() => openDetail(tx)} className={`flex items-center justify-between p-3 md:p-4 cursor-pointer hover:bg-surface-muted transition-all group ${index !== grouped[date].transactions.length - 1 ? 'border-b-2 border-text-primary' : ''}`}>
                    <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
                      <div className={`w-12 h-12 flex-shrink-0 border-2 border-text-primary rounded-none flex items-center justify-center text-xl shadow-[2px_2px_0_0_#171B22] ${tx.type === 'INCOME' ? 'bg-[#A3E635]' : tx.type === 'EXPENSE' ? 'bg-[#FFA6A6]' : 'bg-[#89CFF0]'}`}>
                        {tx.category?.icon || (tx.type === 'INCOME' ? '💰' : '💸')}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-black text-text-primary uppercase text-sm md:text-base truncate">{tx.note || tx.category?.name || 'Transaksi'}</p>
                        <div className="flex flex-wrap items-center gap-1.5 mt-1">
                          {tx.category && (
                            <span className="bg-[#89CFF0] px-1.5 py-0.5 border-2 border-text-primary text-[10px] font-black uppercase tracking-wider truncate max-w-[100px]">
                              {tx.category.name}
                            </span>
                          )}
                          <span className="bg-surface-muted px-1.5 py-0.5 border-2 border-text-primary text-[10px] font-black uppercase tracking-wider truncate max-w-[80px]">
                            {tx.wallet?.name}
                          </span>
                          <span className={`px-1.5 py-0.5 border-2 border-text-primary text-[10px] font-black uppercase tracking-wider flex items-center gap-1 ${tx.creator?.id === user?.id ? 'bg-primary text-surface' : 'bg-accent text-text-primary'}`}>
                            {tx.creator?.id === user?.id ? <Lock size={10} className="stroke-[3]" /> : <Users size={10} className="stroke-[3]" />}
                            {tx.creator?.id === user?.id ? 'PRIBADI' : tx.creator?.name?.split(' ')[0] || 'KELUARGA'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right ml-3 flex-shrink-0">
                      <p className={`font-black text-sm md:text-base leading-none ${tx.type === 'INCOME' ? 'text-income' : 'text-expense'}`}>
                        {tx.type === 'INCOME' ? '+' : '-'} {tx.amount.toLocaleString('id-ID')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      
        {/* Pagination Controls */}
        {pagination && pagination.total > 0 && (
          <div className="flex items-center justify-between bg-surface border-4 border-text-primary p-4 shadow-[4px_4px_0_0_#171B22] mt-6">
            <button 
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1 || isFetching}
              className="px-4 py-2 bg-accent text-text-primary border-2 border-text-primary shadow-[2px_2px_0_0_#171B22] disabled:opacity-50 disabled:shadow-none hover:-translate-y-0.5 transition-all font-black uppercase text-sm"
            >
              Sebelumnya
            </button>
            <div className="text-sm font-black uppercase tracking-wider">
              Hal {page} / {Math.ceil(pagination.total / pagination.limit)}
            </div>
            <button 
              onClick={() => setPage(p => p + 1)}
              disabled={page >= Math.ceil(pagination.total / pagination.limit) || isFetching}
              className="px-4 py-2 bg-accent text-text-primary border-2 border-text-primary shadow-[2px_2px_0_0_#171B22] disabled:opacity-50 disabled:shadow-none hover:-translate-y-0.5 transition-all font-black uppercase text-sm"
            >
              Selanjutnya
            </button>
          </div>
        )}
      </div>

      {/* Advanced Filter Modal */}
      <BottomSheet isOpen={isFilterModalOpen} onClose={() => setIsFilterModalOpen(false)} title="Filter Lanjutan">
        <div className="space-y-6 pt-4">
          
          <div>
            <label className="text-xs font-black text-text-primary uppercase tracking-widest mb-3 block">Urutkan Berdasarkan</label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { id: 'NEWEST', label: 'Terbaru' },
                { id: 'OLDEST', label: 'Terlama' },
                { id: 'HIGHEST', label: 'Nominal Terbesar' },
                { id: 'LOWEST', label: 'Nominal Terkecil' },
              ].map((sort) => (
                <button 
                  key={sort.id}
                  onClick={() => setSortOrder(sort.id as any)}
                  className={`py-3 rounded-none text-xs uppercase tracking-wider font-black border-2 border-text-primary shadow-[2px_2px_0_0_#171B22] hover:-translate-y-0.5 transition-all ${
                    sortOrder === sort.id ? 'bg-primary text-surface shadow-[4px_4px_0_0_#FFB43A]' : 'bg-surface text-text-primary'
                  }`}
                >
                  {sort.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-black text-text-primary uppercase tracking-widest mb-3 block">Kategori Spesifik</label>
            <div className="relative">
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
              <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-text-primary border-l-4 border-text-primary">
                <ChevronDown size={20} className="stroke-[3]" />
              </div>
            </div>
          </div>

          <button 
            onClick={() => setIsFilterModalOpen(false)}
            className="w-full py-4 bg-primary text-surface rounded-none border-4 border-text-primary font-black text-lg uppercase tracking-wider shadow-[4px_4px_0_0_#171B22] hover:-translate-y-1 hover:shadow-[6px_6px_0_0_#171B22] active:translate-y-0 active:shadow-none transition-all mt-4"
          >
            Terapkan Filter
          </button>
        </div>
      </BottomSheet>

      {/* Transaction Detail Modal */}
      <BottomSheet isOpen={isDetailOpen} onClose={() => setIsDetailOpen(false)} title="Detail Transaksi">
        {selectedTx && (
          <div className="pt-2 pb-6 px-1">
            <div className="bg-surface border-4 border-text-primary shadow-[8px_8px_0_0_#171B22] flex flex-col mb-2">
              {/* Header / Amount */}
              <div className="p-6 flex flex-col items-center text-center border-b-4 border-dashed border-text-primary relative overflow-hidden">
                {/* Background Tint */}
                <div className={`absolute inset-0 opacity-10 ${selectedTx.type === 'INCOME' ? 'bg-[#A3E635]' : selectedTx.type === 'EXPENSE' ? 'bg-[#FFA6A6]' : 'bg-[#89CFF0]'}`} />
                
                <div className="w-20 h-20 rounded-none border-4 border-text-primary shadow-[4px_4px_0_0_#171B22] flex items-center justify-center text-4xl mb-4 relative z-10 bg-surface">
                  {selectedTx.category?.icon || (selectedTx.type === 'INCOME' ? '💰' : '💸')}
                </div>
                
                <h2 className="text-xl font-black text-text-primary uppercase leading-tight mb-2 relative z-10">
                  {selectedTx.note || selectedTx.category?.name || 'Transaksi'}
                </h2>
                
                <p className={`text-4xl md:text-5xl font-black tracking-tighter relative z-10 ${selectedTx.type === 'EXPENSE' ? 'text-expense' : 'text-income'}`}>
                  {selectedTx.type === 'EXPENSE' ? '-' : '+'}Rp {Math.abs(selectedTx.amount).toLocaleString('id-ID')}
                </p>
              </div>

              {/* Details List */}
              <div className="p-6 bg-surface space-y-4">
                <div className="flex justify-between items-center pb-4 border-b-2 border-text-primary/20">
                  <span className="text-xs font-black text-text-primary/60 uppercase tracking-widest">Kategori</span>
                  <span className="text-sm font-black text-text-primary uppercase text-right">{selectedTx.category?.name || '-'}</span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b-2 border-text-primary/20">
                  <span className="text-xs font-black text-text-primary/60 uppercase tracking-widest">Dompet</span>
                  <span className="text-sm font-black text-text-primary uppercase text-right">{selectedTx.wallet?.name}</span>
                </div>
                {selectedTx.creator && (
                  <div className="flex justify-between items-center pb-4 border-b-2 border-text-primary/20">
                    <span className="text-xs font-black text-text-primary/60 uppercase tracking-widest">Dibuat Oleh</span>
                    <span className="text-sm font-black text-text-primary uppercase text-right">{selectedTx.creator?.name}</span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-xs font-black text-text-primary/60 uppercase tracking-widest">Waktu</span>
                  <span className="text-sm font-black text-text-primary uppercase text-right">
                    {new Date(selectedTx.date).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                  </span>
                </div>
              </div>
            </div>

            {selectedTx.created_by === user?.id && (
              <div className="flex gap-4 pt-4">
                <button 
                  onClick={async () => {
                    window.appConfirm('Yakin ingin menghapus transaksi ini?', async () => {
                      await deleteTx.mutateAsync(selectedTx.id);
                      setIsDetailOpen(false);
                    });
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
                  className="flex-1 py-4 bg-primary text-surface rounded-none border-4 border-text-primary font-black text-lg uppercase tracking-wider shadow-[4px_4px_0_0_#171B22] hover:-translate-y-1 hover:shadow-[6px_6px_0_0_#171B22] active:translate-y-0 active:shadow-none transition-all flex items-center justify-center gap-2"
                >
                  <Edit3 size={24} className="stroke-[3]" />
                  Edit
                </button>
              </div>
            )}
          </div>
        )}
      </BottomSheet>

    </div>
  );
};

