import React from 'react';
import { useAuthStore } from '../store/authStore';
import { LayoutDashboard, LogOut, CheckSquare, BellRing } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Sidebar = ({ currentView, setCurrentView }) => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="w-64 bg-government-navy text-white flex flex-col h-screen fixed top-0 left-0">
      <div className="p-6 pb-2">
        <h1 className="text-2xl font-bold tracking-tight">ConfConnect</h1>
        <p className="text-sm mt-1 text-gray-300 capitalize">{user?.role} Portal</p>
      </div>

      <div className="px-6 py-4 border-b border-gray-600 mb-4">
        <p className="font-semibold">{user?.name}</p>
        <p className="text-xs text-gray-400 truncate">{user?.email}</p>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        <button
          onClick={() => setCurrentView('rooms')}
          className={`w-full flex items-center space-x-3 px-4 py-3 rounded-md transition-colors ${currentView === 'rooms' ? 'bg-government-blue' : 'hover:bg-gray-800'}`}
        >
          <LayoutDashboard className="h-5 w-5" />
          <span>Rooms Availability</span>
        </button>
        <button
          onClick={() => setCurrentView('my-bookings')}
          className={`w-full flex items-center space-x-3 px-4 py-3 rounded-md transition-colors ${currentView === 'my-bookings' ? 'bg-government-blue' : 'hover:bg-gray-800'}`}
        >
          <CheckSquare className="h-5 w-5" />
          <span>{user?.role === 'admin' ? 'All Bookings' : 'My Bookings'}</span>
        </button>
        <button
          onClick={() => setCurrentView('notifications')}
          className={`w-full flex items-center space-x-3 px-4 py-3 rounded-md transition-colors ${currentView === 'notifications' ? 'bg-government-blue' : 'hover:bg-gray-800'}`}
        >
          <BellRing className="h-5 w-5" />
          <span>Alerts & Notifications</span>
        </button>
      </nav>

      <div className="p-4 border-t border-gray-600">
        <button
          onClick={() => setCurrentView('profile')}
          className={`w-full flex items-center space-x-3 px-4 py-3 mb-2 rounded-md transition-colors ${currentView === 'profile' ? 'bg-government-blue' : 'hover:bg-gray-800'}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          <span>My Profile</span>
        </button>
        <button
          onClick={handleLogout}
          className="w-full flex items-center space-x-3 px-4 py-3 text-red-400 hover:bg-gray-800 rounded-md transition-colors"
        >
          <LogOut className="h-5 w-5" />
          <span>Secure Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
