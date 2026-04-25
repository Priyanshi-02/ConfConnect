import { useEffect, useState } from 'react';
import Topbar from '../components/Topbar';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' });
  const [showPw, setShowPw] = useState(false);

  useEffect(() => {
    api.get('/bookings').then(({ data }) => setBookings(data.bookings || [])).catch(() => {});
  }, []);

  const handleLogout = () => { logout(); navigate('/login'); };

  const handlePasswordChange = async () => {
    if (!pwForm.current || !pwForm.next) { toast.error('Fill in all password fields'); return; }
    if (pwForm.next !== pwForm.confirm) { toast.error('New passwords do not match'); return; }
    if (pwForm.next.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      await api.put('/auth/change-password', { currentPassword: pwForm.current, newPassword: pwForm.next });
      toast.success('Password updated successfully');
      setPwForm({ current: '', next: '', confirm: '' });
      setShowPw(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update password');
    } finally { setLoading(false); }
  };

  const stats = [
    { label: 'Total Bookings', value: bookings.length },
    { label: 'Approved', value: bookings.filter(b => b.status === 'approved').length },
    { label: 'Pending', value: bookings.filter(b => b.status === 'pending').length },
    { label: 'Rejected', value: bookings.filter(b => b.status === 'rejected').length },
  ];

  return (
    <>
      <Topbar title="My Profile" subtitle="Manage your account and preferences" />
      <div className="p-7 max-w-2xl">
        {/* Profile card */}
        <div className="panel mb-6">
          <div className="px-6 pt-8 pb-6 flex flex-col items-center text-center border-b border-gray-200">
            <div className="w-20 h-20 rounded-full bg-[#0f2156] flex items-center justify-center text-white text-3xl font-bold mb-4">
              {(user?.name || 'U')[0].toUpperCase()}
            </div>
            <h2 className="text-xl font-bold text-[#0f2156]">{user?.name}</h2>
            <p className="text-gray-400 text-sm mt-1">{user?.email}</p>
            <span className={`mt-3 text-xs font-bold uppercase tracking-wide px-3 py-1 rounded-full ${user?.role === 'admin' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
              {user?.role}
            </span>
          </div>

          {/* Details */}
          <div className="px-6 py-5">
            <h3 className="font-bold text-[#0f2156] text-sm mb-4">Account Details</h3>
            <div className="space-y-3">
              {[
                ['Full Name', user?.name],
                ['Email Address', user?.email],
                ['Department', user?.department || 'Not set'],
                ['Account Role', user?.role],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between items-center py-2.5 border-b border-gray-100 last:border-0">
                  <span className="text-sm text-gray-400">{label}</span>
                  <span className="text-sm font-semibold text-[#0f2156]">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Booking stats */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          {stats.map(s => (
            <div key={s.label} className="stat-card text-center">
              <div className="text-2xl font-bold text-[#0f2156]">{s.value}</div>
              <div className="text-xs text-gray-400 mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Change password */}
        <div className="panel mb-6">
          <button className="w-full px-6 py-4 flex items-center justify-between text-left" onClick={() => setShowPw(v => !v)}>
            <div>
              <p className="font-bold text-[#0f2156] text-sm">Change Password</p>
              <p className="text-xs text-gray-400 mt-0.5">Update your account password</p>
            </div>
            <span className="text-gray-400 text-lg">{showPw ? '▲' : '▼'}</span>
          </button>
          {showPw && (
            <div className="px-6 pb-6 pt-2 border-t border-gray-200 space-y-4">
              <div>
                <label className="form-label">Current Password</label>
                <input type="password" className="form-input" placeholder="••••••••" value={pwForm.current} onChange={e => setPwForm(f => ({ ...f, current: e.target.value }))} />
              </div>
              <div>
                <label className="form-label">New Password</label>
                <input type="password" className="form-input" placeholder="••••••••" value={pwForm.next} onChange={e => setPwForm(f => ({ ...f, next: e.target.value }))} />
              </div>
              <div>
                <label className="form-label">Confirm New Password</label>
                <input type="password" className="form-input" placeholder="••••••••" value={pwForm.confirm} onChange={e => setPwForm(f => ({ ...f, confirm: e.target.value }))} />
              </div>
              <button className="btn-primary w-full py-2.5 justify-center" onClick={handlePasswordChange} disabled={loading}>
                {loading ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          )}
        </div>

        {/* Danger zone */}
        <div className="panel border-red-100">
          <div className="px-6 py-5">
            <h3 className="font-bold text-red-600 text-sm mb-1">Danger Zone</h3>
            <p className="text-xs text-gray-400 mb-4">Actions here cannot be undone</p>
            <button className="btn-danger py-2.5 px-5 text-sm" onClick={handleLogout}>
              Sign Out of ConfConnect
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
