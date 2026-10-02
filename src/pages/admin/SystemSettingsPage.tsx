import React, { useEffect, useState } from 'react';
import { Sliders, ShieldCheck, CheckCircle2, Lock, Building } from 'lucide-react';
import { api } from '../../services/api';
import { SystemSettings } from '../../types';

export const SystemSettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [domainsInput, setDomainsInput] = useState('');
  const [maxMentorships, setMaxMentorships] = useState(2);
  const [semesterName, setSemesterName] = useState('');
  const [registrationsOpen, setRegistrationsOpen] = useState(true);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSettings() {
      try {
        const data = await api.getAdminSettings();
        setSettings(data);
        setDomainsInput(data.allowedDomains.join(', '));
        setMaxMentorships(data.maxMentorshipsPerStudent);
        setSemesterName(data.currentAcademicSemester);
        setRegistrationsOpen(data.registrationsOpen);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const allowedDomains = domainsInput.split(',').map(d => d.trim()).filter(Boolean);
      await api.updateAdminSettings({
        allowedDomains,
        maxMentorshipsPerStudent: Number(maxMentorships),
        currentAcademicSemester: semesterName,
        registrationsOpen
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to update system settings');
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-slate-400 text-xs">Loading institutional settings...</div>;
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Institutional System Settings</h1>
        <p className="text-xs text-slate-500 mt-1">
          Configure allowed college email domains, mentorship limits, and academic term locks.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <form onSubmit={handleSave} className="space-y-5 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Authorized College Email Domains (Comma separated)
            </label>
            <input
              type="text"
              required
              value={domainsInput}
              onChange={e => setDomainsInput(e.target.value)}
              className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#7A1528] focus:outline-none"
            />
            <p className="text-[10px] text-slate-400 mt-1">
              Registrations with any other domain are automatically blocked: "This platform is restricted to verified college students and faculty."
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Max Active Mentorships Per Student (Rule 5)
              </label>
              <input
                type="number"
                min="1"
                max="5"
                value={maxMentorships}
                onChange={e => setMaxMentorships(Number(e.target.value))}
                className="w-full p-2.5 border border-slate-300 rounded-xl"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">Default: 2 concurrent faculty guides</span>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Current Academic Semester</label>
              <input
                type="text"
                value={semesterName}
                onChange={e => setSemesterName(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-xl"
              />
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
            <div>
              <span className="font-bold text-slate-900 block">Student Campus Registration Portal</span>
              <span className="text-[11px] text-slate-500">Allow incoming student enrollment submissions</span>
            </div>
            <button
              type="button"
              onClick={() => setRegistrationsOpen(!registrationsOpen)}
              className={`px-3 py-1.5 rounded-lg font-bold text-xs ${
                registrationsOpen ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
              }`}
            >
              {registrationsOpen ? 'Open' : 'Closed'}
            </button>
          </div>

          {saved && (
            <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Campus settings updated successfully!</span>
            </div>
          )}

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="px-5 py-2.5 bg-[#7A1528] hover:bg-[#631020] text-white font-bold rounded-xl"
            >
              Save System Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
