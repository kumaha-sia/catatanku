import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { useUIStore } from '../store/uiStore';
import { Bell, Eye, EyeOff, Plus, ArrowUpRight, ArrowDownRight, Users, Lock, ChevronDown, Check } from 'lucide-react';

export const Dashboard = () => {
  const [activeTab, setActiveTab] = useState<'ME' | 'FAMILY'>('ME');
  const [hideBalance, setHideBalance] = useState(false);
  const openAddTransaction = useUIStore((state) => state.openAddTransaction);

  return (
    <div className="space-y-6 pb-6">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Halo, Andi 👋</h1>
        </div>
        <div className="hidden md:flex items-center gap-3">
          <button className="w-10 h-10 rounded-full bg-surface-muted flex items-center justify-center text-text-secondary relative">
            <Bell size={20} />
            <div className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full" />
          </button>
          <div className="w-10 h-10 rounded-full bg-primary text-surface flex items-center justify-center font-bold">
            A
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <button className="flex items-center gap-2 px-4 py-2 bg-surface rounded-xl font-semibold text-sm shadow-sm border border-border">
          Agustus 2026
          <ChevronDown size={16} />
        </button>
        <button 
          onClick={() => setHideBalance(!hideBalance)}
          className="w-10 h-10 rounded-full bg-surface flex items-center justify-center text-text-secondary shadow-sm border border-border"
        >
          {hideBalance ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex p-1 bg-surface-muted rounded-xl w-full sm:w-64">
        <button 
          onClick={() => setActiveTab('ME')}
          className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors ${activeTab === 'ME' ? 'bg-surface text-text-primary shadow-sm' : 'text-text-secondary'}`}
        >
          Saya
        </button>
        <button 
          onClick={() => setActiveTab('FAMILY')}
          className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors ${activeTab === 'FAMILY' ? 'bg-surface text-text-primary shadow-sm' : 'text-text-secondary'}`}
        >
          Keluarga
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'ME' ? (
        <MeTab hideBalance={hideBalance} />
      ) : (
        <FamilyTab hideBalance={hideBalance} />
      )}

    </div>
  );
};

