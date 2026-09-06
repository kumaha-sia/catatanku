import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { api } from '../lib/api';
import { LogIn } from 'lucide-react';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const login = useAuthStore(state => state.login);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/auth/login', { email, password });
      login(res.data.data.user, res.data.data.token);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-surface p-10 border border-charcoal/10 shadow-2xl rounded-2xl">
        <div className="mb-8 text-center">
          <h1 className="font-serif text-4xl font-bold text-charcoal mb-2">Catatu.</h1>
          <p className="text-charcoal/60">Log in to manage your wealth.</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-terracotta/10 text-terracotta rounded-xl text-sm font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-charcoal mb-2">Email Address</label>
            <input 
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-background border border-charcoal/10 rounded-xl focus:outline-none focus:border-terracotta focus:ring-1 focus:ring-terracotta transition-all"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-charcoal mb-2">Password</label>
            <input 
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-background border border-charcoal/10 rounded-xl focus:outline-none focus:border-terracotta focus:ring-1 focus:ring-terracotta transition-all"
              placeholder="••••••••"
            />
          </div>
          <button 
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-4 bg-terracotta text-surface font-semibold rounded-xl hover:bg-terracotta/90 transition-all disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : (
              <>
                <LogIn size={20} />
                Sign In
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
