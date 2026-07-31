import { motion } from 'framer-motion';
import { fadeIn, viewportOnce } from '../animations/variants';

const logos = ['FORBES', 'TechCrunch', 'The Verge', 'WIRED', 'FastCompany'];

export default function LogoStrip() {
  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={viewportOnce}
      variants={fadeIn}
      className="border-y border-white/5 bg-white/[0.02] py-10"
    >
      <div className="mx-auto max-w-6xl px-6">
        <p className="mb-6 text-center text-xs font-medium uppercase tracking-widest text-white/30">
          Featured in
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
          {logos.map((logo) => (
            <span
              key={logo}
              className="select-none text-lg font-bold tracking-tight text-white/25 transition-colors hover:text-white/50 sm:text-xl"
            >
              {logo}
            </span>
          ))}
        </div>
      </div>
    </motion.section>
  );
}
