// Shared validation utilities

export function validateNode(nodeData, schema) {
  const errors = [];
  
  // Check required fields
  schema.required.forEach(field => {
    if (!(field in nodeData) || nodeData[field] === null || nodeData[field] === undefined) {
      errors.push(`Missing required field: ${field}`);
    }
  });
  
  // Validate field types and enum values
  Object.keys(nodeData).forEach(field => {
    if (schema.fields[field]) {
      const fieldSchema = schema.fields[field];
      const value = nodeData[field];
      
      // Skip null/undefined for optional fields
      if (!fieldSchema.required && (value === null || value === undefined)) {
        return;
      }
      
      // Check enum values if defined
      if (fieldSchema.enum && value && !fieldSchema.enum.includes(value)) {
        errors.push(`Invalid value for ${field}. Must be one of: ${fieldSchema.enum.join(', ')}`);
      }
    }
  });
  
  return {
    valid: errors.length === 0,
    errors
  };
}

export function validateUserOwnership(nodeData, userId) {
  if (!nodeData.userId) {
    return {
      valid: false,
      error: 'Node does not have a userId'
    };
  }
  
  if (nodeData.userId !== userId) {
    return {
      valid: false,
      error: 'User does not own this node'
    };
  }
  
  return { valid: true };
}

export function filterByUser(nodes, userId) {
  return nodes.filter(node => node.userId === userId);
}

// ==========================================
// schemas/index.js
// Main export file

export { NodeType, ProficiencyLevel, Frequency } from './types.js';
export { BaseNodeSchema } from './baseSchema.js';
export { EventSchema, createEvent } from './eventSchema.js';
export { InterestSchema, createInterest } from './interestSchema.js';
export { 
  validateNode, 
  validateUserOwnership, 
  filterByUser 
} from './validators.js';