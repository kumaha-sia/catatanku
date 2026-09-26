import React, { useState } from 'react';
import { useAdminCategories, useCreateSystemCategory, useUpdateSystemCategory, useDeleteSystemCategory } from '../../hooks/useAdmin';
import { useConfirmStore } from '../../store/confirmStore';
import { Plus, Edit2, Trash2, Save, X } from 'lucide-react';

const EMOJI_LIST = [
  '🍔', '🛒', '🚗', '🏥', '🎮', '💡', '💧', '📱', '👕', '📚', 
  '⚽', '✈️', '🎁', '🐶', '🏠', '🎬', '☕', '💰', '💼', '📈', 
  '🏦', '💵', '💳', '🧾', '🛍️', '🛠️', '🎓', '🚌', '🍕', '🍻'
];

export const AdminCategories: React.FC = () => {
  const { data: categories, isLoading } = useAdminCategories();
  const createCat = useCreateSystemCategory();
  const updateCat = useUpdateSystemCategory();
  const deleteCat = useDeleteSystemCategory();
  const confirm = useConfirmStore(s => s.showConfirm);

  const [activeTab, setActiveTab] = useState<'EXPENSE' | 'INCOME'>('EXPENSE');
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({ name: '', icon: '🍔', type: 'EXPENSE' });
  const [isSelectingIcon, setIsSelectingIcon] = useState(false);

  const handleEdit = (cat: any) => {
    setEditingId(cat.id);
    setFormData({ name: cat.name, icon: cat.icon, type: cat.type });
    setIsSelectingIcon(false);
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
    setFormData({ name: '', icon: '🍔', type: activeTab });
    setIsSelectingIcon(false);
  };

  const handleAdd = () => {
    setFormData({ name: '', icon: activeTab === 'EXPENSE' ? '🛒' : '💰', type: activeTab });
    setIsAdding(true);
    setIsSelectingIcon(false);
  };

  const handleSave = () => {
    if (!formData.name || !formData.icon) return;
    
    if (editingId) {
      updateCat.mutate({ id: editingId, data: formData }, {
        onSuccess: () => handleCancel()
      });
    } else {
      createCat.mutate(formData, {
        onSuccess: () => handleCancel()
      });
    }
  };

  const handleDelete = (id: string, name: string) => {
    confirm(`Hapus Kategori ${name}? Ini adalah kategori sistem dasar.`, () => {
      deleteCat.mutate(id);
    });
  };

  const filteredCategories = categories?.filter((cat: any) => cat.type === activeTab) || [];

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      <header className="border-b-4 border-text-primary pb-4 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-text-primary uppercase tracking-wide">Kategori Sistem</h1>
          <p className="text-text-secondary font-bold text-sm mt-1 uppercase tracking-widest">Kategori default untuk semua pengguna baru</p>
        </div>
        {!isAdding && !editingId && (
          <button 
            onClick={handleAdd}
            className="px-4 py-2 bg-primary text-surface font-black uppercase tracking-widest border-4 border-text-primary shadow-[4px_4px_0_0_#171B22] hover:-translate-y-1 hover:shadow-[6px_6px_0_0_#171B22] transition-all flex items-center gap-2"
          >
            <Plus size={20} className="stroke-[3]" /> Tambah
          </button>
        )}
      </header>

      {/* Tabs */}
      <div className="flex border-4 border-text-primary bg-surface overflow-hidden shadow-[4px_4px_0_0_#171B22]">
        <button
          onClick={() => { setActiveTab('EXPENSE'); handleCancel(); }}
          className={`flex-1 p-4 font-black uppercase tracking-widest transition-colors ${
            activeTab === 'EXPENSE' 
              ? 'bg-text-primary text-surface' 
              : 'hover:bg-surface-muted text-text-secondary'
          }`}
        >
          Pengeluaran
        </button>
        <button
          onClick={() => { setActiveTab('INCOME'); handleCancel(); }}
          className={`flex-1 p-4 border-l-4 border-text-primary font-black uppercase tracking-widest transition-colors ${
            activeTab === 'INCOME' 
              ? 'bg-text-primary text-surface' 
              : 'hover:bg-surface-muted text-text-secondary'
          }`}
        >
          Pemasukan
        </button>
      </div>

      {(isAdding || editingId) && (
        <div className="bg-surface border-4 border-text-primary p-6 shadow-[4px_4px_0_0_#171B22] mb-6">
          <h2 className="text-lg font-black uppercase mb-4 border-b-2 border-text-primary pb-2">{editingId ? 'Edit Kategori' : 'Kategori Baru'}</h2>
          <div className="flex flex-col md:flex-row gap-4 items-end relative">
            <div className="w-full md:w-32">
              <label className="block text-xs font-black uppercase tracking-widest mb-1">Icon</label>
              <button 
                onClick={() => setIsSelectingIcon(!isSelectingIcon)}
                className="w-full p-2 border-4 border-text-primary bg-background font-black text-2xl text-center hover:bg-primary transition-colors focus:outline-none focus:shadow-[4px_4px_0_0_#A3E635]"
              >
                {formData.icon}
              </button>
              
              {isSelectingIcon && (
                <div className="absolute top-[80px] left-0 z-50 p-2 bg-surface border-4 border-text-primary shadow-[8px_8px_0_0_#171B22] w-64 md:w-80">
                  <div className="flex justify-between items-center mb-2 pb-2 border-b-2 border-text-primary">
                    <span className="font-black text-xs uppercase tracking-widest">Pilih Icon</span>
                    <button onClick={() => setIsSelectingIcon(false)} className="hover:bg-error hover:text-surface p-1 border-2 border-transparent transition-colors">
                      <X size={16} className="stroke-[3]" />
                    </button>
                  </div>
                  <div className="grid grid-cols-6 gap-2 max-h-48 overflow-y-auto">
                    {EMOJI_LIST.map((emoji, idx) => (
                      <button 
                        key={idx}
                        onClick={() => { setFormData({ ...formData, icon: emoji }); setIsSelectingIcon(false); }}
                        className="w-10 h-10 flex items-center justify-center text-xl hover:bg-primary border-2 border-transparent hover:border-text-primary transition-colors"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex-1 w-full">
              <label className="block text-xs font-black uppercase tracking-widest mb-1">Nama Kategori</label>
              <input 
                type="text" 
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full p-3 border-4 border-text-primary bg-background font-bold focus:outline-none focus:shadow-[4px_4px_0_0_#A3E635]"
                placeholder="Misal: Belanja"
                autoFocus
              />
            </div>
            
            <div className="w-full md:w-48">
              <label className="block text-xs font-black uppercase tracking-widest mb-1">Tipe (Terkunci)</label>
              <div className={`w-full p-3 border-4 border-text-primary font-black uppercase text-center ${formData.type === 'INCOME' ? 'bg-income text-text-primary' : 'bg-error text-surface'}`}>
                {formData.type === 'INCOME' ? 'Pemasukan' : 'Pengeluaran'}
              </div>
            </div>

            <div className="flex gap-2 w-full md:w-auto">
              <button onClick={handleSave} className="flex-1 md:flex-none p-3 bg-primary text-surface border-4 border-text-primary font-black hover:shadow-[4px_4px_0_0_#171B22] hover:-translate-y-1 transition-all flex items-center justify-center gap-1">
                <Save size={18} /> Simpan
              </button>
              <button onClick={handleCancel} className="flex-1 md:flex-none p-3 bg-surface border-4 border-text-primary font-black hover:shadow-[4px_4px_0_0_#171B22] hover:-translate-y-1 transition-all flex items-center justify-center gap-1">
                <X size={18} /> Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="text-center font-black animate-pulse mt-8">Memuat Data...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCategories.length === 0 ? (
            <div className="col-span-full text-center p-8 border-4 border-text-primary border-dashed text-text-secondary font-black uppercase">
              Tidak ada kategori {activeTab === 'INCOME' ? 'Pemasukan' : 'Pengeluaran'}
            </div>
          ) : (
            filteredCategories.map((cat: any) => (
              <div key={cat.id} className="bg-surface border-4 border-text-primary p-4 shadow-[4px_4px_0_0_#171B22] flex items-center justify-between group hover:bg-surface-muted transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 flex items-center justify-center text-2xl border-4 border-text-primary ${cat.type === 'INCOME' ? 'bg-income' : 'bg-accent'} group-hover:scale-110 transition-transform`}>
                    {cat.icon}
                  </div>
                  <div>
                    <h3 className="font-black text-lg uppercase tracking-wide">{cat.name}</h3>
                    <p className="text-xs font-bold text-text-secondary uppercase tracking-widest">{cat.type}</p>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <button onClick={() => handleEdit(cat)} className="p-2 border-2 border-text-primary hover:bg-primary hover:text-surface transition-colors" title="Edit">
                    <Edit2 size={16} className="stroke-[3]" />
                  </button>
                  <button onClick={() => handleDelete(cat.id, cat.name)} className="p-2 border-2 border-text-primary bg-error text-surface hover:bg-error-dark transition-colors" title="Hapus">
                    <Trash2 size={16} className="stroke-[3]" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
