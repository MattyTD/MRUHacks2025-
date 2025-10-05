const express = require('express');
const {
  createNode,
  getNodes,
  getNode,
  updateNode,
  deleteNode,
  toggleArchive,
  searchNodes,
  getNodeStats
} = require('../../controllers/nodeController');
const auth = require('../../middleware/auth');

const router = express.Router();

router.use(auth);

// Special routes first
router.get('/search', searchNodes);
router.get('/stats', getNodeStats);

router.route('/')
  .get(getNodes)
  .post(createNode);

router.route('/:id')
  .get(getNode)
  .put(updateNode)
  .delete(deleteNode);

router.patch('/:id/archive', toggleArchive);

module.exports = router;