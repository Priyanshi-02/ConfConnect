import React from 'react';
import { Users, Building, Tag, CheckCircle2, Video } from 'lucide-react';

const RoomCard = ({ room, onBook }) => {
  // Generate a resilient zero-network fallback SVG dynamically using the room's name
  const getFallbackImage = (name) => {
    const initials = name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
      <rect width="400" height="300" fill="#1e293b"/>
      <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="48" font-weight="bold" fill="#ffffff">${initials}</text>
      <text x="50%" y="70%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="16" fill="#94a3b8">Image Unavailable</text>
    </svg>`;
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      <div className="h-40 overflow-hidden bg-gray-100 flex items-center justify-center">
        <img 
          src={room.image} 
          alt={room.name} 
          loading="lazy"
          onError={(e) => {
            e.target.onerror = null;
            // Guarantee NO network drop by feeding an inline SVG directly into memory
            e.target.src = getFallbackImage(room.name);
          }}
          className="w-full h-full object-cover" 
        />
      </div>
      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-bold text-gray-900 line-clamp-1">{room.name}</h3>
          {room.videoConferenceEnabled && (
            <span className="flex items-center gap-1 text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-full font-medium">
              <Video className="w-3 h-3" />
              Video
            </span>
          )}
        </div>
        
        <div className="space-y-2 text-sm text-gray-600 mt-3 border-b border-gray-100 pb-4">
          <div className="flex items-center gap-2">
            <Building className="w-4 h-4 text-government-navy" />
            <span>{room.building} &middot; {room.department}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-government-blue" />
            <span>Capacity: {room.capacity} People</span>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {room.facilities?.slice(0, 3).map((f, i) => (
            <span key={i} className="flex flex-row items-center gap-1 text-xs px-2 py-1 bg-gray-100 rounded text-gray-700">
              <CheckCircle2 className="w-3 h-3 text-green-500" /> {f}
            </span>
          ))}
          {room.facilities?.length > 3 && (
            <span className="text-xs px-2 py-1 bg-gray-100 rounded text-gray-500">
              +{room.facilities.length - 3} more
            </span>
          )}
        </div>

        <button 
          onClick={() => onBook(room)}
          className="w-full mt-5 bg-government-navy text-white hover:bg-government-blue font-medium py-2 px-4 rounded transition-colors shadow-sm"
        >
          Book Now
        </button>
      </div>
    </div>
  );
};

export default RoomCard;
