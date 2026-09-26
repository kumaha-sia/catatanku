import React, { useState, useEffect } from 'react';
import { useAdminSettings, useUpdateAdminSettings } from '../../hooks/useAdmin';
import { Save, BrainCircuit, RefreshCw, ShieldCheck, MessageCircle } from 'lucide-react';

export const AdminSettings: React.FC = () => {
  const { data: settingsData, isLoading } = useAdminSettings();
  const updateSettings = useUpdateAdminSettings();

  const [activeTab, setActiveTab] = useState<'AI' | 'WHATSAPP' | 'SECURITY'>('AI');

  // AI State
  const [aiBaseUrl, setAiBaseUrl] = useState('');
  const [aiApiKey, setAiApiKey] = useState('');
  const [aiModel, setAiModel] = useState('');

  // WA State
  const [waEndpoint, setWaEndpoint] = useState('');
  const [waApiKey, setWaApiKey] = useState('');
  const [waSessionId, setWaSessionId] = useState('');

  useEffect(() => {
    if (settingsData) {
      const getVal = (key: string) => settingsData.find((s: any) => s.key === key)?.value || '';
      
      setAiBaseUrl(getVal('AI_BASE_URL'));
      setAiApiKey(getVal('AI_API_KEY'));
      setAiModel(getVal('AI_MODEL') || 'gpt-4o'); 
      
      setWaEndpoint(getVal('WA_ENDPOINT'));
      setWaApiKey(getVal('WA_API_KEY'));
      setWaSessionId(getVal('WA_SESSION_ID'));
    }
  }, [settingsData]);

  const handleSaveAI = () => {
    updateSettings.mutate([
      { key: 'AI_BASE_URL', value: aiBaseUrl },
      { key: 'AI_API_KEY', value: aiApiKey },
      { key: 'AI_MODEL', value: aiModel },
    ]);
  };

  const handleSaveWA = () => {
    updateSettings.mutate([
      { key: 'WA_ENDPOINT', value: waEndpoint },
      { key: 'WA_API_KEY', value: waApiKey },
      { key: 'WA_SESSION_ID', value: waSessionId },
    ]);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      <header className="border-b-4 border-text-primary pb-4">
        <h1 className="text-2xl font-black text-text-primary uppercase tracking-wide">Pengaturan Sistem</h1>
        <p className="text-text-secondary font-bold text-sm mt-1 uppercase tracking-widest">Kelola konfigurasi platform</p>
      </header>

      {/* NavTabs */}
      <div className="flex flex-wrap gap-2 mb-6 border-b-4 border-text-primary pb-4">
        <button
          onClick={() => setActiveTab('AI')}
          className={`flex items-center gap-2 px-6 py-3 font-black uppercase text-sm border-4 border-text-primary shadow-[4px_4px_0_0_#171B22] transition-all
            ${activeTab === 'AI' ? 'bg-primary text-surface -translate-y-1' : 'bg-surface text-text-primary hover:-translate-y-1 hover:bg-surface-muted'}
          `}
        >
          <BrainCircuit size={18} className="stroke-[3]" />
          Integrasi AI
        </button>
        <button
          onClick={() => setActiveTab('WHATSAPP')}
          className={`flex items-center gap-2 px-6 py-3 font-black uppercase text-sm border-4 border-text-primary shadow-[4px_4px_0_0_#171B22] transition-all
            ${activeTab === 'WHATSAPP' ? 'bg-[#25D366] text-surface -translate-y-1' : 'bg-surface text-text-primary hover:-translate-y-1 hover:bg-surface-muted'}
          `}
        >
          <MessageCircle size={18} className="stroke-[3]" />
          Integrasi WhatsApp
        </button>
        <button
          onClick={() => setActiveTab('SECURITY')}
          className={`flex items-center gap-2 px-6 py-3 font-black uppercase text-sm border-4 border-text-primary shadow-[4px_4px_0_0_#171B22] transition-all
            ${activeTab === 'SECURITY' ? 'bg-danger text-surface -translate-y-1' : 'bg-surface text-text-primary hover:-translate-y-1 hover:bg-surface-muted'}
          `}
        >
          <ShieldCheck size={18} className="stroke-[3]" />
          Keamanan
        </button>
      </div>

      {isLoading ? (
        <div className="bg-surface border-4 border-text-primary p-8 font-black animate-pulse flex items-center gap-2">
          <RefreshCw className="animate-spin" /> Memuat Pengaturan...
        </div>
      ) : (
        <div className="w-full">
          {activeTab === 'AI' && (
            <div className="bg-surface border-4 border-text-primary p-6 shadow-[8px_8px_0_0_#171B22] animate-fade-in">
              <div className="flex items-center gap-2 mb-6 border-b-4 border-text-primary pb-2">
                <BrainCircuit size={28} className="stroke-[3] text-primary" />
                <h2 className="text-xl font-black uppercase">Konfigurasi Vision AI</h2>
              </div>
              
              <p className="text-sm font-bold text-text-secondary mb-6">
                Atur *endpoint* OpenAI-compatible untuk fitur pemindai struk pintar.
              </p>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-black uppercase text-text-primary mb-2">Base URL</label>
                  <input
                    type="text"
                    value={aiBaseUrl}
                    onChange={e => setAiBaseUrl(e.target.value)}
                    placeholder="https://api.openai.com/v1"
                    className="w-full bg-background border-4 border-text-primary p-3 font-bold text-text-primary outline-none focus:bg-surface-muted transition-colors"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-black uppercase text-text-primary mb-2">API Key</label>
                  <input
                    type="password"
                    value={aiApiKey}
                    onChange={e => setAiApiKey(e.target.value)}
                    placeholder="sk-..."
                    className="w-full bg-background border-4 border-text-primary p-3 font-bold text-text-primary outline-none focus:bg-surface-muted transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-black uppercase text-text-primary mb-2">Model Name</label>
                  <input
                    type="text"
                    value={aiModel}
                    onChange={e => setAiModel(e.target.value)}
                    placeholder="gpt-4-vision-preview"
                    className="w-full bg-background border-4 border-text-primary p-3 font-bold text-text-primary outline-none focus:bg-surface-muted transition-colors"
                  />
                </div>
              </div>

              <button
                onClick={handleSaveAI}
                disabled={updateSettings.isPending}
                className="mt-8 w-full bg-primary text-surface border-4 border-text-primary p-4 font-black uppercase tracking-widest hover:-translate-y-1 hover:shadow-[4px_4px_0_0_#171B22] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {updateSettings.isPending ? <RefreshCw className="animate-spin" size={20} /> : <Save size={20} />}
                {updateSettings.isPending ? 'Menyimpan...' : 'Simpan Pengaturan AI'}
              </button>
            </div>
          )}

          {activeTab === 'WHATSAPP' && (
            <div className="bg-surface border-4 border-text-primary p-6 shadow-[8px_8px_0_0_#171B22] animate-fade-in">
              <div className="flex items-center gap-2 mb-6 border-b-4 border-text-primary pb-2">
                <MessageCircle size={28} className="stroke-[3] text-[#25D366]" />
                <h2 className="text-xl font-black uppercase">Konfigurasi OpenWA (WhatsApp)</h2>
              </div>
              
              <p className="text-sm font-bold text-text-secondary mb-6">
                Hubungkan platform ke layanan WhatsApp Bot (OpenWA) untuk fitur pengingat dan notifikasi transaksi keluarga.
              </p>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-black uppercase text-text-primary mb-2">Endpoint URL</label>
                  <input
                    type="text"
                    value={waEndpoint}
                    onChange={e => setWaEndpoint(e.target.value)}
                    placeholder="http://localhost:3000 atau https://wa.domain.com"
                    className="w-full bg-background border-4 border-text-primary p-3 font-bold text-text-primary outline-none focus:bg-surface-muted transition-colors"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-black uppercase text-text-primary mb-2">API Key / Token</label>
                  <input
                    type="password"
                    value={waApiKey}
                    onChange={e => setWaApiKey(e.target.value)}
                    placeholder="Masukkan API Key OpenWA Anda"
                    className="w-full bg-background border-4 border-text-primary p-3 font-bold text-text-primary outline-none focus:bg-surface-muted transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-black uppercase text-text-primary mb-2">Session ID / Nomor Aktif</label>
                  <input
                    type="text"
                    value={waSessionId}
                    onChange={e => setWaSessionId(e.target.value)}
                    placeholder="Misal: default atau 62812345678"
                    className="w-full bg-background border-4 border-text-primary p-3 font-bold text-text-primary outline-none focus:bg-surface-muted transition-colors"
                  />
                </div>
              </div>

              <button
                onClick={handleSaveWA}
                disabled={updateSettings.isPending}
                className="mt-8 w-full bg-[#25D366] text-surface border-4 border-text-primary p-4 font-black uppercase tracking-widest hover:-translate-y-1 hover:shadow-[4px_4px_0_0_#171B22] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {updateSettings.isPending ? <RefreshCw className="animate-spin" size={20} /> : <Save size={20} />}
                {updateSettings.isPending ? 'Menyimpan...' : 'Simpan Pengaturan WhatsApp'}
              </button>
            </div>
          )}

          {activeTab === 'SECURITY' && (
            <div className="bg-surface border-4 border-text-primary p-6 shadow-[8px_8px_0_0_#171B22] animate-fade-in flex flex-col items-center justify-center py-16 text-center">
              <ShieldCheck size={48} className="stroke-[3] text-text-secondary mb-4 opacity-50" />
              <h2 className="text-xl font-black uppercase mb-2">Kendali Keamanan</h2>
              <p className="text-text-secondary font-bold max-w-md">Fitur *Maintenance Mode* dan kontrol pendaftaran *User* baru sedang dalam tahap pengembangan.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
