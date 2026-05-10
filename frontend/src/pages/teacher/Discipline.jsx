import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { AlertTriangle, Plus } from 'lucide-react';

const Discipline = () => {
  const [reports, setReports] = useState([]);
  const [students, setStudents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    student: '',
    title: '',
    description: '',
    severity: 'Low'
  });

  const fetchReports = async () => {
    try {
      const res = await api.get('/teacher/discipline');
      if (res.data.success) setReports(res.data.data);
    } catch (error) {
      toast.error('Failed to load reports');
    }
  };

  const fetchStudents = async () => {
    try {
      const res = await api.get('/teacher/students');
      if (res.data.success) setStudents(res.data.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchReports();
    fetchStudents();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/teacher/discipline', formData);
      if (res.data.success) {
        toast.success('Report submitted');
        setShowModal(false);
        setFormData({ student: '', title: '', description: '', severity: 'Low' });
        fetchReports();
      }
    } catch (error) {
      toast.error('Failed to submit report');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Discipline Reports</h2>
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Report
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {reports.length > 0 ? (
          reports.map(report => (
            <div key={report._id} className="bg-white dark:bg-card p-6 rounded-xl shadow-sm border border-border">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-600">
                    {report.student?.user?.name?.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{report.student?.user?.name}</h3>
                    <p className="text-xs text-gray-500">{report.student?.rollNumber}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                  report.severity === 'Critical' ? 'bg-red-100 text-red-800' :
                  report.severity === 'High' ? 'bg-orange-100 text-orange-800' :
                  report.severity === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {report.severity}
                </span>
              </div>
              <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">{report.title}</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">{report.description}</p>
              <div className="mt-4 pt-4 border-t border-border flex justify-between items-center text-xs text-gray-500">
                <span>{new Date(report.date).toLocaleDateString()}</span>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-12 text-center text-gray-500 bg-white dark:bg-card rounded-xl border border-dashed border-border">
            <AlertTriangle className="mx-auto h-12 w-12 text-gray-300 mb-3" />
            <p>No discipline reports found.</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-card rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">Create Discipline Report</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Student</label>
                <select 
                  required
                  value={formData.student}
                  onChange={e => setFormData({...formData, student: e.target.value})}
                  className="w-full border rounded-lg px-3 py-2 bg-white dark:bg-input"
                >
                  <option value="">Select Student</option>
                  {students.map(s => <option key={s._id} value={s._id}>{s.user?.name} ({s.rollNumber})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Issue Title</label>
                <input 
                  required
                  type="text" 
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  className="w-full border rounded-lg px-3 py-2 bg-white dark:bg-input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea 
                  required
                  rows="4"
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  className="w-full border rounded-lg px-3 py-2 bg-white dark:bg-input"
                ></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Severity</label>
                <select 
                  value={formData.severity}
                  onChange={e => setFormData({...formData, severity: e.target.value})}
                  className="w-full border rounded-lg px-3 py-2 bg-white dark:bg-input"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90">Submit Report</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Discipline;
