import React, { useState } from 'react';
import { Cpu, Sparkles, ShieldCheck, CheckCircle2, Sliders, Database, AlertCircle } from 'lucide-react';
import { AIMentorNotice } from '../../components/common/CampusBadge';

export const AIManagementPage: React.FC = () => {
  const [model, setModel] = useState('gemini-3.8-flash');
  const [escalationRulesEnabled, setEscalationRulesEnabled] = useState(true);
  const [ragSources, setRagSources] = useState({
    academicRegulations: true,
    departmentFacultyList: true,
    capstoneGuidelines: true,
    placementPolicies: true
  });
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">AI Mentor & Safety Governance</h1>
        <p className="text-xs text-slate-500 mt-1">
          Configure server-side AI model parameters, academic guardrails, and campus escalation triggers.
        </p>
      </div>

      <AIMentorNotice />

      <form onSubmit={handleSave} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6 text-xs">
        {/* Model Selection */}
        <div>
          <h3 className="font-bold text-sm text-slate-900 mb-2 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-[#7A1528]" />
            Server-Side LLM Configuration
          </h3>
          <p className="text-slate-500 mb-3">
            Using official Google GenAI SDK. API keys are handled strictly server-side through environment variables.
          </p>

          <div className="grid grid-cols-2 gap-3">
            <label className="p-3 border-2 border-[#7A1528] bg-rose-50/50 rounded-xl cursor-pointer">
              <input
                type="radio"
                name="model"
                checked={model === 'gemini-3.8-flash'}
                onChange={() => setModel('gemini-3.8-flash')}
                className="text-[#7A1528]"
              />
              <span className="font-bold text-slate-900 ml-2">gemini-3.8-flash</span>
              <span className="block text-[11px] text-slate-500 mt-1">
                Fast reasoning, optimal for student roadmaps and coding guidance.
              </span>
            </label>

            <label className="p-3 border border-slate-200 bg-slate-50 rounded-xl cursor-pointer">
              <input
                type="radio"
                name="model"
                checked={model === 'offline-campus'}
                onChange={() => setModel('offline-campus')}
                className="text-[#7A1528]"
              />
              <span className="font-bold text-slate-900 ml-2">Built-in Campus RAG</span>
              <span className="block text-[11px] text-slate-500 mt-1">
                High-speed local campus deterministic fallback engine.
              </span>
            </label>
          </div>
        </div>

        {/* Safety & Escalation Rules */}
        <div className="pt-4 border-t border-slate-100">
          <h3 className="font-bold text-sm text-slate-900 mb-2 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Mandatory Academic Escalation Triggers
          </h3>
          <p className="text-slate-500 mb-3">
            EduPilot AI automatically flags queries requiring human faculty approval and generates a "Student Mentoring Summary".
          </p>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-800">
                Auto-Escalate Thesis & Capstone Topic Approvals to Faculty
              </span>
              <input
                type="checkbox"
                checked={escalationRulesEnabled}
                onChange={e => setEscalationRulesEnabled(e.target.checked)}
                className="rounded text-[#7A1528]"
              />
            </div>
            <p className="text-[11px] text-slate-500">
              When student asks for official signatures, lab equipment approvals, or grade challenges, AI prompts: "This may benefit from faculty mentorship."
            </p>
          </div>
        </div>

        {/* RAG Knowledge Base Sources */}
        <div className="pt-4 border-t border-slate-100">
          <h3 className="font-bold text-sm text-slate-900 mb-2 flex items-center gap-2">
            <Database className="w-4 h-4 text-[#C89B3C]" />
            Grounding Knowledge Sources (RAG)
          </h3>
          <p className="text-slate-500 mb-3">Verified college sources accessible to EduPilot AI context:</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {Object.entries(ragSources).map(([key, val]) => (
              <label key={key} className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-lg border cursor-pointer">
                <input
                  type="checkbox"
                  checked={val}
                  onChange={e => setRagSources({ ...ragSources, [key]: e.target.checked })}
                  className="rounded text-[#7A1528]"
                />
                <span className="capitalize font-medium text-slate-700">
                  {key.replace(/([A-Z])/g, ' $1')}
                </span>
              </label>
            ))}
          </div>
        </div>

        {saved && (
          <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>AI governance settings saved!</span>
          </div>
        )}

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            className="px-5 py-2.5 bg-[#7A1528] hover:bg-[#631020] text-white font-bold rounded-xl"
          >
            Save AI Parameters
          </button>
        </div>
      </form>
    </div>
  );
};
