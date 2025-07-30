// backend/server.js
/*
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('FitPick Backend is running ✅');
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
*/
// backend/server.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/fitpick')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// User Schema
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const User = mongoose.model('User', userSchema);

// Auth middleware
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid token' });
  }
};

// ROUTES

// Health check
app.get('/', (req, res) => {
  res.json({ 
    message: 'FitPick Backend is running ✅',
    endpoints: [
      'POST /api/auth/signup',
      'POST /api/auth/signin',
      'GET /api/auth/me',
      'POST /api/outfits/generate'
    ]
  });
});

// Sign Up
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    // Check if user exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      return res.status(400).json({ 
        message: existingUser.email === email ? 'Email already registered' : 'Username already taken'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = new User({
      username,
      email,
      password: hashedPassword
    });

    await user.save();

    // Generate token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      message: 'Account created successfully!',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });

  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// Sign In
/*
app.post('/api/auth/signin', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }
*/

// Sign In
/*app.post('/api/auth/signin', async (req, res) => {
  console.log('📨 Signin endpoint hit!');
  try {
    console.log('🔍 Login attempt:', req.body);
    const { username, password } = req.body; 

    if (!username || !password) {
      console.log(' Missing username or password');
      return res.status(400).json({ message: 'Username and password are required' });
    }

    // Find user
    const user = await User.findOne({
      $or: [{ username }, { email: username }]
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({
      message: 'Login successful!',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });

  } catch (error) {
    console.error('Signin error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});*/

app.post('/api/auth/signin', async (req, res) => {
  console.log('🔔 Signin endpoint hit!');
  
  try {
    const { username, password } = req.body;
    console.log('📥 Incoming credentials:', { username, password });

    if (!username || !password) {
      console.log('❌ Missing username or password');
      return res.status(400).json({ message: 'Username and password are required' });
    }

    const user = await User.findOne({
      $or: [{ username }, { email: username }]
    });
    console.log('🔎 DB result:', user);

    if (!user) {
      console.log('❌ No matching user found');
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log('🔐 Password valid?', isPasswordValid);

    if (!isPasswordValid) {
      console.log('❌ Incorrect password');
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    console.log('🪪 Token generated');

    res.json({
      message: 'Login successful!',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });

  } catch (error) {
    console.error('❗ Signin error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});


// Get current user
app.get('/api/auth/me', authenticateToken, async (req, res) => {
  res.json({
    user: {
      id: req.user._id,
      username: req.user.username,
      email: req.user.email
    }
  });
});

// Generate Outfit (your main feature!)
app.post('/api/outfits/generate', authenticateToken, async (req, res) => {
  try {
    const { season, event } = req.body;

    if (!season || !event) {
      return res.status(400).json({ message: 'Season and event are required' });
    }

    // Create prompt (same as your frontend)
    const prompt = `Generate a stylish outfit recommendation for a ${event.replace('-', ' ')} during ${season}. 

Please provide your response in this exact JSON format:
{
    "top": "specific clothing item",
    "bottom": "specific clothing item", 
    "shoes": "specific footwear",
    "accessories": "2-3 relevant accessories",
    "style_tip": "brief explanation of why this outfit works for the occasion and season"
}

Keep suggestions practical, stylish, and appropriate for the season and event type.`;

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 300,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const outfitResponse = data.choices[0].message.content;

    res.json({
      outfit: outfitResponse,
      user: req.user.username,
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Outfit generation error:', error);
    res.status(500).json({ 
      message: 'Failed to generate outfit',
      error: error.message 
    });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'API endpoint not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 FitPick Backend running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}`);
});

module.exports = app;