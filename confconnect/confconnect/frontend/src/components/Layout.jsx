import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NavItem = ({ to, icon, label, dot }) => (
  <NavLink to={to} end={to === '/'} className={({ isActive }) =>
    `flex items-center gap-2.5 px-4 py-2.5 mx-2 rounded-lg text-sm font-medium transition-all duration-150 ${
      isActive ? 'bg-orange-500 text-white' : 'text-white/70 hover:bg-white/10 hover:text-white'
    }`
  }>
    <span className="text-base w-5 text-center">{icon}</span>
    <span className="flex-1">{label}</span>
    {dot && <span className="w-2 h-2 bg-orange-400 rounded-full" />}
  </NavLink>
);

export default function Layout() {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-60 bg-[#0f2156] flex flex-col fixed inset-y-0 left-0 z-50">
        {/* Logo */}
        <div className="px-5 py-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-orange-500 rounded-lg flex items-center justify-center text-xl">🏛️</div>
            <div>
              <div className="text-white font-bold text-lg leading-tight">ConfConnect</div>
              <div className="text-white/40 text-[10px] uppercase tracking-widest">GOI Portal</div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 flex flex-col gap-0.5">
          <p className="px-5 text-[10px] font-semibold uppercase tracking-widest text-white/30 mb-2">Navigation</p>
          <NavItem to="/" icon="🏠" label="Dashboard" />
          <NavItem to="/rooms" icon="🏢" label="All Rooms" />
          <NavItem to="/my-bookings" icon="📅" label="My Bookings" dot />
          {isAdmin && (
            <>
              <p className="px-5 text-[10px] font-semibold uppercase tracking-widest text-white/30 mt-4 mb-2">Admin</p>
              <NavItem to="/admin" icon="⚙️" label="Admin Panel" />
              <NavItem to="/admin/add-room" icon="➕" label="Add Room" />
            </>
          )}
          <p className="px-5 text-[10px] font-semibold uppercase tracking-widest text-white/30 mt-4 mb-2">Account</p>
          <NavItem to="/profile" icon="👤" label="My Profile" />
        </nav>

        {/* User footer */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              {(user?.name || 'U')[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-semibold truncate">{user?.name}</p>
              <p className="text-white/40 text-[10px] uppercase tracking-wide">{user?.role}</p>
            </div>
            <button onClick={handleLogout} className="text-white/40 hover:text-white text-lg transition-colors" title="Sign out">↩</button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="ml-60 flex-1 flex flex-col min-h-screen">
        <Outlet />
      </div>
    </div>
  );
}
