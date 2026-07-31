import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { fadeUp } from '../animations/variants';

export default function FaqAccordion({ faqs }) {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <div className="flex flex-col gap-6">
      {faqs.map((faq, i) => {
        const isOpen = openIndex === i;
        const number = String(i + 1).padStart(2, '0');
        return (
          <motion.div
            key={faq.question}
            variants={fadeUp}
            className="flex flex-col gap-6 border-b border-white/10 pb-6"
          >
            <button
              onClick={() => setOpenIndex(isOpen ? -1 : i)}
              className="flex w-full items-start justify-center gap-6 text-left"
            >
              <span
                className={`w-8 shrink-0 text-center text-xl sm:text-2xl ${
                  isOpen ? 'text-gradient font-semibold' : 'text-[#ececec]'
                }`}
              >
                {number}
              </span>
              <span className="flex-1 text-lg leading-8 text-[#ececec] sm:text-2xl">
                {faq.question}
              </span>
              <motion.span
                animate={{ rotate: isOpen ? 180 : 0 }}
                transition={{ duration: 0.25 }}
                className="mt-1 shrink-0 text-[#ececec]/60"
              >
                <ChevronDown size={20} />
              </motion.span>
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden"
                >
                  <p className="pl-14 text-sm leading-relaxed text-[rgba(236,236,236,0.8)] sm:text-base">
                    {faq.answer}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </div>
  );
}
