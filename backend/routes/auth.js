const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const User = require('../models/User');
const FriendRequest = require('../models/FriendRequest');
const auth = require('../middleware/auth');

// Check if JWT_SECRET is available
if (!process.env.JWT_SECRET) {
  console.error('ERROR: JWT_SECRET is not defined! Authentication will fail.');
}

const router = express.Router();

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], async (req, res) => {
  try {
    // Debug: Check if JWT_SECRET is loaded
    if (!process.env.JWT_SECRET) {
      console.error('❌ JWT_SECRET is not defined in environment variables!');
      return res.status(500).json({ message: 'Server configuration error' });
    }
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user
    user = new User({
      name,
      email,
      password
    });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);


  await user.save();
  // Create default system node types for new user
  await createSystemNodeTypes(user.id);

    // Create JWT token
    const payload = {
      user: {
        id: user.id
      }
    };

    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' }, (err, token) => {
      if (err) {
        console.error('JWT signing error:', err);
        return res.status(500).json({ message: 'Token generation failed' });
      }
      res.json({ token });
    });
  } catch (error) {
    console.error('❌ Registration Error:', error.message);
    console.error('Full error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').exists().withMessage('Password is required')
], async (req, res) => {
  try {
    // Debug: Check if JWT_SECRET is loaded
    if (!process.env.JWT_SECRET) {
      console.error('❌ JWT_SECRET is not defined in environment variables!');
      return res.status(500).json({ message: 'Server configuration error' });
    }
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Create JWT token
    const payload = {
      user: {
        id: user.id
      }
    };

    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' }, (err, token) => {
      if (err) {
        console.error('JWT signing error:', err);
        return res.status(500).json({ message: 'Token generation failed' });
      }
      res.json({ token });
    });
  } catch (error) {
    console.error('❌ Login Error:', error.message);
    console.error('Full error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/profile-images');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `profile-${req.user.id}-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// @route   POST /api/auth/upload-profile-image
// @desc    Upload profile image
// @access  Private
router.post('/upload-profile-image', auth, upload.single('profileImage'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Delete old profile image if it exists
    if (user.profileImage) {
      const oldImagePath = path.join(__dirname, '../uploads/profile-images', path.basename(user.profileImage));
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }

    // Update user with new profile image path
    const profileImageUrl = `/uploads/profile-images/${req.file.filename}`;
    user.profileImage = profileImageUrl;
    await user.save();

    res.json({ 
      message: 'Profile image uploaded successfully',
      profileImageUrl: profileImageUrl
    });
  } catch (error) {
    console.error('Profile image upload error:', error);
    res.status(500).json({ message: 'Server error during image upload' });
  }
});

// @route   POST /api/auth/send-friend-request
// @desc    Send a friend request to another user
// @access  Private
router.post('/send-friend-request', auth, async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Check if user is trying to send request to themselves
    if (email === req.user.email) {
      return res.status(400).json({ message: 'Cannot send friend request to yourself' });
    }

    // Find the target user
    const targetUser = await User.findOne({ email });
    if (!targetUser) {
      return res.status(404).json({ message: 'User not found with this email' });
    }

    // Check if friend request already exists
    const existingRequest = await FriendRequest.findOne({
      $or: [
        { sender: req.user.id, receiver: targetUser._id },
        { sender: targetUser._id, receiver: req.user.id }
      ]
    });

    if (existingRequest) {
      return res.status(400).json({ message: 'Friend request already exists between these users' });
    }

    // Create friend request
    const friendRequest = new FriendRequest({
      sender: req.user.id,
      receiver: targetUser._id,
      status: 'pending'
    });

    await friendRequest.save();

    res.json({ 
      message: 'Friend request sent successfully',
      friendRequest: {
        id: friendRequest._id,
        receiver: {
          name: targetUser.name,
          email: targetUser.email
        }
      }
    });
  } catch (error) {
    console.error('Friend request error:', error);
    res.status(500).json({ message: 'Server error during friend request' });
  }
});

// @route   GET /api/auth/personal-mindmap
// @desc    Get user's personal mind map
// @access  Private
router.get('/personal-mindmap', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('personalMindMaps');
    // Return the first personal mind map for backward compatibility
    const personalMindMap = user.personalMindMaps && user.personalMindMaps.length > 0 ? user.personalMindMaps[0] : null;
    res.json({ personalMindMap });
  } catch (error) {
    console.error('Error fetching personal mind map:', error);
    res.status(500).json({ message: 'Server error during personal mind map fetch' });
  }
});

// @route   POST /api/auth/create-personal-mindmap
// @desc    Create or update user's personal mind map
// @access  Private
router.post('/create-personal-mindmap', auth, async (req, res) => {
  try {
    const { name, context, nodes, edges, legend, levels } = req.body;
    
    if (!name || !context || !nodes || !edges) {
      return res.status(400).json({ message: 'Missing required fields for personal mind map' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const personalMindMap = {
      name: name.trim(),
      context,
      nodes,
      edges,
      legend: legend || {},
      levels: levels || 3,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    user.personalMindMaps.push(personalMindMap);
    await user.save();

    res.json({ 
      message: 'Personal mind map created successfully',
      personalMindMap: personalMindMap
    });
  } catch (error) {
    console.error('Error creating personal mind map:', error);
    res.status(500).json({ message: 'Server error during personal mind map creation' });
  }
});

// @route   GET /api/auth/personal-mindmaps
// @desc    Get all personal mind maps for the user
// @access  Private
router.get('/personal-mindmaps', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('personalMindMaps');
    res.json({ mindMaps: user.personalMindMaps || [] });
  } catch (error) {
    console.error('Error fetching personal mind maps:', error);
    res.status(500).json({ message: 'Server error during personal mind maps fetch' });
  }
});

// @route   PUT /api/auth/personal-mindmaps/:id
// @desc    Update a personal mind map
// @access  Private
router.put('/personal-mindmaps/:id', auth, async (req, res) => {
  try {
    const { name, context, nodes, edges, legend, levels } = req.body;
    
    if (!name || !context || !nodes || !edges) {
      return res.status(400).json({ message: 'Missing required fields for personal mind map' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const mindMapIndex = user.personalMindMaps.findIndex(map => map._id.toString() === req.params.id);
    if (mindMapIndex === -1) {
      return res.status(404).json({ message: 'Personal mind map not found' });
    }

    const updatedMindMap = {
      ...user.personalMindMaps[mindMapIndex],
      name: name.trim(),
      context,
      nodes,
      edges,
      legend: legend || {},
      levels: levels || 3,
      updatedAt: new Date().toISOString()
    };

    user.personalMindMaps[mindMapIndex] = updatedMindMap;
    await user.save();

    res.json({ 
      message: 'Personal mind map updated successfully',
      personalMindMap: updatedMindMap
    });
  } catch (error) {
    console.error('Error updating personal mind map:', error);
    res.status(500).json({ message: 'Server error during personal mind map update' });
  }
});

// @route   DELETE /api/auth/personal-mindmaps/:id
// @desc    Delete a personal mind map
// @access  Private
router.delete('/personal-mindmaps/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const mindMapIndex = user.personalMindMaps.findIndex(map => map._id.toString() === req.params.id);
    if (mindMapIndex === -1) {
      return res.status(404).json({ message: 'Personal mind map not found' });
    }

    user.personalMindMaps.splice(mindMapIndex, 1);
    await user.save();

    res.json({ message: 'Personal mind map deleted successfully' });
  } catch (error) {
    console.error('Error deleting personal mind map:', error);
    res.status(500).json({ message: 'Server error during personal mind map deletion' });
  }
});

module.exports = router;
