const Room = require('../models/Room');
const Booking = require('../models/Booking');

// GET /api/rooms
const getRooms = async (req, res) => {
  try {
    const { search, building, department, capacity, page = 1, limit = 20 } = req.query;
    const query = {};
    if (search) query.$text = { $search: search };
    if (building) query.building = building;
    if (department) query.department = department;
    if (capacity) query.capacity = { $gte: parseInt(capacity) };

    const total = await Room.countDocuments(query);
    const rooms = await Room.find(query)
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    res.json({ success: true, rooms, total, pages: Math.ceil(total / limit), currentPage: parseInt(page) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/rooms/:id
const getRoomById = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ success: false, message: 'Room not found' });
    res.json({ success: true, room });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/rooms (admin)
const createRoom = async (req, res) => {
  try {
    const room = await Room.create(req.body);
    res.status(201).json({ success: true, room });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// PUT /api/rooms/:id (admin)
const updateRoom = async (req, res) => {
  try {
    const room = await Room.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!room) return res.status(404).json({ success: false, message: 'Room not found' });
    res.json({ success: true, room });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// DELETE /api/rooms/:id (admin)
const deleteRoom = async (req, res) => {
  try {
    const room = await Room.findByIdAndDelete(req.params.id);
    if (!room) return res.status(404).json({ success: false, message: 'Room not found' });
    res.json({ success: true, message: 'Room deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/rooms/:id/availability?date=YYYY-MM-DD
const getRoomAvailability = async (req, res) => {
  try {
    const bookings = await Booking.find({
      room: req.params.id,
      date: req.query.date,
      status: { $ne: 'rejected' },
    }).select('startTime endTime status');
    res.json({ success: true, bookings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getRooms, getRoomById, createRoom, updateRoom, deleteRoom, getRoomAvailability };
