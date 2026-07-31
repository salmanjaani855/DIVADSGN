import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Pencil,
  Trash2,
  X,
  UploadCloud,
  Bold,
  Heading2,
  List,
  Lock,
} from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorState from '../components/ErrorState';
import EmptyState from '../components/EmptyState';
import api from '../services/api';
import { fadeUp } from '../animations/variants';

const ACCESS_LEVELS = ['free', 'pro', 'premium'];

const emptyForm = {
  title: '',
  excerpt: '',
  content: '',
  accessLevel: 'free',
  author: '',
  tags: '',
  coverImageUrl: '',
};

export default function AdminPanel() {
  const [blogs, setBlogs] = useState([]);
  const [status, setStatus] = useState('loading');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formError, setFormError] = useState('');

  const fetchBlogs = () => {
    setStatus('loading');
    api
      .get('/blogs')
      .then((res) => {
        setBlogs(res.data || []);
        setStatus('success');
      })
      .catch(() => setStatus('error'));
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const openCreateModal = () => {
    setEditingId(null);
    setForm(emptyForm);
    setFormError('');
    setModalOpen(true);
  };

  const openEditModal = (blog) => {
    setEditingId(blog._id);
    setForm({
      title: blog.title || '',
      excerpt: blog.excerpt || '',
      content: blog.content || '',
      accessLevel: blog.accessLevel || 'free',
      author: typeof blog.author === 'string' ? blog.author : blog.author?.name || '',
      tags: (blog.tags || []).join(', '),
      coverImageUrl: blog.coverImageUrl || '',
    });
    setFormError('');
    setModalOpen(true);
  };

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const wrapSelection = (before, after = before) => {
    const textarea = document.getElementById('content-textarea');
    if (!textarea) return;
    const { selectionStart, selectionEnd, value } = textarea;
    const selected = value.slice(selectionStart, selectionEnd);
    const newValue =
      value.slice(0, selectionStart) + before + selected + after + value.slice(selectionEnd);
    setForm((f) => ({ ...f, content: newValue }));
    requestAnimationFrame(() => {
      textarea.focus();
      textarea.selectionStart = selectionStart + before.length;
      textarea.selectionEnd = selectionStart + before.length + selected.length;
    });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const data = new FormData();
    data.append('image', file);
    try {
      setUploading(true);
      const res = await api.post('/blogs/upload-image', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setForm((f) => ({ ...f, coverImageUrl: res.data.url }));
    } catch {
      setFormError('Image upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!form.title || !form.excerpt || !form.content) {
      setFormError('Title, excerpt, and content are required.');
      return;
    }

    const payload = {
      title: form.title,
      excerpt: form.excerpt,
      content: form.content,
      accessLevel: form.accessLevel,
      author: form.author,
      coverImageUrl: form.coverImageUrl,
      tags: form.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
    };

    try {
      setSaving(true);
      if (editingId) {
        await api.put(`/blogs/${editingId}`, payload);
      } else {
        await api.post('/blogs', payload);
      }
      setModalOpen(false);
      fetchBlogs();
    } catch (err) {
      setFormError(err?.response?.data?.message || 'Could not save the post.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (blog) => {
    if (!window.confirm(`Delete "${blog.title}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/blogs/${blog._id}`);
      setBlogs((prev) => prev.filter((b) => b._id !== blog._id));
    } catch {
      alert('Could not delete this post.');
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-6 py-16 lg:px-8">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center"
      >
        <div>
          <h1 className="text-3xl font-bold text-white">Admin Panel</h1>
          <p className="mt-2 text-white/50">Create, edit, and manage all blog posts.</p>
        </div>
        <button onClick={openCreateModal} className="btn-pill">
          <Plus size={16} /> New Post
        </button>
      </motion.div>

      <div className="mt-10">
        {status === 'loading' && <LoadingSpinner label="Loading posts..." />}
        {status === 'error' && <ErrorState onRetry={fetchBlogs} message="Couldn't load blog posts." />}
        {status === 'success' && blogs.length === 0 && (
          <EmptyState title="No posts yet" message="Create your first blog post to get started." />
        )}
        {status === 'success' && blogs.length > 0 && (
          <div className="glass overflow-hidden rounded-2xl">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 text-white/40">
                  <th className="px-5 py-3 font-medium">Title</th>
                  <th className="px-5 py-3 font-medium">Access</th>
                  <th className="px-5 py-3 font-medium">Author</th>
                  <th className="px-5 py-3 font-medium">Created</th>
                  <th className="px-5 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {blogs.map((blog) => (
                  <tr key={blog._id} className="border-b border-white/5 text-white/70">
                    <td className="max-w-xs truncate px-5 py-3 font-medium text-white">
                      {blog.locked && <Lock size={12} className="mr-1.5 inline text-fuchsia-300" />}
                      {blog.title}
                    </td>
                    <td className="px-5 py-3 capitalize">{blog.accessLevel}</td>
                    <td className="px-5 py-3">
                      {typeof blog.author === 'string' ? blog.author : blog.author?.name || '—'}
                    </td>
                    <td className="px-5 py-3">
                      {blog.createdAt ? new Date(blog.createdAt).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openEditModal(blog)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-white/60 hover:text-white"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(blog)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-red-300 hover:text-red-200"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AnimatePresence>
        {modalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
            onClick={() => setModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              className="glass max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl p-8"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">
                  {editingId ? 'Edit Post' : 'New Post'}
                </h2>
                <button onClick={() => setModalOpen(false)} className="text-white/50 hover:text-white">
                  <X size={20} />
                </button>
              </div>

              {formError && (
                <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                  {formError}
                </div>
              )}

              <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
                <label className="flex flex-col gap-1.5">
                  <span className="text-xs font-medium text-white/60">Title</span>
                  <input
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none"
                    placeholder="Article title"
                  />
                </label>

                <label className="flex flex-col gap-1.5">
                  <span className="text-xs font-medium text-white/60">Excerpt</span>
                  <textarea
                    name="excerpt"
                    value={form.excerpt}
                    onChange={handleChange}
                    rows={2}
                    className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none"
                    placeholder="Short preview shown in listings and for locked articles"
                  />
                </label>

                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-medium text-white/60">Content (HTML)</span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => wrapSelection('<strong>', '</strong>')}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-white/60 hover:text-white"
                    >
                      <Bold size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => wrapSelection('<h2>', '</h2>')}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-white/60 hover:text-white"
                    >
                      <Heading2 size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => wrapSelection('<ul>\n  <li>', '</li>\n</ul>')}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-white/60 hover:text-white"
                    >
                      <List size={14} />
                    </button>
                  </div>
                  <textarea
                    id="content-textarea"
                    name="content"
                    value={form.content}
                    onChange={handleChange}
                    rows={8}
                    className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 font-mono text-sm text-white placeholder:text-white/30 focus:outline-none"
                    placeholder="<p>Write your article content as HTML...</p>"
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <label className="flex flex-col gap-1.5">
                    <span className="text-xs font-medium text-white/60">Access level</span>
                    <select
                      name="accessLevel"
                      value={form.accessLevel}
                      onChange={handleChange}
                      className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:outline-none"
                    >
                      {ACCESS_LEVELS.map((level) => (
                        <option key={level} value={level} className="bg-[#0a0a0f]">
                          {level}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="flex flex-col gap-1.5">
                    <span className="text-xs font-medium text-white/60">Author</span>
                    <input
                      name="author"
                      value={form.author}
                      onChange={handleChange}
                      className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none"
                      placeholder="Author name"
                    />
                  </label>
                </div>

                <label className="flex flex-col gap-1.5">
                  <span className="text-xs font-medium text-white/60">Tags (comma-separated)</span>
                  <input
                    name="tags"
                    value={form.tags}
                    onChange={handleChange}
                    className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none"
                    placeholder="design, startups, ai"
                  />
                </label>

                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-medium text-white/60">Cover image</span>
                  <div className="flex items-center gap-4">
                    {form.coverImageUrl && (
                      <img
                        src={form.coverImageUrl}
                        alt="cover"
                        className="h-14 w-20 rounded-lg object-cover"
                      />
                    )}
                    <label className="btn-pill-outline cursor-pointer text-sm">
                      <UploadCloud size={14} /> {uploading ? 'Uploading...' : 'Upload image'}
                      <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    </label>
                  </div>
                </div>

                <div className="mt-4 flex justify-end gap-3">
                  <button type="button" onClick={() => setModalOpen(false)} className="btn-pill-outline">
                    Cancel
                  </button>
                  <button type="submit" disabled={saving} className="btn-pill disabled:opacity-60">
                    {saving ? 'Saving...' : editingId ? 'Save changes' : 'Create post'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
