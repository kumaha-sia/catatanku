import React, { useState } from 'react';
import { useAdminUsers, useSuspendUser, useUpdateUserRole, useDeleteUser } from '../../hooks/useAdmin';
import { useConfirmStore } from '../../store/confirmStore';
import { Search, MoreVertical, ShieldAlert, ShieldCheck, Trash2, Ban } from 'lucide-react';

export const AdminUsers: React.FC = () => {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const { data, isLoading } = useAdminUsers({ search, page, limit: 10 });
  const suspendUser = useSuspendUser();
  const updateRole = useUpdateUserRole();
  const deleteUser = useDeleteUser();
  const confirm = useConfirmStore(s => s.showConfirm);

  const handleRoleToggle = (user: any) => {
    confirm(`Ubah hak akses ${user.name}? User akan diubah menjadi ${user.role === "ADMIN" ? "USER biasa" : "ADMIN"}.`, () => {
      updateRole.mutate({ id: user.id, role: user.role === 'ADMIN' ? 'USER' : 'ADMIN' });
    });
  };

  const handleSuspend = (user: any) => {
    confirm(`Suspend ${user.name}? User yang disuspend tidak akan bisa login.`, () => {
      suspendUser.mutate(user.id);
    });
  };

  const handleDelete = (user: any) => {
    confirm(`Hapus permanen ${user.name}? Data tidak dapat dikembalikan.`, () => {
      deleteUser.mutate(user.id);
    });
  };

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      <header className="border-b-4 border-text-primary pb-4 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-text-primary uppercase tracking-wide">Manajemen Pengguna</h1>
          <p className="text-text-secondary font-bold text-sm mt-1 uppercase tracking-widest">Atur hak akses dan blokir akun</p>
        </div>
        <div className="relative">
          <input 
            type="text" 
            placeholder="Cari nama/email..." 
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
              <tr className="bg-primary text-surface border-b-4 border-text-primary text-sm uppercase tracking-wider font-black">
                <th className="p-4">User</th>
                <th className="p-4 border-l-4 border-text-primary">Role</th>
                <th className="p-4 border-l-4 border-text-primary">Stats</th>
                <th className="p-4 border-l-4 border-text-primary">Status</th>
                <th className="p-4 border-l-4 border-text-primary text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {data?.users?.map((user: any, idx: number) => (
                <tr key={user.id} className={`${idx !== data.users.length - 1 ? 'border-b-4 border-text-primary' : ''} hover:bg-surface-muted transition-colors`}>
                  <td className="p-4">
                    <p className="font-black text-text-primary uppercase">{user.name}</p>
                    <p className="text-xs font-bold text-text-secondary">{user.email}</p>
                  </td>
                  <td className="p-4 border-l-4 border-text-primary">
                    <span className={`px-2 py-1 text-xs font-black uppercase border-2 border-text-primary ${user.role === 'ADMIN' ? 'bg-primary text-surface' : 'bg-surface'}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="p-4 border-l-4 border-text-primary">
                    <p className="text-xs font-bold"><span className="font-black">{user._count?.households || 0}</span> Keluarga</p>
                    <p className="text-xs font-bold"><span className="font-black">{user._count?.transactions || 0}</span> Transaksi</p>
                  </td>
                  <td className="p-4 border-l-4 border-text-primary">
                    {user.deleted_at ? (
                      <span className="text-error font-black uppercase text-xs">Suspended</span>
                    ) : (
                      <span className="text-primary font-black uppercase text-xs">Active</span>
                    )}
                  </td>
                  <td className="p-4 border-l-4 border-text-primary text-center">
                    <div className="flex justify-center gap-2">
                      <button onClick={() => handleRoleToggle(user)} title="Ubah Role" className="w-8 h-8 flex items-center justify-center bg-surface border-2 border-text-primary hover:bg-primary hover:text-surface transition-colors">
                        {user.role === 'ADMIN' ? <ShieldAlert size={16} className="stroke-[3]" /> : <ShieldCheck size={16} className="stroke-[3]" />}
                      </button>
                      <button onClick={() => handleSuspend(user)} title="Suspend" className="w-8 h-8 flex items-center justify-center bg-surface border-2 border-text-primary hover:bg-warning transition-colors">
                        <Ban size={16} className="stroke-[3]" />
                      </button>
                      <button onClick={() => handleDelete(user)} title="Hapus" className="w-8 h-8 flex items-center justify-center bg-error text-surface border-2 border-text-primary hover:bg-error-dark transition-colors">
                        <Trash2 size={16} className="stroke-[3]" />
                      </button>
                    </div>
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