const MeTab = ({ hideBalance }: { hideBalance: boolean }) => {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Balance Card */}
      <div className="bg-primary text-surface rounded-3xl p-6 shadow-lg shadow-primary/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-surface/10 rounded-full blur-3xl -mr-10 -mt-10" />
        <p className="text-primary-soft text-sm font-semibold mb-1 uppercase tracking-wider">Total Saldo Saya</p>
        <h2 className="text-4xl font-bold mb-4">
          {hideBalance ? 'Rp •••••••' : 'Rp 8.450.000'}
        </h2>
        <div className="flex items-center justify-between mt-6">
          <p className="text-primary-soft text-sm">3 dompet pribadi</p>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-surface/20 hover:bg-surface/30 rounded-lg text-sm font-semibold transition-colors backdrop-blur-sm">
              Dompet
            </button>
          </div>
        </div>
      </div>

      {/* Income / Expense */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-surface p-4 rounded-2xl shadow-sm border border-border">
          <div className="flex items-center gap-2 text-text-secondary mb-2">
            <ArrowUpRight size={18} className="text-income" />
            <span className="text-xs font-bold uppercase tracking-wider">Pemasukan</span>
          </div>
          <p className="text-xl font-bold text-text-primary">
            {hideBalance ? '••••••' : 'Rp 8.500.000'}
          </p>
          <p className="text-xs text-income font-medium mt-1">+12% vs Jul</p>
        </div>
        <div className="bg-surface p-4 rounded-2xl shadow-sm border border-border">
          <div className="flex items-center gap-2 text-text-secondary mb-2">
            <ArrowDownRight size={18} className="text-expense" />
            <span className="text-xs font-bold uppercase tracking-wider">Pengeluaran</span>
          </div>
          <p className="text-xl font-bold text-text-primary">
            {hideBalance ? '••••••' : 'Rp 4.230.000'}
          </p>
          <p className="text-xs text-expense font-medium mt-1">-8% vs Jul</p>
        </div>
      </div>

      {/* Budgets */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg">Anggaran saya</h3>
          <button className="text-primary text-sm font-semibold">Lihat semua</button>
        </div>
        <div className="bg-surface rounded-2xl shadow-sm border border-border overflow-hidden">
          <div className="p-4 border-b border-border hover:bg-surface-muted cursor-pointer transition-colors">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-xl">🍜</div>
                <div>
                  <p className="font-bold text-text-primary">Makanan</p>
                  <p className="text-xs text-text-secondary">sisa Rp 220.000</p>
                </div>
              </div>
              <span className="font-bold text-text-primary">78%</span>
            </div>
            <div className="w-full bg-surface-muted rounded-full h-2 overflow-hidden">
              <div className="bg-warning h-full rounded-full" style={{ width: '78%' }} />
            </div>
          </div>
          <div className="p-4 hover:bg-surface-muted cursor-pointer transition-colors">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-xl">🚗</div>
                <div>
                  <p className="font-bold text-text-primary">Transportasi</p>
                  <p className="text-xs text-text-secondary">sisa Rp 650.000</p>
                </div>
              </div>
              <span className="font-bold text-text-primary">35%</span>
            </div>
            <div className="w-full bg-surface-muted rounded-full h-2 overflow-hidden">
              <div className="bg-primary h-full rounded-full" style={{ width: '35%' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg">Terbaru</h3>
          <button className="text-primary text-sm font-semibold">Lihat semua</button>
        </div>
        <div className="bg-surface rounded-2xl shadow-sm border border-border overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-border hover:bg-surface-muted cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-xl">🍜</div>
              <div>
                <p className="font-bold text-text-primary">Makan siang</p>
                <p className="text-xs text-text-secondary">Makanan • Tunai • 12:30</p>
              </div>
            </div>
            <p className="font-bold text-expense">-25.000</p>
          </div>
          <div className="flex items-center justify-between p-4 hover:bg-surface-muted cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center text-xl">💼</div>
              <div>
                <p className="font-bold text-text-primary">Gaji</p>
                <p className="text-xs text-text-secondary">Gaji • Bank • 1 Agu</p>
              </div>
            </div>
            <p className="font-bold text-income">+8.500.000</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const FamilyTab = ({ hideBalance }: { hideBalance: boolean }) => {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Balance Card */}
      <div className="bg-surface border border-border rounded-3xl p-6 shadow-sm relative overflow-hidden">
        <p className="text-text-secondary text-sm font-bold mb-1 uppercase tracking-wider flex items-center gap-2">
          Saldo Keluarga
        </p>
        <h2 className="text-4xl font-bold mb-4 text-text-primary">
          {hideBalance ? 'Rp •••••••' : 'Rp 6.500.000'}
        </h2>
        <div className="flex items-center justify-between mt-6">
          <p className="text-text-secondary text-sm font-medium">2 dompet bersama</p>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-surface-muted hover:bg-border rounded-lg text-sm font-semibold transition-colors">
              Dompet
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-surface p-4 rounded-2xl shadow-sm border border-border">
          <div className="flex items-center gap-2 text-text-secondary mb-2">
            <ArrowUpRight size={18} className="text-income" />
            <span className="text-xs font-bold uppercase tracking-wider">Masuk Keluarga</span>
          </div>
          <p className="text-xl font-bold text-text-primary">
            {hideBalance ? '••••••' : 'Rp 15.000.000'}
          </p>
        </div>
        <div className="bg-surface p-4 rounded-2xl shadow-sm border border-border">
          <div className="flex items-center gap-2 text-text-secondary mb-2">
            <ArrowDownRight size={18} className="text-expense" />
            <span className="text-xs font-bold uppercase tracking-wider">Keluar Keluarga</span>
          </div>
          <p className="text-xl font-bold text-text-primary">
            {hideBalance ? '••••••' : 'Rp 6.100.000'}
          </p>
        </div>
      </div>

      {/* Contributions */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg">Kontribusi bulan ini</h3>
        </div>
        <div className="bg-surface rounded-2xl shadow-sm border border-border overflow-hidden p-4 space-y-4">
          <div>
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary text-surface flex items-center justify-center font-bold text-sm">A</div>
                <p className="font-bold text-text-primary">Andi</p>
              </div>
              <span className="font-bold text-text-primary">60%</span>
            </div>
            <div className="w-full bg-surface-muted rounded-full h-2 overflow-hidden">
              <div className="bg-primary h-full rounded-full" style={{ width: '60%' }} />
            </div>
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-accent text-surface flex items-center justify-center font-bold text-sm">R</div>
                <p className="font-bold text-text-primary">Rina</p>
              </div>
              <span className="font-bold text-text-primary">40%</span>
            </div>
            <div className="w-full bg-surface-muted rounded-full h-2 overflow-hidden">
              <div className="bg-accent h-full rounded-full" style={{ width: '40%' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Family Transactions */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg">Aktivitas Keluarga</h3>
          <button className="text-primary text-sm font-semibold">Lihat semua</button>
        </div>
        <div className="bg-surface rounded-2xl shadow-sm border border-border overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-border hover:bg-surface-muted cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center text-xl">🛒</div>
              <div>
                <p className="font-bold text-text-primary"><span className="text-accent">Rina</span> • Belanja</p>
                <p className="text-xs text-text-secondary">Supermarket • 14:00</p>
              </div>
            </div>
            <p className="font-bold text-expense">-50.000</p>
          </div>
          <div className="flex items-center justify-between p-4 hover:bg-surface-muted cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-xl">💡</div>
              <div>
                <p className="font-bold text-text-primary"><span className="text-primary">Andi</span> • Listrik</p>
                <p className="text-xs text-text-secondary">Tagihan • 09:00</p>
              </div>
            </div>
            <p className="font-bold text-expense">-350.000</p>
          </div>
        </div>
      </div>

    </div>
  );
};
