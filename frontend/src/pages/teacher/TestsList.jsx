import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { endpoints } from '../../services/api';
import { FileCode2, ListChecks, Plus, Clock, Award, BookOpen, Trash2, CalendarClock } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

const TestsList = () => {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchTests = async () => {
    try {
      const res = await endpoints.teacher.getTests();
      if (res.data.success) setTests(res.data.data);
    } catch { toast.error('Failed to load tests'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchTests(); }, []);

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Delete this test? This cannot be undone.')) return;
    try {
      const res = await endpoints.teacher.deleteTest(id);
      if (res.data.success) { toast.success('Test deleted'); fetchTests(); }
    } catch { toast.error('Failed to delete test'); }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between"><div className="h-8 w-48 skeleton" /><div className="h-10 w-36 skeleton" /></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => <div key={i} className="h-64 skeleton" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="page-header">
        <div>
          <h1 className="page-title">Assessments & Tests</h1>
          <p className="page-subtitle">Create and manage MCQ and Coding challenges for your students.</p>
        </div>
        <button className="btn-primary" onClick={() => navigate('/teacher-dashboard/tests/create')}>
          <Plus className="w-4 h-4" />
          Create New Test
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tests.map((test, index) => {
          const isMcq = test.type === 'mcq';
          const isScheduled = !!test.settings?.startDate;
          const now = new Date();
          const isActive = isScheduled
            && now >= new Date(test.settings.startDate)
            && (!test.settings.endDate || now <= new Date(test.settings.endDate));

          return (
            <motion.div
              key={test._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.07 }}
              className="bg-white dark:bg-card rounded-2xl border border-border shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 flex flex-col overflow-hidden group"
            >
              {/* Card header gradient strip */}
              <div className="h-1 w-full" style={{
                background: isMcq
                  ? 'linear-gradient(90deg, #6366f1, #8b5cf6)'
                  : 'linear-gradient(90deg, #f59e0b, #ef4444)'
              }} />

              <div className="p-6 flex flex-col flex-1">
                <div className="flex justify-between items-start mb-4">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center"
                    style={{
                      background: isMcq
                        ? 'linear-gradient(135deg, #6366f120, #8b5cf615)'
                        : 'linear-gradient(135deg, #f59e0b20, #ef444415)'
                    }}
                  >
                    {isMcq
                      ? <ListChecks className="w-5 h-5" style={{ color: '#6366f1' }} />
                      : <FileCode2 className="w-5 h-5" style={{ color: '#f59e0b' }} />
                    }
                  </div>
                  <div className="flex items-center gap-2">
                    {isActive && (
                      <span className="badge bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block mr-1 animate-pulse" />
                        Live
                      </span>
                    )}
                    <span className={`badge ${isMcq ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400' : 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'}`}>
                      {isMcq ? 'MCQ' : 'Coding'}
                    </span>
                    <button
                      onClick={(e) => handleDelete(test._id, e)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-foreground mb-1 line-clamp-1">{test.title}</h3>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2 flex-1">
                  {test.description || 'No description provided.'}
                </p>

                <div className="space-y-2 pt-4 border-t border-border">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <BookOpen className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{test.subject?.name} <span className="font-mono opacity-70">({test.subject?.code})</span></span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4 flex-shrink-0" />
                    <span>{test.settings?.durationMinutes} Minutes</span>
                    <span className="mx-1 opacity-30">·</span>
                    <Award className="w-4 h-4 flex-shrink-0" />
                    <span>{test.settings?.totalMarks} Marks</span>
                  </div>
                  {isScheduled && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/60 p-2 rounded-lg">
                      <CalendarClock className="w-3.5 h-3.5 flex-shrink-0" />
                      <div>
                        <span>{new Date(test.settings.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                        {test.settings.endDate && (
                          <span> → {new Date(test.settings.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}

        {tests.length === 0 && (
          <div className="col-span-full empty-state">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
              <ListChecks className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">No Assessments Yet</h3>
            <p className="text-muted-foreground mb-6 max-w-sm">You haven't created any tests. Start by creating an MCQ quiz or a Coding challenge.</p>
            <button className="btn-primary" onClick={() => navigate('/teacher-dashboard/tests/create')}>
              <Plus className="w-4 h-4" /> Create Your First Test
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TestsList;
