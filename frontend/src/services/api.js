import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
});

// Add a request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const endpoints = {
  student: {
    getDashboard: () => api.get('/student/dashboard'),
    getAttendance: () => api.get('/student/attendance'),
    getDiscipline: () => api.get('/student/discipline'),
    getFiles: () => api.get('/student/files'),
    getTests: () => api.get('/student/tests'),
    getTestDetails: (id) => api.get(`/student/tests/${id}`),
    startTest: (id) => api.post(`/student/tests/${id}/start`),
    submitTest: (id, payload) => api.post(`/student/tests/${id}/submit`, payload),
  },
  admin: {
    getSubjects: () => api.get('/admin/subjects'),
    getTeachers: () => api.get('/admin/teachers'),
    getStudents: () => api.get('/admin/students'),
    createSubject: (data) => api.post('/admin/subject', data),
    assignStudent: (data) => api.post('/admin/assign-student', data),
    createTimetable: (data) => api.post('/admin/timetable', data),
  },
  teacher: {
    getTests: () => api.get('/teacher/test'),
    createTest: (data) => api.post('/teacher/test', data),
    deleteTest: (id) => api.delete(`/teacher/test/${id}`),
  }
};

export default api;
