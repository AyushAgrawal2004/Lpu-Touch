import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Mail, GraduationCap, User, Briefcase, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import useAuthStore from '../store/authStore';
import api from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';

const Login = () => {
  const [role, setRole] = useState('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const login = useAuthStore(state => state.login);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return toast.error('Please fill in all fields');

    setIsLoading(true);
    try {
      const res = await api.post('/auth/login', { email: email.trim().toLowerCase(), password, role });
      if (res.data.success) {
        toast.success('Welcome back! 👋');
        login(res.data.user, res.data.token);
        navigate(`/${role}-dashboard`);
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex overflow-hidden" style={{ background: 'hsl(243 60% 7%)' }}>
      {/* Left Panel - Brand */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col items-center justify-center p-16 overflow-hidden">
        {/* Background blobs */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-96 h-96 rounded-full animate-blob"
            style={{ background: 'radial-gradient(circle, hsl(243 75% 59% / 0.3), transparent 70%)' }} />
          <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full animate-blob animation-delay-2000"
            style={{ background: 'radial-gradient(circle, hsl(280 70% 55% / 0.25), transparent 70%)' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full"
            style={{ background: 'radial-gradient(circle, hsl(243 75% 30% / 0.4), transparent 70%)' }} />
        </div>

        <div className="relative z-10 text-center">
          {/* Logo */}
          <div className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-8"
            style={{ background: 'linear-gradient(135deg, hsl(243 75% 59%), hsl(280 70% 55%))' }}>
            <GraduationCap className="w-10 h-10 text-white" />
          </div>

          <h1 className="text-5xl font-black text-white mb-4 tracking-tight">
            LPU Touch
          </h1>
          <p className="text-xl font-light mb-12" style={{ color: 'hsl(220 20% 70%)' }}>
            Your Complete Campus<br />Management Portal
          </p>

          {/* Feature bullets */}
          <div className="space-y-4 text-left max-w-xs mx-auto">
            {[
              '📊 Live attendance tracking',
              '📝 Smart assessment system',
              '📚 Digital study materials',
              '🗓️ Timetable management',
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.1 }}
                className="flex items-center gap-3 px-4 py-3 rounded-xl"
                style={{ background: 'hsl(243 50% 20% / 0.5)', border: '1px solid hsl(243 50% 30% / 0.3)' }}
              >
                <span className="text-base">{item.split(' ')[0]}</span>
                <span className="text-sm font-medium" style={{ color: 'hsl(220 20% 80%)' }}>
                  {item.split(' ').slice(1).join(' ')}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8"
        style={{ background: 'hsl(220 20% 97%)' }}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3"
              style={{ background: 'linear-gradient(135deg, hsl(243 75% 59%), hsl(280 70% 55%))' }}>
              <GraduationCap className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-black text-foreground">LPU Touch</h1>
          </div>

          <h2 className="text-3xl font-black text-foreground mb-1">Sign In</h2>
          <p className="text-muted-foreground mb-8">
            Access your personalized campus portal
          </p>

          {/* Role Selector */}
          <div className="flex gap-3 mb-8">
            {[
              { value: 'student', label: 'Student', icon: User },
              { value: 'teacher', label: 'Faculty', icon: Briefcase },
            ].map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                type="button"
                onClick={() => setRole(value)}
                className="flex-1 flex flex-col items-center gap-2 py-4 rounded-2xl border-2 transition-all duration-200"
                style={{
                  background: role === value ? 'linear-gradient(135deg, hsl(243 75% 59% / 0.1), hsl(280 70% 55% / 0.07))' : 'white',
                  borderColor: role === value ? 'hsl(243 75% 59%)' : 'hsl(var(--border))',
                  boxShadow: role === value ? '0 0 0 4px hsl(243 75% 59% / 0.1)' : 'none',
                }}
              >
                <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: role === value ? 'linear-gradient(135deg, hsl(243 75% 59%), hsl(280 70% 55%))' : 'hsl(var(--muted))' }}>
                  <Icon className={`w-4.5 h-4.5 ${role === value ? 'text-white' : 'text-muted-foreground'}`} style={{ width: '1.1rem', height: '1.1rem' }} />
                </div>
                <span className={`text-sm font-bold ${role === value ? 'text-primary' : 'text-muted-foreground'}`}>{label}</span>
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-foreground" style={{ width: '1.1rem', height: '1.1rem' }} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-border bg-white focus:outline-none focus:ring-2 focus:border-primary text-foreground text-sm transition-all"
                  style={{ '--tw-ring-color': 'hsl(243 75% 59% / 0.2)' }}
                  placeholder={role === 'student' ? 'alice@lpu.edu' : 'jane@lpu.edu'}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-foreground" style={{ width: '1.1rem', height: '1.1rem' }} />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-border bg-white focus:outline-none focus:ring-2 focus:border-primary text-foreground text-sm transition-all"
                  placeholder="password123"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full justify-center py-4 text-base rounded-2xl"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Signing in...
                </span>
              ) : (
                <>Sign In <Sparkles className="w-4 h-4" /></>
              )}
            </button>
          </form>

          {/* Quick credentials hint */}
          <div className="mt-6 p-4 rounded-2xl bg-blue-50 border border-blue-100">
            <p className="text-xs font-bold text-blue-700 mb-2">🔑 Demo Credentials</p>
            <div className="text-xs text-blue-600 space-y-1">
              <p><strong>Student:</strong> alice@lpu.edu · password123</p>
              <p><strong>Teacher:</strong> jane@lpu.edu · password123</p>
              <p><strong>Admin:</strong> admin@lpu.edu · password123 (Teacher)</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
