import React, { useEffect, useState } from 'react';
import { CheckSquare, Plus, Clock, CheckCircle2, MessageSquare } from 'lucide-react';
import { api } from '../../services/api';
import { Task } from '../../types';

export const FacultyTasksPage: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeStudents, setActiveStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // New Task Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [studentId, setStudentId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('2026-10-20');
  const [priority, setPriority] = useState('Medium');

  // Feedback Modal
  const [reviewTask, setReviewTask] = useState<Task | null>(null);
  const [facultyRemarks, setFacultyRemarks] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        const [taskList, activeData] = await Promise.all([
          api.getTasks(),
          api.getActiveMentorship()
        ]);
        setTasks(taskList);
        const list = activeData.actives || [];
        setActiveStudents(list);
        if (list.length > 0) {
          setStudentId(list[0].mentorship.studentId);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId || !title) return;

    try {
      const newTask = await api.createTask({
        studentId,
        title,
        description,
        deadline,
        priority
      });
      setTasks([newTask, ...tasks]);
      setIsModalOpen(false);
      setTitle('');
      setDescription('');
    } catch (err: any) {
      alert(err.message || 'Failed to create task');
    }
  };

  const handleSaveRemarks = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewTask) return;

    try {
      const updated = await api.updateTaskStatus(reviewTask.id, {
        facultyRemarks
      });
      setTasks(tasks.map(t => t.id === reviewTask.id ? updated : t));
      setReviewTask(null);
      setFacultyRemarks('');
    } catch (err: any) {
      alert(err.message || 'Failed to update remarks');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Mentee Deliverables & Tasks</h1>
          <p className="text-xs text-slate-500 mt-1">
            Assign technical milestones, review code benchmarks, and provide feedback to active students.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-[#7A1528] text-white text-xs font-bold rounded-xl hover:bg-[#631020] flex items-center gap-1.5 self-start sm:self-auto shadow-xs"
        >
          <Plus className="w-4 h-4" /> Assign New Task
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-400 text-xs">Loading tasks...</div>
      ) : tasks.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200">
          <CheckSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-bold text-sm text-slate-800">No tasks assigned yet</h3>
          <p className="text-xs text-slate-500 mt-1">Assign deliverables to your active mentees to track progress.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {tasks.map(task => {
            const isCompleted = task.status === 'Completed';
            return (
              <div
                key={task.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs hover:shadow-xs transition-shadow"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      task.priority === 'High' ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {task.priority} Priority
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isCompleted ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {task.status}
                    </span>
                  </div>

                  <span className="text-xs text-slate-500 flex items-center gap-1 font-medium">
                    <Clock className="w-3.5 h-3.5" /> Deadline: <strong>{task.deadline}</strong>
                  </span>
                </div>

                <div className="mt-3">
                  <h3 className="font-bold text-sm text-slate-900">{task.title}</h3>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{task.description}</p>
                </div>

                {task.submissionNotes && (
                  <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700">
                    <span className="font-bold block text-slate-900 mb-0.5">Student Submission:</span>
                    <p>{task.submissionNotes}</p>
                  </div>
                )}

                {task.facultyRemarks && (
                  <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900">
                    <span className="font-bold block text-amber-950 mb-0.5">Your Evaluation Remarks:</span>
                    <p>{task.facultyRemarks}</p>
                  </div>
                )}

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                  <button
                    onClick={() => {
                      setReviewTask(task);
                      setFacultyRemarks(task.facultyRemarks || '');
                    }}
                    className="px-3.5 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 flex items-center gap-1"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-[#7A1528]" />
                    {task.facultyRemarks ? 'Edit Remarks' : 'Provide Feedback'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Assign Task Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 text-xs">
            <h3 className="font-bold text-base text-slate-900 mb-3">Assign Task to Mentee</h3>
            <form onSubmit={handleCreateTask} className="space-y-3.5">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Mentee</label>
                <select
                  value={studentId}
                  onChange={e => setStudentId(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl bg-white"
                >
                  {activeStudents.map(item => (
                    <option key={item.mentorship.studentId} value={item.mentorship.studentId}>
                      {item.mentorship.studentName} ({item.mentorship.requestToken})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Task Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Implement Quantized PyTorch Model & Benchmark Latency"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#7A1528] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description / Deliverable Specs</label>
                <textarea
                  rows={3}
                  placeholder="Specific requirements, dataset paths, or expected output metrics..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#7A1528] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Deadline</label>
                  <input
                    type="date"
                    required
                    value={deadline}
                    onChange={e => setDeadline(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={e => setPriority(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-xl bg-white"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
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
                  Assign Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Review Remarks Modal */}
      {reviewTask && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 text-xs">
            <h3 className="font-bold text-sm text-slate-900 mb-1">Provide Faculty Feedback</h3>
            <p className="text-slate-500 mb-3">{reviewTask.title}</p>

            <form onSubmit={handleSaveRemarks} className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Feedback / Remarks</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Detailed notes on student benchmark output, methodology correctness, or next steps..."
                  value={facultyRemarks}
                  onChange={e => setFacultyRemarks(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#7A1528] focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReviewTask(null)}
                  className="px-4 py-2 border rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#7A1528] text-white font-bold rounded-xl"
                >
                  Save Feedback
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
