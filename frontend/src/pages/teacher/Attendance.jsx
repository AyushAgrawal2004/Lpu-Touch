import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const Attendance = () => {
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceRecords, setAttendanceRecords] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch subjects and all students
    const fetchData = async () => {
      try {
        const [subRes, stuRes] = await Promise.all([
          api.get('/teacher/subjects'),
          api.get('/teacher/students')
        ]);
        if (subRes.data.success) setSubjects(subRes.data.data);
        if (stuRes.data.success) setStudents(stuRes.data.data);
      } catch (error) {
        toast.error('Failed to load data');
      }
    };
    fetchData();
  }, []);

  const fetchAttendance = async () => {
    if (!selectedSubject || !date) return;
    setLoading(true);
    try {
      const res = await api.get(`/teacher/attendance?subjectId=${selectedSubject}&date=${date}`);
      if (res.data.success && res.data.data) {
        const recordsMap = {};
        res.data.data.records.forEach(r => {
          recordsMap[r.student] = r.status;
        });
        setAttendanceRecords(recordsMap);
      } else {
        // Init default
        const initMap = {};
        students.forEach(s => {
          initMap[s._id] = 'Present'; // Default present
        });
        setAttendanceRecords(initMap);
      }
    } catch (error) {
      toast.error('Failed to load attendance');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [selectedSubject, date, students]);

  const handleStatusChange = (studentId, status) => {
    setAttendanceRecords(prev => ({ ...prev, [studentId]: status }));
  };

  const handleSave = async () => {
    try {
      const records = Object.keys(attendanceRecords).map(studentId => ({
        student: studentId,
        status: attendanceRecords[studentId]
      }));

      const res = await api.post('/teacher/attendance', {
        subjectId: selectedSubject,
        date,
        records
      });

      if (res.data.success) {
        toast.success('Attendance saved successfully');
      }
    } catch (error) {
      toast.error('Failed to save attendance');
    }
  };

  return (
    <div className="space-y-6 bg-white dark:bg-card p-6 rounded-xl shadow-sm border border-border">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Manage Attendance</h2>
          <p className="text-sm text-gray-500">Mark or edit daily attendance for your subjects.</p>
        </div>
        <div className="flex space-x-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subject</label>
            <select 
              value={selectedSubject} 
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="border border-gray-300 dark:border-border rounded-lg px-3 py-2 bg-white dark:bg-input"
            >
              <option value="">Select Subject</option>
              {subjects.map(s => <option key={s._id} value={s._id}>{s.name} ({s.code})</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date</label>
            <input 
              type="date" 
              value={date} 
              onChange={(e) => setDate(e.target.value)}
              className="border border-gray-300 dark:border-border rounded-lg px-3 py-2 bg-white dark:bg-input"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="py-10 text-center">Loading students...</div>
      ) : selectedSubject && students.length > 0 ? (
        <div className="mt-8">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-border">
              <thead className="bg-gray-50 dark:bg-accent">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Roll No</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-card divide-y divide-gray-200 dark:divide-border">
                {students.map((student) => (
                  <tr key={student._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {student.user?.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {student.rollNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-2">
                        {['Present', 'Absent', 'Late'].map(status => (
                          <button
                            key={status}
                            onClick={() => handleStatusChange(student._id, status)}
                            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                              attendanceRecords[student._id] === status
                                ? status === 'Present' ? 'bg-green-100 text-green-800 border-green-200'
                                : status === 'Absent' ? 'bg-red-100 text-red-800 border-red-200'
                                : 'bg-yellow-100 text-yellow-800 border-yellow-200'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400'
                            } border`}
                          >
                            {status}
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-6 flex justify-end">
            <button 
              onClick={handleSave}
              className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors shadow-sm"
            >
              Save Attendance
            </button>
          </div>
        </div>
      ) : (
        <div className="py-10 text-center text-gray-500">
          Please select a subject to mark attendance.
        </div>
      )}
    </div>
  );
};

export default Attendance;
