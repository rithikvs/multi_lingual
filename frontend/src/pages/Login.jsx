import React, { useState, useEffect } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { SignLanguage as SignLanguageIcon } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard');
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await login(email, password);
      if (result.success) navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to connect to the server. Please ensure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-appBg px-4 py-12">
      <div className="auth-card">
        <div className="text-center mb-6">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-50 border border-sky-200 mb-4">
            <SignLanguageIcon sx={{ color: '#0284c7', fontSize: 32 }} />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 mb-1">Welcome Back</h2>
          <p className="text-slate-500 text-sm">Sign in to access your communication workspace</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-slate-700 text-sm font-semibold block mb-1.5">Email Address</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="input-field" placeholder="you@example.com" />
          </div>
          <div>
            <label className="text-slate-700 text-sm font-semibold block mb-1.5">Password</label>
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="input-field" placeholder="Enter your password" />
          </div>
          <button type="submit" disabled={loading} className="btn-primary mt-1">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-slate-500 text-sm mt-6">
          Don't have an account?{' '}
          <RouterLink to="/register" className="text-sky-600 font-bold hover:underline">Sign Up</RouterLink>
        </p>
      </div>
    </div>
  );
};

export default Login;
