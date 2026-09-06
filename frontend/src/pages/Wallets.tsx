import React from 'react';
import { Plus, ArrowRightLeft, CreditCard, Wallet as WalletIcon, Smartphone, PiggyBank, Users } from 'lucide-react';

export const Wallets = () => {
  return (
    <div className="space-y-8 animate-fade-in pb-8">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text-primary">Dompet</h1>
        <button className="w-10 h-10 bg-primary text-surface rounded-full flex items-center justify-center shadow-md shadow-primary/20 hover:bg-primary/90 transition-all">
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
