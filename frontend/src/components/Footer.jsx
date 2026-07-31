import { Link } from 'react-router-dom';
import { Sparkles, MessageCircle, Code2, Briefcase } from 'lucide-react';

const columns = [
  {
    title: 'Product',
    links: [
      { label: 'Home', to: '/' },
      { label: 'Pricing', to: '/pricing' },
      { label: 'Blog', to: '/blog' },
    ],
  },
  {
    title: 'Account',
    links: [
      { label: 'Log in', to: '/login' },
      { label: 'Sign up', to: '/signup' },
      { label: 'Dashboard', to: '/dashboard' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', to: '/' },
      { label: 'Contact', to: '/' },
      { label: 'Careers', to: '/' },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-white/5 bg-[#07070b]">
      <div className="mx-auto max-w-7xl px-6 pt-16 pb-8 lg:px-8">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-5">
          <div className="col-span-2">
            <Link to="/" className="flex items-center gap-2 text-lg font-bold tracking-tight text-white">
              {/* <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-fuchsia-500 to-violet-600 shadow-lg shadow-fuchsia-500/30">
                <Sparkles size={18} />
              </span> */}
              <span>
                DIVA<span className="text-gradient">DSGN</span>
              </span>
            </Link>
            <p className="mt-4 max-w-sm text-sm text-white/50">
              One subscription. Unlimited premium blog content. Expert-written
              articles delivered every week, unlocked instantly on any plan.
            </p>
            <div className="mt-6 flex gap-3">
              {[MessageCircle, Code2, Briefcase].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-white/50 transition-colors hover:border-white/20 hover:text-white"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="text-sm font-semibold text-white">{col.title}</h4>
              <ul className="mt-4 flex flex-col gap-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link to={link.to} className="text-sm text-white/50 transition-colors hover:text-white">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-white/5 pt-6 sm:flex-row">
          <p className="text-xs text-white/40">
            ©2023 DIVADSGN. All rights reserved.
          </p>
          <p className="text-xs text-white/40">Built for readers who never stop learning.</p>
        </div>

        <div
          aria-hidden
          className="pointer-events-none mt-4 -mb-10 flex select-none justify-center text-center text-[18vw] font-black leading-none tracking-tighter sm:text-[12vw]"
        >
          <span className="text-gradient opacity-20">DIVA</span>
          <span className="text-[white]/10">DSGN</span>
        </div>
      </div>
    </footer>
  );
}
