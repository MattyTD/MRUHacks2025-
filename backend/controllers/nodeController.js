const Node = require('../models/Node/Node');
const NodeType = require('../models/Node/NodeType');
const { validateNodeData, extractCommonFields } = require('../services/nodeTypeService');

// @desc    Create a new node
// @route   POST /api/nodes
// @access  Private
exports.createNode = async (req, res) => {
  try {
    const { nodeTypeId, data, tags } = req.body;

    // Get and validate node type
    const nodeType = await NodeType.findOne({
      _id: nodeTypeId,
      userId: req.user.id,
      isActive: true
    });

    if (!nodeType) {
      return res.status(404).json({
        success: false,
        error: 'Node type not found'
      });
    }

    // Validate data against node type schema
    const validationErrors = validateNodeData(nodeType, data);
    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: validationErrors
      });
    }

    // Extract common fields for searching/filtering
    const commonFields = extractCommonFields(nodeType, data);

    // Create node
    const node = new Node({
      userId: req.user.id,
      nodeTypeId: nodeType._id,
      nodeType: nodeType.slug,
      data,
      tags: tags || [],
      ...commonFields
    });

    await node.save();

    res.status(201).json({
      success: true,
      data: node
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get all nodes (with filtering)
// @route   GET /api/nodes
// @access  Private
exports.getNodes = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      nodeType, 
      nodeTypeId,
      archived = false,
      startDate, 
      endDate,
      tags,
      sort = '-createdAt'
    } = req.query;
    
    const query = { 
      userId: req.user.id,
      isArchived: archived === 'true'
    };
    
    // Filter by node type
    if (nodeType) query.nodeType = nodeType;
    if (nodeTypeId) query.nodeTypeId = nodeTypeId;
    
    // Filter by date range
    if (startDate || endDate) {
      query.primaryDate = {};
      if (startDate) query.primaryDate.$gte = new Date(startDate);
      if (endDate) query.primaryDate.$lte = new Date(endDate);
    }

    // Filter by tags
    if (tags) {
      const tagArray = tags.split(',');
      query.tags = { $in: tagArray };
    }

    const nodes = await Node.find(query)
      .populate('nodeTypeId', 'name slug icon color')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Node.countDocuments(query);

    res.status(200).json({
      success: true,
      data: nodes,
      pagination: {
        totalPages: Math.ceil(count / limit),
        currentPage: parseInt(page),
        total: count
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get single node
// @route   GET /api/nodes/:id
// @access  Private
exports.getNode = async (req, res) => {
  try {
    const node = await Node.findOne({
      _id: req.params.id,
      userId: req.user.id
    }).populate('nodeTypeId');

    if (!node) {
      return res.status(404).json({
        success: false,
        error: 'Node not found'
      });
    }

    res.status(200).json({
      success: true,
      data: node
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Update node
// @route   PUT /api/nodes/:id
// @access  Private
exports.updateNode = async (req, res) => {
  try {
    const node = await Node.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!node) {
      return res.status(404).json({
        success: false,
        error: 'Node not found'
      });
    }

    const { data, tags } = req.body;

    // If data is being updated, validate it
    if (data) {
      const nodeType = await NodeType.findById(node.nodeTypeId);
      const validationErrors = validateNodeData(nodeType, data);
      
      if (validationErrors.length > 0) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: validationErrors
        });
      }

      node.data = data;

      // Update common fields
      const commonFields = extractCommonFields(nodeType, data);
      node.title = commonFields.title;
      node.description = commonFields.description;
      node.primaryDate = commonFields.primaryDate;
    }

    if (tags) node.tags = tags;

    await node.save();

    res.status(200).json({
      success: true,
      data: node
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Delete node
// @route   DELETE /api/nodes/:id
// @access  Private
exports.deleteNode = async (req, res) => {
  try {
    const node = await Node.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!node) {
      return res.status(404).json({
        success: false,
        error: 'Node not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Node deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Archive/unarchive node
// @route   PATCH /api/nodes/:id/archive
// @access  Private
exports.toggleArchive = async (req, res) => {
  try {
    const node = await Node.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!node) {
      return res.status(404).json({
        success: false,
        error: 'Node not found'
      });
    }

    node.isArchived = !node.isArchived;
    await node.save();

    res.status(200).json({
      success: true,
      data: node
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Search nodes
// @route   GET /api/nodes/search
// @access  Private
exports.searchNodes = async (req, res) => {
  try {
    const { q, nodeType } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        error: 'Search query is required'
      });
    }

    const query = {
      userId: req.user.id,
      $text: { $search: q }
    };

    if (nodeType) query.nodeType = nodeType;

    const nodes = await Node.find(query)
      .populate('nodeTypeId', 'name slug icon color')
      .sort({ score: { $meta: 'textScore' } });

    res.status(200).json({
      success: true,
      data: nodes,
      count: nodes.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get node statistics
// @route   GET /api/nodes/stats
// @access  Private
exports.getNodeStats = async (req, res) => {
  try {
    const stats = await Node.aggregate([
      { $match: { userId: req.user.id, isArchived: false } },
      { 
        $group: {
          _id: '$nodeType',
          count: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'nodetypes',
          localField: '_id',
          foreignField: 'slug',
          as: 'typeInfo'
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};