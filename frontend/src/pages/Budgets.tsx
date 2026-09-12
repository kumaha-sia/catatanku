import React, { useState } from 'react';
import { Plus, AlertTriangle, Trash2 } from 'lucide-react';
import { BottomSheet } from '../components/BottomSheet';
import { useBudgets, useCreateBudget, useUpdateBudget, useDeleteBudget, useCategories, useHouseholds } from '../hooks/useFinances';

export const Budgets = () => {
  const [activeTab, setActiveTab] = useState<'ME' | 'FAMILY'>('ME');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [budgetAmount, setBudgetAmount] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedBudgetId, setSelectedBudgetId] = useState('');

  const now = new Date();
  const [currentMonth, setCurrentMonth] = useState(now.getMonth() + 1);
  const [currentYear, setCurrentYear] = useState(now.getFullYear());

  const { data: households } = useHouseholds();
  const myHouseholdId = households?.find((h: any) => h.role === 'OWNER' && h.name.includes('Household'))?.id;
  const familyHouseholdId = households?.find((h: any) => h.role !== 'OWNER' || !h.name.includes('Household'))?.id;

  const currentHouseholdId = activeTab === 'ME' ? myHouseholdId : familyHouseholdId;

  const { data: budgets } = useBudgets(currentHouseholdId, currentMonth, currentYear);
  const { data: categories } = useCategories();
  
  const createBudget = useCreateBudget();
  const updateBudget = useUpdateBudget();
  const deleteBudget = useDeleteBudget();

  const handleSave = async () => {
    try {
      const data = {
        household_id: currentHouseholdId,
        category_id: selectedCategory,
        period: 'MONTHLY',
        period_month: currentMonth,
        period_year: currentYear,
        amount: parseFloat(budgetAmount.replace(/\./g, '')) || 0,
        alert_threshold: 80
      };

      if (editMode && selectedBudgetId) {
        await updateBudget.mutateAsync({ id: selectedBudgetId, data });
      } else {
        await createBudget.mutateAsync(data);
      }
      setIsModalOpen(false);
    } catch (e) {
      alert('Gagal menyimpan anggaran');
    }
  };

  const handleDelete = async () => {
    if (!selectedBudgetId) return;
    if (confirm('Yakin ingin menghapus anggaran ini?')) {
      await deleteBudget.mutateAsync(selectedBudgetId);
      setIsModalOpen(false);
    }
  };

  const openAdd = () => {
    setEditMode(false);
    setBudgetAmount('');
    setSelectedCategory('');
    setSelectedBudgetId('');
    setIsModalOpen(true);
  };

  const openEdit = (budget: any) => {
    setEditMode(true);
    setSelectedBudgetId(budget.id);
    setSelectedCategory(budget.category_id);
    setBudgetAmount(budget.amount.toString());
    setIsModalOpen(true);
  };

  // Calculate totals
  const totalBudget = budgets?.reduce((acc: number, b: any) => acc + b.amount, 0) || 0;
  const totalSpent = budgets?.reduce((acc: number, b: any) => acc + b.spent, 0) || 0;
  const totalPct = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
  const isOverBudget = totalSpent > totalBudget;

  const expenseCategories = categories?.filter((c: any) => c.type === 'EXPENSE') || [];

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      
      {/* Header & Date Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-black text-text-primary uppercase tracking-wide">Anggaran</h1>
        
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
          
          <div className="px-4 py-2 bg-surface border-2 border-text-primary shadow-[4px_4px_0_0_#171B22] font-black uppercase tracking-wider text-sm min-w-[140px] text-center">
            {new Date(currentYear, currentMonth - 1).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
          </div>

          <button 
            onClick={() => {
              if (currentMonth === 12) { setCurrentMonth(1); setCurrentYear(y => y + 1); }
              else setCurrentMonth(m => m + 1);
            }}
            className="w-10 h-10 flex items-center justify-center bg-surface border-2 border-text-primary shadow-[4px_4px_0_0_#171B22] hover:-translate-y-1 hover:shadow-[4px_4px_0_0_#171B22] transition-all active:translate-y-0 active:shadow-none"
          >
            &gt;
          </button>

          {currentHouseholdId && (
            <button 
              onClick={openAdd}
              className="ml-2 w-10 h-10 bg-primary text-surface border-2 border-text-primary flex items-center justify-center shadow-[4px_4px_0_0_#171B22] hover:-translate-y-1 hover:shadow-[4px_4px_0_0_#171B22] active:translate-y-0 active:shadow-none transition-all"
            >
              <Plus size={20} />
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex p-1 bg-surface-muted border-2 border-text-primary shadow-[4px_4px_0_0_#171B22] rounded-none w-full sm:w-64">
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

      {/* Summary Block */}
      <div className="bg-surface border-4 border-text-primary p-6 shadow-[6px_6px_0_0_#171B22]">
        <div className="flex justify-between items-end mb-4">
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-text-secondary mb-1">Total Terpakai</p>
            <p className="text-3xl font-black text-text-primary">Rp {totalSpent.toLocaleString('id-ID')}</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-black uppercase tracking-widest text-text-secondary mb-1">Dari Total</p>
            <p className="text-xl font-bold text-text-primary">Rp {totalBudget.toLocaleString('id-ID')}</p>
          </div>
        </div>
        <div className="h-4 w-full bg-surface-muted border-2 border-text-primary relative overflow-hidden">
          <div 
            className={`absolute top-0 left-0 h-full ${isOverBudget ? 'bg-error' : 'bg-primary'} transition-all`} 
            style={{ width: `${Math.min(totalPct, 100)}%` }}
          />
        </div>
        {isOverBudget && (
          <p className="text-error font-bold mt-2 text-sm uppercase tracking-wide">! Melebihi Total Anggaran</p>
        )}
      </div>

      {/* Budget List */}
      <div className="space-y-4">
        {budgets?.length === 0 ? (
          <div className="p-8 text-center border-4 border-text-primary bg-surface shadow-[6px_6px_0_0_#171B22]">
            <p className="text-text-secondary font-bold text-lg mb-4">Belum ada anggaran bulan ini.</p>
            {currentHouseholdId && (
              <button 
                onClick={openAdd}
                className="px-6 py-3 bg-primary text-surface font-black uppercase tracking-wider border-2 border-text-primary shadow-[4px_4px_0_0_#171B22] hover:-translate-y-1 hover:shadow-[4px_4px_0_0_#171B22] active:translate-y-0 active:shadow-none transition-all"
              >
                Buat Anggaran
              </button>
            )}
          </div>
        ) : (
          budgets?.map((budget: any) => {
            const cat = expenseCategories.find((c: any) => c.id === budget.category_id);
            const pct = budget.amount > 0 ? (budget.spent / budget.amount) * 100 : 0;
            const over = budget.spent > budget.amount;
            return (
              <div 
                key={budget.id}
                onClick={() => openEdit(budget)}
                className="bg-surface border-4 border-text-primary p-4 shadow-[4px_4px_0_0_#171B22] hover:-translate-y-1 hover:shadow-[6px_6px_0_0_#171B22] transition-all cursor-pointer"
              >
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-none bg-surface-muted border-2 border-text-primary flex items-center justify-center text-lg shadow-[2px_2px_0_0_#171B22]">
                      {cat?.icon || '💰'}
                    </div>
                    <div>
                      <h3 className="font-black text-text-primary uppercase tracking-wide">{cat?.name || 'Kategori'}</h3>
                      <p className="text-sm font-bold text-text-secondary">Sisa: Rp {(budget.amount - budget.spent).toLocaleString('id-ID')}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-text-primary">Rp {budget.spent.toLocaleString('id-ID')}</p>
                    <p className="text-xs font-bold text-text-secondary">dari Rp {budget.amount.toLocaleString('id-ID')}</p>
                  </div>
                </div>
                <div className="h-3 w-full bg-surface-muted border-2 border-text-primary relative overflow-hidden">
                  <div 
                    className={`absolute top-0 left-0 h-full ${over ? 'bg-error' : 'bg-primary'} transition-all`} 
                    style={{ width: `${Math.min(pct, 100)}%` }}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add / Edit Budget Modal */}
      <BottomSheet isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editMode ? "Edit Anggaran" : "Anggaran Baru"}>
        <div className="space-y-6 pt-2">
          
          <div>
            <label className="text-xs font-black text-text-primary uppercase tracking-widest mb-2 block px-1">Kategori</label>
            <select 
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-surface border-2 border-text-primary rounded-none px-4 py-3 font-bold text-text-primary focus:outline-none focus:shadow-[4px_4px_0_0_#FFB43A] focus:ring-0 appearance-none"
            >
              <option value="" disabled>Pilih Kategori</option>
              {expenseCategories.map((c: any) => (
                <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-black text-text-primary uppercase tracking-widest mb-2 block px-1">Jumlah Anggaran</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-primary font-black">Rp</span>
              <input 
                type="number" 
                placeholder="0"
                value={budgetAmount}
                onChange={(e) => setBudgetAmount(e.target.value)}
                className="w-full bg-surface border-2 border-text-primary rounded-none pl-12 pr-4 py-3 font-bold text-lg text-text-primary focus:outline-none focus:shadow-[4px_4px_0_0_#FFB43A] focus:ring-0 transition-all"
              />
            </div>
          </div>

          <button 
            onClick={handleSave}
            disabled={!selectedCategory || !budgetAmount}
            className="w-full py-4 bg-primary text-surface rounded-none border-2 border-text-primary font-black text-lg uppercase tracking-wider shadow-[4px_4px_0_0_#171B22] hover:-translate-y-1 hover:shadow-[6px_6px_0_0_#171B22] active:translate-y-0 active:shadow-none disabled:opacity-50 disabled:shadow-none transition-all mt-4"
          >
            {editMode ? "Simpan Perubahan" : "Simpan Anggaran"}
          </button>

          {editMode && (
            <button 
              onClick={handleDelete}
              className="w-full py-4 bg-error text-surface border-2 border-text-primary rounded-none font-black text-lg uppercase tracking-wider shadow-[4px_4px_0_0_#171B22] hover:-translate-y-1 hover:shadow-[6px_6px_0_0_#171B22] active:translate-y-0 active:shadow-none transition-all mt-2 flex items-center justify-center gap-2"
            >
              <Trash2 size={20} />
              Hapus Anggaran
            </button>
          )}
        </div>
      </BottomSheet>

    </div>
  );
};

