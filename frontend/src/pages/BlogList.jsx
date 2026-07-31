import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Newspaper } from 'lucide-react';
import BlogCard from '../components/BlogCard';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import api from '../services/api';
import { fadeUp, staggerContainer } from '../animations/variants';

function BlogCardSkeleton() {
  return (
    <div className="glass flex h-full flex-col overflow-hidden rounded-2xl">
      <div className="aspect-[16/10] w-full animate-pulse bg-white/5" />
      <div className="flex flex-col gap-3 p-5">
        <div className="h-3 w-1/3 animate-pulse rounded bg-white/5" />
        <div className="h-4 w-4/5 animate-pulse rounded bg-white/5" />
        <div className="h-3 w-full animate-pulse rounded bg-white/5" />
        <div className="h-3 w-2/3 animate-pulse rounded bg-white/5" />
      </div>
    </div>
  );
}

export default function BlogList() {
  const [blogs, setBlogs] = useState([]);
  const [status, setStatus] = useState('loading');

  const fetchBlogs = () => {
    setStatus('loading');
    api
      .get('/blogs')
      .then((res) => {
        setBlogs(res.data || []);
        setStatus((res.data || []).length ? 'success' : 'empty');
      })
      .catch(() => setStatus('error'));
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  return (
    <div className="relative overflow-hidden py-24">
      <div className="glow-blob left-1/2 top-0 h-[350px] w-[350px] -translate-x-1/2 bg-violet-600/20" />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="mx-auto mb-14 max-w-2xl text-center"
        >
          <h1 className="text-4xl font-extrabold text-white sm:text-5xl">The Blog</h1>
          <p className="mt-4 text-white/55">
            Guides, essays, and deep dives from our writers. Some articles are free, others unlock with a subscription.
          </p>
        </motion.div>

        {status === 'loading' && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <BlogCardSkeleton key={i} />
            ))}
          </div>
        )}

        {status === 'error' && <ErrorState onRetry={fetchBlogs} message="Couldn't load blog posts." />}

        {status === 'empty' && (
          <EmptyState
            icon={Newspaper}
            title="No posts yet"
            message="New articles are on the way — check back soon."
          />
        )}

        {status === 'success' && (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {blogs.map((blog) => (
              <BlogCard key={blog._id} blog={blog} />
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
