import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Cell, PieChart, Pie, ResponsiveContainer, Tooltip } from 'recharts';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';

const Attendance = () => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/student/attendance')
      .then(res => { if (res.data.success) setAttendanceData(res.data.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 skeleton" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => <div key={i} className="h-72 skeleton" />)}
        </div>
      </div>
    );
  }

  const overall = attendanceData.length
    ? (attendanceData.reduce((s, d) => s + parseFloat(d.percentage), 0) / attendanceData.length).toFixed(1)
    : 0;

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Attendance Overview</h1>
          <p className="page-subtitle">Your subject-wise class attendance breakdown</p>
        </div>
        <div className="flex items-center gap-3 px-5 py-3 bg-white dark:bg-card rounded-2xl border border-border shadow-sm">
          <TrendingUp className={`w-5 h-5 ${overall >= 75 ? 'text-green-500' : 'text-red-500'}`} />
          <div>
            <p className="text-xs text-muted-foreground font-medium">Overall Average</p>
            <p className={`text-2xl font-black ${overall >= 75 ? 'text-green-500' : 'text-red-500'}`}>
              {overall}%
            </p>
          </div>
        </div>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {attendanceData.map((item, index) => {
          const pct = parseFloat(item.percentage);
          const isLow = pct < 75;
          const chartData = [
            { name: 'Present', value: item.presentClasses, color: isLow ? '#ef4444' : '#10b981' },
            { name: 'Absent',  value: item.absentClasses,  color: isLow ? '#fee2e2' : '#d1fae5' },
          ];

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.07 }}
              className="bg-white dark:bg-card rounded-2xl border border-border shadow-sm overflow-hidden"
            >
              {/* Color top bar */}
              <div className="h-1.5 w-full" style={{
                background: isLow
                  ? 'linear-gradient(90deg, #ef4444, #f97316)'
                  : `linear-gradient(90deg, #10b981, #059669)`,
                width: `${pct}%`
              }} />
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-bold text-foreground text-base leading-tight">{item.subjectName}</h3>
                    <p className="text-xs font-mono text-muted-foreground mt-0.5 bg-muted inline-block px-2 py-0.5 rounded-md">{item.subjectCode}</p>
                  </div>
                  <span className={`badge ${isLow ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300' : 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300'}`}>
                    {pct}%
                  </span>
                </div>

                {/* Donut chart */}
                <div className="relative h-36 my-4">
                  {item.totalClasses > 0 ? (
                    <>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={chartData} cx="50%" cy="50%" innerRadius={42} outerRadius={58} paddingAngle={4} dataKey="value" startAngle={90} endAngle={-270}>
                            {chartData.map((entry, i) => <Cell key={i} fill={entry.color} strokeWidth={0} />)}
                          </Pie>
                          <Tooltip formatter={(val, name) => [`${val} Classes`, name]} contentStyle={{ borderRadius: '0.75rem', border: 'none', boxShadow: '0 4px 24px rgba(0,0,0,0.1)' }} />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
                        {isLow
                          ? <TrendingDown className="w-4 h-4 text-red-400 mb-0.5" />
                          : <TrendingUp className="w-4 h-4 text-green-400 mb-0.5" />
                        }
                        <span className={`text-xl font-black ${isLow ? 'text-red-500' : 'text-green-500'}`}>{pct}%</span>
                      </div>
                    </>
                  ) : (
                    <div className="h-full flex items-center justify-center text-sm text-muted-foreground">No classes held yet</div>
                  )}
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-3 gap-2 pt-4 border-t border-border text-center text-xs">
                  {[
                    { label: 'Total', value: item.totalClasses, color: 'text-foreground' },
                    { label: 'Present', value: item.presentClasses, color: 'text-green-600' },
                    { label: 'Absent',  value: item.absentClasses,  color: 'text-red-500' },
                  ].map(({ label, value, color }) => (
                    <div key={label}>
                      <p className="text-muted-foreground mb-1">{label}</p>
                      <p className={`font-bold text-sm ${color}`}>{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default Attendance;
