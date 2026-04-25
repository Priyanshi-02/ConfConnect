const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
  date: { type: Date, required: true }, // Store as YYYY-MM-DD
  startTime: { type: String, required: true }, // Format HH:mm (24-hour)
  endTime: { type: String, required: true },   // Format HH:mm (24-hour)
  purpose: { type: String, required: true },
  attendees: [{ type: String }], // Array of emails
  status: { type: String, enum: ['confirmed', 'cancelled'], default: 'confirmed' },
  meetingLink: { type: String } // Jitsi link if video is enabled
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);
