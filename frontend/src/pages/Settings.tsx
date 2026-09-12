import React from 'react';
import { User, Users, Globe, Moon, Shield, Bell, Download, Trash2, HelpCircle, ChevronRight, Smartphone, Wallet, Tags } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';

export const Settings = () => {
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();

  return (
    <div className="space-y-8 animate-fade-in pb-8">
      
      <h1 className="text-3xl font-black text-text-primary uppercase tracking-wide mb-6">Pengaturan</h1>

      {/* Profile Section */}
      <section>
        <h2 className="text-sm font-black text-text-primary uppercase tracking-widest mb-3 border-b-2 border-text-primary pb-2 inline-block">Profil</h2>
        <div className="bg-surface border-4 border-text-primary rounded-none overflow-hidden shadow-[4px_4px_0_0_#171B22] mt-2">
          <SettingsItem 
            icon={<User size={24} className="text-text-primary stroke-[3]" />}
            title={user?.name || 'User'}
            subtitle={user?.email || ''}
            onClick={() => navigate('/profile')}
            iconBg="bg-primary"
          />
        </div>
      </section>

      {/* Management Section */}
      <section>
        <h2 className="text-sm font-black text-text-primary uppercase tracking-widest mb-3 border-b-2 border-text-primary pb-2 inline-block">Manajemen</h2>
        <div className="bg-surface border-4 border-text-primary rounded-none overflow-hidden shadow-[4px_4px_0_0_#171B22] mt-2 divide-y-2 divide-text-primary">
          <SettingsItem 
            icon={<Users size={20} className="text-text-primary stroke-[3]" />}
            title="Keluarga"
            subtitle="Kelola anggota keluarga"
            onClick={() => navigate('/family')}
            iconBg="bg-accent"
          />
          <SettingsItem 
            icon={<Wallet size={20} className="text-text-primary stroke-[3]" />}
            title="Daftar Dompet"
            subtitle="Atur dompet pribadi & keluarga"
            onClick={() => navigate('/wallets')}
            iconBg="bg-[#89CFF0]"
          />
          <SettingsItem 
            icon={<Tags size={20} className="text-text-primary stroke-[3]" />}
            title="Kategori Transaksi"
            subtitle="Buat atau ubah kategori"
            onClick={() => navigate('/categories')}
            iconBg="bg-income"
          />
        </div>
      </section>

      {/* Preferences Section */}
      <section>
        <h2 className="text-sm font-black text-text-primary uppercase tracking-widest mb-3 border-b-2 border-text-primary pb-2 inline-block">Preferensi</h2>
        <div className="bg-surface border-4 border-text-primary rounded-none overflow-hidden shadow-[4px_4px_0_0_#171B22] mt-2 divide-y-2 divide-text-primary">
          <SettingsItem 
            icon={<Globe size={20} className="text-text-primary stroke-[3]" />}
            title="Bahasa"
            value="Indonesia"
            iconBg="bg-surface"
          />
          <SettingsItem 
            icon={<span className="font-serif font-black text-lg text-text-primary">Rp</span>}
            title="Mata Uang"
            value="IDR"
            iconBg="bg-surface"
          />
          <SettingsItem 
            icon={<Moon size={20} className="text-text-primary stroke-[3]" />}
            title="Tema"
            value="Sistem"
            iconBg="bg-surface"
          />
        </div>
      </section>

      {/* Privacy & Security Section */}
      <section>
        <h2 className="text-sm font-black text-text-primary uppercase tracking-widest mb-3 border-b-2 border-text-primary pb-2 inline-block">Privasi & Keamanan</h2>
        <div className="bg-surface border-4 border-text-primary rounded-none overflow-hidden shadow-[4px_4px_0_0_#171B22] mt-2 divide-y-2 divide-text-primary">
          <SettingsItem 
            icon={<Shield size={20} className="text-text-primary stroke-[3]" />}
            title="Privasi & Keamanan"
            iconBg="bg-surface"
          />
          <SettingsItem 
            icon={<Smartphone size={20} className="text-text-primary stroke-[3]" />}
            title="Sesi Perangkat"
            iconBg="bg-surface"
          />
        </div>
      </section>

      {/* Notifications Section */}
      <section>
        <div className="bg-surface border-4 border-text-primary rounded-none overflow-hidden shadow-[4px_4px_0_0_#171B22]">
          <SettingsItem 
            icon={<Bell size={20} className="text-text-primary stroke-[3]" />}
            title="Notifikasi"
            iconBg="bg-surface"
          />
        </div>
      </section>

      {/* Data Section */}
      <section>
        <h2 className="text-sm font-black text-text-primary uppercase tracking-widest mb-3 border-b-2 border-text-primary pb-2 inline-block">Data</h2>
        <div className="bg-surface border-4 border-text-primary rounded-none overflow-hidden shadow-[4px_4px_0_0_#171B22] mt-2 divide-y-2 divide-text-primary">
          <SettingsItem 
            icon={<Download size={20} className="text-text-primary stroke-[3]" />}
            title="Ekspor Data (CSV)"
            iconBg="bg-surface"
          />
          <SettingsItem 
            icon={<Trash2 size={20} className="text-surface stroke-[3]" />}
            title="Hapus Akun"
            titleColor="text-error"
            hideArrow
            iconBg="bg-error"
          />
        </div>
      </section>

      {/* About Section */}
      <section>
        <h2 className="text-sm font-black text-text-primary uppercase tracking-widest mb-3 border-b-2 border-text-primary pb-2 inline-block">Tentang</h2>
        <div className="bg-surface border-4 border-text-primary rounded-none overflow-hidden shadow-[4px_4px_0_0_#171B22] mt-2">
          <SettingsItem 
            icon={<HelpCircle size={20} className="text-text-primary stroke-[3]" />}
            title="Bantuan & Kebijakan"
            iconBg="bg-surface"
          />
        </div>
      </section>

      {/* Logout Button (Mobile Only) */}
      <div className="md:hidden pt-8">
        <button 
          onClick={logout}
          className="w-full py-4 bg-error text-text-primary border-4 border-text-primary rounded-none font-black text-lg uppercase tracking-wider shadow-[4px_4px_0_0_#171B22] hover:-translate-y-1 hover:shadow-[6px_6px_0_0_#171B22] active:translate-y-0 active:shadow-none transition-all"
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
  hideArrow = false,
  onClick,
  iconBg = "bg-surface-muted",
  titleColor = "text-text-primary"
}: { 
  icon: React.ReactNode, 
  title: string, 
  subtitle?: string, 
  value?: string,
  hideArrow?: boolean,
  onClick?: () => void,
  iconBg?: string,
  titleColor?: string
}) => (
  <button 
    onClick={onClick}
    className="w-full flex items-center justify-between p-4 bg-surface hover:bg-text-primary/5 transition-colors cursor-pointer group text-left"
  >
    <div className="flex items-center gap-4">
      <div className={`w-12 h-12 ${iconBg} rounded-none flex items-center justify-center group-hover:-translate-y-1 group-hover:shadow-[2px_2px_0_0_#171B22] transition-transform border-2 border-text-primary`}>
        {icon}
      </div>
      <div>
        <p className={`font-black uppercase ${titleColor} text-base`}>{title}</p>
        {subtitle && <p className="text-sm font-bold text-text-primary mt-0.5">{subtitle}</p>}
      </div>
    </div>
    <div className="flex items-center gap-3">
      {value && <span className="text-sm font-black text-text-primary">{value}</span>}
      {!hideArrow && (
        <ChevronRight size={24} className="text-text-primary group-hover:translate-x-1 transition-transform stroke-[3]" />
      )}
    </div>
  </button>
);
