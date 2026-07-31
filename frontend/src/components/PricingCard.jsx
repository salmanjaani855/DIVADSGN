import { motion } from 'framer-motion';
import { fadeUp } from '../animations/variants';
import checkIcon from '../assets/figma/icon-check.svg';

export default function PricingCard({ plan, popular, onSelect, loading, currentPlan }) {
  const isCurrent = currentPlan && currentPlan === plan.accessLevel;

  return (
    <motion.div
      variants={fadeUp}
      whileHover={{ y: -8 }}
      className={`relative flex h-full flex-col gap-10 rounded-3xl px-8 py-12 ${
        popular
          ? 'border border-[#ff0024] bg-gradient-to-b from-[rgba(255,83,107,0.12)] via-[rgba(210,210,210,0.08)] to-[rgba(210,210,210,0.08)] shadow-[0_60px_80px_-40px_rgba(0,0,0,0.35)] sm:scale-[1.03]'
          : 'border border-[rgba(119,119,119,0.5)] bg-[rgba(210,210,210,0.05)]'
      }`}
    >
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <p className="text-2xl font-bold text-[#ececec] sm:text-3xl">{plan.name}</p>
            {popular && (
              <span className="rounded-md bg-[#5581ff] px-2 py-1 text-[11px] font-bold uppercase tracking-wide text-[#fcfcfd]">
                Popular
              </span>
            )}
          </div>
        </div>

        <div className="h-px w-full bg-white/10" />

        <div className="flex flex-col gap-1">
          <div className="flex items-start gap-1">
            <span className="mt-1 text-xl text-[#ececec]">$</span>
            <span className="text-4xl font-bold leading-none text-[#ececec] sm:text-[40px]">
              {plan.price}
            </span>
            <span className="mt-2.5 text-sm font-bold text-[rgba(236,236,236,0.8)]">/mo</span>
          </div>
          <p className="text-sm text-[rgba(236,236,236,0.8)]">Pause or cancel anytime.</p>
        </div>
      </div>

      <ul className="flex flex-1 flex-col gap-4">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2 text-[15px] text-[#ececec]">
            <img src={checkIcon} alt="" className="mt-1 h-3.5 w-3.5 shrink-0" />
            {feature}
          </li>
        ))}
      </ul>

      <button
        onClick={() => onSelect(plan)}
        disabled={loading || isCurrent}
        className="btn-pill w-full justify-center disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isCurrent ? 'Current Plan' : loading ? 'Redirecting...' : plan.price === 0 ? 'Get Started' : 'Get Started'}
      </button>
    </motion.div>
  );
}
