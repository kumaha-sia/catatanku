import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { useUIStore } from '../store/uiStore';
import { useNavigate } from 'react-router-dom';
import { Bell, Eye, EyeOff, Plus, ArrowUpRight, ArrowDownRight, Users, Lock, ChevronDown, Check, ChevronUp } from 'lucide-react';
import { useHouseholds, useTransactions, useWallets, useReportSummary, useMembers } from '../hooks/useFinances';
import { useQuery } from '@tanstack/react-query';
import api from '../api';

export const Dashboard = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const [activeTab, setActiveTab] = useState<'ME' | 'FAMILY'>('ME');
  const [hideBalance, setHideBalance] = useState(false);
  const openAddTransaction = useUIStore((state) => state.openAddTransaction);
  
  const now = new Date();
  const [currentMonth, setCurrentMonth] = useState(now.getMonth() + 1);
  const [currentYear, setCurrentYear] = useState(now.getFullYear());

  const { data: households } = useHouseholds();
  
  const personalHousehold = households?.find((h: any) => h.role === 'OWNER') || households?.[0];
  const joinedHousehold = households?.find((h: any) => h.role !== 'OWNER' && h.status !== 'PENDING');
  const familyHousehold = joinedHousehold || personalHousehold;

  const activeHouseholdId = activeTab === 'ME' ? personalHousehold?.id : familyHousehold?.id;
  const { data: members } = useMembers(familyHousehold?.id);
  const hasFamily = !!joinedHousehold || (members && members.length > 1);

  return (
    <div className="space-y-6 pb-6 animate-fade-in max-w-4xl mx-auto">
      
      {/* 1. HEADER & TOGGLE */}
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-black uppercase tracking-wide leading-tight">Halo, {user?.name?.split(' ')[0]} 👋</h1>
            <p className="font-bold text-xs mt-1 uppercase tracking-widest opacity-70">
              {activeTab === 'ME' ? 'Ringkasan Keuangan Pribadi' : 'Ringkasan Keuangan Keluarga'}
            </p>
          </div>
          {/* Profile Icon Desktop */}
          <div 
            onClick={() => navigate('/profile')}
            className="hidden xl:flex w-12 h-12 rounded-none border-2 border-text-primary bg-primary text-surface shadow-[4px_4px_0_0_#171B22] items-center justify-center font-black cursor-pointer hover:-translate-y-1 hover:shadow-[6px_6px_0_0_#171B22] active:translate-y-0 active:shadow-none transition-all text-xl shrink-0"
          >
            {user?.name?.[0]?.toUpperCase()}
          </div>
        </div>

        {/* Scope Toggle */}
        <div className="flex bg-surface border-2 border-text-primary shadow-[4px_4px_0_0_#171B22] p-1 w-full sm:w-auto self-start">
          <button 
            onClick={() => setActiveTab('ME')}
            className={`flex-1 sm:flex-none px-6 py-2 font-black text-xs uppercase tracking-wider transition-all ${activeTab === 'ME' ? 'bg-primary text-surface shadow-[2px_2px_0_0_#171B22]' : 'text-text-primary opacity-50 hover:opacity-100'}`}
          >
            Pribadi
          </button>
          <button 
            onClick={() => setActiveTab('FAMILY')}
            className={`flex-1 sm:flex-none px-6 py-2 font-black text-xs uppercase tracking-wider transition-all ${activeTab === 'FAMILY' ? 'bg-primary text-surface shadow-[2px_2px_0_0_#171B22]' : 'text-text-primary opacity-50 hover:opacity-100'}`}
          >
            Keluarga
          </button>
        </div>
      </div>

      <DashboardTab 
        hideBalance={hideBalance} 
        setHideBalance={setHideBalance} 
        navigate={navigate} 
        householdId={activeHouseholdId}
        type={activeTab}
        hasFamily={hasFamily}
        currentMonth={currentMonth}
        setCurrentMonth={setCurrentMonth}
        currentYear={currentYear}
        setCurrentYear={setCurrentYear}
      />
    </div>
  );
};

