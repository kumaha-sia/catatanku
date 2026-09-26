import React, { useState } from 'react';
import { useAdminTransactions } from '../../hooks/useAdmin';
import { ChevronLeft, ChevronRight, Search, Filter } from 'lucide-react';

export const AdminTransactions: React.FC = () => {
  const [page, setPage] = useState(1);
  const [limit] = useState(15);
  const [search, setSearch] = useState('');
  const [type, setType] = useState('ALL');

  // We debounce the search string or just let React Query handle fetching on typing (can be noisy, but works for local).
  const { data, isLoading } = useAdminTransactions({ page, limit, search, type });

  const total = data?.total || 0;
  const totalPages = Math.ceil(total / limit) || 1;

  const handlePrev = () => setPage((p) => Math.max(1, p - 1));
  const handleNext = () => setPage((p) => Math.min(totalPages, p + 1));

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      <header className="border-b-4 border-text-primary pb-4 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-text-primary uppercase tracking-wide">Monitor Transaksi</h1>
          <p className="text-text-secondary font-bold text-sm mt-1 uppercase tracking-widest">Pantau semua aktivitas transaksi (Read-Only)</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
          <div className="relative flex-1 sm:w-64">
            <input 
              type="text" 
              placeholder="Cari catatan/pembuat..." 
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-10 pr-4 py-2 bg-surface border-4 border-text-primary font-bold focus:outline-none focus:shadow-[4px_4px_0_0_#A3E635] transition-all"
            />
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-primary stroke-[3]" />
          </div>
          
          <div className="relative">
            <select 
              value={type} 
              onChange={(e) => { setType(e.target.value); setPage(1); }}
              className="w-full sm:w-auto appearance-none pl-10 pr-8 py-2 bg-surface border-4 border-text-primary font-bold cursor-pointer focus:outline-none focus:shadow-[4px_4px_0_0_#A3E635]"
            >
              <option value="ALL">Semua Tipe</option>
              <option value="INCOME">Pemasukan</option>
              <option value="EXPENSE">Pengeluaran</option>
            </select>
            <Filter size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-primary stroke-[3]" />
          </div>
        </div>
      </header>

      <div className="bg-surface border-4 border-text-primary shadow-[6px_6px_0_0_#171B22] overflow-hidden flex flex-col">
        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-primary text-surface border-b-4 border-text-primary text-sm uppercase tracking-wider font-black">
                <th className="p-4 whitespace-nowrap">Tanggal</th>
                <th className="p-4 border-l-4 border-text-primary">Kategori</th>
                <th className="p-4 border-l-4 border-text-primary">Pembuat & Dompet</th>
                <th className="p-4 border-l-4 border-text-primary w-1/3">Catatan</th>
                <th className="p-4 border-l-4 border-text-primary text-right">Jumlah</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center font-black animate-pulse">Memuat Transaksi...</td>
                </tr>
              ) : data?.transactions?.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center font-black uppercase text-text-secondary">Tidak ada transaksi ditemukan</td>
                </tr>
              ) : (
                data?.transactions?.map((trx: any, idx: number) => (
                  <tr key={trx.id} className={`${idx !== data.transactions.length - 1 ? 'border-b-2 border-text-primary/20' : ''} hover:bg-surface-muted transition-colors`}>
                    <td className="p-4">
                      <div className="font-black text-sm">{new Date(trx.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                    </td>
                    <td className="p-4 border-l-4 border-text-primary">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{trx.category?.icon}</span>
                        <span className="font-bold text-sm uppercase tracking-wide">{trx.category?.name || '-'}</span>
                      </div>
                    </td>
                    <td className="p-4 border-l-4 border-text-primary">
                      <div className="font-black text-sm uppercase">{trx.creator?.name}</div>
                      <div className="text-xs font-bold text-text-secondary uppercase">{trx.wallet?.name}</div>
                    </td>
                    <td className="p-4 border-l-4 border-text-primary">
                      <div className="text-sm font-medium line-clamp-2">{trx.note || '-'}</div>
                    </td>
                    <td className="p-4 border-l-4 border-text-primary text-right">
                      <span className={`px-2 py-1 text-xs font-black uppercase border-2 border-text-primary inline-block mb-1 ${trx.type === 'INCOME' ? 'bg-income text-text-primary' : trx.type === 'EXPENSE' ? 'bg-error text-surface' : 'bg-accent text-text-primary'}`}>
                        {trx.type}
                      </span>
                      <div className={`font-black text-lg ${trx.type === 'INCOME' ? 'text-text-primary' : trx.type === 'EXPENSE' ? 'text-error' : 'text-text-primary'}`}>
                        Rp {trx.amount.toLocaleString('id-ID')}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="bg-surface-muted border-t-4 border-text-primary p-4 flex items-center justify-between">
          <div className="font-black text-sm uppercase tracking-wider text-text-secondary hidden sm:block">
            Total {total} Transaksi
          </div>
          <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
            <button 
              onClick={handlePrev}
              disabled={page === 1}
              className="p-2 border-2 border-text-primary bg-surface hover:bg-primary hover:text-surface disabled:opacity-50 disabled:hover:bg-surface disabled:hover:text-text-primary transition-colors focus:outline-none focus:shadow-[2px_2px_0_0_#171B22]"
            >
              <ChevronLeft size={20} className="stroke-[3]" />
            </button>
            <span className="font-black text-sm uppercase">Halaman {page} / {totalPages}</span>
            <button 
              onClick={handleNext}
              disabled={page === totalPages || totalPages === 0}
              className="p-2 border-2 border-text-primary bg-surface hover:bg-primary hover:text-surface disabled:opacity-50 disabled:hover:bg-surface disabled:hover:text-text-primary transition-colors focus:outline-none focus:shadow-[2px_2px_0_0_#171B22]"
            >
              <ChevronRight size={20} className="stroke-[3]" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
