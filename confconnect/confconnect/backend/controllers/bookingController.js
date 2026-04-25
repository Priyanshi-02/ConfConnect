const Booking = require('../models/Booking');
const Room = require('../models/Room');
const { sendEmail } = require('../config/mailer');

// POST /api/bookings
const createBooking = async (req, res) => {
  try {
    const { room: roomId, date, startTime, endTime, purpose } = req.body;
    if (!roomId || !date || !startTime || !endTime || !purpose) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }
    if (startTime >= endTime) {
      return res.status(400).json({ success: false, message: 'End time must be after start time' });
    }

    const room = await Room.findById(roomId);
    if (!room) return res.status(404).json({ success: false, message: 'Room not found' });

    // Check for overlapping approved/pending bookings
    const overlap = await Booking.findOne({
      room: roomId,
      date,
      status: { $ne: 'rejected' },
      $or: [
        { startTime: { $lt: endTime }, endTime: { $gt: startTime } },
      ],
    });
    if (overlap) {
      return res.status(409).json({ success: false, message: 'Room is already booked for this time slot' });
    }

    const booking = await Booking.create({
      user: req.user._id, room: roomId, date, startTime, endTime, purpose, status: 'pending',
    });

    // Email notification
    await sendEmail({
      to: req.user.email,
      subject: `ConfConnect – Booking Request Received`,
      html: `<h2>Booking Request Submitted</h2><p>Your booking for <strong>${room.name}</strong> on ${date} (${startTime}–${endTime}) has been received and is pending approval.</p>`,
    });

    res.status(201).json({ success: true, booking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/bookings (my bookings)
const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate('room', 'name building department')
      .sort({ createdAt: -1 });
    res.json({ success: true, bookings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/bookings/all (admin)
const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('room', 'name building department')
      .populate('user', 'name email department')
      .sort({ createdAt: -1 });
    res.json({ success: true, bookings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PATCH /api/bookings/:id/status (admin)
const updateBookingStatus = async (req, res) => {
  try {
    const { status, adminNote } = req.body;
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status, adminNote: adminNote || '' },
      { new: true }
    ).populate('room', 'name').populate('user', 'name email');

    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    // Email user
    await sendEmail({
      to: booking.user.email,
      subject: `ConfConnect – Booking ${status.charAt(0).toUpperCase() + status.slice(1)}`,
      html: `<h2>Booking ${status}</h2><p>Your booking for <strong>${booking.room.name}</strong> on ${booking.date} has been <strong>${status}</strong>. ${adminNote ? `Note: ${adminNote}` : ''}</p>`,
    });

    res.json({ success: true, booking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/bookings/:id
const deleteBooking = async (req, res) => {
  try {
    await Booking.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    res.json({ success: true, message: 'Booking cancelled' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { createBooking, getMyBookings, getAllBookings, updateBookingStatus, deleteBooking };
