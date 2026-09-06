import React, { useState } from 'react';
import { Search, SlidersHorizontal, ArrowDownRight, ArrowUpRight, ArrowRightLeft, Calendar } from 'lucide-react';
import { BottomSheet } from '../components/BottomSheet';

export const Transactions = () => {
  const [activeType, setActiveType] = useState('SEMUA');
  const [activeVisibility, setActiveVisibility] = useState('SEMUA');
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Transaksi</h1>
          <button className="flex items-center gap-2 mt-2 px-3 py-1.5 bg-surface rounded-lg font-semibold text-xs shadow-sm border border-border text-text-secondary hover:text-primary transition-colors">
            <Calendar size={14} />
            Agustus 2026
          </button>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={18} />
            <input 
              type="text" 
              placeholder="Cari transaksi..." 
              className="w-full pl-10 pr-4 py-2.5 bg-surface border border-border rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm font-semibold"
            />
          </div>
          <button 
            onClick={() => setIsFilterModalOpen(true)}
            className="w-11 h-11 flex items-center justify-center bg-surface border border-border rounded-xl text-text-secondary hover:text-primary hover:border-primary shadow-sm transition-all"
          >
            <SlidersHorizontal size={18} />
          </button>
        </div>
      </div>

      {/* Filter Chips - Horizontal Scroll */}
      <div className="flex flex-col gap-3">
        {/* Type Filter */}
        <div className="flex overflow-x-auto gap-2 pb-1 -mx-4 px-4 md:mx-0 md:px-0 hide-scrollbar">
          {['SEMUA', 'PENGELUARAN', 'PEMASUKAN', 'TRANSFER'].map((type) => (
            <button 
              key={type}
              onClick={() => setActiveType(type)}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-bold transition-all border-2 ${
                activeType === type 
                  ? 'bg-primary/10 border-primary text-primary shadow-sm' 
                  : 'bg-surface border-transparent text-text-secondary hover:bg-surface-muted'
              }`}
            >
              {type === 'SEMUA' ? 'Semua Tipe' : type.charAt(0) + type.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        {/* Visibility Filter */}
        <div className="flex overflow-x-auto gap-2 pb-1 -mx-4 px-4 md:mx-0 md:px-0 hide-scrollbar">
          {['SEMUA', 'PRIBADI', 'KELUARGA'].map((vis) => (
            <button 
              key={vis}
              onClick={() => setActiveVisibility(vis)}
              className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-bold transition-all border ${
                activeVisibility === vis 
                  ? 'bg-text-primary border-text-primary text-surface shadow-sm' 
                  : 'bg-surface border-border text-text-secondary hover:bg-surface-muted'
              }`}
            >
              {vis === 'SEMUA' ? 'Semua Visibilitas' : vis.charAt(0) + vis.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Transaction List */}
      <div className="bg-surface rounded-2xl shadow-sm border border-border overflow-hidden">
        
        {/* Date Group 1 */}
        <div className="bg-surface-muted px-4 py-2 flex justify-between items-center border-b border-border">
          <p className="text-xs font-bold text-text-secondary uppercase tracking-widest">Rabu, 12 Agustus</p>
          <p className="text-xs font-bold text-text-secondary">-Rp 75.000</p>
        </div>
        <div className="divide-y divide-border">
          
          <div className="flex items-center justify-between p-4 hover:bg-surface-muted cursor-pointer transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center text-2xl">🍜</div>
              <div>
                <p className="font-bold text-text-primary">Makan siang</p>
                <div className="flex items-center gap-1 mt-1 text-xs text-text-secondary font-medium">
                  <span className="text-primary font-bold">🔒 Pribadi</span>
                  <span>•</span>
                  <span>Tunai</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold text-expense">-25.000</p>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 hover:bg-surface-muted cursor-pointer transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center text-2xl">🛒</div>
              <div>
                <p className="font-bold text-text-primary">Belanja mingguan</p>
                <div className="flex items-center gap-1 mt-1 text-xs text-text-secondary font-medium">
                  <span className="text-accent font-bold flex items-center gap-1">👥 Keluarga</span>
                  <span>•</span>
                  <span>Rina</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold text-expense">-50.000</p>
            </div>
          </div>

        </div>

        {/* Date Group 2 */}
        <div className="bg-surface-muted px-4 py-2 flex justify-between items-center border-y border-border mt-4">
          <p className="text-xs font-bold text-text-secondary uppercase tracking-widest">Senin, 10 Agustus</p>
          <p className="text-xs font-bold text-text-secondary">-Rp 120.000</p>
        </div>
        <div className="divide-y divide-border">
          
          <div className="flex items-center justify-between p-4 hover:bg-surface-muted cursor-pointer transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-2xl">🚗</div>
              <div>
                <p className="font-bold text-text-primary">Bensin</p>
                <div className="flex items-center gap-1 mt-1 text-xs text-text-secondary font-medium">
                  <span className="text-accent font-bold">● Keluarga</span>
                  <span>·</span>
                  <span>Andi</span>
                </div>
              </div>
            </div>
            <div className="text-right">
               <p className="font-bold text-expense">-120.000</p>
            </div>
          </div>

        </div>

      </div>

      {/* Advanced Filter Modal */}
      <BottomSheet isOpen={isFilterModalOpen} onClose={() => setIsFilterModalOpen(false)} title="Filter Lanjutan">
        <div className="space-y-6 pt-2">
          
          <div>
            <label className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-3 block px-1">Urutkan Berdasarkan</label>
            <div className="grid grid-cols-2 gap-2">
              <button className="py-2.5 rounded-xl text-sm font-bold bg-primary/10 text-primary border-2 border-primary">
                Terbaru
              </button>
              <button className="py-2.5 rounded-xl text-sm font-bold bg-surface border-2 border-border text-text-secondary hover:bg-surface-muted transition-colors">
                Terlama
              </button>
              <button className="py-2.5 rounded-xl text-sm font-bold bg-surface border-2 border-border text-text-secondary hover:bg-surface-muted transition-colors">
                Nominal Terbesar
              </button>
              <button className="py-2.5 rounded-xl text-sm font-bold bg-surface border-2 border-border text-text-secondary hover:bg-surface-muted transition-colors">
                Nominal Terkecil
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-3 block px-1">Kategori Spesifik</label>
            <select className="w-full bg-surface border border-border rounded-xl px-4 py-3 font-semibold text-text-primary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary appearance-none">
              <option>Semua Kategori</option>
              <option>Makanan & Minuman</option>
              <option>Transportasi</option>
              <option>Tagihan & Utilitas</option>
              <option>Belanja</option>
            </select>
          </div>

          <button 
            onClick={() => setIsFilterModalOpen(false)}
            className="w-full py-4 bg-primary text-surface rounded-xl font-bold text-lg shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all mt-4"
          >
            Terapkan Filter
          </button>
        </div>
      </BottomSheet>

    </div>
  );
};
