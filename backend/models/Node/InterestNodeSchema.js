import { NodeType, ProficiencyLevel, Frequency } from './types.js';
import { BaseNodeSchema } from './BaseNodeSchema.js';

export const InterestSchema = {
  type: NodeType.INTEREST,
  required: [...BaseNodeSchema.required, 'name', 'startDate'],
  fields: {
    ...BaseNodeSchema.fields,
    name: {
      type: 'string',
      description: 'Name of the interest',
      required: true
    },
    description: {
      type: 'string',
      description: 'Description of the interest',
      required: false
    },
    category: {
      type: 'string',
      description: 'Category (e.g., hobby, career, learning)',
      required: false
    },
    proficiencyLevel: {
      type: 'string',
      description: 'Skill level',
      required: false,
      enum: Object.values(ProficiencyLevel)
    },
    frequency: {
      type: 'string',
      description: 'How often engaged with',
      required: false,
      enum: Object.values(Frequency)
    },
    relatedLinks: {
      type: 'array',
      description: 'URLs or resources related to this interest',
      required: false
    },
    tags: {
      type: 'array',
      description: 'Tags for categorization and search',
      required: false
    },
    startDate: {
      type: 'date',
      description: 'When this interest started',
      required: true
    },
    endDate: {
      type: 'date',
      description: 'When this interest ended (if applicable)',
      required: false
    }
  }
};

export function createInterest(data) {
  if (!data.userId) {
    throw new Error('userId is required to create an interest');
  }

  const interest = {
    id: data.id || `interest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    userId: data.userId,
    name: data.name,
    description: data.description || '',
    category: data.category || '',
    proficiencyLevel: data.proficiencyLevel || '',
    frequency: data.frequency || '',
    relatedLinks: data.relatedLinks || [],
    tags: data.tags || [],
    startDate: data.startDate,
    endDate: data.endDate || null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  return interest;
}