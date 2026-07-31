import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, LogIn, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { fadeUp } from '../animations/variants';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.email || !form.password) {
      setError('Please fill in both fields.');
      return;
    }

    try {
      setSubmitting(true);
      await login(form.email, form.password);
      const next = params.get('next');
      const plan = params.get('plan');
      if (plan) {
        navigate(`/pricing?plan=${plan}`);
      } else {
        navigate(next || '/dashboard');
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Invalid email or password.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative flex min-h-[85vh] items-center justify-center overflow-hidden px-6 py-16">
      <div className="glow-blob left-1/2 top-1/2 h-[380px] w-[380px] -translate-x-1/2 -translate-y-1/2 bg-fuchsia-600/25" />

      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        className="glass relative w-full max-w-md rounded-3xl p-8"
      >
        <h1 className="text-2xl font-bold text-white">Welcome back</h1>
        <p className="mt-2 text-sm text-white/50">Log in to continue reading where you left off.</p>

        {error && (
          <div className="mt-6 flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-white/60">Email</span>
            <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
              <Mail size={16} className="text-white/40" />
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="w-full bg-transparent text-sm text-white placeholder:text-white/30 focus:outline-none"
              />
            </div>
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-white/60">Password</span>
            <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
              <Lock size={16} className="text-white/40" />
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full bg-transparent text-sm text-white placeholder:text-white/30 focus:outline-none"
              />
            </div>
          </label>

          <button type="submit" disabled={submitting} className="btn-pill mt-2 w-full justify-center disabled:opacity-60">
            <LogIn size={16} /> {submitting ? 'Logging in...' : 'Log in'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-white/50">
          Don't have an account?{' '}
          <Link to="/signup" className="font-medium text-fuchsia-400 hover:text-fuchsia-300">
            Sign up
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
