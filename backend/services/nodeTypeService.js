const NodeType = require('../models/Node/NodeType');

// Create default system node types for new users
exports.createSystemNodeTypes = async (userId) => {
  const systemTypes = [
    {
      userId,
      name: 'Event',
      slug: 'event',
      description: 'Record important events and moments',
      icon: '📅',
      color: '#10B981',
      isSystem: true,
      fields: [
        { name: 'title', fieldType: 'string', required: true, description: 'Event title' },
        { name: 'description', fieldType: 'string', required: false, description: 'Event details' },
        { name: 'eventDate', fieldType: 'date', required: true, description: 'When it happened' },
        { name: 'location', fieldType: 'string', required: false, description: 'Where it happened' },
        { name: 'category', fieldType: 'string', required: false, description: 'Event category' },
        { name: 'participants', fieldType: 'array', required: false, description: 'People involved' }
      ]
    },
    {
      userId,
      name: 'Interest',
      slug: 'interest',
      description: 'Track your hobbies and interests',
      icon: '⭐',
      color: '#F59E0B',
      isSystem: true,
      fields: [
        { name: 'name', fieldType: 'string', required: true, description: 'Interest name' },
        { name: 'description', fieldType: 'string', required: false, description: 'Details about this interest' },
        { name: 'category', fieldType: 'string', required: false, description: 'Category' },
        { 
          name: 'proficiencyLevel', 
          fieldType: 'string', 
          required: false, 
          enumValues: ['beginner', 'intermediate', 'advanced', 'expert'],
          description: 'Your skill level'
        },
        { 
          name: 'frequency', 
          fieldType: 'string', 
          required: false, 
          enumValues: ['daily', 'weekly', 'monthly', 'occasionally', 'rarely'],
          description: 'How often you engage'
        },
        { name: 'startDate', fieldType: 'date', required: true, description: 'When you started' },
        { name: 'endDate', fieldType: 'date', required: false, description: 'When you stopped (if applicable)' }
      ]
    }
  ];

  try {
    await NodeType.insertMany(systemTypes);
    return systemTypes;
  } catch (error) {
    console.error('Error creating system node types:', error);
    return [];
  }
};

// Validate node data against node type schema
exports.validateNodeData = (nodeType, data) => {
  const errors = [];

  nodeType.fields.forEach(field => {
    const value = data[field.name];

    // Check required fields
    if (field.required && (value === undefined || value === null || value === '')) {
      errors.push(`${field.name} is required`);
    }

    // Check enum values
    if (value && field.enumValues && field.enumValues.length > 0) {
      if (!field.enumValues.includes(value)) {
        errors.push(`${field.name} must be one of: ${field.enumValues.join(', ')}`);
      }
    }

    // Type validation
    if (value !== undefined && value !== null && value !== '') {
      switch (field.fieldType) {
        case 'number':
          if (isNaN(value)) errors.push(`${field.name} must be a number`);
          break;
        case 'date':
          if (isNaN(Date.parse(value))) errors.push(`${field.name} must be a valid date`);
          break;
        case 'boolean':
          if (typeof value !== 'boolean') errors.push(`${field.name} must be true or false`);
          break;
        case 'array':
          if (!Array.isArray(value)) errors.push(`${field.name} must be an array`);
          break;
        case 'url':
          try {
            new URL(value);
          } catch {
            errors.push(`${field.name} must be a valid URL`);
          }
          break;
      }
    }
  });

  return errors;
};

// Extract common fields for indexing
exports.extractCommonFields = (nodeType, data) => {
  const commonFields = {
    title: null,
    description: null,
    primaryDate: null
  };

  // Try to find title field
  const titleField = nodeType.fields.find(f => 
    f.name === 'title' || f.name === 'name' || f.name.toLowerCase().includes('title')
  );
  if (titleField && data[titleField.name]) {
    commonFields.title = data[titleField.name];
  }

  // Try to find description field
  const descField = nodeType.fields.find(f => 
    f.name === 'description' || f.name === 'notes' || f.name === 'details'
  );
  if (descField && data[descField.name]) {
    commonFields.description = data[descField.name];
  }

  // Try to find primary date field
  const dateField = nodeType.fields.find(f => 
    f.fieldType === 'date' && (f.name.includes('date') || f.name.includes('Date'))
  );
  if (dateField && data[dateField.name]) {
    commonFields.primaryDate = data[dateField.name];
  }

  return commonFields;
};
