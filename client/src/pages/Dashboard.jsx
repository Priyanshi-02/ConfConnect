import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import RoomCard from '../components/RoomCard';
import BookingModal from '../components/BookingModal';
import api from '../api/axios';
import { useAuthStore } from '../store/authStore';
import { Bell, Search, Filter } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuthStore();
  const [currentView, setCurrentView] = useState('rooms'); // 'rooms', 'my-bookings', 'notifications'
  
  const [rooms, setRooms] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Advanced Filter Sidebar States
  const [filterCity, setFilterCity] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  const [filterFacilities, setFilterFacilities] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Custom notifications state for frontend panel
  const [notifications, setNotifications] = useState([]);
  
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchRooms = async () => {
    try {
      const { data } = await api.get('/rooms');
      // Unrestricted visibility for all users
      setRooms(data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchBookings = async () => {
    try {
      const { data } = await api.get('/bookings');
      setBookings(data);
    } catch (error) {
      console.error(error);
    }
  };

  const loadData = async () => {
    setLoading(true);
    await Promise.all([fetchRooms(), fetchBookings()]);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const generatedNotifs = [{
      id: 'welcome_1',
      type: 'info',
      title: 'Welcome to ConfConnect',
      message: `Hello ${user?.name}, you are logged in as ${user?.role}.`,
      date: new Date().toISOString()
    }];

    const sortedBookings = [...bookings].sort((a, b) => {
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });

    sortedBookings.forEach((book, index) => {
      // Limit to showing the last 15 booking updates to prevent list bloat
      if (index >= 15) return;
      generatedNotifs.push({
        id: book._id || `notif_${index}`,
        type: 'success',
        title: 'Booking Confirmed',
        message: `Room ${book.room?.name || 'Unknown Room'} booked successfully for ${new Date(book.date).toLocaleDateString()} from ${book.startTime} to ${book.endTime} for "${book.purpose}".`,
        date: book.createdAt || new Date().toISOString()
      });
    });

    setNotifications(generatedNotifs);
  }, [bookings, user]);

  const handleBookClick = (room) => {
    setSelectedRoom(room);
    setIsModalOpen(true);
  };

  // Compute distinct filter options straight from live DB payload
  const uniqueCities = [...new Set(rooms.map(r => r.city))].sort();
  const uniqueDepartments = [...new Set(rooms.map(r => r.department))].sort();
  const allFacilities = ['Projector', 'Whiteboard', 'Water', 'Pens', 'TV', 'Teleconference', 'AC', 'PA System'];

  const handleFacilityToggle = (fac) => {
    setFilterFacilities(prev => 
      prev.includes(fac) ? prev.filter(f => f !== fac) : [...prev, fac]
    );
  };

  const clearFilters = () => {
    setFilterCity('');
    setFilterDepartment('');
    setFilterFacilities([]);
    setSearchQuery('');
  };

  // Dynamically filter down the global array based on user interactions
  const filteredRooms = rooms.filter(room => {
    const matchesSearch = room.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          room.building.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCity = filterCity ? room.city === filterCity : true;
    const matchesDept = filterDepartment ? room.department === filterDepartment : true;
    const matchesFacs = filterFacilities.length === 0 ? true : filterFacilities.every(fac => room.facilities.includes(fac));

    return matchesSearch && matchesCity && matchesDept && matchesFacs;
  });

  // Views logic
  const renderRooms = () => (
    <div className="flex flex-col lg:flex-row gap-8 items-start relative">
      
      {/* 25% Width: Sticky Advanced Filter Sidebar */}
      <div className="w-full lg:w-72 flex-shrink-0 bg-white p-6 rounded-lg shadow-sm border border-gray-200 lg:sticky lg:top-8">
        <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-5">
          <h3 className="font-bold text-gray-800 flex items-center gap-2"><Filter className="h-4 w-4 text-government-navy" /> Room Filters</h3>
          {(filterCity || filterDepartment || filterFacilities.length > 0 || searchQuery) && (
            <button onClick={clearFilters} className="text-xs text-red-500 hover:text-red-700 font-medium cursor-pointer">Clear All</button>
          )}
        </div>

        {/* Global Text Search */}
        <div className="mb-6">
           <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Search Text</label>
           <div className="relative">
             <Search className="h-4 w-4 absolute left-3 top-2.5 text-gray-400" />
             <input type="text" placeholder="Room or Campus..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
               className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded text-sm focus:ring-government-navy focus:border-government-navy" />
           </div>
        </div>

        {/* Department Filter */}
        <div className="mb-6">
           <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Govt. Department</label>
           <select value={filterDepartment} onChange={(e) => setFilterDepartment(e.target.value)} className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-government-navy">
             <option value="">Any Department</option>
             {uniqueDepartments.map(dept => <option key={dept} value={dept}>{dept}</option>)}
           </select>
        </div>

        {/* City Filter */}
        <div className="mb-6">
           <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Campus Location</label>
           <select value={filterCity} onChange={(e) => setFilterCity(e.target.value)} className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-government-navy">
             <option value="">Any City</option>
             {uniqueCities.map(city => <option key={city} value={city}>{city}</option>)}
           </select>
        </div>

        {/* Facilities Filter */}
        <div>
           <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Required Facilities</label>
           <div className="space-y-2">
             {allFacilities.map(fac => (
               <label key={fac} className="flex items-center space-x-2 text-sm text-gray-700 cursor-pointer hover:bg-gray-50 p-1 rounded">
                 <input type="checkbox" checked={filterFacilities.includes(fac)} onChange={() => handleFacilityToggle(fac)} 
                   className="rounded text-government-navy focus:ring-government-navy h-4 w-4 accent-government-navy" />
                 <span>{fac}</span>
               </label>
             ))}
           </div>
        </div>
      </div>

      {/* 75% Width: Dynamic Room Grid */}
      <div className="flex-1 w-full pb-10">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 tracking-tight">System Rooms <span className="text-lg font-normal text-gray-500 ml-2">({filteredRooms.length} available)</span></h2>
        </div>
        
        {loading ? (
          <div className="text-center py-20 text-gray-500">Loading rooms...</div>
        ) : filteredRooms.length === 0 ? (
          <div className="bg-white p-10 rounded-lg shadow-sm border border-gray-200 text-center">
            <h3 className="text-lg font-semibold text-gray-800">No rooms match your filters</h3>
            <p className="text-gray-500 mt-2">Try removing some facilities or expanding your search criteria.</p>
            <button onClick={clearFilters} className="mt-4 px-4 py-2 bg-government-navy text-white rounded hover:bg-government-blue text-sm">Reset Filters</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRooms.map(room => (
              <RoomCard key={room._id} room={room} onBook={handleBookClick} />
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderBookings = () => (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 tracking-tight mb-6">
        {user?.role === 'admin' ? 'All System Bookings' : 'My Bookings'}
      </h2>
      {loading ? (
        <div className="text-center py-20 text-gray-500">Loading bookings...</div>
      ) : bookings.length === 0 ? (
        <div className="bg-white p-10 rounded-lg shadow-sm text-center border border-gray-200">
          <p className="text-gray-500">No bookings found.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Room</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Purpose</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                {user?.role === 'admin' && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {bookings.map(book => (
                <tr key={book._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{book.room?.name || 'Unknown Room'}</div>
                    <div className="text-sm text-gray-500">{book.room?.building}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{new Date(book.date).toLocaleDateString()}</div>
                    <div className="text-sm text-gray-500">{book.startTime} - {book.endTime}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{book.purpose}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      {book.status}
                    </span>
                    {book.meetingLink && (
                      <a href={book.meetingLink} target="_blank" rel="noreferrer" className="block mt-1 text-xs text-blue-600 hover:text-blue-800 underline">Join Video</a>
                    )}
                  </td>
                  {user?.role === 'admin' && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {book.user?.name}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const renderNotifications = () => (
    <div className="max-w-3xl">
      <h2 className="text-2xl font-bold text-gray-800 tracking-tight mb-6">Notifications & Alerts</h2>
      
      <div className="space-y-4">
        {notifications.map((notif, idx) => (
          <div key={idx} className={`p-4 rounded-lg border-l-4 shadow-sm bg-white ${notif.type === 'success' ? 'border-green-500' : 'border-blue-500'}`}>
            <div className="flex items-start">
              <div className="flex-shrink-0 mt-0.5">
                <Bell className={`h-5 w-5 ${notif.type === 'success' ? 'text-green-500' : 'text-blue-500'}`} />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-gray-900">{notif.title}</h3>
                <div className="mt-2 text-sm text-gray-700">
                  <p>{notif.message}</p>
                </div>
                <p className="text-xs text-gray-400 mt-2">{new Date(notif.date).toLocaleString()}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData(e.target);
      const updates = {
        name: formData.get('name'),
        department: formData.get('department'),
        phone: formData.get('phone')
      };
      await useAuthStore.getState().updateProfile(updates);
      setNotifications([{
        id: Date.now(),
        type: 'success',
        title: 'Profile Updated',
        message: 'Your profile details and designated department have been updated. Any newly accessible rooms are now unlocked.',
        date: new Date().toISOString()
      }, ...notifications]);
      loadData(); // Reload rooms in case department changed
      setCurrentView('rooms'); // Drop them right back into the grid so they can see it working!
    } catch (err) {
      alert('Failed to update profile: ' + err.message);
    }
  };

  const renderProfile = () => (
    <div className="max-w-xl">
      <h2 className="text-2xl font-bold text-gray-800 tracking-tight mb-6">My Profile</h2>
      <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
        <form onSubmit={handleProfileSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Full Name</label>
            <input name="name" type="text" defaultValue={user?.name} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-government-blue focus:border-government-blue sm:text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email Address (Read Only)</label>
            <input type="email" defaultValue={user?.email} disabled className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-gray-50 text-gray-500 rounded-md shadow-sm sm:text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Designated Department</label>
            <input name="department" type="text" defaultValue={user?.department} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-government-blue focus:border-government-blue sm:text-sm" placeholder="e.g. IT, Engineering, HR" />
            <p className="mt-1 text-xs text-gray-500">Your department controls which rooms you can view and book. It must exactly match the room's department tag.</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">WhatsApp Number</label>
            <input name="phone" type="text" defaultValue={user?.phone} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-government-blue focus:border-government-blue sm:text-sm" placeholder="+91 9999999999" />
          </div>
          <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-government-navy hover:bg-government-blue focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-government-blue mt-4">
            Update Profile & Save Access
          </button>
        </form>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-government-lightgray">
      <Sidebar currentView={currentView} setCurrentView={setCurrentView} />
      
      <div className="ml-64 p-8">
        {/* Main Content Area */}
        {currentView === 'rooms' && renderRooms()}
        {currentView === 'my-bookings' && renderBookings()}
        {currentView === 'notifications' && renderNotifications()}
        {currentView === 'profile' && renderProfile()}
      </div>

      {isModalOpen && selectedRoom && (
        <BookingModal 
          room={selectedRoom} 
          setOpen={setIsModalOpen} 
          refresh={loadData}
          notifications={notifications}
          setNotifications={setNotifications}
        />
      )}
    </div>
  );
};

export default Dashboard;
