const Board = require('../models/Board');
const Node = require('../models/Node/Node');

// Create a new board
exports.createBoard = async (req, res) => {
  try {
    const { title, description, nodeIds, tags, isShared, sharedWith } = req.body;
    const board = new Board({
      userId: req.user.id,
      title,
      description,
      nodeIds: nodeIds || [],
      tags: tags || [],
      isShared: isShared || false,
      sharedWith: sharedWith || []
    });
    await board.save();
    res.status(201).json({ success: true, data: board });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Get all boards for user
exports.getBoards = async (req, res) => {
  try {
    const boards = await Board.find({ userId: req.user.id });
    res.status(200).json({ success: true, data: boards });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get single board by ID
exports.getBoard = async (req, res) => {
  try {
    const board = await Board.findOne({ _id: req.params.id, userId: req.user.id });
    if (!board) return res.status(404).json({ success: false, message: 'Board not found' });
    res.status(200).json({ success: true, data: board });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Update board
exports.updateBoard = async (req, res) => {
  try {
    const board = await Board.findOne({ _id: req.params.id, userId: req.user.id });
    if (!board) return res.status(404).json({ success: false, message: 'Board not found' });
    const { title, description, nodeIds, tags, isShared, sharedWith } = req.body;
    if (title) board.title = title;
    if (description !== undefined) board.description = description;
    if (nodeIds) board.nodeIds = nodeIds;
    if (tags) board.tags = tags;
    if (isShared !== undefined) board.isShared = isShared;
    if (sharedWith) board.sharedWith = sharedWith;
    await board.save();
    res.status(200).json({ success: true, data: board });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Delete board
exports.deleteBoard = async (req, res) => {
  try {
    const board = await Board.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!board) return res.status(404).json({ success: false, message: 'Board not found' });
    res.status(200).json({ success: true, message: 'Board deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
