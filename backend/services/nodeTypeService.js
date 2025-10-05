const NodeType = require('../models/Node/NodeType');

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
