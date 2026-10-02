import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Send,
  User,
  Bot,
  GraduationCap,
  Sparkles,
  ArrowRight,
  Compass,
  Code2,
  TrendingUp,
  BrainCircuit
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { StudentProfile } from '../../types';

interface MessageItem {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  time: string;
  suggestedAction?: 'escalate_to_faculty' | 'create_roadmap' | 'view_mentors';
  mentoringSummary?: {
    goal: string;
    currentSkills: string[];
    needsHelpWith: string;
    recommendedMentoringArea: string;
  };
}

export const AIMentorPage: React.FC = () => {
  const { user, profile } = useAuth();
  const stuProfile = profile as StudentProfile | null;
  const navigate = useNavigate();

  const [messages, setMessages] = useState<MessageItem[]>([
    {
      id: 'msg-init',
      role: 'assistant',
      content: `Hello ${user?.name?.split(' ')[0] || 'Student'}! 👋

I'm your EduPilot AI Academic & Career Mentor. I can help you build structured learning roadmaps, brainstorm project architectures, analyze your skill gaps, and prepare for interviews.

What would you like to achieve today?`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [latestSummary, setLatestSummary] = useState<any>(null);
  const endRef = useRef<HTMLDivElement>(null);

  // Quick Action Cards (Requirement 18)
  const quickActions = [
    { title: 'Build my roadmap', icon: Compass, prompt: 'Create my semester learning roadmap for becoming a high-level engineer.' },
    { title: 'Help with my project', icon: Code2, prompt: 'Help me plan the architecture and deliverables for my college capstone project.' },
    { title: 'Analyze my skills', icon: BrainCircuit, prompt: 'Analyze my current technical skills and identify high-value industry gaps.' },
    { title: 'Career guidance', icon: TrendingUp, prompt: 'Give me career guidance and internship preparation strategies.' }
  ];

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleEscalateToFaculty = (summary?: any) => {
    const summaryToUse = summary || latestSummary;
    navigate('/student/find-mentor', {
      state: {
        prefillReason: summaryToUse?.goal || stuProfile?.careerGoal || 'Academic and Project Mentorship',
        prefillArea: summaryToUse?.recommendedMentoringArea || 'Projects & Research',
        prefillMessage: summaryToUse
          ? `AI Mentoring Assessment: Needs assistance with ${summaryToUse.needsHelpWith}. Relevant skills: ${summaryToUse.currentSkills?.join(', ')}.`
          : `Seeking faculty mentorship for ${stuProfile?.careerGoal || 'capstone project and career growth'}.`,
        aiSummary: summaryToUse
      }
    });
  };

  const handleSend = async (text: string) => {
    if (!text.trim() || loading) return;

    const userMsg: MessageItem = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const newChat = [...messages, userMsg];
    setMessages(newChat);
    setInput('');
    setLoading(true);

    try {
      const payload = newChat.map(m => ({
        role: m.role,
        content: m.content
      }));

      const res = await api.sendAIChat(payload);

      if (res.mentoringSummary) {
        setLatestSummary(res.mentoringSummary);
      }

      const aiMsg: MessageItem = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: res.reply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedAction: res.suggestedAction,
        mentoringSummary: res.mentoringSummary
      };

      setMessages([...newChat, aiMsg]);
    } catch (err) {
      setMessages([
        ...newChat,
        {
          id: `ai-err-${Date.now()}`,
          role: 'assistant',
          content: 'I am here to guide your studies! How can I assist you with your course subjects or project roadmap?',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      {/* 1. Special AI Mentor Header (Requirement 16) */}
      <div className="bg-white rounded-3xl border border-indigo-100 p-4 sm:p-5 shadow-2xs flex flex-wrap items-center justify-between gap-3 bg-gradient-to-r from-white via-indigo-50/20 to-rose-50/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-xs">
            <Sparkles className="w-5 h-5 text-amber-300" />
          </div>
          <div>
            <h1 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
              ✦ EduPilot AI
              <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                Academic & Career Advisor
              </span>
            </h1>
            <p className="text-xs text-slate-500">Your personal academic & career mentor</p>
          </div>
        </div>

        <button
          onClick={() => handleEscalateToFaculty()}
          className="text-xs font-semibold px-3.5 py-2 rounded-xl border border-stone-200 text-stone-700 hover:bg-stone-50 flex items-center gap-1.5 cursor-pointer btn-press"
        >
          <GraduationCap className="w-4 h-4 text-[#7A1528]" />
          <span>Find Faculty Mentor &rarr;</span>
        </button>
      </div>

      {/* 2. Chat Box */}
      <div className="bg-white rounded-3xl border border-stone-200/80 shadow-xs flex flex-col h-[560px]">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.map(msg => {
            const isAI = msg.role === 'assistant';
            return (
              <div key={msg.id} className={`flex gap-3 animate-page ${isAI ? 'justify-start' : 'justify-end'}`}>
                {isAI && (
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 mt-0.5 border border-indigo-200/80">
                    <Sparkles className="w-4 h-4" />
                  </div>
                )}

                <div className={`max-w-2xl rounded-2xl p-4 text-xs leading-relaxed ${
                  isAI
                    ? 'bg-white border border-indigo-100 text-slate-800 shadow-2xs'
                    : 'bg-[#7A1528] text-white shadow-xs'
                }`}>
                  <div className="flex items-center justify-between mb-1.5 gap-4">
                    <span className={`font-bold text-[11px] ${isAI ? 'text-indigo-900' : 'text-amber-200'}`}>
                      {isAI ? '✦ EduPilot AI' : user?.name}
                    </span>
                    <span className={`text-[10px] ${isAI ? 'text-slate-400' : 'text-rose-200'}`}>
                      {msg.time}
                    </span>
                  </div>

                  <div className="whitespace-pre-wrap">{msg.content}</div>

                  {/* Section 11: Simple Faculty Escalation */}
                  {msg.suggestedAction === 'escalate_to_faculty' && (
                    <div className="mt-3.5 pt-3 border-t border-slate-100 bg-stone-50 p-3 rounded-xl border border-stone-200/70">
                      <p className="font-bold text-[#7A1528] text-xs">
                        Need guidance from a faculty member?
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5 mb-2.5">
                        This topic requires formal institutional approval or laboratory supervision.
                      </p>
                      <button
                        onClick={() => handleEscalateToFaculty(msg.mentoringSummary)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#7A1528] hover:bg-[#631020] text-white font-bold rounded-lg text-xs cursor-pointer btn-press"
                      >
                        <span>Find a Faculty Mentor (Attach AI Assessment) &rarr;</span>
                      </button>
                    </div>
                  )}
                </div>

                {!isAI && (
                  <div className="w-8 h-8 rounded-xl bg-stone-200 text-slate-700 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}

          {/* AI Generating Animation (Requirement 17) */}
          {loading && (
            <div className="flex items-center gap-2.5 text-xs bg-indigo-50/80 border border-indigo-200/70 px-4 py-2.5 rounded-2xl w-fit shadow-2xs animate-page">
              <div className="w-5 h-5 rounded-md bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                <Sparkles className="w-3 h-3 text-amber-300" />
              </div>
              <span className="font-bold text-xs text-indigo-950">EduPilot AI</span>
              <span className="inline-flex gap-1 items-center ml-1">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-dot-1"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-dot-2"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-dot-3"></span>
              </span>
            </div>
          )}
          <div ref={endRef} />
        </div>

        {/* 3. AI Quick Actions Cards (Requirement 18) */}
        {messages.length <= 2 && (
          <div className="px-4 py-3 bg-stone-50/70 border-t border-stone-100">
            <p className="text-[11px] font-semibold text-slate-400 mb-2">QUICK GUIDANCE PROMPTS:</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {quickActions.map((qa, idx) => {
                const Icon = qa.icon;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSend(qa.prompt)}
                    className="p-2.5 bg-white hover:bg-stone-50 border border-stone-200 rounded-xl text-left card-hover btn-press cursor-pointer group"
                  >
                    <Icon className="w-4 h-4 text-indigo-600 mb-1 group-hover:translate-x-0.5 transition-transform" />
                    <span className="text-[11px] font-bold text-slate-800 block leading-tight">
                      {qa.title}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Simple Chat Input (Bottom) */}
        <form
          onSubmit={e => {
            e.preventDefault();
            handleSend(input);
          }}
          className="p-3.5 border-t border-stone-200/80 flex items-center gap-2 bg-white rounded-b-3xl"
        >
          <input
            type="text"
            placeholder="Ask anything about coursework, roadmaps, or projects..."
            value={input}
            onChange={e => setInput(e.target.value)}
            disabled={loading}
            className="flex-1 px-4 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-[#7A1528] focus:bg-white focus:outline-none transition-all"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="px-4 py-2.5 bg-[#7A1528] hover:bg-[#631020] text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 disabled:opacity-40 cursor-pointer btn-press"
          >
            <span>Send</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
