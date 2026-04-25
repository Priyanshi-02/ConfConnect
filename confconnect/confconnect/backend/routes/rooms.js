const express = require('express');
const router = express.Router();
const { getRooms, getRoomById, createRoom, updateRoom, deleteRoom, getRoomAvailability } = require('../controllers/roomController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/', getRooms);
router.get('/:id', getRoomById);
router.get('/:id/availability', getRoomAvailability);
router.post('/', protect, adminOnly, createRoom);
router.put('/:id', protect, adminOnly, updateRoom);
router.delete('/:id', protect, adminOnly, deleteRoom);

module.exports = router;
