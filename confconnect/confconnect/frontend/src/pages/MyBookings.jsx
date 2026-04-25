import { useEffect, useState } from 'react';
import Topbar from '../components/Topbar';
import api from '../api/axios';
import toast from 'react-hot-toast';

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/bookings');
      setBookings(data.bookings || []);
    } catch { toast.error('Failed to load bookings'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchBookings(); }, []);

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this booking?')) return;
    try {
      await api.delete(`/bookings/${id}`);
      toast.success('Booking cancelled');
      fetchBookings();
    } catch { toast.error('Failed to cancel booking'); }
  };

  const filtered = filter === 'all' ? bookings : bookings.filter(b => b.status === filter);

  const counts = {
    all: bookings.length,
    pending: bookings.filter(b => b.status === 'pending').length,
    approved: bookings.filter(b => b.status === 'approved').length,
    rejected: bookings.filter(b => b.status === 'rejected').length,
  };

  return (
    <>
      <Topbar title="My Bookings" subtitle="Track all your room booking requests" />
      <div className="p-7">
        {/* Filter tabs */}
        <div className="flex gap-2 mb-5">
          {['all','pending','approved','rejected'].map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold capitalize transition-colors ${filter === s ? 'bg-[#0f2156] text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
              {s} <span className="ml-1 opacity-60">({counts[s]})</span>
            </button>
          ))}
        </div>

        <div className="panel">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-4 border-[#0f2156] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <p className="text-5xl mb-3">📅</p>
              <p className="font-medium text-gray-500">No {filter === 'all' ? '' : filter} bookings found</p>
              <p className="text-sm mt-1">Browse rooms to make your first booking</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  {['Room', 'Department', 'Date', 'Time', 'Purpose', 'Status', 'Actions'].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(b => (
                  <tr key={b._id} className="hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0">
                    <td className="px-5 py-4">
                      <p className="font-semibold text-[#0f2156] text-sm">{b.room?.name || '—'}</p>
                      <p className="text-xs text-gray-400">{b.room?.building}</p>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-500">{b.room?.department}</td>
                    <td className="px-5 py-4 text-sm text-gray-700">{b.date}</td>
                    <td className="px-5 py-4 text-sm text-gray-700 whitespace-nowrap">{b.startTime}–{b.endTime}</td>
                    <td className="px-5 py-4 text-sm text-gray-600 max-w-[180px] truncate">{b.purpose}</td>
                    <td className="px-5 py-4">
                      <span className={`status-${b.status}`}>{b.status}</span>
                      {b.adminNote && <p className="text-xs text-gray-400 mt-1 italic">{b.adminNote}</p>}
                    </td>
                    <td className="px-5 py-4">
                      {b.status === 'pending' && (
                        <button className="btn-danger text-xs py-1.5 px-3" onClick={() => handleCancel(b._id)}>Cancel</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}
