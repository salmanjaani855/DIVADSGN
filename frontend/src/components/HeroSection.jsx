import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import { fadeUp, fadeDown, viewportOnce } from '../animations/variants';

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden pt-28 pb-24 sm:pt-36 sm:pb-32">
      <div className="glow-blob left-1/2 top-[-10%] h-[440px] w-[440px] -translate-x-1/2 bg-[#ff536b]/35" />
      <div className="glow-blob left-[8%] top-[22%] h-[300px] w-[300px] bg-[#5581ff]/30" />
      <div className="glow-blob right-[8%] top-[8%] h-[280px] w-[280px] bg-[#02d2df]/20" />

      <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center px-6 text-center">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeDown}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-[rgba(236,236,236,0.8)] backdrop-blur"
        >
          <Sparkles size={14} className="text-[#ff536b]" />
          Trusted by 12,000+ curious readers
        </motion.div>

        <motion.h1
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="text-4xl font-extrabold leading-[1.1] tracking-tight text-[#ececec] sm:text-6xl lg:text-[64px] lg:leading-[1.15]"
        >
          One fixed fee a month gets you{' '}
          <span className="text-gradient">unlimited premium</span> blog
          content.
        </motion.h1>

        <motion.p
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          transition={{ delay: 0.1 }}
          className="mt-6 max-w-2xl text-base text-[rgba(236,236,236,0.8)] sm:text-xl"
        >
          Expert-written articles, deep dives, and guides — all unlocked
          instantly. Pick a plan, read anywhere, cancel anytime. No fluff,
          just great writing delivered every week.
        </motion.p>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          transition={{ delay: 0.2 }}
          className="mt-10 flex flex-col items-center gap-4 sm:flex-row"
        >
          <Link to="/pricing" className="btn-pill text-base">
            Get Started <ArrowRight size={18} />
          </Link>
          <Link to="/blog" className="btn-pill-outline text-base">
            Browse the blog
          </Link>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={fadeUp}
          transition={{ delay: 0.1 }}
          className="mt-16 w-full max-w-3xl overflow-hidden rounded-3xl border border-[#ff536b]/40 bg-white/5 p-2 shadow-2xl shadow-black/40 backdrop-blur"
        >
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
            {['Design', 'Startups', 'AI', 'Culture', 'Growth', 'Code'].map((tag) => (
              <div
                key={tag}
                className="flex h-16 items-center justify-center rounded-xl bg-gradient-to-br from-white/10 to-white/[0.02] text-[11px] font-semibold text-[rgba(236,236,236,0.8)] sm:h-20 sm:text-xs"
              >
                {tag}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
