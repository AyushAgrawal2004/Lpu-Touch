const mongoose = require('mongoose');

const testAttemptSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  test: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Test',
    required: true
  },
  status: {
    type: String,
    enum: ['in-progress', 'submitted'],
    default: 'in-progress'
  },
  startTime: {
    type: Date,
    default: Date.now
  },
  submittedAt: {
    type: Date
  },
  mcqAnswers: [{
    questionId: { type: mongoose.Schema.Types.ObjectId },
    selectedOptionIndex: { type: Number, default: -1 }
  }],
  codingAnswers: [{
    questionId: { type: mongoose.Schema.Types.ObjectId },
    code: { type: String, default: '' }
  }],
  score: {
    type: Number,
    default: 0
  }
});

// Ensure a student can only have one attempt per test
testAttemptSchema.index({ student: 1, test: 1 }, { unique: true });

module.exports = mongoose.model('TestAttempt', testAttemptSchema);
