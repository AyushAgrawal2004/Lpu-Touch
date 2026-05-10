const Teacher = require('../models/Teacher');
const Student = require('../models/Student');
const Subject = require('../models/Subject');
const Attendance = require('../models/Attendance');
const DisciplineReport = require('../models/DisciplineReport');
const SharedFile = require('../models/SharedFile');

// ========================
// DASHBOARD & STATS
// ========================
exports.getDashboardStats = async (req, res) => {
  try {
    const teacher = await Teacher.findOne({ user: req.user.id });
    if (!teacher) return res.status(404).json({ success: false, error: 'Teacher not found' });

    const totalSubjects = await Subject.countDocuments({ teacher: teacher._id });
    const totalStudents = await Student.countDocuments(); // Simple total, can be optimized
    
    // Recent files
    const recentFiles = await SharedFile.find({ teacher: teacher._id })
      .sort({ uploadedAt: -1 })
      .limit(5)
      .populate('subject', 'name');

    // Recent discipline reports
    const recentReports = await DisciplineReport.find({ teacher: teacher._id })
      .sort({ date: -1 })
      .limit(5)
      .populate({ path: 'student', populate: { path: 'user', select: 'name email' } });

    res.status(200).json({
      success: true,
      data: {
        totalSubjects,
        totalStudents,
        recentFiles,
        recentReports
      }
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// ========================
// SUBJECTS
// ========================
exports.createSubject = async (req, res) => {
  try {
    const teacher = await Teacher.findOne({ user: req.user.id });
    req.body.teacher = teacher._id;
    const subject = await Subject.create(req.body);
    res.status(201).json({ success: true, data: subject });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.getSubjects = async (req, res) => {
  try {
    const teacher = await Teacher.findOne({ user: req.user.id });
    const subjects = await Subject.find({ teacher: teacher._id });
    res.status(200).json({ success: true, data: subjects });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// ========================
// ATTENDANCE
// ========================
exports.markAttendance = async (req, res) => {
  try {
    const { subjectId, date, records } = req.body;
    const teacher = await Teacher.findOne({ user: req.user.id });

    // Check if attendance already exists for this date and subject
    let attendance = await Attendance.findOne({
      subject: subjectId,
      date: new Date(date).setHours(0,0,0,0)
    });

    if (attendance) {
      // Update existing
      attendance.records = records;
      await attendance.save();
    } else {
      // Create new
      attendance = await Attendance.create({
        subject: subjectId,
        date: new Date(date).setHours(0,0,0,0),
        teacher: teacher._id,
        records
      });
    }

    res.status(200).json({ success: true, data: attendance });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.getAttendanceBySubjectAndDate = async (req, res) => {
  try {
    const { subjectId, date } = req.query;
    if (!subjectId || !date) {
        return res.status(400).json({ success: false, error: 'Please provide subjectId and date' });
    }
    
    const attendance = await Attendance.findOne({
      subject: subjectId,
      date: new Date(date).setHours(0,0,0,0)
    });

    res.status(200).json({ success: true, data: attendance });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// ========================
// STUDENTS DIRECTORY
// ========================
exports.getStudents = async (req, res) => {
  try {
    const students = await Student.find().populate('user', 'name email');
    res.status(200).json({ success: true, data: students });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// ========================
// DISCIPLINE
// ========================
exports.createDisciplineReport = async (req, res) => {
  try {
    const teacher = await Teacher.findOne({ user: req.user.id });
    req.body.teacher = teacher._id;
    const report = await DisciplineReport.create(req.body);
    res.status(201).json({ success: true, data: report });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.getDisciplineReports = async (req, res) => {
  try {
    const teacher = await Teacher.findOne({ user: req.user.id });
    const reports = await DisciplineReport.find({ teacher: teacher._id })
        .populate('subject', 'name')
        .populate({ path: 'student', populate: { path: 'user', select: 'name rollNumber' } });
    res.status(200).json({ success: true, data: reports });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// ========================
// SHARED FILES
// ========================
exports.uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'Please upload a file' });
    }

    const { title, description, subjectId } = req.body;
    const teacher = await Teacher.findOne({ user: req.user.id });

    // File URL will be relative to server domain
    const fileUrl = `/uploads/${req.file.filename}`;

    const sharedFile = await SharedFile.create({
      title,
      description,
      fileUrl,
      fileType: req.file.mimetype,
      subject: subjectId,
      teacher: teacher._id
    });

    res.status(201).json({ success: true, data: sharedFile });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.getFiles = async (req, res) => {
  try {
    const teacher = await Teacher.findOne({ user: req.user.id });
    const files = await SharedFile.find({ teacher: teacher._id }).populate('subject', 'name');
    res.status(200).json({ success: true, data: files });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.deleteFile = async (req, res) => {
  try {
    const file = await SharedFile.findById(req.params.id);
    if (!file) {
      return res.status(404).json({ success: false, error: 'File not found' });
    }

    // Optional: Delete physical file from disk here
    const fs = require('fs');
    const path = require('path');
    const filePath = path.join(__dirname, '..', file.fileUrl);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await file.deleteOne();
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};
