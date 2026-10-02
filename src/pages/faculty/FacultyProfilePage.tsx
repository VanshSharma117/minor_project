import React, { useState } from 'react';
import {
  User,
  GraduationCap,
  Award,
  Edit3,
  CheckCircle2,
  Save,
  X,
  Building,
  ShieldCheck,
  CheckSquare
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { FacultyProfile } from '../../types';

export const FacultyProfilePage: React.FC = () => {
  const { user, profile, refreshProfile } = useAuth();
  const facProfile = profile as FacultyProfile | null;

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    bio: facProfile?.bio || '',
    expertise: facProfile?.expertise.join(', ') || '',
    researchAreas: facProfile?.researchAreas.join(', ') || '',
    mentoringAreas: facProfile?.mentoringAreas.join(', ') || '',
    officeLocation: facProfile?.officeLocation || '',
    officeHours: facProfile?.officeHours || '',
    meetingMode: facProfile?.meetingMode || 'Hybrid',
    maxMentoringCapacity: facProfile?.maxMentoringCapacity || 4
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg(null);
    try {
      await api.updateFacultyProfile({
        bio: formData.bio,
        expertise: formData.expertise.split(',').map(s => s.trim()).filter(Boolean),
        researchAreas: formData.researchAreas.split(',').map(r => r.trim()).filter(Boolean),
        mentoringAreas: formData.mentoringAreas.split(',').map(m => m.trim()).filter(Boolean)
      });
      await api.updateFacultyAvailability({
        officeLocation: formData.officeLocation,
        officeHours: formData.officeHours,
        meetingMode: formData.meetingMode as any,
        maxMentoringCapacity: Number(formData.maxMentoringCapacity)
      });
      await refreshProfile();
      setSuccessMsg('Faculty profile updated successfully!');
      setIsEditing(false);
    } catch (err: any) {
      alert(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <img
              src={user?.avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'}
              alt={user?.name}
              className="w-20 h-20 rounded-2xl object-cover border-2 border-slate-200"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900">{user?.name}</h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Verified Faculty
                </span>
              </div>
              <p className="text-xs text-[#7A1528] font-bold mt-0.5">{facProfile?.designation} • {facProfile?.department}</p>
              <p className="text-xs text-slate-500 font-mono mt-0.5">Faculty ID: {facProfile?.facultyId}</p>
            </div>
          </div>

          <button
            onClick={() => setIsEditing(!isEditing)}
            className="px-4 py-2 text-xs font-bold rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 transition-colors self-end sm:self-auto"
          >
            {isEditing ? <X className="w-4 h-4" /> : <Edit3 className="w-4 h-4 text-[#7A1528]" />}
            {isEditing ? 'Cancel' : 'Edit Faculty Details'}
          </button>
        </div>

        {successMsg && (
          <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{successMsg}</span>
          </div>
        )}
      </div>

      {isEditing ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <h2 className="text-base font-bold text-slate-900 mb-4">Edit Profile & Office Hours</h2>
          <form onSubmit={handleSave} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Biography & Academic Experience</label>
              <textarea
                rows={3}
                value={formData.bio}
                onChange={e => setFormData({ ...formData, bio: e.target.value })}
                className="w-full p-2.5 border rounded-xl"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Areas of Expertise</label>
                <input
                  type="text"
                  value={formData.expertise}
                  onChange={e => setFormData({ ...formData, expertise: e.target.value })}
                  className="w-full p-2.5 border rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Research Areas</label>
                <input
                  type="text"
                  value={formData.researchAreas}
                  onChange={e => setFormData({ ...formData, researchAreas: e.target.value })}
                  className="w-full p-2.5 border rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Office Location</label>
                <input
                  type="text"
                  value={formData.officeLocation}
                  onChange={e => setFormData({ ...formData, officeLocation: e.target.value })}
                  className="w-full p-2.5 border rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Office Hours Slots</label>
                <input
                  type="text"
                  value={formData.officeHours}
                  onChange={e => setFormData({ ...formData, officeHours: e.target.value })}
                  className="w-full p-2.5 border rounded-xl"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 border rounded-xl font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2 bg-[#7A1528] text-white font-bold rounded-xl"
              >
                Save Details
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-[#7A1528]" />
              Faculty Profile
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">{facProfile?.bio}</p>

            <div className="space-y-3 text-xs pt-2">
              <div>
                <span className="text-slate-400 block mb-1">Areas of Expertise:</span>
                <div className="flex flex-wrap gap-1">
                  {facProfile?.expertise.map((e, i) => (
                    <span key={i} className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 font-medium">
                      {e}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-slate-400 block mb-1">Research Areas:</span>
                <div className="flex flex-wrap gap-1">
                  {facProfile?.researchAreas.map((r, i) => (
                    <span key={i} className="px-2 py-0.5 rounded bg-blue-50 text-blue-800 font-medium">
                      {r}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
              <Building className="w-4 h-4 text-[#C89B3C]" />
              Advisory Office & Capacity
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Office Location</span>
                <span className="font-semibold text-slate-900">{facProfile?.officeLocation}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Office Hours</span>
                <span className="font-semibold text-slate-900">{facProfile?.officeHours}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Meeting Format</span>
                <span className="font-semibold text-slate-900">{facProfile?.meetingMode} Mode</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Mentoring Capacity</span>
                <span className="font-bold text-slate-900">
                  {facProfile?.currentMentoringCount} / {facProfile?.maxMentoringCapacity} Students Active
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Accepting Requests</span>
                <span className={`font-bold ${facProfile?.acceptingRequests ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {facProfile?.acceptingRequests ? 'Active (ON)' : 'Disabled (OFF)'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
