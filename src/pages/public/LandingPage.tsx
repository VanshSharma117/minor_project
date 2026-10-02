import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Compass,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Users,
  GraduationCap,
  Bot,
  UserCheck,
  CheckCircle2,
  TrendingUp,
  BookOpen
} from 'lucide-react';
import { EduPilotLogo } from '../../components/common/EduPilotLogo';
import { useAuth } from '../../context/AuthContext';

export const LandingPage: React.FC = () => {
  const { switchDemoRole } = useAuth();
  const navigate = useNavigate();

  const handleQuickDemo = async (role: 'student' | 'faculty' | 'admin') => {
    await switchDemoRole(role);
    if (role === 'student') navigate('/student/dashboard');
    else if (role === 'faculty') navigate('/faculty/dashboard');
    else if (role === 'admin') navigate('/admin/dashboard');
  };

  return (
    <div className="min-h-screen bg-campus-pattern text-slate-900 flex flex-col font-sans">
      {/* Top Campus Bar */}
      <div className="bg-[#7A1528] text-white text-xs py-2 px-4 text-center font-medium border-b border-[#C89B3C]/30 flex items-center justify-center gap-2">
        <span className="w-2 h-2 rounded-full bg-[#C89B3C] animate-pulse"></span>
        <span>Internal University Mentoring System · Semester 2026 Academic Advisory</span>
      </div>

      {/* Header */}
      <header className="bg-white/90 backdrop-blur-md border-b border-stone-200/80 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <EduPilotLogo size="sm" showTagline />

          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="text-xs font-semibold px-4 py-2 rounded-xl text-stone-700 hover:text-stone-900 hover:bg-stone-100 transition-colors btn-press"
            >
              Sign In
            </Link>
            <Link
              to="/register/student"
              className="text-xs font-bold px-4 py-2 rounded-xl bg-[#7A1528] hover:bg-[#631020] text-white shadow-xs transition-all btn-press"
            >
              Get Started &rarr;
            </Link>
          </div>
        </div>
      </header>

      {/* Section 1: Hero (Requirement 32) */}
      <section className="relative overflow-hidden py-16 sm:py-24 border-b border-stone-200/80">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-[#7A1528] text-xs font-bold mb-6 border border-rose-200/60 shadow-2xs">
            <Compass className="w-3.5 h-3.5 text-[#C89B3C]" />
            <span>Campus Mentorship Platform</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-950 tracking-tight leading-tight">
            Find a Mentor. <br />
            Get Guidance. <span className="text-[#7A1528]">Grow.</span>
          </h1>

          <p className="mt-5 text-base sm:text-lg text-stone-600 max-w-2xl mx-auto leading-relaxed">
            EduPilot connects university students with verified faculty advisors for academic capstones, research supervision, and career roadmaps — reinforced with 24/7 AI-guided roadmaps.
          </p>

          {/* Action CTAs */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/login"
              className="px-6 py-3 rounded-xl bg-[#7A1528] hover:bg-[#631020] text-white font-bold text-xs shadow-md shadow-[#7A1528]/20 flex items-center gap-2 btn-press"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/login"
              className="px-6 py-3 rounded-xl bg-white hover:bg-stone-50 border border-stone-200 text-stone-800 font-semibold text-xs shadow-2xs btn-press"
            >
              Explore EduPilot
            </Link>
          </div>

          {/* Student → AI Guidance → Faculty Mentor → Growth Illustration Motif */}
          <div className="mt-12 max-w-2xl mx-auto p-6 bg-white rounded-3xl border border-stone-200/80 shadow-xs">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4">The EduPilot Journey</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 items-center justify-between text-xs">
              <div className="flex flex-col items-center text-center p-3 rounded-2xl bg-stone-50 border border-stone-100 card-hover">
                <div className="w-10 h-10 rounded-xl bg-stone-200 text-stone-700 flex items-center justify-center mb-2 font-bold">
                  🎓
                </div>
                <span className="font-bold text-slate-900">1. Student</span>
                <span className="text-[10px] text-slate-500 mt-0.5">Profile & Goal</span>
              </div>

              <div className="flex flex-col items-center text-center p-3 rounded-2xl bg-indigo-50 border border-indigo-100 card-hover">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center mb-2 font-bold shadow-xs">
                  <Sparkles className="w-5 h-5 text-amber-300" />
                </div>
                <span className="font-bold text-indigo-950">2. AI Guidance</span>
                <span className="text-[10px] text-indigo-600 mt-0.5">Instant Roadmap</span>
              </div>

              <div className="flex flex-col items-center text-center p-3 rounded-2xl bg-rose-50 border border-rose-100 card-hover">
                <div className="w-10 h-10 rounded-xl bg-[#7A1528] text-white flex items-center justify-center mb-2 font-bold shadow-xs">
                  <GraduationCap className="w-5 h-5 text-[#C89B3C]" />
                </div>
                <span className="font-bold text-[#7A1528]">3. Faculty Mentor</span>
                <span className="text-[10px] text-slate-500 mt-0.5">Verified Advisor</span>
              </div>

              <div className="flex flex-col items-center text-center p-3 rounded-2xl bg-emerald-50 border border-emerald-100 card-hover">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center mb-2 font-bold shadow-xs">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <span className="font-bold text-emerald-950">4. Growth</span>
                <span className="text-[10px] text-emerald-600 mt-0.5">Career & Projects</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: How It Works (Requirement 33) */}
      <section className="py-16 sm:py-20 border-b border-stone-200/80 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-12">
            <span className="text-xs font-bold text-[#7A1528] uppercase tracking-wider">Simple Process</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight mt-1">
              How EduPilot Works
            </h2>
            <p className="text-xs text-stone-500 mt-1">Designed for university students and faculty guides.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-5 bg-stone-50/80 rounded-2xl border border-stone-200/70 card-hover">
              <span className="text-xs font-black text-[#7A1528] mb-2 block">01</span>
              <h3 className="font-extrabold text-sm text-slate-900 mb-1">Create your profile</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Add your academic semester, core technical skills, and career aspirations.
              </p>
            </div>

            <div className="p-5 bg-stone-50/80 rounded-2xl border border-stone-200/70 card-hover">
              <span className="text-xs font-black text-[#7A1528] mb-2 block">02</span>
              <h3 className="font-extrabold text-sm text-slate-900 mb-1">Find your mentor</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Browse verified department faculty with smart 5-factor match score calculations.
              </p>
            </div>

            <div className="p-5 bg-stone-50/80 rounded-2xl border border-stone-200/70 card-hover">
              <span className="text-xs font-black text-[#7A1528] mb-2 block">03</span>
              <h3 className="font-extrabold text-sm text-slate-900 mb-1">Request mentorship</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Submit your proposed project focus and receive an official tracking token.
              </p>
            </div>

            <div className="p-5 bg-stone-50/80 rounded-2xl border border-stone-200/70 card-hover">
              <span className="text-xs font-black text-[#7A1528] mb-2 block">04</span>
              <h3 className="font-extrabold text-sm text-slate-900 mb-1">Grow with guidance</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Work through deliverables with direct faculty feedback and real-time chat.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: AI + Human Mentorship (Requirement 33) */}
      <section className="py-16 sm:py-20 border-b border-stone-200/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-10">
            <span className="text-xs font-bold text-[#7A1528] uppercase tracking-wider">Hybrid Mentoring</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight mt-1">
              AI + Human Faculty Mentorship
            </h2>
            <p className="text-xs text-stone-500 mt-1">The best of immediate intelligence and human wisdom.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* AI Mentor Card */}
            <div className="p-6 bg-white rounded-3xl border border-indigo-100 shadow-2xs card-hover flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 mb-4">
                  <Bot className="w-6 h-6" />
                </div>
                <h3 className="font-extrabold text-base text-slate-900 mb-2">🤖 EduPilot AI Mentor</h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  Instant roadmaps, project brainstorming, code debugging, and interview preparation available 24/7.
                </p>
                <div className="space-y-1.5 text-xs text-slate-700">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    <span>Instant response anytime</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    <span>Skill gap analysis & roadmaps</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    <span>Automatic faculty escalation</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Human Faculty Card */}
            <div className="p-6 bg-white rounded-3xl border border-stone-200/80 shadow-2xs card-hover flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-[#7A1528] mb-4">
                  <GraduationCap className="w-6 h-6 text-[#C89B3C]" />
                </div>
                <h3 className="font-extrabold text-base text-slate-900 mb-2">👨‍🏫 Faculty Mentor</h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  Verified professors from your academic department who evaluate projects, supervise research, and sign capstones.
                </p>
                <div className="space-y-1.5 text-xs text-slate-700">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Real department faculty expertise</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Formal capstone supervision</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Direct real-time advisory chat</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 4: Simple CTA (Requirement 33) */}
      <section className="py-16 bg-[#7A1528] text-white text-center">
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="text-3xl font-extrabold tracking-tight">Your next step starts here.</h2>
          <p className="text-rose-100 text-xs mt-2 max-w-md mx-auto">
            Log in with your college credentials to start your academic mentoring journey.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              to="/login"
              className="px-6 py-3 rounded-xl bg-white hover:bg-stone-100 text-[#7A1528] font-extrabold text-xs shadow-md btn-press flex items-center gap-2"
            >
              <span>Enter EduPilot</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Quick Demo Switcher Strip for Faculty Viva Examiners */}
      <div className="bg-stone-900 text-stone-300 py-3 px-4 text-xs border-t border-stone-800">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <span className="text-[11px] text-stone-400">
            <strong>Viva Evaluators Quick Access:</strong> Click to immediately enter as any role:
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleQuickDemo('student')}
              className="px-2.5 py-1 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-lg text-[11px] font-semibold cursor-pointer"
            >
              Student Demo
            </button>
            <button
              onClick={() => handleQuickDemo('faculty')}
              className="px-2.5 py-1 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-lg text-[11px] font-semibold cursor-pointer"
            >
              Faculty Demo
            </button>
            <button
              onClick={() => handleQuickDemo('admin')}
              className="px-2.5 py-1 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-lg text-[11px] font-semibold cursor-pointer"
            >
              Admin Demo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
