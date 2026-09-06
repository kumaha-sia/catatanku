import React, { useState } from 'react';
import { Plus, ArrowRightLeft, CreditCard, Wallet as WalletIcon, Smartphone, PiggyBank, Users } from 'lucide-react';
import { BottomSheet } from '../components/BottomSheet';

export const Wallets = () => {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [walletName, setWalletName] = useState('');
  const [walletBalance, setWalletBalance] = useState('');
  const [walletType, setWalletType] = useState<'PRIBADI' | 'BERSAMA'>('PRIBADI');

  const handleSave = () => {
    setIsAddOpen(false);
    setWalletName('');
    setWalletBalance('');
  };

  return (
    <div className="space-y-8 animate-fade-in pb-8">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text-primary">Dompet</h1>
        <button 
          onClick={() => setIsAddOpen(true)}
          className="w-10 h-10 bg-primary text-surface rounded-full flex items-center justify-center shadow-md shadow-primary/20 hover:bg-primary/90 transition-all"
        >
          <Plus size={20} />
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-surface border border-border p-5 rounded-2xl shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
          <p className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-1">Saldo Pribadi</p>
          <p className="text-3xl font-bold text-text-primary">Rp 8.450.000</p>
        </div>
        
        <div className="bg-surface border border-border p-5 rounded-2xl shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
          <p className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-1 flex items-center gap-1">
            <Users size={14} className="text-accent" />
            Saldo Keluarga
          </p>
          <p className="text-3xl font-bold text-text-primary">Rp 6.500.000</p>
        </div>
      </div>

      {/* Transfer Button */}
      <button className="w-full bg-surface border border-border hover:bg-surface-muted transition-colors py-4 rounded-xl flex items-center justify-center gap-2 font-bold text-text-primary shadow-sm">
        <ArrowRightLeft size={18} className="text-transfer" />
        Transfer antar dompet
      </button>

      {/* Personal Wallets */}
      <section>
        <h2 className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-3 px-1">Pribadi</h2>
        <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-sm divide-y divide-border">
          
          <WalletItem 
            icon={<WalletIcon size={24} className="text-orange-500" />}
            name="Tunai"
            balance="450.000"
            bgClass="bg-orange-100"
          />
          <WalletItem 
            icon={<CreditCard size={24} className="text-blue-500" />}
            name="Bank Andi"
            balance="8.000.000"
            bgClass="bg-blue-100"
          />
          <WalletItem 
            icon={<Smartphone size={24} className="text-purple-500" />}
            name="E-wallet"
            balance="0"
            bgClass="bg-purple-100"
          />

        </div>
      </section>

      {/* Shared Wallets */}
      <section>
        <h2 className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-3 px-1">Bersama (Keluarga)</h2>
        <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-sm divide-y divide-border">
          
          <WalletItem 
            icon={<Users size={24} className="text-accent" />}
            name="Dompet Keluarga"
            balance="4.000.000"
            bgClass="bg-accent/20"
          />
          <WalletItem 
            icon={<PiggyBank size={24} className="text-pink-500" />}
            name="Tabungan Anak"
            balance="2.500.000"
            bgClass="bg-pink-100"
          />

        </div>
      </section>

      {/* Add Wallet Bottom Sheet */}
      <BottomSheet isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Tambah Dompet Baru">
        <div className="space-y-6 pt-2">
          
          <div>
            <label className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-2 block px-1">Nama Dompet</label>
            <input 
              type="text" 
              placeholder="Contoh: BCA Andi"
              value={walletName}
              onChange={(e) => setWalletName(e.target.value)}
              className="w-full bg-surface border border-border rounded-xl px-4 py-3 font-semibold text-text-primary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-2 block px-1">Saldo Awal (Rp)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-text-secondary">Rp</span>
              <input 
                type="number" 
                placeholder="0"
                value={walletBalance}
                onChange={(e) => setWalletBalance(e.target.value)}
                className="w-full bg-surface border border-border rounded-xl pl-12 pr-4 py-3 font-bold text-lg text-text-primary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-2 block px-1">Jenis Dompet</label>
            <div className="flex p-1 bg-surface-muted rounded-xl">
              <button 
                onClick={() => setWalletType('PRIBADI')}
                className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors ${walletType === 'PRIBADI' ? 'bg-surface text-text-primary shadow-sm border border-border/50' : 'text-text-secondary'}`}
              >
                Pribadi
              </button>
              <button 
                onClick={() => setWalletType('BERSAMA')}
                className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors ${walletType === 'BERSAMA' ? 'bg-surface text-text-primary shadow-sm border border-border/50' : 'text-text-secondary'}`}
              >
                Bersama
              </button>
            </div>
            {walletType === 'BERSAMA' && (
              <p className="text-[10px] text-text-secondary mt-2 px-1 font-medium">Dompet ini akan terlihat oleh semua anggota keluarga.</p>
            )}
          </div>

          <button 
            onClick={handleSave}
            disabled={!walletName}
            className="w-full py-4 bg-primary text-surface rounded-xl font-bold text-lg shadow-lg shadow-primary/20 hover:bg-primary/90 disabled:opacity-50 disabled:shadow-none transition-all mt-4"
          >
            Simpan Dompet
          </button>
        </div>
      </BottomSheet>

    </div>
  );
};

const WalletItem = ({ icon, name, balance, bgClass }: { icon: React.ReactNode, name: string, balance: string, bgClass: string }) => (
  <div className="flex items-center justify-between p-4 hover:bg-surface-muted cursor-pointer transition-colors group">
    <div className="flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${bgClass} group-hover:scale-105 transition-transform`}>
        {icon}
      </div>
      <p className="font-bold text-text-primary text-lg">{name}</p>
    </div>
    <p className="font-bold text-text-primary text-lg">Rp {balance}</p>
  </div>
);
