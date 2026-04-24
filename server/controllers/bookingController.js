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

    // Parse time strings "HH:mm" to calculate duration
    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);
    const startMins = startH * 60 + startM;
    const endMins = endH * 60 + endM;

    // Reject if duration is less than 1 hour (60 minutes)
    if (endMins - startMins < 60) {
      return res.status(400).json({ message: 'Meeting must be of at least 1 hour duration.' });
    }

    // Check for overlaps strictly with 1 hr cleaning interval
    const existingBookings = await Booking.find({
      room,
      date: bookingDate,
      status: 'confirmed'
    });

    const hasOverlap = existingBookings.some(b => {
      const [bStartH, bStartM] = b.startTime.split(':').map(Number);
      const [bEndH, bEndM] = b.endTime.split(':').map(Number);
      const bStartMins = bStartH * 60 + bStartM;
      const bEndMins = bEndH * 60 + bEndM;
      
      const bBlockedEndMins = bEndMins + 60;   // existing meeting + 1 hr cleaning
      const newBlockedEndMins = endMins + 60;  // new meeting + 1 hr cleaning

      // Overlap if new start is before existing blocked end AND new blocked end is after existing start
      return (startMins < bBlockedEndMins && newBlockedEndMins > bStartMins);
    });

    if (hasOverlap) {
      return res.status(400).json({ message: 'Room is already booked or requires cleaning during this time slot.' });
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

// @desc    Get room availability for a specific date
// @route   GET /api/v1/bookings/availability/:roomId
// @access  Protected
const getRoomAvailability = async (req, res) => {
  const { roomId } = req.params;
  const { date } = req.query;

  try {
    if (!date) {
      return res.status(400).json({ message: 'Date is required' });
    }

    const bookingDate = new Date(date);
    const existingBookings = await Booking.find({
      room: roomId,
      date: bookingDate,
      status: 'confirmed'
    });

    const bookedSlots = existingBookings.map(b => {
      const [startH, startM] = b.startTime.split(':').map(Number);
      const [endH, endM] = b.endTime.split(':').map(Number);
      const startMins = startH * 60 + startM;
      const endMins = endH * 60 + endM;
      return { 
        startTime: b.startTime, 
        endTime: b.endTime, 
        startMins, 
        endMins,
        blockedEndMins: endMins + 60 // 1 hr cleaning buffer
      };
    });

    res.json(bookedSlots);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getBookings, createBooking, getRoomAvailability };
