const express = require('express');
const {
  getNodeTypes,
  getNodeType,
  createNodeType,
  updateNodeType,
  deleteNodeType
} = require('../../controllers/nodeTypeController');
const auth = require('../../middleware/auth');

const router = express.Router();

router.use(auth);

router.route('/')
  .get(getNodeTypes)
  .post(createNodeType);

router.route('/:id')
  .get(getNodeType)
  .put(updateNodeType)
  .delete(deleteNodeType);

module.exports = router;
