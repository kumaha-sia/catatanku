import React, { useState } from 'react';
import { Camera, Mail, User, Shield, CheckCircle2, Image as ImageIcon, Trash2, KeyRound } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { BottomSheet } from '../components/BottomSheet';

export const Profile = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('Andi');
  const [email, setEmail] = useState('andi@email.com');
  const [isSaved, setIsSaved] = useState(false);

  const [isAvatarOpen, setIsAvatarOpen] = useState(false);
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);

  const handleSave = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-8 max-w-xl mx-auto">
      
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => navigate('/settings')}
          className="w-10 h-10 flex items-center justify-center bg-surface border border-border rounded-xl text-text-secondary hover:text-text-primary transition-colors"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <h1 className="text-2xl font-bold text-text-primary">Profil & Akun</h1>
      </div>

      {/* Avatar Section */}
      <div className="flex flex-col items-center justify-center p-6 bg-surface border border-border rounded-3xl shadow-sm mb-6">
        <div 
          onClick={() => setIsAvatarOpen(true)}
          className="relative group cursor-pointer"
        >
          <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center text-primary text-3xl font-bold border-4 border-surface shadow-md">
            A
          </div>
          <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Camera size={24} className="text-white" />
          </div>
          <div className="absolute bottom-0 right-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center border-2 border-surface shadow-sm text-surface">
            <Camera size={14} />
          </div>
        </div>
        <p 
          onClick={() => setIsAvatarOpen(true)}
          className="text-sm font-bold text-primary mt-4 cursor-pointer hover:underline"
        >
          Ganti Foto Profil
        </p>
      </div>

      {/* Form Section */}
      <div className="space-y-5">
        <div>
          <label className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-2 block px-1">Nama Lengkap</label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" size={18} />
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-surface border border-border rounded-xl pl-11 pr-4 py-3.5 font-bold text-text-primary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-2 block px-1">Email</label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" size={18} />
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-surface-muted border border-border rounded-xl pl-11 pr-4 py-3.5 font-bold text-text-secondary cursor-not-allowed"
              disabled
            />
          </div>
          <p className="text-[10px] font-bold text-text-secondary mt-2 px-1">Email tidak dapat diubah karena terhubung dengan fitur keamanan Keluarga.</p>
        </div>
      </div>

      {/* Security Quick Link */}
      <div className="mt-8">
        <button 
          onClick={() => setIsPasswordOpen(true)}
          className="w-full flex items-center justify-between p-4 bg-surface border border-border rounded-2xl hover:bg-surface-muted transition-colors text-left group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-surface-muted rounded-xl flex items-center justify-center border border-border">
              <Shield size={18} className="text-text-secondary" />
            </div>
            <div>
              <p className="font-bold text-text-primary">Ubah Password</p>
              <p className="text-xs font-medium text-text-secondary mt-0.5">Terakhir diubah 3 bulan lalu</p>
            </div>
          </div>
          <svg className="text-text-secondary/50 group-hover:text-text-primary transition-colors" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
        </button>
      </div>

      {/* Save Button */}
      <div className="pt-6">
        <button 
          onClick={handleSave}
          className={`w-full py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2 ${
            isSaved 
              ? 'bg-income text-surface shadow-lg shadow-income/20' 
              : 'bg-primary text-surface shadow-lg shadow-primary/20 hover:bg-primary/90'
          }`}
        >
          {isSaved ? (
            <>
              <CheckCircle2 size={20} />
              Tersimpan
            </>
          ) : (
            'Simpan Perubahan'
          )}
        </button>
      </div>

      {/* Avatar Bottom Sheet */}
      <BottomSheet isOpen={isAvatarOpen} onClose={() => setIsAvatarOpen(false)} title="Foto Profil">
        <div className="space-y-3 pt-2">
          <button className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-surface-muted transition-colors text-left">
            <div className="w-10 h-10 bg-surface-muted rounded-full flex items-center justify-center border border-border text-text-secondary">
              <Camera size={20} />
            </div>
            <p className="font-bold text-text-primary text-base">Ambil Foto</p>
          </button>
          
          <button className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-surface-muted transition-colors text-left">
            <div className="w-10 h-10 bg-surface-muted rounded-full flex items-center justify-center border border-border text-text-secondary">
              <ImageIcon size={20} />
            </div>
            <p className="font-bold text-text-primary text-base">Pilih dari Galeri</p>
          </button>

          <button className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-error/10 transition-colors text-left group">
            <div className="w-10 h-10 bg-error/10 rounded-full flex items-center justify-center border border-error/20 text-error group-hover:bg-error group-hover:text-surface transition-colors">
              <Trash2 size={20} />
            </div>
            <p className="font-bold text-error text-base">Hapus Foto</p>
          </button>
        </div>
      </BottomSheet>

      {/* Password Bottom Sheet */}
      <BottomSheet isOpen={isPasswordOpen} onClose={() => setIsPasswordOpen(false)} title="Ubah Password">
        <div className="space-y-6 pt-2">
          
          <div>
            <label className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-2 block px-1">Password Saat Ini</label>
            <div className="relative">
              <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" size={18} />
              <input 
                type="password" 
                placeholder="Masukkan password lama"
                className="w-full bg-surface border border-border rounded-xl pl-11 pr-4 py-3.5 font-bold text-text-primary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              />
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-border">
            <div>
              <label className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-2 block px-1">Password Baru</label>
              <div className="relative">
                <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" size={18} />
                <input 
                  type="password" 
                  placeholder="Minimal 8 karakter"
                  className="w-full bg-surface border border-border rounded-xl pl-11 pr-4 py-3.5 font-bold text-text-primary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-2 block px-1">Konfirmasi Password Baru</label>
              <div className="relative">
                <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" size={18} />
                <input 
                  type="password" 
                  placeholder="Ketik ulang password baru"
                  className="w-full bg-surface border border-border rounded-xl pl-11 pr-4 py-3.5 font-bold text-text-primary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                />
              </div>
            </div>
          </div>

          <button 
            onClick={() => setIsPasswordOpen(false)}
            className="w-full py-4 bg-primary text-surface rounded-xl font-bold text-lg shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all mt-4"
          >
            Perbarui Password
          </button>
        </div>
      </BottomSheet>

    </div>
  );
};
