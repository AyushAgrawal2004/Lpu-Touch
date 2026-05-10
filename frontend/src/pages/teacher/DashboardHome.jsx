import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import useAuthStore from '../../store/authStore';
import { BookOpen, Users, AlertTriangle, FileText, TrendingUp, ArrowUpRight, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const StatCard = ({ title, value, icon: Icon, gradient, index = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay: index * 0.08 }}
    className="relative bg-white dark:bg-card rounded-2xl p-6 border border-border shadow-sm overflow-hidden group hover:-translate-y-1 transition-transform duration-200"
  >
    <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-10"
      style={{ background: `radial-gradient(circle, ${gradient[0]}, ${gradient[1]})` }} />
    <div className="relative">
      <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
        style={{ background: `linear-gradient(135deg, ${gradient[0]}20, ${gradient[1]}15)` }}>
        <Icon className="w-5 h-5" style={{ color: gradient[0] }} />
      </div>
      <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
      <p className="text-3xl font-black tracking-tight text-foreground">{value ?? '—'}</p>
    </div>
  </motion.div>
);

const DashboardHome = () => {
  const { user } = useAuthStore();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/teacher/dashboard')
      .then(res => { if (res.data.success) setStats(res.data.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-48 skeleton rounded-2xl" />
        <div className="grid grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => <div key={i} className="h-36 skeleton" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Hero */}
      <div className="relative overflow-hidden bg-white dark:bg-card rounded-2xl border border-border p-8 shadow-sm">
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, hsl(243 75% 59% / 0.08) 0%, hsl(280 70% 55% / 0.05) 100%)' }} />
        <div className="absolute right-0 top-0 w-72 h-72 opacity-[0.06]"
          style={{ background: 'radial-gradient(circle at top right, hsl(243 75% 59%), transparent 70%)' }} />
        <div className="relative">
          <h1 className="text-3xl font-black tracking-tight text-foreground mb-1">
            Welcome, {user?.name?.split(' ')[0]}! 🏫
          </h1>
          <p className="text-muted-foreground">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} · Faculty Dashboard
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        <StatCard index={0} title="Subjects Teaching" value={stats?.totalSubjects} icon={BookOpen} gradient={['#6366f1', '#8b5cf6']} />
        <StatCard index={1} title="Total Students" value={stats?.totalStudents} icon={Users} gradient={['#3b82f6', '#2563eb']} />
        <StatCard index={2} title="Files Shared" value={stats?.recentFiles?.length || 0} icon={FileText} gradient={['#f59e0b', '#f97316']} />
        <StatCard index={3} title="Discipline Reports" value={stats?.recentReports?.length || 0} icon={AlertTriangle} gradient={['#ef4444', '#f97316']} />
      </div>

      {/* Bottom panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="bg-white dark:bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <FileText className="w-4 h-4 text-amber-500" />
              </div>
              <h3 className="font-bold text-foreground">Recent Shared Files</h3>
            </div>
          </div>
          <div className="p-4">
            {stats?.recentFiles?.length > 0 ? (
              <ul className="space-y-2">
                {stats.recentFiles.map(file => (
                  <li key={file._id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted transition-colors group">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <p className="font-semibold text-sm text-foreground truncate">{file.title}</p>
                      <p className="text-xs text-muted-foreground">{file.subject?.name}</p>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </li>
                ))}
              </ul>
            ) : (
              <div className="py-8 text-center text-muted-foreground text-sm">No recent files uploaded.</div>
            )}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="bg-white dark:bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4 text-red-500" />
              </div>
              <h3 className="font-bold text-foreground">Recent Discipline Reports</h3>
            </div>
          </div>
          <div className="p-4">
            {stats?.recentReports?.length > 0 ? (
              <ul className="space-y-2">
                {stats.recentReports.map(report => (
                  <li key={report._id} className="flex items-start gap-3 p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/40">
                    <AlertTriangle className={`w-4 h-4 mt-0.5 flex-shrink-0 ${['High', 'Critical'].includes(report.severity) ? 'text-red-500' : 'text-yellow-500'}`} />
                    <div>
                      <p className="font-semibold text-sm text-red-700 dark:text-red-300">{report.title}</p>
                      <p className="text-xs text-muted-foreground">{report.student?.user?.name}</p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="py-8 text-center flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-500" />
                </div>
                <p className="font-semibold text-green-600 dark:text-green-400">All Clear!</p>
                <p className="text-xs text-muted-foreground">No recent discipline reports.</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default DashboardHome;
