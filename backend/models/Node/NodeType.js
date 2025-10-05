const mongoose = require('mongoose');

const fieldDefinitionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  fieldType: {
    type: String,
    enum: ['string', 'number', 'date', 'boolean', 'array', 'url'],
    required: true
  },
  required: {
    type: Boolean,
    default: false
  },
  defaultValue: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  enumValues: [{
    type: String
  }], // For dropdowns/select fields
  description: {
    type: String,
    default: ''
  }
});

const nodeTypeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  icon: {
    type: String,
    default: '📝'
  },
  color: {
    type: String,
    default: '#3B82F6'
  },
  isSystem: {
    type: Boolean,
    default: false // System types like 'event' and 'interest' can't be deleted
  },
  fields: [fieldDefinitionSchema],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Compound index for user + slug (must be unique per user)
nodeTypeSchema.index({ userId: 1, slug: 1 }, { unique: true });

module.exports = mongoose.model('NodeType', nodeTypeSchema);