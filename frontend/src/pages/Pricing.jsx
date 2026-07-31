import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import PricingCard from '../components/PricingCard';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorState from '../components/ErrorState';
import EmptyState from '../components/EmptyState';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { fadeUp, staggerContainer, viewportOnce } from '../animations/variants';

export default function Pricing() {
  const [plans, setPlans] = useState([]);
  const [status, setStatus] = useState('loading');
  const [checkoutLoadingId, setCheckoutLoadingId] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchPlans = () => {
    setStatus('loading');
    api
      .get('/plans')
      .then((res) => {
        setPlans(res.data || []);
        setStatus(res.data?.length ? 'success' : 'empty');
      })
      .catch(() => setStatus('error'));
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleSelectPlan = async (plan) => {
    if (!user) {
      navigate(`/signup?plan=${plan.accessLevel}`);
      return;
    }
    if (plan.price === 0) {
      navigate('/dashboard');
      return;
    }
    try {
      setCheckoutLoadingId(plan._id);
      const res = await api.post('/subscription/create-checkout-session', {
        plan: plan.accessLevel,
      });
      window.location.href = res.data.url;
    } catch (err) {
      if (err?.response?.status === 503) {
        alert('Payments are not configured yet. Please check back soon.');
      } else {
        alert('Something went wrong starting checkout. Please try again.');
      }
    } finally {
      setCheckoutLoadingId(null);
    }
  };

  return (
    <div className="relative overflow-hidden py-28">
      <div className="glow-blob left-1/2 top-0 h-[400px] w-[400px] -translate-x-1/2 bg-fuchsia-600/25" />

      <div className="relative mx-auto max-w-6xl px-6 lg:px-8">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="mx-auto mb-16 max-w-2xl text-center"
        >
          <h1 className="text-4xl font-extrabold tracking-tight text-[#ececec] sm:text-5xl">
            Plans &amp; Pricing
          </h1>
          <p className="mt-4 text-[rgba(236,236,236,0.8)]">
            No shady charges, no unexpected shocks. Start for free, or unlock premium and early-access content with Pro or Premium.
          </p>
        </motion.div>

        {status === 'loading' && <LoadingSpinner label="Loading plans..." />}
        {status === 'error' && <ErrorState onRetry={fetchPlans} message="Couldn't load pricing plans." />}
        {status === 'empty' && <EmptyState title="No plans available" message="Please check back later." />}
        {status === 'success' && (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            viewport={viewportOnce}
            className="grid grid-cols-1 gap-6 sm:grid-cols-3"
          >
            {plans.map((plan, i) => (
              <PricingCard
                key={plan._id}
                plan={plan}
                popular={i === 1}
                onSelect={handleSelectPlan}
                loading={checkoutLoadingId === plan._id}
                currentPlan={user?.subscription?.plan}
              />
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
