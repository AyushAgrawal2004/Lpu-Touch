import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { FileText, Trash2, UploadCloud } from 'lucide-react';

const Files = () => {
  const [files, setFiles] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    fetchFiles();
    fetchSubjects();
  }, []);

  const fetchFiles = async () => {
    try {
      const res = await api.get('/teacher/files');
      if (res.data.success) setFiles(res.data.data);
    } catch (error) {
      toast.error('Failed to load files');
    }
  };

  const fetchSubjects = async () => {
    try {
      const res = await api.get('/teacher/subjects');
      if (res.data.success) setSubjects(res.data.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile || !selectedSubject || !title) {
      return toast.error('Please fill all required fields');
    }

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('title', title);
    formData.append('description', description);
    formData.append('subjectId', selectedSubject);

    setIsUploading(true);
    try {
      const res = await api.post('/teacher/files', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.success) {
        toast.success('File uploaded successfully');
        setTitle('');
        setDescription('');
        setSelectedFile(null);
        setSelectedSubject('');
        fetchFiles();
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this file?')) {
      try {
        const res = await api.delete(`/teacher/files/${id}`);
        if (res.data.success) {
          toast.success('File deleted');
          fetchFiles();
        }
      } catch (error) {
        toast.error('Failed to delete file');
      }
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Study Materials</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-card p-6 rounded-xl shadow-sm border border-border">
            <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">Upload New File</h3>
            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Subject *</label>
                <select 
                  required
                  value={selectedSubject}
                  onChange={e => setSelectedSubject(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 bg-white dark:bg-input"
                >
                  <option value="">Select Subject</option>
                  {subjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Title *</label>
                <input 
                  required
                  type="text" 
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 bg-white dark:bg-input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea 
                  rows="2"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 bg-white dark:bg-input"
                ></textarea>
              </div>
              
              <div className="border-2 border-dashed border-gray-300 dark:border-border rounded-lg p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gray-50 dark:hover:bg-accent transition-colors relative">
                <input 
                  type="file" 
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  required
                />
                <UploadCloud className="w-10 h-10 text-gray-400 mb-2" />
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {selectedFile ? selectedFile.name : 'Click or drag file to this area to upload'}
                </p>
                <p className="text-xs text-gray-500 mt-1">Support for a single or bulk upload.</p>
              </div>

              <button 
                type="submit" 
                disabled={isUploading}
                className="w-full bg-primary text-white py-2 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-70"
              >
                {isUploading ? 'Uploading...' : 'Upload File'}
              </button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-card rounded-xl shadow-sm border border-border overflow-hidden">
            <div className="p-4 border-b border-border bg-gray-50 dark:bg-accent">
              <h3 className="font-semibold text-gray-900 dark:text-white">Uploaded Files</h3>
            </div>
            {files.length > 0 ? (
              <ul className="divide-y divide-border">
                {files.map(file => (
                  <li key={file._id} className="p-4 hover:bg-gray-50 dark:hover:bg-accent/50 transition-colors flex items-center justify-between">
                    <div className="flex items-start space-x-3">
                      <div className="p-2 bg-primary/10 rounded-lg text-primary mt-1">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <a href={file.fileUrl} target="_blank" rel="noreferrer" className="font-medium text-gray-900 dark:text-white hover:text-primary transition-colors">
                          {file.title}
                        </a>
                        <p className="text-sm text-gray-500 mb-1">{file.subject?.name}</p>
                        {file.description && <p className="text-xs text-gray-400">{file.description}</p>}
                      </div>
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      <span className="text-xs text-gray-500">{new Date(file.uploadedAt).toLocaleDateString()}</span>
                      <button 
                        onClick={() => handleDelete(file._id)}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete file"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-8 text-center text-gray-500">
                No files uploaded yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Files;
