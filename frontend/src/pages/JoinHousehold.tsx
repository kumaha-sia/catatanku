import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useJoinHousehold } from '../hooks/useFinances';
import { CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';

export const JoinHousehold = () => {
  const { code } = useParams();
  const navigate = useNavigate();
  const joinMutation = useJoinHousehold();
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Bergabung dengan keluarga...');

  useEffect(() => {
    if (!code) {
      setStatus('error');
      setMessage('Kode undangan tidak valid.');
      return;
    }

    joinMutation.mutateAsync(code)
      .then(() => {
        setStatus('success');
        setMessage('Berhasil bergabung dengan keluarga!');
      })
      .catch((err: any) => {
        setStatus('error');
        setMessage(err.response?.data?.message || 'Gagal bergabung. Tautan tidak valid atau kedaluwarsa.');
      });
  }, [code]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 font-sans">
      <div className="max-w-md w-full bg-surface border-4 border-text-primary p-8 shadow-[12px_12px_0_0_#171B22] flex flex-col items-center text-center">
        {status === 'loading' && (
          <div className="animate-pulse">
            <ShieldCheck size={64} className="mx-auto mb-4 text-primary" />
            <h1 className="text-2xl font-black uppercase tracking-wider mb-2">Memproses...</h1>
            <p className="font-bold opacity-80">{message}</p>
          </div>
        )}

        {status === 'success' && (
          <div>
            <div className="w-20 h-20 bg-primary text-surface border-4 border-text-primary flex items-center justify-center shadow-[4px_4px_0_0_#171B22] mx-auto mb-6">
              <CheckCircle2 size={40} />
            </div>
            <h1 className="text-2xl font-black uppercase tracking-wider mb-2 text-primary">Berhasil!</h1>
            <p className="font-bold opacity-80 mb-8">{message}</p>
            <button 
              onClick={() => navigate('/family')}
              className="w-full bg-primary text-surface py-4 border-4 border-text-primary font-black uppercase tracking-widest shadow-[6px_6px_0_0_#171B22] hover:-translate-y-1 hover:shadow-[8px_8px_0_0_#171B22] hover:bg-accent hover:text-text-primary active:translate-y-0 active:shadow-none transition-all"
            >
              Lihat Keluarga
            </button>
          </div>
        )}

        {status === 'error' && (
          <div>
            <div className="w-20 h-20 bg-error text-surface border-4 border-text-primary flex items-center justify-center shadow-[4px_4px_0_0_#171B22] mx-auto mb-6">
              <AlertTriangle size={40} />
            </div>
            <h1 className="text-2xl font-black uppercase tracking-wider mb-2 text-error">Gagal</h1>
            <p className="font-bold opacity-80 mb-8">{message}</p>
            <button 
              onClick={() => navigate('/')}
              className="w-full bg-surface text-text-primary py-4 border-4 border-text-primary font-black uppercase tracking-widest shadow-[6px_6px_0_0_#171B22] hover:-translate-y-1 hover:shadow-[8px_8px_0_0_#171B22] active:translate-y-0 active:shadow-none transition-all"
            >
              Kembali ke Beranda
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
