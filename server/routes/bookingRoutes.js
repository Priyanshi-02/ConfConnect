const express = require('express');
const router = express.Router();
const { getBookings, createBooking, getRoomAvailability } = require('../controllers/bookingController');
const { protect } = require('../middleware/authMiddleware');

router.route('/availability/:roomId').get(protect, getRoomAvailability);
router.route('/').get(protect, getBookings).post(protect, createBooking);

module.exports = router;
