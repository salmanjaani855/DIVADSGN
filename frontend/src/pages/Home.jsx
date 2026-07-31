import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Wallet2, KeyRound, Smartphone } from 'lucide-react';
import PerkCard from '../components/PerkCard';
import perkTopQuality from '../assets/figma/perk-top-quality.svg';
import perkSuperSpeedy from '../assets/figma/perk-super-speedy.svg';
import perkFixMonthly from '../assets/figma/perk-fix-monthly.svg';
import perkFlexible from '../assets/figma/perk-flexible.svg';
import perkTrello from '../assets/figma/perk-trello.svg';
import perkMoneyback from '../assets/figma/perk-moneyback.svg';
import avatar1 from '../assets/figma/avatar1.png';
import avatar2 from '../assets/figma/avatar2.png';
import avatar3 from '../assets/figma/avatar3.png';
import HowItWorksStep from '../components/HowItWorksStep';
import TestimonialCard from '../components/TestimonialCard';
import PricingCard from '../components/PricingCard';
import FaqAccordion from '../components/FaqAccordion';
import LogoStrip from '../components/LogoStrip';
import HeroSection from '../components/HeroSection';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorState from '../components/ErrorState';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { useNavigate, Link } from 'react-router-dom';
import { fadeUp, staggerContainer, viewportOnce } from '../animations/variants';

const perks = [
  { icon: perkTopQuality, title: 'Unlimited Reading', description: 'Every premium article, every archive, no paywalls popping up mid-sentence.' },
  { icon: perkSuperSpeedy, title: 'New Posts Weekly', description: 'Fresh essays, guides, and deep dives land in your feed every week, delivered fast.' },
  { icon: perkFixMonthly, title: 'Fixed Monthly Rate', description: 'No shady charges or surprise fees — one flat price for unlimited access, every month.' },
  { icon: perkFlexible, title: 'Cancel Anytime', description: 'Upgrade, downgrade, pause, or cancel whenever you like — always flexible to your needs.' },
  { icon: perkTrello, title: 'Ad-Free Experience', description: 'Read distraction-free — no banner ads, no popups, no tracking pixels, ever.' },
  { icon: perkMoneyback, title: 'Money-Back Guarantee', description: "Not loving it? Get a full refund within 7 days, no questions asked." },
];

const steps = [
  { icon: Wallet2, title: 'Choose a plan', description: 'Pick Free, Pro, or Premium based on how deep you want to go — upgrade or downgrade whenever you like.' },
  { icon: KeyRound, title: 'Unlock content instantly', description: 'The moment you subscribe, every locked article for your tier opens up immediately, no waiting.' },
  { icon: Smartphone, title: 'Read anywhere', description: 'Fully responsive reading experience across desktop, tablet, and mobile — your library follows you.' },
];

const testimonials = [
  { name: 'Amara Chen', role: 'Product Designer', quote: 'The Premium tier is worth it just for the deep-dive series. I read something new every single week.', avatar: avatar1 },
  { name: 'Jonah Reyes', role: 'Indie Founder', quote: 'Cancelled two other newsletters after subscribing here. The writing quality is genuinely a level up.', avatar: avatar2 },
  { name: 'Priya Nair', role: 'Software Engineer', quote: 'Clean reading experience, no ads, and new posts actually show up weekly like they promise.', avatar: avatar3 },
];

const faqs = [
  { question: 'Can I cancel my subscription at any time?', answer: 'Yes. You can cancel from your dashboard at any time — you\'ll keep access until the end of your current billing period, no questions asked.' },
  { question: 'What happens to locked articles if I downgrade?', answer: 'Articles above your new plan\'s access level will re-lock, but anything you\'ve already read stays in your history. You can re-upgrade anytime to unlock them again.' },
  { question: 'Do you offer refunds?', answer: 'We offer a full refund within 7 days of your first charge if you\'re not satisfied. Just reach out through your dashboard billing section.' },
  { question: 'How often is new content published?', answer: 'New articles are published weekly, with Premium subscribers getting early access a few days before everyone else.' },
  { question: 'Can I switch between plans?', answer: 'Absolutely — upgrade or downgrade anytime from your dashboard. Changes are prorated and billed automatically through Stripe.' },
  { question: 'Is my payment information secure?', answer: 'All payments are processed securely through Stripe. We never store your card details on our servers.' },
];

