import React, { useState } from 'react';
import { Search, SlidersHorizontal, ArrowDownRight, ArrowUpRight, ArrowRightLeft } from 'lucide-react';

export const Transactions = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Transaksi</h1>
          <p className="text-text-secondary">Rabu, 12 Agustus 2026</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={18} />
            <input 
              type="text" 
              placeholder="Cari transaksi..." 
              className="w-full pl-10 pr-4 py-2 bg-surface border border-border rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm"
            />
          </div>
          <button className="w-10 h-10 flex items-center justify-center bg-surface border border-border rounded-xl text-text-secondary hover:bg-surface-muted transition-colors">
            <SlidersHorizontal size={18} />
          </button>
        </div>
      </div>

      {/* Filter Chips */}
      <div className="flex overflow-x-auto gap-2 pb-2 -mx-4 px-4 md:mx-0 md:px-0 hide-scrollbar">
        <button className="whitespace-nowrap px-4 py-2 bg-text-primary text-surface rounded-full text-sm font-semibold">
          Semua
        </button>
        <button className="whitespace-nowrap px-4 py-2 bg-surface border border-border text-text-secondary rounded-full text-sm font-semibold hover:bg-surface-muted transition-colors">
          Pemasukan
        </button>
        <button className="whitespace-nowrap px-4 py-2 bg-surface border border-border text-text-secondary rounded-full text-sm font-semibold hover:bg-surface-muted transition-colors">
          Pengeluaran
        </button>
        <button className="whitespace-nowrap px-4 py-2 bg-surface border border-border text-text-secondary rounded-full text-sm font-semibold hover:bg-surface-muted transition-colors">
          Transfer
        </button>
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
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-2xl">⛽</div>
              <div>
                <p className="font-bold text-text-primary">Bensin</p>
                <div className="flex items-center gap-1 mt-1 text-xs text-text-secondary font-medium">
                  <span className="text-accent font-bold">👥 Keluarga</span>
                  <span>•</span>
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

    </div>
  );
};
