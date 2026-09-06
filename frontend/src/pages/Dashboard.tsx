import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { format } from 'date-fns';
import { ArrowUpRight, ArrowDownRight, Wallet } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Dashboard = () => {
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  const { data: summary, isLoading: loadingSummary } = useQuery({
    queryKey: ['summary', currentMonth, currentYear],
    queryFn: async () => {
      const res = await api.get(`/reports/summary?month=${currentMonth}&year=${currentYear}`);
      return res.data.data;
    }
  });

  const { data: transactions, isLoading: loadingTx } = useQuery({
    queryKey: ['transactions', 'recent'],
    queryFn: async () => {
      const res = await api.get(`/transactions?limit=5`);
      return res.data.data;
    }
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
  };

  return (
    <div className="space-y-8 md:space-y-12 animate-fade-in">
      <header className="flex flex-col md:flex-row md:justify-between md:items-end gap-6">
        <div>
          <h2 className="text-charcoal/50 font-bold uppercase tracking-widest text-xs mb-2">Overview</h2>
          <h1 className="font-serif text-4xl md:text-5xl text-charcoal font-bold tracking-tight">This Month</h1>
        </div>
        <Link 
          to="/transactions"
          className="inline-flex items-center justify-center px-6 py-4 bg-terracotta text-surface font-bold text-lg rounded-2xl hover:bg-terracotta/90 transition-all shadow-xl shadow-terracotta/20 active:scale-95"
        >
          + Add Transaction
        </Link>
      </header>

      {/* Stats Cards - Mobile First Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <StatCard 
          title="Total Balance" 
          amount={summary?.balance || 0} 
          icon={<Wallet size={24} className="text-charcoal" />} 
          loading={loadingSummary}
          className="bg-charcoal text-surface sm:col-span-2 lg:col-span-1"
          isDark
        />
        <StatCard 
          title="Income" 
          amount={summary?.total_income || 0} 
          icon={<ArrowDownRight size={24} className="text-olive" />} 
          loading={loadingSummary}
          className="bg-surface border-olive/20"
        />
        <StatCard 
          title="Expense" 
          amount={summary?.total_expense || 0} 
          icon={<ArrowUpRight size={24} className="text-terracotta" />} 
          loading={loadingSummary}
          className="bg-surface border-terracotta/20"
        />
      </div>

      {/* Recent Transactions */}
      <div>
        <div className="flex justify-between items-end mb-6">
          <h3 className="font-serif text-2xl md:text-3xl font-bold text-charcoal">Recent Activity</h3>
          <Link to="/transactions" className="text-sm font-bold text-charcoal/50 hover:text-charcoal uppercase tracking-wider">View All</Link>
        </div>
        
        <div className="bg-surface border border-charcoal/10 rounded-3xl overflow-hidden shadow-sm">
          {loadingTx ? (
            <div className="p-10 text-center text-charcoal/50 font-medium animate-pulse">Loading activity...</div>
          ) : transactions?.length === 0 ? (
            <div className="p-10 text-center text-charcoal/50">No transactions recorded yet.</div>
          ) : (
            <div className="divide-y divide-charcoal/5">
              {transactions?.map((tx: any) => (
                <div key={tx.id} className="flex justify-between items-center p-5 md:p-6 hover:bg-charcoal/[0.02] transition-colors">
                  <div className="flex items-center gap-4 md:gap-5">
                    <div className="w-12 h-12 md:w-14 md:h-14 bg-background flex items-center justify-center rounded-2xl text-2xl shadow-sm border border-charcoal/5">
                      {tx.category?.icon || '📝'}
                    </div>
                    <div>
                      <p className="font-bold text-charcoal text-base md:text-lg">{tx.note || tx.category?.name}</p>
                      <p className="text-xs md:text-sm text-charcoal/50 font-medium uppercase tracking-wide mt-1">{format(new Date(tx.date), 'dd MMM yyyy')}</p>
                    </div>
                  </div>
                  <div className={`font-serif font-bold text-xl md:text-2xl ${tx.type === 'INCOME' ? 'text-olive' : 'text-charcoal'}`}>
                    {tx.type === 'INCOME' ? '+' : '-'}{formatCurrency(tx.amount)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, amount, icon, loading, className = '', isDark = false }: any) => {
  return (
    <div className={`p-6 md:p-8 rounded-3xl border border-charcoal/10 shadow-sm flex flex-col justify-between min-h-[160px] ${className}`}>
      <div className="flex justify-between items-start mb-6">
        <h3 className={`font-bold text-sm uppercase tracking-widest ${isDark ? 'text-surface/70' : 'text-charcoal/50'}`}>{title}</h3>
        <div className={`p-2 rounded-xl ${isDark ? 'bg-surface/10' : 'bg-background'}`}>
          {icon}
        </div>
      </div>
      {loading ? (
        <div className={`h-10 animate-pulse rounded-lg ${isDark ? 'bg-surface/20' : 'bg-charcoal/10'}`}></div>
      ) : (
        <p className={`font-serif text-3xl md:text-4xl font-bold tracking-tight ${isDark ? 'text-surface' : 'text-charcoal'}`}>
          {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount)}
        </p>
      )}
    </div>
  );
};
