import React, { useEffect, useState } from 'react';
import { CheckSquare, CheckCircle2, Clock } from 'lucide-react';
import { api } from '../../services/api';
import { Task } from '../../types';

export const TasksPage: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const data = await api.getTasks();
      setTasks(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkComplete = async (taskId: string) => {
    try {
      const updated = await api.updateTaskStatus(taskId, { status: 'Completed' });
      setTasks(tasks.map(t => t.id === taskId ? updated : t));
    } catch (err: any) {
      alert(err.message || 'Failed to update task');
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Tasks</h1>
        <p className="text-xs text-slate-500 mt-1">
          Review deliverables assigned by your faculty mentor.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-400 text-xs">Loading tasks...</div>
      ) : tasks.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200">
          <CheckSquare className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h3 className="font-bold text-sm text-slate-800">No tasks assigned</h3>
          <p className="text-xs text-slate-500 mt-1">You're all caught up with your mentoring deliverables.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map(task => {
            const isCompleted = task.status === 'Completed';

            return (
              <div
                key={task.id}
                className="bg-white rounded-2xl border border-stone-200/80 p-4 shadow-2xs card-hover flex items-center justify-between gap-4"
              >
                <div>
                  <h3 className={`text-sm font-bold ${isCompleted ? 'text-slate-400 line-through' : 'text-slate-900'}`}>
                    {task.title}
                  </h3>
                  {task.description && (
                    <p className="text-xs text-slate-500 mt-0.5">{task.description}</p>
                  )}
                  <div className="flex items-center gap-3 text-xs text-slate-400 mt-1.5">
                    <span className="flex items-center gap-1 font-medium text-slate-600">
                      <Clock className="w-3.5 h-3.5 text-slate-400" /> Deadline: {task.deadline}
                    </span>
                    <span>•</span>
                    <span className={`font-semibold ${
                      isCompleted ? 'text-emerald-700' : 'text-amber-700'
                    }`}>
                      {task.status}
                    </span>
                  </div>
                </div>

                <div>
                  {!isCompleted ? (
                    <button
                      onClick={() => handleMarkComplete(task.id)}
                      className="px-3.5 py-1.5 text-xs font-bold rounded-xl bg-[#7A1528] text-white hover:bg-[#631020] shadow-xs cursor-pointer btn-press"
                    >
                      Mark Complete
                    </button>
                  ) : (
                    <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> Completed
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
