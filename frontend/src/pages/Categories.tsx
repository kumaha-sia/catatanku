import React, { useState } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { BottomSheet } from '../components/BottomSheet';
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from '../hooks/useFinances';
import { useAuthStore } from '../store/authStore';

export const Categories = () => {
  const [activeTab, setActiveTab] = useState<'EXPENSE' | 'INCOME'>('EXPENSE');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryIcon, setNewCategoryIcon] = useState('💰');
  const [isSelectingIcon, setIsSelectingIcon] = useState(false);

  const { data: categories } = useCategories();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  // Standard simple emoji list
  const EMOJI_LIST = [
    '💰', '💸', '🍜', '🚗', '🛒', '💡', '🎮', '💊', '🎁', 
    '📈', '🏠', '📱', '👗', '🎓', '🏥', '✈️', '🐶', '🔧'
  ];

  const handleSave = async () => {
    try {
      const data = {
        name: newCategoryName,
        type: activeTab,
        icon: newCategoryIcon,
        color: '#F3F4F6'
      };

      if (editMode && selectedCategoryId) {
        await updateCategory.mutateAsync({ id: selectedCategoryId, data });
      } else {
        await createCategory.mutateAsync(data);
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan');
    }
  };

  const handleDelete = async () => {
    if (!selectedCategoryId) return;
    if (confirm('Hapus kategori ini? Transaksi terkait akan kehilangan kategorinya.')) {
      try {
        await deleteCategory.mutateAsync(selectedCategoryId);
        setIsModalOpen(false);
      } catch (err) {
        alert('Gagal menghapus kategori');
      }
    }
  };

  const openAdd = () => {
    setEditMode(false);
    setSelectedCategoryId('');
    setNewCategoryName('');
    setIsSelectingIcon(false);
    setIsModalOpen(true);
  };

  const openEdit = (category: any) => {
    setEditMode(true);
    setSelectedCategoryId(category.id);
    setNewCategoryName(category.name);
    setNewCategoryIcon(category.icon || '💰');
    setIsSelectingIcon(false);
    setIsModalOpen(true);
  };

  const filteredCategories = categories?.filter((c: any) => c.type === activeTab) || [];

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-text-primary uppercase tracking-wide">Kategori Transaksi</h1>
        <button 
          onClick={openAdd}
          className="w-10 h-10 bg-primary text-surface rounded-none border-2 border-text-primary flex items-center justify-center shadow-[4px_4px_0_0_#171B22] hover:-translate-y-1 hover:shadow-[4px_4px_0_0_#171B22] active:translate-y-0 active:shadow-none transition-all"
        >
          <Plus size={20} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex p-1 bg-surface-muted border-2 border-text-primary shadow-[4px_4px_0_0_#171B22] rounded-none w-full sm:w-64">
        <button 
          onClick={() => setActiveTab('EXPENSE')}
          className={`flex-1 py-2 text-sm font-black uppercase tracking-wider rounded-none transition-all ${activeTab === 'EXPENSE' ? 'bg-primary text-surface border-2 border-text-primary shadow-[2px_2px_0_0_#171B22]' : 'text-text-primary hover:bg-surface-muted'}`}
        >
          Pengeluaran
        </button>
        <button 
          onClick={() => setActiveTab('INCOME')}
          className={`flex-1 py-2 text-sm font-black uppercase tracking-wider rounded-none transition-all ${activeTab === 'INCOME' ? 'bg-primary text-surface border-2 border-text-primary shadow-[2px_2px_0_0_#171B22]' : 'text-text-primary hover:bg-surface-muted'}`}
        >
          Pemasukan
        </button>
      </div>

      {/* Categories List */}
      <div className="bg-surface border-2 border-text-primary rounded-none shadow-[6px_6px_0_0_#171B22] overflow-hidden divide-y-2 divide-text-primary">
        {filteredCategories.map((c: any) => (
          <CategoryItem 
            key={c.id} 
            icon={c.icon || '💰'} 
            name={c.name} 
            colorClass="bg-surface-muted border-2 border-text-primary" 
            onEdit={() => openEdit(c)} 
          />
        ))}
        {filteredCategories.length === 0 && (
          <div className="p-8 text-center text-text-primary font-black uppercase tracking-wide">
            Belum ada kategori
          </div>
        )}
      </div>

      {/* Add / Edit Category Modal */}
      <BottomSheet isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editMode ? "Edit Kategori" : "Kategori Baru"}>
        <div className="space-y-6 pt-2">
          
          <div className="flex flex-col items-center justify-center space-y-4">
            <button 
              onClick={() => setIsSelectingIcon(!isSelectingIcon)}
              className="w-20 h-20 bg-surface-muted rounded-none flex items-center justify-center text-4xl border-2 border-text-primary shadow-[4px_4px_0_0_#171B22] hover:-translate-y-1 hover:shadow-[6px_6px_0_0_#171B22] active:translate-y-0 active:shadow-none transition-all"
            >
              {newCategoryIcon}
            </button>
            <p className="text-xs font-black text-text-primary uppercase tracking-widest cursor-pointer hover:underline" onClick={() => setIsSelectingIcon(!isSelectingIcon)}>
              Ubah Ikon
            </p>
          </div>

          {isSelectingIcon && (
            <div className="p-4 bg-surface-muted rounded-none border-2 border-text-primary shadow-[4px_4px_0_0_#171B22]">
              <div className="grid grid-cols-6 gap-2 max-h-48 overflow-y-auto hide-scrollbar">
                {EMOJI_LIST.map((emoji, idx) => (
                  <button 
                    key={idx}
                    onClick={() => { setNewCategoryIcon(emoji); setIsSelectingIcon(false); }}
                    className="w-10 h-10 flex items-center justify-center text-2xl hover:bg-surface rounded-none border border-transparent hover:border-text-primary transition-colors"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="text-xs font-black text-text-primary uppercase tracking-widest mb-2 block px-1">Nama Kategori</label>
            <input 
              type="text" 
              placeholder="Cth: Makanan & Minuman"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              className="w-full bg-surface border-2 border-text-primary rounded-none px-4 py-3 font-bold text-lg text-text-primary focus:outline-none focus:shadow-[4px_4px_0_0_#FFB43A] focus:ring-0 transition-all"
            />
          </div>

          <button 
            onClick={handleSave}
            disabled={!newCategoryName}
            className="w-full py-4 bg-primary text-surface rounded-none border-2 border-text-primary font-black text-lg uppercase tracking-wider shadow-[4px_4px_0_0_#171B22] hover:-translate-y-1 hover:shadow-[6px_6px_0_0_#171B22] active:translate-y-0 active:shadow-none disabled:opacity-50 transition-all mt-4"
          >
            {editMode ? "Simpan Perubahan" : "Simpan Kategori"}
          </button>
          
          {editMode && (
            <button 
              onClick={handleDelete}
              className="w-full py-4 bg-error text-surface border-2 border-text-primary rounded-none font-black text-lg uppercase tracking-wider shadow-[4px_4px_0_0_#171B22] hover:-translate-y-1 hover:shadow-[6px_6px_0_0_#171B22] active:translate-y-0 active:shadow-none transition-all mt-2 flex items-center justify-center gap-2"
            >
              <Trash2 size={20} />
              Hapus Kategori
            </button>
          )}
        </div>
      </BottomSheet>

    </div>
  );
};

const CategoryItem = ({ icon, name, usage, colorClass, onEdit }: { icon: string, name: string, usage?: string, colorClass: string, onEdit: () => void }) => (
  <div onClick={onEdit} className="flex items-center justify-between p-4 bg-surface hover:bg-surface-muted cursor-pointer transition-colors group">
    <div className="flex items-center gap-4">
      <div className={`w-12 h-12 rounded-none flex items-center justify-center text-2xl ${colorClass} group-hover:scale-105 transition-transform`}>
        {icon}
      </div>
      <div>
        <p className="font-black text-text-primary text-lg uppercase tracking-wide">{name}</p>
        {usage && <p className="text-xs text-text-primary font-bold">{usage}</p>}
      </div>
    </div>
    <div className="w-8 h-8 rounded-none bg-surface-muted border-2 border-text-primary flex items-center justify-center text-text-primary group-hover:bg-primary group-hover:text-surface transition-colors">
      <Edit2 size={14} />
    </div>
  </div>
);
