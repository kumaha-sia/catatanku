import React, { useState } from 'react';
import { Plus, AlertTriangle, ChevronDown } from 'lucide-react';
import { BottomSheet } from '../components/BottomSheet';

export const Budgets = () => {
  const [activeTab, setActiveTab] = useState<'ME' | 'FAMILY'>('ME');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [budgetAmount, setBudgetAmount] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const handleSave = () => {
    setIsAddOpen(false);
    setBudgetAmount('');
    setSelectedCategory('');
  };

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text-primary">Anggaran</h1>
        <button 
          onClick={() => setIsAddOpen(true)}
          className="w-10 h-10 bg-primary text-surface rounded-full flex items-center justify-center shadow-md shadow-primary/20 hover:bg-primary/90 transition-all"
        >
          <Plus size={20} />
        </button>
      </div>

      <button className="flex items-center gap-2 px-4 py-2 bg-surface rounded-xl font-semibold text-sm shadow-sm border border-border w-max">
        Agustus 2026
        <ChevronDown size={16} />
      </button>

      {/* Overview Card */}
      <div className="bg-surface border border-border p-5 sm:p-6 rounded-2xl shadow-sm">
        <div className="flex justify-between items-end mb-4">
          <div>
            <p className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-1">Total Budget</p>
            <p className="text-2xl sm:text-3xl font-bold text-text-primary">Rp 5.000.000</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-1">Terpakai</p>
            <p className="text-lg sm:text-xl font-bold text-expense">Rp 3.120.000</p>
          </div>
        </div>
        
        <div className="w-full bg-surface-muted rounded-full h-3 overflow-hidden mb-2">
          <div className="bg-primary h-full rounded-full" style={{ width: '62%' }} />
        </div>
        <p className="text-sm font-semibold text-text-secondary">
          <span className="text-text-primary font-bold">62%</span> · sisa Rp 1.880.000
        </p>
      </div>

      {/* Tabs */}
      <div className="flex p-1 bg-surface-muted rounded-xl w-full sm:w-64">
        <button 
          onClick={() => setActiveTab('ME')}
          className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors ${activeTab === 'ME' ? 'bg-surface text-text-primary shadow-sm' : 'text-text-secondary'}`}
        >
          Pribadi
        </button>
        <button 
          onClick={() => setActiveTab('FAMILY')}
          className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors ${activeTab === 'FAMILY' ? 'bg-surface text-text-primary shadow-sm' : 'text-text-secondary'}`}
        >
          Keluarga
        </button>
      </div>

      {/* Budget List */}
      <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-sm divide-y divide-border">
        
        <div className="p-4 sm:p-5 hover:bg-surface-muted transition-colors cursor-pointer group">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-xl group-hover:scale-105 transition-transform">🍜</div>
              <p className="font-bold text-text-primary text-lg">Makanan</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-text-primary">Rp 780rb <span className="text-text-secondary font-medium text-sm">/ 1jt</span></p>
            </div>
          </div>
          
          <div className="w-full bg-surface-muted rounded-full h-2.5 overflow-hidden mb-2">
            <div className="bg-warning h-full rounded-full" style={{ width: '78%' }} />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-warning bg-warning/10 px-2 py-0.5 rounded-md">
              <AlertTriangle size={12} />
              <p className="text-xs font-bold">Hampir habis · sisa 220rb</p>
            </div>
            <p className="text-xs font-bold text-text-secondary">78%</p>
          </div>
        </div>

        <div className="p-4 sm:p-5 hover:bg-surface-muted transition-colors cursor-pointer group">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center text-xl group-hover:scale-105 transition-transform">🛒</div>
              <p className="font-bold text-text-primary text-lg">Belanja</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-error">Rp 550rb <span className="text-text-secondary font-medium text-sm">/ 500rb</span></p>
            </div>
          </div>
          
          <div className="w-full bg-surface-muted rounded-full h-2.5 overflow-hidden mb-2 relative">
            <div className="bg-error h-full rounded-full" style={{ width: '100%' }} />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-error bg-error/10 px-2 py-0.5 rounded-md">
              <div className="w-3 h-3 rounded-full bg-error text-surface flex items-center justify-center text-[8px] font-bold">!</div>
              <p className="text-xs font-bold">Lewat 50rb</p>
            </div>
            <p className="text-xs font-bold text-error">110%</p>
          </div>
        </div>

        <div className="p-4 sm:p-5 hover:bg-surface-muted transition-colors cursor-pointer group">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-xl group-hover:scale-105 transition-transform">🚗</div>
              <p className="font-bold text-text-primary text-lg">Transportasi</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-text-primary">Rp 350rb <span className="text-text-secondary font-medium text-sm">/ 1jt</span></p>
            </div>
          </div>
          
          <div className="w-full bg-surface-muted rounded-full h-2.5 overflow-hidden mb-2">
            <div className="bg-primary h-full rounded-full" style={{ width: '35%' }} />
          </div>
          
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-text-secondary">Aman · sisa 650rb</p>
            <p className="text-xs font-bold text-text-secondary">35%</p>
          </div>
        </div>

      </div>

      {/* Add Budget Bottom Sheet */}
      <BottomSheet isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Buat Anggaran Baru">
        <div className="space-y-6 pt-2">
          
          <div>
            <label className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-3 block px-1">Bulan Anggaran</label>
            <div className="bg-surface border border-border rounded-xl px-4 py-3 font-semibold text-text-primary">
              Agustus 2026
            </div>
            <p className="text-[10px] text-text-secondary mt-1 px-1 font-medium">Anggaran akan berlaku untuk bulan ini.</p>
          </div>

          <div>
            <label className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-3 block px-1">Kategori Pengeluaran</label>
            <div className="flex overflow-x-auto gap-3 pb-2 px-1 hide-scrollbar -mx-1">
              {[
                { icon: '🍜', name: 'Makanan' },
                { icon: '🚗', name: 'Transport' },
                { icon: '🛒', name: 'Belanja' },
                { icon: '💡', name: 'Tagihan' },
                { icon: '🎮', name: 'Hiburan' },
              ].map((cat) => (
                <button 
                  key={cat.name}
                  onClick={() => setSelectedCategory(cat.name)}
                  className={`flex flex-col items-center gap-2 min-w-[72px] p-2 rounded-xl border-2 transition-all ${
                    selectedCategory === cat.name ? 'border-primary bg-primary/5' : 'border-transparent hover:bg-surface-muted'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${selectedCategory === cat.name ? 'bg-primary/20 shadow-sm' : 'bg-surface-muted'}`}>
                    {cat.icon}
                  </div>
                  <span className={`text-xs font-bold ${selectedCategory === cat.name ? 'text-primary' : 'text-text-secondary'}`}>{cat.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-3 block px-1">Batas Maksimal (Rp)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-text-secondary">Rp</span>
              <input 
                type="number" 
                placeholder="0"
                value={budgetAmount}
                onChange={(e) => setBudgetAmount(e.target.value)}
                className="w-full bg-surface border border-border rounded-xl pl-12 pr-4 py-3 font-bold text-lg text-text-primary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              />
            </div>
          </div>

          <button 
            onClick={handleSave}
            disabled={!selectedCategory || !budgetAmount}
            className="w-full py-4 bg-primary text-surface rounded-xl font-bold text-lg shadow-lg shadow-primary/20 hover:bg-primary/90 disabled:opacity-50 disabled:shadow-none transition-all mt-4"
          >
            Simpan Anggaran
          </button>
        </div>
      </BottomSheet>

    </div>
  );
};
