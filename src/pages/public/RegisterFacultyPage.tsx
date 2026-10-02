import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  GraduationCap,
  ShieldCheck,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { CampusBadge } from '../../components/common/CampusBadge';

export const RegisterFacultyPage: React.FC = () => {
  const { registerFaculty } = useAuth();

  const [form, setForm] = useState({
    name: '',
    email: '',
    facultyId: '',
    department: 'Computer Engineering',
    designation: 'Assistant Professor',
    expertise: 'Machine Learning, Deep Learning, Python',
    researchAreas: 'Computer Vision, Generative AI',
    mentoringAreas: 'Projects, Research, Career Planning',
    maxCapacity: 4,
    availability: 'Available',
    password: '',
    confirmPassword: ''
  });

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await registerFaculty({
        name: form.name,
        email: form.email,
        facultyId: form.facultyId,
        department: form.department,
        designation: form.designation,
        expertise: form.expertise.split(',').map(s => s.trim()),
        researchAreas: form.researchAreas.split(',').map(r => r.trim()),
        mentoringAreas: form.mentoringAreas.split(',').map(m => m.trim()),
        maxCapacity: form.maxCapacity,
        availability: form.availability,
        password: form.password
      });
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Faculty registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex items-center gap-2 mb-3">
            <div className="w-10 h-10 rounded-xl bg-[#7A1528] flex items-center justify-center text-white">
              <GraduationCap className="w-6 h-6 text-[#C89B3C]" />
            </div>
          </Link>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Faculty Mentor Onboarding</h1>
          <p className="text-xs text-slate-500 mt-1">Join the campus mentoring directory to guide student capstone and research milestones</p>
          <div className="mt-2 flex justify-center"><CampusBadge /></div>
        </div>

        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200">
          {success ? (
            <div className="text-center py-8">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Registration submitted successfully.</h3>
              <p className="text-xs text-slate-600 mt-2 max-w-md mx-auto leading-relaxed">
                Your account will be available after college verification. Once verified by college administration, you can sign in to guide student mentorships.
              </p>
              <div className="mt-6 flex justify-center">
                <Link
                  to="/login"
                  className="px-5 py-2.5 bg-[#7A1528] text-white rounded-xl text-xs font-bold hover:bg-[#631020]"
                >
                  Return to College Login
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name & Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Kavita Sharma"
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#7A1528] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">College Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. kavita.sharma@edupilot.local"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#7A1528] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Faculty ID Number</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. FAC-CE-2026-115"
                    value={form.facultyId}
                    onChange={e => setForm({ ...form, facultyId: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#7A1528] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Department</label>
                  <select
                    value={form.department}
                    onChange={e => setForm({ ...form, department: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#7A1528] focus:outline-none bg-white"
                  >
                    <option value="Computer Engineering">Computer Engineering</option>
                    <option value="Information Technology">Information Technology</option>
                    <option value="Electronics & Telecommunication">Electronics & Telecommunication</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Designation</label>
                  <select
                    value={form.designation}
                    onChange={e => setForm({ ...form, designation: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#7A1528] focus:outline-none bg-white"
                  >
                    <option value="Professor">Professor</option>
                    <option value="Associate Professor">Associate Professor</option>
                    <option value="Assistant Professor">Assistant Professor</option>
                    <option value="Adjunct Professor">Adjunct Professor</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Maximum Mentoring Capacity</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={form.maxCapacity}
                    onChange={e => setForm({ ...form, maxCapacity: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#7A1528] focus:outline-none"
                  />
                  <p className="text-[10px] text-slate-400 mt-0.5">Students allowed concurrently</p>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Areas of Expertise (Comma separated)</label>
                  <input
                    type="text"
                    placeholder="e.g. Distributed Systems, Machine Learning, Cloud Security"
                    value={form.expertise}
                    onChange={e => setForm({ ...form, expertise: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#7A1528] focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Research Areas</label>
                  <input
                    type="text"
                    placeholder="e.g. Federated Learning, Quantum Cryptography"
                    value={form.researchAreas}
                    onChange={e => setForm({ ...form, researchAreas: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#7A1528] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••••••"
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#7A1528] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Confirm Password</label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••••••"
                    value={form.confirmPassword}
                    onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#7A1528] focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 px-4 rounded-xl text-white text-xs font-bold bg-[#7A1528] hover:bg-[#631020] shadow-sm shadow-[#7A1528]/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {loading ? 'Submitting...' : 'Register as Faculty Mentor'}
                </button>
              </div>

              <p className="text-center text-xs text-slate-500 pt-2">
                Already registered?{' '}
                <Link to="/login" className="text-[#7A1528] font-bold hover:underline">
                  Sign In
                </Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
