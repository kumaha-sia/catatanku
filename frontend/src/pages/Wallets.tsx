import React, { useState } from 'react';
import { Plus, ArrowRightLeft, CreditCard, Wallet as WalletIcon, Smartphone, PiggyBank, Users } from 'lucide-react';
import { BottomSheet } from '../components/BottomSheet';
import { useWallets, useCreateWallet, useUpdateWallet, useDeleteWallet } from '../hooks/useFinances';
import { useUIStore } from '../store/uiStore';

export const Wallets = () => {
  const openAddTransaction = useUIStore(state => state.openAddTransaction);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedWalletId, setSelectedWalletId] = useState('');
  const [walletName, setWalletName] = useState('');
  const [walletBalance, setWalletBalance] = useState('');
  const [walletType, setWalletType] = useState<'PERSONAL' | 'SHARED'>('PERSONAL');

  const { data: wallets } = useWallets();
  const createWallet = useCreateWallet();
  const updateWallet = useUpdateWallet();
  const deleteWallet = useDeleteWallet();

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
      alert('Terjadi kesalahan');
    }
  };

  const handleDelete = async () => {
    if (!selectedWalletId) return;
    if (confirm('Yakin ingin menghapus dompet ini? Semua transaksi terkait akan terhapus.')) {
      try {
        await deleteWallet.mutateAsync(selectedWalletId);
        setIsModalOpen(false);
      } catch (error) {
        console.error(error);
        alert('Gagal menghapus dompet');
      }
    }
  };

  const openAdd = () => {
    setEditMode(false);
    setSelectedWalletId('');
    setWalletName('');
    setWalletBalance('');
    setIsModalOpen(true);
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
    return walletList?.reduce((acc, w) => acc + (w.initial_balance || 0), 0) || 0;
  };

  return (
    <div className="space-y-8 animate-fade-in pb-8">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-black text-text-primary uppercase tracking-wide">Dompet</h1>
        <button 
          onClick={openAdd}
          className="w-12 h-12 bg-primary text-text-primary rounded-none border-4 border-text-primary flex items-center justify-center shadow-[4px_4px_0_0_#171B22] hover:-translate-y-1 hover:shadow-[6px_6px_0_0_#171B22] active:translate-y-0 active:shadow-none transition-all"
        >
          <Plus size={24} className="stroke-[3]" />
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-primary border-4 border-text-primary p-5 rounded-none shadow-[4px_4px_0_0_#171B22]">
          <p className="text-xs font-black text-text-primary uppercase tracking-widest mb-2 border-b-2 border-text-primary pb-2 inline-block">Total Dompet Pribadi</p>
          <p className="text-3xl font-black text-text-primary mt-2 break-all sm:break-words">Rp {calculateTotal(wallets?.personal || []).toLocaleString('id-ID')}</p>
        </div>
        
        {/* Total Keluarga Card */}
        <div className="bg-accent border-4 border-text-primary p-5 rounded-none shadow-[4px_4px_0_0_#171B22]">
          <p className="text-xs font-black text-text-primary uppercase tracking-widest mb-2 border-b-2 border-text-primary pb-2 inline-flex items-center gap-2">
            Total Dompet Keluarga <Users size={14} />
          </p>
          <p className="text-3xl font-black text-text-primary mt-2 break-all sm:break-words">Rp {calculateTotal(wallets?.shared || []).toLocaleString('id-ID')}</p>
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
              balance={w.initial_balance?.toLocaleString('id-ID') || '0'}
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
          {wallets?.shared?.map((w: any) => (
            <WalletItem 
              key={w.id}
              icon={<WalletIcon size={24} className="text-text-primary stroke-[3]" />}
              name={w.name}
              balance={w.initial_balance?.toLocaleString('id-ID') || '0'}
              bgClass="bg-income"
              onEdit={() => openEdit(w)}
            />
          ))}
          {(!wallets?.shared || wallets.shared.length === 0) && (
             <div className="p-6 text-center text-text-primary font-black uppercase tracking-widest bg-surface">Belum ada dompet keluarga</div>
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
              placeholder="Contoh: BCA Pribadi"
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

          <div>
            <label className="text-xs font-black text-text-primary uppercase tracking-widest mb-3 block">Visibilitas</label>
            <div className="flex p-1.5 bg-surface border-4 border-text-primary rounded-none shadow-[4px_4px_0_0_#171B22]">
              <button 
                onClick={() => setWalletType('PERSONAL')}
                className={`flex-1 py-3 text-xs font-black uppercase tracking-wider rounded-none transition-all border-2 ${walletType === 'PERSONAL' ? 'bg-primary border-text-primary text-text-primary shadow-[2px_2px_0_0_#171B22]' : 'bg-transparent border-transparent text-text-primary hover:border-text-primary/50'}`}
              >
                Pribadi
              </button>
              <button 
                onClick={() => setWalletType('SHARED')}
                className={`flex-1 py-3 text-xs font-black uppercase tracking-wider rounded-none transition-all border-2 ${walletType === 'SHARED' ? 'bg-accent border-text-primary text-text-primary shadow-[2px_2px_0_0_#171B22]' : 'bg-transparent border-transparent text-text-primary hover:border-text-primary/50'}`}
              >
                Keluarga
              </button>
            </div>
          </div>

          <button 
            onClick={handleSave}
            disabled={!walletName || (!editMode && !walletBalance)}
            className="w-full py-4 bg-primary text-text-primary border-4 border-text-primary rounded-none font-black text-lg uppercase tracking-wider shadow-[4px_4px_0_0_#171B22] hover:-translate-y-1 hover:shadow-[6px_6px_0_0_#171B22] active:translate-y-0 active:shadow-none disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-[4px_4px_0_0_#171B22] transition-all mt-6"
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

    </div>
  );
};

const WalletItem = ({ icon, name, balance, bgClass, onEdit }: { icon: React.ReactNode, name: string, balance: string, bgClass: string, onEdit: () => void }) => (
  <div onClick={onEdit} className="flex items-center justify-between p-4 bg-surface hover:bg-text-primary/5 cursor-pointer transition-colors group">
    <div className="flex items-center gap-4">
      <div className={`w-14 h-14 border-2 border-text-primary rounded-none flex items-center justify-center ${bgClass} shadow-[2px_2px_0_0_#171B22] group-hover:-translate-y-1 group-hover:shadow-[4px_4px_0_0_#171B22] transition-transform`}>
        {icon}
      </div>
      <p className="font-black text-text-primary uppercase tracking-wide text-lg md:text-xl">{name}</p>
    </div>
    <p className="font-black text-text-primary text-lg md:text-xl bg-surface px-2 py-1 border-2 border-text-primary shadow-[2px_2px_0_0_#171B22]">Rp {balance}</p>
  </div>
);
