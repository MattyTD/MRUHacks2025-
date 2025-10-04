export const BaseNodeSchema = {
  fields: {
    id: {
      type: 'string',
      description: 'Unique identifier for the node',
      required: true
    },
    userId: {
      type: 'string',
      description: 'ID of the user who owns this node',
      required: true
    },
    createdAt: {
      type: 'timestamp',
      description: 'When this record was created',
      required: true
    },
    updatedAt: {
      type: 'timestamp',
      description: 'When this record was last updated',
      required: false
    }
  },
  required: ['id', 'userId', 'createdAt']
};