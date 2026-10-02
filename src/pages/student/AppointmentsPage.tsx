import React, { useEffect, useState } from 'react';
import { Calendar, Clock, Plus, Video, MapPin, CheckCircle2, AlertCircle } from 'lucide-react';
import { api } from '../../services/api';
import { Appointment } from '../../types';

export const AppointmentsPage: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [date, setDate] = useState('2026-10-12');
  const [time, setTime] = useState('02:30 PM - 03:30 PM');
  const [mode, setMode] = useState<'In-person' | 'Online'>('In-person');
  const [topic, setTopic] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    try {
      const data = await api.getAppointments();
      setAppointments(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic) return;

    try {
      const apt = await api.createAppointment({
        date,
        time,
        mode,
        topic,
        notes
      });
      setAppointments([apt, ...appointments]);
      setIsModalOpen(false);
      setTopic('');
    } catch (err: any) {
      alert(err.message || 'Failed to request meeting');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Mentoring Appointments & Reviews</h1>
          <p className="text-xs text-slate-500 mt-1">
            Book formal in-person cabin meetings or virtual syncs with your faculty mentor.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-[#7A1528] text-white text-xs font-bold rounded-xl hover:bg-[#631020] flex items-center gap-1.5 self-start sm:self-auto shadow-xs"
        >
          <Plus className="w-4 h-4" /> Request Meeting
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-400 text-xs">Loading meetings...</div>
      ) : appointments.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200">
          <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-bold text-sm text-slate-800">No appointments scheduled</h3>
          <p className="text-xs text-slate-500 mt-1">Request a meeting slot during your faculty mentor's office hours.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {appointments.map(apt => (
            <div
              key={apt.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs hover:shadow-xs transition-shadow flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-amber-50 text-[#7A1528] border border-amber-200 flex flex-col items-center justify-center shrink-0">
                  <Calendar className="w-5 h-5 text-[#C89B3C]" />
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm text-slate-900">{apt.topic}</h3>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      apt.status === 'Confirmed' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {apt.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 mt-0.5">Faculty: <strong>{apt.facultyName}</strong></p>

                  <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-1.5 flex-wrap">
                    <span className="flex items-center gap-1 font-semibold text-slate-700">
                      <Clock className="w-3.5 h-3.5" /> {apt.date} • {apt.time}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      {apt.mode === 'Online' ? <Video className="w-3.5 h-3.5" /> : <MapPin className="w-3.5 h-3.5" />}
                      {apt.locationOrLink} ({apt.mode})
                    </span>
                  </div>

                  {apt.notes && (
                    <p className="text-[11px] text-slate-500 mt-2 bg-slate-50 p-2 rounded-lg border">
                      Note: {apt.notes}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Request Meeting Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 text-xs">
            <h3 className="font-bold text-base text-slate-900 mb-3">Request Mentoring Meeting</h3>
            <form onSubmit={handleCreate} className="space-y-3.5">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Meeting Agenda / Topic</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mid-term Capstone Evaluation & Conference Outline"
                  value={topic}
                  onChange={e => setTopic(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#7A1528] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Meeting Mode</label>
                  <select
                    value={mode}
                    onChange={e => setMode(e.target.value as any)}
                    className="w-full p-2 border border-slate-300 rounded-xl bg-white"
                  >
                    <option value="In-person">In-person (Cabin)</option>
                    <option value="Online">Online (Google Meet)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Preferred Time Slot</label>
                <input
                  type="text"
                  placeholder="e.g. 02:30 PM - 03:30 PM"
                  value={time}
                  onChange={e => setTime(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Preparation Notes for Faculty</label>
                <textarea
                  rows={2}
                  placeholder="Items you plan to demonstrate or bring..."
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-xl"
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
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
