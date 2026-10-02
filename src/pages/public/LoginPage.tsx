import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Compass,
  Check,
  GraduationCap
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { EduPilotLogo } from '../../components/common/EduPilotLogo';

type RoleOption = 'student' | 'faculty' | 'admin';

export const LoginPage: React.FC = () => {
  const { login, unverifiedError } = useAuth();
  const navigate = useNavigate();

  // Role persistence: load from localStorage or default to 'student'
  const [selectedRole, setSelectedRole] = useState<RoleOption>(() => {
    const saved = localStorage.getItem('edupilot_selected_login_role');
    if (saved === 'student' || saved === 'faculty' || saved === 'admin') {
      return saved;
    }
    return 'student';
  });

  const [email, setEmail] = useState(() => {
    return localStorage.getItem('edupilot_remembered_email') || '';
  });
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(() => {
    return !!localStorage.getItem('edupilot_remembered_email');
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Persist role whenever it changes
  useEffect(() => {
    localStorage.setItem('edupilot_selected_login_role', selectedRole);
  }, [selectedRole]);

  const handleRoleSelect = (role: RoleOption) => {
    setSelectedRole(role);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedRole) {
      setError('Please select a role.');
      return;
    }

    setLoading(true);

    // Handle remember me
    if (rememberMe) {
      localStorage.setItem('edupilot_remembered_email', email);
    } else {
      localStorage.removeItem('edupilot_remembered_email');
    }

    try {
      // Pass selected role to login for backend verification
      const user = await login(email, password, selectedRole);

      // Redirect after login based on authenticated role
      if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (user.role === 'faculty') {
        navigate('/faculty/dashboard');
      } else {
        navigate('/student/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Invalid college email or password.');
    } finally {
      setLoading(false);
    }
  };

  const fillCredentials = (role: RoleOption) => {
    setSelectedRole(role);
    if (role === 'student') {
      setEmail('student@edupilot.local');
      setPassword('Student@123');
    } else if (role === 'faculty') {
      setEmail('faculty@edupilot.local');
      setPassword('Faculty@123');
    } else if (role === 'admin') {
      setEmail('admin@edupilot.local');
      setPassword('Admin@123');
    }
    setError(null);
  };

  const getButtonText = () => {
    if (loading) return 'Authenticating credentials...';
    if (selectedRole === 'student') return 'Login as Student →';
    if (selectedRole === 'faculty') return 'Login as Faculty →';
    return 'Login as Admin →';
  };

  return (
    <div className="min-h-screen bg-campus-pattern flex flex-col justify-center py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 rounded-3xl bg-white border border-stone-200/80 shadow-md overflow-hidden animate-page">
        {/* ======================================================== */}
        {/* LEFT SIDE: Brand Identity, Tagline & Abstract Flow Motif */}
        {/* ======================================================== */}
        <div className="lg:col-span-5 bg-gradient-to-br from-stone-900 via-[#4A0A17] to-[#7A1528] p-8 sm:p-10 text-white flex flex-col justify-between relative overflow-hidden">
          {/* Subtle background glow circles */}
          <div className="absolute -top-16 -left-16 w-56 h-56 rounded-full bg-[#C89B3C]/10 blur-2xl pointer-events-none" />
          <div className="absolute -bottom-16 -right-16 w-56 h-56 rounded-full bg-indigo-500/10 blur-2xl pointer-events-none" />

          <div>
            <Link to="/" className="inline-flex items-center gap-2.5 mb-8 group">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white border border-white/20 shadow-xs group-hover:scale-105 transition-transform">
                <Compass className="w-5 h-5 text-[#C89B3C]" />
              </div>
              <div>
                <span className="font-extrabold text-base tracking-tight text-white flex items-center gap-1.5">
                  EDUPILOT <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-white/15 text-[#E5C06E] border border-white/20">AI</span>
                </span>
                <span className="text-[10px] text-stone-300 block font-medium">College Mentorship System</span>
              </div>
            </Link>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-[#E5C06E] text-xs font-semibold mb-4 border border-white/15 backdrop-blur-xs">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Campus Role-Aware Authentication</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white leading-tight">
              Find a Mentor.<br />
              Get Guidance.<br />
              <span className="text-[#E5C06E]">Grow.</span>
            </h1>

            <p className="mt-3 text-xs text-stone-200 leading-relaxed font-normal">
              Your campus mentoring platform connecting students with faculty and AI-powered guidance.
            </p>
          </div>

          {/* Academic Progression SVG: Student → AI → Faculty */}
          <div className="my-8 py-5 border-y border-white/15">
            <p className="text-[10px] font-bold uppercase tracking-wider text-amber-200/80 mb-3">
              Campus Mentorship Cycle
            </p>
            <div className="flex items-center justify-between text-xs text-stone-200">
              <div className="flex flex-col items-center gap-1.5">
                <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-lg shadow-2xs">
                  🎓
                </div>
                <span className="text-[11px] font-semibold">Student</span>
              </div>

              <div className="flex-1 flex items-center justify-center px-2">
                <div className="w-full h-0.5 bg-gradient-to-r from-[#C89B3C] via-indigo-400 to-white/40 dashed" />
                <span className="mx-1 text-[11px] text-[#C89B3C] font-black">✦</span>
              </div>

              <div className="flex flex-col items-center gap-1.5">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center text-base text-indigo-200 shadow-2xs">
                  <Sparkles className="w-5 h-5 text-indigo-300" />
                </div>
                <span className="text-[11px] font-semibold text-indigo-200">AI Advisor</span>
              </div>

              <div className="flex-1 flex items-center justify-center px-2">
                <div className="w-full h-0.5 bg-gradient-to-r from-indigo-400 via-[#C89B3C] to-white/40 dashed" />
                <span className="mx-1 text-[11px] text-[#C89B3C] font-black">✦</span>
              </div>

              <div className="flex flex-col items-center gap-1.5">
                <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-lg shadow-2xs">
                  👨‍🏫
                </div>
                <span className="text-[11px] font-semibold">Faculty</span>
              </div>
            </div>
          </div>

          {/* Institutional Trust Footer */}
          <div className="text-[11px] text-stone-300 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#C89B3C]" />
            <span>Campus Internal Security Protocol • Verified Access</span>
          </div>
        </div>

        {/* ======================================================== */}
        {/* RIGHT SIDE: Role Selector & Login Form                   */}
        {/* ======================================================== */}
        <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-between">
          <div>
            <div className="mb-6">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Welcome back
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Choose your role to continue into your personalized campus portal.
              </p>
            </div>

            {/* Section 1 & 2: Role Options (Student, Faculty, Admin) */}
            <div className="mb-6">
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Select Your Role
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                {/* 1. Student Card */}
                <button
                  type="button"
                  onClick={() => handleRoleSelect('student')}
                  className={`p-3 rounded-2xl border text-left transition-all duration-200 cursor-pointer relative group flex flex-col justify-between ${
                    selectedRole === 'student'
                      ? 'border-[#7A1528] bg-rose-50/70 shadow-xs ring-1 ring-[#7A1528]'
                      : 'border-stone-200/90 bg-white hover:border-stone-300 hover:bg-stone-50/50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <span className="text-xl sm:text-2xl">🎓</span>
                    {selectedRole === 'student' && (
                      <span className="w-4 h-4 rounded-full bg-[#7A1528] text-white flex items-center justify-center text-[10px]">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </span>
                    )}
                  </div>
                  <div className="mt-2">
                    <p className={`font-bold text-xs ${selectedRole === 'student' ? 'text-[#7A1528]' : 'text-slate-900'}`}>
                      Student
                    </p>
                    <p className="text-[10px] text-slate-500 leading-tight mt-0.5 line-clamp-2">
                      Access your mentoring dashboard
                    </p>
                  </div>
                </button>

                {/* 2. Faculty Card */}
                <button
                  type="button"
                  onClick={() => handleRoleSelect('faculty')}
                  className={`p-3 rounded-2xl border text-left transition-all duration-200 cursor-pointer relative group flex flex-col justify-between ${
                    selectedRole === 'faculty'
                      ? 'border-[#7A1528] bg-rose-50/70 shadow-xs ring-1 ring-[#7A1528]'
                      : 'border-stone-200/90 bg-white hover:border-stone-300 hover:bg-stone-50/50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <span className="text-xl sm:text-2xl">👨‍🏫</span>
                    {selectedRole === 'faculty' && (
                      <span className="w-4 h-4 rounded-full bg-[#7A1528] text-white flex items-center justify-center text-[10px]">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </span>
                    )}
                  </div>
                  <div className="mt-2">
                    <p className={`font-bold text-xs ${selectedRole === 'faculty' ? 'text-[#7A1528]' : 'text-slate-900'}`}>
                      Faculty
                    </p>
                    <p className="text-[10px] text-slate-500 leading-tight mt-0.5 line-clamp-2">
                      Mentor and guide students
                    </p>
                  </div>
                </button>

                {/* 3. Admin Card */}
                <button
                  type="button"
                  onClick={() => handleRoleSelect('admin')}
                  className={`p-3 rounded-2xl border text-left transition-all duration-200 cursor-pointer relative group flex flex-col justify-between ${
                    selectedRole === 'admin'
                      ? 'border-[#7A1528] bg-rose-50/70 shadow-xs ring-1 ring-[#7A1528]'
                      : 'border-stone-200/90 bg-white hover:border-stone-300 hover:bg-stone-50/50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <span className="text-xl sm:text-2xl">🛡</span>
                    {selectedRole === 'admin' && (
                      <span className="w-4 h-4 rounded-full bg-[#7A1528] text-white flex items-center justify-center text-[10px]">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </span>
                    )}
                  </div>
                  <div className="mt-2">
                    <p className={`font-bold text-xs ${selectedRole === 'admin' ? 'text-[#7A1528]' : 'text-slate-900'}`}>
                      Admin
                    </p>
                    <p className="text-[10px] text-slate-500 leading-tight mt-0.5 line-clamp-2">
                      Manage the campus platform
                    </p>
                  </div>
                </button>
              </div>
            </div>

            {/* Error UI Banner */}
            {unverifiedError && (
              <div className="mb-4 p-3 bg-amber-50 border border-amber-300 rounded-xl text-xs text-amber-900 flex items-start gap-2.5 animate-page">
                <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-amber-950">Campus Verification Pending</p>
                  <p className="mt-0.5 leading-relaxed text-[11px]">{unverifiedError}</p>
                </div>
              </div>
            )}

            {error && !unverifiedError && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2.5 animate-page">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span className="font-medium text-[11px]">{error}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  College Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    placeholder={
                      selectedRole === 'student'
                        ? 'student@edupilot.local'
                        : selectedRole === 'faculty'
                        ? 'faculty@edupilot.local'
                        : 'admin@edupilot.local'
                    }
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 text-xs bg-stone-50/60 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7A1528] focus:bg-white transition-all"
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700">Password</label>
                  <Link
                    to="/forgot-password"
                    className="text-[11px] text-[#7A1528] hover:underline font-semibold"
                  >
                    Forgot Password?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    type="password"
                    required
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 text-xs bg-stone-50/60 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7A1528] focus:bg-white transition-all"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                </div>
              </div>

              {/* Remember Me Checkbox */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-600">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded text-[#7A1528] focus:ring-[#7A1528] border-stone-300 cursor-pointer"
                  />
                  <span className="text-[11px]">Remember my college email</span>
                </label>
              </div>

              {/* Dynamic Login Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-xl text-white text-xs font-bold bg-[#7A1528] hover:bg-[#631020] shadow-xs shadow-[#7A1528]/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 btn-press"
              >
                <span>{getButtonText()}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>

            {/* Quick Demo Pre-fill Bar */}
            <div className="mt-5 pt-4 border-t border-stone-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Evaluation Demo Credentials:
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => fillCredentials('student')}
                  className="py-1.5 px-2 bg-blue-50/80 hover:bg-blue-100 border border-blue-200 text-blue-800 text-[11px] font-bold rounded-xl text-center transition-colors cursor-pointer"
                >
                  🎓 Fill Student
                </button>
                <button
                  type="button"
                  onClick={() => fillCredentials('faculty')}
                  className="py-1.5 px-2 bg-emerald-50/80 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-[11px] font-bold rounded-xl text-center transition-colors cursor-pointer"
                >
                  👨‍🏫 Fill Faculty
                </button>
                <button
                  type="button"
                  onClick={() => fillCredentials('admin')}
                  className="py-1.5 px-2 bg-rose-50/80 hover:bg-rose-100 border border-rose-200 text-[#7A1528] text-[11px] font-bold rounded-xl text-center transition-colors cursor-pointer"
                >
                  🛡 Fill Admin
                </button>
              </div>
            </div>
          </div>

          {/* Section 11: Registration Links (Only Student and Faculty, NO admin registration) */}
          <div className="mt-6 pt-4 border-t border-stone-100 text-center text-xs text-slate-500">
            <p className="font-semibold text-slate-700 mb-2">Don't have an account?</p>
            <div className="flex items-center justify-center gap-3">
              <Link
                to="/register/student"
                className="px-3 py-1.5 rounded-lg border border-stone-200 text-slate-700 hover:bg-stone-50 font-semibold text-[11px] transition-colors"
              >
                Register as Student
              </Link>
              <span className="text-stone-300">•</span>
              <Link
                to="/register/faculty"
                className="px-3 py-1.5 rounded-lg border border-stone-200 text-slate-700 hover:bg-stone-50 font-semibold text-[11px] transition-colors"
              >
                Register as Faculty
              </Link>
            </div>
            <p className="text-[10px] text-slate-400 mt-2">
              Admin credentials are provisioned by the university administration.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
