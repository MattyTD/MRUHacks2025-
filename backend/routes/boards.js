const express = require('express');
const Board = require('../models/Board');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/boards
// @desc    Get all boards for the logged-in user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const boards = await Board.find({ 
      $or: [
        { owner: req.user.id },
        { collaborators: req.user.id }
      ]
    })
    .populate('owner', 'name email')
    .populate('collaborators', 'name email')
    .sort({ updatedAt: -1 });
    
    res.json(boards);
  } catch (error) {
    console.error('❌ Get Boards Error:', error.message);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

// @route   GET /api/boards/:id
// @desc    Get a specific board by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const board = await Board.findById(req.params.id)
      .populate('owner', 'name email')
      .populate('collaborators', 'name email');
    
    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }
    
    // Check if user has access to this board
    const hasAccess = board.owner._id.toString() === req.user.id || 
                      board.collaborators.some(collab => collab._id.toString() === req.user.id) ||
                      board.isPublic;
    
    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    res.json(board);
  } catch (error) {
    console.error('❌ Get Board Error:', error.message);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

// @route   POST /api/boards
// @desc    Create a new board
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, color, type } = req.body;
    
    if (!title || title.trim() === '') {
      return res.status(400).json({ message: 'Board title is required' });
    }
    
    const newBoard = new Board({
      title: title.trim(),
      description: description || '',
      owner: req.user.id,
      color: color || '#667EEA',
      type: type || 'personal',
      nodes: []
    });
    
    await newBoard.save();
    
    const populatedBoard = await Board.findById(newBoard._id)
      .populate('owner', 'name email');
    
    res.status(201).json(populatedBoard);
  } catch (error) {
    console.error('❌ Create Board Error:', error.message);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

// @route   PUT /api/boards/:id
// @desc    Update a board
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const board = await Board.findById(req.params.id);
    
    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }
    
    // Check if user is the owner
    if (board.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this board' });
    }
    
    const { title, description, nodes, edges, theme, importedFrom, isPublic, color } = req.body;
    
    if (title !== undefined) board.title = title;
    if (description !== undefined) board.description = description;
    if (nodes !== undefined) board.nodes = nodes;
    if (edges !== undefined) board.edges = edges;
    if (theme !== undefined) board.theme = theme;
    if (importedFrom !== undefined) board.importedFrom = importedFrom;
    if (isPublic !== undefined) board.isPublic = isPublic;
    if (color !== undefined) board.color = color;
    
    await board.save();
    
    const updatedBoard = await Board.findById(board._id)
      .populate('owner', 'name email')
      .populate('collaborators', 'name email');
    
    res.json(updatedBoard);
  } catch (error) {
    console.error('❌ Update Board Error:', error.message);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

// @route   DELETE /api/boards/:id
// @desc    Delete a board
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const board = await Board.findById(req.params.id);
    
    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }
    
    // Check if user is the owner
    if (board.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this board' });
    }
    
    await Board.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Board deleted successfully' });
  } catch (error) {
    console.error('❌ Delete Board Error:', error.message);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

module.exports = router;

