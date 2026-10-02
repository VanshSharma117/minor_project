import React, { useEffect, useState } from 'react';
import { Megaphone, Plus, Bell, Users, CheckCircle2 } from 'lucide-react';
import { api } from '../../services/api';
import { Announcement } from '../../types';

export const AnnouncementsPage: React.FC = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [targetAudience, setTargetAudience] = useState<'All' | 'Students' | 'Faculty'>('All');
  const [category, setCategory] = useState<'General' | 'Projects' | 'Internships' | 'Mentoring Hours'>('Projects');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const loadAnnouncements = async () => {
    try {
      const data = await api.getAnnouncements();
      setAnnouncements(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return;

    try {
      const created = await api.createAnnouncement({
        title,
        content,
        targetAudience,
        category
      });
      setAnnouncements([created, ...announcements]);
      setIsModalOpen(false);
      setTitle('');
      setContent('');
    } catch (err: any) {
      alert(err.message || 'Failed to publish announcement');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Campus Announcements</h1>
          <p className="text-xs text-slate-500 mt-1">
            Broadcast official notices regarding capstone deadlines, internship drives, and mentoring hours.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-[#7A1528] text-white text-xs font-bold rounded-xl hover:bg-[#631020] flex items-center gap-1.5 self-start sm:self-auto shadow-xs"
        >
          <Plus className="w-4 h-4" /> Publish Announcement
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-400 text-xs">Loading announcements...</div>
      ) : (
        <div className="space-y-4">
          {announcements.map(ann => (
            <div
              key={ann.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs hover:shadow-xs transition-shadow"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-[#7A1528]">
                    {ann.category}
                  </span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                    Audience: {ann.targetAudience}
                  </span>
                </div>

                <span className="text-xs text-slate-400">
                  {new Date(ann.createdAt).toLocaleDateString()}
                </span>
              </div>

              <div className="mt-3">
                <h3 className="font-bold text-sm text-slate-900">{ann.title}</h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{ann.content}</p>
                <p className="text-[10px] text-slate-400 mt-2">
                  Authorized by: <strong className="text-slate-700">{ann.authorName}</strong>
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Publish Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 text-xs">
            <h3 className="font-bold text-base text-slate-900 mb-3">Publish Campus Announcement</h3>
            <form onSubmit={handleCreate} className="space-y-3.5">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Notice Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Final Year Project Mentoring Week"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#7A1528] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Target Audience</label>
                  <select
                    value={targetAudience}
                    onChange={e => setTargetAudience(e.target.value as any)}
                    className="w-full p-2 border border-slate-300 rounded-xl bg-white"
                  >
                    <option value="All">All Campus</option>
                    <option value="Students">Students Only</option>
                    <option value="Faculty">Faculty Only</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value as any)}
                    className="w-full p-2 border border-slate-300 rounded-xl bg-white"
                  >
                    <option value="Projects">Projects</option>
                    <option value="Internships">Internships</option>
                    <option value="Mentoring Hours">Mentoring Hours</option>
                    <option value="General">General</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Notice Content</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Detailed guidelines, deadlines, or department instructions..."
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#7A1528] focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#7A1528] text-white font-bold rounded-xl"
                >
                  Broadcast Notice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
