const mongoose = require('mongoose');

const BoardSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  collaborators: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  nodes: [{
    id: String,
    label: String,
    description: String,
    color: String,
    x: Number,
    y: Number,
    tags: [String],
    group: String
  }],
  edges: [{
    id: String,
    from: String,
    to: String,
    type: String,
    color: String,
    label: String
  }],
  theme: {
    type: String,
    enum: ['dark', 'light'],
    default: 'dark'
  },
  importedFrom: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User.personalMindMaps'
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  color: {
    type: String,
    default: '#667EEA'
  },
  type: {
    type: String,
    enum: ['personal', 'collective'],
    default: 'personal'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
BoardSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Board', BoardSchema);

