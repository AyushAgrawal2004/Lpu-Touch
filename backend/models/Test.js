const mongoose = require('mongoose');

const mcqSchema = new mongoose.Schema({
  questionText: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctOptionIndex: { type: Number, required: true },
  marks: { type: Number, default: 1 }
});

const codingTestCaseSchema = new mongoose.Schema({
  input: { type: String, required: true },
  expectedOutput: { type: String, required: true },
  isHidden: { type: Boolean, default: false },
  marks: { type: Number, default: 10 }
});

const codingSchema = new mongoose.Schema({
  title: { type: String, required: true },
  problemStatement: { type: String, required: true },
  constraints: { type: String },
  memoryLimitMB: { type: Number, default: 256 },
  timeLimitSeconds: { type: Number, default: 2 },
  blacklistedKeywords: [{ type: String }],
  whitelistedKeywords: [{ type: String }],
  testCases: [codingTestCaseSchema]
});

const testSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a test title']
  },
  description: {
    type: String
  },
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: true
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
    required: true
  },
  type: {
    type: String,
    enum: ['mcq', 'coding'],
    required: true
  },
  settings: {
    durationMinutes: { type: Number, required: true },
    totalMarks: { type: Number, required: true },
    startDate: { type: Date },
    endDate: { type: Date }
  },
  mcqQuestions: [mcqSchema],
  codingQuestions: [codingSchema],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Test', testSchema);
