import React from 'react';
import { Compass, Sparkles } from 'lucide-react';

interface EduPilotLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
  className?: string;
  animate?: boolean;
}

export const EduPilotLogo: React.FC<EduPilotLogoProps> = ({
  size = 'md',
  showTagline = false,
  className = '',
  animate = true
}) => {
  const iconSizes = {
    sm: 'w-7 h-7 rounded-lg text-xs',
    md: 'w-9 h-9 rounded-xl text-sm',
    lg: 'w-12 h-12 rounded-2xl text-base'
  };

  const textSizes = {
    sm: 'text-sm font-extrabold',
    md: 'text-base font-extrabold',
    lg: 'text-2xl font-black'
  };

  return (
    <div className={`inline-flex items-center gap-2.5 ${animate ? 'animate-page' : ''} ${className}`}>
      {/* Brand Icon Mark */}
      <div
        className={`${iconSizes[size]} bg-[#7A1528] text-white flex items-center justify-center relative shadow-xs overflow-hidden shrink-0 border border-[#8E1B31]/30`}
      >
        {/* Subtle geometric academic motif */}
        <Compass className="w-5 h-5 text-[#C89B3C]" />
        <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 bg-[#C89B3C] rounded-full"></span>
      </div>

      {/* Typography */}
      <div className="leading-tight">
        <div className="flex items-center gap-1.5">
          <span className={`${textSizes[size]} tracking-tight text-slate-900`}>
            EDUPILOT
          </span>
          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-rose-50 text-[#7A1528] border border-rose-200/60 uppercase tracking-widest">
            AI
          </span>
        </div>
        {showTagline && (
          <p className="text-[11px] font-medium text-slate-500 tracking-tight">
            Find a Mentor. Get Guidance. Grow.
          </p>
        )}
      </div>
    </div>
  );
};
