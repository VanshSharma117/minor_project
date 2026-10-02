import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, ArrowLeft, ShieldAlert } from 'lucide-react';

export const ForgotPasswordPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full mx-auto bg-white p-8 rounded-2xl border border-slate-200 shadow-sm text-center">
        <div className="w-12 h-12 bg-amber-100 text-amber-800 rounded-xl flex items-center justify-center mx-auto mb-4">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Campus Password Reset</h2>
        <p className="text-xs text-slate-600 mt-2 leading-relaxed">
          For security on this internal college network, student and faculty password resets are managed directly through the <strong>College IT Services Helpdesk</strong> or Department Office.
        </p>

        <div className="mt-6 p-3 bg-slate-50 border border-slate-200 rounded-xl text-left text-xs space-y-1.5 text-slate-700">
          <p><strong>IT Helpdesk:</strong> Academic Block A, Room 102</p>
          <p><strong>Campus Email:</strong> support@edupilot.local</p>
          <p><strong>Verification:</strong> Please bring your physical College ID card.</p>
        </div>

        <div className="mt-6">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#7A1528] hover:underline"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Return to Login
          </Link>
        </div>
      </div>
    </div>
  );
};
