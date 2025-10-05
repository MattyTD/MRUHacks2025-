const NodeType = require('../models/Node/NodeType');

// @desc    Get all node types for user
// @route   GET /api/node-types
// @access  Private
exports.getNodeTypes = async (req, res) => {
  try {
    const nodeTypes = await NodeType.find({ 
      userId: req.user.id,
      isActive: true 
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: nodeTypes,
      count: nodeTypes.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get single node type
// @route   GET /api/node-types/:id
// @access  Private
exports.getNodeType = async (req, res) => {
  try {
    const nodeType = await NodeType.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!nodeType) {
      return res.status(404).json({
        success: false,
        error: 'Node type not found'
      });
    }

    res.status(200).json({
      success: true,
      data: nodeType
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Create custom node type
// @route   POST /api/node-types
// @access  Private
exports.createNodeType = async (req, res) => {
  try {
    const { name, description, icon, color, fields } = req.body;

    // Generate slug from name
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    const nodeType = new NodeType({
      userId: req.user.id,
      name,
      slug,
      description,
      icon: icon || '📝',
      color: color || '#3B82F6',
      fields: fields || [],
      isSystem: false
    });

    await nodeType.save();

    res.status(201).json({
      success: true,
      data: nodeType
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: 'A node type with this name already exists'
      });
    }
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Update node type
// @route   PUT /api/node-types/:id
// @access  Private
exports.updateNodeType = async (req, res) => {
  try {
    const nodeType = await NodeType.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!nodeType) {
      return res.status(404).json({
        success: false,
        error: 'Node type not found'
      });
    }

    // Can't update system node types
    if (nodeType.isSystem) {
      return res.status(403).json({
        success: false,
        error: 'Cannot modify system node types'
      });
    }

    const { name, description, icon, color, fields } = req.body;

    if (name) {
      nodeType.name = name;
      nodeType.slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    }
    if (description !== undefined) nodeType.description = description;
    if (icon) nodeType.icon = icon;
    if (color) nodeType.color = color;
    if (fields) nodeType.fields = fields;

    await nodeType.save();

    res.status(200).json({
      success: true,
      data: nodeType
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Delete node type
// @route   DELETE /api/node-types/:id
// @access  Private
exports.deleteNodeType = async (req, res) => {
  try {
    const nodeType = await NodeType.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!nodeType) {
      return res.status(404).json({
        success: false,
        error: 'Node type not found'
      });
    }

    if (nodeType.isSystem) {
      return res.status(403).json({
        success: false,
        error: 'Cannot delete system node types'
      });
    }

    // Soft delete - just mark as inactive
    nodeType.isActive = false;
    await nodeType.save();

    res.status(200).json({
      success: true,
      message: 'Node type deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};