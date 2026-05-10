const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rollNumber: {
    type: String,
    required: [true, 'Please add a roll number'],
    unique: true
  },
  phone: {
    type: String,
    required: [true, 'Please add a phone number']
  },
  department: {
    type: String,
    required: [true, 'Please add a department']
  },
  batch: {
    type: String,
    required: [true, 'Please add a batch (e.g., 2024)']
  },
  enrolledSubjects: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject'
  }]
});

module.exports = mongoose.model('Student', studentSchema);
