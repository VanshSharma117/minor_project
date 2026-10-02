import React, { useState } from 'react';
import { Info, Sparkles, CheckCircle2 } from 'lucide-react';
import { MatchScoreBreakdown } from '../../types';

interface MatchScoreBadgeProps {
  score: number;
  breakdown?: MatchScoreBreakdown;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'circular' | 'badge';
}

export const MatchScoreBadge: React.FC<MatchScoreBadgeProps> = ({
  score,
  breakdown,
  size = 'md',
  variant = 'circular'
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  const strokeColor = score >= 85 ? '#7A1528' : score >= 70 ? '#C89B3C' : '#64748B';

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={() => setShowTooltip(!showTooltip)}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className="flex items-center gap-2 group cursor-pointer text-left focus:outline-none"
        title="View 5-factor compatibility breakdown"
      >
        {/* Subtle Circular Progress Indicator */}
        <div className="relative w-8 h-8 flex items-center justify-center shrink-0">
          <svg className="w-8 h-8 -rotate-90" viewBox="0 0 36 36">
            <path
              className="text-stone-200"
              strokeWidth="3.2"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <path
              strokeDasharray={`${score}, 100`}
              strokeWidth="3.2"
              strokeLinecap="round"
              stroke={strokeColor}
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
          </svg>
          <span className="absolute text-[10px] font-black text-slate-800">
            {score}%
          </span>
        </div>

        <div className="leading-tight">
          <span className="text-[11px] font-bold text-slate-800 group-hover:text-[#7A1528] transition-colors flex items-center gap-1">
            Match <Info className="w-3 h-3 text-slate-400 group-hover:text-[#7A1528]" />
          </span>
          <span className="text-[9px] text-slate-400 font-medium">Faculty fit</span>
        </div>
      </button>

      {/* Popover explaining the 5 weighted criteria */}
      {showTooltip && (
        <div
          className="absolute z-50 right-0 sm:left-0 top-full mt-2 w-72 p-3.5 bg-slate-900 text-white rounded-2xl shadow-xl text-xs border border-slate-700 pointer-events-auto animate-page"
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
        >
          <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-2">
            <span className="font-bold text-amber-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> EduPilot Match Score
            </span>
            <span className="font-black text-sm">{score}%</span>
          </div>

          <p className="text-slate-300 text-[11px] leading-relaxed mb-2.5">
            5-factor weighted algorithm based on your profile, goals, faculty expertise, and mentoring availability:
          </p>

          <div className="space-y-1.5 text-[11px]">
            <div className="flex justify-between items-center text-slate-300">
              <span>Expertise Alignment (40%)</span>
              <span className="font-semibold text-emerald-400">
                {breakdown ? `${breakdown.expertiseScore}/40` : '36/40'}
              </span>
            </div>
            <div className="flex justify-between items-center text-slate-300">
              <span>Student Goals & Interests (25%)</span>
              <span className="font-semibold text-emerald-400">
                {breakdown ? `${breakdown.interestGoalScore}/25` : '22/25'}
              </span>
            </div>
            <div className="flex justify-between items-center text-slate-300">
              <span>Availability & Capacity (15%)</span>
              <span className="font-semibold text-emerald-400">
                {breakdown ? `${breakdown.availabilityScore}/15` : '15/15'}
              </span>
            </div>
            <div className="flex justify-between items-center text-slate-300">
              <span>Department Context (10%)</span>
              <span className="font-semibold text-emerald-400">
                {breakdown ? `${breakdown.departmentScore}/10` : '10/10'}
              </span>
            </div>
            <div className="flex justify-between items-center text-slate-300">
              <span>Research / Capstone Area (10%)</span>
              <span className="font-semibold text-emerald-400">
                {breakdown ? `${breakdown.mentoringAreaScore}/10` : '9/10'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
