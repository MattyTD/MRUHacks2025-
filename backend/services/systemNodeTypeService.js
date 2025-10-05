const NodeType = require('../models/Node/NodeType');

// Creates default system node types for a new user
async function createSystemNodeTypes(userId) {
  const systemTypes = [
    {
      userId,
      name: 'Event',
      slug: 'event',
      description: 'Event node type',
      icon: '📅',
      color: '#3B82F6',
      fields: [],
      isSystem: true,
      isActive: true
    },
    {
      userId,
      name: 'Interest',
      slug: 'interest',
      description: 'Interest node type',
      icon: '⭐',
      color: '#F59E42',
      fields: [],
      isSystem: true,
      isActive: true
    }
  ];

  // Avoid duplicates: only create if not already present
  for (const type of systemTypes) {
    const exists = await NodeType.findOne({ userId, slug: type.slug });
    if (!exists) {
      await NodeType.create(type);
    }
  }
}

module.exports = { createSystemNodeTypes };
