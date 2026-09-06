import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { Target } from 'lucide-react';

export const Budgets = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    category_id: '',
    amount: ''
  });

  const queryClient = useQueryClient();
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  const { data: budgets, isLoading } = useQuery({
    queryKey: ['budgets', currentMonth, currentYear],
    queryFn: async () => {
      const res = await api.get(`/budgets?month=${currentMonth}&year=${currentYear}`);
      return res.data.data;
    }
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await api.get('/categories');
      return res.data.data.filter((c: any) => c.type === 'EXPENSE');
    }
  });

  const setBudgetMutation = useMutation({
    mutationFn: async (data: any) => {
      await api.post('/budgets', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      setIsModalOpen(false);
      setFormData({ category_id: '', amount: '' });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setBudgetMutation.mutate({
      category_id: formData.category_id,
      amount: Number(formData.amount),
      period_month: currentMonth,
      period_year: currentYear
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);
  };

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-charcoal/60 font-medium mb-1">Planning</h2>
          <h1 className="font-serif text-4xl text-charcoal font-bold">Budgets</h1>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-5 py-3 bg-charcoal text-surface font-medium rounded-xl hover:bg-charcoal/90 transition-all"
        >
          <Target size={20} />
          Set Budget
        </button>
      </header>

      {/* Budgets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {isLoading ? (
          <div className="col-span-full p-8 text-center text-charcoal/50">Loading budgets...</div>
        ) : budgets?.length === 0 ? (
          <div className="col-span-full p-12 text-center bg-surface border border-charcoal/10 rounded-2xl">
            <Target size={48} className="mx-auto text-charcoal/20 mb-4" />
            <h3 className="font-serif text-xl font-bold text-charcoal mb-2">No Budgets Set</h3>
            <p className="text-charcoal/60">Take control of your spending by setting limits for this month.</p>
          </div>
        ) : (
          budgets?.map((b: any) => {
            const isOver = b.percentage > 100;
            const progressWidth = Math.min(b.percentage, 100);
            
            return (
              <div key={b.id} className="bg-surface p-6 rounded-2xl border border-charcoal/10 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-lg text-charcoal flex items-center gap-2">
                    {b.category_name}
                  </h3>
                  <span className={`px-3 py-1 text-xs font-bold rounded-full ${isOver ? 'bg-terracotta/10 text-terracotta' : 'bg-charcoal/5 text-charcoal/70'}`}>
                    {b.percentage.toFixed(0)}% Used
                  </span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-charcoal/70 font-medium">Spent: <span className="text-charcoal font-bold">{formatCurrency(b.spent_amount)}</span></span>
                    <span className="text-charcoal/50">Limit: {formatCurrency(b.limit_amount)}</span>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="h-3 w-full bg-background rounded-full overflow-hidden border border-charcoal/5">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ${isOver ? 'bg-terracotta' : 'bg-charcoal'}`}
                      style={{ width: `${progressWidth}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-charcoal/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-surface p-8 rounded-3xl w-full max-w-md shadow-2xl border border-charcoal/10">
            <h3 className="font-serif text-2xl font-bold mb-6">Set Category Budget</h3>
            <form onSubmit={handleSubmit} className="space-y-5">
              
              <div>
                <label className="block text-sm font-semibold text-charcoal mb-2">Expense Category</label>
                <select 
                  required
                  value={formData.category_id}
                  onChange={e => setFormData({...formData, category_id: e.target.value})}
                  className="w-full px-4 py-3 bg-background border border-charcoal/10 rounded-xl focus:outline-none focus:border-terracotta focus:ring-1 focus:ring-terracotta"
                >
                  <option value="" disabled>Select category</option>
                  {categories?.map((c: any) => (
                    <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-charcoal mb-2">Monthly Limit (IDR)</label>
                <input 
                  type="number" required min="1"
                  value={formData.amount}
                  onChange={e => setFormData({...formData, amount: e.target.value})}
                  className="w-full px-4 py-3 bg-background border border-charcoal/10 rounded-xl focus:outline-none focus:border-terracotta focus:ring-1 focus:ring-terracotta"
                  placeholder="1000000"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 text-charcoal bg-background font-bold rounded-xl hover:bg-charcoal/5 transition-colors border border-charcoal/10"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={setBudgetMutation.isPending}
                  className="flex-1 py-3 bg-charcoal text-surface font-bold rounded-xl hover:bg-charcoal/90 transition-colors disabled:opacity-50"
                >
                  {setBudgetMutation.isPending ? 'Saving...' : 'Save Limit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
