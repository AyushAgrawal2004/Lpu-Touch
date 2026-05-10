import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Lock, Mail, GraduationCap, Briefcase, Phone, Hash, Building, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';
import useAuthStore from '../store/authStore';
import api from '../services/api';
import { motion } from 'framer-motion';

const Register = () => {
  const [role, setRole] = useState('student');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    department: '',
    // Student specific
    rollNumber: '',
    batch: '',
    // Teacher specific
    employeeId: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const payload = { ...formData, role };
      const response = await api.post('/auth/register', payload);

      if (response.data.success) {
        toast.success('Registration successful!');
        login(response.data.user, response.data.token);
        navigate(`/${role}-dashboard`);
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-background py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative background blobs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full space-y-8 bg-white dark:bg-card p-10 rounded-2xl shadow-xl z-10 border border-border"
      >
        <div>
          <div className="mx-auto h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
            <GraduationCap className="h-6 w-6 text-primary" />
          </div>
          <h2 className="mt-4 text-center text-3xl font-extrabold text-gray-900 dark:text-foreground">
            Create Account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-muted-foreground">
            Register as a Student or Teacher
          </p>
        </div>

        {/* Role Selection */}
        <div className="flex rounded-lg shadow-sm">
          <button
            type="button"
            onClick={() => setRole('student')}
            className={`flex-1 flex items-center justify-center py-2 text-sm font-medium rounded-l-lg border-y border-l transition-colors ${
              role === 'student' 
                ? 'bg-primary text-primary-foreground border-primary' 
                : 'bg-white dark:bg-card text-gray-700 dark:text-gray-300 border-gray-300 dark:border-border hover:bg-gray-50 dark:hover:bg-accent'
            }`}
          >
            <User className="w-4 h-4 mr-2" /> Student
          </button>
          <button
            type="button"
            onClick={() => setRole('teacher')}
            className={`flex-1 flex items-center justify-center py-2 text-sm font-medium rounded-r-lg border-y border-r transition-colors ${
              role === 'teacher' 
                ? 'bg-primary text-primary-foreground border-primary' 
                : 'bg-white dark:bg-card text-gray-700 dark:text-gray-300 border-gray-300 dark:border-border hover:bg-gray-50 dark:hover:bg-accent'
            }`}
          >
            <Briefcase className="w-4 h-4 mr-2" /> Teacher
          </button>
        </div>

        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none"><User className="h-4 w-4 text-gray-400" /></div>
                <input required type="text" name="name" className="w-full pl-8 pr-3 py-2 border border-gray-300 dark:border-border rounded-lg bg-white dark:bg-input text-sm" placeholder="John Doe" onChange={handleChange} />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none"><Mail className="h-4 w-4 text-gray-400" /></div>
                <input required type="email" name="email" className="w-full pl-8 pr-3 py-2 border border-gray-300 dark:border-border rounded-lg bg-white dark:bg-input text-sm" placeholder="john@lpu.edu" onChange={handleChange} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none"><Lock className="h-4 w-4 text-gray-400" /></div>
                <input required type="password" name="password" className="w-full pl-8 pr-3 py-2 border border-gray-300 dark:border-border rounded-lg bg-white dark:bg-input text-sm" placeholder="••••••" onChange={handleChange} />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none"><Phone className="h-4 w-4 text-gray-400" /></div>
                <input required type="tel" name="phone" className="w-full pl-8 pr-3 py-2 border border-gray-300 dark:border-border rounded-lg bg-white dark:bg-input text-sm" placeholder="9876543210" onChange={handleChange} />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Department</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none"><Building className="h-4 w-4 text-gray-400" /></div>
              <input required type="text" name="department" className="w-full pl-8 pr-3 py-2 border border-gray-300 dark:border-border rounded-lg bg-white dark:bg-input text-sm" placeholder="Computer Science" onChange={handleChange} />
            </div>
          </div>

          {role === 'student' ? (
            <div className="grid grid-cols-2 gap-4 border-t border-border pt-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Roll Number</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none"><Hash className="h-4 w-4 text-gray-400" /></div>
                  <input required type="text" name="rollNumber" className="w-full pl-8 pr-3 py-2 border border-gray-300 dark:border-border rounded-lg bg-white dark:bg-input text-sm" placeholder="R12345" onChange={handleChange} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Batch Year</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none"><Calendar className="h-4 w-4 text-gray-400" /></div>
                  <input required type="text" name="batch" className="w-full pl-8 pr-3 py-2 border border-gray-300 dark:border-border rounded-lg bg-white dark:bg-input text-sm" placeholder="2024" onChange={handleChange} />
                </div>
              </div>
            </div>
          ) : (
            <div className="border-t border-border pt-4">
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Employee ID</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none"><Hash className="h-4 w-4 text-gray-400" /></div>
                <input required type="text" name="employeeId" className="w-full pl-8 pr-3 py-2 border border-gray-300 dark:border-border rounded-lg bg-white dark:bg-input text-sm" placeholder="EMP001" onChange={handleChange} />
              </div>
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-md"
            >
              {isLoading ? 'Creating Account...' : 'Register'}
            </button>
          </div>
          
          <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-4">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-primary hover:text-primary/80 transition-colors">
              Sign in here
            </Link>
          </p>
        </form>
      </motion.div>
    </div>
  );
};

export default Register;
