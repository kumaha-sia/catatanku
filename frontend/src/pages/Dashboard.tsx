import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { useUIStore } from '../store/uiStore';
import { useNavigate } from 'react-router-dom';
import { Bell, Eye, EyeOff, Plus, ArrowUpRight, ArrowDownRight, Users, Lock, ChevronDown, Check } from 'lucide-react';
import { useHouseholds, useTransactions, useWallets, useReportSummary } from '../hooks/useFinances';

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
  
  // Convention: Personal household is the first one where they are OWNER
  const personalHousehold = households?.find((h: any) => h.owner_id === user?.id) || households?.[0];
  const familyHousehold = households?.find((h: any) => h.id !== personalHousehold?.id); // The other one

  const activeHouseholdId = activeTab === 'ME' ? personalHousehold?.id : (familyHousehold?.id || personalHousehold?.id);

  return (
    <div className="space-y-6 pb-6">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-wide">Halo, {user?.name?.split(' ')[0]} 👋</h1>
        </div>
        <div className="hidden md:flex items-center gap-3">
          <button className="w-10 h-10 rounded-none border-2 border-text-primary bg-surface shadow-[4px_4px_0_0_#171B22] flex items-center justify-center text-text-primary relative hover:-translate-y-1 hover:shadow-[4px_4px_0_0_#171B22] active:translate-y-0 active:shadow-none transition-all">
            <Bell size={20} />
            <div className="absolute top-1 right-1 w-3 h-3 bg-error rounded-none border border-text-primary" />
          </button>
          <div 
            onClick={() => navigate('/profile')}
            className="w-10 h-10 rounded-none border-2 border-text-primary bg-primary text-surface shadow-[4px_4px_0_0_#171B22] flex items-center justify-center font-black cursor-pointer hover:-translate-y-1 hover:shadow-[4px_4px_0_0_#171B22] active:translate-y-0 active:shadow-none transition-all"
          >
            {user?.name?.[0]?.toUpperCase()}
          </div>
        </div>
      </div>

      {/* Controls & Tabs Container */}
      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
        {/* Month Selector */}
        <div className="flex items-center gap-2">
          <button 
            onClick={() => {
              if (currentMonth === 1) { setCurrentMonth(12); setCurrentYear(y => y - 1); }
              else setCurrentMonth(m => m - 1);
            }}
            className="w-10 h-10 flex items-center justify-center bg-surface border-2 border-text-primary shadow-[4px_4px_0_0_#171B22] hover:-translate-y-1 hover:shadow-[4px_4px_0_0_#171B22] transition-all active:translate-y-0 active:shadow-none"
          >
            &lt;
          </button>
          
          <div className="flex-1 md:flex-none px-4 py-2 bg-surface border-2 border-text-primary shadow-[4px_4px_0_0_#171B22] font-black uppercase tracking-wider text-sm min-w-[140px] text-center">
            {new Date(currentYear, currentMonth - 1).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
          </div>

          <button 
            onClick={() => {
              if (currentMonth === 12) { setCurrentMonth(1); setCurrentYear(y => y + 1); }
              else setCurrentMonth((m: number) => m + 1);
            }}
            className="w-10 h-10 flex items-center justify-center bg-surface border-2 border-text-primary shadow-[4px_4px_0_0_#171B22] hover:-translate-y-1 hover:shadow-[4px_4px_0_0_#171B22] transition-all active:translate-y-0 active:shadow-none"
          >
            &gt;
          </button>
        </div>

        {/* Tabs */}
        <div className="flex p-1 bg-surface-muted border-2 border-text-primary shadow-[4px_4px_0_0_#171B22] rounded-none w-full md:w-64">
          <button 
            onClick={() => setActiveTab('ME')}
            className={`flex-1 py-2 text-sm font-black uppercase tracking-wider rounded-none transition-all ${activeTab === 'ME' ? 'bg-primary text-surface border-2 border-text-primary shadow-[2px_2px_0_0_#171B22]' : 'text-text-primary hover:bg-surface-muted'}`}
          >
            Pribadi
          </button>
          <button 
            onClick={() => setActiveTab('FAMILY')}
            className={`flex-1 py-2 text-sm font-black uppercase tracking-wider rounded-none transition-all ${activeTab === 'FAMILY' ? 'bg-primary text-surface border-2 border-text-primary shadow-[2px_2px_0_0_#171B22]' : 'text-text-primary hover:bg-surface-muted'}`}
          >
            Keluarga
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <DashboardTab 
        hideBalance={hideBalance} 
        setHideBalance={setHideBalance}
        navigate={navigate} 
        householdId={activeHouseholdId}
        type={activeTab}
        hasFamily={!!familyHousehold}
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

  if (type === 'FAMILY' && !hasFamily) {
    return (
      <div className="space-y-6 animate-fade-in text-center py-10 bg-surface border-4 border-text-primary rounded-none shadow-[8px_8px_0_0_#171B22]">
        <div className="w-16 h-16 bg-primary border-2 border-text-primary rounded-none flex items-center justify-center text-surface mx-auto mb-4 shadow-[4px_4px_0_0_#171B22]">
          <Users size={32} />
        </div>
        <h3 className="font-black text-xl text-text-primary mb-2 uppercase tracking-wide">Belum Ada Keluarga</h3>
        <p className="text-text-primary font-bold text-sm mb-6 max-w-xs mx-auto">Undang pasangan atau keluarga Anda untuk mencatat keuangan bersama secara transparan.</p>
        <button onClick={() => navigate('/family')} className="px-6 py-3 bg-primary text-surface rounded-none border-2 border-text-primary font-black uppercase tracking-wider shadow-[4px_4px_0_0_#171B22] hover:-translate-y-1 hover:shadow-[6px_6px_0_0_#171B22] active:translate-y-0 active:shadow-none transition-all">
          Undang Sekarang
        </button>
      </div>
    );
  }

  const calculateTotal = (walletList: any[]) => walletList?.reduce((acc, w) => acc + (w.balance || 0), 0) || 0;
  const totalBalance = type === 'ME' ? calculateTotal(wallets?.personal || []) : calculateTotal(wallets?.shared || []);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Balance Card */}
      <div className={`${type === 'FAMILY' ? 'bg-accent text-text-primary' : 'bg-primary text-surface'} rounded-none border-4 border-text-primary p-6 shadow-[8px_8px_0_0_#171B22] relative overflow-hidden`}>
        <div className="flex items-center justify-between mb-1">
          <p className={`text-sm font-black uppercase tracking-widest`}>Total Saldo {type === 'ME' ? 'Pribadi' : 'Keluarga'}</p>
          <button 
            onClick={() => setHideBalance(!hideBalance)}
            className="w-8 h-8 rounded-none bg-surface/20 flex items-center justify-center border-2 border-text-primary hover:bg-surface/40 hover:-translate-y-0.5 active:translate-y-0 transition-all"
          >
            {hideBalance ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        <h2 className="text-4xl font-black mb-4 tracking-tight break-all sm:break-words">
          {hideBalance ? 'Rp        ' : `Rp ${totalBalance.toLocaleString('id-ID')}`}
        </h2>
        <div className="flex items-center justify-between mt-6">
          <p className={`font-bold text-sm`}>
            {type === 'ME' ? (wallets?.personal?.length || 0) : (wallets?.shared?.length || 0)} dompet terhubung
          </p>
          <div className="flex gap-2">
            <button onClick={() => navigate('/wallets')} className={`px-4 py-2 ${type === 'FAMILY' ? 'bg-surface text-text-primary' : 'bg-surface text-text-primary'} border-2 border-text-primary shadow-[2px_2px_0_0_#171B22] hover:-translate-y-1 hover:shadow-[4px_4px_0_0_#171B22] active:translate-y-0 active:shadow-none rounded-none text-sm font-black uppercase tracking-wider transition-all`}>
              Dompet
            </button>
          </div>
        </div>
      </div>

      {/* Income / Expense */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-surface p-4 rounded-none shadow-[4px_4px_0_0_#171B22] border-2 border-text-primary">
          <div className="flex items-center gap-2 text-text-primary mb-2">
            <ArrowDownRight size={18} className="text-income" />
            <p className="text-xs font-black uppercase tracking-wider">Pemasukan</p>
          </div>
          <p className="text-base md:text-lg font-black text-income break-all sm:break-words leading-tight">
            {hideBalance ? 'Rp      ' : `Rp ${(report?.total_income || 0).toLocaleString('id-ID')}`}
          </p>
        </div>
        <div className="bg-surface p-4 rounded-none shadow-[4px_4px_0_0_#171B22] border-2 border-text-primary">
          <div className="flex items-center gap-2 text-text-primary mb-2">
            <ArrowUpRight size={18} className="text-expense" />
            <p className="text-xs font-black uppercase tracking-wider">Pengeluaran</p>
          </div>
          <p className="text-base md:text-lg font-black text-expense break-all sm:break-words leading-tight">
            {hideBalance ? 'Rp      ' : `Rp ${(report?.total_expense || 0).toLocaleString('id-ID')}`}
          </p>
        </div>
      </div>

      {/* Recent Transactions */}
      <div>
        <div className="flex items-center justify-between mb-4 px-1">
          <h2 className="font-black text-text-primary text-lg uppercase tracking-wide">Aktivitas Terakhir</h2>
          <button onClick={() => navigate('/transactions')} className="text-sm font-black uppercase tracking-wider text-primary hover:underline">Lihat semua</button>
        </div>
        
        <div className="space-y-3">
          {transactions?.slice(0, 5).map((t: any) => (
            <div key={t.id} className="bg-surface p-3 md:p-4 rounded-none flex items-center justify-between shadow-[4px_4px_0_0_#171B22] border-2 border-text-primary cursor-pointer hover:-translate-y-1 hover:shadow-[6px_6px_0_0_#171B22] active:translate-y-0 active:shadow-[2px_2px_0_0_#171B22] transition-all">
              <div className="flex items-center gap-3 md:gap-4">
                <div className={`w-10 h-10 rounded-none border-2 border-text-primary flex items-center justify-center text-xl ${t.type === 'INCOME' ? 'bg-[#A3E635]' : 'bg-[#FFA6A6]'}`}>
                  {t.type === 'INCOME' ? '💰' : '💸'}
                </div>
                <div>
                  <p className="text-sm font-black text-text-primary uppercase tracking-wide leading-none">{t.note || t.category?.name || 'Transaksi'}</p>
                  <p className="text-[10px] md:text-xs font-bold text-text-primary mt-1">{new Date(t.date).toLocaleDateString('id-ID')}</p>
                </div>
              </div>
              <p className={`font-black text-sm md:text-base ${t.type === 'INCOME' ? 'text-income' : 'text-expense'}`}>
                {t.type === 'INCOME' ? '+' : '-'} {t.amount.toLocaleString('id-ID')}
              </p>
            </div>
          ))}

          {(!transactions || transactions.length === 0) && (
             <div className="text-center p-8 bg-surface border-2 border-text-primary rounded-none shadow-[4px_4px_0_0_#171B22]">
               <p className="text-text-primary font-black uppercase tracking-wide">Belum ada transaksi</p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};


