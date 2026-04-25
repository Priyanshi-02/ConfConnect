import { useEffect, useState } from 'react';
import Topbar from '../components/Topbar';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';

export default function AdminPanel() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('bookings');
  const [bookings, setBookings] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(false);
  const [noteModal, setNoteModal] = useState(null); // { booking, action }
  const [adminNote, setAdminNote] = useState('');

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [bRes, rRes, uRes, sRes] = await Promise.all([
        api.get('/admin/bookings'),
        api.get('/rooms?limit=50'),
        api.get('/admin/users'),
        api.get('/admin/stats'),
      ]);
      setBookings(bRes.data.bookings || []);
      setRooms(rRes.data.rooms || []);
      setUsers(uRes.data.users || []);
      setStats(sRes.data.stats || {});
    } catch { toast.error('Failed to load admin data'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const updateStatus = async (id, status) => {
    try {
      await api.patch(`/admin/bookings/${id}/status`, { status, adminNote });
      toast.success(`Booking ${status}`);
      setNoteModal(null);
      setAdminNote('');
      fetchAll();
    } catch { toast.error('Failed to update booking'); }
  };

  const deleteRoom = async (id) => {
    if (!window.confirm('Delete this room? This cannot be undone.')) return;
    try {
      await api.delete(`/rooms/${id}`);
      toast.success('Room deleted');
      fetchAll();
    } catch { toast.error('Failed to delete room'); }
  };

  const deleteUser = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    try {
      await api.delete(`/admin/users/${id}`);
      toast.success('User deleted');
      fetchAll();
    } catch { toast.error('Failed to delete user'); }
  };

  const TABS = [
    { id: 'bookings', label: 'Bookings', count: stats.totalBookings },
    { id: 'rooms', label: 'Rooms', count: stats.totalRooms },
    { id: 'users', label: 'Users', count: stats.totalUsers },
  ];

  return (
    <>
      <Topbar title="Admin Panel" subtitle="Manage rooms, bookings, and users">
        <button className="btn-orange text-sm" onClick={() => navigate('/admin/add-room')}>+ Add Room</button>
      </Topbar>

      <div className="p-7">
        {/* Stats row */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-7">
          {[
            { label: 'Total Rooms', value: stats.totalRooms, color: 'bg-blue-100', icon: '🏢' },
            { label: 'Total Users', value: stats.totalUsers, color: 'bg-purple-100', icon: '👥' },
            { label: 'All Bookings', value: stats.totalBookings, color: 'bg-gray-100', icon: '📋' },
            { label: 'Pending', value: stats.pendingBookings, color: 'bg-yellow-100', icon: '⏳' },
            { label: 'Approved', value: stats.approvedBookings, color: 'bg-green-100', icon: '✅' },
          ].map(s => (
            <div key={s.label} className="stat-card flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${s.color} flex-shrink-0`}>{s.icon}</div>
              <div>
                <div className="text-2xl font-bold text-[#0f2156]">{s.value ?? '—'}</div>
                <div className="text-xs text-gray-400">{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b-2 border-gray-200 mb-5">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`px-5 py-2.5 text-sm font-semibold border-b-2 -mb-0.5 transition-all ${tab === t.id ? 'border-[#0f2156] text-[#0f2156]' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>
              {t.label} {t.count != null && <span className="ml-1 opacity-60">({t.count})</span>}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-[#0f2156] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* BOOKINGS TAB */}
            {tab === 'bookings' && (
              <div className="panel">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      {['Room', 'User', 'Date', 'Time', 'Purpose', 'Status', 'Actions'].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map(b => (
                      <tr key={b._id} className="hover:bg-gray-50 border-b border-gray-100 last:border-0">
                        <td className="px-4 py-3">
                          <p className="font-semibold text-[#0f2156] text-sm">{b.room?.name}</p>
                          <p className="text-xs text-gray-400">{b.room?.building}</p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm font-medium text-gray-700">{b.user?.name}</p>
                          <p className="text-xs text-gray-400">{b.user?.email}</p>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">{b.date}</td>
                        <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{b.startTime}–{b.endTime}</td>
                        <td className="px-4 py-3 text-sm text-gray-600 max-w-[140px] truncate">{b.purpose}</td>
                        <td className="px-4 py-3"><span className={`status-${b.status}`}>{b.status}</span></td>
                        <td className="px-4 py-3">
                          {b.status === 'pending' ? (
                            <div className="flex gap-1.5">
                              <button className="btn-success text-xs py-1 px-2.5" onClick={() => setNoteModal({ booking: b, action: 'approved' })}>✓ Approve</button>
                              <button className="btn-danger text-xs py-1 px-2.5" onClick={() => setNoteModal({ booking: b, action: 'rejected' })}>✗ Reject</button>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400 italic">{b.adminNote || 'No note'}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                    {bookings.length === 0 && (
                      <tr><td colSpan={7} className="text-center py-16 text-gray-400">No bookings yet</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* ROOMS TAB */}
            {tab === 'rooms' && (
              <div className="panel">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      {['Room Name', 'Building', 'Department', 'Capacity', 'Status', 'Actions'].map(h => (
                        <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rooms.map(r => (
                      <tr key={r._id} className="hover:bg-gray-50 border-b border-gray-100 last:border-0">
                        <td className="px-5 py-3 font-semibold text-[#0f2156] text-sm">{r.name}</td>
                        <td className="px-5 py-3 text-sm text-gray-600">{r.building}</td>
                        <td className="px-5 py-3 text-xs text-gray-400">{r.department}</td>
                        <td className="px-5 py-3 text-sm text-gray-600">👥 {r.capacity}</td>
                        <td className="px-5 py-3"><span className={r.available ? 'badge-available' : 'badge-booked'}>{r.available ? 'Available' : 'Booked'}</span></td>
                        <td className="px-5 py-3">
                          <button className="btn-danger text-xs py-1 px-2.5" onClick={() => deleteRoom(r._id)}>Delete</button>
                        </td>
                      </tr>
                    ))}
                    {rooms.length === 0 && (
                      <tr><td colSpan={6} className="text-center py-16 text-gray-400">No rooms found</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* USERS TAB */}
            {tab === 'users' && (
              <div className="panel">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      {['Name', 'Email', 'Department', 'Role', 'Joined', 'Actions'].map(h => (
                        <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u._id} className="hover:bg-gray-50 border-b border-gray-100 last:border-0">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-[#0f2156] text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                              {u.name[0].toUpperCase()}
                            </div>
                            <span className="font-medium text-sm text-gray-800">{u.name}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-sm text-gray-500">{u.email}</td>
                        <td className="px-5 py-3 text-xs text-gray-400">{u.department}</td>
                        <td className="px-5 py-3"><span className={u.role === 'admin' ? 'status-approved' : 'status-pending'}>{u.role}</span></td>
                        <td className="px-5 py-3 text-xs text-gray-400">{new Date(u.createdAt).toLocaleDateString()}</td>
                        <td className="px-5 py-3">
                          {u.role !== 'admin' && (
                            <button className="btn-danger text-xs py-1 px-2.5" onClick={() => deleteUser(u._id)}>Delete</button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>

      {/* Approve / Reject modal with note */}
      {noteModal && (
        <div className="fixed inset-0 bg-[#0f2156]/50 flex items-center justify-center z-[200]" onClick={e => e.target === e.currentTarget && setNoteModal(null)}>
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl">
            <h3 className="font-bold text-[#0f2156] text-lg mb-1 capitalize">{noteModal.action} Booking</h3>
            <p className="text-sm text-gray-400 mb-4">{noteModal.booking.room?.name} · {noteModal.booking.date}</p>
            <label className="form-label">Admin Note (optional)</label>
            <textarea className="form-input resize-none mb-4" rows={3} placeholder="Add a note for the user..." value={adminNote} onChange={e => setAdminNote(e.target.value)} />
            <div className="flex gap-3">
              <button className="btn-ghost flex-1" onClick={() => { setNoteModal(null); setAdminNote(''); }}>Cancel</button>
              <button
                className={`flex-1 py-2 rounded-lg font-semibold text-sm transition-colors ${noteModal.action === 'approved' ? 'btn-success' : 'btn-danger'}`}
                onClick={() => updateStatus(noteModal.booking._id, noteModal.action)}>
                Confirm {noteModal.action === 'approved' ? 'Approval' : 'Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
