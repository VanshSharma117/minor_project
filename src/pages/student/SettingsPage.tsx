import React, { useState } from 'react';
import { Settings, ShieldCheck, Bell, Lock, User, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [meetingReminders, setMeetingReminders] = useState(true);
  const [aiSuggestions, setAiSuggestions] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Account & Platform Settings</h1>
        <p className="text-xs text-slate-500 mt-1">Manage notification preferences, privacy, and campus portal settings.</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
        <div>
          <h3 className="font-bold text-sm text-slate-900 mb-3 flex items-center gap-2">
            <Bell className="w-4 h-4 text-[#7A1528]" />
            Notification Preferences
          </h3>

          <div className="space-y-3 text-xs">
            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
              <div>
                <span className="font-bold text-slate-800 block">Faculty Message Alerts</span>
                <span className="text-[11px] text-slate-500">Receive in-app alerts when your faculty guide responds</span>
              </div>
              <input
                type="checkbox"
                checked={emailAlerts}
                onChange={e => setEmailAlerts(e.target.checked)}
                className="rounded text-[#7A1528] focus:ring-[#7A1528]"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
              <div>
                <span className="font-bold text-slate-800 block">Meeting Reminders</span>
                <span className="text-[11px] text-slate-500">Alerts 2 hours prior to scheduled cabin or online reviews</span>
              </div>
              <input
                type="checkbox"
                checked={meetingReminders}
                onChange={e => setMeetingReminders(e.target.checked)}
                className="rounded text-[#7A1528] focus:ring-[#7A1528]"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
              <div>
                <span className="font-bold text-slate-800 block">AI Roadmap Recommendations</span>
                <span className="text-[11px] text-slate-500">Allow EduPilot AI to suggest next milestones based on progress</span>
              </div>
              <input
                type="checkbox"
                checked={aiSuggestions}
                onChange={e => setAiSuggestions(e.target.checked)}
                className="rounded text-[#7A1528] focus:ring-[#7A1528]"
              />
            </label>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100">
          <h3 className="font-bold text-sm text-slate-900 mb-2 flex items-center gap-2">
            <Lock className="w-4 h-4 text-[#C89B3C]" />
            Campus Network Security
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Your identity is verified under College Enrollment <strong>{user?.email}</strong>. Passwords can only be changed via the IT helpdesk in Academic Block A.
          </p>
        </div>

        {saved && (
          <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>Preferences saved successfully!</span>
          </div>
        )}

        <div className="pt-2 flex justify-end">
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2.5 rounded-xl bg-[#7A1528] hover:bg-[#631020] text-white text-xs font-bold"
          >
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
};
