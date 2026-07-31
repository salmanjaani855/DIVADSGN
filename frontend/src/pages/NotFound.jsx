import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Compass } from 'lucide-react';
import { fadeUp } from '../animations/variants';

export default function NotFound() {
  return (
    <div className="relative flex min-h-[80vh] flex-col items-center justify-center overflow-hidden px-6 text-center">
      <div className="glow-blob left-1/2 top-1/2 h-[380px] w-[380px] -translate-x-1/2 -translate-y-1/2 bg-fuchsia-600/25" />

      <motion.div initial="hidden" animate="visible" variants={fadeUp} className="relative">
        <p className="text-8xl font-black text-gradient">404</p>
        <h1 className="mt-4 text-2xl font-bold text-white">Page not found</h1>
        <p className="mt-3 max-w-sm text-white/50">
          The page you're looking for doesn't exist or may have been moved.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link to="/" className="btn-pill">
            <Home size={16} /> Back home
          </Link>
          <Link to="/blog" className="btn-pill-outline">
            <Compass size={16} /> Browse blog
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
