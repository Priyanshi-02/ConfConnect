require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const seedRooms = require('./seeder');

const authRoutes = require('./routes/authRoutes');
const roomRoutes = require('./routes/roomRoutes');
const bookingRoutes = require('./routes/bookingRoutes');

const app = express();

// Connect to database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/rooms', roomRoutes);
app.use('/api/v1/bookings', bookingRoutes);

// Single Server Unified Production Mode
const path = require('path');
if (process.env.NODE_ENV === 'production') {
  // Service the frontend build explicitly from the compiled client workspace
  app.use(express.static(path.join(__dirname, '../client/dist')));
  
  // React Router SPA Catch-All (Express 5 compatible)
  app.use((req, res, next) => {
    if (req.originalUrl.startsWith('/api')) {
      return next(); // Do not swallow API calls
    }
    res.sendFile(path.resolve(__dirname, '../client/dist', 'index.html'));
  });
} else {
  // Health check route for pure backend testing
  app.get('/', (req, res) => {
    res.send('ConfConnect API is running in Development Mode...');
  });
}

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  // Run seeder once server starts
  await seedRooms();
});
