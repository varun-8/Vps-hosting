require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const jwt = require('jsonwebtoken');

const User = require('./models/User');
const Profile = require('./models/Profile');
const authMiddleware = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Database connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/portfolio';
mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// --- API Endpoints ---

// Get Name
app.get('/api/name', async (req, res) => {
  try {
    const profile = await Profile.findOne();
    if (!profile) {
      return res.json({ name: 'John Doe' }); // Fallback
    }
    res.json({ name: profile.name });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update Name (Protected)
app.put('/api/name', authMiddleware, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: 'Name is required' });

    let profile = await Profile.findOne();
    if (!profile) {
      profile = new Profile({ name });
    } else {
      profile.name = name;
    }
    
    await profile.save();
    res.json({ message: 'Name updated successfully', name: profile.name });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new Admin (Protected)
app.post('/api/admins', authMiddleware, async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    const user = new User({ username, password });
    await user.save();
    
    res.json({ message: 'New admin created successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin Login
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '1d' });
    res.json({ token, username: user.username });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Initial setup to seed admin user (run once)
app.post('/api/setup', async (req, res) => {
  try {
    const { username, password } = req.body;
    const existingUser = await User.findOne();
    
    if (existingUser) {
      return res.status(400).json({ message: 'Setup already completed' });
    }

    const user = new User({ username, password });
    await user.save();
    
    // Create initial profile
    const profile = new Profile({ name: 'Jane Doe' });
    await profile.save();

    res.json({ message: 'Setup successful' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
