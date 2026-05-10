const Student = require('../models/Student');
const Subject = require('../models/Subject');
const Attendance = require('../models/Attendance');
const DisciplineReport = require('../models/DisciplineReport');
const SharedFile = require('../models/SharedFile');
const Teacher = require('../models/Teacher');

// ========================
// DASHBOARD
// ========================
exports.getDashboardStats = async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user.id });
    if (!student) return res.status(404).json({ success: false, error: 'Student not found' });

    // Enrolled Subjects
    // For simplicity, let's assume students belong to a department/batch and have all subjects of that dept
    // or we use the enrolledSubjects array. We will fetch all subjects in the same department for now.
    const subjects = await Subject.find({ department: student.department });
    const totalSubjects = subjects.length;

    // Attendance Calculation
    // Find all attendance records where this student is present
    const attendances = await Attendance.find({ 'records.student': student._id });
    
    let totalClasses = 0;
    let presentClasses = 0;

    attendances.forEach(att => {
      totalClasses++;
      const record = att.records.find(r => r.student.toString() === student._id.toString());
      if (record && record.status === 'Present') {
        presentClasses++;
      }
    });

    const overallAttendance = totalClasses === 0 ? 0 : ((presentClasses / totalClasses) * 100).toFixed(2);

    // Recent discipline notices
    const recentNotices = await DisciplineReport.find({ student: student._id })
      .sort({ date: -1 })
      .limit(3);

    // Recent materials
    const recentMaterials = await SharedFile.find({ subject: { $in: subjects.map(s => s._id) } })
      .sort({ uploadedAt: -1 })
      .limit(5)
      .populate('subject', 'name')
      .populate({ path: 'teacher', populate: { path: 'user', select: 'name' } });

    res.status(200).json({
      success: true,
      data: {
        totalSubjects,
        overallAttendance,
        recentNotices,
        recentMaterials,
        totalClasses,
        presentClasses
      }
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// ========================
// ATTENDANCE DETAILS
// ========================
exports.getAttendanceDetails = async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user.id });
    const subjects = await Subject.find({ department: student.department });
    
    const attendances = await Attendance.find({ 'records.student': student._id }).populate('subject', 'name code');
    
    // Group by subject
    const subjectAttendance = {};
    
    subjects.forEach(sub => {
      subjectAttendance[sub._id] = {
        subjectName: sub.name,
        subjectCode: sub.code,
        totalClasses: 0,
        presentClasses: 0,
        absentClasses: 0
      };
    });

    attendances.forEach(att => {
      const subId = att.subject._id.toString();
      if (subjectAttendance[subId]) {
        subjectAttendance[subId].totalClasses++;
        const record = att.records.find(r => r.student.toString() === student._id.toString());
        if (record && record.status === 'Present') {
          subjectAttendance[subId].presentClasses++;
        } else {
          subjectAttendance[subId].absentClasses++;
        }
      }
    });

    // Format output
    const formattedData = Object.values(subjectAttendance).map(item => ({
      ...item,
      percentage: item.totalClasses === 0 ? 0 : ((item.presentClasses / item.totalClasses) * 100).toFixed(2)
    }));

    res.status(200).json({ success: true, data: formattedData });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// ========================
// DISCIPLINE NOTICES
// ========================
exports.getDisciplineNotices = async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user.id });
    const reports = await DisciplineReport.find({ student: student._id })
      .populate('subject', 'name')
      .populate({ path: 'teacher', populate: { path: 'user', select: 'name' } })
      .sort({ date: -1 });

    res.status(200).json({ success: true, data: reports });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// ========================
// SHARED FILES
// ========================
exports.getSharedFiles = async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user.id });
    const subjects = await Subject.find({ department: student.department });
    
    const files = await SharedFile.find({ subject: { $in: subjects.map(s => s._id) } })
      .populate('subject', 'name code')
      .populate({ path: 'teacher', populate: { path: 'user', select: 'name' } })
      .sort({ uploadedAt: -1 });

    res.status(200).json({ success: true, data: files });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// ========================
