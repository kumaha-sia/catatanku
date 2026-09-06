import React from 'react';
import { User, Globe, Moon, Shield, Bell, Download, Trash2, HelpCircle, ChevronRight, Smartphone, Wallet, Tags } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export const Settings = () => {
  const logout = useAuthStore((state) => state.logout);

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      
      <h1 className="text-2xl font-bold text-text-primary mb-6">Pengaturan</h1>

      {/* Profile Section */}
      <section>
        <h2 className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-3 px-1">Profil</h2>
        <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-sm">
          <SettingsItem 
            icon={<User size={20} className="text-primary" />}
            title="Andi"
            subtitle="andi@email.com"
          />
        </div>
      </section>

      {/* Management Section */}
      <section>
        <h2 className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-3 px-1">Manajemen</h2>
        <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-sm divide-y divide-border">
          <SettingsItem 
            icon={<Wallet size={20} className="text-text-secondary" />}
            title="Daftar Dompet"
            subtitle="Atur dompet pribadi & keluarga"
          />
          <SettingsItem 
            icon={<Tags size={20} className="text-text-secondary" />}
            title="Kategori Transaksi"
            subtitle="Buat atau ubah kategori"
          />
        </div>
      </section>

      {/* Preferences Section */}
      <section>
        <h2 className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-3 px-1">Preferensi</h2>
        <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-sm divide-y divide-border">
          <SettingsItem 
            icon={<Globe size={20} className="text-text-secondary" />}
            title="Bahasa"
            value="Indonesia"
          />
          <SettingsItem 
            icon={<span className="font-serif font-bold text-lg text-text-secondary">Rp</span>}
            title="Mata Uang"
            value="IDR"
          />
          <SettingsItem 
            icon={<Moon size={20} className="text-text-secondary" />}
            title="Tema"
            value="Sistem"
          />
        </div>
      </section>

      {/* Privacy & Security Section */}
      <section>
        <h2 className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-3 px-1">Privasi & Keamanan</h2>
        <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-sm divide-y divide-border">
          <SettingsItem 
            icon={<Shield size={20} className="text-text-secondary" />}
            title="Privasi & Keamanan"
          />
          <SettingsItem 
            icon={<Smartphone size={20} className="text-text-secondary" />}
            title="Sesi Perangkat"
          />
        </div>
      </section>

      {/* Notifications Section */}
      <section>
        <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-sm">
          <SettingsItem 
            icon={<Bell size={20} className="text-text-secondary" />}
            title="Notifikasi"
          />
        </div>
      </section>

      {/* Data Section */}
      <section>
        <h2 className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-3 px-1">Data</h2>
        <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-sm divide-y divide-border">
          <SettingsItem 
            icon={<Download size={20} className="text-text-secondary" />}
            title="Ekspor Data (CSV)"
          />
          <SettingsItem 
            icon={<Trash2 size={20} className="text-error" />}
            title={<span className="text-error">Hapus Akun</span>}
            hideArrow
          />
        </div>
      </section>

      {/* About Section */}
      <section>
        <h2 className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-3 px-1">Tentang</h2>
        <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-sm">
          <SettingsItem 
            icon={<HelpCircle size={20} className="text-text-secondary" />}
            title="Bantuan & Kebijakan"
          />
        </div>
      </section>

      {/* Logout Button (Mobile Only) */}
      <div className="md:hidden pt-4">
        <button 
          onClick={logout}
          className="w-full py-4 bg-error/10 text-error font-bold rounded-xl active:scale-95 transition-transform"
        >
          Keluar (Sign Out)
        </button>
      </div>

    </div>
  );
};

const SettingsItem = ({ 
  icon, 
  title, 
  subtitle, 
  value, 
  hideArrow = false 
}: { 
  icon: React.ReactNode, 
  title: React.ReactNode, 
  subtitle?: string, 
  value?: string,
  hideArrow?: boolean
}) => (
  <button className="w-full flex items-center justify-between p-4 hover:bg-surface-muted transition-colors cursor-pointer group text-left">
    <div className="flex items-center gap-4">
      <div className="w-10 h-10 bg-surface-muted rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform shadow-sm border border-border">
        {icon}
      </div>
      <div>
        <p className="font-bold text-text-primary text-base">{title}</p>
        {subtitle && <p className="text-sm font-medium text-text-secondary mt-0.5">{subtitle}</p>}
      </div>
    </div>
    <div className="flex items-center gap-3">
      {value && <span className="text-sm font-bold text-text-secondary">{value}</span>}
      {!hideArrow && (
        <ChevronRight size={20} className="text-text-secondary/50 group-hover:text-text-primary transition-colors" />
      )}
    </div>
  </button>
);
