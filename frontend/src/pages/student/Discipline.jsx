import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { AlertTriangle, Clock } from 'lucide-react';

const Discipline = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await api.get('/student/discipline');
        if (res.data.success) {
          setReports(res.data.data);
        }
      } catch (error) {
        console.error('Error fetching reports', error);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  if (loading) return <div className="p-8 text-center text-gray-500">Loading notices...</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Disciplinary Notices</h2>
      <p className="text-gray-500 text-sm">Official disciplinary actions and notices filed by your teachers.</p>

      {reports.length > 0 ? (
        <div className="space-y-4">
          {reports.map((report) => (
            <div 
              key={report._id} 
              className={`bg-white dark:bg-card p-6 rounded-xl shadow-sm border-l-4 border-y border-r border-border transition-all hover:shadow-md ${
                report.severity === 'Critical' ? 'border-l-red-500' :
                report.severity === 'High' ? 'border-l-orange-500' :
                report.severity === 'Medium' ? 'border-l-yellow-500' :
                'border-l-blue-500'
              }`}
            >
              <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className={`px-2.5 py-0.5 text-xs font-bold rounded-md ${
                      report.severity === 'Critical' ? 'bg-red-100 text-red-800' :
                      report.severity === 'High' ? 'bg-orange-100 text-orange-800' :
                      report.severity === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {report.severity} Severity
                    </span>
                    <span className="text-sm font-medium text-gray-500 flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {new Date(report.date).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{report.title}</h3>
                  <p className="text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-accent p-4 rounded-lg text-sm border border-border">
                    {report.description}
                  </p>
                </div>
                
                <div className="md:w-48 p-4 bg-gray-50 dark:bg-accent rounded-lg border border-border shrink-0 self-start">
                  <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Reported By</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{report.teacher?.user?.name || 'Unknown Teacher'}</p>
                  {report.subject && (
                    <>
                      <p className="text-xs text-gray-500 uppercase font-semibold mt-3 mb-1">Subject</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{report.subject?.name}</p>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-16 text-center text-gray-500 bg-white dark:bg-card rounded-xl border border-dashed border-border flex flex-col items-center">
          <div className="w-16 h-16 bg-green-50 dark:bg-green-900/20 text-green-500 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Excellent Conduct</h3>
          <p>You have no disciplinary notices on your record.</p>
        </div>
      )}
    </div>
  );
};

export default Discipline;
