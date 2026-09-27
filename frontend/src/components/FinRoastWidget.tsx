import React, { useState } from 'react';
import { Flame, Share2, RefreshCw, AlertTriangle, Coffee, Briefcase } from 'lucide-react';
import api from '../api';

export const FinRoastWidget = () => {
  const [roastData, setRoastData] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [persona, setPersona] = useState<'savage' | 'chill' | 'strict'>('savage');

  const fetchRoast = async () => {
    try {
      setIsLoading(true);
      const res = await api.get(`/ai/roast?persona=${persona}`);
      setRoastData(res.data.data.insight);
    } catch (err: any) {
      window.toast.error(err.response?.data?.message || 'Gagal memanggil AI');
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share && roastData) {
      try {
        await navigator.share({
          title: 'FinBareng AI Roast',
          text: roastData,
        });
      } catch (err) {
        console.error('Share failed', err);
      }
    } else {
      window.toast.success('Disalin ke clipboard!');
      navigator.clipboard.writeText(roastData || '');
    }
  };

  return (
    <div className="bg-[#FFA6A6] border-4 border-text-primary shadow-[8px_8px_0_0_#171B22] p-6 mb-8 animate-fade-in relative overflow-hidden">
      <div className="absolute -right-10 -top-10 opacity-10 pointer-events-none">
        <Flame size={200} className="text-text-primary" />
      </div>

      <div className="flex items-center gap-3 mb-4 relative z-10">
        <div className="bg-surface border-4 border-text-primary p-2 shadow-[2px_2px_0_0_#171B22]">
          <Flame size={24} className="text-text-primary" />
        </div>
        <h2 className="text-2xl font-black uppercase text-text-primary tracking-tight">Fin-Roast AI 🔥</h2>
      </div>
      
      <p className="text-sm font-bold text-text-primary/80 mb-6 relative z-10">
        Berani lihat kenyataan pahit dari kebiasaan jajanmu bulan ini? Pilih gaya AI-nya dan siapkan mentalmu.
      </p>

      {/* Persona Selector */}
      <div className="flex gap-2 mb-6 relative z-10 flex-wrap">
        <button 
          onClick={() => setPersona('savage')}
          className={`flex-1 min-w-[100px] flex items-center justify-center gap-2 p-2 border-2 border-text-primary font-black uppercase text-xs transition-all shadow-[2px_2px_0_0_#171B22] ${persona === 'savage' ? 'bg-error text-surface -translate-y-1' : 'bg-surface text-text-primary hover:-translate-y-1 hover:bg-surface-muted'}`}
        >
          <AlertTriangle size={14} /> Savage
        </button>
        <button 
          onClick={() => setPersona('chill')}
          className={`flex-1 min-w-[100px] flex items-center justify-center gap-2 p-2 border-2 border-text-primary font-black uppercase text-xs transition-all shadow-[2px_2px_0_0_#171B22] ${persona === 'chill' ? 'bg-[#FFB43A] text-text-primary -translate-y-1' : 'bg-surface text-text-primary hover:-translate-y-1 hover:bg-surface-muted'}`}
        >
          <Coffee size={14} /> Chill Bro
        </button>
        <button 
          onClick={() => setPersona('strict')}
          className={`flex-1 min-w-[100px] flex items-center justify-center gap-2 p-2 border-2 border-text-primary font-black uppercase text-xs transition-all shadow-[2px_2px_0_0_#171B22] ${persona === 'strict' ? 'bg-primary text-surface -translate-y-1' : 'bg-surface text-text-primary hover:-translate-y-1 hover:bg-surface-muted'}`}
        >
          <Briefcase size={14} /> Profesional
        </button>
      </div>

      {!roastData && !isLoading && (
        <button 
          onClick={fetchRoast}
          className="w-full bg-surface border-4 border-text-primary p-4 font-black uppercase text-text-primary hover:-translate-y-1 hover:shadow-[4px_4px_0_0_#171B22] transition-all relative z-10"
        >
          Analisa Pengeluaranku Bulan Ini
        </button>
      )}

      {isLoading && (
        <div className="w-full bg-surface border-4 border-text-primary p-6 flex flex-col items-center justify-center gap-4 relative z-10 shadow-[4px_4px_0_0_#171B22]">
          <RefreshCw size={32} className="animate-spin text-error" />
          <p className="font-black uppercase animate-pulse">Mengorek aib finansialmu...</p>
        </div>
      )}

      {roastData && !isLoading && (
        <div className="bg-surface border-4 border-text-primary p-6 relative z-10 shadow-[4px_4px_0_0_#171B22] animate-slide-up">
          <div className="prose prose-sm max-w-none font-bold text-text-primary mb-6" dangerouslySetInnerHTML={{ __html: roastData.replace(/\n/g, '<br/>') }} />
          
          <div className="flex gap-4">
            <button 
              onClick={fetchRoast}
              className="flex-1 bg-accent border-2 border-text-primary p-3 font-black uppercase text-sm shadow-[2px_2px_0_0_#171B22] hover:-translate-y-1 active:translate-y-0 active:shadow-none transition-all flex items-center justify-center gap-2"
            >
              <RefreshCw size={16} /> Coba Lagi
            </button>
            <button 
              onClick={handleShare}
              className="flex-1 bg-primary text-surface border-2 border-text-primary p-3 font-black uppercase text-sm shadow-[2px_2px_0_0_#171B22] hover:-translate-y-1 active:translate-y-0 active:shadow-none transition-all flex items-center justify-center gap-2"
            >
              <Share2 size={16} /> Pamerkan Aib
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
