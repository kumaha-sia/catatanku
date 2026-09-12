import React, { useState } from 'react';
import { Settings, UserPlus, Users, ChevronRight, Mail, ShoppingCart, Lightbulb } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { BottomSheet } from '../components/BottomSheet';
import { useHouseholds, useMembers, useInviteMember, useWallets } from '../hooks/useFinances';

export const Family = () => {
  const navigate = useNavigate();
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');

  const { data: households } = useHouseholds();
  const familyHousehold = households?.find((h: any) => h.role !== 'OWNER' || !h.name.includes('Household'));
  
  const { data: members } = useMembers(familyHousehold?.id);
  const inviteMember = useInviteMember();

  const { data: walletsData } = useWallets(familyHousehold?.id);
  const sharedWallets = walletsData?.shared || [];
  const sharedWalletsTotal = sharedWallets.reduce((acc: number, w: any) => acc + w.balance, 0);

  const handleInvite = async () => {
    if (!inviteEmail || !familyHousehold) return;
    try {
      await inviteMember.mutateAsync({ householdId: familyHousehold.id, email: inviteEmail });
      setIsInviteOpen(false);
      setInviteEmail('');
      alert('Undangan berhasil dikirim!');
    } catch (e) {
      alert('Gagal mengirim undangan. Pastikan email terdaftar.');
    }
  };

  if (!households) return null;

  if (!familyHousehold) {
    return (
      <div className="space-y-6 animate-fade-in pb-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-black text-text-primary uppercase tracking-wide">Keluarga</h1>
        </div>
        <div className="p-8 text-center bg-surface border-4 border-text-primary rounded-none shadow-[8px_8px_0_0_#171B22]">
          <Users size={48} className="mx-auto text-text-primary mb-4" />
          <h2 className="text-xl font-black text-text-primary mb-2 uppercase tracking-wide">Belum Ada Keluarga</h2>
          <p className="text-text-primary font-bold mb-6">Minta anggota keluarga untuk mengundang email Anda.</p>
        </div>
      </div>
    );
  }

  const joinDateStr = new Date(familyHousehold.joined_at || familyHousehold.household.created_at).toLocaleDateString('id-ID', { month: 'short', year: 'numeric' });

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-text-primary uppercase tracking-wide">Keluarga</h1>
        <button onClick={() => navigate('/settings')} className="w-10 h-10 bg-surface border-2 border-text-primary rounded-none shadow-[4px_4px_0_0_#171B22] flex items-center justify-center text-text-primary hover:-translate-y-1 hover:shadow-[4px_4px_0_0_#171B22] active:translate-y-0 active:shadow-none transition-all">
          <Settings size={20} />
        </button>
      </div>

      {/* Family Info */}
      <div className="bg-accent border-4 border-text-primary p-5 rounded-none shadow-[8px_8px_0_0_#171B22] relative overflow-hidden flex items-center gap-4">
        <div className="w-16 h-16 bg-surface text-text-primary rounded-none border-2 border-text-primary shadow-[4px_4px_0_0_#171B22] flex items-center justify-center relative z-10">
          <Users size={28} />
        </div>
        <div className="relative z-10">
          <h2 className="text-xl font-black text-text-primary leading-tight uppercase">{familyHousehold.household.name}</h2>
          <p className="text-sm font-bold text-text-primary mt-1">{members?.length || 1} anggota • sejak {joinDateStr}</p>
        </div>
      </div>

      {/* Members */}
      <section>
        <h3 className="text-xs font-black text-text-primary uppercase tracking-widest mb-3 px-1">Anggota</h3>
        <div className="bg-surface border-2 border-text-primary rounded-none shadow-[6px_6px_0_0_#171B22] flex items-center justify-between p-4">
          <div className="flex -space-x-3">
            {members?.map((m: any, i: number) => (
              <div key={m.id} className="w-12 h-12 rounded-none border-2 border-text-primary bg-primary text-surface flex items-center justify-center font-black text-sm shadow-[2px_2px_0_0_#171B22] z-20" style={{ zIndex: 20 - i, backgroundColor: i % 2 === 0 ? 'var(--color-primary)' : 'var(--color-accent)' }}>
                {m.user.name.charAt(0).toUpperCase()}
              </div>
            ))}
          </div>
          <button 
            onClick={() => setIsInviteOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary border-2 border-text-primary shadow-[4px_4px_0_0_#171B22] hover:-translate-y-1 hover:shadow-[6px_6px_0_0_#171B22] active:translate-y-0 active:shadow-none rounded-none font-black text-surface text-sm uppercase tracking-wider transition-all"
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
          className="w-full flex items-center justify-between bg-surface border-2 border-text-primary p-4 rounded-none shadow-[6px_6px_0_0_#171B22] hover:-translate-y-1 hover:shadow-[8px_8px_0_0_#171B22] active:translate-y-0 active:shadow-[2px_2px_0_0_#171B22] transition-all group"
        >
          <div className="text-left">
            <h3 className="text-xs font-black text-text-primary uppercase tracking-widest mb-1">Dompet Bersama</h3>
            <p className="font-black text-text-primary text-lg">Rp {sharedWalletsTotal.toLocaleString('id-ID')}</p>
            <p className="text-xs text-text-primary font-bold mt-1">{sharedWallets.length} Dompet terdaftar</p>
          </div>
          <ChevronRight size={24} className="text-text-primary group-hover:translate-x-1 transition-all font-black" />
        </button>
      </section>

      {/* Invite Bottom Sheet */}
      <BottomSheet isOpen={isInviteOpen} onClose={() => setIsInviteOpen(false)} title="Undang Anggota">
        <div className="space-y-6 pt-2">
          
          <div className="p-4 bg-surface-muted rounded-none flex items-start gap-3 border-2 border-text-primary shadow-[4px_4px_0_0_#171B22]">
            <div className="w-8 h-8 rounded-none border-2 border-text-primary bg-accent flex items-center justify-center text-text-primary flex-shrink-0">
              <Mail size={16} />
            </div>
            <div>
              <p className="font-black text-text-primary text-sm mb-1 uppercase tracking-wide">Undangan via Email</p>
              <p className="text-xs font-bold text-text-primary leading-relaxed">
                Anggota yang diundang harus sudah memiliki akun terdaftar dengan email yang sama.
              </p>
            </div>
          </div>

          <div>
            <label className="text-xs font-black text-text-primary uppercase tracking-widest mb-2 block px-1">Email Tujuan</label>
            <input 
              type="email" 
              placeholder="Contoh: rina@email.com"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              className="w-full bg-surface border-2 border-text-primary rounded-none px-4 py-3 font-bold text-text-primary focus:outline-none focus:shadow-[4px_4px_0_0_#FFB43A] focus:ring-0 transition-all"
            />
          </div>

          <button 
            onClick={handleInvite}
            disabled={!inviteEmail}
            className="w-full py-4 bg-primary text-surface rounded-none border-2 border-text-primary font-black text-lg uppercase tracking-wider shadow-[4px_4px_0_0_#171B22] hover:-translate-y-1 hover:shadow-[6px_6px_0_0_#171B22] active:translate-y-0 active:shadow-none disabled:opacity-50 transition-all mt-4"
          >
            Kirim Undangan
          </button>
        </div>
      </BottomSheet>

    </div>
  );
};
