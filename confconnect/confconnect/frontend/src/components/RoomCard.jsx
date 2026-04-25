export default function RoomCard({ room, onBook }) {
  const emojis = ['🏛️', '🏢', '🏗️', '🏬', '🏰', '🏯'];
  const emoji = emojis[room._id?.charCodeAt(0) % emojis.length] || '🏢';

  return (
    <div
      className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 cursor-pointer group"
      onClick={() => onBook(room)}
    >
      {/* Image / Banner */}
      <div className={`h-36 flex items-end p-3 relative ${room.available ? 'bg-gradient-to-br from-[#0f2156] to-[#1a3a7c]' : 'bg-gradient-to-br from-gray-600 to-gray-700'}`}>
        <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-3/4 text-5xl opacity-25">{emoji}</span>
        <span className={`text-xs font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${room.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {room.available ? 'Available' : 'Booked'}
        </span>
      </div>

      {/* Body */}
      <div className="p-4">
        <h3 className="font-bold text-[#0f2156] text-[15px] leading-tight mb-1">{room.name}</h3>
        <p className="text-xs text-gray-400 mb-3">{room.building} · Floor {room.floor} · {room.department}</p>

        {/* Facility tags */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {room.facilities?.slice(0, 3).map(f => (
            <span key={f} className="bg-gray-100 text-gray-600 text-[11px] px-2 py-0.5 rounded">{f}</span>
          ))}
          {room.facilities?.length > 3 && (
            <span className="bg-gray-100 text-gray-500 text-[11px] px-2 py-0.5 rounded">+{room.facilities.length - 3}</span>
          )}
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <span className="text-sm font-medium text-gray-600">👥 {room.capacity} seats</span>
          <button
            className="bg-orange-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-orange-600 transition-colors opacity-0 group-hover:opacity-100"
            onClick={(e) => { e.stopPropagation(); onBook(room); }}
          >
            Book Now
          </button>
        </div>
      </div>
    </div>
  );
}
