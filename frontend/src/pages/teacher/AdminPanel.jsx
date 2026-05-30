import React, { useState, useEffect } from 'react';
import api, { endpoints } from '../../services/api';
import toast from 'react-hot-toast';
import { BookPlus, Users, ShieldAlert, UserPlus } from 'lucide-react';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('subjects');
  const [teachers, setTeachers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchInitialData = async () => {
    try {
      const [tchRes, subRes, stuRes] = await Promise.all([
        endpoints.admin.getTeachers(),
        endpoints.admin.getSubjects(),
        endpoints.admin.getStudents()
      ]);
      if (tchRes.data.success) setTeachers(tchRes.data.data);
      if (subRes.data.success) setSubjects(subRes.data.data);
      if (stuRes.data.success) setStudents(stuRes.data.data);
    } catch (error) {
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const TABS = [
    { id: 'users', label: 'Create User', icon: UserPlus },
    { id: 'subjects', label: 'Create Subject', icon: BookPlus },
    { id: 'enrollment', label: 'Enroll Students', icon: Users }
  ];

  if (loading) return <div className="p-8 text-center text-gray-500">Loading Admin Panel...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
            <ShieldAlert className="w-6 h-6 mr-2 text-primary" />
            Admin Portal
          </h2>
          <p className="text-sm text-gray-500 mt-1">Manage subjects, enrollments, and academic scheduling.</p>
        </div>
      </div>

      <div className="flex space-x-1 bg-gray-100 dark:bg-card p-1 rounded-xl">
        {TABS.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center py-2.5 text-sm font-medium rounded-lg transition-colors ${
                isActive 
                  ? 'bg-white dark:bg-accent text-gray-900 dark:text-white shadow-sm' 
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-accent/50'
              }`}
            >
              <Icon className="w-4 h-4 mr-2" />
              {tab.label}
            </button>
          )
        })}
      </div>

      <div className="bg-white dark:bg-card p-6 rounded-xl shadow-sm border border-border">
        {activeTab === 'users' && <CreateUserTab onSuccess={fetchInitialData} />}
        {activeTab === 'subjects' && <CreateSubjectTab teachers={teachers} onSuccess={fetchInitialData} />}
        {activeTab === 'enrollment' && <EnrollStudentTab subjects={subjects} students={students} onSuccess={fetchInitialData} />}
      </div>
    </div>
  );
};

const CreateSubjectTab = ({ teachers, onSuccess }) => {
  const [formData, setFormData] = useState({ name: '', code: '', teacherId: '', department: '', semester: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await endpoints.admin.createSubject(formData);
      if (res.data.success) {
        toast.success('Subject created successfully');
        setFormData({ name: '', code: '', teacherId: '', department: '', semester: '' });
        onSuccess();
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to create subject');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
      <h3 className="text-lg font-bold mb-4">Add New Subject</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subject Name</label>
          <input required type="text" className="w-full rounded-lg border px-3 py-2 border-border bg-input" 
            value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Operating Systems" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subject Code</label>
          <input required type="text" className="w-full rounded-lg border px-3 py-2 border-border bg-input" 
            value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} placeholder="e.g. CSE311" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Department</label>
          <input required type="text" className="w-full rounded-lg border px-3 py-2 border-border bg-input" 
            value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} placeholder="e.g. Computer Science" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Semester</label>
          <input required type="number" min="1" max="10" className="w-full rounded-lg border px-3 py-2 border-border bg-input" 
            value={formData.semester} onChange={e => setFormData({...formData, semester: e.target.value})} />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Assign Teacher</label>
        <select required className="w-full rounded-lg border px-3 py-2 border-border bg-input"
          value={formData.teacherId} onChange={e => setFormData({...formData, teacherId: e.target.value})}>
          <option value="">Select a Teacher</option>
          {teachers.map(t => (
            <option key={t._id} value={t._id}>{t.user?.name} ({t.department})</option>
          ))}
        </select>
      </div>
      <button type="submit" disabled={isSubmitting} className="w-full bg-primary text-white py-2 rounded-lg hover:bg-primary/90 mt-4 disabled:opacity-50">
        {isSubmitting ? 'Creating...' : 'Create Subject'}
      </button>
    </form>
  );
};

const EnrollStudentTab = ({ subjects, students, onSuccess }) => {
  const [formData, setFormData] = useState({ studentId: '', subjectId: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await endpoints.admin.assignStudent(formData);
      if (res.data.success) {
        toast.success('Student enrolled successfully');
        setFormData({ studentId: '', subjectId: '' });
        onSuccess();
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to enroll student');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
      <h3 className="text-lg font-bold mb-4">Enroll Student in Subject</h3>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Select Student</label>
        <select required className="w-full rounded-lg border px-3 py-2 border-border bg-input"
          value={formData.studentId} onChange={e => setFormData({...formData, studentId: e.target.value})}>
          <option value="">Select a Student</option>
          {students.map(s => (
            <option key={s._id} value={s._id}>{s.user?.name} - {s.rollNumber}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Select Subject</label>
        <select required className="w-full rounded-lg border px-3 py-2 border-border bg-input"
          value={formData.subjectId} onChange={e => setFormData({...formData, subjectId: e.target.value})}>
          <option value="">Select a Subject</option>
          {subjects.map(sub => (
            <option key={sub._id} value={sub._id}>{sub.name} ({sub.code})</option>
          ))}
        </select>
      </div>
      <button type="submit" disabled={isSubmitting} className="w-full bg-primary text-white py-2 rounded-lg hover:bg-primary/90 mt-4 disabled:opacity-50">
        {isSubmitting ? 'Enrolling...' : 'Enroll Student'}
      </button>
    </form>
  );
};

const CreateUserTab = ({ onSuccess }) => {
  const [role, setRole] = useState('student');
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', phone: '', department: '',
    rollNumber: '', batch: '', employeeId: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = { ...formData, role };
      const res = await api.post('/auth/register', payload);
      if (res.data.success) {
        toast.success(`${role.charAt(0).toUpperCase() + role.slice(1)} account created successfully`);
        setFormData({
          name: '', email: '', password: '', phone: '', department: '',
          rollNumber: '', batch: '', employeeId: ''
        });
        onSuccess();
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to create user');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
      <h3 className="text-lg font-bold mb-4">Create New User Account</h3>
      
      <div className="flex space-x-4 mb-4">
        <label className="flex items-center space-x-2">
          <input type="radio" value="student" checked={role === 'student'} onChange={() => setRole('student')} className="text-primary" />
          <span>Student</span>
        </label>
        <label className="flex items-center space-x-2">
          <input type="radio" value="teacher" checked={role === 'teacher'} onChange={() => setRole('teacher')} className="text-primary" />
          <span>Teacher</span>
        </label>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
          <input required type="text" className="w-full rounded-lg border px-3 py-2 border-border bg-input" 
            value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
          <input required type="email" className="w-full rounded-lg border px-3 py-2 border-border bg-input" 
            value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
          <input required type="password" minLength="6" className="w-full rounded-lg border px-3 py-2 border-border bg-input" 
            value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label>
          <input required type="tel" className="w-full rounded-lg border px-3 py-2 border-border bg-input" 
            value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Department</label>
        <input required type="text" className="w-full rounded-lg border px-3 py-2 border-border bg-input" 
          value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} />
      </div>

      {role === 'student' ? (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Roll Number</label>
            <input required type="text" className="w-full rounded-lg border px-3 py-2 border-border bg-input" 
              value={formData.rollNumber} onChange={e => setFormData({...formData, rollNumber: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Batch Year</label>
            <input required type="text" className="w-full rounded-lg border px-3 py-2 border-border bg-input" 
              value={formData.batch} onChange={e => setFormData({...formData, batch: e.target.value})} />
          </div>
        </div>
      ) : (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Employee ID</label>
          <input required type="text" className="w-full rounded-lg border px-3 py-2 border-border bg-input" 
            value={formData.employeeId} onChange={e => setFormData({...formData, employeeId: e.target.value})} />
        </div>
      )}

      <button type="submit" disabled={isSubmitting} className="w-full bg-primary text-white py-2 rounded-lg hover:bg-primary/90 mt-4 disabled:opacity-50">
        {isSubmitting ? 'Creating...' : 'Create Account'}
      </button>
    </form>
  );
};

export default AdminPanel;
