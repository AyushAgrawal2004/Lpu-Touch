const mongoose = require('mongoose');
const User = require('./models/User');

mongoose.connect('mongodb://127.0.0.1:27017/college_management')
  .then(async () => {
    const user = await User.findOne({ email: 'teacher@lpu.edu' });
    console.log(user);
    process.exit();
  });