// ASSESSMENTS / TESTS
// ========================
exports.getTests = async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user.id });
    if (!student) return res.status(404).json({ success: false, error: 'Student not found' });

    const subjects = await Subject.find({ department: student.department });
    
    const Test = require('../models/Test'); 
    const TestAttempt = require('../models/TestAttempt');
    
    let tests = await Test.find({ subject: { $in: subjects.map(s => s._id) } })
      .populate('subject', 'name code')
      .populate({ path: 'teacher', populate: { path: 'user', select: 'name' } })
      .select('-mcqQuestions.correctOptionIndex -codingQuestions.testCases') // Hide answers from students!
      .sort({ createdAt: -1 })
      .lean();

    // Fetch attempts for this student
    const attempts = await TestAttempt.find({ student: student._id }).lean();
    const attemptMap = {};
    attempts.forEach(att => {
      attemptMap[att.test.toString()] = att;
    });

    // Attach attempt status to each test
    tests = tests.map(test => {
      const attempt = attemptMap[test._id.toString()];
      return {
        ...test,
        attemptStatus: attempt ? attempt.status : 'not-started',
        score: attempt && attempt.status === 'submitted' ? attempt.score : null
      };
    });

    res.status(200).json({ success: true, data: tests });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.getTestDetails = async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user.id });
    const Test = require('../models/Test');
    const TestAttempt = require('../models/TestAttempt');

    const test = await Test.findById(req.params.id)
      .populate('subject', 'name code')
      .select('-mcqQuestions.correctOptionIndex -codingQuestions.testCases') // hide answers
      .lean();

    if (!test) return res.status(404).json({ success: false, error: 'Test not found' });

    const attempt = await TestAttempt.findOne({ student: student._id, test: test._id }).lean();

    res.status(200).json({ success: true, data: { test, attempt } });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.startTest = async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user.id });
    const Test = require('../models/Test');
    const TestAttempt = require('../models/TestAttempt');

    const test = await Test.findById(req.params.id);
    if (!test) return res.status(404).json({ success: false, error: 'Test not found' });

    // Check availability window
    const now = new Date();
    if (test.settings.startDate && now < test.settings.startDate) {
      return res.status(400).json({ success: false, error: 'Test has not started yet' });
    }
    if (test.settings.endDate && now > test.settings.endDate) {
      return res.status(400).json({ success: false, error: 'Test has already ended' });
    }

    let attempt = await TestAttempt.findOne({ student: student._id, test: test._id });
    if (attempt) {
      return res.status(400).json({ success: false, error: 'You have already started or submitted this test' });
    }

    attempt = await TestAttempt.create({
      student: student._id,
      test: test._id,
      status: 'in-progress',
      startTime: Date.now()
    });

    res.status(200).json({ success: true, data: attempt });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.submitTest = async (req, res) => {
  try {
    const { mcqAnswers, codingAnswers } = req.body;
    const student = await Student.findOne({ user: req.user.id });
    
    const Test = require('../models/Test');
    const TestAttempt = require('../models/TestAttempt');

    const test = await Test.findById(req.params.id);
    if (!test) return res.status(404).json({ success: false, error: 'Test not found' });

    const attempt = await TestAttempt.findOne({ student: student._id, test: test._id });
    if (!attempt) {
      return res.status(400).json({ success: false, error: 'Test attempt not found. Please start the test first.' });
    }

    if (attempt.status === 'submitted') {
      return res.status(400).json({ success: false, error: 'You have already submitted this test' });
    }

    let score = 0;

    // Auto-grade MCQs
    if (test.type === 'mcq' && mcqAnswers) {
      const formattedAnswers = [];
      mcqAnswers.forEach((ans) => {
        const question = test.mcqQuestions.id(ans.questionId);
        if (question && question.correctOptionIndex === ans.selectedOptionIndex) {
          score += question.marks || 1;
        }
        formattedAnswers.push(ans);
      });
      attempt.mcqAnswers = formattedAnswers;
    }

    // Save Coding Answers
    if (test.type === 'coding' && codingAnswers) {
      attempt.codingAnswers = codingAnswers;
      // Coding score is manually graded later by the teacher
    }

    attempt.score = score;
    attempt.status = 'submitted';
    attempt.submittedAt = Date.now();

    await attempt.save();

    res.status(200).json({ success: true, data: attempt });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};
