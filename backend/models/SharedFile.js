const mongoose = require('mongoose');

const sharedFileSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title for the file']
  },
  description: {
    type: String
  },
  fileUrl: {
    type: String,
    required: true
  },
  fileType: {
    type: String,
    required: true
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
  uploadedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('SharedFile', sharedFileSchema);
