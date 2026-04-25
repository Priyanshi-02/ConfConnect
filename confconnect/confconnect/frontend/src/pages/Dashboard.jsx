import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Topbar from '../components/Topbar';
import api from '../api/axios';

const StatCard = ({ icon, value, label, change, color }) => (
  <div className="stat-card">
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-3 ${color}`}>{icon}</div>
    <div className="text-3xl font-bold text-[#0f2156]">{value}</div>
    <div className="text-xs text-gray-400 uppercase tracking-wide mt-1">{label}</div>
    {change && <div className="text-xs mt-2 font-medium text-green-600">{change}</div>}
  </div>
);

export default function Dashboard() {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bRes, sRes] = await Promise.all([
          api.get('/bookings'),
          isAdmin ? api.get('/admin/stats') : Promise.resolve(null),
        ]);
        setBookings(bRes.data.bookings || []);
        if (sRes) setStats(sRes.data.stats);
      } catch { /* silent */ }
    };
    fetchData();
  }, [isAdmin]);

  const pending = bookings.filter(b => b.status === 'pending').length;
  const approved = bookings.filter(b => b.status === 'approved').length;

  return (
    <>
      <Topbar title="Dashboard" subtitle={`Welcome back, ${user?.name}`} />
      <div className="p-7">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
          <StatCard icon="🏢" value={stats?.totalRooms ?? '500+'} label="Total Rooms" change="↑ Pre-seeded" color="bg-blue-100" />
          <StatCard icon="✅" value={approved} label="Approved" change="↑ This month" color="bg-green-100" />
          <StatCard icon="⏳" value={pending} label="Pending" color="bg-yellow-100" />
          {isAdmin && <StatCard icon="👥" value={stats?.totalUsers ?? '—'} label="Registered Users" color="bg-purple-100" />}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent bookings */}
          <div className="panel lg:col-span-2">
            <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="font-bold text-[#0f2156]">Recent Bookings</h3>
              <button className="btn-ghost text-xs py-1.5" onClick={() => navigate('/my-bookings')}>View All</button>
            </div>
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  {['Room', 'Date', 'Time', 'Status'].map(h => (
                    <th key={h} className="px-5 py-2.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide border-b border-gray-200">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {bookings.slice(0, 6).map(b => (
                  <tr key={b._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3 border-b border-gray-100">
                      <p className="font-semibold text-[#0f2156] text-sm">{b.room?.name || b.room}</p>
                      <p className="text-xs text-gray-400">{b.room?.building}</p>
                    </td>
                    <td className="px-5 py-3 border-b border-gray-100 text-sm text-gray-600">{b.date}</td>
                    <td className="px-5 py-3 border-b border-gray-100 text-sm text-gray-600">{b.startTime}–{b.endTime}</td>
                    <td className="px-5 py-3 border-b border-gray-100">
                      <span className={`status-${b.status}`}>{b.status}</span>
                    </td>
                  </tr>
                ))}
                {bookings.length === 0 && (
                  <tr><td colSpan={4} className="text-center py-12 text-gray-400">No bookings yet</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Quick actions */}
          <div className="space-y-4">
            <div className="panel p-5">
              <h3 className="font-bold text-[#0f2156] mb-4">Quick Actions</h3>
              <div className="space-y-2.5">
                <button className="btn-primary w-full py-3 justify-center text-sm" onClick={() => navigate('/rooms')}>🔍 Browse Rooms</button>
                <button className="btn-orange w-full py-3 justify-center text-sm" onClick={() => navigate('/my-bookings')}>📋 My Bookings</button>
                {isAdmin && <button className="btn-ghost w-full py-3 justify-center text-sm" onClick={() => navigate('/admin')}>⚙️ Admin Panel</button>}
              </div>
            </div>
            <div className="panel p-5">
              <h3 className="font-bold text-[#0f2156] mb-3">Top Departments</h3>
              {['Ministry of Finance','Ministry of Education','Ministry of Home Affairs','Ministry of IT'].map((d, i) => (
                <div key={d} className="flex justify-between py-2 border-b border-gray-100 last:border-0">
                  <span className="text-sm text-gray-600 truncate flex-1">{d}</span>
                  <span className="text-sm font-semibold text-[#0f2156] ml-2">{[24,18,15,12][i]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
