import React, { useState } from 'react';
import { Settings, UserPlus, Users, ChevronRight, ShoppingCart, Lightbulb, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { BottomSheet } from '../components/BottomSheet';

export const Family = () => {
  const navigate = useNavigate();
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text-primary">Keluarga</h1>
        <button className="w-10 h-10 bg-surface border border-border rounded-full flex items-center justify-center text-text-secondary hover:bg-surface-muted transition-all">
          <Settings size={20} />
        </button>
      </div>

      {/* Family Info */}
      <div className="bg-surface border border-border p-5 rounded-3xl shadow-sm relative overflow-hidden flex items-center gap-4">
        <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
        <div className="w-16 h-16 bg-accent/20 text-accent rounded-2xl flex items-center justify-center relative z-10 shadow-sm border border-accent/10">
          <Users size={28} />
        </div>
        <div className="relative z-10">
          <h2 className="text-xl font-bold text-text-primary leading-tight">Keluarga Andi & Rina</h2>
          <p className="text-sm font-semibold text-text-secondary mt-1">2 anggota · sejak Jan 2026</p>
        </div>
      </div>

      {/* Members */}
      <section>
        <h3 className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-3 px-1">Anggota</h3>
        <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-sm flex items-center justify-between p-4">
          <div className="flex -space-x-3">
            <div className="w-12 h-12 rounded-full border-2 border-surface bg-primary text-surface flex items-center justify-center font-bold text-sm shadow-sm z-20">A</div>
            <div className="w-12 h-12 rounded-full border-2 border-surface bg-accent text-surface flex items-center justify-center font-bold text-sm shadow-sm z-10">R</div>
          </div>
          <button 
            onClick={() => setIsInviteOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-surface-muted hover:bg-border rounded-xl font-bold text-text-primary text-sm transition-colors"
          >
            <UserPlus size={16} />
            Undang
          </button>
        </div>
      </section>

      {/* Shared Wallets Link */}
      <section>
        <button 
          onClick={() => navigate('/wallets')}
          className="w-full flex items-center justify-between bg-surface border border-border p-4 rounded-2xl shadow-sm hover:shadow-md hover:bg-surface-muted transition-all group"
        >
          <div className="text-left">
            <h3 className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-1">Dompet Bersama</h3>
            <p className="font-bold text-text-primary text-lg">Rp 6.500.000</p>
            <p className="text-xs text-text-secondary font-medium mt-1">Dompet Keluarga, Tabungan Anak</p>
          </div>
          <ChevronRight size={20} className="text-text-secondary group-hover:text-text-primary group-hover:translate-x-1 transition-all" />
        </button>
      </section>

      {/* Contribution Link */}
      <section>
        <button 
          onClick={() => navigate('/reports')}
          className="w-full flex items-center justify-between bg-surface border border-border p-4 rounded-2xl shadow-sm hover:shadow-md hover:bg-surface-muted transition-all group"
        >
          <div className="text-left w-full pr-4">
            <h3 className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-2">Kontribusi Agustus</h3>
            <div className="flex items-center gap-2 mb-2">
              <span className="font-bold text-text-primary text-sm">Andi 60%</span>
              <span className="text-text-secondary text-sm">•</span>
              <span className="font-bold text-text-primary text-sm">Rina 40%</span>
            </div>
            <div className="flex h-2 w-full rounded-full overflow-hidden bg-surface-muted">
              <div className="bg-primary h-full" style={{ width: '60%' }} />
              <div className="bg-accent h-full" style={{ width: '40%' }} />
            </div>
          </div>
          <ChevronRight size={20} className="text-text-secondary group-hover:text-text-primary group-hover:translate-x-1 transition-all flex-shrink-0" />
        </button>
      </section>

      {/* Recent Family Activity */}
      <section>
        <div className="flex items-center justify-between mb-3 px-1">
          <h3 className="text-xs font-bold text-text-secondary uppercase tracking-widest">Aktivitas Keluarga</h3>
          <button 
            onClick={() => navigate('/transactions')}
            className="text-primary text-xs font-bold hover:underline"
          >
            Lihat Semua
          </button>
        </div>
        <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-sm divide-y divide-border">
          
          <div className="flex items-center justify-between p-4 hover:bg-surface-muted cursor-pointer transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center text-accent shadow-sm border border-accent/10">
                <ShoppingCart size={20} />
              </div>
              <div>
                <p className="font-bold text-text-primary"><span className="text-accent">Rina</span> · Belanja</p>
                <p className="text-xs font-medium text-text-secondary mt-0.5">Supermarket • 14:00</p>
              </div>
            </div>
            <p className="font-bold text-expense">-50.000</p>
          </div>

          <div className="flex items-center justify-between p-4 hover:bg-surface-muted cursor-pointer transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary shadow-sm border border-primary/10">
                <Lightbulb size={20} />
              </div>
              <div>
                <p className="font-bold text-text-primary"><span className="text-primary">Andi</span> · Listrik</p>
                <p className="text-xs font-medium text-text-secondary mt-0.5">Tagihan • 09:00</p>
              </div>
            </div>
            <p className="font-bold text-expense">-350.000</p>
          </div>

        </div>
      </section>

      {/* Invite Member Bottom Sheet */}
      <BottomSheet isOpen={isInviteOpen} onClose={() => setIsInviteOpen(false)} title="Undang Anggota">
        <div className="space-y-6 pt-2">
          
          <div className="text-center mb-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary mx-auto mb-4">
              <UserPlus size={32} />
            </div>
            <p className="text-sm font-semibold text-text-secondary">Undang pasangan atau anggota keluarga lain untuk mencatat keuangan bersama secara transparan.</p>
          </div>

          <div>
            <label className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-2 block px-1">Email Undangan</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" size={18} />
              <input 
                type="email" 
                placeholder="Masukkan email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="w-full bg-surface border border-border rounded-xl pl-11 pr-4 py-3 font-semibold text-text-primary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              />
            </div>
          </div>

          <button 
            onClick={() => { setIsInviteOpen(false); setInviteEmail(''); }}
            disabled={!inviteEmail}
            className="w-full py-4 bg-primary text-surface rounded-xl font-bold text-lg shadow-lg shadow-primary/20 hover:bg-primary/90 disabled:opacity-50 disabled:shadow-none transition-all mt-4"
          >
            Kirim Undangan
          </button>
        </div>
      </BottomSheet>

    </div>
  );
};
