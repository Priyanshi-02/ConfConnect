import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import api from '../api/axios';
import { X, Calendar, Clock, Users, FileText } from 'lucide-react';

const BookingModal = ({ room, setOpen, refresh, notifications, setNotifications }) => {
  const { user } = useAuthStore();
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [purpose, setPurpose] = useState('');
  const [attendees, setAttendees] = useState('');
  const [enableWhatsApp, setEnableWhatsApp] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const handleBooking = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Basic validation
    if (startTime >= endTime) {
      setError('End time must be after start time.');
      setLoading(false);
      return;
    }

    try {
      const payload = {
        room: room._id,
        date,
        startTime,
        endTime,
        purpose,
        attendees: attendees ? attendees.split(',').map(e => e.trim()) : [],
        enableWhatsApp
      };

      const res = await api.post('/bookings', payload);
      
      const successInfo = `Room booked successfully for ${date} from ${startTime} to ${endTime} at ${room.name} for ${purpose}. Check your email to verify and view confirmation details.`;
      
      setSuccessMsg(successInfo);
      
      // Add local notification
      setNotifications([...notifications, {
        id: Date.now(),
        type: 'success',
        title: 'Booking Confirmed',
        message: successInfo,
        date: new Date().toISOString()
      }]);

      refresh();
      // Optional: Auto close after few seconds
      setTimeout(() => {
        setOpen(false);
      }, 4000);
      
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to book room');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 transition-opacity">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4 overflow-hidden transform transition-all">
        <div className="bg-government-navy px-6 py-4 flex justify-between items-center text-white">
          <h3 className="text-xl font-medium">Book {room.name}</h3>
          <button onClick={() => setOpen(false)} className="text-gray-300 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {successMsg ? (
            <div className="bg-green-50 border border-green-200 rounded-md p-4 text-center">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
              <p className="text-green-800 font-medium">{successMsg}</p>
            </div>
          ) : (
            <form onSubmit={handleBooking} className="space-y-4">
              {error && <p className="text-red-500 text-sm bg-red-50 p-2 rounded">{error}</p>}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar className="h-4 w-4 text-gray-400" />
                  </div>
                  <input type="date" required min={new Date().toISOString().split('T')[0]} value={date} onChange={(e) => setDate(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-government-blue focus:border-government-blue sm:text-sm" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Clock className="h-4 w-4 text-gray-400" />
                    </div>
                    <input type="time" required value={startTime} onChange={(e) => setStartTime(e.target.value)}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-government-blue focus:border-government-blue sm:text-sm" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Clock className="h-4 w-4 text-gray-400" />
                    </div>
                    <input type="time" required value={endTime} onChange={(e) => setEndTime(e.target.value)}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-government-blue focus:border-government-blue sm:text-sm" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Purpose</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FileText className="h-4 w-4 text-gray-400" />
                  </div>
                  <input type="text" required placeholder="e.g. Q3 Planning" value={purpose} onChange={(e) => setPurpose(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-government-blue focus:border-government-blue sm:text-sm" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Attendees (Comma separated emails)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Users className="h-4 w-4 text-gray-400" />
                  </div>
                  <input type="text" placeholder="user1@example.com, user2@example.com" value={attendees} onChange={(e) => setAttendees(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-government-blue focus:border-government-blue sm:text-sm" />
                </div>
              </div>

              {user?.phone && (
                <div className="flex items-center">
                  <input type="checkbox" id="whatsapp" checked={enableWhatsApp} onChange={(e) => setEnableWhatsApp(e.target.checked)}
                    className="h-4 w-4 text-government-blue focus:ring-government-blue border-gray-300 rounded" />
                  <label htmlFor="whatsapp" className="ml-2 block text-sm text-gray-700">
                    Receive updates via WhatsApp ({user.phone})
                  </label>
                </div>
              )}

              {room.videoConferenceEnabled && (
                <div className="bg-blue-50 text-blue-800 text-xs p-2 rounded flex items-center gap-2">
                  <span className="font-semibold px-2 bg-blue-200 rounded text-[10px] uppercase">Jitsi</span>
                  A video conferencing link will be auto-generated for this meeting.
                </div>
              )}

              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setOpen(false)}
                  className="px-4 py-2 border border-gray-300 shadow-sm text-sm rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none">
                  Cancel
                </button>
                <button type="submit" disabled={loading}
                  className="px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-government-navy hover:bg-government-blue focus:outline-none">
                  {loading ? 'Processing...' : 'Confirm Booking'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

// CheckCircle icon for success message
function CheckCircle(props) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

export default BookingModal;
