import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { ArrowRight, UserPlus } from 'lucide-react';

export const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const register = useAuthStore((state) => state.register);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await register(name, email, password);
      // For MVP, directly navigate to dashboard instead of onboarding flow
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registrasi gagal. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center p-4">
      
      <div className="w-full max-w-md bg-surface p-8 sm:p-10 border border-border shadow-2xl rounded-3xl relative overflow-hidden">
        {/* Decorative background element */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        
        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-2 mb-10 group">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-surface font-bold text-lg shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform">F</div>
            <span className="font-bold text-2xl tracking-tight text-text-primary">FinBareng</span>
          </Link>

          <h1 className="text-3xl font-bold text-text-primary mb-2 tracking-tight">Daftar Akun</h1>
          <p className="text-text-secondary mb-8">Uangmu dan uang keluarga, rapi di satu tempat.</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-text-primary mb-2">Nama Lengkap</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Andi"
                className="w-full px-4 py-3 bg-surface border border-border rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-medium text-text-primary placeholder:text-text-secondary/50"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-text-primary mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                className="w-full px-4 py-3 bg-surface border border-border rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-medium text-text-primary placeholder:text-text-secondary/50"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-text-primary mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimal 8 karakter"
                className="w-full px-4 py-3 bg-surface border border-border rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-medium text-text-primary placeholder:text-text-secondary/50"
                required
                minLength={8}
              />
            </div>

            {error && (
              <div className="p-4 bg-error/10 border border-error/20 rounded-xl text-error text-sm font-semibold flex items-center gap-3">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-4 bg-primary text-surface font-bold rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 active:scale-95 disabled:opacity-70 disabled:active:scale-100 mt-2"
            >
              {isLoading ? 'Membuat Akun...' : 'Daftar Sekarang'}
              {!isLoading && <UserPlus size={20} />}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-border text-center">
            <p className="text-text-secondary text-sm font-medium">
              Sudah punya akun?{' '}
              <Link to="/login" className="text-primary font-bold hover:underline">
                Masuk
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
