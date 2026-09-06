import React, { useState } from 'react';
import { Plus } from 'lucide-react';

export const Goals = () => {
  const [activeTab, setActiveTab] = useState<'ME' | 'FAMILY'>('ME');

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text-primary">Tujuan</h1>
        <button className="w-10 h-10 bg-primary text-surface rounded-full flex items-center justify-center shadow-md shadow-primary/20 hover:bg-primary/90 transition-all">
          <Plus size={20} />
        </button>
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

      {/* Goals List */}
      <div className="space-y-4">
        
        <div className="bg-surface border border-border p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow cursor-pointer group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-2xl group-hover:scale-105 transition-transform shadow-sm">✈️</div>
              <div>
                <p className="font-bold text-text-primary text-lg leading-tight">Liburan Bali</p>
                <p className="text-xs text-text-secondary font-semibold uppercase tracking-wider mt-1">Target Des 2026</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold text-text-primary">Rp 3,1jt</p>
              <p className="text-xs text-text-secondary font-semibold mt-0.5">dari 5jt</p>
            </div>
          </div>
          
          <div className="w-full bg-surface-muted rounded-full h-3 overflow-hidden mb-2">
            <div className="bg-primary h-full rounded-full" style={{ width: '62%' }} />
          </div>
          
          <div className="flex justify-between items-center text-sm font-semibold">
            <span className="text-text-primary">62% Terkumpul</span>
            <span className="text-text-secondary">sisa Rp 1.900.000</span>
          </div>
        </div>

        <div className="bg-surface border border-border p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow cursor-pointer group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center text-2xl group-hover:scale-105 transition-transform shadow-sm">🛡️</div>
              <div>
                <p className="font-bold text-text-primary text-lg leading-tight">Dana Darurat</p>
                <p className="text-xs text-text-secondary font-semibold uppercase tracking-wider mt-1">Tanpa Target</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold text-text-primary">Rp 10jt</p>
              <p className="text-xs text-text-secondary font-semibold mt-0.5">dari 40jt</p>
            </div>
          </div>
          
          <div className="w-full bg-surface-muted rounded-full h-3 overflow-hidden mb-2">
            <div className="bg-accent h-full rounded-full" style={{ width: '25%' }} />
          </div>
          
          <div className="flex justify-between items-center text-sm font-semibold">
            <span className="text-text-primary">25% Terkumpul</span>
            <span className="text-text-secondary">sisa Rp 30.000.000</span>
          </div>
        </div>

      </div>
    </div>
  );
};
