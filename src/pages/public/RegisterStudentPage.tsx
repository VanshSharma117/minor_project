import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  User,
  Mail,
  Lock,
  BookOpen,
  Phone,
  Target,
  Code,
  ShieldCheck,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { CampusBadge } from '../../components/common/CampusBadge';

export const RegisterStudentPage: React.FC = () => {
  const { registerStudent } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    email: '',
    studentId: '',
    department: 'Computer Engineering',
    semester: 4,
    division: 'A',
    phone: '',
    password: '',
    confirmPassword: '',
    skills: 'Python, C++, Data Structures',
    interests: 'AI/ML, Web Development',
    careerGoal: 'Software Development Engineer'
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
      await registerStudent({
        name: form.name,
        email: form.email,
        studentId: form.studentId,
        department: form.department,
        semester: form.semester,
        division: form.division,
        phone: form.phone,
        password: form.password,
        skills: form.skills.split(',').map(s => s.trim()),
        interests: form.interests.split(',').map(i => i.trim()),
        careerGoal: form.careerGoal
      });
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Registration failed');
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
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Student Campus Registration</h1>
          <p className="text-xs text-slate-500 mt-1">Enroll into EduPilot AI mentoring platform with your college credentials</p>
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
                Your account will be available after college verification. Once verified by college administration, you can sign in to find mentors and access AI guidance.
              </p>
              <div className="mt-6 flex justify-center gap-3">
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
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Siddharth Deshmukh"
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
                    placeholder="e.g. student@edupilot.local"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#7A1528] focus:outline-none"
                  />
                  <p className="text-[10px] text-slate-400 mt-0.5">Must end with @college.edu or @edupilot.local</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Student ID / Enrollment Number</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. STU-CE-2025-088"
                    value={form.studentId}
                    onChange={e => setForm({ ...form, studentId: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#7A1528] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    placeholder="+91 98200 00000"
                    value={form.phone}
                    onChange={e => setForm({ ...form, phone: e.target.value })}
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

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Semester</label>
                    <select
                      value={form.semester}
                      onChange={e => setForm({ ...form, semester: Number(e.target.value) })}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#7A1528] focus:outline-none bg-white"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                        <option key={s} value={s}>Sem {s}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Division</label>
                    <select
                      value={form.division}
                      onChange={e => setForm({ ...form, division: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#7A1528] focus:outline-none bg-white"
                    >
                      <option value="A">Division A</option>
                      <option value="B">Division B</option>
                      <option value="C">Division C</option>
                    </select>
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Technical Skills (Comma separated)</label>
                  <input
                    type="text"
                    placeholder="e.g. C++, Python, React, Machine Learning"
                    value={form.skills}
                    onChange={e => setForm({ ...form, skills: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#7A1528] focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Interests & Research Areas</label>
                  <input
                    type="text"
                    placeholder="e.g. AI/ML, Cloud Computing, Cybersecurity"
                    value={form.interests}
                    onChange={e => setForm({ ...form, interests: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#7A1528] focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Career Goal / Post-Graduation Aspiration</label>
                  <input
                    type="text"
                    placeholder="e.g. Software Engineer at Product Firm or MS in Robotics"
                    value={form.careerGoal}
                    onChange={e => setForm({ ...form, careerGoal: e.target.value })}
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
                  {loading ? 'Submitting Registration...' : 'Complete Student Registration'}
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
