# 🏛️ ConfConnect — Conference Room Booking System

A centralized conference room booking portal for Indian government ministries and departments.

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- Node.js v18+
- MongoDB Atlas account (free tier works)
- npm or yarn

---

### 1. Clone & Configure

```bash
git clone <your-repo-url>
cd confconnect
```

### 2. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB URI, JWT secret, SMTP, Google OAuth creds
```

### 3. Seed the Database (500 rooms + admin)

```bash
npm run seed
```

Output:
```
✅ MongoDB connected
🗑️  Clearing existing data...
👤 Creating admin user...    ✅ Admin created: b221370@skit.ac.in
👥 Creating sample users...  ✅ 20 sample users created
🏢 Generating 500 rooms...   ✅ 500 rooms seeded
📅 Creating sample bookings...✅ 50 sample bookings created

Admin Email:    b221370@skit.ac.in
Admin Password: admin123
User Password:  user123 (for all sample users)
```

### 4. Start Backend

```bash
npm run dev   # Starts on http://localhost:5000
```

### 5. Frontend Setup

```bash
cd ../frontend
npm install
cp .env.example .env
# Set VITE_API_URL=http://localhost:5000/api
npm run dev   # Starts on http://localhost:5173
```

---

## 🌐 Deployment

### Backend → Render.com

1. Push repo to GitHub
2. Go to [render.com](https://render.com) → New Web Service
3. Connect GitHub repo, set **Root Directory** to `backend`
4. Set Build Command: `npm install`
5. Set Start Command: `npm start`
6. Add environment variables from `.env.example` in the Render dashboard
7. Note your Render URL: `https://confconnect-api.onrender.com`

### Frontend → Vercel

1. Go to [vercel.com](https://vercel.com) → New Project
2. Connect GitHub repo, set **Root Directory** to `frontend`
3. Framework Preset: **Vite**
4. Add environment variable:
   ```
   VITE_API_URL = https://confconnect-api.onrender.com/api
   ```
5. Deploy — Vercel gives you a URL like `https://confconnect.vercel.app`

### After Deployment

1. Update `CLIENT_URL` in Render env vars to your Vercel frontend URL
2. Update Google OAuth callback URL in Google Cloud Console:
   ```
   https://confconnect-api.onrender.com/api/auth/google/callback
   ```

---

## 🔐 Default Credentials

| Role  | Email                   | Password  |
|-------|-------------------------|-----------|
| Admin | b221370@skit.ac.in      | admin123  |
| User  | (any seeded user email) | user123   |

---

## 📁 Project Structure

```
confconnect/
├── backend/
│   ├── server.js              # Express entry point
│   ├── config/
│   │   ├── db.js              # MongoDB connection
│   │   ├── passport.js        # Google OAuth
│   │   └── mailer.js          # Nodemailer
│   ├── models/
│   │   ├── User.js
│   │   ├── Room.js
│   │   └── Booking.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── roomController.js
│   │   ├── bookingController.js
│   │   └── adminController.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── rooms.js
│   │   ├── bookings.js
│   │   └── admin.js
│   ├── middleware/
│   │   └── auth.js            # JWT protect + adminOnly
│   └── scripts/
│       └── seed.js            # 500 room seeder
│
└── frontend/
    └── src/
        ├── api/axios.js        # Axios + Bearer interceptor
        ├── context/AuthContext.jsx
        ├── components/
        │   ├── Layout.jsx
        │   ├── Topbar.jsx
        │   ├── RoomCard.jsx
        │   └── BookingModal.jsx
        └── pages/
            ├── LoginPage.jsx
            ├── Dashboard.jsx
            ├── RoomsPage.jsx
            ├── MyBookings.jsx
            ├── AdminPanel.jsx
            ├── AddRoom.jsx
            └── ProfilePage.jsx
```

---

## 🔌 API Reference

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | Public | Register new user |
| POST | `/api/auth/login` | Public | Login, returns JWT |
| GET | `/api/auth/me` | JWT | Get current user |
| GET | `/api/auth/google` | Public | Google OAuth redirect |
| GET | `/api/rooms` | Public | List rooms (paginated, filtered) |
| GET | `/api/rooms/:id` | Public | Get room by ID |
| GET | `/api/rooms/:id/availability?date=` | Public | Get booked slots |
| POST | `/api/rooms` | Admin | Create room |
| PUT | `/api/rooms/:id` | Admin | Update room |
| DELETE | `/api/rooms/:id` | Admin | Delete room |
| POST | `/api/bookings` | JWT | Create booking (overlap check) |
| GET | `/api/bookings` | JWT | Get my bookings |
| DELETE | `/api/bookings/:id` | JWT | Cancel booking |
| GET | `/api/admin/bookings` | Admin | All bookings |
| PATCH | `/api/admin/bookings/:id/status` | Admin | Approve/reject |
| GET | `/api/admin/users` | Admin | All users |
| DELETE | `/api/admin/users/:id` | Admin | Delete user |
| GET | `/api/admin/stats` | Admin | Dashboard stats |

---

## ⚙️ Google OAuth Setup

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create a new project → Enable **Google+ API**
3. OAuth 2.0 Credentials → Web Application
4. Authorized redirect URIs:
   - Local: `http://localhost:5000/api/auth/google/callback`
   - Production: `https://confconnect-api.onrender.com/api/auth/google/callback`
5. Copy Client ID and Secret → add to `.env`

---

## 📧 Email Notifications

Sent automatically on:
- Booking request submitted → user gets confirmation
- Admin approves/rejects → user notified with optional note

Configure via Gmail App Password or any SMTP provider in `.env`.
