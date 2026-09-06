import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { api } from '../lib/api';
import { UserPlus } from 'lucide-react';

export const Register = () => {
  const [name, setName] = useState('');
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
      const res = await api.post('/auth/register', { name, email, password });
      login(res.data.data.user, res.data.data.token);
      
      // Auto-create some default categories for new users
      await api.post('/categories', { name: 'Food & Dining', type: 'EXPENSE', icon: '🍽️' }, { headers: { Authorization: `Bearer ${res.data.data.token}` } });
      await api.post('/categories', { name: 'Transportation', type: 'EXPENSE', icon: '🚗' }, { headers: { Authorization: `Bearer ${res.data.data.token}` } });
      await api.post('/categories', { name: 'Salary', type: 'INCOME', icon: '💰' }, { headers: { Authorization: `Bearer ${res.data.data.token}` } });

      navigate('/');
    } catch (err: any) {
      if (err.response?.data?.errors) {
        setError(err.response.data.errors.map((e: any) => e.message).join(', '));
      } else {
        setError(err.response?.data?.message || 'Registration failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-surface p-10 border border-charcoal/10 shadow-2xl rounded-2xl">
        <div className="mb-8 text-center">
          <h1 className="font-serif text-4xl font-bold text-charcoal mb-2">Join Catatu.</h1>
          <p className="text-charcoal/60">Start managing your wealth beautifully.</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-terracotta/10 text-terracotta rounded-xl text-sm font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-charcoal mb-2">Full Name</label>
            <input 
              type="text" required
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-4 py-3 bg-background border border-charcoal/10 rounded-xl focus:outline-none focus:border-terracotta focus:ring-1 focus:ring-terracotta transition-all"
              placeholder="John Doe"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-charcoal mb-2">Email Address</label>
            <input 
              type="email" required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-background border border-charcoal/10 rounded-xl focus:outline-none focus:border-terracotta focus:ring-1 focus:ring-terracotta transition-all"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-charcoal mb-2">Password</label>
            <input 
              type="password" required minLength={6}
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-background border border-charcoal/10 rounded-xl focus:outline-none focus:border-terracotta focus:ring-1 focus:ring-terracotta transition-all"
              placeholder="••••••••"
            />
          </div>
          <button 
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-4 bg-charcoal text-surface font-semibold rounded-xl hover:bg-charcoal/90 transition-all disabled:opacity-50 mt-4"
          >
            {loading ? 'Creating account...' : (
              <>
                <UserPlus size={20} />
                Create Account
              </>
            )}
          </button>
        </form>

        <p className="mt-8 text-center text-charcoal/60 text-sm">
          Already have an account?{' '}
          <Link to="/login" className="text-terracotta font-bold hover:underline">Log in</Link>
        </p>
      </div>
    </div>
  );
};
