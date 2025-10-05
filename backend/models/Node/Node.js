const mongoose = require('mongoose');

const nodeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  nodeTypeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'NodeType',
    required: true,
    index: true
  },
  nodeType: {
    type: String,
    required: true,
    index: true // 'event', 'interest', 'custom-book', etc.
  },
  // Flexible data storage - stores all custom fields
  data: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  // Common searchable fields
  title: {
    type: String,
    index: 'text'
  },
  description: {
    type: String,
    index: 'text'
  },
  tags: [{
    type: String
  }],
  // For date-based filtering (populated from data if exists)
  primaryDate: {
    type: Date,
    index: true
  },
  isArchived: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Compound indexes for efficient queries
nodeSchema.index({ userId: 1, nodeType: 1, primaryDate: -1 });
nodeSchema.index({ userId: 1, nodeTypeId: 1, createdAt: -1 });
nodeSchema.index({ userId: 1, isArchived: 1 });

module.exports = mongoose.model('Node', nodeSchema);