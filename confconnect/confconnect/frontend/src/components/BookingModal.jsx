import { useState } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';

export default function BookingModal({ room, onClose, onSuccess }) {
  const today = new Date().toISOString().split('T')[0];
  const [form, setForm] = useState({ date: today, startTime: '09:00', endTime: '10:00', purpose: '' });
  const [loading, setLoading] = useState(false);
  const [availability, setAvailability] = useState([]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const checkAvailability = async (date) => {
    set('date', date);
    if (!date) return;
    try {
      const { data } = await api.get(`/rooms/${room._id}/availability?date=${date}`);
      setAvailability(data.bookings || []);
    } catch { /* silent */ }
  };

  const handleSubmit = async () => {
    if (!form.date || !form.startTime || !form.endTime || !form.purpose.trim()) {
      toast.error('Please fill in all required fields'); return;
    }
    if (form.startTime >= form.endTime) {
      toast.error('End time must be after start time'); return;
    }
    setLoading(true);
    try {
      await api.post('/bookings', { room: room._id, ...form });
      toast.success('Booking request submitted! Awaiting admin approval.');
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit booking');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#0f2156]/50 flex items-center justify-center z-[200] p-4" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#0f2156]">Book Room</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-2xl leading-none">×</button>
        </div>

        <div className="p-6 space-y-4">
          {/* Room info */}
          <div className="bg-gray-50 rounded-xl p-4 flex gap-3">
            <span className="text-3xl">🏛️</span>
            <div>
              <p className="font-bold text-[#0f2156] text-sm">{room.name}</p>
              <p className="text-xs text-gray-400">{room.building} · {room.department}</p>
              <p className="text-xs text-gray-500 mt-1">👥 {room.capacity} seats · {room.facilities?.slice(0,3).join(', ')}</p>
            </div>
          </div>

          {/* Date */}
          <div>
            <label className="form-label">Date *</label>
            <input type="date" className="form-input" min={today} value={form.date} onChange={e => checkAvailability(e.target.value)} />
          </div>

          {/* Existing bookings on that date */}
          {availability.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-xs font-semibold text-yellow-800 mb-1">⚠️ Existing bookings on this date:</p>
              {availability.map((b, i) => (
                <p key={i} className="text-xs text-yellow-700">{b.startTime} – {b.endTime} ({b.status})</p>
              ))}
            </div>
          )}

          {/* Time row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="form-label">Start Time *</label>
              <input type="time" className="form-input" value={form.startTime} onChange={e => set('startTime', e.target.value)} />
            </div>
            <div>
              <label className="form-label">End Time *</label>
              <input type="time" className="form-input" value={form.endTime} onChange={e => set('endTime', e.target.value)} />
            </div>
          </div>

          {/* Purpose */}
          <div>
            <label className="form-label">Purpose *</label>
            <textarea className="form-input resize-none" rows={3} placeholder="Briefly describe the meeting purpose..." value={form.purpose} onChange={e => set('purpose', e.target.value)} />
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-700">
            ℹ️ Booking requires admin approval. You'll be notified via email once the status changes.
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex gap-3 justify-end">
          <button className="btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn-orange" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Submitting...' : 'Submit Booking Request'}
          </button>
        </div>
      </div>
    </div>
  );
}
