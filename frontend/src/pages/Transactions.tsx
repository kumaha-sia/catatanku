import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { format } from 'date-fns';
import { Plus, Trash2, X } from 'lucide-react';

export const Transactions = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    type: 'EXPENSE',
    amount: '',
    category_id: '',
    date: new Date().toISOString().slice(0, 16),
    note: ''
  });

  const queryClient = useQueryClient();
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  const { data: transactions, isLoading } = useQuery({
    queryKey: ['transactions', currentMonth, currentYear],
    queryFn: async () => {
      const res = await api.get(`/transactions?month=${currentMonth}&year=${currentYear}&limit=50`);
      return res.data.data;
    }
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await api.get('/categories');
      return res.data.data;
    }
  });

  const createMutation = useMutation({
    mutationFn: async (newTx: any) => {
      await api.post('/transactions', newTx);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['summary'] });
      setIsModalOpen(false);
      setFormData({ ...formData, amount: '', note: '' });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/transactions/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['summary'] });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      ...formData,
      amount: Number(formData.amount),
      date: new Date(formData.date).toISOString()
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(amount);
  };

  return (
    <div className="space-y-8 md:space-y-12 animate-fade-in">
      {/* Mobile-first Header */}
      <header className="flex flex-col md:flex-row md:justify-between md:items-end gap-6">
        <div>
          <h2 className="text-charcoal/50 font-bold uppercase tracking-widest text-xs mb-2">History</h2>
          <h1 className="font-serif text-4xl md:text-5xl text-charcoal font-bold tracking-tight">Transactions</h1>
        </div>
        
        {/* Mobile Sticky Add Button or Desktop Header Button */}
        <button 
          onClick={() => setIsModalOpen(true)}
          className="fixed md:static bottom-24 right-5 md:bottom-auto md:right-auto z-40 flex items-center justify-center gap-2 px-6 py-4 bg-terracotta text-surface font-bold text-lg rounded-full md:rounded-2xl shadow-2xl md:shadow-xl shadow-terracotta/30 hover:bg-terracotta/90 transition-transform active:scale-95"
        >
          <Plus size={24} />
          <span className="hidden md:inline">Add Transaction</span>
        </button>
      </header>

      {/* Transaction List (Mobile Card View & Desktop Table View) */}
      <div className="bg-surface border border-charcoal/10 rounded-3xl overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="p-10 text-center text-charcoal/50 animate-pulse">Loading records...</div>
        ) : transactions?.length === 0 ? (
          <div className="p-12 text-center text-charcoal/50 flex flex-col items-center">
            <span className="text-4xl mb-4 opacity-50">💸</span>
            <p className="font-serif text-xl">No transactions found</p>
          </div>
        ) : (
          <div className="divide-y divide-charcoal/5">
            {transactions?.map((tx: any) => (
              <div key={tx.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-5 md:p-6 hover:bg-charcoal/[0.02] transition-colors gap-4">
                
                <div className="flex items-start gap-4 md:gap-5 w-full sm:w-auto">
                  <div className="w-12 h-12 md:w-14 md:h-14 bg-background flex-shrink-0 flex items-center justify-center rounded-2xl text-2xl border border-charcoal/5">
                    {tx.category?.icon || '📝'}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-charcoal text-base md:text-lg">{tx.note || tx.category?.name}</p>
                    <p className="text-xs md:text-sm text-charcoal/50 font-bold uppercase tracking-wider mt-1">
                      {tx.category?.name} • {format(new Date(tx.date), 'dd MMM yyyy, HH:mm')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto border-t sm:border-t-0 border-charcoal/5 pt-4 sm:pt-0">
                  <div className={`font-serif font-bold text-xl md:text-2xl ${tx.type === 'INCOME' ? 'text-olive' : 'text-charcoal'}`}>
                    {tx.type === 'INCOME' ? '+' : '-'}{formatCurrency(tx.amount)}
                  </div>
                  <button 
                    onClick={() => { if(confirm('Delete this transaction?')) deleteMutation.mutate(tx.id); }}
                    className="text-terracotta/40 hover:text-terracotta bg-background hover:bg-terracotta/10 p-3 rounded-xl transition-colors active:scale-95"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

      {/* Beautiful Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-charcoal/40 backdrop-blur-sm flex items-end md:items-center justify-center z-50 animate-fade-in p-0 md:p-4">
          <div className="bg-surface w-full max-w-lg rounded-t-[2.5rem] md:rounded-[2.5rem] p-6 md:p-10 shadow-2xl max-h-[90vh] overflow-y-auto animate-slide-up">
            
            <div className="flex justify-between items-center mb-8">
              <h3 className="font-serif text-3xl font-bold text-charcoal">New Record</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-3 bg-background rounded-full text-charcoal/50 hover:text-charcoal transition-colors">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Type Switcher */}
              <div className="flex bg-background p-1.5 rounded-2xl border border-charcoal/5">
                <button 
                  type="button"
                  onClick={() => setFormData({...formData, type: 'EXPENSE'})}
                  className={`flex-1 py-3 text-sm font-bold uppercase tracking-wider rounded-xl transition-all ${formData.type === 'EXPENSE' ? 'bg-charcoal text-surface shadow-md scale-95' : 'text-charcoal/50 hover:text-charcoal'}`}
                >
                  Expense
                </button>
                <button 
                  type="button"
                  onClick={() => setFormData({...formData, type: 'INCOME'})}
                  className={`flex-1 py-3 text-sm font-bold uppercase tracking-wider rounded-xl transition-all ${formData.type === 'INCOME' ? 'bg-olive text-surface shadow-md scale-95' : 'text-charcoal/50 hover:text-charcoal'}`}
                >
                  Income
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-charcoal/50 mb-2">Amount (IDR)</label>
                <input 
                  type="number" required min="1"
                  value={formData.amount}
                  onChange={e => setFormData({...formData, amount: e.target.value})}
                  className="w-full px-5 py-4 bg-background border-2 border-transparent font-serif text-2xl font-bold text-charcoal rounded-2xl focus:outline-none focus:border-terracotta/30 focus:bg-surface transition-all placeholder:text-charcoal/20"
                  placeholder="0"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-charcoal/50 mb-2">Category</label>
                  <select 
                    required
                    value={formData.category_id}
                    onChange={e => setFormData({...formData, category_id: e.target.value})}
                    className="w-full px-5 py-4 bg-background border-2 border-transparent font-bold text-charcoal rounded-2xl focus:outline-none focus:border-terracotta/30 focus:bg-surface transition-all appearance-none"
                  >
                    <option value="" disabled>Select...</option>
                    {categories?.filter((c: any) => c.type === formData.type).map((c: any) => (
                      <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-charcoal/50 mb-2">Date & Time</label>
                  <input 
                    type="datetime-local" required
                    value={formData.date}
                    onChange={e => setFormData({...formData, date: e.target.value})}
                    className="w-full px-5 py-4 bg-background border-2 border-transparent font-bold text-charcoal rounded-2xl focus:outline-none focus:border-terracotta/30 focus:bg-surface transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-charcoal/50 mb-2">Note (Optional)</label>
                <input 
                  type="text"
                  value={formData.note}
                  onChange={e => setFormData({...formData, note: e.target.value})}
                  className="w-full px-5 py-4 bg-background border-2 border-transparent font-bold text-charcoal rounded-2xl focus:outline-none focus:border-terracotta/30 focus:bg-surface transition-all placeholder:text-charcoal/20"
                  placeholder="What was this for?"
                />
              </div>

              <button 
                type="submit" 
                disabled={createMutation.isPending}
                className="w-full mt-4 py-5 bg-terracotta text-surface font-bold text-lg rounded-2xl shadow-xl shadow-terracotta/20 hover:bg-terracotta/90 transition-all active:scale-95 disabled:opacity-50"
              >
                {createMutation.isPending ? 'Saving...' : 'Save Record'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
