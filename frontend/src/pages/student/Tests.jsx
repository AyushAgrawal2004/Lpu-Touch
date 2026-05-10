import React, { useState, useEffect } from 'react';
import { endpoints } from '../../services/api';
import { FileCode2, ListChecks, Clock, Award, BookOpen, AlertCircle, PlayCircle, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

const Tests = () => {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    endpoints.student.getTests()
      .then(res => { if (res.data.success) setTests(res.data.data); })
      .catch(() => toast.error('Failed to load assessments'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-56 skeleton" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => <div key={i} className="h-72 skeleton" />)}
        </div>
      </div>
    );
  }

  const pending = tests.filter(t => t.attemptStatus === 'not-started').length;
  const completed = tests.filter(t => t.attemptStatus === 'submitted').length;

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="page-header">
        <div>
          <h1 className="page-title">My Assessments</h1>
          <p className="page-subtitle">View and attempt tests scheduled by your instructors.</p>
        </div>
        <div className="flex gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-card rounded-xl border border-border shadow-sm">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span className="text-sm font-medium text-foreground">{pending} Pending</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-card rounded-xl border border-border shadow-sm">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-sm font-medium text-foreground">{completed} Completed</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tests.map((test, index) => {
          const isMcq = test.type === 'mcq';
          const isSubmitted = test.attemptStatus === 'submitted';
          const isInProgress = test.attemptStatus === 'in-progress';

          return (
            <motion.div
              key={test._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.07 }}
              className="bg-white dark:bg-card rounded-2xl border border-border shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col overflow-hidden"
            >
              <div className="h-1 w-full" style={{
                background: isSubmitted
                  ? 'linear-gradient(90deg, #10b981, #059669)'
                  : isMcq
                    ? 'linear-gradient(90deg, #6366f1, #8b5cf6)'
                    : 'linear-gradient(90deg, #f59e0b, #ef4444)'
              }} />

              <div className="p-6 flex flex-col flex-1">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center"
                    style={{ background: isMcq ? '#6366f115' : '#f59e0b15' }}>
                    {isMcq
                      ? <ListChecks className="w-5 h-5" style={{ color: '#6366f1' }} />
                      : <FileCode2 className="w-5 h-5" style={{ color: '#f59e0b' }} />
                    }
                  </div>
                  <div className="flex items-center gap-2">
                    {isSubmitted && (
                      <span className="badge bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                        <CheckCircle2 className="w-3 h-3 mr-1" />Done
                      </span>
                    )}
                    {isInProgress && (
                      <span className="badge bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 animate-pulse">
                        In Progress
                      </span>
                    )}
                    <span className={`badge ${isMcq ? 'bg-indigo-50 text-indigo-700' : 'bg-amber-50 text-amber-700'}`}>
                      {isMcq ? 'MCQ' : 'Coding'}
                    </span>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-foreground mb-1 line-clamp-1">{test.title}</h3>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2 flex-1">
                  {test.description || 'No description provided by the instructor.'}
                </p>

                {isSubmitted && test.score !== null && (
                  <div className="mb-4 p-3 rounded-xl text-center"
                    style={{ background: 'linear-gradient(135deg, #10b98110, #05996910)' }}>
                    <p className="text-xs text-muted-foreground mb-0.5 font-medium uppercase tracking-wider">Your Score</p>
                    <p className="text-2xl font-black text-green-600 dark:text-green-400">
                      {test.score} <span className="text-sm font-normal text-muted-foreground">/ {test.settings?.totalMarks}</span>
                    </p>
                  </div>
                )}

                <div className="space-y-2 pt-4 border-t border-border">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <BookOpen className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{test.subject?.name} <span className="font-mono opacity-60">({test.subject?.code})</span></span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" />{test.settings?.durationMinutes} min</span>
                    <span className="flex items-center gap-1.5"><Award className="w-4 h-4" />{test.settings?.totalMarks} marks</span>
                  </div>
                  {test.settings?.startDate && (
                    <div className="flex items-start gap-2 text-xs text-muted-foreground bg-muted/50 p-2 rounded-lg">
                      <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                      <div>
                        <span>From: {new Date(test.settings.startDate).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                        {test.settings.endDate && <span className="block">To: {new Date(test.settings.endDate).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>}
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-border">
                  {isSubmitted ? (
                    <button disabled className="w-full py-2.5 rounded-xl text-sm font-semibold bg-muted text-muted-foreground cursor-not-allowed flex items-center justify-center gap-2">
                      <CheckCircle2 className="w-4 h-4" /> Completed
                    </button>
                  ) : isInProgress ? (
                    <button
                      onClick={() => window.location.href = `/student-dashboard/tests/${test._id}`}
                      className="w-full py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all"
                      style={{ background: 'linear-gradient(135deg, #f59e0b20, #f9731615)', color: '#f59e0b', border: '1px solid #f59e0b30' }}
                    >
                      <PlayCircle className="w-4 h-4" /> Resume Test
                    </button>
                  ) : (
                    <button
                      onClick={() => window.location.href = `/student-dashboard/tests/${test._id}`}
                      className="btn-primary w-full justify-center py-2.5 text-sm"
                    >
                      <PlayCircle className="w-4 h-4" /> Start Test
                    </button>
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
            <h3 className="text-xl font-bold text-foreground mb-2">No Assessments Scheduled</h3>
            <p className="text-muted-foreground">Your instructors haven't scheduled any tests yet. Enjoy the break!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Tests;
