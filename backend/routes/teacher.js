const express = require('express');
const {
  getDashboardStats,
  createSubject,
  getSubjects,
  markAttendance,
  getAttendanceBySubjectAndDate,
  getStudents,
  createDisciplineReport,
  getDisciplineReports,
  uploadFile,
  getFiles,
  deleteFile
} = require('../controllers/teacher');

const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// All routes require teacher auth
router.use(protect);
router.use(authorize('teacher'));

router.get('/dashboard', getDashboardStats);

// Subjects
router.route('/subjects')
  .get(getSubjects)
  .post(createSubject);

// Attendance
router.route('/attendance')
  .get(getAttendanceBySubjectAndDate)
  .post(markAttendance);

// Students
router.get('/students', getStudents);

// Discipline
router.route('/discipline')
  .get(getDisciplineReports)
  .post(createDisciplineReport);

// Files
router.route('/files')
  .get(getFiles)
  .post(upload.single('file'), uploadFile);
  
router.delete('/files/:id', deleteFile);

module.exports = router;
