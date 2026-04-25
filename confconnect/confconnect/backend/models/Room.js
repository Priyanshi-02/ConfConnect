const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  building: { type: String, required: true },
  department: { type: String, required: true },
  floor: { type: String, default: '1' },
  capacity: { type: Number, required: true },
  facilities: [{ type: String }],
  image: { type: String, default: '' },
  available: { type: Boolean, default: true },
}, { timestamps: true });

roomSchema.index({ name: 'text', building: 'text', department: 'text' });

module.exports = mongoose.model('Room', roomSchema);
