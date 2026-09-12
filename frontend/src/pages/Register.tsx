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
      
      {/* Right Panel (now visual left for variation) - Branding */}
      <div className="w-full md:w-5/12 bg-accent p-8 md:p-12 flex flex-col justify-between border-b-4 md:border-b-0 md:border-l-4 border-text-primary relative overflow-hidden">
        {/* Abstract Geometry */}
        <div className="absolute top-[20%] left-[-10%] w-48 h-48 bg-primary rounded-none rotate-45 border-4 border-text-primary z-0" />
        <div className="absolute bottom-[-10%] right-[-5%] w-64 h-64 bg-surface rounded-full border-4 border-text-primary z-0" />

        <div className="relative z-10">
          <Link to="/" className="inline-flex items-center gap-3 mb-16">
            <div className="w-12 h-12 bg-primary border-2 border-text-primary flex items-center justify-center text-surface font-black text-xl shadow-[4px_4px_0_0_#171B22] transform rotate-6">F</div>
            <span className="font-black text-3xl tracking-tight text-text-primary">FinBareng</span>
          </Link>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-text-primary leading-[1.1] tracking-tight">
            Mulai<br/>
            <span className="text-surface drop-shadow-[2px_2px_0_#171B22]">Kendali</span><br/>
            Hari Ini.
          </h1>
        </div>

        <div className="relative z-10 mt-12 md:mt-0">
          <p className="text-text-primary font-bold text-lg md:text-xl border-l-4 border-surface pl-4">
            Berhenti pusing akhir bulan.<br/>
            Pisahkan uang pribadi & keluarga<br/>
            hanya dalam satu aplikasi.
          </p>
        </div>
      </div>

      {/* Left Panel - Form */}
      <div className="w-full md:w-7/12 flex items-center justify-center p-6 md:p-12 relative">
        <div className="w-full max-w-md">
          <div className="mb-10">
            <h2 className="text-4xl font-black text-text-primary mb-3">Daftar</h2>
            <p className="text-text-secondary font-bold text-lg">Buat akun gratis. Tidak ada biaya tersembunyi.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-base font-black text-text-primary mb-2 uppercase tracking-wide">Nama Panggilan</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Si Paling Hemat"
                className="w-full px-5 py-4 bg-surface border-2 border-text-primary rounded-none focus:outline-none focus:ring-0 focus:shadow-[6px_6px_0_0_#0C6B58] transition-all font-bold text-text-primary placeholder:text-text-secondary/50"
                required
              />
            </div>

            <div>
              <label className="block text-base font-black text-text-primary mb-2 uppercase tracking-wide">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                className="w-full px-5 py-4 bg-surface border-2 border-text-primary rounded-none focus:outline-none focus:ring-0 focus:shadow-[6px_6px_0_0_#0C6B58] transition-all font-bold text-text-primary placeholder:text-text-secondary/50"
                required
              />
            </div>

            <div>
              <label className="block text-base font-black text-text-primary mb-2 uppercase tracking-wide">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimal 8 karakter rahasia"
                className="w-full px-5 py-4 bg-surface border-2 border-text-primary rounded-none focus:outline-none focus:ring-0 focus:shadow-[6px_6px_0_0_#0C6B58] transition-all font-bold text-text-primary placeholder:text-text-secondary/50"
                required
                minLength={8}
              />
            </div>

            {error && (
              <div className="p-4 bg-error text-surface font-bold flex items-center gap-3 border-2 border-text-primary shadow-[4px_4px_0_0_#171B22]">
                <AlertTriangle size={20} className="flex-shrink-0" />
                <p>{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 py-4 bg-accent text-text-primary border-2 border-text-primary font-black text-lg uppercase tracking-wider hover:-translate-y-1 hover:shadow-[6px_6px_0_0_#171B22] active:translate-y-0 active:shadow-none transition-all disabled:opacity-70 disabled:hover:translate-y-0 disabled:hover:shadow-none mt-6"
            >
              {isLoading ? 'Memproses...' : 'Gabung Sekarang'}
              {!isLoading && <UserPlus size={24} />}
            </button>
          </form>

          <div className="mt-12 text-center">
            <p className="text-text-primary font-bold text-lg">
              Sudah punya akun?{' '}
              <Link to="/login" className="text-primary hover:text-accent underline decoration-4 underline-offset-4 transition-colors">
                Masuk Sini
              </Link>
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};
