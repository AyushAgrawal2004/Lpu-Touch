const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Student = require('./models/Student');
const Teacher = require('./models/Teacher');
const Subject = require('./models/Subject');
const Timetable = require('./models/Timetable');
const Test = require('./models/Test');

dotenv.config({ path: './.env' });

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/college_management');

const seedData = async () => {
  try {
    console.log('Clearing database...');
    await User.deleteMany();
    await Student.deleteMany();
    await Teacher.deleteMany();
    await Subject.deleteMany();
    await Timetable.deleteMany();
    await Test.deleteMany();

    console.log('Creating Users and Profiles...');
    
    // --- TEACHERS ---
    const adminUser = await User.create({ name: 'Admin Teacher', email: 'admin@lpu.edu', password: 'password123', role: 'teacher', isAdmin: true });
    const teacher2User = await User.create({ name: 'Jane Smith', email: 'jane@lpu.edu', password: 'password123', role: 'teacher', isAdmin: false });

    const adminTeacher = await Teacher.create({ user: adminUser._id, employeeId: 'EMP001', department: 'Computer Science', phone: '9876543210' });
    const teacher2 = await Teacher.create({ user: teacher2User._id, employeeId: 'EMP002', department: 'Computer Science', phone: '9876543211' });

    // --- SUBJECTS ---
    const subWebDev = await Subject.create({ name: 'Web Development', code: 'CSE311', teacher: adminTeacher._id, department: 'Computer Science', semester: 5 });
    const subOS = await Subject.create({ name: 'Operating Systems', code: 'CSE312', teacher: adminTeacher._id, department: 'Computer Science', semester: 5 });
    const subDSA = await Subject.create({ name: 'Data Structures', code: 'CSE201', teacher: teacher2._id, department: 'Computer Science', semester: 3 });
    const subNetworks = await Subject.create({ name: 'Computer Networks', code: 'CSE315', teacher: teacher2._id, department: 'Computer Science', semester: 5 });

    const allSubjectIds = [subWebDev._id, subOS._id, subDSA._id, subNetworks._id];

    // --- STUDENTS ---
    const studentUsers = [
      { name: 'Alice Johnson', email: 'alice@lpu.edu', password: 'password123', role: 'student' },
      { name: 'Bob Williams', email: 'bob@lpu.edu', password: 'password123', role: 'student' },
      { name: 'Charlie Davis', email: 'charlie@lpu.edu', password: 'password123', role: 'student' }
    ];

    const createdStudentUsers = await User.insertMany(studentUsers);

    const studentProfiles = [
      { user: createdStudentUsers[0]._id, rollNumber: 'R1001', department: 'Computer Science', batch: '2025', phone: '9000000001', enrolledSubjects: allSubjectIds },
      { user: createdStudentUsers[1]._id, rollNumber: 'R1002', department: 'Computer Science', batch: '2025', phone: '9000000002', enrolledSubjects: allSubjectIds },
      { user: createdStudentUsers[2]._id, rollNumber: 'R1003', department: 'Computer Science', batch: '2025', phone: '9000000003', enrolledSubjects: allSubjectIds }
    ];

    await Student.insertMany(studentProfiles);

    // --- TIMETABLE ---
    console.log('Generating Timetable...');
    const timetableEntries = [
      { subject: subWebDev._id, dayOfWeek: 'Monday', startTime: '09:00', endTime: '10:00' },
      { subject: subOS._id, dayOfWeek: 'Monday', startTime: '10:00', endTime: '11:00' },
      { subject: subDSA._id, dayOfWeek: 'Tuesday', startTime: '09:00', endTime: '11:00' },
      { subject: subNetworks._id, dayOfWeek: 'Wednesday', startTime: '11:00', endTime: '12:00' },
      { subject: subWebDev._id, dayOfWeek: 'Thursday', startTime: '13:00', endTime: '15:00' },
      { subject: subOS._id, dayOfWeek: 'Friday', startTime: '09:00', endTime: '10:00' },
    ];

    await Timetable.insertMany(timetableEntries);

    // --- SAMPLE TESTS ---
    console.log('Generating Sample Tests...');
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    await Test.create({
      title: 'Web Dev Midterm (MCQ)',
      description: 'A quick quiz covering HTML, CSS, and basic React concepts.',
      subject: subWebDev._id,
      teacher: adminTeacher._id,
      type: 'mcq',
      settings: { durationMinutes: 30, totalMarks: 20, startDate: now, endDate: tomorrow },
      mcqQuestions: [
        { questionText: 'What does HTML stand for?', options: ['Hyper Text Markup Language', 'High Tech Modern Language', 'Hyperlink and Text Markup Language', 'Home Tool Markup Language'], correctOptionIndex: 0, marks: 10 },
        { questionText: 'Which React hook is used for side effects?', options: ['useState', 'useEffect', 'useContext', 'useReducer'], correctOptionIndex: 1, marks: 10 }
      ]
    });

    await Test.create({
      title: 'DSA Final Coding Challenge',
      description: 'Write efficient algorithms to solve these standard problems.',
      subject: subDSA._id,
      teacher: teacher2._id,
      type: 'coding',
      settings: { durationMinutes: 120, totalMarks: 50, startDate: now },
      codingQuestions: [
        {
          title: 'Two Sum',
          problemStatement: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
          constraints: '2 <= nums.length <= 10^4',
          memoryLimitMB: 256,
          timeLimitSeconds: 2,
          blacklistedKeywords: ['eval', 'import'],
          whitelistedKeywords: ['for'],
          testCases: [
            { input: '[2,7,11,15]\n9', expectedOutput: '[0,1]', isHidden: false, marks: 25 },
            { input: '[3,2,4]\n6', expectedOutput: '[1,2]', isHidden: true, marks: 25 }
          ]
        }
      ]
    });

    console.log('=============================================');
    console.log('Database Seeded Successfully!');
    console.log('---------------------------------------------');
    console.log('Admin Teacher : admin@lpu.edu / password123');
    console.log('Teacher 2     : jane@lpu.edu / password123');
    console.log('Student 1     : alice@lpu.edu / password123');
    console.log('Student 2     : bob@lpu.edu / password123');
    console.log('Student 3     : charlie@lpu.edu / password123');
    console.log('=============================================');

    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedData();
