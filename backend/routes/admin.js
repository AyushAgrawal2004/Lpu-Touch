const express = require('express');
const { 
  createSubject, 
  getTeachers, 
  getSubjects,
  getStudents,
  assignStudentToSubject,
  createTimetable
} = require('../controllers/admin');

const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

router.use(protect);
router.use(adminOnly);

router.route('/subject').post(createSubject);
router.route('/teachers').get(getTeachers);
router.route('/subjects').get(getSubjects);
router.route('/students').get(getStudents);
router.route('/assign-student').post(assignStudentToSubject);
router.route('/timetable').post(createTimetable);

module.exports = router;
