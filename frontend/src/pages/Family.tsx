import React, { useState, useEffect } from 'react';
import { Settings, UserPlus, Users, ChevronRight, Mail, ShoppingCart, Lightbulb, Copy, Check, Trash2, LogOut, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { BottomSheet } from '../components/BottomSheet';
import { useHouseholds, useMembers, useInviteMember, useWallets, useRemoveMember, useLeaveHousehold, useJoinHousehold, useAcceptHousehold, useRejectHousehold } from '../hooks/useFinances';
import { useAuthStore } from '../store/authStore';
import * as api from '../services/apiServices';

export const Family = () => {
  const navigate = useNavigate();
  const user = useAuthStore(state => state.user);
  
  const [activeHouseholdId, setActiveHouseholdId] = useState<string | null>(null);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [isMembersSheetOpen, setIsMembersSheetOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteLink, setInviteLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const { data: households, isLoading: isLoadingHouseholds } = useHouseholds();

  useEffect(() => {
    if (households && households.length > 0 && !activeHouseholdId) {
      // Prioritize pending households first
      const pending = households.find((h: any) => h.status === 'PENDING');
      if (pending) {
        setActiveHouseholdId(pending.id);
        return;
      }
      const shared = households.find((h: any) => h.role !== 'OWNER' || !h.name.includes('Household'));
      setActiveHouseholdId(shared ? shared.id : households[0].id);
    }
  }, [households, activeHouseholdId]);

  const activeHousehold = households?.find((h: any) => h.id === activeHouseholdId);
  
  const { data: members, isLoading: isLoadingMembers } = useMembers(activeHouseholdId || undefined);
  const { data: walletsData } = useWallets(activeHouseholdId || undefined);
  
  const inviteMember = useInviteMember();
  const removeMember = useRemoveMember();
  const leaveHousehold = useLeaveHousehold();
  const acceptHousehold = useAcceptHousehold();
  const rejectHousehold = useRejectHousehold();

  const myMembership = members?.find((m: any) => m.user_id === user?.id);
  const isOwner = myMembership?.role === 'OWNER';

  const sharedWallets = walletsData?.shared || [];
  const sharedWalletsTotal = sharedWallets.reduce((acc: number, w: any) => acc + w.balance, 0);

  const handleFetchInviteLink = async () => {
    if (!activeHouseholdId) return;
    try {
      const res = await api.getInviteLink(activeHouseholdId);
      const url = `${window.location.origin}/join/${res.invite_code}`;
      setInviteLink(url);
    } catch (e) {
      console.error(e);
    }
  };

  const handleOpenInvite = () => {
    setIsInviteOpen(true);
    setErrorMsg('');
    if (isOwner) handleFetchInviteLink();
  };

  const handleInvite = async () => {
    if (!inviteEmail || !activeHouseholdId) return;
    try {
      await inviteMember.mutateAsync({ householdId: activeHouseholdId, email: inviteEmail });
      setInviteEmail('');
      setErrorMsg('');
      alert('Undangan berhasil dikirim!');
    } catch (e: any) {
      setErrorMsg(e.response?.data?.message || 'Gagal mengirim undangan. Pastikan email terdaftar.');
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleKick = async (memberId: string) => {
    if (window.confirm('Keluarkan anggota ini?')) {
      try { await removeMember.mutateAsync({ householdId: activeHouseholdId!, memberId }); } catch (e) {}
    }
  };

  const handleLeave = async () => {
    if (window.confirm('Yakin ingin meninggalkan keluarga ini?')) {
      try {
        await leaveHousehold.mutateAsync(activeHouseholdId!);
        setActiveHouseholdId(null);
      } catch (e) {}
    }
  };

  const handleAccept = async () => {
    try { await acceptHousehold.mutateAsync(activeHouseholdId!); } catch (e) {}
  };

  const handleReject = async () => {
    if (window.confirm('Tolak undangan ini?')) {
      try {
        await rejectHousehold.mutateAsync(activeHouseholdId!);
        setActiveHouseholdId(null);
      } catch (e) {}
    }
  };

  if (!households) return null;

  if (!activeHousehold || households.length === 0) {
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

  const joinDateStr = new Date(activeHousehold.created_at).toLocaleDateString('id-ID', { month: 'short', year: 'numeric' });

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-black text-text-primary uppercase tracking-wide">Keluarga</h1>
          <button onClick={() => navigate('/settings')} className="w-10 h-10 bg-surface border-2 border-text-primary rounded-none shadow-[4px_4px_0_0_#171B22] flex items-center justify-center text-text-primary hover:-translate-y-1 hover:shadow-[4px_4px_0_0_#171B22] active:translate-y-0 active:shadow-none transition-all">
            <Settings size={20} />
          </button>
        </div>

        {/* Household Switcher */}
        {households.length > 1 && (
          <select 
            className="w-full bg-surface border-4 border-text-primary p-4 rounded-none font-black text-lg uppercase tracking-wider shadow-[6px_6px_0_0_#171B22] focus:outline-none focus:ring-0 appearance-none cursor-pointer mb-2"
            value={activeHouseholdId || ''}
            onChange={(e) => setActiveHouseholdId(e.target.value)}
          >
            {households.map((h: any) => (
              <option key={h.id} value={h.id}>{h.name} {h.role === 'OWNER' ? '(Milikku)' : ''}</option>
            ))}
          </select>
        )}
      </div>

      {activeHousehold.status === 'PENDING' ? (
        <div className="bg-surface border-4 border-text-primary p-6 text-center shadow-[6px_6px_0_0_#171B22]">
          <h3 className="font-black text-lg uppercase mb-2">Undangan Menunggu</h3>
          <p className="font-bold text-sm mb-6">Anda diundang untuk bergabung dengan keluarga ini.</p>
          <div className="flex gap-4 justify-center">
            <button onClick={handleReject} className="px-6 py-3 bg-surface border-2 border-text-primary font-black uppercase text-sm hover:bg-error hover:text-surface shadow-[4px_4px_0_0_#171B22] active:translate-y-1 transition-all">Tolak</button>
            <button onClick={handleAccept} className="px-6 py-3 bg-primary text-surface border-2 border-text-primary font-black uppercase text-sm hover:bg-accent hover:text-text-primary shadow-[4px_4px_0_0_#171B22] active:translate-y-1 transition-all">Terima</button>
          </div>
        </div>
      ) : (
        <>
      {/* Family Info */}
      <div className="bg-accent border-4 border-text-primary p-5 rounded-none shadow-[8px_8px_0_0_#171B22] relative overflow-hidden flex items-center gap-4">
        <div className="w-16 h-16 bg-surface text-text-primary rounded-none border-2 border-text-primary shadow-[4px_4px_0_0_#171B22] flex items-center justify-center relative z-10">
          <Users size={28} />
        </div>
        <div className="relative z-10">
          <h2 className="text-xl font-black text-text-primary leading-tight uppercase">{activeHousehold.name}</h2>
          <p className="text-sm font-bold text-text-primary mt-1">{members?.length || 1} anggota • sejak {joinDateStr}</p>
        </div>
      </div>

      {/* Members */}
      <section>
        <h3 className="text-xs font-black text-text-primary uppercase tracking-widest mb-3 px-1">Anggota</h3>
        <div 
          onClick={() => setIsMembersSheetOpen(true)}
          className="bg-surface border-2 border-text-primary rounded-none shadow-[6px_6px_0_0_#171B22] flex items-center justify-between p-4 cursor-pointer hover:-translate-y-1 hover:shadow-[8px_8px_0_0_#171B22] transition-all"
        >
          <div className="flex -space-x-3">
            {members?.map((m: any, i: number) => (
              <div key={m.id} className="w-12 h-12 rounded-none border-2 border-text-primary bg-primary text-surface flex items-center justify-center font-black text-sm shadow-[2px_2px_0_0_#171B22] z-20" style={{ zIndex: 20 - i, backgroundColor: i % 2 === 0 ? 'var(--color-primary)' : 'var(--color-accent)' }}>
                {m.user.name.charAt(0).toUpperCase()}
              </div>
            ))}
          </div>
          {isOwner ? (
            <button 
              onClick={(e) => { e.stopPropagation(); handleOpenInvite(); }}
              className="flex items-center gap-2 px-4 py-2 bg-primary border-2 border-text-primary shadow-[4px_4px_0_0_#171B22] hover:-translate-y-1 hover:shadow-[6px_6px_0_0_#171B22] active:translate-y-0 active:shadow-none rounded-none font-black text-surface text-sm uppercase tracking-wider transition-all"
            >
              <UserPlus size={16} />
              Undang
            </button>
          ) : (
            <div className="px-4 py-2 bg-surface font-black text-xs uppercase opacity-70">
              Lihat
            </div>
          )}
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

      {!isOwner && (
        <button 
          onClick={handleLeave}
          className="w-full mt-2 py-4 flex justify-center items-center gap-2 bg-error text-surface border-2 border-text-primary rounded-none shadow-[4px_4px_0_0_#171B22] hover:-translate-y-1 hover:shadow-[6px_6px_0_0_#171B22] active:translate-y-0 active:shadow-none transition-all font-black uppercase tracking-wider"
        >
          <LogOut size={20} /> Tinggalkan Keluarga
        </button>
      )}
      </>
      )}

      {/* Invite Bottom Sheet */}
      <BottomSheet isOpen={isInviteOpen} onClose={() => setIsInviteOpen(false)} title="Undang Anggota">
        <div className="space-y-6 pt-2">
          
          {errorMsg && (
            <div className="p-3 bg-error text-surface border-2 border-text-primary font-bold text-sm">
              {errorMsg}
            </div>
          )}

          <div>
            <label className="text-xs font-black text-text-primary uppercase tracking-widest mb-2 block px-1">Undang via Email</label>
            <div className="flex gap-2">
              <input 
                type="email" 
                placeholder="Contoh: rina@email.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="flex-1 bg-surface border-2 border-text-primary rounded-none px-4 py-3 font-bold text-text-primary focus:outline-none focus:shadow-[4px_4px_0_0_#FFB43A] focus:ring-0 transition-all"
              />
              <button 
                onClick={handleInvite}
                disabled={!inviteEmail}
                className="px-6 py-3 bg-primary text-surface rounded-none border-2 border-text-primary font-black uppercase shadow-[4px_4px_0_0_#171B22] hover:-translate-y-1 hover:shadow-[6px_6px_0_0_#171B22] active:translate-y-0 active:shadow-none disabled:opacity-50 transition-all"
              >
                Kirim
              </button>
            </div>
          </div>

          <div className="border-t-2 border-dashed border-text-primary my-4" />

          <div>
            <label className="text-xs font-black text-text-primary uppercase tracking-widest mb-2 block px-1">Salin Tautan Undangan</label>
            <div className="flex bg-surface border-2 border-text-primary p-2 shadow-[4px_4px_0_0_#171B22] items-center gap-2">
              <input 
                type="text" 
                readOnly 
                value={inviteLink || 'Loading...'}
                className="flex-1 bg-transparent font-bold text-sm focus:outline-none text-text-primary truncate px-2"
              />
              <button 
                onClick={handleCopyLink}
                disabled={!inviteLink}
                className="w-12 h-12 shrink-0 bg-accent border-2 border-text-primary flex items-center justify-center hover:-translate-y-1 hover:shadow-[4px_4px_0_0_#171B22] transition-all"
              >
                {copied ? <Check size={20} /> : <Copy size={20} />}
              </button>
            </div>
            <p className="text-xs font-bold opacity-70 mt-2 px-1">Siapapun yang memiliki tautan ini dapat bergabung.</p>
          </div>
        </div>
      </BottomSheet>

      {/* Members Bottom Sheet */}
      <BottomSheet isOpen={isMembersSheetOpen} onClose={() => setIsMembersSheetOpen(false)} title="Daftar Anggota">
        <div className="space-y-3 pt-2">
          {members?.map((m: any) => (
            <div key={m.id} className="bg-surface border-2 border-text-primary rounded-none shadow-[4px_4px_0_0_#171B22] flex items-center p-3 gap-3">
              <div className="w-12 h-12 bg-primary text-surface border-2 border-text-primary rounded-none flex items-center justify-center font-black text-xl shrink-0">
                {m.user.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 truncate">
                <h4 className="font-black text-sm uppercase truncate">{m.user.name} {m.user_id === user?.id && '(Anda)'}</h4>
                <p className="text-xs font-bold truncate opacity-70">{m.user.email}</p>
              </div>
              
              <div className="flex flex-col items-end gap-1 shrink-0">
                <span className={`text-[10px] font-black uppercase px-2 py-0.5 border-2 border-text-primary ${m.role === 'OWNER' ? 'bg-accent text-text-primary' : 'bg-surface text-text-primary'}`}>
                  {m.role}
                </span>
                {m.status === 'PENDING' && (
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 border-2 border-dashed border-text-primary text-text-primary opacity-60">
                    PENDING
                  </span>
                )}
              </div>

              {isOwner && m.user_id !== user?.id && (
                <button 
                  onClick={() => handleKick(m.id)}
                  className="ml-2 w-10 h-10 flex items-center justify-center bg-error text-surface border-2 border-text-primary hover:bg-red-600 active:translate-y-1 shadow-[2px_2px_0_0_#171B22] transition-all"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          ))}
        </div>
      </BottomSheet>

    </div>
  );
};
