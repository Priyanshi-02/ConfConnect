import { useEffect, useState, useCallback } from 'react';
import Topbar from '../components/Topbar';
import RoomCard from '../components/RoomCard';
import BookingModal from '../components/BookingModal';
import api from '../api/axios';

const BUILDINGS = ['Secretariat Block A','Secretariat Block B','Secretariat Block C','Nirman Bhawan','Shastri Bhawan','Krishi Bhawan','Udyog Bhawan','Vigyan Bhawan'];
const DEPARTMENTS = ['Ministry of Education','Ministry of Home Affairs','Ministry of Finance','Ministry of Health & Family Welfare','Ministry of Defence','Ministry of External Affairs','Ministry of Agriculture','Ministry of Commerce & Industry','Ministry of Electronics & IT','Ministry of Housing & Urban Affairs'];

export default function RoomsPage() {
  const [rooms, setRooms] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [filters, setFilters] = useState({ search: '', building: '', department: '', capacity: '' });

  const fetchRooms = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 24, ...Object.fromEntries(Object.entries(filters).filter(([,v]) => v)) });
      const { data } = await api.get(`/rooms?${params}`);
      setRooms(data.rooms || []);
      setTotal(data.total || 0);
      setPages(data.pages || 1);
    } catch { setRooms([]); } finally { setLoading(false); }
  }, [page, filters]);

  useEffect(() => { fetchRooms(); }, [fetchRooms]);

  const setFilter = (k, v) => { setFilters(f => ({ ...f, [k]: v })); setPage(1); };

  return (
    <>
      <Topbar title="All Rooms" subtitle={`${total} rooms available across 11 buildings`}>
        <button className="btn-ghost text-sm" onClick={fetchRooms}>🔄 Refresh</button>
      </Topbar>

      <div className="p-7">
        <div className="panel mb-6">
          {/* Filter bar */}
          <div className="flex flex-wrap gap-3 p-4 bg-gray-50 border-b border-gray-200">
            <input
              className="form-input flex-1 min-w-48"
              placeholder="🔍 Search rooms, buildings, departments..."
              value={filters.search}
              onChange={e => setFilter('search', e.target.value)}
            />
            <select className="form-input w-48" value={filters.building} onChange={e => setFilter('building', e.target.value)}>
              <option value="">All Buildings</option>
              {BUILDINGS.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
            <select className="form-input w-56" value={filters.department} onChange={e => setFilter('department', e.target.value)}>
              <option value="">All Departments</option>
              {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <select className="form-input w-36" value={filters.capacity} onChange={e => setFilter('capacity', e.target.value)}>
              <option value="">Any Capacity</option>
              <option value="10">10+ seats</option>
              <option value="30">30+ seats</option>
              <option value="50">50+ seats</option>
              <option value="100">100+ seats</option>
            </select>
          </div>

          <div className="px-5 py-3 border-b border-gray-200 bg-gray-50 text-sm text-gray-500">
            Showing <strong className="text-[#0f2156]">{rooms.length}</strong> of <strong className="text-[#0f2156]">{total}</strong> rooms
          </div>

          {/* Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-4 border-[#0f2156] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {rooms.map(room => <RoomCard key={room._id} room={room} onBook={setSelectedRoom} />)}
              {rooms.length === 0 && (
                <div className="col-span-full text-center py-20 text-gray-400">
                  <p className="text-5xl mb-3">🔍</p>
                  <p className="font-medium">No rooms match your filters</p>
                  <button className="btn-ghost mt-4 text-sm" onClick={() => setFilters({ search:'',building:'',department:'',capacity:'' })}>Clear Filters</button>
                </div>
              )}
            </div>
          )}

          {/* Pagination */}
          {pages > 1 && (
            <div className="flex items-center justify-center gap-2 p-4 border-t border-gray-200">
              <button className="btn-ghost text-sm py-1.5" disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
              {Array.from({ length: Math.min(pages, 7) }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => setPage(p)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${p === page ? 'bg-[#0f2156] text-white' : 'btn-ghost'}`}>
                  {p}
                </button>
              ))}
              <button className="btn-ghost text-sm py-1.5" disabled={page === pages} onClick={() => setPage(p => p + 1)}>Next →</button>
            </div>
          )}
        </div>
      </div>

      {selectedRoom && (
        <BookingModal room={selectedRoom} onClose={() => setSelectedRoom(null)} onSuccess={fetchRooms} />
      )}
    </>
  );
}
