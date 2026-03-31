const Booking = require('../models/Booking');
const Room = require('../models/Room');
const { sendEmail, sendWhatsApp } = require('../services/notificationService');

// @desc    Get all bookings
// @route   GET /api/v1/bookings
// @access  Protected
const getBookings = async (req, res) => {
  try {
    const filter = req.user.role === 'admin' ? {} : { user: req.user._id };
    const bookings = await Booking.find(filter).populate('room').populate('user', 'name email');
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new booking
// @route   POST /api/v1/bookings
// @access  Protected
const createBooking = async (req, res) => {
  const { room, date, startTime, endTime, purpose, attendees, enableWhatsApp } = req.body;

  try {
    const bookingDate = new Date(date);

    // Check for overlaps strictly
    // overlapping bookings: (startTime < existingEndTime && endTime > existingStartTime)
    const existingBookings = await Booking.find({
      room,
      date: bookingDate,
      status: 'confirmed'
    });

    const hasOverlap = existingBookings.some(b => {
      return (startTime < b.endTime && endTime > b.startTime);
    });

    if (hasOverlap) {
      return res.status(400).json({ message: 'Room is already booked for this time slot.' });
    }

    // Fetch room details for validation and links
    const roomDetails = await Room.findById(room);
    if (!roomDetails) {
      return res.status(404).json({ message: 'Room not found' });
    }

    // STRICT RULE: Users can only book rooms matching their department
    if (
      req.user.role !== 'admin' && 
      req.user.department?.toLowerCase().trim() !== roomDetails.department?.toLowerCase().trim()
    ) {
      return res.status(403).json({ 
        message: `Booking Denied: You belong to the ${req.user.department || 'Unassigned'} department, but this room is reserved strictly for the ${roomDetails.department} department.` 
      });
    }

    let meetingLink = null;
    if (roomDetails.videoConferenceEnabled) {
      meetingLink = `https://meet.jit.si/ConfConnect-${Math.floor(Math.random() * 1000000)}`;
    }

    const booking = new Booking({
      user: req.user._id,
      room,
      date: bookingDate,
      startTime,
      endTime,
      purpose,
      attendees,
      meetingLink
    });

    const createdBooking = await booking.save();

    // Send confirmations
    const confirmationMessage = `Room booked successfully for ${date} from ${startTime} to ${endTime} for ${purpose}. ${meetingLink ? 'Video Link: ' + meetingLink : ''}`;

    await sendEmail({
      email: req.user.email,
      subject: 'Booking Confirmation',
      message: confirmationMessage,
    });

    if (enableWhatsApp && req.user.phone) {
      await sendWhatsApp(req.user.phone, confirmationMessage);
    }

    res.status(201).json(createdBooking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getBookings, createBooking };
