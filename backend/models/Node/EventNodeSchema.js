import { NodeType } from './types.js';
import { BaseNodeSchema } from './BaseNodeSchema.js';

export const EventSchema = {
  type: NodeType.EVENT,
  required: [...BaseNodeSchema.required, 'title', 'eventDate'],
  fields: {
    ...BaseNodeSchema.fields,
    title: {
      type: 'string',
      description: 'Title or name of the event',
      required: true
    },
    description: {
      type: 'string',
      description: 'Detailed description of the event',
      required: false
    },
    eventDate: {
      type: 'date',
      description: 'When the event happened',
      required: true
    },
    location: {
      type: 'string',
      description: 'Where the event took place',
      required: false
    },
    category: {
      type: 'string',
      description: 'Event category (e.g., meeting, milestone, social)',
      required: false
    },
    participants: {
      type: 'array',
      description: 'List of people involved in the event',
      required: false
    },
    tags: {
      type: 'array',
      description: 'Tags for categorization and search',
      required: false
    }
  }
};

export function createEvent(data) {
  if (!data.userId) {
    throw new Error('userId is required to create an event');
  }

  const event = {
    id: data.id || `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    userId: data.userId,
    title: data.title,
    description: data.description || '',
    eventDate: data.eventDate,
    location: data.location || '',
    category: data.category || '',
    participants: data.participants || [],
    tags: data.tags || [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  return event;
}