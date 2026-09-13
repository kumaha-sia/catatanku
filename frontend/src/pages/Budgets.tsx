import React, { useState } from 'react';
import { Plus, AlertTriangle, Trash2 } from 'lucide-react';
import { BottomSheet } from '../components/BottomSheet';
import { useBudgets, useCreateBudget, useUpdateBudget, useDeleteBudget, useCategories, useHouseholds, useRolloverBudgets } from '../hooks/useFinances';

export const Budgets = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [budgetAmount, setBudgetAmount] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedBudgetId, setSelectedBudgetId] = useState('');

  const now = new Date();
  const [currentMonth, setCurrentMonth] = useState(now.getMonth() + 1);
  const [currentYear, setCurrentYear] = useState(now.getFullYear());

  const { data: households } = useHouseholds();
  const personalHousehold = households?.find((h: any) => h.role === 'OWNER') || households?.[0];
  const activeHouseholdId = personalHousehold?.id;

  const { data: budgets } = useBudgets(activeHouseholdId, currentMonth, currentYear);
  const { data: categories } = useCategories();
  
  const createBudget = useCreateBudget();
  const updateBudget = useUpdateBudget();
  const deleteBudget = useDeleteBudget();
  const rolloverBudgets = useRolloverBudgets();

  const handleRollover = async () => {
    if (!activeHouseholdId) return;
    try {
      await rolloverBudgets.mutateAsync({
        household_id: activeHouseholdId,
        month: currentMonth,
        year: currentYear
      });
      window.toast.success('Berhasil menyalin anggaran dari bulan lalu!');
    } catch (error: any) {
      window.toast.error(error.response?.data?.message || 'Gagal menyalin anggaran');
    }
  };

  const handleSave = async () => {
    try {
      const data = {
        household_id: activeHouseholdId,
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
      window.toast.error('Gagal menyimpan anggaran');
    }
  };

  const handleDelete = async () => {
    if (!selectedBudgetId) return;
    window.appConfirm('Yakin ingin menghapus anggaran ini?', async () => {
      await deleteBudget.mutateAsync(selectedBudgetId);
      setIsModalOpen(false);
    });
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
        
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button 
            onClick={() => {
              if (currentMonth === 1) { setCurrentMonth(12); setCurrentYear(y => y - 1); }
              else setCurrentMonth(m => m - 1);
            }}
            className="w-10 h-10 flex-shrink-0 flex items-center justify-center bg-surface border-2 border-text-primary shadow-[4px_4px_0_0_#171B22] hover:-translate-y-1 hover:shadow-[4px_4px_0_0_#171B22] transition-all active:translate-y-0 active:shadow-none"
          >
            &lt;
          </button>
          
          <div className="flex-1 sm:flex-none px-2 sm:px-4 py-2 bg-surface border-2 border-text-primary shadow-[4px_4px_0_0_#171B22] font-black uppercase tracking-wider text-xs sm:text-sm min-w-[120px] text-center truncate">
            {new Date(currentYear, currentMonth - 1).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
          </div>

          <button 
            onClick={() => {
              if (currentMonth === 12) { setCurrentMonth(1); setCurrentYear(y => y + 1); }
              else setCurrentMonth(m => m + 1);
            }}
            className="w-10 h-10 flex-shrink-0 flex items-center justify-center bg-surface border-2 border-text-primary shadow-[4px_4px_0_0_#171B22] hover:-translate-y-1 hover:shadow-[4px_4px_0_0_#171B22] transition-all active:translate-y-0 active:shadow-none"
          >
            &gt;
          </button>

          {activeHouseholdId && (
            <button 
              onClick={openAdd}
              className="ml-1 w-10 h-10 flex-shrink-0 bg-primary text-surface border-2 border-text-primary flex items-center justify-center shadow-[4px_4px_0_0_#171B22] hover:-translate-y-1 hover:shadow-[4px_4px_0_0_#171B22] active:translate-y-0 active:shadow-none transition-all"
            >
              <Plus size={20} />
            </button>
          )}
        </div>
      </div>



      {/* Summary Block */}
      <div className="bg-surface border-4 border-text-primary p-5 md:p-6 shadow-[6px_6px_0_0_#171B22]">
        <div className="flex flex-col gap-3 md:gap-4 mb-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between border-b-2 border-text-primary pb-3 gap-1">
            <p className="text-xs font-black uppercase tracking-widest text-text-secondary">Total Terpakai</p>
            <p className="text-2xl md:text-3xl font-black text-text-primary truncate">Rp {totalSpent.toLocaleString('id-ID')}</p>
          </div>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-1">
            <p className="text-xs font-black uppercase tracking-widest text-text-secondary">Dari Total Anggaran</p>
            <p className="text-lg md:text-xl font-black text-text-primary truncate">Rp {totalBudget.toLocaleString('id-ID')}</p>
          </div>
        </div>
        <div className="h-6 w-full bg-surface border-4 border-text-primary relative overflow-hidden">
          <div 
            className={`absolute top-0 left-0 h-full ${isOverBudget ? 'bg-[#FFA6A6]' : 'bg-[#A3E635]'} ${totalPct > 0 ? 'border-r-4 border-text-primary' : ''} transition-all`} 
            style={{ width: `${Math.min(totalPct, 100)}%` }}
          />
        </div>
        {isOverBudget && (
          <div className="mt-4 bg-error text-surface font-black text-[10px] md:text-xs uppercase tracking-wider py-1.5 px-3 border-2 border-text-primary inline-block shadow-[2px_2px_0_0_#171B22]">
            ⚠️ Melebihi Total Anggaran
          </div>
        )}
      </div>

      {/* Budget List */}
      <div className="space-y-4">
        {budgets?.length === 0 ? (
          <div className="p-8 text-center border-4 border-text-primary bg-surface shadow-[6px_6px_0_0_#171B22]">
            <p className="text-text-primary font-black uppercase tracking-widest text-sm mb-6">Belum ada anggaran bulan ini.</p>
            {activeHouseholdId && (
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button 
                  onClick={handleRollover}
                  disabled={rolloverBudgets.isPending}
                  className="w-full sm:w-auto px-6 py-3 bg-[#A3E635] text-text-primary font-black uppercase tracking-wider border-4 border-text-primary shadow-[4px_4px_0_0_#171B22] hover:-translate-y-1 hover:shadow-[6px_6px_0_0_#171B22] active:translate-y-0 active:shadow-none disabled:opacity-50 transition-all"
                >
                  {rolloverBudgets.isPending ? 'Menyalin...' : 'Salin dari Bulan Lalu'}
                </button>
                <button 
                  onClick={openAdd}
                  className="w-full sm:w-auto px-6 py-3 bg-primary text-surface font-black uppercase tracking-wider border-4 border-text-primary shadow-[4px_4px_0_0_#171B22] hover:-translate-y-1 hover:shadow-[6px_6px_0_0_#171B22] active:translate-y-0 active:shadow-none transition-all"
                >
                  Buat Baru
                </button>
              </div>
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
                className="bg-surface border-4 border-text-primary p-4 shadow-[4px_4px_0_0_#171B22] hover:-translate-y-1 hover:shadow-[6px_6px_0_0_#171B22] transition-all cursor-pointer group"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3 flex-1 min-w-0 pr-4">
                    <div className="w-12 h-12 flex-shrink-0 rounded-none bg-accent border-2 border-text-primary flex items-center justify-center text-xl shadow-[2px_2px_0_0_#171B22] group-hover:-translate-y-0.5 transition-transform">
                      {cat?.icon || '💰'}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-black text-text-primary uppercase tracking-wide truncate">{cat?.name || 'Kategori'}</h3>
                      <p className="text-[10px] font-black uppercase tracking-wider text-text-secondary mt-0.5 truncate">{pct.toFixed(0)}% Terpakai</p>
                    </div>
                  </div>
                  
                  <div className="text-right flex-shrink-0">
                    <p className="text-[10px] font-black uppercase tracking-widest text-text-secondary mb-0.5">Sisa Anggaran</p>
                    <p className={`font-black text-lg leading-none ${over ? 'text-expense' : 'text-text-primary'}`}>
                      {over ? '-' : ''}Rp {Math.abs(budget.amount - budget.spent).toLocaleString('id-ID')}
                    </p>
                  </div>
                </div>

                <div className="h-4 w-full bg-surface border-2 border-text-primary relative overflow-hidden mb-2">
                  <div 
                    className={`absolute top-0 left-0 h-full ${over ? 'bg-[#FFA6A6]' : 'bg-[#A3E635]'} ${pct > 0 ? 'border-r-2 border-text-primary' : ''} transition-all`} 
                    style={{ width: `${Math.min(pct, 100)}%` }}
                  />
                </div>
                
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-text-secondary">
                  <span className="truncate pr-2">Terpakai: Rp {budget.spent.toLocaleString('id-ID')}</span>
                  <span className="truncate pl-2 text-right">Total: Rp {budget.amount.toLocaleString('id-ID')}</span>
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
            <div className="relative">
              <select 
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full bg-surface border-4 border-text-primary rounded-none px-4 py-3 font-bold text-text-primary focus:outline-none focus:shadow-[4px_4px_0_0_#FFB43A] focus:ring-0 appearance-none"
              >
                <option value="" disabled>Pilih Kategori</option>
                {expenseCategories.map((c: any) => (
                  <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-text-primary border-l-4 border-text-primary">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
              </div>
            </div>
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
                className="w-full bg-surface border-4 border-text-primary rounded-none pl-12 pr-4 py-3 font-bold text-lg text-text-primary focus:outline-none focus:shadow-[4px_4px_0_0_#FFB43A] focus:ring-0 transition-all"
              />
            </div>
          </div>

          <button 
            onClick={handleSave}
            disabled={!selectedCategory || !budgetAmount}
            className="w-full py-4 bg-primary text-surface rounded-none border-4 border-text-primary font-black text-lg uppercase tracking-wider shadow-[4px_4px_0_0_#171B22] hover:-translate-y-1 hover:shadow-[6px_6px_0_0_#171B22] active:translate-y-0 active:shadow-none disabled:opacity-50 disabled:shadow-none transition-all mt-4"
          >
            {editMode ? "Simpan Perubahan" : "Simpan Anggaran"}
          </button>

          {editMode && (
            <button 
              onClick={handleDelete}
              className="w-full py-4 bg-error text-surface border-4 border-text-primary rounded-none font-black text-lg uppercase tracking-wider shadow-[4px_4px_0_0_#171B22] hover:-translate-y-1 hover:shadow-[6px_6px_0_0_#171B22] active:translate-y-0 active:shadow-none transition-all mt-2 flex items-center justify-center gap-2"
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

