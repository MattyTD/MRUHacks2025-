const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
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
  required: false,
  minlength: 6
  },
  avatar: {
    type: String,
    default: ''
  },
  profileImage: {
    type: String,
    default: ''
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  personalMindMaps: [{
    _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
    name: { type: String, required: true },
    context: { type: String, enum: ['recreational', 'professional'], required: true },
    nodes: { type: [mongoose.Schema.Types.Mixed], default: [] },
    edges: { type: [mongoose.Schema.Types.Mixed], default: [] },
    legend: { type: mongoose.Schema.Types.Mixed, default: {} },
    levels: { type: Number, default: 3 },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  }],
  googleId: {
    type: String,
    default: null
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationToken: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('User', UserSchema);
