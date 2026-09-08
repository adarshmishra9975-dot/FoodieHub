import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, LogIn, AlertCircle, UtensilsCrossed, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectPath = new URLSearchParams(location.search).get('redirect') || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please provide both email and password');
      return;
    }

    try {
      setLoading(true);
      const res = await login(email.trim(), password);

      if (res.success) {
        if (res.user?.role === 'admin' && redirectPath === '/') {
          navigate('/admin');
        } else {
          navigate(redirectPath);
        }
      } else {
        setError(res.message || 'Invalid email or password');
      }
    } catch (err) {
      setError(err.message || 'An error occurred while logging in');
    } finally {
      setLoading(false);
    }
  };

  const fillCredentials = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-10 border border-stone-200/80 shadow-xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-orange-600 text-white flex items-center justify-center mx-auto shadow-md shadow-orange-600/20">
            <UtensilsCrossed className="w-6 h-6" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900">
            Welcome to FoodieHub
          </h1>
          <p className="text-xs sm:text-sm text-stone-500">
            Sign in to track orders, manage your cart, and re-order meals.
          </p>
        </div>

        {/* Demo Credentials Helper Card */}
        <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 text-xs space-y-2">
          <p className="font-bold text-amber-900 uppercase tracking-wide text-[10px]">
            BSc IT Evaluation Demo Accounts (Click to Autofill):
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => fillCredentials('admin@foodiehub.com', 'Admin@123')}
              className="bg-white hover:bg-amber-100/60 border border-amber-300 rounded-xl p-2 text-left transition-colors shadow-2xs"
            >
              <p className="font-bold text-amber-950">👑 Admin Login</p>
              <p className="text-[10px] text-stone-500 font-mono">admin@foodiehub.com</p>
            </button>
            <button
              type="button"
              onClick={() => fillCredentials('customer@foodiehub.com', 'Customer@123')}
              className="bg-white hover:bg-amber-100/60 border border-amber-300 rounded-xl p-2 text-left transition-colors shadow-2xs"
            >
              <p className="font-bold text-amber-950">👤 Customer Login</p>
              <p className="text-[10px] text-stone-500 font-mono">customer@foodiehub.com</p>
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-2xl flex items-center gap-2.5 text-xs sm:text-sm font-medium">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-600 hover:bg-orange-700 active:scale-98 disabled:opacity-60 text-white font-bold py-3.5 px-4 rounded-xl shadow-md shadow-orange-600/20 flex items-center justify-center gap-2 text-sm transition-all mt-2"
          >
            <LogIn className="w-4 h-4" />
            <span>{loading ? 'Authenticating...' : 'Sign In to FoodieHub'}</span>
          </button>
        </form>

        <div className="pt-2 text-center text-xs text-stone-500">
          Don't have an account yet?{' '}
          <Link
            to={redirectPath ? `/register?redirect=${encodeURIComponent(redirectPath)}` : '/register'}
            className="font-bold text-orange-600 hover:underline"
          >
            Create Customer Account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
