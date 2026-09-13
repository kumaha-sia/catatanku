import React, { useState } from 'react';
import { Plus, ArrowRightLeft, CreditCard, Wallet as WalletIcon, Smartphone, PiggyBank, Users, ArrowRight } from 'lucide-react';
import { BottomSheet } from '../components/BottomSheet';
import { useWallets, useCreateWallet, useUpdateWallet, useDeleteWallet, useCreateTransaction, useHouseholds } from '../hooks/useFinances';
import { useUIStore } from '../store/uiStore';
import { useAuthStore } from '../store/authStore';

export const Wallets = () => {
  const openAddTransaction = useUIStore(state => state.openAddTransaction);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedWalletId, setSelectedWalletId] = useState('');
  const [walletName, setWalletName] = useState('');
  const [walletBalance, setWalletBalance] = useState('');
  const [walletType, setWalletType] = useState<'PERSONAL' | 'SHARED'>('PERSONAL');

  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [transferAmount, setTransferAmount] = useState('');
  const [transferSourceWalletId, setTransferSourceWalletId] = useState('');
  const [transferDestWalletId, setTransferDestWalletId] = useState('');

  const { data: wallets } = useWallets();
  const { data: households } = useHouseholds();
  const createWallet = useCreateWallet();
  const updateWallet = useUpdateWallet();
  const deleteWallet = useDeleteWallet();
  const createTransaction = useCreateTransaction();
  const user = useAuthStore(state => state.user);

  const handleSave = async () => {
    try {
      const data = {
        name: walletName,
        type: 'CASH', // default for now
        scope: walletType,
        initial_balance: parseFloat(walletBalance.replace(/\./g, '')) || 0
      };

      if (editMode && selectedWalletId) {
        await updateWallet.mutateAsync({ id: selectedWalletId, data: { name: data.name, type: data.type } });
      } else {
        await createWallet.mutateAsync(data);
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error(error);
      window.toast.error('Terjadi kesalahan');
    }
  };

  const handleDelete = async () => {
    if (!selectedWalletId) return;
    window.appConfirm('Yakin ingin menghapus dompet ini? Semua transaksi terkait akan terhapus.', async () => {
      try {
        await deleteWallet.mutateAsync(selectedWalletId);
        setIsModalOpen(false);
      } catch (error) {
        console.error(error);
        window.toast.error('Gagal menghapus dompet');
      }
    });
  };

  const openAdd = () => {
    setEditMode(false);
    setSelectedWalletId('');
    setWalletName('');
    setWalletBalance('');
    setWalletType('PERSONAL');
    setIsModalOpen(true);
  };

  const handleTransferToMember = async () => {
    if (!transferSourceWalletId) return window.toast.info('Pilih dompet asal');
    if (!transferDestWalletId) return window.toast.info('Pilih dompet tujuan');
    const amount = parseFloat(transferAmount.replace(/\./g, '')) || 0;
    if (amount <= 0) return window.toast.info('Masukkan jumlah transfer');

    const sourceWallet = wallets?.personal?.find((w: any) => w.id === transferSourceWalletId);
    if (!sourceWallet) return;
    
    // Find household shared with this member
    const sharedHousehold = households?.find((h: any) => h.role !== 'OWNER') || households?.[0];

    try {
      await createTransaction.mutateAsync({
        household_id: sourceWallet.household_id || sharedHousehold?.id,
        wallet_id: transferSourceWalletId,
        destination_wallet_id: transferDestWalletId,
        type: 'TRANSFER',
        amount,
        date: new Date().toISOString(),
        note: `Transfer ke ${selectedMember?.name}`,
        visibility: 'FAMILY'
      });
      window.toast.success(`Berhasil transfer ke ${selectedMember?.name}`);
      setIsMemberModalOpen(false);
      setTransferAmount('');
      setTransferSourceWalletId('');
      setTransferDestWalletId('');
    } catch (err: any) {
      window.toast.error(err.response?.data?.message || 'Gagal transfer');
    }
  };

  const openEdit = (wallet: any) => {
    setEditMode(true);
    setSelectedWalletId(wallet.id);
    setWalletName(wallet.name);
    setWalletBalance('');
    setWalletType(wallet.scope as 'PERSONAL' | 'SHARED');
    setIsModalOpen(true);
  };

  const calculateTotal = (walletList: any[]) => {
    return walletList?.reduce((acc, w) => acc + (w.balance || 0), 0) || 0;
  };

  return (
    <div className="space-y-8 animate-fade-in pb-8">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-black text-text-primary uppercase tracking-wide">Dompet</h1>
        <button 
          onClick={openAdd}
          className="w-12 h-12 bg-primary text-surface rounded-none border-4 border-text-primary flex items-center justify-center shadow-[4px_4px_0_0_#171B22] hover:-translate-y-1 hover:shadow-[6px_6px_0_0_#171B22] active:translate-y-0 active:shadow-none transition-all"
        >
          <Plus size={24} className="stroke-[3]" />
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-primary text-surface border-4 border-text-primary p-5 rounded-none shadow-[4px_4px_0_0_#171B22]">
          <p className="text-xs font-black uppercase tracking-widest mb-2 border-b-2 border-surface pb-2 inline-block">Total Dompet Pribadi</p>
          <p className="text-3xl font-black mt-2 break-all sm:break-words">Rp {calculateTotal(wallets?.personal || []).toLocaleString('id-ID')}</p>
        </div>
        
        {/* Total Keluarga Card */}
        <div className="bg-accent border-4 border-text-primary p-5 rounded-none shadow-[4px_4px_0_0_#171B22]">
          <p className="text-xs font-black text-text-primary uppercase tracking-widest mb-2 border-b-2 border-text-primary pb-2 inline-flex items-center gap-2">
            Total Dompet Keluarga <Users size={14} />
          </p>
          <p className="text-3xl font-black text-text-primary mt-2 break-all sm:break-words">
            Rp {(
              (wallets?.family_members?.reduce((acc: number, m: any) => acc + (m.total_balance || 0), 0) || 0) +
              calculateTotal(wallets?.personal || [])
            ).toLocaleString('id-ID')}
          </p>
        </div>
      </div>

      {/* Transfer Button */}
      <button 
        onClick={() => openAddTransaction({ type: 'TRANSFER', amount: 0, date: new Date().toISOString() })}
        className="w-full bg-surface border-4 border-text-primary py-4 rounded-none flex items-center justify-center gap-3 font-black text-text-primary uppercase tracking-wider shadow-[4px_4px_0_0_#171B22] hover:-translate-y-1 hover:shadow-[6px_6px_0_0_#171B22] active:translate-y-0 active:shadow-none transition-all"
      >
        <ArrowRightLeft size={20} className="stroke-[3] text-transfer" />
        Transfer Antar Dompet
      </button>

      {/* Personal Wallets */}
      <section>
        <h2 className="text-sm font-black text-text-primary uppercase tracking-widest mb-3 border-b-2 border-text-primary pb-2 inline-block">Pribadi</h2>
        <div className="bg-surface border-4 border-text-primary rounded-none overflow-hidden shadow-[4px_4px_0_0_#171B22] divide-y-4 divide-text-primary mt-2">
          {wallets?.personal?.map((w: any) => (
            <WalletItem 
              key={w.id}
              icon={<WalletIcon size={24} className="text-text-primary stroke-[3]" />}
              name={w.name}
              balance={w.balance?.toLocaleString('id-ID') || '0'}
              bgClass="bg-[#89CFF0]"
              onEdit={() => openEdit(w)}
            />
          ))}
          {(!wallets?.personal || wallets.personal.length === 0) && (
             <div className="p-6 text-center text-text-primary font-black uppercase tracking-widest bg-surface">Belum ada dompet pribadi</div>
          )}
        </div>
      </section>

      {/* Family Wallets */}
      <section>
        <h2 className="text-sm font-black text-text-primary uppercase tracking-widest mb-3 border-b-2 border-text-primary pb-2 inline-block">Keluarga</h2>
        <div className="bg-surface border-4 border-text-primary rounded-none overflow-hidden shadow-[4px_4px_0_0_#171B22] divide-y-4 divide-text-primary mt-2">
          {wallets?.family_members?.map((member: any) => (
            <button 
              key={member.id} 
              onClick={() => {
                setSelectedMember(member);
                setTransferDestWalletId('');
                setTransferSourceWalletId('');
                setTransferAmount('');
                setIsMemberModalOpen(true);
              }}
              className="w-full flex items-center justify-between p-3 md:p-4 bg-surface hover:bg-text-primary/5 transition-colors group text-left cursor-pointer"
            >
              <div className="flex items-center gap-3 md:gap-4 min-w-0 flex-1">
                <div className={`w-12 h-12 md:w-14 md:h-14 shrink-0 border-2 border-text-primary rounded-none flex items-center justify-center bg-accent text-text-primary font-black text-xl md:text-2xl shadow-[2px_2px_0_0_#171B22] group-hover:-translate-y-1 group-hover:shadow-[4px_4px_0_0_#171B22] transition-all`}>
                   {member.name?.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1 pr-2">
                   <p className="font-black text-text-primary uppercase tracking-wide text-base md:text-xl leading-none truncate">{member.name}</p>
                   <p className="text-[10px] md:text-xs font-black uppercase tracking-wider text-text-primary/70 mt-1 truncate">Ketuk untuk transfer</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <p className="font-black text-text-primary text-base md:text-xl bg-surface px-2 py-1 md:px-3 md:py-2 border-2 border-text-primary shadow-[2px_2px_0_0_#171B22] shrink-0 whitespace-nowrap">Rp {member.total_balance?.toLocaleString('id-ID') || '0'}</p>
                <ArrowRight size={20} className="text-text-primary hidden md:block" />
              </div>
            </button>
          ))}
          {(!wallets?.family_members || wallets.family_members.length === 0) && (
             <div className="p-8 flex flex-col items-center text-center bg-surface">
                <Users size={32} className="text-text-primary/30 mb-3" />
                <p className="text-text-primary font-black uppercase tracking-widest">Belum ada anggota keluarga</p>
                <p className="text-xs font-bold text-text-primary/70 mt-1">Undang pasangan untuk melihat total kekayaan bersama.</p>
             </div>
          )}
        </div>
      </section>

      {/* Add Wallet Bottom Sheet */}
      <BottomSheet isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editMode ? "Ubah Dompet" : "Tambah Dompet Baru"}>
        <div className="space-y-6 pt-4">
          
          <div>
            <label className="text-xs font-black text-text-primary uppercase tracking-widest mb-2 block">Nama Dompet</label>
            <input 
              type="text" 
              placeholder="Contoh: BCA"
              value={walletName}
              onChange={(e) => setWalletName(e.target.value)}
              className="w-full bg-surface border-4 border-text-primary rounded-none px-4 py-3 font-black text-text-primary focus:outline-none focus:shadow-[4px_4px_0_0_#FFB43A] transition-all"
            />
          </div>

          <div>
            <label className="text-xs font-black text-text-primary uppercase tracking-widest mb-2 block">Saldo Awal (Rp)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-text-primary bg-surface px-1">Rp</span>
              <input 
                type="number" 
                placeholder="0"
                value={walletBalance}
                onChange={(e) => setWalletBalance(e.target.value)}
                className="w-full bg-surface border-4 border-text-primary rounded-none pl-14 pr-4 py-3 font-black text-xl text-text-primary focus:outline-none focus:shadow-[4px_4px_0_0_#FFB43A] transition-all"
              />
            </div>
          </div>


          <button 
            onClick={handleSave}
            disabled={!walletName || (!editMode && !walletBalance)}
            className="w-full py-4 bg-primary text-surface border-4 border-text-primary rounded-none font-black text-lg uppercase tracking-wider shadow-[4px_4px_0_0_#171B22] hover:-translate-y-1 hover:shadow-[6px_6px_0_0_#171B22] active:translate-y-0 active:shadow-none disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-[4px_4px_0_0_#171B22] transition-all mt-6"
          >
            {editMode ? "Simpan Perubahan" : "Simpan Dompet"}
          </button>
          
          {editMode && (
            <button 
              onClick={handleDelete}
              className="w-full py-4 bg-error text-text-primary border-4 border-text-primary rounded-none font-black text-lg uppercase tracking-wider shadow-[4px_4px_0_0_#171B22] hover:-translate-y-1 hover:shadow-[6px_6px_0_0_#171B22] active:translate-y-0 active:shadow-none transition-all mt-4"
            >
              Hapus Dompet
            </button>
          )}
        </div>
      </BottomSheet>

      {/* Member Detail & Transfer Bottom Sheet */}
      <BottomSheet isOpen={isMemberModalOpen} onClose={() => setIsMemberModalOpen(false)} title="Detail Anggota">
        {selectedMember && (
          <div className="space-y-6 pt-4">
            
            <div className="flex flex-col items-center justify-center text-center p-6 bg-surface border-4 border-text-primary shadow-[4px_4px_0_0_#171B22] mb-6 relative overflow-hidden">
              <div className="absolute inset-0 bg-accent/20" />
              <div className={`w-20 h-20 rounded-none border-4 border-text-primary shadow-[4px_4px_0_0_#171B22] flex items-center justify-center bg-accent text-text-primary font-black text-4xl mb-4 relative z-10`}>
                {selectedMember.name?.charAt(0).toUpperCase()}
              </div>
              <h2 className="text-2xl font-black text-text-primary uppercase mb-1 relative z-10">{selectedMember.name}</h2>
              <p className="text-xs font-black text-text-primary/70 uppercase tracking-widest relative z-10 mb-4">Total Saldo Pribadi</p>
              <p className="text-3xl font-black bg-surface px-4 py-2 border-2 border-text-primary shadow-[2px_2px_0_0_#171B22] relative z-10">
                Rp {selectedMember.total_balance?.toLocaleString('id-ID') || '0'}
              </p>
            </div>

            <div className="bg-surface border-4 border-text-primary p-5 shadow-[4px_4px_0_0_#171B22] space-y-5">
              <h3 className="font-black text-text-primary uppercase tracking-widest border-b-2 border-text-primary pb-2 flex items-center gap-2">
                <ArrowRightLeft size={16} className="text-transfer" />
                Kirim Saldo
              </h3>

              <div>
                <label className="text-xs font-black text-text-primary uppercase tracking-widest mb-2 block">Pilih Dompet Sumber (Anda)</label>
                <select 
                  value={transferSourceWalletId}
                  onChange={(e) => setTransferSourceWalletId(e.target.value)}
                  className="w-full bg-surface border-4 border-text-primary rounded-none px-4 py-3 font-black text-text-primary focus:outline-none focus:shadow-[4px_4px_0_0_#FFB43A] cursor-pointer"
                >
                  <option value="">-- Pilih Dompet --</option>
                  {wallets?.personal?.map((w: any) => (
                    <option key={w.id} value={w.id}>{w.name} (Rp {w.balance?.toLocaleString('id-ID')})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-black text-text-primary uppercase tracking-widest mb-2 block">Pilih Dompet Tujuan ({selectedMember.name})</label>
                <select 
                  value={transferDestWalletId}
                  onChange={(e) => setTransferDestWalletId(e.target.value)}
                  className="w-full bg-surface border-4 border-text-primary rounded-none px-4 py-3 font-black text-text-primary focus:outline-none focus:shadow-[4px_4px_0_0_#FFB43A] cursor-pointer"
                >
                  <option value="">-- Pilih Dompet --</option>
                  {selectedMember.wallets?.map((w: any) => (
                    <option key={w.id} value={w.id}>{w.name}</option>
                  ))}
                </select>
                {(!selectedMember.wallets || selectedMember.wallets.length === 0) && (
                  <p className="text-xs font-bold text-error mt-2">Anggota ini belum memiliki dompet.</p>
                )}
              </div>

              <div>
                <label className="text-xs font-black text-text-primary uppercase tracking-widest mb-2 block">Jumlah Transfer (Rp)</label>
                <input 
                  type="text" 
                  inputMode="numeric"
                  placeholder="0"
                  value={transferAmount}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '');
                    setTransferAmount(val ? parseInt(val, 10).toLocaleString('id-ID') : '');
                  }}
                  className="w-full bg-surface border-4 border-text-primary rounded-none px-4 py-3 font-black text-xl text-text-primary focus:outline-none focus:shadow-[4px_4px_0_0_#FFB43A]"
                />
              </div>

              <button 
                onClick={handleTransferToMember}
                disabled={!transferSourceWalletId || !transferDestWalletId || !transferAmount || createTransaction.isPending}
                className="w-full py-4 bg-primary text-surface border-4 border-text-primary rounded-none font-black text-lg uppercase tracking-wider shadow-[4px_4px_0_0_#171B22] hover:-translate-y-1 hover:shadow-[6px_6px_0_0_#171B22] active:translate-y-0 active:shadow-none disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-[4px_4px_0_0_#171B22] transition-all flex items-center justify-center gap-2"
              >
                {createTransaction.isPending ? 'Memproses...' : 'Kirim Sekarang'}
              </button>
            </div>

          </div>
        )}
      </BottomSheet>

    </div>
  );
};

const WalletItem = ({ icon, name, balance, bgClass, onEdit }: { icon: React.ReactNode, name: string, balance: string, bgClass: string, onEdit: () => void }) => (
  <div onClick={onEdit} className="flex items-center justify-between p-3 md:p-4 bg-surface hover:bg-text-primary/5 cursor-pointer transition-colors group">
    <div className="flex items-center gap-3 md:gap-4 min-w-0 flex-1">
      <div className={`w-12 h-12 md:w-14 md:h-14 shrink-0 border-2 border-text-primary rounded-none flex items-center justify-center ${bgClass} shadow-[2px_2px_0_0_#171B22] group-hover:-translate-y-1 group-hover:shadow-[4px_4px_0_0_#171B22] transition-transform`}>
        {icon}
      </div>
      <p className="font-black text-text-primary uppercase tracking-wide text-base md:text-xl truncate pr-2">{name}</p>
    </div>
    <p className="font-black text-text-primary text-base md:text-xl bg-surface px-2 py-1 md:px-3 md:py-2 border-2 border-text-primary shadow-[2px_2px_0_0_#171B22] shrink-0 whitespace-nowrap ml-2">Rp {balance}</p>
  </div>
);
