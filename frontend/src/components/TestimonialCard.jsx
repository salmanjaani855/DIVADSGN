import { motion } from 'framer-motion';
import { fadeUp } from '../animations/variants';
import starIcon from '../assets/figma/icon-star.svg';

export default function TestimonialCard({ name, role, quote, avatar }) {
  return (
    <motion.div
      variants={fadeUp}
      whileHover={{ y: -6 }}
      className="flex h-full flex-col items-center gap-10"
    >
      <div className="flex flex-col items-center gap-6">
        <p className="text-center text-base leading-relaxed text-[#ececec] sm:text-lg">
          “{quote}”
        </p>
        <div className="flex flex-col items-center gap-3">
          <img
            src={avatar}
            alt={name}
            className="h-14 w-14 rounded-full object-cover"
          />
          <div className="flex flex-col items-center gap-1">
            <p className="text-[17px] font-bold text-[#ececec]">{name}</p>
            <p className="text-[15px] text-[rgba(236,236,236,0.8)]">{role}</p>
          </div>
          <div className="flex gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <img key={i} src={starIcon} alt="" className="h-4 w-4" />
            ))}
          </div>
        </div>
      </div>
      <div className="h-px w-full bg-[#5d4343]" />
    </motion.div>
  );
}
