import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { format } from 'date-fns';
import { Plus, Trash2, Edit2 } from 'lucide-react';

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
    <div className="space-y-8">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-charcoal/60 font-medium mb-1">History</h2>
          <h1 className="font-serif text-4xl text-charcoal font-bold">Transactions</h1>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-5 py-3 bg-terracotta text-surface font-medium rounded-xl hover:bg-terracotta/90 transition-all"
        >
          <Plus size={20} />
          Add Transaction
        </button>
      </header>

      {/* Transaction List */}
      <div className="bg-surface border border-charcoal/10 rounded-2xl overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-charcoal/50">Loading transactions...</div>
        ) : transactions?.length === 0 ? (
          <div className="p-8 text-center text-charcoal/50">No transactions found for this month.</div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-charcoal/5 text-charcoal/70 text-sm font-medium">
              <tr>
                <th className="p-5 font-medium">Date</th>
                <th className="p-5 font-medium">Category</th>
                <th className="p-5 font-medium">Note</th>
                <th className="p-5 font-medium text-right">Amount</th>
                <th className="p-5 font-medium text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-charcoal/10">
              {transactions?.map((tx: any) => (
                <tr key={tx.id} className="hover:bg-charcoal/5 transition-colors">
                  <td className="p-5 text-charcoal/80 whitespace-nowrap">
                    {format(new Date(tx.date), 'dd MMM yyyy, HH:mm')}
                  </td>
                  <td className="p-5">
                    <span className="inline-flex items-center gap-2 px-3 py-1 bg-background rounded-lg text-sm font-medium border border-charcoal/10">
                      <span>{tx.category?.icon}</span>
                      {tx.category?.name}
                    </span>
                  </td>
                  <td className="p-5 text-charcoal/80">{tx.note || '-'}</td>
                  <td className={`p-5 text-right font-serif font-bold ${tx.type === 'INCOME' ? 'text-olive' : 'text-charcoal'}`}>
                    {tx.type === 'INCOME' ? '+' : '-'}{formatCurrency(tx.amount)}
                  </td>
                  <td className="p-5 text-center">
                    <button 
                      onClick={() => {
                        if(confirm('Delete this transaction?')) deleteMutation.mutate(tx.id);
                      }}
                      className="text-terracotta/70 hover:text-terracotta p-2 rounded-lg hover:bg-terracotta/10 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-charcoal/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-surface p-8 rounded-3xl w-full max-w-md shadow-2xl border border-charcoal/10">
            <h3 className="font-serif text-2xl font-bold mb-6">New Transaction</h3>
            <form onSubmit={handleSubmit} className="space-y-5">
              
              <div className="flex bg-background p-1 rounded-xl border border-charcoal/10">
                <button 
                  type="button"
                  onClick={() => setFormData({...formData, type: 'EXPENSE'})}
                  className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${formData.type === 'EXPENSE' ? 'bg-terracotta text-surface shadow' : 'text-charcoal/60 hover:text-charcoal'}`}
                >
                  Expense
                </button>
                <button 
                  type="button"
                  onClick={() => setFormData({...formData, type: 'INCOME'})}
                  className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${formData.type === 'INCOME' ? 'bg-olive text-surface shadow' : 'text-charcoal/60 hover:text-charcoal'}`}
                >
                  Income
                </button>
              </div>

              <div>
                <label className="block text-sm font-semibold text-charcoal mb-2">Amount (IDR)</label>
                <input 
                  type="number" required min="1"
                  value={formData.amount}
                  onChange={e => setFormData({...formData, amount: e.target.value})}
                  className="w-full px-4 py-3 bg-background border border-charcoal/10 rounded-xl focus:outline-none focus:border-terracotta focus:ring-1 focus:ring-terracotta"
                  placeholder="50000"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-charcoal mb-2">Category</label>
                <select 
                  required
                  value={formData.category_id}
                  onChange={e => setFormData({...formData, category_id: e.target.value})}
                  className="w-full px-4 py-3 bg-background border border-charcoal/10 rounded-xl focus:outline-none focus:border-terracotta focus:ring-1 focus:ring-terracotta"
                >
                  <option value="" disabled>Select category</option>
                  {categories?.filter((c: any) => c.type === formData.type).map((c: any) => (
                    <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-charcoal mb-2">Date & Time</label>
                <input 
                  type="datetime-local" required
                  value={formData.date}
                  onChange={e => setFormData({...formData, date: e.target.value})}
                  className="w-full px-4 py-3 bg-background border border-charcoal/10 rounded-xl focus:outline-none focus:border-terracotta focus:ring-1 focus:ring-terracotta"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-charcoal mb-2">Note (Optional)</label>
                <input 
                  type="text"
                  value={formData.note}
                  onChange={e => setFormData({...formData, note: e.target.value})}
                  className="w-full px-4 py-3 bg-background border border-charcoal/10 rounded-xl focus:outline-none focus:border-terracotta focus:ring-1 focus:ring-terracotta"
                  placeholder="Lunch with team"
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
                  disabled={createMutation.isPending}
                  className="flex-1 py-3 bg-charcoal text-surface font-bold rounded-xl hover:bg-charcoal/90 transition-colors disabled:opacity-50"
                >
                  {createMutation.isPending ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
