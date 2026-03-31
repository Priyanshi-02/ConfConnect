const Room = require('../models/Room');

// @desc    Fetch all rooms
// @route   GET /api/v1/rooms
// @access  Protected
const getRooms = async (req, res) => {
  try {
    const rooms = await Room.find({});
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a room
// @route   POST /api/v1/rooms
// @access  Private/Admin
const createRoom = async (req, res) => {
  try {
    const room = new Room(req.body);
    const createdRoom = await room.save();
    res.status(201).json(createdRoom);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a room
// @route   DELETE /api/v1/rooms/:id
// @access  Private/Admin
const deleteRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (room) {
      await Room.deleteOne({ _id: room._id });
      res.json({ message: 'Room removed' });
    } else {
      res.status(404).json({ message: 'Room not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getRooms, createRoom, deleteRoom };
