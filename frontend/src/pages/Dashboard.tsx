import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { useUIStore } from '../store/uiStore';
import { useNavigate } from 'react-router-dom';
import { Bell, Eye, EyeOff, Plus, ArrowUpRight, ArrowDownRight, Users, Lock, ChevronDown, Check } from 'lucide-react';
import { useHouseholds, useTransactions, useWallets, useReportSummary, useMembers } from '../hooks/useFinances';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import { FinRoastWidget } from '../components/FinRoastWidget';

export const Dashboard = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const [activeTab, setActiveTab] = useState<'ME' | 'FAMILY'>('ME');
  const [hideBalance, setHideBalance] = useState(false);
  const openAddTransaction = useUIStore((state) => state.openAddTransaction);
  
    const { data: roastData, isLoading: isLoadingRoast } = useQuery({
    queryKey: ['ai-roast'],
    queryFn: async () => {
      const res = await api.get('/ai/roast?persona=savage');
      return res.data;
    },
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
  });
  
  const now = new Date();
  const [currentMonth, setCurrentMonth] = useState(now.getMonth() + 1);
  const [currentYear, setCurrentYear] = useState(now.getFullYear());

  const { data: households } = useHouseholds();
  
  // The user's default personal household
  const personalHousehold = households?.find((h: any) => h.role === 'OWNER') || households?.[0];
  
  // The household they use for family (either one they joined, or their own)
  const joinedHousehold = households?.find((h: any) => h.role !== 'OWNER' && h.status !== 'PENDING');
  const familyHousehold = joinedHousehold || personalHousehold;

  const activeHouseholdId = activeTab === 'ME' ? personalHousehold?.id : familyHousehold?.id;

  const { data: members } = useMembers(familyHousehold?.id);
  const hasFamily = !!joinedHousehold || (members && members.length > 1);

  return (
    <div className="space-y-6 pb-6">
      
      {/* Header & Controls */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
        <div>
          <h1 className="text-3xl lg:text-4xl font-black uppercase tracking-wide leading-tight">Halo, {user?.name?.split(' ')[0]} 👋</h1>
          <p className="font-bold text-sm mt-2 uppercase tracking-widest opacity-70">
            {activeTab === 'ME' ? 'Ringkasan Keuangan Pribadi' : 'Ringkasan Keuangan Keluarga'}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full xl:w-auto">
          {/* Month Selector */}
          <div className="flex items-center gap-2">
            <button 
              onClick={() => {
                if (currentMonth === 1) { setCurrentMonth(12); setCurrentYear(y => y - 1); }
                else setCurrentMonth(m => m - 1);
              }}
              className="w-10 h-10 flex items-center justify-center bg-surface border-2 border-text-primary shadow-[4px_4px_0_0_#171B22] hover:-translate-y-1 hover:shadow-[6px_6px_0_0_#171B22] transition-all active:translate-y-0 active:shadow-[2px_2px_0_0_#171B22]"
            >
              &lt;
            </button>
            
            <div className="flex-1 sm:w-48 h-10 px-4 bg-surface border-2 border-text-primary shadow-[4px_4px_0_0_#171B22] flex items-center justify-center font-black uppercase text-sm">
              {new Date(currentYear, currentMonth - 1).toLocaleString('id-ID', { month: 'long', year: 'numeric' })}
            </div>

            <button 
              onClick={() => {
                if (currentMonth === 12) { setCurrentMonth(1); setCurrentYear(y => y + 1); }
                else setCurrentMonth((m: number) => m + 1);
              }}
              className="w-10 h-10 flex items-center justify-center bg-surface border-2 border-text-primary shadow-[4px_4px_0_0_#171B22] hover:-translate-y-1 hover:shadow-[6px_6px_0_0_#171B22] transition-all active:translate-y-0 active:shadow-[2px_2px_0_0_#171B22]"
            >
              &gt;
            </button>
          </div>

          {/* Type Toggle Tabs */}
          <div className="flex bg-surface border-2 border-text-primary shadow-[4px_4px_0_0_#171B22] p-1 flex-1 sm:flex-none">
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
          
          {/* Profile Icon Desktop */}
          <div 
            onClick={() => navigate('/profile')}
            className="hidden xl:flex w-12 h-12 rounded-none border-2 border-text-primary bg-primary text-surface shadow-[4px_4px_0_0_#171B22] items-center justify-center font-black cursor-pointer hover:-translate-y-1 hover:shadow-[6px_6px_0_0_#171B22] active:translate-y-0 active:shadow-none transition-all text-xl shrink-0 ml-2"
          >
            {user?.name?.[0]?.toUpperCase()}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <DashboardTab 
        hideBalance={hideBalance} 
        setHideBalance={setHideBalance} 
        navigate={navigate} 
        householdId={activeHouseholdId}
        type={activeTab}
        hasFamily={hasFamily}
        currentMonth={currentMonth}
        currentYear={currentYear}
      />

    </div>
  );
};

