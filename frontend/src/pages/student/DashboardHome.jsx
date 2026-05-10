import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import useAuthStore from '../../store/authStore';
import { BookOpen, Calendar, AlertTriangle, FileText, TrendingUp, AlertCircle, ArrowUpRight, Users } from 'lucide-react';
import { motion } from 'framer-motion';

const StatCard = ({ title, value, icon: Icon, gradient, suffix = '', index = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay: index * 0.08 }}
    className="relative bg-white dark:bg-card rounded-2xl p-6 border border-border shadow-sm overflow-hidden group hover:-translate-y-1 transition-transform duration-200"
  >
    <div
      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
      style={{ background: `linear-gradient(135deg, ${gradient[0]}08 0%, ${gradient[1]}05 100%)` }}
    />
    {/* Decorative orb */}
    <div
      className="absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-10"
      style={{ background: `radial-gradient(circle, ${gradient[0]}, ${gradient[1]})` }}
    />
    <div className="relative">
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
        style={{ background: `linear-gradient(135deg, ${gradient[0]}20, ${gradient[1]}15)` }}
      >
        <Icon className="w-5 h-5" style={{ color: gradient[0] }} />
      </div>
      <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
      <p className="text-3xl font-black tracking-tight text-foreground">
        {value ?? '—'}{suffix}
      </p>
    </div>
  </motion.div>
);

const DashboardHome = () => {
  const { user } = useAuthStore();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/student/dashboard')
      .then(res => { if (res.data.success) setStats(res.data.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 skeleton" />
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-36 skeleton" />
          ))}
        </div>
      </div>
    );
  }

  const attendance = parseFloat(stats?.overallAttendance || 0);
  const attendanceWarning = attendance < 75;

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Hero Header */}
      <div className="relative overflow-hidden bg-white dark:bg-card rounded-2xl border border-border p-8 shadow-sm">
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(135deg, hsl(243 75% 59% / 0.08) 0%, hsl(280 70% 55% / 0.05) 100%)'
        }} />
        <div className="absolute right-0 top-0 w-64 h-64 opacity-[0.07]" style={{
          background: 'radial-gradient(circle at top right, hsl(243 75% 59%), transparent 70%)'
        }} />
        <div className="relative">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black tracking-tight text-foreground mb-1">
                Welcome back, {user?.name?.split(' ')[0]}! 🎓
              </h1>
              <p className="text-muted-foreground">
                Here's your academic overview for today —{' '}
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </p>
            </div>
            <div className="flex-shrink-0 hidden md:block">
              <div className="text-right">
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Attendance</p>
                <p className={`text-4xl font-black ${attendanceWarning ? 'text-red-500' : 'text-green-500'}`}>
                  {attendance}%
                </p>
              </div>
            </div>
          </div>

          {attendanceWarning && (
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-5 flex items-start gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50"
            >
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-red-700 dark:text-red-300">Attendance Below 75%</p>
                <p className="text-sm text-red-600 dark:text-red-400">
                  Your current aggregate attendance is <strong>{attendance}%</strong>. You need at least 75% to be eligible for exams.
                </p>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        <StatCard index={0} title="Overall Attendance" value={attendance} suffix="%" icon={TrendingUp}
          gradient={attendanceWarning ? ['#ef4444', '#f97316'] : ['#10b981', '#059669']} />
        <StatCard index={1} title="Enrolled Subjects" value={stats?.totalSubjects} icon={BookOpen}
          gradient={['#6366f1', '#8b5cf6']} />
        <StatCard index={2} title="Classes Attended" value={stats?.presentClasses}
          icon={Users} gradient={['#3b82f6', '#2563eb']} />
        <StatCard index={3} title="Study Materials" value={stats?.recentMaterials?.length || 0}
          icon={FileText} gradient={['#f59e0b', '#f97316']} />
      </div>

      {/* Bottom Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Materials */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="bg-white dark:bg-card rounded-2xl border border-border shadow-sm overflow-hidden"
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <FileText className="w-4 h-4 text-amber-500" />
              </div>
              <h3 className="font-bold text-foreground">Study Materials</h3>
            </div>
            <span className="text-xs text-muted-foreground">{stats?.recentMaterials?.length || 0} files</span>
          </div>
          <div className="p-4">
            {stats?.recentMaterials?.length > 0 ? (
              <ul className="space-y-2">
                {stats.recentMaterials.map(file => (
                  <li key={file._id}>
                    <a
                      href={`http://localhost:5555${file.fileUrl}`}
                      target="_blank" rel="noreferrer"
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted transition-colors group"
                    >
                      <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <FileText className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <p className="font-semibold text-sm text-foreground truncate group-hover:text-primary transition-colors">{file.title}</p>
                        <p className="text-xs text-muted-foreground">{file.subject?.name} · {file.teacher?.user?.name}</p>
                      </div>
                      <ArrowUpRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="py-8 text-center text-muted-foreground text-sm">No study materials uploaded yet.</div>
            )}
          </div>
        </motion.div>

        {/* Discipline Notices */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="bg-white dark:bg-card rounded-2xl border border-border shadow-sm overflow-hidden"
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4 text-red-500" />
              </div>
              <h3 className="font-bold text-foreground">Disciplinary Notices</h3>
            </div>
            <span className="text-xs text-muted-foreground">{stats?.recentNotices?.length || 0} notices</span>
          </div>
          <div className="p-4">
            {stats?.recentNotices?.length > 0 ? (
              <ul className="space-y-2">
                {stats.recentNotices.map(r => (
                  <li key={r._id} className="flex items-start gap-3 p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/40">
                    <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-sm text-red-700 dark:text-red-300">{r.title}</p>
                      <p className="text-xs text-red-500">{new Date(r.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="py-8 text-center flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                </div>
                <p className="font-semibold text-green-600 dark:text-green-400">Clean Record!</p>
                <p className="text-xs text-muted-foreground">No disciplinary notices found. Keep it up!</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default DashboardHome;
