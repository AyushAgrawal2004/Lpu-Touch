const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a subject name']
  },
  code: {
    type: String,
    required: [true, 'Please add a subject code'],
    unique: true
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
    required: true
  },
  department: {
    type: String,
    required: [true, 'Please add a department']
  },
  semester: {
    type: Number,
    required: [true, 'Please add a semester']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Subject', subjectSchema);
