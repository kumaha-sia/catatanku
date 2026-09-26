import React, { useState } from 'react';
import { useAdminHouseholds, useDeleteHousehold } from '../../hooks/useAdmin';
import { useConfirmStore } from '../../store/confirmStore';
import { Search, Trash2 } from 'lucide-react';

export const AdminHouseholds: React.FC = () => {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const { data, isLoading } = useAdminHouseholds({ search, page, limit: 10 });
  const deleteHousehold = useDeleteHousehold();
  const confirm = useConfirmStore(s => s.showConfirm);

  const handleDelete = (household: any) => {
    confirm(`Hapus keluarga ${household.name}? Semua transaksi di dalamnya akan terhapus secara permanen!`, () => {
      deleteHousehold.mutate(household.id);
    });
  };

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      <header className="border-b-4 border-text-primary pb-4 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-text-primary uppercase tracking-wide">Manajemen Keluarga</h1>
          <p className="text-text-secondary font-bold text-sm mt-1 uppercase tracking-widest">Pantau dan kelola grup household</p>
        </div>
        <div className="relative">
          <input 
            type="text" 
            placeholder="Cari household..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 pr-4 py-2 bg-surface border-4 border-text-primary font-bold focus:outline-none focus:shadow-[4px_4px_0_0_#A3E635] transition-all"
          />
          <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-primary stroke-[3]" />
        </div>
      </header>

      {isLoading ? (
        <div className="text-center font-black animate-pulse">Memuat...</div>
      ) : (
        <div className="bg-surface border-4 border-text-primary shadow-[4px_4px_0_0_#171B22] overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-accent text-text-primary border-b-4 border-text-primary text-sm uppercase tracking-wider font-black">
                <th className="p-4">Keluarga</th>
                <th className="p-4 border-l-4 border-text-primary">Owner</th>
                <th className="p-4 border-l-4 border-text-primary">Member</th>
                <th className="p-4 border-l-4 border-text-primary">Transaksi</th>
                <th className="p-4 border-l-4 border-text-primary text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {data?.households?.map((hh: any, idx: number) => (
                <tr key={hh.id} className={`${idx !== data.households.length - 1 ? 'border-b-4 border-text-primary' : ''} hover:bg-surface-muted transition-colors`}>
                  <td className="p-4 font-black text-text-primary uppercase">{hh.name}</td>
                  <td className="p-4 border-l-4 border-text-primary font-bold text-sm">{hh.owner?.name}</td>
                  <td className="p-4 border-l-4 border-text-primary font-black text-lg">{hh._count?.members || 1}</td>
                  <td className="p-4 border-l-4 border-text-primary font-black text-lg">{hh._count?.transactions || 0}</td>
                  <td className="p-4 border-l-4 border-text-primary text-center">
                    <button onClick={() => handleDelete(hh)} title="Hapus" className="w-8 h-8 inline-flex items-center justify-center bg-error text-surface border-2 border-text-primary hover:bg-error-dark transition-colors">
                      <Trash2 size={16} className="stroke-[3]" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
