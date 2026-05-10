const express = require('express');
const {
  getDashboardStats,
  getAttendanceDetails,
  getDisciplineNotices,
  getSharedFiles,
  getTests,
  getTestDetails,
  startTest,
  submitTest
} = require('../controllers/student');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All routes require student auth
router.use(protect);
router.use(authorize('student'));

router.get('/dashboard', getDashboardStats);
router.get('/attendance', getAttendanceDetails);
router.get('/discipline', getDisciplineNotices);
router.get('/files', getSharedFiles);

// Test Routes
router.get('/tests', getTests);
router.get('/tests/:id', getTestDetails);
router.post('/tests/:id/start', startTest);
router.post('/tests/:id/submit', submitTest);

module.exports = router;
