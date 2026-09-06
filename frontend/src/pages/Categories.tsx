import React, { useState } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { BottomSheet } from '../components/BottomSheet';

export const Categories = () => {
  const [activeTab, setActiveTab] = useState<'EXPENSE' | 'INCOME'>('EXPENSE');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryIcon, setNewCategoryIcon] = useState('📦');
  const [isSelectingIcon, setIsSelectingIcon] = useState(false);

  const EMOJI_LIST = [
    '🍜', '🍔', '☕', '🚗', '🛵', '✈️', '🛒', '🛍️', '🎁', 
    '💡', '💧', '📱', '🏥', '💊', '🎓', '📚', '🎮', '🎬', 
    '⚽', '💪', '🐶', '🐱', '🏠', '🔧', '👔', '👗', '💼', 
    '💰', '📈', '💸', '🏦', '💳', '📦', '🔥', '✨', '❤️'
  ];

  const handleSave = () => {
    setIsAddOpen(false);
    setNewCategoryName('');
    setIsSelectingIcon(false);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text-primary">Kategori Transaksi</h1>
        <button 
          onClick={() => { setIsAddOpen(true); setIsSelectingIcon(false); }}
          className="w-10 h-10 bg-primary text-surface rounded-full flex items-center justify-center shadow-md shadow-primary/20 hover:bg-primary/90 transition-all"
        >
          <Plus size={20} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex p-1 bg-surface-muted rounded-xl w-full sm:w-64">
        <button 
          onClick={() => setActiveTab('EXPENSE')}
          className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors ${activeTab === 'EXPENSE' ? 'bg-surface text-text-primary shadow-sm' : 'text-text-secondary'}`}
        >
          Pengeluaran
        </button>
        <button 
          onClick={() => setActiveTab('INCOME')}
          className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors ${activeTab === 'INCOME' ? 'bg-surface text-text-primary shadow-sm' : 'text-text-secondary'}`}
        >
          Pemasukan
        </button>
      </div>

      {/* Categories List */}
      <div className="bg-surface border border-border rounded-3xl overflow-hidden shadow-sm divide-y divide-border">
        
        {activeTab === 'EXPENSE' ? (
          <>
            <CategoryItem icon="🍜" name="Makanan & Minuman" usage="142 transaksi" colorClass="bg-orange-100" />
            <CategoryItem icon="🚗" name="Transportasi" usage="85 transaksi" colorClass="bg-blue-100" />
            <CategoryItem icon="🛒" name="Belanja" usage="43 transaksi" colorClass="bg-accent/20 text-accent" />
            <CategoryItem icon="💡" name="Tagihan & Utilitas" usage="12 transaksi" colorClass="bg-pink-100" />
            <CategoryItem icon="🎮" name="Hiburan" usage="28 transaksi" colorClass="bg-purple-100" />
            <CategoryItem icon="🏥" name="Kesehatan" usage="5 transaksi" colorClass="bg-error/20" />
          </>
        ) : (
          <>
            <CategoryItem icon="💼" name="Gaji" usage="12 transaksi" colorClass="bg-primary/20" />
            <CategoryItem icon="💰" name="Bonus" usage="3 transaksi" colorClass="bg-warning/20" />
            <CategoryItem icon="📈" name="Investasi" usage="8 transaksi" colorClass="bg-blue-100" />
            <CategoryItem icon="🎁" name="Hadiah" usage="15 transaksi" colorClass="bg-pink-100" />
          </>
        )}

      </div>

      {/* Add Category Bottom Sheet */}
      <BottomSheet isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Tambah Kategori">
        <div className="space-y-6 pt-2">
          
          {isSelectingIcon ? (
            <div className="animate-fade-in">
              <div className="flex items-center justify-between mb-4">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-widest px-1">Pilih Ikon</label>
                <button onClick={() => setIsSelectingIcon(false)} className="text-xs font-bold text-primary">Tutup</button>
              </div>
              <div className="grid grid-cols-6 gap-3 max-h-48 overflow-y-auto pb-4 hide-scrollbar">
                {EMOJI_LIST.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => {
                      setNewCategoryIcon(emoji);
                      setIsSelectingIcon(false);
                    }}
                    className={`text-2xl p-2 rounded-xl transition-all ${newCategoryIcon === emoji ? 'bg-primary/20 border-primary border-2 shadow-sm' : 'bg-surface-muted border-transparent border-2 hover:bg-border'}`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-4 justify-center mb-6 animate-fade-in">
              <button 
                onClick={() => setIsSelectingIcon(true)}
                className="w-20 h-20 bg-surface-muted rounded-full flex items-center justify-center text-4xl shadow-inner hover:bg-border transition-colors border border-border"
              >
                {newCategoryIcon}
              </button>
              <div 
                onClick={() => setIsSelectingIcon(true)}
                className="text-xs font-bold text-primary uppercase tracking-widest cursor-pointer hover:underline"
              >
                Ubah Ikon
              </div>
            </div>
          )}

          <div>
            <label className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-2 block px-1">Nama Kategori</label>
            <input 
              type="text" 
              placeholder="Contoh: Belanja Bulanan"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              className="w-full bg-surface border border-border rounded-xl px-4 py-3 font-semibold text-text-primary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-2 block px-1">Jenis Kategori</label>
            <div className="flex p-1 bg-surface-muted rounded-xl">
              <button className="flex-1 py-2 text-sm font-semibold rounded-lg transition-colors bg-surface text-text-primary shadow-sm border border-border/50">
                Pengeluaran
              </button>
              <button className="flex-1 py-2 text-sm font-semibold rounded-lg transition-colors text-text-secondary">
                Pemasukan
              </button>
            </div>
          </div>

          <button 
            onClick={handleSave}
            disabled={!newCategoryName}
            className="w-full py-4 bg-primary text-surface rounded-xl font-bold text-lg shadow-lg shadow-primary/20 hover:bg-primary/90 disabled:opacity-50 disabled:shadow-none transition-all mt-4"
          >
            Simpan Kategori
          </button>
        </div>
      </BottomSheet>

    </div>
  );
};

const CategoryItem = ({ icon, name, usage, colorClass }: { icon: React.ReactNode, name: string, usage: string, colorClass: string }) => (
  <div className="flex items-center justify-between p-5 hover:bg-surface-muted transition-colors group">
    <div className="flex items-center gap-4">
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-sm border border-border/50 group-hover:scale-105 transition-transform ${colorClass}`}>
        {icon}
      </div>
      <div>
        <p className="font-bold text-text-primary text-lg">{name}</p>
        <p className="text-sm font-semibold text-text-secondary mt-0.5">{usage}</p>
      </div>
    </div>
    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
      <button className="w-10 h-10 rounded-full bg-surface border border-border flex items-center justify-center text-text-secondary hover:text-primary hover:border-primary transition-colors">
        <Edit2 size={18} />
      </button>
      <button className="w-10 h-10 rounded-full bg-surface border border-border flex items-center justify-center text-text-secondary hover:text-error hover:border-error hover:bg-error/10 transition-colors">
        <Trash2 size={18} />
      </button>
    </div>
  </div>
);
