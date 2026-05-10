import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Calendar, Clock, MapPin, User as UserIcon, BookOpen } from 'lucide-react';
import useAuthStore from '../../store/authStore';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const TimetableView = () => {
  const [timetable, setTimetable] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();

  useEffect(() => {
    const fetchTimetable = async () => {
      try {
        const res = await api.get('/timetable');
        if (res.data.success) {
          setTimetable(res.data.data);
        }
      } catch (error) {
        console.error('Error fetching timetable', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTimetable();
  }, []);

  if (loading) return <div className="p-8 text-center text-gray-500">Loading schedule...</div>;

  // Group timetable entries by day
  const scheduleByDay = DAYS.reduce((acc, day) => {
    acc[day] = timetable
      .filter(entry => entry.dayOfWeek === day)
      .sort((a, b) => {
        // Sort by start time (simple string comparison works for HH:MM 24h format)
        return a.startTime.localeCompare(b.startTime);
      });
    return acc;
  }, {});

  const isTeacher = user?.role === 'teacher';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Weekly Timetable</h2>
          <p className="text-sm text-gray-500 mt-1">Your comprehensive class schedule for the week.</p>
        </div>
        <div className="p-3 bg-primary/10 text-primary rounded-xl hidden sm:block">
          <Calendar className="w-6 h-6" />
        </div>
      </div>

      <div className="space-y-8">
        {DAYS.map((day) => {
          const entries = scheduleByDay[day];
          if (entries.length === 0) return null; // Don't render empty days

          return (
            <div key={day} className="bg-white dark:bg-card rounded-xl shadow-sm border border-border overflow-hidden">
              <div className="bg-gray-50 dark:bg-accent px-6 py-3 border-b border-border flex items-center justify-between">
                <h3 className="font-bold text-lg text-gray-900 dark:text-white flex items-center">
                  <span className="w-2 h-2 rounded-full bg-primary mr-2"></span>
                  {day}
                </h3>
                <span className="text-xs font-medium text-gray-500 bg-white dark:bg-card px-2 py-1 rounded border border-border">
                  {entries.length} Classes
                </span>
              </div>
              <div className="divide-y divide-border">
                {entries.map((entry) => (
                  <div key={entry._id} className="p-6 flex flex-col md:flex-row md:items-center gap-4 hover:bg-gray-50 dark:hover:bg-accent/50 transition-colors">
                    <div className="md:w-48 shrink-0 flex items-center text-primary font-bold text-lg">
                      <Clock className="w-5 h-5 mr-2 opacity-70" />
                      {entry.startTime} - {entry.endTime}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-1 flex items-center">
                        {entry.subject?.name}
                        <span className="ml-3 text-xs font-medium bg-gray-100 dark:bg-input px-2 py-0.5 rounded text-gray-600 dark:text-gray-400 border border-border">
                          {entry.subject?.code}
                        </span>
                      </h4>
                      <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-600 dark:text-gray-400">
                        {isTeacher ? (
                          <span className="flex items-center">
                            <BookOpen className="w-4 h-4 mr-1.5 opacity-70" />
                            Sem {entry.subject?.semester} • {entry.subject?.department}
                          </span>
                        ) : (
                          <span className="flex items-center">
                            <UserIcon className="w-4 h-4 mr-1.5 opacity-70" />
                            {entry.subject?.teacher?.user?.name || 'Unknown Teacher'}
                          </span>
                        )}
                        <span className="flex items-center">
                          <MapPin className="w-4 h-4 mr-1.5 opacity-70" />
                          Block {Math.floor(Math.random() * 5) + 3} - Room {Math.floor(Math.random() * 100) + 200}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {Object.values(scheduleByDay).every(arr => arr.length === 0) && (
          <div className="py-20 text-center bg-white dark:bg-card rounded-xl border border-dashed border-border flex flex-col items-center">
            <Calendar className="w-16 h-16 text-gray-300 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No Classes Scheduled</h3>
            <p className="text-gray-500">You don't have any classes assigned to your timetable yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TimetableView;
