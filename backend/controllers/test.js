const Test = require('../models/Test');
const Teacher = require('../models/Teacher');
const Subject = require('../models/Subject');

// @desc    Create a new test
// @route   POST /api/teacher/test
// @access  Private/Teacher
exports.createTest = async (req, res) => {
  try {
    const { title, description, subjectId, type, settings, mcqQuestions, codingQuestions } = req.body;

    const teacher = await Teacher.findOne({ user: req.user.id });
    if (!teacher) {
      return res.status(404).json({ success: false, error: 'Teacher profile not found' });
    }

    // Verify subject belongs to teacher
    const subject = await Subject.findOne({ _id: subjectId, teacher: teacher._id });
    if (!subject) {
      return res.status(403).json({ success: false, error: 'Not authorized to create a test for this subject' });
    }

    // Calculate total marks automatically
    let totalMarks = 0;
    if (type === 'mcq' && mcqQuestions) {
      totalMarks = mcqQuestions.reduce((sum, q) => sum + (Number(q.marks) || 1), 0);
    } else if (type === 'coding' && codingQuestions) {
      totalMarks = codingQuestions.reduce((sum, q) => {
        const testCaseMarks = q.testCases ? q.testCases.reduce((tcSum, tc) => tcSum + (Number(tc.marks) || 10), 0) : 0;
        return sum + testCaseMarks;
      }, 0);
    }

    const test = await Test.create({
      title,
      description,
      subject: subjectId,
      teacher: teacher._id,
      type,
      settings: {
        ...settings,
        totalMarks
      },
      mcqQuestions: type === 'mcq' ? mcqQuestions : [],
      codingQuestions: type === 'coding' ? codingQuestions : []
    });

    res.status(201).json({ success: true, data: test });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Get all tests for logged in teacher
// @route   GET /api/teacher/test
// @access  Private/Teacher
exports.getTests = async (req, res) => {
  try {
    const teacher = await Teacher.findOne({ user: req.user.id });
    if (!teacher) {
      return res.status(404).json({ success: false, error: 'Teacher profile not found' });
    }

    const tests = await Test.find({ teacher: teacher._id }).populate('subject', 'name code').sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: tests });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Delete a test
// @route   DELETE /api/teacher/test/:id
// @access  Private/Teacher
exports.deleteTest = async (req, res) => {
  try {
    const teacher = await Teacher.findOne({ user: req.user.id });
    if (!teacher) {
      return res.status(404).json({ success: false, error: 'Teacher profile not found' });
    }

    const test = await Test.findOne({ _id: req.params.id, teacher: teacher._id });
    if (!test) {
      return res.status(404).json({ success: false, error: 'Test not found or not authorized to delete' });
    }

    await test.deleteOne();

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};
