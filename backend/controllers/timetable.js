const Timetable = require('../models/Timetable');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const Subject = require('../models/Subject');

// @desc    Get timetable for current user
// @route   GET /api/timetable
// @access  Private
exports.getTimetable = async (req, res) => {
  try {
    let timetable = [];

    if (req.user.role === 'student') {
      const student = await Student.findOne({ user: req.user.id });
      if (student) {
        // Find all timetable entries where the subject is in the student's enrolledSubjects
        timetable = await Timetable.find({ subject: { $in: student.enrolledSubjects } })
          .populate({
            path: 'subject',
            populate: { path: 'teacher', populate: { path: 'user', select: 'name' } }
          });
      }
    } else if (req.user.role === 'teacher') {
      const teacher = await Teacher.findOne({ user: req.user.id });
      if (teacher) {
        // Find all subjects taught by this teacher
        const subjects = await Subject.find({ teacher: teacher._id });
        const subjectIds = subjects.map(s => s._id);
        
        // Find timetable entries for these subjects
        timetable = await Timetable.find({ subject: { $in: subjectIds } })
          .populate('subject');
      }
    }

    res.status(200).json({ success: true, data: timetable });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};
