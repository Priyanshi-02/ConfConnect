require('dotenv').config();
const mongoose = require('mongoose');
const Room = require('./models/Room');
const Booking = require('./models/Booking');
const seedRooms = require('./seeder');
const connectDB = require('./config/db');

const reset = async () => {
  try {
    await connectDB();
    console.log('Wiping existing rooms and bookings...');
    await Room.deleteMany({});
    await Booking.deleteMany({});
    console.log('Database wiped. Reseeding...');
    await seedRooms();
    console.log('Done.');
    process.exit();
  } catch (error) {
    console.error('Error rewriting database: ', error);
    process.exit(1);
  }
};

reset();
