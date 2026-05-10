const Subject = require('../models/Subject');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const Timetable = require('../models/Timetable');
const User = require('../models/User');

// @desc    Create a Subject
// @route   POST /api/admin/subject
// @access  Private/Admin
exports.createSubject = async (req, res) => {
  try {
    const { name, code, teacherId, department, semester } = req.body;
    
    // Check if subject exists
    const exists = await Subject.findOne({ code });
    if (exists) {
      return res.status(400).json({ success: false, error: 'Subject code already exists' });
    }

    const subject = await Subject.create({
      name,
      code,
      teacher: teacherId,
      department,
      semester
    });

    res.status(201).json({ success: true, data: subject });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Get all teachers
// @route   GET /api/admin/teachers
// @access  Private/Admin
exports.getTeachers = async (req, res) => {
  try {
    const teachers = await Teacher.find().populate('user', 'name email');
    res.status(200).json({ success: true, data: teachers });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Get all subjects
// @route   GET /api/admin/subjects
// @access  Private/Admin
exports.getSubjects = async (req, res) => {
  try {
    const subjects = await Subject.find().populate('teacher');
    // also populate the teacher's User doc to get the name
    await Teacher.populate(subjects, { path: 'teacher.user', select: 'name email' });
    res.status(200).json({ success: true, data: subjects });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Get all students
// @route   GET /api/admin/students
// @access  Private/Admin
exports.getStudents = async (req, res) => {
  try {
    const students = await Student.find().populate('user', 'name email rollNumber');
    res.status(200).json({ success: true, data: students });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Assign student to a subject
// @route   POST /api/admin/assign-student
// @access  Private/Admin
exports.assignStudentToSubject = async (req, res) => {
  try {
    const { studentId, subjectId } = req.body;
    
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ success: false, error: 'Student not found' });
    }

    // Check if already enrolled
    if (student.enrolledSubjects.includes(subjectId)) {
      return res.status(400).json({ success: false, error: 'Student is already enrolled in this subject' });
    }

    student.enrolledSubjects.push(subjectId);
    await student.save();

    res.status(200).json({ success: true, data: student });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Create a timetable entry
// @route   POST /api/admin/timetable
// @access  Private/Admin
exports.createTimetable = async (req, res) => {
  try {
    const { subjectId, dayOfWeek, startTime, endTime } = req.body;
    
    const entry = await Timetable.create({
      subject: subjectId,
      dayOfWeek,
      startTime,
      endTime
    });

    res.status(201).json({ success: true, data: entry });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};
