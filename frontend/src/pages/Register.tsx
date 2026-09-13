import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { UserPlus, AlertTriangle } from 'lucide-react';

export const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const loginState = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const { register } = await import('../services/apiServices');
      const response = await register({ name, email, password });
      loginState(response.data.user, response.data.token);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registrasi gagal. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row-reverse font-sans">
      
      {/* Right Panel - Branding */}
      <div className="w-full md:w-5/12 bg-accent p-6 md:p-12 flex flex-col justify-center border-b-4 md:border-b-0 md:border-l-4 border-text-primary relative">
        <div className="relative z-10 w-full max-w-lg mx-auto">
          <Link to="/" className="inline-flex items-center gap-3 mb-12">
            <div className="w-12 h-12 bg-primary border-4 border-text-primary flex items-center justify-center text-surface font-black text-2xl shadow-[4px_4px_0_0_#171B22] transform rotate-6 hover:rotate-0 transition-all">F</div>
            <span className="font-black text-3xl tracking-tight text-text-primary uppercase">FinBareng</span>
          </Link>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-text-primary leading-tight tracking-tight uppercase">
            Mulai<br/>
            <span className="text-surface bg-text-primary px-2 py-1 inline-block mt-2 transform rotate-2">Kendali</span><br/>
            <span className="text-3xl md:text-5xl mt-2 block">Hari Ini.</span>
          </h1>

          <div className="mt-10 bg-surface text-text-primary p-4 border-4 border-text-primary shadow-[6px_6px_0_0_#171B22] transform -rotate-1">
            <p className="font-black text-sm md:text-base uppercase tracking-wider">
              Berhenti pusing akhir bulan.<br/>
              Pisahkan uang pribadi & keluarga<br/>
              hanya dalam satu aplikasi.
            </p>
          </div>
        </div>
      </div>

      {/* Left Panel - Form */}
      <div className="w-full md:w-7/12 flex items-center justify-center p-6 md:p-12 bg-surface">
        <div className="w-full max-w-md">
          <div className="mb-10">
            <h2 className="text-4xl md:text-5xl font-black text-text-primary mb-2 uppercase">Daftar</h2>
            <p className="text-text-primary font-bold text-base md:text-lg opacity-80 uppercase tracking-wider">Buat akun gratis. Tidak ada biaya tersembunyi.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-black text-text-primary uppercase tracking-widest">Nama Panggilan</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="SI PALING HEMAT"
                className="w-full px-5 py-4 bg-background border-4 border-text-primary rounded-none shadow-[4px_4px_0_0_#171B22] focus:outline-none focus:translate-y-1 focus:shadow-none transition-all font-black text-text-primary placeholder:text-text-primary/30 uppercase"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-black text-text-primary uppercase tracking-widest">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="NAMA@EMAIL.COM"
                className="w-full px-5 py-4 bg-background border-4 border-text-primary rounded-none shadow-[4px_4px_0_0_#171B22] focus:outline-none focus:translate-y-1 focus:shadow-none transition-all font-black text-text-primary placeholder:text-text-primary/30 uppercase"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-black text-text-primary uppercase tracking-widest">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="MINIMAL 8 KARAKTER"
                className="w-full px-5 py-4 bg-background border-4 border-text-primary rounded-none shadow-[4px_4px_0_0_#171B22] focus:outline-none focus:translate-y-1 focus:shadow-none transition-all font-black text-text-primary placeholder:text-text-primary/30"
                required
                minLength={8}
              />
            </div>

            {error && (
              <div className="p-4 bg-error text-surface font-black flex items-center gap-3 border-4 border-text-primary shadow-[4px_4px_0_0_#171B22] uppercase text-sm tracking-wider">
                <AlertTriangle size={24} className="flex-shrink-0" strokeWidth={3} />
                <p>{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-4 flex items-center justify-center gap-2 bg-accent text-text-primary py-4 border-4 border-text-primary shadow-[8px_8px_0_0_#171B22] hover:-translate-y-2 hover:shadow-[12px_12px_0_0_#171B22] hover:bg-primary hover:text-surface active:translate-y-0 active:shadow-[2px_2px_0_0_#171B22] transition-all font-black uppercase tracking-widest text-lg disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              {isLoading ? 'MEMPROSES...' : 'GABUNG SEKARANG'}
              {!isLoading && <UserPlus size={24} strokeWidth={3} className="group-hover:scale-110 transition-transform" />}
            </button>
          </form>

          <div className="mt-12 text-center">
            <p className="text-text-primary font-bold uppercase tracking-wider text-sm mb-4">Sudah punya akun?</p>
            <Link 
              to="/login" 
              className="inline-block px-8 py-3 bg-primary text-surface border-4 border-text-primary font-black uppercase tracking-widest shadow-[4px_4px_0_0_#171B22] hover:-translate-y-1 hover:shadow-[6px_6px_0_0_#171B22] active:translate-y-0 active:shadow-none transition-all"
            >
              Masuk Sini
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
