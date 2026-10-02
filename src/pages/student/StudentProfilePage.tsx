import React, { useState } from 'react';
import {
  User,
  GraduationCap,
  BookOpen,
  Award,
  Edit3,
  CheckCircle2,
  Save,
  X,
  Target,
  Code,
  Sparkles,
  Phone,
  Mail,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { StudentProfile } from '../../types';

export const StudentProfilePage: React.FC = () => {
  const { user, profile, refreshProfile } = useAuth();
  const stuProfile = profile as StudentProfile | null;

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    phone: stuProfile?.phone || '',
    skills: stuProfile?.skills.join(', ') || '',
    interests: stuProfile?.interests.join(', ') || '',
    careerGoal: stuProfile?.careerGoal || '',
    projectInterests: stuProfile?.projectInterests.join(', ') || '',
    preferredMentoringAreas: stuProfile?.preferredMentoringAreas.join(', ') || '',
    semester: stuProfile?.semester || 6,
    division: stuProfile?.division || 'A'
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg(null);
    try {
      await api.updateStudentProfile({
        phone: formData.phone,
        skills: formData.skills.split(',').map(s => s.trim()).filter(Boolean),
        interests: formData.interests.split(',').map(i => i.trim()).filter(Boolean),
        careerGoal: formData.careerGoal,
        projectInterests: formData.projectInterests.split(',').map(p => p.trim()).filter(Boolean),
        preferredMentoringAreas: formData.preferredMentoringAreas.split(',').map(m => m.trim()).filter(Boolean),
        semester: Number(formData.semester),
        division: formData.division
      });
      await refreshProfile();
      setSuccessMsg('Profile updated successfully!');
      setIsEditing(false);
    } catch (err: any) {
      alert(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const completion = stuProfile?.profileCompletion || 82;

  return (
    <div className="space-y-6">
      {/* Top Profile Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <img
              src={user?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
              alt={user?.name}
              className="w-20 h-20 rounded-2xl object-cover border-2 border-slate-200 shadow-xs"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900">{user?.name}</h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Verified Student
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Enrollment ID: <span className="font-mono font-semibold text-slate-800">{stuProfile?.studentId}</span>
              </p>
              <p className="text-xs text-slate-600 font-medium mt-1">
                {stuProfile?.department} • Semester {stuProfile?.semester} (Div {stuProfile?.division})
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsEditing(!isEditing)}
            className="px-4 py-2 text-xs font-bold rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 transition-colors self-end sm:self-auto"
          >
            {isEditing ? <X className="w-4 h-4" /> : <Edit3 className="w-4 h-4 text-[#7A1528]" />}
            {isEditing ? 'Cancel Edit' : 'Edit Profile'}
          </button>
        </div>

        {/* Profile Completion Indicator */}
        <div className="mt-6 pt-5 border-t border-slate-100">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-bold text-slate-700">Profile Completion: {completion}% complete</span>
            <span className="text-[11px] text-slate-400">Complete profiles receive 25% higher mentor match accuracy</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div
              className="bg-[#7A1528] h-full rounded-full transition-all duration-700"
              style={{ width: `${completion}%` }}
            ></div>
          </div>
        </div>

        {successMsg && (
          <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{successMsg}</span>
          </div>
        )}
      </div>

      {isEditing ? (
        /* Edit Form */
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <h2 className="text-base font-bold text-slate-900 mb-4">Edit Academic & Technical Profile</h2>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Semester</label>
                <select
                  value={formData.semester}
                  onChange={e => setFormData({ ...formData, semester: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#7A1528] focus:outline-none bg-white"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                    <option key={s} value={s}>Semester {s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Division</label>
                <input
                  type="text"
                  value={formData.division}
                  onChange={e => setFormData({ ...formData, division: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#7A1528] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#7A1528] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Career Goal / Post-Graduation Aspiration</label>
                <input
                  type="text"
                  value={formData.careerGoal}
                  onChange={e => setFormData({ ...formData, careerGoal: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#7A1528] focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Technical Skills (Comma separated)</label>
                <input
                  type="text"
                  value={formData.skills}
                  onChange={e => setFormData({ ...formData, skills: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#7A1528] focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Interests & Research Areas</label>
                <input
                  type="text"
                  value={formData.interests}
                  onChange={e => setFormData({ ...formData, interests: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#7A1528] focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Preferred Mentoring Areas</label>
                <input
                  type="text"
                  value={formData.preferredMentoringAreas}
                  onChange={e => setFormData({ ...formData, preferredMentoringAreas: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#7A1528] focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2 text-xs font-bold rounded-xl bg-[#7A1528] hover:bg-[#631020] text-white shadow-xs flex items-center gap-1.5"
              >
                <Save className="w-4 h-4" />
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* Detailed Profile View */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Personal & Academic Details */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-[#7A1528]" />
              Academic Credentials
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Student Name</span>
                <span className="font-bold text-slate-900">{user?.name}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">College Email</span>
                <span className="font-mono text-slate-800">{user?.email}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Enrollment ID</span>
                <span className="font-mono font-bold text-slate-900">{stuProfile?.studentId}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Department</span>
                <span className="font-semibold text-slate-900">{stuProfile?.department}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Semester & Division</span>
                <span className="font-semibold text-slate-900">Semester {stuProfile?.semester} • Division {stuProfile?.division}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Cumulative GPA (CGPA)</span>
                <span className="font-bold text-emerald-700">{stuProfile?.cgpa ? `${stuProfile.cgpa} / 10.0` : '8.85 / 10.0'}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Phone Contact</span>
                <span className="text-slate-800">{stuProfile?.phone || '+91 98201 12345'}</span>
              </div>
            </div>
          </div>

          {/* Technical Skills & Career Goals */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
              <Target className="w-4 h-4 text-[#C89B3C]" />
              Career & Technical Profile
            </h3>

            <div className="space-y-4 text-xs">
              <div>
                <span className="text-slate-500 block mb-1 font-medium">Career Goal:</span>
                <p className="font-bold text-slate-900 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  {stuProfile?.careerGoal || 'Software Engineer & AI Researcher'}
                </p>
              </div>

              <div>
                <span className="text-slate-500 block mb-1.5 font-medium">Technical Skills:</span>
                <div className="flex flex-wrap gap-1.5">
                  {stuProfile?.skills.map((skill, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 font-semibold text-[11px] border border-slate-200">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-slate-500 block mb-1.5 font-medium">Interests & Research Domains:</span>
                <div className="flex flex-wrap gap-1.5">
                  {stuProfile?.interests.map((interest, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 font-semibold text-[11px] border border-blue-200">
                      {interest}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-slate-500 block mb-1.5 font-medium">Preferred Mentoring Areas:</span>
                <div className="flex flex-wrap gap-1.5">
                  {stuProfile?.preferredMentoringAreas.map((area, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-lg bg-[#7A1528]/10 text-[#7A1528] font-bold text-[11px] border border-[#7A1528]/20">
                      {area}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
