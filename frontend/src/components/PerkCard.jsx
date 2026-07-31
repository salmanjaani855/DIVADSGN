import { motion } from 'framer-motion';
import { fadeUp } from '../animations/variants';

export default function PerkCard({ icon, title, description }) {
  return (
    <motion.div
      variants={fadeUp}
      whileHover={{ y: -6, scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="card-perk flex h-full min-h-[300px] flex-col items-center gap-6 p-6 text-center sm:min-h-[340px]"
    >
      <img src={icon} alt="" className="h-24 w-24 shrink-0 sm:h-28 sm:w-28" />
      <div className="flex flex-col items-center gap-3">
        <h3 className="text-lg font-bold text-[#ececec] sm:text-xl">{title}</h3>
        <p className="text-sm leading-relaxed text-[rgba(236,236,236,0.8)] sm:text-[15px]">
          {description}
        </p>
      </div>
    </motion.div>
  );
}
