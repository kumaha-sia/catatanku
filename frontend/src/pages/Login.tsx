import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { ArrowRight, AlertTriangle } from 'lucide-react';

export const Login = () => {
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
      const { login } = await import('../services/apiServices');
      const response = await login({ email, password });
      loginState(response.data.user, response.data.token);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login gagal. Periksa kembali email dan password Anda.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row font-sans">
      
      {/* Left Panel - Branding */}
      <div className="w-full md:w-5/12 bg-primary p-6 md:p-12 flex flex-col justify-center border-b-4 md:border-b-0 md:border-r-4 border-text-primary relative">
        <div className="relative z-10 w-full max-w-lg mx-auto">
          <Link to="/" className="inline-flex items-center gap-3 mb-12">
            <div className="w-12 h-12 bg-accent border-4 border-text-primary flex items-center justify-center text-text-primary font-black text-2xl shadow-[4px_4px_0_0_#171B22] transform -rotate-6 hover:rotate-0 transition-all">F</div>
            <span className="font-black text-3xl tracking-tight text-surface uppercase">FinBareng</span>
          </Link>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-surface leading-tight tracking-tight uppercase">
            Uang Keluarga,<br/>
            <span className="text-accent bg-text-primary px-2 py-1 inline-block mt-2 transform -rotate-2">Tanpa Rahasia</span><br/>
            <span className="text-2xl md:text-4xl mt-2 block opacity-90">(Kecuali Uang Jajanmu).</span>
          </h1>

          <div className="mt-10 bg-surface text-text-primary p-4 border-4 border-text-primary shadow-[6px_6px_0_0_#171B22] transform rotate-1">
            <p className="font-black text-sm md:text-base uppercase tracking-wider">
              Catat pengeluaran harian,<br/>
              pantau saldo bersama,<br/>
              wujudkan kebebasan finansial.
            </p>
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="w-full md:w-7/12 flex items-center justify-center p-6 md:p-12 bg-surface">
        <div className="w-full max-w-md">
          <div className="mb-10">
            <h2 className="text-4xl md:text-5xl font-black text-text-primary mb-2 uppercase">Masuk</h2>
            <p className="text-text-primary font-bold text-base md:text-lg opacity-80 uppercase tracking-wider">Selamat datang kembali ke realita keuanganmu.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-black text-text-primary uppercase tracking-widest">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                className="w-full px-5 py-4 bg-background border-4 border-text-primary rounded-none shadow-[4px_4px_0_0_#171B22] focus:outline-none focus:translate-y-1 focus:shadow-none transition-all font-semibold text-text-primary placeholder:text-text-primary/50"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-black text-text-primary uppercase tracking-widest">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-5 py-4 bg-background border-4 border-text-primary rounded-none shadow-[4px_4px_0_0_#171B22] focus:outline-none focus:translate-y-1 focus:shadow-none transition-all font-semibold text-text-primary placeholder:text-text-primary/50"
                required
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
              className="w-full mt-4 flex items-center justify-center gap-2 bg-primary text-surface py-4 border-4 border-text-primary shadow-[8px_8px_0_0_#171B22] hover:-translate-y-2 hover:shadow-[12px_12px_0_0_#171B22] hover:bg-accent hover:text-text-primary active:translate-y-0 active:shadow-[2px_2px_0_0_#171B22] transition-all font-black uppercase tracking-widest text-lg disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              {isLoading ? 'MEMPROSES...' : 'MASUK SEKARANG'}
              {!isLoading && <ArrowRight size={24} strokeWidth={3} className="group-hover:translate-x-2 transition-transform" />}
            </button>
          </form>

          <div className="mt-12 text-center">
            <p className="text-text-primary font-bold uppercase tracking-wider text-sm mb-4">Pendatang baru?</p>
            <Link 
              to="/register" 
              className="inline-block px-8 py-3 bg-accent text-text-primary border-4 border-text-primary font-black uppercase tracking-widest shadow-[4px_4px_0_0_#171B22] hover:-translate-y-1 hover:shadow-[6px_6px_0_0_#171B22] active:translate-y-0 active:shadow-none transition-all"
            >
              Bikin Akun
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
