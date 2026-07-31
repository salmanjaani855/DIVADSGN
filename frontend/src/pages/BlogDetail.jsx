import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CalendarDays, User, Lock, ArrowLeft } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorState from '../components/ErrorState';
import api from '../services/api';
import { fadeUp } from '../animations/variants';

export default function BlogDetail() {
  const { slug } = useParams();
  const [blog, setBlog] = useState(null);
  const [status, setStatus] = useState('loading');

  const fetchBlog = () => {
    setStatus('loading');
    api
      .get(`/blogs/${slug}`)
      .then((res) => {
        setBlog(res.data);
        setStatus('success');
      })
      .catch(() => setStatus('error'));
  };

  useEffect(() => {
    fetchBlog();
  }, [slug]);

  if (status === 'loading') return <LoadingSpinner fullScreen label="Loading article..." />;
  if (status === 'error') return <ErrorState onRetry={fetchBlog} message="Couldn't load this article." />;
  if (!blog) return null;

  const { title, coverImageUrl, author, tags = [], createdAt, content, excerpt, locked } = blog;

  return (
    <article className="pb-24">
      <div className="relative h-[45vh] min-h-[320px] w-full overflow-hidden bg-white/5">
        {coverImageUrl && (
          <img src={coverImageUrl} alt={title} className="h-full w-full object-cover" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-[#0a0a0f]/40 to-transparent" />
      </div>

      <div className="mx-auto max-w-3xl px-6 lg:px-8">
        <motion.div initial="hidden" animate="visible" variants={fadeUp} className="-mt-16 relative">
          <Link to="/blog" className="mb-6 inline-flex items-center gap-2 text-sm text-white/50 hover:text-white">
            <ArrowLeft size={14} /> Back to blog
          </Link>

          <div className="glass rounded-3xl p-8">
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span key={tag} className="rounded-full bg-white/5 px-3 py-1 text-xs font-medium text-white/60">
                  {tag}
                </span>
              ))}
              {locked && (
                <span className="flex items-center gap-1 rounded-full bg-fuchsia-500/15 px-3 py-1 text-xs font-medium text-fuchsia-300">
                  <Lock size={12} /> Premium
                </span>
              )}
            </div>

            <h1 className="mt-5 text-3xl font-extrabold leading-tight text-white sm:text-4xl">
              {title}
            </h1>

            <div className="mt-5 flex flex-wrap items-center gap-5 text-sm text-white/45">
              <span className="flex items-center gap-1.5">
                <User size={14} /> {author?.name || author || 'BlogSaaS'}
              </span>
              {createdAt && (
                <span className="flex items-center gap-1.5">
                  <CalendarDays size={14} /> {new Date(createdAt).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
        </motion.div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          transition={{ delay: 0.1 }}
          className="mt-10"
        >
          {locked ? (
            <div className="relative">
              <div
                className="prose-dark max-w-none"
                style={{
                  maskImage: 'linear-gradient(to bottom, black 20%, transparent 85%)',
                  WebkitMaskImage: 'linear-gradient(to bottom, black 20%, transparent 85%)',
                }}
              >
                <p className="text-lg leading-relaxed">{excerpt}</p>
              </div>
              <div className="relative -mt-10 flex flex-col items-center gap-4 rounded-2xl bg-gradient-to-t from-[#0a0a0f] to-transparent pt-16 pb-4 text-center">
                <p className="max-w-sm text-sm text-white/55">
                  This article is available to subscribers. Choose a plan to unlock the full read instantly.
                </p>
                <Link to="/pricing" className="btn-pill">
                  <Lock size={16} /> Subscribe to unlock
                </Link>
              </div>
            </div>
          ) : (
            <div
              className="prose-dark prose prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          )}
        </motion.div>
      </div>
    </article>
  );
}
