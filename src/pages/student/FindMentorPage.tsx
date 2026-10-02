import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Search,
  CheckCircle2,
  X,
  AlertCircle,
  Building,
  GraduationCap,
  Sparkles,
  ArrowRight,
  User,
  Filter
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { FacultyProfile, MatchScoreBreakdown, StudentProfile } from '../../types';
import { MatchScoreBadge } from '../../components/common/MatchScoreBadge';

export const FindMentorPage: React.FC = () => {
  const { profile } = useAuth();
  const stuProfile = profile as StudentProfile | null;
  const location = useLocation();

  const escalationData = location.state as {
    prefillReason?: string;
    prefillArea?: string;
    prefillMessage?: string;
    aiSummary?: any;
  } | null;

  const [hasAISummary, setHasAISummary] = useState(!!escalationData?.aiSummary || !!escalationData?.prefillReason);

  const [facultyList, setFacultyList] = useState<Array<{ id: string; name: string; email: string; avatarUrl?: string; profile: FacultyProfile }>>([]);
  const [matchRecommendations, setMatchRecommendations] = useState<Map<string, MatchScoreBreakdown>>(new Map());
  const [loading, setLoading] = useState(true);

  // Filters & Chips (Requirement 12)
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedChip, setSelectedChip] = useState('All');
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedAvailability, setSelectedAvailability] = useState('All');

  const filterChips = [
    'All',
    'AI / ML',
    'Web Development',
    'Cloud',
    'Research',
    'Career',
    'Cybersecurity'
  ];

  // Modals
  const [viewingFaculty, setViewingFaculty] = useState<any>(null);
  const [requestingFaculty, setRequestingFaculty] = useState<any>(null);

  // Request Form
  const [reason, setReason] = useState(escalationData?.prefillReason || '');
  const [mentoringArea, setMentoringArea] = useState(escalationData?.prefillArea || 'Projects & Research');
  const [message, setMessage] = useState(escalationData?.prefillMessage || '');
  const [meetingMode, setMeetingMode] = useState('Hybrid');
  const [submitting, setSubmitting] = useState(false);
  const [createdToken, setCreatedToken] = useState<string | null>(null);
  const [requestError, setRequestError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [facData, matchData] = await Promise.all([
          api.getFacultyList(),
          api.getMatchRecommendations()
        ]);
        setFacultyList(facData);

        const recMap = new Map<string, MatchScoreBreakdown>();
        matchData.recommendations.forEach(r => recMap.set(r.facultyId, r));
        setMatchRecommendations(recMap);
      } catch (err) {
        console.error('Failed to load faculty:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleOpenRequest = (faculty: any) => {
    setRequestingFaculty(faculty);
    if (!reason && escalationData?.prefillReason) {
      setReason(escalationData.prefillReason);
    }
    if (escalationData?.prefillArea) {
      setMentoringArea(escalationData.prefillArea);
    }
    if (!message && escalationData?.prefillMessage) {
      setMessage(escalationData.prefillMessage);
    }
    setCreatedToken(null);
    setRequestError(null);
  };

  const handleSendRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestingFaculty) return;

    setSubmitting(true);
    setRequestError(null);

    try {
      const res = await api.createMentorshipRequest({
        facultyId: requestingFaculty.id,
        reason,
        mentoringArea,
        message,
        preferredMeetingMode: meetingMode,
        studentGoal: stuProfile?.careerGoal || ''
      });
      setCreatedToken(res.token);
    } catch (err: any) {
      setRequestError(err.message || 'Failed to submit request');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredFaculty = facultyList.filter(f => {
    if (selectedDept !== 'All' && f.profile.department !== selectedDept) return false;
    if (selectedAvailability !== 'All' && f.profile.availability !== selectedAvailability) return false;

    // Filter chip logic
    if (selectedChip !== 'All') {
      const chipLower = selectedChip.toLowerCase();
      const hasExpertise = f.profile.expertise.some(e => e.toLowerCase().includes(chipLower.replace('/', '')));
      const hasResearch = f.profile.researchAreas?.some(r => r.toLowerCase().includes(chipLower.replace('/', '')));
      const hasMentoring = f.profile.mentoringAreas?.some(m => m.toLowerCase().includes(chipLower));
      if (!hasExpertise && !hasResearch && !hasMentoring) return false;
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchName = f.name.toLowerCase().includes(term);
      const matchExp = f.profile.expertise.some(e => e.toLowerCase().includes(term));
      const matchDept = f.profile.department.toLowerCase().includes(term);
      if (!matchName && !matchExp && !matchDept) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* 1. Header (Requirement 12) */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Find Your Mentor</h1>
        <p className="text-xs text-slate-500 mt-1">
          Choose a faculty member who matches your goals.
        </p>
      </div>

      {/* AI Escalation Banner if arriving with AI summary */}
      {hasAISummary && (
        <div className="bg-amber-50/80 border border-amber-200/90 rounded-2xl p-4 flex items-center justify-between gap-3 text-xs shadow-2xs">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-5 h-5 text-[#C89B3C] shrink-0" />
            <div>
              <p className="font-bold text-amber-950">AI Goal Assessment Attached from EduPilot AI</p>
              <p className="text-amber-800 text-[11px] mt-0.5">
                When you click "Request Mentorship", your goals and background have been prepared for the professor.
              </p>
            </div>
          </div>
          <button
            onClick={() => setHasAISummary(false)}
            className="text-amber-800 hover:text-amber-950 text-xs font-semibold px-2 py-1 rounded-lg border border-amber-300 bg-white cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* 2. Premium Search & Filter Bar (Requirement 12) */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-stone-200/80 shadow-2xs space-y-3.5">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-[240px] relative">
            <input
              type="text"
              placeholder="Search faculty, expertise or department..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2.5 text-xs bg-stone-50/80 border border-stone-200 rounded-xl focus:ring-2 focus:ring-[#7A1528] focus:bg-white focus:outline-none transition-all"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          </div>

          <select
            value={selectedDept}
            onChange={e => setSelectedDept(e.target.value)}
            className="text-xs border border-stone-200 rounded-xl px-3 py-2.5 bg-stone-50/80 focus:outline-none focus:ring-2 focus:ring-[#7A1528] transition-all"
          >
            <option value="All">All Departments</option>
            <option value="Computer Engineering">Computer Engineering</option>
            <option value="Information Technology">Information Technology</option>
            <option value="Electronics & Telecommunication">Electronics & Telecommunication</option>
          </select>

          <select
            value={selectedAvailability}
            onChange={e => setSelectedAvailability(e.target.value)}
            className="text-xs border border-stone-200 rounded-xl px-3 py-2.5 bg-stone-50/80 focus:outline-none focus:ring-2 focus:ring-[#7A1528] transition-all"
          >
            <option value="All">All Availability</option>
            <option value="Available">Available</option>
            <option value="Busy">Busy</option>
            <option value="Unavailable">Unavailable</option>
          </select>
        </div>

        {/* Filter Chips (Requirement 12) */}
        <div className="flex items-center gap-2 overflow-x-auto pt-1 pb-0.5">
          <span className="text-[11px] font-semibold text-slate-400 shrink-0 mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3" /> Topic:
          </span>
          {filterChips.map(chip => {
            const isSelected = selectedChip === chip;
            return (
              <button
                key={chip}
                onClick={() => setSelectedChip(chip)}
                className={`text-xs px-3 py-1.5 rounded-full font-semibold shrink-0 transition-all cursor-pointer btn-press ${
                  isSelected
                    ? 'bg-[#7A1528] text-white shadow-xs'
                    : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-50'
                }`}
              >
                {chip}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Faculty Cards Grid (Requirement 12) */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-pulse">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white rounded-3xl p-5 border border-stone-200/80 h-52"></div>
          ))}
        </div>
      ) : filteredFaculty.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-3xl border border-stone-200/80 shadow-2xs">
          <Building className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h3 className="font-bold text-sm text-slate-800">No faculty members found</h3>
          <p className="text-xs text-slate-500 mt-1">Try resetting the search terms or topic chips.</p>
          <button
            onClick={() => { setSearchTerm(''); setSelectedChip('All'); setSelectedDept('All'); setSelectedAvailability('All'); }}
            className="mt-4 px-4 py-2 bg-stone-100 text-stone-700 hover:bg-stone-200 rounded-xl text-xs font-semibold"
          >
            Clear all filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredFaculty.map(fac => {
            const match = matchRecommendations.get(fac.id);
            const score = match ? match.overallScore : 75;
            const isAvailable = fac.profile.availability === 'Available';

            return (
              <div
                key={fac.id}
                className="bg-white rounded-3xl border border-stone-200/80 p-5 shadow-2xs card-hover flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img
                          src={fac.avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80'}
                          alt={fac.name}
                          className="w-13 h-13 rounded-2xl object-cover border border-stone-200 shadow-2xs"
                        />
                        <span
                          className={`w-3.5 h-3.5 rounded-full border-2 border-white absolute -bottom-0.5 -right-0.5 ${
                            isAvailable ? 'bg-emerald-500' : 'bg-amber-400'
                          }`}
                        ></span>
                      </div>
                      <div>
                        <h3 className="font-extrabold text-sm text-slate-900 leading-snug">{fac.name}</h3>
                        <p className="text-xs text-slate-500">{fac.profile.designation}</p>
                        <p className="text-[11px] text-[#7A1528] font-medium">{fac.profile.department}</p>
                      </div>
                    </div>

                    {/* Circular Match Percentage (Requirement 13) */}
                    <MatchScoreBadge score={score} breakdown={match} size="sm" />
                  </div>

                  {/* 2-3 Expertise Chips (Requirement 12) */}
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {fac.profile.expertise.slice(0, 3).map((exp, i) => (
                      <span key={i} className="text-[10px] px-2.5 py-0.5 rounded-md bg-stone-100 text-stone-700 font-medium">
                        {exp}
                      </span>
                    ))}
                  </div>

                  {/* Availability Indicator */}
                  <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mb-1">
                    <span className={`w-2 h-2 rounded-full ${isAvailable ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                    <span>Status: <strong className="text-slate-800">{fac.profile.availability}</strong></span>
                    <span className="text-stone-300">•</span>
                    <span className="text-slate-400">Office: {fac.profile.officeLocation?.split(',')[0]}</span>
                  </div>
                </div>

                {/* 2 Simple Buttons with Hover Micro-Interactions */}
                <div className="mt-4 pt-3 border-t border-stone-100 flex items-center gap-2">
                  <button
                    onClick={() => setViewingFaculty(fac)}
                    className="flex-1 py-2 text-xs font-semibold rounded-xl border border-stone-200 text-stone-700 hover:bg-stone-50 btn-press cursor-pointer"
                  >
                    View Profile
                  </button>
                  <button
                    onClick={() => handleOpenRequest(fac)}
                    className="flex-1 py-2 text-xs font-bold rounded-xl bg-[#7A1528] text-white hover:bg-[#631020] shadow-xs btn-press cursor-pointer flex items-center justify-center gap-1"
                  >
                    <span>Request Mentorship</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 4. Faculty Profile Modal (Requirement 14) */}
      {viewingFaculty && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-page">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-xl border border-stone-200 text-xs">
            {/* Header with Avatar, Designation, Department */}
            <div className="flex items-start justify-between pb-3.5 border-b border-stone-100 mb-4">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img
                    src={viewingFaculty.avatarUrl}
                    alt={viewingFaculty.name}
                    className="w-14 h-14 rounded-2xl object-cover border border-stone-200 shadow-2xs"
                  />
                  <span
                    className={`w-3.5 h-3.5 rounded-full border-2 border-white absolute -bottom-0.5 -right-0.5 ${
                      viewingFaculty.profile.availability === 'Available' ? 'bg-emerald-500' : 'bg-amber-400'
                    }`}
                  ></span>
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 leading-snug">{viewingFaculty.name}</h3>
                  <p className="text-slate-500 text-xs">{viewingFaculty.profile.designation} • {viewingFaculty.profile.department}</p>
                  <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 font-bold mt-0.5">
                    ● {viewingFaculty.profile.availability} for Mentoring
                  </span>
                </div>
              </div>
              <button
                onClick={() => setViewingFaculty(null)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-stone-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-slate-700">
              <div>
                <span className="font-bold text-slate-900 block mb-1">About</span>
                <p className="text-slate-600 leading-relaxed">{viewingFaculty.profile.bio}</p>
              </div>

              <div>
                <span className="font-bold text-slate-900 block mb-1.5">Expertise</span>
                <div className="flex flex-wrap gap-1.5">
                  {viewingFaculty.profile.expertise.map((e: string, i: number) => (
                    <span key={i} className="px-2.5 py-0.5 rounded-md bg-stone-100 text-stone-800 font-medium text-[11px]">
                      {e}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <span className="font-bold text-slate-900 block mb-1.5">Mentoring Areas</span>
                <div className="flex flex-wrap gap-1.5">
                  {viewingFaculty.profile.mentoringAreas.map((m: string, i: number) => (
                    <span key={i} className="px-2.5 py-0.5 rounded-md bg-rose-50 text-[#7A1528] font-semibold text-[11px]">
                      {m}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/60">
                <span className="font-bold text-slate-900 block mb-0.5">Office & Contact</span>
                <p className="text-slate-600">Location: {viewingFaculty.profile.officeLocation}</p>
                <p className="text-slate-600 mt-0.5">Meeting Mode: {viewingFaculty.profile.meetingMode}</p>
              </div>
            </div>

            <div className="mt-5 pt-3.5 border-t border-stone-100 flex items-center justify-end gap-2">
              <button
                onClick={() => setViewingFaculty(null)}
                className="px-4 py-2 border rounded-xl font-semibold text-slate-600 hover:bg-stone-50 cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => {
                  const fac = viewingFaculty;
                  setViewingFaculty(null);
                  handleOpenRequest(fac);
                }}
                className="px-5 py-2 bg-[#7A1528] hover:bg-[#631020] text-white font-bold rounded-xl shadow-xs btn-press cursor-pointer flex items-center gap-1.5"
              >
                <span>Request Mentorship</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Mentorship Request Modal & Animated Success (Requirement 15) */}
      {requestingFaculty && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-page">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-xl border border-stone-200 text-xs">
            {createdToken ? (
              <div className="text-center py-4">
                {/* Subtle Checkmark Animation (Requirement 15) */}
                <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3 border border-emerald-200">
                  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" className="animate-check"></polyline>
                  </svg>
                </div>
                <h3 className="text-base font-extrabold text-slate-900">Request Sent!</h3>
                <p className="text-slate-600 text-xs mt-1">
                  Your mentorship request has been sent to <strong>{requestingFaculty.name}</strong>.
                </p>

                <div className="mt-4 p-3 bg-stone-50 border border-stone-200 rounded-xl text-center">
                  <span className="text-[11px] font-semibold text-slate-400 block mb-0.5 tracking-wider">REQUEST TOKEN</span>
                  <span className="font-mono text-base font-black text-[#7A1528] tracking-wide">{createdToken}</span>
                </div>

                <div className="mt-3 p-2 rounded-lg bg-amber-50/70 border border-amber-200/60 text-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Status</span>
                  <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-800 mt-0.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                    <span>Waiting for faculty approval</span>
                  </div>
                </div>

                <button
                  onClick={() => setRequestingFaculty(null)}
                  className="mt-6 px-6 py-2.5 bg-[#7A1528] hover:bg-[#631020] text-white font-bold rounded-xl btn-press cursor-pointer shadow-xs"
                >
                  Done
                </button>
              </div>
            ) : (
              <div>
                <div className="flex items-start justify-between pb-2.5 border-b border-stone-100 mb-3.5">
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900">Request Mentorship</h3>
                    <p className="text-slate-500">Faculty Guide: <strong>{requestingFaculty.name}</strong></p>
                  </div>
                  <button onClick={() => setRequestingFaculty(null)} className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {requestError && (
                  <div className="mb-3 p-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{requestError}</span>
                  </div>
                )}

                <form onSubmit={handleSendRequest} className="space-y-3.5">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Reason for Mentorship</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Capstone project guidance and research review"
                      value={reason}
                      onChange={e => setReason(e.target.value)}
                      className="w-full p-2.5 border border-stone-200 rounded-xl focus:ring-2 focus:ring-[#7A1528] focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Mentoring Area</label>
                      <select
                        value={mentoringArea}
                        onChange={e => setMentoringArea(e.target.value)}
                        className="w-full p-2.5 border border-stone-200 rounded-xl bg-white"
                      >
                        <option value="Projects & Research">Projects & Research</option>
                        <option value="Capstone Supervision">Capstone Supervision</option>
                        <option value="Career & Higher Studies">Career & Higher Studies</option>
                        <option value="Internship Guidance">Internship Guidance</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Meeting Mode</label>
                      <select
                        value={meetingMode}
                        onChange={e => setMeetingMode(e.target.value)}
                        className="w-full p-2.5 border border-stone-200 rounded-xl bg-white"
                      >
                        <option value="Hybrid">Hybrid</option>
                        <option value="In-person">In-person</option>
                        <option value="Online">Online</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Short Message</label>
                    <textarea
                      rows={2}
                      placeholder="Brief note introducing your project topic or goals..."
                      value={message}
                      onChange={e => setMessage(e.target.value)}
                      className="w-full p-2.5 border border-stone-200 rounded-xl focus:ring-2 focus:ring-[#7A1528] focus:outline-none"
                    />
                  </div>

                  <div className="pt-2 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setRequestingFaculty(null)}
                      className="px-4 py-2 border rounded-xl font-semibold hover:bg-stone-50 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-5 py-2 bg-[#7A1528] hover:bg-[#631020] text-white font-bold rounded-xl btn-press cursor-pointer shadow-xs"
                    >
                      {submitting ? 'Sending...' : 'Send Request →'}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
