import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Sparkles, LayoutDashboard, ShieldCheck, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/pricing', label: 'Pricing' },
  { to: '/blog', label: 'Blog' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setOpen(false);
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-[#0a0a0f]/70 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
        <Link to="/" className="flex items-center gap-2 text-lg font-bold tracking-tight text-white">
          {/* <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#ff536b] to-[#5581ff] shadow-lg shadow-[#ff536b]/30">
            <Sparkles className="h-4.5 w-4.5" size={18} />
          </span> */}
          <span>
            DIVA<span className="text-gradient">DSGN</span>
          </span>
        </Link>

        <div className="hidden items-center gap-8 lg:flex">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `text-sm font-medium transition-colors ${
                  isActive ? 'text-white' : 'text-white/60 hover:text-white'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </div>

        <div className="hidden items-center gap-3 lg:flex">
          {user ? (
            <>
              {user.role === 'admin' && (
                <Link to="/admin" className="btn-pill-outline !py-2 !px-4 text-sm">
                  <ShieldCheck size={16} /> Admin
                </Link>
              )}
              <Link to="/dashboard" className="btn-pill-outline !py-2 !px-4 text-sm">
                <LayoutDashboard size={16} /> Dashboard
              </Link>
              <button onClick={handleLogout} className="btn-pill !py-2 !px-4 text-sm">
                <LogOut size={16} /> Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm font-medium text-white/70 hover:text-white">
                Log in
              </Link>
              <Link to="/signup" className="btn-pill !py-2 !px-5 text-sm">
                Get Started
              </Link>
            </>
          )}
        </div>

        <button
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 text-white lg:hidden"
          onClick={() => setOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden border-t border-white/5 bg-[#0a0a0f] lg:hidden"
          >
            <div className="flex flex-col gap-1 px-6 py-4">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `rounded-lg px-3 py-2.5 text-sm font-medium ${
                      isActive ? 'bg-white/5 text-white' : 'text-white/60'
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
              <div className="mt-2 flex flex-col gap-2 border-t border-white/5 pt-4">
                {user ? (
                  <>
                    {user.role === 'admin' && (
                      <Link to="/admin" onClick={() => setOpen(false)} className="btn-pill-outline w-full justify-center">
                        <ShieldCheck size={16} /> Admin
                      </Link>
                    )}
                    <Link to="/dashboard" onClick={() => setOpen(false)} className="btn-pill-outline w-full justify-center">
                      <LayoutDashboard size={16} /> Dashboard
                    </Link>
                    <button onClick={handleLogout} className="btn-pill w-full justify-center">
                      <LogOut size={16} /> Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/login" onClick={() => setOpen(false)} className="btn-pill-outline w-full justify-center">
                      Log in
                    </Link>
                    <Link to="/signup" onClick={() => setOpen(false)} className="btn-pill w-full justify-center">
                      Get Started
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
