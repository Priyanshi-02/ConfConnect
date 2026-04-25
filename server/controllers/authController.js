const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const { sendEmail } = require('../services/notificationService');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// @desc    Register a new user
// @route   POST /api/v1/auth/register
// @access  Public
const registerUser = async (req, res) => {
  const { name, email, password, department, phone } = req.body;

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Role assignment logic
    let role = 'user';
    if (email === 'b221370@skit.ac.in') {
      role = 'admin';
    }

    const user = await User.create({
      name,
      email,
      password,
      department,
      phone,
      role
    });

    if (user) {
      // Send Email notification (optional, per requirement if preferred)
      // await sendEmail({ email: user.email, subject: 'Welcome to ConfConnect', message: 'You have successfully signed up. Please log in.' });
      
      // Strict rule: DO NOT auto login. Redirect to login handled by frontend.
      res.status(201).json({
        message: 'Registration successful. Please log in.',
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Auth user & get token
// @route   POST /api/v1/auth/login
// @access  Public
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      const token = generateToken(user._id);

      // Send login successful email
      await sendEmail({
        email: user.email,
        subject: 'Login Successful',
        message: 'You have successfully logged into ConfConnect.',
      });

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: token,
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Google Sign-In
// @route   POST /api/v1/auth/google
// @access  Public
const googleLogin = async (req, res) => {
  const { credential } = req.body; // Token from Google frontend client

  try {
    let payload;
    
    // For local dummy testing without full verification, decode token without verification:
    // This allows dummy token from frontend while leaving the true lib logic intact for later.
    // In production, we'd use:
    // const ticket = await client.verifyIdToken({ idToken: credential, audience: process.env.GOOGLE_CLIENT_ID });
    // payload = ticket.getPayload();
    
    // Fallback simple parsing for dummy environment
    const decoded = jwt.decode(credential);
    if (!decoded || !decoded.email) {
      return res.status(400).json({ message: 'Invalid Google Token' });
    }
    payload = decoded;
    
    const { email, name } = payload;

    let user = await User.findOne({ email });

    if (!user) {
      // Create user if not exists
      let role = email === 'b221370@skit.ac.in' ? 'admin' : 'user';
      user = await User.create({
        name,
        email,
        isGoogleUser: true,
        role
      });
    }

    const token = generateToken(user._id);

    // Send login successful email
    await sendEmail({
      email: user.email,
      subject: 'Google Login Successful',
      message: 'You have successfully logged into ConfConnect using Google.',
    });

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: token,
    });
  } catch (error) {
    res.status(500).json({ message: 'Google Auth Failed', error: error.message });
  }
};

// Update user profile
const updateUserProfile = async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.name = req.body.name || user.name;
    user.department = req.body.department || user.department;
    user.phone = req.body.phone || user.phone;

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      department: updatedUser.department,
      phone: updatedUser.phone,
      role: updatedUser.role,
      token: generateToken(updatedUser._id)
    });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};

module.exports = {
  registerUser,
  loginUser,
  googleLogin,
  updateUserProfile
};
