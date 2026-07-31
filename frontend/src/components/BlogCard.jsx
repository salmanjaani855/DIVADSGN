import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, ArrowUpRight } from 'lucide-react';
import { fadeUp } from '../animations/variants';

export default function BlogCard({ blog }) {
  const { slug, title, excerpt, coverImageUrl, tags = [], locked, author, createdAt } = blog;

  return (
    <motion.div variants={fadeUp} whileHover={{ y: -6 }} className="group h-full">
      <Link
        to={`/blog/${slug}`}
        className="glass flex h-full flex-col overflow-hidden rounded-2xl transition-shadow hover:shadow-2xl hover:shadow-fuchsia-900/20"
      >
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-white/5">
          {coverImageUrl ? (
            <img
              src={coverImageUrl}
              alt={title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-fuchsia-600/20 to-violet-700/20 text-white/20">
              No image
            </div>
          )}
          {locked && (
            <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-black/60 px-3 py-1 text-xs font-medium text-white backdrop-blur">
              <Lock size={12} /> Locked
            </span>
          )}
        </div>

        <div className="flex flex-1 flex-col p-5">
          <div className="flex flex-wrap gap-2">
            {tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-white/5 px-2.5 py-0.5 text-[11px] font-medium text-white/50"
              >
                {tag}
              </span>
            ))}
          </div>
          <h3 className="mt-3 line-clamp-2 text-base font-semibold text-white">{title}</h3>
          <p className="mt-2 line-clamp-2 flex-1 text-sm text-white/50">{excerpt}</p>
          <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-3 text-xs text-white/40">
            <span>
              {author?.name || author || 'BlogSaaS'} ·{' '}
              {createdAt ? new Date(createdAt).toLocaleDateString() : ''}
            </span>
            <ArrowUpRight size={14} className="text-white/40 transition-colors group-hover:text-fuchsia-300" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
