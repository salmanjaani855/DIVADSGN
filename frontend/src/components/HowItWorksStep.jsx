import { motion } from 'framer-motion';
import { slideInLeft, slideInRight, viewportOnce } from '../animations/variants';

export default function HowItWorksStep({ index, title, description, icon: Icon, reverse }) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={viewportOnce}
      variants={reverse ? slideInRight : slideInLeft}
      className={`flex flex-col items-center gap-10 lg:flex-row ${
        reverse ? 'lg:flex-row-reverse' : ''
      }`}
    >
      <div className="w-full lg:w-1/2">
        <div className="glass relative flex aspect-video items-center justify-center overflow-hidden rounded-3xl p-10">
          <div className="glow-blob left-1/2 top-1/2 h-52 w-52 -translate-x-1/2 -translate-y-1/2 bg-[#5581ff]/30" />
          <Icon size={72} className="relative z-10 text-[#ff8398]" strokeWidth={1.25} />
        </div>
      </div>
      <div className="w-full lg:w-1/2">
        <span className="text-sm font-semibold text-[#ff536b]">Step {index}</span>
        <h3 className="mt-2 text-2xl font-bold text-[#ececec] sm:text-3xl">{title}</h3>
        <p className="mt-4 max-w-md text-[rgba(236,236,236,0.8)]">{description}</p>
      </div>
    </motion.div>
  );
}
