import { useState } from 'react';
import { Users, Wallet, Tags, Download, HelpCircle, ChevronRight, LogOut, Info, Loader2, Target, ArrowRightLeft } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';
import { BottomSheet } from '../components/BottomSheet';
import { useHouseholds } from '../hooks/useFinances';
import { updateProfile } from '../services/apiServices';

export const Settings = () => {
  const logout = useAuthStore((state) => state.logout);
  const loginAuth = useAuthStore((state) => state.login);
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const navigate = useNavigate();
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState<'csv' | 'pdf'>('csv');
  const [isExporting, setIsExporting] = useState(false);
  const [isReminderOpen, setIsReminderOpen] = useState(false);
  const [reminderEnabled, setReminderEnabled] = useState(user?.reminder_enabled || false);
  const [reminderTime, setReminderTime] = useState(user?.reminder_time || '20:00');
  const [isSavingReminder, setIsSavingReminder] = useState(false);

  const { data: households } = useHouseholds();
  const myHouseholdId = households?.find((h: any) => h.role === 'OWNER' && h.name.includes('Household'))?.id;
  const familyHouseholdId = households?.find((h: any) => h.role !== 'OWNER' || !h.name.includes('Household'))?.id;

  const handleExport = async (householdId: string, label: string, format: 'csv' | 'pdf' = 'csv') => {
    setIsExporting(true);
    try {
      const endpoint = format === 'csv' ? '/reports/export' : '/reports/export-pdf';
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'}${endpoint}?household_id=${householdId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Export failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `finbareng_${label}_${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setIsExportOpen(false);
    } catch {
      window.toast.error('Gagal mengekspor data. Coba lagi.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleSaveReminder = async () => {
    try {
      setIsSavingReminder(true);
      const res = await updateProfile({ 
        name: user?.name || '', 
        reminder_enabled: reminderEnabled,
        reminder_time: reminderTime
      });
      if (user) {
        const updatedUser = { 
          ...user, 
          reminder_enabled: res.data.reminder_enabled,
          reminder_time: res.data.reminder_time
        };
        loginAuth(updatedUser, token || '');
      }
      setIsReminderOpen(false);
      window.toast.success('Pengaturan pengingat berhasil disimpan!');
    } catch (err) {
      window.toast.error('Gagal menyimpan pengaturan pengingat.');
    } finally {
      setIsSavingReminder(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-8">
      
      <h1 className="text-2xl font-black text-text-primary uppercase tracking-wide">Pengaturan</h1>

      {/* Profile Card — Hero */}
      <div 
        onClick={() => navigate('/profile')}
        className="bg-primary border-4 border-text-primary p-5 shadow-[6px_6px_0_0_#171B22] flex items-center gap-4 cursor-pointer hover:-translate-y-1 hover:shadow-[8px_8px_0_0_#171B22] active:translate-y-0 active:shadow-none transition-all group"
      >
        <div className="w-16 h-16 bg-surface border-4 border-text-primary flex items-center justify-center text-3xl font-black text-text-primary shadow-[3px_3px_0_0_#171B22] flex-shrink-0 group-hover:-translate-y-0.5 transition-transform overflow-hidden">
          {user?.avatarUrl 
            ? <img src={`${import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:5000'}${user.avatarUrl}`} alt="Avatar" className="w-full h-full object-cover" />
            : (user?.name ? user.name.charAt(0).toUpperCase() : 'U')
          }
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-black text-surface uppercase tracking-wider text-lg truncate">{user?.name || 'User'}</p>
          <p className="text-xs font-bold text-surface/80 truncate mt-0.5">{user?.email || ''}</p>
        </div>
        <ChevronRight size={24} className="text-surface stroke-[3] flex-shrink-0 group-hover:translate-x-1 transition-transform" />
      </div>

      {/* Manajemen */}
      <section>
        <SectionHeader label="Manajemen" />
        <div className="bg-surface border-4 border-text-primary shadow-[4px_4px_0_0_#171B22] divide-y-4 divide-text-primary">
          <SettingsItem 
            icon={<Users size={18} className="stroke-[3]" />}
            title="Keluarga"
            subtitle="Kelola anggota keluarga"
            onClick={() => navigate('/family')}
            iconBg="bg-accent"
          />
          <SettingsItem 
            icon={<Wallet size={18} className="stroke-[3]" />}
            title="Dompet"
            subtitle="Atur dompet pribadi & keluarga"
            onClick={() => navigate('/wallets')}
            iconBg="bg-[#89CFF0]"
          />
          <SettingsItem 
            icon={<Tags size={18} className="stroke-[3]" />}
            title="Kategori"
            subtitle="Buat atau ubah kategori"
            onClick={() => navigate('/categories')}
            iconBg="bg-income"
          />
          {/* Tambahkan Goals di sini khusus untuk kemudahan akses di Mobile */}
          <SettingsItem 
            icon={<Target size={18} className="stroke-[3]" />}
            title="Tujuan Finansial (Goals)"
            subtitle="Kelola target tabungan Anda"
            onClick={() => navigate('/goals')}
            iconBg="bg-primary text-surface"
          />
          <SettingsItem 
            icon={<ArrowRightLeft size={18} className="stroke-[3]" />}
            title="Hutang Piutang"
            subtitle="Catat & kelola utang dan piutang"
            onClick={() => navigate('/debts')}
            iconBg="bg-error text-surface"
          />
        </div>
      </section>

      {/* Data */}
      <section>
        <SectionHeader label="Data" />
        <div className="bg-surface border-4 border-text-primary shadow-[4px_4px_0_0_#171B22] divide-y-4 divide-text-primary">
          <SettingsItem 
            icon={<Download size={18} className="stroke-[3]" />}
            title="Ekspor Data"
            subtitle="Unduh riwayat transaksi (CSV & PDF)"
            onClick={() => setIsExportOpen(true)}
            iconBg="bg-[#A3E635]"
          />
        </div>
      </section>

      {/* Notifikasi */}
      <section>
        <SectionHeader label="Notifikasi" />
        <div className="bg-surface border-4 border-text-primary shadow-[4px_4px_0_0_#171B22] divide-y-4 divide-text-primary">
          <SettingsItem 
            icon={<Info size={18} className="stroke-[3]" />}
            title="Pengingat Harian"
            subtitle={user?.reminder_enabled ? `Aktif pada ${user?.reminder_time}` : "Tidak Aktif"}
            onClick={() => setIsReminderOpen(true)}
            iconBg={user?.reminder_enabled ? "bg-[#A3E635]" : "bg-surface-muted"}
          />
        </div>
      </section>

      {/* Tentang */}
      <section>
        <SectionHeader label="Tentang" />
        <div className="bg-surface border-4 border-text-primary shadow-[4px_4px_0_0_#171B22] divide-y-4 divide-text-primary">
          <SettingsItem 
            icon={<HelpCircle size={18} className="stroke-[3]" />}
            title="Bantuan & Kebijakan"
            onClick={() => setIsAboutOpen(true)}
            iconBg="bg-surface"
          />
          <SettingsItem 
            icon={<Info size={18} className="stroke-[3]" />}
            title="Versi Aplikasi"
            value="v1.0.0"
            hideArrow
            iconBg="bg-surface"
          />
        </div>
      </section>

      {/* Zona Bahaya */}
      <section>
        <SectionHeader label="Zona Bahaya" danger />
        <div className="space-y-4">
          <button 
            onClick={() => setIsLogoutOpen(true)}
            className="w-full flex items-center gap-4 p-4 bg-surface border-4 border-text-primary shadow-[4px_4px_0_0_#171B22] hover:-translate-y-1 hover:shadow-[6px_6px_0_0_#171B22] active:translate-y-0 active:shadow-none transition-all text-left group"
          >
            <div className="w-10 h-10 bg-accent flex items-center justify-center border-2 border-text-primary shadow-[2px_2px_0_0_#171B22] flex-shrink-0 group-hover:-translate-y-0.5 transition-transform">
              <LogOut size={18} className="text-text-primary stroke-[3]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-black uppercase text-text-primary text-sm tracking-wider">Keluar</p>
              <p className="text-[10px] font-bold text-text-secondary uppercase tracking-wider mt-0.5">Sign out dari akun ini</p>
            </div>
            <ChevronRight size={18} className="text-text-primary stroke-[3] flex-shrink-0 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </section>

      {/* Logout Confirmation */}
      <BottomSheet isOpen={isLogoutOpen} onClose={() => setIsLogoutOpen(false)} title="Keluar">
        <div className="space-y-6 pt-4">
          <div className="bg-accent border-4 border-text-primary p-4 shadow-[4px_4px_0_0_#171B22]">
            <p className="text-sm font-bold text-text-primary leading-relaxed">
              Anda akan keluar dari akun <span className="font-black">{user?.name || 'User'}</span>. Data Anda tetap tersimpan dan dapat diakses kembali saat login.
            </p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => setIsLogoutOpen(false)}
              className="flex-1 py-4 bg-surface text-text-primary border-4 border-text-primary font-black text-sm uppercase tracking-wider shadow-[4px_4px_0_0_#171B22] hover:-translate-y-1 hover:shadow-[6px_6px_0_0_#171B22] active:translate-y-0 active:shadow-none transition-all"
            >
              Batal
            </button>
            <button 
              onClick={logout}
              className="flex-1 py-4 bg-error text-surface border-4 border-text-primary font-black text-sm uppercase tracking-wider shadow-[4px_4px_0_0_#171B22] hover:-translate-y-1 hover:shadow-[6px_6px_0_0_#171B22] active:translate-y-0 active:shadow-none transition-all"
            >
              Ya, Keluar
            </button>
          </div>
        </div>
      </BottomSheet>

      {/* Tentang / Bantuan BottomSheet */}
      <BottomSheet isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} title="Bantuan & Kebijakan">
        <div className="space-y-4 pt-4">
          <div className="bg-primary border-4 border-text-primary p-5 shadow-[4px_4px_0_0_#171B22]">
            <p className="text-2xl font-black text-surface uppercase tracking-wider">FinBareng</p>
            <p className="text-xs font-bold text-surface/80 mt-1">Aplikasi Pencatatan Keuangan Keluarga</p>
            <p className="text-[10px] font-black text-surface/60 uppercase tracking-widest mt-3">Versi 1.0.0 — Build 2026.09</p>
          </div>

          <div className="bg-surface border-4 border-text-primary shadow-[4px_4px_0_0_#171B22] divide-y-4 divide-text-primary">
            <div className="p-4">
              <p className="text-xs font-black text-text-primary uppercase tracking-widest mb-2">Fitur Utama</p>
              <ul className="space-y-2 text-sm font-bold text-text-secondary">
                <li className="flex items-start gap-2"><span className="text-primary font-black">▸</span> Catat pemasukan & pengeluaran</li>
                <li className="flex items-start gap-2"><span className="text-primary font-black">▸</span> Kelola dompet pribadi & keluarga</li>
                <li className="flex items-start gap-2"><span className="text-primary font-black">▸</span> Anggaran bulanan per kategori</li>
                <li className="flex items-start gap-2"><span className="text-primary font-black">▸</span> Laporan & visualisasi keuangan</li>
                <li className="flex items-start gap-2"><span className="text-primary font-black">▸</span> Privasi transaksi dalam keluarga</li>
              </ul>
            </div>
            <div className="p-4">
              <p className="text-xs font-black text-text-primary uppercase tracking-widest mb-2">Kontak & Dukungan</p>
              <p className="text-sm font-bold text-text-secondary">Email: support@finbareng.id</p>
            </div>
            <div className="p-4">
              <p className="text-xs font-black text-text-primary uppercase tracking-widest mb-2">Legal</p>
              <div className="flex gap-3">
                <span className="text-xs font-black text-primary uppercase tracking-wider underline cursor-pointer">Kebijakan Privasi</span>
                <span className="text-xs font-black text-primary uppercase tracking-wider underline cursor-pointer">Syarat & Ketentuan</span>
              </div>
            </div>
          </div>

          <p className="text-center text-[10px] font-black text-text-secondary uppercase tracking-widest py-2">
            © 2026 FinBareng. All rights reserved.
          </p>
        </div>
      </BottomSheet>

      {/* Reminder BottomSheet */}
      <BottomSheet isOpen={isReminderOpen} onClose={() => setIsReminderOpen(false)} title="Pengingat Harian">
        <div className="space-y-6 pt-4">
          <div className="bg-accent border-4 border-text-primary p-4 shadow-[4px_4px_0_0_#171B22]">
            <p className="text-sm font-bold text-text-primary leading-relaxed">
              Dapatkan pesan pengingat otomatis jika Anda <span className="font-black">belum mencatat transaksi</span> pada hari itu.
            </p>
            {!user?.whatsapp && (
              <p className="text-xs font-black text-text-secondary mt-2">
                * Nomor WhatsApp belum diatur. Pengingat akan dikirim ke Notifikasi Aplikasi (Lonceng).
              </p>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-black text-text-primary uppercase tracking-wider">Aktifkan Pengingat</span>
              <button 
                onClick={() => setReminderEnabled(!reminderEnabled)}
                className={`w-14 h-8 border-4 border-text-primary relative transition-colors ${
                  reminderEnabled ? 'bg-primary' : 'bg-surface-muted'
                }`}
              >
                <div className={`absolute top-0.5 w-5 h-5 bg-text-primary transition-transform ${
                  reminderEnabled ? 'translate-x-7' : 'translate-x-1'
                }`} />
              </button>
            </div>
            
            {reminderEnabled && (
              <div>
                <label className="text-xs font-black text-text-primary uppercase tracking-widest mb-2 block">Jam Pengingat</label>
                <input 
                  type="time" 
                  value={reminderTime}
                  onChange={(e) => setReminderTime(e.target.value)}
                  className="w-full bg-surface border-4 border-text-primary p-3 font-black text-lg text-text-primary focus:outline-none focus:shadow-[4px_4px_0_0_#171B22] transition-shadow"
                />
              </div>
            )}
          </div>

          <button 
            onClick={handleSaveReminder}
            disabled={isSavingReminder}
            className="w-full py-4 bg-primary text-surface border-4 border-text-primary font-black text-sm uppercase tracking-wider shadow-[4px_4px_0_0_#171B22] hover:-translate-y-1 hover:shadow-[6px_6px_0_0_#171B22] active:translate-y-0 active:shadow-none transition-all disabled:opacity-50 disabled:translate-y-0"
          >
            {isSavingReminder ? 'Menyimpan...' : 'Simpan Pengaturan'}
          </button>
        </div>
      </BottomSheet>

      {/* Export Data BottomSheet */}
      <BottomSheet isOpen={isExportOpen} onClose={() => setIsExportOpen(false)} title="Ekspor Data">
        <div className="space-y-6 pt-4">
          
          <div>
            <p className="text-xs font-black text-text-primary uppercase tracking-widest mb-3">1. Format File</p>
            <div className="flex gap-3">
              <button
                onClick={() => setExportFormat('csv')}
                className={`flex-1 py-3 text-sm font-black uppercase tracking-wider transition-all border-4 ${
                  exportFormat === 'csv' 
                    ? 'bg-text-primary text-surface border-text-primary shadow-[4px_4px_0_0_#A3E635]' 
                    : 'bg-surface text-text-secondary border-text-secondary hover:border-text-primary hover:text-text-primary'
                }`}
              >
                CSV
              </button>
              <button
                onClick={() => setExportFormat('pdf')}
                className={`flex-1 py-3 text-sm font-black uppercase tracking-wider transition-all border-4 ${
                  exportFormat === 'pdf' 
                    ? 'bg-text-primary text-surface border-text-primary shadow-[4px_4px_0_0_#FFA6A6]' 
                    : 'bg-surface text-text-secondary border-text-secondary hover:border-text-primary hover:text-text-primary'
                }`}
              >
                PDF
              </button>
            </div>
            <p className="text-[10px] font-bold text-text-secondary mt-2">
              {exportFormat === 'csv' 
                ? '*Cocok dibuka di Excel, Google Sheets, atau aplikasi Spreadsheet lainnya.' 
                : '*Format dokumen yang rapi dan siap untuk dicetak.'}
            </p>
          </div>

          <div>
            <p className="text-xs font-black text-text-primary uppercase tracking-widest mb-3">2. Sumber Data</p>
            <div className="space-y-3">
              <button 
                onClick={() => myHouseholdId && handleExport(myHouseholdId, 'pribadi', exportFormat)}
                disabled={!myHouseholdId || isExporting}
                className="w-full flex items-center justify-between p-4 bg-primary text-surface border-4 border-text-primary shadow-[4px_4px_0_0_#171B22] hover:-translate-y-1 hover:shadow-[6px_6px_0_0_#171B22] active:translate-y-0 active:shadow-none disabled:opacity-50 disabled:translate-y-0 transition-all text-left group"
              >
                <div>
                  <p className="font-black uppercase text-sm tracking-wider">Unduh Data Pribadi</p>
                  <p className="text-[10px] font-bold text-surface/80 uppercase tracking-wider mt-0.5">Semua transaksi di dompet pribadi</p>
                </div>
                {isExporting ? <Loader2 size={24} className="animate-spin stroke-[3]" /> : <Download size={20} className="stroke-[3]" />}
              </button>

              <button 
                onClick={() => familyHouseholdId && handleExport(familyHouseholdId, 'keluarga', exportFormat)}
                disabled={!familyHouseholdId || isExporting}
                className="w-full flex items-center justify-between p-4 bg-accent border-4 border-text-primary shadow-[4px_4px_0_0_#171B22] hover:-translate-y-1 hover:shadow-[6px_6px_0_0_#171B22] active:translate-y-0 active:shadow-none disabled:opacity-50 disabled:translate-y-0 transition-all text-left group"
              >
                <div>
                  <p className="font-black text-text-primary uppercase text-sm tracking-wider">Unduh Data Keluarga</p>
                  <p className="text-[10px] font-bold text-text-secondary uppercase tracking-wider mt-0.5">Semua transaksi di dompet keluarga</p>
                </div>
                {isExporting ? <Loader2 size={24} className="animate-spin text-text-primary stroke-[3]" /> : <Download size={20} className="text-text-primary stroke-[3]" />}
              </button>
            </div>
          </div>

        </div>
      </BottomSheet>

    </div>
  );
};

// --- Subcomponents ---

const SectionHeader = ({ label, danger = false }: { label: string, danger?: boolean }) => (
  <div className="flex items-center gap-3 mb-3">
    <div className={`h-1 w-6 ${danger ? 'bg-error' : 'bg-text-primary'}`} />
    <h2 className={`text-[10px] font-black uppercase tracking-[0.2em] ${danger ? 'text-error' : 'text-text-secondary'}`}>{label}</h2>
  </div>
);

const SettingsItem = ({ 
  icon, 
  title, 
  subtitle, 
  value, 
  hideArrow = false,
  onClick,
  iconBg = "bg-surface",
}: { 
  icon: React.ReactNode, 
  title: string, 
  subtitle?: string, 
  value?: string,
  hideArrow?: boolean,
  onClick?: () => void,
  iconBg?: string,
}) => (
  <button 
    onClick={onClick}
    className="w-full flex items-center gap-3 p-3 sm:p-4 bg-surface hover:bg-text-primary/5 transition-colors cursor-pointer group text-left"
  >
    <div className={`w-10 h-10 ${iconBg} flex-shrink-0 flex items-center justify-center group-hover:-translate-y-0.5 transition-transform border-2 border-text-primary shadow-[2px_2px_0_0_#171B22] text-text-primary`}>
      {icon}
    </div>
    <div className="flex-1 min-w-0">
      <p className="font-black uppercase text-text-primary text-sm tracking-wider truncate">{title}</p>
      {subtitle && <p className="text-[10px] font-bold text-text-secondary uppercase tracking-wider mt-0.5 truncate">{subtitle}</p>}
    </div>
    <div className="flex items-center gap-2 flex-shrink-0">
      {value && <span className="text-[10px] font-black text-text-secondary uppercase tracking-wider">{value}</span>}
      {!hideArrow && (
        <ChevronRight size={18} className="text-text-primary group-hover:translate-x-1 transition-transform stroke-[3]" />
      )}
    </div>
  </button>
);
