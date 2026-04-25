import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Topbar from '../components/Topbar';
import api from '../api/axios';
import toast from 'react-hot-toast';

const BUILDINGS = [
  'Secretariat Block A', 'Secretariat Block B', 'Secretariat Block C',
  'Nirman Bhawan', 'Shastri Bhawan', 'Krishi Bhawan', 'Udyog Bhawan',
  'Vigyan Bhawan', 'Rail Bhawan', 'Sanchar Bhawan', 'Jal Shakti Bhawan',
];

const DEPARTMENTS = [
  'Ministry of Education', 'Ministry of Home Affairs', 'Ministry of Finance',
  'Ministry of Health & Family Welfare', 'Ministry of Defence',
  'Ministry of External Affairs', 'Ministry of Agriculture',
  'Ministry of Commerce & Industry', 'Ministry of Electronics & IT',
  'Ministry of Housing & Urban Affairs', 'Ministry of Environment',
  'Ministry of Law & Justice', 'Ministry of Culture', 'Ministry of Tourism',
];

const FACILITY_OPTIONS = [
  'Projector', 'Video Conferencing', 'Whiteboard', 'AC', 'Wi-Fi',
  'PA System', 'Recording Equipment', 'Livestream Setup', 'Catering Service',
  'Disabled Access', 'Natural Lighting', 'Teleconference', 'Smart Board',
  'Breakout Area', 'Printer', 'Secure Entry', 'Visitor Parking',
];

export default function AddRoom() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '', building: '', department: '', floor: '', capacity: '', image: '', available: true,
  });
  const [facilities, setFacilities] = useState([]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const toggleFacility = (f) => {
    setFacilities(prev => prev.includes(f) ? prev.filter(x => x !== f) : [...prev, f]);
  };

  const handleSubmit = async () => {
    if (!form.name || !form.building || !form.department || !form.capacity) {
      toast.error('Please fill in all required fields'); return;
    }
    if (facilities.length === 0) {
      toast.error('Select at least one facility'); return;
    }
    setLoading(true);
    try {
      await api.post('/rooms', { ...form, capacity: parseInt(form.capacity), facilities });
      toast.success(`Room "${form.name}" added successfully!`);
      navigate('/admin');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add room');
    } finally { setLoading(false); }
  };

  return (
    <>
      <Topbar title="Add New Room" subtitle="Register a new conference room to the system">
        <button className="btn-ghost text-sm" onClick={() => navigate('/admin')}>← Back to Admin</button>
      </Topbar>

      <div className="p-7 max-w-2xl">
        <div className="panel">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="font-bold text-[#0f2156]">Room Details</h3>
            <p className="text-sm text-gray-400 mt-0.5">All fields marked * are required</p>
          </div>

          <div className="p-6 space-y-5">
            {/* Row 1 */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="form-label">Room Name *</label>
                <input className="form-input" placeholder="e.g. Nehru Boardroom" value={form.name} onChange={e => set('name', e.target.value)} />
              </div>
              <div>
                <label className="form-label">Floor *</label>
                <input className="form-input" type="number" min="1" max="20" placeholder="e.g. 3" value={form.floor} onChange={e => set('floor', e.target.value)} />
              </div>
            </div>

            {/* Building */}
            <div>
              <label className="form-label">Building *</label>
              <select className="form-input" value={form.building} onChange={e => set('building', e.target.value)}>
                <option value="">Select building</option>
                {BUILDINGS.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>

            {/* Department */}
            <div>
              <label className="form-label">Department *</label>
              <select className="form-input" value={form.department} onChange={e => set('department', e.target.value)}>
                <option value="">Select department</option>
                {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            {/* Row 2 */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="form-label">Seating Capacity *</label>
                <input className="form-input" type="number" min="1" placeholder="e.g. 30" value={form.capacity} onChange={e => set('capacity', e.target.value)} />
              </div>
              <div>
                <label className="form-label">Initial Status</label>
                <select className="form-input" value={form.available} onChange={e => set('available', e.target.value === 'true')}>
                  <option value="true">Available</option>
                  <option value="false">Not Available</option>
                </select>
              </div>
            </div>

            {/* Image */}
            <div>
              <label className="form-label">Image URL (optional)</label>
              <input className="form-input" placeholder="https://example.com/room.jpg" value={form.image} onChange={e => set('image', e.target.value)} />
            </div>

            {/* Facilities */}
            <div>
              <label className="form-label">Facilities * <span className="text-gray-400 font-normal">({facilities.length} selected)</span></label>
              <div className="flex flex-wrap gap-2 mt-1">
                {FACILITY_OPTIONS.map(f => (
                  <button key={f} type="button" onClick={() => toggleFacility(f)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                      facilities.includes(f)
                        ? 'bg-[#0f2156] text-white border-[#0f2156]'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-[#0f2156]'
                    }`}>
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {/* Preview */}
            {form.name && (
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Preview</p>
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-xl bg-[#0f2156] flex items-center justify-center text-2xl flex-shrink-0">🏛️</div>
                  <div>
                    <p className="font-bold text-[#0f2156]">{form.name || 'Room Name'}</p>
                    <p className="text-sm text-gray-500">{form.building || 'Building'} · Floor {form.floor || '?'} · {form.department || 'Department'}</p>
                    <p className="text-sm text-gray-600 mt-1">👥 {form.capacity || '?'} seats · {facilities.slice(0,3).join(', ') || 'No facilities selected'}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button className="btn-ghost flex-1 py-3" onClick={() => navigate('/admin')}>Cancel</button>
              <button className="btn-orange flex-1 py-3 justify-center" onClick={handleSubmit} disabled={loading}>
                {loading ? 'Adding Room...' : '+ Add Room to System'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
