import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { format } from 'date-fns';
import { ArrowUpRight, ArrowDownRight, Wallet } from 'lucide-react';

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
    <div className="space-y-10">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-charcoal/60 font-medium mb-1">Overview</h2>
          <h1 className="font-serif text-4xl text-charcoal font-bold">This Month</h1>
        </div>
        <button className="px-5 py-3 bg-charcoal text-surface font-medium rounded-xl hover:bg-charcoal/90 transition-all">
          + Add Transaction
        </button>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          title="Total Balance" 
          amount={summary?.balance || 0} 
          icon={<Wallet size={24} className="text-charcoal" />} 
          loading={loadingSummary}
        />
        <StatCard 
          title="Income" 
          amount={summary?.total_income || 0} 
          icon={<ArrowDownRight size={24} className="text-olive" />} 
          loading={loadingSummary}
          className="bg-olive/10"
        />
        <StatCard 
          title="Expense" 
          amount={summary?.total_expense || 0} 
          icon={<ArrowUpRight size={24} className="text-terracotta" />} 
          loading={loadingSummary}
          className="bg-terracotta/10"
        />
      </div>

      {/* Recent Transactions */}
      <div>
        <h3 className="font-serif text-2xl font-bold mb-6">Recent Activity</h3>
        <div className="bg-surface border border-charcoal/10 rounded-2xl overflow-hidden">
          {loadingTx ? (
            <div className="p-8 text-center text-charcoal/50">Loading...</div>
          ) : transactions?.length === 0 ? (
            <div className="p-8 text-center text-charcoal/50">No transactions yet.</div>
          ) : (
            <div className="divide-y divide-charcoal/10">
              {transactions?.map((tx: any) => (
                <div key={tx.id} className="flex justify-between items-center p-5 hover:bg-charcoal/5 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-background flex items-center justify-center rounded-xl text-xl">
                      {tx.category?.icon || '📝'}
                    </div>
                    <div>
                      <p className="font-bold text-charcoal">{tx.note || tx.category?.name}</p>
                      <p className="text-sm text-charcoal/60">{format(new Date(tx.date), 'dd MMM yyyy')}</p>
                    </div>
                  </div>
                  <div className={`font-serif font-bold text-lg ${tx.type === 'INCOME' ? 'text-olive' : 'text-charcoal'}`}>
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

const StatCard = ({ title, amount, icon, loading, className = 'bg-surface' }: any) => {
  return (
    <div className={`p-6 rounded-2xl border border-charcoal/10 ${className}`}>
      <div className="flex justify-between items-start mb-4">
        <h3 className="font-medium text-charcoal/70">{title}</h3>
        {icon}
      </div>
      {loading ? (
        <div className="h-10 bg-charcoal/10 animate-pulse rounded"></div>
      ) : (
        <p className="font-serif text-3xl font-bold text-charcoal">
          {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount)}
        </p>
      )}
    </div>
  );
};
