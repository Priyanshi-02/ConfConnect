const mongoose = require('mongoose');
const { faker } = require('@faker-js/faker');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

const User = require('../models/User');
const Room = require('../models/Room');
const Booking = require('../models/Booking');

const BUILDINGS = [
  'Secretariat Block A', 'Secretariat Block B', 'Secretariat Block C',
  'Nirman Bhawan', 'Shastri Bhawan', 'Krishi Bhawan', 'Udyog Bhawan',
  'Vigyan Bhawan', 'Rail Bhawan', 'Sanchar Bhawan', 'Jal Shakti Bhawan',
];

const DEPARTMENTS = [
  'Ministry of Education', 'Ministry of Home Affairs', 'Ministry of Finance',
  'Ministry of Health & Family Welfare', 'Ministry of Defence',
  'Ministry of External Affairs', 'Ministry of Agriculture',
  'Ministry of Commerce & Industry', 'Ministry of Electronics & IT',
  'Ministry of Housing & Urban Affairs', 'Ministry of Environment',
  'Ministry of Law & Justice', 'Ministry of Culture', 'Ministry of Tourism',
];

const HALL_PREFIXES = [
  'Ashoka', 'Chanakya', 'Tagore', 'Gandhi', 'Nehru', 'Patel', 'Ambedkar',
  'Bose', 'Raman', 'Kalam', 'Shastri', 'Tilak', 'Gokhale', 'Vivekananda',
  'Radhakrishnan', 'Indira', 'Rajiv', 'Naidu', 'Azad', 'Bhagat',
  'Aryabhatta', 'Bhabha', 'Ramanujan', 'Sarabhai', 'Tata', 'Birla',
  'Nalanda', 'Takshashila', 'Vikram', 'Vajpayee', 'Manmohan', 'Rao',
];

const HALL_TYPES = [
  'Hall', 'Boardroom', 'Suite', 'Chamber', 'Gallery', 'Lounge',
  'Auditorium', 'Seminar Room', 'Conference Room', 'Meeting Room',
  'Convention Centre', 'Pavilion', 'Annexe', 'Block', 'Wing',
];

const FACILITIES = [
  'Projector', 'Video Conferencing', 'Whiteboard', 'AC', 'Wi-Fi',
  'PA System', 'Recording Equipment', 'Livestream Setup', 'Catering Service',
  'Disabled Access', 'Natural Lighting', 'Teleconference', 'Smart Board',
  'Breakout Area', 'Printer', 'Secure Entry', 'Visitor Parking',
];

const CAPACITIES = [10, 15, 20, 25, 30, 40, 50, 60, 80, 100, 120, 150, 200, 250, 300];

const connectDB = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ MongoDB connected');
};

const generateRooms = (count = 500) => {
  const rooms = [];
  const usedNames = new Set();

  for (let i = 0; i < count; i++) {
    let name;
    let attempts = 0;
    do {
      const prefix = HALL_PREFIXES[Math.floor(Math.random() * HALL_PREFIXES.length)];
      const type = HALL_TYPES[Math.floor(Math.random() * HALL_TYPES.length)];
      const suffix = attempts > 5 ? ` ${faker.number.int({ min: 1, max: 99 })}` : '';
      name = `${prefix} ${type}${suffix}`;
      attempts++;
    } while (usedNames.has(name) && attempts < 20);
    usedNames.add(name);

    const building = BUILDINGS[Math.floor(Math.random() * BUILDINGS.length)];
    const department = DEPARTMENTS[Math.floor(Math.random() * DEPARTMENTS.length)];
    const capacity = CAPACITIES[Math.floor(Math.random() * CAPACITIES.length)];
    const floor = `${faker.number.int({ min: 1, max: 8 })}`;
    const numFacilities = faker.number.int({ min: 3, max: 8 });
    const shuffled = [...FACILITIES].sort(() => 0.5 - Math.random());
    const facilities = shuffled.slice(0, numFacilities);
    const available = Math.random() > 0.2;

    rooms.push({ name, building, department, floor, capacity, facilities, available, image: '' });
  }
  return rooms;
};

const seed = async () => {
  try {
    await connectDB();

    console.log('🗑️  Clearing existing data...');
    await Promise.all([User.deleteMany({}), Room.deleteMany({}), Booking.deleteMany({})]);

    // Create admin user
    console.log('👤 Creating admin user...');
    const adminPassword = await bcrypt.hash('admin123', 12);
    const admin = await User.create({
      name: 'Admin User',
      email: process.env.ADMIN_EMAIL || 'b221370@skit.ac.in',
      password: adminPassword,
      department: 'Ministry of Home Affairs',
      role: 'admin',
    });
    console.log(`   ✅ Admin created: ${admin.email}`);

    // Create sample users
    console.log('👥 Creating sample users...');
    const users = [];
    for (let i = 0; i < 20; i++) {
      const dept = DEPARTMENTS[i % DEPARTMENTS.length];
      const pwd = await bcrypt.hash('user123', 12);
      const user = await User.create({
        name: faker.person.fullName(),
        email: faker.internet.email().toLowerCase(),
        password: pwd,
        department: dept,
        role: 'user',
      });
      users.push(user);
    }
    console.log(`   ✅ ${users.length} sample users created`);

    // Generate 500 rooms
    console.log('🏢 Generating 500 conference rooms...');
    const roomData = generateRooms(500);
    const rooms = await Room.insertMany(roomData);
    console.log(`   ✅ ${rooms.length} rooms seeded`);

    // Generate sample bookings
    console.log('📅 Creating sample bookings...');
    const statuses = ['pending', 'approved', 'rejected'];
    const bookings = [];
    for (let i = 0; i < 50; i++) {
      const user = users[Math.floor(Math.random() * users.length)];
      const room = rooms[Math.floor(Math.random() * Math.min(rooms.length, 100))];
      const daysAhead = faker.number.int({ min: 1, max: 30 });
      const date = new Date();
      date.setDate(date.getDate() + daysAhead);
      const dateStr = date.toISOString().split('T')[0];
      const startHour = faker.number.int({ min: 8, max: 16 });
      const endHour = startHour + faker.number.int({ min: 1, max: 3 });

      bookings.push({
        user: user._id,
        room: room._id,
        date: dateStr,
        startTime: `${String(startHour).padStart(2, '0')}:00`,
        endTime: `${String(endHour).padStart(2, '0')}:00`,
        purpose: faker.helpers.arrayElement([
          'Cabinet Meeting', 'Budget Review', 'Policy Discussion', 'Press Conference',
          'Annual Review', 'Training Session', 'Strategy Planning', 'Stakeholder Meet',
          'Inter-ministry Coordination', 'Project Review', 'Audit Committee',
        ]),
        status: statuses[i % 3],
      });
    }
    await Booking.insertMany(bookings);
    console.log(`   ✅ ${bookings.length} sample bookings created`);

    console.log('\n🎉 Database seeded successfully!');
    console.log('─────────────────────────────────');
    console.log(`Admin Email:    ${admin.email}`);
    console.log(`Admin Password: admin123`);
    console.log(`User Password:  user123 (for all sample users)`);
    console.log('─────────────────────────────────');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err.message);
    process.exit(1);
  }
};

seed();