const DashboardTab = ({ hideBalance, setHideBalance, navigate, householdId, type, hasFamily, currentMonth, currentYear }: { hideBalance: boolean, setHideBalance: (h: boolean) => void, navigate: any, householdId?: string, type: string, hasFamily: boolean, currentMonth: number, currentYear: number }) => {
  
  const { data: report } = useReportSummary(householdId || '', currentMonth + "", currentYear + "");
  const { data: wallets } = useWallets(householdId);
  const { data: transactions } = useTransactions(householdId || '', 1, currentMonth + "", currentYear + "");
  
  const user = useAuthStore(state => state.user);

  const calculateTotal = (walletList: any[]) => walletList?.reduce((acc, w) => acc + (w.balance || 0), 0) || 0;
  
  if (type === 'FAMILY') {
    const totalBalance = (wallets?.family_members?.reduce((acc: number, m: any) => acc + (m.total_balance || 0), 0) || 0) +
                         calculateTotal(wallets?.personal || []);
    
    // Use ALL expenses in the household for the category breakdown (You + Family)
    const combinedHouseholdExpenses = transactions?.filter((t: any) => t.type === 'EXPENSE') || [];
    
    const spendByCategory = combinedHouseholdExpenses.reduce((acc: any, t: any) => {
      const catName = t.category?.name || 'Lainnya';
      acc[catName] = (acc[catName] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);
    
    const totalFamilyExpense = Object.values(spendByCategory).reduce((a: any, b: any) => a + b, 0) as number;
    const spendArray = Object.entries(spendByCategory)
      .map(([name, amount]) => ({ name, amount: amount as number, percentage: totalFamilyExpense ? ((amount as number) / totalFamilyExpense) * 100 : 0 }))
      .sort((a, b) => b.amount - a.amount);

    // Keep Activity Feed strictly for OTHER family members
    const familyTx = transactions?.filter((t: any) => t.creator?.id !== user?.id) || [];

    const colors = ['bg-primary', 'bg-accent', 'bg-error', 'bg-income'];

    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 animate-fade-in">
        {/* Main Column (Left on Desktop) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Hero Card: Total Saldo Bersama */}
          <div className="bg-primary text-surface rounded-none border-4 border-text-primary p-6 shadow-[8px_8px_0_0_#171B22] relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-black uppercase tracking-widest opacity-90">Total Kekayaan Bersama</p>
              <button 
                onClick={() => setHideBalance(!hideBalance)}
                className="w-8 h-8 rounded-none bg-surface/20 flex items-center justify-center border-2 border-text-primary hover:bg-surface/40 hover:-translate-y-0.5 active:translate-y-0 transition-all"
              >
                {hideBalance ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            
            <div className="flex flex-col gap-6 mt-4">
              <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-none whitespace-nowrap overflow-hidden text-ellipsis">
                {hideBalance ? 'Rp        ' : `Rp ${totalBalance.toLocaleString('id-ID')}`}
              </h2>
              
              <div className="flex items-center justify-between border-t-2 border-surface/30 pt-4">
                <p className="font-bold text-sm">
                  {(wallets?.family_members?.length || 0) + 1} anggota terhubung
                </p>
                <button onClick={() => navigate('/wallets')} className="px-6 py-2 bg-surface text-text-primary border-2 border-text-primary shadow-[4px_4px_0_0_#171B22] hover:-translate-y-1 hover:shadow-[6px_6px_0_0_#171B22] active:translate-y-0 active:shadow-none font-black uppercase text-sm tracking-wider transition-all">
                  Dompet
                </button>
              </div>
            </div>
          </div>

          {/* Recent Family Transactions */}
          <div>
            <div className="flex items-center justify-between mb-4 px-1">
              <h2 className="font-black text-text-primary text-lg uppercase tracking-wide">Aktivitas Keluarga</h2>
              <button onClick={() => navigate('/transactions')} className="text-sm font-black uppercase tracking-wider text-primary hover:underline">Lihat semua</button>
            </div>
            
            <div className="space-y-3">
              {familyTx.slice(0, 5).map((t: any) => (
                <div key={t.id} className="bg-surface p-3 md:p-4 rounded-none flex items-center justify-between shadow-[4px_4px_0_0_#171B22] border-2 border-text-primary cursor-pointer hover:-translate-y-1 hover:shadow-[6px_6px_0_0_#171B22] transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-none border-2 border-text-primary bg-primary text-surface flex items-center justify-center font-black shadow-[2px_2px_0_0_#171B22] shrink-0">
                      {t.creator?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-black uppercase tracking-wide leading-none">{t.note || t.category?.name || 'Transaksi'}</p>
                      <p className="text-[10px] md:text-xs font-bold mt-1 opacity-70">
                        {new Date(t.date).toLocaleDateString('id-ID')} • oleh {t.creator?.name?.split(' ')[0]}
                      </p>
                    </div>
                  </div>
                  <p className={`font-black text-sm md:text-base ${t.type === 'INCOME' ? 'text-income' : 'text-expense'} text-right ml-2 shrink-0`}>
                    {t.type === 'INCOME' ? '+' : '-'} {t.amount.toLocaleString('id-ID')}
                  </p>
                </div>
              ))}

              {familyTx.length === 0 && (
                 <div className="text-center p-8 bg-surface border-2 border-text-primary rounded-none shadow-[4px_4px_0_0_#171B22]">
                   <p className="text-text-primary font-black uppercase tracking-wide">Belum ada aktivitas keluarga</p>
                 </div>
              )}
            </div>
          </div>
        </div>

        {/* Widget Column (Right on Desktop) */}
        <div className="lg:col-span-1 space-y-6">
          {/* Split Insight Card */}
          <div className="bg-surface border-4 border-text-primary p-5 shadow-[6px_6px_0_0_#171B22]">
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-black text-sm uppercase tracking-widest leading-snug w-2/3">Kategori Pengeluaran Bersama</h3>
              <div className="text-right shrink-0">
                <p className="text-[10px] font-black uppercase tracking-widest opacity-70">Total Pengeluaran</p>
                <p className="font-black text-expense text-sm md:text-base">Rp {totalFamilyExpense.toLocaleString('id-ID')}</p>
              </div>
            </div>
            
            {totalFamilyExpense === 0 ? (
               <p className="text-sm font-bold opacity-70">Belum ada pengeluaran bersama bulan ini.</p>
            ) : (
               <div className="space-y-4">
                 {/* Progress Bar */}
                 <div className="w-full h-8 flex border-2 border-text-primary shadow-[2px_2px_0_0_#171B22]">
                   {spendArray.map((catSpend, i) => (
                     <div 
                       key={catSpend.name} 
                       style={{ width: `${catSpend.percentage}%` }}
                       className={`${colors[i % colors.length]} h-full border-r-2 border-text-primary last:border-r-0 flex items-center justify-center overflow-hidden`}
                     >
                       {catSpend.percentage > 15 && <span className="text-[10px] font-black text-surface px-1">{catSpend.percentage.toFixed(0)}%</span>}
                     </div>
                   ))}
                 </div>
                 
                 {/* Legend */}
                 <div className="grid grid-cols-1 gap-3 mt-4">
                   {spendArray.map((catSpend, i) => (
                     <div key={catSpend.name} className="flex justify-between items-center text-sm">
                       <div className="flex items-center gap-3 font-black uppercase">
                         <div className={`w-4 h-4 border-2 border-text-primary shadow-[2px_2px_0_0_#171B22] ${colors[i % colors.length]}`} />
                         {catSpend.name}
                       </div>
                       <span className="font-bold text-expense text-right ml-2">Rp {catSpend.amount.toLocaleString('id-ID')}</span>
                     </div>
                   ))}
                 </div>
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
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 animate-fade-in">
      
      {/* Main Column (Left on Desktop) */}
      <div className="lg:col-span-2 space-y-6">
        
        
        {/* Balance Card */}
        <div className={`bg-primary text-surface rounded-none border-4 border-text-primary p-6 shadow-[8px_8px_0_0_#171B22] relative overflow-hidden`}>
          <div className="flex items-center justify-between mb-2">
            <p className={`text-sm font-black uppercase tracking-widest opacity-90`}>Total Saldo Pribadi</p>
            <button 
              onClick={() => setHideBalance(!hideBalance)}
              className="w-8 h-8 rounded-none bg-surface/20 flex items-center justify-center border-2 border-text-primary hover:bg-surface/40 hover:-translate-y-0.5 active:translate-y-0 transition-all"
            >
              {hideBalance ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          
          <div className="flex flex-col gap-6 mt-4">
            <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-none whitespace-nowrap overflow-hidden text-ellipsis">
              {hideBalance ? 'Rp        ' : `Rp ${totalBalance.toLocaleString('id-ID')}`}
            </h2>
            
            <div className="flex items-center justify-between border-t-2 border-surface/30 pt-4">
              <p className={`font-bold text-sm`}>
                {personalWallets.length} dompet terhubung
              </p>
              <button onClick={() => navigate('/wallets')} className={`px-6 py-2 bg-surface text-text-primary border-2 border-text-primary shadow-[4px_4px_0_0_#171B22] hover:-translate-y-1 hover:shadow-[6px_6px_0_0_#171B22] active:translate-y-0 active:shadow-none rounded-none text-sm font-black uppercase tracking-wider transition-all`}>
                Dompet
              </button>
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div>
          <div className="flex items-center justify-between mb-4 px-1">
            <h2 className="font-black text-text-primary text-lg uppercase tracking-wide">Aktivitas Terakhir</h2>
            <button onClick={() => navigate('/transactions')} className="text-sm font-black uppercase tracking-wider text-primary hover:underline">Lihat semua</button>
          </div>
          
          <div className="space-y-3">
            {personalTx.slice(0, 5).map((t: any) => (
              <div key={t.id} className="bg-surface p-3 md:p-4 rounded-none flex items-center justify-between shadow-[4px_4px_0_0_#171B22] border-2 border-text-primary cursor-pointer hover:-translate-y-1 hover:shadow-[6px_6px_0_0_#171B22] active:translate-y-0 active:shadow-[2px_2px_0_0_#171B22] transition-all">
                <div className="flex items-center gap-3 md:gap-4">
                  <div className={`w-10 h-10 rounded-none border-2 border-text-primary flex items-center justify-center text-xl ${t.type === 'INCOME' ? 'bg-[#A3E635]' : 'bg-[#FFA6A6]'}`}>
                    {t.type === 'INCOME' ? '💰' : '💸'}
                  </div>
                  <div>
                    <p className="text-sm font-black text-text-primary uppercase tracking-wide leading-none">{t.note || t.category?.name || 'Transaksi'}</p>
                    <p className="text-[10px] md:text-xs font-bold text-text-primary mt-1 opacity-70">{new Date(t.date).toLocaleDateString('id-ID')}</p>
                  </div>
                </div>
                <p className={`font-black text-sm md:text-base ${t.type === 'INCOME' ? 'text-income' : 'text-expense'} text-right ml-2 shrink-0`}>
                  {t.type === 'INCOME' ? '+' : '-'} {t.amount.toLocaleString('id-ID')}
                </p>
              </div>
            ))}

            {personalTx.length === 0 && (
               <div className="text-center p-8 bg-surface border-2 border-text-primary rounded-none shadow-[4px_4px_0_0_#171B22]">
                 <p className="text-text-primary font-black uppercase tracking-wide">Belum ada transaksi</p>
               </div>
            )}
          </div>
        </div>
      </div>

      {/* Widget Column (Right on Desktop) */}
      <div className="lg:col-span-1 space-y-6">
        {/* Income / Expense */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
          <div className="bg-surface p-5 rounded-none shadow-[4px_4px_0_0_#171B22] border-2 border-text-primary">
            <div className="flex items-center justify-between text-text-primary mb-3">
              <p className="text-xs font-black uppercase tracking-widest">Pemasukan</p>
              <ArrowDownRight size={20} className="text-income" strokeWidth={3} />
            </div>
            <p className="text-2xl lg:text-3xl font-black text-income break-all sm:break-words leading-tight">
              {hideBalance ? 'Rp      ' : `Rp ${(report?.total_income || 0).toLocaleString('id-ID')}`}
            </p>
          </div>
          
          <div className="bg-surface p-5 rounded-none shadow-[4px_4px_0_0_#171B22] border-2 border-text-primary">
            <div className="flex items-center justify-between text-text-primary mb-3">
              <p className="text-xs font-black uppercase tracking-widest">Pengeluaran</p>
              <ArrowUpRight size={20} className="text-expense" strokeWidth={3} />
            </div>
            <p className="text-2xl lg:text-3xl font-black text-expense break-all sm:break-words leading-tight">
              {hideBalance ? 'Rp      ' : `Rp ${(report?.total_expense || 0).toLocaleString('id-ID')}`}
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};


