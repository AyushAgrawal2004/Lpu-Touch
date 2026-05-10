const express = require('express');
const { createTest, getTests, deleteTest } = require('../controllers/test');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);
router.use(authorize('teacher'));

router.route('/')
  .post(createTest)
  .get(getTests);

router.route('/:id')
  .delete(deleteTest);

module.exports = router;
