import { Link } from 'react-router-dom';
import { Lock } from 'lucide-react';

export default function LockedOverlay({ compact = false }) {
  return (
    <div className="pointer-events-none absolute inset-0 flex items-end justify-center bg-gradient-to-t from-[#0a0a0f] via-[#0a0a0f]/70 to-transparent">
      <div className="pointer-events-auto mb-6 flex flex-col items-center gap-3 text-center">
        {!compact && (
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur">
            <Lock size={16} />
          </span>
        )}
        <Link to="/pricing" className="btn-pill text-sm">
          <Lock size={14} /> Subscribe to unlock
        </Link>
      </div>
    </div>
  );
}
