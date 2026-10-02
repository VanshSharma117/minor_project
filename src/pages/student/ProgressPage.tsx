import React, { useEffect, useState } from 'react';
import {
  TrendingUp,
  Target,
  CheckSquare,
  Award,
  Calendar,
  Sparkles,
  CheckCircle2,
  FileCheck2,
  Clock,
  ArrowRight
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Task, Goal, Appointment, StudentProfile } from '../../types';

export const ProgressPage: React.FC = () => {
  const { user, profile } = useAuth();
  const stuProfile = profile as StudentProfile | null;

  const [tasks, setTasks] = useState<Task[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const [taskList, goalList, aptList] = await Promise.all([
          api.getTasks(),
          api.getGoals(),
          api.getAppointments()
        ]);
        setTasks(taskList);
        setGoals(goalList);
        setAppointments(aptList);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'Completed').length;
  const taskCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 100;

  const totalGoals = goals.length;
  const averageGoalProgress = totalGoals > 0
    ? Math.round(goals.reduce((acc, g) => acc + g.progressPercentage, 0) / totalGoals)
    : 75;

  const completedMilestones = goals.reduce((acc, g) => acc + g.milestones.filter(m => m.completed).length, 0);
  const totalMilestones = goals.reduce((acc, g) => acc + g.milestones.length, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Academic & Mentoring Progress</h1>
        <p className="text-xs text-slate-500 mt-1">
          Visual analytics for Semester {stuProfile?.semester || 6} milestones, faculty task completion, and skill competencies.
        </p>
      </div>

      {/* Top Progress Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Overall Progress</span>
            <TrendingUp className="w-4 h-4 text-[#7A1528]" />
          </div>
          <p className="text-3xl font-black text-[#7A1528]">{averageGoalProgress}%</p>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-2">
            <div className="bg-[#7A1528] h-full rounded-full" style={{ width: `${averageGoalProgress}%` }}></div>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">Across all active capstone roadmaps</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Milestones Completed</span>
            <Target className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-3xl font-black text-slate-900">{completedMilestones} / {totalMilestones}</p>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-2">
            <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${totalMilestones > 0 ? (completedMilestones / totalMilestones) * 100 : 0}%` }}></div>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">Verified deliverables</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Faculty Task Rate</span>
            <CheckSquare className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-3xl font-black text-slate-900">{taskCompletionRate}%</p>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-2">
            <div className="bg-blue-600 h-full rounded-full" style={{ width: `${taskCompletionRate}%` }}></div>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">{completedTasks} of {totalTasks} tasks submitted</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Review Meetings</span>
            <Calendar className="w-4 h-4 text-[#C89B3C]" />
          </div>
          <p className="text-3xl font-black text-slate-900">{appointments.length}</p>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-2">
            <div className="bg-[#C89B3C] h-full rounded-full" style={{ width: '80%' }}></div>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">Scheduled mentoring sessions</span>
        </div>
      </div>

      {/* Visual Breakdown Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Acquired Skills Competencies */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <h3 className="font-bold text-sm text-slate-900 mb-1 flex items-center gap-2">
            <Award className="w-4 h-4 text-[#C89B3C]" />
            Acquired Technical Competencies
          </h3>
          <p className="text-xs text-slate-500 mb-4">Logged through course evaluations and faculty feedback</p>

          <div className="space-y-3">
            {[
              { skill: 'Data Structures & Algorithms (C++)', level: 85, color: 'bg-emerald-500' },
              { skill: 'Machine Learning & Neural Architectures', level: 80, color: 'bg-[#7A1528]' },
              { skill: 'Full Stack Web & API Engineering (React)', level: 75, color: 'bg-blue-600' },
              { skill: 'Federated Edge Inference & Quantization', level: 70, color: 'bg-amber-500' },
              { skill: 'Database Systems & SQL Optimization', level: 90, color: 'bg-indigo-600' },
            ].map((item, idx) => (
              <div key={idx} className="text-xs">
                <div className="flex justify-between font-medium text-slate-700 mb-1">
                  <span>{item.skill}</span>
                  <span className="font-bold">{item.level}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${item.color}`} style={{ width: `${item.level}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Faculty Review Feedback Timeline */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <h3 className="font-bold text-sm text-slate-900 mb-1 flex items-center gap-2">
            <FileCheck2 className="w-4 h-4 text-emerald-600" />
            Faculty Review Feedback Timeline
          </h3>
          <p className="text-xs text-slate-500 mb-4">Official remarks on tasks and milestone submissions</p>

          <div className="space-y-3 text-xs">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-slate-900">Dr. Rahul Sharma</span>
                <span className="text-[10px] text-slate-400">Sep 30, 2026</span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                "Literature survey table is thoroughly referenced. Great momentum on non-IID data distribution math."
              </p>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-slate-900">Dr. Rahul Sharma</span>
                <span className="text-[10px] text-slate-400">Sep 28, 2026</span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                "Ensure memory bandwidth on Jetson Nano is benchmarked under sustained inference load."
              </p>
            </div>

            <div className="p-3 bg-rose-50/60 border border-rose-200/80 rounded-xl">
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-[#7A1528] flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-[#C89B3C]" /> EduPilot AI Mentor Summary
                </span>
                <span className="text-[10px] text-slate-400">Oct 01, 2026</span>
              </div>
              <p className="text-slate-700 leading-relaxed">
                "Your progress aligns with high-tier graduate research and tier-1 product firm benchmarks."
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
