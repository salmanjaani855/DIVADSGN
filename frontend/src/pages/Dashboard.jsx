import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CreditCard,
  CalendarCheck,
  XCircle,
  Settings,
  Receipt,
  ArrowUpCircle,
  Sparkles,
} from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorState from '../components/ErrorState';
import EmptyState from '../components/EmptyState';
import BlogCard from '../components/BlogCard';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { fadeUp, staggerContainer } from '../animations/variants';

export default function Dashboard() {
  const { user } = useAuth();
  const [subData, setSubData] = useState(null);
  const [status, setStatus] = useState('loading');
  const [blogs, setBlogs] = useState([]);
  const [actionLoading, setActionLoading] = useState(false);
  const [plans, setPlans] = useState([]);

  const fetchAll = () => {
    setStatus('loading');
    Promise.all([
      api.get('/subscription/me'),
      api.get('/blogs'),
      api.get('/plans').catch(() => ({ data: [] })),
    ])
      .then(([subRes, blogsRes, plansRes]) => {
        setSubData(subRes.data);
        setBlogs(blogsRes.data || []);
        setPlans(plansRes.data || []);
        setStatus('success');
      })
      .catch(() => setStatus('error'));
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const handleUpgrade = async (planLevel) => {
    try {
      setActionLoading(true);
      const res = await api.post('/subscription/create-checkout-session', { plan: planLevel });
      window.location.href = res.data.url;
    } catch (err) {
      if (err?.response?.status === 503) {
        alert('Payments are not configured yet. Please check back soon.');
      } else {
        alert('Could not start checkout. Please try again.');
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel your subscription?')) return;
    try {
      setActionLoading(true);
      await api.post('/subscription/cancel');
      fetchAll();
    } catch {
      alert('Could not cancel subscription. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handlePortal = async () => {
    try {
      setActionLoading(true);
      const res = await api.post('/subscription/portal');
      window.location.href = res.data.url;
    } catch (err) {
      if (err?.response?.status === 503) {
        alert('Billing portal is not configured yet. Please check back soon.');
      } else {
        alert('Could not open billing portal.');
      }
    } finally {
      setActionLoading(false);
    }
  };

  if (status === 'loading') return <LoadingSpinner fullScreen label="Loading your dashboard..." />;
  if (status === 'error') return <ErrorState onRetry={fetchAll} message="Couldn't load your dashboard." />;

  const subscription = subData?.subscription || {};
  const billingHistory = subData?.billingHistory || [];
  const unlockedBlogs = blogs.filter((b) => !b.locked && b.accessLevel !== 'free').slice(0, 3);
  const otherPlans = plans.filter((p) => p.accessLevel !== subscription.plan);

  return (
    <div className="mx-auto max-w-6xl px-6 py-16 lg:px-8">
      <motion.div initial="hidden" animate="visible" variants={fadeUp}>
        <h1 className="text-3xl font-bold text-white">Welcome back, {user?.name?.split(' ')[0] || 'reader'}</h1>
        <p className="mt-2 text-white/50">Manage your subscription and billing here.</p>
      </motion.div>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-3"
      >
        <motion.div variants={fadeUp} className="glass rounded-2xl p-6 lg:col-span-2">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-fuchsia-500/15 text-fuchsia-300">
              <Sparkles size={18} />
            </span>
            <div>
              <p className="text-xs text-white/45">Current plan</p>
              <p className="text-lg font-semibold capitalize text-white">
                {subscription.plan || 'free'}
              </p>
            </div>
            <span
              className={`ml-auto rounded-full px-3 py-1 text-xs font-medium capitalize ${
                subscription.status === 'active'
                  ? 'bg-emerald-500/15 text-emerald-300'
                  : 'bg-white/10 text-white/50'
              }`}
            >
              {subscription.status || 'inactive'}
            </span>
          </div>

          {subscription.currentPeriodEnd && (
            <p className="mt-4 flex items-center gap-2 text-sm text-white/50">
              <CalendarCheck size={14} />
              Renews on {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
            </p>
          )}

          <div className="mt-6 flex flex-wrap gap-3">
            {otherPlans.map((plan) => (
              <button
                key={plan._id}
                onClick={() => handleUpgrade(plan.accessLevel)}
                disabled={actionLoading}
                className="btn-pill-outline text-sm disabled:opacity-60"
              >
                <ArrowUpCircle size={14} /> Switch to {plan.name}
              </button>
            ))}
            <button onClick={handlePortal} disabled={actionLoading} className="btn-pill-outline text-sm disabled:opacity-60">
              <Settings size={14} /> Manage Billing
            </button>
            {subscription.plan && subscription.plan !== 'free' && (
              <button onClick={handleCancel} disabled={actionLoading} className="btn-pill-outline text-sm text-red-300 disabled:opacity-60">
                <XCircle size={14} /> Cancel Subscription
              </button>
            )}
          </div>
        </motion.div>

        <motion.div variants={fadeUp} className="glass rounded-2xl p-6">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/15 text-violet-300">
              <CreditCard size={18} />
            </span>
            <p className="text-sm font-semibold text-white">Quick links</p>
          </div>
          <div className="mt-4 flex flex-col gap-2">
            <Link to="/pricing" className="btn-pill-outline w-full justify-center text-sm">
              View all plans
            </Link>
            <Link to="/blog" className="btn-pill-outline w-full justify-center text-sm">
              Browse the blog
            </Link>
          </div>
        </motion.div>
      </motion.div>

      <motion.div initial="hidden" animate="visible" variants={fadeUp} className="mt-10">
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center gap-2">
            <Receipt size={16} className="text-white/50" />
            <h2 className="text-sm font-semibold text-white">Billing history</h2>
          </div>

          {billingHistory.length === 0 ? (
            <p className="mt-4 text-sm text-white/40">No billing history yet.</p>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-white/40">
                    <th className="py-2 font-medium">Date</th>
                    <th className="py-2 font-medium">Amount</th>
                    <th className="py-2 font-medium">Status</th>
                    <th className="py-2 font-medium">Invoice</th>
                  </tr>
                </thead>
                <tbody>
                  {billingHistory.map((item, i) => (
                    <tr key={i} className="border-b border-white/5 text-white/70">
                      <td className="py-3">{new Date(item.date).toLocaleDateString()}</td>
                      <td className="py-3">${item.amount}</td>
                      <td className="py-3 capitalize">{item.status}</td>
                      <td className="py-3">
                        {item.invoiceUrl ? (
                          <a href={item.invoiceUrl} target="_blank" rel="noreferrer" className="text-fuchsia-400 hover:text-fuchsia-300">
                            View
                          </a>
                        ) : (
                          '—'
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </motion.div>

      <motion.div initial="hidden" animate="visible" variants={fadeUp} className="mt-10">
        <h2 className="text-lg font-semibold text-white">Newly unlocked for you</h2>
        <p className="mt-1 text-sm text-white/45">Premium articles available on your current plan.</p>

        {unlockedBlogs.length === 0 ? (
          <EmptyState
            title="Nothing unlocked yet"
            message="Upgrade your plan to unlock premium articles."
          />
        ) : (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {unlockedBlogs.map((blog) => (
              <BlogCard key={blog._id} blog={blog} />
            ))}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
