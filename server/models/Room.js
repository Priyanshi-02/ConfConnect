const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  name: { type: String, required: true },
  building: { type: String, required: true },
  department: { type: String, required: true },
  capacity: { type: Number, required: true },
  facilities: [{ type: String }],
  image: { type: String, default: 'https://images.unsplash.com/photo-1517502884422-41eaead166d4?auto=format&fit=crop&q=80&w=400' },
  videoConferenceEnabled: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Room', roomSchema);
