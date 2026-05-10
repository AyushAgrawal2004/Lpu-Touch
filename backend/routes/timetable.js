const express = require('express');
const { getTimetable } = require('../controllers/timetable');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);
router.route('/').get(getTimetable);

module.exports = router;
