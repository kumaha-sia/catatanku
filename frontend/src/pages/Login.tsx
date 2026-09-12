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
      <div className="w-full md:w-5/12 bg-primary p-8 md:p-12 flex flex-col justify-between border-b-4 md:border-b-0 md:border-r-4 border-text-primary relative overflow-hidden">
        {/* Abstract Geometry */}
        <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-accent rounded-full opacity-90 border-4 border-text-primary z-0" />
        <div className="absolute bottom-[10%] left-[-5%] w-32 h-32 bg-surface rounded-none rotate-12 border-4 border-text-primary z-0" />

        <div className="relative z-10">
          <Link to="/" className="inline-flex items-center gap-3 mb-16">
            <div className="w-12 h-12 bg-accent border-2 border-text-primary flex items-center justify-center text-text-primary font-black text-xl shadow-[4px_4px_0_0_#171B22] transform -rotate-6">F</div>
            <span className="font-black text-3xl tracking-tight text-surface">FinBareng</span>
          </Link>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-surface leading-[1.1] tracking-tight">
            Uang Keluarga,<br/>
            <span className="text-accent">Tanpa Rahasia</span><br/>
            (Kecuali Uang Jajanmu).
          </h1>
        </div>

        <div className="relative z-10 mt-12 md:mt-0">
          <p className="text-primary-soft font-bold text-lg md:text-xl border-l-4 border-accent pl-4">
            Catat pengeluaran harian,<br/>
            pantau saldo bersama,<br/>
            wujudkan kebebasan finansial.
          </p>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="w-full md:w-7/12 flex items-center justify-center p-6 md:p-12 relative">
        <div className="w-full max-w-md">
          <div className="mb-10">
            <h2 className="text-4xl font-black text-text-primary mb-3">Masuk</h2>
            <p className="text-text-secondary font-bold text-lg">Selamat datang kembali ke realita keuanganmu.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-base font-black text-text-primary mb-2 uppercase tracking-wide">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                className="w-full px-5 py-4 bg-surface border-2 border-text-primary rounded-none focus:outline-none focus:ring-0 focus:shadow-[6px_6px_0_0_#FFB43A] transition-all font-bold text-text-primary placeholder:text-text-secondary/50"
                required
              />
            </div>

            <div>
              <label className="block text-base font-black text-text-primary mb-2 uppercase tracking-wide">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-5 py-4 bg-surface border-2 border-text-primary rounded-none focus:outline-none focus:ring-0 focus:shadow-[6px_6px_0_0_#FFB43A] transition-all font-bold text-text-primary placeholder:text-text-secondary/50"
                required
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
              className="w-full flex items-center justify-center gap-3 py-4 bg-primary text-surface border-2 border-text-primary font-black text-lg uppercase tracking-wider hover:-translate-y-1 hover:shadow-[6px_6px_0_0_#171B22] active:translate-y-0 active:shadow-none transition-all disabled:opacity-70 disabled:hover:translate-y-0 disabled:hover:shadow-none mt-4"
            >
              {isLoading ? 'Memproses...' : 'Masuk Sekarang'}
              {!isLoading && <ArrowRight size={24} />}
            </button>
          </form>

          <div className="mt-12 text-center">
            <p className="text-text-primary font-bold text-lg">
              Pendatang baru?{' '}
              <Link to="/register" className="text-primary hover:text-accent underline decoration-4 underline-offset-4 transition-colors">
                Bikin Akun
              </Link>
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};
