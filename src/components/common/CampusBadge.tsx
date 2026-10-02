import React from 'react';
import { ShieldCheck, Sparkles, GraduationCap } from 'lucide-react';

export const CampusBadge: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-[#7A1528]/10 text-[#7A1528] border border-[#7A1528]/25 ${className}`}>
      <GraduationCap className="w-3.5 h-3.5 text-[#7A1528]" />
      <span>INTERNAL COLLEGE CAMPUS PLATFORM</span>
      <span className="w-1 h-1 rounded-full bg-[#7A1528]"></span>
      <span className="text-emerald-700 font-semibold flex items-center gap-1">
        <ShieldCheck className="w-3 h-3 inline" /> Verified Only
      </span>
    </div>
  );
};

export const AIMentorNotice: React.FC<{ className?: string; compact?: boolean }> = ({ className = '', compact = false }) => {
  if (compact) {
    return (
      <div className={`text-xs text-slate-500 flex items-center gap-1.5 italic ${className}`}>
        <Sparkles className="w-3 h-3 text-[#C89B3C]" />
        <span>"AI assists faculty; it does not replace faculty."</span>
      </div>
    );
  }

  return (
    <div className={`p-3 bg-amber-50/80 border border-amber-200/90 rounded-xl text-amber-900 text-xs flex items-center gap-2.5 ${className}`}>
      <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center text-[#C89B3C] shrink-0 font-bold">
        <Sparkles className="w-4 h-4" />
      </div>
      <div>
        <p className="font-semibold text-amber-950">Core Academic Principle</p>
        <p className="text-amber-800 text-[11px] leading-relaxed">
          "AI assists faculty; it does not replace faculty." EduPilot AI provides 24/7 preliminary academic guidance, learning roadmaps, and immediate triage until verified human faculty mentorship takes place.
        </p>
      </div>
    </div>
  );
};