const DashboardTab = ({ hideBalance, setHideBalance, navigate, householdId, type, hasFamily, currentMonth, setCurrentMonth, currentYear, setCurrentYear }: any) => {
  const [isRoastOpen, setIsRoastOpen] = useState(true);

  const { data: roastData, isLoading: isLoadingRoast } = useQuery({
    queryKey: ['ai-roast'],
    queryFn: async () => {
      const res = await api.get('/ai/roast?persona=savage');
      return res.data;
    },
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
  });

  const { data: report } = useReportSummary(householdId || '', currentMonth + "", currentYear + "");
  const { data: wallets } = useWallets(householdId);
  const { data: txResponse } = useTransactions(householdId || '', 1, currentMonth + "", currentYear + "");
  const transactions = txResponse?.data || [];
  
  const user = useAuthStore(state => state.user);

  const calculateTotal = (walletList: any[]) => walletList?.reduce((acc, w) => acc + (w.balance || 0), 0) || 0;

  if (type === 'FAMILY') {
    // FAMILY DASHBOARD LOGIC (Kept similar but restructured)
    const totalBalance = (wallets?.family_members?.reduce((acc: number, m: any) => acc + (m.total_balance || 0), 0) || 0) + calculateTotal(wallets?.personal || []);
    const familyTx = transactions?.filter((t: any) => t.creator?.id !== user?.id) || [];
    
    return (
      <div className="space-y-6">
        {/* Hero Card: Total Saldo Bersama */}
        <div className="bg-primary text-surface rounded-none border-4 border-text-primary p-6 shadow-[8px_8px_0_0_#171B22] relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-black uppercase tracking-widest opacity-90">Total Kekayaan Bersama</p>
            <button onClick={() => setHideBalance(!hideBalance)} className="w-8 h-8 rounded-none bg-surface/20 flex items-center justify-center border-2 border-text-primary hover:bg-surface/40 transition-all">
              {hideBalance ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <div className="flex flex-col gap-2 mt-2">
            <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-none whitespace-nowrap overflow-hidden text-ellipsis">
              {hideBalance ? 'Rp •••••••' : `Rp ${totalBalance.toLocaleString('id-ID')}`}
            </h2>
            <p className="font-bold text-sm opacity-80 mt-2">
              {(wallets?.family_members?.length || 0) + 1} anggota terhubung
            </p>
          </div>
        </div>

        {/* Recent Family Transactions */}
        <div>
          <div className="flex items-center justify-between mb-4 px-1">
            <h2 className="font-black text-text-primary text-lg uppercase tracking-wide">Aktivitas Keluarga</h2>
            <button onClick={() => navigate('/transactions')} className="text-sm font-black uppercase tracking-wider text-primary hover:underline">Lihat semua</button>
          </div>
          <div className="bg-surface border-2 border-text-primary shadow-[4px_4px_0_0_#171B22] divide-y-2 divide-text-primary">
            {familyTx.slice(0, 5).map((t: any) => (
              <div key={t.id} className="p-4 flex items-center justify-between cursor-pointer hover:bg-surface-muted transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-none border-2 border-text-primary bg-primary text-surface flex items-center justify-center font-black text-xs shrink-0">
                    {t.creator?.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-black uppercase tracking-wide leading-none">{t.note || t.category?.name || 'Transaksi'}</p>
                    <p className="text-[10px] font-bold mt-1 opacity-70">
                      {new Date(t.date).toLocaleDateString('id-ID')} • oleh {t.creator?.name?.split(' ')[0]}
                    </p>
                  </div>
                </div>
                <p className={`font-black text-sm ${t.type === 'INCOME' ? 'text-income' : 'text-expense'} text-right ml-2 shrink-0`}>
                  {t.type === 'INCOME' ? '+' : '-'} {t.amount.toLocaleString('id-ID')}
                </p>
              </div>
            ))}
            {familyTx.length === 0 && (
               <div className="text-center p-6 bg-surface">
                 <p className="text-text-primary font-black uppercase tracking-wide text-sm opacity-50">Belum ada aktivitas keluarga</p>
               </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // --- PERSONAL DASHBOARD ---
  const personalWallets = wallets?.personal || [];
  const totalBalance = calculateTotal(personalWallets);
  const personalTx = transactions?.filter((t: any) => t.creator?.id === user?.id) || [];

  return (
    <div className="space-y-6">
      
      {/* 2. HERO SNAPSHOT */}
      <div className="bg-primary text-surface rounded-none border-4 border-text-primary p-6 shadow-[8px_8px_0_0_#171B22] relative overflow-hidden">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-black uppercase tracking-widest opacity-90">Total Saldo Pribadi</p>
          <button 
            onClick={() => setHideBalance(!hideBalance)}
            className="w-8 h-8 rounded-none bg-surface/20 flex items-center justify-center border-2 border-text-primary hover:bg-surface/40 hover:-translate-y-0.5 active:translate-y-0 transition-all"
          >
            {hideBalance ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-none whitespace-nowrap overflow-hidden text-ellipsis mt-2">
          {hideBalance ? 'Rp •••••••' : `Rp ${totalBalance.toLocaleString('id-ID')}`}
        </h2>
      </div>

      {/* MONTH SELECTOR - Moved closer to the cashflow it affects */}
      <div className="flex items-center justify-between">
         <h2 className="font-black text-text-primary text-lg uppercase tracking-wide">Arus Kas</h2>
         <div className="flex items-center gap-1">
            <button 
              onClick={() => {
                if (currentMonth === 1) { setCurrentMonth(12); setCurrentYear((y:number) => y - 1); }
                else setCurrentMonth((m:number) => m - 1);
              }}
              className="w-8 h-8 flex items-center justify-center bg-surface border-2 border-text-primary shadow-[2px_2px_0_0_#171B22] active:translate-y-0 active:shadow-none transition-all font-black"
            >
              &lt;
            </button>
            <div className="px-3 py-1 bg-surface border-2 border-text-primary shadow-[2px_2px_0_0_#171B22] font-black uppercase text-xs">
              {new Date(currentYear, currentMonth - 1).toLocaleString('id-ID', { month: 'short', year: 'numeric' })}
            </div>
            <button 
              onClick={() => {
                if (currentMonth === 12) { setCurrentMonth(1); setCurrentYear((y:number) => y + 1); }
                else setCurrentMonth((m:number) => m + 1);
              }}
              className="w-8 h-8 flex items-center justify-center bg-surface border-2 border-text-primary shadow-[2px_2px_0_0_#171B22] active:translate-y-0 active:shadow-none transition-all font-black"
            >
              &gt;
            </button>
          </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* INCOME */}
        <div className="bg-surface p-4 border-2 border-text-primary shadow-[4px_4px_0_0_#171B22]">
          <div className="flex items-center justify-between text-text-primary mb-2">
            <p className="text-[10px] font-black uppercase tracking-widest">Masuk</p>
            <ArrowDownRight size={16} className="text-income" strokeWidth={3} />
          </div>
          <p className="text-lg md:text-xl font-black text-income truncate">
            {hideBalance ? 'Rp •••••••' : `Rp ${(report?.total_income || 0).toLocaleString('id-ID')}`}
          </p>
        </div>
        
        {/* EXPENSE */}
        <div className="bg-surface p-4 border-2 border-text-primary shadow-[4px_4px_0_0_#171B22]">
          <div className="flex items-center justify-between text-text-primary mb-2">
            <p className="text-[10px] font-black uppercase tracking-widest">Keluar</p>
            <ArrowUpRight size={16} className="text-expense" strokeWidth={3} />
          </div>
          <p className="text-lg md:text-xl font-black text-expense truncate">
            {hideBalance ? 'Rp •••••••' : `Rp ${(report?.total_expense || 0).toLocaleString('id-ID')}`}
          </p>
        </div>
      </div>

      {/* 3. THE BRAIN (AI ROAST) */}
      <div className="bg-[#FFB43A] border-4 border-text-primary shadow-[4px_4px_0_0_#171B22] transition-all">
        <button 
          onClick={() => setIsRoastOpen(!isRoastOpen)}
          className="w-full flex items-center justify-between p-4 focus:outline-none"
        >
          <div className="flex items-center gap-2">
            <span className="text-xl">🤖</span>
            <span className="font-black text-sm uppercase tracking-widest text-text-primary">Nasihat Hari Ini</span>
          </div>
          {isRoastOpen ? <ChevronUp size={20} className="text-text-primary stroke-[3]" /> : <ChevronDown size={20} className="text-text-primary stroke-[3]" />}
        </button>
        
        {isRoastOpen && (
          <div className="px-4 pb-4 border-t-2 border-text-primary/20 mt-1 pt-3">
            {isLoadingRoast ? (
              <div className="animate-pulse flex flex-col gap-2">
                <div className="h-3 bg-text-primary/20 w-full"></div>
                <div className="h-3 bg-text-primary/20 w-3/4"></div>
              </div>
            ) : (
              <p className="font-bold text-sm leading-relaxed text-text-primary">
                {roastData?.data?.insight || 'Aman, belum ada roasting hari ini!'}
              </p>
            )}
          </div>
        )}
      </div>

      {/* 4. THE DETAILS (Aktivitas Terakhir) */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-black text-text-primary text-lg uppercase tracking-wide">Aktivitas Terakhir</h2>
          <button onClick={() => navigate('/transactions')} className="text-xs font-black uppercase tracking-wider text-primary hover:underline">Semua</button>
        </div>
        
        {/* Cleaner List Design */}
        <div className="bg-surface border-2 border-text-primary shadow-[4px_4px_0_0_#171B22] divide-y-2 divide-text-primary">
          {personalTx.slice(0, 5).map((t: any) => (
            <div key={t.id} className="p-4 flex items-center justify-between hover:bg-surface-muted transition-colors cursor-pointer">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-none border-2 border-text-primary flex items-center justify-center text-sm shrink-0 ${t.type === 'INCOME' ? 'bg-[#A3E635]' : 'bg-[#FFA6A6]'}`}>
                  {t.type === 'INCOME' ? '💰' : '💸'}
                </div>
                <div>
                  <p className="text-sm font-black text-text-primary uppercase tracking-wide leading-none">{t.note || t.category?.name || 'Transaksi'}</p>
                  <p className="text-[10px] font-bold text-text-primary mt-1 opacity-70">{new Date(t.date).toLocaleDateString('id-ID')}</p>
                </div>
              </div>
              <p className={`font-black text-sm ${t.type === 'INCOME' ? 'text-income' : 'text-expense'} text-right ml-2 shrink-0`}>
                {t.type === 'INCOME' ? '+' : '-'} {t.amount.toLocaleString('id-ID')}
              </p>
            </div>
          ))}

          {personalTx.length === 0 && (
             <div className="text-center p-6">
               <p className="text-text-primary font-black uppercase tracking-wide text-sm opacity-50">Belum ada transaksi</p>
             </div>
          )}
        </div>
      </div>
      
    </div>
  );
};
