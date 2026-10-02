import React, { useEffect, useState } from 'react';
import { Target, Plus, CheckCircle2, Circle, Calendar, Sparkles, MessageSquare } from 'lucide-react';
import { api } from '../../services/api';
import { Goal } from '../../types';

export const GoalsRoadmapPage: React.FC = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Career & Technical');
  const [newDate, setNewDate] = useState('2026-12-31');
  const [milestonesInput, setMilestonesInput] = useState('Milestone 1, Milestone 2, Milestone 3');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = async () => {
    try {
      const data = await api.getGoals();
      setGoals(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleMilestone = async (goalId: string, milestoneId: string, current: boolean) => {
    try {
      const updated = await api.updateMilestone(goalId, milestoneId, !current);
      setGoals(goals.map(g => g.id === goalId ? updated : g));
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle) return;

    try {
      const milestones = milestonesInput.split(',').map(m => m.trim()).filter(Boolean);
      const created = await api.createGoal({
        title: newTitle,
        category: newCategory,
        targetDate: newDate,
        milestones
      });
      setGoals([...goals, created]);
      setIsModalOpen(false);
      setNewTitle('');
    } catch (err: any) {
      alert(err.message || 'Failed to create goal');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Goals & Career Roadmap</h1>
          <p className="text-xs text-slate-500 mt-1">
            Break down your major capstone, placement preparation, and research targets into trackable milestones.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-[#7A1528] text-white text-xs font-bold rounded-xl hover:bg-[#631020] flex items-center gap-1.5 self-start sm:self-auto shadow-xs"
        >
          <Plus className="w-4 h-4" /> Add New Goal
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-400 text-xs">Loading goals and roadmap...</div>
      ) : goals.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200">
          <Target className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-bold text-sm text-slate-800">No active goals yet</h3>
          <p className="text-xs text-slate-500 mt-1">Set your first career goal or ask EduPilot AI to generate milestones.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {goals.map(goal => (
            <div key={goal.id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-0.5 rounded-md font-semibold bg-rose-50 text-[#7A1528]">
                      {goal.category}
                    </span>
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" /> Target: {goal.targetDate}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mt-1">{goal.title}</h3>
                </div>

                <div className="text-right">
                  <span className="text-xs text-slate-500 font-medium">Completion</span>
                  <p className="text-xl font-black text-[#7A1528]">{goal.progressPercentage}%</p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-4">
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-[#7A1528] h-full rounded-full transition-all duration-500"
                    style={{ width: `${goal.progressPercentage}%` }}
                  ></div>
                </div>
              </div>

              {/* Milestones List */}
              <div className="mt-5 space-y-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Actionable Milestones ({goal.milestones.filter(m => m.completed).length}/{goal.milestones.length})
                </span>
                {goal.milestones.map(m => (
                  <div
                    key={m.id}
                    onClick={() => handleToggleMilestone(goal.id, m.id, m.completed)}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      {m.completed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : (
                        <Circle className="w-4 h-4 text-slate-300 shrink-0" />
                      )}
                      <span className={`text-xs font-medium ${m.completed ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                        {m.title}
                      </span>
                    </div>
                    {m.targetDate && (
                      <span className="text-[10px] text-slate-400">By {m.targetDate}</span>
                    )}
                  </div>
                ))}
              </div>

              {/* Faculty Feedback Section */}
              {goal.facultyFeedback && (
                <div className="mt-4 p-3 bg-amber-50/80 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2">
                  <MessageSquare className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-amber-950">Faculty Review Note:</span>
                    <p className="mt-0.5 leading-relaxed">{goal.facultyFeedback}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create Goal Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="font-bold text-base text-slate-900 mb-3">Add New Academic Goal</h3>
            <form onSubmit={handleCreateGoal} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Goal Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Complete Full Stack Authentication Module & Deploy"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#7A1528] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={e => setNewCategory(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-xl bg-white"
                  >
                    <option value="Research & Project">Research & Project</option>
                    <option value="Career & Placement">Career & Placement</option>
                    <option value="Skill Acquisition">Skill Acquisition</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Target Date</label>
                  <input
                    type="date"
                    required
                    value={newDate}
                    onChange={e => setNewDate(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Milestones (Comma separated)</label>
                <textarea
                  rows={3}
                  value={milestonesInput}
                  onChange={e => setMilestonesInput(e.target.value)}
                  placeholder="Architecture setup, DB schemas, API endpoints, Frontend integration..."
                  className="w-full p-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#7A1528] focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#7A1528] text-white font-bold rounded-xl"
                >
                  Save Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
