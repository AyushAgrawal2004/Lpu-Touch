import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { FileText, Download, Search, Filter } from 'lucide-react';

const Files = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('All');

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const res = await api.get('/student/files');
        if (res.data.success) {
          setFiles(res.data.data);
        }
      } catch (error) {
        console.error('Error fetching files', error);
      } finally {
        setLoading(false);
      }
    };
    fetchFiles();
  }, []);

  const uniqueSubjects = ['All', ...new Set(files.map(f => f.subject?.name).filter(Boolean))];

  const filteredFiles = files.filter(file => {
    const matchesSearch = file.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (file.description && file.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesSubject = selectedSubject === 'All' || file.subject?.name === selectedSubject;
    return matchesSearch && matchesSubject;
  });

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Study Materials</h2>
      <p className="text-gray-500 text-sm">Access and download files shared by your teachers for enrolled subjects.</p>

      <div className="flex flex-col md:flex-row gap-4 bg-white dark:bg-card p-4 rounded-xl shadow-sm border border-border">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search by title or description..."
            className="pl-10 w-full rounded-lg border border-gray-300 dark:border-border px-3 py-2 bg-white dark:bg-input focus:ring-primary focus:border-primary transition-shadow"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="relative w-full md:w-64 flex items-center">
          <Filter className="absolute left-3 w-4 h-4 text-gray-400 pointer-events-none" />
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="pl-10 w-full rounded-lg border border-gray-300 dark:border-border px-3 py-2 bg-white dark:bg-input appearance-none focus:ring-primary focus:border-primary transition-shadow"
          >
            {uniqueSubjects.map(sub => (
              <option key={sub} value={sub}>{sub}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-gray-500">Loading materials...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredFiles.length > 0 ? (
            filteredFiles.map(file => (
              <div key={file._id} className="bg-white dark:bg-card rounded-xl shadow-sm border border-border flex flex-col hover:shadow-md transition-shadow group overflow-hidden">
                <div className="p-5 flex-1">
                  <div className="flex items-start justify-between">
                    <div className="p-3 bg-primary/10 rounded-lg text-primary mb-4 group-hover:scale-110 transition-transform">
                      <FileText className="w-8 h-8" />
                    </div>
                    <span className="text-xs font-medium px-2.5 py-1 bg-gray-100 dark:bg-accent text-gray-600 dark:text-gray-300 rounded-full border border-border">
                      {file.subject?.code || 'GEN'}
                    </span>
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-white mb-2 line-clamp-2" title={file.title}>{file.title}</h3>
                  <p className="text-sm text-gray-500 mb-4 line-clamp-2">{file.description || 'No description provided.'}</p>
                  
                  <div className="text-xs text-gray-400 space-y-1">
                    <p>Uploaded by: <span className="font-medium text-gray-600 dark:text-gray-300">{file.teacher?.user?.name}</span></p>
                    <p>Date: {new Date(file.uploadedAt).toLocaleDateString()}</p>
                  </div>
                </div>
                
                <a 
                  href={`http://localhost:5555${file.fileUrl}`} 
                  target="_blank" 
                  rel="noreferrer"
                  className="bg-gray-50 dark:bg-accent/50 p-3 text-sm font-medium text-primary hover:bg-primary hover:text-white transition-colors flex items-center justify-center border-t border-border"
                  download
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download File
                </a>
              </div>
            ))
          ) : (
            <div className="col-span-full py-16 text-center bg-white dark:bg-card rounded-xl border border-dashed border-border text-gray-500">
              <FileText className="w-12 h-12 mx-auto text-gray-300 mb-4" />
              <p className="text-lg font-medium text-gray-900 dark:text-white mb-1">No files found</p>
              <p>Try adjusting your search or filter criteria.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Files;
