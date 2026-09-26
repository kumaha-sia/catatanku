import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login as loginApi } from '../../services/apiServices';
import { useAuthStore } from '../../store/authStore';

const AdminLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await loginApi({ email, password });
      
      if (res.data.user.role !== 'ADMIN') {
        setError('Unauthorized: Admin access required');
        setLoading(false);
        return;
      }

      login(res.data.user, res.data.token);
      navigate('/admin', { replace: true });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-surface border-4 border-text-primary p-6 md:p-8 shadow-[8px_8px_0_0_#171B22]">
        <div className="mb-8">
          <h1 className="text-3xl font-black uppercase tracking-wide text-text-primary">Admin Login</h1>
          <div className="h-2 w-16 bg-primary mt-2 border-2 border-text-primary shadow-[2px_2px_0_0_#171B22]"></div>
        </div>

        {error && (
          <div className="bg-error border-4 border-text-primary p-3 mb-6 font-bold text-surface shadow-[4px_4px_0_0_#171B22]">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label className="block text-sm font-black text-text-primary uppercase tracking-wider mb-2">Admin Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-surface border-4 border-text-primary p-3 text-text-primary font-bold focus:outline-none focus:ring-0 focus:shadow-[4px_4px_0_0_#A3E635] transition-all placeholder:text-text-secondary/50"
              placeholder="admin@finbareng.id"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-black text-text-primary uppercase tracking-wider mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-surface border-4 border-text-primary p-3 text-text-primary font-bold focus:outline-none focus:ring-0 focus:shadow-[4px_4px_0_0_#A3E635] transition-all placeholder:text-text-secondary/50"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-surface border-4 border-text-primary p-4 font-black uppercase tracking-widest hover:-translate-y-1 hover:shadow-[6px_6px_0_0_#171B22] active:translate-y-0 active:shadow-none transition-all disabled:opacity-50 disabled:translate-y-0 disabled:shadow-[4px_4px_0_0_#171B22] mt-2"
          >
            {loading ? 'Masuk...' : 'Masuk Panel Admin'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
