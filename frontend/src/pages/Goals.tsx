import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { BottomSheet } from '../components/BottomSheet';
import { useGoals, useCreateGoal, useUpdateGoal, useDeleteGoal, useHouseholds, useWallets, useCreateTransaction } from '../hooks/useFinances';

export const Goals = () => {
  const [activeTab, setActiveTab] = useState<'ME' | 'FAMILY'>('ME');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [goalName, setGoalName] = useState('');
  const [goalTarget, setGoalTarget] = useState('');
  const [goalIcon, setGoalIcon] = useState('🎯');
  const [goalDate, setGoalDate] = useState('');
  const [selectedGoalId, setSelectedGoalId] = useState('');
  const [isSelectingIcon, setIsSelectingIcon] = useState(false);
  
  const [isTopupOpen, setIsTopupOpen] = useState(false);
  const [topupAmount, setTopupAmount] = useState('');
  const [topupGoal, setTopupGoal] = useState<any>(null);
  const [sourceWalletId, setSourceWalletId] = useState('');

  const { data: households } = useHouseholds();
  
  const personalHousehold = households?.find((h: any) => h.role === 'OWNER') || households?.[0];
  const joinedHousehold = households?.find((h: any) => h.role !== 'OWNER' && h.status !== 'PENDING');
  const familyHousehold = joinedHousehold || personalHousehold;

  // Use undefined for ME to fetch personal goals (household_id: null in backend)
  const currentHouseholdId = activeTab === 'ME' ? undefined : familyHousehold?.id;

  const { data: members } = useMembers(familyHousehold?.id);
  const hasFamily = !!joinedHousehold || (members && members.length > 1);

  const { data: goals } = useGoals(currentHouseholdId);
  const { data: walletsData } = useWallets(currentHouseholdId);
  const availableWallets = walletsData?.personal || [];

  const createGoal = useCreateGoal();
  const updateGoal = useUpdateGoal();
  const deleteGoal = useDeleteGoal();
  const createTransaction = useCreateTransaction();

  const EMOJI_LIST = [
    '🎯', '✈️', '🏝️', '🏠', '🚘', '💍', '👶', '🎓', '🏥', 
    '🎉', '👗', '🎮', '📱', '💻', '📷', '💰', '📈', '🛍️'
  ];

  const handleSave = async () => {
    try {
      const data = {
        household_id: currentHouseholdId,
        name: goalName,
        target_amount: parseFloat(goalTarget.replace(/\./g, '')) || 0,
        current_amount: 0,
        icon: goalIcon,
        target_date: goalDate ? new Date(goalDate).toISOString() : null
      };

      if (editMode && selectedGoalId) {
        // don't overwrite current_amount when editing
        const { current_amount, ...updateData } = data;
        await updateGoal.mutateAsync({ id: selectedGoalId, data: updateData });
      } else {
        await createGoal.mutateAsync(data);
      }
      setIsModalOpen(false);
    } catch (e) {
      window.toast.error('Gagal menyimpan tujuan');
    }
  };

  const handleDelete = async () => {
    if (!selectedGoalId) return;
    window.appConfirm('Yakin ingin menghapus tujuan ini?', async () => {
      await deleteGoal.mutateAsync(selectedGoalId);
      setIsModalOpen(false);
    });
  };

  const handleTopupSave = async () => {
    if (!topupGoal || !sourceWalletId) return;
    const addedAmount = parseFloat(topupAmount.replace(/\./g, '')) || 0;
    if (addedAmount <= 0) return;

    try {
      // 1. Update goal current_amount
      await updateGoal.mutateAsync({ 
        id: topupGoal.id, 
        data: { current_amount: topupGoal.current_amount + addedAmount } 
      });

      // 2. Create expense transaction to deduct from wallet
      const txHouseholdId = activeTab === 'ME' ? personalHousehold?.id : familyHousehold?.id;
      await createTransaction.mutateAsync({
        household_id: txHouseholdId,
        wallet_id: sourceWalletId,
        type: 'EXPENSE',
        amount: addedAmount,
        currency: 'IDR',
        date: new Date().toISOString(),
        note: `Tabungan: ${topupGoal.name}`,
        visibility: activeTab === 'FAMILY' ? 'FAMILY' : 'PRIVATE'
      });

      setIsTopupOpen(false);
      setTopupAmount('');
      setSourceWalletId('');
      window.toast.success('Tabungan berhasil ditambahkan!');
    } catch (e) {
      window.toast.error('Gagal menambah tabungan');
    }
  };

  const openAdd = () => {
    setEditMode(false);
    setSelectedGoalId('');
    setGoalName('');
    setGoalTarget('');
    setGoalDate('');
    setGoalIcon('🎯');
    setIsSelectingIcon(false);
    setIsModalOpen(true);
  };

  const openEdit = (goal: any) => {
    setEditMode(true);
    setSelectedGoalId(goal.id);
    setGoalName(goal.name);
    setGoalTarget(goal.target_amount ? goal.target_amount.toLocaleString('id-ID') : '');
    setGoalIcon(goal.icon || '🎯');
    setGoalDate(goal.target_date ? new Date(goal.target_date).toISOString().substring(0, 10) : '');
    setIsSelectingIcon(false);
    setIsModalOpen(true);
  };

  const formatShort = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'jt';
    if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'rb';
    return num.toLocaleString('id-ID');
  };

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-text-primary uppercase tracking-wide">Tujuan</h1>
        {currentHouseholdId && (
          <button 
            onClick={openAdd}
            className="w-10 h-10 bg-primary text-surface rounded-none border-2 border-text-primary flex items-center justify-center shadow-[4px_4px_0_0_#171B22] hover:-translate-y-1 hover:shadow-[4px_4px_0_0_#171B22] active:translate-y-0 active:shadow-none transition-all"
          >
            <Plus size={20} />
          </button>
        )}
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

      {(!hasFamily && activeTab === 'FAMILY') ? (
        <div className="text-center p-8 bg-surface border-4 border-text-primary rounded-none shadow-[8px_8px_0_0_#171B22] mt-4">
          <p className="text-text-primary font-black uppercase tracking-wide">Anda belum tergabung dalam keluarga.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goals?.map((g: any) => {
            const pct = g.target_amount > 0 ? (g.current_amount / g.target_amount) * 100 : 0;
            const targetDateStr = g.target_date 
              ? new Date(g.target_date).toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })
              : 'Tanpa batas waktu';

            return (
              <div key={g.id} className="bg-surface border-4 border-text-primary p-5 rounded-none shadow-[6px_6px_0_0_#171B22] hover:-translate-y-1 hover:shadow-[8px_8px_0_0_#171B22] transition-all group relative overflow-hidden flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-none bg-surface border-2 border-text-primary flex items-center justify-center text-2xl group-hover:scale-105 transition-transform shadow-[4px_4px_0_0_#171B22]">{g.icon || '🎯'}</div>
                      <div>
                        <p className="font-black text-text-primary text-lg leading-tight uppercase tracking-wide">{g.name}</p>
                        <p className="text-xs text-text-primary font-black uppercase tracking-wider mt-1">{targetDateStr}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <div className="flex justify-between items-end mb-2">
                      <p className="font-black text-text-primary text-2xl">Rp {formatShort(g.current_amount)}</p>
                      <p className="text-xs text-text-primary font-bold">dari {formatShort(g.target_amount)}</p>
                    </div>
                    <div className="w-full bg-background border-2 border-text-primary rounded-none h-4 overflow-hidden mb-2 shadow-[inset_2px_2px_0_0_#171B22]">
                      <div className="bg-accent h-full border-r-2 border-text-primary transition-all duration-500" style={{ width: `${Math.min(pct, 100)}%` }} />
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-black text-text-primary uppercase tracking-wider">
                        {pct >= 100 ? 'Tujuan Tercapai! 🎉' : `Kurang Rp ${formatShort(g.target_amount - g.current_amount)}`}
                      </p>
                      <p className="text-xs font-black text-primary">{pct.toFixed(1)}%</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-2 border-t-4 border-text-primary pt-4 flex gap-3">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setTopupGoal(g);
                      setTopupAmount('');
                      setIsTopupOpen(true);
                    }}
                    className="flex-[2] py-3 bg-primary text-surface border-4 border-text-primary shadow-[4px_4px_0_0_#171B22] font-black uppercase tracking-widest text-sm hover:-translate-y-1 hover:shadow-[6px_6px_0_0_#171B22] active:translate-y-0 active:shadow-[2px_2px_0_0_#171B22] transition-all"
                  >
                    + NABUNG
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      openEdit(g);
                    }}
                    className="flex-1 py-3 bg-surface text-text-primary border-4 border-text-primary shadow-[4px_4px_0_0_#171B22] font-black uppercase tracking-widest text-sm hover:-translate-y-1 hover:shadow-[6px_6px_0_0_#171B22] active:translate-y-0 active:shadow-[2px_2px_0_0_#171B22] transition-all flex items-center justify-center"
                    title="Pengaturan Tujuan"
                  >
                    EDIT
                  </button>
                </div>
              </div>
            );
          })}

          {(!goals || goals.length === 0) && (
            <div className="p-8 text-center bg-surface border-2 border-text-primary shadow-[4px_4px_0_0_#171B22] mt-4 rounded-none text-text-primary font-black uppercase tracking-wide">
              Belum ada tujuan yang dibuat.
            </div>
          )}
        </div>
      )}

      {/* Add / Edit Goal Bottom Sheet */}
      <BottomSheet isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editMode ? "Edit Tujuan" : "Buat Tujuan Baru"}>
        <div className="space-y-6 pt-2">
          
          <div className="flex flex-col items-center justify-center space-y-4">
            <button 
              onClick={() => setIsSelectingIcon(!isSelectingIcon)}
              className="w-20 h-20 bg-surface rounded-none flex items-center justify-center text-4xl border-2 border-text-primary shadow-[4px_4px_0_0_#171B22] hover:-translate-y-1 hover:shadow-[6px_6px_0_0_#171B22] active:translate-y-0 active:shadow-none transition-all"
            >
              {goalIcon}
            </button>
            <p className="text-xs font-black text-primary uppercase tracking-widest cursor-pointer hover:underline" onClick={() => setIsSelectingIcon(!isSelectingIcon)}>
              Ubah Ikon
            </p>
          </div>

          {isSelectingIcon && (
            <div className="p-4 bg-surface-muted rounded-none border-2 border-text-primary shadow-[4px_4px_0_0_#171B22]">
              <div className="grid grid-cols-6 gap-2 max-h-48 overflow-y-auto hide-scrollbar">
                {EMOJI_LIST.map((emoji, idx) => (
                  <button 
                    key={idx}
                    onClick={() => { setGoalIcon(emoji); setIsSelectingIcon(false); }}
                    className="w-10 h-10 flex items-center justify-center text-2xl hover:bg-surface rounded-none border border-transparent hover:border-text-primary transition-colors"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="text-xs font-black text-text-primary uppercase tracking-widest mb-2 block px-1">Nama Tujuan</label>
            <input 
              type="text" 
              placeholder="Cth: Liburan ke Bali"
              value={goalName}
              onChange={(e) => setGoalName(e.target.value)}
              className="w-full bg-surface border-2 border-text-primary rounded-none px-4 py-3 font-bold text-lg text-text-primary focus:outline-none focus:shadow-[4px_4px_0_0_#FFB43A] focus:ring-0 transition-all"
            />
          </div>

          <div>
            <label className="text-xs font-black text-text-primary uppercase tracking-widest mb-2 block px-1">Target Dana</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-primary font-black">Rp</span>
              <input 
                type="text" 
                inputMode="numeric"
                placeholder="0"
                value={goalTarget}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '');
                  setGoalTarget(val ? parseInt(val, 10).toLocaleString('id-ID') : '');
                }}
                className="w-full bg-surface border-2 border-text-primary rounded-none pl-12 pr-4 py-3 font-bold text-lg text-text-primary focus:outline-none focus:shadow-[4px_4px_0_0_#FFB43A] focus:ring-0 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-black text-text-primary uppercase tracking-widest mb-2 block px-1">Tenggat Waktu (Opsional)</label>
            <input 
              type="date"
              value={goalDate}
              onChange={(e) => setGoalDate(e.target.value)}
              className="w-full bg-surface border-2 border-text-primary rounded-none px-4 py-3 font-bold text-text-primary focus:outline-none focus:shadow-[4px_4px_0_0_#FFB43A] focus:ring-0 transition-all"
            />
          </div>

          <button 
            onClick={handleSave}
            disabled={!goalName || !goalTarget}
            className="w-full py-4 bg-primary text-surface rounded-none border-2 border-text-primary font-black text-lg uppercase tracking-wider shadow-[4px_4px_0_0_#171B22] hover:-translate-y-1 hover:shadow-[6px_6px_0_0_#171B22] active:translate-y-0 active:shadow-none disabled:opacity-50 transition-all mt-4"
          >
            {editMode ? "Simpan Perubahan" : "Simpan Tujuan"}
          </button>
          
          {editMode && (
            <button 
              onClick={handleDelete}
              className="w-full py-4 bg-error text-surface border-2 border-text-primary rounded-none font-black text-lg uppercase tracking-wider shadow-[4px_4px_0_0_#171B22] hover:-translate-y-1 hover:shadow-[6px_6px_0_0_#171B22] active:translate-y-0 active:shadow-none transition-all mt-2 flex items-center justify-center gap-2"
            >
              <Trash2 size={20} />
              Hapus Tujuan
            </button>
          )}
        </div>
      </BottomSheet>

      {/* Topup Modal */}
      <BottomSheet isOpen={isTopupOpen} onClose={() => setIsTopupOpen(false)} title="Tambah Tabungan">
        <div className="space-y-6 pt-2">
          <div>
            <label className="text-xs font-black text-text-primary uppercase tracking-widest mb-2 block px-1">Pilih Dompet Sumber</label>
            <select
              value={sourceWalletId}
              onChange={(e) => setSourceWalletId(e.target.value)}
              className="w-full bg-surface border-2 border-text-primary rounded-none px-4 py-3 font-bold text-text-primary focus:outline-none focus:shadow-[4px_4px_0_0_#FFB43A] focus:ring-0 transition-all appearance-none cursor-pointer"
            >
              <option value="" disabled>-- Pilih Dompet --</option>
              {availableWallets?.map((w: any) => (
                <option key={w.id} value={w.id}>{w.name} (Rp {w.balance?.toLocaleString('id-ID')})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-black text-text-primary uppercase tracking-widest mb-2 block px-1">Nominal Tabungan</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-text-secondary">Rp</span>
              <input 
                type="text" 
                inputMode="numeric"
                value={topupAmount}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '');
                  setTopupAmount(val ? parseInt(val, 10).toLocaleString('id-ID') : '');
                }}
                placeholder="0"
                className="w-full bg-surface border-2 border-text-primary rounded-none pl-12 pr-4 py-3 font-bold text-text-primary focus:outline-none focus:shadow-[4px_4px_0_0_#FFB43A] focus:ring-0 transition-all text-xl"
              />
            </div>
          </div>
          <button 
            onClick={handleTopupSave}
            disabled={!topupAmount || !sourceWalletId}
            className="w-full py-4 bg-primary text-surface rounded-none border-2 border-text-primary font-black text-lg uppercase tracking-wider shadow-[4px_4px_0_0_#171B22] hover:-translate-y-1 hover:shadow-[6px_6px_0_0_#171B22] active:translate-y-0 active:shadow-none disabled:opacity-50 transition-all mt-4"
          >
            Simpan Tabungan
          </button>
        </div>
      </BottomSheet>

    </div>
  );
};
