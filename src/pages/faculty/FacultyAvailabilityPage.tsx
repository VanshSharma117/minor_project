import React, { useState } from 'react';
import { Clock, CheckCircle2, ShieldCheck, AlertCircle, Save } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { FacultyProfile } from '../../types';

export const FacultyAvailabilityPage: React.FC = () => {
  const { profile, refreshProfile } = useAuth();
  const facProfile = profile as FacultyProfile | null;

  const [availability, setAvailability] = useState<'Available' | 'Busy' | 'Unavailable'>(
    facProfile?.availability || 'Available'
  );
  const [acceptingRequests, setAcceptingRequests] = useState(
    facProfile?.acceptingRequests ?? true
  );
  const [maxCapacity, setMaxCapacity] = useState(facProfile?.maxMentoringCapacity || 4);
  const [officeHours, setOfficeHours] = useState(facProfile?.officeHours || 'Mon & Thu: 2:00 PM - 4:30 PM');
  const [officeLocation, setOfficeLocation] = useState(facProfile?.officeLocation || 'Academic Block B, Room 304');
  const [meetingMode, setMeetingMode] = useState<'In-person' | 'Online' | 'Hybrid'>(
    facProfile?.meetingMode || 'Hybrid'
  );
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSaved(false);

    try {
      await api.updateFacultyAvailability({
        availability,
        acceptingRequests,
        maxMentoringCapacity: Number(maxCapacity),
        officeHours,
        officeLocation,
        meetingMode
      });
      await refreshProfile();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to save availability');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Availability & Mentoring Slots</h1>
        <p className="text-xs text-slate-500 mt-1">
          Control your student capacity and configure when students can request reviews.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <form onSubmit={handleSave} className="space-y-5 text-xs">
          {/* Availability Status */}
          <div>
            <label className="block font-semibold text-slate-700 mb-2">Current Academic Availability Status</label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { status: 'Available', color: 'border-emerald-300 bg-emerald-50 text-emerald-800' },
                { status: 'Busy', color: 'border-amber-300 bg-amber-50 text-amber-800' },
                { status: 'Unavailable', color: 'border-rose-300 bg-rose-50 text-rose-800' }
              ].map(item => (
                <button
                  key={item.status}
                  type="button"
                  onClick={() => setAvailability(item.status as any)}
                  className={`p-3 rounded-xl border text-center font-bold transition-all cursor-pointer ${
                    availability === item.status
                      ? `${item.color} ring-2 ring-[#7A1528]/30 shadow-xs`
                      : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {item.status}
                </button>
              ))}
            </div>
          </div>

          {/* Accepting Requests Toggle */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
            <div>
              <span className="font-bold text-slate-900 block">Accepting New Mentorship Requests</span>
              <span className="text-[11px] text-slate-500">
                When turned OFF, students will see you as unavailable and will be offered EduPilot AI guidance.
              </span>
            </div>
            <button
              type="button"
              onClick={() => setAcceptingRequests(!acceptingRequests)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                acceptingRequests ? 'bg-emerald-600 text-white' : 'bg-slate-300 text-slate-700'
              }`}
            >
              {acceptingRequests ? 'Accepting (ON)' : 'Disabled (OFF)'}
            </button>
          </div>

          {/* Capacity Settings */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Max Student Mentoring Capacity</label>
              <input
                type="number"
                min="1"
                max="10"
                value={maxCapacity}
                onChange={e => setMaxCapacity(Number(e.target.value))}
                className="w-full p-2.5 border border-slate-300 rounded-xl"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Currently mentoring {facProfile?.currentMentoringCount || 2} students
              </span>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Meeting Format Mode</label>
              <select
                value={meetingMode}
                onChange={e => setMeetingMode(e.target.value as any)}
                className="w-full p-2.5 border border-slate-300 rounded-xl bg-white"
              >
                <option value="Hybrid">Hybrid (Cabin + Online)</option>
                <option value="In-person">In-person Cabin Only</option>
                <option value="Online">Online Sync Only</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Weekly Office Hours for Student Reviews</label>
            <input
              type="text"
              value={officeHours}
              onChange={e => setOfficeHours(e.target.value)}
              placeholder="e.g. Mon & Thu: 2:00 PM - 4:30 PM"
              className="w-full p-2.5 border border-slate-300 rounded-xl"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Faculty Cabin / Office Location</label>
            <input
              type="text"
              value={officeLocation}
              onChange={e => setOfficeLocation(e.target.value)}
              placeholder="e.g. Academic Block B, Room 304"
              className="w-full p-2.5 border border-slate-300 rounded-xl"
            />
          </div>

          {saved && (
            <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Availability settings saved successfully!</span>
            </div>
          )}

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-[#7A1528] hover:bg-[#631020] text-white font-bold rounded-xl shadow-xs"
            >
              {loading ? 'Saving...' : 'Update Availability Settings'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