export default function Home() {
  const [plans, setPlans] = useState([]);
  const [status, setStatus] = useState('loading');
  const { user } = useAuth();
  const navigate = useNavigate();
  const [checkoutLoadingId, setCheckoutLoadingId] = useState(null);

  useEffect(() => {
    let active = true;
    setStatus('loading');
    api
      .get('/plans')
      .then((res) => {
        if (!active) return;
        setPlans(res.data || []);
        setStatus('success');
      })
      .catch(() => {
        if (!active) return;
        setStatus('error');
      });
    return () => {
      active = false;
    };
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
    <div>
      <HeroSection />
      <LogoStrip />

      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
        variants={staggerContainer}
        className="mx-auto max-w-7xl px-6 py-24 lg:px-8"
      >
        <motion.div variants={fadeUp} className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-[#ececec] sm:text-4xl lg:text-5xl">
            Awesome Membership Perks
          </h2>
          <p className="mt-4 text-[rgba(236,236,236,0.8)]">
            With a BlogSaaS subscription, you get stress-free access to premium writing — consistent quality, delivered at a steady price.
          </p>
        </motion.div>

        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {perks.map((perk) => (
            <PerkCard key={perk.title} {...perk} />
          ))}
        </div>
      </motion.section>

      <section className="mx-auto max-w-6xl px-6 py-24 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={fadeUp}
          className="mx-auto mb-16 max-w-2xl text-center"
        >
          <h2 className="text-3xl font-extrabold tracking-tight text-[#ececec] sm:text-4xl lg:text-5xl">How BlogSaaS works</h2>
          <p className="mt-4 text-[rgba(236,236,236,0.8)]">Three steps between you and unlimited premium content.</p>
        </motion.div>
        <div className="flex flex-col gap-20">
          {steps.map((step, i) => (
            <HowItWorksStep key={step.title} index={i + 1} reverse={i % 2 === 1} {...step} />
          ))}
        </div>
      </section>

      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
        variants={fadeUp}
        className="relative mx-auto max-w-7xl overflow-hidden bg-gradient-to-b from-[#12131e] to-[#1e1414] px-6 py-20 lg:px-8 lg:rounded-[24px]"
      >
        <div className="glow-blob left-1/4 top-0 h-[300px] w-[500px] -translate-x-1/2 bg-[#ff0024]/15" />
        <div className="glow-blob right-1/4 bottom-0 h-[250px] w-[500px] translate-x-1/2 bg-[#02d2df]/10" />
        <div className="relative flex flex-col items-center gap-10 rounded-3xl border border-[rgba(85,129,255,0.25)] bg-white/[0.02] px-8 py-16 text-center backdrop-blur">
          <div className="flex flex-col items-center gap-4">
            <h2 className="text-3xl font-extrabold leading-tight text-[#ececec] sm:text-4xl lg:text-5xl">
              We&apos;ll be your favorite <br className="hidden sm:block" />
              part of the week.
            </h2>
            <p className="max-w-xl text-base text-[rgba(236,236,236,0.8)] sm:text-xl">
              Manage your subscription, track new releases, and read on any device — all from one simple dashboard.
            </p>
          </div>
          <Link to="/signup" className="btn-pill text-base">
            Start reading free
          </Link>
        </div>
      </motion.section>

      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
        variants={staggerContainer}
        className="mx-auto max-w-7xl px-6 py-24 lg:px-8"
      >
        <motion.div variants={fadeUp} className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-[#ececec] sm:text-4xl lg:text-5xl">What readers say about us</h2>
          <p className="mt-4 text-[rgba(236,236,236,0.8)]">Real feedback from subscribers who made the switch.</p>
        </motion.div>
        <div className="mt-14 grid grid-cols-1 gap-10 sm:grid-cols-3">
          {testimonials.map((t) => (
            <TestimonialCard key={t.name} {...t} />
          ))}
        </div>
      </motion.section>

      <section className="relative mx-auto max-w-7xl px-6 py-24 lg:px-8">
        <div className="glow-blob left-1/2 top-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 bg-[#5581ff]/15" />
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={fadeUp}
          className="relative mx-auto mb-14 max-w-2xl text-center"
        >
          <h2 className="text-3xl font-extrabold tracking-tight text-[#ececec] sm:text-4xl lg:text-5xl">Plans &amp; Pricing</h2>
          <p className="mt-4 text-[rgba(236,236,236,0.8)]">No shady charges, no unexpected shocks. One flat fee, every month.</p>
        </motion.div>

        {status === 'loading' && <LoadingSpinner label="Loading plans..." />}
        {status === 'error' && (
          <ErrorState message="Couldn't load pricing plans right now." />
        )}
        {status === 'success' && (
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            variants={staggerContainer}
            className="relative grid grid-cols-1 gap-6 sm:grid-cols-3"
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
      </section>

      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
        variants={staggerContainer}
        className="mx-auto max-w-4xl px-6 py-24 lg:px-8"
      >
        <motion.div variants={fadeUp} className="mx-auto mb-14 max-w-2xl text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-[#ececec] sm:text-4xl lg:text-5xl">Frequently Asked Questions</h2>
          <p className="mt-4 text-[rgba(236,236,236,0.8)]">Everything you need to know about billing and access.</p>
        </motion.div>
        <FaqAccordion faqs={faqs} />
      </motion.section>
    </div>
  );
}
